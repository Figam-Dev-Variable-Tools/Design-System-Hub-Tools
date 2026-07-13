import type { CSSProperties, ReactNode } from 'react'
import { BatteryFull, Signal, Wifi } from 'lucide-react'
import styles from './MobilePreview.module.css'

export type MobilePreviewProps = {
  /** 미리보기에 그릴 내용 — 폰 화면 안에서 세로 스크롤된다 */
  children: ReactNode
  /** 화면 폭(px) — 기본 320 */
  width?: number
  /** 상단 상태바(9:41 · 신호 · 와이파이 · 배터리) — 기본 true */
  statusBar?: boolean
  /** 프레임 아래 안내 문구 — 빈 문자열이면 숨긴다 */
  note?: string
  /**
   * 하단 홈 인디케이터 (기본 true).
   * 안드로이드 3버튼 내비처럼 홈 바가 없는 기기를 흉내 낼 때 끈다.
   */
  showHomeIndicator?: boolean
  /**
   * 프레임 아래 안내 문구 노출 (기본 true).
   * note를 빈 문자열로 덮어쓰지 않고 표시만 끈다 — 문구는 그대로 두고 스크린샷만 깨끗하게 찍을 때 쓴다.
   */
  showNote?: boolean
  /** 상태바 우측 아이콘 묶음 — 기본 신호/와이파이/배터리 */
  statusIcons?: ReactNode
  /** 상태바 시계 (기본 '9:41' — 기기 목업의 관례) */
  statusTime?: string
}

const DEFAULT_NOTE = '실제 상세페이지와 다르게 보일 수 있어요'

/**
 * 상품 등록/수정 우측 실시간 미리보기 — 폰 프레임.
 *
 * 프레임/상태바는 전부 --ds-* 토큰 색만 쓰므로 프리셋·다크 전환에 자동으로 따라간다.
 * (기기 형태를 만드는 radius·베젤 두께만 로컬 상수)
 */
export function MobilePreview({
  children,
  width = 320,
  statusBar = true,
  note = DEFAULT_NOTE,
  showHomeIndicator = true,
  showNote = true,
  statusIcons,
  statusTime = '9:41',
}: MobilePreviewProps) {
  // 화면 높이는 폭에 비례(≈ 19.5:9) — 폭만 바꿔도 비율이 유지된다
  const style = { '--mp-width': `${width}px` } as CSSProperties

  return (
    <div className={styles.wrap} style={style}>
      <div className={styles.frame}>
        <div className={styles.screen}>
          {statusBar && (
            // 장식 요소 — 스크린리더는 미리보기 내용만 읽으면 된다
            <div className={styles.statusBar} aria-hidden="true">
              <span className={styles.clock}>{statusTime}</span>
              <span className={styles.notch} />
              <span className={styles.statusIcons}>
                {statusIcons ?? (
                  <>
                    <Signal size={13} strokeWidth={2.5} />
                    <Wifi size={13} strokeWidth={2.5} />
                    <BatteryFull size={16} strokeWidth={2} />
                  </>
                )}
              </span>
            </div>
          )}

          <div className={styles.viewport}>{children}</div>

          {/* 홈 인디케이터 */}
          {showHomeIndicator && (
            <div className={styles.homeBar} aria-hidden="true">
              <span className={styles.homeIndicator} />
            </div>
          )}
        </div>
      </div>

      {showNote && note !== '' && <p className={styles.note}>{note}</p>}
    </div>
  )
}
