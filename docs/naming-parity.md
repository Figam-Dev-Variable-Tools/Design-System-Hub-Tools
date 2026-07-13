# 네이밍 파리티 규약 — 코드가 단일 출처, Figma가 그대로 따른다

React 컴포넌트의 **prop 이름**과 **CSS Module 클래스 이름**이 정답이다.
Figma 생성기(`figma-plugin/src/generators/*.ts`)의 선언은 그것을 **한 글자까지 그대로** 따라야 한다.

게이트: `pnpm verify:naming` (실패 시 exit 1)

---

## 왜 이 문서가 필요한가

Figma 속성 이름이 `Label`, `Show Left Icon`, `Helper` 처럼 사람이 읽기 좋은 표기로 흘러가 있었다.
코드는 `label`, `showLeftIcon`, `helperText` 다. 이름이 다르면:

- 디자이너가 Figma에서 고른 속성이 코드의 어느 prop인지 **기계적으로 알 수 없다**.
- Figma → 코드 자동 생성/동기화가 **매번 사람의 번역을 요구**한다.
- 그 번역 규칙이 컴포넌트마다 달라 시간이 지나면 **아무도 신뢰하지 않는 매핑**이 된다.

기존 `verify-mapping`이 이 드리프트를 못 잡은 이유는 관대해서가 아니라 **엉뚱한 걸 봐서**다.
검사 대상이던 `components.ts`의 `COMPONENT_MANIFEST`는 그 자체가 `src/ds` props에서 파생된 값이라
**코드 ↔ 코드를 비교하는 동어반복**이었고, 유일한 소비자 `generateComponents`는 `ui.html`이
`components: false`로 못박아 **실행되지도 않는 그림자 선언**이었다.
지금은 실제 Figma를 그리는 `categories/admin/site.ts`의 `buildSet(...)` 선언만 본다.

---

## 규약 7개

| # | 대상 | 규칙 | 예 |
|---|---|---|---|
| **§1** | 컴포넌트 세트 | `DS/<ComponentName>` — React 컴포넌트 이름 그대로 | `DS/Button` |
| **§2** | VARIANT 축 | 축 이름 = **prop 이름 그대로**, 값 = 유니온 값 문자열 그대로. boolean prop이 축이면 값은 `false`/`true` | `variant: primary\|secondary`, `disabled: false\|true` |
| **§3** | BOOLEAN 속성 | **`show*` prop 이름 그대로**. `Show Label` 같은 임의 표기 금지 | `showLeftIcon` (✗ `Show Left Icon`) |
| **§4** | TEXT 속성 | **prop 이름 그대로**. 중첩 `labels` 객체는 점 표기로 평탄화 | `helperText` (✗ `Helper`), `labels.columns.name` |
| **§5** | INSTANCE_SWAP | **prop 이름 그대로**. 아이콘이 여러 개면 `Icon` 하나로 뭉뚱그리지 않고 슬롯마다 나눈다 | `leftIcon` / `rightIcon` (✗ `Icon`, ✗ `Icon 1`) |
| **§6** | 레이어 | 그 요소를 그리는 **CSS Module 클래스 이름 그대로**. 클래스 없는 순수 구조 프레임만 `root`/`content` | `.overlayTitle` → 레이어 `overlayTitle` |
| **§7** | 슬롯(children) | `content` | |

### §6의 단서 — 속성에 바인딩된 레이어

한 CSS 클래스가 **여러 슬롯**을 그리는 경우가 있다. `Button`은 `leftIcon`과 `rightIcon`을
**둘 다 `styles.icon`으로** 그린다. 레이어를 클래스명(`icon`)으로 통일하면 이름이 겹쳐
`addSwapProp`의 `findAll(name === layer)`가 두 슬롯을 **한 속성에 묶어버린다** → §5가 성립 불가능해진다.

그래서 **속성에 바인딩된 레이어는 그 속성(prop) 이름을 쓴다.**

```ts
// Button — 아이콘 레이어는 CSS 클래스(.icon)가 아니라 prop 이름을 쓴다.
// showLeftIcon(visible)과 leftIcon(mainComponent)이 같은 레이어를 가리키는 건 정상이다.
bools: [{ prop: 'showLeftIcon', layer: 'leftIcon', def: false }],
swaps: [{ prop: 'leftIcon',     layer: 'leftIcon', defKey: '_Icon/Star' }],
```

