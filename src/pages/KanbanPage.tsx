import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppDispatch } from '../hooks/useAppRedux';
import { deleteTask, updateTask } from '../components/store/slices/taskSlice';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskForm } from '../components/tasks/TaskForm';
import { Button } from '../components/ui';
import { Task, TaskStatus } from '../components/types';
import toast from 'react-hot-toast';

export function KanbanPage() {
  const dispatch = useAppDispatch();
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('pending');

  const handleEdit = (task: Task) => { setEditTask(task); setFormOpen(true); };
  const handleDelete = (id: string) => { dispatch(deleteTask(id)); toast.success('Task deleted'); };
  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status);
    setEditTask(null);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col h-full gap-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--text)]">Kanban Board</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Drag & drop tasks to change their status</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditTask(null); setFormOpen(true); }}>
          New Task
        </Button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard onEdit={handleEdit} onDelete={handleDelete} onAddTask={handleAddTask} />
      </div>

      <TaskForm isOpen={formOpen} onClose={() => { setFormOpen(false); setEditTask(null); }} task={editTask} />
    </div>
  );
}