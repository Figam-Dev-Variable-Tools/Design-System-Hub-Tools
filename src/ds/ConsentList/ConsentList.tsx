import type { ReactNode } from 'react'
import { Check, Minus } from 'lucide-react'
import { Badge, type BadgeProps } from '../Badge/Badge'
import { DefinitionList, type DefinitionItem } from '../DefinitionList/DefinitionList'
import { mergeLabels, type DeepPartialOneLevel } from '../../shared/labels'
import styles from './ConsentList.module.css'

export type ConsentItem = {
  /** 동의 항목명 — 휴대폰 본인 인증, 마케팅 정보 수신 … */
  label: string
  agreed: boolean
  /** 상태 문구 — 생략하면 '동의' / '미동의' */
  note?: string
}

/** 이 블록이 스스로 만드는 문구는 상태 배지 둘뿐 — 항목명은 item.label이 갖는다 */
export type ConsentListLabels = {
  status: {
    /** note가 없는 항목의 동의 문구 */
    agreed: string
    /** note가 없는 항목의 미동의 문구 */
    denied: string
  }
}

export const DEFAULT_CONSENT_LIST_LABELS: ConsentListLabels = {
  status: { agreed: '동의', denied: '미동의' },
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
  /**
   * 상태별 배지 톤 (기본 동의 success / 미동의 secondary).
   * 필수 동의 항목은 '미동의'가 경고다 — denied를 error/warning으로 올려 위험을 드러낸다.
   */
  tone?: { agreed?: BadgeProps['variant']; denied?: BadgeProps['variant'] }
  /** 배지 마감 (기본 soft) — outline 위주의 상세 카드에서 톤이 튀지 않게 맞춘다 */
  appearance?: BadgeProps['appearance']
  /** 문구 — 개별 prop(agreedLabel·deniedLabel)이 있으면 그쪽이 이긴다 */
  labels?: DeepPartialOneLevel<ConsentListLabels>
  /**
   * @deprecated labels.status.agreed를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
  agreedLabel?: string
  /**
   * @deprecated labels.status.denied를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
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
  tone,
  appearance = 'soft',
  labels,
  agreedLabel,
  deniedLabel,
}: ConsentListProps) {
  // 우선순위: 개별 prop(agreedLabel·deniedLabel) > labels > 기본값.
  // mergeLabels는 그룹 안의 undefined를 걸러내므로, 넘기지 않은 개별 prop이 기본값을 지우지 않는다.
  const L = mergeLabels(mergeLabels(DEFAULT_CONSENT_LIST_LABELS, labels), {
    status: { agreed: agreedLabel, denied: deniedLabel },
  })

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
          variant={item.agreed ? (tone?.agreed ?? 'success') : (tone?.denied ?? 'secondary')}
          appearance={appearance}
          size="sm"
          label={item.note ?? (item.agreed ? L.status.agreed : L.status.denied)}
        />
      </span>
    ),
  }))

  return <DefinitionList items={rows} columns={columns} density={density} />
}
