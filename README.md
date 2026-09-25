# Oops! AI

> **Break it. Understand it. Fix it. Trust it.**

Autonomous AI Security, Privacy & Trust Platform for AI Agents.

[![CI & Security Audit](https://github.com/madhuharsha/Oops-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/madhuharsha/Oops-AI/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)

---

## 📌 Overview

**Oops! AI** is an AI-powered security testing and trust verification platform for autonomous AI agents.

As developers grant AI agents direct tool invocation—querying customer databases, ingesting third-party vendor documents, and dispatching automated emails—they introduce critical vulnerabilities. Without deterministic guardrails, indirect prompt injections embedded in everyday documents can hijack execution, exfiltrating customer PII and operational secrets.

Oops! AI allows developers to safely break AI agents in controlled sandboxes, inspect threat mechanics, detect sensitive data leakage, apply declarative defense policies, and **replay identical attacks to verify that defenses actually work.**

### The Core Loop
$$\text{ATTACK} \longrightarrow \text{ANALYZE} \longrightarrow \text{DEFEND} \longrightarrow \text{VERIFY}$$

> *"Break an AI agent safely before an attacker breaks it for real."*

---

## 🚀 Key Features

* **AI Agent Registry**: Register AI assistants with fine-grained capabilities, accessible resources, available tools, and data sensitivity classifications.
* **Oops! Labs (8 Baseline Labs)**: Pre-configured threat scenarios aligned with the OWASP Top 10 for LLMs:
  1. *Direct Prompt Injection* (system prompt overrides)
  2. *Indirect Prompt Injection* (document payload smuggling)
  3. *Data Exfiltration* (markdown image links & URL parameters)
  4. *Malicious Document Ingestion* (polyglot payloads)
  5. *Privileged Tool Abuse & Escalation* (destructive SQL execution)
  6. *Adversarial Persona Jailbreaks* (hypothetical roleplay bypasses)
  7. *Agent Instruction Hijacking* (chain-of-thought mission diversion)
  8. *Sensitive Data Exposure* (leaking SSNs, tokens, and credentials)
* **Interactive Attack Path Visualizer**: Real-time visual telemetry mapping the attack path:
  `Malicious Input ➔ AI Agent ➔ Tool Invocations ➔ Sensitive Resource ➔ Policy Engine ➔ Outcome`.
* **Hardened AI Threat Analyzer**: Integrated Google Gemini analysis featuring strict prompt injection isolation (system/user separation, Zod schema validation, and deterministic fallbacks).
* **Transparent Multi-Factor Risk Engine**: Composite 0–100 risk scoring factoring threat severity, asset sensitivity, tool reach, and active policy mitigations.
* **Regex-Based Sensitive Data Scanner**: Real-time scanning and redaction for SSNs, credit cards, API keys, credentials, email addresses, phone numbers, and internal IP addresses.
* **Deterministic Policy Engine**: Declarative condition-action rules (`BLOCK`, `REDACT`, `REQUIRE APPROVAL`, `LOG`) executed by code—never delegated to an LLM.
* **Flagship Attack Replay & Verification**: Re-runs identical attack payloads under newly applied policies to provide live side-by-side before/after comparison.
* **Audit Timeline**: Step-by-step forensic record of simulation events.
* **Executive Security Reports**: Printable compliance and audit assessment documents.

---

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v7, Tailwind CSS, Lucide Icons, Recharts, Axios |
| **Backend** | Node.js, Express 4, TypeScript, JWT, bcryptjs, Helmet, Zod |
| **Database** | PostgreSQL / Supabase with Row-Level Security (RLS) + built-in persistent storage fallback |
| **AI Analysis** | Google Gemini API (backend-only, schema-hardened) + deterministic fallback |
| **Documentation** | Interactive OpenAPI 3.0 / Swagger UI (`/api/docs`) |
| **CI/CD** | GitHub Actions (gitleaks secret scanner, npm vulnerability audit, tests, build) |

---

## 🔒 Security & Hardening Architecture

Oops! AI follows OWASP standards and defense-in-depth principles:

1. **Authentication & Session Security**:
   * Passwords hashed with `bcrypt` (work factor 12).
   * Short-lived 15-minute JWT access tokens delivered in memory.
   * Long-lived 30-day rotatable refresh tokens stored hashed (SHA-256) in database and sent strictly via `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
2. **User Isolation & Authorization**:
   * Every resource (`agents`, `attacks`, `policies`, `reports`) enforces user ownership server-side.
   * Unauthorized access attempts always return `404 Not Found` (never `403`), preventing resource existence enumeration.
3. **AI Input/Output Hardening**:
   * Adversarial payloads are isolated in separate structured JSON roles, never concatenated directly into system instructions.
   * AI output is strictly validated against a Zod schema before storage.
   * Privileged enforcement actions are strictly performed by the deterministic policy engine.
4. **Rate Limiting**:
   * Sliding-window rate limiters across authentication endpoints, general APIs, and simulation triggers with temporary lockout protection.

---

## 🎬 Complete User Journey (3–5 Minute Demo)

Experience the full value proposition in under 5 minutes:

1. **Sign In**: Navigate to `/login` and click **"Quick-fill demo credentials"** (or register at `/register`).
2. **Agent Console**: Land on `/dashboard`. If empty, click **"Create First Agent"**.
3. **Load Preset**: Click **"Load Demo Preset: Finance Assistant"** (Capabilities: read invoices, query customer database, send email; Sensitivity: Confidential). Click **Register Agent Profile**.
4. **Open Oops! Labs**: Click **"Test in Oops! Labs"** and select **#02 Indirect Prompt Injection**.
5. **Simulate Attack (Before Defense)**: Click **"Run Controlled Attack"**.
   * Observe the animated attack path.
   * Notice the status: **EXPLOITED / Vulnerable**.
   * Review detected customer PII (SSNs, emails, account IDs) and critical risk score ($95/100$).
6. **Apply Defense**: Click the green **"Apply Recommended Policy"** button to deploy an automated egress guardrail.
7. **Replay & Verify**: Click the cyan **"Replay Attack"** button.
   * Watch the simulation re-execute identically.
   * Notice the status: **BLOCKED / Mitigated**.
   * Review before vs after comparison: Sensitive customer data protected, risk score slashed by 60 points!
8. **Generate Report**: Click **"Generate Report"** to inspect a full executive security assessment.
9. **Dashboard Posture**: Return to `/dashboard` to observe live charts and metrics reflecting the defended state.

---

## 📁 Project Structure

```
Oops-AI/
├── client/                     # Frontend React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # AttackFlowVisualizer, StatCard, RiskBadge, TimelineView
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── pages/              # Landing, Auth, Dashboard, Agents, Labs, Attacks, Policies, Analytics, Reports
│   │   ├── services/           # Axios API client with automatic token refresh
│   │   ├── types/              # Shared TypeScript definitions
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Backend Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/             # Environment configuration
│   │   ├── db/                 # PostgreSQL schema, migrations, RLS, labs seed
│   │   ├── middleware/         # Auth, validate, rateLimiter, errorHandler
│   │   ├── routes/             # Auth, agents, labs, attacks, policies, analytics, reports, docs
│   │   ├── services/           # AttackEngine, ThreatAnalyzer, PolicyEngine, SensitiveDataDetector, RiskEngine
│   │   ├── validators/         # Zod schemas & AI output hardening
│   │   └── index.ts
│   ├── tests/                  # Integration test suite & E2E demo runner
│   ├── package.json
│   └── tsconfig.json
├── .github/workflows/ci.yml    # CI with Gitleaks and npm audit
├── .env.example                # Safe environment variable template
├── .gitignore                  # Strict secret and credential exclusion
├── package.json                # Root orchestrator scripts
└── README.md
```

---

## ⚡ Local Development Setup

### Prerequisites
* Node.js v18+ (tested on Node v20/v22/v25)
* npm v9+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/madhuharsha/Oops-AI.git
cd Oops-AI
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```
*(Optional)* Add your `GEMINI_API_KEY` for live AI threat analysis, or leave empty to use the built-in deterministic threat engine.
*(Optional)* Add your PostgreSQL `DATABASE_URL` (e.g. Supabase), or leave empty to use the built-in persistent storage engine.

### 3. Run Development Servers
```bash
npm run dev
```
* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5001](http://localhost:5001)
* **Interactive API Docs**: [http://localhost:5001/api/docs](http://localhost:5001/api/docs)

### 4. Run Automated Tests
```bash
# Run backend tests + client lint checks
npm run test

# Run complete 10-step end-to-end demo verification
npx ts-node server/tests/e2e_journey.ts
```

---

## 🚢 Deployment Guide

### Frontend (Vercel)
1. Import repository on Vercel with Root Directory set to `client`.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Environment Variables:
   * `VITE_API_URL`: URL of your deployed backend (e.g. `https://your-api.onrender.com/api`)

### Backend (Render / Railway / Fly.io)
1. Root Directory: `server`
2. Build Command: `npm install && npm run build`
3. Start Command: `npm run start`
4. Environment Variables:
   * `NODE_ENV=production`
   * `PORT=5001`
   * `CLIENT_URL=https://your-frontend.vercel.app`
   * `JWT_SECRET=your-32-char-secure-secret`
   * `DATABASE_URL=postgresql://...` (Supabase Postgres)
   * `GEMINI_API_KEY=your-gemini-key`

---

## 🛡️ Ethical Boundary & Limitations

* **Defensive Purpose**: Oops! AI is designed solely for defensive security verification of user-owned AI agent profiles in sandboxed environments. It does not perform unauthorized external attacks or scanning.
* **Synthetic Data**: All database samples and credentials used in simulations are synthetic mock records.
* **Regex Pattern Scanner**: Pattern matching for sensitive data serves as an indicative indicator and may have false positives or negatives on obfuscated payloads.

---

## 📜 License

Licensed under the [MIT License](LICENSE).
Built for the **AI Security, Privacy & Trust Hackathon 2025**.
