# Design-System-Hub-Tools

<p align="center">
  <a href="README.md">한국어</a> ·
  <b>English</b> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.zh.md">中文</a>
</p>

<p align="center">
  <img alt="Storybook" src="https://img.shields.io/badge/Storybook-8-FF4785?logo=storybook&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" />
  <img alt="Figma Plugin API" src="https://img.shields.io/badge/Figma-Plugin_API-F24E1E?logo=figma&logoColor=white" />
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm&logoColor=white" />
</p>

---

## Purpose & Background

A design system where **Storybook (React) and Figma interlock through the same tokens, the same names, and the same variants**.
The React source is the single source of truth (SSOT); Figma mirrors it through a plugin.

### Background — why it is built this way

A design system does not break in the code. It breaks in **the gap between the two systems**.

- A designer changes the primary color in Figma and one button stays the same — that button was painted with a raw hex instead of a variable.
- A developer renames a prop from `Price` to `price`, and ten product cards in the Figma screen suddenly render the default price — the instance override broke **without a single warning**.
- The same GNB menu is declared in two files and the two copies drift apart — the moment you write a value the second time, the two values start diverging.

This repository closes that gap **with gates, not documentation**. When a name, a value, a binding, or a screen assembly drifts, `pnpm verify:all` turns red. The design goal is to never rely on human attention.

### What it does

| | |
|---|---|
| **Design-token SSOT** | A single `tokens/*.json` derives the Storybook CSS variables, the TS types, **and** the Figma plugin presets together. Nothing is written by hand twice. |
| **DS component library** | 155 components (core, admin, site, and 20 Korea-specific ones). Every color is `var(--ds-*)`; every string goes through a `labels` prop. |
| **Figma generator** | The plugin creates 3 Variable collections, Text Styles, component sets, admin/front screens, and doc pages directly in Figma. |
| **7 parity gates** | Names, values, bindings, and screen assembly between code and Figma are verified mechanically. |
| **CSS framework comparison** | Bootstrap / Tailwind / Bulma / Foundation / Materialize / Semantic / Skeleton, isolated in Shadow DOM and compared side by side. |

Full conventions: [CLAUDE.md](CLAUDE.md). Naming rules: [docs/naming-parity.md](docs/naming-parity.md).

---

## Tech Stack

| Area | Technology |
|---|---|
| Core | React 18 · TypeScript 5 · Vite 5 |
| Docs / catalog | Storybook 8 (`@storybook/react-vite`) + addon-essentials / a11y / designs |
| Styling | CSS Modules · Tailwind 3.4 · SCSS (sass) · styled-components · `color-mix()` token skin |
| Token pipeline | JSON → `scripts/build-tokens.mjs` → CSS variables + TS types + plugin presets (style-dictionary alongside) |
| Figma | Figma Plugin API (`figma-plugin/`) · Variables · Component Set / Variant / Instance Swap |
| Verification gates | 7 Node ESM scripts (`scripts/verify-*.mjs`) + a PreToolUse git-guard hook |
| Frameworks (for comparison) | bootstrap · tailwindcss · bulma · foundation-sites · materialize-css · semantic-ui-css · skeleton-css |
| Icons | Lucide (canonical) · Heroicons · Tabler · Material Symbols (`?raw` SVG) · Bootstrap Icons (font) |
| Charts | Chart.js + react-chartjs-2 |
| Fonts | Pretendard · Inter (@fontsource) |
| Snapshots | Playwright (Storybook render → PNG → placed in Figma) |
| Deployment | GitHub Pages (doc site + declaration hosting) · GitHub Actions · jsDelivr @gh |
| Package management | pnpm workspaces + corepack (Node 22) |

---

## Directory Structure

