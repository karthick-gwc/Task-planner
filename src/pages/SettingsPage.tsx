import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Shield, User, Palette, Save } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
import { setTheme } from '../components/store/slices/uiSlice';
import { Card, Avatar, Button } from '../components/ui';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { cn } from '@/components/utils';

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((s) => s.ui);
  const { user } = useAppSelector((s) => s.auth);
  const [name, setName] = useState(user?.name || '');
  const [notifications, setNotifications] = useState({ email: true, inApp: true, overdue: true, dueReminder: true });

  const handleSave = () => toast.success('Settings saved!');

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-[var(--text)]">Settings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Manage your preferences and account settings</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <User className="h-5 w-5 text-brand-500" />
            <h2 className="font-semibold text-[var(--text)]">Profile</h2>
          </div>
          <div className="flex items-center gap-4 mb-5">
            {user && <Avatar name={user.name} size="lg" />}
            <div>
              <p className="font-medium text-[var(--text)]">{user?.name}</p>
              <p className="text-sm text-[var(--text-muted)] capitalize">{user?.role} · {user?.email}</p>
            </div>
          </div>
          <div className="space-y-4">
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
              helperText="Email cannot be changed in this demo"
            />
          </div>
        </Card>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Palette className="h-5 w-5 text-brand-500" />
            <h2 className="font-semibold text-[var(--text)]">Appearance</h2>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text)] mb-3">Theme</p>
            <div className="grid grid-cols-2 gap-3">
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => dispatch(setTheme(t))}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                    theme === t ? 'border-brand-500 bg-brand-500/10' : 'border-[var(--border)] hover:border-brand-500/40'
                  )}
                >
                  {t === 'light' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-brand-400" />}
                  <div className="text-left">
                    <p className="text-sm font-medium text-[var(--text)] capitalize">{t} Mode</p>
                    <p className="text-xs text-[var(--text-muted)]">{t === 'light' ? 'Clean and bright' : 'Easy on the eyes'}</p>
                  </div>
                  {theme === t && <div className="ml-auto h-2 w-2 rounded-full bg-brand-500" />}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Bell className="h-5 w-5 text-brand-500" />
            <h2 className="font-semibold text-[var(--text)]">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive task reminders via email' },
              { key: 'inApp', label: 'In-App Notifications', desc: 'Show notifications in the app' },
              { key: 'overdue', label: 'Overdue Alerts', desc: 'Alert when tasks become overdue' },
              { key: 'dueReminder', label: 'Due Date Reminders', desc: 'Remind me 24h before due date' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{desc}</p>
                </div>
                <button
                  onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition-colors',
                    notifications[key as keyof typeof notifications] ? 'bg-brand-600' : 'bg-[var(--border)]'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                    notifications[key as keyof typeof notifications] && 'translate-x-5'
                  )} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Role & Permissions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Shield className="h-5 w-5 text-brand-500" />
            <h2 className="font-semibold text-[var(--text)]">Role & Permissions</h2>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-3)] border border-[var(--border)]">
            <p className="text-sm font-medium text-[var(--text)] capitalize mb-1">
              Current Role: <span className="text-brand-400">{user?.role}</span>
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              {user?.role === 'admin' && 'Full access — manage users, all tasks, and system settings.'}
              {user?.role === 'manager' && 'Team management — assign tasks, view team analytics.'}
              {user?.role === 'employee' && 'Personal tasks — manage your own tasks and view dashboard.'}
            </p>
          </div>
        </Card>
      </motion.div>

      <div className="flex justify-end">
        <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} size="lg">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
