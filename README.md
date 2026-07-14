# Design-System-Hub-Tools

<p align="center">
  <b>한국어</b> ·
  <a href="README.en.md">English</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.zh.md">中文</a>
</p>

<p align="center">
  <img alt="Storybook" src="https://img.shields.io/badge/Storybook-8-FF4785?logo=storybook&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" />
  <img alt="Figma Plugin API" src="https://img.shields.io/badge/Figma-Plugin_API-F24E1E?logo=figma&logoColor=white" />
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm&logoColor=white" />
</p>

---

## 프로젝트 목적 / 배경

**Storybook(React)과 Figma가 같은 토큰·같은 이름·같은 변형으로 맞물리는 디자인 시스템**이다.
React 소스가 단일 출처(SSOT)이고, Figma는 플러그인을 통해 그것을 미러링한다.

### 배경 — 왜 이렇게 만들었나

디자인 시스템이 깨지는 지점은 코드가 아니라 **두 시스템 사이의 틈**이다.

- 디자이너가 Figma에서 메인 컬러를 바꿨는데 버튼 하나만 안 바뀐다 → 그 버튼은 변수가 아니라 raw hex로 칠해져 있었다.
- 개발자가 prop 이름을 `Price` → `price`로 개명했는데 Figma 화면의 상품 카드 10장이 전부 기본가로 렌더된다 → 인스턴스 오버라이드가 **경고 없이** 끊겼다.
- 같은 GNB 메뉴가 두 파일에 선언돼 서로 어긋난다 → 두 번째로 적는 순간 두 값은 갈라진다.

이 저장소는 그 틈을 **문서가 아니라 게이트로** 막는다. 이름·값·바인딩·조립이 어긋나면
`pnpm verify:all`이 빨간불을 낸다. 사람의 주의력에 기대지 않는 것이 설계 목표다.

### 무엇을 하는가

| | |
|---|---|
| **디자인 토큰 SSOT** | `tokens/*.json` 하나에서 Storybook CSS 변수 · TS 타입 · Figma 플러그인 프리셋이 **함께 파생**된다. 손으로 두 번 적는 곳이 없다. |
| **DS 컴포넌트 라이브러리** | 155개 컴포넌트(코어·어드민·사이트·한국형 KR 20종). 색은 전부 `var(--ds-*)`, 문구는 전부 `labels` prop. |
| **Figma 생성기** | 플러그인이 Variables 3컬렉션 · Text Styles · 컴포넌트 세트 · 어드민/프론트 화면 · 문서 페이지를 Figma에 직접 생성한다. |
| **파리티 게이트 7종** | 코드↔Figma의 이름·값·바인딩·화면 조립을 기계로 검증한다. |
| **CSS 프레임워크 비교** | Bootstrap/Tailwind/Bulma/Foundation/Materialize/Semantic/Skeleton을 Shadow DOM으로 격리해 한 화면에서 대조. |

전체 규약은 [CLAUDE.md](CLAUDE.md), 네이밍 규칙은 [docs/naming-parity.md](docs/naming-parity.md) 참조.

---

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 코어 | React 18 · TypeScript 5 · Vite 5 |
| 문서/카탈로그 | Storybook 8 (`@storybook/react-vite`) + addon-essentials / a11y / designs |
| 스타일 | CSS Modules · Tailwind 3.4 · SCSS(sass) · styled-components · `color-mix()` 토큰 스킨 |
| 토큰 파이프라인 | JSON → `scripts/build-tokens.mjs` → CSS 변수 + TS 타입 + 플러그인 프리셋 (style-dictionary 병용) |
| Figma | Figma Plugin API (`figma-plugin/`) · Variables · Component Set / Variant / Instance Swap |
| 검증 게이트 | Node ESM 스크립트 7종 (`scripts/verify-*.mjs`) + PreToolUse git 가드 훅 |
| 프레임워크(비교용) | bootstrap · tailwindcss · bulma · foundation-sites · materialize-css · semantic-ui-css · skeleton-css |
| 아이콘 | Lucide(정본) · Heroicons · Tabler · Material Symbols(`?raw` SVG) · Bootstrap Icons(폰트) |
| 차트 | Chart.js + react-chartjs-2 |
| 폰트 | Pretendard · Inter (@fontsource) |
| 스냅샷 | Playwright (Storybook 렌더 → PNG → Figma 배치) |
| 배포 | GitHub Pages (문서 사이트 + 선언 호스팅) · GitHub Actions · jsDelivr @gh |
| 패키지 관리 | pnpm 워크스페이스 + corepack (Node 22) |

