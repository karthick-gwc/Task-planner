import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Sun, Moon, X, CheckCheck, Trash2, Loader2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { toggleTheme } from '../store/slices/uiSlice';
import {
  markNotificationRead,
  markAllRead,
  clearNotifications,
  markNotificationReadRemote,
  markAllReadRemote,
  clearNotificationsRemote,
  fetchNotifications,
  createNotification,
} from '../store/slices/uiSlice';
import { setFilters } from '../store/slices/taskSlice';
import { formatRelative, cn } from '../utils';

const TYPE_COLORS: Record<string, string> = {
  error:   'bg-red-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  info:    'bg-blue-500',
};

const TYPE_BG: Record<string, string> = {
  error:   'bg-red-500/15 text-red-400',
  success: 'bg-emerald-500/15 text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-400',
  info:    'bg-blue-500/15 text-blue-400',
};

const TYPE_ICON: Record<string, string> = {
  error: '!', success: '✓', warning: '△', info: 'i',
};

export function Header({ title }: { title?: string }) {
  const dispatch    = useAppDispatch();
  const { theme, notifications } = useAppSelector((s) => s.ui);
  const { tasks }   = useAppSelector((s) => s.tasks);
  const currentUser = useAppSelector((s) => s.auth.user);

  const [notifOpen,  setNotifOpen]  = useState(false);
  const [searchVal,  setSearchVal]  = useState('');
  const [loadingId,  setLoadingId]  = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearing,   setClearing]   = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const unread   = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Fetch when panel opens
  useEffect(() => {
    if (notifOpen && currentUser?.id) dispatch(fetchNotifications(currentUser.id));
  }, [notifOpen, currentUser?.id, dispatch]);

  // Overdue task auto-notifications (once per session per task)
  useEffect(() => {
    if (!currentUser?.id || tasks.length === 0) return;
    const key  = `notified_overdue_${currentUser.id}`;
    const seen: string[] = JSON.parse(sessionStorage.getItem(key) ?? '[]');
    let changed = false;
    tasks.forEach((task) => {
      const overdue = task.due_date && new Date(task.due_date) < new Date();
      const active  = task.status !== 'completed';
      if (overdue && active && !seen.includes(task.id)) {
        seen.push(task.id);
        changed = true;
        dispatch(createNotification({
          notification: {
            title: 'Task Overdue',
            message: `"${task.title}" is past its due date.`,
            type: 'error',
            read: false,
            createdAt: new Date().toISOString(),
          },
          userId: currentUser.id,
          taskId: task.id,
        }));
      }
    });
    if (changed) sessionStorage.setItem(key, JSON.stringify(seen));
  }, [tasks, currentUser?.id, dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    dispatch(setFilters({ search: e.target.value }));
  };

  const clearSearch = () => {
    setSearchVal('');
    dispatch(setFilters({ search: '' }));
  };

  const handleMarkRead = async (id: string, alreadyRead: boolean) => {
    if (alreadyRead) return;
    dispatch(markNotificationRead(id));
    setLoadingId(id);
    try { await dispatch(markNotificationReadRemote(id)); } finally { setLoadingId(null); }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser?.id || markingAll) return;
    dispatch(markAllRead());
    setMarkingAll(true);
    try { await dispatch(markAllReadRemote(currentUser.id)); } finally { setMarkingAll(false); }
  };

  const handleClearAll = async () => {
    if (!currentUser?.id || clearing) return;
    dispatch(clearNotifications());
    setClearing(true);
    try { await dispatch(clearNotificationsRemote(currentUser.id)); }
    finally { setClearing(false); setNotifOpen(false); }
  };

  return (
    <header
      className="h-16 flex items-center px-5 gap-3 shrink-0 sticky top-0 z-20"
      style={{
        borderBottom: '1px solid var(--border)',
        background:   'var(--surface-2)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Page title */}
      {title && (
        <h1
          className="text-lg font-semibold font-display mr-auto truncate"
          style={{ color: 'var(--text)' }}
        >
          {title}
        </h1>
      )}

      {/* Spacer when no title */}
      {!title && <div className="flex-1" />}

      {/* ── Search ── */}
      <div className="relative">
  {/* Search Icon */}
  {/* <Search
    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
    style={{ color: 'var(--text-muted)' }}
  /> */}

  {/* Input */}
  <input
    value={searchVal}
    onChange={handleSearch}
    placeholder="Search tasks..."
    className="
      h-9 
      pl-11   /* ✅ increased padding */
      pr-8 
      rounded-xl 
      border 
      text-sm 
      outline-none 
      transition-all 
      w-44 sm:w-52 focus:w-60
    "
    style={{
      borderColor: 'var(--border)',
      background: 'var(--surface-3)',
      color: 'var(--text)',
    }}
  />

  {/* Clear Button */}
  {searchVal && (
    <button
      onClick={clearSearch}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
      style={{ color: 'var(--text-muted)' }}
    >
      <X className="h-3.5 w-3.5" />
    </button>
  )}
</div>
      {/* ── Theme toggle ── */}
      <button
        onClick={() => dispatch(toggleTheme())}
        className="h-9 w-9 flex items-center justify-center rounded-xl border transition-all hover:scale-105 shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-3)' }}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark'
          ? <Sun  className="h-4 w-4 text-amber-400" />
          : <Moon className="h-4 w-4 text-brand-500" />
        }
      </button>

      {/* ── Notifications ── */}
      <div ref={notifRef} className="relative shrink-0">
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative h-9 w-9 flex items-center justify-center rounded-xl border transition-all shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-3)', color: 'var(--text-muted)' }}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.14 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-[340px] rounded-2xl border shadow-2xl overflow-hidden z-50"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                    Notifications
                  </span>
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold">
                      {unread} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      disabled={markingAll}
                      className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1 disabled:opacity-50"
                    >
                      {markingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3 w-3" />}
                      All read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      disabled={clearing}
                      className="flex items-center gap-1 disabled:opacity-50 transition-colors hover:text-red-400"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {clearing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div
                className="max-h-[360px] overflow-y-auto"
                style={{ borderColor: 'var(--border)' }}
              >
                {notifications.length === 0 ? (
                  <div className="py-10 flex flex-col items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Bell className="h-8 w-8 opacity-20" />
                    <p className="text-sm">All caught up!</p>
                  </div>
                ) : (
                  notifications.map((n, idx) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id, n.read)}
                      className={cn('flex gap-3 px-4 py-3 cursor-pointer transition-colors')}
                      style={{
                        background:   !n.read ? 'rgba(99,112,245,0.05)' : 'transparent',
                        borderBottom: idx < notifications.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <div className={cn(
                        'mt-0.5 h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold',
                        TYPE_BG[n.type] ?? TYPE_BG.info
                      )}>
                        {TYPE_ICON[n.type] ?? 'i'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium leading-snug"
                          style={{ color: !n.read ? 'var(--color-brand-400)' : 'var(--text)' }}
                        >
                          {n.title}
                        </p>
                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                          {n.message}
                        </p>
                        <p className="text-[10px] mt-1 flex items-center gap-1 opacity-60" style={{ color: 'var(--text-muted)' }}>
                          <Clock className="h-2.5 w-2.5" />
                          {formatRelative(n.createdAt)}
                        </p>
                      </div>
                      <div className="pt-1 shrink-0">
                        {loadingId === n.id
                          ? <Loader2 className="h-3 w-3 animate-spin text-brand-500" />
                          : !n.read
                            ? <span className={cn('h-2 w-2 rounded-full block', TYPE_COLORS[n.type])} />
                            : null
                        }
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div
                  className="px-4 py-2 text-center"
                  style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}
                >
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                    {unread > 0 ? ` · ${unread} unread` : ' · all read'}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
