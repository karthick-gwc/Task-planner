import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutGrid, List, CheckSquare } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
import { deleteTask, updateTask } from '../components/store/slices/taskSlice';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskForm } from '../components/tasks/TaskForm';
import { Button, EmptyState, Skeleton } from '../components/ui';
import type { Task } from '../components/types';
import toast from 'react-hot-toast';
import { cn } from '../components/utils';

type ViewMode = 'grid' | 'list';

export function TasksPage() {
  const dispatch = useAppDispatch();
  const { filteredTasks, isLoading } = useAppSelector((s) => s.tasks);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleEdit = (task: Task) => { setEditTask(task); setFormOpen(true); };
  const handleDelete = (id: string) => { dispatch(deleteTask(id)); toast.success('Task deleted'); };
  const handleStatusChange = (id: string, status: Task['status']) => {
    dispatch(updateTask({ id, updates: { status } }));
    toast.success(`Marked as ${status.replace('_', ' ')}`);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--text)]">My Tasks</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{filteredTasks.length} tasks found</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border border-[var(--border)] rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('h-9 w-9 flex items-center justify-center transition-colors',
                viewMode === 'grid' ? 'bg-brand-600 text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-3)]'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('h-9 w-9 flex items-center justify-center transition-colors',
                viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-3)]'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditTask(null); setFormOpen(true); }}>
            New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <TaskFilters />

      {/* Task Grid / List */}
      {isLoading ? (
        <div className={cn('gap-4', viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'flex flex-col')}>
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-16 w-16" />}
          title="No tasks found"
          description="Try adjusting your filters or create a new task to get started."
          action={
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditTask(null); setFormOpen(true); }}>
              Create Task
            </Button>
          }
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className={cn(
              'gap-4',
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                : 'flex flex-col'
            )}
          >
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                compact={viewMode === 'list'}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <TaskForm isOpen={formOpen} onClose={() => { setFormOpen(false); setEditTask(null); }} task={editTask} />
    </div>
  );
}
