import { List, Save, Send, Trash2 } from 'lucide-react'
import { AdminPageLayout } from '../AdminPageLayout/AdminPageLayout'
import { PageSection } from '../PageContainer/PageContainer'
import { PageHeaderBar } from '../PageHeaderBar/PageHeaderBar'
import { FormSection } from '../FormSection/FormSection'
import { FieldRow } from '../FieldRow/FieldRow'
import { QaList, type QaItem } from '../QaList/QaList'
import { DefinitionList } from '../DefinitionList/DefinitionList'
import { EmptyState } from '../EmptyState/EmptyState'
import { Button } from '../Button/Button'
import { Checkbox } from '../Checkbox/Checkbox'
import { InputBase } from '../InputBase/InputBase'
import { Select, type SelectOption } from '../Select/Select'
import { Textarea } from '../Textarea/Textarea'
import { ConsentBadges, MetaLine, type ConsentBadgeItem } from './consent'
import styles from './InquiryManageDetail.module.css'

/* ────────────────────────────────────────────────────────────
 * 공통 타입
 * ──────────────────────────────────────────────────────────── */

/** 상태 배지 톤 — Badge/PageHeaderBar가 받는 5톤 그대로 */
export type InquiryStatusTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error'

/** 헤더 제목 옆 상태 배지 — '대기중' */
export type InquiryStatus = {
  label: string
  tone?: InquiryStatusTone
}

/**
 * 동의 항목 — 배지 하나로 그려진다(동의 = success soft / 미동의 = secondary soft).
 * 실제 그림은 문의 신청 상세와 공유하는 consent.tsx의 ConsentBadges가 그린다.
 */
export type InquiryConsent = ConsentBadgeItem

/** [신청자 정보] 카드가 그리는 값 */
export type InquiryApplicant = {
  name: string
  phone: string
  email: string
  /** 동의 배지 — show.consent가 켜져 있을 때만 그린다 */
  consents?: InquiryConsent[]
  /** 메타 줄 — 신청일 · 수정일 · 수정자. show.meta가 켜져 있을 때만 그린다 */
  createdAt: string
  updatedAt?: string
  updatedBy?: string
}

/** 문의 응답 1건 — Q/A 마크와 번호는 QaList가 붙인다 */
export type InquiryQa = QaItem

/**
 * ON/OFF 규약 — 값이 false면 그 영역이 DOM에서 통째로 사라진다.
 * (빈 자리·여백·구분선이 남지 않는다. 기본값은 전부 true)
 */
export type InquiryManageDetailShow = {
  /** 페이지 헤더 — 타이틀 + 상태 배지 + [저장] */
  header?: boolean
  /** [신청자 정보] 카드 */
  applicant?: boolean
  /** 신청자 카드 안 동의 배지 줄 */
  consent?: boolean
  /** 신청자 카드 안 메타 줄(신청일 · 수정일 · 수정자) */
  meta?: boolean
  /** [문의 응답] 카드 — QaList */
  qa?: boolean
  /** [답변] 카드 — 관리자 답변 작성 */
  answer?: boolean
  /** 하단 sticky 액션 바 */
  footer?: boolean
}

export type InquiryManageDetailProps = {
  title?: string
  description?: string
  /** 제목 옆 상태 배지 */
  status?: InquiryStatus
  /** [신청자 정보] */
  applicant: InquiryApplicant
  /** [문의 응답] Q1~Qn — 비면 공용 빈 상태 플레이스홀더 */
  qa?: InquiryQa[]
  /** [답변] 본문 — 제어 컴포넌트다 */
  answer?: string
  onAnswerChange?: (value: string) => void
  /** 답변 필드의 3상태 — error가 있으면 description 대신 에러 문구가 나온다 */
  answerDescription?: string
  answerError?: string
  /** [답변] 카드의 자체 ON/OFF 토글 — 핸들러가 있어야 토글 행이 뜬다 */
  answerEnabled?: boolean
  onAnswerEnabledChange?: (value: boolean) => void
  /** 답변 메타 — 답변일 · 답변자 */
  answeredAt?: string
  answeredBy?: string
  /** 헤더·푸터 [저장] */
  onSave?: () => void
  saving?: boolean
  /** 푸터 */
  onList?: () => void
  onDelete?: () => void
  /** 섹션 ON/OFF */
  show?: InquiryManageDetailShow
  /** 밀도 — 정의 목록 행 높이(compact 44 / comfortable 56)까지 함께 바뀐다 */
  density?: 'compact' | 'comfortable'
}

