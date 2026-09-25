import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical' | string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'md' }) => {
  const normalized = (level || 'low').toLowerCase();

  const config = {
    critical: {
      bg: 'bg-rose-950/70 border-rose-500/60 text-rose-300 shadow-rose-950/50',
      icon: AlertOctagon,
      label: 'Critical Risk',
    },
    high: {
      bg: 'bg-amber-950/70 border-amber-500/60 text-amber-300 shadow-amber-950/50',
      icon: ShieldAlert,
      label: 'High Risk',
    },
    medium: {
      bg: 'bg-yellow-950/70 border-yellow-500/60 text-yellow-300 shadow-yellow-950/50',
      icon: AlertTriangle,
      label: 'Medium Risk',
    },
    low: {
      bg: 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-emerald-950/50',
      icon: ShieldCheck,
      label: 'Low Risk',
    },
  }[normalized] || {
    bg: 'bg-slate-900 border-slate-700 text-slate-300',
    icon: ShieldCheck,
    label: normalized.toUpperCase(),
  };

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm font-semibold uppercase tracking-wider font-mono ${config.bg} ${sizeClasses}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="opacity-80 font-bold ml-0.5">({score})</span>
      )}
    </span>
  );
};
