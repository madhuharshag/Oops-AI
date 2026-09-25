import assert from 'node:assert';

const BASE_URL = 'http://localhost:5001/api';

async function runE2EJourney() {
  console.log('--- Starting Complete Oops! AI Demo Journey Verification ---');

  // 1. Health check
  console.log('1. Checking Backend Health...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  assert.strictEqual(healthRes.status, 200);
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'ok');
  console.log('   ✓ Health OK:', healthData.service);

  // 2. Registration
  console.log('2. Testing Registration (/api/auth/register)...');
  const email = `judge_${Date.now()}@oops-ai.test`;
  const registerRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Hackathon Judge',
      email,
      password: 'CyberSecure99!',
      confirmPassword: 'CyberSecure99!',
      agreeTerms: true,
    })
  });
  assert.strictEqual(registerRes.status, 201);
  const registerData = await registerRes.json();
  const token = registerData.accessToken;
  const userId = registerData.user.id;
  assert.ok(token, 'Access token must be returned');
  console.log('   ✓ Registered user:', registerData.user.email);

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 3. Verify Empty Dashboard State
  console.log('3. Verifying Initial Dashboard State (/api/analytics/dashboard)...');
  const dashRes = await fetch(`${BASE_URL}/analytics/dashboard`, { headers: authHeaders });
  assert.strictEqual(dashRes.status, 200);
  const dashData = await dashRes.json();
  assert.strictEqual(dashData.metrics.totalAgents, 0);
  console.log('   ✓ Empty state verified: 0 agents registered');

  // 4. Create First Agent (Finance Assistant Demo Persona)
  console.log('4. Creating First Agent: Finance Assistant (/api/agents)...');
  const agentRes = await fetch(`${BASE_URL}/agents`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Finance Assistant',
      description: 'Processes corporate invoices and payment summaries',
      purpose: 'Review vendor invoices and query customer database for accounts and compliance reconciliation.',
      risk_level: 'high',
      capabilities: ['read invoices', 'query database', 'send email', 'access API'],
      accessible_resources: ['customer_database', 'vendor_invoices', 'email_gateway'],
      available_tools: ['database_query', 'send_email', 'document_reader'],
      data_sensitivity: 'confidential',
      status: 'active'
    })
  });
  assert.strictEqual(agentRes.status, 201);
  const agentData = await agentRes.json();
  const agentId = agentData.agent.id;
  assert.strictEqual(agentData.agent.name, 'Finance Assistant');
  console.log('   ✓ Created agent:', agentData.agent.name, 'with ID:', agentId);

  // 5. Select Lab: Indirect Prompt Injection Lab
  console.log('5. Fetching Oops! Labs (/api/labs)...');
  const labsRes = await fetch(`${BASE_URL}/labs`);
  assert.strictEqual(labsRes.status, 200);
  const labsData = await labsRes.json();
  assert.strictEqual(labsData.labs.length, 8);
  const indirectLab = labsData.labs.find((l: any) => l.threat_type === 'Indirect Prompt Injection');
  assert.ok(indirectLab);
  console.log('   ✓ Located Lab #02:', indirectLab.name);

  // 6. Execute Attack Before Defense (Unprotected Simulation)
  console.log('6. Executing Controlled Attack Simulation Before Defense (/api/attacks)...');
  const attackRes = await fetch(`${BASE_URL}/attacks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      agent_id: agentId,
      lab_id: indirectLab.id,
      attack_type: indirectLab.threat_type,
      attack_input: indirectLab.default_payload,
      target_resource: 'customer_database',
    })
  });
  assert.strictEqual(attackRes.status, 201);
  const attackData = await attackRes.json();
  const attack = attackData.attack;
  assert.strictEqual(attack.outcome, 'success'); // Breached because no policy was active!
  assert.strictEqual(attack.sensitive_data_findings.detected, true);
  assert.strictEqual(attack.risk_level, 'critical');
  assert.ok(attack.risk_score >= 80);
  assert.ok(attack.timeline.length >= 4);
  assert.ok(attack.ai_analysis.threatCategory);
  console.log('   ✓ Attack simulation executed before defense:');
  console.log('     - Outcome:', attack.outcome.toUpperCase(), '(Vulnerable)');
  console.log('     - Risk Level:', attack.risk_level.toUpperCase(), `(${attack.risk_score}/100)`);
  console.log('     - Sensitive Data Detected:', attack.sensitive_data_findings.totalFindings, 'tokens (SSN, Email, Account IDs)');
  console.log('     - AI Analysis Summary:', attack.ai_analysis.summary);

  // 7. Apply Defense Policy
  console.log('7. Applying Recommended Defense Policy (/api/policies)...');
  const policyRes = await fetch(`${BASE_URL}/policies`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Block External Transmission of Sensitive Customer Data',
      description: 'Blocks external egress of confidential customer records unless approved.',
      priority: 95,
      active: true,
      conditions: [
        { field: 'target_resource', operator: 'contains', value: 'customer' },
        { field: 'sensitive_data_findings.detected', operator: 'equals', value: true }
      ],
      actions: [
        { type: 'block', reason: 'Prevented unauthorized customer database exfiltration' },
        { type: 'log', level: 'critical' }
      ]
    })
  });
  assert.strictEqual(policyRes.status, 201);
  const policyData = await policyRes.json();
  assert.strictEqual(policyData.policy.active, true);
  console.log('   ✓ Active defense policy created:', policyData.policy.name);

  // 8. Replay Attack Against Active Defense
  console.log('8. Replaying Attack to Verify Defense Guardrail (/api/attacks/:id/replay)...');
  const replayRes = await fetch(`${BASE_URL}/attacks/${attack.id}/replay`, {
    method: 'POST',
    headers: authHeaders
  });
  assert.strictEqual(replayRes.status, 201);
  const replayData = await replayRes.json();
  const replayedAttack = replayData.attack;
  const comparison = replayData.comparison;

  assert.strictEqual(replayedAttack.outcome, 'blocked');
  assert.strictEqual(comparison.defendedSuccessfully, true);
  assert.strictEqual(comparison.replayedSensitiveDataProtected, true);
  assert.ok(replayedAttack.risk_score < attack.risk_score);
  console.log('   ✓ Replay completed successfully:');
  console.log('     - Original Outcome:', comparison.originalOutcome.toUpperCase(), '-> Replayed Outcome:', comparison.replayedOutcome.toUpperCase());
  console.log('     - Risk Score Mitigated by:', comparison.riskMitigated, 'points');
  console.log('     - Sensitive Data Protected:', comparison.replayedSensitiveDataProtected ? 'YES' : 'NO');

  // 9. Generate Security Report
  console.log('9. Generating Formal Security Report (/api/reports)...');
  const reportRes = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ attack_id: replayedAttack.id })
  });
  assert.strictEqual(reportRes.status, 201);
  const reportData = await reportRes.json();
  const report = reportData.report;
  assert.ok(report.id);
  assert.strictEqual(report.report_data.attack.outcome, 'blocked');
  console.log('   ✓ Report generated:', report.report_data.title);

  // 10. Verify Updated Dashboard Metrics
  console.log('10. Verifying Updated Dashboard Metrics (/api/analytics/dashboard)...');
  const finalDashRes = await fetch(`${BASE_URL}/analytics/dashboard`, { headers: authHeaders });
  const finalDashData = await finalDashRes.json();
  assert.strictEqual(finalDashData.metrics.totalAgents, 1);
  assert.strictEqual(finalDashData.metrics.securityTests, 2); // Original + Replay
  assert.strictEqual(finalDashData.metrics.attacksBlocked, 1);
  assert.strictEqual(finalDashData.metrics.threatsDetected, 1);
  assert.strictEqual(finalDashData.metrics.activePolicies, 1);
  console.log('   ✓ Dashboard metrics updated:');
  console.log('     - Total Agents:', finalDashData.metrics.totalAgents);
  console.log('     - Security Tests:', finalDashData.metrics.securityTests);
  console.log('     - Attacks Blocked:', finalDashData.metrics.attacksBlocked);
  console.log('     - Threats Detected:', finalDashData.metrics.threatsDetected);
  console.log('     - Active Policies:', finalDashData.metrics.activePolicies);

  console.log('\n============================================================');
  console.log('🎉 COMPLETE 10-STEP DEMO JOURNEY VERIFIED WITH ZERO ERRORS!');
  console.log('============================================================');
}

runE2EJourney().catch(err => {
  console.error('❌ E2E Journey Failed:', err);
  process.exit(1);
});