/** show 기본값 — 전부 true */
const SHOW_DEFAULT: Required<InquiryManageDetailShow> = {
  header: true,
  applicant: true,
  consent: true,
  meta: true,
  qa: true,
  answer: true,
  footer: true,
}

/* ────────────────────────────────────────────────────────────
 * 신청자 정보 조각
 * ──────────────────────────────────────────────────────────── */

/** 3열(이름 / 연락처 / 이메일) — DefinitionList는 columns 1|2까지라 1열짜리 3개를 나란히 세운다 */
function ApplicantFields({
  applicant,
  density,
}: {
  applicant: InquiryApplicant
  density: 'compact' | 'comfortable'
}) {
  const fields = [
    { label: '이름', value: applicant.name },
    { label: '연락처', value: applicant.phone },
    { label: '이메일', value: applicant.email },
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

/* ────────────────────────────────────────────────────────────
 * InquiryManageDetail — 시공 문의 상세(어드민)
 * ──────────────────────────────────────────────────────────── */

/**
 * 레이아웃을 직접 짜지 않는다. AdminPageLayout 슬롯에 조각을 꽂아서 만든다.
 *   children : PageHeaderBar + [신청자 정보] + [문의 응답] + [답변]
 *   footer   : 목록 · 삭제 · 저장
 *
 * 헤더는 AdminPageLayout의 title 슬롯 대신 PageHeaderBar를 본문 맨 위에 놓는다
 * (상태 배지를 제목 옆에 달아야 하기 때문 — AdminPageLayout의 title/headerActions는 비운다).
 *
 * ON/OFF: show의 각 키가 false면 그 영역을 렌더하지 않는다. footer는 남은 액션이
 * 하나도 없으면 슬롯 자체를 넘기지 않아 sticky 바가 뜨지 않는다.
 */
export function InquiryManageDetail({
  title = '시공 문의 상세',
  description,
  status,
  applicant,
  qa = [],
  answer = '',
  onAnswerChange,
  answerDescription,
  answerError,
  answerEnabled = true,
  onAnswerEnabledChange,
  answeredAt,
  answeredBy,
  onSave,
  saving = false,
  onList,
  onDelete,
  show,
  density = 'compact',
}: InquiryManageDetailProps) {
  const on = { ...SHOW_DEFAULT, ...show }

  const consents = applicant.consents ?? []
  const showConsents = on.consent && consents.length > 0

  // 값이 없는 메타 쌍은 아예 만들지 않는다 — '수정일 -' 같은 빈 자리가 남지 않게
  const metaItems = [
    { label: '신청일', value: applicant.createdAt },
    ...(applicant.updatedAt != null ? [{ label: '수정일', value: applicant.updatedAt }] : []),
    ...(applicant.updatedBy != null ? [{ label: '수정자', value: applicant.updatedBy }] : []),
  ]
  const showMeta = on.meta && metaItems.length > 0

  const saveButton =
    onSave != null ? (
      <Button
        variant="primary"
        size="md"
        label="저장"
        disabled={saving}
        showLeftIcon
        leftIcon={<Save size={16} />}
        onClick={onSave}
      />
    ) : null

  // 푸터에 남는 액션이 하나도 없으면 슬롯을 넘기지 않는다(빈 sticky 바 금지)
  const hasFooterAction = onList != null || onDelete != null || onSave != null
  const footer =
    on.footer && hasFooterAction ? (
      <>
        {onList != null && (
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label="목록"
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
            label="삭제"
            showLeftIcon
            leftIcon={<Trash2 size={16} />}
            onClick={onDelete}
          />
        )}
        {saveButton}
      </>
    ) : undefined

  // 답변 메타(답변일 · 답변자) — 둘 다 없으면 줄 자체가 없다
  const answerMeta = [
    ...(answeredAt != null ? [{ label: '답변일', value: answeredAt }] : []),
    ...(answeredBy != null ? [{ label: '답변자', value: answeredBy }] : []),
  ]

  return (
    <AdminPageLayout maxWidth="lg" density={density} footer={footer}>
      {on.header && (
        <PageHeaderBar
          title={title}
          description={description}
          badge={status != null ? { label: status.label, tone: status.tone ?? 'warning' } : undefined}
          actions={saveButton}
        />
      )}

      {on.applicant && (
        <PageSection title="신청자 정보">
          <ApplicantFields applicant={applicant} density={density} />
          {showConsents && <ConsentBadges consents={consents} />}
          {showMeta && <MetaLine items={metaItems} />}
        </PageSection>
      )}

      {on.qa && (
        <PageSection title="문의 응답" description="신청 폼에 입력된 답변입니다.">
          {qa.length === 0 ? (
            /* 빈 상태는 공용 EmptyState 한 규격으로 — 그림+문구를 화면마다 다시 짜지 않는다 */
            <EmptyState kind="empty" title="등록된 문의 응답이 없습니다" />
          ) : (
            <QaList items={qa} />
          )}
        </PageSection>
      )}

      {on.answer && (
        <FormSection
          title="답변"
          description="등록한 답변은 신청자 메일로 함께 발송됩니다."
          toggleable={onAnswerEnabledChange != null}
          enabled={answerEnabled}
          onEnabledChange={onAnswerEnabledChange}
          toggleLabel="답변 사용"
          toggleDescription="끄면 신청자에게 답변이 노출되지 않습니다."
          disabledHint="답변 사용이 꺼져 있어 답변을 작성할 수 없습니다."
        >
          <FieldRow
            label="답변 내용"
            required
            description={answerDescription}
            error={answerError}
          >
            {/* Textarea는 임의 prop을 spread하지 않으므로 에러 톤은 자체 prop으로 함께 넘긴다 */}
            <Textarea
              value={answer}
              onChange={onAnswerChange}
              placeholder="답변 내용을 입력해주세요"
              rows={6}
              maxLength={1000}
              showCounter
              error={answerError != null && answerError !== ''}
            />
          </FieldRow>

          {answerMeta.length > 0 && <MetaLine items={answerMeta} />}
        </FormSection>
      )}
    </AdminPageLayout>
  )
}

/* ────────────────────────────────────────────────────────────
 * InquiryRequestForm — 고객이 제출하는 문의 폼
 * ──────────────────────────────────────────────────────────── */

export type InquiryRequestFormValue = {
  /** 업체 분류 — 아직 고르지 않았으면 null */
  category: string | null
  name: string
  email: string
  phone: string
  title: string
  content: string
  /** 개인정보 수집 및 이용 동의 */
  privacy: boolean
}

export type InquiryRequestField = keyof InquiryRequestFormValue

/** 필드별 보조 설명 / 에러 문구 — FieldRow의 3상태(기본 · description · error)를 여는 열쇠 */
export type InquiryRequestMessages = Partial<Record<InquiryRequestField, string>>

export type InquiryRequestFormProps = {
  value: InquiryRequestFormValue
  onChange: (value: InquiryRequestFormValue) => void
  /** 업체 분류 옵션 */
  categoryOptions?: SelectOption[]
  /** 필드별 보조 설명 — 해당 필드에 error가 있으면 에러 문구가 자리를 대신한다 */
  descriptions?: InquiryRequestMessages
  /** 필드별 에러 — 있으면 error 톤 + aria-invalid */
  errors?: InquiryRequestMessages
  onSubmit?: () => void
  submitting?: boolean
  title?: string
  description?: string
  submitLabel?: string
  /** 동의 체크박스 옆 문구 */
  privacyLabel?: string
}

/** 업체 분류 기본 옵션 — 사용처가 categoryOptions를 넘기면 대체된다 */
const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'cafe', label: '카페 · 베이커리' },
  { value: 'restaurant', label: '음식점 · 주점' },
  { value: 'retail', label: '리테일 · 편집숍' },
  { value: 'fitness', label: '피트니스 · 필라테스' },
  { value: 'office', label: '오피스 · 사무공간' },
  { value: 'etc', label: '기타' },
]

