import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, LayoutGrid, List, CheckSquare } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
import { deleteTask, updateTask, fetchTasks, fetchMyTasks } from '../components/store/slices/taskSlice';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskForm } from '../components/tasks/TaskForm';
import { Skeleton } from '../components/ui';
import type { Task } from '../components/types';
import toast from 'react-hot-toast';
import { cn } from '../components/utils';

type ViewMode = 'grid' | 'list';

export function TasksPage() {
  const dispatch = useAppDispatch();
  const { filteredTasks, isLoading } = useAppSelector((s) => s.tasks);
  const { user } = useAppSelector((s) => s.auth);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  useEffect(() => {
    if (user?.role === 'employee') dispatch(fetchMyTasks(user.id));
    else dispatch(fetchTasks());
  }, [dispatch, user?.id, user?.role]);

  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleEdit         = (task: Task) => { setEditTask(task); setFormOpen(true); };
  const handleDelete       = (id: string) => { dispatch(deleteTask(id)); toast.success('Task deleted'); };
  const handleStatusChange = (id: string, status: Task['status']) => {
    dispatch(updateTask({ id, updates: { status } }));
    toast.success(`Marked as ${status.replace('_', ' ')}`);
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1200px] mx-auto w-full">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1  className="text-[var(--text)]  font-bold text-2xl sm:text-[1.6rem] font-display m-0">
            My Tasks
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View toggle */}
          <div className="flex border border-[var(--border)] rounded-xl overflow-hidden">
            {(['grid', 'list'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'w-9 h-9 flex items-center justify-center border-none cursor-pointer transition-colors',
                  viewMode === mode
                    ? 'bg-brand-600 text-white'
                    : 'bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text)]'
                )}
              >
                {mode === 'grid'
                  ? <LayoutGrid className="w-[15px] h-[15px]" />
                  : <List className="w-[15px] h-[15px]" />
                }
              </button>
            ))}
          </div>

          {/* New Task */}
          <button
            onClick={() => { setEditTask(null); setFormOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-none bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold cursor-pointer transition-all shadow-[0_3px_12px_rgba(86,85,234,0.3)] active:scale-95"
          >
            <Plus className="w-[15px] h-[15px]" />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <TaskFilters />

      {/* ── Task Grid / List ── */}
      {isLoading ? (
        <div className={cn(
          'grid gap-4',
          viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        )}>
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-[var(--border)] rounded-2xl">
          <CheckSquare className="w-12 h-12 text-[var(--text-muted)] opacity-25 mb-4" />
          <p className="text-[var(--text)] font-semibold text-base mb-1.5">No tasks found</p>
          <p className="text-[var(--text-muted)] text-sm mb-5">
            Try adjusting your filters or create a new task
          </p>
          <button
            onClick={() => { setEditTask(null); setFormOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-none bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold cursor-pointer transition-all"
          >
            <Plus className="w-[15px] h-[15px]" /> Create Task
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className={cn(
              'grid gap-4',
              viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
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