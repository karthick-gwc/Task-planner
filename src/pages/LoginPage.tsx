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

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ve: Record<string, string> = {};
    if (!email.trim()) ve.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) ve.email = 'Enter a valid email';
    if (!password) ve.password = 'Password is required';
    setErrors(ve);
    if (Object.keys(ve).length > 0) return;
    await dispatch(loginUser({ email: email.trim(), password }));
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--surface)]">

  
      <div className=" w-full flex items-center justify-center bg-[var(--surface-2)] p-6 sm:p-10 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-10">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-brand-600 shadow-[0_4px_14px_rgba(86,85,234,0.35)]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-[var(--text)]">TaskFlow</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--text)] mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); validateField('email', e.target.value); }}
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email}
              required
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); validateField('password', e.target.value); }}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="text-[var(--text-muted)] flex items-center p-0 bg-transparent border-none cursor-pointer"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl border-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_14px_rgba(86,85,234,0.35)] hover:shadow-[0_6px_20px_rgba(86,85,234,0.45)] active:scale-95"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6 text-[var(--text-muted)]">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs whitespace-nowrap">Don't have an account?</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Register link */}
          <Link
            to="/register"
            className="flex items-center justify-center w-full h-11 rounded-xl border border-[var(--border)] bg-transparent text-[var(--text)] text-sm font-medium no-underline transition-all duration-200 hover:border-brand-500 hover:bg-brand-500/6 hover:text-brand-500"
          >
            Create a free account
          </Link>
        </motion.div>
      </div>
    </div>
  );
}