즉 합법 레이어 = **(CSS 클래스 ∩ TSX에서 실제 쓰는 클래스) ∪ 그 세트가 선언한 속성 이름 ∪ `root`/`content`**.
(선언만 있고 안 쓰는 죽은 CSS 클래스는 합법 레이어가 아니다.)

---

## 규칙 코드 N1~N7

`verify-naming`이 내는 위반 코드다. 비교는 **문자열 정확 일치**다 —
`camelCase → "Title Case"` 같은 정규화 함수는 **넣지 않는다**(그걸 넣는 순간 규약이 사라진다).
대소문자·공백만 다른 짝은 `-name`으로 **리포트만** 친절하게 해줄 뿐, 통과 판정은 정확 일치다.

| 코드 | 뜻 |
|---|---|
| `N1-set-name` / `N1-no-code` | 세트 이름이 `DS/<X>`가 아니거나, 코드 짝이 없다 |
| `N2-axis-missing` / `-extra` / `-name` | 축이 코드에만·Figma에만 있거나, 이름이 다르다 |
| `N2-axis-values` / `-axis-bool-values` | 축 이름은 맞는데 값 집합이 다르다 |
| `N2-axis-from-number` | `number` prop을 축으로 썼다(값을 임의 이산화 — `value: '25'\|'50'\|'75'`) |
| `N2-bool-promoted-to-axis` | `show*` boolean을 축으로 승격했다(`showFooter` → 축 `footer`) |
| `N2-text-promoted-to-axis` | `string` prop을 축으로 썼다(`label` → `false`/`true` 축) |
| `N3-bool-name` / `-missing` / `-extra` | BOOLEAN 이름이 `show*` prop과 다르다/없다/여분이다 |
| `N3-bool-ghost` | **대응 prop이 전혀 없는 유령 불리언** (아래 참조) |
| `N4-text-name` / `-missing` / `-extra` | TEXT 이름이 prop과 다르다/없다/여분이다 |
| `N4-text-from-list` | 배열 prop을 인덱스 TEXT로 전개했다(`Item 1`, `Head 2`) |
| `N5-swap-name` / `-missing` / `-extra` | INSTANCE_SWAP 이름이 prop과 다르다/없다/여분이다 |
| `N5-swap-indexed` | 아이콘을 `Icon` 하나로 뭉갰거나 번호를 매겼다(`Icon 1`, `Icon 2`) |
| `N6-layer-not-css-class` | 레이어가 CSS 클래스도, 선언된 속성 이름도 아니다 |
| `N7-slot-missing` | `children`이 있는데 `content` 레이어가 없다 |

### N3-bool-ghost — 없앤 유령 불리언

`buildSet`이 **TEXT 속성마다** `Show <prop>` 불리언을 자동 생성하고 있었다:

```ts
props.texts?.forEach((t) => {
  addTextProp(set, t.prop, t.layer, t.def)
  addBoolProp(set, `Show ${t.prop}`, t.layer, true)   // ← 대응 React prop이 없는 유령
})
```

이 한 줄이 `categories/admin/site/admin2.ts` **4곳에 복붙**돼 있어서, 한 곳만 고쳐도 나머지가 계속
위반을 증식시켰다. 텍스트 하나당 유령 하나 → 혼자서 **231건**이었다. 지금은 제거했다.
텍스트 on/off가 필요하면 **코드에 `show*` prop을 만들고** `props.bools`에 명시적으로 선언하라.

---

## 예외 선언 (ALLOWLIST)

예외는 `scripts/verify-naming.mjs` 상단 `ALLOWLIST` **한 곳에만** 쓴다.
**사유·소유자 없이 추가 금지.**

```js
const ALLOWLIST = [
  {
    component: 'Breadcrumb',
    kind: 'text-from-list',   // 위반 kind (필수)
    figma: 'Item 1',          // Figma 이름 (필수, 정확 일치 — 와일드카드 금지)
    code: 'items',            // 코드 이름 (선택, 있으면 함께 매칭)
    reason: '배열 prop은 Figma 속성으로 1:1 표현 불가 — 인덱스 TEXT 전개 유지',
    owner: 'sb.hong',
    until: '2026-12-31',      // 선택. 지나면 실패
  },
]
```

