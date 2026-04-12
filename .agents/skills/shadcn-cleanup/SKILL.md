---
name: shadcn-cleanup
description: Remove redundant CSS class overrides that duplicate shadcn/ui component defaults, and replace hardcoded Tailwind colors with semantic design tokens. Use when auditing or refactoring a codebase that uses shadcn/ui components to eliminate duplicate styling and ensure design-system consistency.
---

# shadcn/ui Redundant Class Cleanup & Token Migration

Removes CSS classes that duplicate what shadcn/ui components already provide, and replaces hardcoded colors with semantic design tokens.

## Workflow

1. **Audit** — scan files for redundant classes and hardcoded colors (use grep/glob)
2. **Categorize** — group findings by category (see below)
3. **Fix per category** — apply fixes, commit, stop for review
4. **Verify** — run typecheck + lint after all categories

## Category Reference

Fix in this order. Commit after each category, then stop.

### Cat 1: Redundant border/bg on Card

Card provides `ring-1 ring-foreground/10 rounded-xl bg-card text-card-foreground`. Remove any of these when applied to a `<Card>` component:

- `border border-border` — creates double-outline (ring + border)
- `border border-muted` — same double-outline issue
- `bg-card` — already provided
- `text-card-foreground` — already provided (applies to all descendants)

### Cat 2: Replace card-like divs with Card/CardContent

Divs with patterns like `bg-card border border-border rounded-lg p-6` should become:

```tsx
// Before
<div className="bg-card border border-border rounded-lg p-6">
  <h3>Title</h3>
  <p>Content</p>
</div>

// After
<Card size="sm">
  <CardContent>
    <h3>Title</h3>
    <p>Content</p>
  </CardContent>
</Card>
```

When div had `p-3`, use `Card size="sm" className="p-3"` (overrides `py-3` with full `p-3`).
When div had `p-6`, use `Card size="sm"` + `CardContent` (Card provides `py-3 gap-3`, CardContent provides `px-3`).
Keep custom classes like `shadow-xs`, `overflow-hidden`, `touch-none`, `dark:bg-[#111111]`.

### Cat 3: Redundant padding on CardContent/Header/Footer

**CardContent** provides `px-4` (sm: `px-3`). No vertical padding — Card handles that with `py-4 gap-4`.

- Remove `p-4` — adds `pt-4 pb-4` on top of Card's `py-4 gap-4`
- Remove `p-6` / `p-8` — if div had full padding, use `space-y-4` on CardContent for child spacing instead
- Remove `pb-2` / `pb-4` — gap handles spacing between children

**CardHeader** provides `px-4 gap-1`. Card provides `py-4 gap-4`.

- Remove `pb-2` / `pb-4` / `py-4` — gap between header and content is Card's job

**CardFooter** provides `p-4 border-t bg-muted/50`. Card has `has-[card-footer]:pb-0`.

- Remove `pb-4` / `pt-0` / `pt-2` — already padded by CardFooter; Card auto-removes bottom padding

### Cat 4: Button size variants instead of manual overrides

| Override | Fix |
|---|---|
| `h-10` | Use `size="lg"` (h-9) instead — do NOT add new xl variant |
| `size-10` | Use `size="icon-lg"` (size-9) |
| `size-8` alongside `size="icon"` | Remove — `size="icon"` already gives `size-8` |
| `size="sm"` + `h-8` override | Remove `size="sm"` and `h-8` — default size is h-8 |
| `size="sm"` + `size-8 p-0` | Switch to `size="icon"` |
| `size="sm"` + `h-8 px-2` | Remove `size="sm"`, `h-8`, `px-2` — use default |
| `px-2` on size="sm" | Remove — sm already provides `px-2.5` |
| `gap-2` on Button | Remove — default/lg provide `gap-1.5`, sm provides `gap-1` |
| `mr-2` on icon inside Button | Remove — Button's `gap` handles spacing |
| `variant="outline"` + `border-border` | Remove `border-border` — outline variant already provides it |
| `variant="default"` + `bg-primary text-primary-foreground` | Remove — default variant provides these |

### Cat 5: Redundant Dialog styles

**DialogContent** provides `w-full max-w-[calc(100%-2rem)] p-4 gap-4 rounded-xl`:

- Remove `w-full` — redundant
- Remove `pt-2` — `p-4` covers top padding

**DialogHeader** provides `flex flex-col gap-2`:

- Remove `pb-2` — gap handles spacing

**DialogDescription** inside DialogHeader:

- Remove `pt-1` / `pt-2` — gap-2 handles spacing

**DialogFooter** provides `-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end`:

- Remove `flex` — provided
- Remove `w-full` — not needed
- Remove `sm:justify-between` — footer uses `sm:justify-end`
- Remove `pt-4` — `p-4` covers it
- Remove `border-t` / `border-border` — provided

