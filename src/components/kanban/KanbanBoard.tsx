/**
 * KanbanBoard.tsx
 * Jira-style drag-and-drop Kanban with WIP limits, column swimlanes.
 * Uses native HTML5 drag-and-drop (no extra library needed).
 */
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import type { Task, TaskStatus, KanbanColumn } from '../types';
import { cn, priorityLabel, statusLabel, formatDate, isOverdue } from '../utils';
import { Avatar, Badge } from '../ui';
import { useAppSelector, useAppDispatch } from '../../hooks/useAppRedux';
import { moveTask, moveTaskRemote } from '../store/slices/taskSlice';

// ─── Column config ────────────────────────────────────────────────────────────

const COLUMNS: { id: TaskStatus; title: string; color: string; accent: string; limit?: number }[] = [
  { id: 'pending',     title: 'To Do',       color: 'border-[var(--border)]',   accent: 'bg-[var(--surface-3)]', limit: undefined },
  { id: 'in_progress', title: 'In Progress', color: 'border-blue-500/40',       accent: 'bg-blue-500/10',        limit: 5 },
  { id: 'overdue',     title: 'Overdue',     color: 'border-red-500/40',        accent: 'bg-red-500/10',         limit: undefined },
  { id: 'completed',   title: 'Done',        color: 'border-emerald-500/40',    accent: 'bg-emerald-500/10',     limit: undefined },
];

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-red-500',
  high:   'bg-orange-500',
  medium: 'bg-brand-500',
  low:    'bg-emerald-500',
};

// ─── Mini task card (inside kanban cell) ──────────────────────────────────────

interface MiniCardProps {
  task: Task;
  onDetailOpen?: (task: Task) => void;
  isDragging: boolean;
}

