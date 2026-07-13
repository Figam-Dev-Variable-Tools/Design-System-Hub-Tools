import { useId, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { mergeLabels, resolveLabel, type LabelFn, type SearchLabels } from '../../shared/labels'
import { Button } from '../Button/Button'
import { DateRangePicker } from '../DateRangePicker/DateRangePicker'
import { InputBase } from '../InputBase/InputBase'
import { MultiSelect } from '../MultiSelect/MultiSelect'
import { Select } from '../Select/Select'
import styles from './SearchPanel.module.css'

// 어드민 목록 상단의 다중 조건 검색 영역.
// 화면마다 조건이 다르므로 필드를 데이터(SearchFieldDef[])로 선언받아 그리드에 자동 배치한다.
// 라벨은 상단 배치(고정폭 라벨 없음) + 1줄 말줄임이라 컬럼 수가 바뀌어도 정렬이 무너지지 않는다.
export type SearchFieldDef =
  | { kind: 'text'; key: string; label: string; placeholder?: string; span?: number }
  | {
      kind: 'select'
      key: string
      label: string
      options: { label: string; value: string }[]
      placeholder?: string
      span?: number
    }
  | {
      kind: 'multiselect'
      key: string
      label: string
      options: { label: string; value: string }[]
      span?: number
    }
  | { kind: 'daterange'; key: string; label: string; presets?: DatePresetKey[]; span?: number }
  | { kind: 'number'; key: string; label: string; span?: number }

export type DateRangeValue = { start: string | null; end: string | null }

export type SearchValues = Record<string, string | string[] | DateRangeValue | null>

/** 기간 프리셋 — labels.presets의 키이기도 하다 */
export type DatePresetKey = 'today' | '7d' | '30d' | '90d'

/** 플레이스홀더를 갖는 필드 종류 — daterange는 자체 피커가 문구를 갖는다 */
type PlaceholderFieldKind = 'text' | 'number' | 'select' | 'multiselect'

/**
 * 검색 패널 문구 — 공용 SearchLabels에서 이 패널이 실제로 그리는 것만 받고,
 * 패널 전용 문구(섹션 이름·기간 프리셋·kind별 플레이스홀더)를 얹는다.
 * (SearchLabels.search·searchPlaceholder는 단일 검색 입력이 있는 바(FilterBar·ListToolbar)의 것이다.)
 */
export type SearchPanelLabels = Pick<
  SearchLabels,
  'reset' | 'submit' | 'submitting' | 'expand' | 'collapse' | 'hiddenCount'
> & {
  /** <section>의 접근성 이름 — 기본 '검색 조건' */
  panel?: string
  /** 기간 프리셋 버튼 */
  presets?: Partial<Record<DatePresetKey, string>>
  /** kind별 기본 플레이스홀더 — field.placeholder가 있으면 그쪽이 이긴다 */
  placeholders?: Partial<Record<PlaceholderFieldKind, string>>
}

type SearchPanelLabelsResolved = {
  panel: string
  reset: string
  submit: string
  submitting: string
  expand: string
  collapse: string
  hiddenCount: LabelFn<number>
  presets: Record<DatePresetKey, string>
  placeholders: Record<PlaceholderFieldKind, string>
}

export const DEFAULT_SEARCH_PANEL_LABELS: SearchPanelLabelsResolved = {
  panel: '검색 조건',
  reset: '초기화',
  submit: '검색',
  submitting: '검색 중…',
  expand: '상세검색',
  collapse: '상세검색 접기',
  /** 접힌 조건 수 — 펼치기 라벨 뒤에 그대로 이어 붙는다('상세검색 (+3)') */
  hiddenCount: (count) => ` (+${count})`,
  presets: {
    today: '오늘',
    '7d': '최근 7일',
    '30d': '최근 30일',
    '90d': '최근 90일',
  },
  placeholders: {
    text: '입력하세요',
    number: '숫자만 입력',
    select: '전체',
    multiselect: '전체',
  },
}

export type SearchPanelProps = {
  fields: SearchFieldDef[]
  values: SearchValues
  onChange: (values: SearchValues) => void
  onSearch?: () => void
  onReset?: () => void
  /**
   * 그리드 컬럼 수 — 기본 4(1600 콘텐츠 폭 기준). 좁아지면 2열 → 1열로 접힌다.
   * 1은 접히지 않는다 — 사이드바·모바일용 세로 한 줄 검색.
   */
  columns?: 1 | 2 | 3 | 4
  /** 상세검색 접기/펼치기 — 접히면 앞의 collapsedCount개 필드만 보인다. */
  collapsible?: boolean
  defaultCollapsed?: boolean
  /**
   * 접었을 때 보여 줄 필드 수 (기본 4).
   * 4는 4열 그리드의 '한 줄'이라는 뜻이었다 — columns를 줄이면 이 값도 함께 줄여야 한 줄이 된다.
   */
  collapsedCount?: number
  loading?: boolean
  /** 검색/초기화 옆 추가 버튼(엑셀 다운로드 등) */
  actions?: ReactNode
  /**
   * 필드 라벨 (기본 true).
   * placeholder만으로 뜻이 분명한 한두 개짜리 간이 검색줄에서는 라벨을 끈다 —
   * 이때도 각 셀은 field.label을 aria-label로 계속 들고 있어 스크린리더에서는 그대로 읽힌다.
   */
  showLabels?: boolean
  /** 초기화 버튼 (기본 true) — 조건이 하나뿐이라 지울 것이 없을 때 끈다 */
  showReset?: boolean
  /**
   * 검색 버튼 (기본 true).
   * 값이 바뀔 때마다 즉시 조회하는(onChange 기반) 화면에서는 버튼이 거짓 신호라 끈다.
   * 엔터 검색은 onSearch가 있으면 그대로 동작한다.
   */
  showSearch?: boolean
  /**
   * 카드 크롬(흰 면 + 1px 보더 + 패딩). 기본 card.
   * 이미 카드 안에 넣을 때 plain으로 껍데기를 벗겨 테두리가 겹치지 않게 한다.
   */
  appearance?: 'card' | 'plain'
  /** 상세검색 토글 아이콘 — 기본 lucide ChevronDown(펼침에 따라 회전한다) */
  collapseIcon?: ReactNode
  /** @deprecated labels.reset을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  resetLabel?: string
  /** @deprecated labels.submit을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  searchLabel?: string
  /** @deprecated labels.submitting을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  searchingLabel?: string
  /** @deprecated labels.expand를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  expandLabel?: string
  /** @deprecated labels.collapse를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  collapseLabel?: string
  /** 문구 — 개별 prop(resetLabel …)이 있으면 그쪽이 이긴다 */
  labels?: SearchPanelLabels
}

const PRESET_DAYS: Record<DatePresetKey, number> = { today: 1, '7d': 7, '30d': 30, '90d': 90 }

/** 접힌 상태에서 보여 줄 기본 필드 개수 — 4열 그리드의 한 줄 */
const DEFAULT_COLLAPSED_COUNT = 4

// ── 값 헬퍼 — SearchValues는 유니온이라 kind별로 좁혀서 쓴다 ──
function asText(value: SearchValues[string] | undefined): string {
  return typeof value === 'string' ? value : ''
}

function asList(value: SearchValues[string] | undefined): string[] {
  return Array.isArray(value) ? value : []
}

function asRange(value: SearchValues[string] | undefined): DateRangeValue {
  if (value != null && typeof value === 'object' && !Array.isArray(value)) return value
  return { start: null, end: null }
}

/** 'YYYY-MM-DD' → Date(로컬 자정). 타임존 밀림을 막기 위해 문자열을 직접 파싱한다. */
function toDate(iso: string | null): Date | null {
  if (iso == null || iso === '') return null
  const [y, m, d] = iso.split('-').map(Number)
  if (y == null || m == null || d == null) return null
  return new Date(y, m - 1, d)
}

function toISO(date: Date | null): string | null {
  if (date == null) return null
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

/** 프리셋 → 오늘을 종료일로 하는 기간(today는 당일 하루) */
function presetRange(preset: DatePresetKey): DateRangeValue {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - (PRESET_DAYS[preset] - 1))
  return { start: toISO(start), end: toISO(end) }
}

/** 초기화 시 kind별 빈 값 */
function emptyValue(field: SearchFieldDef): SearchValues[string] {
  switch (field.kind) {
    case 'multiselect':
      return []
    case 'daterange':
      return { start: null, end: null }
    case 'select':
      return null
    default:
      return ''
  }
}

export function SearchPanel({
  fields,
  values,
  onChange,
  onSearch,
  onReset,
  columns = 4,
  collapsible = true,
  defaultCollapsed = false,
  collapsedCount = DEFAULT_COLLAPSED_COUNT,
  loading = false,
  actions,
  showLabels = true,
  showReset = true,
  showSearch = true,
  appearance = 'card',
  collapseIcon,
  resetLabel,
  searchLabel,
  searchingLabel,
  expandLabel,
  collapseLabel,
  labels,
}: SearchPanelProps) {
  const uid = useId()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const L = mergeLabels(DEFAULT_SEARCH_PANEL_LABELS, labels)
  const D = DEFAULT_SEARCH_PANEL_LABELS
  const resolvedReset = resolveLabel(resetLabel, L.reset) ?? D.reset
  const resolvedSearch = resolveLabel(searchLabel, L.submit) ?? D.submit
  const resolvedSearching = resolveLabel(searchingLabel, L.submitting) ?? D.submitting
  const resolvedExpand = resolveLabel(expandLabel, L.expand) ?? D.expand
  const resolvedCollapse = resolveLabel(collapseLabel, L.collapse) ?? D.collapse

  const hasToggle = collapsible && fields.length > collapsedCount
  const isCollapsed = hasToggle && collapsed
  const visibleFields = isCollapsed ? fields.slice(0, collapsedCount) : fields
  const hiddenCount = fields.length - visibleFields.length

  const setValue = (key: string, value: SearchValues[string]) => {
    onChange({ ...values, [key]: value })
  }

  const handleReset = () => {
    const next: SearchValues = {}
    for (const field of fields) next[field.key] = emptyValue(field)
    onChange(next)
    onReset?.()
  }

  // 엔터 검색 — 인풋에서만. 셀렉트/달력 트리거(button)의 엔터는 열기 동작이므로 건드리지 않는다.
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' || loading) return
    if ((e.target as HTMLElement).tagName !== 'INPUT') return
    e.preventDefault()
    onSearch?.()
  }

  const renderControl = (field: SearchFieldDef) => {
    switch (field.kind) {
      case 'text':
        return (
          <InputBase
            value={asText(values[field.key])}
            onChange={(v) => setValue(field.key, v)}
            placeholder={field.placeholder ?? L.placeholders.text}
            disabled={loading}
          />
        )
      case 'number':
        return (
          <InputBase
            value={asText(values[field.key])}
            // 숫자만 남긴다 — 하이픈/문자 입력을 막아 서버 파싱을 단순하게 유지
            onChange={(v) => setValue(field.key, v.replace(/[^0-9]/g, ''))}
            placeholder={L.placeholders.number}
            inputMode="numeric"
            disabled={loading}
          />
        )
      case 'select':
        return (
          <Select
            value={typeof values[field.key] === 'string' ? (values[field.key] as string) : null}
            onChange={(v) => setValue(field.key, v)}
            options={field.options}
            placeholder={field.placeholder ?? L.placeholders.select}
            disabled={loading}
          />
        )
      case 'multiselect':
        return (
          <MultiSelect
            values={asList(values[field.key])}
            onChange={(v) => setValue(field.key, v)}
            options={field.options}
            placeholder={L.placeholders.multiselect}
            disabled={loading}
          />
        )
      case 'daterange': {
        const range = asRange(values[field.key])
        const presets = field.presets ?? []
        return (
          <div className={styles.range}>
            <DateRangePicker
              start={toDate(range.start)}
              end={toDate(range.end)}
              onChange={(r) => setValue(field.key, { start: toISO(r.start), end: toISO(r.end) })}
              disabled={loading}
            />
            {presets.length > 0 && (
              // 기간 프리셋은 Chip(선택형 pill)과 역할이 같지만, Chip은 루트가 div+button이라
              // 이 자리의 마크업(단일 button + aria-pressed)이 바뀐다.
              // 이 컴포넌트는 다른 화면들이 그대로 재사용 중이라 DOM을 흔들지 않는다 — 톤만 Chip과 맞춰 둔다.
              <div className={styles.presets}>
                {presets.map((preset) => {
                  const target = presetRange(preset)
                  const active = range.start === target.start && range.end === target.end
                  return (
                    <button
                      key={preset}
                      type="button"
                      className={[styles.preset, active ? styles.presetActive : '']
                        .filter(Boolean)
                        .join(' ')}
                      aria-pressed={active}
                      disabled={loading}
                      onClick={() => setValue(field.key, target)}
                    >
                      {L.presets[preset]}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      }
    }
  }

  const panelClass = [
    styles.panel,
    appearance === 'plain' ? styles.plain : '',
    loading ? styles.loading : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={panelClass}
      aria-label={L.panel}
      aria-busy={loading || undefined}
      onKeyDown={handleKeyDown}
    >
      <div
        // 1열은 좁아져도 접히지 않는다 — 이미 한 줄이라 더 접을 것이 없다
        className={[styles.grid, columns === 1 ? styles.single : ''].filter(Boolean).join(' ')}
        style={{ '--cols': columns } as CSSProperties}
      >
        {visibleFields.map((field) => {
          // span은 columns를 넘지 못하게 클램프 — 넘치면 그리드가 한 칸씩 밀린다
          const span = Math.min(Math.max(field.span ?? 1, 1), columns)
          const labelId = `${uid}-${field.key}`
          return (
            <div
              key={field.key}
              className={[styles.cell, span >= 2 ? styles.wide : ''].filter(Boolean).join(' ')}
              style={{ '--span': span } as CSSProperties}
              role="group"
              // 라벨을 감추면 참조할 요소가 사라지므로 이름을 aria-label로 직접 준다 —
              // 눈에서만 지우고 스크린리더에서는 조건 이름이 그대로 읽혀야 한다
              aria-labelledby={showLabels ? labelId : undefined}
              aria-label={showLabels ? undefined : field.label}
            >
              {showLabels && (
                <span id={labelId} className={styles.label}>
                  {field.label}
                </span>
              )}
              <div className={styles.control}>{renderControl(field)}</div>
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        {hasToggle && (
          // 펼침 상태를 알리는 버튼(aria-expanded)이라 Button으로 바꾸지 않는다 —
          // Button은 aria-expanded를 받지 않아 디스클로저 상태가 스크린리더에서 사라진다
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={!isCollapsed}
            onClick={() => setCollapsed((c) => !c)}
          >
            {/* 기본 아이콘은 svg에 직접 클래스를 건다(기존 마크업 그대로).
                커스텀 아이콘일 때만 회전축이 될 상자를 하나 씌운다 — transform은 인라인 요소에 먹지 않는다 */}
            {collapseIcon != null ? (
              <span
                className={[styles.chevron, styles.chevronWrap, isCollapsed ? '' : styles.chevronOpen]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              >
                {collapseIcon}
              </span>
            ) : (
              <ChevronDown
                size={16}
                className={[styles.chevron, isCollapsed ? '' : styles.chevronOpen]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              />
            )}
            {isCollapsed ? `${resolvedExpand}${L.hiddenCount(hiddenCount)}` : resolvedCollapse}
          </button>
        )}
        <div className={styles.buttons}>
          {actions}
          {showReset && (
            <Button
              variant="secondary"
              appearance="outline"
              size="md"
              label={resolvedReset}
              disabled={loading}
              onClick={handleReset}
            />
          )}
          {showSearch && (
            <Button
              variant="primary"
              size="md"
              label={loading ? resolvedSearching : resolvedSearch}
              disabled={loading}
              onClick={() => onSearch?.()}
            />
          )}
        </div>
      </div>
    </section>
  )
}
