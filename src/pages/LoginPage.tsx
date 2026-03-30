import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ListTodo,
  CheckCircle2, Users, BarChart3, Calendar, Zap,
  ClipboardList, TrendingUp, Bell,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
import { loginUser, clearError } from '../components/store/slices/authSlice';
import toast from 'react-hot-toast';

function validateField(field: string, value: string, prev: Record<string, string>) {
  const e = { ...prev };
  if (field === 'email') {
    if (!value.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(value)) e.email = 'Enter a valid email address';
    else delete e.email;
  }
  if (field === 'password') {
    if (!value) e.password = 'Password is required';
    else delete e.password;
  }
  return e;
}

const STAT_CARDS = [
  { label: 'Total Tasks', value: '128', color: '#6366f1' },
  { label: 'Completed',   value: '94',  color: '#10b981' },
  { label: 'In Progress', value: '21',  color: '#f59e0b' },
  { label: 'Overdue',     value: '13',  color: '#ef4444' },
];

const TASK_ROWS = [
  { title: 'Design system update',    status: 'In Progress', color: '#f59e0b' },
  { title: 'Fix authentication bug',  status: 'Pending',     color: '#ef4444' },
  { title: 'Deploy to production',    status: 'Completed',   color: '#10b981' },
  { title: 'Write unit tests',        status: 'Pending',     color: '#6366f1' },
  { title: 'Performance review',      status: 'In Progress', color: '#f59e0b' },
];

const BAR_H   = [40, 65, 50, 80, 60, 90, 75];
const BAR_DAY = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [touched,  setTouched]  = useState<Record<string, boolean>>({});

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value); else setPassword(value);
    if (touched[field]) setErrors((p) => validateField(field, value, p));
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((p) => validateField(field, value, p));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const ve = validateField('password', password, validateField('email', email, {}));
    setErrors(ve);
    if (Object.keys(ve).length > 0) return;
    await dispatch(loginUser({ email: email.trim(), password }));
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-[#0f0f13]">

      {/* Form */}
      <div className="w-full lg:w-[100%] flex flex-col  justify-center px-6 sm:px-12 md:px-16 lg:px-10 xl:px-20 py-12 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px] mx-auto"
        >
          {/* Logo */}
          <div className="flex items-center ml-30  gap-2.5 mb-10">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center"
                 style={{ boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
              <ListTodo style={{ width: 18, height: 18 }} className="text-white" />
            </div>
            <span className="font-bold text-[17px] tracking-tight text-gray-900 dark:text-white"
                  style={{ fontFamily: 'Sora, sans-serif' }}>
              TaskFlow
            </span>
          </div>
          <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-6 sm:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        
          {/* Heading */}
          <div className="mb-8">
            
            <h1 className="font-bold text-[30px] sm:text-[34px] text-gray-900 dark:text-white mb-2 leading-tight"
                style={{ fontFamily: 'Sora, sans-serif' }}>
              Welcome Back
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Enter your email and password to access your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={(e) => handleBlur('email', e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  autoFocus
                  className={[
                    'w-full h-11 pl-10 pr-4 rounded-xl border text-sm outline-none transition-all',
                    'bg-gray-50 dark:bg-[#1e1e28] text-gray-900 dark:text-white',
                    'placeholder:text-gray-400 dark:placeholder:text-gray-600',
                    errors.email
                      ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                      : 'border-gray-200 dark:border-[#2a2a38] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15',
                  ].join(' ')}
                />
              </div>
              {errors.email && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-[11.5px] text-red-500 flex items-center gap-1">
                  ⚠ {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={(e) => handleBlur('password', e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={[
                    'w-full h-11 pl-10 pr-11 rounded-xl border text-sm outline-none transition-all',
                    'bg-gray-50 dark:bg-[#1e1e28] text-gray-900 dark:text-white',
                    'placeholder:text-gray-400 dark:placeholder:text-gray-600',
                    errors.password
                      ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                      : 'border-gray-200 dark:border-[#2a2a38] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15',
                  ].join(' ')}
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-[11.5px] text-red-500 flex items-center gap-1">
                  ⚠ {errors.password}
                </motion.p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
            >
                               {isLoading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth={2.5}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                        strokeLinecap="round"/>
                </svg>
              ) : (
                <> Log In <ArrowRight className="h-4 w-4" /> </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-[#2a2a38]" />
            <span className="text-xs text-gray-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-[#2a2a38]" />
          </div>

          {/* Register */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register"
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-semibold transition-colors no-underline">
              Register Now.
            </Link>
          </p>
          </div>
        </motion.div>
      </div>

    
    </div>
  );
}