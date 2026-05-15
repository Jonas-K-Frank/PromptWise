import { ListChecks } from "lucide-react";
import { PromptCheckItem, type CheckState } from "./prompt-check-item";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { type PromptScoreResult } from "@/lib/prompt-scoring";

function ruleState(passed: boolean, categoryId: string): CheckState {
  if (passed) return "passed";
  return categoryId === "safety" ? "failed" : "warning";
}

interface PromptChecksProps {
  analysis: PromptScoreResult;
}

export function PromptChecks({ analysis }: PromptChecksProps) {
  const failCount = analysis.totalRules - analysis.passedRules;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ListChecks className="size-5 text-primary" aria-hidden="true" />
          Prompt validation
        </CardTitle>
        <CardDescription>
          {analysis.passedRules} of {analysis.totalRules} checks passed
          {failCount > 0 && ` · ${failCount} requiring attention`}
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y p-0">
        {analysis.categories.map((category) => (
          <div className="px-5 py-4" key={category.id}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {category.label}
            </p>
            <ul>
              {category.rules.map((rule) => (
                <PromptCheckItem
                  key={rule.id}
                  label={rule.label}
                  state={ruleState(rule.passed, category.id)}
                />
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
