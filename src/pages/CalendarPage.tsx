import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { CalendarView } from '../components/calendar/CalendarView';
import { TaskForm } from '../components/tasks/TaskForm';
import { Button } from '../components/ui/Button';
import { Task } from '../components/types';

export function CalendarPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => { setEditTask(task); setFormOpen(true); };

  return (
    <div className="flex flex-col h-full gap-4 animate-fade-in">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--text)]">Calendar</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">View and manage your tasks by date</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditTask(null); setFormOpen(true); }}>
          New Task
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <CalendarView onTaskClick={handleTaskClick} />
      </div>

      <TaskForm isOpen={formOpen} onClose={() => { setFormOpen(false); setEditTask(null); }} task={editTask} />
    </div>
  );
}
