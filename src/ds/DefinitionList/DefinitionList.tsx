import type { ReactNode } from 'react'
import styles from './DefinitionList.module.css'

export type DefinitionItem = {
  /** 라벨 — 좌측 고정폭, secondary */
  label: string
  /** 값 — 텍스트뿐 아니라 Badge/Tag 같은 노드도 받는다 */
  value: ReactNode
  /** 값 아래 보조 설명(가입 경로 상세, 인증 시각 등) */
  hint?: string
}

export type DefinitionListProps = {
  items: DefinitionItem[]
  /** 열 수 — 2는 좁은 폭에서 1열로 접힌다 (기본 1) */
  columns?: 1 | 2
  /** 행 구분선 (기본 true) */
  divider?: boolean
  /** 행 높이 — compact 44 / comfortable 56 (기본 compact) */
  density?: 'compact' | 'comfortable'
  /**
   * 배치 (기본 grid).
   *  - grid   : 표. 라벨 고정폭 + 행 높이 + 구분선 — 카드 안의 상세 정보용.
   *  - inline : 라벨-값을 한 줄에 붙여 가로로 흘린다. 푸터의 사업자 정보처럼
   *             "상호 ○○ · 대표 ○○ · 사업자번호 ○○"를 한 덩어리로 읽히게 할 때 쓴다.
   *             (그 자리마다 dl/dt/dd를 손으로 다시 짜던 것을 대체한다 — columns·density·divider는 무시된다)
   */
  layout?: 'grid' | 'inline'
}

/**
 * DefinitionList — 라벨-값 정의형 정보 블록(회원 유형/계정/이름/연락처 …).
 *
 * dl > div > dt+dd 구조. 구분선은 그리드 열 사이 간격 없이 이어져 한 줄로 보이고,
 * 마지막 시각 행만 CSS(:nth-last-child)로 선을 지운다 — 카드 바닥에 선이 뜨지 않게.
 */
export function DefinitionList({
  items,
  columns = 1,
  divider = true,
  density = 'compact',
  layout = 'grid',
}: DefinitionListProps) {
  const rootClass = [
    styles.root,
    columns === 2 ? styles.cols2 : styles.cols1,
    density === 'comfortable' ? styles.comfortable : styles.compact,
    divider ? styles.divided : '',
    layout === 'inline' ? styles.inline : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <dl className={rootClass}>
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className={styles.row}>
          <dt className={styles.label} title={item.label}>
            {item.label}
          </dt>
          <dd className={styles.body}>
            <div className={styles.value}>{item.value}</div>
            {item.hint != null && item.hint !== '' && (
              <div className={styles.hint} title={item.hint}>
                {item.hint}
              </div>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
