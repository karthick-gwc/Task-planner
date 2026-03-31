import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Shield, X, UserCog, BarChart2, CheckCircle2,
  Clock, AlertTriangle, Calendar, MapPin, Phone, Briefcase,
  TrendingUp, Users, ChevronRight, Circle, Star,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/useAppRedux';
import { Avatar } from '../components/ui';
import { fetchAllUsers } from '../components/store/slices/authSlice';
import { AssignManagerModal } from '../components/ui/AssignManagerModal';
import { cn, formatDate } from '../components/utils';
import type { User, Task } from '../components/types';

// ─── Role styling ─────────────────────────────────────────────────────────────

const ROLE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  admin:    { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/20',    label: 'Admin'    },
  manager:  { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', label: 'Manager'  },
  employee: { bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/20',   label: 'Employee' },
};

// ─── Stat block inside detail panel ──────────────────────────────────────────

function StatBlock({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-3 rounded-xl border', color)}>
      <div className="mb-1">{icon}</div>
      <p className="text-lg font-bold text-[var(--text)]">{value}</p>
      <p className="text-[10px] text-[var(--text-muted)] font-medium">{label}</p>
    </div>
  );
}

// ─── Full user detail drawer ──────────────────────────────────────────────────

interface UserDetailDrawerProps {
  member: (User & { taskStats: { total: number; completed: number; inProgress: number; overdue: number }; allTasks: Task[] }) | null;
  onClose: () => void;
  onAssignManager: (emp: User) => void;
  currentUser: User | null;
  users: User[];
}

function UserDetailDrawer({ member, onClose, onAssignManager, currentUser, users }: UserDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'activity'>('tasks');

  if (!member) return null;

  const manager = users.find((u) => u.id === member.manager_id);
  const rate     = member.taskStats.total > 0
    ? Math.round((member.taskStats.completed / member.taskStats.total) * 100)
    : 0;

  const recentTasks    = member.allTasks.slice(0, 8);
  const overdueTasks   = member.allTasks.filter((t) => t.status === 'overdue');
  const completedTasks = member.allTasks.filter((t) => t.status === 'completed');

  const roleStyle = ROLE[member.role] ?? ROLE.employee;
  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-[520px] bg-[var(--surface)] border-l border-[var(--border)] flex flex-col shadow-2xl"
        >
          {/* ── Hero header ── */}
          <div className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 px-6 pt-6 pb-8 shrink-0 overflow-hidden">
            {/* Decorative orbs */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-8 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />

            <div className="relative flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar name={member.name} size="lg" />
                  <span className={cn(
                    'absolute -bottom-1 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border',
                    roleStyle.bg, roleStyle.text, roleStyle.border
                  )}>
                    {roleStyle.label}
                  </span>
                </div>

                <div>
                  <h2 className="text-white font-bold text-lg">{member.name}</h2>
                  {member.jobTitle && (
                    <p className="text-brand-200 text-sm mt-0.5">{member.jobTitle}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1.5 text-brand-300 text-xs">
                    <Mail className="h-3 w-3 shrink-0" />
                    {member.email}
                  </div>
                  {member.location && (
                    <div className="flex items-center gap-1.5 mt-0.5 text-brand-300 text-xs">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {member.location}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {canManage && member.role === 'employee' && (
                  <button
                    onClick={() => onAssignManager(member)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors border border-white/20"
                  >
                    <UserCog className="h-3.5 w-3.5" />
                    Assign
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Manager / extra info */}
            <div className="flex flex-wrap gap-3 text-xs">
              {manager && (
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-brand-200 border border-white/10">
                  <Shield className="h-3 w-3" />
                  Reports to: <span className="text-white font-medium ml-0.5">{manager.name}</span>
                </div>
              )}
              {member.department && (
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-brand-200 border border-white/10">
                  <Briefcase className="h-3 w-3" />
                  {member.department}
                </div>
              )}
              {member.joinedAt && (
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full text-brand-200 border border-white/10">
                  <Calendar className="h-3 w-3" />
                  Joined {formatDate(member.joinedAt, 'MMM yyyy')}
                </div>
              )}
            </div>
          </div>

          {/* ── Completion rate banner ── */}
          <div className="px-5 py-3 bg-[var(--surface-2)] border-b border-[var(--border)] shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[var(--text)]">Task completion</span>
              <span className={cn(
                'text-xs font-bold',
                rate >= 75 ? 'text-emerald-400' : rate >= 50 ? 'text-amber-400' : 'text-red-400'
              )}>
                {rate}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
              <motion.div
                animate={{ width: `${rate}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  rate >= 75 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                )}
              />
            </div>
          </div>

          {/* ── Stat tiles ── */}
          <div className="px-5 py-4 grid grid-cols-4 gap-2 border-b border-[var(--border)] shrink-0">
            <StatBlock
              label="Total" value={member.taskStats.total}
              icon={<BarChart2 className="h-4 w-4 text-brand-400" />}
              color="border-brand-500/20 bg-brand-500/5"
            />
            <StatBlock
              label="Done" value={member.taskStats.completed}
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              color="border-emerald-500/20 bg-emerald-500/5"
            />
            <StatBlock
              label="Active" value={member.taskStats.inProgress}
              icon={<Clock className="h-4 w-4 text-blue-400" />}
              color="border-blue-500/20 bg-blue-500/5"
            />
            <StatBlock
              label="Overdue" value={member.taskStats.overdue}
              icon={<AlertTriangle className="h-4 w-4 text-red-400" />}
              color="border-red-500/20 bg-red-500/5"
            />
          </div>

          {/* ── Tabs ── */}
          <div className="flex border-b border-[var(--border)] shrink-0 px-4">
            {(['tasks', 'activity'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-3 text-xs font-medium capitalize transition-all relative',
                  activeTab === t
                    ? 'text-brand-400'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                )}
              >
                {t === 'tasks' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                {t === 'tasks' ? 'Tasks' : 'Activity'}
                {activeTab === t && (
                  <motion.div layoutId="drawer-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeTab === 'tasks' && (
              <div className="flex flex-col gap-2">
                {/* Alert: overdue tasks */}
                {overdueTasks.length > 0 && (
                  <div className="mb-2 p-3 rounded-xl bg-red-500/8 border border-red-500/20 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                    <span className="text-xs text-red-400 font-medium">
                      {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''} need attention
                    </span>
                  </div>
                )}

                {recentTasks.length === 0 ? (
                  <div className="text-center py-10 text-[var(--text-muted)]">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No tasks assigned</p>
                  </div>
                ) : (
                  recentTasks.map((task, i) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-xl border transition-all',
                        task.status === 'overdue'
                          ? 'bg-red-500/5 border-red-500/20'
                          : task.status === 'completed'
                            ? 'bg-emerald-500/5 border-emerald-500/20 opacity-75'
                            : 'bg-[var(--surface-2)] border-[var(--border)]'
                      )}
                    >
                      {/* Status icon */}
                      <div className="mt-0.5 shrink-0">
                        {task.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        {task.status === 'in_progress' && <Clock className="h-4 w-4 text-blue-500" />}
                        {task.status === 'overdue' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        {task.status === 'pending' && <Circle className="h-4 w-4 text-[var(--text-muted)]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          task.status === 'completed' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text)]'
                        )}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {/* Priority */}
                          <span className={cn(
                            'text-[9px] font-bold px-1.5 py-px rounded-full capitalize border',
                            task.priority === 'urgent' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                            task.priority === 'high'   ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                            task.priority === 'medium' ? 'text-brand-400 bg-brand-500/10 border-brand-500/20' :
                                                         'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          )}>
                            {task.priority}
                          </span>
                          {/* Due date */}
                          <span className={cn(
                            'flex items-center gap-0.5 text-[10px]',
                            task.status === 'overdue' ? 'text-red-400' : 'text-[var(--text-muted)]'
                          )}>
                            <Calendar className="h-2.5 w-2.5" />
                            {formatDate(task.due_date, 'MMM d')}
                          </span>
                          {/* Progress */}
                          {task.progress && task.progress > 0 && (
                            <span className="text-[10px] text-brand-400">{task.progress}%</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="flex flex-col gap-4">
                {/* Productivity score ring */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="var(--surface-3)" strokeWidth="6" />
                      <circle
                        cx="32" cy="32" r="26" fill="none"
                        stroke={rate >= 75 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 * (1 - rate / 100)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-[var(--text)]">{rate}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">Productivity score</p>
                    <p className={cn(
                      'text-xs font-medium mt-0.5',
                      rate >= 75 ? 'text-emerald-400' : rate >= 50 ? 'text-amber-400' : 'text-red-400'
                    )}>
                      {rate >= 75 ? '🚀 Excellent' : rate >= 50 ? '💪 Good' : '⚠ Needs attention'}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      Based on {member.taskStats.total} tasks assigned
                    </p>
                  </div>
                </div>

                {/* Task breakdown */}
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Completed on time', count: completedTasks.length, color: 'bg-emerald-500', pct: member.taskStats.total > 0 ? (completedTasks.length / member.taskStats.total) * 100 : 0 },
                    { label: 'In progress', count: member.taskStats.inProgress, color: 'bg-blue-500', pct: member.taskStats.total > 0 ? (member.taskStats.inProgress / member.taskStats.total) * 100 : 0 },
                    { label: 'Overdue', count: member.taskStats.overdue, color: 'bg-red-500', pct: member.taskStats.total > 0 ? (member.taskStats.overdue / member.taskStats.total) * 100 : 0 },
                    { label: 'Pending', count: member.taskStats.total - completedTasks.length - member.taskStats.inProgress - member.taskStats.overdue, color: 'bg-[var(--border)]', pct: 0 },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <span className="text-xs text-[var(--text-muted)] w-32 shrink-0">{row.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                        <motion.div
                          animate={{ width: `${row.pct}%` }}
                          transition={{ duration: 0.7 }}
                          className={cn('h-full rounded-full', row.color)}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[var(--text)] w-4 text-right shrink-0">{row.count}</span>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                {member.bio && (
                  <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{member.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Main TeamPage ────────────────────────────────────────────────────────────

export function TeamPage() {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector((s) => s.tasks);
  const { user, users } = useAppSelector((s) => s.auth);

  const [selectedId,        setSelectedId]        = useState<string | null>(null);
  const [assignModalOpen,   setAssignModalOpen]   = useState(false);
  const [selectedEmployee,  setSelectedEmployee]  = useState<any>(null);
  const [search,            setSearch]            = useState('');

  useEffect(() => {
    if (users.length === 0) dispatch(fetchAllUsers());
  }, [dispatch, users.length]);

  const visibleUsers = users.filter((u) => {
    if (user?.role === 'admin')   return true;
    if (user?.role === 'manager') return u.manager_id === user.id || u.id === user.id;
    return u.id === user?.id;
  });

  const filteredUsers = search
    ? visibleUsers.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : visibleUsers;

  const teamData = filteredUsers.map((member) => {
    const userTasks = tasks.filter((t) => t.assigned_to === member.id);
    return {
      ...member,
      taskStats: {
        total:      userTasks.length,
        completed:  userTasks.filter((t) => t.status === 'completed').length,
        inProgress: userTasks.filter((t) => t.status === 'in_progress').length,
        overdue:    userTasks.filter((t) => t.status === 'overdue').length,
      },
      allTasks: userTasks,
    };
  });

  const selectedMember = teamData.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-5 max-w-[1200px] mx-auto w-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[var(--text)] font-bold text-2xl sm:text-[1.6rem] font-display m-0">Team</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {visibleUsers.length} member{visibleUsers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members…"
          className="h-9 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] text-sm placeholder:text-[var(--text-muted)] outline-none focus:border-brand-500 transition-colors w-full sm:w-52"
        />
      </div>

      {/* ── Summary stat row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Members',   value: visibleUsers.length,                                  icon: <Users className="h-4 w-4 text-brand-400" />,    bg: 'bg-brand-500/5   border-brand-500/20'  },
          { label: 'Total tasks', value: tasks.length,                                       icon: <BarChart2 className="h-4 w-4 text-blue-400" />,  bg: 'bg-blue-500/5    border-blue-500/20'   },
          { label: 'Completed', value: tasks.filter((t) => t.status === 'completed').length, icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />, bg: 'bg-emerald-500/5 border-emerald-500/20' },
          { label: 'Overdue',   value: tasks.filter((t) => t.status === 'overdue').length,   icon: <AlertTriangle className="h-4 w-4 text-red-400" />,bg: 'bg-red-500/5     border-red-500/20'   },
        ].map((s) => (
          <div key={s.label} className={cn('flex items-center gap-3 p-3.5 rounded-2xl border', s.bg)}>
            <div className="shrink-0">{s.icon}</div>
            <div>
              <p className="text-xl font-bold text-[var(--text)]">{s.value}</p>
              <p className="text-[10px] text-[var(--text-muted)] font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Member grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamData.map((member, i) => {
          const rate      = member.taskStats.total > 0
            ? Math.round((member.taskStats.completed / member.taskStats.total) * 100)
            : 0;
          const roleStyle = ROLE[member.role] ?? ROLE.employee;
          const isSelected = selectedId === member.id;

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div
                onClick={() => { setSelectedId(member.id); }}
                className={cn(
                  'bg-[var(--surface-2)] border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/5',
                  isSelected
                    ? 'border-brand-500 shadow-[0_0_0_3px_rgba(99,112,245,0.15)]'
                    : 'border-[var(--border)] hover:border-brand-400/40'
                )}
              >
                {/* Top row */}
                <div className="flex items-start gap-3 mb-4">
                  <Avatar name={member.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text)] font-semibold text-sm truncate">{member.name}</p>
                    <p className="text-[var(--text-muted)] text-xs mt-0.5 flex items-center gap-1 truncate">
                      <Mail className="h-2.5 w-2.5 shrink-0" />
                      {member.email}
                    </p>
                    {member.jobTitle && (
                      <p className="text-[var(--text-muted)] text-[10px] mt-0.5 flex items-center gap-1 truncate">
                        <Briefcase className="h-2.5 w-2.5 shrink-0" />
                        {member.jobTitle}
                      </p>
                    )}
                  </div>
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize shrink-0',
                    roleStyle.bg, roleStyle.text, roleStyle.border
                  )}>
                    {roleStyle.label}
                  </span>
                </div>

                {/* Task stat pills */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Done',   value: member.taskStats.completed,  color: 'text-emerald-400', bg: 'bg-emerald-500/8' },
                    { label: 'Active', value: member.taskStats.inProgress, color: 'text-blue-400',    bg: 'bg-blue-500/8'    },
                    { label: 'Late',   value: member.taskStats.overdue,    color: 'text-red-400',     bg: 'bg-red-500/8'     },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className={cn('text-center py-2 rounded-xl', bg)}>
                      <p className={cn('text-base font-bold', color)}>{value}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[10px] text-[var(--text-muted)]">Completion</span>
                    <span className="text-[10px] font-semibold text-[var(--text)]">{rate}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${rate}%` }}
                      transition={{ duration: 0.7, delay: 0.2 + i * 0.06 }}
                      className={cn(
                        'h-full rounded-full',
                        rate >= 75 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-brand-600'
                      )}
                    />
                  </div>
                </div>

                {/* View details link */}
                <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {member.taskStats.total} task{member.taskStats.total !== 1 ? 's' : ''}
                  </span>
                  <span className="text-[10px] text-brand-400 flex items-center gap-0.5 font-medium">
                    View details <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── User Detail Drawer ── */}
      <UserDetailDrawer
        member={selectedMember}
        onClose={() => setSelectedId(null)}
        onAssignManager={(emp) => { setSelectedEmployee(emp); setAssignModalOpen(true); }}
        currentUser={user}
        users={users}
      />

      <AssignManagerModal
        isOpen={assignModalOpen}
        onClose={() => { setAssignModalOpen(false); setSelectedEmployee(null); }}
        employee={selectedEmployee}
      />
    </div>
  );
}
