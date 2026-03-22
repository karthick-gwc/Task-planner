import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppRedux';
import { registerUser, clearError } from '../components/store/slices/authSlice';
import { Button } from '../components/ui/Button' ;
import { Input, Select } from '../components/ui/Input';
import toast from 'react-hot-toast';


export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await dispatch(registerUser({ name: form.name, email: form.email, password: form.password, role: form.role as any }));
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-glow-sm">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-xl">TaskFlow</span>
        </div>

        <div className="bg-[var(--surface-2)] rounded-2xl border border-[var(--border)] p-8">
          <h2 className="text-2xl font-bold text-[var(--text)] font-display mb-1">Create account</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">Start managing your tasks like a pro</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Alex Morgan"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
              error={errors.name}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email}
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPass((v) => !v)}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password}
            />
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              options={[
                { value: 'employee', label: 'Employee — Personal tasks' },
                { value: 'manager', label: 'Manager — Team management' },
                { value: 'admin', label: 'Admin — Full access' },
              ]}
            />
            <Button type="submit" loading={isLoading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// const RegisterPage: React.FC = () => {
//   return <div>Register Page</div>;
// };

// export default RegisterPage;
