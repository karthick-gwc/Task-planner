import React from 'react';
import { Filter, X, Users, Tags } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { clearFilters, setFilters } from '../store/slices/taskSlice';
import type { TaskCategory, TaskPriority, TaskStatus } from '../types';
import { cn } from '../utils';

const STATUS_OPTIONS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Done' },
  { value: 'overdue', label: 'Overdue' },
];

const PRIORITY_OPTIONS: { value: TaskPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'Any priority' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const CATEGORY_OPTIONS: { value: TaskCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Any category' },
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'study', label: 'Study' },
  { value: 'other', label: 'Other' },
];

const SELECT_CLASS =
  'h-9 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-xs outline-none focus:border-brand-500 cursor-pointer';

export function TaskFilters() {
  const dispatch = useAppDispatch();
  const { filters, tasks } = useAppSelector((s) => s.tasks);
  const { users } = useAppSelector((s) => s.auth);

  const availableTags = Array.from(
    new Set(tasks.flatMap((task) => task.tags ?? []))
  ).slice(0, 10);

  const assigneeOptions = [
    { value: '', label: 'Anyone' },
    ...users.map((user) => ({ value: user.id, label: user.name })),
  ];

  const hasActive =
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.category !== 'all' ||
    !!filters.assignee ||
    !!filters.tags?.length;

  const toggleTag = (tag: string) => {
    const current = new Set(filters.tags ?? []);
    if (current.has(tag)) current.delete(tag);
    else current.add(tag);

    dispatch(setFilters({ tags: Array.from(current) }));
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-medium">
          <Filter className="h-4 w-4" />
          <span>Refine backlog</span>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((option) => {
            const active = filters.status === option.value || (!filters.status && option.value === 'all');
            return (
              <button
                key={option.value}
                onClick={() => dispatch(setFilters({ status: option.value }))}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  active
                    ? 'bg-brand-600 text-white shadow-[0_8px_20px_rgba(86,85,234,0.28)]'
                    : 'bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]'
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <select
          value={filters.priority || 'all'}
          onChange={(e) => dispatch(setFilters({ priority: e.target.value as TaskPriority | 'all' }))}
          className={SELECT_CLASS}
        >
          {PRIORITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.category || 'all'}
          onChange={(e) => dispatch(setFilters({ category: e.target.value as TaskCategory | 'all' }))}
          className={SELECT_CLASS}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="relative">
          <Users className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          <select
            value={filters.assignee || ''}
            onChange={(e) => dispatch(setFilters({ assignee: e.target.value }))}
            className={cn(SELECT_CLASS, 'pl-9 min-w-[150px]')}
          >
            {assigneeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasActive && (
          <button
            onClick={() => dispatch(clearFilters())}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {availableTags.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
            <Tags className="h-3 w-3" />
            <span>Labels</span>
          </div>

          {availableTags.map((tag) => {
            const active = filters.tags?.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11px] border transition-all',
                  active
                    ? 'border-brand-500/40 bg-brand-500/12 text-brand-300'
                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]'
                )}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
