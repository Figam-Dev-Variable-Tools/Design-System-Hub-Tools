// 어드민 폼/목록 조각 2차 세트 — 스토리북 src/ds의 FormSection·FieldRow·ListToolbar 계열을 Figma 베리언트 세트로.
// admin.ts와 같은 machinery(setup/buildSet/makeRoot/makeHeader/makeSection/variantItem)를 쓰되
// admin.ts·categories.ts는 다른 소유자의 파일이라 건드리지 않는다 → 비-export 헬퍼는 이 파일에 복제하고 출처를 표기했다.
// 대상: FormSection · FieldRow · ListToolbar · StatusTabs · RowActions · PageHeaderBar
//
// ON/OFF 규약(오너 확정): 화면의 `show` 키가 Figma에서는 BOOLEAN 컴포넌트 속성 `Show <Key>`로 노출된다.
// 끄면 그 레이어가 사라지고 오토레이아웃이 간격까지 회수한다(빈 자리·여백이 남으면 실패).
import {
  type Ctx,
  solid,
  boundPaint,
  autoFrame,
  txt,
  makeRoot,
  makeHeader,
  makeSection,
  setup,
  applyPageColorMode,
  placeRoot,
  INK,
  SUB,
  MUTED,
  BORDER,
  SURFACE,
  ACCENT,
  WHITE,
} from './foundations'
import { iconInstance } from './icon-vec'
import { solidToneHex, onToneHex, solidVarName, onVarName } from './tone'
import type { PresetName } from '../presets'

// 오너 규칙: 페이지 탭은 "순번. System - 이름".
const PAGE_ADMIN_FORMS = '20. System - Admin Forms'
// reset 대상 등록용 — reset.ts가 이 배열을 함께 삭제해야 재생성이 된다.
export const ADMIN_FORMS_PAGE_NAMES = [PAGE_ADMIN_FORMS]

// 톤 → 폴백 hex(변수 없을 때만 쓰는 리터럴). 출처: admin.ts VARIANT_HEX
const VARIANT_HEX: Record<string, string> = {
  primary: ACCENT,
  secondary: SUB,
  error: '#F04452',
  success: '#00C471',
  warning: '#FF9F0A',
}

// 셰이드 폴백 — color/<tone>/<step> 변수가 없을 때만 쓴다.
// 혼합 비율은 tokens.ts SHADE_STEPS · scripts/build-tokens.mjs와 완전히 동일하다(같은 hex가 나온다).
const STEP_MIX: Record<string, [string, number]> = {
  '50': ['#FFFFFF', 0.9],
  '100': ['#FFFFFF', 0.8],
  '200': ['#FFFFFF', 0.62],
  '300': ['#FFFFFF', 0.44],
  '400': ['#FFFFFF', 0.24],
  '500': ['#FFFFFF', 0],
  '600': ['#000000', 0.12],
  '700': ['#000000', 0.24],
  '800': ['#000000', 0.36],
  '900': ['#000000', 0.48],
}
/** hex를 target 쪽으로 amt(0..1)만큼 혼합. */
function mixHex(hex: string, target: string, amt: number): string {
  const a = parseInt(hex.replace('#', ''), 16)
  const b = parseInt(target.replace('#', ''), 16)
  const ch = (n: number, sh: number) => (n >> sh) & 255
  const mix = (sh: number) => Math.round(ch(a, sh) + (ch(b, sh) - ch(a, sh)) * amt)
  return '#' + ((mix(16) << 16) | (mix(8) << 8) | mix(0)).toString(16).padStart(6, '0').toUpperCase()
}
/** 셰이드 폴백 hex — tokens.ts와 같은 공식. */
function shadeHex(base: string, step: string): string {
  const m = STEP_MIX[step]
  if (!m) return base
  return mixHex(base, m[0], m[1])
}

// ── 색·토큰 바인딩 헬퍼 (출처: admin.ts — 비-export라 동일 구현을 복제) ──
function boundText(ctx: Ctx, chars: string, size: number, varName: string, hex: string, bold = false): TextNode {
  const t = txt(ctx, chars, size, ctx.userColors[varName] ?? hex, bold)
  const v = ctx.vars.get(varName)
  if (v) t.fills = [boundPaint(v)]
  // 오너: 텍스트 크기·굵기·글씨체도 변수로.
  const bind = t as unknown as { setBoundVariable: (field: string, v: Variable) => void }
  const sv = ctx.vars.get('font/size/' + size)
  if (sv) {
    try {
      bind.setBoundVariable('fontSize', sv)
    } catch {
      /* skip */
    }
  }
  const wv = ctx.vars.get(bold ? 'font/weight/bold' : 'font/weight/regular')
  if (wv) {
    try {
      bind.setBoundVariable('fontWeight', wv)
    } catch {
      /* skip */
    }
  }
  // ctx.fontFamilyVar가 null이면 절대 바인딩하지 않는다(미로드 폰트 바인딩 = 노드 생성 실패).
  if (ctx.fontFamilyVar) {
    try {
      bind.setBoundVariable('fontFamily', ctx.fontFamilyVar)
    } catch {
      /* skip */
    }
  }
  return t
}
function bindFillVar(ctx: Ctx, node: GeometryMixin, varName: string, hex: string) {
  const v = ctx.vars.get(varName)
  node.fills = [v ? boundPaint(v) : solid(ctx.userColors[varName] ?? hex)]
}
function bindStrokeVar(ctx: Ctx, node: MinimalStrokesMixin, varName: string, hex: string) {
  const v = ctx.vars.get(varName)
  node.strokes = [v ? boundPaint(v) : solid(ctx.userColors[varName] ?? hex)]
}

