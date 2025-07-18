import { getUserRequirePermissions } from "@/app/permissions";
import { updateTreeUUID } from "@/db/globals";
import { CreatedNode, createNode, isValidNodeStance, isValidNodeType, Node } from "@/db/nodes";
import { NodeStance, NodeType } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { Permissions } from "@/app/client-permissions";
import { initVoteCache, insertVote, updateVoteCache } from "@/db/votes";
import { db } from "@/db/db";
import DialectreesConfig from "@/app/config";

export async function POST(request: NextRequest) {
    try {
        const user = await getUserRequirePermissions(Permissions.RESPOND); // Adjust permission as needed

        // Check if user has permission to create nodes
        if (!user) {
            return NextResponse.json(
                { error: `Forbidden: Authenticated level access ${Permissions.RESPOND} required` },
                { status: 403 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { title, type, parent, content, stance } = body;

        // Validate required fields
        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return NextResponse.json(
                { error: 'Title is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        if (!type || typeof type !== 'string' || !isValidNodeType(type)) {
            return NextResponse.json(
                { error: 'Type is required and must be a valid string' },
                { status: 400 }
            );
        }

        if (!stance || typeof stance !== 'string' || !isValidNodeStance(stance)) {
            return NextResponse.json(
                { error: 'Stance is required and must be a valid string' },
                { status: 400 }
            );
        }

        if (!parent || typeof parent !== 'number' || isNaN(parent) || parent < 0) {
            return NextResponse.json(
                { error: 'Parent must be a valid number' },
                { status: 400 }
            );
        }

        // Validate optional fields
        if (content !== undefined && typeof content !== 'string') {
            return NextResponse.json(
                { error: 'Content must be a string if provided' },
                { status: 400 }
            );
        }

        if (!content && type == "post") {
            return NextResponse.json(
                { error: 'Posts require content' },
                { status: 400 }
            );
        }

        // Validate title length (based on your schema constraint)
        if (title.length > 128) {
            return NextResponse.json(
                { error: 'Title must be 128 characters or less' },
                { status: 400 }
            );
        }

        const newNode = await createNode(user.id, title.trim(), type as NodeType, parent, content);

        await db.transaction(async (tx) => {
            // Create the node
            if (stance != "neutral"){
                await insertVote(user.id, newNode.id, true, stance == "community", tx);
                await initVoteCache(newNode.id, tx)
                await updateVoteCache(newNode.id, true, 0, stance == "community" ? 1 : -1, DialectreesConfig.authorStanceMultiplier, tx);
            }
            
            // Update tree UUID to reflect changes
            await updateTreeUUID();

        });

        return NextResponse.json(
            { 
                success: true,
                nodeId: `${newNode.id}`
            },
            { status: 201 }
        );
        

    } catch (error) {
        console.error('Error creating node:', error);
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}