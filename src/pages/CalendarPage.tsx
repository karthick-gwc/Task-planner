import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { CalendarView } from '../components/calendar/CalendarView';
import { TaskForm } from '../components/tasks/TaskForm';
import { Task } from '../components/types';

export function CalendarPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => { setEditTask(task); setFormOpen(true); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', flexShrink: 0 }}>
        <div>
          <h1 style={{ color: 'var(--text)', fontWeight: 700, fontSize: 'clamp(1.3rem,2.5vw,1.6rem)', fontFamily: 'Sora,sans-serif', margin: 0 }}>
            Calendar
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 5 }}>
            View and manage your tasks by date
          </p>
        </div>
        <button
          onClick={() => { setEditTask(null); setFormOpen(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px',
            borderRadius: 12, border: 'none', background: '#5655ea', color: '#fff',
            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0,
            boxShadow: '0 3px 12px rgba(86,85,234,0.3)', transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#4a44d0')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#5655ea')}
        >
          <Plus style={{ width: 15, height: 15 }} />
          New Task
        </button>
      </div>

      {/* Calendar */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <CalendarView onTaskClick={handleTaskClick} />
      </div>

      <TaskForm isOpen={formOpen} onClose={() => { setFormOpen(false); setEditTask(null); }} task={editTask} />
    </div>
  );
}