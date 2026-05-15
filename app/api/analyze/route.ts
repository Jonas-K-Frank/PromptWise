import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const MAX_PROMPT_LENGTH = 4000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

const analysisSchema = {
  type: "object",
  properties: {
    overallScore: { type: "integer" },
    status: {
      type: "string",
      enum: [
        "Needs Review",
        "Basic Prompt",
        "Structured Prompt",
        "High Quality Prompt",
        "Enterprise Ready"
      ]
    },
    maturity: {
      type: "string",
      enum: ["Ad-hoc", "Guided", "Structured", "Operational", "Enterprise"]
    },
    scores: {
      type: "object",
      properties: {
        clarity: { type: "integer" },
        context: { type: "integer" },
        structure: { type: "integer" },
        safety: { type: "integer" }
      },
      required: ["clarity", "context", "structure", "safety"],
      additionalProperties: false
    },
    checks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          status: { type: "string", enum: ["passed", "warning", "failed"] },
          category: {
            type: "string",
            enum: ["clarity", "context", "structure", "safety"]
          },
          explanation: { type: "string" }
        },
        required: ["label", "status", "category", "explanation"],
        additionalProperties: false
      }
    },
    categoryExplanations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["clarity", "context", "structure", "safety"]
          },
          score: { type: "integer" },
          maxScore: { type: "integer" },
          passedChecks: { type: "array", items: { type: "string" } },
          missingElements: { type: "array", items: { type: "string" } },
          whyThisMatters: { type: "string" },
          suggestedImprovements: { type: "array", items: { type: "string" } }
        },
        required: [
          "category",
          "score",
          "maxScore",
          "passedChecks",
          "missingElements",
          "whyThisMatters",
          "suggestedImprovements"
        ],
        additionalProperties: false
      }
    },
    feedback: { type: "string" },
    improvedPrompt: { type: "string" },
    safetyAnalysis: { type: "string" },
    improvementsAdded: { type: "array", items: { type: "string" } }
  },
  required: [
    "overallScore",
    "status",
    "maturity",
    "scores",
    "checks",
    "categoryExplanations",
    "feedback",
    "improvedPrompt",
    "safetyAnalysis",
    "improvementsAdded"
  ],
  additionalProperties: false
};

const systemPrompt = `You are PromptWise, an enterprise AI prompt coach. Evaluate the submitted prompt and return a structured analysis.

Scoring guidelines (integer scores within the stated range):
- Clarity (0–30): Clear action verb, desired outcome stated, specific scope, concise phrasing
- Context (0–25): Audience defined, relevant background present, domain details mentioned, constraints stated
- Structure (0–25): Output format specified, instructions sectioned, role or perspective assigned, evaluation criteria present
- Safety (0–20): No sensitive data (credentials, PII, confidential information), anonymization encouraged, safe boundaries set, policy awareness shown

overallScore must equal scores.clarity + scores.context + scores.structure + scores.safety.

Status must match overallScore:
0–30 → Needs Review · 31–55 → Basic Prompt · 56–75 → Structured Prompt · 76–89 → High Quality Prompt · 90–100 → Enterprise Ready

Maturity must match overallScore:
0–30 → Ad-hoc · 31–55 → Guided · 56–75 → Structured · 76–89 → Operational · 90–100 → Enterprise

checks: evaluate 4 checks per category (16 total). Each check has a label, status (passed/warning/failed), category and a one-sentence explanation. No filler.

categoryExplanations: one entry per category. passedChecks and missingElements are short labels, not sentences. suggestedImprovements are specific and actionable.

improvedPrompt: preserve the user's intent. Do not invent fictional facts or company-specific policies. Add structure, role, context, output format and constraints where useful.

safetyAnalysis: empty string if no risks detected. If risks are present, describe them clearly.

improvementsAdded: list the specific improvements made in the rewrite as short labels. If no improvements were needed, return ["The prompt is already well-structured."].

Rules:
- Be helpful, educational and concise.
- Do not be playful. Do not overstate certainty. Do not invent company-specific policies.
- If the prompt contains personal data, credentials or confidential information, set the relevant safety checks to "failed" and warn clearly in safetyAnalysis.`;

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "OpenAI API key is not configured. Add OPENAI_API_KEY to .env.local."
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { prompt, mode } = body as { prompt?: unknown; mode?: unknown };

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "prompt is required." },
      { status: 400 }
    );
  }
  if (prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "prompt must not be empty." },
      { status: 400 }
    );
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.` },
      { status: 400 }
    );
  }

  const modeLabel =
    typeof mode === "string" && mode.trim() ? mode.trim() : "business";

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Mode: ${modeLabel}\n\nPrompt to evaluate:\n${prompt}`
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "prompt_analysis",
          strict: true,
          schema: analysisSchema
        }
      }
    });

    const result = JSON.parse(response.output_text);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[analyze] OpenAI error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 502 }
    );
  }
}
