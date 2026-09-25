import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  FlaskConical, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Database, 
  PlusCircle, 
  FileText, 
  ArrowRight,
  RefreshCw,
  Scale
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { EmptyState } from '../components/EmptyState';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics/dashboard');
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to retrieve dashboard telemetry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3 text-cyan-400 font-mono text-sm">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span>LOADING SYSTEM TELEMETRY...</span>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalAgents: 0,
    securityTests: 0,
    threatsDetected: 0,
    attacksBlocked: 0,
    criticalRisks: 0,
    sensitiveDataEvents: 0,
    activePolicies: 0,
  };

  const outcomePieData = [
    { name: 'Blocked', value: data?.outcomeCounts?.blocked || 0, color: '#10b981' },
    { name: 'Exploited', value: data?.outcomeCounts?.success || 0, color: '#f43f5e' },
    { name: 'Held', value: data?.outcomeCounts?.requires_approval || 0, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  const attacksByType = data?.attacksByType || [];
  const recentEvents = data?.recentEvents || [];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            SECURITY COMMAND CONSOLE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Welcome back, {user?.name || 'Operator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            AI Agent Threat Surface & Behavioral Verification Center
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/agents/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            Create Agent
          </Link>
          <Link
            to="/labs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 font-semibold text-xs transition"
          >
            <FlaskConical className="w-4 h-4 text-cyan-400" />
            Open Oops! Labs
          </Link>
          <Link
            to="/policies"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 font-semibold text-xs transition"
          >
            <Scale className="w-4 h-4 text-amber-400" />
            Policy Engine
          </Link>
        </div>
      </div>

      {/* Empty State Banner if 0 agents registered (Section 23) */}
      {metrics.totalAgents === 0 ? (
        <EmptyState
          title="Your security workspace is empty."
          description="Register your first AI agent profile (e.g. Finance Assistant) to begin running adversarial simulations and verifying guardrails."
          primaryActionText="Create First Agent"
          primaryActionLink="/agents/new"
          secondaryActionText="Explore Oops! Labs"
          secondaryActionLink="/labs"
        />
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              label="Total Agents"
              value={metrics.totalAgents}
              icon={Bot}
              variant="slate"
              subtitle="Registered profiles"
            />
            <StatCard
              label="Security Tests"
              value={metrics.securityTests}
              icon={FlaskConical}
              variant="cyan"
              subtitle="Simulations executed"
            />
            <StatCard
              label="Threats Detected"
              value={metrics.threatsDetected}
              icon={ShieldAlert}
              variant="crimson"
              subtitle="Adversarial exploits"
            />
            <StatCard
              label="Attacks Blocked"
              value={metrics.attacksBlocked}
              icon={ShieldCheck}
              variant="emerald"
              subtitle="Defended by policy"
            />
            <StatCard
              label="Critical Risks"
              value={metrics.criticalRisks}
              icon={AlertTriangle}
              variant="amber"
              subtitle="Requires remediation"
            />
            <StatCard
              label="Sensitive Data Events"
              value={metrics.sensitiveDataEvents}
              icon={Database}
              variant="crimson"
              subtitle="PII/secret detections"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Outcome Distribution Pie */}
            <div className="cyber-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Defense Interception Ratio</h3>
                <p className="text-xs text-slate-400">Simulation outcomes across all agents</p>
              </div>

              <div className="h-48 my-2 flex items-center justify-center">
                {outcomePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={outcomePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {outcomePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ background: '#0d1117', borderColor: '#212836', borderRadius: '8px', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs font-mono text-slate-500 text-center">
                    Execute an attack simulation to populate outcome telemetry.
                  </div>
                )}
              </div>

              <div className="flex justify-around text-xs font-mono pt-3 border-t border-slate-800">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Blocked: {data?.outcomeCounts?.blocked || 0}
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Exploited: {data?.outcomeCounts?.success || 0}
                </span>
              </div>
            </div>

            {/* Attacks by Threat Category */}
            <div className="cyber-card p-6 lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Attacks by Threat Category</h3>
                <p className="text-xs text-slate-400">Frequency of simulated attack vectors</p>
              </div>

              <div className="h-52 my-2">
                {attacksByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attacksByType} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis 
                        dataKey="type" 
                        stroke="#64748b" 
                        fontSize={10} 
                        tickLine={false} 
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: '#0d1117', borderColor: '#212836', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                    No threat vector telemetry logged yet.
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-mono text-right">
                Telemetry source: PostgreSQL / Oops! Security Engine
              </div>
            </div>
          </div>

          {/* Recent Security Events Table */}
          <div className="cyber-card overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Recent Security Events</h3>
                <p className="text-xs text-slate-400">Latest attack simulations and policy enforcement events</p>
              </div>
              <Link to="/attacks" className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentEvents.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-500">
                No attack events recorded yet. Visit Oops! Labs to trigger your first simulation.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Threat Type</th>
                      <th className="py-3 px-4">Outcome</th>
                      <th className="py-3 px-4">Risk Level</th>
                      <th className="py-3 px-4">Sensitive Data</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {recentEvents.map((evt: any) => (
                      <tr key={evt.id} className="hover:bg-slate-850/50 transition">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {new Date(evt.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {evt.attackType}
                          {evt.isReplay && (
                            <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                              REPLAY
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                            evt.outcome === 'blocked'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                              : evt.outcome === 'requires_approval'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                          }`}>
                            {evt.outcome}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <RiskBadge level={evt.riskLevel} score={evt.riskScore} size="sm" />
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {evt.sensitiveData ? (
                            <span className="text-rose-400 font-bold">DETECTED</span>
                          ) : (
                            <span className="text-slate-500">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/attacks/${evt.id}`}
                            className="font-mono text-cyan-400 hover:text-cyan-300 underline font-medium"
                          >
                            Inspect →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
