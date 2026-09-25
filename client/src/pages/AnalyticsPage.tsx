import React, { useEffect, useState } from 'react';
import { BarChart3, ShieldCheck, ShieldAlert, Database, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { useToast } from '../context/ToastContext';

export const AnalyticsPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/analytics');
      setData(res.data);
    } catch {
      showToast('Failed to load analytics telemetry.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const riskData = [
    { name: 'Critical', value: data?.riskDistribution?.critical || 0, color: '#f43f5e' },
    { name: 'High', value: data?.riskDistribution?.high || 0, color: '#f59e0b' },
    { name: 'Medium', value: data?.riskDistribution?.medium || 0, color: '#eab308' },
    { name: 'Low', value: data?.riskDistribution?.low || 0, color: '#10b981' },
  ].filter(d => d.value > 0);

  const sensitiveEntries = Object.entries(data?.sensitiveCategoryCounts || {}).map(([type, count]) => ({
    type,
    count,
  }));

  const timelineTrends = data?.timelineTrends || [];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="pb-6 border-b border-slate-800">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
          TELEMETRY & INSIGHTS
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight mt-1">
          Security Analytics & Posture
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Aggregated behavioral metrics, risk levels, and vulnerability trends across simulations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Level Distribution Pie */}
        <div className="cyber-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Risk Severity Distribution</h3>
            <p className="text-xs text-slate-400">Classification breakdown across all test cases</p>
          </div>

          <div className="h-56 my-2 flex items-center justify-center">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#0d1117', borderColor: '#212836', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs font-mono text-slate-500">
                Execute attack simulations to view risk breakdown.
              </div>
            )}
          </div>

          <div className="flex justify-around text-xs font-mono pt-3 border-t border-slate-800">
            {riskData.map((r, i) => (
              <span key={i} className="flex items-center gap-1.5" style={{ color: r.color }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                {r.name}: {r.value}
              </span>
            ))}
          </div>
        </div>

        {/* Sensitive Data Category Frequency */}
        <div className="cyber-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Sensitive Data Leakage Vector Counts</h3>
            <p className="text-xs text-slate-400">Total detected sensitive tokens by data classification</p>
          </div>

          <div className="h-56 my-2">
            {sensitiveEntries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sensitiveEntries} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis 
                    dataKey="type" 
                    stroke="#64748b" 
                    fontSize={10} 
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ background: '#0d1117', borderColor: '#212836', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                No sensitive data tokens detected in recent simulations.
              </div>
            )}
          </div>

          <div className="text-[11px] font-mono text-slate-400 text-right">
            Detection: Regex-based pattern scanner
          </div>
        </div>
      </div>

      {/* Historical Score Trend */}
      <div className="cyber-card p-6">
        <h3 className="text-sm font-bold text-white mb-1">Simulation Risk Score Trend (Recent 15 Runs)</h3>
        <p className="text-xs text-slate-400 mb-4">Historical risk fluctuation and defense efficacy</p>

        <div className="h-64">
          {timelineTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineTrends} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ background: '#0d1117', borderColor: '#212836', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="riskScore" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  dot={{ fill: '#06b6d4', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
              Run simulations to generate score trend lines.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
