export interface SensitiveDataFinding {
  type: string;
  category: 'credential' | 'pii' | 'network' | 'financial';
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

// Regex patterns for sensitive data detection
const PATTERNS: Array<{
  type: string;
  category: 'credential' | 'pii' | 'network' | 'financial';
  severity: 'critical' | 'medium' | 'low';
  regex: RegExp;
  mask: (match: string) => string;
}> = [
  {
    type: 'API Secret / Key Token',
    category: 'credential',
    severity: 'critical',
    regex: /(?:mock_test_token_[0-9a-zA-Z]{10,}|(?:api[_-]key|secret[_-]key|token)\s*[:=]\s*['"]?[a-zA-Z0-9_-]{16,}['"]?|Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*)/gi,
    mask: () => '[REDACTED_API_KEY]',
  },
  {
    type: 'Database Password / Credential',
    category: 'credential',
    severity: 'critical',
    regex: /(?:password|passwd|pwd|secret)\s*[:=]\s*['"]?([^\s'";,]{6,})['"]?/gi,
    mask: () => 'password: [REDACTED_SECRET]',
  },
  {
    type: 'Social Security Number (SSN)',
    category: 'pii',
    severity: 'critical',
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    mask: () => '[REDACTED_SSN]',
  },
  {
    type: 'Credit Card Number',
    category: 'financial',
    severity: 'critical',
    regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    mask: () => '[REDACTED_CREDIT_CARD]',
  },
  {
    type: 'Email Address',
    category: 'pii',
    severity: 'medium',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    mask: (match) => {
      const parts = match.split('@');
      return `${parts[0].slice(0, 2)}***@${parts[1]}`;
    },
  },
  {
    type: 'Phone Number',
    category: 'pii',
    severity: 'medium',
    regex: /\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g,
    mask: () => '[REDACTED_PHONE]',
  },
  {
    type: 'Customer Account / Balance Identifier',
    category: 'financial',
    severity: 'medium',
    regex: /\b(?:ACC|ACCT|CUST|INV)-[0-9]{4,8}\b/gi,
    mask: () => '[REDACTED_ACC_ID]',
  },
  {
    type: 'Internal IP Address',
    category: 'network',
    severity: 'low',
    regex: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})\b/g,
    mask: () => '[REDACTED_INTERNAL_IP]',
  },
  {
    type: 'External Adversary URL',
    category: 'network',
    severity: 'low',
    regex: /https?:\/\/(?:evil-[a-z0-9.-]+|attacker-[a-z0-9.-]+|[a-z0-9.-]+\.xyz|[a-z0-9.-]+\.top)\/[^\s)]*/gi,
    mask: () => '[REDACTED_UNTRUSTED_URL]',
  }
];

export function detectSensitiveData(text: string): SensitiveDataResult {
  if (!text || typeof text !== 'string') {
    return {
      detected: false,
      totalFindings: 0,
      highestSeverity: 'none',
      findings: [],
      redactedText: '',
    };
  }

  const findings: SensitiveDataFinding[] = [];
  let redacted = text;
  let hasCritical = false;
  let hasMedium = false;
  let hasLow = false;

  for (const item of PATTERNS) {
    const matches = Array.from(text.matchAll(item.regex)).map(m => m[0]);
    if (matches.length > 0) {
      if (item.severity === 'critical') hasCritical = true;
      if (item.severity === 'medium') hasMedium = true;
      if (item.severity === 'low') hasLow = true;

      // Unique samples (max 3)
      const uniqueSamples = Array.from(new Set(matches)).slice(0, 3);

      findings.push({
        type: item.type,
        category: item.category,
        severity: item.severity,
        count: matches.length,
        samples: uniqueSamples,
      });

      redacted = redacted.replace(item.regex, (match) => item.mask(match));
    }
  }

  const highestSeverity = hasCritical ? 'critical' : hasMedium ? 'medium' : hasLow ? 'low' : 'none';

  return {
    detected: findings.length > 0,
    totalFindings: findings.reduce((acc, f) => acc + f.count, 0),
    highestSeverity,
    findings,
    redactedText: redacted,
  };
}