---

## 디렉토리 구조

```
Design-System-Hub-Tools/
├─ tokens/                          # ⭐ 변수 SSOT — bootstrap.json · tailwind.json · toss.json
│
├─ scripts/                         # 빌드 · 검증 게이트 (Node ESM)
│  ├─ build-tokens.mjs              #   토큰 JSON → CSS 변수 · TS 타입 · 플러그인 프리셋
│  ├─ build-story-manifest.mjs      #   src/ds → Figma 매니페스트 직렬화 + 왕복 동일성 검증
│  ├─ capture-snapshots.mjs         #   Storybook 렌더 → PNG (Playwright)
│  ├─ validate-tokens.mjs           #   토큰 스키마 검증
│  ├─ verify-parity.mjs             #   ① 토큰 값·변수명 패리티
│  ├─ verify-mapping.mjs            #   ② 컴포넌트 커버리지
│  ├─ verify-naming.mjs             #   ③ 코드 이름 ↔ Figma 속성·레이어 이름
│  ├─ verify-screen-props.mjs       #   ④ 화면 inst() 오버라이드 ↔ 세트 속성 이름
│  ├─ verify-bindings.mjs           #   ⑤ 요소가 실제로 변수에 물렸는가 (raw hex 금지)
│  └─ lib/
│     ├─ ds-props.mjs               #     TSX props 파서 (union/boolean/string/ReactNode 분류)
│     ├─ figma-sets.mjs             #     생성기에서 실제 Figma 세트 선언 추출
│     └─ css-classes.mjs            #     CSS Modules 클래스 ↔ 레이어 이름 대조
│
├─ src/
│  ├─ tokens/
│  │  ├─ generated/                 # ⚙️ build-tokens 산출물 (직접 수정 금지)
│  │  │  ├─ vars-bootstrap.css      #     --ds-* CSS 변수 (프리셋별)
│  │  │  ├─ vars-tailwind.css
│  │  │  ├─ vars-toss.css
│  │  │  ├─ types.ts                #     ColorToken · SolidColorToken · SpacingToken … 유니온
│  │  │  └─ theme.ts                #     presets 객체 + cssVar()
│  │  └─ motion.css                 #   모션 토큰
│  │
│  ├─ shared/                       # 공용 인프라 (단일 출처)
│  │  ├─ labels.ts                  #   ⭐ 문구 변수 — 공용 Labels 타입 · mergeLabels · resolveLabel
│  │  ├─ ThemeScope.tsx             #   data-theme 프리셋 스위처 (토큰 CSS 변수 적용)
│  │  ├─ FrameworkScope.tsx         #   프레임워크 CSS를 Shadow DOM에만 주입 (전역 격리)
│  │  ├─ mediaMock.ts               #   목 이미지 단일 출처
│  │  ├─ tableExport.ts             #   표 내보내기 헬퍼
│  │  └─ placeholders.tsx           #   플레이스홀더 프리미티브
│  │
│  ├─ ds/                           # 디자인 시스템 컴포넌트 155종
│  │  ├─ Button · TextField · Table · Badge · Dialog …          # 코어 프리미티브
│  │  ├─ AdminListPage · AdminFormPage · AdminShell · AdminTable # 어드민 셸 (화면은 셸로 조립)
│  │  ├─ SiteSection · SiteHeader · PortfolioPage · ShopPage …   # 사이트(프론트) 화면
│  │  └─ kr/                        #   한국형 20종 (주민번호·계좌·카드·주소·본인인증·전자서명)
│  │     └─ format.ts               #     자동 하이픈 포맷터 + 검증식(주민/사업자/카드 Luhn)
│  │
│  ├─ templates/                    # 화면 템플릿 (AdminSuite · SiteSuite · Dashboard · Login · Settings)
│  ├─ frameworks/                   # CSS 프레임워크 7종 쇼케이스 + Compare
│  ├─ icons/ · styling/ · animations/ · foundation/ · docs/     # 스토리·MDX 문서
│
├─ figma-plugin/                    # Figma 플러그인 (별도 번들 · 별도 tsconfig)
│  └─ src/
│     ├─ code.ts                    #   플러그인 엔트리 — UI 메시지 → 생성 파이프라인
│     ├─ ui.html                    #   ⭐ 변수 입력 UI (프리셋 · 컬러 9색 · 폰트 · 기준 크기 · 배수)
│     ├─ presets.ts                 #   ⭐ 키 목록 · computeSizes · hexToRgb · firstFontFamily
│     ├─ presets.data.ts            #   ⚙️ build-tokens 산출물 (tokens/*.json 미러 · 직접 수정 금지)
│     └─ generators/
│        ├─ tokens.ts               #   ⭐ Figma Variables 3컬렉션 생성 (generateTokens)
│        ├─ tone.ts                 #   ⭐ solid/on 색 파생 공식 (build-tokens와 동일)
│        ├─ sync.ts                 #   ⭐ 원격 토큰 JSON 검증·주입 (validateTokens · importTokens)
│        ├─ categories-shared.ts    #   ⭐ 바인딩 헬퍼 정본 (bindFillVar · boundText …)
│        ├─ lib/build-set.ts        #   ⭐ 컴포넌트 세트 · variant 축 · 속성 정본 (buildSet · variantItem)
│        ├─ categories*.ts          #   컴포넌트 카테고리 페이지 (Input/Action/Feedback/Nav/Data/KR/Media…)
│        ├─ admin.ts · screens.ts   #   어드민 컴포넌트 · 어드민 화면 26종
│        ├─ site.ts · site-screens.ts #  프론트 컴포넌트 · 프론트 화면 5종
│        ├─ foundations.ts · docs.ts  #  Design System · Icon System · 문서 페이지
│        └─ snapshots.ts            #   Storybook 스냅샷 PNG 배치
│
├─ packages/figma-story-tools/      # 매니페스트 배포 패키지 (npm/CDN)
├─ docs/                            # 스펙 · 네이밍 파리티 · known-issues · 프로세스 로그
├─ site/                            # GitHub Pages 정적 호스팅 (선언 JSON)
└─ .storybook/                      # Storybook 설정 (main.ts · preview.tsx)
```

