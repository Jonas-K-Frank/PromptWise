# PromptWise

**AI prompt coaching for safer, clearer and more effective AI interactions.**

PromptWise helps users improve their prompts before sending them to AI tools like ChatGPT, Copilot or Claude.

The goal is not just to generate better prompts — but to help people understand *why* a prompt works better.

---

## Why PromptWise?

Most people use AI with vague or incomplete prompts.

That leads to:
- inconsistent output
- hallucinations
- poor quality results
- unnecessary frustration
- potential data security risks

PromptWise acts as an AI coach that helps users:
- improve clarity
- add context
- define goals
- structure output
- reduce ambiguity
- avoid sensitive information

---

## Features

### Prompt Analysis

Evaluate prompts based on:
- clarity
- context
- structure
- safety

The current prototype uses a deterministic rule-based scoring engine in `lib/prompt-scoring.ts`. It scores prompts out of 100 across four weighted categories:
- clarity: 30 points
- context: 25 points
- structure: 25 points
- safety: 20 points

### AI Coaching

Receive:
- actionable feedback
- rewritten prompts
- improvement suggestions
- prompt explanations

### Safety Awareness

Identify potentially risky content such as:
- personal information
- internal business data
- sensitive details

### Enterprise-Friendly Design

Built with:
- usability
- governance
- AI adoption
- learning
- responsible AI usage

in mind.

---

## Example

### Original Prompt

```txt
Write something about our new product for LinkedIn.
```

### PromptWise Feedback

- Missing target audience
- No tone specified
- No output length defined
- Lacks business context

### Improved Prompt

```txt
You are a B2B marketing specialist.

Write a LinkedIn post in Danish about our new sustainable feed solution for professional farmers.

Tone:
Professional, optimistic and approachable.

Focus on:
- reduced waste
- operational efficiency
- sustainability benefits

Keep the post under 1200 characters and end with a soft call-to-action.
```

---

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- OpenAI API

---

## Vision

PromptWise is designed as a bridge between:
- AI technology
- usability
- governance
- organizational adoption

The ambition is to help people use AI more confidently, safely and effectively.

---

## Design Principles

### Clarity over Complexity

AI performs better when instructions are clear and structured.

### Guidance over Automation

PromptWise helps users think better — not just generate text faster.

### Safety by Design

Users should understand what information is safe to share with AI systems.

### Enterprise Reality

Built for real-world organizational use cases, not just demos.

---

## Planned Features

### V1

- Prompt analysis
- Prompt scoring
- AI-generated improvements
- Safety feedback
- Multiple prompt modes

### V2

- Prompt history
- Saved templates
- Export/share prompts
- Team workspaces

### V3

- Teams integration
- Browser extension
- Enterprise policy modes
- AI maturity insights
- Multi-model support

---

## Example Modes

- Marketing Mode
- Business Mode
- SEO Mode
- Executive Mode
- Safety Mode
- Technical Mode

---

## Philosophy

> Good prompts create better outcomes.  
> Clear thinking creates better prompts.

---

## Status

Early prototype / active development.

---

## Development

PromptWise is now scaffolded as a Next.js 15 App Router project with TypeScript, Tailwind CSS, shadcn/ui conventions, responsive layout and dark mode.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Project Structure

```txt
app/                    App Router routes, layout and global styles
components/layout/      Shared layout components
components/prompt/      PromptWise workspace and prompt coaching UI
components/ui/          shadcn/ui-compatible primitives
lib/                    Shared utilities
```

---

## Future Ideas

- Sensitive data detection
- Prompt diff visualization
- AI literacy scoring
- Organizational AI maturity tools
- Governance dashboards
- Internal prompt libraries

---

## License

MIT
