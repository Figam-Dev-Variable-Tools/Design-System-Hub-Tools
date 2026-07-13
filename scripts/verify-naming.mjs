// verify-naming — 네이밍 파리티 게이트. **코드가 단일 출처**, Figma가 그대로 따른다.
//
// 원칙 3개(설계서 §0):
//  1. 변환하지 않는다. camelCase→"Title Case" 정규화 함수를 넣지 않는다. 비교는 문자열 정확 일치다.
//     (이름 짝을 "추측"하는 건 오직 리포트 문구를 친절하게 만들 때뿐 — 통과 판정에는 쓰지 않는다.)
//  2. 검사 대상은 실물이다. components.ts의 COMPONENT_MANIFEST는 generateComponents가 호출되지
//     않는 그림자 선언이므로 보지 않는다. 정본 생성기의 buildSet 선언만 본다.
//  3. 못 읽으면 실패다. 파싱 실패를 continue로 넘기지 않는다(E-UNPARSED / E-COVERAGE).
//
// 규약 N1~N7은 docs/naming-parity.md 참조.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractFigmaSets } from './lib/figma-sets.mjs'
import { indexComponents, parsePropsAt, classifyProps } from './lib/ds-props.mjs'
import { legalLayers, STRUCTURAL_LAYERS } from './lib/css-classes.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const BASELINE_PATH = join(root, 'scripts', '.naming-baseline.json')

// ── 예외 선언 ────────────────────────────────────────────────────────
// 예외는 여기만. 사유·소유자 없이 추가 금지. 항목이 더 이상 위반이 아니면 CI가 stale로 실패시킨다.
// 매칭 키: component | kind | figma (+code 선택). 와일드카드 금지 — 정확 일치만.
const ALLOWLIST = [
  // 코드 짝이 없는 Figma 전용 합성 세트 — React 컴포넌트가 아니라 문서/화면용 조립 샘플이다.
  // 이름 규약은 "코드 이름을 따른다"인데 따를 코드가 없으므로 N1(no-code)만 면제하고,
  // 나머지 규칙(N3 유령 불리언 등)은 그대로 적용된다.
  // 주의: 여기에 컴포넌트를 만들면 이 예외는 자동으로 stale이 되어 CI가 지우라고 실패시킨다.
  ...['DS/AdminSidebar', 'DS/InquiryForm', 'DS/InfoCard'].map((set) => ({
    component: set.replace(/^DS\//, ''),
    kind: 'no-code',
    figma: set,
    reason: 'Figma 전용 합성 세트 — 대응 React 컴포넌트가 없다(문서/화면 샘플용).',
    owner: 'sb.hong',
  })),

  // 접근성 이름(aria-label) — Figma TEXT 속성은 **텍스트 레이어에 바인딩**되어야 존재할 수 있는데
  // (buildSet의 texts: { prop, layer, def }), 접근성 이름은 화면에 글자로 그려지지 않아 바인딩할
  // 레이어 자체가 없다. 그래서 이 string prop들은 Figma 속성으로 표현이 **불가능**하다.
  // 문구를 하드코딩으로 되돌리는 것이 유일한 대안이므로(§0-1 위반) 예외로 둔다.
  ...[
    ['SearchField', 'ariaLabel'], // 라벨 없는 검색 입력의 이름(툴바·필터바)
    ['SearchField', 'clearLabel'], // × 버튼의 이름
    ['Select', 'ariaLabel'], // 라벨 없는 트리거의 이름
    ['Chip', 'removeLabel'], // × 버튼의 이름
    ['DropZone', 'labels.upload'], // 드롭 영역(role=button)의 이름
    ['DropZone', 'labels.uploadMultiple'],
  ].map(([component, code]) => ({
    component,
    kind: 'text-missing',
    figma: null,
    code,
    reason: '접근성 이름 — 그려지는 글자가 아니라 바인딩할 텍스트 레이어가 없다(Figma 속성으로 표현 불가).',
    owner: 'sb.hong',
  })),

  // DS/CategoryTabs 생성기가 스스로 밝힌 범위: "추가·삭제 입력은 문서화 범위 밖 — Figma는 정적 세트다".
  // 그 UI가 Figma에 없으므로 그 문구를 담을 TEXT 속성도 없다. 결정을 존중해 코드 쪽만 문구를 연다(§0-4).
  ...['labels.add', 'labels.addPlaceholder', 'labels.addField'].map((code) => ({
    component: 'CategoryTabs',
    kind: 'text-missing',
    figma: null,
    code,
    reason: 'Figma DS/CategoryTabs는 정적 세트다 — 카테고리 추가 입력 UI 자체가 문서화 범위 밖이다.',
    owner: 'sb.hong',
  })),
]

// ── CLI ──────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const flag = (n) => argv.includes(`--${n}`)
const val = (n) => argv.find((a) => a.startsWith(`--${n}=`))?.split('=')[1]
const asJson = flag('json')
const strict = flag('strict')
const updateBaseline = flag('update-baseline')
const filterComponent = val('component')
const filterRule = val('rule')?.split(',').map((s) => s.trim().toUpperCase())

// ── 수집 ─────────────────────────────────────────────────────────────
const violations = []
const errors = []
const V = (rule, kind, component, o) =>
  violations.push({ rule, kind, component, ...o })

const { specs, errors: extractErrors } = extractFigmaSets(root)
errors.push(...extractErrors)

const index = indexComponents(root)
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '')
const setEq = (a, b) => a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|')
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
/** 인덱스 전개 이름: 'Item 1', 'Head 2', 'Icon 3' (규약 §4·§5 위반의 표식) */
const isIndexed = (s) => /\s\d+$/.test(s) || /^Icon$/.test(s)

