
import { NextRequest, NextResponse } from 'next/server';
import { getUserRequirePermissions } from '@/app/permissions';
import { db } from '@/db/db'; // Adjust import path as needed
import { Permissions } from '@/app/client-permissions'; // Adjust import path as needed
import { deleteVote, getVote, initVoteCache, insertVote, updateVote, updateVoteCache } from '@/db/votes';
import { getNode, updateNodeUUID } from '@/db/nodes';
import DialectreesConfig from '@/app/config';
import { updateTreeUUID } from '@/db/globals';

export async function POST(request: NextRequest) {
    try {
        // Check if user is authenticated
        const user = await getUserRequirePermissions(Permissions.VOTE); // Adjust permission as needed
        
        if (!user) {
            return NextResponse.json(
                { error: `Forbidden: Authenticated level ${Permissions.VOTE} access required` },
                { status: 403 }
            );
        }

        // Get the node ID from query parameters
        const { searchParams } = new URL(request.url);
        const nodeIdParam = searchParams.get('id');

        if (!nodeIdParam) {
            return NextResponse.json(
                { error: 'Missing node ID parameter' },
                { status: 400 }
            );
        }

        // Parse and validate node ID
        const nodeId = parseInt(nodeIdParam, 10);
        if (isNaN(nodeId)) {
            return NextResponse.json(
                { error: 'Invalid node ID: must be a number' },
                { status: 400 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { isStance, value } = body;

        console.log(body);

        // Validate parameters
        if (typeof isStance !== 'boolean') {
            return NextResponse.json(
                { error: 'Invalid isStance value: must be a boolean' },
                { status: 400 }
            );
        }

        if (typeof value !== 'number' || ![-1, 0, 1].includes(value)) {
            return NextResponse.json(
                { error: 'Invalid value: must be -1 (negative), 0 (remove), or 1 (positive)' },
                { status: 400 }
            );
        }

        // Verify node exists
        const node = await getNode(nodeId);

        if (node === null) {
            return NextResponse.json(
                { error: 'Node not found' },
                { status: 404 }
            );
        }

        // Use a transaction to ensure consistency
        await db.transaction(async (tx) => {
            console.log(" vote: ", user.id, nodeId, isStance);
            // Check if user has already voted on this node for this type
            const existingVote = await getVote(user.id, nodeId, isStance, tx);

            let oldVoteValue = 0;
            if (existingVote.length > 0) {
                console.log("already exists");
                oldVoteValue = existingVote[0].isPositive ? 1 : -1;
            }
            else console.log("doesn't exist");

            // Calculate the cache change
            const cacheChange = value - oldVoteValue;

            console.log("cache change ", cacheChange);

            // Update or insert/delete the vote record
            if (value === 0) {
                // Remove the vote
                if (existingVote.length > 0) {
                    console.log("delete vote ");
                    await deleteVote(user.id, nodeId, isStance, tx)
                }
            } else {
                if (existingVote.length > 0) {
                    console.log("update vote ");
                    await updateVote(user.id, nodeId, isStance, value > 0, tx);
                } else {
                    console.log("insert vote ");
                    await insertVote(user.id, nodeId, isStance, value > 0, tx)
                }
            }

            // Update the vote cache if there's a change
            if (cacheChange !== 0) {
                // Ensure vote cache record exists
                initVoteCache(nodeId, tx);

                let change = 1;
                if (node.author == user.id && isStance)
                    change = DialectreesConfig.authorStanceMultiplier

                updateVoteCache(nodeId, isStance, oldVoteValue, value, change, tx);
            }
            updateNodeUUID(nodeId, tx);
            updateTreeUUID(tx);
        });

        return NextResponse.json(
            { 
                success: true, 
                nodeId,
                isStance,
                value,
                message: value === 0 ? 'Vote removed' : 'Vote recorded'
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating vote:', error);
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
