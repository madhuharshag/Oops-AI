import React from 'react';
import { AttackTimelineEvent } from '../types';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, Clock } from 'lucide-react';

export const TimelineView: React.FC<{ events: AttackTimelineEvent[] }> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-sm text-slate-500 py-4 text-center font-mono">
        No audit events recorded for this session.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
      {events.map((evt, idx) => {
        const statusConfig = {
          success: {
            icon: CheckCircle2,
            iconClass: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40',
            badgeClass: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30',
          },
          warning: {
            icon: AlertTriangle,
            iconClass: 'text-amber-400 bg-amber-950/80 border-amber-500/40',
            badgeClass: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
          },
          critical: {
            icon: AlertOctagon,
            iconClass: 'text-rose-400 bg-rose-950/80 border-rose-500/40',
            badgeClass: 'text-rose-400 bg-rose-950/40 border-rose-500/30',
          },
          info: {
            icon: Info,
            iconClass: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/40',
            badgeClass: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30',
          },
        }[evt.status || 'info'];

        const Icon = statusConfig.icon;

        return (
          <div key={idx} className="relative group">
            {/* Timeline bullet icon */}
            <div className={`absolute -left-[30px] top-0.5 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${statusConfig.iconClass}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>

            <div className="cyber-card p-4 transition-all duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  {evt.step}
                </span>
                <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(evt.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {evt.description}
              </p>

              {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                    Event Telemetry:
                  </div>
                  <pre className="text-[11px] font-mono text-cyan-300/90 bg-slate-950/80 p-2 rounded border border-slate-800/60 overflow-x-auto">
                    {JSON.stringify(evt.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
