import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
import { loginUser, clearError } from '../components/store/slices/authSlice';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@taskplanner.io', role: 'Full access' },
  { label: 'Manager', email: 'manager@taskplanner.io', role: 'Team management' },
  { label: 'Employee', email: 'employee@taskplanner.io', role: 'Personal tasks' },
];

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState('admin@taskplanner.io');
  const [password, setPassword] = useState('password123');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen bg-surface-dark flex">
      {/* Left: Decorative Panel */}
      <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 relative overflow-hidden p-12">
        {/* Animated background orbs */}
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-brand-600/30 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 h-48 w-48 rounded-full bg-brand-400/20 blur-2xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-display font-bold text-xl">TaskFlow</span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-4xl font-bold text-white font-display leading-tight mb-4">
              Manage your work,<br />
              <span className="text-brand-300">effortlessly.</span>
            </h1>
            <p className="text-brand-200 text-lg max-w-sm">
              Advanced task planning with Kanban boards, team collaboration, and real-time insights.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10 space-y-3">
            {[
              'Drag & drop Kanban board',
              'Role-based access control',
              'Analytics & productivity scores',
              'Calendar & recurring tasks',
            ].map((feature, i) => (
              <div key={feature} className="flex items-center gap-3 text-brand-100">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Demo account chips */}
        {/* <div className="relative z-10">
          <p className="text-xs text-brand-300 mb-2 uppercase tracking-wide font-medium">Demo accounts (password: password123)</p>
          <div className="flex gap-2 flex-wrap">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => setEmail(acc.email)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors border border-white/10"
              >
                {acc.label} — {acc.role}
              </button>
            ))}
          </div>
        </div> */}
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8 bg-surface-dark">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">TaskFlow</span>
          </div>

          <h2 className="text-3xl font-bold text-white font-display mb-2">Welcome back</h2>
          <p className="text-[var(--text-muted)] mb-8">Sign in to continue to your workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              required
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPass((v) => !v)}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              required
            />

            <Button type="submit" loading={isLoading} className="w-full" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">Sign up free</Link>
          </p>

          {/* Quick demo login */}
          <div className="mt-6 border-t border-[var(--border)] pt-6 lg:hidden">
            <p className="text-xs text-[var(--text-muted)] mb-3 text-center">Quick demo access</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => setEmail(acc.email)}
                  className="px-2 py-2 rounded-xl bg-[var(--surface-3)] hover:bg-brand-600/10 hover:border-brand-500 border border-[var(--border)] text-[var(--text)] text-xs transition-colors"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
