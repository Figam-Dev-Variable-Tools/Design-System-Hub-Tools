import { useState, type ReactNode } from 'react'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Placeholder } from '../../shared/placeholders'
import { AttachmentList, type Attachment } from '../AttachmentList/AttachmentList'
import { Button } from '../Button/Button'
import { Checkbox } from '../Checkbox/Checkbox'
import { DropZone } from '../DropZone/DropZone'
import { InputBase } from '../InputBase/InputBase'
import { Select } from '../Select/Select'
import { SiteSection } from '../SiteSection/SiteSection'
import { Textarea } from '../Textarea/Textarea'
import { mergeLabels, type DeepPartialOneLevel, type LabelFn } from '../../shared/labels'
import styles from './ContactPage.module.css'

/** 오시는 길 정보 카드 4종의 값 — 각 항목은 줄 단위 배열. showInfo=true일 때만 그린다. */
export type ContactLocation = {
  address: string[]
  phone: string[]
  email: string[]
  hours: string[]
}

export type InquiryFormValue = {
  name: string
  email: string
  phone: string
  type: string | null
  title: string
  content: string
  files: File[]
  agreed: boolean
}

/** 문의 유형(업체 분류) Select의 옵션 */
export type InquiryType = {
  label: string
  value: string
}

/** 문의 폼의 필드 키 — 라벨·플레이스홀더·에러 문구가 모두 이 키를 공유한다 */
export type ContactFieldKey = 'name' | 'email' | 'phone' | 'type' | 'title' | 'content'

/** 화면에 나오는 모든 글자 — 값(value)과 문의 유형(types)만 데이터다 */
export type ContactPageLabels = {
  /** 폼 머리글 */
  title: string
  /** 머리글 아래 안내 문구 */
  description: string
  /** 필드 라벨 */
  fields: Record<ContactFieldKey, string>
  /** 필드 플레이스홀더 */
  placeholders: Record<ContactFieldKey, string>
  /** 유효성 메시지 — 키별 '비어 있음' 문구 + 이메일 형식 오류 */
  errors: Record<ContactFieldKey, string> & { emailInvalid: string }
  /** 오시는 길 카드 머리글(showInfo=true일 때) */
  info: Record<keyof ContactLocation, string>
  /** 파일 첨부 블록(showAttachment=true일 때) — hint는 상한 용량(MB)을 받는다 */
  attachment: { label: string; hint: LabelFn<number> }
  /** 개인정보 동의 체크박스 */
  agreement: string
  /** 제출 버튼 — submitting=true면 submitting 문구로 바뀐다 */
  submit: string
  submitting: string
  /** 지도 슬롯이 비었을 때의 플레이스홀더 */
  mapPlaceholder: string
}

export const DEFAULT_CONTACT_PAGE_LABELS: ContactPageLabels = {
  title: '문의하기',
  description: '궁금하신 점을 남겨주시면 담당자가 확인 후 연락드리겠습니다.',
  fields: {
    type: '업체 분류',
    name: '성함',
    email: '이메일',
    phone: '연락처',
    title: '문의 제목',
    content: '문의 내용',
  },
  placeholders: {
    type: '분류를 선택해주세요',
    name: '성함을 입력해주세요',
    email: '이메일을 입력해주세요',
    phone: '연락처를 입력해주세요',
    title: '제목을 입력해주세요',
    content: '문의 내용을 상세히 입력해주세요',
  },
  errors: {
    name: '성함을 입력해주세요.',
    email: '이메일을 입력해주세요.',
    emailInvalid: '이메일 형식이 올바르지 않습니다.',
    phone: '연락처를 입력해주세요.',
    type: '업체 분류를 선택해주세요.',
    title: '문의 제목을 입력해주세요.',
    content: '문의 내용을 입력해주세요.',
  },
  info: {
    address: 'Address',
    phone: 'Phone',
    email: 'Email',
    hours: 'Hours',
  },
  attachment: {
    label: '파일 첨부',
    hint: (maxMb) => `현장 사진이나 도면이 있다면 첨부해주세요 (최대 ${maxMb}MB)`,
  },
  agreement: '개인정보 수집 및 이용에 동의합니다',
  submit: '문의하기',
  submitting: '전송 중…',
  mapPlaceholder: '지도 준비 중',
}

