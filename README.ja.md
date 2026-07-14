# Design-System-Hub-Tools

<p align="center">
  <a href="README.md">한국어</a> ·
  <a href="README.en.md">English</a> ·
  <b>日本語</b> ·
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

## プロジェクトの目的 / 背景

**Storybook（React）と Figma が、同じトークン・同じ名前・同じバリアントで噛み合うデザインシステム**である。
React のソースが単一の情報源（SSOT）であり、Figma はプラグインを通じてそれをミラーリングする。

### 背景 — なぜこう作ったのか

デザインシステムが壊れるのはコードの中ではなく、**2つのシステムのあいだの隙間**である。

- デザイナーが Figma でメインカラーを変えたのに、ボタンが1つだけ変わらない → そのボタンは変数ではなく raw hex で塗られていた。
- 開発者が prop 名を `Price` → `price` にリネームしたら、Figma 画面の商品カード10枚がすべて既定価格でレンダリングされる → インスタンスのオーバーライドが**警告ひとつなく**切れた。
- 同じ GNB メニューが2つのファイルに宣言されて食い違う → 2度目に値を書いた瞬間、2つの値は分岐しはじめる。

このリポジトリはその隙間を**ドキュメントではなくゲートで**塞ぐ。名前・値・バインディング・画面の組み立てがズレると
`pnpm verify:all` が赤くなる。人間の注意力に頼らないことが設計目標である。

### 何をするのか

| | |
|---|---|
| **デザイントークン SSOT** | 1つの `tokens/*.json` から Storybook の CSS 変数・TS 型・Figma プラグインのプリセットが**まとめて派生**する。手で二度書く場所はない。 |
| **DS コンポーネントライブラリ** | 155 コンポーネント（コア・管理画面・サイト・韓国特化 20種）。色はすべて `var(--ds-*)`、文言はすべて `labels` prop 経由。 |
| **Figma ジェネレーター** | プラグインが Variables 3コレクション・Text Styles・コンポーネントセット・管理/フロント画面・ドキュメントページを Figma に直接生成する。 |
| **7つのパリティゲート** | コードと Figma のあいだの名前・値・バインディング・画面組み立てを機械的に検証する。 |
| **CSS フレームワーク比較** | Bootstrap / Tailwind / Bulma / Foundation / Materialize / Semantic / Skeleton を Shadow DOM で隔離し、1画面で対比する。 |

規約全文は [CLAUDE.md](CLAUDE.md)、命名規則は [docs/naming-parity.md](docs/naming-parity.md) を参照。

---

## 技術スタック

| 領域 | 使用技術 |
|---|---|
| コア | React 18 · TypeScript 5 · Vite 5 |
| ドキュメント/カタログ | Storybook 8（`@storybook/react-vite`）+ addon-essentials / a11y / designs |
| スタイル | CSS Modules · Tailwind 3.4 · SCSS（sass）· styled-components · `color-mix()` トークンスキン |
| トークンパイプライン | JSON → `scripts/build-tokens.mjs` → CSS 変数 + TS 型 + プラグインプリセット（style-dictionary 併用） |
| Figma | Figma Plugin API（`figma-plugin/`）· Variables · Component Set / Variant / Instance Swap |
| 検証ゲート | Node ESM スクリプト7種（`scripts/verify-*.mjs`）+ PreToolUse git ガードフック |
| フレームワーク（比較用） | bootstrap · tailwindcss · bulma · foundation-sites · materialize-css · semantic-ui-css · skeleton-css |
| アイコン | Lucide（正本）· Heroicons · Tabler · Material Symbols（`?raw` SVG）· Bootstrap Icons（フォント） |
| チャート | Chart.js + react-chartjs-2 |
| フォント | Pretendard · Inter（@fontsource） |
| スナップショット | Playwright（Storybook レンダー → PNG → Figma へ配置） |
| デプロイ | GitHub Pages（ドキュメントサイト + 宣言のホスティング）· GitHub Actions · jsDelivr @gh |
| パッケージ管理 | pnpm ワークスペース + corepack（Node 22） |

---

## ディレクトリ構造

