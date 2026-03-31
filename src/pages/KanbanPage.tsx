import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
import { fetchMyTasks, fetchTasks } from '../components/store/slices/taskSlice';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { TaskForm } from '../components/tasks/TaskForm';
import { Button } from '../components/ui';
import { Task, TaskStatus } from '../components/types';

export function KanbanPage() {
  const dispatch = useAppDispatch();
  const { filteredTasks } = useAppSelector((s) => s.tasks);
  const { user } = useAppSelector((s) => s.auth);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('pending');

  useEffect(() => {
    if (user?.role === 'employee') dispatch(fetchMyTasks(user.id));
    else dispatch(fetchTasks());
  }, [dispatch, user?.id, user?.role]);

  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status);
    setEditTask(null);
    setFormOpen(true);
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col gap-4 animate-fade-in">
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
        <KanbanBoard tasks={filteredTasks} onNewTask={handleAddTask} />
      </div>

      <TaskForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditTask(null); }}
        task={editTask}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}
