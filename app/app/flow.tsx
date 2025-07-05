'use client';
import Dagre from '@dagrejs/dagre';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Node,
  Edge,
  Background,
  BackgroundVariant,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

const NODE_SIZE = {w: 200, h: 70}
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: string) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: NODE_SIZE.w,
      height: NODE_SIZE.h
    }),
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      const x = position.x - NODE_SIZE.w/2;
      const y = position.y - NODE_SIZE.h/2;
      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

const LayoutFlow = () => {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const treeUUIDRef = useRef<string | null>("none");

  const layoutAndSet = useCallback((nodes: Node[], edges: Edge[]) => {
    const layouted = getLayoutedElements(nodes, edges, 'LR');
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [setNodes, setEdges, fitView]);

  const fetchAndLayout = useCallback(async () => {
    const res = await fetch(`/api/nodes?uuid=${treeUUIDRef.current ?? ''}`);
    const data = await res.json();

    if (data.UUID !== treeUUIDRef.current) {
      treeUUIDRef.current = data.UUID;
      layoutAndSet(data.nodes, data.edges);
    }
  }, [layoutAndSet]);

  useEffect(() => {
    fetchAndLayout();
    const interval = setInterval(fetchAndLayout, 3000);
    return () => clearInterval(interval);
  }, [fetchAndLayout]);

  return (
    <ReactFlow
      style={{ background: 'white' }}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      className="w-full h-full"
      fitView
    >
      <Background color="#aaa" size={1.5} variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
};

export const FlowCanvas = () => {
  return (
    <ReactFlowProvider>
      <LayoutFlow />
    </ReactFlowProvider>
  );
};

export default FlowCanvas;