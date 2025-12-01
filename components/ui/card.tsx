import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function Card({ children, className, title, description }: CardProps) {
  return (
    <div className={clsx('rounded-xl border border-slate-200 bg-white p-6 shadow-sm', className)}>
      {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
      {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      <div className={clsx((title || description) && 'mt-4')}>{children}</div>
    </div>
  );
}