export type ContactPageProps = {
  value: InquiryFormValue
  onChange: (value: InquiryFormValue) => void
  /** 유효성 검사를 통과했을 때만 호출된다 */
  onSubmit?: () => void
  submitting?: boolean
  types: InquiryType[]
  /** 문구 — 개별 prop(title·description·submitLabel)이 있으면 그쪽이 이긴다 */
  labels?: DeepPartialOneLevel<ContactPageLabels>
  /**
   * 필수 입력 필드 (기본 6개 전부).
   * 전화번호를 받지 않는 사이트처럼 필수 항목이 다를 때 준다 — 라벨의 * 표시와 검증이 같은 배열을 본다.
   */
  requiredFields?: ContactFieldKey[]
  /** 첨부 용량 상한(MB) — 검증(DropZone)과 안내 문구가 같은 값을 쓴다. 기본 20 */
  maxFileMb?: number
  /**
   * 제출 버튼 색 (기본 neutral = 레퍼런스의 검은 버튼).
   * accent를 준 사이트에서 CTA만 검게 튀는 것이 싫으면 primary·success로 올린다.
   */
  submitVariant?: 'neutral' | 'primary' | 'success'
  /** 실제 지도를 꽂는 슬롯 — 없으면 플레이스홀더가 대신 들어간다(외부 지도 API 미사용) */
  map?: ReactNode
  /** 지도 칸 ON/OFF */
  showMap?: boolean
  /** 지도 칸 높이(px) — 레퍼런스는 얕은 띠 지도다 */
  mapHeight?: number
  /** @deprecated labels.title을 쓴다(개별 prop이 우선한다) */
  title?: string
  /** @deprecated labels.description을 쓴다 */
  description?: string
  /** 오시는 길 정보 카드(주소·전화·이메일·운영시간) ON/OFF — 켜면 지도 아래에 4칸이 붙는다 */
  showInfo?: boolean
  /** showInfo=true일 때 쓰는 값 */
  location?: ContactLocation
  /** 파일 첨부(DropZone + 첨부 목록) ON/OFF */
  showAttachment?: boolean
  /** @deprecated labels.submit을 쓴다 */
  submitLabel?: string
  /** 라벨·강조 색. 기본 success(레퍼런스의 그린) */
  accent?: 'primary' | 'success'
}

/** 오시는 길 카드 4종 — 값 키와 아이콘을 묶는다(머리글은 labels.info가 갖는다) */
const INFO_ITEMS = [
  { key: 'address', Icon: MapPin },
  { key: 'phone', Icon: Phone },
  { key: 'email', Icon: Mail },
  { key: 'hours', Icon: Clock },
] as const

/** 첨부 용량 상한 기본값(MB) — maxFileMb prop의 기본값이다 */
const DEFAULT_MAX_FILE_MB = 20

/** 기본 필수 입력 — 레퍼런스 폼은 6개 전부가 필수다 */
const DEFAULT_REQUIRED_FIELDS: ContactFieldKey[] = [
  'name',
  'email',
  'phone',
  'type',
  'title',
  'content',
]

type FieldErrors = Partial<Record<ContactFieldKey, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * 제출 가능 여부 판정의 단일 출처 — 화면 표시(에러)와 onSubmit 게이트가 같은 규칙을 쓴다.
 * 필수 여부는 requiredFields가 정하고, 이메일 '형식'은 값이 있으면 필수와 무관하게 본다
 * (형식이 틀린 주소는 필수가 아니어도 답장을 보낼 수 없다).
 */
function validate(
  value: InquiryFormValue,
  messages: ContactPageLabels['errors'],
  required: ContactFieldKey[],
): FieldErrors {
  const errors: FieldErrors = {}
  const isRequired = (key: ContactFieldKey) => required.includes(key)

  if (isRequired('name') && value.name.trim() === '') errors.name = messages.name

  if (isRequired('email') && value.email.trim() === '') errors.email = messages.email
  else if (value.email.trim() !== '' && !EMAIL_PATTERN.test(value.email.trim()))
    errors.email = messages.emailInvalid

  if (isRequired('phone') && value.phone.trim() === '') errors.phone = messages.phone
  if (isRequired('type') && (value.type == null || value.type === '')) errors.type = messages.type
  if (isRequired('title') && value.title.trim() === '') errors.title = messages.title
  if (isRequired('content') && value.content.trim() === '') errors.content = messages.content

  return errors
}

