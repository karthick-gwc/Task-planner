import React, { useState } from 'react';
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  DragOverlay, closestCorners, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical } from 'lucide-react';
import { Task, TaskStatus } from   '../types';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { moveTask } from '../store/slices/taskSlice';
import { TaskCard } from '../tasks/TaskCard';
import { Button, EmptyState } from '../ui';
import { cn } from '../utils';
import toast from 'react-hot-toast';

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  color: string;
  dotColor: string;
}

const columns: ColumnConfig[] = [
  { id: 'pending', title: 'To Do', color: 'border-slate-300 dark:border-slate-700', dotColor: 'bg-slate-400' },
  { id: 'in_progress', title: 'In Progress', color: 'border-blue-400', dotColor: 'bg-blue-400' },
  { id: 'completed', title: 'Completed', color: 'border-emerald-400', dotColor: 'bg-emerald-400' },
  { id: 'overdue', title: 'Overdue', color: 'border-red-400', dotColor: 'bg-red-400' },
];

// ─── Sortable Task Item ────────────────────────────────────────────────────────

function SortableTaskItem({ task, onEdit, onDelete, onStatusChange }: {
  task: Task;
  onEdit?: (t: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/drag">
      <button
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-10 opacity-0 group-hover/drag:opacity-100 cursor-grab active:cursor-grabbing p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} compact />
    </div>
  );
}

// ─── Kanban Column ─────────────────────────────────────────────────────────────

function KanbanColumn({
  column, tasks, onEdit, onDelete, onStatusChange, onAddTask, isOver
}: {
  column: ColumnConfig;
  tasks: Task[];
  onEdit?: (t: Task) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
  onAddTask?: (status: TaskStatus) => void;
  isOver?: boolean;
}) {
  return (
    <div className={cn(
      'flex flex-col rounded-2xl border-2 bg-[var(--surface-2)] min-w-[280px] flex-1 transition-all duration-200',
      column.color,
      isOver && 'bg-brand-600/5 border-brand-500 shadow-glow-sm scale-[1.01]'
    )}>
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className={cn('h-2 w-2 rounded-full', column.dotColor)} />
          <h3 className="font-semibold text-sm text-[var(--text)]">{column.title}</h3>
          <span className="h-5 min-w-5 px-1 rounded-full bg-[var(--surface-3)] text-[var(--text-muted)] text-xs font-medium flex items-center justify-center">
            {tasks.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onAddTask?.(column.id)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto min-h-[200px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {tasks.map((task) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 border-2 border-dashed border-[var(--border)] rounded-xl text-xs text-[var(--text-muted)]">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Board ───────────────────────────────────────────────────────────────

interface KanbanBoardProps {
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onAddTask?: (status: TaskStatus) => void;
}

export function KanbanBoard({ onEdit, onDelete, onAddTask }: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector((s) => s.tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getColumnTasks = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  const handleDragStart = (e: DragStartEvent) => {
    const task = tasks.find((t) => t.id === e.active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (e: DragOverEvent) => {
    setOverId(e.over?.id as string || null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveTask(null);
    setOverId(null);
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column directly
    const targetColumn = columns.find((c) => c.id === overId);
    if (targetColumn) {
      dispatch(moveTask({ taskId, newStatus: targetColumn.id }));
      toast.success(`Moved to ${targetColumn.title}`);
      return;
    }

    // Dropped on another task — find which column that task is in
    const targetTask = tasks.find((t) => t.id === overId);
    if (targetTask && targetTask.status !== tasks.find((t) => t.id === taskId)?.status) {
      dispatch(moveTask({ taskId, newStatus: targetTask.status }));
      toast.success(`Moved to ${columns.find((c) => c.id === targetTask.status)?.title}`);
    }
  };

  const handleStatusChange = (id: string, status: Task['status']) => {
    dispatch(moveTask({ taskId: id, newStatus: status }));
    toast.success(`Task marked as ${status.replace('_', ' ')}`);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={getColumnTasks(col.id)}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={handleStatusChange}
            onAddTask={onAddTask}
            isOver={overId !== null && getColumnTasks(col.id).some((t) => t.id === overId || col.id === overId)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-2 scale-105 shadow-2xl">
            <TaskCard task={activeTask} compact />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
