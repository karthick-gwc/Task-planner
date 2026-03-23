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

const S: React.CSSProperties = { color: 'var(--text)' };
const SM: React.CSSProperties = { color: 'var(--text-muted)' };
const SB: React.CSSProperties = { borderColor: 'var(--border)' };

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { tasks, isLoading } = useAppSelector((s) => s.tasks);
  const { user } = useAppSelector((s) => s.auth);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  useEffect(() => {
    if (user?.role === 'employee') {
      dispatch(fetchMyTasks(user.id));
    } else {
      dispatch(fetchTasks());
    }
  }, [dispatch, user?.id, user?.role]);

  const recentTasks  = tasks.slice(0, 5);
  const urgentTasks  = tasks.filter((t) => t.priority === 'urgent' && t.status !== 'completed').slice(0, 3);
  const overdueTasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed');
  const activeTasks  = tasks.filter((t) => t.status !== 'completed').length;

  const handleEdit         = (task: Task) => { setEditTask(task); setFormOpen(true); };
  const handleDelete       = (id: string)  => { dispatch(deleteTask(id)); toast.success('Task deleted'); };
  const handleStatusChange = (id: string, status: Task['status']) => {
    dispatch(updateTask({ id, updates: { status } }));
    toast.success(`Marked as ${status.replace('_', ' ')}`);
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 20, padding: '24px 28px',
          background: 'linear-gradient(135deg, #4a44d0 0%, #5655ea 55%, #6370f5 100%)',
          boxShadow: '0 4px 24px rgba(86,85,234,0.28)',
        }}
      >
        <div style={{ position: 'absolute', top: -20, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 80, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ color: '#c7d7fe', fontSize: '0.85rem', marginBottom: 4 }}>
              {greeting()}, <strong style={{ color: '#fff' }}>{user?.name} 👋</strong>
            </p>
            <h1 style={{ color: '#fff', fontSize: 'clamp(1.2rem,2.5vw,1.6rem)', fontWeight: 700, fontFamily: 'Sora,sans-serif', lineHeight: 1.3 }}>
              {activeTasks > 0 ? `You have ${activeTasks} active task${activeTasks !== 1 ? 's' : ''}` : 'All tasks complete!'}
            </h1>
            {overdueTasks.length > 0 && (
              <p style={{ color: '#fca5a5', fontSize: '0.8rem', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', display: 'inline-block', flexShrink: 0 }} />
                {overdueTasks.length} task{overdueTasks.length !== 1 ? 's are' : ' is'} overdue
              </p>
            )}
          </div>
          <button
            onClick={() => { setEditTask(null); setFormOpen(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 12, color: '#fff', fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            <Plus style={{ width: 16, height: 16 }} />
            New Task
          </button>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      {isLoading
        ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 16 }}>
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        : <DashboardStats />
      }

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 24 }}
           className="lg-grid-cols-3 flex flex-col lg:grid">
        {/* Recent Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ ...S, fontWeight: 600, fontSize: '0.9rem', fontFamily: 'Sora,sans-serif' }}>Recent Tasks</h2>
            <Link to="/tasks" style={{ color: '#8196fa', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              View all <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
            : recentTasks.length > 0
              ? recentTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} compact />
                ))
              : (
                <div style={{ borderRadius: 16, border: '1px solid var(--border)', padding: '40px 20px', textAlign: 'center', background: 'var(--surface-2)' }}>
                  <CheckCircle2 style={{ width: 36, height: 36, margin: '0 auto 12px', opacity: 0.2, color: 'var(--text-muted)' }} />
                  <p style={{ ...S, fontSize: '0.875rem', fontWeight: 500 }}>No tasks yet</p>
                  <p style={{ ...SM, fontSize: '0.78rem', marginTop: 4 }}>Create your first task to get started</p>
                </div>
              )
          }
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ProductivityScore />

          {overdueTasks.length > 0 && (
            <div style={{ borderRadius: 16, border: '1px solid var(--border)', padding: 16, background: 'var(--surface-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#ef4444', fontSize: '0.65rem', fontWeight: 700 }}>!</span>
                </span>
                <span style={{ ...S, fontWeight: 600, fontSize: '0.85rem' }}>Overdue</span>
                <span style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>{overdueTasks.length}</span>
              </div>
              {overdueTasks.slice(0, 3).map((task) => (
                <div key={task.id} style={{ display: 'flex', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)', marginBottom: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <p style={{ ...S, fontSize: '0.78rem', fontWeight: 500 }}>{task.title}</p>
                    <p style={{ color: '#f87171', fontSize: '0.7rem', marginTop: 2 }}>{formatRelative(task.due_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {urgentTasks.length > 0 && (
            <div style={{ borderRadius: 16, border: '1px solid var(--border)', padding: 16, background: 'var(--surface-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Flame style={{ width: 16, height: 16, color: '#f97316', flexShrink: 0 }} />
                <span style={{ ...S, fontWeight: 600, fontSize: '0.85rem' }}>Urgent</span>
              </div>
              {urgentTasks.map((task) => (
                <div key={task.id} style={{ display: 'flex', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.12)', marginBottom: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <p style={{ ...S, fontSize: '0.78rem', fontWeight: 500 }}>{task.title}</p>
                    <p style={{ ...SM, fontSize: '0.7rem', marginTop: 2 }}>{formatRelative(task.due_date)}</p>
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