import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Bot, 
  Wrench, 
  Database, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight, 
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface AttackFlowProps {
  outcome: 'blocked' | 'success' | 'requires_approval' | 'sanitized' | 'failed' | string;
  attackType: string;
  agentName: string;
  targetResource: string;
  toolUsed?: string;
  policyName?: string;
  sensitiveDetected: boolean;
}

export const AttackFlowVisualizer: React.FC<AttackFlowProps> = ({
  outcome,
  attackType,
  agentName,
  targetResource,
  toolUsed = 'database_query',
  policyName,
  sensitiveDetected,
}) => {
  const isBlocked = outcome === 'blocked';
  const isApproved = outcome === 'requires_approval';
  const isVulnerable = outcome === 'success';

  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev >= 5 ? 0 : prev + 1));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const nodes = [
    {
      id: 0,
      title: 'Malicious Input',
      sub: attackType,
      icon: Terminal,
      color: 'rose',
      desc: 'Adversarial payload injected',
    },
    {
      id: 1,
      title: 'AI Agent',
      sub: agentName,
      icon: Bot,
      color: 'cyan',
      desc: 'Ingests prompt & plans actions',
    },
    {
      id: 2,
      title: 'Tool Dispatched',
      sub: toolUsed,
      icon: Wrench,
      color: 'amber',
      desc: 'Requests privileged tool invocation',
    },
    {
      id: 3,
      title: 'Sensitive Asset',
      sub: targetResource,
      icon: Database,
      color: sensitiveDetected ? 'rose' : 'slate',
      desc: sensitiveDetected ? 'Customer PII / Secrets located' : 'Asset queried',
    },
    {
      id: 4,
      title: 'Policy Engine',
      sub: policyName || (isBlocked ? 'Guardrail Active' : 'No Defense Active'),
      icon: ShieldAlert,
      color: isBlocked ? 'emerald' : isApproved ? 'amber' : 'rose',
      desc: isBlocked ? 'Matched blocking rules' : 'Permitted egress',
    },
    {
      id: 5,
      title: 'Final Outcome',
      sub: isBlocked ? 'BLOCKED' : isApproved ? 'REQUIRES APPROVAL' : 'EXPLOITED',
      icon: isBlocked ? ShieldCheck : isApproved ? AlertTriangle : XCircle,
      color: isBlocked ? 'emerald' : isApproved ? 'amber' : 'rose',
      desc: isBlocked ? 'Attack neutralized safely' : 'Unauthorized data exposed',
    },
  ];

  return (
    <div className="cyber-card p-6 border-cyan-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950/90">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400">
            Interactive Attack Flow Simulation
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Execution Path Analysis
            {isBlocked ? (
              <span className="cyber-badge bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                <Lock className="w-3 h-3" /> Mitigated
              </span>
            ) : (
              <span className="cyber-badge bg-rose-950/80 border border-rose-500/50 text-rose-300 animate-pulse">
                <Unlock className="w-3 h-3" /> Vulnerable
              </span>
            )}
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          Target: <span className="text-cyan-300 font-semibold">{targetResource}</span>
        </div>
      </div>

      {/* Grid Flow on Mobile, Horizontal on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 relative">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isActive = activeStep === index;
          const isPassed = activeStep > index;

          const colorClasses = {
            rose: 'border-rose-500/40 bg-rose-950/20 text-rose-400',
            cyan: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-400',
            amber: 'border-amber-500/40 bg-amber-950/20 text-amber-400',
            emerald: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
            slate: 'border-slate-700 bg-slate-900/50 text-slate-300',
          }[node.color];

          return (
            <div key={node.id} className="flex flex-col items-center text-center relative group">
              {/* Connector line for desktop */}
              {index < nodes.length - 1 && (
                <div className="hidden md:block absolute top-7 left-1/2 w-full h-[2px] bg-slate-800 -z-0 pointer-events-none">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isPassed ? 'bg-cyan-500/70' : 'bg-transparent'
                    }`} 
                  />
                </div>
              )}

              <div
                className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-all duration-300 z-10 ${colorClasses} ${
                  isActive ? 'ring-2 ring-cyan-400 scale-105 shadow-lg shadow-cyan-500/20' : 'opacity-85'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>

              <div className="mt-3">
                <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 block">
                  Step 0{index + 1}
                </span>
                <h4 className="text-xs font-bold text-white mt-0.5 truncate max-w-[120px]">
                  {node.title}
                </h4>
                <p className="text-[11px] font-mono text-cyan-300 truncate max-w-[120px] mt-0.5">
                  {node.sub}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                  {node.desc}
                </p>
              </div>

              {/* Mobile down arrow */}
              {index < nodes.length - 1 && (
                <div className="md:hidden my-2 text-slate-600">
                  ↓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Outcome Banner */}
      <div className={`mt-6 p-4 rounded-xl border flex items-center justify-between gap-4 transition-all duration-300 ${
        isBlocked 
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          : isApproved
          ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
      }`}>
        <div className="flex items-center gap-3">
          {isBlocked ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          ) : isApproved ? (
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
          )}
          <div>
            <div className="text-sm font-bold">
              {isBlocked
                ? 'Attack Prevented by Active Defense'
                : isApproved
                ? 'Supervisory Intervention Required'
                : 'Exploit Succeeded — Agent Boundary Compromised'}
            </div>
            <div className="text-xs opacity-85 mt-0.5">
              {isBlocked
                ? `Policy engine blocked access to ${targetResource}. No sensitive data escaped.`
                : isApproved
                ? 'High-risk action intercepted; awaiting explicit authorization.'
                : `Untrusted payload manipulated agent into querying ${targetResource} and exposing records.`}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75">
            Security Status
          </span>
          <span className="text-xs font-mono font-bold">
            {isBlocked ? 'MITIGATED' : isApproved ? 'HOLD' : 'ACTION REQUIRED'}
          </span>
        </div>
      </div>
    </div>
  );
};
