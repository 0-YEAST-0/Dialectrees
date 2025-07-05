'use server'
import SignOut from '@/components/SignOut';
import auth0 from '../auth0';
import { redirect } from "next/navigation";
import { getUser } from '@/db/user';
import Dagre  from "@dagrejs/dagre"
import React from 'react';
import { Background, BackgroundVariant, Edge, Node, ReactFlow } from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
import { getNodes } from '@/db/nodes';
import FlowCanvas from './flow';

export default async function Main() {
  const user = (await auth0.getSession())?.user; 
  if(!user) return (<div>expected user</div>)
  
  const dbUser = await getUser(user!.sub);
  console.log(dbUser);
  if (!dbUser) {
    redirect("/app/user-setup");
  }

  const dbNodes = await getNodes();
  const flowEdges: Edge[] = [];
  const flowNodes: Node[] = dbNodes.map((node, i) => { 
    if (node.parent){
      flowEdges.push({
        id: `e_${node.parent}-${node.id}`,
        source: `${node.parent}`,
        target: `${node.id}`
      });
    }
    return {
      id: `${node.id}`,
      position: {x: 100*i, y: 100},
      data: {
        label: node.title,
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-tl from-red-100 to-white flex flex-col">
      {/* Navigation */}
      <nav className="px-6 py-4 shadow-md z-30">
        <div className="w-full mx-auto flex justify-between items-center">
          <a className="text-2xl font-bold" href="/">
            <span className="text-black">Dialec</span>
            <span className="text-red-600">trees</span>
          </a>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              {dbUser.username}
            </span>
            <SignOut />
          </div>
        </div>
      </nav>
      {/* Main content area */}
      <div className="flex flex-1 bg-white z-10">
        {/* React Flow area (70%) */}
        <div className="w-[70%] relative">
          <FlowCanvas />
        </div>

        {/* Right-side panel (30%) */}
        <div className="w-[30%] p-4 bg-white shadow-lg overflow-auto z-20" style={{ boxShadow: '-5px 0 10px -1px rgba(0, 0, 0, 0.07)' }}>
          {/* Panel content goes here */}
          <h2 className="text-xl font-semibold mb-4">Details Panel</h2>
          <p>Some content here...</p>
        </div>
      </div>
    </div>
  );
}


