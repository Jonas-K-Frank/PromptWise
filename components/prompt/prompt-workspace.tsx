"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  FileText,
  Gauge,
  LockKeyhole,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
  WandSparkles
} from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
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
import { scorePrompt } from "@/lib/prompt-scoring";
import { cn } from "@/lib/utils";

const promptModes = [
  {
    id: "business",
    label: "Business",
    role: "business communication coach",
    focus: "clear business context, measurable goals and a practical output format"
  },
  {
    id: "marketing",
    label: "Marketing",
    role: "B2B marketing strategist",
    focus: "audience, channel, tone, message angle and conversion intent"
  },
  {
    id: "technical",
    label: "Technical",
    role: "senior technical writer",
    focus: "requirements, constraints, edge cases and implementation details"
  },
  {
    id: "safety",
    label: "Safety",
    role: "responsible AI reviewer",
    focus: "data minimization, sensitive information and safe disclosure boundaries"
  }
] as const;

type PromptMode = (typeof promptModes)[number]["id"];

const starterPrompt = "Write something about our new product for LinkedIn.";

function rewritePrompt(prompt: string, mode: PromptMode) {
  const activeMode =
    promptModes.find((item) => item.id === mode) ?? promptModes[0];
  const cleanPrompt =
    prompt.trim() || "Describe the task you want the AI to complete.";

  return `You are a ${activeMode.role}.

Task:
${cleanPrompt}

Context:
[Add the relevant background, audience and business goal.]

Focus on:
${activeMode.focus}.

Output:
[Specify format, length, tone and any required sections.]

Safety:
Do not include private, confidential or personally identifiable information unless it has been anonymized.`;
}

function scoreLabel(score: number) {
  if (score >= 80) {
    return "Ready";
  }

  if (score >= 60) {
    return "Needs review";
  }

  return "Incomplete";
}

export function PromptWorkspace() {
  const [prompt, setPrompt] = React.useState(starterPrompt);
  const [mode, setMode] = React.useState<PromptMode>("business");
  const [copied, setCopied] = React.useState(false);

  const analysis = React.useMemo(() => scorePrompt(prompt), [prompt]);
  const improvedPrompt = React.useMemo(
    () => rewritePrompt(prompt, mode),
    [prompt, mode]
  );

  const clarityScore = analysis.categories.find(
    (category) => category.id === "clarity"
  );
  const contextScore = analysis.categories.find(
    (category) => category.id === "context"
  );
  const structureScore = analysis.categories.find(
    (category) => category.id === "structure"
  );
  const safetyScore = analysis.categories.find(
    (category) => category.id === "safety"
  );

  const scoreCards = [
    {
      label: "Clarity",
      value: `${clarityScore?.score ?? 0}/${clarityScore?.maxScore ?? 30}`,
      detail: clarityScore?.status ?? "Weak",
      icon: Gauge
    },
    {
      label: "Context",
      value: `${contextScore?.score ?? 0}/${contextScore?.maxScore ?? 25}`,
      detail: contextScore?.status ?? "Weak",
      icon: Target
    },
    {
      label: "Structure",
      value: `${structureScore?.score ?? 0}/${structureScore?.maxScore ?? 25}`,
      detail: structureScore?.status ?? "Weak",
      icon: FileText
    },
    {
      label: "Safety",
      value: `${safetyScore?.score ?? 0}/${safetyScore?.maxScore ?? 20}`,
      detail: analysis.riskCount ? `${analysis.riskCount} risk flags` : "No obvious leaks",
      icon: LockKeyhole
    }
  ];

  React.useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyImprovedPrompt() {
    await navigator.clipboard.writeText(improvedPrompt);
    setCopied(true);
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
                    <Badge variant="secondary">Live analysis</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Review prompt quality, safety and output readiness before use.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className="gap-1.5" variant="outline">
                  <ShieldAlert className="size-3.5" aria-hidden="true" />
                  Enterprise policy: Standard
                </Badge>
                <div className="md:hidden">
                  <ThemeToggle />
                </div>
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
                        <p className="text-sm text-muted-foreground">{card.label}</p>
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

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="size-5 text-primary" aria-hidden="true" />
                        Prompt intake
                      </CardTitle>
                      <CardDescription>
                        Add the original prompt and select the operating context.
                      </CardDescription>
                    </div>
                    <Badge
                      variant={analysis.riskCount ? "destructive" : "secondary"}
                    >
                      {analysis.riskCount ? "Review safety" : "No obvious data risk"}
                    </Badge>
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
                    <div className="text-sm text-muted-foreground">
                      {analysis.wordCount} words · {analysis.passedRules} of{" "}
                      {analysis.totalRules} rules passed
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        className="gap-2"
                        onClick={() => setPrompt("")}
                        type="button"
                        variant="outline"
                      >
                        <RefreshCw className="size-4" aria-hidden="true" />
                        Reset
                      </Button>
                      <Button
                        className="gap-2"
                        onClick={() => setPrompt(starterPrompt)}
                        type="button"
                        variant="secondary"
                      >
                        <FileText className="size-4" aria-hidden="true" />
                        Load example
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quality signals</CardTitle>
                    <CardDescription>
                      Required elements for reliable enterprise prompts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.categories.map((category) => {
                      const passedRules = category.rules.filter(
                        (rule) => rule.passed
                      ).length;

                      return (
                        <div
                          className="rounded-md border bg-background px-3 py-3"
                          key={category.id}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium">
                                {category.label}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {passedRules} of {category.rules.length} rules
                                passed
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  category.status === "Strong"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {category.score}/{category.maxScore}
                              </Badge>
                              {category.status === "Strong" ? (
                                <CheckCircle2
                                  className="size-4 text-primary"
                                  aria-label="Strong"
                                />
                              ) : (
                                <AlertTriangle
                                  className="size-4 text-accent"
                                  aria-label="Needs review"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Governance notes</CardTitle>
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
                              suggestion.includes("sensitive") ||
                                suggestion.includes("secrets")
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
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="size-5 text-accent" aria-hidden="true" />
                        Improved prompt
                      </CardTitle>
                      <CardDescription>
                        Structured output with role, context, constraints and safety.
                      </CardDescription>
                    </div>
                    <Button
                      className="gap-2"
                      onClick={copyImprovedPrompt}
                      type="button"
                    >
                      <Clipboard className="size-4" aria-hidden="true" />
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="max-h-[520px] overflow-auto bg-background p-4 text-sm leading-6 text-foreground sm:p-6">
                    <code>{improvedPrompt}</code>
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Result summary</CardTitle>
                  <CardDescription>
                    Readiness snapshot for review and approval workflows.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border bg-background p-4">
                    <p className="text-sm font-medium">Decision</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-2xl font-semibold tracking-normal">
                        {scoreLabel(analysis.totalScore)}
                      </span>
                      <Badge
                        variant={
                          analysis.totalScore >= 80 ? "default" : "secondary"
                        }
                      >
                        {analysis.totalScore}/{analysis.maxScore}
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-background p-4">
                    <p className="text-sm font-medium">Policy status</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {analysis.riskCount
                        ? `Detected: ${analysis.detectedRisks.join(", ")}. Remove or anonymize before approval.`
                        : "No obvious secrets, credentials or personal identifiers detected."}
                    </p>
                  </div>

                  <div className="rounded-lg border bg-background p-4">
                    <p className="text-sm font-medium">Next best action</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {analysis.recommendations[0]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
