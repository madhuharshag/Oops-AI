import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  ArrowLeft, 
  Wrench, 
  Database, 
  ShieldAlert, 
  FlaskConical, 
  Trash2, 
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { Agent, Attack } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { useToast } from '../context/ToastContext';

export const AgentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [recentAttacks, setRecentAttacks] = useState<Attack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAgent = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/agents/${id}`);
      setAgent(res.data.agent);
      setRecentAttacks(res.data.recentAttacks || []);
    } catch {
      showToast('Agent not found or access denied.', 'error');
      navigate('/agents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgent();
  }, [id]);

  const handleDelete = async () => {
    if (!agent || !confirm(`Permanently delete agent '${agent.name}'?`)) return;
    try {
      await api.delete(`/agents/${agent.id}`);
      showToast('Agent deleted.', 'info');
      navigate('/agents');
    } catch {
      showToast('Failed to delete agent.', 'error');
    }
  };

  if (isLoading || !agent) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <Link
            to="/agents"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Agent Registry
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white">{agent.name}</h1>
            <RiskBadge level={agent.risk_level} size="md" />
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold uppercase">
              {agent.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:bg-rose-900/50 transition"
            title="Delete Agent"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <Link
            to={`/labs?agentId=${agent.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
          >
            <FlaskConical className="w-4 h-4" />
            Test in Oops! Labs
          </Link>
        </div>
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="cyber-card p-6 lg:col-span-2 space-y-5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Primary Purpose
            </span>
            <p className="text-sm text-slate-200 mt-1 font-medium">{agent.purpose}</p>
          </div>

          {agent.description && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Operational Context
              </span>
              <p className="text-xs text-slate-400 mt-1">{agent.description}</p>
            </div>
          )}

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Capabilities
            </span>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((c, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-slate-850 text-cyan-300 border border-slate-700 font-mono text-xs">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <Wrench className="w-3.5 h-3.5 text-amber-400" /> Authorized Tools
              </span>
              <div className="space-y-1">
                {agent.available_tools.map((t, i) => (
                  <div key={i} className="text-xs font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-850">
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                <Database className="w-3.5 h-3.5 text-cyan-400" /> Accessible Downstream Assets
              </span>
              <div className="space-y-1">
                {agent.accessible_resources.map((r, i) => (
                  <div key={i} className="text-xs font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-850">
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security Summary Card */}
        <div className="cyber-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" /> Threat Posture
          </h3>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Data Sensitivity:</span>
              <span className="text-rose-400 font-mono uppercase font-bold">{agent.data_sensitivity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tests Recorded:</span>
              <span className="text-slate-200 font-mono font-bold">{recentAttacks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Created At:</span>
              <span className="text-slate-400 font-mono text-[11px]">{new Date(agent.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-300">
            <strong>Recommended Action:</strong> Run the <em>Indirect Prompt Injection Lab</em> against this agent to verify document-to-egress guardrails.
          </div>
        </div>
      </div>

      {/* Recent Attack Simulations Against This Agent */}
      <div className="cyber-card overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Attack History for {agent.name}</h3>
            <p className="text-xs text-slate-400">Simulation executions and verification replays</p>
          </div>
          <Link
            to={`/labs?agentId=${agent.id}`}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-semibold"
          >
            + Run New Attack
          </Link>
        </div>

        {recentAttacks.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">
            No attack simulations recorded yet for this agent.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {recentAttacks.map((attack) => (
              <div key={attack.id} className="p-4 hover:bg-slate-850/40 transition flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{attack.attack_type}</span>
                    {attack.is_replay && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                        REPLAY
                      </span>
                    )}
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      attack.outcome === 'blocked'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    }`}>
                      {attack.outcome}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono truncate max-w-md">
                    Target: {attack.target_resource} | Payload: {attack.attack_input.slice(0, 60)}...
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <RiskBadge level={attack.risk_level} score={attack.risk_score} size="sm" />
                  <Link
                    to={`/attacks/${attack.id}`}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-semibold flex items-center gap-1"
                  >
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