---

## 변수 관리 — 파일 및 주요 함수

변수는 **한 곳에서 선언되고, 한 방향으로 흐른다.** 흐름은 다음과 같다.

```
tokens/*.json  (SSOT — 사람이 고치는 유일한 곳)
      │
      └── scripts/build-tokens.mjs
              ├──▶ src/tokens/generated/vars-*.css     (--ds-*)      → Storybook 런타임
              ├──▶ src/tokens/generated/types.ts       (유니온 타입)  → 컴파일 타임 안전망
              ├──▶ src/tokens/generated/theme.ts       (presets · cssVar)
              └──▶ figma-plugin/src/presets.data.ts    (플러그인 내장 프리셋)
                          │
                          └── figma-plugin/src/generators/tokens.ts
                                  └──▶ Figma Variables 3컬렉션 (color/* · font/* · radius/* · spacing/*)
                                          │
                                          └── categories-shared.ts · lib/build-set.ts
                                                  └──▶ 각 노드의 fill·stroke·text가 변수에 **바인딩**됨
```

`presets.data.ts`가 손이 아니라 빌드로 만들어지는 것이 핵심이다 — 그래서 Storybook과 Figma의 값이 **갈라질 수 없다.**

### 1. 변수 원본 (SSOT)

| 파일 | 내용 |
|---|---|
| [tokens/toss.json](tokens/toss.json) · [tokens/bootstrap.json](tokens/bootstrap.json) · [tokens/tailwind.json](tokens/tailwind.json) | 프리셋 3종. 각 파일은 `color`(10키) · `typography`(fontFamily · baseSize · scale · sizes · weights) · `radius`(3) · `spacing`(6)을 갖는다. |

색은 base 10키(`primary` `secondary` `error` `success` `warning` `neutral` `bg` `bgSubtle` `text` `border`)만 적는다.
셰이드(100~900) · `solid-*` · `on-*`는 **적지 않는다 — 계산으로 파생된다**(§2).

### 2. 토큰 빌드 — [scripts/build-tokens.mjs](scripts/build-tokens.mjs)

| 함수 | 역할 |
|---|---|
| `mixHex(hex, target, amt)` | 두 색을 비율로 섞는다 — 셰이드(100~900) 파생의 기반 |
| `relLuminance(hex)` / `contrastRatio(a, b)` | WCAG 상대휘도 · 대비비 계산 |
| `solidColorFor(base)` | base 톤에서 **흰 글자가 AA(4.5:1)를 통과하는 면 색**을 계산 → `--ds-color-solid-*` |
| `onColorFor(base)` | solid 면 위에 올릴 전경색을 계산 (AA 보장) → `--ds-color-on-*` |
| `px(n)` · `union(keys)` · `varKeys(name)` | 산출물 직렬화 헬퍼 (CSS px · TS 유니온 · 변수명 목록) |

