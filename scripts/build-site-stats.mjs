#!/usr/bin/env node
/**
 * build-site-stats — Pages 랜딩이 읽을 통계를 **실제 소스에서** 산출한다.
 *
 * 왜 필요한가:
 *   랜딩(site/index.html)에 수치가 **하드코딩**돼 있었다 — "아이콘 60종"(실제 298) · "소셜 로고 5종"(실제 7) ·
 *   "컴포넌트 62"(실제 65) · "Variables 165"(실제 103×3). 전부 썩어 있었다.
 *   같은 값을 두 곳에 적으면 **두 번째로 적는 순간 갈라진다**(CLAUDE.md §0-2). 그래서 세지 않고 **계산한다**.
 *
 * 산출: docs/ds-stats.json  (pages.yml 이 _site/ 로 복사 → 랜딩이 fetch 로 읽는다)
 * 사용: pnpm build:stats
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const GEN = join(root, 'figma-plugin', 'src', 'generators')

// ── Figma 세트 ─────────────────────────────────────────────────────────
const genSrc = readdirSync(GEN)
  .filter((f) => f.endsWith('.ts'))
  .map((f) => readFileSync(join(GEN, f), 'utf8'))
  .join('\n')

const sets = new Set()
for (const m of genSrc.matchAll(/setName: '(DS\/[^']+)'/g)) sets.add(m[1])
for (const m of genSrc.matchAll(/buildSet\(ctx, page, '(DS\/[^']+)'/g)) sets.add(m[1])
// 두 헬퍼 다 (han, key, …) 이고 setName = 'DS/' + key(2번째 인자)다. 줄바꿈 허용이 필수 —
// 여러 줄로 쓴 호출을 놓치면 실재하는 세트를 못 센다(verify-parity 가 실제로 6개를 놓쳤었다).
for (const m of genSrc.matchAll(/kr(?:Field|Bespoke)Doc\(\s*'[^']*',\s*'([^']+)'/g)) sets.add('DS/' + m[1])

// ── Figma 화면 (['라벨', screenXxx, …]) ────────────────────────────────
const screens = [...genSrc.matchAll(/\[\s*'([^']+)'\s*,\s*screen[A-Za-z0-9_]+/g)].map((m) => m[1])
const adminScreens = [
  ...readFileSync(join(GEN, 'screens.ts'), 'utf8').matchAll(/\[\s*'([^']+)'\s*,\s*screen[A-Za-z0-9_]+/g),
].map((m) => m[1])
const siteScreens = screens.filter((s) => !adminScreens.includes(s))

// ── Figma 페이지 ───────────────────────────────────────────────────────
// **`const PAGE_* = '…'` 선언만** 읽는다. 따옴표 안의 페이지 이름을 통째로 긁으면
// 주석에 인용된 **옛 이름**('15. System - Admin' 등, 개명 전 이름을 유령 페이지 정리용으로 언급한다)까지
// 딸려와 27개로 부풀었다 — 단일 출처는 상수 선언이다.
const pages = [
  ...new Set([...genSrc.matchAll(/const\s+PAGE_[A-Z_]+\s*=\s*'([^']+)'/g)].map((m) => m[1])),
].sort((a, b) => parseInt(a) - parseInt(b))

// ── Storybook 컴포넌트 (스토리 meta title 기준) ────────────────────────
const storyFiles = []
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (f.endsWith('.stories.tsx')) storyFiles.push(p)
  }
}
walk(join(root, 'src', 'ds'))
if (existsSync(join(root, 'src', 'templates'))) walk(join(root, 'src', 'templates'))

/** 파일의 **첫 번째** title: 을 잡으면 목 데이터를 제목으로 착각한다 — meta 블록 안의 title 만 읽는다. */
const metaTitle = (s) => {
  const m = s.match(/(?:const\s+meta[^=]*=|export\s+default)\s*\{[\s\S]*?title:\s*['"]([^'"]+)['"]/)
  return m ? m[1] : undefined
}
const bySection = { component: 0, kr: 0, admin: 0, site: 0 }
for (const f of storyFiles) {
  const t = metaTitle(readFileSync(f, 'utf8'))
  if (!t) continue
  if (t.startsWith('3. 컴포넌트/')) bySection.component++
  else if (t.startsWith('6. KR')) bySection.kr++
  else if (t.startsWith('Admin/') || t.startsWith('Templates')) bySection.admin++
  else if (t.startsWith('Site/')) bySection.site++
}

// ── 토큰 Variables ─────────────────────────────────────────────────────
const tokensDir = join(root, 'tokens')
const presets = readdirSync(tokensDir).filter((f) => f.endsWith('.json'))
const varsPerPreset = (
  readFileSync(join(root, 'src', 'tokens', 'generated', 'vars-toss.css'), 'utf8').match(
    /--ds-[A-Za-z0-9-]+(?=\s*:)/g,
  ) ?? []
).length

// ── 아이콘 · 로고 ──────────────────────────────────────────────────────
// 파리티가 보증하는 것은 **Storybook Lucide 갤러리의 아이콘이 전부 Figma 에 있다**는 것이다
// (verify-parity 와 같은 출처를 쓴다). Figma 의 `_Icon/*` 총수(410)를 세면 갤러리에 없는 것까지 포함돼
// "Storybook 과 같다"는 주장과 어긋난다.
const lucide = readFileSync(join(root, 'src', 'icons', 'Lucide.stories.tsx'), 'utf8')
const iconImport = lucide.match(/import\s*\{([\s\S]*?)\}\s*from\s*["']lucide-react["']/)
const icons = iconImport
  ? iconImport[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean).length
  : 0
const logos = readdirSync(join(root, 'src', 'ds', 'SocialLoginButton', 'logos')).filter((f) =>
  f.endsWith('.svg'),
).length

// ── 게이트 ─────────────────────────────────────────────────────────────
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const gates = Object.keys(pkg.scripts).filter((k) => k.startsWith('verify:') && k !== 'verify:all')

const stats = {
  // 이 파일은 **생성물**이다. 손으로 고치지 마라 — `pnpm build:stats` 가 다시 쓴다.
  generatedBy: 'scripts/build-site-stats.mjs',
  components: bySection.component,
  krComponents: bySection.kr,
  adminScreens: adminScreens.length,
  siteScreens: siteScreens.length,
  figmaSets: sets.size,
  figmaPages: pages.length,
  pageNames: pages,
  presets: presets.length,
  variablesPerPreset: varsPerPreset,
  variablesTotal: varsPerPreset * presets.length,
  icons,
  logos,
  gates: gates.length,
  gateNames: gates,
}

const out = join(root, 'docs', 'ds-stats.json')
writeFileSync(out, JSON.stringify(stats, null, 2) + '\n', 'utf8')

console.log(
  `build:stats OK → docs/ds-stats.json\n` +
    `  컴포넌트 ${stats.components} · KR ${stats.krComponents} · Figma 세트 ${stats.figmaSets} · ` +
    `어드민 화면 ${stats.adminScreens} · 클라이언트 화면 ${stats.siteScreens}\n` +
    `  Variables ${stats.variablesPerPreset}×${stats.presets}프리셋 · 아이콘 ${stats.icons} · 로고 ${stats.logos} · 게이트 ${stats.gates}`,
)
