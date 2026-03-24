import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
import { loginUser, clearError } from '../components/store/slices/authSlice';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

const FEATURES = [
  'Drag & drop Kanban board',
  'Role-based access control',
  'Analytics & productivity scores',
  'Calendar & recurring tasks',
];

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const validateField = (field: string, value: string) => {
    const e: Record<string, string> = { ...errors };
    if (field === 'email') {
      if (!value.trim()) e.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(value)) e.email = 'Enter a valid email';
      else delete e.email;
    }
    if (field === 'password') {
      if (!value) e.password = 'Password is required';
      else delete e.password;
    }
    setErrors(e);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateField('email', value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validateField('password', value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Record<string, string> = {};
    if (!email.trim()) validationErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) validationErrors.email = 'Enter a valid email';
    if (!password) validationErrors.password = 'Password is required';
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    await dispatch(loginUser({ email: email.trim(), password }));
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--surface)]"
    >
      {/* ══════════════════════════════════════════
          LEFT — Brand panel (hidden on mobile)
      ══════════════════════════════════════════ */}
      <div
        className="hidden lg:flex flex-col flex-1 relative overflow-hidden p-12"
        style={{
          background: 'linear-gradient(135deg, #201f4e 0%, #343585 40%, #5655ea 100%)',
        }}
      >
        {/* Ambient orbs */}
        <div
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{
            top: '20%', left: '15%',
            width: 300, height: 300,
            background: 'rgba(99,112,245,0.25)',
          }}
        />
        <div
          className="absolute rounded-full blur-2xl pointer-events-none"
          style={{
            bottom: '25%', right: '10%',
            width: 220, height: 220,
            background: 'rgba(161,140,253,0.2)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-display font-bold text-xl tracking-tight">TaskFlow</span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1
              className="font-display font-bold leading-tight mb-4"
              style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', color: '#fff' }}
            >
              Manage your work,<br />
              <span style={{ color: '#a5bcfd' }}>effortlessly.</span>
            </h1>
            <p style={{ color: '#c7d7fe', fontSize: '1.05rem', maxWidth: 340, lineHeight: 1.7 }}>
              Advanced task planning with Kanban boards, team collaboration, and real-time insights.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-10"
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3 text-[#e0e9ff]">
                <div
                  className="w-[22px] h-[22px] rounded-full flex-shrink-0 bg-[rgba(99,112,245,0.3)] border border-[rgba(161,140,253,0.4)] flex items-center justify-center"
                >
                  <div className="w-[6px] h-[6px] rounded-full bg-[#a5bcfd]" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — Form panel
      ══════════════════════════════════════════ */}
      <div
        className="flex-1 lg:flex-none flex items-center justify-center bg-[var(--surface-2)] p-[clamp(24px,5vw,48px)]"
        style={{
          width: '100%',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[400px]"
        >
          {/* Mobile-only logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-10">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: '#5655ea', boxShadow: '0 4px 14px rgba(86,85,234,0.35)' }}
            >
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-[var(--text)]">
              TaskFlow
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2
              className="font-display font-bold text-[clamp(1.6rem,4vw,2rem)] text-[var(--text)] mb-2"
            >
              Welcome back
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={handleEmailChange}
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email}
              required
              autoComplete="email"
              autoFocus
            />

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                      padding: 0,
                    }}
                    tabIndex={-1}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password}
                required
                autoComplete="current-password"
              />
            </div>

            {/* Submit */}
            <div className="mt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-lg border-none cursor-pointer disabled:cursor-not-allowed disabled:bg-[#7e7ef5] bg-[#5655ea] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:shadow-none shadow-[0_4px_14px_rgba(86,85,234,0.35)] hover:bg-[#4a44d0] hover:shadow-[0_6px_20px_rgba(86,85,234,0.45)] active:scale-95"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin"
                      width={18} height={18} viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={2.5}
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div
            className="flex items-center gap-3 my-6 text-[var(--text-muted)]"
          >
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs whitespace-nowrap">
              Don't have an account?
            </span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Register link */}
          <Link
            to="/register"
            className="flex items-center justify-center w-full h-11.5 rounded-lg border-1.5 border-[var(--border)] bg-transparent text-[var(--text)] text-sm font-medium no-underline transition-all duration-200 hover:border-[#6370f5] hover:bg-[rgba(99,112,245,0.06)] hover:text-[#6370f5]"
          >
            Create a free account
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
