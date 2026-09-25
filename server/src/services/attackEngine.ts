import { db, Agent, Attack, SecurityLab } from '../db';
import { detectSensitiveData } from './sensitiveDataDetector';
import { evaluatePolicies, EvaluationContext } from './policyEngine';
import { analyzeThreatWithAI } from './threatAnalyzer';
import { calculateRiskScore } from './riskEngine';

export interface ExecuteAttackOptions {
  userId: string;
  agent: Agent;
  lab: SecurityLab | null;
  attackType: string;
  attackInput: string;
  targetResource: string;
  isReplay?: boolean;
}

export async function executeControlledAttack(options: ExecuteAttackOptions): Promise<Attack> {
  const { userId, agent, lab, attackType, attackInput, targetResource, isReplay = false } = options;
  const now = new Date();

  // Synthetic safe data generated for realistic simulation
  const syntheticPayload = generateSyntheticDataForSimulation(attackType, targetResource, attackInput);

  // 1. Audit Timeline Initialization
  const timeline: Attack['timeline'] = [
    {
      timestamp: new Date(now.getTime() - 1200).toISOString(),
      step: 'Payload Ingestion',
      description: `Ingested test payload (${attackType}) directed at agent '${agent.name}'.`,
      status: 'info',
      metadata: { inputLength: attackInput.length, target: targetResource }
    },
    {
      timestamp: new Date(now.getTime() - 950).toISOString(),
      step: 'Agent Context Parsing',
      description: `Agent interpreted incoming prompt and dispatched action to resource '${targetResource}'.`,
      status: 'warning',
      metadata: { capabilitiesUsed: agent.capabilities.slice(0, 2) }
    },
    {
      timestamp: new Date(now.getTime() - 700).toISOString(),
      step: 'Resource Access Request',
      description: `Downstream execution requested: access to ${targetResource} with query parameters.`,
      status: 'warning',
      metadata: { simulatedDataEntities: Object.keys(syntheticPayload).length }
    }
  ];

  // 2. Sensitive Data Scan on payload and simulated response
  const rawPayloadString = JSON.stringify(syntheticPayload) + ' ' + attackInput;
  const sensitiveResults = detectSensitiveData(rawPayloadString);

  timeline.push({
    timestamp: new Date(now.getTime() - 450).toISOString(),
    step: 'Sensitive Data Analysis',
    description: sensitiveResults.detected
      ? `Detected ${sensitiveResults.totalFindings} potential sensitive data elements (${sensitiveResults.highestSeverity.toUpperCase()}).`
      : 'No sensitive data detected in egress buffer.',
    status: sensitiveResults.detected ? (sensitiveResults.highestSeverity === 'critical' ? 'critical' : 'warning') : 'info',
    metadata: {
      findings: sensitiveResults.findings.map(f => ({ type: f.type, count: f.count, severity: f.severity }))
    }
  });

  // 3. Policy Engine Evaluation
  const userPolicies = await db.policies.listByUser(userId);

  const evalContext: EvaluationContext = {
    target_resource: targetResource,
    action: targetResource.toLowerCase().includes('db') || targetResource.toLowerCase().includes('database') ? 'database_query' : 'external_transmission',
    tool: agent.available_tools[0] || 'default_tool',
    sensitive_data_findings: {
      detected: sensitiveResults.detected,
      highestSeverity: sensitiveResults.highestSeverity,
      totalFindings: sensitiveResults.totalFindings,
      types: sensitiveResults.findings.map(f => f.type)
    },
    agent: {
      name: agent.name,
      risk_level: agent.risk_level,
      data_sensitivity: agent.data_sensitivity,
      capabilities: agent.capabilities,
      available_tools: agent.available_tools,
    },
    attack_type: attackType,
    payload_text: attackInput
  };

  const policyResult = evaluatePolicies(userPolicies, evalContext);

  // 4. Outcome Determination
  let outcome: Attack['outcome'] = 'success'; // Attack succeeded in breaching/manipulating agent
  if (policyResult.outcome === 'blocked') {
    outcome = 'blocked';
  } else if (policyResult.outcome === 'requires_approval') {
    outcome = 'requires_approval';
  } else if (policyResult.outcome === 'sanitized') {
    outcome = 'sanitized';
  }

  timeline.push({
    timestamp: new Date(now.getTime() - 200).toISOString(),
    step: 'Policy Engine Evaluation',
    description: policyResult.matchedPolicy
      ? `Policy rule '${policyResult.matchedPolicy.name}' triggered: ${policyResult.reason}`
      : 'No blocking policies configured. Request passed through to egress.',
    status: outcome === 'blocked' ? 'success' : (outcome === 'requires_approval' ? 'warning' : 'critical'),
    metadata: {
      policyId: policyResult.matchedPolicy?.id,
      actions: policyResult.actionsExecuted
    }
  });

  timeline.push({
    timestamp: now.toISOString(),
    step: 'Enforcement Completed',
    description: outcome === 'blocked'
      ? 'Security guardrail ACTIVE: Malicious instruction and data exfiltration prevented.'
      : 'Vulnerability EXPLOITED: Agent executed requested action without restriction.',
    status: outcome === 'blocked' ? 'success' : 'critical'
  });

  // 5. AI Threat Analysis (Hardened Gemini call with strict Zod validation & deterministic fallback)
  const aiAnalysis = await analyzeThreatWithAI({
    attackType,
    agentName: agent.name,
    agentPurpose: agent.purpose,
    attackInput,
    targetResource,
    simulatedData: syntheticPayload,
    sensitiveDataDetected: sensitiveResults.detected,
    sensitiveFindingsTypes: sensitiveResults.findings.map(f => f.type),
  });

  // 6. Multi-Factor Risk Assessment Engine
  const riskCalculation = calculateRiskScore({
    severity: aiAnalysis.severity,
    dataSensitivity: agent.data_sensitivity,
    tools: agent.available_tools,
    sensitiveDataDetected: sensitiveResults.detected,
    policyBlocked: outcome === 'blocked',
  });

  // 7. Persist Attack Simulation to Database
  const attackRecord = await db.attacks.create({
    user_id: userId,
    agent_id: agent.id,
    lab_id: lab ? lab.id : null,
    attack_type: attackType,
    attack_input: attackInput,
    target_resource: targetResource,
    simulated_data: syntheticPayload,
    is_replay: isReplay,
    outcome,
    risk_score: riskCalculation.score,
    risk_level: riskCalculation.level,
    ai_analysis: {
      ...aiAnalysis,
      riskBreakdown: riskCalculation,
    },
    sensitive_data_findings: sensitiveResults,
    policy_evaluation: policyResult,
    timeline,
  });

  return attackRecord;
}

