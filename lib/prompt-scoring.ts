export type PromptScoreCategoryId =
  | "clarity"
  | "context"
  | "structure"
  | "safety";

export type PromptRuleResult = {
  id: string;
  label: string;
  passed: boolean;
  points: number;
  maxPoints: number;
  recommendation: string;
};

export type PromptCategoryScore = {
  id: PromptScoreCategoryId;
  label: string;
  score: number;
  maxScore: number;
  status: "Strong" | "Needs review" | "Weak";
  rules: PromptRuleResult[];
  whyMatters: string;
};

export type PromptScoreResult = {
  totalScore: number;
  maxScore: number;
  wordCount: number;
  characterCount: number;
  riskCount: number;
  passedRules: number;
  totalRules: number;
  categories: PromptCategoryScore[];
  recommendations: string[];
  detectedRisks: string[];
};

const sensitivePatterns = [
  {
    label: "credential or secret",
    pattern: /\b(password|api key|apikey|secret|token|credential|private key)\b/i
  },
  {
    label: "confidential business data",
    pattern: /\b(confidential|internal only|customer data|personal data|proprietary)\b/i
  },
  {
    label: "email address",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
  },
  {
    label: "US social security number pattern",
    pattern: /\b\d{3}-\d{2}-\d{4}\b/
  },
  {
    label: "credit card-like number",
    pattern: /\b(?:\d[ -]*?){13,16}\b/
  }
];

function countWords(prompt: string) {
  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    return 0;
  }

  return trimmedPrompt.split(/\s+/).filter(Boolean).length;
}

function hasAny(prompt: string, pattern: RegExp) {
  return pattern.test(prompt);
}

function createRule(
  id: string,
  label: string,
  passed: boolean,
  maxPoints: number,
  recommendation: string
): PromptRuleResult {
  return {
    id,
    label,
    passed,
    points: passed ? maxPoints : 0,
    maxPoints,
    recommendation
  };
}

const categoryWhyMatters: Record<PromptScoreCategoryId, string> = {
  clarity:
    "A clear prompt produces a focused, useful answer. Vague or broad requests lead to generic output that requires multiple revision rounds.",
  context:
    "AI produces better results when it understands who the output is for, what the goal is, and how the answer will be used. Missing context leads to assumptions that may not match your needs.",
  structure:
    "Well-structured prompts set explicit expectations for format, length and quality. Without structure, the model chooses its own format, which may not fit your workflow.",
  safety:
    "Enterprise prompts can inadvertently include sensitive data. Detecting and removing credentials, personal data or confidential details before submission protects your organisation and its customers."
};

function toCategory(
  id: PromptScoreCategoryId,
  label: string,
  rules: PromptRuleResult[]
): PromptCategoryScore {
  const score = rules.reduce((total, rule) => total + rule.points, 0);
  const maxScore = rules.reduce((total, rule) => total + rule.maxPoints, 0);
  const ratio = maxScore === 0 ? 0 : score / maxScore;

  return {
    id,
    label,
    score,
    maxScore,
    status: ratio >= 0.8 ? "Strong" : ratio >= 0.5 ? "Needs review" : "Weak",
    rules,
    whyMatters: categoryWhyMatters[id]
  };
}

