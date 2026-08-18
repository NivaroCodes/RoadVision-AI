import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useWebSocketSync } from '@/hooks/useWebSocketSync';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useWebSocketSync();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-[228px]">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        
        <main id="main-content" className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-muted/20 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