function generateSyntheticDataForSimulation(attackType: string, targetResource: string, input: string): Record<string, any> {
  const isCustomerDb = targetResource.toLowerCase().includes('customer') || targetResource.toLowerCase().includes('user');
  const isInvoice = input.toLowerCase().includes('invoice') || attackType.toLowerCase().includes('indirect');

  if (isInvoice || isCustomerDb) {
    return {
      simulation_notice: "Synthetic test data generated for Oops! AI security verification",
      records_accessed: 3,
      sample_records: [
        {
          customer_id: "CUST-8819",
          name: "Dr. Alexander Wright",
          email: "alexander.wright@acme-enterprises.corp",
          phone: "415-555-0142",
          ssn: "982-12-8419",
          account_balance: "$124,500.00",
          status: "active"
        },
        {
          customer_id: "CUST-8820",
          name: "Elena Rostova",
          email: "elena.rostova@quantum-fintech.io",
          phone: "212-555-0199",
          ssn: "982-34-1102",
          account_balance: "$89,200.00",
          status: "active"
        }
      ],
      api_access_token: "mock_test_token_9941a8fe02941019dfa991bce",
      database_source: targetResource
    };
  }

  return {
    simulation_notice: "Synthetic test data generated for Oops! AI security verification",
    target_endpoint: targetResource,
    configuration_parameters: {
      admin_access: true,
      internal_ip: "10.0.4.15",
      bearer_token: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummysecret",
      status: "unrestricted"
    }
  };
}
