export interface RiskBreakdown {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: Array<{
    name: string;
    score: number;
    maxScore: number;
    description: string;
  }>;
  explanation: string;
}

export function calculateRiskScore(params: {
  severity: 'low' | 'medium' | 'high' | 'critical';
  dataSensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  tools: string[];
  sensitiveDataDetected: boolean;
  policyBlocked: boolean;
}): RiskBreakdown {
  const { severity, dataSensitivity, tools, sensitiveDataDetected, policyBlocked } = params;

  // Factor 1: Severity of Threat (Max 35)
  let severityScore = 10;
  if (severity === 'critical') severityScore = 35;
  else if (severity === 'high') severityScore = 25;
  else if (severity === 'medium') severityScore = 18;

  // Factor 2: Data Sensitivity & Detected Exposure (Max 30)
  let dataScore = 5;
  if (dataSensitivity === 'restricted') dataScore = 20;
  else if (dataSensitivity === 'confidential') dataScore = 15;
  else if (dataSensitivity === 'internal') dataScore = 10;
  if (sensitiveDataDetected) dataScore += 10;

  // Factor 3: Privileged Tool Access (Max 20)
  let toolScore = 5;
  const toolList = tools.map(t => t.toLowerCase());
  const hasDbOrExec = toolList.some(t => t.includes('database') || t.includes('query') || t.includes('execute') || t.includes('admin'));
  const hasNetOrEmail = toolList.some(t => t.includes('email') || t.includes('send') || t.includes('api') || t.includes('http'));

  if (hasDbOrExec && hasNetOrEmail) toolScore = 20;
  else if (hasDbOrExec || hasNetOrEmail) toolScore = 14;

  // Factor 4: Defense & Policy Protection (Deduction of up to 40 points if blocked)
  let rawScore = severityScore + dataScore + toolScore; // 0 to 85 baseline
  let defenseMitigation = 0;

  if (policyBlocked) {
    defenseMitigation = 45; // Substantial mitigation when policy intercepts the attack
    rawScore = Math.max(10, rawScore - defenseMitigation);
  } else {
    // Unprotected penalty
    rawScore = Math.min(100, rawScore + 15);
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (finalScore >= 80) level = 'critical';
  else if (finalScore >= 60) level = 'high';
  else if (finalScore >= 40) level = 'medium';

  const factors = [
    {
      name: 'Threat Severity',
      score: severityScore,
      maxScore: 35,
      description: `Inherent vulnerability impact rated as ${severity.toUpperCase()}.`
    },
    {
      name: 'Data Asset Sensitivity',
      score: dataScore,
      maxScore: 30,
      description: sensitiveDataDetected
        ? `Target asset classification is ${dataSensitivity} with sensitive tokens identified in simulation.`
        : `Target asset classification is ${dataSensitivity}.`
    },
    {
      name: 'Agent Capabilities & Tool Reach',
      score: toolScore,
      maxScore: 20,
      description: `Agent tools (${tools.slice(0, 3).join(', ') || 'basic'}) grant downstream query/egress capability.`
    },
    {
      name: 'Policy Engine Guardrails',
      score: policyBlocked ? -45 : 15,
      maxScore: 15,
      description: policyBlocked
        ? 'Active defense policy successfully intercepted and blocked the attack vector.'
        : 'No protective policy intercepted the attack path, exposing downstream assets.'
    }
  ];

  const explanation = policyBlocked
    ? `Overall risk mitigated to ${level.toUpperCase()} (${finalScore}/100) due to enforcement of active guardrails blocking unauthorized resource access.`
    : `Overall risk elevated to ${level.toUpperCase()} (${finalScore}/100) due to absence of guardrails protecting ${dataSensitivity} resources against ${severity} threat mechanisms.`;

  return {
    score: finalScore,
    level,
    factors,
    explanation,
  };
}
