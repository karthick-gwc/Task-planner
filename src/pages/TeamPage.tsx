import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Shield, CheckCircle, Clock, AlertTriangle, X, UserCog } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/useAppRedux';
import { Avatar } from '../components/ui';
import { fetchAllUsers } from '../components/store/slices/authSlice';
import { AssignManagerModal } from '../components/ui/AssignManagerModal';
import { cn } from '../components/utils';

const ROLE_STYLE: Record<string, { bg: string; text: string }> = {
  admin:    { bg: 'bg-red-500/10',    text: 'text-red-400'    },
  manager:  { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  employee: { bg: 'bg-blue-500/10',   text: 'text-blue-400'   },
};

export function TeamPage() {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector((s) => s.tasks);
  const { user, users } = useAppSelector((s) => s.auth);
  const [selected, setSelected] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  useEffect(() => {
    if (users.length === 0) dispatch(fetchAllUsers());
  }, [dispatch, users.length]);

  const visibleUsers = users.filter((u) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'manager') return u.manager_id === user.id || u.id === user.id;
    return u.id === user?.id;
  });

  const teamData = visibleUsers.map((member) => {
    const userTasks = tasks.filter((t) => t.assigned_to === member.id);
    return {
      ...member,
      tasks: {
        total:      userTasks.length,
        completed:  userTasks.filter((t) => t.status === 'completed').length,
        inProgress: userTasks.filter((t) => t.status === 'in_progress').length,
        overdue:    userTasks.filter((t) => t.status === 'overdue').length,
      },
      recentTasks: userTasks.slice(0, 3),
    };
  });

  const selectedUser = teamData.find((u) => u.id === selected);

  return (
    <div className="flex flex-col gap-5 max-w-[1200px] mx-auto w-full">

      {/* Header */}
      <div>
        <h1 className="text-[var(--text)] font-bold text-2xl sm:text-[1.6rem] font-display m-0">Team</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1.5">
          {visibleUsers.length} member{visibleUsers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className={cn(
        'grid gap-5',
        selectedUser ? 'grid-cols-1 xl:grid-cols-[1fr_300px]' : 'grid-cols-1'
      )}>
        {/* Member cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
          {teamData.map((member, i) => {
            const rate = member.tasks.total > 0 ? Math.round((member.tasks.completed / member.tasks.total) * 100) : 0;
            const roleStyle = ROLE_STYLE[member.role] ?? ROLE_STYLE.employee;
            const isSelected = selected === member.id;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div
                  onClick={() => setSelected(isSelected ? null : member.id)}
                  className={cn(
                    'bg-[var(--surface-2)] border rounded-[18px] p-5 cursor-pointer transition-all duration-200',
                    isSelected
                      ? 'border-brand-500 shadow-[0_0_0_3px_rgba(99,112,245,0.15)]'
                      : 'border-[var(--border)] hover:border-brand-400/50'
                  )}
                >
                  {/* Top row */}
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar name={member.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--text)] font-semibold text-[0.9rem] m-0 truncate">{member.name}</p>
                      <p className="text-[var(--text-muted)] text-xs mt-1 flex items-center gap-1">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </p>
                    </div>
                    <span className={cn(
                      'text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full capitalize shrink-0',
                      roleStyle.bg, roleStyle.text
                    )}>
                      {member.role}
                    </span>
                  </div>

                  {/* Task stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3.5">
                    {[
                      { label: 'Done',   value: member.tasks.completed,  bg: 'bg-emerald-500/8',  text: 'text-emerald-500' },
                      { label: 'Active', value: member.tasks.inProgress, bg: 'bg-blue-500/8',     text: 'text-blue-500'    },
                      { label: 'Late',   value: member.tasks.overdue,    bg: 'bg-red-500/8',      text: 'text-red-500'     },
                    ].map(({ label, value, bg, text }) => (
                      <div key={label} className={cn('text-center py-2 rounded-xl', bg)}>
                        <p className={cn('font-bold text-lg m-0', text)}>{value}</p>
                        <p className="text-[var(--text-muted)] text-[0.68rem] mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[var(--text-muted)] text-[0.72rem]">Completion</span>
                      <span className="text-[var(--text)] font-semibold text-[0.72rem]">{rate}%</span>
                    </div>
                    <div className="h-[5px] rounded-full bg-[var(--surface-3)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rate}%` }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.07 }}
                        className="h-full rounded-full bg-brand-600"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selectedUser && (
          <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-[18px] overflow-hidden sticky top-4">
              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-[var(--border)] flex items-start justify-between">
                <div className="flex flex-col items-center gap-2.5 flex-1">
                  <Avatar name={selectedUser.name} size="lg" />
                  <div className="text-center">
                    <p className="text-[var(--text)] font-bold text-[0.95rem] m-0">{selectedUser.name}</p>
                    <p className="text-[var(--text-muted)] text-xs mt-1 flex items-center gap-1 justify-center capitalize">
                      <Shield className="w-3 h-3" /> {selectedUser.role}
                    </p>
                    {selectedUser.manager_id && (
                      <p className="text-[var(--text-muted)] text-[0.7rem] mt-0.5">
                        Manager: {users.find((u) => u.id === selectedUser.manager_id)?.name || 'Unknown'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {(user?.role === 'admin' || user?.role === 'manager') && selectedUser.role === 'employee' && (
                    <button
                      onClick={() => { setSelectedEmployee(selectedUser); setAssignModalOpen(true); }}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 text-xs font-medium bg-transparent border-none cursor-pointer transition-colors"
                    >
                      <UserCog className="w-3.5 h-3.5" /> Assign Manager
                    </button>
                  )}
                  <button
                    onClick={() => setSelected(null)}
                    className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 bg-transparent border-none cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tasks */}
              <div className="p-4">
                <p className="text-[var(--text)] font-semibold text-sm mb-3">Recent Tasks</p>
                {selectedUser.recentTasks.length === 0 ? (
                  <p className="text-[var(--text-muted)] text-[0.82rem] text-center py-6">No tasks assigned</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedUser.recentTasks.map((task: any) => (
                      <div key={task.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[var(--surface-3)]">
                        {task.status === 'completed'
                          ? <CheckCircle className="w-[15px] h-[15px] text-emerald-500 shrink-0" />
                          : task.status === 'overdue'
                            ? <AlertTriangle className="w-[15px] h-[15px] text-red-500 shrink-0" />
                            : <Clock className="w-[15px] h-[15px] text-blue-500 shrink-0" />
                        }
                        <span className="text-[var(--text)] text-xs truncate">{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <AssignManagerModal
        isOpen={assignModalOpen}
        onClose={() => { setAssignModalOpen(false); setSelectedEmployee(null); }}
        employee={selectedEmployee}
      />
    </div>
  );
}