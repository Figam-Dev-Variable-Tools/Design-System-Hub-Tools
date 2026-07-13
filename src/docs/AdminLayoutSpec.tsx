import { useState } from 'react'
import { ThemeScope } from '../shared/ThemeScope'
import { AdminGrid, AdminGridItem } from '../ds/AdminGrid/AdminGrid'
import styles from './AdminLayoutSpec.module.css'

/*
 * 어드민 1920 레이아웃 규격 도식 — 아래 상수는 src/ds/PageContainer/layout.css 의
 * --admin-* 커스텀 프로퍼티와 1:1로 대응한다(수치를 바꾸면 양쪽을 함께 바꾼다).
 */
const CANVAS = 1920
const SIDEBAR = 240
const SIDEBAR_COLLAPSED = 64
const PAD = 40
const COLUMNS = 12
const GUTTER = 24

const content = (sidebar: number) => CANVAS - sidebar
const usable = (sidebar: number) => content(sidebar) - PAD * 2
const columnWidth = (sidebar: number) => (usable(sidebar) - GUTTER * (COLUMNS - 1)) / COLUMNS

/** 폭 비율대로 늘어나는 도식 한 조각 */
function Seg({
  grow,
  tone,
  label,
  value,
}: {
  grow: number
  tone: 'sidebar' | 'pad' | 'usable'
  label: string
  value: string
}) {
  return (
    <div className={`${styles.seg} ${styles[tone]}`} style={{ flexGrow: grow, flexBasis: 0 }}>
      <span className={styles.segValue}>{value}</span>
      <span className={styles.segLabel}>{label}</span>
    </div>
  )
}

/** 1920 = 사이드바 + 콘텐츠(패딩 + 실사용 + 패딩) 분해도 */
export function CanvasDiagram() {
  const [collapsed, setCollapsed] = useState(false)
  const sidebar = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR

  return (
    <ThemeScope preset="toss">
      <div className={styles.wrap}>
        <div className={styles.toolbar}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={collapsed}
              onChange={(event) => setCollapsed(event.target.checked)}
            />
            사이드바 접힘 (240 → 64)
          </label>
          <span className={styles.formula}>
            {CANVAS} − {sidebar} = <strong>{content(sidebar)}</strong> → 패딩 {PAD} × 2 제외 ={' '}
            <strong>{usable(sidebar)}</strong>
          </span>
        </div>

        <div className={styles.canvas}>
          <div className={styles.ruler}>
            <span>0</span>
            <span>캔버스 {CANVAS}px</span>
            <span>{CANVAS}</span>
          </div>
          <div className={styles.bar}>
            <Seg grow={sidebar} tone="sidebar" label="사이드바" value={`${sidebar}`} />
            <div className={styles.contentGroup} style={{ flexGrow: content(sidebar), flexBasis: 0 }}>
              <div className={styles.contentHead}>콘텐츠 {content(sidebar)}</div>
              <div className={styles.bar}>
                <Seg grow={PAD} tone="pad" label="pad" value={`${PAD}`} />
                <Seg grow={usable(sidebar)} tone="usable" label="실사용 (12컬럼 그리드)" value={`${usable(sidebar)}`} />
                <Seg grow={PAD} tone="pad" label="pad" value={`${PAD}`} />
              </div>
            </div>
          </div>
        </div>

        <p className={styles.note}>
          컬럼 폭 = ({usable(sidebar)} − {GUTTER} × {COLUMNS - 1}) ÷ {COLUMNS} ≈{' '}
          <strong>{columnWidth(sidebar).toFixed(1)}px</strong>
        </p>
      </div>
    </ThemeScope>
  )
}

