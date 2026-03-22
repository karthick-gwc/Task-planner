import React from 'react';
import { cn } from '../utils';

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, helperText, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--text)]">{label}</label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-10 rounded-xl border bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--text-muted)]',
            'border-[var(--border)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            'text-sm px-3 outline-none transition-all duration-150',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {helperText && !error && <p className="text-xs text-[var(--text-muted)]">{helperText}</p>}
    </div>
  )
);
Input.displayName = 'Input';

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[var(--text)]">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full h-10 rounded-xl border bg-[var(--surface-2)] text-[var(--text)]',
          'border-[var(--border)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          'text-sm px-3 outline-none transition-all duration-150 cursor-pointer',
          error && 'border-red-500',
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-[var(--text)]">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-xl border bg-[var(--surface-2)] text-[var(--text)] placeholder:text-[var(--text-muted)]',
          'border-[var(--border)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
          'text-sm px-3 py-2.5 outline-none transition-all duration-150 resize-none',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
