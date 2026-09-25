import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, RefreshCw, FlaskConical, RotateCcw } from 'lucide-react';
import { api } from '../services/api';
import { Attack } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const AttacksPage: React.FC = () => {
  const { showToast } = useToast();
  const [attacks, setAttacks] = useState<Attack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttacks = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/attacks');
      setAttacks(res.data.attacks || []);
    } catch {
      showToast('Failed to load attack simulations.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttacks();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            SECURITY ASSESSMENTS
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Attack Simulations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical audit logs of adversarial attack vectors, guardrail checks, and replay verifications.
          </p>
        </div>

        <Link
          to="/labs"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
        >
          <FlaskConical className="w-4 h-4" />
          Launch New Test in Labs
        </Link>
      </div>

      {attacks.length === 0 ? (
        <EmptyState
          title="No attack simulations recorded."
          description="Select an AI agent and launch a scenario in Oops! Labs to test prompt injection and tool guardrails."
          primaryActionText="Go to Oops! Labs"
          primaryActionLink="/labs"
        />
      ) : (
        <div className="cyber-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-4">Threat Type</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Sensitive Data</th>
                  <th className="py-3 px-4 text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {attacks.map((attack) => (
                  <tr key={attack.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(attack.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{attack.attack_type}</span>
                        {attack.is_replay && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                            REPLAY
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-300 text-[11px]">
                      {attack.target_resource}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                        attack.outcome === 'blocked'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : attack.outcome === 'requires_approval'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}>
                        {attack.outcome}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={attack.risk_level} score={attack.risk_score} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {attack.sensitive_data_findings?.detected ? (
                        <span className="text-rose-400 font-bold">DETECTED</span>
                      ) : (
                        <span className="text-slate-500">Clean</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/attacks/${attack.id}`}
                        className="font-mono text-cyan-400 hover:text-cyan-300 font-semibold underline"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
