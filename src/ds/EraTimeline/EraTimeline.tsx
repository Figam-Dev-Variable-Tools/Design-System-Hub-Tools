import { Image, type MediaRatio } from '../Image/Image'
// 강조색(--site-accent 계열)의 단일 출처 — 정의를 복사하지 않고 클래스를 빌려 적용만 한다.
import siteSection from '../SiteSection/SiteSection.module.css'
import styles from './EraTimeline.module.css'

/** 연혁 한 줄 — 시점(볼드) + 내용 + 부연(선택) */
export type EraEntry = {
  /** '2019년 5월'처럼 사람이 읽는 시점 문자열 */
  date: string
  /** 그 시점에 있었던 일 — 한 줄 */
  title: string
  /** 부연 설명 — showDescription이 false면 그리지 않는다 */
  description?: string
}

/** 연대 한 칸 — 제목 + 대표 사진(선택) + 그 연대의 항목들 */
export type EraGroup = {
  /** '2019년 대'처럼 칸의 머리글 */
  era: string
  /** 없으면 Image가 공용 Placeholder로 채운다 */
  image?: string
  entries: EraEntry[]
}

export type EraTimelineProps = {
  groups: EraGroup[]
  /** 한 줄에 세우는 연대 칸 수 (기본 4) */
  columns?: 2 | 3 | 4
  /** 대표 사진 비율 (기본 1x1) */
  ratio?: MediaRatio
  /** 사진 칸 ON/OFF — false면 group.image가 있어도 그리지 않는다 */
  showImage?: boolean
  /** 항목 부연 설명 ON/OFF */
  showDescription?: boolean
  /** 머리글 아래 레일(점 + 가로선) ON/OFF */
  showRail?: boolean
  /** 레일 점·강조 색 (기본 success) */
  accent?: 'primary' | 'success'
}

/**
 * 연대별 연혁 표기 — 연대(era) 하나가 한 칸이고, 칸들이 가로로 늘어선다.
 *
 * 세로 레일(점·연결선)로 흐르는 Timeline과는 다른 물건이다:
 *   Timeline   — 한 축을 따라 내려가는 이벤트 목록(상태 done/active/pending이 있다).
 *   EraTimeline — 연대를 '열'로 늘어놓고 각 열에 그 시기의 사진·항목을 담는다(모두 지나간 일).
 * 그래서 Timeline을 포크하지 않고 별도 컴포넌트로 둔다.
 *
 * 색은 SiteSection이 내려주는 강조색만 소비한다(사본 금지). 사진은 공용 Image가 그린다.
 */
export function EraTimeline({
  groups,
  columns = 4,
  ratio = '1x1',
  showImage = true,
  showDescription = true,
  showRail = true,
  accent = 'success',
}: EraTimelineProps) {
  const rootClass = [
    styles.eras,
    styles[`cols${columns}`],
    accent === 'primary' ? siteSection.accentPrimary : siteSection.accentSuccess,
  ].join(' ')

  return (
    <ol className={rootClass}>
      {groups.map((group) => (
        <li key={group.era} className={styles.era}>
          <h3 className={styles.eraTitle}>{group.era}</h3>

          {/* 레일 — 점 하나 + 가로선. 연대 칸의 시작점을 알린다(장식). */}
          {showRail && (
            <div className={styles.rail} aria-hidden="true">
              <span className={styles.dot} />
              <span className={styles.line} />
            </div>
          )}

          {showImage && (
            <div className={styles.media}>
              <Image src={group.image} alt={group.era} ratio={ratio} rounded />
            </div>
          )}

          <ol className={styles.entries}>
            {group.entries.map((entry, index) => (
              <li key={`${group.era}-${index}`} className={styles.entry}>
                <p className={styles.date}>{entry.date}</p>
                <p className={styles.title}>{entry.title}</p>
                {showDescription && entry.description != null && entry.description !== '' && (
                  <p className={styles.description}>{entry.description}</p>
                )}
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  )
}
