import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Shield, CheckCircle, Clock, AlertTriangle, X, UserCog } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../hooks/useAppRedux';
import { Avatar } from '../components/ui';
import { fetchAllUsers } from '../components/store/slices/authSlice';
import { AssignManagerModal } from '../components/ui/AssignManagerModal';

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  admin:    { bg: 'rgba(239,68,68,0.1)',   color: '#f87171' },
  manager:  { bg: 'rgba(168,85,247,0.1)',  color: '#c084fc' },
  employee: { bg: 'rgba(59,130,246,0.1)',  color: '#60a5fa' },
};

export function TeamPage() {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector((s) => s.tasks);
  const { user, users } = useAppSelector((s) => s.auth);
  const [selected, setSelected] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, users.length]);

  // Filter users based on current user's role
  const visibleUsers = users.filter((u) => {
    if (user?.role === 'admin') return true; // Admin sees all
    if (user?.role === 'manager') return u.manager_id === user.id || u.id === user.id; // Manager sees themselves and their employees
    return u.id === user?.id; // Employee sees only themselves
  });

  const teamData = visibleUsers.map((user) => {
    const userTasks = tasks.filter((t) => t.assigned_to === user.id);
    return {
      ...user,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ color: 'var(--text)', fontWeight: 700, fontSize: 'clamp(1.3rem,2.5vw,1.6rem)', fontFamily: 'Sora,sans-serif', margin: 0 }}>
          Team
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 5 }}>
          {visibleUsers.length} member{visibleUsers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? 'minmax(0,2fr) 300px' : '1fr', gap: 20 }}>
        {/* Member cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16, alignContent: 'start' }}>
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
                  style={{
                    background: 'var(--surface-2)',
                    border: `1px solid ${isSelected ? '#6370f5' : 'var(--border)'}`,
                    borderRadius: 18, padding: 20, cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 3px rgba(99,112,245,0.15)' : 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                    <Avatar name={member.name} size="md" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {member.name}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail style={{ width: 11, height: 11, flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</span>
                      </p>
                    </div>
                    <span style={{ background: roleStyle.bg, color: roleStyle.color, fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: 99, textTransform: 'capitalize', flexShrink: 0 }}>
                      {member.role}
                    </span>
                  </div>

                  {/* Task stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {[
                      { label: 'Done',   value: member.tasks.completed,  color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
                      { label: 'Active', value: member.tasks.inProgress, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
                      { label: 'Late',   value: member.tasks.overdue,    color: '#ef4444', bg: 'rgba(239,68,68,0.08)'  },
                    ].map(({ label, value, color, bg }) => (
                      <div key={label} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 10, background: bg }}>
                        <p style={{ color, fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{value}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginTop: 2 }}>{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Completion</span>
                      <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.72rem' }}>{rate}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, background: 'var(--surface-3)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rate}%` }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.07 }}
                        style={{ height: '100%', borderRadius: 99, background: '#5655ea' }}
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
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden', position: 'sticky', top: 0 }}>
              {/* Header */}
              <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1 }}>
                  <Avatar name={selectedUser.name} size="lg" />
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{selectedUser.name}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', textTransform: 'capitalize' }}>
                      <Shield style={{ width: 12, height: 12 }} />
                      {selectedUser.role}
                    </p>
                    {selectedUser.manager_id && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 2 }}>
                        Manager: {users.find(u => u.id === selectedUser.manager_id)?.name || 'Unknown'}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(user?.role === 'admin' || user?.role === 'manager') && selectedUser.role === 'employee' && (
                    <button
                      onClick={() => {
                        setSelectedEmployee(selectedUser);
                        setAssignModalOpen(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#3b82f6',
                        padding: '8px',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(59,130,246,0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <UserCog style={{ width: 14, height: 14 }} />
                      Assign Manager
                    </button>
                  )}
                  <button
                    onClick={() => setSelected(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                  >
                    <X style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </div>

              {/* Tasks */}
              <div style={{ padding: 16 }}>
                <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.85rem', marginBottom: 12 }}>Recent Tasks</p>
                {selectedUser.recentTasks.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', padding: '24px 0' }}>No tasks assigned</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedUser.recentTasks.map((task) => (
                      <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--surface-3)' }}>
                        {task.status === 'completed'
                          ? <CheckCircle style={{ width: 15, height: 15, color: '#10b981', flexShrink: 0 }} />
                          : task.status === 'overdue'
                            ? <AlertTriangle style={{ width: 15, height: 15, color: '#ef4444', flexShrink: 0 }} />
                            : <Clock style={{ width: 15, height: 15, color: '#3b82f6', flexShrink: 0 }} />
                        }
                        <span style={{ color: 'var(--text)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Placeholder when nothing selected */}
        {!selectedUser && (
          <div />
        )}
      </div>

      <AssignManagerModal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
      />
    </div>
  );
}