for (const spec of specs) {
  const setName = spec.setName
  const name = setName.replace(/^DS\//, '')
  const at = { file: spec.file, line: spec.line }

  // ── N1 §1: 세트 이름 = 'DS/<ComponentName>' ──
  if (!setName.startsWith('DS/')) {
    V('N1', 'set-name', name, { ...at, figma: setName, code: null, fix: `세트 이름을 'DS/<ComponentName>' 형식으로` })
    continue
  }
  const entry = index.get(name)
  if (!entry) {
    V('N1', 'no-code', name, {
      ...at,
      figma: setName,
      code: null,
      fix: `코드 짝(src/ds/${name}/${name}.tsx)이 없다 — 세트를 지우거나 컴포넌트를 만들어라`,
    })
    continue
  }

  // ── 코드 스펙 ──
  let parsed
  try {
    parsed = parsePropsAt(entry.tsx, root)
  } catch (e) {
    errors.push({ code: 'E-UNPARSED', file: entry.tsx, line: 0, message: `${name}: ${e.message}` })
    continue
  }
  // 분류 불가 prop을 조용히 버리지 않는다 — 이번 드리프트의 근본 원인이 "못 읽으면 통과"였다.
  for (const u of parsed.unparsed) {
    errors.push({
      code: 'E-UNPARSED',
      file: parsed.file,
      line: u.line,
      message: `${name}: prop 분류 실패 — ${u.text}`,
    })
  }
  const code = classifyProps(parsed.props)
  const { legal } = legalLayers(entry)
  const codeAt = { codeFile: parsed.file }
  // classifyProps는 왕복 동일성 때문에 line을 담지 않는다 — 원본 props에서 줄을 되찾는다.
  const lineOfProp = (n) => parsed.props.find((p) => p.name === n)?.line ?? 0
  for (const a of code.axes) a.line = lineOfProp(a.name)

  const codeAxisNames = code.axes.map((a) => a.name)
  const figAxisNames = spec.axes.map((a) => a.name)

  // ── N2 §2: VARIANT 축 이름 = React prop 이름 그대로 ──
  const axisMissing = codeAxisNames.filter((n) => !figAxisNames.includes(n))
  const axisExtra = figAxisNames.filter((n) => !codeAxisNames.includes(n))

  // 이름만 다른 1:1 개명(예: Toast tone → variant)은 missing+extra 두 건이 아니라 한 건으로 보고한다.
  const renamed = []
  if (axisMissing.length === 1 && axisExtra.length === 1) {
    const c = code.axes.find((a) => a.name === axisMissing[0])
    const f = spec.axes.find((a) => a.name === axisExtra[0])
    if (setEq(c.values, f.values)) renamed.push([c, f])
  }
  if (renamed.length) {
    const [c, f] = renamed[0]
    V('N2', 'axis-name', name, {
      ...at,
      ...codeAt,
      line: f.line,
      codeLine: c.line,
      code: c.name,
      figma: f.name,
      fix: `축 이름을 '${c.name}'로 (React prop 이름 그대로)`,
    })
  } else {
    for (const n of axisExtra) {
      const f = spec.axes.find((a) => a.name === n)
      // 더 구체적인 원인이 있으면 그걸로 보고한다(축이 "여분"인 게 아니라 잘못 승격된 것).
      if (code.numbers.includes(n)) {
        // N2d — number prop은 유니온이 아니므로 축이 될 수 없다(값을 임의 이산화한 것).
        V('N2', 'axis-from-number', name, {
          ...at,
          ...codeAt,
          line: f.line,
          code: n,
          figma: `${n} (${f.values.join('|')})`,
          fix: `number prop은 축이 아니다 — 축을 없애고 '${n}'을 TEXT 속성으로 두거나 대표값 1개만 그려라`,
        })
      } else if (code.booleans.includes(`show${cap(n)}`)) {
        // N2e — show* boolean은 축이 아니라 BOOLEAN 속성이다.
        V('N2', 'bool-promoted-to-axis', name, {
          ...at,
          ...codeAt,
          line: f.line,
          code: `show${cap(n)}`,
          figma: n,
          fix: `축 '${n}'을 지우고 BOOLEAN 속성 'show${cap(n)}'으로 선언`,
        })
      } else if (code.text.includes(n)) {
        // N2f — string prop은 축이 아니라 TEXT 속성이다.
        V('N2', 'text-promoted-to-axis', name, {
          ...at,
          ...codeAt,
          line: f.line,
          code: n,
          figma: n,
          fix: `축 '${n}'을 지우고 TEXT 속성 '${n}'으로 선언`,
        })
      } else {
        V('N2', 'axis-extra', name, {
          ...at,
          ...codeAt,
          line: f.line,
          code: null,
          figma: n,
          fix: `대응 prop이 없는 축 — 축을 지우거나 코드에 '${n}' prop을 추가`,
        })
      }
    }
    for (const n of axisMissing) {
      const c = code.axes.find((a) => a.name === n)
      V('N2', 'axis-missing', name, {
        ...at,
        ...codeAt,
        line: spec.line,
        codeLine: c.line,
        code: n,
        figma: null,
        fix: `축 '${n}' 추가 — values: [${c.values.map((v) => `'${v}'`).join(', ')}]`,
      })
    }
  }

  // N2b/N2c — 이름이 맞는 축의 값 집합 비교
  for (const f of spec.axes) {
    const c = code.axes.find((a) => a.name === f.name)
    if (!c) continue
    if (!setEq(c.values, f.values)) {
      const isBool = setEq(c.values, ['false', 'true'])
      V('N2', isBool ? 'axis-bool-values' : 'axis-values', name, {
        ...at,
        ...codeAt,
        line: f.line,
        codeLine: c.line,
        code: `${c.name}: [${c.values.join('|')}]`,
        figma: `${f.name}: [${f.values.join('|')}]`,
        fix: `축 값을 코드 유니온과 일치시켜라 — [${c.values.map((v) => `'${v}'`).join(', ')}]`,
      })
    }
  }

  // ── N3 §3: BOOLEAN 속성 이름 = React show* prop 이름 그대로 ──
  compareProps({
    ruleText: 'N3',
    kindPrefix: 'bool',
    figma: spec.bools.map((b) => ({ nameStr: b.prop, line: b.line })),
    codeNames: code.booleans,
    codeKindLabel: 'show* boolean prop',
  })

  // N3g — buildSet이 TEXT마다 자동 생성하는 유령 불리언은 대응 prop이 전혀 없다. 항상 위반.
  for (const g of spec.derivedBools) {
    V('N3', 'bool-ghost', name, {
      ...at,
      ...codeAt,
      line: g.line,
      code: null,
      figma: `${g.name} (buildSet 자동생성)`,
      fix: 'buildSet의 addBoolProp(set, `Show ${t.prop}`, …) 제거 — show* prop이 있을 때만 bools에 명시',
    })
  }

  // ── N4 §4: TEXT 속성 이름 = React prop 이름 그대로 (중첩은 점 표기) ──
  compareProps({
    ruleText: 'N4',
    kindPrefix: 'text',
    figma: spec.texts.map((t) => ({ nameStr: t.prop, line: t.line })),
    codeNames: code.text,
    codeKindLabel: 'string prop',
    // N4c — 배열 prop을 인덱스 TEXT로 전개한 것(Item 1 / Head 2)은 별도 kind로 표시한다.
    extraKind: (fname) => (isIndexed(fname) && code.lists.length ? 'text-from-list' : null),
    extraFix: () =>
      `배열 prop(${code.lists.join(', ')})은 Figma 속성으로 1:1 표현 불가 — 인덱스 전개를 없애거나 예외 선언`,
  })

  // ── N5 §5: INSTANCE_SWAP 속성 이름 = React prop 이름 그대로 ──
  compareProps({
    ruleText: 'N5',
    kindPrefix: 'swap',
    figma: spec.swaps.map((s) => ({ nameStr: s.prop, line: s.line })),
    codeNames: code.swaps,
    codeKindLabel: 'ReactNode prop',
    // N5b — 아이콘을 'Icon' 하나로 뭉개거나 인덱스로 번호 매긴 것.
    extraKind: (fname) => (isIndexed(fname) ? 'swap-indexed' : null),
    extraFix: (fname) =>
      `'${fname}'처럼 뭉뚱그리거나 번호 매긴 아이콘 금지 — 슬롯마다 실제 prop 이름으로 나눠라`,
  })

  // ── N6 §6: 레이어 이름 = 그 요소를 그리는 CSS Module 클래스 이름 ──
  // 단, 속성에 바인딩된 레이어는 그 prop 이름을 쓸 수 있다. 왜냐하면 한 CSS 클래스가 여러 슬롯을
  // 그리는 경우(Button은 leftIcon/rightIcon을 둘 다 styles.icon으로 그린다) 레이어를 클래스명으로
  // 통일하면 이름이 겹쳐 addSwapProp의 findAll(name===layer)이 두 슬롯을 한 속성에 묶어버린다
  // → §5(슬롯마다 별도 INSTANCE_SWAP)가 성립 불가능해진다. 바인딩된 레이어는 prop 이름이 정답이다.
  const layerItems = [
    ...spec.texts.map((t) => ({ layer: t.layer, prop: t.prop, line: t.line, from: 'TEXT' })),
    ...spec.bools.map((b) => ({ layer: b.layer, prop: b.prop, line: b.line, from: 'BOOLEAN' })),
    ...spec.swaps.map((s) => ({ layer: s.layer, prop: s.prop, line: s.line, from: 'INSTANCE_SWAP' })),
  ]
  // 한 레이어에 여러 속성이 붙는 건 정상이다: showLeftIcon(visible)과 leftIcon(mainComponent)은
  // 같은 아이콘 레이어를 가리킨다. 그래서 BOOLEAN의 합법 레이어는 "자기 이름"만이 아니라
  // 그 세트가 선언한 다른 속성 이름(=그 요소의 정체)도 포함한다.
  const declaredProps = new Set(layerItems.map((it) => it.prop))
  for (const it of layerItems) {
    if (!it.layer || legal.has(it.layer) || declaredProps.has(it.layer)) continue
    const cands = [...legal].filter((l) => !STRUCTURAL_LAYERS.includes(l))
    V('N6', 'layer-not-css-class', name, {
      ...at,
      ...codeAt,
      line: it.line,
      code: null,
      figma: `${it.layer} (${it.from} 레이어)`,
      fix: `레이어를 CSS 클래스명 또는 바인딩된 prop 이름('${it.prop}')으로 — CSS 후보: ${cands.slice(0, 8).join(', ') || '(CSS 없음 → root/content만)'}`,
    })
  }

  // ── N7 §7: children 슬롯 = 'content' ──
  if (code.slot === 'content') {
    const hasContentLayer = layerItems.some((it) => it.layer === 'content')
    // 슬롯을 TEXT 속성으로 잘못 선언했는지(§4b) 여부와 무관하게, content 레이어가 없으면 슬롯이 없는 것.
    if (!hasContentLayer && !spec.texts.some((t) => t.prop === 'content')) {
      V('N7', 'slot-missing', name, {
        ...at,
        ...codeAt,
        line: spec.line,
        code: 'children',
        figma: null,
        fix: `children 슬롯 — 렌더 함수에 name='content' 레이어를 두어라`,
      })
    }
  }

  /** 이름 집합 비교 공통 루틴 — 정확 일치가 판정, 정규화 매칭은 "개명이다"라고 알려줄 때만 쓴다. */
  function compareProps({ ruleText, kindPrefix, figma, codeNames, codeKindLabel, extraKind, extraFix }) {
    const figNames = figma.map((f) => f.nameStr)
    const unmatchedFig = figma.filter((f) => !codeNames.includes(f.nameStr))
    const unmatchedCode = codeNames.filter((c) => !figNames.includes(c))

    for (const f of unmatchedFig) {
      // 특수 kind(인덱스 전개/뭉뚱그린 아이콘)가 우선 — 원인을 정확히 짚어야 고칠 수 있다.
      const special = extraKind?.(f.nameStr)
      if (special) {
        V(ruleText, special, name, {
          ...at,
          ...codeAt,
          line: f.line,
          code: null,
          figma: f.nameStr,
          fix: extraFix(f.nameStr),
        })
        continue
      }
      // 대소문자·공백만 다른 같은 이름 → 개명(-name). 통과 판정은 어디까지나 정확 일치다.
      const twin = unmatchedCode.find((c) => norm(c) === norm(f.nameStr))
      if (twin) {
        V(ruleText, `${kindPrefix}-name`, name, {
          ...at,
          ...codeAt,
          line: f.line,
          code: twin,
          figma: f.nameStr,
          fix: `'${f.nameStr}' → '${twin}' (React prop 이름 그대로)`,
        })
        unmatchedCode.splice(unmatchedCode.indexOf(twin), 1)
        continue
      }
      V(ruleText, `${kindPrefix}-extra`, name, {
        ...at,
        ...codeAt,
        line: f.line,
        code: null,
        figma: f.nameStr,
        fix: `대응 ${codeKindLabel}이 없다 — 속성을 지우거나 코드에 prop을 추가`,
      })
    }
    for (const c of unmatchedCode) {
      V(ruleText, `${kindPrefix}-missing`, name, {
        ...at,
        ...codeAt,
        line: spec.line,
        code: c,
        figma: null,
        fix: `${codeKindLabel} '${c}'에 대응하는 Figma 속성이 없다 — 선언을 추가`,
      })
    }
  }
}

// ── 예외 적용 ────────────────────────────────────────────────────────
const usedAllow = new Set()
const expired = []
const today = new Date().toISOString().slice(0, 10)
const kept = violations.filter((v) => {
  const hit = ALLOWLIST.findIndex(
    (a) =>
      a.component === v.component &&
      a.kind === v.kind &&
      a.figma === (v.figma ?? null) &&
      (a.code === undefined || a.code === v.code),
  )
  if (hit === -1) return true
  const a = ALLOWLIST[hit]
  if (a.until && a.until < today) {
    expired.push(a)
    return true
  }
  usedAllow.add(hit)
  return false
})

// 예외가 썩어서 규칙을 가리는 걸 막는다 — 미사용/만료 = 실패.
const stale = ALLOWLIST.filter((_, i) => !usedAllow.has(i)).filter((a) => !expired.includes(a))

// ── 베이스라인(있으면) — 알려진 위반은 KNOWN으로 강등해 단조 감소를 보장한다 ──
const keyOf = (v) => `${v.component}|${v.kind}|${v.figma ?? ''}|${v.code ?? ''}`
let baseline = existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, 'utf8')) : null