// ── solid 면 · on-color · 셰이드 바인딩 (출처: admin.ts — 같은 규칙) ──
// 오너 확정: solid 면(버튼/채움)은 color/solid-<tone> + 글자 color/on-<tone>.
//            흰 배경 위 톤 텍스트는 -600/-700 셰이드(AA).
/** 톤의 base hex — 사용자가 고른 색 > 프리셋 폴백. 변수가 없을 때만 쓰인다. */
function toneBase(ctx: Ctx, tone: string): string {
  return ctx.userColors['color/' + tone] || VARIANT_HEX[tone] || ACCENT
}
/** solid 면 fill — color/solid-<tone> 바인딩(없으면 같은 공식으로 계산한 hex). */
function bindSolidFill(ctx: Ctx, node: GeometryMixin, tone: string) {
  bindFillVar(ctx, node, solidVarName(tone), solidToneHex(toneBase(ctx, tone)))
}
/** solid 면 위 도형(노브 등) fill — color/on-<tone> 바인딩. */
function bindOnFill(ctx: Ctx, node: GeometryMixin, tone: string) {
  bindFillVar(ctx, node, onVarName(tone), onToneHex(toneBase(ctx, tone)))
}
/** solid 면 위 전경 hex(폴백). */
function onHex(ctx: Ctx, tone: string): string {
  return onToneHex(toneBase(ctx, tone))
}
/** 톤 셰이드 fill — color/<tone>/<step> 바인딩(soft 배경용). */
function bindShadeFill(ctx: Ctx, node: GeometryMixin, tone: string, step: string) {
  bindFillVar(ctx, node, `color/${tone}/${step}`, shadeHex(toneBase(ctx, tone), step))
}
/** 흰 배경 위 톤 텍스트 — color/<tone>/<step>(-600/-700이 AA). */
function shadeText(ctx: Ctx, chars: string, size: number, tone: string, step: string, bold = false): TextNode {
  return boundText(ctx, chars, size, `color/${tone}/${step}`, shadeHex(toneBase(ctx, tone), step), bold)
}
/** 보더·패딩·라운드·불투명도를 값이 맞는 변수에 후처리 바인딩. 출처: admin.ts bindTokens */
function bindTokens(ctx: Ctx, root: SceneNode) {
  const all: SceneNode[] = [root]
  const rf = root as unknown as { findAll?: (cb: (n: SceneNode) => boolean) => SceneNode[] }
  if (typeof rf.findAll === 'function') all.push(...rf.findAll(() => true))
  for (const node of all) {
    const a = node as unknown as {
      cornerRadius?: number | symbol
      strokeWeight?: number | symbol
      strokes?: readonly Paint[]
      layoutMode?: string
      paddingTop?: number
      paddingRight?: number
      paddingBottom?: number
      paddingLeft?: number
      itemSpacing?: number
      opacity?: number
      setBoundVariable: (field: string, v: Variable) => void
    }
    if (typeof a.opacity === 'number' && a.opacity > 0 && a.opacity < 1) {
      const ov = ctx.vars.get('opacity/' + Math.round(a.opacity * 100))
      if (ov)
        try {
          a.setBoundVariable('opacity', ov)
        } catch {
          /* skip */
        }
    }
    if (typeof a.cornerRadius === 'number' && a.cornerRadius > 0) {
      const rv = ctx.vars.get('radius/' + a.cornerRadius)
      if (rv)
        for (const c of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) {
          try {
            a.setBoundVariable(c, rv)
          } catch {
            /* skip */
          }
        }
    }
    if (typeof a.strokeWeight === 'number' && a.strokeWeight > 0 && a.strokes && a.strokes.length) {
      const bv = ctx.vars.get('border/' + a.strokeWeight)
      if (bv)
        try {
          a.setBoundVariable('strokeWeight', bv)
        } catch {
          /* skip */
        }
    }
    if (a.layoutMode && a.layoutMode !== 'NONE') {
      for (const p of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing'] as const) {
        const val = a[p]
        if (typeof val === 'number' && val > 0) {
          const sv = ctx.vars.get('space/' + val)
          if (sv)
            try {
              a.setBoundVariable(p, sv)
            } catch {
              /* skip */
            }
        }
      }
    }
  }
}
/** 인스턴스 안 VECTOR의 stroke를 덮어써 아이콘 색을 맞춘다. 출처: admin.ts recolorIcon */
function recolorIcon(node: SceneNode, hex: string) {
  const f = node as unknown as { findAll?: (cb: (n: SceneNode) => boolean) => SceneNode[] }
  if (typeof f.findAll !== 'function') return
  for (const v of f.findAll((n) => n.type === 'VECTOR')) (v as VectorNode).strokes = [solid(hex)]
}
/** 아이콘 색을 변수에 바인딩(없으면 hex) — 글자와 같은 색 토큰을 따라간다. */
function recolorIconVar(ctx: Ctx, node: SceneNode, varName: string, hex: string) {
  const f = node as unknown as { findAll?: (cb: (n: SceneNode) => boolean) => SceneNode[] }
  if (typeof f.findAll !== 'function') return
  const vv = ctx.vars.get(varName)
  const paint = vv ? boundPaint(vv) : solid(ctx.userColors[varName] ?? hex)
  for (const v of f.findAll((n) => n.type === 'VECTOR')) (v as VectorNode).strokes = [paint]
}
/** 크기 고정 프레임. 출처: admin.ts fixedFrame */
function fixedFrame(name: string, dir: 'HORIZONTAL' | 'VERTICAL', w: number, h: number): FrameNode {
  const f = figma.createFrame()
  f.name = name
  f.layoutMode = dir
  f.primaryAxisSizingMode = 'FIXED'
  f.counterAxisSizingMode = 'FIXED'
  f.resize(w, h)
  f.fills = []
  return f
}
/** 색 지정 아이콘 인스턴스(리터럴 hex). */
function icon(key: string, name: string, size: number, hex: string): SceneNode {
  const ic = iconInstance(key, name, size)
  recolorIcon(ic, hex)
  return ic
}
/** 톤 셰이드에 바인딩된 아이콘 인스턴스 — 옆 글자와 같은 색 토큰. */
function iconShade(ctx: Ctx, key: string, name: string, size: number, tone: string, step: string): SceneNode {
  const ic = iconInstance(key, name, size)
  recolorIconVar(ctx, ic, `color/${tone}/${step}`, shadeHex(toneBase(ctx, tone), step))
  return ic
}

// ── 컴포넌트 속성 헬퍼 (출처: admin.ts) ──────────────────────────────
// 레이어 name과 layer가 정확히 같아야 붙는다. 실패는 조용히 무시된다.
function addTextProp(set: ComponentSetNode, prop: string, layer: string, def: string) {
  try {
    const id = set.addComponentProperty(prop, 'TEXT', def)
    for (const n of set.findAll((x) => x.type === 'TEXT' && x.name === layer)) {
      ;(n as TextNode).componentPropertyReferences = { ...(n.componentPropertyReferences || {}), characters: id }
    }
  } catch {
    /* 이미 있거나 대상 없음 */
  }
}
function addBoolProp(set: ComponentSetNode, prop: string, layer: string, def: boolean) {
  try {
    const id = set.addComponentProperty(prop, 'BOOLEAN', def)
    for (const n of set.findAll((x) => x.name === layer)) {
      n.componentPropertyReferences = { ...(n.componentPropertyReferences || {}), visible: id }
    }
  } catch {
    /* skip */
  }
}

