import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CheckSquare, Kanban, Calendar, BarChart3,
  Users, Settings, LogOut, ChevronLeft, Zap,
} from 'lucide-react';
import { cn } from '../utils';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { toggleSidebar } from '../store/slices/uiSlice';
import { logout } from '../store/slices/authSlice';
import { Avatar } from '../ui';

interface NavItem {
  icon: React.ElementType;
  label: string;
  to: string;
  badge?: number;
  role?: string[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: CheckSquare, label: 'My Tasks', to: '/tasks' },
  { icon: Kanban, label: 'Kanban Board', to: '/kanban' },
  { icon: Calendar, label: 'Calendar', to: '/calendar' },
  { icon: BarChart3, label: 'Analytics', to: '/analytics' },
  { icon: Users, label: 'Team', to: '/team', role: ['admin', 'manager'] },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

export function Sidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { sidebarOpen } = useAppSelector((s) => s.ui);
  const { user } = useAppSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const visibleItems = navItems.filter(
    (item) => !item.role || (user && item.role.includes(user.role))
  );

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 68 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="relative h-screen flex flex-col border-r border-[var(--border)] bg-[var(--surface-2)] shrink-0 z-30"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--border)]">
        <div className="h-8 w-8 rounded-xl bg-brand-600 flex items-center justify-center shrink-0 shadow-glow-sm">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="font-display font-bold text-[var(--text)] whitespace-nowrap"
            >
              TaskFlow
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center shadow-sm hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all z-10"
      >
        <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }}>
          <ChevronLeft className="h-3 w-3 text-[var(--text-muted)]" />
        </motion.div>
      </button>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 group relative',
                isActive
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text)]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-white' : '')} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Tooltip when collapsed */}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-[var(--border)]">
        <div className={cn('flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--surface-3)] cursor-pointer transition-colors', !sidebarOpen && 'justify-center')}>
          {user && <Avatar name={user.name} size="sm" />}
          <AnimatePresence>
            {sidebarOpen && user && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)] truncate">{user.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate capitalize">{user.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {sidebarOpen && (
            <button onClick={handleLogout} className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
