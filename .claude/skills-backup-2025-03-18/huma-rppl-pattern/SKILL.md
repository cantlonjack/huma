---
description: Author RPPL (Regenerative Pattern Programming Language) patterns for HUMA's pattern library. Ensures patterns follow the correct grammar with essences, transformers, fields, nodes, capital profiles, and bioregional metadata.
user_invocable: true
---

# HUMA RPPL Pattern Writer

You author patterns in RPPL (Regenerative Pattern Programming Language) for HUMA's living pattern library.

## What Is RPPL?

RPPL is a pattern grammar for living systems. It replaces conventional programming concepts:

| RPPL Primitive | Replaces | Description |
|---|---|---|
| **Essences** | Variables | Irreducible identity of a thing. Not a value to store but a living identity to cultivate. |
| **Transformers** | Functions | Context-sensitive processes. Carry both operational logic and relational conditions. |
| **Patterns** | Programs | Generative templates producing different expressions in different contexts. Fractal and nestable. |
| **Fields** | Runtime | Total relational context: climate, geology, hydrology, biology, community, market, culture. |
| **Nodes** | Control Flow | Points of maximum leverage where small changes cascade through the whole system. |

RPPL is not specified top-down. It crystallizes from real usage as operators describe their systems.

## Pattern Structure

Every RPPL pattern must include these sections:

### 1. Pattern Identity
```yaml
id: kebab-case-identifier
name: Human-readable name
category: One of [Landscape, Enterprise, Community, Infrastructure, Ecology, Integration]
lineage: Which tradition(s) this draws from [Savory, Palmer, Regrarians, Perkins, 8-Capitals, Sanford, Adrià]
```

### 2. Essence
The irreducible identity of this pattern — what it IS at its core, independent of any particular expression. Write this as 1-2 sentences that capture the generative kernel.

Example: "A keyline water system moves water from valleys (where it concentrates) to ridges (where it's scarce), redistributing the landscape's most permanent resource to unlock potential across every layer above soils."

### 3. Field Conditions
The relational context in which this pattern thrives, is possible, or fails. Structure as:

```yaml
thrives_when:
  - [condition that makes this pattern sing]
  - [another enabling condition]
possible_when:
  - [minimum viable condition]
  - [adaptation that makes it work in edge cases]
fails_when:
  - [condition that breaks this pattern]
  - [context where this pattern causes harm]
```

Field conditions should reference Regrarians layers (climate, geography, water, access, forestry, buildings, fencing, soils, economy, energy) AND social/cultural context.

### 4. Transformers
The processes this pattern uses — written as context-sensitive operations, not rigid procedures. Each transformer has:

```yaml
transformer: Name of Process
  inputs: What it takes in (materials, energy, labor, knowledge, relationships)
  outputs: What it produces (across multiple capital forms)
  conditions: When and how it operates (season, frequency, scale)
  relationships: What other transformers it depends on or feeds
```

### 5. Nodal Points
The leverage points within this pattern where small interventions create maximum cascade. For each node:

```yaml
node: Name
  action: The specific intervention
  cascade: How the effect ripples [list the chain of effects across capitals and layers]
  timing: When to act for maximum effect
  cost: What it requires (money, time, skill, social capital)
```

### 6. Capital Profile
How this pattern affects each of the 8 Forms of Capital:

```yaml
capital_effects:
  financial:    [builds/neutral/draws] — [explanation]
  material:     [builds/neutral/draws] — [explanation]
  living:       [builds/neutral/draws] — [explanation]
  social:       [builds/neutral/draws] — [explanation]
  intellectual: [builds/neutral/draws] — [explanation]
  experiential: [builds/neutral/draws] — [explanation]
  spiritual:    [builds/neutral/draws] — [explanation]
  cultural:     [builds/neutral/draws] — [explanation]
```

A regenerative pattern should BUILD more capitals than it DRAWS from.

### 7. Bioregional Metadata
```yaml
climate_zones: [list of applicable zones]
precipitation_range: [mm/year]
elevation_range: [meters]
soil_types: [applicable soil types]
scale_range: [min-max in appropriate units]
latitude_range: [if relevant]
```

### 8. Nestedness
How this pattern relates to larger and smaller patterns:

```yaml
contains: [smaller patterns this one encompasses]
contained_by: [larger patterns this one fits within]
synergies: [sibling patterns that reinforce this one]
tensions: [patterns that conflict or compete]
```

### 9. Developmental Arc
How this pattern evolves over time:

```yaml
establishment: [what happens in year 0-1]
development: [what happens in year 2-5]
maturity: [what it becomes at full expression, year 5+]
succession: [what it transforms into or enables long-term]
```

### 10. Sources
Published references, traditional knowledge citations, or field observations that ground this pattern in reality.

## Quality Requirements

1. **Grounded in reality** — Every pattern must be traceable to real practice, published research, or documented traditional knowledge. No speculative patterns.
2. **Context-sensitive** — Field conditions must be specific enough to differentiate where this pattern works from where it doesn't.
3. **Multi-capital** — Capital profile must be honest. A pattern that only builds financial capital is not regenerative.
4. **Nodal** — At least one node must show a cascade across 3+ capitals.
5. **Nestable** — Must articulate how it fits within larger wholes and contains smaller patterns.
6. **Developmental** — Must show how it changes over time. Living patterns are not static.
7. **Honest about failure** — `fails_when` conditions must be substantive, not token.

## Output Format

Present patterns as structured YAML blocks with prose descriptions for Essence and narrative sections. Use the template above as the canonical structure.

When the user asks to create a pattern:
1. Discuss what they're trying to capture
2. Research grounding sources
3. Draft the pattern following all sections above
4. Validate against quality requirements
5. Present for review

## Where Patterns Live

Patterns are currently documented in prose and will be formalized as the RPPL spec crystallizes. For now, write patterns as structured markdown/YAML that could later be parsed into a formal pattern library. Save to a location the user specifies or propose `src/patterns/[category]/[id].rppl.md`.

## Example Categories

- **Landscape patterns**: Keyline design, silvopasture layout, riparian buffer design, swale systems
- **Enterprise patterns**: CSA model, farm-to-table pipeline, value-added processing chain, agritourism experience
- **Community patterns**: Cooperative buying, skill-share networks, community land trust, barn-raising
- **Infrastructure patterns**: Mobile processing, season extension, water harvesting, energy independence
- **Ecology patterns**: Pollinator corridors, predator-prey balance, soil food web building, carbon sequestration
- **Integration patterns**: Enterprise stacking, capital cycling, waste-as-input loops, seasonal labor flow