```
Design-System-Hub-Tools/
├─ tokens/                          # ⭐ 変数の SSOT — bootstrap.json · tailwind.json · toss.json
│
├─ scripts/                         # ビルド・検証ゲート（Node ESM）
│  ├─ build-tokens.mjs              #   トークン JSON → CSS 変数・TS 型・プラグインプリセット
│  ├─ build-story-manifest.mjs      #   src/ds → Figma マニフェスト直列化 + 往復同一性検証
│  ├─ capture-snapshots.mjs         #   Storybook レンダー → PNG（Playwright）
│  ├─ validate-tokens.mjs           #   トークンスキーマ検証
│  ├─ verify-parity.mjs             #   ① トークンの値・変数名パリティ
│  ├─ verify-mapping.mjs            #   ② コンポーネントのカバレッジ
│  ├─ verify-naming.mjs             #   ③ コードの名前 ↔ Figma のプロパティ・レイヤー名
│  ├─ verify-screen-props.mjs       #   ④ 画面の inst() オーバーライド ↔ セットのプロパティ名
│  ├─ verify-bindings.mjs           #   ⑤ 要素が本当に変数に束縛されているか（raw hex 禁止）
│  └─ lib/
│     ├─ ds-props.mjs               #     TSX props パーサ（union / boolean / string / ReactNode 分類）
│     ├─ figma-sets.mjs             #     ジェネレーターから実物の Figma セット宣言を抽出
│     └─ css-classes.mjs            #     CSS Modules のクラス ↔ レイヤー名の照合
│
├─ src/
│  ├─ tokens/
│  │  ├─ generated/                 # ⚙️ build-tokens の生成物（直接編集禁止）
│  │  │  ├─ vars-bootstrap.css      #     --ds-* CSS 変数（プリセット別）
│  │  │  ├─ vars-tailwind.css
│  │  │  ├─ vars-toss.css
│  │  │  ├─ types.ts                #     ColorToken · SolidColorToken · SpacingToken … ユニオン型
│  │  │  └─ theme.ts                #     presets オブジェクト + cssVar()
│  │  └─ motion.css                 #   モーショントークン
│  │
│  ├─ shared/                       # 共通インフラ（単一の情報源）
│  │  ├─ labels.ts                  #   ⭐ 文言変数 — 共通 Labels 型 · mergeLabels · resolveLabel
│  │  ├─ ThemeScope.tsx             #   data-theme プリセットスイッチャー（トークン CSS 変数の適用）
│  │  ├─ FrameworkScope.tsx         #   フレームワーク CSS を Shadow DOM 内にのみ注入（グローバル隔離）
│  │  ├─ mediaMock.ts               #   モック画像の単一情報源
│  │  ├─ tableExport.ts             #   テーブルエクスポートのヘルパー
│  │  └─ placeholders.tsx           #   プレースホルダのプリミティブ
│  │
│  ├─ ds/                           # デザインシステムコンポーネント 155種
│  │  ├─ Button · TextField · Table · Badge · Dialog …          # コアプリミティブ
│  │  ├─ AdminListPage · AdminFormPage · AdminShell · AdminTable # 管理シェル（画面はシェルで組み立てる）
│  │  ├─ SiteSection · SiteHeader · PortfolioPage · ShopPage …   # サイト（フロント）画面
│  │  └─ kr/                        #   韓国特化 20種（住民番号・口座・カード・住所・本人確認・電子署名）
│  │     └─ format.ts               #     自動ハイフン整形 + 検証式（住民/事業者番号/カード Luhn）
│  │
│  ├─ templates/                    # 画面テンプレート（AdminSuite · SiteSuite · Dashboard · Login · Settings）
│  ├─ frameworks/                   # CSS フレームワーク7種のショーケース + Compare
│  ├─ icons/ · styling/ · animations/ · foundation/ · docs/     # ストーリー・MDX ドキュメント
│
├─ figma-plugin/                    # Figma プラグイン（別バンドル・別 tsconfig）
│  └─ src/
│     ├─ code.ts                    #   プラグインのエントリ — UI メッセージ → 生成パイプライン
│     ├─ ui.html                    #   ⭐ 変数入力 UI（プリセット・カラー9色・フォント・基準サイズ・倍率）
│     ├─ presets.ts                 #   ⭐ キー一覧 · computeSizes · hexToRgb · firstFontFamily
│     ├─ presets.data.ts            #   ⚙️ build-tokens の生成物（tokens/*.json のミラー・直接編集禁止）
│     └─ generators/
│        ├─ tokens.ts               #   ⭐ Figma Variables 3コレクションの生成（generateTokens）
│        ├─ tone.ts                 #   ⭐ solid/on 色の派生式（build-tokens と同一）
│        ├─ sync.ts                 #   ⭐ リモートトークン JSON の検証・注入（validateTokens · importTokens）
│        ├─ categories-shared.ts    #   ⭐ バインディングヘルパーの正本（bindFillVar · boundText …）
│        ├─ lib/build-set.ts        #   ⭐ コンポーネントセット・variant 軸・プロパティの正本（buildSet · variantItem）
│        ├─ categories*.ts          #   コンポーネントのカテゴリページ（Input/Action/Feedback/Nav/Data/KR/Media…）
│        ├─ admin.ts · screens.ts   #   管理コンポーネント・管理画面26種
│        ├─ site.ts · site-screens.ts #  フロントコンポーネント・フロント画面5種
│        ├─ foundations.ts · docs.ts  #  Design System · Icon System · ドキュメントページ
│        └─ snapshots.ts            #   Storybook スナップショット PNG の配置
│
├─ packages/figma-story-tools/      # マニフェスト配布パッケージ（npm/CDN）
├─ docs/                            # 仕様・命名パリティ・known-issues・プロセスログ
├─ site/                            # GitHub Pages 静的ホスティング（宣言 JSON）
└─ .storybook/                      # Storybook 設定（main.ts · preview.tsx）
```

