import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MoreVertical, Repeat, Link2 } from 'lucide-react';
import type { Task } from '../types';
import { cn, formatDate, isOverdue, isDueSoon, priorityLabel, statusLabel } from '../utils';
import { Badge, Avatar, ProgressBar, Card } from '../ui';
import { useAppSelector } from '../../hooks/useAppRedux';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
  compact?: boolean;
}

const PRIORITY_BAR: Record<string, string> = {
  urgent: 'bg-red-500',
  high:   'bg-orange-500',
  medium: 'bg-yellow-500',
  low:    'bg-green-500',
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange, compact = false }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const { user, users } = useAppSelector((s) => s.auth);
  const assignee = users?.find((u) => u.id === task.assigned_to);
  const assigneeName = assignee?.name || (task.assigned_to || 'Unassigned');

  const overdue = isOverdue(task.due_date) && task.status !== 'completed';
  const dueSoon = isDueSoon(task.due_date) && task.status !== 'completed';

  React.useEffect(() => {
    if (!menuOpen) return;
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [menuOpen]);

  const handleStatusChange = (status: Task['status']) => { setMenuOpen(false); onStatusChange?.(task.id, status); };
  const handleEdit         = () => { setMenuOpen(false); onEdit?.(task); };
  const handleDelete       = () => { setMenuOpen(false); onDelete?.(task.id); };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.18 }}
    >
      <div className={cn(
        'group relative rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] transition-all duration-200 overflow-hidden h-full',
        task.status === 'completed' && 'opacity-70',
        compact ? 'p-3' : 'p-4'
      )}>
        {/* Priority bar — left edge */}
        <div className={cn('absolute left-0 top-0 bottom-0 w-[3px]', PRIORITY_BAR[task.priority])} />

        <div className="flex flex-col h-full">
          <div className="flex-1">
            {/* Top row: badges + menu */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                <Badge variant={task.priority}>{priorityLabel[task.priority]}</Badge>
                <Badge variant={task.status}>{statusLabel[task.status]}</Badge>
                <Badge variant={task.category} className="capitalize">{task.category}</Badge>
              </div>

              <div ref={menuRef} className="relative shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
                  className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center rounded-lg transition-all text-[var(--text-muted)] hover:bg-[var(--surface-3)]"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl z-20 overflow-hidden py-1">
                    {(['in_progress', 'completed', 'pending'] as Task['status'][])
                      .filter((s) => s !== task.status)
                      .map((s) => (
                        <button
                          key={s}
                          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleStatusChange(s); }}
                          className="w-full text-left px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors capitalize"
                        >
                          Mark as {s.replace('_', ' ')}
                        </button>
                      ))}
                    <div className="border-t border-[var(--border)] my-0.5" />
                    <button
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(); }}
                      className="w-full text-left px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors"
                    >
                      Edit task
                    </button>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
                      className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/8 transition-colors"
                    >
                      Delete task
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className={cn(
              'font-semibold mb-1 line-clamp-2 text-[var(--text)]',
              compact ? 'text-sm' : 'text-base',
              task.status === 'completed' && 'line-through opacity-60'
            )}>
              {task.title}
            </h3>

            {/* Description */}
            {!compact && task.description && (
              <p className="text-sm mb-3 line-clamp-2 text-[var(--text-muted)]">{task.description}</p>
            )}

            {/* Tags */}
            {!compact && task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {task.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--surface-3)] text-[var(--text-muted)]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Progress */}
            {!compact && typeof task.progress === 'number' && task.progress > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--text-muted)]">Progress</span>
                  <span className="text-xs font-medium text-[var(--text)]">{task.progress}%</span>
                </div>
                <ProgressBar value={task.progress} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border)]">
            <div className="flex items-center gap-3">
              <span className={cn(
                'flex items-center gap-1 text-xs',
                overdue ? 'text-red-500' : dueSoon ? 'text-amber-500' : 'text-[var(--text-muted)]'
              )}>
                <Calendar className="h-3 w-3" />
                {formatDate(task.due_date, 'MMM d')}
              </span>

              {task.recurrence !== 'none' && (
                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Repeat className="h-3 w-3" />
                  {task.recurrence}
                </span>
              )}

              {task.dependencies && task.dependencies.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <Link2 className="h-3 w-3" />
                  {task.dependencies.length}
                </span>
              )}
            </div>

            {task.assigned_to && <Avatar name={assigneeName} size="xs" />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}