export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  created_at?: string;
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
}

export interface AttackTimelineEvent {
  timestamp: string;
  step: string;
  description: string;
  status: 'info' | 'warning' | 'critical' | 'success';
  metadata?: Record<string, any>;
}

export interface SensitiveDataFinding {
  type: string;
  category: string;
  severity: 'critical' | 'medium' | 'low';
  count: number;
  samples: string[];
}

export interface SensitiveDataResult {
  detected: boolean;
  totalFindings: number;
  highestSeverity: 'none' | 'low' | 'medium' | 'critical';
  findings: SensitiveDataFinding[];
  redactedText: string;
}

export interface AIThreatAnalysis {
  threatCategory: string;
  explanation: string;
  attackMechanism: string;
  affectedAsset: string;
  potentialImpact: string;
  likelihood: 'low' | 'medium' | 'high' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  sensitiveDataRisk: boolean;
  recommendedMitigation: string[];
  confidence: number;
  summary: string;
  riskBreakdown?: {
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{
      name: string;
      score: number;
      maxScore: number;
      description: string;
    }>;
    explanation: string;
  };
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
  ai_analysis: AIThreatAnalysis;
  sensitive_data_findings: SensitiveDataResult;
  policy_evaluation: {
    matchedPolicy?: any;
    outcome: string;
    actionsExecuted: any[];
    reason: string;
    evaluationLog?: any[];
  };
  timeline: AttackTimelineEvent[];
  created_at: string;
}

export interface PolicyCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'in';
  value: any;
}

export interface PolicyAction {
  type: 'block' | 'allow' | 'require_approval' | 'redact' | 'log';
  reason?: string;
  level?: string;
}

export interface Policy {
  id: string;
  user_id: string;
  name: string;
  description: string;
  conditions: PolicyCondition[];
  actions: PolicyAction[];
  priority: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SecurityReport {
  id: string;
  user_id: string;
  attack_id: string;
  agent_id: string;
  report_data: {
    title: string;
    generatedAt: string;
    agent: Agent;
    attack: {
      id: string;
      type: string;
      input: string;
      target_resource: string;
      outcome: string;
      is_replay: boolean;
      risk_score: number;
      risk_level: string;
    };
    lab?: { name: string; threat_type: string; objective: string };
    ai_findings: AIThreatAnalysis;
    sensitive_data_findings: SensitiveDataResult;
    policy_evaluation: any;
    executiveSummary: string;
    recommendations: string[];
    auditTimeline: AttackTimelineEvent[];
    relatedTestsCount: number;
  };
  created_at: string;
}

export interface DashboardMetrics {
  totalAgents: number;
  securityTests: number;
  threatsDetected: number;
  attacksBlocked: number;
  criticalRisks: number;
  sensitiveDataEvents: number;
  activePolicies: number;
}
