/* ─────────────────────────────────────────────────────────────────────────────
   문구(labels) 공용 규약 — 화면에 나오는 모든 글자를 밖에서 갈아끼우기 위한 통로.

   [왜 이 파일이 있나]
   같은 문구가 컴포넌트마다 다른 이름으로 열려 있으면(어떤 건 emptyText, 어떤 건 emptyTitle,
   어떤 건 아예 안 열림) 쓰는 쪽이 매번 API를 외워야 한다. 그래서
     · 문구를 여는 통로는 `labels` prop **하나**로 통일하고,
     · 여러 컴포넌트가 공유하는 문구 묶음(행 액션·확인창·빈 상태·건수·검색…)의 **타입을 여기 한 곳**에 둔다.
   컴포넌트는 이 타입을 재정의하지 않고 그대로 가져다 쓴다 — 같은 문구가 두 이름으로 존재하는 것을 막는다.

   [규약]
   1. 통로 이름은 `labels`. 항상 옵셔널이고, 넘기지 않으면 오늘과 100% 같은 화면이 나온다.
   2. 중첩은 '표면(surface)' 기준 **1단계까지만** 판다: columns / status / tabs / rowActions /
      bulk / toolbar / search / empty / deleteDialog …
      접근성 이름(aria-label)도 별도 버킷을 만들지 않고 그 표면 그룹 안에 둔다
      (행의 '수정' 버튼은 툴팁이자 접근성 이름이다 — 문구가 둘일 이유가 없다).
   3. 값은 문자열이거나, 값을 끼워 넣어야 할 때만 **인자 1개짜리 함수**다(`(n) => \`선택 ${n}건\``).
      인자가 둘 이상 필요하면 객체 하나로 묶어 받는다.
   4. 숫자·통화·날짜는 '문구'가 아니라 '포맷'이므로 labels가 아니라 `formatters`로 연다.
   5. 기존 개별 카피 prop(emptyText, createLabel …)은 **제거하지 않는다**. 우선순위는
      `개별 prop > labels.* > 기본값` 이고, 해석은 resolveLabel() 한 줄로 통일한다.
      → 두 통로를 동시에 넘겨도 기존 화면의 동작이 바뀌지 않는다.

   [Figma 파리티]
   여기서 정한 prop 이름이 그대로 Figma 컴포넌트의 TEXT 속성 이름이 된다(docs/naming-parity.md).
   중첩 키는 점 표기로 평탄화된다: labels.columns.name → Figma TEXT 속성 'labels.columns.name'.
   ───────────────────────────────────────────────────────────────────────────── */

/** 값을 끼워 넣는 문구는 인자 1개짜리 함수만 허용한다(둘 이상이면 객체 하나로 묶는다). */
export type LabelFn<A> = (arg: A) => string

/** 키 집합이 정해진 문구 묶음 — 컬럼·상태·탭 */
export type ColumnLabels<K extends string> = Partial<Record<K, string>>
export type StatusLabels<K extends string> = Partial<Record<K, string>>
export type TabLabels<K extends string> = Partial<Record<K | 'all', string>>

/** 빈 상태 — EmptyState로 그대로 흘려보낸다(CTA 포함) */
export type EmptyLabels = {
  title?: string
  description?: string
  /** 있으면 CTA 버튼이 뜬다(onAction과 짝) */
  actionLabel?: string
}

/** 확인창 — 삭제·상태변경 확인창의 단일 모양(CrudDialog로 흘려보낸다) */
export type ConfirmDialogLabels<TArg = string[]> = {
  title?: string
  /** 기본: (ids) => `${ids.length}건이 삭제됩니다.` */
  description?: string | LabelFn<TArg>
  confirmLabel?: string
  cancelLabel?: string
}

/** 행 액션(RowActions) — 툴팁이자 접근성 이름이다 */
export type RowActionsLabels = {
  /** role="group"의 이름. 기본 '행 액션' */
  group?: string
  view?: string
  edit?: string
  delete?: string
}

/** 행 이름을 끼워 넣는 표·카드용 — rowLabel은 그 행의 제목이다 */
export type RowScopedActionLabels = {
  view?: LabelFn<string>
  edit?: LabelFn<string>
  delete?: LabelFn<string>
  more?: LabelFn<string>
  reorder?: LabelFn<string>
  thumbnailAlt?: LabelFn<string>
  /** 썸네일이 없을 때의 대체 문구. 기본 '이미지 없음' */
  thumbnailEmpty?: string
}

/** 표 툴바 — 내보내기·컬럼 피커 */
export type TableToolbarLabels = {
  csv?: string
  excel?: string
  columnPicker?: string
  columnPickerTitle?: string
}

