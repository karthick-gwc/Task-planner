import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppSelector } from '../../hooks/useAppRedux';

export function AppLayout() {
  const { theme } = useAppSelector((s) => s.ui);

  // Keep <html> dark class in sync with Redux theme at all times
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: 'var(--surface)' }}
    >
      <Sidebar />

      {/* Right panel — always fills remaining space */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: 'var(--surface)', padding: '24px' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
