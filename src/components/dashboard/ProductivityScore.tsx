import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, TrendingUp } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppRedux';
import { Card } from '../ui';

import { cn } from '../utils';

export function ProductivityScore() {
  const { tasks } = useAppSelector((s) => s.tasks);
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const overdue = tasks.filter((t) => t.status === 'overdue').length;
  const urgentCompleted = tasks.filter((t) => t.priority === 'urgent' && t.status === 'completed').length;

  // Score algorithm
  const baseScore = total > 0 ? (completed / total) * 60 : 0;
  const urgentBonus = urgentCompleted * 5;
  const overduePenalty = overdue * 8;
  const score = Math.min(100, Math.max(0, Math.round(baseScore + urgentBonus - overduePenalty)));

  const getScoreLabel = () => {
    if (score >= 85) return { label: 'Excellent', color: 'text-emerald-500' };
    if (score >= 65) return { label: 'Good', color: 'text-blue-500' };
    if (score >= 45) return { label: 'Average', color: 'text-amber-500' };
    return { label: 'Needs Work', color: 'text-red-500' };
  };

  const { label, color } = getScoreLabel();
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold text-[var(--text)]">Productivity Score</h3>
      </div>

      <div className="flex items-center gap-6">
        {/* Circular progress */}
        <div className="relative h-28 w-28 shrink-0">
          <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--surface-3)" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={score >= 65 ? '#6370f5' : score >= 45 ? '#f59e0b' : '#ef4444'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-display text-[var(--text)]">{score}</span>
            <span className="text-[10px] text-[var(--text-muted)]">/ 100</span>
          </div>
        </div>

        {/* Stats breakdown */}
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className={cn('text-sm font-semibold', color)}>{label}</span>
            </div>
          </div>
          <div className="space-y-2 text-xs text-[var(--text-muted)]">
            <div className="flex justify-between">
              <span>Tasks completed</span>
              <span className="text-emerald-500 font-medium">+{Math.round(baseScore)}pts</span>
            </div>
            <div className="flex justify-between">
              <span>Urgent completed</span>
              <span className="text-brand-400 font-medium">+{urgentBonus}pts</span>
            </div>
            <div className="flex justify-between">
              <span>Overdue penalty</span>
              <span className="text-red-500 font-medium">-{overduePenalty}pts</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
