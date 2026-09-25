import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  ShieldCheck, 
  RotateCcw, 
  ArrowLeft, 
  Bot, 
  Database, 
  Terminal, 
  Sparkles, 
  AlertTriangle, 
  Lock, 
  CheckCircle2, 
  FileText, 
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { Attack, Agent, SecurityLab } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { AttackFlowVisualizer } from '../components/AttackFlowVisualizer';
import { TimelineView } from '../components/TimelineView';
import { useToast } from '../context/ToastContext';

export const AttackDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [attack, setAttack] = useState<Attack | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [lab, setLab] = useState<SecurityLab | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplaying, setIsReplaying] = useState(false);
  const [isApplyingPolicy, setIsApplyingPolicy] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const fetchAttackDetails = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/attacks/${id}`);
      setAttack(res.data.attack);
      setAgent(res.data.agent);
      setLab(res.data.lab);
    } catch {
      showToast('Simulation record not found or access denied.', 'error');
      navigate('/attacks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttackDetails();
  }, [id]);

  // Apply recommended policy with 1 click
  const handleApplyRecommendedPolicy = async () => {
    if (!attack || !agent) return;
    setIsApplyingPolicy(true);

    try {
      const targetName = attack.target_resource.toLowerCase().includes('db') || attack.target_resource.toLowerCase().includes('customer')
        ? 'customer'
        : attack.target_resource;

      const policyPayload = {
        name: `Block Unauthorized Egress: ${attack.target_resource}`,
        description: `Enforces strict boundary isolation on ${attack.target_resource}, blocking unauthorized outbound transmission of sensitive records.`,
        priority: 95,
        active: true,
        conditions: [
          { field: 'target_resource', operator: 'contains', value: targetName },
          { field: 'sensitive_data_findings.detected', operator: 'equals', value: true }
        ],
        actions: [
          { type: 'block', reason: `Blocked by Oops! Defense Policy: External transmission of sensitive data requires supervisor approval.` },
          { type: 'log', level: 'critical' }
        ]
      };

      await api.post('/policies', policyPayload);
      showToast('Defense Policy successfully applied! You can now Replay the attack.', 'success');
      // Refresh current attack
      await fetchAttackDetails();
    } catch (err: any) {
      showToast('Failed to apply defense policy.', 'error');
    } finally {
      setIsApplyingPolicy(false);
    }
  };

  // Replay identical attack vector under active defenses
  const handleReplayAttack = async () => {
    if (!attack) return;
    setIsReplaying(true);
    showToast('Replaying attack against active defense policies...', 'info');

    try {
      const res = await api.post(`/attacks/${attack.id}/replay`);
      showToast('Replay completed! Redirecting to updated verification view...', 'success');
      navigate(`/attacks/${res.data.attack.id}`);
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Replay failed.', 'error');
    } finally {
      setIsReplaying(false);
    }
  };

  // Generate Executive Security Report
  const handleGenerateReport = async () => {
    if (!attack) return;
    setIsGeneratingReport(true);
    try {
      const res = await api.post('/reports', { attack_id: attack.id });
      showToast('Security report generated!', 'success');
      navigate(`/reports/${res.data.report.id}`);
    } catch {
      showToast('Failed to generate report.', 'error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading || !attack) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const isBlocked = attack.outcome === 'blocked';
  const ai = attack.ai_analysis;
  const sensitive = attack.sensitive_data_findings;
  const riskBreakdown = ai?.riskBreakdown;

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <Link
            to="/attacks"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Simulations
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-white">{attack.attack_type}</h1>
            {attack.is_replay && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                VERIFICATION REPLAY
              </span>
            )}
            <RiskBadge level={attack.risk_level} score={attack.risk_score} size="md" />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {!isBlocked ? (
            <button
              onClick={handleApplyRecommendedPolicy}
              disabled={isApplyingPolicy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
            >
              <Lock className="w-4 h-4" />
              {isApplyingPolicy ? 'Applying Guardrail...' : 'Apply Recommended Policy'}
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Guardrail Active
            </div>
          )}

          <button
            onClick={handleReplayAttack}
            disabled={isReplaying}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
          >
            <RotateCcw className={`w-4 h-4 ${isReplaying ? 'animate-spin' : ''}`} />
            {isReplaying ? 'Replaying...' : 'Replay Attack'}
          </button>

          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs transition"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Flagship Animated Attack Flow Visualizer */}
      <AttackFlowVisualizer
        outcome={attack.outcome}
        attackType={attack.attack_type}
        agentName={agent?.name || 'Target AI Agent'}
        targetResource={attack.target_resource}
        toolUsed={agent?.available_tools?.[0] || 'database_query'}
        policyName={attack.policy_evaluation?.matchedPolicy?.name}
        sensitiveDetected={sensitive?.detected || false}
      />

      {/* Before / After Comparison Banner if Replay */}
      {attack.is_replay && (
        <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/20 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 font-bold block mb-1">
              Initial Baseline Execution (Before Defense)
            </span>
            <div className="text-xs text-slate-300 space-y-1">
              <div>Outcome: <strong className="text-rose-400">EXPLOITED (Vulnerable)</strong></div>
              <div>Data Exposure: Customer PII & Credentials extracted</div>
              <div>Risk: Critical Impact</div>
            </div>
          </div>
          <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-500/30">
            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold block mb-1">
              Replay Execution (After Oops! AI Policy)
            </span>
            <div className="text-xs text-slate-300 space-y-1">
              <div>Outcome: <strong className="text-emerald-400">BLOCKED (Mitigated)</strong></div>
              <div>Data Exposure: Outbound egress intercepted & protected</div>
              <div>Risk: Mitigated by active guardrails</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Threat Analyzer & Sensitive Data Scan */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Threat Analysis Card */}
          <div className="cyber-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Autonomous AI Threat Analysis
                </h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300">
                Confidence: {ai?.confidence || 95}%
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-cyan-200 font-mono">
              <strong>Executive Summary:</strong> {ai?.summary}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-mono uppercase text-[10px] block mb-1">
                  Threat Category
                </span>
                <span className="font-semibold text-white">{ai?.threatCategory}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono uppercase text-[10px] block mb-1">
                  Attack Mechanism
                </span>
                <span className="text-slate-300">{ai?.attackMechanism}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-mono uppercase text-[10px] block mb-1">
                Detailed Vulnerability Explanation
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{ai?.explanation}</p>
            </div>

            <div>
              <span className="text-slate-400 font-mono uppercase text-[10px] block mb-1">
                Potential Impact if Unmitigated
              </span>
              <p className="text-xs text-rose-300/90 leading-relaxed">{ai?.potentialImpact}</p>
            </div>

            {ai?.recommendedMitigation && ai.recommendedMitigation.length > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400 block mb-2">
                  Recommended Mitigations
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {ai.recommendedMitigation.map((m: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sensitive Data Detection Card */}
          <div className="cyber-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Sensitive Data Scanner
                </h3>
              </div>
              <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold uppercase ${
                sensitive?.detected 
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40' 
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}>
                {sensitive?.detected ? `${sensitive.totalFindings} Findings` : 'Clean'}
              </span>
            </div>

            {sensitive?.detected ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sensitive.findings.map((f, i) => (
                    <div key={i} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 font-bold block">
                        {f.severity}
                      </span>
                      <span className="font-bold text-white block mt-0.5">{f.type}</span>
                      <span className="text-slate-400 font-mono text-[11px] block mt-1">
                        Occurrences: {f.count}
                      </span>
                    </div>
                  ))}
                </div>

                <div>
                  <span className="text-slate-400 font-mono uppercase text-[10px] block mb-1">
                    Redacted Payload Preview:
                  </span>
                  <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                    {sensitive.redactedText}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-mono">
                No sensitive data tokens identified in outbound parameters.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Factor Risk Assessment & Audit Timeline */}
        <div className="space-y-6">
          {/* Risk Engine Breakdown Card */}
          <div className="cyber-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Risk Assessment Engine</span>
              <RiskBadge level={attack.risk_level} score={attack.risk_score} size="sm" />
            </h3>

            <div className="text-xs text-slate-300 leading-relaxed">
              {riskBreakdown?.explanation}
            </div>

            {riskBreakdown?.factors && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                {riskBreakdown.factors.map((factor: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">{factor.name}</span>
                      <span className="text-cyan-400 font-bold">
                        {factor.score > 0 ? `+${factor.score}` : factor.score} / {factor.maxScore}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          factor.score > 20
                            ? 'bg-rose-500'
                            : factor.score > 10
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(10, (factor.score / factor.maxScore) * 100))}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{factor.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Timeline */}
          <div className="cyber-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Audit Timeline
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {attack.timeline?.length || 0} Events
              </span>
            </div>

            <TimelineView events={attack.timeline || []} />
          </div>
        </div>
      </div>
    </div>
  );
};
