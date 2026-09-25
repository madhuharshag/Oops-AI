import React from 'react';
import { Shield, ShieldAlert, Cpu, Lock, CheckCircle2, FileText } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center mx-auto mb-3 text-cyan-400">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          About Oops! AI
        </h1>
        <p className="text-sm font-mono text-cyan-400 mt-2">
          Break it. Understand it. Fix it. Trust it.
        </p>
      </div>

      <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
        <div className="cyber-card p-6">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Our Mission & Purpose
          </h2>
          <p>
            As autonomous AI agents acquire real-world capabilities—accessing databases, reading unstructured third-party documents, and invoking communication APIs—they become prime targets for adversarial manipulation.
          </p>
          <p className="mt-3">
            Oops! AI was built for the <strong>AI Security, Privacy & Trust Hackathon 2025</strong> to provide engineering teams with a rigorous, safe, and verifiable sandbox to stress-test their AI agents against controlled adversarial prompts, indirect injections, and tool abuse before deploying them to production.
          </p>
        </div>

        <div className="cyber-card p-6 border-rose-500/30 bg-rose-950/10">
          <h2 className="text-lg font-bold text-rose-300 mb-2 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Strict Ethical Security Boundary
          </h2>
          <p>
            Oops! AI is strictly a <strong>defensive verification platform</strong>. All attack simulations are:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1.5 text-slate-300">
            <li><strong>Fully sandboxed & controlled:</strong> Executed only within simulated environments against user-registered test agents.</li>
            <li><strong>Synthetic Data Only:</strong> All database responses, customer profiles, and API tokens generated during testing are synthetic tokens designed specifically for behavioral verification.</li>
            <li><strong>No third-party targeting:</strong> The platform explicitly prohibits and prevents targeting real external services or conducting unauthorized scanning.</li>
          </ul>
        </div>

        <div className="cyber-card p-6">
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            Hardened Architecture & Known Limitations
          </h2>
          <p>
            Oops! AI adheres to OWASP Top 10 for LLM guidelines and practices defense-in-depth:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-bold text-white block mb-1">AI Prompt Injection Defense</span>
              <span className="text-xs text-slate-400">
                Backend Gemini analysis calls treat all adversarial payloads as untrusted data in separated message roles, strictly validating AI output against Zod JSON schemas before storage.
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-bold text-white block mb-1">Deterministic Policy Engine</span>
              <span className="text-xs text-slate-400">
                Security actions (block, allow, require approval, redact) are executed by an immutable, deterministic engine—never delegated to an LLM's judgment.
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-bold text-white block mb-1">Regex Sensitive Data Scanning</span>
              <span className="text-xs text-slate-400">
                Pattern matching detects API keys, SSNs, credit cards, emails, and account identifiers. <em>Note:</em> Pattern matching serves as an indicative indicator and can have false positives/negatives with novel obfuscated formats.
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="font-bold text-white block mb-1">User Isolation & RLS</span>
              <span className="text-xs text-slate-400">
                Every agent, attack record, policy, and report enforces user ownership server-side. Unauthorized access always returns 404 to avoid confirming resource existence.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
