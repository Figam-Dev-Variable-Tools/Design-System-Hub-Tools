import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, List, Pencil, Trash2 } from 'lucide-react'
import styles from './InquiryApplicationDetail.module.css'
import { AdminPageLayout } from '../AdminPageLayout/AdminPageLayout'
import { PageSection } from '../PageContainer/PageContainer'
import { Button } from '../Button/Button'
import { DefinitionList } from '../DefinitionList/DefinitionList'
import { EmptyState } from '../EmptyState/EmptyState'
import { MemoBox } from '../MemoBox/MemoBox'
import { QaList, type QaItem } from '../QaList/QaList'
import { Select, type SelectOption } from '../Select/Select'
import { Skeleton } from '../Skeleton/Skeleton'
import { StatusTimeline, type StatusStep } from '../StatusTimeline/StatusTimeline'
// 동의 배지 줄·메타 줄은 시공 문의 상세와 한 벌을 나눠 쓴다(같은 그림을 두 번 그리지 않는다)
import {
  ConsentBadges,
  MetaLine,
  DEFAULT_CONSENT_BADGE_LABELS,
  type ConsentBadgeItem,
  type ConsentBadgeLabels,
} from '../InquiryManageDetail/consent'
import { mergeLabels, type DeepPartialOneLevel, type EmptyLabels } from '../../shared/labels'

/** 동의 항목 — 배지 한 개로 그려진다(동의 = success / 미동의 = secondary) */
export type ApplicationConsent = ConsentBadgeItem

export type InquiryApplicationDetailLabels = {
  /** 카드 제목 — 본문 2개 + aside 2개 */
  sections: {
    applicant: string
    answers: string
    answersDescription: string
    status: string
    assignee: string
  }
  /** 신청자 카드의 필드·메타 라벨 */
  applicant: {
    name: string
    phone: string
    email: string
    createdAt: string
    updatedAt: string
    updatedBy: string
  }
  /** aside 상태 Select */
  status: { field: string; placeholder: string }
  /** aside 담당자 Select */
  assignee: { field: string; placeholder: string }
  /** aside 메모 — title/description을 비우면 MemoBox 기본값이 그대로 쓰인다 */
  memo: { title?: string; description?: string; placeholder: string }
  actions: {
    prev: string
    next: string
    list: string
    edit: string
    delete: string
    statusApply: string
  }
  /** 문의 응답이 0건일 때 */
  empty: EmptyLabels
  /** 동의 배지 접미사 — consent.tsx와 공유한다 */
  consent: ConsentBadgeLabels
}

/** EmptyLabels.title은 옵셔널(공용 타입)이라 최종 기본값을 이름으로 둔다 */
const DEFAULT_EMPTY_ANSWERS = '등록된 문의 응답이 없습니다'

export const DEFAULT_INQUIRY_APPLICATION_DETAIL_LABELS: InquiryApplicationDetailLabels = {
  sections: {
    applicant: '신청자 정보',
    answers: '문의 응답',
    answersDescription: '신청 폼에 입력된 답변입니다.',
    status: '상태 변경',
    assignee: '담당자',
  },
  applicant: {
    name: '이름',
    phone: '연락처',
    email: '이메일',
    createdAt: '신청일',
    updatedAt: '수정일',
    updatedBy: '수정자',
  },
  status: { field: '현재 상태', placeholder: '상태 선택' },
  assignee: { field: '배정된 담당자', placeholder: '담당자 선택' },
  memo: { placeholder: '상담 이력·처리 근거를 남겨 주세요.' },
  actions: {
    prev: '이전',
    next: '다음',
    list: '목록',
    edit: '수정',
    delete: '삭제',
    statusApply: '상태 변경',
  },
  empty: { title: DEFAULT_EMPTY_ANSWERS },
  consent: DEFAULT_CONSENT_BADGE_LABELS,
}

export type ApplicationApplicant = {
  name: string
  phone: string
  email: string
  /** 동의 배지 — 개인정보/마케팅 등. 비우면 배지 줄이 사라진다 */
  consents?: ApplicationConsent[]
  /** 메타 줄 — 신청일 · 수정일 · 수정자 */
  createdAt: string
  updatedAt?: string
  updatedBy?: string
}

/** 문의 응답 1건 — QaList의 항목 타입을 그대로 쓴다(Q/A 마크·번호는 QaList가 붙인다) */
export type ApplicationAnswer = QaItem

