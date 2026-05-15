"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  getPromptMaturity,
  getPromptStatus,
  type PromptScoreResult
} from "@/lib/prompt-scoring";

function useCountUp(target: number, duration = 500) {
  const [display, setDisplay] = React.useState(target);
  const fromRef = React.useRef(target);
  const rafRef = React.useRef<number>(0);

  React.useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;

    const startTime = performance.now();

    function step(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    }

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

interface PromptStatusBannerProps {
  analysis: PromptScoreResult;
}

export function PromptStatusBanner({ analysis }: PromptStatusBannerProps) {
  const displayScore = useCountUp(analysis.totalScore);
  const status = getPromptStatus(analysis.totalScore);
  const maturity = getPromptMaturity(analysis.totalScore);
  const pct = Math.round((analysis.totalScore / analysis.maxScore) * 100);

  return (
    <div className="rounded-lg border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
        <div className="shrink-0">
          <div className="flex items-end gap-1.5 tabular-nums">
            <span className="text-5xl font-semibold tracking-tight">
              {displayScore}
            </span>
            <span className="mb-1.5 text-sm text-muted-foreground">
              / {analysis.maxScore}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {analysis.passedRules} of {analysis.totalRules} checks passed
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold">{status.label}</span>
            <Badge variant="outline">{maturity.label}</Badge>
          </div>

          <div
            aria-label={`Prompt quality: ${pct}%`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={pct}
            className="h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="text-sm leading-6 text-muted-foreground">
            {status.description}
          </p>
        </div>
      </div>
    </div>
  );
}
