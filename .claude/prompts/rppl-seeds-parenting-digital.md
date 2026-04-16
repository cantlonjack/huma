# RPPL Seed Library — Parenting + Digital Life

**Prerequisite:** Run `rppl-seeds-0-foundations.md` first.

Read the project memory files:
- `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\project_rppl_commons.md`
- `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\project_rppl_hierarchy.md` — the three-level hierarchy
- `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\feedback_rppl_truth_based.md`

Read existing seeds in `app/src/data/rppl-seeds/` — especially `types.ts` for the RpplSeed interface, and `frameworks.ts` + `principles.ts` for rpplIds to reference in `servesPrinciples`.

## Your Job

Create two files with **practice-level** RPPLs. Every practice must set `type: "practice"`, include `servesPrinciples` tracing to principle rpplIds, and use `trigger` + `steps`.

1. `app/src/data/rppl-seeds/parenting.ts` — 12-18 RPPLs
2. `app/src/data/rppl-seeds/digital-life.ts` — 8-12 RPPLs

Update the barrel export in `app/src/data/rppl-seeds/index.ts`.

## Parenting Patterns to Cover

**Foundations (all ages):**
- Connection before correction (attachment-based discipline — the relationship IS the discipline)
- Family rhythm design (predictable daily/weekly structure that reduces chaos)
- Parent self-care as family investment (you can't pour from empty — but make it specific, not platitude)
- Repair protocol (when you lose it — and you will — how to repair the relationship)

**By Stage:**
- Newborn survival mode (first 3 months — lower every standard except safety and bonding)
- Toddler autonomy support (1-3 years — yes environments, choice within limits)
- School-age competence building (5-12 — chores as capability, not punishment)
- Teenager relationship preservation (13-18 — presence > control, curiosity > interrogation)
- Launching young adults (18+ — letting go while staying connected)

**Specific Situations:**
- Single parenting systems (when you're the only adult — different rules for different constraints)
- Co-parenting communication (separated/divorced — business-like, child-centered, low-conflict)
- Special needs parenting (the extra dimension — advocacy, self-care, community)
- Homeschooling rhythm (structure + flexibility — not school-at-home)
- Blended family integration (stepparent role, loyalty binds, patience as strategy)

**The Unconventional:**
- Unschooling principles (self-directed learning, child-led exploration — evidence supports it for many kids)
- Outdoor/nature childhood (let them be bored outside — research on unstructured outdoor play)
- Slow parenting (resist the enrichment arms race — fewer activities, more presence)
- Financial literacy from age 5 (give real money, real choices, real consequences — small scale)

## Digital Life Patterns to Cover

**Attention & Focus:**
- Phone-free morning (first hour without phone — the single highest-impact digital pattern)
- Notification audit (most notifications don't serve you — systematic elimination)
- App time boundaries (not screen time limits — those create anxiety. Intentional use windows.)
- Deep work phone protocol (phone in another room, not just silenced — physical distance matters)

**Information Diet:**
- News consumption protocol (once daily, curated sources, not feeds — the news finds you if it matters)
- Social media as tool (create > consume, specific purpose > browsing, time-boxed)
- Information capture system (save it, don't read it now — weekly processing of saved items)
- Email as batch processing (2-3 times daily, not continuous — train others' expectations)

**Digital Wellness:**
- Evening screen wind-down (devices off 60-90 min before bed — or at least amber/dark mode)
- Digital sabbath (24 hours offline, monthly or weekly — structured, anticipated, protected)
- Online relationship management (unfollow aggressively, curate ruthlessly, engage intentionally)
- Remote work boundary design (physical shutdown ritual, separate space, "commute" replacement)

**Digital Security & Privacy:**
- Password management pattern (password manager + 2FA on everything important — specific setup steps)
- Privacy audit (what data are you giving away? Annual review of permissions and accounts)
- Digital estate planning (who has access if something happens to you? Document it.)

## Research Approach

For parenting: Attachment theory (Bowlby, Ainsworth), Gordon Neufeld (Hold On to Your Kids), Janet Lansbury (respectful parenting), Peter Gray (unschooling/free play research), Nature Deficit Disorder research (Richard Louv).

For digital: Cal Newport (Digital Minimalism), Catherine Price (How to Break Up With Your Phone), Nir Eyal (Indistractable), Johann Hari (Stolen Focus). Also look at research on blue light effects (ties to body-health domain), attention economy (Tristan Harris), and dopamine research (Anna Lembke).

Include context tags: new-parent, single-parent, remote-worker, teenager-parent, homeschooler, etc.

## Output

Write both files, update barrel export, run `npm run build`.
