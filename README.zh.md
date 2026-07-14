# Design-System-Hub-Tools

<p align="center">
  <a href="README.md">한국어</a> ·
  <a href="README.en.md">English</a> ·
  <a href="README.ja.md">日本語</a> ·
  <b>中文</b>
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

## 项目目的 / 背景

这是一套 **Storybook（React）与 Figma 通过同一套 token、同一套命名、同一套变体相互咬合**的设计系统。
React 源码是唯一事实来源（SSOT），Figma 通过插件对其进行镜像。

### 背景 —— 为什么这样构建

设计系统崩坏的地方不在代码里，而在**两个系统之间的缝隙**。

- 设计师在 Figma 里改了主色，却有一个按钮不变 —— 那个按钮是用 raw hex 填色的，而不是绑定到变量。
- 开发把 prop 从 `Price` 改名为 `price`，Figma 画面里的 10 张商品卡全部渲染成默认价 —— 实例覆盖**连一句警告都没有**就断了。
- 同一个 GNB 菜单在两个文件里各声明一遍，于是彼此走样 —— 一个值被写第二遍的那一刻，两个值就开始分叉。

本仓库用**门禁（gate）而不是文档**来堵住这道缝隙。只要命名、取值、绑定或画面组装发生漂移，
`pnpm verify:all` 就会亮红灯。设计目标就是**不依赖人的注意力**。

### 它做什么

| | |
|---|---|
| **设计 token 的 SSOT** | 单一的 `tokens/*.json` 会**一并派生**出 Storybook 的 CSS 变量、TS 类型，以及 Figma 插件的预设。没有任何值需要手写两遍。 |
| **DS 组件库** | 155 个组件（核心、后台、站点，以及 20 个韩国本地化组件）。颜色一律 `var(--ds-*)`，文案一律走 `labels` prop。 |
| **Figma 生成器** | 插件直接在 Figma 中生成 3 个 Variables 集合、Text Styles、组件集、后台/前台页面与文档页。 |
| **7 道一致性门禁** | 以机器方式校验代码与 Figma 之间的命名、取值、绑定与画面组装。 |
| **CSS 框架对比** | Bootstrap / Tailwind / Bulma / Foundation / Materialize / Semantic / Skeleton 以 Shadow DOM 隔离，在同一画面中并排对照。 |

完整约定见 [CLAUDE.md](CLAUDE.md)，命名规则见 [docs/naming-parity.md](docs/naming-parity.md)。

---

## 技术栈

| 领域 | 技术 |
|---|---|
| 核心 | React 18 · TypeScript 5 · Vite 5 |
| 文档/目录 | Storybook 8（`@storybook/react-vite`）+ addon-essentials / a11y / designs |
| 样式 | CSS Modules · Tailwind 3.4 · SCSS（sass）· styled-components · `color-mix()` token 皮肤 |
| Token 流水线 | JSON → `scripts/build-tokens.mjs` → CSS 变量 + TS 类型 + 插件预设（并用 style-dictionary） |
| Figma | Figma Plugin API（`figma-plugin/`）· Variables · Component Set / Variant / Instance Swap |
| 校验门禁 | 7 个 Node ESM 脚本（`scripts/verify-*.mjs`）+ PreToolUse git 守卫钩子 |
| 框架（用于对比） | bootstrap · tailwindcss · bulma · foundation-sites · materialize-css · semantic-ui-css · skeleton-css |
| 图标 | Lucide（正本）· Heroicons · Tabler · Material Symbols（`?raw` SVG）· Bootstrap Icons（字体） |
| 图表 | Chart.js + react-chartjs-2 |
| 字体 | Pretendard · Inter（@fontsource） |
| 快照 | Playwright（Storybook 渲染 → PNG → 放置到 Figma） |
| 部署 | GitHub Pages（文档站 + 声明托管）· GitHub Actions · jsDelivr @gh |
| 包管理 | pnpm workspace + corepack（Node 22） |

---

## 目录结构

