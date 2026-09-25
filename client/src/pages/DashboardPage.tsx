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
import { useTheme } from '../context/ThemeContext';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { EmptyState } from '../components/EmptyState';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';
  const chartTextColor = isDark ? '#94a3b8' : '#475569';
  const chartTooltipBg = isDark ? '#0d1117' : '#ffffff';
  const chartTooltipBorder = isDark ? '#212836' : '#e2e8f0';
  const chartTooltipColor = isDark ? '#f8fafc' : '#0f172a';
  const barFill = isDark ? '#06b6d4' : '#0284c7';

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
        <div className="flex flex-col items-center gap-3 text-cyan-600 dark:text-cyan-400 font-mono text-sm">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            SECURITY COMMAND CONSOLE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-primary tracking-tight mt-1">
            Welcome back, {user?.name || 'Operator'}
          </h1>
          <p className="text-xs sm:text-sm text-secondary mt-1">
            AI Agent Threat Surface & Behavioral Verification Center
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/agents/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 dark:bg-cyan-500 hover:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            Create Agent
          </Link>
          <Link
            to="/labs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border hover:bg-surface-muted text-primary font-semibold text-xs transition"
          >
            <FlaskConical className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Open Oops! Labs
          </Link>
          <Link
            to="/policies"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border hover:bg-surface-muted text-primary font-semibold text-xs transition"
          >
            <Scale className="w-4 h-4 text-amber-500" />
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
                <h3 className="text-sm font-bold text-primary mb-1">Defense Interception Ratio</h3>
                <p className="text-xs text-secondary">Simulation outcomes across all agents</p>
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
                        contentStyle={{ 
                          background: chartTooltipBg, 
                          borderColor: chartTooltipBorder, 
                          color: chartTooltipColor, 
                          borderRadius: '8px', 
                          fontSize: '12px' 
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs font-mono text-muted text-center">
                    Execute an attack simulation to populate outcome telemetry.
                  </div>
                )}
              </div>

              <div className="flex justify-around text-xs font-mono pt-3 border-t border-border">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Blocked: {data?.outcomeCounts?.blocked || 0}
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Exploited: {data?.outcomeCounts?.success || 0}
                </span>
              </div>
            </div>

            {/* Attacks by Threat Category */}
            <div className="cyber-card p-6 lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-primary mb-1">Attacks by Threat Category</h3>
                <p className="text-xs text-secondary">Frequency of simulated attack vectors</p>
              </div>

              <div className="h-52 my-2">
                {attacksByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attacksByType} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis 
                        dataKey="type" 
                        stroke={chartTextColor} 
                        fontSize={10} 
                        tickLine={false} 
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis stroke={chartTextColor} fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          background: chartTooltipBg, 
                          borderColor: chartTooltipBorder, 
                          color: chartTooltipColor, 
                          borderRadius: '8px', 
                          fontSize: '12px' 
                        }}
                      />
                      <Bar dataKey="count" fill={barFill} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs font-mono text-muted">
                    No threat vector telemetry logged yet.
                  </div>
                )}
              </div>

              <div className="text-[11px] text-muted font-mono text-right">
                Telemetry source: PostgreSQL / Oops! Security Engine
              </div>
            </div>
          </div>

          {/* Recent Security Events Table */}
          <div className="cyber-card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-primary">Recent Security Events</h3>
                <p className="text-xs text-secondary">Latest attack simulations and policy enforcement events</p>
              </div>
              <Link to="/attacks" className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-mono flex items-center gap-1 font-semibold">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentEvents.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-muted">
                No attack events recorded yet. Visit Oops! Labs to trigger your first simulation.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-muted text-secondary font-mono uppercase text-[10px] border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Threat Type</th>
                      <th className="py-3 px-4">Outcome</th>
                      <th className="py-3 px-4">Risk Level</th>
                      <th className="py-3 px-4">Sensitive Data</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-secondary">
                    {recentEvents.map((evt: any) => (
                      <tr key={evt.id} className="hover:bg-surface-muted transition">
                        <td className="py-3 px-4 font-mono text-[11px] text-muted">
                          {new Date(evt.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3 px-4 font-semibold text-primary">
                          {evt.attackType}
                          {evt.isReplay && (
                            <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">
                              REPLAY
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                            evt.outcome === 'blocked'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40'
                              : evt.outcome === 'requires_approval'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/40'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/40'
                          }`}>
                            {evt.outcome}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <RiskBadge level={evt.riskLevel} score={evt.riskScore} size="sm" />
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          {evt.sensitiveData ? (
                            <span className="text-rose-600 dark:text-rose-400 font-bold">DETECTED</span>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/attacks/${evt.id}`}
                            className="font-mono text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
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
