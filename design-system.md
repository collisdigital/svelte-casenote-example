# Design System — Architectural Rules

This application is built on the **NHS Wales (DHCW) Single Record** design language.
The full token set is vendored under
[apps/frontend/src/lib/design-system/tokens](apps/frontend/src/lib/design-system/tokens)
and surfaced to components as **semantic Tailwind utilities** declared in
[apps/frontend/src/app.css](apps/frontend/src/app.css).

> This is a healthcare system. Accuracy, accessibility (WCAG 2.2 AA), and
> consistency are non-negotiable.

---

## 1. Tokenized styling rule (enforced)

Components **must only** use semantic styling tokens. Literal Tailwind colour
utilities (`red-500`, `blue-600`, `green-100`, …) are **forbidden** anywhere in
components.

Every semantic utility resolves to a Single Record Tier-2 variable, so light/dark
mode (`[data-theme="dark"]`) resolves live at runtime.

### Colour token map

| Tailwind utility (use this)      | SR Tier-2 token                       | Purpose                              |
| -------------------------------- | ------------------------------------- | ------------------------------------ |
| `*-brand-primary`                | `--sr-color-interactive-primary`      | Primary actions, headers             |
| `*-brand-primary-hover`          | `--sr-color-interactive-primary-hover`| Primary hover                        |
| `*-brand-secondary`              | `--sr-color-interactive-secondary`    | Secondary interactive                |
| `*-brand-link`                   | `--sr-color-interactive-link`         | Inline links                         |
| `*-brand-accent`                 | `--sr-color-brand-accent`             | Decorative accent (never filled+white)|
| `*-brand-destructive`            | `--sr-color-interactive-destructive`  | Destructive actions                  |
| `*-status-critical(-surface)`    | `--sr-color-status-critical*`         | Errors / missing                     |
| `*-status-success(-surface)`     | `--sr-color-status-success*`          | Active / confirmed                   |
| `*-status-warning(-surface)`     | `--sr-color-status-warning*`          | Requested / caution                  |
| `*-status-info(-surface)`        | `--sr-color-status-info*`             | In transit / informational           |
| `*-neutral-background`           | `--sr-color-surface-background`       | Page background (`grey.100`)         |
| `*-neutral-surface`              | `--sr-color-surface-small-cards`      | Cards / inputs (white)               |
| `*-neutral-subtle`               | `--sr-color-surface-subtle`           | Row hover / subtle fills             |
| `*-neutral-muted`                | `--sr-color-border-default`           | Default 1px borders                  |
| `*-neutral-strong`               | `--sr-color-border-strong`            | Strong borders / inputs              |
| `*-fg-default`                   | `--sr-color-text-primary`             | Primary text                         |
| `*-fg-muted`                     | `--sr-color-text-secondary`           | Secondary text                       |
| `*-fg-inverse`                   | `--sr-color-text-inverse`             | Text on dark surfaces                |

`*` is the Tailwind prefix — `text-`, `bg-`, or `border-`. Examples:
`text-brand-primary`, `bg-status-critical`, `border-neutral-muted`.

---

## 2. Layout stacking rule (enforced)

Flexbox layout is expressed **only** through three custom stack utilities
(defined with `@utility` in `app.css`). Raw `flex flex-col items-center`
"utility soup" is **not permitted**.

| Utility            | Equivalent                                  | Use for             |
| ------------------ | ------------------------------------------- | ------------------- |
| `ui-stack-v`       | `display:flex; flex-direction:column`       | Vertical stacks     |
| `ui-stack-h`       | `display:flex; flex-direction:row; align-items:center` | Horizontal rows |
| `ui-stack-centered`| `display:flex; align-items:center; justify-content:center` | Centred content |

Spacing between stack children uses Tailwind `gap-*` (which maps to the 4px grid).
Alignment/justification beyond the defaults uses `justify-*` only where needed.

---

## 3. Typography rule

Text uses the `sr-*` type utilities bound to SR type tokens — never ad-hoc
`text-[18px]` sizes.

| Utility          | Token                  | Use                              |
| ---------------- | ---------------------- | -------------------------------- |
| `sr-heading-xl`  | `--sr-font-heading-xl` | Page titles (48/54)              |
| `sr-heading-l`   | `--sr-font-heading-l`  | Section headings (36/42)         |
| `sr-heading-m`   | `--sr-font-heading-m`  | Sub-sections (26/32)             |
| `sr-heading-s`   | `--sr-font-heading-s`  | Card / panel titles (22/30)      |
| `sr-heading-xs`  | `--sr-font-heading-xs` | Inline labels (16/24 bold)       |
| `sr-body-m`      | `--sr-font-body-m`     | Body — **minimum for clinical content** (16/24) |
| `sr-body-s`      | `--sr-font-body-s`     | Supporting text (14/24)          |
| `sr-label`       | `--sr-font-label`      | Form labels, table headers, buttons (14/20, 0.7px tracking) |
| `sr-caption`     | `--sr-font-caption`    | Timestamps, metadata (12/16)     |

---

## 4. Clinical & accessibility non-negotiables

- **Never rely on colour alone for status.** `StatusTag` always pairs a status
  surface colour with an **icon and a text label**.
- **Body M (16px) is the minimum** for primary clinical content.
- **NHS numbers** are shown grouped (`XXX XXX XXXX`) and monospace.
- **Dates** use `DD MMM YYYY, HH:mm`.
- **Focus** is the standard SR ring: 3px amber outline, 2px offset, 2px navy
  inner stroke (provided by `tokens/border.css` `:focus-visible`).
- **Spacing** is on a strict 4px grid (`gap-2` = 8px, `gap-4` = 16px, etc.).
- **Copy** is sentence case, imperative for actions ("Move location",
  "Register case note"), specific and non-blaming for errors. No emoji.
- **Backgrounds** are flat solid fills — no gradients, imagery, or textures.

---

## 5. Where the rules live in code

- Token CSS: `apps/frontend/src/lib/design-system/tokens/*.css`
- Semantic utility declarations + stack/type utilities: `apps/frontend/src/app.css`
- Reusable primitives honouring the rules:
  `apps/frontend/src/lib/components/` — `Button`, `Card`, `StatusTag`, `Field`,
  `SelectField`, `ErrorSummary`.
