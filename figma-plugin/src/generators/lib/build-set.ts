// 베리언트 세트 빌더 + 컴포넌트 속성 헬퍼 — **유일한 정본**.
//
// 왜 여기 한 벌만 두는가: 이 헬퍼들은 categories.ts·admin.ts·site.ts에 각각 복붙돼 3벌로 살아 있었다.
// 그래서 네이밍 규약 위반(대표적으로 `Show <prop>` 유령 불리언 자동생성)을 한 파일에서 고쳐도
// 나머지 두 벌이 계속 재생산했다. 규칙을 한 번만 강제하려면 선언도 한 곳에만 있어야 한다.
//
// 5번째 사본 금지: generators/ 안에서 이 파일 밖의 `buildSet|addTextProp|addBoolProp|addSwapProp|propKeys`
// 최상위 함수 선언은 verify-naming이 E-HELPER-COPY로 실패시킨다
// (구현: scripts/lib/figma-sets.mjs의 assertNoHelperCopies).
// 생성기별로 다른 동작이 필요하면 사본을 만들지 말고 옵션 파라미터로 흡수하라.
import { autoFrame, type Ctx, fillColor, solid, SUB, SURFACE, txt } from '../foundations'
import { ICON_COMPONENTS } from '../icon-vec'

export type Axis = { name: string; values: string[] }
export type TextProp = { prop: string; layer: string; def: string }
/**
 * 문서에 배치할 변형 하나(인스턴스 + 캡션). categories/admin/site가 글자 단위로 같은 선언을 갖고 있었다.
 * site만 texts/swaps/backdrop이 붙은 확장판이었는데, 셋을 합치면서 그 축들을 정본으로 끌어올렸다
 * (합집합이 상위집합이라 기존 호출부는 그대로 동작한다).
 */
export type State = {
  caption: string
  /**
   * 속성 오버라이드 — VARIANT 축·BOOLEAN·TEXT·INSTANCE_SWAP을 **표시 이름 그대로** 쓴다.
   * setProperties가 요구하는 전체 키('showFooter#12:3')는 variantItem이 세트에서 역해석한다.
   */
  props: Record<string, string>
  /** TEXT 속성 오버라이드(표시 이름 기준). 같은 세트를 문서에서 여러 장으로 보여줄 때. */
  texts?: Record<string, string>
  /** INSTANCE_SWAP 오버라이드(표시 이름 → ICON_COMPONENTS 키) */
  swaps?: Record<string, string>
  /** 문서에서 인스턴스를 얹을 면 — 투명 헤더처럼 배경이 없는 변형용 */
  backdrop?: 'subtle'
}
export type PropSpec = {
  texts?: TextProp[]
  bools?: Array<{ prop: string; layer: string; def: boolean }>
  swaps?: Array<{ prop: string; layer: string; defKey: string }>
}

// ── 컴포넌트 속성(속성 만들기) 헬퍼 ──────────────────────────────────
// 레이어 name과 layer가 정확히 같아야 붙는다. 실패는 조용히 무시된다.
export function addTextProp(set: ComponentSetNode, prop: string, layer: string, def: string) {
  try {
    const id = set.addComponentProperty(prop, 'TEXT', def)
    for (const n of set.findAll((x) => x.type === 'TEXT' && x.name === layer)) {
      ;(n as TextNode).componentPropertyReferences = { ...(n.componentPropertyReferences || {}), characters: id }
    }
  } catch {
    /* 이미 있거나 대상 없음 */
  }
}

export function addBoolProp(set: ComponentSetNode, prop: string, layer: string, def: boolean) {
  try {
    const id = set.addComponentProperty(prop, 'BOOLEAN', def)
    for (const n of set.findAll((x) => x.name === layer)) {
      n.componentPropertyReferences = { ...(n.componentPropertyReferences || {}), visible: id }
    }
  } catch {
    /* skip */
  }
}

export function addSwapProp(set: ComponentSetNode, prop: string, layer: string, defKey: string) {
  const comp = ICON_COMPONENTS.get(defKey)
  if (!comp) return
  try {
    const id = set.addComponentProperty(prop, 'INSTANCE_SWAP', comp.id)
    for (const n of set.findAll((x) => x.type === 'INSTANCE' && x.name === layer)) {
      ;(n as InstanceNode).componentPropertyReferences = { ...(n.componentPropertyReferences || {}), mainComponent: id }
    }
  } catch {
    /* skip */
  }
}

