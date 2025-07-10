'use server'
import SignOut from '@/components/SignOut';
import { redirect } from "next/navigation";
import React from 'react';
 
import '@xyflow/react/dist/style.css';
import MainWrapper from './mainWrapper';
import { getAuthenticatedUser } from '../permissions';

export default async function Main() {
  const user = (await getAuthenticatedUser())!;
  
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
              {user.username}
            </span>
            <SignOut />
          </div>
        </div>
      </nav>
      <MainWrapper user={user}/>
    </div>
  );
}


