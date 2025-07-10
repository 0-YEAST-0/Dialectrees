'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { FlowCanvas } from './flow';
import { DetailsPanel } from './detailsPanel';
import { NodeDataPayload } from '../api/nodes/route';
import { NodeWithChildren } from '@/db/nodes';
import { User } from '@/db/user';

interface MainWrapperProps {
    user: User;
}

const MainWrapper = ({ user }: MainWrapperProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodeData, setNodeData] = useState<NodeWithChildren | {}>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const treeUUIDRef = useRef<string>("none");
  const selectedUUIDRef = useRef<string>("none");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const isPageVisibleRef = useRef<boolean>(true);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = selectedNodeId === "" 
        ? await fetch(`/api/nodes?UUID=${treeUUIDRef.current}`)
        : await fetch(`/api/nodes?UUID=${treeUUIDRef.current}&selectedID=${selectedNodeId}&selectedUUID=${selectedUUIDRef.current}`);
      
      const data: NodeDataPayload = await res.json();

      // Only update if UUID has changed
      if (data.UUID !== treeUUIDRef.current) {
        treeUUIDRef.current = data.UUID;
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      }
      if (data.nodeDataUUID != selectedUUIDRef.current) {
        setNodeData(data.nodeData);
        selectedUUIDRef.current = data.nodeDataUUID;
        console.log("Node data set", data.nodeData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedNodeId]);

  // Check if polling should be active
  const shouldPoll = useCallback(() => {
    const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
    const isWithinTimeLimit = timeSinceLastInteraction < 20000; // 20 seconds
    return isPageVisibleRef.current && isWithinTimeLimit;
  }, []);

  // Start polling interval
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (shouldPoll()) {
        fetchData();
      }
    }, 3000);
  }, [fetchData, shouldPoll]);

  // Stop polling interval
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Update last interaction time
  const updateLastInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    
    // Restart polling if it was stopped due to inactivity
    if (!intervalRef.current) {
      startPolling();
    }
  }, [startPolling]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisibleRef.current = !document.hidden;
      
      if (document.hidden) {
        stopPolling();
      } else {
        updateLastInteraction();
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [stopPolling, updateLastInteraction, startPolling]);

  // Handle user interactions
  useEffect(() => {
    const handleUserInteraction = () => {
      updateLastInteraction();
    };

    // Add event listeners for various user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [updateLastInteraction]);

  // Set up initial polling
  useEffect(() => {
    fetchData();
    startPolling();
    
    return () => {
      stopPolling();
    };
  }, [fetchData, startPolling, stopPolling]);

  // Handle node/edge changes from ReactFlow
  const handleNodesChange = useCallback((changes: any) => {
    applyNodeChanges(changes, nodes);
    updateLastInteraction(); // Track interaction
    console.log('Nodes changed:', changes);
  }, [updateLastInteraction]);

  const handleEdgesChange = useCallback((changes: any) => {
    applyEdgeChanges([], edges);
    updateLastInteraction(); // Track interaction
    console.log('Edges changed:', changes);
  }, [updateLastInteraction]);

  const handleNodeSelect = useCallback((nodeId: string) => {
    console.log("handle selected:", nodeId)
    setSelectedNodeId(nodeId);
    updateLastInteraction(); // Track interaction
  }, [updateLastInteraction]);

  return (
      <div className="flex flex-1 bg-white z-10">
        {/* React Flow area (70%) */}
        <div className="w-[70%] relative">
          <FlowCanvas 
            nodes={nodes}
            edges={edges}
            selected={selectedNodeId}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            handleNodeSelect={handleNodeSelect}
          />
        </div>

        {/* Right-side panel (30%) */}
        <div className="w-[30%] p-4 bg-white shadow-lg overflow-auto z-20" style={{ boxShadow: '-5px 0 10px -1px rgba(0, 0, 0, 0.07)' }}>
          <DetailsPanel nodeData={nodeData} handleNodeSelect={handleNodeSelect} user={user} refreshTree={fetchData}/>
        </div>
      </div>
  );
};

export default MainWrapper;