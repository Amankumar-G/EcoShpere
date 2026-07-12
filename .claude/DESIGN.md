# EcoSphere — Design Brief (Phase 0 Platform Foundation)

**Mode:** Existing design system — this documents what is already in the codebase. Do not invent tokens, override values, or propose alternatives. New Phase 0 UI must be consistent with what is recorded here.

**Stack:** Next.js 16 (App Router, React 19), Tailwind v4 (CSS-first `@theme`), shadcn (style `base-nova`) built on `@base-ui/react`, `lucide-react` icons, `sonner` toasts, `next-themes` (imported, see gap below), TanStack Query, react-hook-form + zod.

> **Next.js 16 warning (load-bearing):** `client/CLAUDE.md` → `client/AGENTS.md` states this Next.js version has breaking changes vs. training data. **Any client code (routing, layouts, metadata, server/client components, fonts) must consult `node_modules/next/dist/docs/` before implementation.** Do not assume App Router conventions from memory.

Source of truth for tokens: `client/src/app/globals.css`. shadcn config: `client/components.json`. Utility: `client/src/lib/utils.ts` (`cn()`).

---

## Color Palette

Colors are OKLCH CSS variables defined in `:root` (light) and `.dark` (dark) in `globals.css`, exposed to Tailwind v4 via `@theme inline`. Consume them as Tailwind semantic classes (`bg-primary`, `text-muted-foreground`, `border-border`) or `var(--token)`. **Never hardcode hex.**

**Brand anchor:** violet/purple. `--brand: oklch(0.48 0.2 302)` (light) / `oklch(0.62 0.2 302)` (dark). `--primary` and `--ring` alias `--brand`.

