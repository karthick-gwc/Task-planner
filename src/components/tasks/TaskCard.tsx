import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  History,
  Link2,
  MoreVertical,
  Paperclip,
  Repeat,
  Sparkles,
  Timer,
  Users,
} from 'lucide-react';
import type { Task } from '../types';
import { cn, formatDate, isDueSoon, isOverdue, priorityLabel } from '../utils';
import { Avatar, Badge } from '../ui';
import { useAppSelector } from '../../hooks/useAppRedux';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
  onDetailOpen?: (task: Task) => void;
  compact?: boolean;
}

const PRIORITY_BAR: Record<Task['priority'], string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-brand-500',
  low: 'bg-emerald-500',
};

const STATUS_ICON: Record<Task['status'], React.ReactNode> = {
  pending: <Circle className="h-3.5 w-3.5 text-[var(--text-muted)]" />,
  in_progress: <Clock className="h-3.5 w-3.5 text-blue-500" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  overdue: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
};

const HISTORY_BADGE: Record<string, string> = {
  created: 'bg-brand-500/10 text-brand-400',
  status_changed: 'bg-blue-500/10 text-blue-400',
  priority_changed: 'bg-orange-500/10 text-orange-400',
  assigned: 'bg-purple-500/10 text-purple-400',
  due_date_changed: 'bg-amber-500/10 text-amber-400',
  progress_updated: 'bg-emerald-500/10 text-emerald-400',
  comment_added: 'bg-cyan-500/10 text-cyan-400',
  subtask_completed: 'bg-emerald-500/10 text-emerald-400',
  tag_added: 'bg-teal-500/10 text-teal-400',
  tag_removed: 'bg-rose-500/10 text-rose-400',
  title_changed: 'bg-brand-500/10 text-brand-400',
  description_changed: 'bg-slate-500/10 text-slate-400',
};