/**
 * 표시 이름 → setProperties가 요구하는 전체 키('Title#12:3').
 * TEXT·BOOLEAN·INSTANCE_SWAP 속성은 이 전체 키가 있어야 먹는다(베리언트 축만 이름 그대로).
 */
export function propKeys(set: ComponentSetNode): Record<string, string> {
  const map: Record<string, string> = {}
  try {
    for (const key of Object.keys(set.componentPropertyDefinitions)) map[key.split('#')[0]] = key
  } catch {
    /* 세트가 없거나 속성 없음 */
  }
  return map
}

// ── 제네릭 베리언트 세트 빌더 ────────────────────────────────────────
// 세트는 페이지에 만들고(소스), 문서에는 인스턴스를 배치한다
// (오토레이아웃 안에 세트를 직접 배치하면 Figma에서 오작동한다).
export function buildSet(
  ctx: Ctx,
  page: PageNode,
  setName: string,
  axes: Axis[],
  render: (combo: Record<string, string>) => ComponentNode,
  props?: PropSpec,
): ComponentSetNode {
  let combos: Record<string, string>[] = [{}]
  for (const axis of axes) {
    const next: Record<string, string>[] = []
    for (const c of combos) for (const v of axis.values) next.push({ ...c, [axis.name]: v })
    combos = next
  }
  const variants = combos.map((combo) => {
    const comp = render(combo)
    comp.name = axes.map((a) => `${a.name}=${combo[a.name]}`).join(', ')
    page.appendChild(comp)
    return comp
  })
  const set = figma.combineAsVariants(variants, page)
  set.name = setName
  set.layoutMode = 'HORIZONTAL'
  set.layoutWrap = 'WRAP'
  set.itemSpacing = 20
  set.counterAxisSpacing = 20
  set.paddingTop = set.paddingRight = set.paddingBottom = set.paddingLeft = 24
  set.fills = [solid('#FBFCFE')]

  // 속성 만들기: 텍스트·불리언·인스턴스 스왑
  if (props) {
    // TEXT마다 `Show <prop>` 불리언을 자동 생성하지 않는다 — 대응하는 React prop이 없는 "유령 속성"이라
    // 규약 §3(BOOLEAN 이름 = show* prop 이름 그대로)을 기계적으로 위반한다. 텍스트 on/off가 필요하면
    // 코드에 show* prop을 만들고 props.bools에 명시적으로 선언하라.
    // 정본이 한 곳뿐이므로 이 규칙도 이제 한 번만 강제하면 된다.
    props.texts?.forEach((t) => addTextProp(set, t.prop, t.layer, t.def))
    props.bools?.forEach((b) => addBoolProp(set, b.prop, b.layer, b.def))
    props.swaps?.forEach((s) => addSwapProp(set, s.prop, s.layer, s.defKey))
  }
  return set
}

// ── 문서 안 변형 아이템(인스턴스 + 캡션) — **유일한 정본** ───────────────
// 문서 크롬 상수. 캡션은 12px/SUB, 백드롭은 라운드 12·패딩 16 — 세 생성기가 쓰던 값 그대로다.
const CAPTION_SIZE = 12
const BACKDROP_PAD = 16
const BACKDROP_RADIUS = 12

/**
 * 문서 상태의 **표시 이름** 오버라이드 → setProperties가 받는 전체 키/값 타입으로 해석한다.
 *
 * 왜 필요한가: setProperties는 VARIANT 축만 이름 그대로 받고, BOOLEAN·TEXT·INSTANCE_SWAP은
 * 전체 키('showFooter#12:3')를 요구한다(@figma/plugin-typings의 ComponentPropertyDefinitions 참고 —
 * VARIANT 키는 'Size', 나머지는 'IconVisible#0:0' 형식이다).
 * 예전 variantItem은 state.props를 그대로 넘겨서 **축만 먹었다.** 그래서 규약대로 Card의 footer를
 * showFooter BOOLEAN으로, Divider의 label을 TEXT로 내리면 문서에서 그 그림이 통째로 사라졌고,
 * 그 대가로 verify-naming에 면제 3건이 박혀 있었다. 이 함수가 그 결함의 수정본이다.
 *
 * 모르는 이름은 **조용히 버리지 않는다.** 세트를 개명하면 문서가 소리 없이 기본값으로 렌더되는
 * 사고(ProductCard 세일가 소실)와 같은 실패 모드이므로, 아는 이름 목록과 함께 경고로 올린다.
 */
