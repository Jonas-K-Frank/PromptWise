"use client";

import * as React from "react";
import { Check, ChevronDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type PromptCategoryScore } from "@/lib/prompt-scoring";
import { cn } from "@/lib/utils";

interface ScoreCategoryPanelProps {
  category: PromptCategoryScore;
}

export function ScoreCategoryPanel({ category }: ScoreCategoryPanelProps) {
  const [expanded, setExpanded] = React.useState(false);

  const passed = category.rules.filter((rule) => rule.passed);
  const missing = category.rules.filter((rule) => !rule.passed);

  return (
    <div className="border-b last:border-b-0">
      <button
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
        onClick={() => setExpanded((prev) => !prev)}
        type="button"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="text-sm font-medium">{category.label}</span>
          <Badge
            variant={category.status === "Strong" ? "default" : "secondary"}
          >
            {category.score}/{category.maxScore}
          </Badge>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {category.status}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {expanded && (
        <div className="space-y-4 border-t bg-muted/20 px-4 py-4">
          {passed.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Passed checks
              </p>
              <ul className="space-y-1.5">
                {passed.map((rule) => (
                  <li className="flex items-center gap-2 text-sm" key={rule.id}>
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

          {missing.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Missing elements
              </p>
              <ul className="space-y-1.5">
                {missing.map((rule) => (
                  <li
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                    key={rule.id}
                  >
                    <Minus
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-accent"
                    />
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Why this matters
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              {category.whyMatters}
            </p>
          </div>

          {missing.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Suggested improvements
              </p>
              <ul className="space-y-2">
                {missing.map((rule) => (
                  <li
                    className="flex gap-2.5 text-sm leading-6 text-muted-foreground"
                    key={rule.id}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    {rule.recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
