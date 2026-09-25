-- Oops! AI Database Schema (PostgreSQL / Supabase with Row-Level Security)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Refresh Tokens Table (Hashed tokens, revocable, rotatable)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- 3. Agents Table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    purpose TEXT NOT NULL,
    risk_level VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
    capabilities JSONB DEFAULT '[]'::jsonb,
    accessible_resources JSONB DEFAULT '[]'::jsonb,
    available_tools JSONB DEFAULT '[]'::jsonb,
    data_sensitivity VARCHAR(50) DEFAULT 'confidential', -- public, internal, confidential, restricted
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, testing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);

-- 4. Security Labs (Pre-populated baseline labs)
CREATE TABLE IF NOT EXISTS security_labs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    threat_type VARCHAR(100) NOT NULL,
    objective TEXT NOT NULL,
    attack_scenario TEXT NOT NULL,
    affected_resource VARCHAR(255) NOT NULL,
    expected_behavior TEXT NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'intermediate', -- beginner, intermediate, advanced
    default_payload TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Attacks Table
CREATE TABLE IF NOT EXISTS attacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    lab_id UUID REFERENCES security_labs(id) ON DELETE SET NULL,
    attack_type VARCHAR(100) NOT NULL,
    attack_input TEXT NOT NULL,
    target_resource VARCHAR(255) NOT NULL,
    simulated_data JSONB DEFAULT '{}'::jsonb,
    is_replay BOOLEAN DEFAULT FALSE,
    outcome VARCHAR(50) NOT NULL, -- blocked, success, requires_approval, sanitized, failed
    risk_score INTEGER NOT NULL DEFAULT 0, -- 0 to 100
    risk_level VARCHAR(50) NOT NULL DEFAULT 'low', -- low, medium, high, critical
    ai_analysis JSONB DEFAULT '{}'::jsonb,
    sensitive_data_findings JSONB DEFAULT '{}'::jsonb,
    policy_evaluation JSONB DEFAULT '{}'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attacks_user_id ON attacks(user_id);
CREATE INDEX IF NOT EXISTS idx_attacks_agent_id ON attacks(agent_id);

-- 6. Policies Table
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    priority INTEGER DEFAULT 10, -- 1-100 (100 highest)
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_policies_user_id ON policies(user_id);

-- 7. Security Reports Table
CREATE TABLE IF NOT EXISTS security_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attack_id UUID REFERENCES attacks(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON security_reports(user_id);

-- Row-Level Security (RLS) Configuration for Supabase / PostgreSQL
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_labs ENABLE ROW LEVEL SECURITY;

-- Public can read security labs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'public_read_labs') THEN
        CREATE POLICY public_read_labs ON security_labs FOR SELECT USING (true);
    END IF;
END $$;