**Secondary accent:** `--accent-brand: oklch(0.7 0.19 46)` (warm orange) — documented as "used sparingly for highlights/success states". Also drives `--chart-2`.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--background` | `oklch(1 0 0)` | `oklch(0.16 0.015 300)` | page surface |
| `--foreground` | `oklch(0.2 0.02 300)` | `oklch(0.97 0.005 300)` | body text |
| `--card` / `--popover` | `oklch(1 0 0)` | `oklch(0.21 0.02 300)` | raised surfaces |
| `--primary` (`--brand`) | `oklch(0.48 0.2 302)` | `oklch(0.62 0.2 302)` | primary actions, active nav |
| `--primary-foreground` | `oklch(0.985 0 0)` | same | text on primary |
| `--secondary` | `oklch(0.97 0.008 300)` | `oklch(0.27 0.02 300)` | secondary buttons/surfaces |
| `--muted` / `--muted-foreground` | `0.97 0.008 300` / `0.5 0.02 300` | `0.27 0.02 300` / `0.7 0.02 300` | subdued bg / secondary text |
| `--accent` / `--accent-foreground` | `0.94 0.03 302` / `0.3 0.08 302` | `0.3 0.05 302` / `0.97 0.005 300` | hover/highlight surface |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | errors/delete |
| `--border` / `--input` | `0.91 0.01 300` | `1 0 0 /10%` , `/15%` | borders / field borders |
| `--sidebar*` | see file | see file | dedicated sidebar surface tokens |

**Charts:** `--chart-1` (brand), `--chart-2` (accent-brand), `--chart-3` `oklch(0.6 0.15 200)` teal, `--chart-4` `oklch(0.75 0.15 140)` green, `--chart-5` neutral. Use for the future Environmental/Social/Governance visualizations (Phase 0 does not build charts, but the tokens exist).

**Semantic-color accessibility rule (design-fundamentals):** `--destructive` and status use must never rely on color alone. Pair with an icon/label. The toast system already does this (see Toasts).

---

## Typography

- **Sans (body/UI):** Geist, loaded in `client/src/app/layout.tsx` via `next/font/google` (`Geist`). `html` applies `font-sans`.
- **Mono:** Geist Mono (`--font-geist-mono`, exposed as `font-mono`).
- **Heading:** `--font-heading` currently aliases `--font-sans` (no separate display face). Headings differentiate by size/weight, not family.
- Type sizing follows Tailwind defaults (`text-sm` is the default control size, e.g. buttons). Login page uses `text-3xl font-bold tracking-tight` for the page title, `text-sm` for supporting copy — a reasonable hierarchy reference.

> **Known token gap — reconcile before shell work:** `layout.tsx` registers the Geist font as CSS variable `--font-geist-sans`, but `globals.css` `@theme` maps `--font-sans: var(--font-sans)` (self-referential/undefined) and never reads `--font-geist-sans`. So `font-sans` may be falling back to the browser default rather than Geist. Fix by wiring `--font-sans: var(--font-geist-sans)` (or aligning the layout variable name) — do not introduce a new font family.

---

## Spacing, Radius, Shape

- **Spacing:** Tailwind v4 default 4px scale (no custom `spacing` overrides). Use `gap-*`, `p-*`, `space-y-*` from the default scale; do not introduce off-scale values.
- **Radius:** base `--radius: 0.625rem` (10px). Derived scale in `@theme`: `--radius-sm` (×0.6), `-md` (×0.8), `-lg` (=base), `-xl` (×1.4), `-2xl` (×1.8), up to `-4xl` (×2.6). Buttons use `rounded-lg`; smaller controls clamp with `rounded-[min(var(--radius-md),12px)]`.
- **Shape language:** soft/rounded. Controls are compact (default button height `h-8`). Keep the compact, rounded, low-chrome feel for the data-dense admin shell.

---

## Component Primitives (existing inventory ~70)

All under `client/src/components/ui/*`. Built on `@base-ui/react` primitives, styled with `cva` variants + `cn()`, tagged with `data-slot="..."`. **Compose these — do not fork or re-style them.**

Layout/shell: `sidebar`, `sheet`, `separator`, `scroll-area`, `resizable`, `breadcrumb`, `tabs`, `card`, `aspect-ratio`, `collapsible`, `accordion`.
Navigation/menus: `navigation-menu`, `menubar`, `dropdown-menu`, `context-menu`, `command`, `combobox`.
Overlays: `dialog`, `alert-dialog`, `drawer`, `popover`, `hover-card`, `tooltip`.
Data/display: `table`, `pagination`, `badge`, `avatar`, `chart`, `progress`, `skeleton`, `spinner`, `empty`, `alert`, `item`, `kbd`.
Forms: `field` (Field/FieldGroup/FieldLabel/FieldError), `input`, `input-group`, `input-otp`, `textarea`, `label`, `checkbox`, `radio-group`, `select`, `native-select`, `switch`, `slider`, `toggle`, `toggle-group`, `button`, `button-group`.
Feedback: `sonner`.
(Chat/media primitives — `bubble`, `message`, `attachment`, `carousel`, `marker`, `background-paths`, `demo` — exist but are out of Phase 0 scope.)

**Button variants** (`button.tsx`): `default` (bg-primary), `outline`, `secondary`, `ghost`, `destructive` (soft `bg-destructive/10 text-destructive`), `link`. Sizes: `default h-8`, `xs h-6`, `sm h-7`, `lg h-9`, plus `icon`/`icon-xs`/`icon-sm`/`icon-lg`. Focus is handled by `focus-visible:ring-3 ring-ring/50` and `aria-invalid` styling — **do not strip focus rings.**

**Sidebar** (`sidebar.tsx`): full provider-based system already present. `SidebarProvider`/`useSidebar`, cookie-persisted state (`sidebar_state`), widths `16rem` expanded / `3rem` icon / `18rem` mobile, keyboard shortcut `Cmd/Ctrl+B`, mobile fallback via `Sheet` + `useIsMobile` (`client/src/hooks/use-mobile.ts`). Uses dedicated `--sidebar*` tokens. Build the app shell on this — do not create a new sidebar.

---

## Layout & Providers

- `layout.tsx`: `html.h-full antialiased` + font vars; `body.min-h-full flex flex-col`; wraps children in `RootProviders`.
- `RootProviders.tsx` (`client/src/app/RootProviders.tsx`): `QueryClientProvider` (single client via `useState`) + `<Toaster />`.
- **Known gap — dark mode not wired:** `sonner.tsx` calls `useTheme()` from `next-themes`, but there is **no `ThemeProvider` in `RootProviders`** and nothing toggles the `.dark` class. Dark tokens exist but are currently unreachable. Phase 0 shell (Settings + topbar/user menu) should add `next-themes` `ThemeProvider` (with `attribute="class"`) and a theme toggle, then dark mode "just works" via the existing tokens. `@custom-variant dark (&:is(.dark *))` is already defined.
- **Metadata gap:** `layout.tsx` still has default `title: "Create Next App"` — replace with EcoSphere metadata as part of shell work.
- **Token-discipline deviation to correct going forward:** `login/page.tsx` and `LoginForm.tsx` use hardcoded hex (`#111827`, `#F8F7F4`, `#2563EB`, etc.) instead of tokens. **Do not copy this pattern into the authenticated shell.** New Phase 0 UI uses semantic tokens only.

---

## Data / Form / Toast Conventions (follow exactly)

Layered data flow: **page/component → `data/<domain>/*.hooks.ts` (TanStack Query) → `data/<domain>/*.api.ts` (`apiClient`)**. Reference: `client/src/data/auth/`.

- **Query keys:** export a `<domain>QueryKeys` const object of `as const` arrays (see `authQueryKeys`).
- **Mutations:** `useMutation` with `onSuccess` invalidating the relevant query key via `queryClient.invalidateQueries`.
- **API modules:** thin async fns returning `data` from typed `apiClient.<verb>` calls. Types live in `@/types/*.interface.ts`.
- **Forms:** react-hook-form + `zodResolver`; schemas in `client/src/lib/zod-schemas/*.schema.ts`. Render with `Field`/`FieldGroup`/`FieldLabel`/`FieldError` + `Input`. Submit via `handleSubmit`, per-call `onSuccess`/`onError`.
- **Errors:** surface with `toast.error(getErrorMessage(error))` (`client/src/lib/axios/get-error-message.ts`). Never swallow.
- **Toasts:** `sonner` `Toaster` in `sonner.tsx` maps success/info/warning/error/loading to lucide icons (`CircleCheck`, `Info`, `TriangleAlert`, `OctagonX`, `Loader2`) and themes toast surfaces to `--popover`/`--border`/`--radius`. Use `toast.success/error/info/warning` from `sonner`.

---

## Accessibility Constraints (existing + required)

- Focus visibility is built into primitives (`focus-visible:ring-3 ring-ring/50`, `outline-ring/50` global in `@layer base`). Preserve it.
- Semantic HTML: `login/page.tsx` uses `<main>`; continue using `nav`/`main`/`aside` in the shell (sidebar = `aside`, content = `main`).
- Status/validation pairs color with an icon (toasts, `aria-invalid` ring). Extend this to badges/status cells: never color-only.
- Respect `prefers-reduced-motion`; button transitions are `transition-all` (~default 150ms) — keep transitions in the 150–300ms range.
- WCAG AA (4.5:1 text / 3:1 large) applies to any new token combination; the defined tokens are designed for it — verify before introducing new pairings.

---

## Phase 0 Guidance

### App Shell (role-aware)
Build on existing `sidebar.tsx` (`SidebarProvider` at the authenticated layout root). Nav items: Dashboard, Environmental, Social, Governance, Gamification, Records, Reports, Settings — each a `SidebarMenuButton` with a `lucide-react` icon + label, active state via brand/`--sidebar-primary`. Filter items by role from the RBAC layer (do not render nav a role cannot access). Topbar: notification bell (badge count) opening the Notifications drawer, plus user menu (`dropdown-menu` + `avatar`) with logout (`LogoutButton` pattern exists) and theme toggle. Wire `ThemeProvider` here (see gap above). Content region is `<main>` inside `SidebarInset`.

### Shared primitives to BUILD (document API; compose existing)
- **DataTable** — composes `table.tsx` + `pagination.tsx`. Props: `columns` (accessor + header + optional cell/sortable), `data`, `pageSize`, controlled sorting/pagination/filter state (server-driven, aligns with TanStack Query). Column-level filter inputs use `input`; empty result → `empty.tsx`; loading → `skeleton.tsx` rows. Use for Employees list and Departments flat views.
- **FormDialog** — composes `dialog.tsx` + react-hook-form + zod. Props: `open`/`onOpenChange`, `title`/`description`, a form (`Field*` fields), `onSubmit`, pending state disabling submit. Success → `toast.success` + close + query invalidation; error → `toast.error(getErrorMessage)`.
- **ConfirmDialog** — composes `alert-dialog.tsx`. Props: `open`/`onOpenChange`, `title`, `description`, `confirmLabel`, `variant` (destructive → button `variant="destructive"`), `onConfirm` (async, disables while pending). Use for deletes.
- **PageHeader** — title (heading weight/size), optional description (`text-muted-foreground`), optional breadcrumb (`breadcrumb.tsx`) and right-aligned action slot (primary `Button`). Consistent top-of-page vertical rhythm.
- **State primitives** — standardize empty (`empty.tsx`), loading (`skeleton.tsx` for content, `spinner.tsx` for inline/button), error (surface via `toast` + inline `alert.tsx` where a section fails). Toasts already wired.

### Pages
- **Departments** — hierarchy tree (self-referential dept subtree): use `collapsible`/`accordion` or a nested tree of `SidebarMenu`-style rows; CRUD via FormDialog + ConfirmDialog. Respect manager dept-subtree scoping from RBAC (show only permitted subtree).
- **Employees** — DataTable (sort/paginate/filter) + FormDialog for create/edit + role assignment (`select`/`radio-group`) + ConfirmDialog for delete. Role assignment gated by RBAC.
- **Settings** — EsgConfig toggles (`switch`) + weights editor (`input`/`slider` numeric, must sum/validate via zod). Use progressive disclosure: group by section with `tabs` or `accordion`; keep Save always visible. Weight validation errors via `FieldError`.
- **Notifications** — bell in topbar (unread badge) opening a `drawer` (or `sheet`) listing notifications; mark-read actions call the list/mark-read API; empty state via `empty.tsx`; loading via `skeleton`. (Delivery abstraction is deferred to Phase 3 — data + list/mark-read only.)

---

## Design System Consistency Checklist (Phase 0 UI)
- [ ] Colors via semantic tokens/Tailwind classes — no hardcoded hex
- [ ] Composes existing `components/ui/*` primitives — no forked/re-styled copies
- [ ] Focus rings preserved on all interactive elements
- [ ] Status never color-only (icon/label paired)
- [ ] Spacing/radius on the existing scale
- [ ] Data flow: component → hooks (TanStack Query) → api (`apiClient`); errors via `toast.error(getErrorMessage)`
- [ ] Forms via react-hook-form + zod + `Field*`
- [ ] Consulted `node_modules/next/dist/docs/` before writing Next.js code
- [ ] Dark mode verified (once `ThemeProvider` is wired)

## Notes for maintainers
- **No root `CLAUDE.md`** exists; a reference was added to `client/CLAUDE.md`.
- Three pre-existing gaps to resolve during Phase 0 shell work: (1) `next-themes` `ThemeProvider` not wired, (2) `--font-sans` not mapped to the Geist variable, (3) default `layout.tsx` metadata.

[ ] Reviewed
</content>
</invoke>
