import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Pencil,
  Trash2,
  Unlock,
  UserCog,
} from 'lucide-react'
import { Placeholder } from '../../shared/placeholders'
import { AnswerForm, type AnswerDraft, type AnswerTemplate } from '../AnswerForm/AnswerForm'
import {
  AttachmentList,
  attachmentKind,
  type Attachment,
} from '../AttachmentList/AttachmentList'
import { Avatar } from '../Avatar/Avatar'
import { Badge, type BadgeProps } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { CrudDialog } from '../CrudDialog/CrudDialog'
import { DetailLayout } from '../DetailLayout/DetailLayout'
import { EmptyState } from '../EmptyState/EmptyState'
import { ImagePreview, type ImagePreviewItem } from '../ImagePreview/ImagePreview'
import { MemoBox } from '../MemoBox/MemoBox'
import { Modal } from '../Modal/Modal'
import { PageSection } from '../PageContainer/PageContainer'
import { Select, type SelectOption } from '../Select/Select'
import { StatusTimeline, type StatusStep } from '../StatusTimeline/StatusTimeline'
import { Table, type TableColumn } from '../Table/Table'
import { Tag } from '../Tag/Tag'
import { Textarea } from '../Textarea/Textarea'
import { Timeline, type TimelineItem } from '../Timeline/Timeline'
import styles from './InquiryDetail.module.css'

/** 문의 처리 상태 — 접수 · 확인중 · 답변완료 · 보류 · 종료 */
export type InquiryStatus = 'received' | 'reviewing' | 'answered' | 'hold' | 'closed'

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  received: '접수',
  reviewing: '확인중',
  answered: '답변완료',
  hold: '보류',
  closed: '종료',
}

/** 상태 변경 Select용 옵션 — 호출부에서 그대로 재사용 */
export const INQUIRY_STATUS_OPTIONS: SelectOption[] = (
  Object.keys(INQUIRY_STATUS_LABEL) as InquiryStatus[]
).map((value) => ({ value, label: INQUIRY_STATUS_LABEL[value] }))

/** 상태 → Badge 톤. 보류만 outline으로 "정상 흐름 밖"임을 드러낸다. */
const STATUS_BADGE: Record<InquiryStatus, Pick<BadgeProps, 'variant' | 'appearance'>> = {
  received: { variant: 'primary', appearance: 'soft' },
  reviewing: { variant: 'warning', appearance: 'soft' },
  answered: { variant: 'success', appearance: 'soft' },
  hold: { variant: 'error', appearance: 'outline' },
  closed: { variant: 'secondary', appearance: 'outline' },
}

/** 정상 진행 흐름. 보류는 확인중과 답변완료 사이에 끼어드는 분기다. */
const STATUS_FLOW: InquiryStatus[] = ['received', 'reviewing', 'answered', 'closed']
const STATUS_FLOW_HOLD: InquiryStatus[] = ['received', 'reviewing', 'hold', 'answered', 'closed']

export type InquiryHeader = {
  /** 문의번호 */
  no: string
  status: InquiryStatus
  /** 문의유형 — 상품/배송/교환·반품 등 */
  type: string
  createdAt: string
  updatedAt?: string
  /** 담당자 */
  assignee?: string
  /** 공개여부 — 고객 게시판 노출 */
  isPublic: boolean
}

export type InquiryAuthor = {
  name: string
  memberId: string
  email: string
  phone: string
  /** 회원등급 */
  grade: string
  avatarUrl?: string
  /** 최근 주문 요약 — 클릭 시 onOrderClick */
  recentOrder?: { no: string; summary?: string }
}

export type InquiryOrder = {
  no: string
  orderedAt: string
  /** 주문상태 — 결제완료/배송준비 등 */
  status: string
  /** 결제금액(원) */
  paidAmount: number
  /** 배송상태 */
  shippingStatus: string
}

