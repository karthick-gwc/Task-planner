import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend,
} from 'recharts';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, TrendingUp, Zap } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppRedux';
import { Card, Badge } from '../ui';
import { WEEKLY_DATA } from '../utils/mockData';
import { cn } from '../utils';


const COLORS = ['#6370f5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }),
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: number;
  index?: number;
}

export function StatCard({ label, value, icon: Icon, color, bgColor, trend, index = 0 }: StatCardProps) {
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={cardVariants}>
      <Card className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide mb-1">{label}</p>
            <p className="text-3xl font-bold font-display text-[var(--text)]">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className={cn('h-3 w-3', trend >= 0 ? 'text-emerald-500' : 'text-red-500 rotate-180')} />
                <span className={cn('text-xs font-medium', trend >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                  {Math.abs(trend)}% this week
                </span>
              </div>
            )}
          </div>
          <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center', bgColor)}>
            <Icon className={cn('h-6 w-6', color)} />
          </div>
        </div>
        {/* Background decoration */}
        <div className={cn('absolute -right-4 -bottom-4 h-20 w-20 rounded-full opacity-10', bgColor)} />
      </Card>
    </motion.div>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────

export function DashboardStats() {
  const { tasks } = useAppSelector((s) => s.tasks);
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const overdue = tasks.filter((t) => t.status === 'overdue').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: 'Total Tasks', value: total, icon: ListTodo, color: 'text-brand-500', bgColor: 'bg-brand-500/10', trend: 12 },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', trend: 8 },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Overdue', value: overdue, icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10', trend: -5 },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: Zap, color: 'text-amber-500', bgColor: 'bg-amber-500/10', trend: 3 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
    </div>
  );
}

// ─── Weekly Chart ─────────────────────────────────────────────────────────────

export function WeeklyChart() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card>
        <h3 className="font-semibold text-[var(--text)] mb-4">Weekly Activity</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={WEEKLY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6370f5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6370f5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: 'var(--text)' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
            <Area type="monotone" dataKey="completed" stroke="#6370f5" strokeWidth={2} fill="url(#colorCompleted)" name="Completed" />
            <Area type="monotone" dataKey="created" stroke="#10b981" strokeWidth={2} fill="url(#colorCreated)" name="Created" />
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
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: tasks.filter((t) => t.category === cat).length,
  })).filter((d) => d.value > 0);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <Card>
        <h3 className="font-semibold text-[var(--text)] mb-4">Tasks by Category</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
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
    name: p.charAt(0).toUpperCase() + p.slice(1),
    total: tasks.filter((t) => t.priority === p).length,
    completed: tasks.filter((t) => t.priority === p && t.status === 'completed').length,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
      <Card>
        <h3 className="font-semibold text-[var(--text)] mb-4">Tasks by Priority</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
            <Bar dataKey="total" fill="#6370f5" radius={[6, 6, 0, 0]} name="Total" />
            <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} name="Completed" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}
