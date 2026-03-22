import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Paperclip, MessageSquare, MoreVertical, Repeat, Link2 } from 'lucide-react';
import type { Task } from '../types';
import { cn, formatDate, isOverdue, isDueSoon, priorityColors, statusColors, priorityLabel, statusLabel } from '../utils';
import { Badge, Avatar, ProgressBar, Card } from '../ui';
import { MOCK_USERS } from '../utils';
MOCK_USERS
interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
  compact?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, compact = false }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const assignee = MOCK_USERS.find((u) => u.id === task.assigned_to);
  const overdue = isOverdue(task.due_date) && task.status !== 'completed';
  const dueSoon = isDueSoon(task.due_date) && task.status !== 'completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'group relative hover:border-brand-500/40 hover:shadow-glow-sm transition-all duration-200',
          task.status === 'completed' && 'opacity-70',
          compact ? 'p-3' : 'p-4'
        )}
      >
        {/* Priority indicator bar */}
        <div className={cn(
          'absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full',
          task.priority === 'urgent' && 'bg-red-500',
          task.priority === 'high' && 'bg-orange-500',
          task.priority === 'medium' && 'bg-yellow-500',
          task.priority === 'low' && 'bg-green-500',
        )} />

        <div className="pl-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={task.priority}>{priorityLabel[task.priority]}</Badge>
              <Badge variant={task.status}>{statusLabel[task.status]}</Badge>
              <Badge variant={task.category} className="capitalize">{task.category}</Badge>
            </div>
            <div className="relative shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
                className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[var(--surface-3)] text-[var(--text-muted)] transition-all"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl z-10 overflow-hidden">
                  {['in_progress', 'completed', 'pending'].filter((s) => s !== task.status).map((s) => (
                    <button
                      key={s}
                      onClick={(e) => { e.stopPropagation(); onStatusChange?.(task.id, s as Task['status']); setMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors capitalize"
                    >
                      Mark as {s.replace('_', ' ')}
                    </button>
                  ))}
                  <div className="border-t border-[var(--border)]" />
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit?.(task); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors"
                  >
                    Edit task
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete?.(task.id); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    Delete task
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className={cn(
            'font-semibold text-[var(--text)] mb-1 line-clamp-2',
            compact ? 'text-sm' : 'text-base',
            task.status === 'completed' && 'line-through text-[var(--text-muted)]'
          )}>
            {task.title}
          </h3>

          {/* Description */}
          {!compact && task.description && (
            <p className="text-sm text-[var(--text-muted)] mb-3 line-clamp-2">{task.description}</p>
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
          {typeof task.progress === 'number' && task.progress > 0 && !compact && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--text-muted)]">Progress</span>
                <span className="text-xs font-medium text-[var(--text)]">{task.progress}%</span>
              </div>
              <ProgressBar value={task.progress} />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--border)]">
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
            {assignee && <Avatar name={assignee.name} size="xs" />}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