### Cat 6: Input/Textarea/SelectTrigger defaults

**Input** default: `h-8 px-2.5 py-1`

- Remove `h-8` — already default
- Remove `h-12` on title inputs — let h-8 apply

**SelectTrigger** default: `data-[size=default]:h-8`, sm: `data-[size=sm]:h-7`

- Remove `h-8` — already default
- Remove `h-10` — use default h-8, do NOT add lg variant

**Textarea** default: `w-full min-h-16 px-2.5 py-2 field-sizing-content`

- Remove `w-full` — already default
- Remove `field-sizing-content` — already default

### Cat 7: Gap/spacing standardization

- `gap-[6px]` → `gap-1.5` (standard small gap)
- Page wrappers → `py-6 px-4 max-w-5xl mx-auto`
- `mb-4`/`mb-2` inside `space-y-4` parent → remove, let space-y handle it
- `mt-4`/`mt-2` inside `space-y-4` parent → remove
- `mb-2` inside `space-y-2` parent → remove
- `mb-4` inside DialogContent `gap-4` → remove
- `mb-1` inside CardHeader `gap-2` → remove
- Use `space-y-4` on CardContent instead of `mb-*` on children

### Cat 8: Card border-* → ring-* utilities

Card uses `ring-1 ring-foreground/10`, NOT `border`. Border utilities are non-functional on Card:

- `hover:border-primary` → `hover:ring-primary`
- `border-primary` → `ring-primary`
- `border-muted` → `ring-foreground/10`
- Remove standalone `border` on Card — it creates double-outline with ring

### Cat 9: Replace hardcoded colors with design tokens

See Token Mappings section below.

### Cat 10: Misc redundant classes

- **TabsTrigger**: provides `inline-flex items-center gap-1.5` → remove `flex items-center`, `mr-2` on icons
- **TabsList**: provides `rounded-lg w-fit inline-flex` → remove `rounded-lg`, `w-fit`
- **DropdownMenuItem**: provides `gap-1.5` → remove `mr-2` on icons
- **HoverCardContent**: provides `bg-popover text-sm text-popover-foreground` → remove these from inner div
- `text-card-foreground` on elements inside Card → remove (Card provides to all descendants)
- `border border-muted-foreground/20 rounded-md p-4 space-y-6` div → `Card size="sm"` + `CardContent className="space-y-6"`

## Token Mappings

### Text colors

| Hardcoded | Token |
|---|---|
| `text-gray-900 dark:text-white` | `text-foreground` |
| `text-gray-800 dark:text-gray-200` | `text-foreground` |
| `text-gray-700 dark:text-gray-300` | `text-muted-foreground` |
| `text-gray-600 dark:text-gray-400` | `text-muted-foreground` |
| `text-gray-500 dark:text-gray-400` | `text-muted-foreground` |
| `text-gray-500 dark:text-gray-500` | `text-muted-foreground` |
| `hover:text-gray-900 dark:hover:text-white` | `hover:text-foreground` |
| `text-red-500` (error context) | `text-destructive` |

### Border/divider colors

| Hardcoded | Token |
|---|---|
| `border-gray-200 dark:border-gray-800` | `border-border` |
| `border-gray-200 dark:border-[#222222]` | `border-border` |
| `divide-gray-200 dark:divide-gray-800` | `divide-border` |

### Brand blue → primary tokens

| Hardcoded | Token |
|---|---|
| `bg-blue-500 text-white` / `bg-blue-500 hover:bg-blue-600 text-white` | `bg-primary text-primary-foreground` |
| `bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300` | `bg-primary/10 text-sidebar-primary` |
| `bg-blue-50 dark:bg-blue-900/20` | `bg-primary/10` |
| `bg-blue-50/50 dark:bg-blue-950/30 border-blue-*` | `bg-primary/5 border border-primary/20` |
| `text-blue-500` (brand context) | `text-sidebar-primary` |
| `bg-blue-500 hover:bg-blue-600` on Button with variant | Use `variant="default"` without hardcoded colors |

### Status badge colors

| Hardcoded | Token |
|---|---|
| `bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300` | `bg-primary/10 text-sidebar-primary` |
| `bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300` | `bg-destructive/10 text-destructive` |

### Background colors (table/section)

| Hardcoded | Token |
|---|---|
| `bg-gray-50 dark:bg-gray-900/30` | `bg-muted/50` |
| `hover:bg-gray-50 dark:hover:bg-gray-900/30` | `hover:bg-muted/50` |
| `bg-gray-200 dark:bg-muted` | `bg-muted` |

## Critical Rules

### Background color policy

**Keep original background colors.** Only replace borders and text colors with tokens. Do NOT replace:

