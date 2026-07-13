import { useEffect, useRef, useState, type RefObject } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type Plugin,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { useTokenColors } from '../Chart/useTokenColors'
import styles from './AdminChart.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

/** useTokenColors가 돌려주는 배열의 순서 (primary, secondary, error, success) */
const TONE_INDEX = { primary: 0, secondary: 1, error: 2, success: 3 } as const

/** 차트 크롬(격자·축·툴팁)에 쓰는 부가 토큰 — useTokenColors와 동일한 방식으로 ref에서 읽는다 */
const CHROME_TOKENS = ['warning', 'border', 'text', 'bg'] as const

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

export type AdminChartProps = {
  kind: 'bar' | 'donut'
  labels: string[]
  series: AdminChartSeries[]
  title?: string
  showLegend?: boolean
  height?: number
  stacked?: boolean
  centerLabel?: string
  valueFormat?: (n: number) => string
  /** 호버 툴팁 — 대시보드 썸네일처럼 읽기만 하는 자리에서는 꺼서 인터랙션을 죽인다 */
  showTooltip?: boolean
  /** 가로 격자선(y축) — 스파크라인처럼 눈금 없이 추세만 보여줄 때 끈다 */
  showGrid?: boolean
  /** 도넛 가운데 총합 — 합계가 이미 옆 표에 있으면 꺼서 중복을 없앤다(bar에는 영향 없음) */
  showCenterTotal?: boolean
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
}: AdminChartProps) {
  const scopeRef = useRef<HTMLDivElement>(null)
  const palette = useTokenColors(scopeRef)
  const chrome = useChromeColors(scopeRef)

  const format = (n: number) => (valueFormat ? valueFormat(n) : n.toLocaleString('ko-KR'))
  const ready = palette.length > 0 && chrome != null

  const renderChart = () => {
    if (!ready || chrome == null) return null

    // 공통 옵션 — 툴팁/범례 색을 토큰에 맞춰 프리셋 전환에 따라간다
    const legend = {
      display: showLegend,
      position: 'bottom' as const,
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
      const sliceLabels = series.length > 1 ? series.map((s) => s.label) : labels
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
          plugins={showCenterTotal ? [centerTextPlugin(format(total), centerLabel, chrome)] : []}
        />
      )
    }

    // 바 — 격자선 최소(가로선만), 축 라벨은 작게
    const options: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend, tooltip },
      scales: {
        x: {
          stacked,
          grid: { display: false },
          border: { color: chrome.border },
          ticks: { color: chrome.border, font: { size: 11 }, padding: 6 },
        },
        y: {
          stacked,
          beginAtZero: true,
          border: { display: false },
          // 세로 격자선은 처음부터 없다(x.grid.display=false) — showGrid는 가로선만 다룬다
          grid: { display: showGrid, color: chrome.border, lineWidth: 1, tickLength: 0 },
          ticks: {
            color: chrome.border,
            font: { size: 11 },
            padding: 8,
            maxTicksLimit: 5,
            callback: (value) => format(Number(value)),
          },
        },
      },
    }

    return (
      <Bar
        data={{
          labels,
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
      {title != null && title !== '' && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.canvas} style={{ height }}>
        {renderChart()}
      </div>
    </div>
  )
}
