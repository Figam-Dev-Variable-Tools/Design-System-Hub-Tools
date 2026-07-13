// P3 매니페스트 — DS 컴포넌트의 §3 매핑 선언(Variants·Text·Boolean·Instance Swap·Slot).
//
// 이 파일은 **선언만** 갖는다. 생성기(generateComponents + make*Set 1,090줄)는 삭제됐다:
//   · 도달 불가였다 — code.ts는 `if (msg.scope.components)` 아래에서만 불렀는데
//     ui.html에는 그 스코프를 켜는 체크박스가 없고 `components: false`가 못박혀 있었다.
//   · 검사도 못 받았다 — scripts/lib/figma-sets.mjs의 GENERATOR_FILES는 buildSet 기반 생성기만 본다.
//     여기 있던 세트 빌더는 buildSet을 쓰지 않아 규약 위반이 있어도 아무 게이트도 잡지 못했다.
//   · 정본은 categories*.ts다 — 같은 컴포넌트(Button·Badge·Chip·Alert·Toast·Card·TextField·Toggle·Checkbox)를
//     'N. System - *' 페이지에 이미 그린다. 두 벌을 살려두면 Figma에 중복 세트가 생긴다(§0-2).
//
// 남긴 두 선언은 실제로 소비된다:
//   · COMPONENT_MANIFEST — scripts/verify-mapping.mjs(게이트)와 scripts/build-story-manifest.mjs가
//     esbuild로 이 파일을 번들해 읽는다. src/ds props에서 파생된 값과 deep-equal로 대조하며,
//     packages/figma-story-tools(npm 산출물)의 manifest.json 스키마가 여기서 나온다.
//   · COMPONENT_PAGE_NAMES — generators/reset.ts가 '기존 삭제 후 재생성'에서 지울 페이지 목록에 합친다.

export type VariantAxis = { name: string; values: string[] }
export type TextProp = { name: string; default: string }
export type BooleanProp = { name: string; default: boolean }
// default/preferred는 선택 — scripts/lib SWAP_RULES에 규칙이 없는 스왑 prop(leftIcon/rightIcon 등)은
// 소스 파생 매니페스트에서 { name }만 나온다.
export type SwapProp = { name: string; default?: string; preferred?: string[] }

export type ComponentSpec = {
  name: string
  kind:
    | 'button'
    | 'textfield'
    | 'card'
    | 'alert'
    | 'badge'
    | 'toggle'
    | 'checkbox'
    | 'toast'
    | 'chip'
  variants: VariantAxis[]
  text: TextProp[]
  booleans: BooleanProp[]
  swaps: SwapProp[]
  slot?: { name: string }
}

export type ComponentManifest = {
  components: ComponentSpec[]
  social: { name: string; providers: string[]; sizes: string[] }
  chart: { name: string; types: string[] }
}