- `bg-white dark:bg-[#111111]` → keep as-is (NOT `bg-card` — `--card` in dark mode is ≈ #222)
- `bg-gray-50/70 dark:bg-[#121212]` → keep as-is (NOT `bg-muted/70`)
- `dark:bg-gray-900/20` → keep as-is
- Any landing page section backgrounds — these are deliberate design choices

### When NOT to replace

- **Per-feature accent colors** (emerald for Mitsuko results, red for Generic MTL, purple for extraction) — intentional visual differentiation
- **`text-blue-500` on Check/X icons** in pricing sections — per-tier color coding
- **`text-green-500` on discount prices** — intentional financial context color
- **`border-2 border-blue-400`** on featured pricing tier — this is a plain div, not Card, so `border` works correctly
- **`mr-2` on icons inside plain `<div className="flex items-center">`** — only redundant inside components with built-in gap
- **Components outside provider context** (e.g. `global-error.tsx` renders in bare `<html><body>`)
- **`src/components/ui/*`** — never modify these source components

### When removing `cn()` import

If removing the last usage of `cn()` from a file, also remove the `import { cn } from "@/lib/utils"` import.

### When className becomes empty

If removing classes leaves `className=""` or `className={cn()}` with no arguments, remove the entire `className` prop.

## Component Defaults Quick Reference

Extracted from `src/components/ui/*.tsx` — do NOT modify these files.

### Card (`card.tsx`)

| Sub-component | Provides |
|---|---|
| `Card` | `ring-1 ring-foreground/10 rounded-xl bg-card py-4 gap-4 text-sm text-card-foreground`, `has-[card-footer]:pb-0`, `size="sm"` → `py-3 gap-3` |
| `CardHeader` | `px-4 gap-1 grid auto-rows-min` (sm: `px-3`) |
| `CardTitle` | `font-heading text-base font-medium` (sm: `text-sm`) |
| `CardDescription` | `text-sm text-muted-foreground` |
| `CardContent` | `px-4` (sm: `px-3`) — NO vertical padding |
| `CardFooter` | `p-4 border-t bg-muted/50` (sm: `p-3`) |
| `CardAction` | `col-start-2 row-span-2 self-start justify-self-end` |

### Button (`button.tsx`)

| Size | h | gap | px |
|---|---|---|---|
| default | h-8 | gap-1.5 | px-2.5 |
| xs | h-6 | gap-1 | px-2 |
| sm | h-7 | gap-1 | px-2.5 |
| lg | h-9 | gap-1.5 | px-2.5 |
| icon | size-8 | — | — |
| icon-xs | size-6 | — | — |
| icon-sm | size-7 | — | — |
| icon-lg | size-9 | — | — |

**Variant `outline`** provides `border-border bg-background`.

### Dialog (`dialog.tsx`)

| Sub-component | Provides |
|---|---|
| `DialogContent` | `w-full max-w-[calc(100%-2rem)] p-4 gap-4 rounded-xl bg-popover text-popover-foreground ring-1 ring-foreground/10` |
| `DialogHeader` | `flex flex-col gap-2` |
| `DialogFooter` | `-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end` |
| `DialogTitle` | `font-heading text-base font-medium` |
| `DialogDescription` | `text-sm text-muted-foreground` |

### Other components

| Component | Key defaults |
|---|---|
| `Input` | `h-8 px-2.5 py-1 w-full` |
| `SelectTrigger` | `data-[size=default]:h-8`, `data-[size=sm]:h-7`, `gap-1.5` |
| `Textarea` | `w-full min-h-16 px-2.5 py-2 field-sizing-content` |
| `TabsTrigger` | `inline-flex items-center gap-1.5` |
| `TabsList` | `rounded-lg w-fit inline-flex` |
| `DropdownMenuItem` | `gap-1.5` |
| `HoverCardContent` | `bg-popover text-sm text-popover-foreground` |

## Audit Commands

Search for common redundancy patterns:

```bash
# Redundant border on Card
rg 'Card.*border-border' --type tsx
rg 'Card.*border border-muted' --type tsx

# Redundant h overrides on Button/Input/SelectTrigger
rg 'size="sm".*h-8' --type tsx
rg 'size="icon".*size-8' --type tsx
rg 'SelectTrigger.*h-8' --type tsx
rg 'h-12' --type tsx -g '!ui/*'

# Redundant mr-2 on icons inside gap components
rg 'mr-2.*<\w+Icon' --type tsx

# Redundant padding on CardContent
rg 'CardContent.*p-4' --type tsx
rg 'CardContent.*p-6' --type tsx
rg 'CardContent.*p-8' --type tsx

# Hardcoded colors to replace
rg 'text-gray-900 dark:text-white' --type tsx
rg 'text-gray-600 dark:text-gray-400' --type tsx
rg 'border-gray-200 dark:border-gray-800' --type tsx
rg 'bg-blue-500' --type tsx -g '!ui/*'

# Redundant w-full on DialogContent
rg 'DialogContent.*w-full' --type tsx
```
