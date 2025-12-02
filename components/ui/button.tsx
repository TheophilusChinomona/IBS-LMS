import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  asChild?: boolean;
}

export function Button({ variant = 'primary', size = 'md', className, children, asChild = false, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2';
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-brand text-white hover:bg-brand-dark focus:ring-brand',
    secondary: 'bg-white text-brand border border-brand hover:bg-brand/10 focus:ring-brand',
    ghost: 'text-brand hover:bg-brand/10 focus:ring-brand'
  };

  // asChild: render children as-is but apply button styles via className override
  if (asChild && children && typeof children === 'object' && 'props' in children) {
    const child = children as React.ReactElement<{ className?: string }>;
    const mergedClassName = clsx(base, sizes[size], variants[variant], child.props.className, className);
    return (
      <span className={mergedClassName}>{child}</span>
    );
  }

  return (
    <button className={clsx(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
