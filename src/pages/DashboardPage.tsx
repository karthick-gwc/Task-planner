import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
// import { fetchStats } from '../store/slices/dashboardSlice';
// import { openModal } from '../store/slices/uiSlice';
import { DashboardStats, WeeklyChart, CategoryPieChart, PriorityBarChart } from '../components/dashboard/Charts';
import { ProductivityScore } from '../components/dashboard/ProductivityScore';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskForm } from '../components/tasks/TaskForm';
import { Button, Card, Skeleton } from '../components/ui';
import type { Task} from "@/components/types";
import toast from 'react-hot-toast';
import { formatRelative,isDueSoon,isOverdue } from '../components/utils';
import { deleteTask , fetchTasks,updateTask } from '@/components/store/slices/taskSlice';


export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { tasks, isLoading } = useAppSelector((s) => s.tasks);
  const { user } = useAppSelector((s) => s.auth);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  useEffect(() => { dispatch(fetchTasks()); }, [dispatch]);

  const recentTasks = tasks.slice(0, 5);
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed').slice(0, 3);
  const overdueTasks = tasks.filter((t) => t.status === 'overdue');

  const handleEdit = (task: Task) => { setEditTask(task); setFormOpen(true); };
  const handleDelete = (id: string) => { dispatch(deleteTask(id)); toast.success('Task deleted'); };
  const handleStatusChange = (id: string, status: Task['status']) => {
    dispatch(updateTask({ id, updates: { status } }));
    toast.success(`Task marked as ${status.replace('_', ' ')}`);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      {/* <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 p-6"
      > */}
        <div className="absolute top-0 right-0 h-full w-1/2 opacity-10">
          <div className="absolute top-4 right-8 h-24 w-24 rounded-full bg-white blur-xl" />
          <div className="absolute bottom-4 right-24 h-16 w-16 rounded-full bg-white blur-lg" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-brand-200 text-sm font-medium">{greeting()},</p>
            <h1 className="text-2xl font-bold font-display text-white mt-1">{user?.name} 👋</h1>
            <p className="text-brand-200 text-sm mt-1">
              You have <span className="text-white font-semibold">{tasks.filter((t) => t.status !== 'completed').length} active tasks</span>
              {overdueTasks.length > 0 && <span className="text-red-300"> · {overdueTasks.length} overdue</span>}
            </p>
          </div>
          <Button
            variant="secondary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => { setEditTask(null); setFormOpen(true); }}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 border"
          >
            New Task
          </Button>
        </div>
      {/* </motion.div> */}

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : ( 
        <DashboardStats/>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text)] font-display">Recent Tasks</h2>
            <Link to="/tasks" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
              : recentTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  compact
                />
              ))
            }
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <ProductivityScore />

          {/* Urgent tasks */}
          {urgentTasks.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-4 w-4 text-red-500" />
                <h3 className="font-semibold text-sm text-[var(--text)]">Urgent Attention</h3>
              </div>
              <div className="space-y-2">
                {urgentTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-2 p-2 rounded-xl bg-red-500/5 border border-red-500/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text)] line-clamp-1">{task.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{formatRelative(task.due_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Charts row
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyChart />
        </div>
        <CategoryPieChart />
      </div>

      <PriorityBarChart /> */}

      {/* Task Form Modal */}
      <TaskForm isOpen={formOpen} onClose={() => { setFormOpen(false); setEditTask(null); }} task={editTask} />
    </div>
  );
}

// import React from 'react'

// const DashboardPage = () => {
    
//   return (<>
//     <div>DashboardPage</div>

//     </>
//   )
// }

// export default DashboardPage