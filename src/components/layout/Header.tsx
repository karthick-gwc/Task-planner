// import React, { useState, useRef, useEffect } from 'react';
// import { Bell, Search, Sun, Moon, X, CheckCheck } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
// import { toggleTheme } from '../store/slices/uiSlice';
// import { markNotificationRead, markAllRead } from '../store/slices/uiSlice';
// import { setFilters } from '../store/slices/taskSlice';
// import { formatRelative } from '../utils';
// import { cn } from '../utils';
// import { Badge } from '../ui';

// const notifTypeColors: Record<string, string> = {
//   error: 'bg-red-500',
//   success: 'bg-emerald-500',
//   warning: 'bg-amber-500',
//   info: 'bg-blue-500',
// };

// export function Header({ title }: { title?: string }) {
//   const dispatch = useAppDispatch();
//   const { theme, notifications } = useAppSelector((s) => s.ui);
//   const [notifOpen, setNotifOpen] = useState(false);
//   const [searchVal, setSearchVal] = useState('');
//   const notifRef = useRef<HTMLDivElement>(null);
//   const unread = notifications.filter((n) => !n.read).length;

//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
//         setNotifOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchVal(e.target.value);
//     dispatch(setFilters({ search: e.target.value }));
//   };

//   return (
//     <header className="h-16 border-b border-[var(--border)] bg-[var(--surface-2)]/80 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-20">
//       {title && (
//         <h1 className="text-xl font-semibold text-[var(--text)] font-display mr-auto">{title}</h1>
//       )}

//       {/* Search */}
//       <div className="relative ml-auto">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
//         <input
//           value={searchVal}
//           onChange={handleSearch}
//           placeholder="Search tasks..."
//           className="h-9 pl-9 pr-4 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all w-52"
//         />
//         {searchVal && (
//           <button onClick={() => { setSearchVal(''); dispatch(setFilters({ search: '' })); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]">
//             <X className="h-3.5 w-3.5" />
//           </button>
//         )}
//       </div>

//       {/* Theme toggle */}
//       <button
//         onClick={() => dispatch(toggleTheme())}
//         className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--border)] hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
//       >
//         {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//       </button>

//       {/* Notifications */}
//       <div ref={notifRef} className="relative">
//         <button
//           onClick={() => setNotifOpen((o) => !o)}
//           className="relative h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--border)] hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
//         >
//           <Bell className="h-4 w-4" />
//           {unread > 0 && (
//             <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
//               {unread}
//             </span>
//           )}
//         </button>

//         <AnimatePresence>
//           {notifOpen && (
//             <motion.div
//               initial={{ opacity: 0, y: 8, scale: 0.95 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: 8, scale: 0.95 }}
//               transition={{ duration: 0.15 }}
//               className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden"
//             >
//               <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
//                 <span className="font-semibold text-sm text-[var(--text)]">Notifications</span>
//                 {unread > 0 && (
//                   <button onClick={() => dispatch(markAllRead())} className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1">
//                     <CheckCheck className="h-3 w-3" /> Mark all read
//                   </button>
//                 )}
//               </div>
//               <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border)]">
//                 {notifications.length === 0 ? (
//                   <div className="py-8 text-center text-sm text-[var(--text-muted)]">No notifications</div>
//                 ) : notifications.map((n) => (
//                   <div
//                     key={n.id}
//                     onClick={() => dispatch(markNotificationRead(n.id))}
//                     className={cn('flex gap-3 p-4 cursor-pointer hover:bg-[var(--surface-3)] transition-colors', !n.read && 'bg-brand-600/5')}
//                   >
//                     <span className={cn('mt-1 h-2 w-2 rounded-full shrink-0', notifTypeColors[n.type])} />
//                     <div className="flex-1 min-w-0">
//                       <p className={cn('text-sm font-medium text-[var(--text)]', !n.read && 'text-brand-400')}>{n.title}</p>
//                       <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{n.message}</p>
//                       <p className="text-[10px] text-[var(--text-muted)] mt-1">{formatRelative(n.createdAt)}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </header>
//   );
// }




import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Sun, Moon, X, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { toggleTheme } from '../store/slices/uiSlice';
import {
  // Local optimistic actions
  markNotificationRead,
  markAllRead,
  clearNotifications,
  // Domo-persisted thunks
  markNotificationReadRemote,
  markAllReadRemote,
  clearNotificationsRemote,
  fetchNotifications,
} from '../store/slices/uiSlice';
import { setFilters } from '../store/slices/taskSlice';
import { formatRelative, cn } from '../utils';

// ─── Notification dot colours ─────────────────────────────────────────────────
const notifTypeColors: Record<string, string> = {
  error:   'bg-red-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  info:    'bg-blue-500',
};

// ─── Notification type icons (text labels for accessibility) ──────────────────
const notifTypeBg: Record<string, string> = {
  error:   'bg-red-500/10 text-red-400',
  success: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400',
  info:    'bg-blue-500/10 text-blue-400',
};

