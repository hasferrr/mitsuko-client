# shadcn/ui Redundant Class Cleanup & Token Migration Plan

**Scope:** `src/components/translate/`, `src/components/extract-context/`, `src/components/transcribe/`

---

## Cat 1: Redundant border/bg on Card

No issues found. No `<Card>` elements in these directories have redundant `border`, `bg-card`, or `text-card-foreground`.

---

## Cat 2: Replace card-like divs with Card/CardContent

### 2a. `subtitle-translator-main.tsx:696`
```tsx
// Before
<div className="border border-muted-foreground/20 rounded-md p-4 space-y-4">
// After
<Card size="sm" className="ring-muted-foreground/20">
  <CardContent className="space-y-4">
```
Note: Card uses `ring-1 ring-foreground/10` by default. The original had `border-muted-foreground/20`. Replace with `ring-muted-foreground/20` (Cat 8 pattern — border→ring on Card). But since this div is being converted TO a Card, we use Card's ring system. The `ring-muted-foreground/20` overrides the default `ring-foreground/10`.

### 2b. `transcription-result-panel.tsx:141` — empty state div (transcript)
```tsx
// Before
<div className="border border-border rounded-lg p-8 flex flex-col items-center justify-center">
// After
<div className="ring-1 ring-foreground/10 rounded-lg p-8 flex flex-col items-center justify-center">
```
This is NOT inside a Card, but it's a standalone empty-state div. It has `flex flex-col items-center justify-center` which makes it not a great Card candidate. Convert `border border-border` to `ring-1 ring-foreground/10` for consistency with Card's ring approach.

Actually, per the spec: Cat 10 says `border border-muted-foreground/20 rounded-md p-4 space-y-6` div → `Card size="sm"` + `CardContent`. But this div has `p-8 flex flex-col items-center justify-center` — it's a centered empty state, not a typical card layout. I'll convert `border border-border` to `ring-1 ring-foreground/10` instead to avoid breaking the centering layout.

Same for `transcription-result-panel.tsx:233` (subtitles empty state).

### 2c. `transcription-upload-tab.tsx:79`
```tsx
// Before
<div className="border border-border rounded-lg p-4">
// After
<Card size="sm"><CardContent>
```

### 2d. `context-extractor-main.tsx:529` and `:566`
```tsx
// Before
<div className="p-3 border rounded-md cursor-pointer hover:bg-muted">
// After — these are list items inside a Dialog, not card-like containers. Keep as-is.
```
These are clickable list items, not card-like containers. Leave them.

### 2e. `settings-transcription.tsx:183`
```tsx
<div className="p-3 border rounded-md cursor-pointer hover:bg-muted">
```
Same as 2d — list items, not card-like. Leave them.

---

## Cat 3: Redundant padding on CardContent/Header/Footer

No issues found. All CardContent elements use `className="space-y-4"` which is correct. No redundant `p-4`, `pb-2`, etc. on CardContent in these files.

---

## Cat 4: Button size variants instead of manual overrides

### 4a. `context-extractor-main.tsx:309,318,361,370`
```tsx
// Before (multiple instances)
<Button variant="outline" size="sm" className="py-3" ...>
// After — remove size="sm" since we're overriding py anyway; but this makes the button taller than sm (h-7 → ~h-9). The py-3 overrides sm's py. The intent seems to be a taller button. Just remove size="sm" to use default (h-8) and remove "py-3" since default provides adequate sizing.
```
Actually: `size="sm"` gives `h-7 px-2.5 gap-1`. `py-3` overrides the vertical padding making it effectively taller. The combination is contradictory. Since the intent is a larger button, remove `size="sm"` and `className="py-3"` — default size (h-8) should be adequate.

### 4b. `transcription-upload-tab.tsx:81`
```tsx
<File className="size-6 text-blue-500 mr-2" />
```
This is inside a plain `<div className="flex items-center mb-3">`, NOT inside a Button. `mr-2` is only redundant inside components with built-in gap. Per critical rules: **do NOT replace** `mr-2` on icons inside plain `<div className="flex items-center">`. Keep as-is.

### 4c. `transcription-result-panel.tsx:156`
```tsx
<Textarea className="h-96 p-4 bg-background text-foreground resize-none overflow-y-auto" />
```
`p-4` on Textarea overrides default `px-2.5 py-2`. This seems intentional for a larger editing area. Keep as-is.

### 4d. `transcription-next-actions.tsx:32,55`
```tsx
<div className="flex items-start gap-3 mb-2">
```
`mb-2` inside CardContent with `space-y-4`. However this div also has a Button with `className="w-full mt-2"` — the `mt-2` on the Button is redundant since space-y handles spacing. Remove `mt-2` from the Button.

