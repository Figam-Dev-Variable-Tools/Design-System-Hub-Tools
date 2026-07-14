// verify-mapping — 커버리지/개수 게이트. "있어야 할 게 다 있고, 없어야 할 게 없는가."
// (이름이 한 글자까지 같은가는 verify-naming.mjs 담당. 역할 분담은 docs/naming-parity.md 참조.)
//
// 왜 갈아엎었나: 예전 verify-mapping은 components.ts의 COMPONENT_MANIFEST만 검사했다.
//   그런데 그 매니페스트도 src/ds props에서 파생된 값이라, 코드 ↔ 코드를 비교하는 동어반복이었다.
//   게다가 유일한 소비자 generateComponents는 ui.html이 components:false로 못박아 실행되지 않는다.
//   → 죽은 선언만 초록으로 지키는 동안, 실제 Figma를 그리는 categories/admin/site.ts의 이름 드리프트는
//     아무도 보지 않았다. 이제 **실물 생성기**(scripts/lib/figma-sets.mjs)를 검사 대상으로 삼는다.
import { rmSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'
import {
  parsePropsFile,
  classifyProps,
  indexComponents,
  parseBooleanDefaults,
  parseStoryTextDefaults,
} from './lib/ds-props.mjs'
import { extractFigmaSets } from './lib/figma-sets.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// ── 1. 실물 생성기 추출 — 파싱 실패/커버리지 구멍은 즉시 실패다(조용한 통과 금지) ──
const { specs, errors } = extractFigmaSets(root)
for (const e of errors) failures.push(`${e.code} ${e.file}:${e.line} — ${e.message}`)

// ── 2. 세트 이름 유일성 — 같은 이름을 두 번 만들면 Figma에서 하나가 덮인다 ──
const seen = new Map()
for (const s of specs) {
  if (seen.has(s.setName)) {
    failures.push(`중복 세트: ${s.setName} (${seen.get(s.setName)} / ${s.file}:${s.line})`)
  }
  seen.set(s.setName, `${s.file}:${s.line}`)
}

// ── 3. 커버리지 — 모든 세트는 코드 짝이 있어야 한다 ──
// (코드 짝이 없는 Figma 전용 합성 세트는 verify-naming의 ALLOWLIST가 관리한다. 여기서는 목록만 센다.)
const index = indexComponents(root)
const orphanSets = specs.filter((s) => !index.has(s.setName.replace(/^DS\//, '')))

// ── 4. P3 매니페스트 동기화 테스트 ──
// COMPONENT_MANIFEST는 이제 "생성기와 동기인지"만 확인하는 격하된 선언이다.
// packages/figma-story-tools(npm 산출물)가 이 스키마를 쓰므로 유지하되, src/ds props와 어긋나면 실패시킨다.
async function loadPluginManifest() {
  const tmpOut = join(root, 'figma-plugin', 'dist', '__manifest-check.mjs')
  execFileSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    [
      'esbuild',
      join(root, 'figma-plugin', 'src', 'generators', 'components.ts'),
      '--bundle',
      '--format=esm',
      `--outfile=${tmpOut}`,
    ],
    { cwd: join(root, 'figma-plugin'), stdio: 'pipe', shell: process.platform === 'win32' },
  )
  const mod = await import(pathToFileURL(tmpOut).href)
  rmSync(tmpOut)
  return mod.COMPONENT_MANIFEST
}
const COMPONENT_MANIFEST = await loadPluginManifest()

function checkManifestSync(component, manifestName) {
  const spec = COMPONENT_MANIFEST.components.find((c) => c.name === manifestName)
  if (!spec) return failures.push(`${manifestName}: P3 매니페스트에 없음`)
  const { props, src } = parsePropsFile(root, component)
  const expect = classifyProps(props)

  const actualAxes = spec.variants.map((v) => ({ name: v.name, values: v.values }))
  if (!eq(actualAxes, expect.axes))
    failures.push(
      `${manifestName}: variant 축 불일치\n  기대(코드): ${JSON.stringify(expect.axes)}\n  실제(P3): ${JSON.stringify(actualAxes)}`,
    )
  if (!eq(spec.text.map((t) => t.name), expect.text))
    failures.push(`${manifestName}: TEXT 불일치 — 기대 ${expect.text} vs 실제 ${spec.text.map((t) => t.name)}`)
  if (!eq(spec.booleans.map((b) => b.name), expect.booleans))
    failures.push(`${manifestName}: BOOLEAN 불일치 — 기대 ${expect.booleans} vs 실제 ${spec.booleans.map((b) => b.name)}`)

  // **기본값도 검사한다.** 예전엔 이름만 대조해서, 기본값이 틀려도 이 게이트는 초록이었다 —
  // 그러다 `pnpm build:manifest`(deep-equal 왕복 검증)에서야 CI 가 터졌다(Chip.removeLabel).
  // build-story-manifest 와 **같은 방식**으로 파생해야 두 검사가 갈라지지 않는다.
  const boolDefaults = parseBooleanDefaults(src)
  const textDefaults = parseStoryTextDefaults(root, component, component)
  const expectText = expect.text.map((name) => ({ name, default: textDefaults[name] ?? name }))
  const expectBool = expect.booleans.map((name) => ({ name, default: boolDefaults[name] ?? false }))
  if (!eq(spec.text.map((t) => ({ name: t.name, default: t.default })), expectText))
    failures.push(
      `${manifestName}: TEXT 기본값 불일치\n  기대(코드·스토리): ${JSON.stringify(expectText)}\n  실제(P3): ${JSON.stringify(spec.text)}`,
    )
  if (!eq(spec.booleans.map((b) => ({ name: b.name, default: b.default })), expectBool))
    failures.push(
      `${manifestName}: BOOLEAN 기본값 불일치\n  기대(코드·스토리): ${JSON.stringify(expectBool)}\n  실제(P3): ${JSON.stringify(spec.booleans)}`,
    )
  if (!eq(spec.swaps.map((s) => s.name), expect.swaps))
    failures.push(`${manifestName}: INSTANCE_SWAP 불일치 — 기대 ${expect.swaps} vs 실제 ${spec.swaps.map((s) => s.name)}`)
  const actualSlot = spec.slot ? spec.slot.name : null
  if (actualSlot !== expect.slot)
    failures.push(`${manifestName}: slot 불일치 — 기대 ${expect.slot} vs 실제 ${actualSlot}`)
}

// P3 매니페스트가 선언한 컴포넌트를 하드코딩 목록이 아니라 매니페스트 자신에서 전수화한다.
for (const c of COMPONENT_MANIFEST.components) {
  checkManifestSync(c.name.replace(/^DS\//, ''), c.name)
}

// ── 5. D2/D3 유니온 값 집합 ──
{
  const { props } = parsePropsFile(root, 'SocialLoginButton')
  const provider = props.find((p) => p.name === 'provider')
  const size = props.find((p) => p.name === 'size')
  if (!eq(provider?.values, COMPONENT_MANIFEST.social.providers))
    failures.push(`DS/SocialLoginButton: provider 불일치 — ${provider?.values} vs ${COMPONENT_MANIFEST.social.providers}`)
  if (!eq(size?.values, COMPONENT_MANIFEST.social.sizes))
    failures.push(`DS/SocialLoginButton: size 불일치 — ${size?.values} vs ${COMPONENT_MANIFEST.social.sizes}`)
}
{
  const { props } = parsePropsFile(root, 'Chart', 'DsChart')
  const type = props.find((p) => p.name === 'type')
  if (!eq(type?.values, COMPONENT_MANIFEST.chart.types))
    failures.push(`DS/Chart: type 불일치 — ${type?.values} vs ${COMPONENT_MANIFEST.chart.types}`)
}

if (failures.length > 0) {
  console.error(`verify-mapping FAIL — ${failures.length}건:\n` + failures.join('\n'))
  process.exit(1)
}
console.log(
  `verify-mapping OK — 실물 생성기 ${specs.length}세트 (미파싱 0 · 중복 0 · 코드 없는 세트 ${orphanSets.length}건은 verify-naming ALLOWLIST 관리), ` +
    `P3 매니페스트 ${COMPONENT_MANIFEST.components.length}종 ↔ src/ds props 동기`,
)
