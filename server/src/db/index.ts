import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config';
import { DEFAULT_SECURITY_LABS } from './seedLabs';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked: boolean;
  created_at: string;
}

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  description: string;
  purpose: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  capabilities: string[];
  accessible_resources: string[];
  available_tools: string[];
  data_sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  status: 'active' | 'inactive' | 'testing';
  created_at: string;
  updated_at: string;
}

export interface SecurityLab {
  id: string;
  name: string;
  description: string;
  threat_type: string;
  objective: string;
  attack_scenario: string;
  affected_resource: string;
  expected_behavior: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  default_payload: string;
  created_at?: string;
}

export interface Attack {
  id: string;
  user_id: string;
  agent_id: string;
  lab_id: string | null;
  attack_type: string;
  attack_input: string;
  target_resource: string;
  simulated_data: Record<string, any>;
  is_replay: boolean;
  outcome: 'blocked' | 'success' | 'requires_approval' | 'sanitized' | 'failed';
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  ai_analysis: Record<string, any>;
  sensitive_data_findings: Record<string, any>;
  policy_evaluation: Record<string, any>;
  timeline: Array<{
    timestamp: string;
    step: string;
    description: string;
    status: 'info' | 'warning' | 'critical' | 'success';
    metadata?: Record<string, any>;
  }>;
  created_at: string;
}

export interface Policy {
  id: string;
  user_id: string;
  name: string;
  description: string;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'in';
    value: any;
  }>;
  actions: Array<{
    type: 'block' | 'allow' | 'require_approval' | 'redact' | 'log';
    reason?: string;
    level?: string;
  }>;
  priority: number; // 1-100
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SecurityReport {
  id: string;
  user_id: string;
  attack_id: string;
  agent_id: string;
  report_data: Record<string, any>;
  created_at: string;
}

// In-Memory & File-backed Store State
interface DBStore {
  users: User[];
  refresh_tokens: RefreshToken[];
  agents: Agent[];
  security_labs: SecurityLab[];
  attacks: Attack[];
  policies: Policy[];
  security_reports: SecurityReport[];
}

let pgPool: Pool | null = null;
let usePostgres = false;
let inMemoryDb: DBStore = {
  users: [],
  refresh_tokens: [],
  agents: [],
  security_labs: [...DEFAULT_SECURITY_LABS],
  attacks: [],
  policies: [],
  security_reports: [],
};

const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'oops_ai_store.json');

function loadLocalFileStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      inMemoryDb = {
        users: parsed.users || [],
        refresh_tokens: parsed.refresh_tokens || [],
        agents: parsed.agents || [],
        security_labs: parsed.security_labs?.length ? parsed.security_labs : [...DEFAULT_SECURITY_LABS],
        attacks: parsed.attacks || [],
        policies: parsed.policies || [],
        security_reports: parsed.security_reports || [],
      };
    } else {
      saveLocalFileStore();
    }
  } catch (err) {
    console.warn('[DB] Could not read local file store, using in-memory fallback:', err);
  }
}

function saveLocalFileStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryDb, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DB] Failed to persist store to disk:', err);
  }
}

