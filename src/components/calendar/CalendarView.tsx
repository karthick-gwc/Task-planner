import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameDay, isSameMonth, isToday, parseISO,
} from 'date-fns';
import { useAppSelector } from '../../hooks/useAppRedux';
import { Task } from '../types';
import { cn, priorityColors } from '../utils';
import { Badge } from '../ui';
import { Button } from '../ui/Button';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarViewProps {
  onTaskClick?: (task: Task) => void;
}

export function CalendarView({ onTaskClick }: CalendarViewProps) {
  const { tasks } = useAppSelector((s) => s.tasks);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getTasksForDay = (day: Date) =>
    tasks.filter((t) => isSameDay(parseISO(t.due_date), day));

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  const prev = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => { setCurrentDate(new Date()); setSelectedDay(new Date()); };

  return (
    <div className="flex gap-6 h-full">
      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col bg-[var(--surface-2)] rounded-2xl border border-[var(--border)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <button onClick={prev} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h2 className="font-semibold font-display text-[var(--text)] text-lg min-w-40 text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button onClick={next} className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-[var(--surface-3)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Button variant="secondary" size="sm" onClick={goToday}>Today</Button>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 border-b border-[var(--border)]">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {days.map((day, i) => {
            const dayTasks = getTasksForDay(day);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const today = isToday(day);

            return (
              <motion.button
                key={i}
                whileHover={{ scale: 0.97 }}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'p-2 text-left border-r border-b border-[var(--border)] transition-colors min-h-[80px]',
                  !isCurrentMonth && 'opacity-30',
                  isSelected && 'bg-brand-600/10',
                  !isSelected && 'hover:bg-[var(--surface-3)]',
                )}
              >
                <span className={cn(
                  'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium mb-1',
                  today && 'bg-brand-600 text-white',
                  !today && 'text-[var(--text)]',
                )}>
                  {format(day, 'd')}
                </span>
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded truncate font-medium',
                        task.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                      )}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-[var(--text-muted)] px-1">+{dayTasks.length - 3} more</div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Tasks Panel */}
      <div className="w-72 flex flex-col">
        <div className="bg-[var(--surface-2)] rounded-2xl border border-[var(--border)] flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <h3 className="font-semibold text-[var(--text)]">
              {selectedDay ? format(selectedDay, 'EEEE, MMM d') : 'Select a day'}
            </h3>
            {selectedDay && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{selectedDayTasks.length} tasks</p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {selectedDayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-sm text-[var(--text-muted)]">
                  {selectedDay ? 'No tasks this day' : 'Click a day to see tasks'}
                </p>
              </div>
            ) : (
              selectedDayTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => onTaskClick?.(task)}
                  className={cn(
                    'p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] cursor-pointer hover:border-brand-500/40 transition-colors',
                    'relative overflow-hidden'
                  )}
                >
                  <div className={cn(
                    'absolute left-0 top-0 bottom-0 w-1',
                    task.priority === 'urgent' ? 'bg-red-500' :
                    task.priority === 'high' ? 'bg-orange-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  )} />
                  <div className="pl-2">
                    <p className="text-sm font-medium text-[var(--text)] line-clamp-1">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant={task.status} size="sm">{task.status.replace('_', ' ')}</Badge>
                      <Badge variant={task.priority} size="sm">{task.priority}</Badge>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
