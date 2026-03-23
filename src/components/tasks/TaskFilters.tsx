// import React from 'react';
// import { Filter, X } from 'lucide-react';
// import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
// import { setFilters, clearFilters } from '../store/slices/taskSlice';
// import type { TaskStatus, TaskPriority, TaskCategory } from '../types';
// import { Button } from '../ui';
// import { cn } from '../utils';


// const statusOptions: { value: TaskStatus | 'all'; label: string }[] = [
//   { value: 'all', label: 'All Status' },
//   { value: 'pending', label: 'Pending' },
//   { value: 'in_progress', label: 'In Progress' },
//   { value: 'completed', label: 'Completed' },
//   { value: 'overdue', label: 'Overdue' },
// ];

// const priorityOptions: { value: TaskPriority | 'all'; label: string }[] = [
//   { value: 'all', label: 'All Priority' },
//   { value: 'urgent', label: '🔴 Urgent' },
//   { value: 'high', label: '🟠 High' },
//   { value: 'medium', label: '🟡 Medium' },
//   { value: 'low', label: '🟢 Low' },
// ];

// const categoryOptions: { value: TaskCategory | 'all'; label: string }[] = [
//   { value: 'all', label: 'All Categories' },
//   { value: 'work', label: '💼 Work' },
//   { value: 'personal', label: '🏠 Personal' },
//   { value: 'study', label: '📚 Study' },
//   { value: 'other', label: '📌 Other' },
// ];

// export function TaskFilters() {
//   const dispatch = useAppDispatch();
//   const { filters } = useAppSelector((s) => s.tasks);
//   const hasActiveFilters =
//     filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all';

//   return (
//     <div className="flex flex-wrap items-center gap-3">
//       <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
//         <Filter className="h-4 w-4" />
//         <span>Filter:</span>
//       </div>

//       {/* Status */}
//       <div className="flex gap-1">
//         {statusOptions.map((opt) => (
//           <button
//             key={opt.value}
//             onClick={() => dispatch(setFilters({ status: opt.value }))}
//             className={cn(
//               'px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150',
//               filters.status === opt.value
//                 ? 'bg-brand-600 text-white shadow-glow-sm'
//                 : 'bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'
//             )}
//           >
//             {opt.label}
//           </button>
//         ))}
//       </div>

//       <div className="h-4 w-px bg-[var(--border)]" />

//       {/* Priority */}
//       <select
//         value={filters.priority || 'all'}
//         onChange={(e) => dispatch(setFilters({ priority: e.target.value as TaskPriority | 'all' }))}
//         className="h-8 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text)] text-xs outline-none focus:border-brand-500 cursor-pointer"
//       >
//         {priorityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
//       </select>

//       {/* Category */}
//       <select
//         value={filters.category || 'all'}
//         onChange={(e) => dispatch(setFilters({ category: e.target.value as TaskCategory | 'all' }))}
//         className="h-8 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text)] text-xs outline-none focus:border-brand-500 cursor-pointer"
//       >
//         {categoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
//       </select>

//       {hasActiveFilters && (
//         <Button
//           variant="ghost"
//           size="sm"
//           leftIcon={<X className="h-3.5 w-3.5" />}
//           onClick={() => dispatch(clearFilters())}
//           className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
//         >
//           Clear
//         </Button>
//       )}
//     </div>
//   );
// }


import React from 'react';
import { Filter, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { setFilters, clearFilters } from '../store/slices/taskSlice';
import type { TaskStatus, TaskPriority, TaskCategory } from '../types';

const STATUS_OPTIONS: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all',         label: 'All'         },
  { value: 'pending',     label: 'Pending'     },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed'   },
  { value: 'overdue',     label: 'Overdue'     },
];

const PRIORITY_OPTIONS: { value: TaskPriority | 'all'; label: string }[] = [
  { value: 'all',    label: 'All Priority' },
  { value: 'urgent', label: '🔴 Urgent'   },
  { value: 'high',   label: '🟠 High'     },
  { value: 'medium', label: '🟡 Medium'   },
  { value: 'low',    label: '🟢 Low'      },
];

const CATEGORY_OPTIONS: { value: TaskCategory | 'all'; label: string }[] = [
  { value: 'all',      label: 'All Categories' },
  { value: 'work',     label: '💼 Work'         },
  { value: 'personal', label: '🏠 Personal'     },
  { value: 'study',    label: '📚 Study'        },
  { value: 'other',    label: '📌 Other'        },
];

const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: '5px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 500,
  border: 'none', cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
  background: active ? '#5655ea' : 'var(--surface-3)',
  color:      active ? '#fff'    : 'var(--text-muted)',
  boxShadow:  active ? '0 2px 8px rgba(86,85,234,0.25)' : 'none',
});

const selectStyle: React.CSSProperties = {
  height: 32, padding: '0 10px', borderRadius: 10, fontSize: '0.78rem',
  border: '1px solid var(--border)', background: 'var(--surface-3)',
  color: 'var(--text)', outline: 'none', cursor: 'pointer',
};

export function TaskFilters() {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((s) => s.tasks);
  const hasActive = filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all';

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <Filter style={{ width: 13, height: 13 }} />
        <span>Filter:</span>
      </div>

      {/* Status chips */}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => dispatch(setFilters({ status: opt.value }))}
            style={chipStyle(filters.status === opt.value || (!filters.status && opt.value === 'all'))}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 18, background: 'var(--border)', flexShrink: 0 }} />

      {/* Priority select */}
      <select
        value={filters.priority || 'all'}
        onChange={(e) => dispatch(setFilters({ priority: e.target.value as TaskPriority | 'all' }))}
        style={selectStyle}
      >
        {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {/* Category select */}
      <select
        value={filters.category || 'all'}
        onChange={(e) => dispatch(setFilters({ category: e.target.value as TaskCategory | 'all' }))}
        style={selectStyle}
      >
        {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {/* Clear */}
      {hasActive && (
        <button
          onClick={() => dispatch(clearFilters())}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
            borderRadius: 99, border: 'none', background: 'rgba(239,68,68,0.1)',
            color: '#f87171', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer',
          }}
        >
          <X style={{ width: 12, height: 12 }} />
          Clear
        </button>
      )}
    </div>
  );
}