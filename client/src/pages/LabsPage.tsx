import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FlaskConical, ArrowRight, ShieldAlert, Target, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { SecurityLab } from '../types';
import { useToast } from '../context/ToastContext';

export const LabsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get('agentId');
  const { showToast } = useToast();

  const [labs, setLabs] = useState<SecurityLab[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLabs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/labs');
      setLabs(res.data.labs || []);
    } catch {
      showToast('Failed to load security labs.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
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
            TEST ENVIRONMENT
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Oops! Labs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Safely break AI agents in controlled environments. Select a threat scenario to simulate.
          </p>
        </div>

        {agentId && (
          <div className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            Targeting Agent ID: <span className="font-bold">{agentId.slice(0, 8)}...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {labs.map((lab, index) => (
          <div
            key={lab.id}
            className="cyber-card p-6 flex flex-col justify-between hover:border-cyan-500/40 transition group relative"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                  lab.difficulty === 'beginner'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    : lab.difficulty === 'intermediate'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                    : 'bg-rose-950 text-rose-300 border-rose-500/40'
                }`}>
                  {lab.difficulty}
                </span>
                <span className="text-slate-400 font-mono text-xs">#0{index + 1}</span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition mb-1.5">
                {lab.name}
              </h3>

              <div className="text-[11px] font-mono text-cyan-400/90 mb-2">
                Vector: {lab.threat_type}
              </div>

              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                {lab.description}
              </p>

              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 truncate">
                  <Target className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{lab.affected_resource}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800">
              <Link
                to={`/labs/${lab.id}${agentId ? `?agentId=${agentId}` : ''}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-850 hover:bg-cyan-500 hover:text-slate-950 text-white font-bold text-xs transition border border-slate-700"
              >
                Launch Simulation <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