export function Header({ title }: { title?: string }) {
  const dispatch    = useAppDispatch();
  const { theme, notifications } = useAppSelector((s) => s.ui);
  const currentUser = useAppSelector((s) => s.auth.user);

  const [notifOpen,    setNotifOpen]    = useState(false);
  const [searchVal,    setSearchVal]    = useState('');
  const [loadingId,    setLoadingId]    = useState<string | null>(null);
  const [markingAll,   setMarkingAll]   = useState(false);
  const [clearing,     setClearing]     = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const unread   = notifications.filter((n) => !n.read).length;

  // ── Close dropdown on outside click ────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Load notifications when dropdown opens ──────────────────────────────────
  useEffect(() => {
    if (notifOpen && currentUser?.id) {
      dispatch(fetchNotifications(currentUser.id));
    }
  }, [notifOpen, currentUser?.id, dispatch]);

  // ── Search ──────────────────────────────────────────────────────────────────
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    dispatch(setFilters({ search: e.target.value }));
  };

  const clearSearch = () => {
    setSearchVal('');
    dispatch(setFilters({ search: '' }));
  };

  // ── Mark single notification as read ───────────────────────────────────────
  const handleMarkRead = async (id: string, alreadyRead: boolean) => {
    if (alreadyRead) return;
    // Optimistic local update first
    dispatch(markNotificationRead(id));
    // Persist to Domo in background
    setLoadingId(id);
    try {
      await dispatch(markNotificationReadRemote(id));
    } finally {
      setLoadingId(null);
    }
  };

  // ── Mark all as read ────────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    if (!currentUser?.id || markingAll) return;
    dispatch(markAllRead());               // optimistic
    setMarkingAll(true);
    try {
      await dispatch(markAllReadRemote(currentUser.id));
    } finally {
      setMarkingAll(false);
    }
  };

  // ── Clear all notifications ─────────────────────────────────────────────────
  const handleClearAll = async () => {
    if (!currentUser?.id || clearing) return;
    dispatch(clearNotifications());        // optimistic
    setClearing(true);
    try {
      await dispatch(clearNotificationsRemote(currentUser.id));
    } finally {
      setClearing(false);
      setNotifOpen(false);
    }
  };

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--surface-2)]/80 backdrop-blur-sm flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-20">

      {/* Page title */}
      {title && (
        <h1 className="text-lg sm:text-xl font-semibold text-[var(--text)] font-display mr-auto truncate">
          {title}
        </h1>
      )}

      {/* ── Search ── */}
      <div className="relative ml-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
        <input
          value={searchVal}
          onChange={handleSearch}
          placeholder="Search tasks..."
          className="h-9 pl-9 pr-8 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all w-40 sm:w-52"
        />
        {searchVal && (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Theme toggle ── */}
      <button
        onClick={() => dispatch(toggleTheme())}
        className="h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--border)] hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all shrink-0"
        aria-label="Toggle theme"
      >
        {theme === 'dark'
          ? <Sun  className="h-4 w-4" />
          : <Moon className="h-4 w-4" />
        }
      </button>

      {/* ── Notifications ── */}
      <div ref={notifRef} className="relative shrink-0">

        {/* Bell button */}
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative h-9 w-9 flex items-center justify-center rounded-xl border border-[var(--border)] hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
          aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Dropdown panel */}
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden z-50"
            >
              {/* Header row */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[var(--text)]">Notifications</span>
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold">
                      {unread} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Mark all read */}
                  {unread > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      disabled={markingAll}
                      className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1 disabled:opacity-50 transition-opacity"
                    >
                      {markingAll
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <CheckCheck className="h-3 w-3" />
                      }
                      Mark all read
                    </button>
                  )}

                  {/* Clear all */}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      disabled={clearing}
                      className="text-xs text-[var(--text-muted)] hover:text-red-400 flex items-center gap-1 disabled:opacity-50 transition-colors"
                      aria-label="Clear all notifications"
                    >
                      {clearing
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Trash2 className="h-3 w-3" />
                      }
                    </button>
                  )}
                </div>
              </div>

              {/* Notification list */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-[var(--border)]">
                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center gap-2 text-[var(--text-muted)]">
                    <Bell className="h-8 w-8 opacity-20" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id, n.read)}
                      className={cn(
                        'flex gap-3 p-4 cursor-pointer hover:bg-[var(--surface-3)] transition-colors relative',
                        !n.read && 'bg-brand-600/5'
                      )}
                    >
                      {/* Colour dot */}
                      <div className={cn(
                        'mt-0.5 h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold',
                        notifTypeBg[n.type] ?? notifTypeBg.info
                      )}>
                        {n.type === 'error'   && '!'}
                        {n.type === 'success' && '✓'}
                        {n.type === 'warning' && '△'}
                        {n.type === 'info'    && 'i'}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium leading-snug',
                          n.read ? 'text-[var(--text)]' : 'text-brand-400'
                        )}>
                          {n.title}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1 opacity-70">
                          {formatRelative(n.createdAt)}
                        </p>
                      </div>

                      {/* Unread dot + loading indicator */}
                      <div className="flex flex-col items-end justify-between shrink-0 self-stretch">
                        {loadingId === n.id
                          ? <Loader2 className="h-3 w-3 animate-spin text-brand-500 mt-0.5" />
                          : !n.read
                            ? <span className={cn('mt-1.5 h-2 w-2 rounded-full', notifTypeColors[n.type])} />
                            : <span className="h-2 w-2" />
                        }
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-2)]">
                  <p className="text-[11px] text-[var(--text-muted)] text-center">
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