export async function initDatabase(): Promise<void> {
  loadLocalFileStore();

  if (config.databaseUrl) {
    try {
      console.log('[DB] Connecting to PostgreSQL at configured DATABASE_URL...');
      pgPool = new Pool({
        connectionString: config.databaseUrl,
        ssl: config.isProd ? { rejectUnauthorized: false } : undefined,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      const client = await pgPool.connect();
      try {
        const schemaPath = path.resolve(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const sql = fs.readFileSync(schemaPath, 'utf-8');
          await client.query(sql);
          console.log('[DB] PostgreSQL schema verified and up to date.');
        }

        // Seed labs in postgres if empty
        const labRes = await client.query('SELECT COUNT(*) FROM security_labs');
        if (parseInt(labRes.rows[0].count, 10) === 0) {
          console.log('[DB] Seeding default security labs into PostgreSQL...');
          for (const lab of DEFAULT_SECURITY_LABS) {
            await client.query(
              `INSERT INTO security_labs (id, name, description, threat_type, objective, attack_scenario, affected_resource, expected_behavior, difficulty, default_payload)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
               ON CONFLICT (id) DO NOTHING`,
              [lab.id, lab.name, lab.description, lab.threat_type, lab.objective, lab.attack_scenario, lab.affected_resource, lab.expected_behavior, lab.difficulty, lab.default_payload]
            );
          }
        }
        usePostgres = true;
        console.log('[DB] Successfully connected to PostgreSQL / Supabase with Row-Level Security.');
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('[DB] Could not connect to PostgreSQL. Falling back to built-in secure storage engine:', (err as Error).message);
      usePostgres = false;
    }
  } else {
    console.log('[DB] No DATABASE_URL set. Running on high-performance built-in persistent storage engine.');
  }
}

export const db = {
  isPostgres(): boolean {
    return usePostgres;
  },

  // Users
  users: {
    async findByEmail(email: string): Promise<User | null> {
      const normalized = email.toLowerCase().trim();
      if (usePostgres && pgPool) {
        const res = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [normalized]);
        return res.rows[0] || null;
      }
      return inMemoryDb.users.find(u => u.email.toLowerCase() === normalized) || null;
    },

    async findById(id: string): Promise<User | null> {
      if (usePostgres && pgPool) {
        const res = await pgPool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
        return res.rows[0] || null;
      }
      return inMemoryDb.users.find(u => u.id === id) || null;
    },

    async create(user: { email: string; password_hash: string; name: string }): Promise<User> {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const normalized = user.email.toLowerCase().trim();

      if (usePostgres && pgPool) {
        const res = await pgPool.query(
          'INSERT INTO users (id, email, password_hash, name, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [id, normalized, user.password_hash, user.name, now, now]
        );
        return res.rows[0];
      }

      const newUser: User = {
        id,
        email: normalized,
        password_hash: user.password_hash,
        name: user.name,
        created_at: now,
        updated_at: now,
      };
      inMemoryDb.users.push(newUser);
      saveLocalFileStore();
      return newUser;
    },

    async update(id: string, updates: Partial<Pick<User, 'name' | 'password_hash'>>): Promise<User | null> {
      const now = new Date().toISOString();
      if (usePostgres && pgPool) {
        const fields: string[] = ['updated_at = $2'];
        const values: any[] = [id, now];
        let idx = 3;
        if (updates.name) {
          fields.push(`name = $${idx++}`);
          values.push(updates.name);
        }
        if (updates.password_hash) {
          fields.push(`password_hash = $${idx++}`);
          values.push(updates.password_hash);
        }
        const res = await pgPool.query(
          `UPDATE users SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
          values
        );
        return res.rows[0] || null;
      }

      const idx = inMemoryDb.users.findIndex(u => u.id === id);
      if (idx === -1) return null;
      inMemoryDb.users[idx] = {
        ...inMemoryDb.users[idx],
        ...updates,
        updated_at: now,
      };
      saveLocalFileStore();
      return inMemoryDb.users[idx];
    }
  },

  // Refresh Tokens
  refreshTokens: {
    async create(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken> {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const expStr = expiresAt.toISOString();

      if (usePostgres && pgPool) {
        const res = await pgPool.query(
          'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, revoked, created_at) VALUES ($1, $2, $3, $4, FALSE, $5) RETURNING *',
          [id, userId, tokenHash, expStr, now]
        );
        return res.rows[0];
      }

      const rt: RefreshToken = {
        id,
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expStr,
        revoked: false,
        created_at: now,
      };
      inMemoryDb.refresh_tokens.push(rt);
      saveLocalFileStore();
      return rt;
    },

    async findActive(tokenHash: string): Promise<RefreshToken | null> {
      if (usePostgres && pgPool) {
        const res = await pgPool.query(
          'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked = FALSE AND expires_at > NOW() LIMIT 1',
          [tokenHash]
        );
        return res.rows[0] || null;
      }

      const now = new Date().toISOString();
      return inMemoryDb.refresh_tokens.find(
        rt => rt.token_hash === tokenHash && !rt.revoked && rt.expires_at > now
      ) || null;
    },

    async revoke(tokenHash: string): Promise<void> {
      if (usePostgres && pgPool) {
        await pgPool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1', [tokenHash]);
        return;
      }

      const item = inMemoryDb.refresh_tokens.find(rt => rt.token_hash === tokenHash);
      if (item) {
        item.revoked = true;
        saveLocalFileStore();
      }
    },

    async revokeAllForUser(userId: string): Promise<void> {
      if (usePostgres && pgPool) {
        await pgPool.query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1', [userId]);
        return;
      }

      inMemoryDb.refresh_tokens.forEach(rt => {
        if (rt.user_id === userId) rt.revoked = true;
      });
      saveLocalFileStore();
    }
  },

  // Security Labs (Read-only catalog)
  labs: {
    async list(): Promise<SecurityLab[]> {
      if (usePostgres && pgPool) {
        const res = await pgPool.query('SELECT * FROM security_labs ORDER BY id ASC');
        return res.rows;
      }
      return inMemoryDb.security_labs;
    },

    async findById(id: string): Promise<SecurityLab | null> {
      if (usePostgres && pgPool) {
        const res = await pgPool.query('SELECT * FROM security_labs WHERE id = $1 LIMIT 1', [id]);
        return res.rows[0] || null;
      }
      return inMemoryDb.security_labs.find(l => l.id === id) || null;
    }
  },

  // Agents
  agents: {
    async listByUser(userId: string): Promise<Agent[]> {
      if (usePostgres && pgPool) {
        const res = await pgPool.query('SELECT * FROM agents WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        return res.rows;
      }
      return inMemoryDb.agents.filter(a => a.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
    },

    async findById(id: string, userId: string): Promise<Agent | null> {
      if (usePostgres && pgPool) {
        const res = await pgPool.query('SELECT * FROM agents WHERE id = $1 AND user_id = $2 LIMIT 1', [id, userId]);
        return res.rows[0] || null;
      }
      return inMemoryDb.agents.find(a => a.id === id && a.user_id === userId) || null;
    },

    async create(data: Omit<Agent, 'id' | 'created_at' | 'updated_at'>): Promise<Agent> {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      if (usePostgres && pgPool) {
        const res = await pgPool.query(
          `INSERT INTO agents (id, user_id, name, description, purpose, risk_level, capabilities, accessible_resources, available_tools, data_sensitivity, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
          [
            id, data.user_id, data.name, data.description, data.purpose, data.risk_level,
            JSON.stringify(data.capabilities), JSON.stringify(data.accessible_resources),
            JSON.stringify(data.available_tools), data.data_sensitivity, data.status, now, now
          ]
        );
        return res.rows[0];
      }

      const newAgent: Agent = {
        id,
        ...data,
        created_at: now,
        updated_at: now,
      };
      inMemoryDb.agents.push(newAgent);
      saveLocalFileStore();
      return newAgent;
    },

    async update(id: string, userId: string, updates: Partial<Omit<Agent, 'id' | 'user_id' | 'created_at'>>): Promise<Agent | null> {
      const now = new Date().toISOString();
      if (usePostgres && pgPool) {
        const agent = await this.findById(id, userId);
        if (!agent) return null;

        const merged = { ...agent, ...updates };
        const res = await pgPool.query(
          `UPDATE agents SET name=$1, description=$2, purpose=$3, risk_level=$4, capabilities=$5, accessible_resources=$6, available_tools=$7, data_sensitivity=$8, status=$9, updated_at=$10
           WHERE id=$11 AND user_id=$12 RETURNING *`,
          [
            merged.name, merged.description, merged.purpose, merged.risk_level,
            JSON.stringify(merged.capabilities), JSON.stringify(merged.accessible_resources),
            JSON.stringify(merged.available_tools), merged.data_sensitivity, merged.status,
            now, id, userId
          ]
        );
        return res.rows[0] || null;
      }

      const idx = inMemoryDb.agents.findIndex(a => a.id === id && a.user_id === userId);
      if (idx === -1) return null;
      inMemoryDb.agents[idx] = {
        ...inMemoryDb.agents[idx],
        ...updates,
        updated_at: now,
      };
      saveLocalFileStore();
      return inMemoryDb.agents[idx];
    },

    async delete(id: string, userId: string): Promise<boolean> {
      if (usePostgres && pgPool) {
        const res = await pgPool.query('DELETE FROM agents WHERE id = $1 AND user_id = $2', [id, userId]);
        return (res.rowCount ?? 0) > 0;
      }

      const initialLen = inMemoryDb.agents.length;
      inMemoryDb.agents = inMemoryDb.agents.filter(a => !(a.id === id && a.user_id === userId));
      const deleted = inMemoryDb.agents.length < initialLen;
      if (deleted) saveLocalFileStore();
      return deleted;
    }
  },

  // Attacks
  attacks: {
    async listByUser(userId: string, limit = 50): Promise<Attack[]> {
      if (usePostgres && pgPool) {
        const res = await pgPool.query(
          'SELECT * FROM attacks WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
          [userId, limit]
        );
        return res.rows;
      }
      return inMemoryDb.attacks
        .filter(a => a.user_id === userId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, limit);
    },

    async findById(id: string, userId: string): Promise<Attack | null> {
      if (usePostgres && pgPool) {
        const res = await pgPool.query('SELECT * FROM attacks WHERE id = $1 AND user_id = $2 LIMIT 1', [id, userId]);
        return res.rows[0] || null;
      }
      return inMemoryDb.attacks.find(a => a.id === id && a.user_id === userId) || null;
    },

    async create(data: Omit<Attack, 'id' | 'created_at'>): Promise<Attack> {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      if (usePostgres && pgPool) {
        const res = await pgPool.query(
          `INSERT INTO attacks (id, user_id, agent_id, lab_id, attack_type, attack_input, target_resource, simulated_data, is_replay, outcome, risk_score, risk_level, ai_analysis, sensitive_data_findings, policy_evaluation, timeline, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
          [
            id, data.user_id, data.agent_id, data.lab_id, data.attack_type, data.attack_input,
            data.target_resource, JSON.stringify(data.simulated_data), data.is_replay,
            data.outcome, data.risk_score, data.risk_level, JSON.stringify(data.ai_analysis),
            JSON.stringify(data.sensitive_data_findings), JSON.stringify(data.policy_evaluation),
            JSON.stringify(data.timeline), now
          ]
        );
        return res.rows[0];
      }

      const newAttack: Attack = {
        id,
        ...data,
        created_at: now,
      };
      inMemoryDb.attacks.push(newAttack);
      saveLocalFileStore();
      return newAttack;
    }
  },

  // Policies
  policies: {
    async listByUser(userId: string): Promise<Policy[]> {
      if (usePostgres && pgPool) {
        const res = await pgPool.query(
          'SELECT * FROM policies WHERE user_id = $1 ORDER BY priority DESC, created_at DESC',
          [userId]
        );
        return res.rows;
      }
      return inMemoryDb.policies
        .filter(p => p.user_id === userId)
        .sort((a, b) => b.priority - a.priority || b.created_at.localeCompare(a.created_at));
    },

    async findById(id: string, userId: string): Promise<Policy | null> {
      if (usePostgres && pgPool) {
        const res = await pgPool.query('SELECT * FROM policies WHERE id = $1 AND user_id = $2 LIMIT 1', [id, userId]);
        return res.rows[0] || null;
      }
      return inMemoryDb.policies.find(p => p.id === id && p.user_id === userId) || null;
    },

    async create(data: Omit<Policy, 'id' | 'created_at' | 'updated_at'>): Promise<Policy> {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      if (usePostgres && pgPool) {
        const res = await pgPool.query(
          `INSERT INTO policies (id, user_id, name, description, conditions, actions, priority, active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
          [
            id, data.user_id, data.name, data.description, JSON.stringify(data.conditions),
            JSON.stringify(data.actions), data.priority, data.active, now, now
          ]
        );
        return res.rows[0];
      }

      const newPolicy: Policy = {
        id,
        ...data,
        created_at: now,
        updated_at: now,
      };
      inMemoryDb.policies.push(newPolicy);
      saveLocalFileStore();
      return newPolicy;
    },

    async update(id: string, userId: string, updates: Partial<Omit<Policy, 'id' | 'user_id' | 'created_at'>>): Promise<Policy | null> {
      const now = new Date().toISOString();
      if (usePostgres && pgPool) {
        const existing = await this.findById(id, userId);
        if (!existing) return null;
        const merged = { ...existing, ...updates };
        const res = await pgPool.query(
          `UPDATE policies SET name=$1, description=$2, conditions=$3, actions=$4, priority=$5, active=$6, updated_at=$7
           WHERE id=$8 AND user_id=$9 RETURNING *`,
          [
            merged.name, merged.description, JSON.stringify(merged.conditions),
            JSON.stringify(merged.actions), merged.priority, merged.active,
            now, id, userId
          ]
        );
        return res.rows[0] || null;
      }

      const idx = inMemoryDb.policies.findIndex(p => p.id === id && p.user_id === userId);
      if (idx === -1) return null;
      inMemoryDb.policies[idx] = {
        ...inMemoryDb.policies[idx],
        ...updates,
        updated_at: now,
      };
      saveLocalFileStore();
      return inMemoryDb.policies[idx];
    },

    async delete(id: string, userId: string): Promise<boolean> {
      if (usePostgres && pgPool) {
        const res = await pgPool.query('DELETE FROM policies WHERE id = $1 AND user_id = $2', [id, userId]);
        return (res.rowCount ?? 0) > 0;
      }

      const initialLen = inMemoryDb.policies.length;
      inMemoryDb.policies = inMemoryDb.policies.filter(p => !(p.id === id && p.user_id === userId));
      const deleted = inMemoryDb.policies.length < initialLen;
      if (deleted) saveLocalFileStore();
      return deleted;
    }
  },

  // Security Reports
  reports: {
    async listByUser(userId: string): Promise<SecurityReport[]> {
      if (usePostgres && pgPool) {
        const res = await pgPool.query(
          'SELECT * FROM security_reports WHERE user_id = $1 ORDER BY created_at DESC',
          [userId]
        );
        return res.rows;
      }
      return inMemoryDb.security_reports
        .filter(r => r.user_id === userId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },

    async findById(id: string, userId: string): Promise<SecurityReport | null> {
      if (usePostgres && pgPool) {
        const res = await pgPool.query('SELECT * FROM security_reports WHERE id = $1 AND user_id = $2 LIMIT 1', [id, userId]);
        return res.rows[0] || null;
      }
      return inMemoryDb.security_reports.find(r => r.id === id && r.user_id === userId) || null;
    },

    async create(data: Omit<SecurityReport, 'id' | 'created_at'>): Promise<SecurityReport> {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      if (usePostgres && pgPool) {
        const res = await pgPool.query(
          'INSERT INTO security_reports (id, user_id, attack_id, agent_id, report_data, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [id, data.user_id, data.attack_id, data.agent_id, JSON.stringify(data.report_data), now]
        );
        return res.rows[0];
      }

      const newReport: SecurityReport = {
        id,
        ...data,
        created_at: now,
      };
      inMemoryDb.security_reports.push(newReport);
      saveLocalFileStore();
      return newReport;
    }
  }
};
