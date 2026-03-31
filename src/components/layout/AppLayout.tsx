import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppSelector } from '../../hooks/useAppRedux';

export function AppLayout() {
  const { theme, density, surfaceStyle } = useAppSelector((s) => s.ui);

  // Keep <html> dark class in sync with Redux theme at all times
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.setAttribute('data-density', density);
    document.documentElement.setAttribute('data-surface-style', surfaceStyle);
  }, [theme, density, surfaceStyle]);

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
          className="flex-1 overflow-y-auto transition-[padding,background] duration-200"
          style={{
            background: 'var(--app-canvas)',
            padding: density === 'compact' ? '18px' : '24px',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
