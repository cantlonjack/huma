# Polish All Phases — Prompt

Read the build plan at `.claude/plans/build-plan.md` and the project memory at `C:\Users\djcan\.claude\projects\C--HUMAHUMA\memory\MEMORY.md` for full context.

Phases 1-7 of a product evolution are ~90% implemented. This session's job is to close every remaining gap. Here's what needs fixing:

## 1. patternNote rendering in CompiledEntryRow

File: `app/src/components/today/CompiledEntryRow.tsx`

The `patternNote` field is extracted from the sheet API and stored on SheetEntry, but never displayed. Add it as a subtle caption below the `because` text. Style: font-sans, text-[12px], text-sage-500, with a small "↻" icon prefix. Only render when present.

Example rendering:
```
Morning pages before email          [dimension badges]
You chose this: writing first...    ← because (serif italic)
↻ Creative sovereignty routine — day 14   ← patternNote (sans, sage)
Desk by 6:30. Two pages minimum...  ← detail (sans, ink-500)
```

## 2. Evening opening differentiation

File: `app/src/app/api/sheet/route.ts`

The SHEET_PROMPT doesn't know the time of day. The `opening` field should shift tone for evening (reflection) vs. morning (action). 

In the API route's POST handler, detect whether it's evening (hour >= 18 in the request timezone, or add a `timeOfDay` field to the request body). Add a line to the prompt template:

```
TIME OF DAY: {time_of_day}
If evening: The opening should reflect on the day — what happened, what held, what shifted. Tone is reflective, not action-oriented. Don't list tomorrow's actions. Acknowledge what was done.
If morning: The opening frames the day ahead — state of things, what's at stake, what's possible.
```

Update `sheet-compiler.ts` to pass `timeOfDay: new Date().getHours() >= 18 ? "evening" : "morning"` in the request body.

## 3. connectionNote fallback

File: `app/src/app/today/page.tsx`

When connectionNote is missing between entries (API didn't generate one), the narrative can feel disconnected. Add a thin sage divider as fallback — this already exists in the code but only renders when the NEXT entry doesn't have a connectionNote. Verify the logic is correct:

Current (around line 350):
```tsx
{i < t.compiledEntries.length - 1 && !t.compiledEntries[i + 1]?.connectionNote && (
  <div className="h-px bg-sage-200/40 my-3 ml-[56px]" />
)}
```

This should be correct — divider shows when no transition text follows. Verify it works by reading the full entry rendering block and confirming both paths (with connectionNote, without connectionNote) produce clean visual flow.

## 4. Pathway interface

File: `app/src/types/v2.ts`

Add the Pathway and PathwayStage interfaces. Check if they already exist (another session may have added them). If not, add after the Pattern interface:

```typescript
// ─── Pathway ─────────────────────────────────────────────────────────────────
// Cross-aspiration staged plan. Each stage contains patterns to practice.

export interface PathwayStage {
  name: string;
  description: string;
  patternIds: string[];
  status: "upcoming" | "active" | "completed";
  timeframe?: string;
}

export interface Pathway {
  id: string;
  name: string;
  aspirationIds: string[];
  stages: PathwayStage[];
  currentStage: number;
  createdAt: string;
}
```

## 5. Pathway display in Whole page

File: `app/src/app/whole/page.tsx`

After Desires (AspirationsList) and before Patterns, add a Pathway section. For now, render it only when pathway data exists (it won't yet — this is forward-looking UI). Simple structure:

```tsx
{/* Pathway — staged plan */}
{pathway && (
  <div className="mx-5 mt-6">
    <div className="flex items-center gap-2 mb-3">
      <span className="font-sans text-[10px] font-semibold tracking-[0.22em] text-ink-300 uppercase">
        Your pathway
      </span>
      <div className="flex-1 h-px bg-sand-200" />
    </div>
    {/* Render stages as a simple vertical list */}
  </div>
)}
```

This is a placeholder — the real pathway display will evolve. Just establish the section position.

## 6. Chat reference token verification

Files: `app/src/app/api/v2-chat/route.ts`, `app/src/lib/services/prompt-builder.ts`

Verify that the prompt-builder's reference convention (`⟨aspiration:slug⟩`, `⟨pattern:slug⟩`) is actually documented in the prompts that reach Claude. Check:
1. Does OPEN_MODE_PROMPT instruct Claude to emit reference tokens?
2. Does the chat page's `renderWithRefs()` function parse them correctly?
3. If the prompt doesn't instruct reference emission, add it to the OPEN_MODE_PROMPT and FOCUS_MODE_PROMPT.

## 7. Build verification

After all changes, run `cd app && npm run build` and verify zero errors. Check the dev server on the Today page and Whole page to confirm rendering.

## Approach

Make ALL edits surgically — never rewrite/replace entire files. Read before editing. One change at a time. Build-verify after each phase of changes.
