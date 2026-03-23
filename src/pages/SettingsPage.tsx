import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Shield, User, Palette, Save, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
import { setTheme } from '../components/store/slices/uiSlice';
import { Avatar } from '../components/ui';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

const Section = ({ icon, title, children, delay = 0 }: { icon: React.ReactNode; title: string; children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 18, padding: '24px', marginBottom: 0 }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 10, background: 'rgba(99,112,245,0.12)', flexShrink: 0 }}>
        {icon}
      </span>
      <h2 style={{ color: 'var(--text)', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Sora,sans-serif', margin: 0 }}>{title}</h2>
    </div>
    {children}
  </motion.div>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    style={{
      position: 'relative', width: 44, height: 24, borderRadius: 99, border: 'none',
      background: checked ? '#5655ea' : 'var(--border)', cursor: 'pointer',
      transition: 'background 0.2s', flexShrink: 0,
    }}
  >
    <span style={{
      position: 'absolute', top: 2, left: 2, width: 20, height: 20,
      borderRadius: '50%', background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      transition: 'transform 0.2s',
      transform: checked ? 'translateX(20px)' : 'translateX(0)',
    }} />
  </button>
);

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((s) => s.ui);
  const { user }  = useAppSelector((s) => s.auth);
  const [name, setName] = useState(user?.name || '');
  const [notif, setNotif] = useState({ email: true, inApp: true, overdue: true, reminder: true });

  const handleSave = () => toast.success('Settings saved!');

  const NOTIF_ITEMS = [
    { key: 'email',    label: 'Email Notifications',   desc: 'Receive task reminders via email' },
    { key: 'inApp',    label: 'In-App Notifications',  desc: 'Show notifications inside the app' },
    { key: 'overdue',  label: 'Overdue Alerts',         desc: 'Alert when tasks become overdue' },
    { key: 'reminder', label: 'Due Date Reminders',     desc: 'Remind me 24h before due date' },
  ];

  return (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page heading */}
      <div>
        <h1 style={{ color: 'var(--text)', fontWeight: 700, fontSize: 'clamp(1.3rem,2.5vw,1.6rem)', fontFamily: 'Sora,sans-serif', margin: 0 }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 5 }}>
          Manage your preferences and account
        </p>
      </div>

      {/* ── Profile ── */}
      <Section icon={<User style={{ width: 16, height: 16, color: '#6370f5' }} />} title="Profile">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: '14px 16px', borderRadius: 12, background: 'var(--surface-3)' }}>
          {user && <Avatar name={user.name} size="lg" />}
          <div style={{ minWidth: 0 }}>
            <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>{user?.name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 3, textTransform: 'capitalize' }}>
              {user?.role} · {user?.email}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Email Address"
            value={user?.email || ''}
            disabled
            helperText="Email cannot be changed"
            style={{ opacity: 0.6 }}
          />
        </div>
      </Section>

      {/* ── Appearance ── */}
      <Section icon={<Palette style={{ width: 16, height: 16, color: '#6370f5' }} />} title="Appearance" delay={0.08}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 14 }}>Choose your preferred theme</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {(['light', 'dark'] as const).map((t) => {
            const active = theme === t;
            return (
              <button
                key={t}
                onClick={() => dispatch(setTheme(t))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                  borderRadius: 14, border: `2px solid ${active ? '#6370f5' : 'var(--border)'}`,
                  background: active ? 'rgba(99,112,245,0.08)' : 'var(--surface-3)',
                  cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s', textAlign: 'left',
                }}
              >
                {t === 'light'
                  ? <Sun style={{ width: 20, height: 20, color: '#f59e0b', flexShrink: 0 }} />
                  : <Moon style={{ width: 20, height: 20, color: '#8196fa', flexShrink: 0 }} />
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.85rem', margin: 0, textTransform: 'capitalize' }}>{t} Mode</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 2 }}>
                    {t === 'light' ? 'Clean and bright' : 'Easy on the eyes'}
                  </p>
                </div>
                {active && (
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#5655ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check style={{ width: 10, height: 10, color: '#fff' }} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Notifications ── */}
      <Section icon={<Bell style={{ width: 16, height: 16, color: '#6370f5' }} />} title="Notifications" delay={0.16}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {NOTIF_ITEMS.map(({ key, label, desc }, i) => (
            <div
              key={key}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                padding: '13px 0',
                borderBottom: i < NOTIF_ITEMS.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div>
                <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.875rem', margin: 0 }}>{label}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem', marginTop: 2 }}>{desc}</p>
              </div>
              <Toggle
                checked={notif[key as keyof typeof notif]}
                onChange={() => setNotif((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Role ── */}
      <Section icon={<Shield style={{ width: 16, height: 16, color: '#6370f5' }} />} title="Role & Permissions" delay={0.24}>
        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.875rem', margin: '0 0 6px' }}>
            Current Role:{' '}
            <span style={{ color: '#8196fa', fontWeight: 700, textTransform: 'capitalize' }}>{user?.role}</span>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0, lineHeight: 1.6 }}>
            {user?.role === 'admin'    && 'Full access — manage users, all tasks, and system settings.'}
            {user?.role === 'manager'  && 'Team management — assign tasks, view team analytics.'}
            {user?.role === 'employee' && 'Personal tasks — manage your own tasks and view dashboard.'}
          </p>
        </div>
      </Section>

      {/* ── Save button ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 8 }}>
        <button
          onClick={handleSave}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px',
            borderRadius: 12, border: 'none', background: '#5655ea', color: '#fff',
            fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 3px 12px rgba(86,85,234,0.3)', transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#4a44d0')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#5655ea')}
        >
          <Save style={{ width: 15, height: 15 }} />
          Save Changes
        </button>
      </div>
    </div>
  );
}