// ── 제네릭 베리언트 세트 빌더 (출처: admin.ts buildSet) ──────────────
type Axis = { name: string; values: string[] }
type State = { caption: string; props: Record<string, string> }
// texts는 기본적으로 `Show <prop>` 토글을 자동 생성한다(admin.ts와 동일).
// 단, 규약이 정한 BOOLEAN 이름(`Show Description` 등)을 bools에서 직접 소유해야 하는 레이어는
// show:false로 자동 생성을 끈다 — 같은 레이어의 visible 참조를 두 속성이 다투면 하나가 죽는다.
type PropSpec = {
  texts?: Array<{ prop: string; layer: string; def: string; show?: boolean }>
  bools?: Array<{ prop: string; layer: string; def: boolean }>
}
type ComponentDoc = {
  key: string
  setName: string
  eyebrow: string
  desc: string
  build: (ctx: Ctx, page: PageNode) => ComponentSetNode
  states: State[]
}
type CategoryDef = { pageName: string; title: string; subtitle: string; docs: ComponentDoc[] }

// 세트는 페이지에 만들고(소스), 문서에는 인스턴스를 배치한다.
function buildSet(
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

  if (props) {
    props.texts?.forEach((t) => {
      addTextProp(set, t.prop, t.layer, t.def)
      if (t.show !== false) addBoolProp(set, `Show ${t.prop}`, t.layer, true) // 텍스트 on/off 토글
    })
    props.bools?.forEach((b) => addBoolProp(set, b.prop, b.layer, b.def))
  }
  return set
}

// ── 문서 안 변형 아이템(인스턴스 + 캡션). 출처: admin.ts variantItem ──
function variantItem(ctx: Ctx, set: ComponentSetNode, state: State): FrameNode {
  const item = autoFrame('Variant / ' + state.caption, 'VERTICAL')
  item.counterAxisAlignItems = 'MIN'
  item.itemSpacing = 8
  const inst = set.defaultVariant.createInstance()
  inst.layoutAlign = 'INHERIT'
  inst.layoutGrow = 0
  try {
    inst.setProperties(state.props)
  } catch {
    ctx.warnings.push(`${set.name} setProperties 실패: ${JSON.stringify(state.props)}`)
  }
  item.appendChild(inst)
  item.appendChild(txt(ctx, state.caption, 12, SUB))
  return item
}

// ══ 공용 조각(atoms) ═════════════════════════════════════════════════
/** 1px 구분선 — 부모 오토레이아웃 가로폭을 채운다. */
function divider(ctx: Ctx, name = 'Divider'): RectangleNode {
  const r = figma.createRectangle()
  r.name = name
  r.resize(200, 1)
  r.layoutAlign = 'STRETCH'
  bindFillVar(ctx, r, 'color/border', BORDER)
  return r
}

/** 흰 배경 입력 박스 — 부모 폭을 채우고 높이는 패딩으로 잡는다(고정 resize 없이). */
function inputBox(ctx: Ctx, placeholder: string, layer: string, invalid = false): FrameNode {
  const f = autoFrame(layer + ' Box', 'HORIZONTAL')
  f.layoutAlign = 'STRETCH'
  f.counterAxisAlignItems = 'CENTER'
  f.itemSpacing = 6
  f.paddingTop = f.paddingBottom = 10
  f.paddingLeft = f.paddingRight = 12
  f.cornerRadius = 8
  bindFillVar(ctx, f, 'color/bg', WHITE)
  // 에러는 테두리만 error 톤으로(면은 흰색 유지 — 라이트 테마 대비 확보)
  if (invalid) bindStrokeVar(ctx, f, 'color/error', VARIANT_HEX.error)
  else bindStrokeVar(ctx, f, 'color/border', BORDER)
  f.strokeWeight = 1
  f.strokeAlign = 'INSIDE'
  const t = boundText(ctx, placeholder, 13, 'color/secondary/400', shadeHex(toneBase(ctx, 'secondary'), '400'))
  t.name = layer
  t.layoutGrow = 1 // 텍스트 오버플로 금지 — 남는 폭을 먹고 잘린다
  f.appendChild(t)
  return f
}

/** 작은 토글 스위치(섹션 ON/OFF). 켜짐 = solid 면 + on-color 노브. */
function toggleSw(ctx: Ctx, on: boolean, name = 'Toggle'): FrameNode {
  const track = fixedFrame(name, 'HORIZONTAL', 36, 20)
  track.primaryAxisAlignItems = on ? 'MAX' : 'MIN'
  track.counterAxisAlignItems = 'CENTER'
  track.paddingLeft = track.paddingRight = 2
  track.cornerRadius = 999
  if (on) bindSolidFill(ctx, track, 'primary')
  else bindFillVar(ctx, track, 'color/border', BORDER)
  const knob = figma.createEllipse()
  knob.name = 'Knob'
  knob.resize(16, 16)
  if (on) bindOnFill(ctx, knob, 'primary')
  else bindFillVar(ctx, knob, 'color/bg', WHITE)
  track.appendChild(knob)
  return track
}

type BtnKind = 'primary' | 'outline'
/** 버튼 — solid(primary) · outline. 라벨 레이어 이름을 지정해 텍스트 속성에 연결. */
function btn(ctx: Ctx, label: string, kind: BtnKind, layer: string): FrameNode {
  const b = autoFrame(layer.replace(' Label', '') + ' Button', 'HORIZONTAL')
  b.counterAxisAlignItems = 'CENTER'
  b.itemSpacing = 6
  b.paddingTop = b.paddingBottom = 10
  b.paddingLeft = b.paddingRight = 16
  b.cornerRadius = 8
  let fgVar: string
  let fgHex: string
  if (kind === 'primary') {
    // solid 면 = color/solid-primary · 글자 = color/on-primary
    bindSolidFill(ctx, b, 'primary')
    fgVar = onVarName('primary')
    fgHex = onHex(ctx, 'primary')
  } else {
    bindFillVar(ctx, b, 'color/bg', WHITE)
    bindStrokeVar(ctx, b, 'color/border', BORDER)
    b.strokeWeight = 1
    b.strokeAlign = 'INSIDE'
    fgVar = 'color/text'
    fgHex = INK
  }
  const t = boundText(ctx, label, 14, fgVar, fgHex, true)
  t.name = layer
  b.appendChild(t)
  return b
}