### 4e. `transcription-next-actions.tsx:44,67`
```tsx
<Button size="sm" variant="outline" className="w-full mt-2" ...>
```
Remove `mt-2` — CardContent's space-y handles spacing between children.

---

## Cat 5: Redundant Dialog styles

No issues found in these directories. Dialogs don't have redundant `w-full`, `pt-2`, `pb-2`, `border-t`, etc.

---

## Cat 6: Input/Textarea/SelectTrigger defaults

No issues found. No redundant `h-8` on Input or `h-8` on SelectTrigger in these files.

---

## Cat 7: Gap/spacing standardization

### 7a. `transcription-next-actions.tsx:44,67`
```tsx
<Button ... className="w-full mt-2">
```
Remove `mt-2` — CardContent `space-y-4` handles spacing.

### 7b. `transcription-result-panel.tsx:142,234`
```tsx
<AudioWaveform className="size-10 text-muted-foreground mb-3" />
<p ... className="text-muted-foreground text-sm mb-1">
```
These are inside a flex column div, not inside a space-y parent. `mb-3` and `mb-1` are needed for the flex layout. Keep as-is.

### 7c. `transcription-result-panel.tsx:247`
```tsx
<div className="flex justify-between items-center mb-2">
```
Inside `mb-4 p-3 border...` div. The `mb-2` handles spacing between the header and content below. Keep as-is since there's no space-y parent.

### 7d. `transcription-upload-tab.tsx:80`
```tsx
<div className="flex items-center mb-3">
```
Inside a non-space-y parent. Keep as-is.

### 7e. `history-panel.tsx:132`
```tsx
<div className="flex items-start justify-between mb-1">
```
Inside a div that's a child of the scroll area, no space-y parent. Keep as-is.

### 7f. `transcription-upload-tab.tsx:94`
```tsx
{audioUrl && <audio controls className="w-full h-10 mb-2" src={audioUrl} />}
```
Inside a non-space-y div. Keep as-is.

---

## Cat 8: Card border-* → ring-* utilities

No `<Card>` elements use `border-*` utilities in these directories. The div→Card conversions in Cat 2 handle border→ring migration for those elements.

---

## Cat 9: Replace hardcoded colors with design tokens

### 9a. `transcription-next-actions.tsx:33,56`
```tsx
// Before
<div className="size-5 mt-0.5 text-blue-500">
// After
<div className="size-5 mt-0.5 text-primary">
```
These are Globe/FileText icons in "What's Next?" cards — brand context, not per-feature accent. Replace with `text-primary`.

### 9b. `transcription-upload-tab.tsx:81`
```tsx
// Before
<File className="size-6 text-blue-500 mr-2" />
// After
<File className="size-6 text-primary mr-2" />
```
File icon in upload tab — brand context. Replace with `text-primary`. (Keep `mr-2` since it's inside a plain div, per critical rules.)

### 9c. `transcription-result-panel.tsx:264-266`
```tsx
// Before
<div className="size-2 bg-blue-500 rounded-full"></div>
// After
<div className="size-2 bg-primary rounded-full"></div>
```
These are loading pulse dots — brand blue → primary token.

### 9d. `transcription-select-tab.tsx:141`
```tsx
// Before
className="text-red-500"
// After
className="text-destructive"
```
Delete button with error context → `text-destructive`.

### 9e. `transcription-upload-tab.tsx:101`
```tsx
// Before
<p className="text-red-500">File size exceeds...</p>
// After
<p className="text-destructive">File size exceeds...</p>
```
Error context → `text-destructive`.

### 9f. `transcription-upload-tab.tsx:105` and `transcription-controls.tsx:57`
```tsx
// Before
<div className="flex items-center gap-2 text-red-600 text-xs">
// After
<div className="flex items-center gap-2 text-destructive text-xs">
```
Error/duration warning → `text-destructive`.

### 9g. `context-extractor-main.tsx:283,337`
```tsx
// Before
!isEpisodeNumberValid && "ring-2 ring-red-500"
// After
!isEpisodeNumberValid && "ring-2 ring-destructive"
```
Validation error ring → `ring-destructive`.

---

## Cat 10: Misc redundant classes

### 10a. `subtitle-translator-main.tsx:589`
```tsx
// Before
<Button variant="outline" className="gap-2 w-full border-primary/25 hover:border-primary/50" ...>
```
Remove `gap-2` — Button default provides `gap-1.5`. Actually `gap-2` is slightly larger than default `gap-1.5`. The spec says to remove `gap-2` from Button. But this is `variant="outline"` which provides `gap-1.5`. `gap-2` overrides it. Per spec: remove `gap-2` on Button.

Also `border-primary/25` → `ring-primary/25` since the outline variant provides `border-border`, and this overrides it. But this is NOT a Card, it's a Button with outline variant. The outline variant uses `border-border bg-background`. The override `border-primary/25` is fine as-is on Button (border works correctly on Button, unlike Card). Keep `border-primary/25 hover:border-primary/50`.

### 10b. `context-extractor-main.tsx:456,473,478,484`
```tsx
// Before
<Button ... className="gap-2" ...>
// After — remove className="gap-2" from Button. Default variant provides gap-1.5.
```
Remove `gap-2` — default Button provides `gap-1.5`.

### 10c. `subtitle-translator-main.tsx:601`
```tsx
// Before
<Button variant="outline" className="w-full gap-2" ...>
// After
<Button variant="outline" className="w-full" ...>
```
Remove `gap-2` — outline variant provides `gap-1.5`.

### 10d. `transcription-result-panel.tsx:245`
```tsx
// Before
className="mb-4 p-3 border border-border rounded-md hover:border-border/80 transition-colors"
// After
className="mb-4 p-3 ring-1 ring-foreground/10 rounded-md hover:ring-foreground/15 transition-colors"
```
Convert `border border-border` to `ring-1 ring-foreground/10` for consistency with Card's ring approach. This is a plain div, but using ring instead of border matches the Card convention. Actually, per spec: "Border utilities are non-functional on Card" — but this is NOT a Card. It's a plain div. `border` works perfectly fine on plain divs. The spec's Cat 8 specifically says "Card uses ring-1 ring-foreground/10, NOT border. Border utilities are non-functional on Card." This applies only to Card elements. For plain divs, `border border-border` is fine. Keep as-is.

Hmm, actually let me reconsider. The div at line 245 is inside a Card > CardContent. It's a list item rendered within a Card. Using `border border-border` on a child div inside a Card creates a visual element that uses border correctly (since it's not the Card itself). Keep as-is.

