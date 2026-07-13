// T1 — tokens/*.json (SSOT #1) → CSS 변수 + TypeScript 타입/프리셋 임베드 생성기
// 사용: pnpm build:tokens
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tokensDir = join(root, 'tokens')
const outDir = join(root, 'src', 'tokens', 'generated')
mkdirSync(outDir, { recursive: true })

const PRESET_ORDER = ['bootstrap', 'tailwind', 'toss']

const presets = {}
for (const file of readdirSync(tokensDir).filter((f) => f.endsWith('.json'))) {
  const json = JSON.parse(readFileSync(join(tokensDir, file), 'utf8'))
  presets[json.$preset] = json
}

const names = PRESET_ORDER.filter((p) => presets[p])
if (names.length !== PRESET_ORDER.length) {
  throw new Error(`tokens/ 프리셋 누락: 기대 ${PRESET_ORDER}, 실제 ${Object.keys(presets)}`)
}

const px = (n) => `${n}px`

// 팔레트 셰이드 — figma-plugin tokens.ts SHADE_STEPS와 동일 공식(같은 hex를 양쪽이 생성).
const hexToRgb = (hex) => {
  const h = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}
const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0').toUpperCase()
const mixHex = (hex, target, amt) => {
  const a = hexToRgb(hex)
  const b = hexToRgb(target)
  return '#' + [0, 1, 2].map((i) => toHex(a[i] + (b[i] - a[i]) * amt)).join('')
}
const SHADE_STEPS = [
  ['50', (h) => mixHex(h, '#FFFFFF', 0.9)],
  ['100', (h) => mixHex(h, '#FFFFFF', 0.8)],
  ['200', (h) => mixHex(h, '#FFFFFF', 0.62)],
  ['300', (h) => mixHex(h, '#FFFFFF', 0.44)],
  ['400', (h) => mixHex(h, '#FFFFFF', 0.24)],
  ['500', (h) => h.toUpperCase()],
  ['600', (h) => mixHex(h, '#000000', 0.12)],
  ['700', (h) => mixHex(h, '#000000', 0.24)],
  ['800', (h) => mixHex(h, '#000000', 0.36)],
  ['900', (h) => mixHex(h, '#000000', 0.48)],
]
const PALETTE_KEYS = ['primary', 'secondary', 'error', 'success', 'warning', 'neutral']

// solid 면 + on-color(전경색) — figma-plugin tokens.ts와 동일 공식(같은 hex를 양쪽이 생성).
// 규칙(오너 확정): 브랜드 hue는 유지하되 solid 면 위 글자는 '흰색'이 기본이다.
//   - solid: base 위에서 흰 글자가 AA를 넘기면 base 그대로. 못 넘기면 같은 hue의 더 진한
//            셰이드(-600 → -700 → -800) 중 처음으로 통과하는 것을 면 색으로 쓴다.
//   - on   : 그 면 위에서 AA를 통과하는 색 → 원칙적으로 흰색.
//            어떤 셰이드로도 흰 글자가 불가능한 극단적 톤(예: 노란 warning)에서만 어두운 글자.
// base 색은 절대 건드리지 않고(tokens/*.json 무수정), 셰이드와 똑같이 base에서 '계산'되는 파생값이다.
const WCAG_AA = 4.5
const WHITE = '#FFFFFF'
// WCAG 상대휘도 (sRGB 역감마)
const relLuminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
// WCAG 대비비 (1:1 ~ 21:1)
const contrastRatio = (a, b) => {
  const la = relLuminance(a)
  const lb = relLuminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}
// solid 면 후보 — base → -600 → -700 → -800 (셰이드 공식과 동일한 mix 비율).
const SOLID_STEPS = [
  ['base', (h) => h.toUpperCase()],
  ['600', (h) => mixHex(h, '#000000', 0.12)],
  ['700', (h) => mixHex(h, '#000000', 0.24)],
  ['800', (h) => mixHex(h, '#000000', 0.36)],
]
/** solid 면 색 — 흰 글자가 AA를 통과하는 첫 셰이드. 전부 실패하면 base 유지(브랜드 hue 보존). */
const solidColorFor = (base) => {
  for (const [, fn] of SOLID_STEPS) {
    const surface = fn(base)
    if (contrastRatio(WHITE, surface) >= WCAG_AA) return surface
  }
  return base.toUpperCase()
}
/**
 * solid 면 위 전경색.
 * 면이 흰 글자 AA를 통과하면 흰색(대부분의 톤). 통과 못 하는 극단적 톤(노란 warning 등)에서만
 * 같은 hue의 어두운 글자 — -900(=48%)에서 시작해 AA를 넘길 때까지 1%씩 더 진하게(항상 종료).
 */
const onColorFor = (base) => {
  const surface = solidColorFor(base)
  if (contrastRatio(WHITE, surface) >= WCAG_AA) return WHITE
  for (let i = 48; i <= 100; i++) {
    const darker = mixHex(base, '#000000', i / 100)
    if (contrastRatio(darker, surface) >= WCAG_AA) return darker
  }
  return '#000000'
}