/** soft 톤 pill(배지·카운트) — 배경 -100 / 글자 -700(AA). */
function softPill(ctx: Ctx, label: string, tone: string, layer: string, size = 11): FrameNode {
  const p = autoFrame(layer + ' Pill', 'HORIZONTAL')
  p.counterAxisAlignItems = 'CENTER'
  p.paddingTop = p.paddingBottom = 2
  p.paddingLeft = p.paddingRight = 7
  p.cornerRadius = 999
  bindShadeFill(ctx, p, tone, '100')
  const t = shadeText(ctx, label, size, tone, '700', true)
  t.name = layer
  p.appendChild(t)
  return p
}

/** 중립 pill — bgSubtle 면 + secondary 글자(비활성 탭 카운트). */
function mutedPill(ctx: Ctx, label: string, layer: string): FrameNode {
  const p = autoFrame(layer + ' Pill', 'HORIZONTAL')
  p.counterAxisAlignItems = 'CENTER'
  p.paddingTop = p.paddingBottom = 2
  p.paddingLeft = p.paddingRight = 7
  p.cornerRadius = 999
  bindFillVar(ctx, p, 'color/bgSubtle', SURFACE)
  const t = boundText(ctx, label, 11, 'color/secondary', SUB, true)
  t.name = layer
  p.appendChild(t)
  return p
}

// ══ DS/FormSection ═══════════════════════════════════════════════════
// 축: toggleable(false|true) × enabled(true|false) — 이름으로만 읽는다.
// BOOLEAN: Show Description · Show Toggle
function renderFormSection(ctx: Ctx, combo: Record<string, string>): ComponentNode {
  const toggleable = combo.toggleable === 'true'
  const enabled = combo.enabled !== 'false' // 기본 true

  const c = figma.createComponent()
  c.layoutMode = 'VERTICAL'
  // resize가 오토레이아웃 sizing mode를 FIXED로 뒤집을 수 있다 → 폭만 잡고 sizing mode를 '나중에' 못박는다.
  // (자식은 이 뒤에 붙으므로 hug 높이가 빈 상태로 굳으면 안 된다.)
  c.resize(720, 1)
  c.primaryAxisSizingMode = 'AUTO' // 높이 hug
  c.counterAxisSizingMode = 'FIXED' // 폭 720 고정
  c.itemSpacing = 0
  c.cornerRadius = 12
  c.clipsContent = true
  bindFillVar(ctx, c, 'color/bg', WHITE)
  bindStrokeVar(ctx, c, 'color/border', BORDER)
  c.strokeWeight = 1
  c.strokeAlign = 'INSIDE'

  // ── 헤더: 번호 · 제목 · 설명 (+ 우측 토글 밴드) ──
  const head = autoFrame('Head', 'HORIZONTAL')
  head.layoutAlign = 'STRETCH'
  head.counterAxisAlignItems = 'CENTER'
  head.itemSpacing = 12
  head.paddingTop = head.paddingBottom = 16
  head.paddingLeft = head.paddingRight = 20

  const headText = autoFrame('Head Text', 'VERTICAL')
  headText.layoutGrow = 1 // min-width:0 — 남는 폭을 먹고 토글 밴드를 밀어내지 않는다
  headText.counterAxisAlignItems = 'MIN'
  headText.itemSpacing = 4

  const titleRow = autoFrame('Title Row', 'HORIZONTAL')
  titleRow.counterAxisAlignItems = 'CENTER'
  titleRow.itemSpacing = 8
  const num = fixedFrame('Number Badge', 'HORIZONTAL', 22, 22)
  num.primaryAxisAlignItems = 'CENTER'
  num.counterAxisAlignItems = 'CENTER'
  num.cornerRadius = 999
  bindShadeFill(ctx, num, 'primary', '100')
  const numT = shadeText(ctx, '01', 11, 'primary', '700', true)
  numT.name = 'Number'
  num.appendChild(numT)
  titleRow.appendChild(num)
  const title = boundText(ctx, '기본 정보', 15, 'color/text', INK, true)
  title.name = 'Title'
  titleRow.appendChild(title)
  headText.appendChild(titleRow)

  const desc = boundText(ctx, '회원에게 노출되는 기본 정보입니다.', 12, 'color/secondary', SUB)
  desc.name = 'Description' // BOOLEAN `Show Description`
  headText.appendChild(desc)
  head.appendChild(headText)

  // 토글 밴드 — toggleable 축이 true인 변형에만 존재한다(축이 없는 변형엔 레이어 자체가 없어야 빈 자리가 안 남는다).
  if (toggleable) {
    const band = autoFrame('Toggle Band', 'HORIZONTAL') // BOOLEAN `Show Toggle`
    band.counterAxisAlignItems = 'CENTER'
    band.itemSpacing = 8
    band.paddingTop = band.paddingBottom = 6
    band.paddingLeft = band.paddingRight = 10
    band.cornerRadius = 999
    bindFillVar(ctx, band, 'color/bgSubtle', SURFACE)
    const tl = enabled
      ? shadeText(ctx, '사용 ON', 12, 'primary', '700', true)
      : boundText(ctx, '사용 OFF', 12, 'color/secondary', SUB, true)
    tl.name = 'Toggle Label'
    band.appendChild(tl)
    band.appendChild(toggleSw(ctx, enabled))
    head.appendChild(band)
  }
  c.appendChild(head)
  c.appendChild(divider(ctx))

  // ── 본문 슬롯 — enabled=false면 눌러서(45%) 꺼진 섹션임을 보여준다 ──
  const body = autoFrame('Body Slot', 'VERTICAL')
  body.layoutAlign = 'STRETCH'
  body.counterAxisAlignItems = 'MIN'
  body.itemSpacing = 14
  body.paddingTop = body.paddingBottom = 20
  body.paddingLeft = body.paddingRight = 20
  if (!enabled) body.opacity = 0.45 // opacity/45 변수에 후처리 바인딩
  const slotFields: Array<[string, string]> = [
    ['이름', '홍길동'],
    ['연락처', '010-0000-0000'],
  ]
  for (const [label, ph] of slotFields) {
    const f = autoFrame('Slot Field', 'VERTICAL')
    f.layoutAlign = 'STRETCH'
    f.counterAxisAlignItems = 'MIN'
    f.itemSpacing = 6
    f.appendChild(boundText(ctx, label, 12, 'color/text', INK, true))
    f.appendChild(inputBox(ctx, ph, 'Slot ' + label))
    body.appendChild(f)
  }
  c.appendChild(body)
  return c
}

