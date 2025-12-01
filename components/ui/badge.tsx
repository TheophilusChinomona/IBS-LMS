import clsx from 'clsx';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'info';
}

export function Badge({ label, variant = 'info' }: BadgeProps) {
  const styles: Record<typeof variant, string> = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700'
  };
  return <span className={clsx('inline-flex rounded-full px-2 py-1 text-xs font-semibold', styles[variant])}>{label}</span>;
}
