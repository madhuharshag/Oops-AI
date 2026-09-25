import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, RefreshCw, ShieldCheck, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { SecurityReport } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const [reports, setReports] = useState<SecurityReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/reports');
      setReports(res.data.reports || []);
    } catch {
      showToast('Failed to load security reports.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
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
            AUDIT DOCUMENTATION
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Executive Security Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Formal assessment reports with before/after defense verification, telemetry, and mitigations.
          </p>
        </div>

        <Link
          to="/attacks"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs border border-slate-700 transition"
        >
          View Attack Simulations
        </Link>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          title="No security reports generated."
          description="Execute an attack simulation and click 'Generate Report' to compile an executive audit document."
          primaryActionText="Go to Attack Simulations"
          primaryActionLink="/attacks"
          secondaryActionText="Open Oops! Labs"
          secondaryActionLink="/labs"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const data = report.report_data;
            const isBlocked = data.attack?.outcome === 'blocked';

            return (
              <div
                key={report.id}
                className="cyber-card p-6 flex flex-col justify-between hover:border-cyan-500/40 transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {new Date(report.created_at).toLocaleDateString([], { dateStyle: 'medium' })}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      isBlocked
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    }`}>
                      {isBlocked ? 'MITIGATED' : 'VULNERABLE'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition mb-2">
                    {data.title || `Assessment: ${data.agent?.name}`}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                    {data.executiveSummary}
                  </p>

                  <div className="py-2.5 border-y border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Agent:</span>
                      <span className="text-white font-semibold">{data.agent?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vector:</span>
                      <span className="text-cyan-300">{data.attack?.type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Risk Score:</span>
                      <RiskBadge level={data.attack?.risk_level || 'low'} score={data.attack?.risk_score} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
                  <Link
                    to={`/reports/${report.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 font-mono transition"
                  >
                    Read Full Report <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