```
Design-System-Hub-Tools/
├─ tokens/                          # ⭐ Variable SSOT — bootstrap.json · tailwind.json · toss.json
│
├─ scripts/                         # Build + verification gates (Node ESM)
│  ├─ build-tokens.mjs              #   token JSON → CSS variables · TS types · plugin presets
│  ├─ build-story-manifest.mjs      #   src/ds → Figma manifest + round-trip equality check
│  ├─ capture-snapshots.mjs         #   Storybook render → PNG (Playwright)
│  ├─ validate-tokens.mjs           #   token schema validation
│  ├─ verify-parity.mjs             #   ① token value / variable-name parity
│  ├─ verify-mapping.mjs            #   ② component coverage
│  ├─ verify-naming.mjs             #   ③ code names ↔ Figma property / layer names
│  ├─ verify-screen-props.mjs       #   ④ screen inst() overrides ↔ set property names
│  ├─ verify-bindings.mjs           #   ⑤ are nodes actually bound to variables (no raw hex)
│  └─ lib/
│     ├─ ds-props.mjs               #     TSX prop parser (union / boolean / string / ReactNode)
│     ├─ figma-sets.mjs             #     extracts the real Figma set declarations from the generators
│     └─ css-classes.mjs            #     CSS-Modules classes ↔ layer names
│
├─ src/
│  ├─ tokens/
│  │  ├─ generated/                 # ⚙️ build-tokens output (do not edit by hand)
│  │  │  ├─ vars-bootstrap.css      #     --ds-* CSS variables (per preset)
│  │  │  ├─ vars-tailwind.css
│  │  │  ├─ vars-toss.css
│  │  │  ├─ types.ts                #     ColorToken · SolidColorToken · SpacingToken … unions
│  │  │  └─ theme.ts                #     presets object + cssVar()
│  │  └─ motion.css                 #   motion tokens
│  │
│  ├─ shared/                       # Shared infrastructure (single source)
│  │  ├─ labels.ts                  #   ⭐ string variables — shared Labels types · mergeLabels · resolveLabel
│  │  ├─ ThemeScope.tsx             #   data-theme preset switcher (applies the token CSS variables)
│  │  ├─ FrameworkScope.tsx         #   injects framework CSS only inside Shadow DOM (global isolation)
│  │  ├─ mediaMock.ts               #   single source for mock images
│  │  ├─ tableExport.ts             #   table export helpers
│  │  └─ placeholders.tsx           #   placeholder primitives
│  │
│  ├─ ds/                           # 155 design-system components
│  │  ├─ Button · TextField · Table · Badge · Dialog …          # core primitives
│  │  ├─ AdminListPage · AdminFormPage · AdminShell · AdminTable # admin shells (screens are assembled from shells)
│  │  ├─ SiteSection · SiteHeader · PortfolioPage · ShopPage …   # site (front-end) screens
│  │  └─ kr/                        #   20 Korea-specific components (RRN, bank account, card, address, identity, e-signature)
│  │     └─ format.ts               #     auto-hyphen formatters + validators (RRN / biz-no / card Luhn)
│  │
│  ├─ templates/                    # Screen templates (AdminSuite · SiteSuite · Dashboard · Login · Settings)
│  ├─ frameworks/                   # 7 CSS framework showcases + Compare
│  ├─ icons/ · styling/ · animations/ · foundation/ · docs/     # stories & MDX docs
│
├─ figma-plugin/                    # Figma plugin (separate bundle, separate tsconfig)
│  └─ src/
│     ├─ code.ts                    #   plugin entry — UI messages → generation pipeline
│     ├─ ui.html                    #   ⭐ variable input UI (preset · 9 colors · font · base size · scale)
│     ├─ presets.ts                 #   ⭐ key lists · computeSizes · hexToRgb · firstFontFamily
│     ├─ presets.data.ts            #   ⚙️ build-tokens output (mirror of tokens/*.json — do not edit)
│     └─ generators/
│        ├─ tokens.ts               #   ⭐ creates the 3 Figma Variable collections (generateTokens)
│        ├─ tone.ts                 #   ⭐ solid/on color derivation (same formula as build-tokens)
│        ├─ sync.ts                 #   ⭐ validate & import remote token JSON (validateTokens · importTokens)
│        ├─ categories-shared.ts    #   ⭐ canonical binding helpers (bindFillVar · boundText …)
│        ├─ lib/build-set.ts        #   ⭐ canonical component set / variant axes / properties (buildSet · variantItem)
│        ├─ categories*.ts          #   component category pages (Input/Action/Feedback/Nav/Data/KR/Media…)
│        ├─ admin.ts · screens.ts   #   admin components · 26 admin screens
│        ├─ site.ts · site-screens.ts #  front components · 5 front screens
│        ├─ foundations.ts · docs.ts  #  Design System · Icon System · doc pages
│        └─ snapshots.ts            #   places Storybook snapshot PNGs
│
├─ packages/figma-story-tools/      # manifest distribution package (npm/CDN)
├─ docs/                            # spec · naming parity · known issues · process log
├─ site/                            # GitHub Pages static hosting (declaration JSON)
└─ .storybook/                      # Storybook config (main.ts · preview.tsx)
```