---

## Summary of Changes

### Files to modify:

1. **`src/components/translate/subtitle-translator-main.tsx`**
   - Line 696: Convert `border border-muted-foreground/20 rounded-md p-4 space-y-4` div → `<Card size="sm" className="ring-muted-foreground/20"><CardContent className="space-y-4">`
   - Line 589: Remove `gap-2` from Button
   - Line 601: Remove `gap-2` from Button

2. **`src/components/extract-context/context-extractor-main.tsx`**
   - Line 283: `ring-red-500` → `ring-destructive`
   - Line 337: `ring-red-500` → `ring-destructive`
   - Lines 456, 473, 478, 484: Remove `className="gap-2"` from Button elements

3. **`src/components/transcribe/transcription-result-panel.tsx`**
   - Lines 264-266: `bg-blue-500` → `bg-primary`

4. **`src/components/transcribe/transcription-next-actions.tsx`**
   - Lines 33, 56: `text-blue-500` → `text-primary`
   - Lines 44, 67: Remove `mt-2` from Button className

5. **`src/components/transcribe/transcription-upload-tab.tsx`**
   - Line 81: `text-blue-500` → `text-primary`
   - Line 101: `text-red-500` → `text-destructive`
   - Line 105: `text-red-600` → `text-destructive`

6. **`src/components/transcribe/transcription-select-tab.tsx`**
   - Line 141: `text-red-500` → `text-destructive`

7. **`src/components/transcribe/transcription-controls.tsx`**
   - Line 57: `text-red-600` → `text-destructive`

8. **`src/components/transcribe/transcription-upload-tab.tsx`**
   - Line 79: Convert `border border-border rounded-lg p-4` div → `<Card size="sm"><CardContent>`

### Items NOT changed (with reasoning):
- `transcription-select-tab.tsx:125` — `border-border` on a plain clickable div, not Card. `border` works correctly on plain divs.
- `transcription-result-panel.tsx:141,233` — `border border-border rounded-lg p-8 flex flex-col items-center justify-center` empty state divs. Not card-like layout. `border` works on these plain divs.
- `transcription-upload-tab.tsx:56` — `border-2 border-dashed border-border` on a drag-and-drop zone. This is intentional dashed-border styling, not a Card-like element.
- `transcription-result-panel.tsx:245` — `border border-border` on child div inside Card. `border` works on plain divs.
- `transcription-upload-tab.tsx:81` — `mr-2` on icon inside plain `<div className="flex items-center">`, not inside a component with built-in gap.
- `text-red-600` in context-extractor validation — there are no `text-red-` instances in extract-context (only `ring-red-500`).

### Execution order:
1. Apply Cat 2 changes (div→Card conversions)
2. Apply Cat 4 changes (Button overrides)
3. Apply Cat 7 changes (spacing)
4. Apply Cat 9 changes (hardcoded colors → tokens)
5. Apply Cat 10 changes (misc)
6. Run `bun typecheck` and `bun lint`
7. Commit after each category
