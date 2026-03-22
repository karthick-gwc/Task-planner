import React from 'react';
import { Filter, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { setFilters, clearFilters } from '../store/slices/taskSlice';
import type { TaskStatus, TaskPriority, TaskCategory } from '../types';
import { Button } from '../ui';
import { cn } from '../utils';


const statusOptions: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
];

const priorityOptions: { value: TaskPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'All Priority' },
  { value: 'urgent', label: '🔴 Urgent' },
  { value: 'high', label: '🟠 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low', label: '🟢 Low' },
];

const categoryOptions: { value: TaskCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'work', label: '💼 Work' },
  { value: 'personal', label: '🏠 Personal' },
  { value: 'study', label: '📚 Study' },
  { value: 'other', label: '📌 Other' },
];

export function TaskFilters() {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((s) => s.tasks);
  const hasActiveFilters =
    filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
        <Filter className="h-4 w-4" />
        <span>Filter:</span>
      </div>

      {/* Status */}
      <div className="flex gap-1">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => dispatch(setFilters({ status: opt.value }))}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150',
              filters.status === opt.value
                ? 'bg-brand-600 text-white shadow-glow-sm'
                : 'bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-[var(--border)]" />

      {/* Priority */}
      <select
        value={filters.priority || 'all'}
        onChange={(e) => dispatch(setFilters({ priority: e.target.value as TaskPriority | 'all' }))}
        className="h-8 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text)] text-xs outline-none focus:border-brand-500 cursor-pointer"
      >
        {priorityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {/* Category */}
      <select
        value={filters.category || 'all'}
        onChange={(e) => dispatch(setFilters({ category: e.target.value as TaskCategory | 'all' }))}
        className="h-8 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text)] text-xs outline-none focus:border-brand-500 cursor-pointer"
      >
        {categoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<X className="h-3.5 w-3.5" />}
          onClick={() => dispatch(clearFilters())}
          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
        >
          Clear
        </Button>
      )}
    </div>
  );
}
