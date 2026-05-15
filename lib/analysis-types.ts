import type {
  PromptCategoryScore,
  PromptRuleResult,
  PromptScoreCategoryId,
  PromptScoreResult
} from "./prompt-scoring";

export type PromptAnalysisRequest = {
  prompt: string;
  mode: string;
};

export type PromptCheck = {
  label: string;
  status: "passed" | "warning" | "failed";
  category: PromptScoreCategoryId;
  explanation: string;
};

export type CategoryExplanation = {
  category: PromptScoreCategoryId;
  score: number;
  maxScore: number;
  passedChecks: string[];
  missingElements: string[];
  whyThisMatters: string;
  suggestedImprovements: string[];
};

export type PromptScoreCategory = {
  clarity: number;
  context: number;
  structure: number;
  safety: number;
};

export type PromptAnalysisResponse = {
  overallScore: number;
  status:
    | "Needs Review"
    | "Basic Prompt"
    | "Structured Prompt"
    | "High Quality Prompt"
    | "Enterprise Ready";
  maturity: "Ad-hoc" | "Guided" | "Structured" | "Operational" | "Enterprise";
  scores: PromptScoreCategory;
  checks: PromptCheck[];
  categoryExplanations: CategoryExplanation[];
  feedback: string;
  improvedPrompt: string;
  safetyAnalysis: string;
  improvementsAdded: string[];
};

const CATEGORY_MAX: Record<PromptScoreCategoryId, number> = {
  clarity: 30,
  context: 25,
  structure: 25,
  safety: 20
};

const CATEGORY_LABELS: Record<PromptScoreCategoryId, string> = {
  clarity: "Clarity",
  context: "Context",
  structure: "Structure",
  safety: "Safety"
};

export function adaptAnalysisToScoreResult(
  response: PromptAnalysisResponse,
  prompt: string
): PromptScoreResult {
  const categories: PromptCategoryScore[] = response.categoryExplanations.map(
    (catExp) => {
      const maxScore = CATEGORY_MAX[catExp.category];
      const score = Math.min(Math.max(0, catExp.score), maxScore);
      const ratio = maxScore === 0 ? 0 : score / maxScore;

      const catChecks = response.checks.filter(
        (c) => c.category === catExp.category
      );

      const rules: PromptRuleResult[] = catChecks.map((check) => ({
        id: `${catExp.category}.${check.label
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")}`,
        label: check.label,
        passed: check.status === "passed",
        points: 0,
        maxPoints: 0,
        recommendation: check.explanation
      }));

      return {
        id: catExp.category,
        label: CATEGORY_LABELS[catExp.category],
        score,
        maxScore,
        status:
          ratio >= 0.8 ? "Strong" : ratio >= 0.5 ? "Needs review" : "Weak",
        rules,
        whyMatters: catExp.whyThisMatters
      };
    }
  );

  const allRules = categories.flatMap((c) => c.rules);
  const wordCount = prompt.trim()
    ? prompt.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const detectedRisks = response.checks
    .filter((c) => c.category === "safety" && c.status === "failed")
    .map((c) => c.label);

  return {
    totalScore: Math.min(Math.max(0, response.overallScore), 100),
    maxScore: 100,
    wordCount,
    characterCount: prompt.length,
    riskCount: detectedRisks.length,
    passedRules: allRules.filter((r) => r.passed).length,
    totalRules: allRules.length,
    categories,
    recommendations:
      response.improvementsAdded.length > 0
        ? response.improvementsAdded
        : [response.feedback],
    detectedRisks
  };
}
