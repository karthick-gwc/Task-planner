import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
import { registerUser, clearError } from '../components/store/slices/authSlice';
import { Input, Select } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { ListTodo } from "lucide-react";


const ROLE_OPTIONS = [
  { value: 'employee', label: 'Employee — Personal tasks' },
];

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  const [form,     setForm]     = useState({ name: '', email: '', password: '', role: 'employee' });
  const [showPass, setShowPass] = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())                     e.name     = 'Full name is required';
    if (!form.email.trim())                    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email   = 'Enter a valid email';
    if (form.password.length < 8)              e.password = 'Min. 8 characters required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await dispatch(registerUser({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role as any }));
  };

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => { const ne = { ...e }; delete ne[k]; return ne; });
  };

  const strength = form.password.length === 0 ? null
    : form.password.length < 6  ? 'weak'
    : form.password.length < 10 ? 'fair'
    : 'strong';

  const strengthColor = strength === 'weak' ? 'text-red-500'
    : strength === 'fair'   ? 'text-amber-500'
    : strength === 'strong' ? 'text-emerald-500'
    : '';

  const strengthBg = strength === 'weak' ? 'bg-red-500'
    : strength === 'fair'   ? 'bg-amber-500'
    : strength === 'strong' ? 'bg-emerald-500'
    : 'bg-[var(--border)]';

  const strengthWidth = strength === 'weak' ? 'w-1/3' : strength === 'fair' ? 'w-2/3' : 'w-full';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--surface)] p-5 sm:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px]"
      >
        {/* Logo */}
        

<div className="flex items-center justify-center gap-2 mb-7">
  <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-brand-600 shadow-[0_4px_16px_rgba(86,85,234,0.35)]">
    <ListTodo className="h-5 w-5 text-white animate-pulse" />
  </div>
  <span className="font-display font-bold text-xl text-[var(--text)]">
    Task Manager
  </span>
</div>

        {/* Card */}
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-6 sm:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="mb-7">
            <h2 className="font-display font-bold text-2xl sm:text-[1.75rem] text-[var(--text)] mb-1.5">
              Create your account
            </h2>
            <p className="text-sm text-[var(--text-muted)]">Start managing tasks like a pro</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              placeholder="Alex Morgan"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
              error={errors.name}
              autoComplete="name"
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email}
              autoComplete="email"
            />

            {/* Password + strength bar */}
            <div className="flex flex-col gap-2">
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="text-[var(--text-muted)] flex items-center bg-transparent border-none cursor-pointer p-0"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password}
                autoComplete="new-password"
              />

              {form.password.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-[3px] rounded-full bg-[var(--surface-3)] overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthBg} ${strengthWidth}`} />
                  </div>
                  <span className={`text-[0.7rem] font-semibold min-w-[36px] ${strengthColor}`}>
                    {strength}
                  </span>
                </div>
              )}
            </div>

            {/* Role */}
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              options={ROLE_OPTIONS}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-1 rounded-xl border-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 bg-brand-600 hover:bg-brand-700 text-white text-[0.95rem] font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_4px_14px_rgba(86,85,234,0.35)] hover:shadow-[0_6px_20px_rgba(86,85,234,0.45)] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                  </svg>
                  Creating account…
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[0.75rem] text-center mt-4 text-[var(--text-muted)] leading-relaxed">
            Your data is saved securely to your workspace.
          </p>

          <div className="h-px bg-[var(--border)] my-4" />

          <p className="text-center text-sm text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-500 font-semibold no-underline hover:text-brand-400 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}