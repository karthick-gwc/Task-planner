import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Shield, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAppSelector } from '../hooks/useAppRedux';
import { Card, Badge, Avatar } from '../components/ui';
import { MOCK_USERS } from '../components/utils';

export function TeamPage() {
  const { tasks } = useAppSelector((s) => s.tasks);
  const [selected, setSelected] = useState<string | null>(null);

  const teamData = MOCK_USERS.map((user) => {
    const userTasks = tasks.filter((t) => t.assigned_to === user.id);
    return {
      ...user,
      createdAt: '2024-01-01',
      tasks: {
        total: userTasks.length,
        completed: userTasks.filter((t) => t.status === 'completed').length,
        inProgress: userTasks.filter((t) => t.status === 'in_progress').length,
        overdue: userTasks.filter((t) => t.status === 'overdue').length,
      },
      recentTasks: userTasks.slice(0, 3),
    };
  });

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    manager: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    employee: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const selectedUser = teamData.find((u) => u.id === selected);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--text)]">Team</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{MOCK_USERS.length} members</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member List */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamData.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                hover
                onClick={() => setSelected(selected === member.id ? null : member.id)}
                className={selected === member.id ? 'border-brand-500 shadow-glow-sm' : ''}
              >
                {/* Member Header */}
                <div className="flex items-start gap-3 mb-4">
                  <Avatar name={member.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--text)] truncate">{member.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mt-0.5">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[member.role]}`}>
                    {member.role}
                  </span>
                </div>

                {/* Task Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-xl bg-emerald-500/10">
                    <p className="text-lg font-bold text-emerald-500">{member.tasks.completed}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Done</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-blue-500/10">
                    <p className="text-lg font-bold text-blue-500">{member.tasks.inProgress}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Active</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-red-500/10">
                    <p className="text-lg font-bold text-red-500">{member.tasks.overdue}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Overdue</p>
                  </div>
                </div>

                {/* Completion rate */}
                <div className="mt-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-[var(--text-muted)]">Completion rate</span>
                    <span className="text-xs font-medium text-[var(--text)]">
                      {member.tasks.total > 0 ? Math.round((member.tasks.completed / member.tasks.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--surface-3)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${member.tasks.total > 0 ? (member.tasks.completed / member.tasks.total) * 100 : 0}%` }}
                      transition={{ duration: 0.7, delay: 0.3 + i * 0.1 }}
                      className="h-full rounded-full bg-brand-500"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Member Detail */}
        <div>
          {selectedUser ? (
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <div className="flex flex-col items-center gap-3 pb-4 mb-4 border-b border-[var(--border)]">
                  <Avatar name={selectedUser.name} size="lg" />
                  <div className="text-center">
                    <h3 className="font-semibold text-[var(--text)]">{selectedUser.name}</h3>
                    <p className="text-xs text-[var(--text-muted)] capitalize flex items-center gap-1 justify-center">
                      <Shield className="h-3 w-3" />{selectedUser.role}
                    </p>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-[var(--text)] mb-3">Recent Tasks</h4>
                {selectedUser.recentTasks.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] text-center py-4">No tasks assigned</p>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.recentTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-2 p-2 rounded-xl bg-[var(--surface-3)]">
                        {task.status === 'completed' ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> :
                         task.status === 'overdue' ? <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" /> :
                         <Clock className="h-4 w-4 text-blue-500 shrink-0" />}
                        <span className="text-xs text-[var(--text)] line-clamp-1">{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          ) : (
            <Card className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-[var(--text-muted)] opacity-30 mb-3" />
              <p className="text-sm text-[var(--text-muted)]">Click a member to view details</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
