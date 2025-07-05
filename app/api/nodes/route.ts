import { NextResponse } from 'next/server';
import { getNodes } from '@/db/nodes';
import { getTreeUUID } from '@/db/globals';
import { Edge, Node } from '@xyflow/react';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientUUID = searchParams.get('uuid');

  if (!clientUUID) {
    return NextResponse.json({ error: 'Missing UUID' }, { status: 400 });
  }

  const serverUUID = await getTreeUUID();

  if (clientUUID === serverUUID) {
    return NextResponse.json({ UUID: serverUUID, nodes: [], edges: [] });
  }

  const dbNodes = await getNodes();
  const flowEdges: Edge[] = [];
  const flowNodes: Node[] = dbNodes.map((node) => {
    if (node.parent) {
      flowEdges.push({
        id: `e_${node.parent}-${node.id}`,
        source: `${node.parent}`,
        target: `${node.id}`,
      });
    }
    return {
      id: `${node.id}`,
      position: { x: 0, y: 0 },
      data: { label: node.title },
    };
  });

  return NextResponse.json({ UUID: serverUUID, nodes: flowNodes, edges: flowEdges });
}