---

## Variable Management — Files & Key Functions

Variables are **declared in one place and flow in one direction**:

```
tokens/*.json  (SSOT — the only place a human edits)
      │
      └── scripts/build-tokens.mjs
              ├──▶ src/tokens/generated/vars-*.css     (--ds-*)         → Storybook runtime
              ├──▶ src/tokens/generated/types.ts       (union types)    → compile-time safety net
              ├──▶ src/tokens/generated/theme.ts       (presets · cssVar)
              └──▶ figma-plugin/src/presets.data.ts    (plugin built-in presets)
                          │
                          └── figma-plugin/src/generators/tokens.ts
                                  └──▶ 3 Figma Variable collections (color/* · font/* · radius/* · spacing/*)
                                          │
                                          └── categories-shared.ts · lib/build-set.ts
                                                  └──▶ every node's fill / stroke / text is **bound** to a variable
```

The key point is that `presets.data.ts` is **built, not hand-written** — which is why the Storybook and Figma values *cannot* diverge.

### 1. Variable source (SSOT)

| File | Contents |
|---|---|
| [tokens/toss.json](tokens/toss.json) · [tokens/bootstrap.json](tokens/bootstrap.json) · [tokens/tailwind.json](tokens/tailwind.json) | The 3 presets. Each holds `color` (10 keys) · `typography` (fontFamily · baseSize · scale · sizes · weights) · `radius` (3) · `spacing` (6). |

Only the 10 base colors are written (`primary` `secondary` `error` `success` `warning` `neutral` `bg` `bgSubtle` `text` `border`).
Shades (100–900), `solid-*`, and `on-*` are **not written — they are derived** (§2).

### 2. Token build — [scripts/build-tokens.mjs](scripts/build-tokens.mjs)

| Function | Role |
|---|---|
| `mixHex(hex, target, amt)` | Mixes two colors by ratio — the basis for deriving shades (100–900) |
| `relLuminance(hex)` / `contrastRatio(a, b)` | WCAG relative luminance / contrast ratio |
| `solidColorFor(base)` | Computes a surface color from the base tone **where white text passes AA (4.5:1)** → `--ds-color-solid-*` |
| `onColorFor(base)` | Computes the foreground color to place on that solid surface (AA guaranteed) → `--ds-color-on-*` |
| `px(n)` · `union(keys)` · `varKeys(name)` | Output serialization helpers (CSS px · TS unions · variable-name lists) |

Four outputs: `vars-<preset>.css` · `types.ts` · `theme.ts` · `figma-plugin/src/presets.data.ts`.

### 3. Figma variable declaration — [figma-plugin/src/generators/tokens.ts](figma-plugin/src/generators/tokens.ts)

| Function / constant | Role |
|---|---|
| `COLLECTION_NAMES` | The 3 collections to create — `DS Color` · `DS Typography` · `DS Radius·Spacing` |
| `guardExisting()` | **Idempotency guard** — aborts generation if a collection of the same name already exists (never deletes) |
| `generateTokens(payload)` | Takes the UI input (preset, colors, font, base size, scale) and creates the Figma Variables |

The names `generateTokens` produces map **1:1 to Storybook's `--ds-*`**:

| Figma variable | Storybook CSS variable | Note |
|---|---|---|
| `color/<key>` | `--ds-color-<key>` | 10 base colors. `DS Color` has **3 modes** (bootstrap · tailwind · toss) |
| `color/<key>/<step>` | `--ds-color-<key>-<step>` | Shades 100–900 (computed per mode from the base) |
| `color/solid-<key>` | `--ds-color-solid-<key>` | AA-passing surface color |
| `color/on-<key>` | `--ds-color-on-<key>` | Foreground on the solid surface |
| `font/family` | `--ds-font-family` | **One family name only** — passing a full CSS stack makes node creation fail |
| `font/size/<key>` | `--ds-font-size-<key>` | The 6 steps produced by `computeSizes(baseSize, scale)` |
| `font/weight/<key>` | `--ds-font-weight-<key>` | regular · medium · bold |
| `radius/<key>` · `spacing/<key>` | `--ds-radius-<key>` · `--ds-spacing-<key>` | |

