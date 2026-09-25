import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, PlusCircle, ArrowRight, ShieldAlert, Wrench, Database, RefreshCw, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { Agent } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const AgentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/agents');
      setAgents(res.data.agents || []);
    } catch {
      showToast('Failed to load registered agents.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to delete AI agent profile '${name}'?`)) return;

    try {
      await api.delete(`/agents/${id}`);
      showToast(`Agent '${name}' removed.`, 'info');
      setAgents(prev => prev.filter(a => a.id !== id));
    } catch {
      showToast('Failed to delete agent.', 'error');
    }
  };

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
            SYSTEM ASSETS
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Registered AI Agents
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Define capabilities, tool permissions, and sensitivity ratings for attack testing.
          </p>
        </div>

        <Link
          to="/agents/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Agent
        </Link>
      </div>

      {agents.length === 0 ? (
        <EmptyState
          title="No AI agents registered."
          description="Register your AI agent profile to test against prompt injections and tool escalation scenarios."
          primaryActionText="Create Finance Assistant"
          primaryActionLink="/agents/new"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="cyber-card p-6 flex flex-col justify-between hover:border-cyan-500/40 transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">
                        {agent.name}
                      </h3>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Status: <span className="text-emerald-400 font-bold">{agent.status}</span>
                      </span>
                    </div>
                  </div>
                  <RiskBadge level={agent.risk_level} size="sm" />
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                  {agent.purpose}
                </p>

                {/* Capability & Resource metadata */}
                <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-400" /> Tools Granted:
                    </span>
                    <span className="text-slate-200 font-bold">
                      {agent.available_tools?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-cyan-400" /> Target Sensitivity:
                    </span>
                    <span className="text-rose-400 uppercase font-bold text-[11px]">
                      {agent.data_sensitivity}
                    </span>
                  </div>
                </div>

                {/* Tags preview */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {agent.capabilities?.slice(0, 3).map((c, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-850 text-slate-400 border border-slate-700">
                      {c}
                    </span>
                  ))}
                  {agent.capabilities?.length > 3 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-850 text-slate-400 border border-slate-700">
                      +{agent.capabilities.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={(e) => handleDelete(agent.id, agent.name, e)}
                  className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                  title="Delete Agent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/labs?agentId=${agent.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono font-medium border border-slate-700 transition"
                  >
                    Test Lab
                  </Link>
                  <Link
                    to={`/agents/${agent.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-cyan-400 transition"
                  >
                    Profile <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