/** File → AttachmentList가 읽는 모양. 같은 파일(이름·크기·수정시각)이면 같은 id다. */
function toAttachment(file: File): Attachment {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    name: file.name,
    size: file.size,
    type: file.type,
  }
}

/**
 * 오시는 길 + 1:1 문의 페이지. 라이트(흰색) 단일 테마다 — 다크는 없다.
 *
 * 레퍼런스는 "지도 + 문의 폼"이 **한 장의 카드**다:
 *   카드 위쪽 — 지도(슬롯). 아래쪽 — 머리글 + 2열 폼 + 동의 + 폭을 꽉 채운 제출 버튼.
 * 오시는 길 정보 카드(주소·전화…)와 파일 첨부는 레퍼런스에 없어 기본 OFF이고,
 * 필요한 사이트만 showInfo·showAttachment로 켠다(기능을 지우지 않고 축으로 남긴다).
 *
 * 폼 컨트롤(InputBase·Select·Textarea·DropZone·Checkbox·Button)은 전부 기존 컴포넌트다 —
 * 이 파일이 직접 그리는 것은 카드 판과 폼 그리드뿐이다.
 */
export function ContactPage({
  value,
  onChange,
  onSubmit,
  submitting = false,
  types,
  map,
  showMap = true,
  mapHeight = 380,
  labels,
  requiredFields = DEFAULT_REQUIRED_FIELDS,
  maxFileMb = DEFAULT_MAX_FILE_MB,
  submitVariant = 'neutral',
  title,
  description,
  showInfo = false,
  location,
  showAttachment = false,
  submitLabel,
  accent = 'success',
}: ContactPageProps) {
  // 우선순위: 개별 prop > labels > 기본값. mergeLabels는 undefined를 무시한다.
  const L = mergeLabels(mergeLabels(DEFAULT_CONTACT_PAGE_LABELS, labels), {
    title,
    description,
    submit: submitLabel,
  })

  // 에러는 "건드린 필드" 또는 "제출 시도 이후"에만 보여준다 — 빈 폼이 처음부터 빨갛지 않게.
  const [touched, setTouched] = useState<Partial<Record<ContactFieldKey, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)

  const errors = validate(value, L.errors, requiredFields)
  const shows = (key: ContactFieldKey): boolean =>
    (submitted || touched[key] === true) && errors[key] != null
  const errorOf = (key: ContactFieldKey): string | undefined =>
    shows(key) ? errors[key] : undefined
  const markTouched = (key: ContactFieldKey) => setTouched((prev) => ({ ...prev, [key]: true }))
  /** 라벨의 * 표시 — 검증과 같은 배열을 본다(둘이 갈라지면 사용자가 속는다) */
  const isRequired = (key: ContactFieldKey) => requiredFields.includes(key)

  const patch = (next: Partial<InquiryFormValue>) => onChange({ ...value, ...next })

  // 동의가 없으면 제출 자체가 비활성(규격) — 나머지 필수값은 클릭 시 에러로 알린다.
  const canSubmit = value.agreed && !submitting

  const handleSubmit = () => {
    setSubmitted(true)
    if (Object.keys(errors).length > 0) return
    onSubmit?.()
  }

  /** DropZone은 검증을 통과한 파일만 넘겨준다. 같은 파일 중복 첨부만 여기서 막는다. */
  const handleFiles = (files: File[]) => {
    const existing = new Set(value.files.map((file) => toAttachment(file).id))
    const added = files.filter((file) => !existing.has(toAttachment(file).id))
    if (added.length === 0) return
    patch({ files: [...value.files, ...added] })
  }

  const handleRemove = (attachment: Attachment) => {
    patch({ files: value.files.filter((file) => toAttachment(file).id !== attachment.id) })
  }

  return (
    <SiteSection accent={accent} padding="lg" maxWidth="lg">
      <div className={styles.card}>
        {/* 지도 — 외부 지도 API를 쓰지 않는다. map 슬롯이 없으면 공용 플레이스홀더. */}
        {showMap && (
          <div className={styles.mapBox} style={{ height: mapHeight }}>
            {map ?? <Placeholder kind="image" size="fill" label={L.mapPlaceholder} />}
          </div>
        )}

        <div className={styles.body}>
          <header className={styles.header}>
            <h2 className={styles.title}>{L.title}</h2>
            {L.description !== '' && <p className={styles.description}>{L.description}</p>}
          </header>

          {/* 오시는 길 정보 — 레퍼런스에는 없다(기본 OFF) */}
          {showInfo && location != null && (
            <div className={styles.infoGrid}>
              {INFO_ITEMS.map(({ key, Icon }) => (
                <div key={key} className={styles.infoCard}>
                  <p className={styles.infoLabel}>
                    <Icon size={16} aria-hidden="true" />
                    {L.info[key]}
                  </p>
                  <div className={styles.infoLines}>
                    {location[key].map((line) => (
                      <span key={line} className={styles.infoLine}>
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.form}>
            <div className={styles.row2}>
              <Select
                fullWidth
                label={L.fields.type}
                value={value.type}
                onChange={(type) => {
                  markTouched('type')
                  patch({ type })
                }}
                options={types}
                placeholder={L.placeholders.type}
                error={shows('type')}
                helperText={errorOf('type')}
              />
              <InputBase
                fullWidth
                label={L.fields.name}
                required={isRequired('name')}
                value={value.name}
                onChange={(name) => patch({ name })}
                onBlur={() => markTouched('name')}
                placeholder={L.placeholders.name}
                error={shows('name')}
                helperText={errorOf('name')}
              />
            </div>

            <div className={styles.row2}>
              <InputBase
                fullWidth
                label={L.fields.email}
                required={isRequired('email')}
                type="email"
                inputMode="email"
                value={value.email}
                onChange={(email) => patch({ email })}
                onBlur={() => markTouched('email')}
                placeholder={L.placeholders.email}
                error={shows('email')}
                helperText={errorOf('email')}
              />
              <InputBase
                fullWidth
                label={L.fields.phone}
                required={isRequired('phone')}
                type="tel"
                inputMode="tel"
                value={value.phone}
                onChange={(phone) => patch({ phone })}
                onBlur={() => markTouched('phone')}
                placeholder={L.placeholders.phone}
                error={shows('phone')}
                helperText={errorOf('phone')}
              />
            </div>

            <InputBase
              fullWidth
              label={L.fields.title}
              required={isRequired('title')}
              value={value.title}
              onChange={(title) => patch({ title })}
              onBlur={() => markTouched('title')}
              placeholder={L.placeholders.title}
              maxLength={60}
              error={shows('title')}
              helperText={errorOf('title')}
            />

            <Textarea
              fullWidth
              label={L.fields.content}
              required={isRequired('content')}
              rows={6}
              value={value.content}
              onChange={(content) => patch({ content })}
              placeholder={L.placeholders.content}
              maxLength={2000}
              error={shows('content')}
              helperText={errorOf('content')}
            />

            {showAttachment && (
              <div className={styles.files}>
                <span className={styles.fieldLabel}>{L.attachment.label}</span>
                <DropZone
                  multiple
                  maxSizeMb={maxFileMb}
                  disabled={submitting}
                  onFiles={handleFiles}
                  hint={L.attachment.hint(maxFileMb)}
                />
                {value.files.length > 0 && (
                  <AttachmentList
                    compact
                    items={value.files.map(toAttachment)}
                    onRemove={handleRemove}
                  />
                )}
              </div>
            )}

            <Checkbox
              checked={value.agreed}
              onChange={(agreed) => patch({ agreed })}
              label={L.agreement}
            />

            {/* 폭을 꽉 채운 제출 CTA — 레퍼런스의 '검은 버튼'. 색은 neutral 토큰(프리셋별 잉크)이다 */}
            <Button
              variant={submitVariant}
              size="lg"
              fullWidth
              label={submitting ? L.submitting : L.submit}
              disabled={!canSubmit}
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </SiteSection>
  )
}