function MiniCard({ task, onDetailOpen, isDragging }: MiniCardProps) {
  const { users } = useAppSelector((s) => s.auth);
  const assignee  = users?.find((u) => u.id === task.assigned_to);
  const overdue   = isOverdue(task.due_date) && task.status !== 'completed';

  return (
    <div
      className={cn(
        'relative bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all',
        'hover:border-brand-400/40 hover:shadow-md hover:shadow-brand-500/5',
        isDragging && 'opacity-50 scale-95 shadow-2xl',
        task.status === 'completed' && 'opacity-60'
      )}
      onClick={() => onDetailOpen?.(task)}
    >
      {/* Priority left edge */}
      <div className={cn('absolute left-0 top-2 bottom-2 w-0.5 rounded-full', PRIORITY_DOT[task.priority])} />

      <div className="pl-2">
        {/* Tags row */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1 mb-1.5 flex-wrap">
            {task.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-px rounded-full bg-brand-500/10 text-brand-400 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <p className={cn(
          'text-sm font-medium leading-snug mb-2 line-clamp-2',
          task.status === 'completed' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text)]'
        )}>
          {task.title}
        </p>

        {/* Progress */}
        {typeof task.progress === 'number' && task.progress > 0 && (
          <div className="h-1 rounded-full bg-[var(--surface-3)] overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        )}

        {/* Subtask progress */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="text-[9px] text-[var(--text-muted)] mb-2 flex items-center gap-1">
            <span>{task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}</span>
            <span>subtasks</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              'w-1.5 h-1.5 rounded-full shrink-0',
              PRIORITY_DOT[task.priority]
            )} />
            <span className={cn(
              'text-[10px]',
              overdue ? 'text-red-400 font-semibold' : 'text-[var(--text-muted)]'
            )}>
              {formatDate(task.due_date, 'MMM d')}
              {overdue && ' ⚠'}
            </span>
            {task.storyPoints && (
              <span className="text-[9px] font-bold bg-brand-500/10 text-brand-400 px-1 rounded">
                {task.storyPoints}
              </span>
            )}
          </div>

          {task.assigned_to && assignee && (
            <Avatar name={assignee.name} size="xs" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Kanban column ────────────────────────────────────────────────────────────

interface ColumnProps {
  column: typeof COLUMNS[number];
  tasks: Task[];
  onDetailOpen?: (task: Task) => void;
  onNewTask?: (status: TaskStatus) => void;
  dragOverColumn: TaskStatus | null;
  draggingId: string | null;
  onDragStart: (taskId: string) => void;
  onDragOver: (e: React.DragEvent, colId: TaskStatus) => void;
  onDrop: (e: React.DragEvent, colId: TaskStatus) => void;
  onDragEnd: () => void;
}

function Column({
  column, tasks, onDetailOpen, onNewTask,
  dragOverColumn, draggingId,
  onDragStart, onDragOver, onDrop, onDragEnd,
}: ColumnProps) {
  const [collapsed, setCollapsed] = useState(false);
  const isOver    = dragOverColumn === column.id;
  const isOverWip = column.limit !== undefined && tasks.length >= column.limit;

  return (
    <div
      className="flex min-w-[280px] flex-1 flex-col xl:min-w-0"
      onDragOver={(e) => onDragOver(e, column.id)}
      onDrop={(e) => onDrop(e, column.id)}
    >
      {/* Column header */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2.5 rounded-t-2xl border border-b-0 transition-colors',
        column.color,
        isOver ? 'bg-brand-500/5' : 'bg-[var(--surface-2)]'
      )}>
        <div className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold', column.accent)}>
          {tasks.length}
          {column.limit && (
            <span className={cn('ml-1', isOverWip ? 'text-red-400' : 'opacity-60')}>
              / {column.limit}
            </span>
          )}
        </div>

        <span className="text-sm font-semibold text-[var(--text)] flex-1">{column.title}</span>

        {isOverWip && (
          <div title="WIP limit reached">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
          </div>
        )}

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Drop zone body */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'flex-1 flex flex-col gap-2 p-2 rounded-b-2xl border border-t-0 min-h-[120px] transition-all',
              column.color,
              isOver ? 'bg-brand-500/5' : 'bg-[var(--surface-2)]'
            )}
          >
            {tasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => onDragStart(task.id)}
                onDragEnd={onDragEnd}
              >
                <MiniCard
                  task={task}
                  onDetailOpen={onDetailOpen}
                  isDragging={draggingId === task.id}
                />
              </div>
            ))}

            {/* Drop placeholder */}
            {isOver && draggingId && (
              <div className="border-2 border-dashed border-brand-500/40 rounded-xl h-16 bg-brand-500/5 flex items-center justify-center">
                <span className="text-[10px] text-brand-400">Drop here</span>
              </div>
            )}

            {/* Empty state */}
            {tasks.length === 0 && !isOver && (
              <div className="flex-1 flex items-center justify-center opacity-30">
                <p className="text-xs text-[var(--text-muted)]">No tasks</p>
              </div>
            )}

            {/* Add task button */}
            <button
              onClick={() => onNewTask?.(column.id)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] transition-all text-xs w-full"
            >
              <Plus className="h-3.5 w-3.5" />
              Add task
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── KanbanBoard ──────────────────────────────────────────────────────────────

interface KanbanBoardProps {
  tasks: Task[];
  onDetailOpen?: (task: Task) => void;
  onNewTask?: (status: TaskStatus) => void;
}

export function KanbanBoard({ tasks, onDetailOpen, onNewTask }: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const [draggingId,    setDraggingId]    = useState<string | null>(null);
  const [dragOverCol,   setDragOverCol]   = useState<TaskStatus | null>(null);

  const handleDragStart = (taskId: string) => {
    setDraggingId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDrop = (e: React.DragEvent, colId: TaskStatus) => {
    e.preventDefault();
    if (!draggingId || draggingId === colId) return;

    // Optimistic update
    dispatch(moveTask({ taskId: draggingId, newStatus: colId }));
    // Persist remotely
    dispatch(moveTaskRemote({ taskId: draggingId, newStatus: colId }));

    setDraggingId(null);
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
  };

  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  return (
    <div className="kanban-scroll grid min-h-[600px] grid-cols-1 gap-4 overflow-x-auto pb-4 md:grid-cols-2 2xl:grid-cols-4">
      {COLUMNS.map((col) => (
        <Column
          key={col.id}
          column={col}
          tasks={byStatus(col.id)}
          onDetailOpen={onDetailOpen}
          onNewTask={onNewTask}
          dragOverColumn={dragOverCol}
          draggingId={draggingId}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  );
}
