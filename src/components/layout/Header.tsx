import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Sun, Moon, X, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { toggleTheme } from '../store/slices/uiSlice';
import { markNotificationRead, markAllRead } from '../store/slices/uiSlice';
import { setFilters } from '../store/slices/taskSlice';
import { formatRelative } from '../utils';
import { cn } from '../utils';
import { Badge } from '../ui';

const notifTypeColors: Record<string, string> = {
  error: 'bg-red-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

export function Header({ title }: { title?: string }) {
  const dispatch = useAppDispatch();
  const { theme, notifications } = useAppSelector((s) => s.ui);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    dispatch(setFilters({ search: e.target.value }));
  };

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--surface-2)]/80 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-20">
      {title && (
        <h1 className="text-xl font-semibold text-[var(--text)] font-display mr-auto">{title}</h1>
      )}

      {/* Search */}
      <div className="relative ml-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <input
          value={searchVal}
          onChange={handleSearch}
          placeholder="Search tasks..."
          className="h-9 pl-9 pr-4 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all w-52"
        />
        {searchVal && (
          <button onClick={() => { setSearchVal(''); dispatch(setFilters({ search: '' })); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => dispatch(toggleTheme())}
        className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--border)] hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--border)] hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <span className="font-semibold text-sm text-[var(--text)]">Notifications</span>
                {unread > 0 && (
                  <button onClick={() => dispatch(markAllRead())} className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1">
                    <CheckCheck className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border)]">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[var(--text-muted)]">No notifications</div>
                ) : notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => dispatch(markNotificationRead(n.id))}
                    className={cn('flex gap-3 p-4 cursor-pointer hover:bg-[var(--surface-3)] transition-colors', !n.read && 'bg-brand-600/5')}
                  >
                    <span className={cn('mt-1 h-2 w-2 rounded-full shrink-0', notifTypeColors[n.type])} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium text-[var(--text)]', !n.read && 'text-brand-400')}>{n.title}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{n.message}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">{formatRelative(n.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
