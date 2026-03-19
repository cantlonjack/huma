---
description: Audit HUMA's landing page for conversion — hero section, value proposition, CTA clarity, trust signals, above-the-fold content, objection handling, and emotional resonance. Use when evaluating or improving the landing page.
user_invocable: true
---

# HUMA Landing Page Audit

You audit HUMA's landing page against conversion best practices, adapted for a tool that asks for 45 minutes of someone's time and deep personal sharing.

## Context

HUMA's landing page lives in `app/src/app/page.tsx` (the `appState === "landing"` block). It's not a typical SaaS landing — it's asking someone to begin a vulnerable, 45-minute conversation about their life, land, and livelihood. The conversion bar is HIGH.

Read `app/src/app/page.tsx` and `app/src/app/globals.css` before auditing.

## Audit Framework

### 1. Above the Fold (First 5 Seconds)

The visitor decides in 5 seconds whether to stay. Audit:

| Element | Best Practice | Check |
|---|---|---|
| **Headline** | Clear outcome promise. What do I get? | Does it communicate the deliverable (Regenerative Enterprise Map)? |
| **Subheadline** | How it works in one sentence | Does it explain the method (guided conversation)? |
| **Hero visual** | Emotional anchor, not decorative | Is there one? Should there be? |
| **CTA** | Single, clear, low-friction action | Is "Start My Map" compelling? Is it above the fold? |
| **Social proof** | Trust before commitment | Are there any trust signals? Testimonials, logos, numbers? |

**The 5-Second Test:** If someone glanced at this page for 5 seconds and looked away, could they tell you:
1. What HUMA does?
2. What they'll get?
3. What it costs (time and money)?

### 2. Value Proposition Clarity

- **Specificity:** "Discover the enterprises that fit your land, your skills, and your life" — is this specific enough? Does the target user immediately self-identify?
- **Outcome framing:** Is the value framed as an outcome (what they GET) or a process (what they DO)?
- **Differentiator:** What makes HUMA different from a business plan template or farm advisor? Is that clear?
- **For whom:** Can the beachhead user (homesteader, regenerative operator) see themselves in the page?

### 3. CTA Analysis

- **Primary CTA:** "Start My Map" — is "My" good (ownership) or presumptuous?
- **CTA contrast:** Does amber-400 on sand-50 have enough visual weight?
- **CTA copy:** Does it communicate what happens next? (They'll be asked their name)
- **Secondary CTA:** Resume button — is this discoverable for returning users?
- **Friction inventory:** What might make someone hesitate before clicking?

### 4. Objection Handling

Every visitor has objections. Does the page address them?

| Likely Objection | Addressed? |
|---|---|
| "45 minutes is a lot of time" | Partially (mentioned but not framed as investment) |
| "What if I don't have land yet?" | Not addressed |
| "Is this going to try to sell me something?" | Not addressed |
| "How is this different from ChatGPT?" | Not addressed |
| "Who made this?" | Not addressed |
| "Will my data be private?" | Not addressed |
| "What does the output actually look like?" | Not addressed (no sample map) |
| "Is this just a chatbot?" | Partially |

### 5. Trust & Credibility

- **Social proof:** Testimonials, case studies, number of maps generated?
- **Authority signals:** Intellectual lineage (Perkins, Palmer, Savory) — should these be visible?
- **Transparency:** Who built HUMA? What's the model? Is data stored?
- **Sample output:** Can they see an example Regenerative Enterprise Map before committing?
- **Press/features:** Any external validation?

### 6. Emotional Resonance

This page must connect with someone who is:
- Possibly overwhelmed by the complexity of starting a regenerative operation
- Torn between idealism and financial reality
- Tired of generic advice that doesn't know their specific situation
- Possibly skeptical of another "tool" that claims to understand them

Does the copy:
- Meet them where they are emotionally?
- Acknowledge their situation without patronizing?
- Create a sense of "this was made for me"?
- Make the 45-minute commitment feel like a gift, not a chore?

### 7. Page Structure & Visual Hierarchy

- **Reading pattern:** Does the layout follow natural eye movement (Z-pattern or F-pattern)?
- **White space:** Is there enough breathing room?
- **Typography:** Is the serif/sans pairing working? Is the hierarchy clear?
- **Color:** Does the earthy palette convey warmth and seriousness?
- **Mobile layout:** Does the above-the-fold content survive on a phone?

### 8. Technical Performance

- **Load time:** Is the page light enough to load instantly?
- **SEO basics:** Title, meta description, og tags for sharing?
- **Accessibility:** Can the page be navigated with screen reader? Color contrast on CTAs?

## Output Format

```
═══ HUMA LANDING PAGE AUDIT ═══

ABOVE THE FOLD
  5-Second Test: [PASS / PARTIAL / FAIL]
  Headline: [STRONG / NEEDS WORK] — [note]
  CTA: [CLEAR / NEEDS WORK] — [note]
  Trust signals: [PRESENT / MISSING]

VALUE PROPOSITION
  Clarity: [CLEAR / VAGUE / MISSING]
  Specificity: [HIGH / MEDIUM / LOW]
  Differentiator: [CLEAR / UNCLEAR]
  Audience fit: [STRONG / WEAK]

CTA ANALYSIS
  Copy: [EFFECTIVE / NEEDS WORK]
  Visibility: [PROMINENT / BURIED]
  Friction: [LOW / MEDIUM / HIGH]

OBJECTION HANDLING: [X/Y objections addressed]
  [list unaddressed objections with recommendations]

TRUST & CREDIBILITY: [STRONG / THIN / MISSING]
  [specific gaps]

EMOTIONAL RESONANCE: [CONNECTING / FLAT / MISALIGNED]
  [assessment]

VISUAL HIERARCHY: [CLEAN / CLUTTERED / SPARSE]
  [assessment]

CONVERSION ESTIMATE: [HIGH / MEDIUM / LOW confidence]
  Biggest conversion blocker: [what would stop someone from clicking]

PRIORITY RECOMMENDATIONS:
  1. [highest impact change]
  2. [second highest]
  3. [third highest]

QUICK COPY WINS:
  - [specific headline/copy suggestion]
  - [specific CTA suggestion]
  - [specific trust element to add]
═══════════════════════════════
```

## Principles

1. **Don't over-design.** HUMA's landing page should feel like an invitation, not a sales funnel. But it still needs to convert.
2. **Respect the ask.** 45 minutes + personal vulnerability is a big ask. The page must earn that trust.
3. **Show, don't tell.** A sample map would be worth more than any headline.
4. **One page, one action.** Everything serves one goal: click "Start My Map."