/**
 * InquiryRequestForm — 고객이 제출하는 문의 폼.
 *
 * 골격은 FormSection(카드) + FieldRow(라벨·필수·설명/에러) 한 규격으로만 짠다.
 * 모든 필드가 기본 / description / error 3상태를 갖는다 —
 * descriptions·errors를 필드 키로 넘기면 FieldRow가 같은 자리에 문구를 바꿔 낸다.
 *
 * 제어 컴포넌트다. 값 하나가 바뀌면 value 전체를 새로 만들어 onChange로 올린다.
 */
export function InquiryRequestForm({
  value,
  onChange,
  categoryOptions = CATEGORY_OPTIONS,
  descriptions,
  errors,
  onSubmit,
  submitting = false,
  title = '문의하기',
  description = '남겨 주신 내용을 확인한 뒤 담당자가 순차적으로 연락드립니다.',
  submitLabel = '문의하기',
  privacyLabel = '개인정보 수집 및 이용에 동의합니다.',
}: InquiryRequestFormProps) {
  /** 필드 하나만 갈아 끼운 새 value를 올린다 */
  const set = <K extends InquiryRequestField>(key: K, next: InquiryRequestFormValue[K]) => {
    onChange({ ...value, [key]: next })
  }

  /** 에러가 있는 필드인지 — 프리미티브의 error prop(테두리 톤)에 함께 넘긴다 */
  const hasError = (key: InquiryRequestField) => {
    const message = errors?.[key]
    return message != null && message !== ''
  }

  return (
    <FormSection title={title} description={description}>
      <FieldRow
        label="업체 분류"
        required
        span={1}
        description={descriptions?.category}
        error={errors?.category}
      >
        <Select
          value={value.category}
          options={categoryOptions}
          onChange={(next) => set('category', next)}
          placeholder="분류를 선택해주세요"
          error={hasError('category')}
        />
      </FieldRow>

      <FieldRow
        label="성함"
        required
        span={1}
        description={descriptions?.name}
        error={errors?.name}
      >
        <InputBase
          value={value.name}
          onChange={(next) => set('name', next)}
          placeholder="성함을 입력해주세요"
          error={hasError('name')}
        />
      </FieldRow>

      <FieldRow
        label="이메일"
        required
        span={1}
        description={descriptions?.email}
        error={errors?.email}
      >
        <InputBase
          value={value.email}
          onChange={(next) => set('email', next)}
          type="email"
          inputMode="email"
          placeholder="이메일을 입력해주세요"
          error={hasError('email')}
        />
      </FieldRow>

      <FieldRow
        label="연락처"
        required
        span={1}
        description={descriptions?.phone}
        error={errors?.phone}
      >
        <InputBase
          value={value.phone}
          onChange={(next) => set('phone', next)}
          type="tel"
          inputMode="tel"
          placeholder="연락처를 입력해주세요"
          error={hasError('phone')}
        />
      </FieldRow>

      <FieldRow
        label="문의 제목"
        required
        span={2}
        description={descriptions?.title}
        error={errors?.title}
      >
        <InputBase
          value={value.title}
          onChange={(next) => set('title', next)}
          placeholder="제목을 입력해주세요"
          maxLength={60}
          error={hasError('title')}
        />
      </FieldRow>

      {/* span 없이 — 본문 3열을 한 줄로 전부 쓴다 */}
      <FieldRow
        label="문의 내용"
        required
        description={descriptions?.content}
        error={errors?.content}
      >
        <Textarea
          value={value.content}
          onChange={(next) => set('content', next)}
          placeholder="문의 내용을 입력해주세요"
          rows={6}
          maxLength={1000}
          showCounter
          error={hasError('content')}
        />
      </FieldRow>

      <FieldRow
        label="개인정보 수집 및 이용 안내"
        required
        description={descriptions?.privacy}
        error={errors?.privacy}
      >
        <Checkbox
          checked={value.privacy}
          onChange={(next) => set('privacy', next)}
          label={privacyLabel}
        />
      </FieldRow>

      {onSubmit != null && (
        <div className={styles.formActions}>
          <Button
            variant="primary"
            size="lg"
            label={submitLabel}
            disabled={submitting}
            showLeftIcon
            leftIcon={<Send size={16} />}
            onClick={onSubmit}
          />
        </div>
      )}
    </FormSection>
  )
}