export type InquiryProduct = {
  id: string
  name: string
  imageUrl?: string
  option?: string
  quantity: number
  /** 판매가(원) */
  price: number
}

export type InquiryContent = {
  title: string
  body: string
  attachments: Attachment[]
}

/** 관리자 메모 — 내부 전용, 여러 개 누적 */
export type InquiryMemo = {
  id: string
  content: string
  author: string
  createdAt: string
  updatedAt?: string
}

export type InquiryAnswer = {
  id: string
  /** 본문 HTML(RichTextEditor 출력) */
  content: string
  author: string
  createdAt: string
  updatedAt?: string
  /** 공개 답변 / 비공개 답변 */
  isPublic: boolean
  attachments?: Attachment[]
}

/** 상태 이력 — StatusTimeline의 각 단계에 시각/처리자를 채운다 */
export type InquiryStatusLog = { status: InquiryStatus; at?: string; by?: string }

/** 답변 템플릿 — AnswerForm의 타입을 그대로 재수출한다(중복 정의 방지) */
export type { AnswerTemplate }

export type InquiryDetailProps = {
  header: InquiryHeader
  author: InquiryAuthor
  content: InquiryContent
  /** 주문 정보 — 주문 연관 문의일 때만 */
  order?: InquiryOrder
  /** 상품 정보 — 주문/상품 문의일 때만 */
  products?: InquiryProduct[]
  /** 관리자 메모(최신순 정렬은 호출부 책임) */
  memos?: InquiryMemo[]
  /** 등록된 답변 — 없으면 답변 작성 폼(AnswerForm)이 열린다 */
  answer?: InquiryAnswer
  statusHistory?: InquiryStatusLog[]
  /** 처리 이력 — 있으면 사이드에 Timeline으로 */
  history?: TimelineItem[]
  /** 담당자 후보 */
  assignees?: SelectOption[]
  answerTemplates?: AnswerTemplate[]
  answerSubmitting?: boolean

  onStatusChange?: (status: InquiryStatus) => void
  onAssigneeChange?: (assignee: string) => void
  onAnswerSubmit?: (draft: AnswerDraft, meta: { mode: 'create' | 'edit'; editReason?: string }) => void
  onAnswerSaveDraft?: (draft: AnswerDraft) => void
  onAnswerDelete?: (answer: InquiryAnswer) => void
  onMemoCreate?: (content: string) => void
  onMemoUpdate?: (id: string, content: string) => void
  onMemoDelete?: (id: string) => void
  onAttachmentDownload?: (attachment: Attachment) => void
  onAttachmentDownloadAll?: () => void
  onOrderClick?: (orderNo: string) => void
  onProductClick?: (product: InquiryProduct) => void
  onBackToList?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean

  /* ── 섹션 ON/OFF — 전부 기본 true. false면 그 영역이 DOM에서 통째로 사라진다 ── */
  /** [관리자 메모] 섹션 — 내부 메모를 안 쓰는 조직/권한에서 끈다 */
  showMemos?: boolean
  /** 문의 내용 안 첨부파일 블록 — 첨부를 못 받는 채널(전화 접수 등)에서 끈다 */
  showAttachments?: boolean
  /** 사이드 [작성자 정보] 카드 — 비회원 문의처럼 보여줄 회원 정보가 없을 때 끈다 */
  showAuthor?: boolean
  /** 사이드 [처리 상태] 카드(StatusTimeline + 상태 변경) — 하단 바의 '상태 변경'만 쓸 때 끈다 */
  showStatusPanel?: boolean
  /** 하단 바의 이전/다음 문의 이동 — 목록 맥락 없이 단건으로 열리는 화면에서 끈다 */
  showNav?: boolean

  /* ── 아이콘 슬롯 ── */
  /** 답변 수정 버튼 아이콘 (기본 Pencil) */
  editIcon?: ReactNode
  /** 삭제 버튼 아이콘 — 답변 삭제와 하단 바 삭제가 함께 쓴다 (기본 Trash2) */
  deleteIcon?: ReactNode
  /** 이전 문의 아이콘 (기본 ChevronLeft) */
  prevIcon?: ReactNode
  /** 다음 문의 아이콘 (기본 ChevronRight) */
  nextIcon?: ReactNode
}

