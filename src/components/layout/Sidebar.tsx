import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart3,
  Users, Settings, LogOut, ChevronLeft, Zap, X,
  ListTodo,
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
  role?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',  to: '/dashboard' },
  { icon: CheckSquare,     label: 'My Tasks',   to: '/tasks' },
  { icon: Calendar,        label: 'Calendar',   to: '/calendar' },
  { icon: BarChart3,       label: 'Analytics',  to: '/analytics', role: ['admin'] },
  { icon: Users,           label: 'Team',       to: '/team',      role: ['admin', 'manager'] },
  { icon: Settings,        label: 'Settings',   to: '/settings' },
];

const SIDEBAR_OPEN_W  = 220;
const SIDEBAR_CLOSE_W = 64;

interface SidebarProps {
  onMobileClose?: () => void;
}

export function Sidebar({ onMobileClose }: SidebarProps) {
  const dispatch        = useAppDispatch();
  const navigate        = useNavigate();
  const { sidebarOpen } = useAppSelector((s) => s.ui);
  const { user }        = useAppSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    onMobileClose?.();
  };

  const handleNavClick = () => {
    onMobileClose?.();
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.role || (user && item.role.includes(user.role))
  );

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? SIDEBAR_OPEN_W : SIDEBAR_CLOSE_W }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="relative h-screen flex flex-col shrink-0 z-30 overflow-hidden border-r border-[var(--border)] bg-[var(--surface-2)]"
      style={{ minWidth: sidebarOpen ? SIDEBAR_OPEN_W : SIDEBAR_CLOSE_W }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center justify-between h-16 px-4 shrink-0 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-brand-600 flex items-center justify-center shrink-0 shadow-[var(--shadow-glow-sm)]">
            <ListTodo className="h-4 w-4 text-white" />
          </div>
          <AnimatePresence initial={false}>
            {sidebarOpen && (
              <motion.span
                key="logo-text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-display font-bold text-base whitespace-nowrap overflow-hidden text-[var(--text)]"
              >
                TaskFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile close button */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="flex items-center justify-center h-7 w-7 rounded-lg hover:bg-[var(--surface-3)] transition-colors text-[var(--text-muted)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Collapse toggle (desktop only) ── */}
      {!onMobileClose && (
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="absolute -right-3 top-[72px] h-6 w-6 rounded-full flex items-center justify-center z-10 border transition-all hover:scale-110 bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] shadow-sm"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }} transition={{ duration: 0.25 }}>
            <ChevronLeft className="h-3 w-3" />
          </motion.div>
        </button>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-xl transition-all duration-150 group relative',
                'h-10 px-3 gap-3',
                isActive
                  ? 'bg-brand-600 text-white shadow-[var(--shadow-glow-sm)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-3)]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'h-[18px] w-[18px] shrink-0',
                    isActive ? 'text-white' : 'text-[var(--text-muted)]'
                  )}
                />

                <AnimatePresence initial={false}>
                  {sidebarOpen && (
                    <motion.span
                      key={item.label}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.18 }}
                      className={cn(
                        'text-sm font-medium whitespace-nowrap overflow-hidden',
                        isActive ? 'text-white' : 'text-[var(--text)]'
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip when collapsed (desktop only) */}
                {!sidebarOpen && !onMobileClose && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border bg-[var(--surface)] text-[var(--text)] border-[var(--border)]">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div className="shrink-0 p-2 border-t border-[var(--border)]">
        <div
          className={cn(
            'flex items-center rounded-xl px-2 py-2 gap-3 transition-colors cursor-default',
            !sidebarOpen && !onMobileClose && 'justify-center'
          )}
        >
          {user && <Avatar name={user.name} src={user.avatar} size="sm" />}

          <AnimatePresence initial={false}>
            {(sidebarOpen || onMobileClose) && user && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-medium truncate text-[var(--text)]">
                  {user.name}
                </p>
                <p className="text-xs capitalize truncate text-[var(--text-muted)]">
                  {user.role}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {(sidebarOpen || onMobileClose) && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg transition-all hover:bg-red-500/10 hover:text-red-500 shrink-0 text-[var(--text-muted)]"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