export type InquiryApplicationDetailProps = {
  title?: string
  description?: string
  /** [신청자 정보] 카드 */
  applicant: ApplicationApplicant
  /** [문의 응답] 카드 — Q1~Qn. 비면 공용 빈 상태 플레이스홀더 */
  answers: ApplicationAnswer[]
  /** 우 aside: 상태 변경 — 진행 단계 + 현재 상태 Select */
  statusSteps?: StatusStep[]
  status: string | null
  statusOptions: SelectOption[]
  onStatusChange?: (value: string) => void
  /** 우 aside: 담당자 */
  assignee?: string | null
  assigneeOptions?: SelectOption[]
  onAssigneeChange?: (value: string) => void
  /** 우 aside: 관리자 메모 — value/onChange가 모두 있어야 렌더된다 */
  memo?: string
  onMemoChange?: (value: string) => void
  onMemoSave?: () => void
  memoSaving?: boolean
  /** 로딩 — 카드 골격만 남기고 내용은 스켈레톤으로 대체 */
  loading?: boolean
  /** 밀도 — 정의 목록 행 높이(compact 44 / comfortable 56)까지 함께 바뀐다 */
  density?: 'compact' | 'comfortable'
  /** 본문 최대 폭 (기본 full) — 읽기 위주의 좁은 상세로 줄일 때 lg/md로 내린다 */
  maxWidth?: 'md' | 'lg' | 'full'
  /** 문구 — 넘기지 않으면 오늘과 같은 화면이 나온다 */
  labels?: DeepPartialOneLevel<InquiryApplicationDetailLabels>
  /** footer */
  onList?: () => void
  onEdit?: () => void
  onDelete?: () => void
  /** footer '상태 변경' — aside에서 고른 상태를 확정 저장한다 */
  onStatusApply?: () => void
  hasPrev?: boolean
  hasNext?: boolean
  onPrev?: () => void
  onNext?: () => void

  /* ── 섹션 ON/OFF — 전부 기본 true. false면 그 영역이 DOM에서 통째로 사라진다 ── */
  /** aside의 [상태 변경] 카드(진행 단계 + 현재 상태 Select). 상태를 서버가 정하는 읽기 화면에서 끈다 */
  showStatus?: boolean
  /** 신청자 카드 안 동의 배지 줄 — 동의 항목을 안 받는 폼이면 줄 자체가 없다 */
  showConsents?: boolean
  /** 신청자 카드 안 메타 줄(신청일 · 수정일 · 수정자) */
  showMeta?: boolean

  /* ── 아이콘 슬롯 ── */
  /** 이전 버튼 아이콘 (기본 ChevronLeft) */
  prevIcon?: ReactNode
  /** 다음 버튼 아이콘 (기본 ChevronRight) */
  nextIcon?: ReactNode
  /** 수정 버튼 아이콘 (기본 Pencil) */
  editIcon?: ReactNode
  /** 삭제 버튼 아이콘 (기본 Trash2) */
  deleteIcon?: ReactNode
}

/** 신청자 정보의 3열 라벨-값 — DefinitionList(1열) 3개를 그리드에 나란히 세운다.
 *  DefinitionList는 columns 1|2만 지원하므로, 3열은 여기서 조합해 만든다. */
function ApplicantFields({
  applicant,
  density,
  labels,
}: {
  applicant: ApplicationApplicant
  density: 'compact' | 'comfortable'
  labels: InquiryApplicationDetailLabels['applicant']
}) {
  const fields = [
    { label: labels.name, value: applicant.name },
    { label: labels.phone, value: applicant.phone },
    { label: labels.email, value: applicant.email },
  ]

  return (
    <div className={styles.triple}>
      {fields.map((field) => (
        <DefinitionList
          key={field.label}
          items={[{ label: field.label, value: field.value }]}
          density={density}
          divider={false}
        />
      ))}
    </div>
  )
}

/**
 * InquiryApplicationDetail — 문의 신청 상세.
 *
 * 레이아웃은 직접 짜지 않고 AdminPageLayout 슬롯에 꽂아서 만든다.
 *   children : [신청자 정보] + [문의 응답]
 *   aside    : 상태 변경(StatusTimeline + Select) · 담당자 · 관리자 메모(MemoBox)
 *   footer   : 목록 · 수정 · 삭제 · 상태 변경 / 이전·다음
 *
 * 값과 콜백은 전부 props다 — 화면은 데이터가 시키는 대로만 그린다.
 * 콜백이 없는 액션은 footer/aside에서 아예 렌더되지 않는다(빈 버튼이 남지 않게).
 */
