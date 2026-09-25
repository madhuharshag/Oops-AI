import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
  FlaskConical, 
  ShieldAlert, 
  Scale, 
  BarChart3, 
  FileText, 
  Settings,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Agents', to: '/agents', icon: Bot },
  { name: 'Oops! Labs', to: '/labs', icon: FlaskConical },
  { name: 'Attack Simulations', to: '/attacks', icon: ShieldAlert },
  { name: 'Defense Policies', to: '/policies', icon: Scale },
  { name: 'Security Analytics', to: '/analytics', icon: BarChart3 },
  { name: 'Reports', to: '/reports', icon: FileText },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col shrink-0 min-h-[calc(100vh-4rem)] transition-colors">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>OPS-GUARD: ACTIVE</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold border-l-2 border-cyan-600 dark:border-cyan-400 shadow-sm'
                    : 'text-secondary hover:text-primary hover:bg-surface-muted'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Quick Docs Link */}
      <div className="p-4 border-t border-border space-y-2">
        <a
          href="/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-muted border border-border text-xs text-secondary hover:text-cyan-600 dark:hover:text-cyan-400 transition"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5" />
            OpenAPI Spec
          </span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <div className="px-3 py-1 text-[11px] text-muted font-mono">
          Oops! AI Engine v2.1
        </div>
      </div>
    </aside>
  );
};
