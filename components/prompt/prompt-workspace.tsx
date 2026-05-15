"use client";

import * as React from "react";
import {
  Clipboard,
  FileText,
  Gauge,
  Loader2,
  LockKeyhole,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
  WandSparkles
} from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PromptStatusBanner } from "@/components/prompt/prompt-status-banner";
import { ScoreCategoryPanel } from "@/components/prompt/score-category-panel";
import { ScoreComparison } from "@/components/prompt/score-comparison";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  adaptAnalysisToScoreResult,
  type PromptAnalysisResponse
} from "@/lib/analysis-types";
import { scorePrompt } from "@/lib/prompt-scoring";
import { cn } from "@/lib/utils";

const promptModes = [
  {
    id: "business",
    label: "Business",
    description: "Business communication and professional context"
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "B2B marketing, audience, channel and conversion"
  },
  {
    id: "technical",
    label: "Technical",
    description: "Requirements, constraints and implementation details"
  },
  {
    id: "safety",
    label: "Safety",
    description: "Data minimization, sensitive information and disclosure"
  }
] as const;

type PromptMode = (typeof promptModes)[number]["id"];

const starterPrompt = "Write something about our new product for LinkedIn.";

export function PromptWorkspace() {
  const [prompt, setPrompt] = React.useState(starterPrompt);
  const [mode, setMode] = React.useState<PromptMode>("business");
  const [copied, setCopied] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [apiResponse, setApiResponse] =
    React.useState<PromptAnalysisResponse | null>(null);

  const analysis = React.useMemo(
    () =>
      apiResponse ? adaptAnalysisToScoreResult(apiResponse, prompt) : null,
    [apiResponse, prompt]
  );

  const improvedPrompt = apiResponse?.improvedPrompt ?? "";

  const improvedAnalysis = React.useMemo(
    () => (improvedPrompt ? scorePrompt(improvedPrompt) : null),
    [improvedPrompt]
  );

  const clarityScore = analysis?.categories.find((c) => c.id === "clarity");
  const contextScore = analysis?.categories.find((c) => c.id === "context");
  const structureScore = analysis?.categories.find(
    (c) => c.id === "structure"
  );
  const safetyScore = analysis?.categories.find((c) => c.id === "safety");

  const scoreCards = [
    {
      label: "Clarity",
      value: analysis ? `${clarityScore?.score ?? 0}/30` : "—",
      detail: analysis ? (clarityScore?.status ?? "Weak") : "Run analysis",
      icon: Gauge
    },
    {
      label: "Context",
      value: analysis ? `${contextScore?.score ?? 0}/25` : "—",
      detail: analysis ? (contextScore?.status ?? "Weak") : "Run analysis",
      icon: Target
    },
    {
      label: "Structure",
      value: analysis ? `${structureScore?.score ?? 0}/25` : "—",
      detail: analysis ? (structureScore?.status ?? "Weak") : "Run analysis",
      icon: FileText
    },
    {
      label: "Safety",
      value: analysis ? `${safetyScore?.score ?? 0}/20` : "—",
      detail: analysis
        ? analysis.riskCount
          ? `${analysis.riskCount} risk flags`
          : "No obvious leaks"
        : "Run analysis",
      icon: LockKeyhole
    }
  ];

  const wordCount = prompt.trim()
    ? prompt.trim().split(/\s+/).filter(Boolean).length
    : 0;

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyImprovedPrompt() {
    await navigator.clipboard.writeText(improvedPrompt);
    setCopied(true);
  }

  function handleReset() {
    setPrompt("");
    setApiResponse(null);
    setError(null);
  }

  function handleLoadExample() {
    setPrompt(starterPrompt);
    setApiResponse(null);
    setError(null);
  }

  async function handleAnalyze() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ??
            `Analysis failed (${res.status})`
        );
      }
      const data: PromptAnalysisResponse = await res.json();
      setApiResponse(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Analysis failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="flex min-h-screen">
        <AppSidebar />

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground md:hidden">
                  <WandSparkles className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-xl font-semibold tracking-normal">
                      Prompt Review Dashboard
                    </h1>
                    <Badge variant="secondary">AI analysis</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Review prompt quality, safety and output readiness before
                    use.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className="gap-1.5" variant="outline">
                  <ShieldAlert className="size-3.5" aria-hidden="true" />
                  Enterprise policy: Standard
                </Badge>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {scoreCards.map((card) => (
                <Card key={card.label}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {card.label}
                        </p>
                        <p className="mt-2 text-3xl font-semibold tracking-normal">
                          {card.value}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {card.detail}
                        </p>
                      </div>
                      <div className="flex size-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                        <card.icon className="size-4" aria-hidden="true" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>

            {analysis && <PromptStatusBanner analysis={analysis} />}

            <section className="grid gap-6 xl:items-start xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Sparkles
                            className="size-5 text-primary"
                            aria-hidden="true"
                          />
                          Prompt intake
                        </CardTitle>
                        <CardDescription>
                          Add the original prompt and select the operating
                          context.
                        </CardDescription>
                      </div>
                      {analysis && (
                        <Badge
                          variant={
                            analysis.riskCount ? "destructive" : "secondary"
                          }
                        >
                          {analysis.riskCount
                            ? "Review safety"
                            : "No obvious data risk"}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 p-4 sm:p-6">
                    <div
                      aria-label="Prompt mode"
                      className="grid grid-cols-2 gap-2 rounded-lg border bg-background p-1 lg:grid-cols-4"
                      role="tablist"
                    >
                      {promptModes.map((item) => (
                        <Button
                          aria-selected={mode === item.id}
                          className="w-full"
                          key={item.id}
                          onClick={() => setMode(item.id)}
                          role="tab"
                          size="sm"
                          type="button"
                          variant={mode === item.id ? "default" : "ghost"}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="prompt">
                        Original prompt
                      </label>
                      <Textarea
                        className="min-h-[300px] resize-y bg-background"
                        id="prompt"
                        minLength={1}
                        onChange={(event) => setPrompt(event.target.value)}
                        placeholder="Paste or write a prompt to coach..."
                        value={prompt}
                      />
                    </div>

                    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-muted-foreground">
                        {wordCount} words · {prompt.length} characters
                      </p>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          className="gap-2"
                          onClick={handleReset}
                          type="button"
                          variant="outline"
                        >
                          <RefreshCw className="size-4" aria-hidden="true" />
                          Reset
                        </Button>
                        <Button
                          className="gap-2"
                          onClick={handleLoadExample}
                          type="button"
                          variant="secondary"
                        >
                          <FileText className="size-4" aria-hidden="true" />
                          Load example
                        </Button>
                        <Button
                          className="gap-2"
                          disabled={isLoading || !prompt.trim()}
                          onClick={handleAnalyze}
                          type="button"
                        >
                          {isLoading ? (
                            <Loader2
                              className="size-4 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <Sparkles className="size-4" aria-hidden="true" />
                          )}
                          {isLoading ? "Analysing…" : "Analyse"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {improvedPrompt && (
                  <div className="rounded-lg border bg-background">
                    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-normal">
                          <Target
                            className="size-5 text-accent"
                            aria-hidden="true"
                          />
                          Improved prompt
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          AI-generated rewrite with role, context, output and
                          safety.
                        </p>
                      </div>
                      <Button
                        className="gap-2"
                        onClick={copyImprovedPrompt}
                        type="button"
                      >
                        <Clipboard className="size-4" aria-hidden="true" />
                        {copied ? "Copied" : "Copy improved prompt"}
                      </Button>
                    </div>
                    <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap p-4 text-sm leading-6 text-foreground sm:p-6">
                      <code>{improvedPrompt}</code>
                    </pre>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {analysis ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Quality signals
                        </CardTitle>
                        <CardDescription>
                          Click a category to see passed checks, missing
                          elements and suggestions.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        {analysis.categories.map((category) => (
                          <ScoreCategoryPanel
                            category={category}
                            key={category.id}
                          />
                        ))}
                      </CardContent>
                    </Card>

                    {improvedAnalysis && (
                      <ScoreComparison
                        original={analysis}
                        improved={improvedAnalysis}
                        improvementsAdded={apiResponse?.improvementsAdded}
                      />
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Governance notes
                        </CardTitle>
                        <CardDescription>
                          Coaching recommendations based on the current prompt.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {analysis.recommendations.map((suggestion) => (
                            <li
                              className="flex gap-3 text-sm leading-6"
                              key={suggestion}
                            >
                              <span
                                className={cn(
                                  "mt-2 size-2 shrink-0 rounded-full",
                                  suggestion
                                    .toLowerCase()
                                    .match(
                                      /sensitive|credential|risk|personal|confidential/
                                    )
                                    ? "bg-destructive"
                                    : "bg-primary"
                                )}
                              />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="flex min-h-[200px] items-center justify-center rounded-lg border bg-card p-8 text-center">
                    <div>
                      <Sparkles
                        className="mx-auto mb-3 size-8 text-muted-foreground/40"
                        aria-hidden="true"
                      />
                      <p className="text-sm font-medium text-muted-foreground">
                        Quality signals will appear here
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Enter a prompt and click Analyse to get started.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