export function InquiryApplicationDetail({
  title = '문의 신청 상세',
  description,
  applicant,
  answers,
  statusSteps,
  status,
  statusOptions,
  onStatusChange,
  assignee,
  assigneeOptions,
  onAssigneeChange,
  memo,
  onMemoChange,
  onMemoSave,
  memoSaving = false,
  loading = false,
  density = 'compact',
  maxWidth = 'full',
  labels,
  onList,
  onEdit,
  onDelete,
  onStatusApply,
  hasPrev = false,
  hasNext = false,
  onPrev,
  onNext,
  showStatus = true,
  showConsents = true,
  showMeta = true,
  prevIcon,
  nextIcon,
  editIcon,
  deleteIcon,
}: InquiryApplicationDetailProps) {
  const L = mergeLabels(DEFAULT_INQUIRY_APPLICATION_DETAIL_LABELS, labels)
  const consents = applicant.consents ?? []
  const showMemo = memo != null && onMemoChange != null
  const showAssignee = assigneeOptions != null && assigneeOptions.length > 0
  // 이전/다음은 둘 중 하나라도 핸들러가 있으면 낸다 — 목록 양 끝에서는 disabled로만 죽인다
  const showNav = onPrev != null || onNext != null

  // 값이 없는 메타 쌍은 아예 만들지 않는다 — '수정일 -' 같은 빈 자리가 남지 않게
  const metaItems = [
    { label: L.applicant.createdAt, value: applicant.createdAt },
    ...(applicant.updatedAt != null
      ? [{ label: L.applicant.updatedAt, value: applicant.updatedAt }]
      : []),
    ...(applicant.updatedBy != null
      ? [{ label: L.applicant.updatedBy, value: applicant.updatedBy }]
      : []),
  ]

  const applicantBody = loading ? (
    <div className={styles.skeletonBlock}>
      <Skeleton variant="text" lines={2} />
      <Skeleton variant="block" height={44} />
    </div>
  ) : (
    <>
      <ApplicantFields applicant={applicant} density={density} labels={L.applicant} />
      {showConsents && consents.length > 0 && (
        <ConsentBadges consents={consents} labels={L.consent} />
      )}
      {showMeta && metaItems.length > 0 && <MetaLine items={metaItems} />}
    </>
  )

  const answersBody = loading ? (
    <div className={styles.skeletonBlock}>
      <Skeleton variant="text" lines={3} />
      <Skeleton variant="text" lines={3} />
    </div>
  ) : answers.length === 0 ? (
    /* 빈 상태는 공용 EmptyState 한 규격으로 */
    <EmptyState
      kind="empty"
      title={L.empty.title ?? DEFAULT_EMPTY_ANSWERS}
      description={L.empty.description}
    />
  ) : (
    <QaList items={answers} />
  )

  return (
    <AdminPageLayout
      title={title}
      description={description}
      maxWidth={maxWidth}
      density={density}
      aside={
        <>
          {showStatus && (
            <PageSection title={L.sections.status}>
              {loading ? (
                <Skeleton variant="block" height={160} />
              ) : (
                <div className={styles.asideStack}>
                  {statusSteps != null && statusSteps.length > 0 && (
                    <StatusTimeline steps={statusSteps} direction="vertical" />
                  )}
                  <Select
                    label={L.status.field}
                    value={status}
                    options={statusOptions}
                    onChange={onStatusChange}
                    placeholder={L.status.placeholder}
                  />
                </div>
              )}
            </PageSection>
          )}

          {showAssignee && (
            <PageSection title={L.sections.assignee}>
              {loading ? (
                <Skeleton variant="block" height={44} />
              ) : (
                <Select
                  label={L.assignee.field}
                  value={assignee ?? null}
                  options={assigneeOptions}
                  onChange={onAssigneeChange}
                  placeholder={L.assignee.placeholder}
                />
              )}
            </PageSection>
          )}

          {showMemo && (
            <MemoBox
              value={memo}
              onChange={onMemoChange}
              onSave={onMemoSave}
              saving={memoSaving}
              title={L.memo.title}
              description={L.memo.description}
              placeholder={L.memo.placeholder}
            />
          )}
        </>
      }
      footer={
        <>
          {showNav && (
            <div className={styles.footerNav}>
              <Button
                variant="secondary"
                appearance="outline"
                size="md"
                label={L.actions.prev}
                disabled={!hasPrev || onPrev == null}
                showLeftIcon
                leftIcon={prevIcon ?? <ChevronLeft size={16} />}
                onClick={onPrev}
              />
              <Button
                variant="secondary"
                appearance="outline"
                size="md"
                label={L.actions.next}
                disabled={!hasNext || onNext == null}
                showRightIcon
                rightIcon={nextIcon ?? <ChevronRight size={16} />}
                onClick={onNext}
              />
            </div>
          )}

          {onList != null && (
            <Button
              variant="secondary"
              appearance="outline"
              size="md"
              label={L.actions.list}
              showLeftIcon
              leftIcon={<List size={16} />}
              onClick={onList}
            />
          )}
          {onDelete != null && (
            <Button
              variant="error"
              appearance="outline"
              size="md"
              label={L.actions.delete}
              showLeftIcon
              leftIcon={deleteIcon ?? <Trash2 size={16} />}
              onClick={onDelete}
            />
          )}
          {onEdit != null && (
            <Button
              variant="secondary"
              size="md"
              label={L.actions.edit}
              showLeftIcon
              leftIcon={editIcon ?? <Pencil size={16} />}
              onClick={onEdit}
            />
          )}
          {onStatusApply != null && (
            <Button
              variant="primary"
              size="md"
              label={L.actions.statusApply}
              onClick={onStatusApply}
            />
          )}
        </>
      }
    >
      <PageSection title={L.sections.applicant}>{applicantBody}</PageSection>
      <PageSection title={L.sections.answers} description={L.sections.answersDescription}>
        {answersBody}
      </PageSection>
    </AdminPageLayout>
  )
}
