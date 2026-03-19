# H U M A
## User Journey Map
### Every Touchpoint from First Visit to Graduation

*This document maps the complete operator experience. Every screen, every emotion, every data flow, every transition. Features built in isolation feel like fragments. Features built along this journey feel like one coherent experience.*

March 2026 · Foundational Architecture

---

## 01 — The Journey at a Glance

```
DISCOVER → ARRIVE → COMMIT → DESIGN → FIRST MAP → RETURN → FIRST REVIEW
    ↓                                                           ↓
 (days)                                                    HABIT FORMS
                                                                ↓
                                                        FIRST SEASON
                                                                ↓
                                                          EVOLUTION
                                                                ↓
                                                         GRADUATION
```

The journey has nine stages. Each stage has a critical transition — a moment where the operator either continues or churns. Design effort should be concentrated at these transitions.

---

## 02 — Stage 1: Discover

**How they find HUMA:** A shared Living Canvas on social media. An essay about Holistic Management and life design. A friend's recommendation after their own weekly review. A search for "regenerative enterprise planning" or "whole life design tool."

**What they see first:** The shared artifact or the landing page. In both cases, the visual identity (sage/sand/amber, breathing shape, spatial canvas) is the first impression. They should know within 3 seconds that this is NOT a wellness app, a productivity tool, or a generic SaaS product.

**Emotional target:** Curiosity + recognition. "This describes something I've been feeling but couldn't name."

**Critical transition → Arrive:**
The operator clicks through to the landing page. The landing page must convert curiosity into a single action: click "Begin."

**What can go wrong:**
- The landing page explains too much (they bounce before understanding)
- The visual identity is generic (they categorize it as "another app" and leave)
- The shared canvas isn't visually distinctive enough to stop the scroll

---

## 03 — Stage 2: Arrive (Landing Page)

**Duration:** 15-60 seconds.

**What they experience:** The landing page story — hero → problem → demo → how it works → contrast → canvas preview → vision → CTA.

**Emotional arc:** "This is for me" → "Something IS off" → "Oh — it shows you the connections" → "I want that map" → "Let me start."

**Data flow:** None. No account creation. No email capture. No cookies consent wall. Zero friction between curiosity and action.

**Critical transition → Commit:**
They click "Begin" and arrive at /begin. This is the threshold — the moment they decide to invest time. The /begin page must feel like an invitation, not a form.

