import { useEffect, useRef, useState, type RefObject } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
  type Plugin,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { useTokenColors } from '../Chart/useTokenColors'
import { EmptyState } from '../EmptyState/EmptyState'
import {
  mergeLabels,
  resolveLabel,
  type DeepPartialOneLevel,
} from '../../shared/labels'
import styles from './AdminChart.module.css'

// line/area(LineElement·PointElement·Filler)는 kind 축이 늘어나면서 함께 등록한다
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
)

/** useTokenColors가 돌려주는 배열의 순서 (primary, secondary, error, success) */
const TONE_INDEX = { primary: 0, secondary: 1, error: 2, success: 3 } as const

/** 차트 크롬(격자·축·툴팁)에 쓰는 부가 토큰 — useTokenColors와 동일한 방식으로 ref에서 읽는다 */
const CHROME_TOKENS = ['warning', 'border', 'text', 'bg'] as const

/** 축 눈금 글자 — 본문보다 확실히 작아 데이터가 주인공으로 남는 크기(chart.js는 px 숫자만 받는다) */
const AXIS_FONT_SIZE = 11
/** 값 축 눈금 개수 상한 — 5개를 넘으면 격자가 데이터보다 촘촘해진다 */
const Y_TICK_LIMIT = 5
/** area 채움 농도(%) — 선은 또렷하게 두고 면은 배경으로 물러나는 정도 */
const AREA_FILL_PERCENT = 14
/** 선의 곡률 — 0은 각지고 1은 과장된다. 추세를 왜곡하지 않는 최소한의 완만함 */
const LINE_TENSION = 0.3

type Chrome = { warning: string; border: string; text: string; bg: string }

/**
 * ThemeScope 내부 요소(ref) 기준으로 --ds-color-{warning,border,text,bg} 를 읽는다.
 * useTokenColors가 다루지 않는 토큰만 보충하며, 동작 방식(스코프 내부 getComputedStyle)은 동일하다.
 */
function useChromeColors(ref: RefObject<HTMLElement | null>): Chrome | null {
  const [chrome, setChrome] = useState<Chrome | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const computed = getComputedStyle(ref.current)
    const read = (name: string) => computed.getPropertyValue(`--ds-color-${name}`).trim()
    const [warning, border, text, bg] = CHROME_TOKENS.map(read)
    setChrome({ warning, border, text, bg })
  }, [ref])

  return chrome
}

