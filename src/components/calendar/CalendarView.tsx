import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameDay, isSameMonth, isToday, parseISO,
} from 'date-fns';
import { useAppSelector } from '../../hooks/useAppRedux';
import { Task } from '../types';
import { cn } from '../utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PRIORITY_CHIP: Record<string, { bg: string; text: string }> = {
  urgent: { bg: 'bg-red-500/15',    text: 'text-red-400'    },
  high:   { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  medium: { bg: 'bg-brand-500/15',  text: 'text-brand-400'  },
  low:    { bg: 'bg-emerald-500/15',text: 'text-emerald-400' },
};

const PRIORITY_BAR: Record<string, string> = {
  urgent: 'bg-red-500',
  high:   'bg-orange-500',
  medium: 'bg-brand-500',
  low:    'bg-emerald-500',
};

interface CalendarViewProps {
  onTaskClick?: (task: Task) => void;
}

export function CalendarView({ onTaskClick }: CalendarViewProps) {
  const { tasks }           = useAppSelector((s) => s.tasks);
  const [curr, setCurr]     = useState(new Date());
  const [selDay, setSelDay] = useState<Date | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const monthStart = startOfMonth(curr);
  const monthEnd   = endOfMonth(curr);
  const days       = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });

  const getTasksForDay = (day: Date) =>
    tasks.filter((t) => t.due_date && isSameDay(parseISO(t.due_date), day));

  const selDayTasks = selDay ? getTasksForDay(selDay) : [];

  const prev    = () => setCurr((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next    = () => setCurr((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => { setCurr(new Date()); setSelDay(new Date()); };

  const handleDayClick = (day: Date) => {
    setSelDay(day);
    setPanelOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 h-full min-h-0">

      {/* ── Calendar grid ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl overflow-hidden">

        {/* Navigation bar */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-1.5">
            {/* Prev */}
            <button
              onClick={prev}
              className="w-8 h-8 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] flex items-center justify-center text-[var(--text-muted)] cursor-pointer hover:bg-[var(--border)] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <h2 className="text-[var(--text)] font-bold text-sm sm:text-base font-display min-w-[130px] sm:min-w-[160px] text-center m-0">
              {format(curr, 'MMMM yyyy')}
            </h2>

            {/* Next */}
            <button
              onClick={next}
              className="w-8 h-8 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] flex items-center justify-center text-[var(--text-muted)] cursor-pointer hover:bg-[var(--border)] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={goToday}
            className="px-3 sm:px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-3)] text-[var(--text)] text-xs sm:text-[0.8rem] font-semibold cursor-pointer hover:border-brand-500 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 border-b border-[var(--border)] shrink-0">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-[var(--text-muted)] text-[0.6rem] sm:text-[0.7rem] font-semibold uppercase tracking-[0.05em]"
            >
              {/* Show short label on smallest screens */}
              <span className="sm:hidden">{d[0]}</span>
              <span className="hidden sm:inline">{d}</span>
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-auto">
          {days.map((day, i) => {
            const dayTasks = getTasksForDay(day);
            const isSel    = selDay && isSameDay(day, selDay);
            const isCurrMo = isSameMonth(day, curr);
            const today    = isToday(day);

            return (
              <button
                key={i}
                onClick={() => handleDayClick(day)}
                className={cn(
                  'p-1 sm:p-1.5 text-left min-h-[52px] sm:min-h-[72px] border-none border-r border-b border-[var(--border)] cursor-pointer transition-colors',
                  isSel
                    ? 'bg-brand-500/8'
                    : 'bg-transparent hover:bg-[var(--surface-3)]',
                  !isCurrMo && 'opacity-30'
                )}
              >
                {/* Day number */}
                <span
                  className={cn(
                    'inline-flex w-5 h-5 sm:w-6 sm:h-6 rounded-full items-center justify-center text-[0.65rem] sm:text-[0.78rem] mb-0.5',
                    today
                      ? 'bg-brand-600 text-white font-bold'
                      : 'bg-transparent text-[var(--text)] font-normal'
                  )}
                >
                  {format(day, 'd')}
                </span>

                {/* Task chips */}
                <div className="flex flex-col gap-0.5">
                  {dayTasks.slice(0, 2).map((task) => {
                    const chip = PRIORITY_CHIP[task.priority] ?? PRIORITY_CHIP.medium;
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          'text-[0.55rem] sm:text-[0.65rem] px-1 sm:px-1.5 py-px rounded-[4px] overflow-hidden text-ellipsis whitespace-nowrap font-medium',
                          chip.bg, chip.text
                        )}
                      >
                        {task.title}
                      </div>
                    );
                  })}
                  {dayTasks.length > 2 && (
                    <span className="text-[0.55rem] sm:text-[0.62rem] text-[var(--text-muted)] pl-0.5">
                      +{dayTasks.length - 2} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Mobile: Day panel as bottom drawer overlay ── */}
      {panelOpen && selDay && (
        <div className="lg:hidden fixed inset-0 z-40 flex items-end" onClick={() => setPanelOpen(false)}>
          <div
            className="w-full bg-[var(--surface-2)] border-t border-[var(--border)] rounded-t-2xl overflow-hidden max-h-[60vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
              <div>
                <h3 className="text-[var(--text)] font-semibold text-sm m-0">
                  {format(selDay, 'EEEE, MMM d')}
                </h3>
                <p className="text-[var(--text-muted)] text-xs mt-0.5">
                  {selDayTasks.length} task{selDayTasks.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="text-[var(--text-muted)] text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-3)] hover:text-[var(--text)] transition-colors"
              >
                Close
              </button>
            </div>

            {/* Task list */}
            <DayTaskList tasks={selDayTasks} selDay={selDay} onTaskClick={onTaskClick} />
          </div>
        </div>
      )}

      {/* ── Desktop: Day panel sidebar ── */}
      <div className="hidden lg:flex w-[260px] shrink-0 flex-col">
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl overflow-hidden flex-1 flex flex-col">
          {/* Panel header */}
          <div className="px-4 py-3.5 border-b border-[var(--border)] shrink-0">
            <h3 className="text-[var(--text)] font-semibold text-[0.9rem] m-0">
              {selDay ? format(selDay, 'EEEE, MMM d') : 'Select a day'}
            </h3>
            {selDay && (
              <p className="text-[var(--text-muted)] text-xs mt-1">
                {selDayTasks.length} task{selDayTasks.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Task list */}
          <DayTaskList tasks={selDayTasks} selDay={selDay} onTaskClick={onTaskClick} />
        </div>
      </div>
    </div>
  );
}

/* ── Shared day task list ── */
function DayTaskList({
  tasks,
  selDay,
  onTaskClick,
}: {
  tasks: Task[];
  selDay: Date | null;
  onTaskClick?: (task: Task) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2.5 py-8">
          <CalendarDays className="w-8 h-8 text-[var(--text-muted)] opacity-25" />
          <p className="text-[var(--text-muted)] text-[0.82rem] text-center">
            {selDay ? 'No tasks this day' : 'Click a day to see tasks'}
          </p>
        </div>
      ) : (
        tasks.map((task) => {
          const chip = PRIORITY_CHIP[task.priority] ?? PRIORITY_CHIP.medium;
          const bar  = PRIORITY_BAR[task.priority]  ?? 'bg-brand-500';
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => onTaskClick?.(task)}
              className="relative pl-4 pr-3 py-2.5 rounded-xl cursor-pointer bg-[var(--surface-3)] border border-[var(--border)] overflow-hidden hover:border-brand-500 transition-colors"
            >
              {/* Priority left bar */}
              <div className={cn('absolute left-0 top-0 bottom-0 w-1', bar)} />

              <p className="text-[var(--text)] font-medium text-[0.82rem] m-0 mb-1.5 truncate">
                {task.title}
              </p>

              <div className="flex gap-1.5 flex-wrap">
                <span className={cn(
                  'text-[0.67rem] px-1.5 py-0.5 rounded-full font-semibold capitalize',
                  chip.bg, chip.text
                )}>
                  {task.priority}
                </span>
                <span className="text-[0.67rem] px-1.5 py-0.5 rounded-full font-semibold bg-[var(--surface-2)] text-[var(--text-muted)] capitalize">
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}