export function scorePrompt(prompt: string): PromptScoreResult {
  const trimmedPrompt = prompt.trim();
  const wordCount = countWords(trimmedPrompt);
  const characterCount = trimmedPrompt.length;
  const detectedRisks = sensitivePatterns
    .filter((risk) => risk.pattern.test(trimmedPrompt))
    .map((risk) => risk.label);

  const clarityRules = [
    createRule(
      "clarity.action",
      "Clear action",
      hasAny(
        trimmedPrompt,
        /\b(write|create|draft|analyze|summarize|explain|compare|plan|improve|review|generate|rewrite)\b/i
      ),
      10,
      "Start with a clear action verb such as write, analyze, compare or summarize."
    ),
    createRule(
      "clarity.outcome",
      "Desired outcome",
      hasAny(
        trimmedPrompt,
        /\b(goal|objective|outcome|so that|in order to|help me|need to|should)\b/i
      ),
      8,
      "Explain what a successful answer should help you achieve."
    ),
    createRule(
      "clarity.specificity",
      "Specific request",
      wordCount >= 12 || hasAny(trimmedPrompt, /\b(specific|exact|include|focus on|about|for)\b/i),
      7,
      "Add enough specificity to avoid a broad or generic answer."
    ),
    createRule(
      "clarity.conciseness",
      "Concise scope",
      wordCount > 0 && wordCount <= 220,
      5,
      "Keep the prompt focused, or split a long request into smaller tasks."
    )
  ];

  const contextRules = [
    createRule(
      "context.audience",
      "Audience defined",
      hasAny(
        trimmedPrompt,
        /\b(audience|customer|reader|team|executive|developer|farmer|user|stakeholder|client|buyer)\b/i
      ),
      8,
      "Name the audience, reader or decision maker."
    ),
    createRule(
      "context.background",
      "Background included",
      hasAny(
        trimmedPrompt,
        /\b(context|background|product|company|market|problem|because|currently|we are|our)\b/i
      ),
      7,
      "Add the relevant business, product or situational background."
    ),
    createRule(
      "context.domain",
      "Domain details",
      hasAny(
        trimmedPrompt,
        /\b(industry|market|channel|platform|linkedin|email|seo|sales|support|technical|legal|finance)\b/i
      ),
      5,
      "Mention the channel, domain or operating environment."
    ),
    createRule(
      "context.constraints",
      "Constraints stated",
      hasAny(
        trimmedPrompt,
        /\b(tone|length|under|over|max|minimum|include|avoid|must|should not|\d+)\b/i
      ),
      5,
      "State important constraints such as tone, length, inclusions or exclusions."
    )
  ];

  const structureRules = [
    createRule(
      "structure.format",
      "Output format",
      hasAny(
        trimmedPrompt,
        /\b(format|table|bullets|bullet points|sections|json|markdown|list|email|post|memo|plan)\b/i
      ),
      8,
      "Define the answer format, such as bullets, table, memo or sections."
    ),
    createRule(
      "structure.sections",
      "Sectioned instructions",
      hasAny(trimmedPrompt, /\n|:|-/) || hasAny(trimmedPrompt, /\b(step|section|first|then|finally)\b/i),
      7,
      "Break complex instructions into labeled sections or steps."
    ),
    createRule(
      "structure.role",
      "Role or perspective",
      hasAny(trimmedPrompt, /\b(you are|act as|as a|role|expert|specialist|advisor|coach)\b/i),
      5,
      "Assign the AI a role or perspective when expertise matters."
    ),
    createRule(
      "structure.evaluation",
      "Evaluation criteria",
      hasAny(
        trimmedPrompt,
        /\b(criteria|rubric|quality|accuracy|examples|check|ensure|success)\b/i
      ),
      5,
      "Add criteria the answer should satisfy."
    )
  ];

  const safetyRules = [
    createRule(
      "safety.no-sensitive-data",
      "No sensitive data detected",
      detectedRisks.length === 0,
      10,
      "Remove secrets, credentials, personal data or confidential business details."
    ),
    createRule(
      "safety.anonymization",
      "Anonymization guidance",
      detectedRisks.length === 0 || hasAny(trimmedPrompt, /\b(anonymize|redact|placeholder|sample data|synthetic)\b/i),
      4,
      "Use placeholders, anonymized examples or synthetic data for sensitive cases."
    ),
    createRule(
      "safety.boundaries",
      "Safe boundaries",
      hasAny(
        trimmedPrompt,
        /\b(do not|avoid|exclude|without|only use|public information|approved)\b/i
      ),
      3,
      "State what the model should avoid or exclude."
    ),
    createRule(
      "safety.policy-awareness",
      "Policy awareness",
      hasAny(trimmedPrompt, /\b(policy|privacy|security|compliance|governance|permission)\b/i),
      3,
      "Mention privacy, security or governance requirements when they matter."
    )
  ];

  const categories = [
    toCategory("clarity", "Clarity", clarityRules),
    toCategory("context", "Context", contextRules),
    toCategory("structure", "Structure", structureRules),
    toCategory("safety", "Safety", safetyRules)
  ];

  const totalScore = categories.reduce((total, category) => total + category.score, 0);
  const maxScore = categories.reduce((total, category) => total + category.maxScore, 0);
  const allRules = categories.flatMap((category) => category.rules);
  const recommendations = allRules
    .filter((rule) => !rule.passed)
    .map((rule) => rule.recommendation);

  return {
    totalScore,
    maxScore,
    wordCount,
    characterCount,
    riskCount: detectedRisks.length,
    passedRules: allRules.filter((rule) => rule.passed).length,
    totalRules: allRules.length,
    categories,
    recommendations: recommendations.length
      ? Array.from(new Set(recommendations))
      : [
          "Strong prompt foundation. Add examples or evaluation criteria if accuracy matters."
        ],
    detectedRisks
  };
}
