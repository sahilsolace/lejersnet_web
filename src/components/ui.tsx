import { type ReactNode } from 'react';
import { Spinner } from './Spinner';

interface Props {
  children?: ReactNode;
  className?: string;
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function Card({ children, className = '' }: Props) {
  return (
    <div className={`bg-card rounded-card border border-border shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  ...rest
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };
  const variants = {
    primary: 'bg-navy text-white hover:bg-navy-dark shadow-sm',
    secondary: 'bg-accent text-white hover:bg-accent/90 shadow-sm',
    outline:
      'bg-transparent text-navy border-2 border-navy/20 hover:border-navy/40 hover:bg-navy/5',
    ghost: 'bg-transparent text-ink-muted hover:bg-bg hover:text-ink',
    danger: 'bg-danger text-white hover:bg-danger/90 shadow-sm',
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}

export function Badge({
  children,
  color = 'accent',
}: {
  children: ReactNode;
  color?: 'accent' | 'success' | 'warning' | 'danger' | 'navy' | 'muted';
}) {
  const map = {
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    navy: 'bg-navy/10 text-navy',
    muted: 'bg-ink-muted/10 text-ink-muted',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${map[color]}`}
    >
      {children}
    </span>
  );
}

export function Chip({
  active,
  children,
  onClick,
  icon,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
        active
          ? 'bg-navy text-white border-navy'
          : 'bg-white text-ink-muted border-border hover:border-navy/30 hover:text-navy'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

export function Input({
  label,
  error,
  className = '',
  ...rest
}: { label?: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label && (
        <span className="block text-xs font-medium text-ink-muted mb-1.5">
          {label}
        </span>
      )}
      <input
        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-ink placeholder:text-ink-muted/50 transition-colors ${
          error
            ? 'border-danger/60 focus:border-danger'
            : 'border-border focus:border-accent'
        } ${className}`}
        {...rest}
      />
      {error && <span className="block text-xs text-danger mt-1">{error}</span>}
    </label>
  );
}

export function Textarea({
  label,
  error,
  className = '',
  ...rest
}: { label?: string; error?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      {label && (
        <span className="block text-xs font-medium text-ink-muted mb-1.5">
          {label}
        </span>
      )}
      <textarea
        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-ink placeholder:text-ink-muted/50 transition-colors ${
          error ? 'border-danger/60' : 'border-border focus:border-accent'
        } ${className}`}
        {...rest}
      />
      {error && <span className="block text-xs text-danger mt-1">{error}</span>}
    </label>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="w-14 h-14 rounded-2xl bg-bg flex items-center justify-center text-ink-muted mb-4">
        {icon}
      </div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && (
        <p className="text-sm text-ink-muted mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-semibold text-ink">{children}</h2>
      {action}
    </div>
  );
}
