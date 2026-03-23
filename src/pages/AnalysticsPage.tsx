import React from 'react';
import { motion } from 'framer-motion';
import { WeeklyChart, CategoryPieChart, PriorityBarChart } from '../components/dashboard/Charts';
import { ProductivityScore } from '../components/dashboard/ProductivityScore';
import { DashboardStats } from '../components/dashboard/Charts';
import { useAppSelector } from '../hooks/useAppRedux';
import { Card, Badge, Avatar } from '../components/ui';
import { formatDate, statusLabel, priorityLabel } from '../components/utils';
import { MOCK_USERS } from '../components/utils';

export function AnalyticsPage() {
  const { tasks } = useAppSelector((s) => s.tasks);

  // Team performance data
  const teamStats = MOCK_USERS.map((user) => {
    const userTasks = tasks.filter((t) => t.assigned_to === user.id);
    const completed = userTasks.filter((t) => t.status === 'completed').length;
    const rate = userTasks.length > 0 ? Math.round((completed / userTasks.length) * 100) : 0;
    return { ...user, total: userTasks.length, completed, rate };
  });

  // Recent completed tasks
  const recentCompleted = tasks
    .filter((t) => t.status === 'completed')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold font-display text-[var(--text)]">Analytics</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Your productivity insights and task performance</p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyChart />
        </div>
        <ProductivityScore />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart />
        <PriorityBarChart />
      </div>

      {/* Team Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <h3 className="font-semibold text-[var(--text)] mb-4">Team Performance</h3>
          <div className="space-y-4">
            {teamStats
              .sort((a, b) => b.rate - a.rate)
              .map((member, i) => (
                <div key={member.id} className="flex items-center gap-4">
                  <span className="text-sm font-bold text-[var(--text-muted)] w-5 text-center">
                    {i + 1}
                  </span>
                  <Avatar name={member.name} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--text)]">{member.name}</span>
                      <span className="text-xs text-[var(--text-muted)]">{member.completed}/{member.total} tasks</span>
                    </div>
                    <div className="h-1.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${member.rate}%` }}
                        transition={{ duration: 0.7, delay: 0.2 + i * 0.1 }}
                        className="h-full rounded-full bg-brand-500"
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[var(--text)] w-12 text-right">{member.rate}%</span>
                </div>
              ))}
          </div>
        </Card>
      </motion.div>

      {/* Recent Completed */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <h3 className="font-semibold text-[var(--text)] mb-4">Recently Completed</h3>
          {recentCompleted.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">No completed tasks yet</p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {recentCompleted.map((task) => (
                <div key={task.id} className="flex items-center gap-4 py-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">{task.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Completed {formatDate(task.updatedAt, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Badge variant={task.priority}>{priorityLabel[task.priority]}</Badge>
                    <Badge variant={task.category} className="capitalize">{task.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
