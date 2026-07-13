// CSS Module 클래스 집합 추출 — 규약 §6("레이어 이름 = 그 요소를 그리는 CSS 클래스 이름")의 판정 근거.
//
// 왜 선언∪사용이 아니라 선언만 쓰지 않는가: .module.css에 선언만 있고 TSX가 쓰지 않는 클래스를
// 레이어 이름으로 허용하면, 죽은 클래스가 합법 레이어가 되어 규약이 헐거워진다.
// 반대로 TSX의 styles.x 참조만 보면 CSS에 없는 오타를 허용하게 된다.
// → 합법 레이어 = (CSS 선언 ∩ TSX 사용) ∪ 구조 예외.
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/** 클래스가 없는 순수 구조 프레임에만 허용되는 이름 (규약 §6 단서 · §7 슬롯) */
export const STRUCTURAL_LAYERS = ['root', 'content']

/** <Name>.module.css의 클래스 선언 이름 집합 */
export function parseCssClasses(abs) {
  if (!existsSync(abs)) return new Set()
  const src = readFileSync(abs, 'utf8')
  const out = new Set()
  // 셀렉터 어디에 나오든 클래스 토큰을 전부 수집한다(.a .b, .a.b, .a:hover, .a > .b …).
  // 주석/문자열 안의 점표기를 줄이려고 블록 주석은 먼저 제거한다.
  const stripped = src.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const m of stripped.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) out.add(m[1])
  return out
}

/** TSX에서 실제 참조하는 클래스: styles.foo / styles['foo'] */
export function parseStyleRefs(abs) {
  if (!existsSync(abs)) return new Set()
  const src = readFileSync(abs, 'utf8')
  const out = new Set()
  for (const m of src.matchAll(/styles\.([A-Za-z_]\w*)/g)) out.add(m[1])
  for (const m of src.matchAll(/styles\[\s*['"`]([^'"`]+)['"`]\s*\]/g)) out.add(m[1])
  return out
}

/**
 * 컴포넌트의 합법 레이어 이름 집합.
 * @param {{ dir: string, tsx: string, cssBase: string }} entry indexComponents()가 준 항목
 * @returns {{ legal: Set<string>, css: Set<string>, used: Set<string> }}
 */
export function legalLayers(entry) {
  const css = parseCssClasses(join(entry.dir, `${entry.cssBase}.module.css`))
  const used = parseStyleRefs(entry.tsx)
  const legal = new Set(STRUCTURAL_LAYERS)
  for (const c of css) if (used.has(c)) legal.add(c)
  // CSS 파일이 없는 컴포넌트(스타일 없는 조합 컴포넌트)는 구조 예외 이름만 허용한다.
  return { legal, css, used }
}