---

## 変数管理 — ファイルと主要関数

変数は**一箇所で宣言され、一方向に流れる。**

```
tokens/*.json  （SSOT — 人が編集する唯一の場所）
      │
      └── scripts/build-tokens.mjs
              ├──▶ src/tokens/generated/vars-*.css     (--ds-*)        → Storybook ランタイム
              ├──▶ src/tokens/generated/types.ts       (ユニオン型)     → コンパイル時の安全網
              ├──▶ src/tokens/generated/theme.ts       (presets · cssVar)
              └──▶ figma-plugin/src/presets.data.ts    (プラグイン内蔵プリセット)
                          │
                          └── figma-plugin/src/generators/tokens.ts
                                  └──▶ Figma Variables 3コレクション（color/* · font/* · radius/* · spacing/*）
                                          │
                                          └── categories-shared.ts · lib/build-set.ts
                                                  └──▶ 各ノードの fill・stroke・text が変数に**バインド**される
```

`presets.data.ts` が手作業ではなく**ビルドで生成される**ことが要点である — だから Storybook と Figma の値は**分岐しえない**。

### 1. 変数の原本（SSOT）

| ファイル | 内容 |
|---|---|
| [tokens/toss.json](tokens/toss.json) · [tokens/bootstrap.json](tokens/bootstrap.json) · [tokens/tailwind.json](tokens/tailwind.json) | プリセット3種。各ファイルは `color`（10キー）· `typography`（fontFamily · baseSize · scale · sizes · weights）· `radius`（3）· `spacing`（6）を持つ。 |

色は base 10キー（`primary` `secondary` `error` `success` `warning` `neutral` `bg` `bgSubtle` `text` `border`）だけを書く。
シェード（100〜900）· `solid-*` · `on-*` は**書かない — 計算で派生する**（§2）。

### 2. トークンビルド — [scripts/build-tokens.mjs](scripts/build-tokens.mjs)

| 関数 | 役割 |
|---|---|
| `mixHex(hex, target, amt)` | 2色を比率で混ぜる — シェード（100〜900）派生の基盤 |
| `relLuminance(hex)` / `contrastRatio(a, b)` | WCAG 相対輝度・コントラスト比の計算 |
| `solidColorFor(base)` | base トーンから、**白文字が AA（4.5:1）を通過する面の色**を計算 → `--ds-color-solid-*` |
| `onColorFor(base)` | solid 面の上に載せる前景色を計算（AA 保証）→ `--ds-color-on-*` |
| `px(n)` · `union(keys)` · `varKeys(name)` | 生成物の直列化ヘルパー（CSS px · TS ユニオン · 変数名リスト） |

