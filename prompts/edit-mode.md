# Prompt: Wire Up Life Profile Edit Mode

## Context
The Life Profile on `/whole` has 7 natural sections ("Who you are", "Where you are", etc.) built from HumaContext's 9 technical dimensions. Each section renders prose lines. In **edit mode** (toggled via the manage/gear button on `/whole`), prose lines wrap in an `EditableText` component that lets users click-to-edit inline. 

The edit mode UI already works visually — clicking a line opens an input, pressing Enter or blurring commits. But the `onSave` callback is a no-op (`() => { /* TODO */ }`). We need to wire it so edits persist back to HumaContext and Supabase.

## The Problem
`LifeProfileSection.tsx` line 92 has:
```tsx
<EditableText value={line} onSave={() => { /* TODO: wire to handleHumaContextSave */ }} />
```

The challenge: each prose line is a **rendered string** derived from structured HumaContext fields (e.g., `"Rural Michigan — temperate"` comes from `home.location` + `home.climateZone`). Editing the rendered string needs to map back to the correct structured field.

## Implementation Plan

### 1. Add field metadata to ProfileSection prose

In `life-profile-utils.ts`, change `prose: string[]` to carry field provenance:

```ts
export interface ProseLine {
  text: string;
  /** Which HumaContext path this line maps to, e.g. "home.location" or "identity.roles" */
  field: string;
  /** If the line is composed from multiple fields, this is the primary editable one */
  editable: boolean;
}
```

Update `ProfileSection.prose` from `string[]` to `ProseLine[]`. Update each prose builder to return `ProseLine[]` instead of `string[]`. Examples:

- `buildPlaceProse`: `{ text: "Rural Michigan — temperate", field: "home.location", editable: true }`
- `buildIdentityProse` for WHY: `{ text: '"I exist to..."', field: "purpose.whyStatement", editable: true }`
- `buildIdentityProse` for roles: `{ text: "Father, farmer, builder", field: "identity.roles", editable: true }`
- Compound lines (location + climate): use the primary field, parse on save

### 2. Wire onSave in LifeProfileSection

Update `LifeProfileSection` to accept an `onFieldEdit?: (field: string, value: string) => void` prop. Replace the no-op:

```tsx
<EditableText 
  value={line.text} 
  onSave={(v) => onFieldEdit?.(line.field, v)} 
/>
```

### 3. Add field-level save handler in useWhole

In `useWhole.ts`, add a `handleFieldEdit` callback that:
1. Takes a dotted field path (e.g., `"home.location"`) and new string value
2. Parses array fields: if the field is `identity.roles` and the value is `"Father, farmer, builder"`, split by `, ` and write as array
3. Calls `handleHumaContextSave` with the structured partial update
4. Invalidates the `humaContext` query to refresh

```ts
const handleFieldEdit = useCallback((field: string, value: string) => {
  // Parse "home.location" → { home: { location: value } }
  const parts = field.split(".");
  const dim = parts[0] as keyof HumaContext;
  const subField = parts[1];
  
  // Array fields need split logic
  const ARRAY_FIELDS = ["identity.roles", "identity.archetypes", "purpose.values", 
    "body.conditions", "growth.skills", "growth.interests", "joy.sources", "joy.drains"];
  
  const finalValue = ARRAY_FIELDS.includes(field) 
    ? value.split(/,\s*/).filter(Boolean)
    : value;
  
  handleHumaContextSave({ [dim]: { [subField]: finalValue } });
}, [handleHumaContextSave]);
```

### 4. Thread it through LifeProfile → LifeProfileSection

`LifeProfile.tsx` already receives `onContextSave`. Add `onFieldEdit` prop and pass it down to each `LifeProfileSection`.

### 5. Update all consumers of ProfileSection.prose

Search for all references to `section.prose` — they currently expect `string[]`. Update:
- `LifeProfileSection.tsx` — iterate `ProseLine` objects, render `line.text`
- `LifeProfile.tsx` — any prose references
- Sparse check in `profileSections()` — check `prose.length === 0` still works since it's still an array

### Files to modify
- `app/src/lib/life-profile-utils.ts` — ProseLine type, update all 7 prose builders
- `app/src/components/whole/LifeProfileSection.tsx` — accept onFieldEdit, wire EditableText
- `app/src/components/whole/LifeProfile.tsx` — pass onFieldEdit through
- `app/src/hooks/useWhole.ts` — add handleFieldEdit, export it
- `app/src/app/whole/page.tsx` — pass handleFieldEdit to LifeProfile

### Testing
- Click a prose line in edit mode → input appears with current text
- Change text, press Enter → line updates immediately (optimistic)
- Refresh page → edited value persists
- Check localStorage `huma-v2-huma-context` reflects the edit
- Array fields (roles, values) split correctly on comma
- WHY statement edits persist and show italic on next render
- Non-edit mode (view/filling) — prose lines are NOT clickable