- **미사용 항목 = 실패**(`E-ALLOWLIST-STALE`). 예외가 썩어서 규칙을 가리는 걸 막는다.
- **만료 = 실패**(`E-ALLOWLIST-EXPIRED`).

현재 등록된 예외는 **코드 짝이 없는 Figma 전용 합성 세트**(`DS/AdminSidebar`, `DS/InfoCard`,
`DS/Dashboard` 등 문서/화면 샘플) 7건의 `no-code`뿐이다.

---

## baseline — 구조적 격차의 동결

이름만 고쳐서는 해소되지 않는 위반이 있다. 예를 들어:

- `Chip.size`, `Avatar.shape`, `Radio.direction` — **코드엔 축이 있는데 Figma에 없다**(`axis-missing`)
- `Select.open`, `Tab.active` — **Figma에만 있는 상태 축**(`axis-extra`)
- `Breadcrumb.items[]`, `Table.columns[]` — 배열 prop의 인덱스 전개(`text-from-list`)
- `Progress.value`, `Slider.value` — `number` prop을 축으로 이산화(`axis-from-number`)

이건 **세트의 모양·동작을 바꾸는 설계 결정**이지 개명이 아니다.
그래서 `scripts/.naming-baseline.json`에 동결해두고 `KNOWN`으로 강등한다(exit 0에 영향 없음).

- baseline에 **없는** 새 위반만 FAIL → **새 드리프트는 즉시 막힌다.**
- 고쳐진 항목이 baseline에 남아 있으면 **실패**(`E-BASELINE-STALE`) → 강제로 지우게 해서
  **단조 감소**를 보장한다. 되돌아갈 수 없다.
- 0이 되면 baseline 파일과 관련 코드를 삭제한다.

```bash
node scripts/verify-naming.mjs --update-baseline   # 고친 만큼 줄인다
```

---

## CLI

| 플래그 | 동작 |
|---|---|
| (없음) | 위반 있으면 exit 1 |
| `--json` | `{ violations, summary, ... }` stdout |
| `--component=Button` | 컴포넌트 필터 |
| `--rule=N3,N6` | 규칙 필터 |
| `--strict` | 경고 규칙도 실패로 승격 |
| `--update-baseline` | baseline 갱신 |

---

## 게이트 역할 분담

| | **verify-mapping** | **verify-naming** |
|---|---|---|
| 질문 | "있어야 할 게 다 있고, 없어야 할 게 없는가" | "이름이 코드와 한 글자까지 같은가" |
| 대상 | 실물 생성기 세트 ↔ `src/ds/*` 커버리지, 세트 중복, P3 매니페스트 동기 | 동일 세트의 **이름 문자열** (N1~N7) |
| 예외 | — | ALLOWLIST + baseline |

두 게이트 모두 **`scripts/lib/figma-sets.mjs`(실물 생성기 AST 추출기)** 를 공유한다.

---

## 조용한 통과 금지

이번 드리프트가 오래 살아남은 근본 원인은 **"못 읽으면 통과"** 였다.
그래서 파서는 실패를 삼키지 않는다:

- `E-UNPARSED` — `buildSet` 인자나 `Props` 타입을 못 읽으면 **위반으로 올린다**(`continue` 금지).
- `E-COVERAGE` — 파일의 `buildSet` 호출 수와 추출된 세트 수가 다르면 **실패**. 파서가 조용히 놓치는 걸 막는 안전핀.
- `E-ADAPTER-STALE` — `makeInputSet`(명령형 조립이라 리터럴이 아니다)의 파생 규칙을 추출기가
  **재현**하고 있는데, 원본 함수가 바뀌면 재현이 낡았다는 뜻이므로 실패시켜 어댑터를 고치라고 강제한다.

`scripts/lib/` 구성:

```
ds-props.mjs     React props 파서(AST) + 규약 분류 + strict unparsed
css-classes.mjs  CSS Module 클래스 집합(선언 ∩ 사용)
figma-sets.mjs   생성기 AST → FigmaSpec[] (buildSet + INPUTS 어댑터 + 팩토리 인스턴스화)
```