// a) vars-<preset>.css — :root[data-theme] (스펙 §5 형식) + [data-theme] (ThemeScope div 적용)
for (const name of names) {
  const t = presets[name]
  const lines = []
  for (const [k, v] of Object.entries(t.color)) lines.push(`  --ds-color-${k}: ${v};`)
  // 팔레트 셰이드(플러그인 color/<key>/100..900과 동일) → 양방향 변수 패리티
  for (const key of PALETTE_KEYS) {
    for (const [step, fn] of SHADE_STEPS) lines.push(`  --ds-color-${key}-${step}: ${fn(t.color[key])};`)
  }
  // solid 면(플러그인 color/solid-<key>와 동일) — 흰 글자가 AA를 통과하는 톤 면.
  for (const key of PALETTE_KEYS) lines.push(`  --ds-color-solid-${key}: ${solidColorFor(t.color[key])};`)
  // on-color(플러그인 color/on-<key>와 동일) — solid 면의 전경색. WCAG AA(4.5:1) 보장.
  for (const key of PALETTE_KEYS) lines.push(`  --ds-color-on-${key}: ${onColorFor(t.color[key])};`)
  lines.push(`  --ds-font-family: ${t.typography.fontFamily};`)
  for (const [k, v] of Object.entries(t.typography.sizes)) lines.push(`  --ds-font-size-${k}: ${px(v)};`)
  for (const [k, v] of Object.entries(t.typography.weights)) lines.push(`  --ds-font-weight-${k}: ${v};`)
  for (const [k, v] of Object.entries(t.radius)) lines.push(`  --ds-radius-${k}: ${px(v)};`)
  for (const [k, v] of Object.entries(t.spacing)) lines.push(`  --ds-spacing-${k}: ${px(v)};`)
  // 보더 두께(플러그인 border/width·border/width-thick와 동일)
  lines.push(`  --ds-border-width: 1px;`)
  lines.push(`  --ds-border-width-thick: 2px;`)
  const css = `/* AUTO-GENERATED by scripts/build-tokens.mjs — DO NOT EDIT (SSOT: tokens/${name}.json) */\n` +
    `:root[data-theme='${name}'],\n[data-theme='${name}'] {\n${lines.join('\n')}\n}\n`
  writeFileSync(join(outDir, `vars-${name}.css`), css)
}

// b) types.ts — 유니온 타입은 토큰 JSON 키에서 생성
const union = (keys) => keys.map((k) => `'${k}'`).join(' | ')
const ref = presets[names[0]]
const typesTs = `// AUTO-GENERATED by scripts/build-tokens.mjs — DO NOT EDIT (SSOT: tokens/*.json)
export type StylePreset = ${union(names)}
export type ColorToken = ${union(Object.keys(ref.color))}
/** 팔레트 톤(셰이드·solid·on-color가 파생되는 base 키) */
export type PaletteToken = ${union(PALETTE_KEYS)}
/** solid 면 — 흰 글자가 AA를 통과하는 톤 면(--ds-color-solid-*). base에서 계산된 파생 토큰. */
export type SolidColorToken = ${union(PALETTE_KEYS.map((k) => `solid-${k}`))}
/** solid 면의 전경색 — base에서 계산된 파생 토큰(--ds-color-on-*). WCAG AA 4.5:1 보장. */
export type OnColorToken = ${union(PALETTE_KEYS.map((k) => `on-${k}`))}
export type FontSizeToken = ${union(Object.keys(ref.typography.sizes))}
export type FontWeightToken = ${union(Object.keys(ref.typography.weights))}
export type RadiusToken = ${union(Object.keys(ref.radius))}
export type SpacingToken = ${union(Object.keys(ref.spacing))}

export interface DesignTokens {
  $preset: StylePreset
  color: Record<ColorToken, string>
  typography: {
    fontFamily: string
    baseSize: number
    scale: number
    sizes: Record<FontSizeToken, number>
    weights: Record<FontWeightToken, number>
  }
  radius: Record<RadiusToken, number>
  spacing: Record<SpacingToken, number>
}

export const presets: Record<StylePreset, DesignTokens> = ${JSON.stringify(
  Object.fromEntries(names.map((n) => [n, presets[n]])),
  null,
  2,
)}
`
writeFileSync(join(outDir, 'types.ts'), typesTs)

// c) theme.ts — CSS 변수명 헬퍼
const themeTs = `// AUTO-GENERATED by scripts/build-tokens.mjs — DO NOT EDIT
import type { ColorToken, OnColorToken, SolidColorToken } from './types'

export const cssVar = (t: ColorToken | SolidColorToken | OnColorToken) => \`var(--ds-color-\${t})\`
`
writeFileSync(join(outDir, 'theme.ts'), themeTs)

// d) figma-plugin/src/presets.data.ts — Figma 플러그인 PRESETS 데이터를 같은 SSOT에서 생성.
//    (기존 하드코딩 사본 제거 → Storybook과 값이 절대 어긋날 수 없음 = 양방향성 보장)
const pluginData = `// AUTO-GENERATED by scripts/build-tokens.mjs — DO NOT EDIT (SSOT: tokens/*.json)
// Figma 플러그인 프리셋 데이터. presets.ts가 이 파일을 import 한다 → Storybook과 단일 소스 공유.
import type { PresetName, TokensJson } from './presets'

export const PRESET_DATA: Record<PresetName, TokensJson> = ${JSON.stringify(
  Object.fromEntries(names.map((n) => [n, presets[n]])),
  null,
  2,
)}
`
writeFileSync(join(root, 'figma-plugin', 'src', 'presets.data.ts'), pluginData)

// 완료 조건 검증: 프리셋당 CSS 변수 키 목록 동일
const varKeys = (name) =>
  readFileSync(join(outDir, `vars-${name}.css`), 'utf8')
    .match(/--ds-[a-z0-9-]+(?=:)/g)
    .sort()
    .join(',')
const first = varKeys(names[0])
for (const name of names.slice(1)) {
  if (varKeys(name) !== first) throw new Error(`변수 세트 불일치: ${names[0]} vs ${name}`)
}

console.log(`build:tokens OK — presets: ${names.join(', ')} → src/tokens/generated/`)