/** 선택 바(일괄 액션) — 표·카드 그리드·셸이 공유한다 */
export type BulkLabels = {
  /** 기본: (n) => `선택 ${n}건` */
  selectedCount?: LabelFn<number>
  delete?: string
}

/** 건수 표기 — ListToolbar·AdminListView·셸이 공유한다 */
export type TotalLabels = {
  /** 기본 '총'. null이면 접두사 없이 숫자만 */
  prefix?: string | null
  /** 기본 '건' */
  unit?: string
  /** 통째로 교체 — 주면 prefix/unit을 무시한다 */
  count?: LabelFn<number>
}

/** 검색 — FilterBar·SearchPanel·ListToolbar·셸이 공유한다 */
export type SearchLabels = {
  /** 검색 입력의 접근성 이름(placeholder는 이름이 아니다) */
  search?: string
  searchPlaceholder?: string
  reset?: string
  submit?: string
  submitting?: string
  expand?: string
  collapse?: string
  /** 접힌 조건 수. 기본: (n) => ` (+${n})` */
  hiddenCount?: LabelFn<number>
}

/** 페이지네이션 */
export type PaginationLabels = {
  nav?: string
  prev?: string
  next?: string
  first?: string
  last?: string
  /** 기본: (p) => `${p}페이지` */
  page?: LabelFn<number>
  ellipsis?: string
}

/** 값이 없는 셀 표기 — 기본 '-'. 표 3종과 상세가 공유한다 */
export type EmptyCellLabels = {
  emptyCell?: string
}

/** 로딩 오버레이 — 기본 '불러오는 중' */
export type LoadingLabels = {
  loading?: string
}

/**
 * 문구가 아니라 '포맷'이다 — 로케일·통화 기호는 labels로 열지 않는다.
 * 문구를 바꾸는 것과 1,234를 1.234로 쓰는 것은 다른 문제이기 때문이다.
 */
export type Formatters = {
  /** 기본 n.toLocaleString('ko-KR') */
  number?: (value: number) => string
  /** 기본 `₩${n.toLocaleString('ko-KR')}` */
  price?: (value: number) => string
  date?: (value: string | Date) => string
}

/** 그룹(1단계)까지만 Partial — 2단계 이상은 규약상 존재하지 않는다 */
export type DeepPartialOneLevel<T> = {
  [K in keyof T]?: T[K] extends (...args: never[]) => unknown
    ? T[K]
    : T[K] extends Record<string, unknown>
      ? Partial<T[K]>
      : T[K]
}

/**
 * 그룹 단위 얕은 병합.
 *
 * naive spread(`{ ...defaults, ...labels }`)를 쓰면 `labels={{ columns: { title: 'X' } }}` 하나가
 * 나머지 컬럼 기본값을 통째로 지운다 — 부분 오버라이드가 목적이므로 그건 사고다.
 * 그래서 그룹(1단계)만 다시 얕게 합치고, 문자열·함수는 통째로 교체하며, undefined는 무시한다.
 */
export function mergeLabels<T extends Record<string, unknown>>(
  defaults: T,
  overrides?: DeepPartialOneLevel<T>,
): T {
  if (overrides == null) return defaults

  const out = { ...defaults } as Record<string, unknown>

  for (const key of Object.keys(overrides) as (keyof T & string)[]) {
    const next = (overrides as Record<string, unknown>)[key]
    if (next === undefined) continue // 넘기지 않은 것과 같다 — 기본값을 지우지 않는다

    const base = (defaults as Record<string, unknown>)[key]
    const bothGroups =
      isPlainObject(base) && isPlainObject(next) // 그룹(columns·status…)이면 안에서 다시 합친다
    out[key] = bothGroups
      ? { ...(base as Record<string, unknown>), ...stripUndefined(next as Record<string, unknown>) }
      : next // 문자열·함수·null은 통째로 교체
  }

  return out as T
}

/**
 * 하위호환 해석기 — `개별 prop > labels.* > 기본값` 순으로 첫 번째 non-undefined를 돌려준다.
 * 기존 카피 prop(emptyText 등)을 지우지 않고도 labels 통로를 여는 유일한 방법이다.
 */
export function resolveLabel<T>(...candidates: (T | undefined)[]): T | undefined {
  for (const candidate of candidates) {
    if (candidate !== undefined) return candidate
  }
  return undefined
}

/** 함수·배열·null이 아닌 순수 객체(= 문구 그룹)인지 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 그룹 병합 시 undefined 값이 기본 문구를 지우지 않게 걸러낸다 */
function stripUndefined(source: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(source)) {
    if (source[key] !== undefined) out[key] = source[key]
  }
  return out
}
