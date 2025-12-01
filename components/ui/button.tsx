import { ButtonHTMLAttributes, ReactElement, ReactNode, cloneElement } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  asChild?: boolean;
}

export function Button({ variant = 'primary', className, children, asChild = false, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-brand text-white hover:bg-brand-dark focus:ring-brand',
    secondary: 'bg-white text-brand border border-brand hover:bg-brand/10 focus:ring-brand',
    ghost: 'text-brand hover:bg-brand/10 focus:ring-brand'
  };

  if (asChild && children && typeof children === 'object') {
    const child = children as ReactElement;
    return cloneElement(child, {
      className: clsx(base, variants[variant], child.props.className, className)
    });
  }

  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