function resolveStateProps(ctx: Ctx, set: ComponentSetNode, state: State): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {}
  let defs: ComponentPropertyDefinitions
  try {
    defs = set.componentPropertyDefinitions
  } catch {
    defs = {} // 세트에 속성이 하나도 없다
  }

  // 표시 이름 → 전체 키. VARIANT는 '#id'가 붙지 않아 split('#')[0]이 곧 자기 자신이다.
  const keyOf: Record<string, string> = {}
  for (const key of Object.keys(defs)) {
    const name = key.split('#')[0]
    // 이름이 겹치면 어느 속성에 붙을지 보장할 수 없다 — 조용히 한쪽을 덮지 말고 알린다.
    if (keyOf[name] && keyOf[name] !== key) {
      ctx.warnings.push(`${set.name}: 속성 이름 '${name}'이 둘 이상이다(${keyOf[name]} · ${key}) — 문서 오버라이드가 어느 쪽에 붙을지 보장되지 않는다.`)
    }
    keyOf[name] = key
  }
  const known = Object.keys(keyOf).sort().join(', ') || '(없음)'

  const assign = (name: string, raw: string, source: string) => {
    const key = keyOf[name]
    if (!key) {
      ctx.warnings.push(`${set.name} · 문서 상태 '${state.caption}': ${source} '${name}'이(가) 세트에 없는 속성이다 — 그 오버라이드는 적용되지 않는다. 세트 속성: ${known}`)
      return
    }
    const type = defs[key].type
    if (type === 'BOOLEAN') {
      // states의 props는 Record<string,string>이라 불리언도 문자열로 온다.
      if (raw !== 'true' && raw !== 'false') {
        ctx.warnings.push(`${set.name} · 문서 상태 '${state.caption}': BOOLEAN 속성 '${name}'에 '${raw}'를 넘겼다 — 'true' 또는 'false'여야 한다.`)
        return
      }
      out[key] = raw === 'true'
    } else if (type === 'INSTANCE_SWAP') {
      const comp = ICON_COMPONENTS.get(raw)
      if (!comp) {
        ctx.warnings.push(`${set.name} · 문서 상태 '${state.caption}': INSTANCE_SWAP '${name}'의 아이콘 키 '${raw}'를 찾을 수 없다.`)
        return
      }
      out[key] = comp.id
    } else {
      // VARIANT · TEXT — 둘 다 문자열 값을 그대로 받는다.
      out[key] = raw
    }
  }

  for (const name of Object.keys(state.props)) assign(name, state.props[name], '속성')
  // texts/swaps는 표시 이름을 담는 별도 통로일 뿐, 실제 타입은 세트 선언이 정한다(위 assign이 판정).
  if (state.texts) for (const name of Object.keys(state.texts)) assign(name, state.texts[name], 'texts')
  if (state.swaps) for (const name of Object.keys(state.swaps)) assign(name, state.swaps[name], 'swaps')
  return out
}

/**
 * 문서에 배치할 변형 하나 — 인스턴스 + 캡션.
 * categories·admin·site가 각자 한 벌씩(3벌) 갖고 있었다. site 판만 propKeys를 쓸 줄 알았고
 * 나머지 둘은 축만 세팅할 수 있었다 — 같은 함수의 사본이 서로 다른 능력을 갖는 전형적인 복제 부채였다.
 */
export function variantItem(ctx: Ctx, set: ComponentSetNode, state: State): FrameNode {
  const item = autoFrame('Variant / ' + state.caption, 'VERTICAL')
  item.counterAxisAlignItems = 'MIN'
  item.itemSpacing = 8
  const inst = set.defaultVariant.createInstance()
  inst.layoutAlign = 'INHERIT'
  inst.layoutGrow = 0

  const props = resolveStateProps(ctx, set, state)
  try {
    inst.setProperties(props)
  } catch {
    ctx.warnings.push(`${set.name} setProperties 실패: ${JSON.stringify(props)}`)
  }

  if (state.backdrop === 'subtle') {
    // 투명 헤더는 스스로 배경이 없어 흰 문서 면 위에서는 '투명함'이 보이지 않는다.
    // 옅은 회색 면을 깔아 배경이 비치는 것을 드러낸다(컴포넌트는 투명 그대로).
    const stage = autoFrame('Stage', 'HORIZONTAL')
    stage.paddingTop = stage.paddingBottom = stage.paddingLeft = stage.paddingRight = BACKDROP_PAD
    stage.cornerRadius = BACKDROP_RADIUS
    fillColor(ctx, stage, 'color/bgSubtle', SURFACE)
    stage.appendChild(inst)
    item.appendChild(stage)
  } else {
    item.appendChild(inst)
  }
  item.appendChild(txt(ctx, state.caption, CAPTION_SIZE, SUB))
  return item
}
