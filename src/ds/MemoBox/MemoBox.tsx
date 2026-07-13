import type { ReactNode } from 'react'
import { EyeOff, Save } from 'lucide-react'
import {
  mergeLabels,
  resolveLabel,
  type LabelFn,
  type RowActionsLabels,
} from '../../shared/labels'
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

export type MemoBoxLabels = {
  title?: string
  description?: string
  placeholder?: string
  /** items가 빈 배열일 때 */
  empty?: string
  save?: string
  saving?: string
  /** 목록 행의 '(수정 …)' — 작성일 뒤에 그대로 이어 붙는다 */
  updatedSuffix?: LabelFn<string>
  /** 목록 행 아이콘 버튼의 이름 겸 툴팁 — 공용 RowActionsLabels를 그대로 흘려보낸다 */
  itemActions?: RowActionsLabels
}

type MemoBoxLabelsResolved = Required<Omit<MemoBoxLabels, 'itemActions'>> & {
  itemActions: RowActionsLabels
}

export const DEFAULT_MEMO_BOX_LABELS: MemoBoxLabelsResolved = {
  title: '관리자 메모',
  description: '고객에게 노출되지 않습니다.',
  placeholder: '고객 응대 시 참고할 내용을 남겨 주세요.',
  empty: '등록된 메모가 없습니다.',
  save: '저장',
  saving: '저장 중',
  updatedSuffix: (updatedAt) => ` (수정 ${updatedAt})`,
  // group은 비워 둔다 — RowActions의 기본값('행 액션')을 그대로 쓴다
  itemActions: { edit: '메모 수정', delete: '메모 삭제' },
}

export type MemoBoxProps = {
  value: string
  onChange: (v: string) => void
  /** 저장 핸들러 — 없으면 저장 버튼을 숨긴다(읽기 위주 화면) */
  onSave?: () => void
  /** 최대 글자수 (기본 500) */
  maxLength?: number
  /** @deprecated labels.placeholder를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  placeholder?: string
  /** @deprecated labels.title을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  title?: string
  /** @deprecated labels.description을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  description?: string
  /** 저장 중 — 입력·버튼을 잠근다 */
  saving?: boolean

  /**
   * 누적 메모 목록 — 넘기면 작성 칸과 함께 이력이 쌓인다(순서는 composer 축이 정한다).
   * 문의 상세처럼 메모가 한 건이 아니라 여러 건 붙는 화면을 위한 것이고,
   * 안 넘기면 지금까지처럼 '한 칸짜리 메모 카드'로 그대로 동작한다(기본값 없음 = 목록 영역 자체가 없다).
   */
  items?: MemoBoxItem[]
  /** 목록 행의 수정 — 핸들러를 넘긴 아이콘만 RowActions에 뜬다 */
  onItemEdit?: (item: MemoBoxItem) => void
  /** 목록 행의 삭제 */
  onItemDelete?: (item: MemoBoxItem) => void
  /** @deprecated labels.empty를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
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
  /**
   * 작성 칸의 자리 (기본 bottom — 목록 아래).
   *   top  — 최신 메모를 위에 쌓는 화면에서 입력을 먼저 만나게 한다.
   *   none — 작성 칸 자체가 없다(읽기 전용 이력).
   * onSave를 생략하는 것과 다르다 — 그건 저장 '버튼'만 숨기고 입력칸은 남긴다.
   */
  composer?: 'bottom' | 'top' | 'none'

  /** @deprecated labels.save를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  saveLabel?: string
  /** @deprecated labels.saving을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다. */
  savingLabel?: string
  /** 저장 버튼 아이콘 (기본 디스크) — '등록'처럼 뜻이 달라지면 갈아끼운다 */
  saveIcon?: ReactNode
  /** 문구 — 개별 prop(title·placeholder …)이 있으면 그쪽이 이긴다 */
  labels?: MemoBoxLabels
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
  placeholder,
  title,
  description,
  saving = false,
  items,
  onItemEdit,
  onItemDelete,
  emptyText,
  showCounter = true,
  showHeader = true,
  framed = true,
  requireContent = false,
  composer = 'bottom',
  saveLabel,
  savingLabel,
  saveIcon,
  labels,
}: MemoBoxProps) {
  const L = mergeLabels(DEFAULT_MEMO_BOX_LABELS, labels)
  const D = DEFAULT_MEMO_BOX_LABELS

  const resolvedTitle = resolveLabel(title, L.title) ?? D.title
  const resolvedDescription = resolveLabel(description, L.description) ?? D.description
  const resolvedPlaceholder = resolveLabel(placeholder, L.placeholder) ?? D.placeholder
  const resolvedEmpty = resolveLabel(emptyText, L.empty) ?? D.empty
  const resolvedSave = resolveLabel(saveLabel, L.save) ?? D.save
  const resolvedSaving = resolveLabel(savingLabel, L.saving) ?? D.saving

  // items를 아예 안 넘기면 목록 영역이 없다 — 빈 배열([])을 넘겨야 '메모 없음' 빈 상태가 뜬다
  const hasList = items != null
  const hasComposer = composer !== 'none'
  // 빈 메모 등록 금지는 requireContent를 켠 화면에서만 — 기본 카드는 저장 중일 때만 잠긴다
  const blockedByEmpty = requireContent && value.trim() === ''

  const rootClassName = [styles.root, framed ? '' : styles.bare].filter(Boolean).join(' ')

  const listNode = hasList ? (
    items.length === 0 ? (
      <EmptyState kind="empty" title={resolvedEmpty} />
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
                {item.updatedAt != null && L.updatedSuffix(item.updatedAt)}
              </span>
              <span className={styles.itemActions}>
                <RowActions
                  size="sm"
                  onEdit={onItemEdit != null ? () => onItemEdit(item) : undefined}
                  onDelete={onItemDelete != null ? () => onItemDelete(item) : undefined}
                  labels={L.itemActions}
                />
              </span>
            </div>
            <p className={styles.itemBody}>{item.content}</p>
          </li>
        ))}
      </ul>
    )
  ) : null

  const composerNode = hasComposer ? (
    // 목록과 맞닿는 쪽에 1px 선을 둬 '읽는 곳'과 '쓰는 곳'을 가른다
    <div
      className={[
        styles.composer,
        hasList ? (composer === 'top' ? styles.composerDividedBelow : styles.composerDivided) : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Textarea 자체 max-width(480) 해제 — 카드 폭을 따르게 */}
      <div className={styles.editor}>
        <Textarea
          value={value}
          onChange={onChange}
          placeholder={resolvedPlaceholder}
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
            label={saving ? resolvedSaving : resolvedSave}
            disabled={saving || blockedByEmpty}
            showLeftIcon
            leftIcon={saveIcon ?? <Save size={14} />}
            onClick={onSave}
          />
        </div>
      )}
    </div>
  ) : null

  return (
    <section className={rootClassName}>
      {showHeader && (
        <header className={styles.head}>
          <h3 className={styles.title}>{resolvedTitle}</h3>
          {resolvedDescription !== '' && (
            <p className={styles.description}>
              <span className={styles.descIcon} aria-hidden="true">
                <EyeOff size={12} />
              </span>
              {resolvedDescription}
            </p>
          )}
        </header>
      )}

      {composer === 'top' && composerNode}
      {listNode}
      {composer === 'bottom' && composerNode}
    </section>
  )
}