if (updateBaseline) {
  const keys = [...new Set(kept.map(keyOf))].sort()
  writeFileSync(BASELINE_PATH, JSON.stringify(keys, null, 2) + '\n')
  console.log(`verify-naming — baseline 갱신: ${keys.length}건 → ${BASELINE_PATH}`)
  process.exit(0)
}

const baseSet = new Set(baseline ?? [])
const known = []
const fresh = []
for (const v of kept) (baseSet.has(keyOf(v)) ? known : fresh).push(v)
// 고쳐진 항목이 baseline에 남아 있으면 실패 — 강제로 지우게 해서 120 → 0 단조 감소를 보장한다.
const liveKeys = new Set(kept.map(keyOf))
const staleBaseline = baseline ? baseline.filter((k) => !liveKeys.has(k)) : []

// ── 필터 & 출력 ──────────────────────────────────────────────────────
let shown = fresh
if (filterComponent) shown = shown.filter((v) => v.component === filterComponent)
if (filterRule) shown = shown.filter((v) => filterRule.includes(v.rule))

// dedupe: component+kind+figma
const seen = new Set()
shown = shown.filter((v) => {
  const k = keyOf(v)
  if (seen.has(k)) return false
  seen.add(k)
  return true
})

const hardErrors = errors.filter((e) => strict || e.code !== 'W-')
const failing = shown.length > 0 || hardErrors.length > 0 || stale.length > 0 || expired.length > 0 || staleBaseline.length > 0