산출물 4종: `vars-<preset>.css` · `types.ts` · `theme.ts` · `figma-plugin/src/presets.data.ts`.

### 3. Figma 변수 선언 — [figma-plugin/src/generators/tokens.ts](figma-plugin/src/generators/tokens.ts)

| 함수 / 상수 | 역할 |
|---|---|
| `COLLECTION_NAMES` | 생성할 컬렉션 3종 — `DS Color` · `DS Typography` · `DS Radius·Spacing` |
| `guardExisting()` | **멱등 가드** — 같은 이름의 컬렉션이 이미 있으면 생성을 중단한다(삭제하지 않는다) |
| `generateTokens(payload)` | UI 입력(프리셋·컬러·폰트·기준 크기·배수)을 받아 Figma Variables를 생성한다 |

`generateTokens`가 만드는 변수 이름 — **Storybook의 `--ds-*`와 1:1**이다:

| Figma 변수 | Storybook CSS 변수 | 비고 |
|---|---|---|
| `color/<key>` | `--ds-color-<key>` | base 10색. `DS Color`는 **3모드**(bootstrap·tailwind·toss) |
| `color/<key>/<step>` | `--ds-color-<key>-<step>` | 셰이드 100~900 (모드별 base에서 계산) |
| `color/solid-<key>` | `--ds-color-solid-<key>` | AA 통과 면 색 |
| `color/on-<key>` | `--ds-color-on-<key>` | solid 면의 전경색 |
| `font/family` | `--ds-font-family` | **패밀리명 1개만** — CSS 스택 전체를 넣으면 노드 생성이 실패한다 |
| `font/size/<key>` | `--ds-font-size-<key>` | `computeSizes(baseSize, scale)` 결과 6단계 |
| `font/weight/<key>` | `--ds-font-weight-<key>` | regular · medium · bold |
| `radius/<key>` · `spacing/<key>` | `--ds-radius-<key>` · `--ds-spacing-<key>` | |

### 4. 키 목록 · 값 변환 — [figma-plugin/src/presets.ts](figma-plugin/src/presets.ts)

