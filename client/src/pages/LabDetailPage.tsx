import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  FlaskConical, 
  ArrowLeft, 
  Target, 
  ShieldAlert, 
  Play, 
  Bot, 
  Terminal, 
  RefreshCw,
  Info,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { SecurityLab, Agent } from '../types';
import { useToast } from '../context/ToastContext';

export const LabDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preSelectedAgentId = searchParams.get('agentId');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [lab, setLab] = useState<SecurityLab | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [attackInput, setAttackInput] = useState<string>('');
  const [targetResource, setTargetResource] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [labRes, agentsRes] = await Promise.all([
          api.get(`/labs/${id}`),
          api.get('/agents'),
        ]);

        const labData: SecurityLab = labRes.data.lab;
        const agentList: Agent[] = agentsRes.data.agents || [];

        setLab(labData);
        setAgents(agentList);
        setAttackInput(labData.default_payload || '');
        setTargetResource(labData.affected_resource || 'customer_database');

        if (preSelectedAgentId && agentList.some(a => a.id === preSelectedAgentId)) {
          setSelectedAgentId(preSelectedAgentId);
        } else if (agentList.length > 0) {
          setSelectedAgentId(agentList[0].id);
        }
      } catch {
        showToast('Failed to load lab scenario.', 'error');
        navigate('/labs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, preSelectedAgentId]);

  const handleExecuteAttack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId) {
      showToast('Please select or create an AI agent first.', 'warning');
      return;
    }

    setIsExecuting(true);
    showToast('Launching controlled adversarial simulation...', 'info');

    try {
      const res = await api.post('/attacks', {
        agent_id: selectedAgentId,
        lab_id: lab?.id,
        attack_type: lab?.threat_type || 'Prompt Injection',
        attack_input: attackInput,
        target_resource: targetResource,
      });

      showToast('Simulation complete! Analyzing telemetry...', 'success');
      navigate(`/attacks/${res.data.attack.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Attack execution failed.';
      showToast(msg, 'error');
      setIsExecuting(false);
    }
  };

  if (isLoading || !lab) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      <Link
        to="/labs"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Oops! Labs
      </Link>

      <div className="cyber-card p-6 sm:p-8 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                lab.difficulty === 'beginner'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  : lab.difficulty === 'intermediate'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                  : 'bg-rose-950 text-rose-300 border-rose-500/40'
              }`}>
                {lab.difficulty} Difficulty
              </span>
              <span className="text-xs font-mono text-cyan-400">
                Threat: {lab.threat_type}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{lab.name}</h1>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-400">
            Affected Resource: <span className="text-rose-400 font-semibold">{lab.affected_resource}</span>
          </div>
        </div>

        {/* Lab Objectives & Threat Scenario Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase font-mono text-cyan-400 flex items-center gap-1.5">
              <Target className="w-4 h-4" /> Testing Objective
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{lab.objective}</p>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase font-mono text-amber-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Threat Scenario
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{lab.attack_scenario}</p>
          </div>
        </div>

        <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 mb-8 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span><strong>Expected Security Guardrail:</strong> {lab.expected_behavior}</span>
        </div>

        {/* Attack Launcher Form */}
        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            Attack Simulation Launcher
          </h3>

          {agents.length === 0 ? (
            <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-3">
              <p className="text-sm text-slate-400">
                You must register at least one AI agent to launch this simulation.
              </p>
              <Link
                to="/agents/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold"
              >
                Create Agent (e.g. Finance Assistant)
              </Link>
            </div>
          ) : (
            <form onSubmit={handleExecuteAttack} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Target AI Agent
                  </label>
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.data_sensitivity} — {a.risk_level} risk)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                    Target Resource / Data Store
                  </label>
                  <input
                    type="text"
                    required
                    value={targetResource}
                    onChange={(e) => setTargetResource(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Adversarial Test Input Payload
                </label>
                <textarea
                  rows={4}
                  required
                  value={attackInput}
                  onChange={(e) => setAttackInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isExecuting}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 disabled:opacity-50 text-white font-bold text-sm transition shadow-lg shadow-rose-600/30"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Simulating Attack Execution...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      Run Controlled Attack
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
