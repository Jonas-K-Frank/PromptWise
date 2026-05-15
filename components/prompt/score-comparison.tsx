import { ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  getPromptStatus,
  type PromptRuleResult,
  type PromptScoreResult
} from "@/lib/prompt-scoring";

function getImprovements(
  original: PromptScoreResult,
  improved: PromptScoreResult
): PromptRuleResult[] {
  return improved.categories.flatMap((improvedCat) => {
    const originalCat = original.categories.find((c) => c.id === improvedCat.id);
    if (!originalCat) return [];
    return improvedCat.rules.filter((improvedRule) => {
      const originalRule = originalCat.rules.find((r) => r.id === improvedRule.id);
      return improvedRule.passed && originalRule && !originalRule.passed;
    });
  });
}

interface ScoreComparisonProps {
  original: PromptScoreResult;
  improved: PromptScoreResult;
}

export function ScoreComparison({ original, improved }: ScoreComparisonProps) {
  const delta = improved.totalScore - original.totalScore;
  const originalStatus = getPromptStatus(original.totalScore);
  const improvedStatus = getPromptStatus(improved.totalScore);
  const improvements = getImprovements(original, improved);

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-lg">Score comparison</CardTitle>
        <CardDescription>
          Impact of the structured rewrite on prompt quality.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Original</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {original.totalScore}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {originalStatus.label}
            </p>
          </div>

          <div className="flex flex-col items-center gap-1 pt-1">
            <ArrowRight
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            {delta > 0 && (
              <Badge className="tabular-nums" variant="default">
                +{delta}
              </Badge>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">Improved</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">
              {improved.totalScore}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {improvedStatus.label}
            </p>
          </div>
        </div>

        {improvements.length > 0 && (
          <div className="border-t pt-4">
            <p className="mb-3 text-sm font-medium">Improvements added</p>
            <ul className="space-y-2">
              {improvements.map((rule) => (
                <li className="flex items-center gap-2.5 text-sm" key={rule.id}>
                  <Check
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-primary"
                  />
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
