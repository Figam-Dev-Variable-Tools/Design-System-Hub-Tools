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
import {
  ConsentBadges,
  MetaLine,
  DEFAULT_CONSENT_BADGE_LABELS,
  type ConsentBadgeItem,
  type ConsentBadgeLabels,
} from './consent'
import { mergeLabels, type DeepPartialOneLevel, type EmptyLabels } from '../../shared/labels'
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

export type InquiryManageDetailLabels = {
  /** 카드 제목과 카드 설명 */
  sections: {
    applicant: string
    qa: string
    qaDescription: string
    answer: string
    /** [답변] 카드의 설명 — 필드 설명(answerDescription prop)과는 다른 자리다 */
    answerDescription: string
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
  /** 답변 카드 — 필드 라벨 · 입력 안내 · 토글 · 메타 */
  answer: {
    field: string
    placeholder: string
    answeredAt: string
    answeredBy: string
    toggle: string
    toggleDescription: string
    disabledHint: string
  }
  actions: { save: string; list: string; delete: string }
  /** 문의 응답이 0건일 때 */
  empty: EmptyLabels
  /** 동의 배지 접미사 — consent.tsx와 공유한다 */
  consent: ConsentBadgeLabels
}

/** EmptyLabels.title은 옵셔널(공용 타입)이라 최종 기본값을 이름으로 둔다 */
const DEFAULT_EMPTY_QA = '등록된 문의 응답이 없습니다'

export const DEFAULT_INQUIRY_MANAGE_DETAIL_LABELS: InquiryManageDetailLabels = {
  sections: {
    applicant: '신청자 정보',
    qa: '문의 응답',
    qaDescription: '신청 폼에 입력된 답변입니다.',
    answer: '답변',
    answerDescription: '등록한 답변은 신청자 메일로 함께 발송됩니다.',
  },
  applicant: {
    name: '이름',
    phone: '연락처',
    email: '이메일',
    createdAt: '신청일',
    updatedAt: '수정일',
    updatedBy: '수정자',
  },
  answer: {
    field: '답변 내용',
    placeholder: '답변 내용을 입력해주세요',
    answeredAt: '답변일',
    answeredBy: '답변자',
    toggle: '답변 사용',
    toggleDescription: '끄면 신청자에게 답변이 노출되지 않습니다.',
    disabledHint: '답변 사용이 꺼져 있어 답변을 작성할 수 없습니다.',
  },
  actions: { save: '저장', list: '목록', delete: '삭제' },
  empty: { title: DEFAULT_EMPTY_QA },
  consent: DEFAULT_CONSENT_BADGE_LABELS,
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
  /** 본문 최대 폭 (기본 lg) — 정보가 많은 어드민 화면은 full로 넓힌다 */
  maxWidth?: 'md' | 'lg' | 'full'
  /** 문구 — 넘기지 않으면 오늘과 같은 화면이 나온다 */
  labels?: DeepPartialOneLevel<InquiryManageDetailLabels>
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
  labels,
}: {
  applicant: InquiryApplicant
  density: 'compact' | 'comfortable'
  labels: InquiryManageDetailLabels['applicant']
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
  maxWidth = 'lg',
  labels,
}: InquiryManageDetailProps) {
  const on = { ...SHOW_DEFAULT, ...show }
  const L = mergeLabels(DEFAULT_INQUIRY_MANAGE_DETAIL_LABELS, labels)

  const consents = applicant.consents ?? []
  const showConsents = on.consent && consents.length > 0

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
  const showMeta = on.meta && metaItems.length > 0

  const saveButton =
    onSave != null ? (
      <Button
        variant="primary"
        size="md"
        label={L.actions.save}
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
            leftIcon={<Trash2 size={16} />}
            onClick={onDelete}
          />
        )}
        {saveButton}
      </>
    ) : undefined

  // 답변 메타(답변일 · 답변자) — 둘 다 없으면 줄 자체가 없다
  const answerMeta = [
    ...(answeredAt != null ? [{ label: L.answer.answeredAt, value: answeredAt }] : []),
    ...(answeredBy != null ? [{ label: L.answer.answeredBy, value: answeredBy }] : []),
  ]

  return (
    <AdminPageLayout maxWidth={maxWidth} density={density} footer={footer}>
      {on.header && (
        <PageHeaderBar
          title={title}
          description={description}
          badge={status != null ? { label: status.label, tone: status.tone ?? 'warning' } : undefined}
          actions={saveButton}
        />
      )}

      {on.applicant && (
        <PageSection title={L.sections.applicant}>
          <ApplicantFields applicant={applicant} density={density} labels={L.applicant} />
          {showConsents && <ConsentBadges consents={consents} labels={L.consent} />}
          {showMeta && <MetaLine items={metaItems} />}
        </PageSection>
      )}

      {on.qa && (
        <PageSection title={L.sections.qa} description={L.sections.qaDescription}>
          {qa.length === 0 ? (
            /* 빈 상태는 공용 EmptyState 한 규격으로 — 그림+문구를 화면마다 다시 짜지 않는다 */
            <EmptyState
              kind="empty"
              title={L.empty.title ?? DEFAULT_EMPTY_QA}
              description={L.empty.description}
            />
          ) : (
            <QaList items={qa} />
          )}
        </PageSection>
      )}

      {on.answer && (
        <FormSection
          title={L.sections.answer}
          description={L.sections.answerDescription}
          toggleable={onAnswerEnabledChange != null}
          enabled={answerEnabled}
          onEnabledChange={onAnswerEnabledChange}
          toggleLabel={L.answer.toggle}
          toggleDescription={L.answer.toggleDescription}
          disabledHint={L.answer.disabledHint}
        >
          <FieldRow
            label={L.answer.field}
            required
            description={answerDescription}
            error={answerError}
          >
            {/* Textarea는 임의 prop을 spread하지 않으므로 에러 톤은 자체 prop으로 함께 넘긴다 */}
            <Textarea
              value={answer}
              onChange={onAnswerChange}
              placeholder={L.answer.placeholder}
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

/** 동의 체크박스에는 입력 자리가 없다 — placeholder를 갖는 필드만 키로 남긴다 */
type InquiryRequestInputField = Exclude<InquiryRequestField, 'privacy'>

export type InquiryRequestFormLabels = {
  /** FieldRow 라벨 — 키는 값(InquiryRequestFormValue)과 1:1 */
  fields: Record<InquiryRequestField, string>
  /** 입력 placeholder */
  placeholders: Record<InquiryRequestInputField, string>
}

export const DEFAULT_INQUIRY_REQUEST_FORM_LABELS: InquiryRequestFormLabels = {
  fields: {
    category: '업체 분류',
    name: '성함',
    email: '이메일',
    phone: '연락처',
    title: '문의 제목',
    content: '문의 내용',
    privacy: '개인정보 수집 및 이용 안내',
  },
  placeholders: {
    category: '분류를 선택해주세요',
    name: '성함을 입력해주세요',
    email: '이메일을 입력해주세요',
    phone: '연락처를 입력해주세요',
    title: '제목을 입력해주세요',
    content: '문의 내용을 입력해주세요',
  },
}

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
  /** 문구 — 필드 라벨·placeholder */
  labels?: DeepPartialOneLevel<InquiryRequestFormLabels>
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
  labels,
}: InquiryRequestFormProps) {
  const L = mergeLabels(DEFAULT_INQUIRY_REQUEST_FORM_LABELS, labels)

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
        label={L.fields.category}
        required
        span={1}
        description={descriptions?.category}
        error={errors?.category}
      >
        <Select
          value={value.category}
          options={categoryOptions}
          onChange={(next) => set('category', next)}
          placeholder={L.placeholders.category}
          error={hasError('category')}
        />
      </FieldRow>

      <FieldRow
        label={L.fields.name}
        required
        span={1}
        description={descriptions?.name}
        error={errors?.name}
      >
        <InputBase
          value={value.name}
          onChange={(next) => set('name', next)}
          placeholder={L.placeholders.name}
          error={hasError('name')}
        />
      </FieldRow>

      <FieldRow
        label={L.fields.email}
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
          placeholder={L.placeholders.email}
          error={hasError('email')}
        />
      </FieldRow>

      <FieldRow
        label={L.fields.phone}
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
          placeholder={L.placeholders.phone}
          error={hasError('phone')}
        />
      </FieldRow>

      <FieldRow
        label={L.fields.title}
        required
        span={2}
        description={descriptions?.title}
        error={errors?.title}
      >
        <InputBase
          value={value.title}
          onChange={(next) => set('title', next)}
          placeholder={L.placeholders.title}
          maxLength={60}
          error={hasError('title')}
        />
      </FieldRow>

      {/* span 없이 — 본문 3열을 한 줄로 전부 쓴다 */}
      <FieldRow
        label={L.fields.content}
        required
        description={descriptions?.content}
        error={errors?.content}
      >
        <Textarea
          value={value.content}
          onChange={(next) => set('content', next)}
          placeholder={L.placeholders.content}
          rows={6}
          maxLength={1000}
          showCounter
          error={hasError('content')}
        />
      </FieldRow>

      <FieldRow
        label={L.fields.privacy}
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