```
Design-System-Hub-Tools/
├─ tokens/                          # ⭐ 变量的 SSOT —— bootstrap.json · tailwind.json · toss.json
│
├─ scripts/                         # 构建与校验门禁（Node ESM）
│  ├─ build-tokens.mjs              #   token JSON → CSS 变量 · TS 类型 · 插件预设
│  ├─ build-story-manifest.mjs      #   src/ds → Figma manifest 序列化 + 往返一致性校验
│  ├─ capture-snapshots.mjs         #   Storybook 渲染 → PNG（Playwright）
│  ├─ validate-tokens.mjs           #   token schema 校验
│  ├─ verify-parity.mjs             #   ① token 取值 / 变量名一致性
│  ├─ verify-mapping.mjs            #   ② 组件覆盖率
│  ├─ verify-naming.mjs             #   ③ 代码命名 ↔ Figma 属性 / 图层名
│  ├─ verify-screen-props.mjs       #   ④ 画面 inst() 覆盖 ↔ 组件集属性名
│  ├─ verify-bindings.mjs           #   ⑤ 元素是否真的绑定到了变量（禁止 raw hex）
│  └─ lib/
│     ├─ ds-props.mjs               #     TSX props 解析器（union / boolean / string / ReactNode 分类）
│     ├─ figma-sets.mjs             #     从生成器中提取真实的 Figma 组件集声明
│     └─ css-classes.mjs            #     CSS Modules 类名 ↔ 图层名 比对
│
├─ src/
│  ├─ tokens/
│  │  ├─ generated/                 # ⚙️ build-tokens 的产物（禁止手改）
│  │  │  ├─ vars-bootstrap.css      #     --ds-* CSS 变量（按预设）
│  │  │  ├─ vars-tailwind.css
│  │  │  ├─ vars-toss.css
│  │  │  ├─ types.ts                #     ColorToken · SolidColorToken · SpacingToken … 联合类型
│  │  │  └─ theme.ts                #     presets 对象 + cssVar()
│  │  └─ motion.css                 #   动效 token
│  │
│  ├─ shared/                       # 公共基础设施（唯一来源）
│  │  ├─ labels.ts                  #   ⭐ 文案变量 —— 公共 Labels 类型 · mergeLabels · resolveLabel
│  │  ├─ ThemeScope.tsx             #   data-theme 预设切换器（应用 token CSS 变量）
│  │  ├─ FrameworkScope.tsx         #   框架 CSS 只注入 Shadow DOM 内部（全局隔离）
│  │  ├─ mediaMock.ts               #   mock 图片的唯一来源
│  │  ├─ tableExport.ts             #   表格导出辅助函数
│  │  └─ placeholders.tsx           #   占位原语
│  │
│  ├─ ds/                           # 设计系统组件 155 个
│  │  ├─ Button · TextField · Table · Badge · Dialog …          # 核心原语
│  │  ├─ AdminListPage · AdminFormPage · AdminShell · AdminTable # 后台外壳（页面由外壳组装而成）
│  │  ├─ SiteSection · SiteHeader · PortfolioPage · ShopPage …   # 站点（前台）页面
│  │  └─ kr/                        #   韩国本地化 20 个（身份证号·银行账号·银行卡·地址·实名认证·电子签名）
│  │     └─ format.ts               #     自动连字符格式化 + 校验式（身份证/营业执照/卡号 Luhn）
│  │
│  ├─ templates/                    # 页面模板（AdminSuite · SiteSuite · Dashboard · Login · Settings）
│  ├─ frameworks/                   # 7 个 CSS 框架展示 + Compare
│  ├─ icons/ · styling/ · animations/ · foundation/ · docs/     # story 与 MDX 文档
│
├─ figma-plugin/                    # Figma 插件（独立 bundle、独立 tsconfig）
│  └─ src/
│     ├─ code.ts                    #   插件入口 —— UI 消息 → 生成流水线
│     ├─ ui.html                    #   ⭐ 变量输入 UI（预设 · 9 种颜色 · 字体 · 基准字号 · 倍率）
│     ├─ presets.ts                 #   ⭐ 键名清单 · computeSizes · hexToRgb · firstFontFamily
│     ├─ presets.data.ts            #   ⚙️ build-tokens 的产物（tokens/*.json 的镜像 · 禁止手改）
│     └─ generators/
│        ├─ tokens.ts               #   ⭐ 生成 Figma Variables 的 3 个集合（generateTokens）
│        ├─ tone.ts                 #   ⭐ solid/on 颜色派生公式（与 build-tokens 完全一致）
│        ├─ sync.ts                 #   ⭐ 远程 token JSON 的校验与注入（validateTokens · importTokens）
│        ├─ categories-shared.ts    #   ⭐ 绑定辅助函数的正本（bindFillVar · boundText …）
│        ├─ lib/build-set.ts        #   ⭐ 组件集 · variant 轴 · 属性的正本（buildSet · variantItem）
│        ├─ categories*.ts          #   组件分类页（Input/Action/Feedback/Nav/Data/KR/Media…）
│        ├─ admin.ts · screens.ts   #   后台组件 · 后台页面 26 个
│        ├─ site.ts · site-screens.ts #  前台组件 · 前台页面 5 个
│        ├─ foundations.ts · docs.ts  #  Design System · Icon System · 文档页
│        └─ snapshots.ts            #   放置 Storybook 快照 PNG
│
├─ packages/figma-story-tools/      # manifest 分发包（npm/CDN）
├─ docs/                            # 规格 · 命名一致性 · known-issues · 过程日志
├─ site/                            # GitHub Pages 静态托管（声明 JSON）
└─ .storybook/                      # Storybook 配置（main.ts · preview.tsx）
```

