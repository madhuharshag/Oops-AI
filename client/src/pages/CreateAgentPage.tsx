import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, Sparkles, ArrowLeft, ArrowRight, ShieldAlert, Wrench, Database } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const CreateAgentPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [dataSensitivity, setDataSensitivity] = useState<'public' | 'internal' | 'confidential' | 'restricted'>('confidential');
  const [capabilitiesStr, setCapabilitiesStr] = useState('read invoices, query database, send email, access API');
  const [resourcesStr, setResourcesStr] = useState('customer_database, vendor_invoices, email_gateway');
  const [toolsStr, setToolsStr] = useState('database_query, send_email, document_reader');
  const [status, setStatus] = useState<'active' | 'inactive' | 'testing'>('active');
  const [isLoading, setIsLoading] = useState(false);

  const fillFinanceAssistantDemo = () => {
    setName('Finance Assistant');
    setDescription('Autonomous financial operations assistant managing invoice ingestion, automated account balance lookups, and vendor notifications.');
    setPurpose('Review vendor invoices and query customer database for accounts and compliance reconciliation.');
    setRiskLevel('high');
    setDataSensitivity('confidential');
    setCapabilitiesStr('read invoices, query database, send email, call external API');
    setResourcesStr('customer_database, vendor_invoices, accounting_api');
    setToolsStr('database_query, send_email, document_reader, http_request');
    setStatus('active');
    showToast('Loaded standard demo persona: Finance Assistant', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const capabilities = capabilitiesStr.split(',').map(s => s.trim()).filter(Boolean);
      const accessible_resources = resourcesStr.split(',').map(s => s.trim()).filter(Boolean);
      const available_tools = toolsStr.split(',').map(s => s.trim()).filter(Boolean);

      const payload = {
        name,
        description,
        purpose,
        risk_level: riskLevel,
        capabilities,
        accessible_resources,
        available_tools,
        data_sensitivity: dataSensitivity,
        status,
      };

      const res = await api.post('/agents', payload);
      showToast(`Agent '${name}' successfully registered!`, 'success');
      navigate(`/agents/${res.data.agent.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.details?.[0]?.message || err.response?.data?.error || 'Failed to create agent.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <Link
          to="/agents"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Agents
        </Link>

        {/* Demo Preset Button */}
        <button
          type="button"
          onClick={fillFinanceAssistantDemo}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50 text-xs font-mono font-semibold transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Load Demo Preset: Finance Assistant
        </button>
      </div>

      <div className="cyber-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Register AI Agent Security Profile</h1>
            <p className="text-xs text-slate-400">
              Configure boundaries, tool integrations, and sensitive data access privileges.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Agent Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Finance Assistant"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Baseline Risk Classification
              </label>
              <select
                value={riskLevel}
                onChange={(e: any) => setRiskLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 transition font-mono"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
                <option value="critical">Critical Risk</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Primary Purpose & Workflow *
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Review vendor invoices and query customer database for account details"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Detailed Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Operational context and architectural integration details..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Target Data Asset Sensitivity
              </label>
              <select
                value={dataSensitivity}
                onChange={(e: any) => setDataSensitivity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 transition font-mono"
              >
                <option value="public">Public (Non-sensitive)</option>
                <option value="internal">Internal (Company confidential)</option>
                <option value="confidential">Confidential (Customer PII/Accounts)</option>
                <option value="restricted">Restricted (System Keys & Passwords)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Deployment Status
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400 transition font-mono"
              >
                <option value="active">Active (Production)</option>
                <option value="testing">Testing (Sandbox)</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
              Agent Capabilities (comma-separated)
            </label>
            <input
              type="text"
              value={capabilitiesStr}
              onChange={(e) => setCapabilitiesStr(e.target.value)}
              placeholder="read invoices, query database, send email, call external API"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Accessible Downstream Resources
              </label>
              <input
                type="text"
                value={resourcesStr}
                onChange={(e) => setResourcesStr(e.target.value)}
                placeholder="customer_database, vendor_invoices"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                Available Tools
              </label>
              <input
                type="text"
                value={toolsStr}
                onChange={(e) => setToolsStr(e.target.value)}
                placeholder="database_query, send_email"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Link
              to="/agents"
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading || !name || !purpose}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
            >
              {isLoading ? 'Registering...' : 'Register Agent Profile'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
