import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useWebSocketSync } from '@/hooks/useWebSocketSync';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useWebSocketSync();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-[228px] min-h-screen flex flex-col">
        <Header toggleSidebar={() => setSidebarOpen(true)} />
        
        <main id="main-content" className="flex-1 px-4 py-5 md:px-6 md:py-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
