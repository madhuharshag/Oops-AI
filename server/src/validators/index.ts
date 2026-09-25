import { z } from 'zod';

// Password requirement: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().regex(
    passwordRegex,
    'Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),
  confirmPassword: z.string(),
  agreeTerms: z.boolean().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const AgentSchema = z.object({
  name: z.string().min(2, 'Agent name is required').max(100),
  description: z.string().max(1000).optional().default(''),
  purpose: z.string().min(5, 'Agent purpose is required').max(1000),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  capabilities: z.array(z.string()).default([]),
  accessible_resources: z.array(z.string()).default([]),
  available_tools: z.array(z.string()).default([]),
  data_sensitivity: z.enum(['public', 'internal', 'confidential', 'restricted']).default('confidential'),
  status: z.enum(['active', 'inactive', 'testing']).default('active'),
});

export const AttackTriggerSchema = z.object({
  agent_id: z.string().uuid().or(z.string().min(5)),
  lab_id: z.string().optional().nullable(),
  attack_type: z.string().min(2),
  attack_input: z.string().min(1, 'Attack input is required'),
  target_resource: z.string().min(1, 'Target resource is required'),
  simulated_data: z.record(z.any()).optional().default({}),
});

export const PolicyConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['equals', 'not_equals', 'contains', 'gt', 'lt', 'in']),
  value: z.any(),
});

export const PolicyActionSchema = z.object({
  type: z.enum(['block', 'allow', 'require_approval', 'redact', 'log']),
  reason: z.string().optional(),
  level: z.string().optional(),
});

export const PolicySchema = z.object({
  name: z.string().min(2, 'Policy name is required').max(150),
  description: z.string().max(1000).optional().default(''),
  conditions: z.array(PolicyConditionSchema).min(1, 'At least one condition clause is required'),
  actions: z.array(PolicyActionSchema).min(1, 'At least one policy action is required'),
  priority: z.number().int().min(1).max(100).default(50),
  active: z.boolean().default(true),
});

// Zod Schema to strictly validate Gemini AI Threat Analysis output (Hardening Requirement §3, §7)
export const AIThreatAnalysisSchema = z.object({
  threatCategory: z.string(),
  explanation: z.string(),
  attackMechanism: z.string(),
  affectedAsset: z.string(),
  potentialImpact: z.string(),
  likelihood: z.enum(['low', 'medium', 'high', 'critical']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  sensitiveDataRisk: z.boolean(),
  recommendedMitigation: z.array(z.string()),
  confidence: z.number().min(0).max(100),
  summary: z.string(),
});

export type AIThreatAnalysis = z.infer<typeof AIThreatAnalysisSchema>;