生成物4種：`vars-<preset>.css` · `types.ts` · `theme.ts` · `figma-plugin/src/presets.data.ts`。

### 3. Figma 変数の宣言 — [figma-plugin/src/generators/tokens.ts](figma-plugin/src/generators/tokens.ts)

| 関数 / 定数 | 役割 |
|---|---|
| `COLLECTION_NAMES` | 生成する3コレクション — `DS Color` · `DS Typography` · `DS Radius·Spacing` |
| `guardExisting()` | **冪等ガード** — 同名のコレクションが既にあれば生成を中断する（削除はしない） |
| `generateTokens(payload)` | UI 入力（プリセット・カラー・フォント・基準サイズ・倍率）を受け取り Figma Variables を生成する |

`generateTokens` が作る変数名は **Storybook の `--ds-*` と 1:1** である：

| Figma 変数 | Storybook CSS 変数 | 備考 |
|---|---|---|
| `color/<key>` | `--ds-color-<key>` | base 10色。`DS Color` は**3モード**（bootstrap · tailwind · toss） |
| `color/<key>/<step>` | `--ds-color-<key>-<step>` | シェード 100〜900（モード別に base から計算） |
| `color/solid-<key>` | `--ds-color-solid-<key>` | AA を通過する面の色 |
| `color/on-<key>` | `--ds-color-on-<key>` | solid 面の前景色 |
| `font/family` | `--ds-font-family` | **ファミリー名1つのみ** — CSS スタック全体を入れるとノード生成が失敗する |
| `font/size/<key>` | `--ds-font-size-<key>` | `computeSizes(baseSize, scale)` の結果6段階 |
| `font/weight/<key>` | `--ds-font-weight-<key>` | regular · medium · bold |
| `radius/<key>` · `spacing/<key>` | `--ds-radius-<key>` · `--ds-spacing-<key>` | |

### 4. キー一覧・値の変換 — [figma-plugin/src/presets.ts](figma-plugin/src/presets.ts)

