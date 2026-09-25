import { Policy } from '../db';

export interface EvaluationContext {
  target_resource: string;
  action: string;
  tool?: string;
  sensitive_data_findings: {
    detected: boolean;
    highestSeverity: string;
    totalFindings: number;
    types: string[];
  };
  agent: {
    name: string;
    risk_level: string;
    data_sensitivity: string;
    capabilities: string[];
    available_tools: string[];
  };
  attack_type: string;
  payload_text: string;
}

export interface PolicyEvaluationResult {
  matchedPolicy: Policy | null;
  outcome: 'blocked' | 'allowed' | 'requires_approval' | 'sanitized';
  actionsExecuted: Array<{
    type: string;
    reason?: string;
    level?: string;
  }>;
  reason: string;
  evaluationLog: Array<{
    policyId: string;
    policyName: string;
    matched: boolean;
    priority: number;
    details: string;
  }>;
}

function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

function evaluateCondition(clause: { field: string; operator: string; value: any }, context: EvaluationContext): boolean {
  let field = clause.field;
  if (field === 'attack_input' || field === 'input' || field === 'prompt') {
    field = 'payload_text';
  }
  let actualValue = getNestedValue(context, field);
  if (actualValue === undefined && (field === 'payload_text' || field === 'attack_input')) {
    actualValue = (context as any).payload_text || (context as any).attack_input;
  }
  const targetValue = clause.value;

  switch (clause.operator) {
    case 'equals':
      if (typeof actualValue === 'string' && typeof targetValue === 'string') {
        return actualValue.toLowerCase() === targetValue.toLowerCase();
      }
      return actualValue === targetValue;

    case 'not_equals':
      if (typeof actualValue === 'string' && typeof targetValue === 'string') {
        return actualValue.toLowerCase() !== targetValue.toLowerCase();
      }
      return actualValue !== targetValue;

    case 'contains':
      if (Array.isArray(actualValue)) {
        return actualValue.some(item =>
          String(item).toLowerCase().includes(String(targetValue).toLowerCase())
        );
      }
      if (typeof actualValue === 'string') {
        return actualValue.toLowerCase().includes(String(targetValue).toLowerCase());
      }
      return false;

    case 'gt':
      return Number(actualValue) > Number(targetValue);

    case 'lt':
      return Number(actualValue) < Number(targetValue);

    case 'in':
      if (Array.isArray(targetValue)) {
        return targetValue.some(v => String(v).toLowerCase() === String(actualValue).toLowerCase());
      }
      return false;

    default:
      return false;
  }
}

export function evaluatePolicies(
  policies: Policy[],
  context: EvaluationContext
): PolicyEvaluationResult {
  // Sort policies by priority descending (highest first)
  const activePolicies = policies
    .filter(p => p.active)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const evaluationLog: PolicyEvaluationResult['evaluationLog'] = [];

  for (const policy of activePolicies) {
    const conditions = policy.conditions || [];
    if (conditions.length === 0) continue;

    // ALL conditions must match (AND)
    const matchesAll = conditions.every(c => evaluateCondition(c, context));

    evaluationLog.push({
      policyId: policy.id,
      policyName: policy.name,
      matched: matchesAll,
      priority: policy.priority,
      details: matchesAll
        ? `Matched ${conditions.length}/${conditions.length} condition clauses.`
        : `Condition check failed on policy criteria.`
    });

    if (matchesAll) {
      // Execute actions in order
      const actions = policy.actions || [];
      const hasBlock = actions.find(a => a.type === 'block');
      const hasApproval = actions.find(a => a.type === 'require_approval');
      const hasRedact = actions.find(a => a.type === 'redact');

      let outcome: PolicyEvaluationResult['outcome'] = 'allowed';
      let primaryReason = policy.description || 'Policy matched';

      if (hasBlock) {
        outcome = 'blocked';
        primaryReason = hasBlock.reason || 'Blocked by active security policy: ' + policy.name;
      } else if (hasApproval) {
        outcome = 'requires_approval';
        primaryReason = hasApproval.reason || 'Action requires mandatory supervisor approval: ' + policy.name;
      } else if (hasRedact) {
        outcome = 'sanitized';
        primaryReason = hasRedact.reason || 'Sensitive payload sanitized and redacted before egress: ' + policy.name;
      }

      return {
        matchedPolicy: policy,
        outcome,
        actionsExecuted: actions,
        reason: primaryReason,
        evaluationLog,
      };
    }
  }

  // If no policy matched and sensitive data was detected in a confidential/restricted agent,
  // we do not block automatically unless policy was configured, allowing clear before-defense demonstrations.
  return {
    matchedPolicy: null,
    outcome: 'allowed',
    actionsExecuted: [],
    reason: 'No restrictive security policies matched. Action permitted by default.',
    evaluationLog,
  };
}
