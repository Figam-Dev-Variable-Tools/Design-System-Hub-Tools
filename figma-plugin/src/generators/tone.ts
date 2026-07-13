// solid 면(color/solid-<tone>) + on-color(color/on-<tone>) — 렌더러 공용 계산.
//
// 규칙(오너 확정): 브랜드 hue는 유지하되 solid 면 위 글자는 '흰색'이 기본이다.
//   - solid 면 : base 위에서 흰 글자가 AA를 넘기면 base 그대로. 못 넘기면 같은 hue의 더 진한
//                셰이드(-600 → -700 → -800) 중 처음으로 통과하는 것.
//   - on-color : 그 면 위에서 AA를 통과하는 색 → 원칙적으로 흰색. 흰 글자가 어떤 셰이드로도
//                불가능한 극단적 톤에서만 어두운 글자(톤 -900부터).
//
// 여기 계산값은 '변수가 없을 때만' 쓰는 폴백 hex다(변수가 있으면 바인딩이 우선).
// 공식·반올림은 scripts/build-tokens.mjs · generators/tokens.ts와 완전히 동일하다
// → 폴백 hex도 Storybook --ds-color-solid-* / --ds-color-on-*와 같은 값이 나온다.
import { hexToRgb, rgbToHex } from '../presets'

const WCAG_AA = 4.5
const WHITE = '#FFFFFF'

/** 두 hex를 amt(0..1)만큼 섞는다(셰이드 공식과 동일). */
function mixHex(hex: string, target: string, amt: number): string {
  const a = hexToRgb(hex)
  const b = hexToRgb(target)
  return rgbToHex({ r: a.r + (b.r - a.r) * amt, g: a.g + (b.g - a.g) * amt, b: a.b + (b.b - a.b) * amt })
}
/** WCAG 상대휘도 (sRGB 역감마) */
function relLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex) // 0..1
  const lin = (s: number) => (s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4))
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
/** WCAG 대비비 (1:1 ~ 21:1) */
function contrastRatio(a: string, b: string): number {
  const la = relLuminance(a)
  const lb = relLuminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}
/** solid 면 후보 — base → -600 → -700 → -800 (셰이드 공식과 동일한 mix 비율). */
const SOLID_STEPS: Array<(h: string) => string> = [
  (h) => h.toUpperCase(),
  (h) => mixHex(h, '#000000', 0.12),
  (h) => mixHex(h, '#000000', 0.24),
  (h) => mixHex(h, '#000000', 0.36),
]

/** solid 면 색 — 흰 글자가 AA를 통과하는 첫 셰이드. 전부 실패하면 base 유지(브랜드 hue 보존). */
export function solidToneHex(base: string): string {
  for (const fn of SOLID_STEPS) {
    const surface = fn(base)
    if (contrastRatio(WHITE, surface) >= WCAG_AA) return surface
  }
  return base.toUpperCase()
}

/**
 * solid 면 위 전경색(글자·아이콘).
 * 면이 흰 글자 AA를 통과하면 흰색(대부분의 톤). 통과 못 하는 극단적 톤에서만 같은 hue의
 * 어두운 글자 — -900(=48%)에서 시작해 AA를 넘길 때까지 1%씩 더 진하게(항상 종료).
 */
export function onToneHex(base: string): string {
  const surface = solidToneHex(base)
  if (contrastRatio(WHITE, surface) >= WCAG_AA) return WHITE
  for (let i = 48; i <= 100; i++) {
    const darker = mixHex(base, '#000000', i / 100)
    if (contrastRatio(darker, surface) >= WCAG_AA) return darker
  }
  return '#000000'
}

/** 변수 이름 — tokens.ts가 만드는 이름과 1:1. */
export const solidVarName = (tone: string) => `color/solid-${tone}`
export const onVarName = (tone: string) => `color/on-${tone}`
