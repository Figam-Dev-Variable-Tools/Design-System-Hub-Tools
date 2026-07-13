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
import {
  mergeLabels,
  type ConfirmDialogLabels,
  type DeepPartialOneLevel,
  type EmptyLabels,
  type Formatters,
  type LabelFn,
} from '../../shared/labels'
import styles from './InquiryDetail.module.css'

/** 문의 처리 상태 — 접수 · 확인중 · 답변완료 · 보류 · 종료 */
export type InquiryStatus = 'received' | 'reviewing' | 'answered' | 'hold' | 'closed'

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

/* ────────────────────────────────────────────────────────────
 * 문구 — 화면에 나오는 모든 글자가 여기 한 곳으로 모인다
 * ──────────────────────────────────────────────────────────── */

export type InquiryDetailLabels = {
  /** 상태 문구 — 배지·타임라인·Select·모달 helperText가 함께 쓴다 */
  status: Record<InquiryStatus, string>
  /** 카드 제목 */
  sections: {
    content: string
    order: string
    products: string
    answer: string
    /** 답변 작성 폼이 열려 있을 때만 뜨는 설명 */
    answerDescription: string
    memos: string
    author: string
    statusPanel: string
    history: string
  }
  /** 헤더 — 문의번호 줄 아래 메타 */
  header: {
    createdAt: string
    updatedAt: string
    assignee: string
    /** 담당자가 없을 때 */
    unassigned: string
    public: string
    private: string
  }
  content: { attachments: string }
  order: {
    no: string
    orderedAt: string
    status: string
    paidAmount: string
    shippingStatus: string
    /** [주문 상세] 버튼 */
    detail: string
  }
  /** 상품 표 컬럼 머리글 */
  columns: { name: string; option: string; quantity: string; price: string }
  answer: {
    publicBadge: string
    privateBadge: string
    edit: string
    delete: string
    /** 등록일 뒤에 붙는 수정 표기 */
    updatedSuffix: LabelFn<string>
    /** 수정 폼 상단의 원본 표기 */
    editMeta: (answer: InquiryAnswer) => string
  }
  memo: {
    /** '내부 전용' 배지 */
    internalBadge: string
    empty: string
    placeholder: string
    save: string
    saving: string
  }
  author: {
    email: string
    phone: string
    grade: string
    recentOrder: string
    /** 최근 주문이 없을 때 */
    noOrder: string
  }
  /** 사이드 [처리 상태] 카드 */
  statusPanel: { field: string; save: string }
  /** 하단 sticky 액션 바 */
  actions: {
    list: string
    prev: string
    next: string
    delete: string
    assignee: string
    status: string
    edit: string
    submitAnswer: string
  }
  /** 상태 변경 모달 */
  statusDialog: {
    title: string
    field: string
    confirm: string
    cancel: string
    /** helperText — 인자는 현재 상태의 문구 */
    current: LabelFn<string>
  }
  /** 담당자 변경 모달 */
  assigneeDialog: {
    title: string
    field: string
    placeholder: string
    confirm: string
    cancel: string
    /** 배정 가능한 담당자가 없을 때 */
    empty: EmptyLabels
    /** helperText — 인자는 현재 담당자(없으면 unassigned) */
    current: LabelFn<string>
  }
  /** 메모 수정 확인창 — description은 문자열 고정이라 field(Textarea 라벨)만 얹는다 */
  memoEditDialog: Required<Pick<ConfirmDialogLabels, 'title' | 'description' | 'confirmLabel'>> & {
    field: string
  }
  /** 메모 삭제 확인창 — description은 삭제 대상 메모를 받는다 */
  memoDeleteDialog: Required<Pick<ConfirmDialogLabels<InquiryMemo>, 'title' | 'description'>>
  /** 답변 삭제 확인창 */
  answerDeleteDialog: Required<Pick<ConfirmDialogLabels, 'title' | 'description'>>
  /** 문의 삭제 확인창 — description은 헤더(문의번호)를 받는다 */
  deleteDialog: Required<Pick<ConfirmDialogLabels<InquiryHeader>, 'title' | 'description'>>
  /** 값이 없는 칸(수정일·옵션)에 찍히는 문자 */
  emptyCell: string
}