if (asJson) {
  console.log(
    JSON.stringify(
      {
        violations: shown,
        known: known.length,
        errors: hardErrors,
        summary: summarize(shown, known.length),
        allowlist: { applied: usedAllow.size, stale: stale.length, expired: expired.length },
        baselineStale: staleBaseline,
      },
      null,
      2,
    ),
  )
  process.exit(failing ? 1 : 0)
}

for (const e of hardErrors) {
  console.error(`FAIL  ${e.code}\n  ${e.file}:${e.line}\n  ${e.message}\n`)
}
for (const v of shown) {
  const codeLine = v.codeLine ? `:${v.codeLine}` : ''
  console.error(
    `FAIL  ${v.rule}-${v.kind}  ${v.component}\n` +
      `  code  ${v.code ?? '(없음)'}${' '.repeat(Math.max(1, 26 - String(v.code ?? '(없음)').length))}${v.codeFile ?? ''}${codeLine}\n` +
      `  figma ${v.figma ?? '(없음)'}${' '.repeat(Math.max(1, 26 - String(v.figma ?? '(없음)').length))}${v.file}:${v.line}\n` +
      `  fix   ${v.fix}\n`,
  )
}
for (const a of stale) {
  console.error(
    `FAIL  E-ALLOWLIST-STALE\n  ${a.component} / ${a.kind} / ${a.figma} — 더 이상 위반이 아니다. ALLOWLIST에서 지워라.\n`,
  )
}
for (const a of expired) {
  console.error(`FAIL  E-ALLOWLIST-EXPIRED\n  ${a.component} / ${a.kind} / ${a.figma} — until=${a.until} 만료.\n`)
}
for (const k of staleBaseline) {
  console.error(`FAIL  E-BASELINE-STALE\n  ${k} — 고쳐졌다. baseline에서 지워라(--update-baseline).\n`)
}