function getHistoryLabel(taskEvent: NonNullable<Task['history']>[number]) {
  switch (taskEvent.type) {
    case 'created':
      return 'created this task';
    case 'status_changed':
      return `moved from ${taskEvent.from} to ${taskEvent.to}`;
    case 'priority_changed':
      return `changed priority from ${taskEvent.from} to ${taskEvent.to}`;
    case 'assigned':
      return `assigned to ${taskEvent.to}`;
    case 'due_date_changed':
      return `moved due date to ${taskEvent.to}`;
    case 'progress_updated':
      return `updated progress to ${taskEvent.to}%`;
    case 'comment_added':
      return 'added a comment';
    case 'subtask_completed':
      return `completed ${taskEvent.meta}`;
    case 'tag_added':
      return `added tag #${taskEvent.meta}`;
    case 'tag_removed':
      return `removed tag #${taskEvent.meta}`;
    case 'title_changed':
      return `renamed task to ${taskEvent.to}`;
    case 'description_changed':
      return 'updated the description';
    default:
      return 'updated the task';
  }
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onDetailOpen,
  compact = false,
}: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [subtasksOpen, setSubtasksOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const { users } = useAppSelector((state) => state.auth);

  const assignee = users?.find((member) => member.id === task.assigned_to);
  const overdue = isOverdue(task.due_date) && task.status !== 'completed';
  const dueSoon = isDueSoon(task.due_date) && task.status !== 'completed';
  const subtasks = task.subtasks ?? [];
  const completedSubtasks = subtasks.filter((subtask) => subtask.completed).length;
  const history = task.history ?? [];
  const historyPreview = useMemo(() => history.slice().reverse().slice(0, 5), [history]);
  const isCompleted = task.status === 'completed';

  const derivedProgress = subtasks.length > 0
    ? Math.round((completedSubtasks / subtasks.length) * 100)
    : null;
  const displayProgress = task.progress ?? derivedProgress;

  React.useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const cycleStatus = () => {
    const nextStatus =
      task.status === 'pending'
        ? 'in_progress'
        : task.status === 'in_progress'
          ? 'completed'
          : 'pending';
    onStatusChange?.(task.id, nextStatus);
  };

  return (
    <motion.div
      className="h-full"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={cn(
          'group relative flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 transition-all duration-200 overflow-visible',
          compact && 'p-3',
          isCompleted && 'opacity-80',
          'hover:border-brand-500/35 hover:shadow-[0_14px_34px_rgba(9,30,66,0.08)]'
        )}
      >
        <div className={cn('absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl', PRIORITY_BAR[task.priority])} />

        {isCompleted && (
          <div className="absolute right-3 top-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
            Done
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-3 pl-3">
          <div className="flex items-start gap-2">
            <button
              title="Change status"
              onClick={(event) => {
                event.stopPropagation();
                cycleStatus();
              }}
              className="mt-0.5 shrink-0 transition-transform hover:scale-110"
            >
              {STATUS_ICON[task.status]}
            </button>

            <div className="min-w-0 flex-1">
              <h3
                onClick={() => onDetailOpen?.(task)}
                className={cn(
                  'cursor-pointer font-semibold leading-snug text-[var(--text)] transition-colors hover:text-brand-500 line-clamp-2',
                  compact ? 'text-sm' : 'text-[0.95rem]',
                  isCompleted && 'line-through opacity-70'
                )}
              >
                {task.title}
              </h3>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                {task.storyPoints ? (
                  <span className="rounded-md bg-brand-500/10 px-1.5 py-px text-[10px] font-bold text-brand-500">
                    {task.storyPoints}pt
                  </span>
                ) : null}
                {task.estimatedHours ? (
                  <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                    <Timer className="h-2.5 w-2.5" />
                    {task.loggedHours ?? 0}h / {task.estimatedHours}h
                  </span>
                ) : null}
              </div>
            </div>

            <div ref={menuRef} className="relative shrink-0">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuOpen((value) => !value);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] opacity-75 transition-all hover:bg-[var(--surface-3)] hover:opacity-100 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute bottom-full right-0 z-40 mb-2 w-52 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
                  >
                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Change status
                    </p>
                    {(['pending', 'in_progress', 'completed'] as Task['status'][]).filter((status) => status !== task.status).map((status) => (
                      <button
                        key={status}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setMenuOpen(false);
                          onStatusChange?.(task.id, status);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs capitalize text-[var(--text)] transition-colors hover:bg-[var(--surface-3)]"
                      >
                        {STATUS_ICON[status]}
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                    <div className="my-1 border-t border-[var(--border)]" />
                    <button
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setMenuOpen(false);
                        onDetailOpen?.(task);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[var(--text)] transition-colors hover:bg-[var(--surface-3)]"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                      Open detail view
                    </button>
                    <button
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setMenuOpen(false);
                        onEdit?.(task);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-[var(--text)] transition-colors hover:bg-[var(--surface-3)]"
                    >
                      Edit task
                    </button>
                    <button
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setMenuOpen(false);
                        onDelete?.(task.id);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-red-500 transition-colors hover:bg-red-500/8"
                    >
                      Delete task
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {!compact && task.description ? (
            <p className="line-clamp-2 text-xs text-[var(--text-muted)]">
              {task.description}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            <Badge variant={task.priority}>{priorityLabel[task.priority]}</Badge>
            <Badge variant={task.category} className="capitalize">{task.category}</Badge>
            {task.recurrence !== 'none' ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--surface-3)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
                <Repeat className="h-2.5 w-2.5" />
                {task.recurrence}
              </span>
            ) : null}
          </div>

          {!compact && task.tags?.length ? (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-brand-500/10 px-1.5 py-px text-[10px] text-brand-500">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          {!compact && displayProgress !== null && displayProgress > 0 ? (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] text-[var(--text-muted)]">Progress</span>
                <span className="text-[10px] font-semibold text-[var(--text)]">{displayProgress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${displayProgress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    displayProgress === 100 ? 'bg-emerald-500' : 'bg-brand-500'
                  )}
                />
              </div>
            </div>
          ) : null}

          {!compact && subtasks.length > 0 ? (
            <div>
              <button
                onClick={() => setSubtasksOpen((value) => !value)}
                className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                <CheckSquare className="h-3 w-3" />
                <span>{completedSubtasks}/{subtasks.length} subtasks</span>
                {subtasksOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              <AnimatePresence>
                {subtasksOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 flex flex-col gap-1.5 pl-1">
                      {subtasks.map((subtask) => (
                        <div key={subtask.id} className="flex items-center gap-2">
                          {subtask.completed
                            ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            : <Circle className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />}
                          <span
                            className={cn(
                              'truncate text-[11px]',
                              subtask.completed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text)]'
                            )}
                          >
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : null}

          {!compact && history.length > 0 ? (
            <div>
              <button
                onClick={() => setHistoryOpen((value) => !value)}
                className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                <History className="h-3 w-3" />
                <span>{history.length} change{history.length !== 1 ? 's' : ''}</span>
                {historyOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>

              <AnimatePresence>
                {historyOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative mt-2 pl-3">
                      <div className="absolute bottom-0 left-[7px] top-0 w-px bg-[var(--border)]" />
                      <div className="flex flex-col gap-2">
                        {historyPreview.map((event) => (
                          <div key={event.id} className="relative flex items-start gap-2">
                            <span
                              className={cn(
                                'absolute -left-[5px] flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold',
                                HISTORY_BADGE[event.type] ?? 'bg-slate-500/10 text-slate-400'
                              )}
                            >
                              {event.type[0]?.toUpperCase() ?? '*'}
                            </span>
                            <div className="min-w-0 flex-1 pl-3">
                              <p className="text-[10px] leading-snug text-[var(--text)]">
                                <span className="font-medium">{event.userName}</span> {getHistoryLabel(event)}
                              </p>
                              <p className="mt-0.5 text-[9px] text-[var(--text-muted)]">
                                {new Date(event.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                        {history.length > 5 ? (
                          <button
                            onClick={() => onDetailOpen?.(task)}
                            className="pl-3 text-left text-[10px] text-brand-500 transition-colors hover:text-brand-600"
                          >
                            +{history.length - 5} more events, view full history
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : null}

          <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={cn(
                  'flex items-center gap-1 text-[11px]',
                  overdue ? 'text-red-500' : dueSoon ? 'text-amber-500' : 'text-[var(--text-muted)]'
                )}
              >
                <Calendar className="h-3 w-3" />
                {formatDate(task.due_date, 'MMM d')}
                {overdue ? <span className="font-semibold">- Overdue</span> : null}
              </span>

              {task.dependencies?.length ? (
                <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                  <Link2 className="h-3 w-3" />
                  {task.dependencies.length}
                </span>
              ) : null}

              {task.attachments ? (
                <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                  <Paperclip className="h-3 w-3" />
                  {task.attachments}
                </span>
              ) : null}

              {task.watchers?.length ? (
                <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                  <Users className="h-3 w-3" />
                  {task.watchers.length}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-1.5">
              {task.completedAt && isCompleted ? (
                <span className="text-[9px] text-emerald-500/80">
                  Completed {formatDate(task.completedAt, 'MMM d')}
                </span>
              ) : null}
              {assignee ? <Avatar name={assignee.name} size="xs" /> : null}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
