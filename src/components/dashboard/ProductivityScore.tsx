import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppRedux';
import { Card } from '../ui';
import { cn } from '../utils';

export function ProductivityScore() {
  const { tasks } = useAppSelector((s) => s.tasks);

  const total          = tasks.length;
  const completed      = tasks.filter((t) => t.status === 'completed').length;
  const overdue        = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length;
  const urgentDone     = tasks.filter((t) => t.priority === 'urgent' && t.status === 'completed').length;

  const baseScore      = total > 0 ? (completed / total) * 60 : 0;
  const urgentBonus    = urgentDone * 5;
  const overduePenalty = overdue * 8;
  const score          = Math.min(100, Math.max(0, Math.round(baseScore + urgentBonus - overduePenalty)));

  const getLabel = () => {
    if (score >= 85) return { label: 'Excellent', color: '#10b981', textClass: 'text-emerald-500' };
    if (score >= 65) return { label: 'Good',      color: '#3b82f6', textClass: 'text-blue-500'    };
    if (score >= 45) return { label: 'Average',   color: '#f59e0b', textClass: 'text-amber-500'   };
    return               { label: 'Needs Work',  color: '#ef4444', textClass: 'text-red-500'     };
  };

  const { label, color, textClass } = getLabel();
  const R             = 45;
  const circumference = 2 * Math.PI * R;
  const dashOffset    = circumference - (score / 100) * circumference;

  return (
    <Card padding="md">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-amber-500 shrink-0" />
        <h3 className="font-semibold text-sm text-[var(--text)]">Productivity Score</h3>
      </div>

      <div className="flex items-center gap-4">
        {/* Ring */}
        <div className="relative h-24 w-24 shrink-0">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={R} fill="none" stroke="var(--surface-3)" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r={R}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.1, delay: 0.3, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold font-display text-[var(--text)]">{score}</span>
            <span className="text-[10px] text-[var(--text-muted)]">/ 100</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className={cn('text-sm font-semibold', textClass)}>{label}</span>
          </div>

          <div className="space-y-1.5 text-[11px] text-[var(--text-muted)]">
            <div className="flex justify-between">
              <span>Tasks completed</span>
              <span className="font-medium text-emerald-500">+{Math.round(baseScore)}pts</span>
            </div>
            <div className="flex justify-between">
              <span>Urgent completed</span>
              <span className="font-medium text-brand-400">+{urgentBonus}pts</span>
            </div>
            <div className="flex justify-between">
              <span>Overdue penalty</span>
              <span className="font-medium text-red-500">-{overduePenalty}pts</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}