// ── 내장 매니페스트 — D1~D3 props와 1:1 (§3 매핑 규약, verify-mapping.mjs 대조 대상) ──
export const COMPONENT_MANIFEST: ComponentManifest = {
  // 9종을 유지하는 이유: build:manifest가 src/ds 소스 파생 매니페스트와 왕복 동일성(deep-equal)을 검증한다.
  // Figma를 그리는 정본은 categories*.ts의 "N. System - *" 페이지다 — 여기서 그리지 않는다.
  components: [
    {
      name: 'DS/Button',
      kind: 'button',
      variants: [
        { name: 'variant', values: ['primary', 'secondary', 'error', 'success', 'warning', 'neutral'] },
        { name: 'appearance', values: ['solid', 'outline', 'ghost'] },
        { name: 'size', values: ['sm', 'md', 'lg'] },
        { name: 'disabled', values: ['false', 'true'] },
        // fullWidth/iconOnly는 D1(Button.tsx)에서 "show"로 시작하지 않는 boolean이라
        // §3 매핑 규약(classifyProps)상 축(variant)이 된다 — verify-mapping.mjs 대조 대상.
        { name: 'fullWidth', values: ['false', 'true'] },
        { name: 'iconOnly', values: ['false', 'true'] },
      ],
      text: [{ name: 'label', default: 'Button' }],
      // showIcon = 레거시 좌측 슬롯. showLeftIcon/showRightIcon = 좌·우 슬롯(D1 ButtonProps와 1:1).
      booleans: [
        { name: 'showIcon', default: false },
        { name: 'showLeftIcon', default: false },
        { name: 'showRightIcon', default: false },
      ],
      // leftIcon/rightIcon은 SWAP_RULES에 규칙이 없어 소스 파생 매니페스트가 { name }만 낸다 — 동일하게 유지.
      swaps: [
        { name: 'icon', default: '_Icon/Star', preferred: ['_Icon/Star', '_Icon/Heart', '_Icon/Bell'] },
        { name: 'leftIcon' },
        { name: 'rightIcon' },
      ],
    },
    {
      name: 'DS/TextField',
      kind: 'textfield',
      variants: [
        { name: 'error', values: ['false', 'true'] },
        { name: 'success', values: ['false', 'true'] },
        { name: 'disabled', values: ['false', 'true'] },
        { name: 'readOnly', values: ['false', 'true'] },
        { name: 'size', values: ['sm', 'md', 'lg'] },
      ],
      text: [
        { name: 'label', default: 'Email' },
        { name: 'placeholder', default: 'name@example.com' },
        { name: 'description', default: '업무용 이메일을 입력하세요.' },
        { name: 'helperText', default: '' },
      ],
      booleans: [
        { name: 'showDescription', default: false },
        { name: 'showCounter', default: false },
      ],
      swaps: [],
    },
    {
      name: 'DS/Card',
      kind: 'card',
      variants: [],
      text: [{ name: 'title', default: 'Card title' }],
      booleans: [{ name: 'showFooter', default: false }],
      swaps: [],
      slot: { name: 'content' },
    },
    {
      name: 'DS/Alert',
      kind: 'alert',
      variants: [{ name: 'variant', values: ['info', 'success', 'warning', 'error'] }],
      text: [{ name: 'label', default: 'This is a warning message.' }],
      booleans: [{ name: 'showIcon', default: false }],
      swaps: [],
    },
    {
      name: 'DS/Badge',
      kind: 'badge',
      variants: [
        { name: 'variant', values: ['primary', 'secondary', 'error', 'success', 'warning', 'neutral'] },
        { name: 'appearance', values: ['solid', 'soft', 'outline'] },
        { name: 'size', values: ['sm', 'md'] },
      ],
      text: [{ name: 'label', default: 'Badge' }],
      booleans: [],
      swaps: [],
    },
    {
      name: 'DS/Toggle',
      kind: 'toggle',
      variants: [
        { name: 'checked', values: ['false', 'true'] },
        { name: 'size', values: ['sm', 'md'] },
        { name: 'disabled', values: ['false', 'true'] },
      ],
      text: [{ name: 'label', default: '알림 받기' }],
      booleans: [],
      swaps: [],
    },
    {
      name: 'DS/Checkbox',
      kind: 'checkbox',
      variants: [
        { name: 'checked', values: ['false', 'true'] },
        { name: 'disabled', values: ['false', 'true'] },
        { name: 'indeterminate', values: ['false', 'true'] },
      ],
      text: [{ name: 'label', default: '약관에 동의합니다' }],
      booleans: [],
      swaps: [],
    },
    {
      name: 'DS/Toast',
      kind: 'toast',
      variants: [{ name: 'tone', values: ['success', 'info', 'warning', 'error'] }],
      text: [{ name: 'message', default: 'message' }],
      booleans: [{ name: 'showIcon', default: true }],
      swaps: [],
    },
    {
      name: 'DS/Chip',
      kind: 'chip',
      variants: [
        { name: 'selected', values: ['false', 'true'] },
        { name: 'disabled', values: ['false', 'true'] },
        { name: 'size', values: ['sm', 'md'] },
      ],
      // removeLabel은 x 버튼의 접근성 이름이다 — 화면에 글자로 그려지지 않으므로 레이어가 없다.
      // 그래도 코드의 string prop이므로 스키마에는 그대로 실린다(코드가 이름을 정한다 — CLAUDE.md §2).
      text: [
        { name: 'label', default: '식비' },
        { name: 'removeLabel', default: '식비 제거' },
      ],
      booleans: [],
      swaps: [{ name: 'leading', default: '_Icon/Star', preferred: ['_Icon/Star', '_Icon/Heart', '_Icon/Bell'] }],
    },
  ],
  social: {
    name: 'DS/SocialLoginButton',
    providers: ['kakao', 'google', 'facebook', 'naver', 'apple', 'microsoft', 'x'],
    sizes: ['md', 'lg'],
  },
  chart: { name: 'DS/Chart', types: ['line', 'bar', 'doughnut'] },
}

/**
 * 옛 빌드(scope.components가 살아 있던 시절)가 만든 컴포넌트/자산 페이지 이름.
 * 생성기는 지웠지만 이 목록은 지우면 안 된다 — 그때 만들어진 Figma 파일에는 아직 이 페이지들이 남아 있고,
 * reset.ts의 삭제 대상에서 빠지면 '기존 삭제 후 재생성'이 영영 건드리지 못하는 좀비 페이지가 된다.
 */
export const COMPONENT_PAGE_NAMES: string[] = [
  '3a. 기본 컴포넌트',
  '3b. 입력 컴포넌트',
  '3c. 선택 컴포넌트',
  '3d. 피드백 컴포넌트',
  '4a. 차트 컴포넌트',
  '5a. 소셜 로그인 컴포넌트',
  '9. 아이콘 · 내부',
]
