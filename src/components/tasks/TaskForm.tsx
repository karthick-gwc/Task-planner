import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui';
import { Input, Select, Textarea } from '../ui/Input';
import type { Task, CreateTaskDto, TaskPriority, TaskStatus, TaskCategory, RecurrenceType } from '../types';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import toast from 'react-hot-toast';
import { createTask, updateTask } from '../store/slices/taskSlice';
import { MOCK_USERS } from '../utils';



interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
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
};

export function TaskForm({ isOpen, onClose, task }: TaskFormProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
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
      });
    } else {
      setForm(defaultForm);
    }
    setErrors({});
  }, [task, isOpen]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.due_date) e.due_date = 'Due date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (task) {
        await dispatch(updateTask({ id: task.id, updates: form })).unwrap();
        toast.success('Task updated successfully!');
      } else {
        await dispatch(createTask({ ...form, created_by: user?.id || 'u1' })).unwrap();
        toast.success('Task created successfully!');
      }
      onClose();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags?.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...(f.tags || []), tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm((f) => ({ ...f, tags: (f.tags || []).filter((t) => t !== tag) }));
  };

  const set = (key: keyof CreateTaskDto, val: any) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? 'Edit Task' : 'Create New Task'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title *"
          placeholder="What needs to be done?"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          error={errors.title}
        />

        <Textarea
          label="Description"
          placeholder="Add details, context, or notes..."
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            value={form.priority}
            onChange={(e) => set('priority', e.target.value as TaskPriority)}
            options={[
              { value: 'urgent', label: '🔴 Urgent' },
              { value: 'high', label: '🟠 High' },
              { value: 'medium', label: '🟡 Medium' },
              { value: 'low', label: '🟢 Low' },
            ]}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => set('status', e.target.value as TaskStatus)}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => set('category', e.target.value as TaskCategory)}
            options={[
              { value: 'work', label: '💼 Work' },
              { value: 'personal', label: '🏠 Personal' },
              { value: 'study', label: '📚 Study' },
              { value: 'other', label: '📌 Other' },
            ]}
          />
          <Select
            label="Recurrence"
            value={form.recurrence}
            onChange={(e) => set('recurrence', e.target.value as RecurrenceType)}
            options={[
              { value: 'none', label: 'No recurrence' },
              { value: 'daily', label: '🔁 Daily' },
              { value: 'weekly', label: '📅 Weekly' },
              { value: 'monthly', label: '🗓️ Monthly' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
              ...MOCK_USERS.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
        </div>

        {/* Dependencies */}
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
              .filter((t) => t.id !== task?.id)
              .map((t) => ({ value: t.id, label: t.title })),
          ]}
        />
        {form.dependencies && form.dependencies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {form.dependencies.map((depId) => {
              const dep = tasks.find((t) => t.id === depId);
              return dep ? (
                <span key={depId} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-[var(--surface-3)] text-[var(--text-muted)]">
                  {dep.title}
                  <button type="button" onClick={() => set('dependencies', form.dependencies?.filter((d) => d !== depId))} className="hover:text-red-500">×</button>
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text)]">Tags</label>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              placeholder="Add a tag and press Enter"
              className="flex-1 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm px-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
            <Button type="button" variant="secondary" size="md" onClick={addTag}>Add</Button>
          </div>
          {form.tags && form.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {form.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-brand-600/10 text-brand-400 border border-brand-600/20">
                  #{tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400 ml-0.5">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)]">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