| 関数 / 定数 | 役割 |
|---|---|
| `COLOR_KEYS` · `SIZE_KEYS` · `WEIGHT_KEYS` · `RADIUS_KEYS` · `SPACING_KEYS` | 各軸の正本キー一覧（ここに無いキーは存在しない） |
| `computeSizes(baseSize, scale)` | 基準サイズ × 倍率 → `xs…xxl` の6段階。UI の「基準サイズ」「サイズ倍率」がここに入る |
| `hexToRgb(hex)` / `rgbToHex(rgb)` | UI のカラーピッカー ↔ Figma RGB の相互変換 |
| `firstFontFamily(stack)` | CSS フォントスタックから**先頭のファミリー1つだけ**を取り出す（Figma はスタックを解さない — 渡すと unloaded font で失敗する） |
| `PRESETS` | `presets.data.ts`（= tokens/*.json のミラー）をそのまま公開 |

### 5. 派生色の計算式（Figma 側）— [figma-plugin/src/generators/tone.ts](figma-plugin/src/generators/tone.ts)

| 関数 | 役割 |
|---|---|
| `solidToneHex(base)` / `onToneHex(base)` | build-tokens の `solidColorFor` / `onColorFor` と**同一の式**。両者がズレれば `verify:parity` が検出する |
| `solidVarName(tone)` / `onVarName(tone)` | `color/solid-<tone>` · `color/on-<tone>` の名前を生成 |

### 6. バインディングヘルパー（要素を変数に束縛する場所）— [figma-plugin/src/generators/categories-shared.ts](figma-plugin/src/generators/categories-shared.ts)

**正本はこのファイル1つだけ。** 複製すると片方だけが直され、残りが腐る — `verify:bindings` の B4 がそれを防ぐ。

| 関数 | 役割 |
|---|---|
| `bindFillVar(ctx, node, varName, hex)` | 塗りを**変数にバインドする**。`fills = [solid(…)]`（raw hex）ではなく必ずこれを使う |
| `bindStrokeVar(ctx, node, varName, hex)` | 線の色を変数にバインドする |
| `boundText(ctx, chars, size, varName, hex, bold)` | テキストノードを作りつつ**色・サイズ・太さ・ファミリーをすべて変数に束縛する**。素の `txt()` の代わりに使う |
| `bindSolidFill(ctx, node, tone)` / `bindOnFill(ctx, node, tone)` | トーン面・その上の前景色を一度にバインド |
| `toneBase(ctx, tone)` / `onHex(ctx, tone)` | 現在のコンテキストにおけるトーンの base hex · on-color hex |
| `recolorIconVar(ctx, node, varName, hex)` / `recolorIconOn(ctx, node, tone)` | アイコンベクターの色を変数にバインド |
| `tintHex(hex, amt)` | 淡い背景色の計算 |

### 7. コンポーネントプロパティ（変数）の宣言 — [figma-plugin/src/generators/lib/build-set.ts](figma-plugin/src/generators/lib/build-set.ts)

React の prop が Figma の**コンポーネントプロパティ**になる地点。名前はコードが決め、Figma が従う。

| 関数 | 役割 |
|---|---|
| `buildSet(...)` | コンポーネントセットと variant 軸を作る（ユニオン prop → VARIANT 軸） |
| `addTextProp(set, prop, layer, def)` | string prop → **TEXT プロパティ** |
| `addBoolProp(set, prop, layer, def)` | `show*` boolean → **BOOLEAN プロパティ** |
| `addSwapProp(set, prop, layer, defKey)` | ReactNode スロット → **INSTANCE_SWAP プロパティ** |
| `propKeys(set)` | 表示名 → Figma の内部キー（`Title#12:3`）のマッピング。画面組み立ての `inst()` がこれを使う |
| `variantItem(ctx, set, state)` | ドキュメントページのバリアントインスタンスを作る（`state.props` / `texts` / `swaps` を適用） |

> ⚠️ `inst()` と `variantItem()` は**未知のプロパティ名を警告するだけで無視する。**
> セットのプロパティをリネームすると画面のオーバーライドが静かに切れる → `verify:screens` がそれを捕まえる唯一のゲートである。

### 8. リモート変数の注入 — [figma-plugin/src/generators/sync.ts](figma-plugin/src/generators/sync.ts)

| 関数 | 役割 |
|---|---|
| `validateTokens(json)` | 外部から取得したトークン JSON のスキーマを検証し、違反の一覧を返す |
| `importTokens(json)` | 検証済みトークンを現在の Figma ファイルの Variables に注入する |

プラグイン UI の `▸ 詳細設定 → リモート宣言の読み込み（URL）` から CDN のマニフェストを読み、同じ変数を再現できる。

### 9. ランタイムでの変数適用（Storybook 側）

| ファイル | 役割 |
|---|---|
| [src/shared/ThemeScope.tsx](src/shared/ThemeScope.tsx) | `data-theme="<preset>"` スコープを被せ、`vars-<preset>.css` の変数を適用する。Storybook ツールバーの Preset スイッチャーがこれを切り替える |
| [src/tokens/generated/theme.ts](src/tokens/generated/theme.ts) | `cssVar(token)` → `var(--ds-color-<token>)` 文字列を生成 |
| [src/tokens/generated/types.ts](src/tokens/generated/types.ts) | `ColorToken` · `SolidColorToken` · `SpacingToken` … ユニオン型 — 存在しないトークンを使えば**型チェックが捕まえる** |

### 10. 文言変数（labels）— [src/shared/labels.ts](src/shared/labels.ts)

ユーザーに見えるすべての文字も変数である。通路は `labels` prop **1つだけ**で、型とマージ関数はこのファイルが単一の情報源。

| 関数 / 型 | 役割 |
|---|---|
| `mergeLabels(defaults, labels)` | 既定値と部分的な上書きを**1段の深さまで安全にマージする**。naive spread では部分上書きが残りの既定値を消してしまう |
| `resolveLabel(...candidates)` | 優先順位の解決 — **個別 prop > `labels.*` > 既定値** |
| `resolveText(value, arg)` | 値が文字列ならそのまま、関数なら引数を入れて評価（`(n) => \`${n}件\``） |
| `RowActionsLabels` · `EmptyLabels` · `PaginationLabels` · `SearchLabels` · `Formatters` … | 共通の文言型 — **再定義せず import する** |

### 11. 変数ドリフトのゲート — [scripts/](scripts/)

| ゲート | 何がズレたら捕まえるか |
|---|---|
| `verify:parity` | tokens/\*.json ↔ presets.data.ts ↔ `--ds-*` ↔ Figma 変数名が**値・名前ともに**一致しているか |
| `verify:bindings` | 要素が本当に変数に**束縛されているか**（B1 raw fill 禁止 · B2 未バインドテキスト禁止 · B3 フォントのリテラル禁止 · B4 ヘルパーの複製禁止） |
| `verify:naming` | コードの prop・CSS クラス名 ↔ Figma のプロパティ・レイヤー名（変換なしの**完全一致**） |
| `verify:screens` | 画面の `inst()` オーバーライド ↔ セットのプロパティ名（リネームで静かに切れたオーバーライド） |
| `verify:mapping` | コンポーネントのカバレッジ — あるべきものが全部あり、無いべきものが無いか |

ゲート補助パーサ：[scripts/lib/ds-props.mjs](scripts/lib/ds-props.mjs)（`parsePropsAt` · `classifyProps` · `indexComponents`）·
[scripts/lib/figma-sets.mjs](scripts/lib/figma-sets.mjs)（`extractFigmaSets` · `getValidIconKeys`）·
[scripts/lib/css-classes.mjs](scripts/lib/css-classes.mjs)（`parseCssClasses` · `legalLayers`）。

---

## 実行

```bash
pnpm install
pnpm build:tokens                 # tokens/*.json → CSS 変数・TS 型・プラグインプリセット
pnpm storybook                    # ドキュメントサイト (http://localhost:6006)
pnpm --dir figma-plugin build     # Figma プラグインのバンドル → figma-plugin/dist/
```

Figma 側：**Plugins → Development → Import plugin from manifest…** → `figma-plugin/manifest.json` を選択 →
UI でプリセット・カラー・フォントを選び **[デザインシステム生成]**。

## 検証

```bash
pnpm verify:all     # ← これが緑のときにだけ「完了」と言ってよい
```

| コマンド | 検査 |
|---|---|
| `pnpm typecheck` | アプリの型チェック（`noUnusedLocals` 有効） |
| `pnpm typecheck:figma` | プラグインの型チェック |
| `pnpm verify:parity` | トークンの値・変数名パリティ |
| `pnpm verify:mapping` | コンポーネントのカバレッジ |
| `pnpm verify:naming` | コードの名前 ↔ Figma の名前 |
| `pnpm verify:screens` | 画面の組み立て（`inst()` オーバーライド） |
| `pnpm verify:bindings` | 要素 ↔ 変数のバインディング |
| `pnpm verify:guard` | git ガードフックが実際に噛むか（欠陥注入33件） |

## 要求環境

- **Node 20 または 22**（Storybook 8 は Node 24 未対応）
- **pnpm** — `corepack enable && corepack prepare pnpm@latest --activate`

## コントリビュート規約

作業前に [CLAUDE.md](CLAUDE.md) を読むこと。要約すると：

1. **git の状態を変える命令は禁止**（`stash` · `reset --hard` · `checkout -- .` …）— 複数のエージェントが同じワークツリーを共有する。PreToolUse フックが物理的に遮断する。
2. **ハードコーディング禁止** — 色・サイズ・余白は `var(--ds-*)`、文言は `labels` prop。
3. **既にあるものを差し置いて新規に作らない** — テーブル・空状態・ツールバー・確認ダイアログは既にある。既存のものにオプショナルな軸を足せ。
4. **「終わった」と言う前に、ゲートを実際に走らせろ。**
