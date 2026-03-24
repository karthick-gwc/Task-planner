import React, { useEffect, useState } from 'react';
import { Plus, ArrowRight, Flame, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
import { DashboardStats } from '../components/dashboard/Charts';
import { ProductivityScore } from '../components/dashboard/ProductivityScore';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { Skeleton } from '../components/ui';
import type { Task } from '@/components/types';
import toast from 'react-hot-toast';
import { formatRelative } from '../components/utils';
import { deleteTask, fetchTasks, fetchMyTasks, updateTask } from '@/components/store/slices/taskSlice';

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { tasks, isLoading } = useAppSelector((s) => s.tasks);
  const { user } = useAppSelector((s) => s.auth);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  useEffect(() => {
    if (user?.role === 'employee') dispatch(fetchMyTasks(user.id));
    else dispatch(fetchTasks());
  }, [dispatch, user?.id, user?.role]);

  const recentTasks  = tasks.slice(0, 5);
  const urgentTasks  = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed').slice(0, 3);
  const overdueTasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed');
  const activeTasks  = tasks.filter((t) => t.status !== 'completed').length;

  const handleEdit         = (task: Task) => { setEditTask(task); setFormOpen(true); };
  const handleDelete       = (id: string) => { dispatch(deleteTask(id)); toast.success('Task deleted'); };
  const handleStatusChange = (id: string, status: Task['status']) => {
    dispatch(updateTask({ id, updates: { status } }));
    toast.success(`Marked as ${status.replace('_', ' ')}`);
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto w-full">

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 sm:p-7 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 shadow-[0_4px_24px_rgba(86,85,234,0.28)]"
      >
        {/* Decorative circles */}
        <div className="absolute -top-5 -right-5 w-44 h-44 rounded-full bg-white/7 pointer-events-none" />
        <div className="absolute -bottom-8 right-20 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-brand-200 text-sm mb-1">
              {greeting()}, <strong className="text-white">{user?.name} 👋</strong>
            </p>
            <h1 className="text-white text-xl sm:text-2xl font-bold font-display leading-snug">
              {activeTasks > 0
                ? `You have ${activeTasks} active task${activeTasks !== 1 ? 's' : ''}`
                : 'All tasks complete!'}
            </h1>
            {overdueTasks.length > 0 && (
              <p className="text-red-300 text-xs mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 inline-block" />
                {overdueTasks.length} task{overdueTasks.length !== 1 ? 's are' : ' is'} overdue
              </p>
            )}
          </div>
          <button
            onClick={() => { setEditTask(null); setFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/25 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold cursor-pointer transition-all duration-200 shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      {isLoading
        ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        : <DashboardStats />
      }

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">

        {/* Recent Tasks */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[var(--text)] font-semibold text-sm font-display">Recent Tasks</h2>
            <Link to="/tasks" className="text-brand-400 text-xs flex items-center gap-1 no-underline hover:text-brand-300 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
            : recentTasks.length > 0
              ? recentTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} compact />
                ))
              : (
                <div className="rounded-2xl border border-[var(--border)] p-10 text-center bg-[var(--surface-2)]">
                  <CheckCircle2 className="w-9 h-9 mx-auto mb-3 opacity-20 text-[var(--text-muted)]" />
                  <p className="text-[var(--text)] text-sm font-medium">No tasks yet</p>
                  <p className="text-[var(--text-muted)] text-xs mt-1">Create your first task to get started</p>
                </div>
              )
          }
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <ProductivityScore />

          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--surface-2)]">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-red-500/12 flex items-center justify-center shrink-0">
                  <span className="text-red-500 text-[0.65rem] font-bold">!</span>
                </span>
                <span className="text-[var(--text)] font-semibold text-sm">Overdue</span>
                <span className="ml-auto bg-red-500/10 text-red-400 text-[0.7rem] font-bold px-2 py-0.5 rounded-full">
                  {overdueTasks.length}
                </span>
              </div>
              {overdueTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex gap-2 px-2.5 py-2 rounded-xl bg-red-500/5 border border-red-500/12 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-[var(--text)] text-xs font-medium">{task.title}</p>
                    <p className="text-red-400 text-[0.7rem] mt-0.5">{formatRelative(task.due_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Urgent */}
          {urgentTasks.length > 0 && (
            <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--surface-2)]">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                <span className="text-[var(--text)] font-semibold text-sm">Urgent</span>
              </div>
              {urgentTasks.map((task) => (
                <div key={task.id} className="flex gap-2 px-2.5 py-2 rounded-xl bg-orange-500/5 border border-orange-500/12 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-[var(--text)] text-xs font-medium">{task.title}</p>
                    <p className="text-[var(--text-muted)] text-[0.7rem] mt-0.5">{formatRelative(task.due_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <TaskForm isOpen={formOpen} onClose={() => { setFormOpen(false); setEditTask(null); }} task={editTask} />
    </div>
  );
}