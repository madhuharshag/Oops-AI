import React, { useEffect, useState } from 'react';
import { 
  Scale, 
  PlusCircle, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';
import { api } from '../services/api';
import { Policy, PolicyCondition, PolicyAction } from '../types';
import { useToast } from '../context/ToastContext';

export const PoliciesPage: React.FC = () => {
  const { showToast } = useToast();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New policy state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(90);
  const [conditions, setConditions] = useState<PolicyCondition[]>([
    { field: 'target_resource', operator: 'contains', value: 'customer' },
    { field: 'sensitive_data_findings.detected', operator: 'equals', value: true }
  ]);
  const [actions, setActions] = useState<PolicyAction[]>([
    { type: 'block', reason: 'External transmission of confidential data requires approval' },
    { type: 'log', level: 'critical' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/policies');
      setPolicies(res.data.policies || []);
    } catch {
      showToast('Failed to load security policies.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleToggleActive = async (policy: Policy) => {
    try {
      const res = await api.put(`/policies/${policy.id}`, { active: !policy.active });
      setPolicies(prev => prev.map(p => p.id === policy.id ? res.data.policy : p));
      showToast(`Policy '${policy.name}' ${!policy.active ? 'activated' : 'deactivated'}.`, 'info');
    } catch {
      showToast('Failed to update policy status.', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete policy '${name}'?`)) return;
    try {
      await api.delete(`/policies/${id}`);
      setPolicies(prev => prev.filter(p => p.id !== id));
      showToast('Policy deleted.', 'info');
    } catch {
      showToast('Failed to delete policy.', 'error');
    }
  };

  const handleAddCondition = () => {
    setConditions(prev => [...prev, { field: 'target_resource', operator: 'contains', value: '' }]);
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAction = () => {
    setActions(prev => [...prev, { type: 'block', reason: 'Policy violation triggered' }]);
  };

  const handleRemoveAction = (index: number) => {
    setActions(prev => prev.filter((_, i) => i !== index));
  };

  const loadDefaultTemplate = () => {
    setName('Block Customer Database Exfiltration');
    setDescription('Blocks external transmission of sensitive customer identifiers and PII unless approved by supervisor.');
    setPriority(95);
    setConditions([
      { field: 'target_resource', operator: 'contains', value: 'customer' },
      { field: 'sensitive_data_findings.detected', operator: 'equals', value: true }
    ]);
    setActions([
      { type: 'block', reason: 'External transmission of confidential data requires approval' },
      { type: 'log', level: 'critical' }
    ]);
    showToast('Loaded standard defense template!', 'info');
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (conditions.length === 0 || actions.length === 0) {
      showToast('At least one condition and one action required.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/policies', {
        name,
        description,
        priority: Number(priority),
        active: true,
        conditions,
        actions,
      });

      setPolicies(prev => [res.data.policy, ...prev]);
      setShowCreateModal(false);
      showToast(`Defense policy '${name}' created!`, 'success');
      // Reset form
      setName('');
      setDescription('');
    } catch (err: any) {
      const msg = err.response?.data?.details?.[0]?.message || err.response?.data?.error || 'Failed to create policy.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
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
            DETERMINISTIC GUARDRAILS
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Policy Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure declarative conditions and deterministic enforcement actions (BLOCK, REDACT, REQUIRE APPROVAL).
          </p>
        </div>

        <button
          onClick={() => {
            loadDefaultTemplate();
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          Create Policy Rule
        </button>
      </div>

      {policies.length === 0 ? (
        <div className="cyber-card p-10 text-center max-w-xl mx-auto my-8 border-dashed border-slate-700">
          <Scale className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">No defense policies active.</h3>
          <p className="text-xs text-slate-400 mb-6">
            Without security policies, attack vectors like indirect prompt injection will succeed. Create a policy rule to protect agent resources.
          </p>
          <button
            onClick={() => {
              loadDefaultTemplate();
              setShowCreateModal(true);
            }}
            className="px-5 py-2.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            Create Recommended Defense Policy
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className={`cyber-card p-6 transition-all duration-200 border-l-4 ${
                policy.active ? 'border-l-emerald-400' : 'border-l-slate-700 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-white">{policy.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300">
                      Priority: {policy.priority}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      policy.active 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {policy.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  {policy.description && (
                    <p className="text-xs text-slate-400 mt-1">{policy.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(policy)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-mono font-medium text-slate-300 border border-slate-700 transition"
                  >
                    {policy.active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDelete(policy.id, policy.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                    title="Delete Policy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Conditions & Actions view */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block mb-2">
                    IF Condition Clauses (ALL match / AND):
                  </span>
                  <div className="space-y-1 font-mono text-[11px]">
                    {policy.conditions.map((c, i) => (
                      <div key={i} className="text-cyan-300 bg-slate-900/80 px-2 py-1 rounded">
                        <span className="text-slate-400">{c.field}</span>{' '}
                        <span className="text-amber-400">{c.operator}</span>{' '}
                        <span className="text-emerald-300">"{String(c.value)}"</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold block mb-2">
                    THEN Executed Actions:
                  </span>
                  <div className="space-y-1 font-mono text-[11px]">
                    {policy.actions.map((a, i) => (
                      <div key={i} className="text-rose-300 bg-slate-900/80 px-2 py-1 rounded flex items-center justify-between">
                        <span className="uppercase font-bold text-rose-400">[{a.type}]</span>
                        <span className="text-slate-400 truncate max-w-xs">{a.reason || 'Triggered'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Policy Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cyber-card p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-slate-900 border-cyan-500/40 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyan-400" />
                Define Security Defense Policy
              </h2>
              <button
                onClick={loadDefaultTemplate}
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Reset to Demo Template
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                    Policy Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Block Customer Exfiltration"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                    Priority (1-100)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Security intent and enforcement rationale"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Conditions Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    IF Condition Clauses (ALL must match):
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCondition}
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Clause
                  </button>
                </div>

                <div className="space-y-2">
                  {conditions.map((cond, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="field (e.g. target_resource)"
                        value={cond.field}
                        onChange={(e) => {
                          const updated = [...conditions];
                          updated[idx].field = e.target.value;
                          setConditions(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-white"
                      />
                      <select
                        value={cond.operator}
                        onChange={(e: any) => {
                          const updated = [...conditions];
                          updated[idx].operator = e.target.value;
                          setConditions(updated);
                        }}
                        className="px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-amber-400"
                      >
                        <option value="equals">equals</option>
                        <option value="not_equals">not_equals</option>
                        <option value="contains">contains</option>
                        <option value="gt">gt</option>
                        <option value="lt">lt</option>
                        <option value="in">in</option>
                      </select>
                      <input
                        type="text"
                        placeholder="target value"
                        value={String(cond.value)}
                        onChange={(e) => {
                          const updated = [...conditions];
                          updated[idx].value = e.target.value === 'true' ? true : e.target.value === 'false' ? false : e.target.value;
                          setConditions(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Remove"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
                    THEN Enforcement Actions:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAction}
                    className="text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Action
                  </button>
                </div>

                <div className="space-y-2">
                  {actions.map((act, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={act.type}
                        onChange={(e: any) => {
                          const updated = [...actions];
                          updated[idx].type = e.target.value;
                          setActions(updated);
                        }}
                        className="px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-rose-400 uppercase font-bold"
                      >
                        <option value="block">BLOCK</option>
                        <option value="allow">ALLOW</option>
                        <option value="require_approval">REQUIRE APPROVAL</option>
                        <option value="redact">REDACT</option>
                        <option value="log">LOG</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Reason / enforcement message"
                        value={act.reason || ''}
                        onChange={(e) => {
                          const updated = [...actions];
                          updated[idx].reason = e.target.value;
                          setActions(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAction(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Remove"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name}
                  className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Deploy Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
