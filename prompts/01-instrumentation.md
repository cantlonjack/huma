# Prompt 01: Event Instrumentation — The Seven Events

## Objective
Add lightweight event tracking so we know where people drop off, what they actually use, and whether the core loop works. No heavy analytics platform — just a Supabase `events` table and a thin client wrapper.

## Why This Matters
We have zero data on user behavior. We don't know if anyone completes onboarding, compiles a sheet, checks off a behavior, or returns the next day. We're building blind. Seven events will tell us more than another month of feature work.

## Architecture

### Backend: Supabase `events` table

Create a new migration in `app/supabase/migrations/` (next sequential number after existing ones):

```sql
CREATE TABLE events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  properties jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_events_name ON events(name);
CREATE INDEX idx_events_session ON events(session_id);
CREATE INDEX idx_events_created ON events(created_at);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events (or anonymous)
CREATE POLICY "Anyone can insert events"
  ON events FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can read their own events
CREATE POLICY "Users read own events"
  ON events FOR SELECT
  USING (auth.uid() = user_id);
```

### API Route: `app/src/app/api/events/route.ts`

Simple POST endpoint:
- Accepts `{ session_id, name, properties }` 
- If authenticated, attaches `user_id` from session
- If not authenticated, inserts with `user_id = null`
- Rate limited: reuse existing `isRateLimited()` from `lib/rate-limit.ts`
- No response body needed — fire and forget (return 204)

### Client: Update `app/src/lib/analytics.ts`

The file already exists with a `trackEvent()` wrapper around Vercel Analytics. Extend it:

```typescript
// Keep existing Vercel Analytics tracking
// Add Supabase event tracking alongside it

const SESSION_KEY = "huma-v2-session-id";

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function trackEvent(name: string, properties?: Record<string, string | number | boolean>) {
  // Existing Vercel Analytics call
  try { track(name, properties); } catch {}
  
  // New: Supabase event
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: getSessionId(),
      name,
      properties: properties ?? {},
    }),
    keepalive: true, // survives page navigation
  }).catch(() => {}); // never block UI
}
```

## The Seven Events

Instrument these — and ONLY these — in the first pass:

| # | Event Name | Where to Add | Properties |
|---|-----------|-------------|------------|
| 1 | `session_start` | `app/src/app/layout.tsx` or root provider — fire once per session | `{ referrer, viewport_width }` |
| 2 | `onboarding_start` | `useStart.ts` — when conversation begins (first user message sent) | `{ archetype_selected: bool, archetype_name?: string }` |
| 3 | `aspiration_created` | `useStart.ts` — when first aspiration is saved after decomposition | `{ aspiration_count: number, behavior_count: number }` |
| 4 | `sheet_compiled` | `useToday.ts` — when sheet compilation succeeds | `{ entry_count: number, day_count: number }` |
| 5 | `behavior_checked` | `useToday.ts` — when a check-off toggle fires | `{ day_count: number, checked: bool, is_trigger: bool }` |
| 6 | `return_visit` | `app/src/app/page.tsx` or `useToday.ts` — when a user with existing aspirations loads /today | `{ day_count: number, days_since_last: number }` |
| 7 | `sheet_shared` | `ShareButton.tsx` — when any share action completes | `{ method: "clipboard" \| "native" \| "shape" }` |

### Where NOT to Add Events
- Do not track every conversation message (too noisy)
- Do not track page views (Vercel Analytics already does this)
- Do not track errors (that's Sentry's job, if added later)

## Integration Points (exact file locations)

1. **session_start** — Add to `app/src/app/layout.tsx` inside a `useEffect` that fires once. Use `sessionStorage` to deduplicate.

2. **onboarding_start** — In `app/src/hooks/useStart.ts`, inside the `sendMessage` function (or equivalent that fires the first API call). Check `messages.length === 0` to ensure it's the first message.

3. **aspiration_created** — In `app/src/hooks/useStart.ts`, in the handler that saves aspirations after decomposition (look for where `decomposedBehaviors` are persisted).

4. **sheet_compiled** — In `app/src/hooks/useToday.ts`, in the success handler after `compileSheet()` resolves. The `entries` array length is already available.

5. **behavior_checked** — In `app/src/hooks/useToday.ts`, in the `handleCheck` or `toggleCheck` function. The `isChecked` state and entry position are available.

6. **return_visit** — In `app/src/hooks/useToday.ts` or `app/src/app/page.tsx`, when routing to `/today` with existing aspirations. Compute `days_since_last` from the last sheet date in localStorage.

7. **sheet_shared** — In `app/src/components/shared/ShareButton.tsx`, inside the click handlers for clipboard copy, native share, and shape share.

## Verification
- After implementation, open the app in an incognito window
- Walk through: land → start → create aspiration → see sheet → check off → share
- Query Supabase: `SELECT name, count(*) FROM events GROUP BY name`
- You should see all 7 event types with at least 1 row each

## What This Enables
With these 7 events, we can compute:
- **Onboarding completion rate**: `aspiration_created / onboarding_start`
- **Activation rate**: `sheet_compiled / aspiration_created`  
- **Daily engagement**: `behavior_checked` count per day per session
- **Retention**: `return_visit` with `days_since_last` distribution
- **Virality signal**: `sheet_shared` rate