**What can go wrong:**
- Two competing CTAs dilute the action
- The page asks for email before demonstrating value
- The "how it works" section is too detailed (they understand intellectually but don't feel compelled)
- The problem section doesn't name THEIR pain specifically enough

---

## 04 — Stage 3: Commit (/begin)

**Duration:** 30 seconds.

**What they experience:** Name input + optional location. Centered vertically. Breathing sage glow behind the HUMA wordmark. Auto-focus on the name field. This is a threshold moment — crossing from browsing to engaging.

**Emotional target:** Quiet anticipation. The feeling of writing your name at the top of a new journal.

**Data captured:** Name and location. Nothing else. These flow into the conversation as context.

**Critical transition → Design:**
They click "Start" and the conversation begins. The first message from HUMA must arrive within 2 seconds and must use their name. Any delay here kills momentum.

**What can go wrong:**
- The page asks for too much information (email, goals, demographics)
- The page explains what's about to happen in detail (kills the anticipation)
- The transition to the conversation page has a loading state longer than 2 seconds

---

## 05 — Stage 4: Design (The 6-Phase Conversation)

**Duration:** 20-40 minutes.

**What they experience:** A conversation with HUMA that progresses through six phases. On desktop, the Living Canvas builds in the right panel as they talk. On mobile, a floating pill shows canvas progress.

### The Emotional Arc (from Strategic Architecture)

| Phase | Duration | Emotion | Canvas Element |
|-------|----------|---------|----------------|
| 1 — Ikigai | 5-8 min | Warmth — "Someone is listening" | Essence Core appears |
| 2 — Holistic Context | 5-8 min | Aspiration + tension — "What do I actually want?" | QoL/Production/Resource nodes |
| 3 — Field Reading | 4-6 min | Grounding — "What do I actually have?" | Capital Profile + Field Layers |
| 4 — Enterprise Map | 5-8 min | Excitement — "I didn't know I could do that" | Enterprise Cards |
| 5 — Nodal Interventions | 3-5 min | Relief — "Just start HERE" | Cascade Indicators |
| 6 — Operational Design | 4-6 min | Confidence — "I can see my week" | Weekly Rhythm |

### The Magic Moment
Occurs in Phase 2 or early Phase 3 — when HUMA names a connection the operator hasn't articulated. "Your money stress and your sleep aren't separate problems. They're the same system under pressure." This is the coherence recognition moment. If it doesn't happen by Phase 3, the conversation needs to probe harder.

### Data Flow
- Each phase transition stores a prose synthesis ([[CONTEXT:xxx]]) for document generation
- Each phase transition stores structured canvas data ([[CANVAS_DATA:xxx]]) for visualization
- The accumulated context grows across phases and is injected into subsequent system prompts
- On completion, all syntheses + canvas data are available for map generation

**Critical transition → First Map:**
The conversation ends. HUMA says something grounding and specific (not celebratory). The "Explore your full canvas" button appears. This click must feel like a reward — the culmination of 30 minutes of conversation becoming a tangible artifact.

**What can go wrong:**
- The AI asks too many questions per message (overwhelms)
- The AI uses anti-pattern voice (flatters, hedges, summarizes)
- The canvas build is invisible (no split-screen, or the canvas isn't updating)
- The magic moment doesn't land (generic insights instead of specific connections)
- Phase transitions feel abrupt rather than natural
- The conversation takes too long (>45 minutes) and fatigue sets in

---

## 06 — Stage 5: First Map (/map/[id])

**Duration:** 5-15 minutes of exploration.

**What they experience:** Their Living Canvas — the spatial, interactive, center-outward map of their entire context. Essence at center, QoL rings, capital profile radar, enterprise cards with real numbers, cascade chains, weekly rhythm.

**Emotional target:** Awe + ownership. "This is MY life. I can SEE it." The coherence recognition feeling at maximum intensity.

**Interactions available:**
- Pan and zoom the spatial canvas
- Click QoL pills to see operational decomposition
- Click enterprise cards to see full breakdowns
- Hover capitals to see connection highlighting
- Toggle to document view for linear/printable version
- Share URL (copy to clipboard)
- Print/PDF

**Data flow:** Map is generated and stored with a shareable URL. Canvas data drives the interactive spatial view. Document markdown drives the print view.

**Critical transition → Return:**
The operator leaves the page. They will either come back — or they won't. This is the most dangerous moment in the entire journey. The product must create a reason to return that isn't "look at your map again."

**The return hook:** Within 24-48 hours, the operator receives a message (email or push notification, depending on what they've opted into): "Your map was created 2 days ago. You said [top QoL statement] was what mattered most. How's it going? One number, 1-10." This is the bridge to the return visit.

**What can go wrong:**
- The canvas is just a formatted text document (no spatial layout, no interactivity)
- The enterprise cards don't have real numbers (feels vague, not credible)
- The share URL doesn't produce a good social preview (OG image is generic)
- There's no reason to come back (static map, no evolving element)
- The operator screenshots the map, feels satisfied, and never returns

---

## 07 — Stage 6: Return (The Second Session)

**Duration:** 60-90 seconds.

**This is the stage almost every AI product fails.** The first session has novelty. The second session must deliver value without novelty.

**What they experience:** When the operator opens HUMA for the second time, they should NOT see their static map. They should see a "What changed?" prompt:

"It's been [N] days since your map was created. Quick pulse check:
Rate your overall week, 1-10: [input]
What's the one thing sitting with you? [input]"

From these two inputs (15 seconds), HUMA generates a brief insight that connects to their canvas context: "You said 5. Last time you mentioned [top QoL statement]. Is that still the thing, or has something shifted?"

**Emotional target:** Surprised attentiveness. "Wait — it remembers. And it's right."

**Data flow:** The pulse response is stored as the first data point in the operator's Shape Timeline. This is the beginning of temporal data — the raw material for pattern recognition.

**Critical transition → First Review:**
HUMA closes the second session with: "Your first weekly review is Sunday evening. 10 minutes. I'll have more to show you then."

This creates anticipation for a specific moment. The operator now has a date, a time, and a promise.

**What can go wrong:**
- The second session shows the same map (no new value, no reason to engage)
- The second session asks too many questions (the operator came for 60 seconds, not 10 minutes)
- HUMA's insight from 2 inputs is generic rather than contextual
- There's no bridge to the weekly review (no anticipation created)

---

## 08 — Stage 7: First Weekly Review

**Duration:** 10 minutes, Sunday evening.

**What they experience:** The weekly review opens with their QoL validation questions:

"How many evenings were free this week? ___/7"
"Energy at end of farm day? 1-5"
"Cash position vs monthly need? On track / Behind / Ahead"

After answering (2-3 minutes), HUMA delivers one insight (maximum 3 sentences) that connects patterns across the responses. If it's the first review, the insight connects to the original conversation. If it's a subsequent review, it connects to prior weeks.

The review closes with the Shape — the capital profile as a radar, now with one data point. "This is your shape this week. It'll mean more as weeks accumulate."

**Emotional target:** Quiet clarity. The "confession booth" feeling — honest with yourself in a private, calm space.

**Data flow:** Validation answers stored. Shape calculated from answers + conversation context. First point on the Shape Timeline.

**Critical transition → Habit Forms:**
The second weekly review must happen. If the operator does two consecutive Sunday reviews, the probability of a third exceeds 75% (this is the established habit formation threshold for weekly practices). The nudge for the second review: "Your shape from last week is waiting. 10 minutes. Same time."

**What can go wrong:**
- The review asks too many questions (more than 5 QoL checks)
- HUMA's insight is generic ("You're doing well!" / "Consider focusing on...")
- The dark mode Operate interface isn't noticeably different from Design Mode (doesn't feel like a distinct ritual)
- The Shape visualization isn't beautiful enough to be motivating
- No notification or reminder for the second week

---

## 09 — Stage 8: First Season (Weeks 2-12)

**Duration:** 10-12 weeks.

**What they experience:** A rhythm. Sunday reviews become habitual. Morning briefings (if subscribed to paid tier) arrive at wake-up time. The Shape Timeline grows. Patterns begin to emerge.

**Key moments in the first season:**

**Week 2-3:** The AI surfaces the first multi-week pattern. "Your Body has been at 3 for two weeks. Something specific changed — what dropped off?" This is the first time the temporal data produces value. It validates the weekly practice.

**Week 4-6:** The AI surfaces a connection the operator missed. "Your Joy drops every week your Thursday overflow runs past 3pm. That's not random." This is a deeper coherence recognition moment — the product is seeing something the operator couldn't see on their own.

**Week 8-10:** The AI suggests a systemic adjustment. "Move Friday's infrastructure block to Thursday afternoon. Protect it. The overflow isn't a discipline problem — it's a design problem." This is the first time HUMA recommends a specific change to the operational design. The weekly rhythm evolves.

**Week 12:** Seasonal review prompt. "It's been three months. Your shape has changed. Want to see how?"

**Emotional arc across the season:**
Weeks 1-4: Building the habit. Curiosity about the Shape Timeline.
Weeks 4-8: The AI's insights become noticeably more specific. Trust deepens.
Weeks 8-12: The operator begins to anticipate connections before HUMA surfaces them. Capacity is developing.

**Data flow:** 12 weeks of validation data. Shape Timeline with 12 points. Pattern database for this operator growing. Capital trends calculable. Enterprise performance trackable (if data captured).

**Critical transition → Evolution:**
The seasonal review is the moment the product proves its long-term value. The operator sees their Shape at week 1 versus week 12. The visual difference IS the value proposition for continued subscription.

**What can go wrong:**
- Weekly reviews feel repetitive (same questions, similar insights)
- The AI doesn't surface genuinely new connections after week 4
- The Shape Timeline isn't visually compelling
- Morning briefings are generic rather than weather-aware and context-specific
- The operator forgets a week and there's no re-engagement bridge

---

## 10 — Stage 9: Evolution (Seasonal Review)

**Duration:** 30 minutes, quarterly.

**What they experience:** The seasonal review opens with the Shape Timeline — 12 weeks of the radar chart morphing. Key moments annotated. Then a structured review:

1. **Capital shifts:** Which capitals grew? Which contracted? Why?
2. **QoL trends:** Which statements held? Which came under pressure?
3. **Enterprise performance:** Actuals versus projections (if tracked).
4. **The Evolution Question:** "What do you know now that you didn't know when this season started?"

The review produces an updated canvas — new capital scores, adjusted enterprise projections, revised nodal interventions for the next season.

**Emotional target:** Perspective + accomplishment. Not "you did great" — but "look how far the system has come. Look what you've learned."

**Data flow:** Seasonal synthesis stored. Canvas updated. If the operator chooses, their key insight is structured as a pattern contribution (voluntary, attributed).

**Critical transition → Year 2 / Graduation:**
After 2-4 seasonal reviews, the operator reaches one of two states:

**Continued use:** The product remains valuable because new patterns emerge, the Shape continues to evolve, and the operator's situation changes (new enterprises, life events, seasonal shifts). The product grows with them.

**Graduation:** The operator has internalized whole-context thinking. They see connections naturally. They run their own weekly review without the app. They make holistic decisions by instinct. They stop using HUMA — and that's a success. They tell five people about it.

---

## 11 — The Sharing Moments

At each stage, there are natural moments where the operator is most likely to share:

| Stage | What They Share | Why | Where |
|-------|----------------|-----|-------|
| First Map | The Living Canvas URL | Pride in their plan + visual beauty | Text to partner/friend, social media |
| Week 4-6 | A screenshot of an insight | "This thing sees connections I missed" | Social media, group chat |
| Seasonal Review | The Shape Timeline | Visual proof of growth over time | Social media, newsletter, blog |
| Year in Review | The 52-week Shape animation | Spotify Wrapped for life | Everywhere |

Design each of these moments with the share action in mind. The canvas URL must have beautiful OG previews. The weekly insight should have a "share this insight" button that produces a clean, branded image. The Shape Timeline should be exportable as an animation.

---

## 12 — The Churn Points (Where We Lose People)

| Transition | Churn Risk | Defense |
|------------|-----------|---------|
| Landing → /begin | High (70%+ bounce expected) | The problem section must name THEIR pain. The demo must show the product working. |
| End of conversation → return | Very high | The 48-hour nudge: "How's it going? One number." Bridge to the weekly review. |
| First review → second review | High | Notification: "Your shape from last week is waiting." Make the second review feel different (the AI references week 1 data). |
| Month 2-3 → month 4 | Medium | Seasonal review creates a "fresh start" moment. New nodal interventions. Updated canvas. |
| Free → paid | Medium | The paid tier (HUMA Intelligence) must deliver obvious value: the morning briefing that references weather, the insight that catches a pattern across weeks. |

---

## 13 — Tier Experience Differences

| Touchpoint | Free | Paid ($29/mo) | Professional ($99/mo) |
|------------|------|--------------|----------------------|
| Design Mode conversation | Full | Full | Full |
| Living Canvas | Full (view + share) | Full (interactive + evolving) | Full + client canvases |
| Morning briefing | — | Daily, weather-aware, 2 sentences | Daily + client briefings |
| Weekly review | — | Full (10 min, insights, Shape Timeline) | Full + client review dashboard |
| Seasonal review | — | Full (30 min, canvas update) | Full + cross-client patterns |
| Pattern contribution | — | — | Full (attribute + contribute) |
| Shape Timeline | Static (first map only) | Evolving (weekly updates) | Evolving + client timelines |

The free tier is generous enough that the Design Mode conversation + Living Canvas is a complete, shareable artifact. The paid tier's value is temporal intelligence — what the product knows about you over time.

---

*HUMA · User Journey Map · March 2026*