// ══ DS/FieldRow ══════════════════════════════════════════════════════
// 축: state(default|description|error) × required(false|true) — 이름으로만 읽는다.
function renderFieldRow(ctx: Ctx, combo: Record<string, string>): ComponentNode {
  const state = combo.state || 'default'
  const required = combo.required === 'true'
  const invalid = state === 'error'

  const c = figma.createComponent()
  c.layoutMode = 'HORIZONTAL'
  c.resize(640, 1)
  c.primaryAxisSizingMode = 'FIXED' // 폭 640 고정
  c.counterAxisSizingMode = 'AUTO' // 높이 hug
  c.counterAxisAlignItems = 'MIN'
  c.itemSpacing = 16
  c.paddingTop = c.paddingBottom = 12
  c.fills = []

  // 라벨 열 — 고정 120px(폼 정렬 축)
  const labelCol = fixedFrame('Label Col', 'HORIZONTAL', 120, 38)
  labelCol.counterAxisAlignItems = 'CENTER'
  labelCol.itemSpacing = 2
  const label = boundText(ctx, '이메일', 13, 'color/text', INK, true)
  label.name = 'Label'
  labelCol.appendChild(label)
  if (required) {
    const star = shadeText(ctx, '*', 13, 'error', '700', true)
    star.name = 'Required Mark'
    labelCol.appendChild(star)
  }
  c.appendChild(labelCol)

  // 컨트롤 열 — 남는 폭 전부
  const ctrl = autoFrame('Control', 'VERTICAL')
  ctrl.layoutGrow = 1
  ctrl.counterAxisAlignItems = 'MIN'
  ctrl.itemSpacing = 6
  ctrl.appendChild(inputBox(ctx, 'name@example.com', 'Placeholder', invalid))

  if (state === 'description') {
    const d = boundText(ctx, '로그인 아이디로 사용됩니다.', 12, 'color/secondary', SUB)
    d.name = 'Description'
    ctrl.appendChild(d)
  }
  if (invalid) {
    const row = autoFrame('Error Row', 'HORIZONTAL')
    row.counterAxisAlignItems = 'CENTER'
    row.itemSpacing = 4
    row.appendChild(iconShade(ctx, '_Icon/AlertCircle', 'Error Icon', 13, 'error', '700'))
    const e = shadeText(ctx, '이메일 형식이 올바르지 않습니다.', 12, 'error', '700')
    e.name = 'Error'
    row.appendChild(e)
    ctrl.appendChild(row)
  }
  c.appendChild(ctrl)
  return c
}

// ══ DS/ListToolbar ═══════════════════════════════════════════════════
// 축: state(default). BOOLEAN: Show Filter · Show Sort · Show Total
function renderListToolbar(ctx: Ctx, _combo: Record<string, string>): ComponentNode {
  const c = figma.createComponent()
  c.layoutMode = 'HORIZONTAL'
  c.resize(880, 1)
  c.primaryAxisSizingMode = 'FIXED' // 폭 880 고정
  c.counterAxisSizingMode = 'AUTO' // 높이 hug
  c.counterAxisAlignItems = 'CENTER'
  c.itemSpacing = 8
  c.paddingTop = c.paddingBottom = 12
  c.paddingLeft = c.paddingRight = 14
  c.cornerRadius = 12
  bindFillVar(ctx, c, 'color/bg', WHITE)
  bindStrokeVar(ctx, c, 'color/border', BORDER)
  c.strokeWeight = 1
  c.strokeAlign = 'INSIDE'

  // 전체 건수 — BOOLEAN `Show Total`
  const total = boundText(ctx, '전체 128건', 13, 'color/text', INK, true)
  total.name = 'Total'
  c.appendChild(total)

  // 검색 — 남는 폭 전부
  const search = autoFrame('Search', 'HORIZONTAL')
  search.layoutGrow = 1
  search.counterAxisAlignItems = 'CENTER'
  search.itemSpacing = 6
  search.paddingTop = search.paddingBottom = 8
  search.paddingLeft = search.paddingRight = 12
  search.cornerRadius = 8
  bindFillVar(ctx, search, 'color/bgSubtle', SURFACE)
  bindStrokeVar(ctx, search, 'color/border', BORDER)
  search.strokeWeight = 1
  search.strokeAlign = 'INSIDE'
  search.appendChild(icon('_Icon/Search', 'Search Icon', 15, MUTED))
  const sp = boundText(ctx, '검색어를 입력하세요', 13, 'color/secondary/400', shadeHex(toneBase(ctx, 'secondary'), '400'))
  sp.name = 'Search Placeholder'
  sp.layoutGrow = 1
  search.appendChild(sp)
  c.appendChild(search)

  // 필터 — BOOLEAN `Show Filter`
  const filter = autoFrame('Filter', 'HORIZONTAL')
  filter.counterAxisAlignItems = 'CENTER'
  filter.itemSpacing = 6
  filter.paddingTop = filter.paddingBottom = 8
  filter.paddingLeft = filter.paddingRight = 12
  filter.cornerRadius = 8
  bindFillVar(ctx, filter, 'color/bg', WHITE)
  bindStrokeVar(ctx, filter, 'color/border', BORDER)
  filter.strokeWeight = 1
  filter.strokeAlign = 'INSIDE'
  filter.appendChild(icon('_Icon/Filter', 'Filter Icon', 15, SUB))
  const fl = boundText(ctx, '필터', 13, 'color/text', INK, true)
  fl.name = 'Filter Label'
  filter.appendChild(fl)
  c.appendChild(filter)

  // 정렬 — BOOLEAN `Show Sort`
  const sort = autoFrame('Sort', 'HORIZONTAL')
  sort.counterAxisAlignItems = 'CENTER'
  sort.itemSpacing = 6
  sort.paddingTop = sort.paddingBottom = 8
  sort.paddingLeft = sort.paddingRight = 12
  sort.cornerRadius = 8
  bindFillVar(ctx, sort, 'color/bg', WHITE)
  bindStrokeVar(ctx, sort, 'color/border', BORDER)
  sort.strokeWeight = 1
  sort.strokeAlign = 'INSIDE'
  sort.appendChild(icon('_Icon/ArrowUpDown', 'Sort Icon', 15, SUB))
  const sl = boundText(ctx, '최신순', 13, 'color/text', INK, true)
  sl.name = 'Sort Label'
  sort.appendChild(sl)
  sort.appendChild(icon('_Icon/ChevronDown', 'Sort Caret', 14, MUTED))
  c.appendChild(sort)

  return c
}

