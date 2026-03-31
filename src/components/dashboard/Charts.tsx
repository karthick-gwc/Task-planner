import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend,
} from 'recharts';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp, Zap } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppRedux';
import { Card } from '../ui';
import { WEEKLY_DATA } from '../utils/mockData';
import { cn } from '../utils';

const COLORS = ['#6370f5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface StatCardProps {
  label:     string;
  value:     number | string;
  icon:      React.ElementType;
  iconColor: string;
  iconBg:    string;
  trend?:    number;
  index?:    number;
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg, trend, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
    >
      <div className="relative min-h-28 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide mb-1.5 text-[var(--text-muted)]">
              {label}
            </p>
            <p className="text-2xl font-bold font-display text-[var(--text)]">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-1.5">
                <TrendingUp
                  className={cn('h-3 w-3', trend >= 0 ? 'text-emerald-500' : 'text-red-500')}
                  style={{ transform: trend < 0 ? 'rotate(180deg)' : 'none' }}
                />
                <span className={cn('text-[11px] font-medium', trend >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                  {Math.abs(trend)}% this week
                </span>
              </div>
            )}
          </div>
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: iconBg }}
          >
            <Icon className="h-5 w-5" style={{ color: iconColor }} />
          </div>
        </div>
        {/* Decoration circle */}
        <div
          className="absolute -right-4 -bottom-4 h-16 w-16 rounded-full opacity-10"
          style={{ background: iconBg }}
        />
      </div>
    </motion.div>
  );
}

// ─── Dashboard Stats Row ──────────────────────────────────────────────────────

export function DashboardStats() {
  const { tasks } = useAppSelector((s) => s.tasks);
  const total          = tasks.length;
  const completed      = tasks.filter((t) => t.status === 'completed').length;
  const inProgress     = tasks.filter((t) => t.status === 'in_progress').length;
  const overdue        = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats: StatCardProps[] = [
    { label: 'Total Tasks',     value: total,            icon: ListTodo,      iconColor: '#6370f5', iconBg: 'rgba(99,112,245,0.12)',  trend: 12 },
    { label: 'Completed',       value: completed,        icon: CheckCircle2,  iconColor: '#10b981', iconBg: 'rgba(16,185,129,0.12)',  trend: 8  },
    { label: 'In Progress',     value: inProgress,       icon: Clock,         iconColor: '#3b82f6', iconBg: 'rgba(59,130,246,0.12)'        },
    { label: 'Overdue',         value: overdue,          icon: AlertTriangle, iconColor: '#ef4444', iconBg: 'rgba(239,68,68,0.12)',   trend: -5 },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: Zap,       iconColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.12)',  trend: 3  },
  ];

  return (
    <div className="grid grid-cols-2  sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
    </div>
  );
}

// ─── Weekly Chart 
export function WeeklyChart() {
  const { tasks } = useAppSelector((s) => s.tasks);

  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i)); 
      const dayLabel = days[date.getDay()];
      const dateStr  = date.toISOString().split('T')[0]; 

      const completed = tasks.filter(
        (t) => t.status === 'completed' && t.updatedAt?.startsWith(dateStr)
      ).length;

      const created = tasks.filter(
        (t) => t.createdAt?.startsWith(dateStr)
      ).length;

      return { day: dayLabel, completed, created };
    });
  }, [tasks]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card>
        <h3 className="font-semibold mb-4 text-[var(--text)]">Weekly Activity</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6370f5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6370f5" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} labelStyle={{ color: 'var(--text)' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="completed" stroke="#6370f5" strokeWidth={2} fill="url(#gCompleted)" name="Completed" />
            <Area type="monotone" dataKey="created"   stroke="#10b981" strokeWidth={2} fill="url(#gCreated)"   name="Created"   />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}

// ─── Category Pie ─────────────────────────────────────────────────────────────

export function CategoryPieChart() {
  const { tasks } = useAppSelector((s) => s.tasks);
  const data = ['work', 'personal', 'study', 'other'].map((cat) => ({
    name:  cat.charAt(0).toUpperCase() + cat.slice(1),
    value: tasks.filter((t) => t.category === cat).length,
  })).filter((d) => d.value > 0);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <Card>
        <h3 className="font-semibold mb-4 text-[var(--text)]">Tasks by Category</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}

// ─── Priority Bar Chart ───────────────────────────────────────────────────────

export function PriorityBarChart() {
  const { tasks } = useAppSelector((s) => s.tasks);
  const data = ['urgent', 'high', 'medium', 'low'].map((p) => ({
    name:      p.charAt(0).toUpperCase() + p.slice(1),
    total:     tasks.filter((t) => t.priority === p).length,
    completed: tasks.filter((t) => t.priority === p && t.status === 'completed').length,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
      <Card>
        <h3 className="font-semibold mb-4 text-[var(--text)]">Tasks by Priority</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="total"     fill="#6370f5" radius={[6, 6, 0, 0]} name="Total"     />
            <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}