/** 상단 헤더 높이 — 1줄 72 / 2줄 104 */
export function TopbarDiagram() {
  return (
    <ThemeScope preset="toss">
      <div className={styles.wrap}>
        <div className={styles.heightRow}>
          <div className={styles.heightMeter}>72</div>
          <div className={`${styles.topbar} ${styles.topbar72}`}>
            <div className={styles.headings}>
              <span className={styles.title}>상품 관리</span>
            </div>
            <div className={styles.ghostActions}>
              <span className={styles.ghostBtn} />
              <span className={styles.ghostBtnPrimary} />
            </div>
          </div>
        </div>
        <div className={styles.heightRow}>
          <div className={styles.heightMeter}>104</div>
          <div className={`${styles.topbar} ${styles.topbar104}`}>
            <div className={styles.headings}>
              <span className={styles.crumb}>홈 › 상품 관리 › 상품 등록</span>
              <span className={styles.title}>상품 등록</span>
            </div>
            <div className={styles.ghostActions}>
              <span className={styles.ghostBtn} />
              <span className={styles.ghostBtnPrimary} />
            </div>
          </div>
        </div>
      </div>
    </ThemeScope>
  )
}

/** 12컬럼 그리드 오버레이 — 섹션 컨테이너 위에 겹쳐 확인 */
export function GridOverlayDiagram() {
  const [overlay, setOverlay] = useState(true)

  return (
    <ThemeScope preset="toss">
      <div className={styles.wrap}>
        <div className={styles.toolbar}>
          <label className={styles.toggle}>
            <input type="checkbox" checked={overlay} onChange={(event) => setOverlay(event.target.checked)} />
            12컬럼 오버레이
          </label>
          <span className={styles.formula}>
            {COLUMNS}컬럼 × gutter {GUTTER} — 실사용 {usable(SIDEBAR)} 기준 컬럼 ≈{' '}
            <strong>{columnWidth(SIDEBAR).toFixed(1)}px</strong>
          </span>
        </div>

        <div className={styles.gridStage}>
          {overlay && (
            <div className={styles.overlay} aria-hidden="true">
              <AdminGrid>
                {Array.from({ length: COLUMNS }, (_, index) => (
                  <AdminGridItem key={index} span={1} spanMd={1} spanSm={1}>
                    <div className={styles.overlayCol} />
                  </AdminGridItem>
                ))}
              </AdminGrid>
            </div>
          )}
          <AdminGrid>
            <AdminGridItem span={8}>
              <div className={styles.card}>
                <span className={styles.cardTitle}>본문 섹션 — span 8</span>
                <span className={styles.cardBody}>폼·표처럼 넓은 콘텐츠</span>
              </div>
            </AdminGridItem>
            <AdminGridItem span={4}>
              <div className={styles.card}>
                <span className={styles.cardTitle}>사이드 — span 4</span>
                <span className={styles.cardBody}>요약·상태·메타</span>
              </div>
            </AdminGridItem>
            <AdminGridItem span={6}>
              <div className={styles.card}>
                <span className={styles.cardTitle}>span 6</span>
              </div>
            </AdminGridItem>
            <AdminGridItem span={6}>
              <div className={styles.card}>
                <span className={styles.cardTitle}>span 6</span>
              </div>
            </AdminGridItem>
          </AdminGrid>
        </div>
      </div>
    </ThemeScope>
  )
}

const MAX_WIDTHS: Array<[string, number, string]> = [
  ['full', 1600, '표·대시보드 — 실사용 폭 전체'],
  ['lg', 1200, '일반 상세 페이지 (기본)'],
  ['md', 768, '폼 중심 — 단일 컬럼'],
]

/** PageContainer maxWidth — full / lg / md */
export function MaxWidthDiagram() {
  return (
    <ThemeScope preset="toss">
      <div className={styles.wrap}>
        {MAX_WIDTHS.map(([key, width, usage]) => (
          <div key={key} className={styles.maxRow}>
            <span className={styles.maxKey}>{key}</span>
            <div className={styles.maxTrack}>
              <div className={styles.maxFill} style={{ width: `${(width / 1600) * 100}%` }}>
                {width}px
              </div>
            </div>
            <span className={styles.maxUsage}>{usage}</span>
          </div>
        ))}
      </div>
    </ThemeScope>
  )
}