// ══ DS/StatusTabs ════════════════════════════════════════════════════
// 축: count(2|3|4) — 이름으로만 읽는다. 첫 탭이 활성.
const TABS: Array<[string, string]> = [
  ['전체', '128'],
  ['대기', '12'],
  ['처리중', '5'],
  ['완료', '111'],
]
function renderStatusTabs(ctx: Ctx, combo: Record<string, string>): ComponentNode {
  const count = parseInt(combo.count || '2', 10)

  const c = figma.createComponent()
  c.layoutMode = 'VERTICAL'
  c.resize(640, 1)
  c.primaryAxisSizingMode = 'AUTO' // 높이 hug
  c.counterAxisSizingMode = 'FIXED' // 폭 640 고정
  c.itemSpacing = 0
  c.fills = []

  const row = autoFrame('Tabs Row', 'HORIZONTAL')
  row.layoutAlign = 'STRETCH'
  row.counterAxisAlignItems = 'MAX'
  row.itemSpacing = 20
  row.paddingLeft = 4

  for (let i = 0; i < count; i++) {
    const [label, cnt] = TABS[i]
    const active = i === 0
    const tab = autoFrame('Tab ' + (i + 1), 'VERTICAL')
    tab.counterAxisAlignItems = 'CENTER'
    tab.itemSpacing = 8

    const line = autoFrame('Tab Line', 'HORIZONTAL')
    line.counterAxisAlignItems = 'CENTER'
    line.itemSpacing = 6
    const lt = active
      ? shadeText(ctx, label, 14, 'primary', '700', true)
      : boundText(ctx, label, 14, 'color/secondary', SUB)
    lt.name = `Tab ${i + 1} Label`
    line.appendChild(lt)
    line.appendChild(
      active ? softPill(ctx, cnt, 'primary', `Tab ${i + 1} Count`) : mutedPill(ctx, cnt, `Tab ${i + 1} Count`),
    )
    tab.appendChild(line)

    // 활성 밑줄 — 비활성은 자리만 차지(색 없음)해서 글자가 위아래로 흔들리지 않는다.
    const under = figma.createRectangle()
    under.name = 'Underline'
    under.resize(40, 2)
    under.layoutAlign = 'STRETCH'
    if (active) bindFillVar(ctx, under, 'color/primary', ACCENT)
    else under.fills = []
    tab.appendChild(under)
    row.appendChild(tab)
  }
  c.appendChild(row)
  c.appendChild(divider(ctx, 'Base Line'))
  return c
}

// ══ DS/RowActions ════════════════════════════════════════════════════
// 축: variant(view-edit-delete | edit-delete | view-delete) — 이름으로만 읽는다.
const ACTION_DEF: Record<string, { key: string; label: string; layer: string; danger?: boolean }> = {
  view: { key: '_Icon/Eye', label: '보기', layer: 'View' },
  edit: { key: '_Icon/Edit', label: '수정', layer: 'Edit' },
  delete: { key: '_Icon/Trash2', label: '삭제', layer: 'Delete', danger: true },
}
function renderRowActions(ctx: Ctx, combo: Record<string, string>): ComponentNode {
  const variant = combo.variant || 'view-edit-delete'

  const c = figma.createComponent()
  c.layoutMode = 'HORIZONTAL'
  c.primaryAxisSizingMode = 'AUTO'
  c.counterAxisSizingMode = 'AUTO'
  c.counterAxisAlignItems = 'CENTER'
  c.itemSpacing = 6
  c.fills = []

  for (const part of variant.split('-')) {
    const def = ACTION_DEF[part]
    if (!def) continue
    const b = autoFrame(def.layer, 'HORIZONTAL')
    b.counterAxisAlignItems = 'CENTER'
    b.itemSpacing = 4
    b.paddingTop = b.paddingBottom = 6
    b.paddingLeft = b.paddingRight = 10
    b.cornerRadius = 6
    bindFillVar(ctx, b, 'color/bg', WHITE)
    // 삭제만 error 톤 테두리·글자(-700 = 흰 배경 위 AA), 나머지는 중립
    if (def.danger) bindStrokeVar(ctx, b, 'color/error/300', shadeHex(toneBase(ctx, 'error'), '300'))
    else bindStrokeVar(ctx, b, 'color/border', BORDER)
    b.strokeWeight = 1
    b.strokeAlign = 'INSIDE'
    b.appendChild(
      def.danger
        ? iconShade(ctx, def.key, def.layer + ' Icon', 14, 'error', '700')
        : icon(def.key, def.layer + ' Icon', 14, SUB),
    )
    const t = def.danger
      ? shadeText(ctx, def.label, 12, 'error', '700', true)
      : boundText(ctx, def.label, 12, 'color/text', INK, true)
    t.name = def.layer + ' Label'
    b.appendChild(t)
    c.appendChild(b)
  }
  return c
}