---

## 变量管理 —— 文件与主要函数

变量**只在一个地方声明，并且只朝一个方向流动**：

```
tokens/*.json  （SSOT —— 人类唯一会改的地方）
      │
      └── scripts/build-tokens.mjs
              ├──▶ src/tokens/generated/vars-*.css     (--ds-*)         → Storybook 运行时
              ├──▶ src/tokens/generated/types.ts       (联合类型)        → 编译期安全网
              ├──▶ src/tokens/generated/theme.ts       (presets · cssVar)
              └──▶ figma-plugin/src/presets.data.ts    (插件内置预设)
                          │
                          └── figma-plugin/src/generators/tokens.ts
                                  └──▶ Figma Variables 3 个集合（color/* · font/* · radius/* · spacing/*）
                                          │
                                          └── categories-shared.ts · lib/build-set.ts
                                                  └──▶ 每个节点的 fill / stroke / text 都**绑定**到变量
```

关键在于 `presets.data.ts` 是**构建出来的、而不是手写的** —— 所以 Storybook 与 Figma 的取值**不可能分叉**。

### 1. 变量原本（SSOT）

| 文件 | 内容 |
|---|---|
| [tokens/toss.json](tokens/toss.json) · [tokens/bootstrap.json](tokens/bootstrap.json) · [tokens/tailwind.json](tokens/tailwind.json) | 3 个预设。每个文件含 `color`（10 键）· `typography`（fontFamily · baseSize · scale · sizes · weights）· `radius`（3）· `spacing`（6）。 |

颜色只写 10 个 base 键（`primary` `secondary` `error` `success` `warning` `neutral` `bg` `bgSubtle` `text` `border`）。
色阶（100–900）、`solid-*`、`on-*` **不写 —— 由计算派生**（见 §2）。

### 2. Token 构建 —— [scripts/build-tokens.mjs](scripts/build-tokens.mjs)

| 函数 | 作用 |
|---|---|
| `mixHex(hex, target, amt)` | 按比例混合两种颜色 —— 派生色阶（100–900）的基础 |
| `relLuminance(hex)` / `contrastRatio(a, b)` | 计算 WCAG 相对亮度与对比度 |
| `solidColorFor(base)` | 从 base 色调算出**能让白字通过 AA（4.5:1）的面色** → `--ds-color-solid-*` |
| `onColorFor(base)` | 算出该 solid 面之上的前景色（保证 AA） → `--ds-color-on-*` |
| `px(n)` · `union(keys)` · `varKeys(name)` | 产物序列化辅助（CSS px · TS 联合类型 · 变量名清单） |