| 함수 / 상수 | 역할 |
|---|---|
| `COLOR_KEYS` · `SIZE_KEYS` · `WEIGHT_KEYS` · `RADIUS_KEYS` · `SPACING_KEYS` | 축의 정본 키 목록 (여기 없는 키는 존재하지 않는다) |
| `computeSizes(baseSize, scale)` | 기준 크기 × 배수 → `xs…xxl` 6단계. UI의 `기준 크기`/`크기 배수` 입력이 여기로 들어온다 |
| `hexToRgb(hex)` / `rgbToHex(rgb)` | UI 색상 피커 ↔ Figma RGB 상호 변환 |
| `firstFontFamily(stack)` | CSS 폰트 스택에서 **첫 패밀리 1개만** 뽑는다 (Figma는 스택을 모른다 — 넣으면 unloaded font로 실패) |
| `PRESETS` | `presets.data.ts`(= tokens/*.json 미러)를 그대로 노출 |

### 5. 파생 색 공식 (Figma 측) — [figma-plugin/src/generators/tone.ts](figma-plugin/src/generators/tone.ts)

| 함수 | 역할 |
|---|---|
| `solidToneHex(base)` / `onToneHex(base)` | build-tokens의 `solidColorFor` / `onColorFor`와 **동일한 공식**. 두 곳이 어긋나면 `verify:parity`가 잡는다 |
| `solidVarName(tone)` / `onVarName(tone)` | `color/solid-<tone>` · `color/on-<tone>` 이름 생성 |

### 6. 바인딩 헬퍼 (요소를 변수에 무는 곳) — [figma-plugin/src/generators/categories-shared.ts](figma-plugin/src/generators/categories-shared.ts)

**정본은 이 파일 하나다.** 복제하면 사본 하나만 고쳐지고 나머지가 썩는다 — `verify:bindings`의 B4가 이를 막는다.

| 함수 | 역할 |
|---|---|
| `bindFillVar(ctx, node, varName, hex)` | 면 색을 **변수에 바인딩**한다. `fills = [solid(…)]` (raw hex) 대신 반드시 이것을 쓴다 |
| `bindStrokeVar(ctx, node, varName, hex)` | 선 색을 변수에 바인딩 |
| `boundText(ctx, chars, size, varName, hex, bold)` | 텍스트 노드를 만들며 **색·크기·굵기·패밀리를 전부 변수에 문다**. 맨 텍스트(`txt`) 대신 이것을 쓴다 |
| `bindSolidFill(ctx, node, tone)` / `bindOnFill(ctx, node, tone)` | 톤 면 · 그 위 전경색을 한 번에 바인딩 |
| `toneBase(ctx, tone)` / `onHex(ctx, tone)` | 현재 컨텍스트의 톤 base hex · on-color hex |
| `recolorIconVar(ctx, node, varName, hex)` / `recolorIconOn(ctx, node, tone)` | 아이콘 벡터의 색을 변수에 바인딩 |
| `tintHex(hex, amt)` | 옅은 배경 계산 |

### 7. 컴포넌트 속성(변수) 선언 — [figma-plugin/src/generators/lib/build-set.ts](figma-plugin/src/generators/lib/build-set.ts)

React의 prop이 Figma의 **컴포넌트 속성**이 되는 지점. 이름은 코드가 정하고 Figma가 따른다.

| 함수 | 역할 |
|---|---|
| `buildSet(...)` | 컴포넌트 세트 + variant 축을 만든다 (유니온 prop → VARIANT 축) |
| `addTextProp(set, prop, layer, def)` | string prop → **TEXT 속성** |
| `addBoolProp(set, prop, layer, def)` | `show*` boolean → **BOOLEAN 속성** |
| `addSwapProp(set, prop, layer, defKey)` | ReactNode 슬롯 → **INSTANCE_SWAP 속성** |
| `propKeys(set)` | 표시 이름 → Figma 내부 키(`Title#12:3`) 매핑. 화면 조립의 `inst()`가 이걸 쓴다 |
| `variantItem(ctx, set, state)` | 문서 페이지의 변형 인스턴스를 만든다 (`state.props` / `texts` / `swaps` 적용) |

> ⚠️ `inst()`와 `variantItem()`은 **모르는 속성 이름을 경고만 하고 무시한다.**
> 세트의 속성을 개명하면 화면 오버라이드가 조용히 끊긴다 → `verify:screens`가 이걸 잡는 유일한 게이트다.

### 8. 원격 변수 주입 — [figma-plugin/src/generators/sync.ts](figma-plugin/src/generators/sync.ts)

| 함수 | 역할 |
|---|---|
| `validateTokens(json)` | 외부에서 받은 토큰 JSON의 스키마를 검증하고 위반 목록을 돌려준다 |
| `importTokens(json)` | 검증된 토큰을 현재 Figma 파일의 Variables에 주입한다 |

플러그인 UI의 `▸ 세부 설정 → 원격 선언 불러오기(URL)`로 CDN 매니페스트를 읽어 같은 변수를 재현할 수 있다.

### 9. 런타임 변수 적용 (Storybook 측)

| 파일 | 역할 |
|---|---|
| [src/shared/ThemeScope.tsx](src/shared/ThemeScope.tsx) | `data-theme="<preset>"` 스코프를 씌워 `vars-<preset>.css`의 변수를 적용한다. Storybook 툴바의 Preset 스위처가 이걸 바꾼다 |
| [src/tokens/generated/theme.ts](src/tokens/generated/theme.ts) | `cssVar(token)` → `var(--ds-color-<token>)` 문자열 생성 |
| [src/tokens/generated/types.ts](src/tokens/generated/types.ts) | `ColorToken` · `SolidColorToken` · `SpacingToken` … 유니온 타입 — 없는 토큰을 쓰면 **타입체크가 잡는다** |

### 10. 문구 변수(labels) — [src/shared/labels.ts](src/shared/labels.ts)

사용자에게 보이는 모든 글자도 변수다. 통로는 `labels` prop **하나**이고, 타입·병합 함수는 이 파일이 단일 출처다.

| 함수 / 타입 | 역할 |
|---|---|
| `mergeLabels(defaults, labels)` | 기본값과 부분 오버라이드를 **1단계 깊이까지 안전하게 병합**한다. naive spread를 쓰면 부분 오버라이드가 나머지 기본값을 지운다 |
| `resolveLabel(...candidates)` | 우선순위 해석 — **개별 prop > `labels.*` > 기본값** |
| `resolveText(value, arg)` | 값이 문자열이면 그대로, 함수면 인자를 넣어 평가 (`(n) => \`${n}건\``) |
| `RowActionsLabels` · `EmptyLabels` · `PaginationLabels` · `SearchLabels` · `Formatters` … | 공용 문구 타입 — **재정의하지 말고 import** |

### 11. 변수 드리프트 게이트 — [scripts/](scripts/)

| 게이트 | 무엇이 어긋나면 잡는가 |
|---|---|
| `verify:parity` | tokens/\*.json ↔ presets.data.ts ↔ `--ds-*` ↔ Figma 변수명이 **값·이름 모두** 일치하는가 |
| `verify:bindings` | 요소가 정말 변수에 **물렸는가** (B1 raw fill 금지 · B2 미바인딩 텍스트 금지 · B3 폰트 리터럴 금지 · B4 헬퍼 복제 금지 · B5 텍스트 불투명도 금지 · B6 appendChild 전 layoutPositioning 금지 · B7 undefined 캐스팅 금지) |
| `verify:naming` | 코드의 prop·CSS 클래스 이름 ↔ Figma 속성·레이어 이름 (변환 없는 **정확 일치**) |
| `verify:screens` | 화면의 `inst()` 오버라이드 ↔ 세트의 속성 이름 (개명으로 조용히 끊긴 오버라이드) |
| `verify:mapping` | 컴포넌트 커버리지 — 있어야 할 게 다 있고, 없어야 할 게 없는가 |

게이트 보조 파서: [scripts/lib/ds-props.mjs](scripts/lib/ds-props.mjs)(`parsePropsAt` · `classifyProps` · `indexComponents`) ·
[scripts/lib/figma-sets.mjs](scripts/lib/figma-sets.mjs)(`extractFigmaSets` · `getValidIconKeys`) ·
[scripts/lib/css-classes.mjs](scripts/lib/css-classes.mjs)(`parseCssClasses` · `legalLayers`).

---

## 실행

```bash
pnpm install
pnpm build:tokens                 # tokens/*.json → CSS 변수 · TS 타입 · 플러그인 프리셋
pnpm storybook                    # 문서 사이트 (http://localhost:6006)
pnpm --dir figma-plugin build     # Figma 플러그인 번들 → figma-plugin/dist/
```

Figma에서: **Plugins → Development → Import plugin from manifest…** → `figma-plugin/manifest.json` 선택 →
UI에서 프리셋·컬러·폰트를 고르고 **[디자인시스템 생성]**.

## 검증

```bash
pnpm verify:all     # ← 이것만 초록이면 "완료"라고 말해도 된다
```

| 명령 | 검사 |
|---|---|
| `pnpm typecheck` | 앱 타입체크 (`noUnusedLocals` 켜져 있음) |
| `pnpm typecheck:figma` | 플러그인 타입체크 |
| `pnpm verify:parity` | 토큰 값·변수명 패리티 |
| `pnpm verify:mapping` | 컴포넌트 커버리지 |
| `pnpm verify:naming` | 코드 이름 ↔ Figma 이름 |
| `pnpm verify:screens` | 화면 조립 (`inst()` 오버라이드) |
| `pnpm verify:bindings` | 요소↔변수 바인딩 |
| `pnpm verify:guard` | git 가드 훅이 실제로 무는지 (결함 주입 33건) |

## 요구 환경

- **Node 20 또는 22** (Storybook 8은 Node 24 미지원)
- **pnpm** — `corepack enable && corepack prepare pnpm@latest --activate`

## 기여 규약

작업 전 [CLAUDE.md](CLAUDE.md)를 읽어라. 요약하면:

1. **git 상태를 바꾸는 명령 금지** (`stash` · `reset --hard` · `checkout -- .` …) — 여러 에이전트가 같은 워크트리를 공유한다. PreToolUse 훅이 물리적으로 차단한다.
2. **하드코딩 금지** — 색·크기·간격은 `var(--ds-*)`, 문구는 `labels` prop.
3. **이미 있는 것을 두고 새로 만들지 마라** — 표·빈 상태·툴바·확인창은 이미 있다. 기존 것에 옵셔널 축을 추가하라.
4. **끝났다고 말하기 전에 게이트를 실제로 돌려라.**