export const DEFAULT_INQUIRY_DETAIL_LABELS: InquiryDetailLabels = {
  status: {
    received: '접수',
    reviewing: '확인중',
    answered: '답변완료',
    hold: '보류',
    closed: '종료',
  },
  sections: {
    content: '문의 내용',
    order: '주문 정보',
    products: '상품 정보',
    answer: '답변',
    answerDescription: '고객에게 노출되는 답변입니다. 비공개로 등록하면 작성자만 볼 수 있습니다.',
    memos: '관리자 메모',
    author: '작성자 정보',
    statusPanel: '처리 상태',
    history: '처리 이력',
  },
  header: {
    createdAt: '작성일',
    updatedAt: '수정일',
    assignee: '담당자',
    unassigned: '미지정',
    public: '공개',
    private: '비공개',
  },
  content: { attachments: '첨부파일' },
  order: {
    no: '주문번호',
    orderedAt: '주문일',
    status: '주문상태',
    paidAmount: '결제금액',
    shippingStatus: '배송상태',
    detail: '주문 상세',
  },
  columns: { name: '상품', option: '옵션', quantity: '수량', price: '판매가' },
  answer: {
    publicBadge: '공개 답변',
    privateBadge: '비공개 답변',
    edit: '수정',
    delete: '삭제',
    updatedSuffix: (updatedAt) => ` (수정 ${updatedAt})`,
    editMeta: (answer) => `최초 등록 ${answer.createdAt} · ${answer.author}`,
  },
  memo: {
    internalBadge: '내부 전용 · 고객 미노출',
    empty: '등록된 메모가 없습니다.',
    placeholder: '내부 공유용 메모를 입력하세요. 고객에게 노출되지 않습니다.',
    save: '메모 등록',
    saving: '등록 중',
  },
  author: {
    email: '이메일',
    phone: '휴대폰',
    grade: '회원등급',
    recentOrder: '최근 주문',
    noOrder: '없음',
  },
  statusPanel: { field: '상태 변경', save: '상태 저장' },
  actions: {
    list: '목록',
    prev: '이전 문의',
    next: '다음 문의',
    delete: '삭제',
    assignee: '담당자 변경',
    status: '상태 변경',
    edit: '수정',
    submitAnswer: '답변 등록',
  },
  statusDialog: {
    title: '상태 변경',
    field: '처리 상태',
    confirm: '변경',
    cancel: '취소',
    current: (statusLabel) => `현재 상태: ${statusLabel}`,
  },
  assigneeDialog: {
    title: '담당자 변경',
    field: '담당자',
    placeholder: '담당자를 선택하세요',
    confirm: '변경',
    cancel: '취소',
    empty: { title: '배정 가능한 담당자가 없습니다.' },
    current: (assignee) => `현재 담당자: ${assignee}`,
  },
  memoEditDialog: {
    title: '메모 수정',
    description: '내부 공유용 메모입니다. 고객에게 노출되지 않습니다.',
    confirmLabel: '저장',
    field: '메모',
  },
  memoDeleteDialog: {
    title: '메모를 삭제할까요?',
    description: (memo) => `${memo.author}님이 작성한 메모가 삭제됩니다.`,
  },
  answerDeleteDialog: {
    title: '답변을 삭제할까요?',
    description: '고객 게시판에 노출된 답변이 즉시 내려갑니다.',
  },
  deleteDialog: {
    title: '문의를 삭제할까요?',
    description: (header) => `${header.no} 문의와 답변·메모가 함께 삭제됩니다.`,
  },
  emptyCell: '-',
}

/**
 * 상태 문구 — DEFAULT_INQUIRY_DETAIL_LABELS.status의 별칭이다.
 * 같은 값을 두 곳에 적으면 두 값은 갈라진다 — 문구의 단일 출처는 labels 기본값이다.
 */
export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> =
  DEFAULT_INQUIRY_DETAIL_LABELS.status

/** 상태 변경 Select용 옵션 — 호출부에서 그대로 재사용 */
export const INQUIRY_STATUS_OPTIONS: SelectOption[] = (
  Object.keys(INQUIRY_STATUS_LABEL) as InquiryStatus[]
).map((value) => ({ value, label: INQUIRY_STATUS_LABEL[value] }))

