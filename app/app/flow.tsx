'use client';
import Dagre from '@dagrejs/dagre';
import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Node,
  Edge,
  Background,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
  NodeSelectionChange,
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

interface LayoutFlowProps {
  nodes: Node[];
  edges: Edge[];
  selected: string;
  onNodesChange: (changes: NodeChange<Node>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  handleNodeSelect: (selected: string) => void;
}

const LayoutFlow = ({ nodes, edges, selected, onNodesChange, onEdgesChange, handleNodeSelect }: LayoutFlowProps) => {
  const { fitView } = useReactFlow();
  const [layoutedNodes, setLayoutedNodes, onLayoutedNodesChange] = useNodesState(nodes);
  const [layoutedEdges, setLayoutedEdges, onLayoutedEdgesChange] = useEdgesState(edges);

  // Layout nodes whenever props change
  useEffect(() => {
    const layouted = getLayoutedElements(nodes, edges, 'LR');
    setLayoutedNodes(layouted.nodes);
    setLayoutedEdges(layouted.edges);
  }, [nodes, edges, setLayoutedNodes, setLayoutedEdges]);

  // Forward changes to parent
  const handleNodesChange = useCallback((changes: NodeChange<Node>[]) => {
    
    let newSelected = "";
    let ignore = false;
    changes.forEach((change) => {
        switch (change.type) {
            case "select": 
                console.log("selection event");
                const selectChange = change as NodeSelectionChange;
                if (selectChange.selected){
                    newSelected = selectChange.id;
                }
                break;
            default:
                ignore = true;
        }
    });
    if (!ignore) {
        if (newSelected != selected)
            handleNodeSelect(newSelected);
        onLayoutedNodesChange(changes);
    }
    //onLayoutedNodesChange(changes);
    //if (!ignore) onNodesChange(changes);
  }, [selected, handleNodeSelect, onLayoutedNodesChange, onNodesChange]);

  const handleEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    changes = [];
    onLayoutedEdgesChange(changes);
    onEdgesChange(changes);
  }, [onLayoutedEdgesChange, onEdgesChange]);

  return (
    <ReactFlow
      style={{ background: 'white' }}
      nodes={layoutedNodes}
      edges={layoutedEdges}
      onNodesChange={handleNodesChange}
      onEdgesChange={handleEdgesChange}
      selectionKeyCode={null}
      multiSelectionKeyCode={null}
      className="w-full h-full"
      fitView
    >
      <Background color="#aaa" size={1.5} variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
};

interface FlowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  selected: string;
  onNodesChange: (changes: NodeChange<Node>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  handleNodeSelect: (selected: string) => void;
}

export const FlowCanvas = ({ nodes, edges, selected, onNodesChange, onEdgesChange, handleNodeSelect }: FlowCanvasProps) => {
  return (
    <ReactFlowProvider>
      <LayoutFlow 
        nodes={nodes} 
        edges={edges}
        selected={selected}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        handleNodeSelect={handleNodeSelect}
      />
    </ReactFlowProvider>
  );
};