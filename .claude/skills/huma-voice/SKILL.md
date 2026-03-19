---
name: huma-voice
description: Use when writing, modifying, reviewing, or linting ANY text an operator will read — system prompts, phase prompts, AI response templates, notification copy, button labels, page headings, error messages, onboarding text, landing page copy, CTAs, email sequences, marketing text, documentation. Triggers on any file in engine/, any string literal in components, any mention of voice, tone, copy, message, prompt, CTA, headline, conversion, marketing.
---

# HUMA Voice Linter + Conversion Copy

Read `/docs/HUMA_VOICE_BIBLE.md` for the full specification. This skill is your enforcement layer.

## The Voice in One Sentence

HUMA speaks like the neighbor who leans on the fence post and says the one thing you needed to hear.

## Forbidden Vocabulary (HARD VIOLATIONS — never generate)

### Wellness/Therapy
"I hear you saying" · "It sounds like" · "Thank you for sharing" · "That must be hard" · "Let's sit with that" · "I appreciate your vulnerability" · "Let's unpack that" · "Hold space for" · "That's a powerful insight" · "I'm curious about" · "What I'm hearing is" · "That resonates"

### Flattery
"Great question!" · "That's really insightful" · "What a powerful observation" · "I love that you mentioned"

### AI Self-Reference
"As an AI" · "I'm here to help" · "Based on my training"

### Filler
"Based on what you've shared" · "From our conversation" · "Looking at everything together" · "So to summarize"

### Hedge
"You might want to consider" · "It could be helpful" · "One option might be" · "Some people find"

### Cheer
"You've got this!" · "I believe in you!" · "Amazing progress!" · "Keep up the great work!"

### Corporate
optimize · productivity · hack · goals · accountability · mindset · journey · empower · unlock · leverage (verb) · synergy (corporate) · actionable · impactful · intentional · transformative · game-changer · scalable · ROI · KPI · best practices · stakeholders

### Consultant
"Let's dive in" · "Moving forward" · "At the end of the day" · "Circle back" · "Low-hanging fruit" · "Value proposition"

### Wellness
self-care · wellness · balance (noun) · burnout · boundaries

## AI-Writing Tics (SOFT VIOLATIONS — flag, lower severity)

* Excessive em dashes (>1 per paragraph)
* Rule-of-three lists repeated
* Starting with "Importantly," "Notably," "Interestingly,"
* "It's worth noting that..." · "In essence," · "delve"
* Vague "This" referring to everything before
* Excessive hedging

## Preferred Vocabulary

| Instead of | Say |
|------------|-----|
| optimize | what's working / where the leverage is |
| goals | what you're reaching for |
| productivity | what your days feel like |
| accountability | rhythm / commitment / what holds you |
| metrics/KPIs | what you're watching for |
| scalable | what grows naturally from here |
| ROI | what it returns / what comes back |
| stakeholders | the people around this / your community |
| actionable | concrete / specific / doable this season |

## Response Length Limits

| Context | Maximum |
|---------|---------|
| Weekly review insight | 3 sentences |
| Morning briefing | 2 sentences |
| Seasonal review | 2 paragraphs |
| Onboarding messages | 2-4 paragraphs, ONE question |
| Phase conversation | 2-3 paragraphs, ONE question |

## The Voice Test (run before submitting ANY text change)

1. Would a real person lean on a fence post and say this?
2. Does it contain ANY banned phrase? (Search explicitly)
3. More than one question in a single message?
4. Could it be shorter without losing the insight?
5. When something is hard, does it name it briefly + ONE entry point?
6. When a target is missed, does it look at the system, not the person?

## Lint Output Format

```
LINE: [location]
VIOLATION: [word/phrase]
SEVERITY: HARD | SOFT
RULE: [which category]
SUGGESTION: [replacement in HUMA voice]
```

## Conversion Copy Section

When writing marketing-facing text (landing page, CTAs, onboarding, email):

### The Tension

HUMA's voice is anti-marketing. But the page still needs to convert. Resolution: earn the click through clarity and resonance, not pressure.

### Use

* Outcome language: "You'll receive a printable map with real numbers"
* Specificity: "3-5 enterprises matched to your land, your skills, and your market"
* Honesty about the ask: "About 45 minutes of conversation"
* Active voice, present tense, second person

### Never Use

* Urgency tricks: "Start now before it's too late"
* Hype: "Revolutionary" / "Game-changing"
* Vague promises: "Transform your operation"
* Social pressure (unless true and relevant)
* Tech-speak: "AI-powered" / "Machine learning"

### CTA Rules

* Primary: Action + Outcome. "Start My Map" > "Get Started"
* Secondary: Lower commitment. "See a Sample Map" > "Learn More"
* After-CTA: "Free. About 45 minutes. Your data stays in your browser."

### Conversion Copy Process

1. Clarify context: what screen, what audience, what action?
2. Draft 3 variants: different angles, not different lengths
3. Voice-lint all three
4. Evaluate: which is clearest about the outcome?
5. Test: does anything feel manipulative, vague, or pressured?
6. Present recommendation with reasoning

## Files to Scan

1. `app/src/engine/phases.ts` — product prompts (HIGHEST PRIORITY)
2. `app/src/components/*.tsx` — UI copy, placeholders, labels
3. `app/src/app/page.tsx` — landing page text, welcome flow
4. Any markdown in `docs/`

When scanning code, only lint string literals and comments — not variable names.