四类产物：`vars-<preset>.css` · `types.ts` · `theme.ts` · `figma-plugin/src/presets.data.ts`。

### 3. Figma 变量声明 —— [figma-plugin/src/generators/tokens.ts](figma-plugin/src/generators/tokens.ts)

| 函数 / 常量 | 作用 |
|---|---|
| `COLLECTION_NAMES` | 要创建的 3 个集合 —— `DS Color` · `DS Typography` · `DS Radius·Spacing` |
| `guardExisting()` | **幂等守卫** —— 若同名集合已存在则中止生成（绝不删除） |
| `generateTokens(payload)` | 接收 UI 输入（预设、颜色、字体、基准字号、倍率）并创建 Figma Variables |

`generateTokens` 产出的变量名与 Storybook 的 `--ds-*` **一一对应**：

| Figma 变量 | Storybook CSS 变量 | 说明 |
|---|---|---|
| `color/<key>` | `--ds-color-<key>` | 10 个 base 色。`DS Color` 有**3 个模式**（bootstrap · tailwind · toss） |
| `color/<key>/<step>` | `--ds-color-<key>-<step>` | 色阶 100–900（按模式从 base 计算） |
| `color/solid-<key>` | `--ds-color-solid-<key>` | 通过 AA 的面色 |
| `color/on-<key>` | `--ds-color-on-<key>` | solid 面之上的前景色 |
| `font/family` | `--ds-font-family` | **只能是一个字体族名** —— 传入完整 CSS 字体栈会导致节点创建失败 |
| `font/size/<key>` | `--ds-font-size-<key>` | `computeSizes(baseSize, scale)` 得到的 6 级 |
| `font/weight/<key>` | `--ds-font-weight-<key>` | regular · medium · bold |
| `radius/<key>` · `spacing/<key>` | `--ds-radius-<key>` · `--ds-spacing-<key>` | |

### 4. 键名清单与取值转换 —— [figma-plugin/src/presets.ts](figma-plugin/src/presets.ts)