// ══ DS/PageHeaderBar ═════════════════════════════════════════════════
// 축: hasBadge(false|true) — 이름으로만 읽는다. BOOLEAN: Show Description · Show Actions
function renderPageHeaderBar(ctx: Ctx, combo: Record<string, string>): ComponentNode {
  const hasBadge = combo.hasBadge === 'true'

  const c = figma.createComponent()
  c.layoutMode = 'VERTICAL'
  c.resize(960, 1)
  c.primaryAxisSizingMode = 'AUTO' // 높이 hug
  c.counterAxisSizingMode = 'FIXED' // 폭 960 고정
  c.itemSpacing = 0
  bindFillVar(ctx, c, 'color/bg', WHITE)

  const bar = autoFrame('Bar', 'HORIZONTAL')
  bar.layoutAlign = 'STRETCH'
  bar.counterAxisAlignItems = 'CENTER'
  bar.itemSpacing = 16
  bar.paddingTop = bar.paddingBottom = 20
  bar.paddingLeft = bar.paddingRight = 24

  const left = autoFrame('Head Text', 'VERTICAL')
  left.layoutGrow = 1 // min-width:0 — 액션 버튼을 밀어내지 않는다
  left.counterAxisAlignItems = 'MIN'
  left.itemSpacing = 6

  const titleRow = autoFrame('Title Row', 'HORIZONTAL')
  titleRow.counterAxisAlignItems = 'CENTER'
  titleRow.itemSpacing = 8
  const title = boundText(ctx, '회원 관리', 20, 'color/text', INK, true)
  title.name = 'Title'
  titleRow.appendChild(title)
  if (hasBadge) {
    const badge = softPill(ctx, '운영중', 'primary', 'Badge Label', 11)
    badge.name = 'Badge'
    titleRow.appendChild(badge)
  }
  left.appendChild(titleRow)

  const desc = boundText(ctx, '가입 회원을 조회하고 상태를 변경합니다.', 13, 'color/secondary', SUB)
  desc.name = 'Description' // BOOLEAN `Show Description`
  left.appendChild(desc)
  bar.appendChild(left)

  const actions = autoFrame('Actions', 'HORIZONTAL') // BOOLEAN `Show Actions`
  actions.counterAxisAlignItems = 'CENTER'
  actions.itemSpacing = 8
  actions.appendChild(btn(ctx, '취소', 'outline', 'Cancel Label'))
  actions.appendChild(btn(ctx, '저장', 'primary', 'Save Label'))
  bar.appendChild(actions)

  c.appendChild(bar)
  c.appendChild(divider(ctx, 'Bottom Line'))
  return c
}

// ── 카테고리 정의 ────────────────────────────────────────────────────
const ADMIN_FORMS_CATEGORY: CategoryDef = {
  pageName: PAGE_ADMIN_FORMS,
  title: 'Admin Forms',
  subtitle:
    '어드민 폼·목록의 반복 조각. 모든 세트는 `show` 규약을 BOOLEAN 속성(Show …)으로 노출한다 — 끄면 레이어가 사라지고 오토레이아웃이 여백까지 회수한다.',
  docs: [
    {
      key: 'FormSection',
      setName: 'DS/FormSection',
      eyebrow: 'ORGANISM · ADMIN',
      desc: '번호·제목·설명 + (선택) 토글 밴드 + 본문 슬롯. toggleable=true일 때만 헤더 우측에 ON/OFF 토글이 붙고, enabled=false면 본문이 눌립니다(45%).',
      build: (ctx, page) =>
        buildSet(
          ctx,
          page,
          'DS/FormSection',
          [
            { name: 'toggleable', values: ['false', 'true'] },
            { name: 'enabled', values: ['true', 'false'] },
          ],
          (c) => renderFormSection(ctx, c),
          {
            texts: [
              { prop: 'Number', layer: 'Number', def: '01' },
              { prop: 'Title', layer: 'Title', def: '기본 정보' },
              { prop: 'Description', layer: 'Description', def: '회원에게 노출되는 기본 정보입니다.', show: false },
              { prop: 'Toggle Label', layer: 'Toggle Label', def: '사용 ON', show: false },
            ],
            bools: [
              { prop: 'Show Description', layer: 'Description', def: true },
              { prop: 'Show Toggle', layer: 'Toggle Band', def: true },
            ],
          },
        ),
      states: [
        { caption: '토글 없음 · 기본', props: {} },
        { caption: '토글 ON (사용)', props: { toggleable: 'true', enabled: 'true' } },
        { caption: '토글 OFF (미사용)', props: { toggleable: 'true', enabled: 'false' } },
      ],
    },
    {
      key: 'FieldRow',
      setName: 'DS/FieldRow',
      eyebrow: 'MOLECULE · ADMIN',
      desc: '폼 한 줄 — 고정 120px 라벨 + 컨트롤. required면 error 톤 별표, state=description은 도움말, state=error는 테두리·문구가 error 톤(-700, 흰 배경 위 AA).',
      build: (ctx, page) =>
        buildSet(
          ctx,
          page,
          'DS/FieldRow',
          [
            { name: 'state', values: ['default', 'description', 'error'] },
            { name: 'required', values: ['false', 'true'] },
          ],
          (c) => renderFieldRow(ctx, c),
          {
            texts: [
              { prop: 'Label', layer: 'Label', def: '이메일' },
              { prop: 'Placeholder', layer: 'Placeholder', def: 'name@example.com' },
              { prop: 'Description', layer: 'Description', def: '로그인 아이디로 사용됩니다.' },
              { prop: 'Error', layer: 'Error', def: '이메일 형식이 올바르지 않습니다.' },
            ],
          },
        ),
      states: [
        { caption: '기본', props: {} },
        { caption: '필수', props: { required: 'true' } },
        { caption: '도움말', props: { state: 'description' } },
        { caption: '에러 · 필수', props: { state: 'error', required: 'true' } },
      ],
    },
    {
      key: 'ListToolbar',
      setName: 'DS/ListToolbar',
      eyebrow: 'MOLECULE · ADMIN',
      desc: '목록 상단 툴바 — 전체 건수 · 검색 · 필터 · 정렬. Show Total/Filter/Sort를 끄면 그 자리는 검색이 먹습니다(빈 칸이 남지 않습니다).',
      build: (ctx, page) =>
        buildSet(ctx, page, 'DS/ListToolbar', [{ name: 'state', values: ['default'] }], (c) => renderListToolbar(ctx, c), {
          texts: [
            { prop: 'Total', layer: 'Total', def: '전체 128건', show: false },
            { prop: 'Search', layer: 'Search Placeholder', def: '검색어를 입력하세요' },
            { prop: 'Filter Label', layer: 'Filter Label', def: '필터', show: false },
            { prop: 'Sort Label', layer: 'Sort Label', def: '최신순', show: false },
          ],
          bools: [
            { prop: 'Show Total', layer: 'Total', def: true },
            { prop: 'Show Filter', layer: 'Filter', def: true },
            { prop: 'Show Sort', layer: 'Sort', def: true },
          ],
        }),
      states: [{ caption: '기본 (전체·검색·필터·정렬)', props: {} }],
    },
    {
      key: 'StatusTabs',
      setName: 'DS/StatusTabs',
      eyebrow: 'MOLECULE · ADMIN',
      desc: '상태 필터 탭(2~4개). 활성 탭만 primary -700 굵게 + soft 카운트 pill + 밑줄, 나머지는 중립. 비활성 밑줄도 자리를 지켜 글자가 흔들리지 않습니다.',
      build: (ctx, page) =>
        buildSet(ctx, page, 'DS/StatusTabs', [{ name: 'count', values: ['2', '3', '4'] }], (c) => renderStatusTabs(ctx, c), {
          texts: [
            { prop: 'Tab 1 Label', layer: 'Tab 1 Label', def: '전체', show: false },
            { prop: 'Tab 2 Label', layer: 'Tab 2 Label', def: '대기', show: false },
            { prop: 'Tab 3 Label', layer: 'Tab 3 Label', def: '처리중', show: false },
            { prop: 'Tab 4 Label', layer: 'Tab 4 Label', def: '완료', show: false },
          ],
        }),
      states: [
        { caption: '2개', props: {} },
        { caption: '3개', props: { count: '3' } },
        { caption: '4개', props: { count: '4' } },
      ],
    },
    {
      key: 'RowActions',
      setName: 'DS/RowActions',
      eyebrow: 'ATOM · ADMIN',
      desc: '표 행 끝의 액션 묶음. 삭제만 error 톤(테두리 -300 · 글자 -700)으로 무게를 주고 보기·수정은 중립입니다.',
      build: (ctx, page) =>
        buildSet(
          ctx,
          page,
          'DS/RowActions',
          [{ name: 'variant', values: ['view-edit-delete', 'edit-delete', 'view-delete'] }],
          (c) => renderRowActions(ctx, c),
          {
            texts: [{ prop: 'Delete Label', layer: 'Delete Label', def: '삭제' }],
          },
        ),
      states: [
        { caption: '보기 · 수정 · 삭제', props: {} },
        { caption: '수정 · 삭제', props: { variant: 'edit-delete' } },
        { caption: '보기 · 삭제', props: { variant: 'view-delete' } },
      ],
    },
    {
      key: 'PageHeaderBar',
      setName: 'DS/PageHeaderBar',
      eyebrow: 'ORGANISM · ADMIN',
      desc: '페이지 최상단 헤더 바 — 타이틀(+배지) · 설명 · 액션. Show Description / Show Actions를 끄면 그 줄이 통째로 사라지고 바 높이가 줄어듭니다.',
      build: (ctx, page) =>
        buildSet(ctx, page, 'DS/PageHeaderBar', [{ name: 'hasBadge', values: ['false', 'true'] }], (c) => renderPageHeaderBar(ctx, c), {
          texts: [
            { prop: 'Title', layer: 'Title', def: '회원 관리' },
            { prop: 'Badge Label', layer: 'Badge Label', def: '운영중' },
            { prop: 'Description', layer: 'Description', def: '가입 회원을 조회하고 상태를 변경합니다.', show: false },
            { prop: 'Cancel', layer: 'Cancel Label', def: '취소' },
            { prop: 'Save', layer: 'Save Label', def: '저장' },
          ],
          bools: [
            { prop: 'Show Description', layer: 'Description', def: true },
            { prop: 'Show Actions', layer: 'Actions', def: true },
          ],
        }),
      states: [
        { caption: '배지 없음', props: {} },
        { caption: '배지 있음', props: { hasBadge: 'true' } },
      ],
    },
  ],
}

