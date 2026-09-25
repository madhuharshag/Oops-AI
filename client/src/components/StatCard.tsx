import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'cyan' | 'crimson' | 'emerald' | 'amber' | 'slate';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon: Icon,
  variant = 'cyan',
  trend,
}) => {
  const styles = {
    cyan: {
      border: 'hover:border-cyan-500/50',
      iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      valueColor: 'text-cyan-600 dark:text-cyan-400',
    },
    crimson: {
      border: 'hover:border-rose-500/50',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      valueColor: 'text-rose-600 dark:text-rose-400',
    },
    emerald: {
      border: 'hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
    amber: {
      border: 'hover:border-amber-500/50',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      valueColor: 'text-amber-600 dark:text-amber-400',
    },
    slate: {
      border: 'hover:border-slate-500/50',
      iconBg: 'bg-surface-muted text-secondary border-border',
      valueColor: 'text-primary',
    },
  }[variant];

  return (
    <div className={`cyber-card p-5 transition-all duration-200 ${styles.border}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary font-mono">
          {label}
        </span>
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-3xl font-extrabold tracking-tight font-mono ${styles.valueColor}`}>
          {value}
        </span>
        {trend && <span className="text-xs font-medium text-secondary">{trend}</span>}
      </div>
      {subtitle && <p className="text-xs text-secondary mt-1">{subtitle}</p>}
    </div>
  );
};