export type AdminChartSeries = {
  label: string
  data: number[]
  tone?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

/** 차트 종류 — line/area는 기간 추세용(막대로 그리던 매출 추이를 제 모양으로 그린다) */
export type AdminChartKind = 'bar' | 'donut' | 'line' | 'area'

/* ── 문구(labels) ───────────────────────────────────────────────────────────
   화면 문구(title·centerLabel)는 이미 열려 있었지만 <canvas>에는 접근성 이름도, 빈 상태 문구도
   없었다(스크린리더에 아무것도 읽히지 않고, 데이터가 없으면 빈 격자만 남았다). 그 둘을 연다.

   이 컴포넌트는 한때 통로 이름이 `copy`였다 — `labels`를 x축 카테고리 **데이터**가 선점하고 있었기
   때문이다. 규약에서 유일하게 벗어난 지점이라, 데이터 쪽을 `categories`로 개명해 통로 이름을
   `labels`로 되돌렸다(구 `labels: string[]`은 배열로 들어오면 카테고리로 해석해 하위호환을 지킨다).
   우선순위: 개별 prop(title·centerLabel) > labels.* > 기본값. */
type AdminChartLabelsResolved = {
  /** <canvas>의 접근성 이름 — 없으면 title을 쓰고, 그것도 없으면 이름을 붙이지 않는다 */
  ariaLabel?: string
  /** 차트 요약(대체 텍스트) — 시각장애 사용자에게 데이터를 서술한다 */
  ariaDescription?: string
  /** series/categories가 비었을 때 */
  empty: string
  /** 차트 제목 — title prop의 상위호환 자리 */
  title?: string
  /** 도넛 가운데 총합 아래 문구 — centerLabel prop의 상위호환 자리 */
  centerCaption?: string
}

export const DEFAULT_ADMIN_CHART_LABELS: AdminChartLabelsResolved = {
  empty: '표시할 데이터가 없습니다',
} as const

export type AdminChartLabels = DeepPartialOneLevel<AdminChartLabelsResolved>

export type AdminChartProps = {
  kind: AdminChartKind
  /** x축(도넛은 조각) 카테고리 — 데이터다. 문구 통로는 labels가 갖는다 */
  categories?: string[]
  series: AdminChartSeries[]
  /**
   * 화면 문구를 통째로 갈아끼우는 단일 통로 — 개별 카피 prop(title·centerLabel)이 우선한다.
   *
   * 배열을 주면 구 API(카테고리 데이터)로 해석한다 — categories로 옮기기 전 호출부가 깨지지 않게.
   * @deprecated 배열 형태(카테고리 데이터)는 categories를 쓴다. 문구는 객체로 준다.
   */
  labels?: string[] | AdminChartLabels
  /** @deprecated labels.title 을 쓰세요 (개별 prop이 labels보다 우선한다) */
  title?: string
  showLegend?: boolean
  height?: number
  stacked?: boolean
  /** @deprecated labels.centerCaption 을 쓰세요 */
  centerLabel?: string
  valueFormat?: (n: number) => string
  /** 호버 툴팁 — 대시보드 썸네일처럼 읽기만 하는 자리에서는 꺼서 인터랙션을 죽인다 */
  showTooltip?: boolean
  /** 가로 격자선(y축) — 스파크라인처럼 눈금 없이 추세만 보여줄 때 끈다 */
  showGrid?: boolean
  /** 도넛 가운데 총합 — 합계가 이미 옆 표에 있으면 꺼서 중복을 없앤다(bar에는 영향 없음) */
  showCenterTotal?: boolean
  /**
   * 막대 방향 — horizontal은 카테고리 라벨이 긴 랭킹(상품명·유입경로)용.
   * bar에만 적용된다(donut/line/area에는 영향 없음). 기본 'vertical'(= 지금 화면 그대로).
   */
  orientation?: 'vertical' | 'horizontal'
  /** 범례 위치 — 좁은 카드에 도넛을 넣을 때 right로 옮겨 세로 공간을 아낀다. 기본 'bottom' */
  legendPosition?: 'top' | 'right' | 'bottom'
}

/** 계열 tone → 실제 색. tone이 없으면 인덱스 순서대로 팔레트를 돌려쓴다. */
function toneColor(
  tone: AdminChartSeries['tone'],
  index: number,
  palette: string[],
  chrome: Chrome,
): string {
  if (tone === 'warning') return chrome.warning
  if (tone != null) return palette[TONE_INDEX[tone]] ?? palette[0]
  // tone 미지정 — primary, success, secondary, error 순으로 순환 (인접 계열 대비 확보)
  const fallback = [palette[0], palette[3], palette[1], palette[2], chrome.warning]
  return fallback[index % fallback.length] ?? palette[0]
}

/** 도넛 가운데에 총합/문구를 그리는 플러그인 */
function centerTextPlugin(total: string, caption: string | undefined, chrome: Chrome): Plugin<'doughnut'> {
  return {
    id: 'adminChartCenterText',
    afterDraw(chart) {
      const { ctx, chartArea } = chart
      if (!chartArea) return
      const x = (chartArea.left + chartArea.right) / 2
      const y = (chartArea.top + chartArea.bottom) / 2
      const family = getComputedStyle(chart.canvas).fontFamily

      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = chrome.text
      ctx.font = `600 20px ${family}`
      ctx.fillText(total, x, caption != null ? y - 9 : y)
      if (caption != null) {
        ctx.fillStyle = chrome.border
        ctx.font = `400 12px ${family}`
        ctx.fillText(caption, x, y + 12)
      }
      ctx.restore()
    },
  }
}

export function AdminChart({
  kind,
  categories,
  labels,
  series,
  title,
  showLegend = true,
  height = 260,
  stacked = false,
  centerLabel,
  valueFormat,
  showTooltip = true,
  showGrid = true,
  showCenterTotal = true,
  orientation = 'vertical',
  legendPosition = 'bottom',
}: AdminChartProps) {
  // labels가 배열이면 구 API(카테고리 데이터)다 — 그때는 문구 통로가 비어 있는 것으로 본다
  const legacyCategories = Array.isArray(labels) ? labels : undefined
  const axis = categories ?? legacyCategories ?? []

  const L = mergeLabels(DEFAULT_ADMIN_CHART_LABELS, Array.isArray(labels) ? undefined : labels)
  const scopeRef = useRef<HTMLDivElement>(null)
  const palette = useTokenColors(scopeRef)
  const chrome = useChromeColors(scopeRef)

  const format = (n: number) => (valueFormat ? valueFormat(n) : n.toLocaleString('ko-KR'))
  const ready = palette.length > 0 && chrome != null

  const heading = resolveLabel(title, L.title)
  const centerCaption = resolveLabel(centerLabel, L.centerCaption)
  // 캔버스는 스스로 이름을 갖지 못한다 — 이름을 안 주면 제목이라도 읽히게 한다
  const canvasLabel = resolveLabel(L.ariaLabel, heading)
  // 계열이 없거나 모든 계열이 빈 배열이면 격자만 남는다 — 그건 빈 상태다
  const isEmpty = series.length === 0 || series.every((s) => s.data.length === 0)

  const renderChart = () => {
    if (!ready || chrome == null) return null

    // 공통 옵션 — 툴팁/범례 색을 토큰에 맞춰 프리셋 전환에 따라간다
    const legend = {
      display: showLegend,
      position: legendPosition,
      labels: {
        color: chrome.text,
        boxWidth: 8,
        boxHeight: 8,
        usePointStyle: true,
        pointStyle: 'circle' as const,
        padding: 16,
        font: { size: 12 },
      },
    }
    const tooltip = {
      // enabled=false여도 콜백/색은 그대로 둔다 — 다시 켜면 같은 모양으로 돌아온다
      enabled: showTooltip,
      backgroundColor: chrome.text,
      titleColor: chrome.bg,
      bodyColor: chrome.bg,
      padding: 10,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label: (ctx: { dataset: { label?: string }; parsed: unknown }) => {
          const raw = ctx.parsed
          const value = typeof raw === 'number' ? raw : (raw as { y: number }).y
          const name = ctx.dataset.label ?? ''
          return name ? `${name}: ${format(value)}` : format(value)
        },
      },
    }

    if (kind === 'donut') {
      // 도넛 — 단일 계열의 각 구간을 팔레트 색으로 칠한다
      const values = series[0]?.data ?? []
      const sliceLabels = series.length > 1 ? series.map((s) => s.label) : axis
      const sliceValues = series.length > 1 ? series.map((s) => s.data[0] ?? 0) : values
      const colors = sliceValues.map((_, i) =>
        toneColor(series.length > 1 ? series[i]?.tone : undefined, i, palette, chrome),
      )
      const total = sliceValues.reduce((sum, n) => sum + n, 0)

      const options: ChartOptions<'doughnut'> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: { legend, tooltip },
      }

      return (
        <Doughnut
          data={{
            labels: sliceLabels,
            datasets: [
              {
                label: series[0]?.label ?? '',
                data: sliceValues,
                backgroundColor: colors,
                borderColor: chrome.bg,
                borderWidth: 2,
                hoverOffset: 4,
              },
            ],
          }}
          options={options}
          // 가운데 총합은 플러그인이 그린다 — 끄면 플러그인 자체를 붙이지 않는다(빈 텍스트 그리기 금지)
          plugins={showCenterTotal ? [centerTextPlugin(format(total), centerCaption, chrome)] : []}
        />
      )
    }

    if (kind === 'line' || kind === 'area') {
      // 선/영역 — 기간 추세용. 격자·축·툴팁 크롬은 막대와 같게 두어 대시보드에서 나란히 읽힌다.
      const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend, tooltip },
        scales: {
          x: {
            stacked,
            grid: { display: false },
            border: { color: chrome.border },
            ticks: { color: chrome.border, font: { size: AXIS_FONT_SIZE }, padding: 6 },
          },
          y: {
            stacked,
            beginAtZero: true,
            border: { display: false },
            grid: { display: showGrid, color: chrome.border, lineWidth: 1, tickLength: 0 },
            ticks: {
              color: chrome.border,
              font: { size: AXIS_FONT_SIZE },
              padding: 8,
              maxTicksLimit: Y_TICK_LIMIT,
              callback: (value) => format(Number(value)),
            },
          },
        },
      }

      return (
        <Line
          data={{
            labels: axis,
            datasets: series.map((s, i) => {
              const color = toneColor(s.tone, i, palette, chrome)
              return {
                label: s.label,
                data: s.data,
                borderColor: color,
                // area만 면을 채운다 — 같은 색을 옅게 깔아 선과 한 계열로 읽히게 한다
                backgroundColor:
                  kind === 'area'
                    ? `color-mix(in srgb, ${color} ${AREA_FILL_PERCENT}%, transparent)`
                    : color,
                fill: kind === 'area',
                borderWidth: 2,
                tension: LINE_TENSION,
                pointRadius: 0,
                // 점은 평소엔 숨기고 hover에서만 띄운다 — 90일치를 그려도 선이 지저분해지지 않는다
                pointHoverRadius: 4,
                pointBackgroundColor: color,
              }
            }),
          }}
          options={options}
        />
      )
    }

    // 바 — 격자선 최소(값 축만), 축 라벨은 작게
    const horizontal = orientation === 'horizontal'
    // 가로 막대는 값 축이 x로 바뀐다 — 격자·눈금 포맷도 그 축을 따라가야 한다
    const valueAxis = {
      stacked,
      beginAtZero: true,
      border: { display: false },
      grid: { display: showGrid, color: chrome.border, lineWidth: 1, tickLength: 0 },
      ticks: {
        color: chrome.border,
        font: { size: AXIS_FONT_SIZE },
        padding: 8,
        maxTicksLimit: Y_TICK_LIMIT,
        callback: (value: string | number) => format(Number(value)),
      },
    }
    const categoryAxis = {
      stacked,
      grid: { display: false },
      border: { color: chrome.border },
      ticks: { color: chrome.border, font: { size: AXIS_FONT_SIZE }, padding: 6 },
    }

    const options: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: horizontal ? 'y' : 'x',
      plugins: { legend, tooltip },
      scales: {
        x: horizontal ? valueAxis : categoryAxis,
        y: horizontal ? categoryAxis : valueAxis,
      },
    }

    return (
      <Bar
        data={{
          labels: axis,
          datasets: series.map((s, i) => ({
            label: s.label,
            data: s.data,
            backgroundColor: toneColor(s.tone, i, palette, chrome),
            borderRadius: 4,
            borderSkipped: false as const,
            maxBarThickness: 28,
          })),
        }}
        options={options}
      />
    )
  }

  return (
    <div ref={scopeRef} className={styles.root}>
      {heading != null && heading !== '' && <h3 className={styles.title}>{heading}</h3>}
      <div
        className={styles.canvas}
        style={{ height }}
        // 캔버스는 그림이라 스크린리더가 읽을 것이 없다 — 이름과 요약을 여기서 준다
        role={isEmpty ? undefined : 'img'}
        aria-label={isEmpty ? undefined : canvasLabel}
        aria-description={isEmpty ? undefined : L.ariaDescription}
      >
        {isEmpty ? <EmptyState kind="empty" title={L.empty} compact /> : renderChart()}
      </div>
    </div>
  )
}