/** EmptyLabels.title은 옵셔널(공용 타입)이라 최종 기본값을 이름으로 둔다 */
const DEFAULT_EMPTY_ASSIGNEE = DEFAULT_INQUIRY_DETAIL_LABELS.assigneeDialog.empty.title ?? ''

/** ConfirmDialogLabels.description은 문자열이거나 인자 1개짜리 함수다 */
function dialogDescription<A>(
  description: string | LabelFn<A>,
  arg: A,
): string {
  return typeof description === 'function' ? description(arg) : description
}

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

  /** 문구 — 넘기지 않으면 오늘과 같은 화면이 나온다 */
  labels?: DeepPartialOneLevel<InquiryDetailLabels>
  /** 숫자·통화 표기 — 로케일·통화 기호는 문구가 아니라 포맷이다 */
  formatters?: Formatters
  /**
   * 상태별 배지 톤 — 넘긴 상태만 기본 톤(STATUS_BADGE)을 덮어쓴다.
   * 상태 문구를 운영자가 편집하는 서비스에서 톤까지 같이 따라가게 하는 열쇠다.
   */
  statusTone?: Partial<Record<InquiryStatus, Pick<BadgeProps, 'variant' | 'appearance'>>>
}

/** 원화 표기 — 표/요약에서 자릿수 정렬이 필요해 통화 기호 없이 '원'만 붙인다 */
const DEFAULT_FORMAT_PRICE: NonNullable<Formatters['price']> = (value) => {
  if (!Number.isFinite(value)) return DEFAULT_INQUIRY_DETAIL_LABELS.emptyCell
  return `${Math.round(value).toLocaleString('ko-KR')}원`
}

/**
 * 상태 → StatusTimeline 단계.
 * 현재 상태 이전 = done, 현재 = current, 이후 = todo.
 * 답변 없이 종료된 건은 '답변완료'를 skipped로 남겨 흐름을 왜곡하지 않는다.
 */
