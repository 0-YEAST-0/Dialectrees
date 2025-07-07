import { NextResponse } from 'next/server';
import { getNodeWithChildren, getPinnedNodes, NodeWithChildren } from '@/db/nodes';
import { getTreeUUID } from '@/db/globals';
import { Edge, Node, Position } from '@xyflow/react';

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

    nodes = dbNodes.map((node) => {
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
            targetPosition: "left" as Position.Left
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

