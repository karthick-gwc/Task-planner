import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus,
  LayoutGrid,
  List,
  Columns,
  CheckSquare,
  Trash2,
  ChevronDown,
  Sparkles,
  AlarmClock,
  Users,
  Target,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
import {
  deleteTask,
  deleteTasksBulk,
  fetchMyTasks,
  fetchTasks,
  updateTask,
} from '../components/store/slices/taskSlice';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskDetailModal } from '../components/tasks/TaskDetailModel';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { Pagination, Skeleton } from '../components/ui';
import type { Task } from '../components/types';
import { cn } from '../components/utils';

type ViewMode = 'grid' | 'list' | 'kanban';
type GroupBy = 'none' | 'priority' | 'category' | 'assignee';
type SortBy = 'recent' | 'due' | 'priority' | 'progress';
type FocusScope = 'all' | 'mine' | 'due_soon' | 'unassigned' | 'overdue';

const VIEW_BUTTONS: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'grid', icon: <LayoutGrid className="h-3.5 w-3.5" />, label: 'Grid' },
  { mode: 'list', icon: <List className="h-3.5 w-3.5" />, label: 'List' },
  { mode: 'kanban', icon: <Columns className="h-3.5 w-3.5" />, label: 'Board' },
];

export function TasksPage() {
  const dispatch = useAppDispatch();
  const { filteredTasks, tasks, isLoading } = useAppSelector((s) => s.tasks);
  const { user, users } = useAppSelector((s) => s.auth);

  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [focusScope, setFocusScope] = useState<FocusScope>('all');
  const [defaultStatus, setDefaultStatus] = useState<Task['status']>('pending');
  const [tasksPage, setTasksPage] = useState(1);
  const tasksPageSize = viewMode === 'list' ? 8 : 9;

  useEffect(() => {
    if (user?.role === 'employee') dispatch(fetchMyTasks(user.id));
    else dispatch(fetchTasks());
  }, [dispatch, user?.id, user?.role]);

  const completedCount = tasks.filter((task) => task.status === 'completed').length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const overdueCount = tasks.filter(
    (task) => task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  ).length;
  const myOpenCount = tasks.filter(
    (task) => task.assigned_to === user?.id && task.status !== 'completed'
  ).length;
  const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.storyPoints ?? 0), 0);

  const focusCounts = useMemo(
    () => ({
      all: filteredTasks.length,
      mine: filteredTasks.filter((task) => task.assigned_to === user?.id).length,
      due_soon: filteredTasks.filter((task) => {
        if (!task.due_date || task.status === 'completed') return false;
        const due = new Date(task.due_date).getTime();
        const now = Date.now();
        const diff = due - now;
        return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000;
      }).length,
      unassigned: filteredTasks.filter((task) => !task.assigned_to).length,
      overdue: filteredTasks.filter(
        (task) => task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
      ).length,
    }),
    [filteredTasks, user?.id]
  );

  const displayTasks = useMemo(() => {
    const scoped = filteredTasks.filter((task) => {
      switch (focusScope) {
        case 'mine':
          return task.assigned_to === user?.id;
        case 'due_soon': {
          if (!task.due_date || task.status === 'completed') return false;
          const due = new Date(task.due_date).getTime();
          const now = Date.now();
          const diff = due - now;
          return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000;
        }
        case 'unassigned':
          return !task.assigned_to;
        case 'overdue':
          return !!task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
        default:
          return true;
      }
    });

    return [...scoped].sort((left, right) => {
      const completionDelta = Number(left.status === 'completed') - Number(right.status === 'completed');
      if (completionDelta !== 0) return completionDelta;

      switch (sortBy) {
        case 'due':
          return new Date(left.due_date).getTime() - new Date(right.due_date).getTime();
        case 'priority': {
          const weights = { urgent: 0, high: 1, medium: 2, low: 3 };
          return weights[left.priority] - weights[right.priority];
        }
        case 'progress':
          return (right.progress ?? 0) - (left.progress ?? 0);
        default:
          return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
      }
    });
  }, [filteredTasks, focusScope, sortBy, user?.id]);

  useEffect(() => {
    setTasksPage(1);
  }, [focusScope, groupBy, sortBy, viewMode]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(displayTasks.length / tasksPageSize));
    if (tasksPage > maxPage) setTasksPage(maxPage);
  }, [displayTasks.length, tasksPage, tasksPageSize]);

  const paginatedTasks = useMemo(() => {
    if (focusScope !== 'all') return displayTasks;
    const startIndex = (tasksPage - 1) * tasksPageSize;
    return displayTasks.slice(startIndex, startIndex + tasksPageSize);
  }, [displayTasks, focusScope, tasksPage, tasksPageSize]);

  const grouped = useMemo(() => {
    if (groupBy === 'none') return [{ key: '', tasks: paginatedTasks }];

    const map = new Map<string, Task[]>();
    paginatedTasks.forEach((task) => {
      const key =
        groupBy === 'priority'
          ? task.priority
          : groupBy === 'category'
            ? task.category
            : users.find((member) => member.id === task.assigned_to)?.name ?? 'Unassigned';

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    });

    return [...map.entries()].map(([key, groupTasks]) => ({ key, tasks: groupTasks }));
  }, [groupBy, paginatedTasks, users]);

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteTask(id));
    toast.success('Task deleted');
  };

  const handleStatusChange = (id: string, status: Task['status']) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    dispatch(
      updateTask({
        id,
        updates: {
          status,
          ...(status === 'completed'
            ? { completedAt: new Date().toISOString(), progress: 100 }
            : {}),
        },
      })
    );

    toast.success(`Moved to ${status.replace('_', ' ')}`);
  };

  const handleBulkDelete = () => {
    dispatch(deleteTasksBulk([...selected]));
    toast.success(`${selected.size} tasks deleted`);
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openNewTask = (status: Task['status'] = 'pending') => {
    setDefaultStatus(status);
    setEditTask(null);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1440px] mx-auto w-full">
      <section className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(86,85,234,0.16),rgba(86,85,234,0.04)_45%,transparent_100%)] p-5 sm:p-6">
        <div className="absolute -top-12 right-0 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />

        <div className="relative flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-300">
                <Sparkles className="h-3 w-3" />
                Delivery workspace
              </div>
              <h1 className="mt-3 text-2xl sm:text-[2rem] font-bold font-display text-[var(--text)]">
                Jira-style task planning, without the clutter
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-[var(--text-muted)]">
                Triage work, track execution, and keep the team aligned with backlog views,
                board flow, story points, estimates, subtasks, and live Domo-backed activity.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {selected.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20"
                >
                  <span className="text-xs font-semibold text-brand-300">
                    {selected.size} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelected(new Set())}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    Clear
                  </button>
                </motion.div>
              )}

              <div className="flex border border-[var(--border)] rounded-xl overflow-hidden">
                {VIEW_BUTTONS.map(({ mode, icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      'h-9 px-3 flex items-center gap-1.5 text-xs transition-colors',
                      viewMode === mode
                        ? 'bg-brand-600 text-white'
                        : 'bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]'
                    )}
                  >
                    {icon}
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => openNewTask()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-[0_12px_24px_rgba(86,85,234,0.25)] transition-all"
              >
                <Plus className="h-4 w-4" />
                New task
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs uppercase tracking-wide">
                <CheckSquare className="h-3.5 w-3.5" />
                Delivery health
              </div>
              <p className="mt-3 text-2xl font-bold text-[var(--text)]">{completionRate}%</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {completedCount} of {tasks.length} tasks shipped
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs uppercase tracking-wide">
                <AlarmClock className="h-3.5 w-3.5" />
                Risk
              </div>
              <p className="mt-3 text-2xl font-bold text-[var(--text)]">{overdueCount}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Overdue issues requiring attention</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs uppercase tracking-wide">
                <Users className="h-3.5 w-3.5" />
                My queue
              </div>
              <p className="mt-3 text-2xl font-bold text-[var(--text)]">{myOpenCount}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Open tasks assigned to you</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs uppercase tracking-wide">
                <Target className="h-3.5 w-3.5" />
                Scope
              </div>
              <p className="mt-3 text-2xl font-bold text-[var(--text)]">{totalStoryPoints}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Story points across visible work</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: 'all', label: 'All work', count: focusCounts.all },
          { key: 'mine', label: 'Assigned to me', count: focusCounts.mine },
          { key: 'due_soon', label: 'Due soon', count: focusCounts.due_soon },
          { key: 'unassigned', label: 'Unassigned', count: focusCounts.unassigned },
          { key: 'overdue', label: 'Overdue', count: focusCounts.overdue },
        ].map((scope) => (
          <button
            key={scope.key}
            onClick={() => setFocusScope(scope.key as FocusScope)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
              focusScope === scope.key
                ? 'border-brand-500/40 bg-brand-500/12 text-brand-300'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            {scope.label}
            <span className="ml-1.5 rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">
              {scope.count}
            </span>
          </button>
        ))}
      </div>

      <TaskFilters />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">
            {displayTasks.length} task{displayTasks.length !== 1 ? 's' : ''} in view
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Group by squad signal or switch to board mode for flow management
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="h-9 pl-3 pr-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-xs outline-none appearance-none"
            >
              <option value="none">No grouping</option>
              <option value="priority">Group by priority</option>
              <option value="category">Group by category</option>
              <option value="assignee">Group by assignee</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="h-9 pl-3 pr-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-xs outline-none appearance-none"
            >
              <option value="recent">Recently updated</option>
              <option value="due">Due date</option>
              <option value="priority">Priority</option>
              <option value="progress">Progress</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>
      </div>

      {viewMode === 'kanban' && (
        isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((index) => (
              <Skeleton key={index} className="w-72 h-96 rounded-2xl shrink-0" />
            ))}
          </div>
        ) : (
          <KanbanBoard
            tasks={displayTasks}
            onDetailOpen={setDetailTask}
            onNewTask={(status) => openNewTask(status)}
          />
        )
      )}

      {viewMode !== 'kanban' && (
        isLoading ? (
          <div
            className={cn(
              'grid gap-4',
              viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
            )}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : displayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--surface-2)]">
            <CheckSquare className="h-12 w-12 text-[var(--text-muted)] opacity-25 mb-4" />
            <p className="text-[var(--text)] font-semibold text-base mb-1.5">No tasks match this view</p>
            <p className="text-[var(--text-muted)] text-sm mb-5">
              Adjust filters, switch focus, or create a fresh task
            </p>
            <button
              onClick={() => openNewTask()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-all"
            >
              <Plus className="h-4 w-4" />
              Create task
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {grouped.map(({ key, tasks: groupTasks }) => (
              <div key={key || 'all'}>
                {key && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] capitalize">
                      {key}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--surface-3)] text-[var(--text-muted)]">
                      {groupTasks.length}
                    </span>
                    <div className="flex-1 h-px bg-[var(--border)]" />
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  <motion.div
                    layout
                    className={cn(
                      'grid gap-4',
                      viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
                    )}
                  >
                    {groupTasks.map((task) => (
                      <div key={task.id} className="relative group">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(task.id);
                          }}
                          className={cn(
                            'absolute -top-2 -left-2 z-10 h-6 w-6 rounded-full border flex items-center justify-center transition-all',
                            selected.has(task.id)
                              ? 'bg-brand-600 border-brand-600 text-white'
                              : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] opacity-0 group-hover:opacity-100'
                          )}
                        >
                          <CheckSquare className="h-3.5 w-3.5" />
                        </button>

                        <TaskCard
                          task={task}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onStatusChange={handleStatusChange}
                          onDetailOpen={setDetailTask}
                          compact={viewMode === 'list'}
                        />
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            ))}

            {focusScope === 'all' && (
              <Pagination
                currentPage={tasksPage}
                totalItems={displayTasks.length}
                pageSize={tasksPageSize}
                onPageChange={setTasksPage}
                itemLabel="tasks"
              />
            )}
          </div>
        )
      )}

      <TaskForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditTask(null);
        }}
        task={editTask}
        defaultStatus={defaultStatus}
      />

      <TaskDetailModal
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onEdit={(task: Task) => {
          setDetailTask(null);
          handleEdit(task);
        }}
        onDelete={(id: string) => {
          setDetailTask(null);
          handleDelete(id);
        }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
