import { NextResponse } from 'next/server';
import { getNodeWithChildren, getPinnedNodes, NodeWithChildren } from '@/db/nodes';
import { getTreeUUID } from '@/db/globals';
import { Edge, Node, Position } from '@xyflow/react';
import { Node as NodeDB } from "@/db/nodes"

export type NodeDataPayload = {
  UUID: string;
  nodes: Node[];
  edges: Edge[];
  nodeDataUUID: string;
  nodeData: NodeWithChildren | {};
};


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientUUID = searchParams.get('UUID');
  const clientSelectedUUID = searchParams.get('selectedUUID');
  const selectedID = searchParams.get('selectedID');

  if (!clientUUID) {
    return NextResponse.json({ error: 'Missing UUID' }, { status: 400 });
  }

  let nodes: Node[] = [];
  let edges: Edge[] = [];

  const serverUUID = await getTreeUUID();

  if (clientUUID !== serverUUID) {
    const dbNodes = await getPinnedNodes();
    
    // Create a Set of all pinned node IDs for quick lookup
    const pinnedNodeIds = new Set(dbNodes.map(node => node.id));
    
    // Function to check if a node is attached (all ancestors are pinned)
    const isNodeAttached = (node: NodeDB, visited = new Set()): boolean => {
        // Prevent infinite loops in case of circular references
        if (visited.has(node.id)) return false;
        visited.add(node.id);
        
        // If node has no parent, it's a root node and is attached
        if (!node.parent) return true;
        
        // If parent is not pinned, this node is detached
        if (!pinnedNodeIds.has(node.parent)) return false;
        
        // Recursively check if parent is attached
        const parentNode = dbNodes.find(n => n.id === node.parent);
        return parentNode ? isNodeAttached(parentNode, visited) : false;
    };
    
    // Filter nodes to only include attached ones
    const attachedNodes = dbNodes.filter(node => isNodeAttached(node));

    nodes = attachedNodes.map((node) => {
        if (node.parent) {
            edges.push({
                id: `e_${node.parent}-${node.id}`,
                source: `${node.parent}`,
                target: `${node.id}`,
            });
        }
        return {
            id: `${node.id}`,
            position: { x: 0, y: 0 },
            data: { label: node.title, uuid: node.editUUID },
            sourcePosition: "right" as Position.Right,
            targetPosition: "left" as Position.Left,
            style: { backgroundColor: '#706666', color: 'white', borderColor: "black" }
        };
    });
}
  let nodeData: NodeWithChildren | {} = {}
  let nodeDataUUID: string = "";
  if (selectedID && clientSelectedUUID !== null){
    const res = await getNodeWithChildren(parseInt(selectedID), clientSelectedUUID);
    nodeData = res ?? {};
    nodeDataUUID = res ? (nodeData as NodeWithChildren).editUUID : clientSelectedUUID; 
  }

  return NextResponse.json({ UUID: serverUUID, nodes, edges, nodeDataUUID, nodeData } as NodeDataPayload);
}

