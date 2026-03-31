import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Modal, Button } from '../ui';
import { Input, Select, Textarea } from '../ui/Input';
import type {
  CreateTaskDto,
  RecurrenceType,
  Task,
  TaskCategory,
  TaskPriority,
  TaskStatus,
} from '../types';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { createTask, updateTask } from '../store/slices/taskSlice';
import { fetchAllUsers } from '@/components/store/slices/authSlice';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultStatus?: TaskStatus;
}

const defaultForm: CreateTaskDto = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  category: 'work',
  due_date: new Date().toISOString().split('T')[0],
  assigned_to: '',
  recurrence: 'none',
  tags: [],
  dependencies: [],
  storyPoints: 0,
  estimatedHours: 0,
};

export function TaskForm({ isOpen, onClose, task, defaultStatus = 'pending' }: TaskFormProps) {
  const dispatch = useAppDispatch();
  const { user, users } = useAppSelector((s) => s.auth);
  const { tasks } = useAppSelector((s) => s.tasks);

  const [form, setForm] = useState<CreateTaskDto>(defaultForm);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        category: task.category,
        due_date: task.due_date.split('T')[0],
        assigned_to: task.assigned_to || '',
        recurrence: task.recurrence,
        tags: task.tags || [],
        dependencies: task.dependencies || [],
        storyPoints: task.storyPoints ?? 0,
        estimatedHours: task.estimatedHours ?? 0,
        sprintId: task.sprintId ?? '',
      });
    } else {
      setForm({
        ...defaultForm,
        status: defaultStatus,
      });
    }

    setTagInput('');
    setErrors({});
  }, [task, isOpen, defaultStatus]);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, users.length]);

  const employees = users.filter((u) => u.role === 'employee');
  const managers = users.filter((u) => u.role === 'manager');

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.title.trim()) nextErrors.title = 'Title is required';
    if (!form.due_date) nextErrors.due_date = 'Due date is required';
    if ((form.storyPoints ?? 0) < 0) nextErrors.storyPoints = 'Story points cannot be negative';
    if ((form.estimatedHours ?? 0) < 0) nextErrors.estimatedHours = 'Estimate cannot be negative';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const set = <K extends keyof CreateTaskDto>(key: K, value: CreateTaskDto[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !form.tags?.includes(tag)) {
      set('tags', [...(form.tags || []), tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    set('tags', (form.tags || []).filter((value) => value !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const normalizedForm = {
        ...form,
        storyPoints: Number(form.storyPoints) || 0,
        estimatedHours: Number(form.estimatedHours) || 0,
      };

      if (task) {
        await dispatch(updateTask({ id: task.id, updates: normalizedForm })).unwrap();
        toast.success('Task updated successfully');
      } else {
        await dispatch(
          createTask({
            ...normalizedForm,
            created_by: user?.id || 'system',
          })
        ).unwrap();
        toast.success('Task created successfully');
      }
      onClose();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-5">
          <div className="space-y-4">
            <Input
              label="Title *"
              placeholder="Ship billing export for enterprise customers"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              error={errors.title}
            />

            <Textarea
              label="Description"
              placeholder="Capture acceptance criteria, dependencies, and rollout notes..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={6}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Due Date *"
                type="date"
                value={form.due_date}
                onChange={(e) => set('due_date', e.target.value)}
                error={errors.due_date}
              />

              <Select
                label="Assign To"
                value={form.assigned_to || ''}
                onChange={(e) => set('assigned_to', e.target.value)}
                options={[
                  { value: '', label: 'Unassigned' },
                  ...employees.map((member) => ({
                    value: member.id,
                    label: `${member.name} (Employee)`,
                  })),
                  ...managers.map((member) => ({
                    value: member.id,
                    label: `${member.name} (Manager)`,
                  })),
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Story Points"
                type="number"
                min={0}
                value={String(form.storyPoints ?? 0)}
                onChange={(e) => set('storyPoints', Number(e.target.value))}
                error={errors.storyPoints}
              />
              <Input
                label="Estimate (hours)"
                type="number"
                min={0}
                step="0.5"
                value={String(form.estimatedHours ?? 0)}
                onChange={(e) => set('estimatedHours', Number(e.target.value))}
                error={errors.estimatedHours}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text)]">Labels</label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="frontend, blocker, customer-reported"
                  className="flex-1 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text)] outline-none focus:border-brand-500"
                />
                <Button type="button" variant="secondary" size="md" onClick={addTag}>
                  Add
                </Button>
              </div>

              {form.tags && form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="px-2.5 py-1 rounded-full border border-brand-500/20 bg-brand-500/10 text-xs text-brand-300"
                    >
                      #{tag} x
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-4">
            <h3 className="text-sm font-semibold text-[var(--text)]">Planning</h3>

            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => set('priority', e.target.value as TaskPriority)}
              options={[
                { value: 'urgent', label: 'Urgent' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />

            <Select
              label="Status"
              value={form.status}
              onChange={(e) => set('status', e.target.value as TaskStatus)}
              options={[
                { value: 'pending', label: 'To do' },
                { value: 'in_progress', label: 'In progress' },
                { value: 'completed', label: 'Done' },
              ]}
            />

            <Select
              label="Category"
              value={form.category}
              onChange={(e) => set('category', e.target.value as TaskCategory)}
              options={[
                { value: 'work', label: 'Work' },
                { value: 'personal', label: 'Personal' },
                { value: 'study', label: 'Study' },
                { value: 'other', label: 'Other' },
              ]}
            />

            <Select
              label="Recurrence"
              value={form.recurrence}
              onChange={(e) => set('recurrence', e.target.value as RecurrenceType)}
              options={[
                { value: 'none', label: 'No recurrence' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />

            <Select
              label="Depends on task"
              value=""
              onChange={(e) => {
                if (e.target.value && !form.dependencies?.includes(e.target.value)) {
                  set('dependencies', [...(form.dependencies || []), e.target.value]);
                }
              }}
              options={[
                { value: '', label: 'Select dependency...' },
                ...tasks
                  .filter((item) => item.id !== task?.id)
                  .map((item) => ({ value: item.id, label: item.title })),
              ]}
            />

            {form.dependencies && form.dependencies.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.dependencies.map((dependencyId) => {
                  const dependency = tasks.find((item) => item.id === dependencyId);
                  return dependency ? (
                    <button
                      key={dependencyId}
                      type="button"
                      onClick={() =>
                        set(
                          'dependencies',
                          (form.dependencies || []).filter((item) => item !== dependencyId)
                        )
                      }
                      className="px-2 py-1 rounded-lg bg-[var(--surface)] text-xs text-[var(--text-muted)] border border-[var(--border)]"
                    >
                      {dependency.title} x
                    </button>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
