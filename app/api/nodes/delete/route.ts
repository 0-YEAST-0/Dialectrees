import { getUserRequirePermissions } from "@/app/permissions";
import { updateTreeUUID } from "@/db/globals";
import { deleteNode, getNodeWithChildren } from "@/db/nodes";
import { NextRequest, NextResponse } from "next/server";
import { Permissions } from "@/app/client-permissions";
export async function POST(request: NextRequest) {
    try {
        const user = await getUserRequirePermissions(Permissions.DELETE_RESPONSE);

        // Check if user has permission to create nodes
        if (!user) {
            return NextResponse.json(
                { error: `Forbidden: Authenticated level access ${Permissions.DELETE_RESPONSE} required` },
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
        const nodeId = parseInt(nodeIdParam);
        if (isNaN(nodeId) || nodeId < 0) {
            return NextResponse.json(
                { error: 'Invalid ID parameter' },
                { status: 400 }
            );
        }
        const node = await getNodeWithChildren(nodeId, "_", user);
        if (node.parent == null) {
            return NextResponse.json(
                { 
                    success: false,
                },
                { status: 201 }
            );
        }
        else{
            await deleteNode(nodeId);

            // Update tree UUID to reflect changes
            await updateTreeUUID();
            
            return NextResponse.json(
                { 
                    success: true,
                },
                { status: 201 }
            );
        }

        

    } catch (error) {
        console.error('Error creating node:', error);
        
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}