export function buildInquiryStatusSteps(
  status: InquiryStatus,
  options: {
    history?: InquiryStatusLog[]
    answered?: boolean
    /** 단계 문구 — 상세 화면이 labels로 갈아끼운 상태 문구를 그대로 흘려보낸다 */
    statusLabels?: Record<InquiryStatus, string>
  } = {},
): StatusStep[] {
  const {
    history = [],
    answered = false,
    statusLabels = DEFAULT_INQUIRY_DETAIL_LABELS.status,
  } = options
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

    return { key, label: statusLabels[key], at: log?.at, by: log?.by, state }
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
  labels,
  formatters,
  statusTone,
}: InquiryDetailProps) {
  const L = mergeLabels(DEFAULT_INQUIRY_DETAIL_LABELS, labels)
  const formatPrice = formatters?.price ?? DEFAULT_FORMAT_PRICE

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
  const badge = statusTone?.[header.status] ?? STATUS_BADGE[header.status]
  const steps = buildInquiryStatusSteps(header.status, {
    history: statusHistory,
    answered: answer != null,
    statusLabels: L.status,
  })

  // 상태 Select 옵션 — 모듈 상수(INQUIRY_STATUS_OPTIONS)를 그대로 쓰면 labels로 바꾼 문구와 갈라진다
  const statusOptions: SelectOption[] = (Object.keys(L.status) as InquiryStatus[]).map((value) => ({
    value,
    label: L.status[value],
  }))

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
      header: L.columns.name,
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
      header: L.columns.option,
      render: (product) => (
        <span className={styles.option} title={product.option}>
          {product.option ?? L.emptyCell}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: L.columns.quantity,
      align: 'right',
      render: (product) => <span className={styles.num}>{product.quantity}</span>,
    },
    {
      key: 'price',
      header: L.columns.price,
      align: 'right',
      render: (product) => <span className={styles.num}>{formatPrice(product.price)}</span>,
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
                label={L.status[header.status]}
              />
              <Tag label={header.type} tone="primary" size="sm" />
            </div>
            <span className={header.isPublic ? styles.visibility : styles.visibilityPrivate}>
              {header.isPublic ? (
                <Unlock size={14} aria-hidden="true" />
              ) : (
                <Lock size={14} aria-hidden="true" />
              )}
              {header.isPublic ? L.header.public : L.header.private}
            </span>
          </div>

          <div className={styles.headerMeta}>
            <Field label={L.header.createdAt} value={header.createdAt} />
            <Field label={L.header.updatedAt} value={header.updatedAt ?? L.emptyCell} />
            <Field label={L.header.assignee} value={header.assignee ?? L.header.unassigned} />
          </div>
        </div>
      </PageSection>

      {/* 문의 내용 */}
      <PageSection title={L.sections.content}>
        <div className={styles.content}>
          <h3 className={styles.contentTitle} title={content.title}>
            {content.title}
          </h3>
          <p className={styles.contentBody}>{content.body}</p>

          {showAttachments && (
            <div className={styles.attachments}>
              <span className={styles.blockLabel}>{L.content.attachments}</span>
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
          title={L.sections.order}
          actions={
            <Button
              variant="secondary"
              appearance="outline"
              size="sm"
              label={L.order.detail}
              onClick={() => onOrderClick?.(order.no)}
            />
          }
        >
          <div className={styles.fields}>
            <Field
              label={L.order.no}
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
            <Field label={L.order.orderedAt} value={order.orderedAt} />
            <Field label={L.order.status} value={order.status} />
            <Field label={L.order.paidAmount} value={formatPrice(order.paidAmount)} />
            <Field label={L.order.shippingStatus} value={order.shippingStatus} />
          </div>
        </PageSection>
      )}

      {/* 상품 정보 */}
      {products.length > 0 && (
        <PageSection title={L.sections.products}>
          <Table<InquiryProduct>
            columns={productColumns}
            rows={products}
            rowKey={(product) => product.id}
          />
        </PageSection>
      )}

      {/* 답변 — 등록된 답변 카드 또는 작성/수정 폼(AnswerForm) */}
      <PageSection
        title={L.sections.answer}
        description={showAnswerForm ? L.sections.answerDescription : undefined}
        actions={
          answer != null && !answerEditing ? (
            <div className={styles.inlineActions}>
              <Button
                variant="secondary"
                appearance="outline"
                size="sm"
                label={L.answer.edit}
                showLeftIcon
                leftIcon={editIcon ?? <Pencil size={14} />}
                onClick={startAnswerEdit}
              />
              <Button
                variant="error"
                appearance="outline"
                size="sm"
                label={L.answer.delete}
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
                  label={answer.isPublic ? L.answer.publicBadge : L.answer.privateBadge}
                />
                <span className={styles.answerDate}>
                  {answer.createdAt}
                  {answer.updatedAt != null && L.answer.updatedSuffix(answer.updatedAt)}
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
            editMeta={answer != null ? L.answer.editMeta(answer) : undefined}
          />
        )}
      </PageSection>

      {/* 관리자 메모 — 내부 전용.
          목록 + 작성 칸 + [수정][삭제]는 MemoBox가 통째로 그린다(같은 메모 UI를 두 번 짜지 않는다).
          제목은 이미 PageSection이 갖고 있고 카드 크롬도 PageSection 것이라 header/frame은 끈다. */}
      {showMemos && (
        <PageSection
          title={L.sections.memos}
          actions={
            <Badge variant="warning" appearance="soft" size="sm" label={L.memo.internalBadge} />
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
            emptyText={L.memo.empty}
            placeholder={L.memo.placeholder}
            saveLabel={L.memo.save}
            savingLabel={L.memo.saving}
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
      <PageSection title={L.sections.author}>
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
            <Field label={L.author.email} value={author.email} />
            <Field label={L.author.phone} value={author.phone} />
            <Field
              label={L.author.grade}
              value={<Tag label={author.grade} tone="warning" size="sm" />}
            />
            <Field
              label={L.author.recentOrder}
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
                  L.author.noOrder
                )
              }
            />
          </div>
        </div>
      </PageSection>
      )}

      {showStatusPanel && (
        <PageSection title={L.sections.statusPanel}>
          <div className={styles.status}>
            <StatusTimeline steps={steps} />
            <div className={styles.statusForm}>
              <Select
                label={L.statusPanel.field}
                value={draftStatus}
                onChange={(value) => setDraftStatus(value as InquiryStatus)}
                options={statusOptions}
              />
              <Button
                variant="primary"
                size="sm"
                label={L.statusPanel.save}
                disabled={draftStatus === header.status}
                onClick={commitStatus}
              />
            </div>
          </div>
        </PageSection>
      )}

      {history.length > 0 && (
        <PageSection title={L.sections.history}>
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
          label={L.actions.list}
          onClick={onBackToList}
        />
        {showNav && (
          <>
            <Button
              variant="secondary"
              appearance="ghost"
              size="md"
              label={L.actions.prev}
              showLeftIcon
              leftIcon={prevIcon ?? <ChevronLeft size={16} />}
              disabled={!hasPrev}
              onClick={onPrev}
            />
            <Button
              variant="secondary"
              appearance="ghost"
              size="md"
              label={L.actions.next}
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
        label={L.actions.delete}
        showLeftIcon
        leftIcon={deleteIcon ?? <Trash2 size={16} />}
        onClick={() => setDeleteOpen(true)}
      />
      <Button
        variant="secondary"
        appearance="outline"
        size="md"
        label={L.actions.assignee}
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
        label={L.actions.status}
        onClick={() => {
          setDraftStatus(header.status)
          setStatusModalOpen(true)
        }}
      />
      <Button variant="secondary" size="md" label={L.actions.edit} onClick={onEdit} />
      <Button
        variant="primary"
        size="md"
        label={L.actions.submitAnswer}
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
        title={L.statusDialog.title}
        size="sm"
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              size="md"
              label={L.statusDialog.cancel}
              onClick={() => setStatusModalOpen(false)}
            />
            <Button
              variant="primary"
              size="md"
              label={L.statusDialog.confirm}
              disabled={draftStatus === header.status}
              onClick={commitStatus}
            />
          </div>
        }
      >
        <Select
          label={L.statusDialog.field}
          value={draftStatus}
          onChange={(value) => setDraftStatus(value as InquiryStatus)}
          options={statusOptions}
          helperText={L.statusDialog.current(L.status[header.status])}
        />
      </Modal>

      {/* 담당자 변경 */}
      <Modal
        open={assigneeModalOpen}
        onClose={() => setAssigneeModalOpen(false)}
        title={L.assigneeDialog.title}
        size="sm"
        footer={
          <div className={styles.dialogActions}>
            <Button
              variant="secondary"
              size="md"
              label={L.assigneeDialog.cancel}
              onClick={() => setAssigneeModalOpen(false)}
            />
            <Button
              variant="primary"
              size="md"
              label={L.assigneeDialog.confirm}
              disabled={draftAssignee == null || draftAssignee === header.assignee}
              onClick={commitAssignee}
            />
          </div>
        }
      >
        {assignees.length === 0 ? (
          /* 빈 상태는 공용 EmptyState 한 규격으로 */
          <EmptyState
            kind="empty"
            title={L.assigneeDialog.empty.title ?? DEFAULT_EMPTY_ASSIGNEE}
            description={L.assigneeDialog.empty.description}
          />
        ) : (
          <Select
            label={L.assigneeDialog.field}
            value={draftAssignee}
            onChange={setDraftAssignee}
            options={assignees}
            placeholder={L.assigneeDialog.placeholder}
            helperText={L.assigneeDialog.current(header.assignee ?? L.header.unassigned)}
          />
        )}
      </Modal>

      {/* 메모 수정 */}
      <CrudDialog
        open={memoEditing != null}
        mode="edit"
        title={L.memoEditDialog.title}
        description={dialogDescription(L.memoEditDialog.description, [])}
        confirmLabel={L.memoEditDialog.confirmLabel}
        onConfirm={commitMemoEdit}
        onCancel={() => setMemoEditing(null)}
      >
        <Textarea
          label={L.memoEditDialog.field}
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
        title={L.memoDeleteDialog.title}
        description={
          memoDeleting != null
            ? dialogDescription(L.memoDeleteDialog.description, memoDeleting)
            : undefined
        }
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
        title={L.answerDeleteDialog.title}
        description={dialogDescription(L.answerDeleteDialog.description, [])}
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
        title={L.deleteDialog.title}
        description={dialogDescription(L.deleteDialog.description, header)}
        onConfirm={() => {
          onDelete?.()
          setDeleteOpen(false)
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  )
}