| 函数 / 常量 | 作用 |
|---|---|
| `COLOR_KEYS` · `SIZE_KEYS` · `WEIGHT_KEYS` · `RADIUS_KEYS` · `SPACING_KEYS` | 各个轴的正本键名清单（不在此处的键即不存在） |
| `computeSizes(baseSize, scale)` | 基准字号 × 倍率 → `xs…xxl` 6 级。UI 的「基准字号 / 字号倍率」输入落到这里 |
| `hexToRgb(hex)` / `rgbToHex(rgb)` | UI 取色器 ↔ Figma RGB 的互转 |
| `firstFontFamily(stack)` | 从 CSS 字体栈中**只取第一个字体族**（Figma 不认识字体栈 —— 传进去会因 unloaded font 而失败） |
| `PRESETS` | 直接导出 `presets.data.ts`（即 tokens/*.json 的镜像） |

### 5. 派生色公式（Figma 侧）—— [figma-plugin/src/generators/tone.ts](figma-plugin/src/generators/tone.ts)

| 函数 | 作用 |
|---|---|
| `solidToneHex(base)` / `onToneHex(base)` | 与 build-tokens 的 `solidColorFor` / `onColorFor` 使用**完全相同的公式**。两边若走样，`verify:parity` 会抓到 |
| `solidVarName(tone)` / `onVarName(tone)` | 生成 `color/solid-<tone>` · `color/on-<tone>` 的名字 |

### 6. 绑定辅助函数（元素被绑到变量的地方）—— [figma-plugin/src/generators/categories-shared.ts](figma-plugin/src/generators/categories-shared.ts)

**正本只有这一个文件。** 一旦复制，就只有其中一份会被修好，其余的会腐烂 —— `verify:bindings` 的 B4 规则正是为此而设。

| 函数 | 作用 |
|---|---|
| `bindFillVar(ctx, node, varName, hex)` | 把填充**绑定到变量**。必须用它，而不是 `fills = [solid(…)]`（raw hex） |
| `bindStrokeVar(ctx, node, varName, hex)` | 把描边颜色绑定到变量 |
| `boundText(ctx, chars, size, varName, hex, bold)` | 创建文本节点，并把**颜色、字号、字重、字体族全部绑定**到变量。用它代替裸的 `txt()` |
| `bindSolidFill(ctx, node, tone)` / `bindOnFill(ctx, node, tone)` | 一次性绑定色调面 / 其上的前景色 |
| `toneBase(ctx, tone)` / `onHex(ctx, tone)` | 当前上下文中某个色调的 base hex / on-color hex |
| `recolorIconVar(ctx, node, varName, hex)` / `recolorIconOn(ctx, node, tone)` | 把图标矢量的颜色绑定到变量 |
| `tintHex(hex, amt)` | 计算浅色背景 |

### 7. 组件属性（变量）声明 —— [figma-plugin/src/generators/lib/build-set.ts](figma-plugin/src/generators/lib/build-set.ts)

这是 React 的 prop 变成 Figma **组件属性**的地方。名字由代码决定，Figma 照办。

| 函数 | 作用 |
|---|---|
| `buildSet(...)` | 创建组件集及其 variant 轴（联合类型 prop → VARIANT 轴） |
| `addTextProp(set, prop, layer, def)` | string prop → **TEXT 属性** |
| `addBoolProp(set, prop, layer, def)` | `show*` boolean → **BOOLEAN 属性** |
| `addSwapProp(set, prop, layer, defKey)` | ReactNode 插槽 → **INSTANCE_SWAP 属性** |
| `propKeys(set)` | 显示名 → Figma 内部键（`Title#12:3`）的映射。画面组装的 `inst()` 依赖它 |
| `variantItem(ctx, set, state)` | 为文档页构建变体实例（应用 `state.props` / `texts` / `swaps`） |

> ⚠️ `inst()` 与 `variantItem()` 对**未知的属性名只警告、然后忽略**。
> 一旦给组件集的属性改名，画面的覆盖就会静默失效 → `verify:screens` 是唯一能抓到它的门禁。

### 8. 远程变量注入 —— [figma-plugin/src/generators/sync.ts](figma-plugin/src/generators/sync.ts)

| 函数 | 作用 |
|---|---|
| `validateTokens(json)` | 校验外部获取的 token JSON 的 schema，并返回违规清单 |
| `importTokens(json)` | 把通过校验的 token 注入当前 Figma 文件的 Variables |

通过插件 UI 的 `▸ 详细设置 → 载入远程声明（URL）`，可读取 CDN 上的 manifest 并复现同一套变量。

### 9. 运行时的变量应用（Storybook 侧）

| 文件 | 作用 |
|---|---|
| [src/shared/ThemeScope.tsx](src/shared/ThemeScope.tsx) | 套上 `data-theme="<preset>"` 作用域，从而应用 `vars-<preset>.css` 的变量。Storybook 工具栏的 Preset 切换器驱动它 |
| [src/tokens/generated/theme.ts](src/tokens/generated/theme.ts) | `cssVar(token)` → 生成 `var(--ds-color-<token>)` 字符串 |
| [src/tokens/generated/types.ts](src/tokens/generated/types.ts) | `ColorToken` · `SolidColorToken` · `SpacingToken` … 联合类型 —— 用了不存在的 token 会被**类型检查抓住** |

### 10. 文案变量（labels）—— [src/shared/labels.ts](src/shared/labels.ts)

所有对用户可见的文字同样是变量。通道**只有一个** —— `labels` prop，其类型与合并函数以此文件为唯一来源。

| 函数 / 类型 | 作用 |
|---|---|
| `mergeLabels(defaults, labels)` | 把默认值与部分覆盖**安全地合并到一层深**。用 naive spread 的话，部分覆盖会把其余默认值抹掉 |
| `resolveLabel(...candidates)` | 优先级解析 —— **单独的 prop > `labels.*` > 默认值** |
| `resolveText(value, arg)` | 值是字符串就原样返回，是函数就带参求值（`(n) => \`${n} 条\``） |
| `RowActionsLabels` · `EmptyLabels` · `PaginationLabels` · `SearchLabels` · `Formatters` … | 公共文案类型 —— **直接 import，不要重新定义** |

### 11. 变量漂移门禁 —— [scripts/](scripts/)

| 门禁 | 走样时它会抓什么 |
|---|---|
| `verify:parity` | tokens/\*.json ↔ presets.data.ts ↔ `--ds-*` ↔ Figma 变量名，在**取值与命名两方面**是否一致 |
| `verify:bindings` | 元素是否真的**绑定**到了变量（B1 禁止 raw fill · B2 禁止未绑定文本 · B3 禁止字体字面量 · B4 禁止复制辅助函数） |
| `verify:naming` | 代码的 prop / CSS 类名 ↔ Figma 的属性 / 图层名（不做任何转换的**精确匹配**） |
| `verify:screens` | 画面的 `inst()` 覆盖 ↔ 组件集的属性名（因改名而静默断掉的覆盖） |
| `verify:mapping` | 组件覆盖率 —— 该有的都有，不该有的没有 |

门禁所用的解析器：[scripts/lib/ds-props.mjs](scripts/lib/ds-props.mjs)（`parsePropsAt` · `classifyProps` · `indexComponents`）·
[scripts/lib/figma-sets.mjs](scripts/lib/figma-sets.mjs)（`extractFigmaSets` · `getValidIconKeys`）·
[scripts/lib/css-classes.mjs](scripts/lib/css-classes.mjs)（`parseCssClasses` · `legalLayers`）。

---

## 运行

```bash
pnpm install
pnpm build:tokens                 # tokens/*.json → CSS 变量 · TS 类型 · 插件预设
pnpm storybook                    # 文档站 (http://localhost:6006)
pnpm --dir figma-plugin build     # Figma 插件打包 → figma-plugin/dist/
```

在 Figma 中：**Plugins → Development → Import plugin from manifest…** → 选择 `figma-plugin/manifest.json` →
在 UI 中选择预设 / 颜色 / 字体 → **[生成设计系统]**。

## 校验

```bash
pnpm verify:all     # ← 只有它全绿，才可以说「完成」
```

| 命令 | 检查内容 |
|---|---|
| `pnpm typecheck` | 应用的类型检查（已开启 `noUnusedLocals`） |
| `pnpm typecheck:figma` | 插件的类型检查 |
| `pnpm verify:parity` | token 取值 / 变量名一致性 |
| `pnpm verify:mapping` | 组件覆盖率 |
| `pnpm verify:naming` | 代码命名 ↔ Figma 命名 |
| `pnpm verify:screens` | 画面组装（`inst()` 覆盖） |
| `pnpm verify:bindings` | 元素 ↔ 变量的绑定 |
| `pnpm verify:guard` | git 守卫钩子是否真的会咬（33 个注入缺陷） |

## 环境要求

- **Node 20 或 22**（Storybook 8 不支持 Node 24）
- **pnpm** —— `corepack enable && corepack prepare pnpm@latest --activate`

## 贡献约定

动手前请先读 [CLAUDE.md](CLAUDE.md)。要点：

1. **禁止任何改变 git 状态的命令**（`stash` · `reset --hard` · `checkout -- .` …）—— 多个 agent 共用同一个 worktree。PreToolUse 钩子会从物理上拦截。
2. **禁止硬编码** —— 颜色、尺寸、间距一律走 `var(--ds-*)`，文案一律走 `labels` prop。
3. **已有的东西不要另起炉灶重做** —— 表格、空状态、工具栏、确认弹窗都已存在。请给现有组件加一个可选的轴。
4. **在说「做完了」之前，真的把门禁跑一遍。**
