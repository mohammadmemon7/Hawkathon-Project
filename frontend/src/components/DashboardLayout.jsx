import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-[var(--text)]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopHeader onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50/30">
          {children}
        </main>
      </div>
    </div>
  );
}
