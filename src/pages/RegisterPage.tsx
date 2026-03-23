import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
import { registerUser, clearError } from '../components/store/slices/authSlice';
import { Input, Select } from '../components/ui/Input';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  { value: 'employee', label: 'Employee — Personal tasks' },
  { value: 'manager',  label: 'Manager — Team management' },
  { value: 'admin',    label: 'Admin — Full access' },
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
    if (!form.name.trim())                  e.name     = 'Full name is required';
    if (!form.email.trim())                 e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 8)           e.password = 'Min. 8 characters required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await dispatch(registerUser({
      name:     form.name.trim(),
      email:    form.email.trim(),
      password: form.password,
      role:     form.role as any,
    }));
  };

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => { const ne = { ...e }; delete ne[k]; return ne; });
  };

  const strength = form.password.length === 0 ? null
    : form.password.length < 6  ? 'weak'
    : form.password.length < 10 ? 'fair'
    : 'strong';

  const strengthColor = strength === 'weak' ? '#ef4444'
    : strength === 'fair'   ? '#f59e0b'
    : strength === 'strong' ? '#10b981'
    : 'var(--border)';

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        background: 'var(--surface)',
        padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 24px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-center gap-2"
          style={{ marginBottom: 28 }}
        >
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center"
            style={{ background: '#5655ea', boxShadow: '0 4px 16px rgba(86,85,234,0.35)' }}
          >
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl" style={{ color: 'var(--text)' }}>
            TaskFlow
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background:   'var(--surface-2)',
            border:       '1px solid var(--border)',
            borderRadius: 20,
            padding:      'clamp(24px, 4vw, 36px)',
            boxShadow:    '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ marginBottom: 28 }}>
            <h2
              className="font-display font-bold"
              style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.75rem)', color: 'var(--text)', marginBottom: 6 }}
            >
              Create your account
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Start managing tasks like a pro
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Name */}
            <Input
              label="Full Name"
              placeholder="Alex Morgan"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
              error={errors.name}
              autoComplete="name"
            />

            {/* Email */}
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

            {/* Password + strength */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 0,
                    }}
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password}
                autoComplete="new-password"
              />

              {/* Strength bar */}
              {form.password.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      flex: 1, height: 3, borderRadius: 99,
                      background: 'var(--surface-3)', overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: strength === 'weak' ? '33%' : strength === 'fair' ? '66%' : '100%',
                        background: strengthColor,
                        borderRadius: 99,
                        transition: 'width 0.3s, background 0.3s',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: strengthColor, fontWeight: 600, minWidth: 36 }}>
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
                    e.currentTarget.style.background = '#4a44d0';
                    e.currentTarget.style.transform  = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow  = '0 6px 20px rgba(86,85,234,0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = '#5655ea';
                    e.currentTarget.style.transform  = 'translateY(0)';
                    e.currentTarget.style.boxShadow  = '0 4px 14px rgba(86,85,234,0.35)';
                  }
                }}
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
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <p
            style={{
              fontSize: '0.75rem', textAlign: 'center', marginTop: 16,
              color: 'var(--text-muted)', lineHeight: 1.6,
            }}
          >
            Your data is saved securely to your workspace.
          </p>

          <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: '#6370f5', fontWeight: 600, textDecoration: 'none' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