const s = summarize(shown, known.length)
if (failing) {
  console.error(
    `verify-naming FAIL — ${shown.length}건 / ${specs.length}세트 / 규칙 7개` +
      (known.length ? ` (KNOWN ${known.length}건은 baseline으로 강등)` : '') +
      `\n  by rule : ${s.byRule}\n  by file : ${s.byFile}\n` +
      `  allowlist: ${usedAllow.size}건 적용, ${stale.length}건 stale\n` +
      (hardErrors.length ? `  errors  : ${hardErrors.length}건 (E-UNPARSED/E-COVERAGE — 파서가 못 읽은 선언)\n` : ''),
  )
  process.exit(1)
}
console.log(
  `verify-naming OK — ${specs.length}세트, 이름 규약(N1~N7) 위반 0건` +
    (known.length ? ` (baseline KNOWN ${known.length}건)` : '') +
    `\n  allowlist ${usedAllow.size}건 적용 · 미파싱 0건 · 커버리지 ${specs.length}/${specs.length}`,
)

function summarize(list, knownCount) {
  const byRule = {}
  const byFile = {}
  for (const v of list) {
    byRule[v.rule] = (byRule[v.rule] || 0) + 1
    const f = v.file.split('/').pop()
    byFile[f] = (byFile[f] || 0) + 1
  }
  const fmt = (o) =>
    Object.entries(o)
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${k} ${n}`)
      .join(' · ') || '없음'
  return { byRule: fmt(byRule), byFile: fmt(byFile), known: knownCount, total: list.length }
}