// ── 어드민 폼 페이지 생성 ────────────────────────────────────────────
// 세트는 페이지 오른쪽(x=1360)에 세로로 쌓고, 문서(오토레이아웃)에는 인스턴스만 배치한다.
// 시그니처는 generateAdmin과 동일 — 배선(code.ts/ui.html/reset.ts)은 다른 소유자가 한다.
export async function generateAdminForms(
  fontFamily: string,
  colors?: Record<string, string>,
  preset?: PresetName,
): Promise<string[]> {
  const ctx = await setup(fontFamily, colors, preset)
  if (!ctx.vars.get('color/primary')) {
    ctx.warnings.push("Variables가 없습니다 — '토큰'을 먼저 생성하세요(색이 프리셋과 연결되지 않습니다).")
  }
  if (!figma.root.children.some((p) => p.name.indexOf('Icon System') >= 0)) {
    ctx.warnings.push('Icon System 페이지가 없어 아이콘이 인라인 폴백됩니다 — 아이콘 스왑을 쓰려면 Icon System도 함께 생성하세요.')
  }

  const cat = ADMIN_FORMS_CATEGORY
  if (figma.root.children.some((p) => p.name === cat.pageName)) {
    ctx.warnings.push(`페이지 '${cat.pageName}' 이미 존재 — 건너뜀(재생성하려면 '기존 삭제 후 재생성').`)
    return ctx.warnings
  }
  const page = figma.createPage()
  page.name = cat.pageName
  applyPageColorMode(ctx, page)

  const sets = new Map<string, ComponentSetNode>()
  let sy = 200
  for (const doc of cat.docs) {
    try {
      const set = doc.build(ctx, page)
      set.x = 1360
      set.y = sy
      sy += set.height + 48
      bindTokens(ctx, set) // 보더·마진·라운드·불투명도 변수 바인딩
      sets.set(doc.setName, set)
    } catch (e) {
      ctx.warnings.push(`${doc.setName} 세트 생성 실패: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  const root = makeRoot(cat.title)
  placeRoot(root, page)
  makeHeader(ctx, root, cat.title, cat.subtitle)
  for (const doc of cat.docs) {
    const render = makeSection(ctx, root, {
      eyebrow: doc.eyebrow,
      name: doc.key,
      desc: doc.desc,
      meta: [`Set: ${doc.setName}`, `상태 ${doc.states.length}개`, 'Platform: Web'],
      renderDir: 'WRAP',
    })
    const set = sets.get(doc.setName)
    if (!set) continue
    for (const st of doc.states) render.appendChild(variantItem(ctx, set, st))
  }
  return ctx.warnings
}
