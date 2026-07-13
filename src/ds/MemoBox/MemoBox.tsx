import type { ReactNode } from 'react'
import { EyeOff, Save } from 'lucide-react'
import { Button } from '../Button/Button'
import { EmptyState } from '../EmptyState/EmptyState'
import { RowActions } from '../RowActions/RowActions'
import { Textarea } from '../Textarea/Textarea'
import styles from './MemoBox.module.css'

/** 누적된 메모 한 건 — items를 넘길 때만 쓰인다(단일 메모 카드에서는 필요 없다) */
export type MemoBoxItem = {
  id: string
  content: string
  author: string
  createdAt: string
  /** 고쳐 쓴 메모 — 작성일 옆에 '(수정 …)'으로 붙는다 */
  updatedAt?: string
}

export type MemoBoxProps = {
  value: string
  onChange: (v: string) => void
  /** 저장 핸들러 — 없으면 저장 버튼을 숨긴다(읽기 위주 화면) */
  onSave?: () => void
  /** 최대 글자수 (기본 500) */
  maxLength?: number
  placeholder?: string
  /** 카드 제목 (기본 '관리자 메모') */
  title?: string
  /** 제목 아래 안내 (기본 '고객에게 노출되지 않습니다.') */
  description?: string
  /** 저장 중 — 입력·버튼을 잠근다 */
  saving?: boolean

  /**
   * 누적 메모 목록 — 넘기면 작성 칸 **위에** 이력이 쌓인다.
   * 문의 상세처럼 메모가 한 건이 아니라 여러 건 붙는 화면을 위한 것이고,
   * 안 넘기면 지금까지처럼 '한 칸짜리 메모 카드'로 그대로 동작한다(기본값 없음 = 목록 영역 자체가 없다).
   */
  items?: MemoBoxItem[]
  /** 목록 행의 수정 — 핸들러를 넘긴 아이콘만 RowActions에 뜬다 */
  onItemEdit?: (item: MemoBoxItem) => void
  /** 목록 행의 삭제 */
  onItemDelete?: (item: MemoBoxItem) => void
  /** items가 빈 배열일 때 EmptyState 문구 */
  emptyText?: string

  /** 글자수 카운터(Textarea 내장). 기본 true — 한도가 없는 자유 메모 화면에서 끈다 */
  showCounter?: boolean
  /** 카드 머리(제목 + 안내). 기본 true — 바깥 PageSection이 이미 제목을 갖고 있으면 끈다 */
  showHeader?: boolean
  /**
   * 카드 크롬(1px 보더 · 패딩 · 배경). 기본 true.
   * PageSection 같은 카드 **안**에 넣을 때 false로 껍데기를 벗겨 카드가 이중으로 겹치지 않게 한다.
   */
  framed?: boolean
  /**
   * 빈 메모의 저장을 막는다. 기본 false(지금까지의 동작 — 저장 중일 때만 잠긴다).
   * 메모가 누적되는 화면에서는 빈 메모가 이력에 쌓이면 안 되므로 켠다.
   */
  requireContent?: boolean

  /** 저장 버튼 문구 (기본 '저장') */
  saveLabel?: string
  /** 저장 중 버튼 문구 (기본 '저장 중') */
  savingLabel?: string
  /** 저장 버튼 아이콘 (기본 디스크) — '등록'처럼 뜻이 달라지면 갈아끼운다 */
  saveIcon?: ReactNode
}

/**
 * MemoBox — 관리자 메모 카드. (누적 목록 +) Textarea + 우측 하단 저장 버튼.
 *
 * 입력은 Textarea 프리미티브를 그대로 쓰고(제어 컴포넌트), 글자수 카운터도 Textarea 내장
 * showCounter를 쓴다 — 같은 카운터를 두 번 만들지 않는다.
 * 목록 행의 [수정][삭제]는 공용 RowActions, 빈 목록은 공용 EmptyState가 그린다.
 */
export function MemoBox({
  value,
  onChange,
  onSave,
  maxLength = 500,
  placeholder = '고객 응대 시 참고할 내용을 남겨 주세요.',
  title = '관리자 메모',
  description = '고객에게 노출되지 않습니다.',
  saving = false,
  items,
  onItemEdit,
  onItemDelete,
  emptyText = '등록된 메모가 없습니다.',
  showCounter = true,
  showHeader = true,
  framed = true,
  requireContent = false,
  saveLabel = '저장',
  savingLabel = '저장 중',
  saveIcon,
}: MemoBoxProps) {
  // items를 아예 안 넘기면 목록 영역이 없다 — 빈 배열([])을 넘겨야 '메모 없음' 빈 상태가 뜬다
  const hasList = items != null
  // 빈 메모 등록 금지는 requireContent를 켠 화면에서만 — 기본 카드는 저장 중일 때만 잠긴다
  const blockedByEmpty = requireContent && value.trim() === ''

  const rootClassName = [styles.root, framed ? '' : styles.bare].filter(Boolean).join(' ')

  return (
    <section className={rootClassName}>
      {showHeader && (
        <header className={styles.head}>
          <h3 className={styles.title}>{title}</h3>
          {description !== '' && (
            <p className={styles.description}>
              <span className={styles.descIcon} aria-hidden="true">
                <EyeOff size={12} />
              </span>
              {description}
            </p>
          )}
        </header>
      )}

      {hasList &&
        (items.length === 0 ? (
          <EmptyState kind="empty" title={emptyText} />
        ) : (
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id} className={styles.item}>
                <div className={styles.itemHead}>
                  <span className={styles.itemAuthor} title={item.author}>
                    {item.author}
                  </span>
                  <span className={styles.itemDate}>
                    {item.createdAt}
                    {item.updatedAt != null && ` (수정 ${item.updatedAt})`}
                  </span>
                  <span className={styles.itemActions}>
                    <RowActions
                      size="sm"
                      onEdit={onItemEdit != null ? () => onItemEdit(item) : undefined}
                      onDelete={onItemDelete != null ? () => onItemDelete(item) : undefined}
                      labels={{ edit: '메모 수정', delete: '메모 삭제' }}
                    />
                  </span>
                </div>
                <p className={styles.itemBody}>{item.content}</p>
              </li>
            ))}
          </ul>
        ))}

      {/* 목록이 있으면 작성 칸 위에 구분선을 둬 '읽는 곳'과 '쓰는 곳'을 가른다 */}
      <div
        className={[styles.composer, hasList ? styles.composerDivided : ''].filter(Boolean).join(' ')}
      >
        {/* Textarea 자체 max-width(480) 해제 — 카드 폭을 따르게 */}
        <div className={styles.editor}>
          <Textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={4}
            autoResize={false}
            disabled={saving}
            showCounter={showCounter}
          />
        </div>

        {onSave != null && (
          <div className={styles.footer}>
            <Button
              variant="primary"
              size="sm"
              label={saving ? savingLabel : saveLabel}
              disabled={saving || blockedByEmpty}
              showLeftIcon
              leftIcon={saveIcon ?? <Save size={14} />}
              onClick={onSave}
            />
          </div>
        )}
      </div>
    </section>
  )
}
