import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="text-xs font-mono text-slate-400 mt-2">Effective Date: Hackathon 2025</p>
      </div>

      <div className="cyber-card p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-white mb-2">1. Data Storage & Encryption</h2>
          <p>
            Oops! AI stores user account details (name, email, bcrypt-hashed passwords) and user-registered agent definitions. Sensitive credentials such as JWT secrets and database connection strings are never exposed to clients or stored in client-accessible browser storage. Refresh tokens are transmitted exclusively via Secure, HttpOnly, SameSite cookies.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-2">2. Synthetic Simulation Data</h2>
          <p>
            All test data used in attack simulations (e.g. simulated customer records, sample SSNs, mock invoices) are synthetically generated tokens. The platform does not inspect or extract live production data from unapproved external sources.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-2">3. User Isolation & Tenancy</h2>
          <p>
            Every user-created agent, policy, simulation, and report is strictly partitioned by user identity. Cross-tenant access is prohibited and all unowned resource requests return HTTP 404.
          </p>
        </section>
      </div>
    </div>
  );
};
