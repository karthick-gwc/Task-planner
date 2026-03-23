import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameDay, isSameMonth, isToday, parseISO,
} from 'date-fns';
import { useAppSelector } from '../../hooks/useAppRedux';
import { Task } from '../types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PRIORITY_CHIP: Record<string, { bg: string; color: string }> = {
  urgent: { bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
  high:   { bg: 'rgba(249,115,22,0.15)',  color: '#fb923c' },
  medium: { bg: 'rgba(99,112,245,0.15)',  color: '#8196fa' },
  low:    { bg: 'rgba(16,185,129,0.15)',  color: '#34d399' },
};

const PRIORITY_BAR: Record<string, string> = {
  urgent: '#ef4444', high: '#f97316', medium: '#6370f5', low: '#10b981',
};

interface CalendarViewProps {
  onTaskClick?: (task: Task) => void;
}

export function CalendarView({ onTaskClick }: CalendarViewProps) {
  const { tasks }       = useAppSelector((s) => s.tasks);
  const [curr, setCurr] = useState(new Date());
  const [selDay, setSelDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(curr);
  const monthEnd   = endOfMonth(curr);
  const days       = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });

  const getTasksForDay = (day: Date) => tasks.filter((t) => isSameDay(parseISO(t.due_date), day));
  const selDayTasks    = selDay ? getTasksForDay(selDay) : [];

  const prev    = () => setCurr((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next    = () => setCurr((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => { setCurr(new Date()); setSelDay(new Date()); };

  return (
    <div style={{ display: 'flex', gap: 20, height: '100%', minHeight: 0 }}>

      {/* ── Calendar grid ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
        background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden',
      }}>
        {/* Navigation bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={prev}
              style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'background 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--border)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}
            >
              <ChevronLeft style={{ width: 14, height: 14 }} />
            </button>
            <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1rem', fontFamily: 'Sora,sans-serif', minWidth: 160, textAlign: 'center', margin: 0 }}>
              {format(curr, 'MMMM yyyy')}
            </h2>
            <button
              onClick={next}
              style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'background 0.15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--border)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}
            >
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
          <button
            onClick={goToday}
            style={{ padding: '6px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-3)', color: 'var(--text)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6370f5')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            Today
          </button>
        </div>

        {/* Weekday labels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {WEEKDAYS.map((d) => (
            <div key={d} style={{ padding: '8px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gridAutoRows: '1fr', overflow: 'auto' }}>
          {days.map((day, i) => {
            const dayTasks  = getTasksForDay(day);
            const isSel     = selDay && isSameDay(day, selDay);
            const isCurrMo  = isSameMonth(day, curr);
            const today     = isToday(day);

            return (
              <button
                key={i}
                onClick={() => setSelDay(day)}
                style={{
                  padding: '6px 6px 4px', textAlign: 'left', minHeight: 72,
                  border: 'none', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
                  background: isSel ? 'rgba(99,112,245,0.08)' : 'transparent',
                  opacity: isCurrMo ? 1 : 0.3,
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = 'var(--surface-3)'; }}
                onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  display: 'inline-flex', width: 24, height: 24, borderRadius: '50%',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.78rem', fontWeight: today ? 700 : 400,
                  background: today ? '#5655ea' : 'transparent',
                  color: today ? '#fff' : 'var(--text)',
                  marginBottom: 3,
                }}>
                  {format(day, 'd')}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dayTasks.slice(0, 2).map((task) => {
                    const chip = PRIORITY_CHIP[task.priority] ?? PRIORITY_CHIP.medium;
                    return (
                      <div key={task.id} style={{
                        fontSize: '0.65rem', padding: '1px 5px', borderRadius: 5,
                        background: chip.bg, color: chip.color,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontWeight: 500,
                      }}>
                        {task.title}
                      </div>
                    );
                  })}
                  {dayTasks.length > 2 && (
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', paddingLeft: 2 }}>+{dayTasks.length - 2} more</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Day panel ── */}
      <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <h3 style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
              {selDay ? format(selDay, 'EEEE, MMM d') : 'Select a day'}
            </h3>
            {selDay && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 4 }}>
                {selDayTasks.length} task{selDayTasks.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selDayTasks.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 10, padding: '32px 0' }}>
                <CalendarDays style={{ width: 32, height: 32, color: 'var(--text-muted)', opacity: 0.25 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center' }}>
                  {selDay ? 'No tasks this day' : 'Click a day to see tasks'}
                </p>
              </div>
            ) : (
              selDayTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => onTaskClick?.(task)}
                  style={{
                    padding: '10px 12px 10px 16px', borderRadius: 12, cursor: 'pointer',
                    background: 'var(--surface-3)', border: '1px solid var(--border)',
                    position: 'relative', overflow: 'hidden', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#6370f5')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  {/* Priority bar */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                    background: PRIORITY_BAR[task.priority] ?? '#6370f5',
                  }} />
                  <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.82rem', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title}
                  </p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{
                      fontSize: '0.67rem', padding: '2px 7px', borderRadius: 99, fontWeight: 600,
                      background: PRIORITY_CHIP[task.priority]?.bg ?? 'var(--surface-3)',
                      color: PRIORITY_CHIP[task.priority]?.color ?? 'var(--text-muted)',
                    }}>
                      {task.priority}
                    </span>
                    <span style={{
                      fontSize: '0.67rem', padding: '2px 7px', borderRadius: 99, fontWeight: 600,
                      background: 'var(--surface-2)', color: 'var(--text-muted)',
                    }}>
                      {task.status.replace('_', ' ')}
                    </span>
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