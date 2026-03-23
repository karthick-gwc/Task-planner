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
  ({ label, error, leftIcon, rightIcon, helperText, className, style, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          className="text-sm font-medium"
          style={{ color: 'var(--text)' }}
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {/* Left icon — absolutely positioned, never overlaps text */}
        {leftIcon && (
          <span
            className="pointer-events-none absolute left-0 top-0 bottom-0 flex items-center justify-center"
            style={{ width: '44px', color: 'var(--text-muted)' }}
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          className={cn(
            'w-full h-11 rounded-xl border text-sm outline-none transition-all duration-150',
            className
          )}
          style={{
            background:   'var(--surface-3)',
            borderColor:  error ? '#ef4444' : 'var(--border)',
            color:        'var(--text)',
            paddingLeft:  leftIcon  ? '44px' : '14px',
            paddingRight: rightIcon ? '44px' : '14px',
            boxShadow:    'none',
            ...style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? '#ef4444' : '#6370f5';
            e.currentTarget.style.boxShadow   = error
              ? '0 0 0 3px rgba(239,68,68,0.15)'
              : '0 0 0 3px rgba(99,112,245,0.15)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--border)';
            e.currentTarget.style.boxShadow   = 'none';
            props.onBlur?.(e);
          }}
          {...props}
        />

        {/* Right icon */}
        {rightIcon && (
          <span
            className="absolute right-0 top-0 bottom-0 flex items-center justify-center"
            style={{ width: '44px', color: 'var(--text-muted)' }}
          >
            {rightIcon}
          </span>
        )}
      </div>

      {error      && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      {helperText && !error && (
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{helperText}</p>
      )}
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
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn('w-full h-11 rounded-xl border text-sm px-3 outline-none transition-all cursor-pointer', className)}
        style={{
          background:  'var(--surface-3)',
          borderColor: error ? '#ef4444' : 'var(--border)',
          color:       'var(--text)',
        }}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
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
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn('w-full rounded-xl border text-sm px-3 py-2.5 outline-none transition-all resize-none', className)}
        style={{
          background:  'var(--surface-3)',
          borderColor: error ? '#ef4444' : 'var(--border)',
          color:       'var(--text)',
        }}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
