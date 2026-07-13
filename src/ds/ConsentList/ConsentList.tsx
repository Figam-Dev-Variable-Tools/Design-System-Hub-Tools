import type { ReactNode } from 'react'
import { Check, Minus } from 'lucide-react'
import { Badge } from '../Badge/Badge'
import { DefinitionList, type DefinitionItem } from '../DefinitionList/DefinitionList'
import styles from './ConsentList.module.css'

export type ConsentItem = {
  /** 동의 항목명 — 휴대폰 본인 인증, 마케팅 정보 수신 … */
  label: string
  agreed: boolean
  /** 상태 문구 — 생략하면 '동의' / '미동의' */
  note?: string
}

export type ConsentListProps = {
  items: ConsentItem[]
  /** 행 높이 — DefinitionList로 그대로 넘어간다. 상세 카드가 여유로울 땐 comfortable (기본 compact) */
  density?: 'compact' | 'comfortable'
  /** 열 수 — 동의 항목이 많은 회원 상세는 2열로 접는다 (기본 1) */
  columns?: 1 | 2
  /** 동의 아이콘 — 서비스 아이콘 세트가 다르면 갈아끼운다 */
  agreedIcon?: ReactNode
  /** 미동의 아이콘 */
  deniedIcon?: ReactNode
  /** note가 없는 항목의 동의 문구 — '수신' 같은 다른 말이 필요할 때만 */
  agreedLabel?: string
  /** note가 없는 항목의 미동의 문구 */
  deniedLabel?: string
}

/**
 * ConsentList — 동의 정보 블록.
 *
 * 행 리듬·구분선·라벨 고정폭은 DefinitionList를 그대로 쓴다(정의형 정보와 같은 표로 읽혀야 한다).
 * 상태 문구도 직접 그리지 않는다 — 공용 Badge에 맡기고(동의 success / 미동의 secondary, soft),
 * 이 컴포넌트가 남겨두는 건 배지 앞의 아이콘 한 칸뿐이다. 동의는 success 체크, 미동의는 흐린 대시.
 */
export function ConsentList({
  items,
  density = 'compact',
  columns = 1,
  agreedIcon,
  deniedIcon,
  agreedLabel = '동의',
  deniedLabel = '미동의',
}: ConsentListProps) {
  const rows: DefinitionItem[] = items.map((item) => ({
    label: item.label,
    value: (
      <span className={[styles.status, item.agreed ? styles.agreed : styles.denied].join(' ')}>
        <span className={styles.icon} aria-hidden="true">
          {item.agreed
            ? (agreedIcon ?? <Check size={14} strokeWidth={2.5} />)
            : (deniedIcon ?? <Minus size={14} />)}
        </span>
        <Badge
          variant={item.agreed ? 'success' : 'secondary'}
          appearance="soft"
          size="sm"
          label={item.note ?? (item.agreed ? agreedLabel : deniedLabel)}
        />
      </span>
    ),
  }))

  return <DefinitionList items={rows} columns={columns} density={density} />
}
