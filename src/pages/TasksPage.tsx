import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, LayoutGrid, List, CheckSquare } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
import { deleteTask, updateTask } from '../components/store/slices/taskSlice';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskForm } from '../components/tasks/TaskForm';
import { Skeleton } from '../components/ui';
import type { Task } from '../components/types';
import toast from 'react-hot-toast';

type ViewMode = 'grid' | 'list';

export function TasksPage() {
  const dispatch = useAppDispatch();
  const { filteredTasks, isLoading } = useAppSelector((s) => s.tasks);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleEdit         = (task: Task) => { setEditTask(task); setFormOpen(true); };
  const handleDelete       = (id: string)  => { dispatch(deleteTask(id)); toast.success('Task deleted'); };
  const handleStatusChange = (id: string, status: Task['status']) => {
    dispatch(updateTask({ id, updates: { status } }));
    toast.success(`Marked as ${status.replace('_', ' ')}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: 'var(--text)', fontWeight: 700, fontSize: 'clamp(1.3rem,2.5vw,1.6rem)', fontFamily: 'Sora,sans-serif', margin: 0 }}>
            My Tasks
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {(['grid', 'list'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  width: 36, height: 36,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: viewMode === mode ? '#5655ea' : 'var(--surface-3)',
                  color: viewMode === mode ? '#fff' : 'var(--text-muted)',
                  border: 'none', cursor: 'pointer', transition: 'background 0.15s',
                }}
              >
                {mode === 'grid' ? <LayoutGrid style={{ width: 15, height: 15 }} /> : <List style={{ width: 15, height: 15 }} />}
              </button>
            ))}
          </div>

          {/* New Task button */}
          <button
            onClick={() => { setEditTask(null); setFormOpen(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 18px', borderRadius: 12, border: 'none',
              background: '#5655ea', color: '#fff', fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', transition: 'background 0.2s, box-shadow 0.2s',
              boxShadow: '0 3px 12px rgba(86,85,234,0.3)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#4a44d0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#5655ea'; }}
          >
            <Plus style={{ width: 15, height: 15 }} />
            New Task
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <TaskFilters />

      {/* ── Task Grid / List ── */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill,minmax(280px,1fr))' : '1fr', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '80px 20px', textAlign: 'center',
          border: '2px dashed var(--border)', borderRadius: 20,
        }}>
          <CheckSquare style={{ width: 48, height: 48, color: 'var(--text-muted)', opacity: 0.25, marginBottom: 16 }} />
          <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '1rem', marginBottom: 6 }}>No tasks found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
            Try adjusting your filters or create a new task
          </p>
          <button
            onClick={() => { setEditTask(null); setFormOpen(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px',
              borderRadius: 12, border: 'none', background: '#5655ea', color: '#fff',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus style={{ width: 15, height: 15 }} /> Create Task
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill,minmax(280px,1fr))' : '1fr',
              gap: 16,
            }}
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