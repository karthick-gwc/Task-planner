import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Shield, User, Palette, Save, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
import { setTheme } from '../components/store/slices/uiSlice';
import { Avatar } from '../components/ui';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

// ─── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({
  icon,
  title,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-5 sm:p-6"
  >
    {/* Section header */}
    <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[var(--border)]">
      <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-500/10 shrink-0">
        {icon}
      </span>
      <h2 className="text-[var(--text)] font-bold text-[0.95rem] font-display m-0">{title}</h2>
    </div>
    {children}
  </motion.div>
);

// ─── Toggle switch ─────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    aria-checked={checked}
    role="switch"
    className={`relative w-11 h-6 rounded-full border-none cursor-pointer transition-colors duration-200 shrink-0 focus-visible:outline-2 focus-visible:outline-brand-500 focus-visible:outline-offset-2 ${
      checked ? 'bg-brand-600' : 'bg-[var(--border)]'
    }`}
  >
    <span
      className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

// ─── Main component ────────────────────────────────────────────────────────────
export function SettingsPage() {
  const dispatch        = useAppDispatch();
  const { theme }       = useAppSelector((s) => s.ui);
  const { user }        = useAppSelector((s) => s.auth);
  const [name, setName] = useState(user?.name ?? '');
  const [notif, setNotif] = useState({
    email:    true,
    inApp:    true,
    overdue:  true,
    reminder: true,
  });

  const handleSave = () => toast.success('Settings saved!');

  const NOTIF_ITEMS: { key: keyof typeof notif; label: string; desc: string }[] = [
    { key: 'email',    label: 'Email Notifications',  desc: 'Receive task reminders via email' },
    { key: 'inApp',    label: 'In-App Notifications', desc: 'Show notifications inside the app' },
    { key: 'overdue',  label: 'Overdue Alerts',        desc: 'Alert when tasks become overdue' },
    { key: 'reminder', label: 'Due Date Reminders',    desc: 'Remind me 24 h before due date' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 pb-8 px-4 sm:px-0">

      {/* ── Page heading ── */}
      <div>
        <h1 className="text-[var(--text)] font-bold text-2xl sm:text-[1.6rem] font-display m-0">
          Settings
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1.5">
          Manage your preferences and account
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          PROFILE
      ══════════════════════════════════════════════════════════════ */}
      <Section
        icon={<User className="w-4 h-4 text-brand-500" />}
        title="Profile"
      >
        {/* Avatar row */}
        <div className="flex items-center gap-3.5 mb-5 p-3.5 sm:p-4 rounded-xl bg-[var(--surface-3)]">
          {user && <Avatar name={user.name} size="lg" />}
          <div className="min-w-0">
            <p className="text-[var(--text)] font-semibold text-[0.95rem] m-0 truncate">
              {user?.name}
            </p>
            <p className="text-[var(--text-muted)] text-xs mt-1 capitalize truncate">
              {user?.role} · {user?.email}
            </p>
          </div>
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-3.5">
          <Input
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Email Address"
            value={user?.email ?? ''}
            disabled
            helperText="Email cannot be changed"
            className="opacity-60"
          />
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          APPEARANCE
      ══════════════════════════════════════════════════════════════ */}
      <Section
        icon={<Palette className="w-4 h-4 text-brand-500" />}
        title="Appearance"
        delay={0.08}
      >
        <p className="text-[var(--text-muted)] text-sm mb-3.5">
          Choose your preferred theme
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['light', 'dark'] as const).map((t) => {
            const active = theme === t;
            return (
              <button
                key={t}
                onClick={() => dispatch(setTheme(t))}
                className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 text-left w-full ${
                  active
                    ? 'border-brand-500 bg-brand-500/8'
                    : 'border-[var(--border)] bg-[var(--surface-3)] hover:border-brand-400/50'
                }`}
              >
                {t === 'light'
                  ? <Sun  className="w-5 h-5 text-amber-400 shrink-0" />
                  : <Moon className="w-5 h-5 text-brand-400 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text)] font-semibold text-sm m-0 capitalize">
                    {t} Mode
                  </p>
                  <p className="text-[var(--text-muted)] text-[0.72rem] mt-0.5">
                    {t === 'light' ? 'Clean and bright' : 'Easy on the eyes'}
                  </p>
                </div>
                {active && (
                  <span className="w-[18px] h-[18px] rounded-full bg-brand-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          NOTIFICATIONS
      ══════════════════════════════════════════════════════════════ */}
      <Section
        icon={<Bell className="w-4 h-4 text-brand-500" />}
        title="Notifications"
        delay={0.16}
      >
        <div className="flex flex-col divide-y divide-[var(--border)]">
          {NOTIF_ITEMS.map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-[var(--text)] font-medium text-sm m-0">{label}</p>
                <p className="text-[var(--text-muted)] text-[0.775rem] mt-0.5">{desc}</p>
              </div>
              <Toggle
                checked={notif[key]}
                onChange={() => setNotif((n) => ({ ...n, [key]: !n[key] }))}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
          ROLE & PERMISSIONS
      ══════════════════════════════════════════════════════════════ */}
      <Section
        icon={<Shield className="w-4 h-4 text-brand-500" />}
        title="Role & Permissions"
        delay={0.24}
      >
        <div className="p-3.5 sm:p-4 rounded-xl bg-[var(--surface-3)] border border-[var(--border)]">
          <p className="text-[var(--text)] font-medium text-sm m-0 mb-1.5">
            Current Role:{' '}
            <span className="text-brand-400 font-bold capitalize">{user?.role}</span>
          </p>
          <p className="text-[var(--text-muted)] text-[0.78rem] m-0 leading-relaxed">
            {user?.role === 'admin'    && 'Full access — manage users, all tasks, and system settings.'}
            {user?.role === 'manager'  && 'Team management — assign tasks, view team analytics.'}
            {user?.role === 'employee' && 'Personal tasks — manage your own tasks and view dashboard.'}
          </p>
        </div>
      </Section>

      {/* ── Save button ── */}
      <div className="flex justify-end pt-1 pb-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-none bg-brand-600 text-white text-sm font-semibold cursor-pointer shadow-[0_3px_12px_rgba(86,85,234,0.3)] transition-colors duration-200 hover:bg-brand-700 active:scale-[0.97]"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}