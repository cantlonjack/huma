---
description: Create or edit enterprise templates for HUMA's pattern library with real financial data, 8 Forms of Capital profiles, Regrarians layer requirements, fit signals, and synergy connections. Use when adding new enterprises to enterprise-templates.ts.
user_invocable: true
---

# HUMA Enterprise Template Author

You create and validate enterprise templates for HUMA's enterprise reference library.

## The Template Structure

Every enterprise template follows the `EnterpriseTemplate` interface defined in `app/src/engine/enterprise-templates.ts`. Read that file first to see the full interface and existing examples.

The interface requires:

```typescript
{
  id: string;                    // kebab-case identifier
  name: string;                  // Display name
  category: string;              // e.g., "Livestock — Poultry", "Crops — Vegetables"
  description: string;           // 2-3 sentences, what it IS
  scaleAssumption: string;       // e.g., "400-800 birds per batch, 3-5 batches/season"

  financials: {
    startupCapital: { low: number; high: number; notes: string };
    laborHoursPerWeek: { inSeason: string; offSeason: string };
    timeToFirstRevenue: string;
    year1Revenue: { low: number; high: number };
    year3Revenue: { low: number; high: number };
    grossMargin: string;
    breakeven: string;
    seasonalRhythm: string;
  };

  capitalProfile: {
    financial:    { score: number; note: string };  // 1-5 scale
    material:     { score: number; note: string };
    living:       { score: number; note: string };
    social:       { score: number; note: string };
    intellectual: { score: number; note: string };
    experiential: { score: number; note: string };
    spiritual:    { score: number; note: string };
    cultural:     { score: number; note: string };
  };

  landscapeRequirements: {
    climate: string;
    water: string;
    access: string;
    soils: string;
    infrastructure: string;
    minAcreage: string;
  };

  synergies: string[];           // IDs of enterprises that stack well
  prerequisites: string[];       // What must be in place first
  commonFailureModes: string[];  // Honest about what goes wrong

  fitSignals: {
    loves: string[];             // What the AI listens for in Ikigai
    skills: string[];
    worldNeeds: string[];
    lifestyleTraits: string[];
  };

  sources: string[];             // Published sources for financial data
}
```

## Authoring Process

### Step 1: Research
When the user names an enterprise to add, research it:
- Search for published financial data from credible sources (Perkins, Salatin, Fortier, Stone, Shepard, USDA extension budgets, peer-reviewed farm economics)
- Numbers must be REAL — from published sources, not invented. Cite the source.
- If no published data exists, say so and provide best estimates with clear notes

### Step 2: Draft the Template
Fill every field. Quality requirements:

**Financials:**
- Ranges, not point estimates. False precision is worse than honest ranges.
- Scale assumption must be explicit (how many acres, animals, production units)
- Startup capital notes should itemize major cost categories
- Labor hours must distinguish in-season from off-season
- Revenue projections for Year 1 (learning curve) and Year 3 (established)
- Gross margin as percentage range
- Breakeven timeline must be honest
- Seasonal rhythm describes the annual cycle

**Capital Profile:**
- Score 1-5 for each of the 8 Forms of Capital
- Every score must have a specific note explaining WHY that score
- Don't inflate scores. A pastured poultry operation is not a 5 on Intellectual capital.
- Think about what capital this enterprise ACTIVELY BUILDS, not just touches

**Landscape Requirements:**
- Be specific about climate zones, water needs, soil types
- Minimum acreage should reflect the scale assumption
- Infrastructure requirements should be honest about what's needed before starting

**Fit Signals:**
- These are what the AI listens for during Ikigai and Holistic Context phases
- `loves`: what passions suggest this enterprise fits
- `skills`: what prior experience or aptitude signals a good fit
- `worldNeeds`: what community or market gaps this enterprise fills
- `lifestyleTraits`: what daily rhythm and lifestyle preferences align

**Synergies:**
- Reference existing enterprise IDs from the templates array
- Explain WHY they synergize (shared infrastructure, complementary seasons, capital flows)

**Common Failure Modes:**
- Be brutally honest. What kills this enterprise?
- Include both operational failures and lifestyle mismatches
- This is where HUMA earns trust — by naming what could go wrong

### Step 3: Validate
Check the template against:
1. **Financial coherence** — Do revenue projections make sense given startup costs and margins?
2. **Capital profile honesty** — Are scores justified, not inflated?
3. **Regrarians alignment** — Do landscape requirements follow permanent-to-flexible logic?
4. **Fit signal quality** — Are signals specific enough to differentiate from other enterprises?
5. **Synergy integrity** — Do referenced enterprise IDs actually exist?
6. **Source credibility** — Are financial numbers traceable to published sources?

### Step 4: Insert
Add the template to the `ENTERPRISE_TEMPLATES` array in `app/src/engine/enterprise-templates.ts` (this is the app copy used at runtime). Also add to `src/engine/enterprise-templates.ts` (the shared reference copy) to keep them in sync.

## Output Format

When presenting a draft for review:

```
═══ ENTERPRISE TEMPLATE: [Name] ═══
Category: [category]
Scale: [scale assumption]

FINANCIALS
  Startup: $[low]-$[high]
  Labor: [in-season] / [off-season]
  First Revenue: [timeline]
  Year 1: $[low]-$[high]
  Year 3: $[low]-$[high]
  Margin: [range]
  Breakeven: [timeline]

CAPITAL PROFILE
  Financial:    [score]/5 — [note]
  Material:     [score]/5 — [note]
  Living:       [score]/5 — [note]
  Social:       [score]/5 — [note]
  Intellectual: [score]/5 — [note]
  Experiential: [score]/5 — [note]
  Spiritual:    [score]/5 — [note]
  Cultural:     [score]/5 — [note]

LANDSCAPE REQUIREMENTS
  Climate: [requirement]
  Water: [requirement]
  Access: [requirement]
  Soils: [requirement]
  Infrastructure: [requirement]
  Min Acreage: [requirement]

FIT SIGNALS
  Loves: [list]
  Skills: [list]
  World Needs: [list]
  Lifestyle: [list]

SYNERGIES: [list with explanations]
FAILURE MODES: [list]
SOURCES: [list]

VALIDATION: [pass/fail per check]
═══════════════════════════════════
```

## Existing Enterprise IDs (for synergy references)
Read the current file to get the full list before authoring. As of last check, the library includes enterprises like: pastured-broilers, market-garden, pastured-layers, mushroom-cultivation, honey-bees, farm-store, agritourism, compost-enterprise, nursery-propagation, cut-flowers, value-added-processing, grazing-livestock, agroforestry, and educational-workshops.
