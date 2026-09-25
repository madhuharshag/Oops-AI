import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        <p className="text-xs font-mono text-slate-400 mt-2">Effective Date: Hackathon 2025</p>
      </div>

      <div className="cyber-card p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-white mb-2">1. Permitted Use</h2>
          <p>
            Oops! AI is intended exclusively for authorized security testing, vulnerability research, and hardening of user-owned or authorized AI agents. Users agree to execute simulations solely within provided Oops! Labs or configured sandboxes.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-2">2. Prohibited Exploitative Activities</h2>
          <p>
            Users must not utilize Oops! AI to attack unauthorized third parties, exfiltrate real customer credentials, conduct distributed denial of service, or deploy autonomous malware.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-2">3. Disclaimers & Defense Guarantees</h2>
          <p>
            While Oops! AI provides automated vulnerability detection, multi-factor risk assessment, and defense policy verification, no software can guarantee 100% defense against all novel attack vectors. Red-teaming and defense verification should be integrated into comprehensive security lifecycles.
          </p>
        </section>
      </div>
    </div>
  );
};