/** 원화 표기 — 표/요약에서 자릿수 정렬이 필요해 통화 기호 없이 '원'만 붙인다 */
function formatKrw(value: number): string {
  if (!Number.isFinite(value)) return '-'
  return `${Math.round(value).toLocaleString('ko-KR')}원`
}

/**
 * 상태 → StatusTimeline 단계.
 * 현재 상태 이전 = done, 현재 = current, 이후 = todo.
 * 답변 없이 종료된 건은 '답변완료'를 skipped로 남겨 흐름을 왜곡하지 않는다.
 */
export function buildInquiryStatusSteps(
  status: InquiryStatus,
  options: { history?: InquiryStatusLog[]; answered?: boolean } = {},
): StatusStep[] {
  const { history = [], answered = false } = options
  const logByStatus = new Map(history.map((log) => [log.status, log]))
  const sequence = status === 'hold' ? STATUS_FLOW_HOLD : STATUS_FLOW
  const currentIndex = sequence.indexOf(status)

  return sequence.map((key, index) => {
    const log = logByStatus.get(key)
    // 종료 상태인데 답변이 없다면 '답변완료'는 건너뛴 단계다
    const skipped = key === 'answered' && index < currentIndex && !answered && log == null
    const state: StatusStep['state'] = skipped
      ? 'skipped'
      : index < currentIndex
        ? 'done'
        : index === currentIndex
          ? 'current'
          : 'todo'

    return { key, label: INQUIRY_STATUS_LABEL[key], at: log?.at, by: log?.by, state }
  })
}

/**
 * 빈 답변 판정 — RichTextEditor(execCommand)가 남기는 <br>, <p><br></p>도 빈 것으로 본다.
 * AnswerForm 내부 제출 버튼과 하단 액션 바의 '답변 등록'이 같은 기준으로 막히게 한다.
 */
function isEmptyAnswer(html: string): boolean {
  return html.replace(/<br\s*\/?>|<\/?(p|div)>|&nbsp;|\s/gi, '') === ''
}

/** 답변(있으면)에서 초안을 만든다 — 수정 모드 진입 시 원문을 그대로 싣는다 */
function createAnswerDraft(answer?: InquiryAnswer): AnswerDraft {
  return {
    content: answer?.content ?? '',
    isPublic: answer?.isPublic ?? true,
    attachments: answer?.attachments ?? [],
    notify: { sms: false, email: true, kakao: false },
  }
}

/** 라벨 · 값 한 줄 — 헤더/작성자/주문 정보가 공유한다 */
function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldValue}>{value}</span>
    </div>
  )
}

