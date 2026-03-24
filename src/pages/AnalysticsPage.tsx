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
  const { users } = useAppSelector((s) => s.auth);
  const teamMembers = users && users.length > 0 ? users : MOCK_USERS;

  const teamStats = teamMembers.map((user) => {
    const userTasks = tasks.filter((t) => t.assigned_to === user.id);
    const completed = userTasks.filter((t) => t.status === 'completed').length;
    const rate = userTasks.length > 0 ? Math.round((completed / userTasks.length) * 100) : 0;
    return { ...user, total: userTasks.length, completed, rate };
  });

  const recentCompleted = tasks
    .filter((t) => t.status === 'completed')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-[1200px] mx-auto w-full">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-[1.6rem] font-bold font-display text-[var(--text)] m-0">Analytics</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Your productivity insights and task performance</p>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Weekly + Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><WeeklyChart /></div>
        <ProductivityScore />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <CategoryPieChart />
        <PriorityBarChart />
      </div>

      {/* Team Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <h3 className="font-semibold text-[var(--text)] mb-4">Team Performance</h3>
          <div className="flex flex-col gap-4">
            {teamStats
              .sort((a, b) => b.rate - a.rate)
              .map((member, i) => (
                <div key={member.id} className="flex items-center gap-3 sm:gap-4">
                  <span className="text-sm font-bold text-[var(--text-muted)] w-5 text-center shrink-0">{i + 1}</span>
                  <Avatar name={member.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--text)] truncate">{member.name}</span>
                      <span className="text-xs text-[var(--text-muted)] shrink-0 ml-2">{member.completed}/{member.total}</span>
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
                  <span className="text-sm font-semibold text-[var(--text)] w-10 text-right shrink-0">{member.rate}%</span>
                </div>
              ))}
          </div>
        </Card>
      </motion.div>

      {/* Recently Completed */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <h3 className="font-semibold text-[var(--text)] mb-4">Recently Completed</h3>
          {recentCompleted.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">No completed tasks yet</p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {recentCompleted.map((task) => (
                <div key={task.id} className="flex items-center gap-3 sm:gap-4 py-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">{task.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Completed {formatDate(task.updatedAt, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Badge variant={task.priority}>{priorityLabel[task.priority]}</Badge>
                    <Badge variant={task.category} className="capitalize hidden sm:flex">{task.category}</Badge>
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