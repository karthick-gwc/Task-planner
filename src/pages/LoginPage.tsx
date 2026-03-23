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

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please enter your email and password.');
      return;
    }
    await dispatch(loginUser({ email: email.trim(), password }));
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col lg:flex-row"
      style={{ background: 'var(--surface)' }}
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
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#e0e9ff' }}>
                <div
                  style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(99,112,245,0.3)',
                    border: '1px solid rgba(161,140,253,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a5bcfd' }} />
                </div>
                <span style={{ fontSize: '0.875rem' }}>{f}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — Form panel
      ══════════════════════════════════════════ */}
      <div
        className="flex-1 lg:flex-none flex items-center justify-center"
        style={{
          background:    'var(--surface-2)',
          width:         '100%',
          padding:       'clamp(24px, 5vw, 48px) clamp(20px, 5vw, 48px)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          {/* Mobile-only logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-10">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: '#5655ea', boxShadow: '0 4px 14px rgba(86,85,234,0.35)' }}
            >
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>
              TaskFlow
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h2
              className="font-display font-bold"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2rem)', color: 'var(--text)', marginBottom: 6 }}
            >
              Welcome back
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Email */}
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
              autoComplete="email"
              autoFocus
            />

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                required
                autoComplete="current-password"
              />
            </div>

            {/* Submit */}
            <div style={{ marginTop: 4 }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width:          '100%',
                  height:         48,
                  borderRadius:   12,
                  border:         'none',
                  cursor:         isLoading ? 'not-allowed' : 'pointer',
                  background:     isLoading ? '#7e7ef5' : '#5655ea',
                  color:          '#fff',
                  fontSize:       '0.95rem',
                  fontWeight:     600,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            8,
                  transition:     'background 0.2s, transform 0.1s, box-shadow 0.2s',
                  boxShadow:      isLoading ? 'none' : '0 4px 14px rgba(86,85,234,0.35)',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background  = '#4a44d0';
                    e.currentTarget.style.transform   = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow   = '0 6px 20px rgba(86,85,234,0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background  = '#5655ea';
                    e.currentTarget.style.transform   = 'translateY(0)';
                    e.currentTarget.style.boxShadow   = '0 4px 14px rgba(86,85,234,0.35)';
                  }
                }}
                onMouseDown={(e) => {
                  if (!isLoading) e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
                }}
                onMouseUp={(e) => {
                  if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)';
                }}
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
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              margin: '24px 0', color: 'var(--text-muted)',
            }}
          >
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
              Don't have an account?
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Register link */}
          <Link
            to="/register"
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          '100%',
              height:         46,
              borderRadius:   12,
              border:         '1.5px solid var(--border)',
              background:     'transparent',
              color:          'var(--text)',
              fontSize:       '0.9rem',
              fontWeight:     500,
              textDecoration: 'none',
              transition:     'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#6370f5';
              e.currentTarget.style.background  = 'rgba(99,112,245,0.06)';
              e.currentTarget.style.color       = '#6370f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background  = 'transparent';
              e.currentTarget.style.color       = 'var(--text)';
            }}
          >
            Create a free account
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
