/**
 * TaskDetailModal.tsx
 * Jira-style slide-over panel showing full task detail:
 * history/changelog, subtasks, time log, comments, watchers.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, Circle, Clock, Calendar, Link2, Repeat,
  Tag, Users, Timer, Paperclip, History, Plus, Trash2,
  ChevronRight, AlertCircle, Pencil, Save, Check, Flag,
  BarChart2, MessageSquare,
} from 'lucide-react';
import type { Task, Subtask, TaskHistoryEvent } from '../types';
import { cn, formatDate, priorityLabel, statusLabel } from '../utils';
import { Avatar, Badge, ProgressBar } from '../ui';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppRedux';
import { updateTask } from '../store/slices/taskSlice';

// ─── Local helpers ────────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'text-red-400 border-red-500/30 bg-red-500/8',
  high:   'text-orange-400 border-orange-500/30 bg-orange-500/8',
  medium: 'text-brand-400 border-brand-500/30 bg-brand-500/8',
  low:    'text-emerald-400 border-emerald-500/30 bg-emerald-500/8',
};

const STATUS_COLORS: Record<string, string> = {
  pending:     'bg-[var(--surface-3)] text-[var(--text-muted)]',
  in_progress: 'bg-blue-500/10 text-blue-400',
  completed:   'bg-emerald-500/10 text-emerald-400',
  overdue:     'bg-red-500/10 text-red-400',
};

const HISTORY_ICONS: Record<string, { icon: string; color: string }> = {
  created:          { icon: '✦', color: 'bg-brand-500/10 text-brand-400' },
  status_changed:   { icon: '↻', color: 'bg-blue-500/10 text-blue-400' },
  priority_changed: { icon: '⚑', color: 'bg-orange-500/10 text-orange-400' },
  assigned:         { icon: '◎', color: 'bg-purple-500/10 text-purple-400' },
  due_date_changed: { icon: '◷', color: 'bg-amber-500/10 text-amber-400' },
  progress_updated: { icon: '▸', color: 'bg-emerald-500/10 text-emerald-400' },
  comment_added:    { icon: '✉', color: 'bg-cyan-500/10 text-cyan-400' },
  subtask_completed:{ icon: '✓', color: 'bg-emerald-500/10 text-emerald-400' },
  tag_added:        { icon: '⊕', color: 'bg-teal-500/10 text-teal-400' },
  tag_removed:      { icon: '⊖', color: 'bg-red-500/10 text-red-400' },
  title_changed:    { icon: '✎', color: 'bg-brand-500/10 text-brand-400' },
};

function historyText(ev: TaskHistoryEvent): React.ReactNode {
  switch (ev.type) {
    case 'created':          return 'created this task';
    case 'status_changed':   return <>{ev.from} <ChevronRight className="inline h-3 w-3 mx-0.5" /> <b>{ev.to}</b></>;
    case 'priority_changed': return <>priority: {ev.from} → <b>{ev.to}</b></>;
    case 'assigned':         return <>assigned to <b>{ev.to}</b></>;
    case 'progress_updated': return <>progress → <b>{ev.to}%</b></>;
    case 'comment_added':    return 'added a comment';
    case 'due_date_changed': return <>due date → <b>{ev.to}</b></>;
    case 'subtask_completed':return <>completed subtask: <b>{ev.meta}</b></>;
    case 'tag_added':        return <>added tag <b>#{ev.meta}</b></>;
    case 'tag_removed':      return <>removed tag <b>#{ev.meta}</b></>;
    case 'title_changed':    return <>renamed: <b>{ev.to}</b></>;
    default:                 return ev.type.replace('_', ' ');
  }
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[var(--text-muted)] mb-3">
      <span className="shrink-0">{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-[var(--border)]" />
    </div>
  );
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'history' | 'subtasks' | 'time';

// ─── Main component ───────────────────────────────────────────────────────────

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
}

export function TaskDetailModal({
  task, onClose, onEdit, onDelete, onStatusChange,
}: TaskDetailModalProps) {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((s) => s.auth);
  const { user  } = useAppSelector((s) => s.auth);
  const [tab, setTab] = useState<Tab>('overview');
  const [newSubtask, setNewSubtask] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTab('overview'); }, [task?.id]);

  if (!task) return null;

  const assignee     = users?.find((u) => u.id === task.assigned_to);
  const creator      = users?.find((u) => u.id === task.created_by);
  const subtasks     = task.subtasks ?? [];
  const doneSubtasks = subtasks.filter((s) => s.completed).length;
  const history      = (task.history ?? []).slice().reverse();
  const timeEntries  = task.timeEntries ?? [];
  const totalLogged  = timeEntries.reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0);

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    const sub: Subtask = {
      id: crypto.randomUUID(),
      title: newSubtask.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    dispatch(updateTask({ id: task.id, updates: { subtasks: [...subtasks, sub] } }));
    setNewSubtask('');
  };

  const toggleSubtask = (subId: string) => {
    const updated = subtasks.map((s) =>
      s.id === subId
        ? { ...s, completed: !s.completed, completedAt: !s.completed ? new Date().toISOString() : undefined }
        : s
    );
    dispatch(updateTask({ id: task.id, updates: { subtasks: updated } }));
  };

  const deleteSubtask = (subId: string) => {
    dispatch(updateTask({ id: task.id, updates: { subtasks: subtasks.filter((s) => s.id !== subId) } }));
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview',  icon: <BarChart2 className="h-3.5 w-3.5" /> },
    { id: 'subtasks', label: 'Subtasks',  icon: <Check className="h-3.5 w-3.5" />, count: subtasks.length },
    { id: 'history',  label: 'History',   icon: <History className="h-3.5 w-3.5" />, count: history.length },
    { id: 'time',     label: 'Time log',  icon: <Timer className="h-3.5 w-3.5" />, count: timeEntries.length },
  ];

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

        {/* Slide-over panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-[760px] bg-[var(--surface)] border-l border-[var(--border)] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* ── Header ── */}
          <div className="px-5 py-4 border-b border-[var(--border)] shrink-0">
            <div className="flex items-start gap-3">
              {/* Status pill */}
              <button
                onClick={() => onStatusChange?.(task.id,
                  task.status === 'pending' ? 'in_progress'
                  : task.status === 'in_progress' ? 'completed'
                  : 'pending'
                )}
                className={cn(
                  'shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize border transition-all mt-0.5',
                  STATUS_COLORS[task.status],
                  'border-[var(--border)] hover:opacity-80'
                )}
              >
                {task.status.replace('_', ' ')}
              </button>

              <div className="flex-1 min-w-0 pr-2">
                <h2 className="text-[var(--text)] font-bold text-base leading-snug">
                  {task.title}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-px rounded-full border',
                    PRIORITY_COLOR[task.priority]
                  )}>
                    <Flag className="inline h-2.5 w-2.5 mr-0.5" />
                    {task.priority}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] capitalize">{task.category}</span>
                  {task.storyPoints && (
                    <span className="text-[10px] bg-brand-500/10 text-brand-400 px-1.5 py-px rounded font-bold">
                      {task.storyPoints}pt
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {onEdit && (
                  <button
                    onClick={() => { onEdit(task); onClose(); }}
                    className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text)] transition-all"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text)] transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            {subtasks.length > 0 && (
              <div className="mt-3">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Subtasks {doneSubtasks}/{subtasks.length}
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--text)]">
                    {Math.round((doneSubtasks / subtasks.length) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden">
                  <motion.div
                    animate={{ width: `${(doneSubtasks / subtasks.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full bg-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Tabs ── */}
          <div className="flex border-b border-[var(--border)] shrink-0 px-4">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-3 text-xs font-medium transition-all relative',
                  tab === t.id
                    ? 'text-brand-400'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                )}
              >
                {t.icon}
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span className="px-1 py-px rounded-full bg-[var(--surface-3)] text-[9px] font-bold">
                    {t.count}
                  </span>
                )}
                {tab === t.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          <div className="flex-1 overflow-y-auto">
            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="p-5 flex flex-col gap-5">
                {/* Meta grid */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: 'Assigned to',
                      icon: <Users className="h-3.5 w-3.5" />,
                      value: assignee
                        ? <div className="flex items-center gap-1.5"><Avatar name={assignee.name} size="xs" /><span>{assignee.name}</span></div>
                        : <span className="text-[var(--text-muted)]">Unassigned</span>,
                    },
                    {
                      label: 'Due date',
                      icon: <Calendar className="h-3.5 w-3.5" />,
                      value: formatDate(task.due_date, 'MMM d, yyyy'),
                    },
                    {
                      label: 'Created by',
                      icon: <Users className="h-3.5 w-3.5" />,
                      value: creator?.name ?? task.created_by,
                    },
                    {
                      label: 'Recurrence',
                      icon: <Repeat className="h-3.5 w-3.5" />,
                      value: task.recurrence === 'none' ? '—' : task.recurrence,
                    },
                    task.estimatedHours ? {
                      label: 'Estimate',
                      icon: <Timer className="h-3.5 w-3.5" />,
                      value: `${task.loggedHours ?? 0}h logged / ${task.estimatedHours}h est.`,
                    } : null,
                    task.storyPoints ? {
                      label: 'Story points',
                      icon: <Flag className="h-3.5 w-3.5" />,
                      value: `${task.storyPoints} pts`,
                    } : null,
                  ].filter(Boolean).map((item: any) => (
                    <div key={item.label} className="bg-[var(--surface-2)] rounded-xl p-3 border border-[var(--border)]">
                      <div className="flex items-center gap-1.5 text-[var(--text-muted)] mb-1.5">
                        {item.icon}
                        <span className="text-[10px] font-semibold uppercase tracking-wide">{item.label}</span>
                      </div>
                      <div className="text-[var(--text)] text-xs font-medium">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {task.description && (
                  <div>
                    <SectionHeader icon={<MessageSquare className="h-3.5 w-3.5" />} label="Description" />
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)]">
                      {task.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div>
                    <SectionHeader icon={<Tag className="h-3.5 w-3.5" />} label="Tags" />
                    <div className="flex flex-wrap gap-1.5">
                      {task.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dependencies */}
                {task.dependencies && task.dependencies.length > 0 && (
                  <div>
                    <SectionHeader icon={<Link2 className="h-3.5 w-3.5" />} label="Dependencies" />
                    <div className="flex flex-col gap-1.5">
                      {task.dependencies.map((depId) => (
                        <div key={depId} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-muted)]">
                          <Link2 className="h-3 w-3 shrink-0" />
                          {depId}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completion info */}
                {task.status === 'completed' && task.completedAt && (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-semibold">Task completed</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {new Date(task.completedAt).toLocaleString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── SUBTASKS ── */}
            {tab === 'subtasks' && (
              <div className="p-5">
                {/* Add subtask input */}
                <div className="flex gap-2 mb-4">
                  <input
                    ref={inputRef}
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                    placeholder="Add subtask..."
                    className="flex-1 h-9 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] text-sm placeholder:text-[var(--text-muted)] outline-none focus:border-brand-500 transition-colors"
                  />
                  <button
                    onClick={addSubtask}
                    className="h-9 w-9 flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {subtasks.length === 0 ? (
                  <div className="text-center py-12 text-[var(--text-muted)]">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No subtasks yet</p>
                    <p className="text-xs mt-1">Break this task down into smaller steps</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs text-[var(--text-muted)]">{doneSubtasks} of {subtasks.length} done</span>
                        <span className="text-xs font-semibold text-[var(--text)]">
                          {Math.round((doneSubtasks / subtasks.length) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
                        <motion.div
                          animate={{ width: `${(doneSubtasks / subtasks.length) * 100}%` }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>

                    {subtasks.map((sub, i) => (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all group',
                          sub.completed
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : 'bg-[var(--surface-2)] border-[var(--border)]'
                        )}
                      >
                        <button
                          onClick={() => toggleSubtask(sub.id)}
                          className="shrink-0 transition-transform hover:scale-110"
                        >
                          {sub.completed
                            ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            : <Circle className="h-4 w-4 text-[var(--text-muted)]" />
                          }
                        </button>

                        <span className={cn(
                          'flex-1 text-sm',
                          sub.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text)]'
                        )}>
                          {sub.title}
                        </span>

                        {sub.completedAt && (
                          <span className="text-[9px] text-emerald-500/70 hidden group-hover:block shrink-0">
                            {formatDate(sub.completedAt, 'MMM d')}
                          </span>
                        )}

                        <button
                          onClick={() => deleteSubtask(sub.id)}
                          className="shrink-0 h-5 w-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-400 transition-all"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── HISTORY ── */}
            {tab === 'history' && (
              <div className="p-5">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-[var(--text-muted)]">
                    <History className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No history yet</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[18px] top-4 bottom-4 w-px bg-[var(--border)]" />
                    <div className="flex flex-col gap-4">
                      {history.map((ev, i) => {
                        const hi = HISTORY_ICONS[ev.type] ?? { icon: '•', color: 'bg-gray-500/10 text-gray-400' };
                        return (
                          <motion.div
                            key={ev.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-start gap-3"
                          >
                            {/* Icon dot */}
                            <span className={cn(
                              'shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border border-[var(--border)] bg-[var(--surface-2)] z-10',
                              hi.color
                            )}>
                              {hi.icon}
                            </span>

                            <div className="flex-1 min-w-0 pt-1.5">
                              <p className="text-sm text-[var(--text)] leading-snug">
                                <span className="font-semibold">{ev.userName}</span>{' '}
                                <span className="text-[var(--text-muted)]">{historyText(ev)}</span>
                              </p>
                              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                                {new Date(ev.timestamp).toLocaleString('en-US', {
                                  weekday: 'short', month: 'short', day: 'numeric',
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                              {ev.type === 'comment_added' && ev.meta && (
                                <p className="mt-1.5 text-xs text-[var(--text-muted)] italic bg-[var(--surface-2)] px-2.5 py-1.5 rounded-lg border border-[var(--border)]">
                                  "{ev.meta}"
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TIME LOG ── */}
            {tab === 'time' && (
              <div className="p-5">
                {/* Summary */}
                <div className="grid grid-cols-1 gap-3 mb-5 sm:grid-cols-2">
                  <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-semibold mb-1">Logged</p>
                    <p className="text-xl font-bold text-[var(--text)]">{Math.round(totalLogged / 60 * 10) / 10}h</p>
                  </div>
                  <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide font-semibold mb-1">Estimated</p>
                    <p className="text-xl font-bold text-[var(--text)]">{task.estimatedHours ?? '—'}h</p>
                  </div>
                </div>

                {/* Time bar vs estimate */}
                {task.estimatedHours && (
                  <div className="mb-5">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-[var(--text-muted)]">Time used</span>
                      <span className="text-xs font-semibold text-[var(--text)]">
                        {Math.min(100, Math.round((totalLogged / 60 / task.estimatedHours) * 100))}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--surface-3)] overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          totalLogged / 60 > task.estimatedHours ? 'bg-red-500' : 'bg-brand-500'
                        )}
                        style={{ width: `${Math.min(100, (totalLogged / 60 / task.estimatedHours) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Entries */}
                {timeEntries.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-muted)]">
                    <Timer className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No time logged yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {timeEntries.map((entry) => {
                      const loggedUser = users?.find((u) => u.id === entry.userId);
                      return (
                        <div key={entry.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                          <Avatar name={loggedUser?.name ?? 'User'} size="xs" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[var(--text)]">{loggedUser?.name ?? 'Unknown'}</p>
                            {entry.note && <p className="text-[10px] text-[var(--text-muted)] truncate">{entry.note}</p>}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-semibold text-[var(--text)]">
                              {Math.round((entry.durationMinutes ?? 0) / 60 * 10) / 10}h
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)]">
                              {formatDate(entry.startedAt, 'MMM d')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer actions ── */}
          <div className="px-5 py-4 border-t border-[var(--border)] shrink-0 flex items-center justify-between">
            <button
              onClick={() => { onDelete?.(task.id); onClose(); }}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete task
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onStatusChange?.(task.id,
                  task.status === 'completed' ? 'pending' : 'completed'
                )}
                className={cn(
                  'text-xs px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5',
                  task.status === 'completed'
                    ? 'bg-[var(--surface-3)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {task.status === 'completed' ? 'Re-open' : 'Mark complete'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