export function InquiryDetail({
  header,
  author,
  content,
  order,
  products = [],
  memos = [],
  answer,
  statusHistory = [],
  history = [],
  assignees = [],
  answerTemplates,
  answerSubmitting = false,
  onStatusChange,
  onAssigneeChange,
  onAnswerSubmit,
  onAnswerSaveDraft,
  onAnswerDelete,
  onMemoCreate,
  onMemoUpdate,
  onMemoDelete,
  onAttachmentDownload,
  onAttachmentDownloadAll,
  onOrderClick,
  onProductClick,
  onBackToList,
  onEdit,
  onDelete,
  onPrev,
  onNext,
  hasPrev = true,
  hasNext = true,
  showMemos = true,
  showAttachments = true,
  showAuthor = true,
  showStatusPanel = true,
  showNav = true,
  editIcon,
  deleteIcon,
  prevIcon,
  nextIcon,
}: InquiryDetailProps) {
  // 답변 — 없으면 작성 폼이 기본으로 열려 있다
  const [answerEditing, setAnswerEditing] = useState(false)
  const [answerDraft, setAnswerDraft] = useState<AnswerDraft>(() => createAnswerDraft(answer))
  const [editReason, setEditReason] = useState('')
  const [answerDeleteOpen, setAnswerDeleteOpen] = useState(false)

  // 관리자 메모
  const [memoDraft, setMemoDraft] = useState('')
  const [memoEditing, setMemoEditing] = useState<InquiryMemo | null>(null)
  const [memoEditText, setMemoEditText] = useState('')
  const [memoDeleting, setMemoDeleting] = useState<InquiryMemo | null>(null)

  // 상태/담당자 변경
  const [draftStatus, setDraftStatus] = useState<InquiryStatus>(header.status)
  // 상태가 밖에서 바뀌면(답변 등록 등) 사이드 Select도 따라간다 — 렌더 중 state 보정
  const [syncedStatus, setSyncedStatus] = useState<InquiryStatus>(header.status)
  if (syncedStatus !== header.status) {
    setSyncedStatus(header.status)
    setDraftStatus(header.status)
  }
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [assigneeModalOpen, setAssigneeModalOpen] = useState(false)
  const [draftAssignee, setDraftAssignee] = useState<string | null>(header.assignee ?? null)

  // 첨부 미리보기
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)

  // 문의 삭제
  const [deleteOpen, setDeleteOpen] = useState(false)

  const showAnswerForm = answer == null || answerEditing
  const answerMode: 'create' | 'edit' = answer != null ? 'edit' : 'create'
  const badge = STATUS_BADGE[header.status]
  const steps = buildInquiryStatusSteps(header.status, { history: statusHistory, answered: answer != null })

  // 미리보기는 이미지/동영상만 — 인덱스가 목록과 어긋나지 않게 같은 배열에서 뽑는다
  const mediaAttachments = content.attachments.filter((item) => {
    const kind = attachmentKind(item)
    return kind === 'image' || kind === 'video'
  })
  const previewItems: ImagePreviewItem[] = mediaAttachments.map((item) => ({
    url: item.url ?? '',
    name: item.name,
    kind: attachmentKind(item) === 'video' ? 'video' : 'image',
  }))

  const openPreview = (attachment: Attachment) => {
    const index = mediaAttachments.findIndex((item) => item.id === attachment.id)
    if (index < 0) return
    setPreviewIndex(index)
    setPreviewOpen(true)
  }

  const startAnswerEdit = () => {
    setAnswerDraft(createAnswerDraft(answer))
    setEditReason('')
    setAnswerEditing(true)
  }

  const submitAnswer = () => {
    if (isEmptyAnswer(answerDraft.content)) return
    onAnswerSubmit?.(answerDraft, {
      mode: answerMode,
      editReason: answerMode === 'edit' ? editReason : undefined,
    })
    setAnswerEditing(false)
  }

  const commitStatus = () => {
    if (draftStatus !== header.status) onStatusChange?.(draftStatus)
    setStatusModalOpen(false)
  }

  const commitAssignee = () => {
    if (draftAssignee != null && draftAssignee !== header.assignee) onAssigneeChange?.(draftAssignee)
    setAssigneeModalOpen(false)
  }

  const submitMemo = () => {
    const value = memoDraft.trim()
    if (value === '') return
    onMemoCreate?.(value)
    setMemoDraft('')
  }

  const commitMemoEdit = () => {
    const value = memoEditText.trim()
    if (memoEditing != null && value !== '') onMemoUpdate?.(memoEditing.id, value)
    setMemoEditing(null)
  }

  // ── 상품 표 — 공용 Table로 그린다(<table>을 직접 짜지 않는다).
  //    수량·판매가는 우측 정렬로 자릿수를 세로로 맞춘다. ──
  const productColumns: TableColumn<InquiryProduct>[] = [
    {
      key: 'name',
      header: '상품',
      render: (product) => (
        <div className={styles.productCell}>
          <span className={styles.productThumb}>
            {product.imageUrl != null && product.imageUrl !== '' ? (
              <img className={styles.productImage} src={product.imageUrl} alt="" loading="lazy" />
            ) : (
              <Placeholder kind="image" size="fill" />
            )}
          </span>
          <button
            type="button"
            className={[styles.link, styles.productName].join(' ')}
            onClick={() => onProductClick?.(product)}
            title={product.name}
          >
            {product.name}
          </button>
        </div>
      ),
    },
    {
      key: 'option',
      header: '옵션',
      render: (product) => (
        <span className={styles.option} title={product.option}>
          {product.option ?? '-'}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: '수량',
      align: 'right',
      render: (product) => <span className={styles.num}>{product.quantity}</span>,
    },
    {
      key: 'price',
      header: '판매가',
      align: 'right',
      render: (product) => <span className={styles.num}>{formatKrw(product.price)}</span>,
    },
  ]

  // ── 본문 ──
  const body = (
    <>
      {/* 헤더 — 문의번호 · 상태 · 유형 · 일자 · 담당자 · 공개여부 */}
      <PageSection>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.headerTitleGroup}>
              <span className={styles.headerNo} title={header.no}>
                {header.no}
              </span>
              <Badge
                variant={badge.variant}
                appearance={badge.appearance}
                size="md"
                label={INQUIRY_STATUS_LABEL[header.status]}
              />
              <Tag label={header.type} tone="primary" size="sm" />
            </div>
            <span className={header.isPublic ? styles.visibility : styles.visibilityPrivate}>
              {header.isPublic ? (
                <Unlock size={14} aria-hidden="true" />
              ) : (
                <Lock size={14} aria-hidden="true" />
              )}
              {header.isPublic ? '공개' : '비공개'}
            </span>
          </div>

          <div className={styles.headerMeta}>
            <Field label="작성일" value={header.createdAt} />
            <Field label="수정일" value={header.updatedAt ?? '-'} />
            <Field label="담당자" value={header.assignee ?? '미지정'} />
          </div>
        </div>
      </PageSection>

      {/* 문의 내용 */}
      <PageSection title="문의 내용">
        <div className={styles.content}>
          <h3 className={styles.contentTitle} title={content.title}>
            {content.title}
          </h3>
          <p className={styles.contentBody}>{content.body}</p>

          {showAttachments && (
            <div className={styles.attachments}>
              <span className={styles.blockLabel}>첨부파일</span>
              <AttachmentList
                items={content.attachments}
                onPreview={openPreview}
                onDownload={onAttachmentDownload}
                onDownloadAll={content.attachments.length > 1 ? onAttachmentDownloadAll : undefined}
              />
            </div>
          )}
        </div>
      </PageSection>

      {/* 주문 정보 */}
      {order != null && (
        <PageSection
          title="주문 정보"
          actions={
            <Button
              variant="secondary"
              appearance="outline"
              size="sm"
              label="주문 상세"
              onClick={() => onOrderClick?.(order.no)}
            />
          }
        >
          <div className={styles.fields}>
            <Field
              label="주문번호"
              value={
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => onOrderClick?.(order.no)}
                  title={order.no}
                >
                  {order.no}
                </button>
              }
            />
            <Field label="주문일" value={order.orderedAt} />
            <Field label="주문상태" value={order.status} />
            <Field label="결제금액" value={formatKrw(order.paidAmount)} />
            <Field label="배송상태" value={order.shippingStatus} />
          </div>
        </PageSection>
      )}

      {/* 상품 정보 */}
      {products.length > 0 && (
        <PageSection title="상품 정보">
          <Table<InquiryProduct>
            columns={productColumns}
            rows={products}
            rowKey={(product) => product.id}
          />
        </PageSection>
      )}

      {/* 답변 — 등록된 답변 카드 또는 작성/수정 폼(AnswerForm) */}
      <PageSection
        title="답변"
        description={
          showAnswerForm
            ? '고객에게 노출되는 답변입니다. 비공개로 등록하면 작성자만 볼 수 있습니다.'
            : undefined
        }
        actions={
          answer != null && !answerEditing ? (
            <div className={styles.inlineActions}>
              <Button
                variant="secondary"
                appearance="outline"
                size="sm"
                label="수정"
                showLeftIcon
                leftIcon={editIcon ?? <Pencil size={14} />}
                onClick={startAnswerEdit}
              />
              <Button
                variant="error"
                appearance="outline"
                size="sm"
                label="삭제"
                showLeftIcon
                leftIcon={deleteIcon ?? <Trash2 size={14} />}
                onClick={() => setAnswerDeleteOpen(true)}
              />
            </div>
          ) : undefined
        }
      >
        {answer != null && !answerEditing ? (
          <div className={styles.answer}>
            <div className={styles.answerHead}>
              <div className={styles.answerAuthor}>
                <Avatar name={answer.author} size="sm" />
                <span className={styles.answerName} title={answer.author}>
                  {answer.author}
                </span>
              </div>
              <div className={styles.answerMeta}>
                <Badge
                  variant={answer.isPublic ? 'success' : 'secondary'}
                  appearance="soft"
                  size="sm"
                  label={answer.isPublic ? '공개 답변' : '비공개 답변'}
                />
                <span className={styles.answerDate}>
                  {answer.createdAt}
                  {answer.updatedAt != null && ` (수정 ${answer.updatedAt})`}
                </span>
              </div>
            </div>

            {/* 답변 본문은 RichTextEditor가 만든 HTML이다 */}
            <div
              className={styles.answerBody}
              dangerouslySetInnerHTML={{ __html: answer.content }}
            />

            {answer.attachments != null && answer.attachments.length > 0 && (
              <AttachmentList
                items={answer.attachments}
                compact
                onDownload={onAttachmentDownload}
              />
            )}
          </div>
        ) : (
          <AnswerForm
            value={answerDraft}
            onChange={setAnswerDraft}
            templates={answerTemplates}
            onSubmit={submitAnswer}
            onSaveDraft={onAnswerSaveDraft != null ? () => onAnswerSaveDraft(answerDraft) : undefined}
            onCancel={answer != null ? () => setAnswerEditing(false) : undefined}
            submitting={answerSubmitting}
            mode={answerMode}
            editReason={editReason}
            onEditReasonChange={setEditReason}
            editMeta={
              answer != null ? `최초 등록 ${answer.createdAt} · ${answer.author}` : undefined
            }
          />
        )}
      </PageSection>

      {/* 관리자 메모 — 내부 전용.
          목록 + 작성 칸 + [수정][삭제]는 MemoBox가 통째로 그린다(같은 메모 UI를 두 번 짜지 않는다).
          제목은 이미 PageSection이 갖고 있고 카드 크롬도 PageSection 것이라 header/frame은 끈다. */}
      {showMemos && (
        <PageSection
          title="관리자 메모"
          actions={
            <Badge variant="warning" appearance="soft" size="sm" label="내부 전용 · 고객 미노출" />
          }
        >
          <MemoBox
            value={memoDraft}
            onChange={setMemoDraft}
            onSave={submitMemo}
            items={memos}
            onItemEdit={(memo) => {
              setMemoEditing(memo)
              setMemoEditText(memo.content)
            }}
            onItemDelete={(memo) => setMemoDeleting(memo)}
            emptyText="등록된 메모가 없습니다."
            placeholder="내부 공유용 메모를 입력하세요. 고객에게 노출되지 않습니다."
            saveLabel="메모 등록"
            savingLabel="등록 중"
            requireContent
            showHeader={false}
            framed={false}
          />
        </PageSection>
      )}
    </>
  )

  // ── 사이드 ──
  const recentOrder = author.recentOrder
  const aside = (
    <>
      {showAuthor && (
      <PageSection title="작성자 정보">
        <div className={styles.author}>
          <div className={styles.authorHead}>
            <Avatar name={author.name} src={author.avatarUrl} size="lg" />
            <div className={styles.authorNames}>
              <span className={styles.authorName} title={author.name}>
                {author.name}
              </span>
              <span className={styles.authorId} title={author.memberId}>
                {author.memberId}
              </span>
            </div>
          </div>

          <div className={styles.fields}>
            <Field label="이메일" value={author.email} />
            <Field label="휴대폰" value={author.phone} />
            <Field
              label="회원등급"
              value={<Tag label={author.grade} tone="warning" size="sm" />}
            />
            <Field
              label="최근 주문"
              value={
                recentOrder != null ? (
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() => onOrderClick?.(recentOrder.no)}
                    title={recentOrder.summary ?? recentOrder.no}
                  >
                    {recentOrder.summary ?? recentOrder.no}
                  </button>
                ) : (
                  '없음'
                )
              }
            />
          </div>
        </div>
      </PageSection>
      )}

      {showStatusPanel && (
        <PageSection title="처리 상태">
          <div className={styles.status}>
            <StatusTimeline steps={steps} />
            <div className={styles.statusForm}>
              <Select
                label="상태 변경"
                value={draftStatus}
                onChange={(value) => setDraftStatus(value as InquiryStatus)}
                options={INQUIRY_STATUS_OPTIONS}
              />
              <Button
                variant="primary"
                size="sm"
                label="상태 저장"
                disabled={draftStatus === header.status}
                onClick={commitStatus}
              />
            </div>
          </div>
        </PageSection>
      )}

      {history.length > 0 && (
        <PageSection title="처리 이력">
          <Timeline items={history} />
        </PageSection>
      )}
    </>
  )

  // ── 하단 sticky 액션 바 ──
  const footer = (
    <>
      <div className={styles.footerLeft}>
        <Button
          variant="secondary"
          appearance="outline"
          size="md"
          label="목록"
          onClick={onBackToList}
        />
        {showNav && (
          <>
            <Button
              variant="secondary"
              appearance="ghost"
              size="md"
              label="이전 문의"
              showLeftIcon
              leftIcon={prevIcon ?? <ChevronLeft size={16} />}
              disabled={!hasPrev}
              onClick={onPrev}
            />
            <Button
              variant="secondary"
              appearance="ghost"
              size="md"
              label="다음 문의"
              showRightIcon
              rightIcon={nextIcon ?? <ChevronRight size={16} />}
              disabled={!hasNext}
              onClick={onNext}
            />
          </>
        )}
      </div>

      <Button
        variant="error"
        appearance="outline"
        size="md"
        label="삭제"
        showLeftIcon
        leftIcon={deleteIcon ?? <Trash2 size={16} />}
        onClick={() => setDeleteOpen(true)}
      />
      <Button
        variant="secondary"
        appearance="outline"
        size="md"
        label="담당자 변경"
        showLeftIcon
        leftIcon={<UserCog size={16} />}
        onClick={() => {
          setDraftAssignee(header.assignee ?? null)
          setAssigneeModalOpen(true)
        }}
      />
      <Button
        variant="secondary"
        appearance="outline"
        size="md"
        label="상태 변경"
        onClick={() => {
          setDraftStatus(header.status)
          setStatusModalOpen(true)
        }}
      />
      <Button variant="secondary" size="md" label="수정" onClick={onEdit} />
      <Button
        variant="primary"
        size="md"
        label="답변 등록"
        disabled={!showAnswerForm || answerSubmitting || isEmptyAnswer(answerDraft.content)}
        onClick={submitAnswer}
      />
    </>
  )

  return (
    <>
      <DetailLayout aside={aside} footer={footer}>
        {body}
      </DetailLayout>

      {/* 첨부 미리보기 — 이미지 확대 / 동영상 재생 */}
      <ImagePreview
        open={previewOpen}
        items={previewItems}
        index={previewIndex}
        onIndexChange={setPreviewIndex}
        onClose={() => setPreviewOpen(false)}
      />

      {/* 상태 변경 */}
      <Modal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="상태 변경"
        size="sm"
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              size="md"
              label="취소"
              onClick={() => setStatusModalOpen(false)}
            />
            <Button
              variant="primary"
              size="md"
              label="변경"
              disabled={draftStatus === header.status}
              onClick={commitStatus}
            />
          </div>
        }
      >
        <Select
          label="처리 상태"
          value={draftStatus}
          onChange={(value) => setDraftStatus(value as InquiryStatus)}
          options={INQUIRY_STATUS_OPTIONS}
          helperText={`현재 상태: ${INQUIRY_STATUS_LABEL[header.status]}`}
        />
      </Modal>

      {/* 담당자 변경 */}
      <Modal
        open={assigneeModalOpen}
        onClose={() => setAssigneeModalOpen(false)}
        title="담당자 변경"
        size="sm"
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              size="md"
              label="취소"
              onClick={() => setAssigneeModalOpen(false)}
            />
            <Button
              variant="primary"
              size="md"
              label="변경"
              disabled={draftAssignee == null || draftAssignee === header.assignee}
              onClick={commitAssignee}
            />
          </div>
        }
      >
        {assignees.length === 0 ? (
          /* 빈 상태는 공용 EmptyState 한 규격으로 */
          <EmptyState kind="empty" title="배정 가능한 담당자가 없습니다." />
        ) : (
          <Select
            label="담당자"
            value={draftAssignee}
            onChange={setDraftAssignee}
            options={assignees}
            placeholder="담당자를 선택하세요"
            helperText={`현재 담당자: ${header.assignee ?? '미지정'}`}
          />
        )}
      </Modal>

      {/* 메모 수정 */}
      <CrudDialog
        open={memoEditing != null}
        mode="edit"
        title="메모 수정"
        description="내부 공유용 메모입니다. 고객에게 노출되지 않습니다."
        confirmLabel="저장"
        onConfirm={commitMemoEdit}
        onCancel={() => setMemoEditing(null)}
      >
        <Textarea
          label="메모"
          value={memoEditText}
          onChange={setMemoEditText}
          rows={4}
          maxLength={500}
          showCounter
        />
      </CrudDialog>

      {/* 메모 삭제 */}
      <CrudDialog
        open={memoDeleting != null}
        mode="delete"
        title="메모를 삭제할까요?"
        description={`${memoDeleting?.author ?? ''}님이 작성한 메모가 삭제됩니다.`}
        onConfirm={() => {
          if (memoDeleting != null) onMemoDelete?.(memoDeleting.id)
          setMemoDeleting(null)
        }}
        onCancel={() => setMemoDeleting(null)}
      />

      {/* 답변 삭제 */}
      <CrudDialog
        open={answerDeleteOpen}
        mode="delete"
        title="답변을 삭제할까요?"
        description="고객 게시판에 노출된 답변이 즉시 내려갑니다."
        onConfirm={() => {
          if (answer != null) onAnswerDelete?.(answer)
          setAnswerDeleteOpen(false)
        }}
        onCancel={() => setAnswerDeleteOpen(false)}
      />

      {/* 문의 삭제 */}
      <CrudDialog
        open={deleteOpen}
        mode="delete"
        title="문의를 삭제할까요?"
        description={`${header.no} 문의와 답변·메모가 함께 삭제됩니다.`}
        onConfirm={() => {
          onDelete?.()
          setDeleteOpen(false)
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  )
}
