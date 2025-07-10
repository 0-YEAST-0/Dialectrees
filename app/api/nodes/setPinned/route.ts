import { NextRequest, NextResponse } from 'next/server';
import { setPinned } from '@/db/nodes';
import { getUserRequirePermissions, Permissions } from '@/app/permissions';
import { updateTreeUUID } from '@/db/globals';


export async function POST(request: NextRequest) {
    try {
        const user = await getUserRequirePermissions(Permissions.SET_PINNED);

        // Check if user is admin
        if (!user) {
            return NextResponse.json(
                { error: `Forbidden: Authenticated level access ${Permissions.SET_PINNED} required` },
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
        const { pinned } = body;

        // Validate pinned parameter
        if (typeof pinned !== 'boolean') {
            return NextResponse.json(
                { error: 'Invalid pinned value: must be a boolean' },
                { status: 400 }
            );
        }

        // Update the node's pinned status
        await setPinned(nodeId, pinned);

        await updateTreeUUID();

        return NextResponse.json(
            { 
                success: true, 
                nodeId,
                pinned
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error updating pin status:', error);
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}