### 4. Key lists & value conversion — [figma-plugin/src/presets.ts](figma-plugin/src/presets.ts)

| Function / constant | Role |
|---|---|
| `COLOR_KEYS` · `SIZE_KEYS` · `WEIGHT_KEYS` · `RADIUS_KEYS` · `SPACING_KEYS` | The canonical key lists per axis (a key not listed here does not exist) |
| `computeSizes(baseSize, scale)` | base size × scale → the 6 steps `xs…xxl`. The UI's *base size* / *scale* inputs land here |
| `hexToRgb(hex)` / `rgbToHex(rgb)` | Converts between the UI color picker and Figma RGB |
| `firstFontFamily(stack)` | Extracts **only the first family** from a CSS font stack (Figma does not understand stacks — passing one fails as an unloaded font) |
| `PRESETS` | Re-exports `presets.data.ts` (= the mirror of tokens/*.json) |

### 5. Derived-color formula (Figma side) — [figma-plugin/src/generators/tone.ts](figma-plugin/src/generators/tone.ts)

| Function | Role |
|---|---|
| `solidToneHex(base)` / `onToneHex(base)` | **The same formula** as build-tokens' `solidColorFor` / `onColorFor`. If the two drift, `verify:parity` catches it |
| `solidVarName(tone)` / `onVarName(tone)` | Builds the `color/solid-<tone>` · `color/on-<tone>` names |

### 6. Binding helpers (where nodes get bound to variables) — [figma-plugin/src/generators/categories-shared.ts](figma-plugin/src/generators/categories-shared.ts)

**This file is the single canonical copy.** Duplicate it and only one copy gets fixed while the rest rot — rule B4 of `verify:bindings` prevents exactly that.

| Function | Role |
|---|---|
| `bindFillVar(ctx, node, varName, hex)` | **Binds** a fill to a variable. Always use this instead of `fills = [solid(…)]` (raw hex) |
| `bindStrokeVar(ctx, node, varName, hex)` | Binds a stroke to a variable |
| `boundText(ctx, chars, size, varName, hex, bold)` | Creates a text node with **color, size, weight and family all bound** to variables. Use instead of a bare `txt()` |
| `bindSolidFill(ctx, node, tone)` / `bindOnFill(ctx, node, tone)` | Binds a tone surface / its foreground color in one call |
| `toneBase(ctx, tone)` / `onHex(ctx, tone)` | The current context's base hex / on-color hex for a tone |
| `recolorIconVar(ctx, node, varName, hex)` / `recolorIconOn(ctx, node, tone)` | Binds an icon vector's color to a variable |
| `tintHex(hex, amt)` | Computes a subtle background tint |

### 7. Component property (variable) declaration — [figma-plugin/src/generators/lib/build-set.ts](figma-plugin/src/generators/lib/build-set.ts)

This is where a React prop becomes a Figma **component property**. Code decides the name; Figma follows.

| Function | Role |
|---|---|
| `buildSet(...)` | Creates the component set and its variant axes (union prop → VARIANT axis) |
| `addTextProp(set, prop, layer, def)` | string prop → **TEXT property** |
| `addBoolProp(set, prop, layer, def)` | `show*` boolean → **BOOLEAN property** |
| `addSwapProp(set, prop, layer, defKey)` | ReactNode slot → **INSTANCE_SWAP property** |
| `propKeys(set)` | Maps display name → Figma's internal key (`Title#12:3`). Screen assembly's `inst()` relies on it |
| `variantItem(ctx, set, state)` | Builds a variant instance for a doc page (applies `state.props` / `texts` / `swaps`) |

> ⚠️ `inst()` and `variantItem()` **warn and ignore** unknown property names.
> Rename a property on a set and the screen override breaks silently → `verify:screens` is the only gate that catches this.

### 8. Remote variable injection — [figma-plugin/src/generators/sync.ts](figma-plugin/src/generators/sync.ts)

| Function | Role |
|---|---|
| `validateTokens(json)` | Validates the schema of an externally fetched token JSON and returns the list of violations |
| `importTokens(json)` | Injects the validated tokens into the current Figma file's Variables |

Via the plugin UI (`▸ Details → Load remote declaration (URL)`) you can read a CDN manifest and reproduce the same variables.

### 9. Runtime variable application (Storybook side)

| File | Role |
|---|---|
| [src/shared/ThemeScope.tsx](src/shared/ThemeScope.tsx) | Wraps children in a `data-theme="<preset>"` scope so `vars-<preset>.css` applies. The Storybook toolbar's preset switcher drives it |
| [src/tokens/generated/theme.ts](src/tokens/generated/theme.ts) | `cssVar(token)` → the `var(--ds-color-<token>)` string |
| [src/tokens/generated/types.ts](src/tokens/generated/types.ts) | `ColorToken` · `SolidColorToken` · `SpacingToken` … unions — using a nonexistent token is **caught by typecheck** |

### 10. String variables (labels) — [src/shared/labels.ts](src/shared/labels.ts)

Every user-visible string is a variable too. There is exactly **one** channel — the `labels` prop — and this file is the single source for its types and merge functions.

| Function / type | Role |
|---|---|
| `mergeLabels(defaults, labels)` | Safely merges defaults with a partial override **one level deep**. A naive spread would wipe the remaining defaults |
| `resolveLabel(...candidates)` | Priority resolution — **individual prop > `labels.*` > default** |
| `resolveText(value, arg)` | Returns a string as-is, or evaluates a function with its argument (`(n) => \`${n} items\``) |
| `RowActionsLabels` · `EmptyLabels` · `PaginationLabels` · `SearchLabels` · `Formatters` … | Shared string types — **import them, never redefine** |

### 11. Variable-drift gates — [scripts/](scripts/)

| Gate | What it catches |
|---|---|
| `verify:parity` | Whether tokens/\*.json ↔ presets.data.ts ↔ `--ds-*` ↔ Figma variable names agree on **both value and name** |
| `verify:bindings` | Whether nodes are really **bound** to variables (B1 no raw fill · B2 no unbound text · B3 no font literals · B4 no duplicated helpers) |
| `verify:naming` | Code prop / CSS class names ↔ Figma property / layer names (**exact match**, no transformation) |
| `verify:screens` | Screen `inst()` overrides ↔ set property names (overrides silently broken by a rename) |
| `verify:mapping` | Component coverage — everything that should exist does, and nothing that shouldn't |

Gate parsers: [scripts/lib/ds-props.mjs](scripts/lib/ds-props.mjs) (`parsePropsAt` · `classifyProps` · `indexComponents`) ·
[scripts/lib/figma-sets.mjs](scripts/lib/figma-sets.mjs) (`extractFigmaSets` · `getValidIconKeys`) ·
[scripts/lib/css-classes.mjs](scripts/lib/css-classes.mjs) (`parseCssClasses` · `legalLayers`).

---

## Running

```bash
pnpm install
pnpm build:tokens                 # tokens/*.json → CSS variables · TS types · plugin presets
pnpm storybook                    # doc site (http://localhost:6006)
pnpm --dir figma-plugin build     # Figma plugin bundle → figma-plugin/dist/
```

In Figma: **Plugins → Development → Import plugin from manifest…** → pick `figma-plugin/manifest.json` →
choose preset / colors / font in the UI → **[Generate design system]**.

## Verification

```bash
pnpm verify:all     # ← if this is green, and only then, you may call it done
```

| Command | Check |
|---|---|
| `pnpm typecheck` | App typecheck (`noUnusedLocals` is on) |
| `pnpm typecheck:figma` | Plugin typecheck |
| `pnpm verify:parity` | Token value / variable-name parity |
| `pnpm verify:mapping` | Component coverage |
| `pnpm verify:naming` | Code names ↔ Figma names |
| `pnpm verify:screens` | Screen assembly (`inst()` overrides) |
| `pnpm verify:bindings` | Node ↔ variable bindings |
| `pnpm verify:guard` | Whether the git-guard hook actually bites (33 injected faults) |

## Requirements

- **Node 20 or 22** (Storybook 8 does not support Node 24)
- **pnpm** — `corepack enable && corepack prepare pnpm@latest --activate`

## Contributing

Read [CLAUDE.md](CLAUDE.md) before you start. In short:

1. **No commands that mutate git state** (`stash` · `reset --hard` · `checkout -- .` …) — several agents share one worktree. A PreToolUse hook blocks them physically.
2. **No hardcoding** — colors, sizes and spacing go through `var(--ds-*)`; strings go through the `labels` prop.
3. **Don't build a new thing when one exists** — tables, empty states, toolbars and confirm dialogs already exist. Add an optional axis to the existing one.
4. **Actually run the gates before you say you're done.**
