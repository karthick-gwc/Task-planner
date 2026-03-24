import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { CalendarView } from '../components/calendar/CalendarView';
import { TaskForm } from '../components/tasks/TaskForm';
import { Task } from '../components/types';

export function CalendarPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => {
    setEditTask(task);
    setFormOpen(true);
  };

  return (
    // <div className="flex flex-col h-full w-full gap-4 md:gap-6">
    <div className="flex-1 overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

        {/* Title */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Calendar
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            View and manage your tasks by date
          </p>
        </div>

        {/* Button */}
        <button
          onClick={() => {
            setEditTask(null);
            setFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md transition w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <CalendarView onTaskClick={handleTaskClick} />
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditTask(null);
        }}
        task={editTask}
      />
    </div>
  );
}