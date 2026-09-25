import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ArrowLeft, 
  Printer, 
  ShieldCheck, 
  ShieldAlert, 
  Bot, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { SecurityReport } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { TimelineView } from '../components/TimelineView';
import { useToast } from '../context/ToastContext';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [report, setReport] = useState<SecurityReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/reports/${id}`);
        setReport(res.data.report);
      } catch {
        showToast('Report not found or unauthorized.', 'error');
        navigate('/reports');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (isLoading || !report) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const data = report.report_data;
  const isBlocked = data.attack?.outcome === 'blocked';

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
        <Link
          to="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Security Reports
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-medium text-xs border border-slate-700 transition"
        >
          <Printer className="w-3.5 h-3.5" /> Print / Export PDF
        </button>
      </div>

      {/* Main Report Document */}
      <div className="cyber-card p-8 sm:p-12 bg-slate-900/95 border-cyan-500/30 space-y-8 shadow-2xl">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold">
                CONFIDENTIAL AUDIT REPORT
              </span>
              <span className="text-xs font-mono text-slate-400">
                DOC-REF: {report.id.slice(0, 13)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{data.title}</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Generated on {new Date(data.generatedAt || report.created_at).toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
              Final Security Assessment
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold uppercase ${
              isBlocked 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' 
                : 'bg-rose-950 text-rose-300 border border-rose-500/50'
            }`}>
              {isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              {isBlocked ? 'DEFENDED & VERIFIED' : 'ACTION REQUIRED (VULNERABLE)'}
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
            01. Executive Summary
          </h2>
          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
            isBlocked
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
          }`}>
            {data.executiveSummary}
          </div>
        </section>

        {/* Agent Profile & Target Scope */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
            02. System & Target Scope
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 block mb-1">Target Agent Profile:</span>
              <span className="text-white font-bold">{data.agent?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Target Resource:</span>
              <span className="text-cyan-300 font-bold">{data.attack?.target_resource}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Sensitivity Rating:</span>
              <span className="text-rose-400 uppercase font-bold">{data.agent?.data_sensitivity}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Baseline Risk:</span>
              <RiskBadge level={data.attack?.risk_level} score={data.attack?.risk_score} size="sm" />
            </div>
          </div>
        </section>

        {/* Attack Vector & Findings */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
            03. Threat Mechanism & Findings
          </h2>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-mono uppercase text-[10px] block mb-1">
                Adversarial Input Payload
              </span>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-rose-300 font-mono text-[11px] whitespace-pre-wrap">
                {data.attack?.input}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-slate-400 font-mono uppercase text-[10px] block mb-1">
                  Threat Category
                </span>
                <span className="font-semibold text-white">{data.ai_findings?.threatCategory}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono uppercase text-[10px] block mb-1">
                  Attack Mechanism
                </span>
                <span className="text-slate-300">{data.ai_findings?.attackMechanism}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-mono uppercase text-[10px] block mb-1">
                Technical Explanation
              </span>
              <p className="text-slate-300 leading-relaxed">{data.ai_findings?.explanation}</p>
            </div>
          </div>
        </section>

        {/* Sensitive Data Inspection */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
            04. Sensitive Data Exposure Assessment
          </h2>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">
                Regex Sensitive Data Scanning Result:
              </span>
              <span className={`font-mono font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                data.sensitive_data_findings?.detected
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}>
                {data.sensitive_data_findings?.detected ? 'Sensitive Tokens Detected' : 'Protected / Clean'}
              </span>
            </div>

            {data.sensitive_data_findings?.detected && (
              <div>
                <span className="text-slate-400 font-mono uppercase text-[10px] block mb-1">
                  Redacted Exfiltration Sample
                </span>
                <pre className="p-3 bg-slate-900 rounded border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap">
                  {data.sensitive_data_findings?.redactedText}
                </pre>
              </div>
            )}
          </div>
        </section>

        {/* Recommendations & Remediation */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
            05. Recommended Mitigations & Guardrails
          </h2>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <ul className="space-y-2 text-xs text-slate-300">
              {data.recommendations?.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Audit Timeline */}
        {data.auditTimeline && data.auditTimeline.length > 0 && (
          <section className="space-y-3 pt-4 border-t border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider text-cyan-400">
              06. Audit Execution Timeline
            </h2>
            <TimelineView events={data.auditTimeline} />
          </section>
        )}
      </div>
    </div>
  );
};
