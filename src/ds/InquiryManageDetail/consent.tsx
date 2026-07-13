import { Check, X } from 'lucide-react'
import { Badge } from '../Badge/Badge'
import styles from './InquiryManageDetail.module.css'

/**
 * 신청자 카드의 '동의 배지 줄'과 '메타 줄' — 시공 문의 상세(InquiryManageDetail)와
 * 문의 신청 상세(InquiryApplicationDetail)가 **같은 그림**을 그린다.
 *
 * 두 화면에 각각 복사돼 있던 것을 한 벌로 모았다. 같은 정보(동의 여부 · 신청일/수정일/수정자)를
 * 다른 마크업으로 그리면 한쪽만 고쳐지고 두 화면이 조용히 어긋난다.
 * 새 최상위 컴포넌트를 만들 만큼 큰 조각이 아니라서 상세 폴더 안의 모듈로 둔다
 * (스타일도 InquiryManageDetail.module.css 한 곳만 본다).
 */

/** 동의 항목 — 배지 하나로 그려진다(동의 = success soft / 미동의 = secondary soft) */
export type ConsentBadgeItem = {
  key: string
  /** '동의/미동의' 접미사를 뺀 항목명 — 예: '개인정보' */
  label: string
  agreed: boolean
}

/** 메타 줄의 라벨-값 한 쌍 — 값이 없는 쌍은 호출부에서 아예 만들지 않는다 */
export type MetaLineItem = {
  label: string
  value: string
}

/** 동의 배지 줄 — ✓/✕ 마크는 장식이고, 의미는 배지 라벨('동의'/'미동의')이 글로 말한다 */
export function ConsentBadges({ consents }: { consents: ConsentBadgeItem[] }) {
  return (
    <div className={styles.consents}>
      {consents.map((consent) => (
        <span key={consent.key} className={styles.consent}>
          <span
            className={[styles.consentMark, consent.agreed ? styles.agreed : styles.denied].join(' ')}
            aria-hidden="true"
          >
            {consent.agreed ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
          </span>
          <Badge
            variant={consent.agreed ? 'success' : 'secondary'}
            appearance="soft"
            size="sm"
            label={`${consent.label} ${consent.agreed ? '동의' : '미동의'}`}
          />
        </span>
      ))}
    </div>
  )
}

/** 메타 줄 — 라벨-값 쌍을 가운뎃점으로 잇는다. 값이 없는 쌍은 통째로 빠진다 */
export function MetaLine({ items }: { items: MetaLineItem[] }) {
  return (
    <p className={styles.meta}>
      {items.map((item, index) => (
        <span key={item.label} className={styles.metaItem}>
          {index > 0 && (
            <span className={styles.metaSep} aria-hidden="true">
              ·
            </span>
          )}
          <span className={styles.metaLabel}>{item.label}</span>
          <span className={styles.metaValue}>{item.value}</span>
        </span>
      ))}
    </p>
  )
}
