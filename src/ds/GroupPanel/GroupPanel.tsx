import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../Button/Button'
import styles from './GroupPanel.module.css'

export type GroupPanelItem = {
  key: string
  label: string
  /** 항목 건수 — tabular-nums로 우측 정렬 */
  count?: number
  /** 같은 group끼리 묶인다. group이 바뀌는 경계에 굵은 구분선이 들어간다. */
  group?: string
}

export type GroupPanelProps = {
  items: GroupPanelItem[]
  value: string
  onChange: (key: string) => void
  /** 없으면 하단 '새 그룹 만들기' 버튼이 렌더되지 않는다 */
  onAdd?: () => void
  addLabel?: string
  /** 하단 설명 문구 슬롯 */
  footnote?: ReactNode
  width?: number
  /**
   * 항목 우측 건수 (기본 true).
   * 건수가 실시간 집계라 자주 흔들리거나(로딩 중 0 → 실제값) 의미가 없을 때 끈다 —
   * items에서 count를 일일이 지우지 않고 표시만 멈춘다.
   */
  showCount?: boolean
  /**
   * 첫 항목 primary 강조 (기본 true).
   * 첫 항목이 '전체 사용자'가 아니라 그냥 첫 그룹인 목록에서는 강조가 거짓말이 되므로 끈다.
   */
  highlightFirst?: boolean
  /** 추가 버튼 아이콘 — 기본 lucide Plus */
  addIcon?: ReactNode
}

// 고객/운영진 목록 좌측 패널 — 첫 항목(전체 사용자)만 primary 강조, 나머지는 조용한 리스트
export function GroupPanel({
  items,
  value,
  onChange,
  onAdd,
  addLabel = '새 그룹 만들기',
  footnote,
  width = 240,
  showCount = true,
  highlightFirst = true,
  addIcon,
}: GroupPanelProps) {
  return (
    <aside className={styles.panel} style={{ width }}>
      <ul className={styles.list}>
        {items.map((item, index) => {
          const selected = item.key === value
          // 첫 항목은 '전체' 성격 — 선택 시 primary-50 배경 + primary 텍스트
          const lead = highlightFirst && index === 0
          // 이전 항목과 group이 다르면 그룹 경계(굵은 구분선)
          const boundary = index > 0 && items[index - 1]?.group !== item.group

          const className = [
            styles.item,
            lead ? styles.lead : '',
            selected ? styles.selected : '',
            boundary ? styles.boundary : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <li key={item.key}>
              <button
                type="button"
                className={className}
                aria-current={selected ? 'true' : undefined}
                onClick={() => onChange(item.key)}
              >
                <span className={styles.label}>{item.label}</span>
                {showCount && item.count !== undefined && (
                  <span className={styles.count}>{item.count.toLocaleString()}</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {(onAdd || footnote) && (
        <div className={styles.footer}>
          {onAdd && (
            // 아이콘 + 라벨을 가진 평범한 액션이라 Button(ghost)으로 충분하다 — 링크 톤 버튼을 따로 만들지 않는다
            <Button
              variant="primary"
              appearance="ghost"
              size="sm"
              label={addLabel}
              showLeftIcon
              leftIcon={addIcon ?? <Plus size={14} />}
              onClick={onAdd}
            />
          )}
          {footnote && <p className={styles.footnote}>{footnote}</p>}
        </div>
      )}
    </aside>
  )
}
