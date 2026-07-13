// 어드민 1920 레이아웃 상수(--admin-topbar-h) — sticky 오프셋 계산에 쓴다
import '../PageContainer/layout.css'
import styles from './FormAnchorNav.module.css'

export type FormAnchorSection = {
  /** 섹션 식별자 — 사용처의 DOM id와 맞춰두면 스크롤 이동이 쉽다 */
  key: string
  label: string
  /** 유효성 오류가 있는 섹션 — 라벨 우측에 error 점을 찍는다 */
  invalid?: boolean
}

export type FormAnchorNavProps = {
  sections: FormAnchorSection[]
  /** 현재 보고 있는 섹션 key — 스크롤 스파이는 사용처가 제어한다 */
  activeKey: string
  onSelect: (key: string) => void
  /** 기본 true — 스크롤해도 좌측에 고정된다 */
  sticky?: boolean
  /**
   * 오류 섹션의 error 점 (기본 true).
   * 저장 전(제출 전)에는 아직 검증하지 않은 섹션까지 빨갛게 보이면 겁만 주므로,
   * 첫 제출 전까지 점만 끄고 같은 sections 데이터를 그대로 넘길 수 있게 한다.
   */
  showInvalidDot?: boolean
}

/**
 * 긴 폼(상품 등록·수정)의 좌측 섹션 앵커.
 *
 * 스크롤 스파이를 내장하지 않는다 — 어떤 컨테이너가 스크롤되는지(window / 내부 div)는
 * 사용처마다 다르므로 activeKey를 주입받아 표시만 한다.
 */
export function FormAnchorNav({
  sections,
  activeKey,
  onSelect,
  sticky = true,
  showInvalidDot = true,
}: FormAnchorNavProps) {
  const className = [styles.nav, sticky ? styles.sticky : ''].filter(Boolean).join(' ')

  return (
    <nav className={className} aria-label="폼 섹션">
      <ul className={styles.list}>
        {sections.map((section) => {
          const active = section.key === activeKey
          return (
            <li key={section.key} className={styles.item}>
              <button
                type="button"
                className={[styles.link, active ? styles.active : ''].filter(Boolean).join(' ')}
                // 목록 안의 현재 위치 — 링크가 아니라 버튼이므로 'true'
                aria-current={active ? 'true' : undefined}
                onClick={() => onSelect(section.key)}
              >
                <span className={styles.label}>{section.label}</span>
                {showInvalidDot && section.invalid === true && (
                  // 색만으로 상태를 전달하지 않도록 점에 label을 붙인다
                  <span className={styles.dot} role="img" aria-label="입력 오류 있음" />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
