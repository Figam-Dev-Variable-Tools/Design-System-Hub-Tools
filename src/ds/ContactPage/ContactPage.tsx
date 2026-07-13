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

export type ContactPageProps = {
  value: InquiryFormValue
  onChange: (value: InquiryFormValue) => void
  /** 유효성 검사를 통과했을 때만 호출된다 */
  onSubmit?: () => void
  submitting?: boolean
  types: InquiryType[]
  /** 실제 지도를 꽂는 슬롯 — 없으면 플레이스홀더가 대신 들어간다(외부 지도 API 미사용) */
  map?: ReactNode
  /** 지도 칸 ON/OFF */
  showMap?: boolean
  /** 지도 칸 높이(px) — 레퍼런스는 얕은 띠 지도다 */
  mapHeight?: number
  /** 폼 머리글 */
  title?: string
  /** 폼 머리글 아래 안내 문구 */
  description?: string
  /** 오시는 길 정보 카드(주소·전화·이메일·운영시간) ON/OFF — 켜면 지도 아래에 4칸이 붙는다 */
  showInfo?: boolean
  /** showInfo=true일 때 쓰는 값 */
  location?: ContactLocation
  /** 파일 첨부(DropZone + 첨부 목록) ON/OFF */
  showAttachment?: boolean
  /** 제출 버튼 라벨 */
  submitLabel?: string
  /** 라벨·강조 색. 기본 success(레퍼런스의 그린) */
  accent?: 'primary' | 'success'
}

/** 오시는 길 카드 4종 — 라벨·아이콘·값 키를 한곳에 묶는다 */
const INFO_ITEMS = [
  { key: 'address', label: 'Address', Icon: MapPin },
  { key: 'phone', label: 'Phone', Icon: Phone },
  { key: 'email', label: 'Email', Icon: Mail },
  { key: 'hours', label: 'Hours', Icon: Clock },
] as const

/** 첨부 용량 상한(MB) — DropZone 검증과 안내 문구가 같은 값을 쓴다 */
const MAX_FILE_MB = 20

/** 필수 입력 6종 — 에러 메시지의 키이기도 하다 */
type FieldKey = 'name' | 'email' | 'phone' | 'type' | 'title' | 'content'

type FieldErrors = Partial<Record<FieldKey, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** 제출 가능 여부 판정의 단일 출처 — 화면 표시(에러)와 onSubmit 게이트가 같은 규칙을 쓴다 */
function validate(value: InquiryFormValue): FieldErrors {
  const errors: FieldErrors = {}

  if (value.name.trim() === '') errors.name = '성함을 입력해주세요.'

  if (value.email.trim() === '') errors.email = '이메일을 입력해주세요.'
  else if (!EMAIL_PATTERN.test(value.email.trim()))
    errors.email = '이메일 형식이 올바르지 않습니다.'

  if (value.phone.trim() === '') errors.phone = '연락처를 입력해주세요.'
  if (value.type == null || value.type === '') errors.type = '업체 분류를 선택해주세요.'
  if (value.title.trim() === '') errors.title = '문의 제목을 입력해주세요.'
  if (value.content.trim() === '') errors.content = '문의 내용을 입력해주세요.'

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
  title = '문의하기',
  description = '궁금하신 점을 남겨주시면 담당자가 확인 후 연락드리겠습니다.',
  showInfo = false,
  location,
  showAttachment = false,
  submitLabel = '문의하기',
  accent = 'success',
}: ContactPageProps) {
  // 에러는 "건드린 필드" 또는 "제출 시도 이후"에만 보여준다 — 빈 폼이 처음부터 빨갛지 않게.
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)

  const errors = validate(value)
  const shows = (key: FieldKey): boolean =>
    (submitted || touched[key] === true) && errors[key] != null
  const errorOf = (key: FieldKey): string | undefined => (shows(key) ? errors[key] : undefined)
  const markTouched = (key: FieldKey) => setTouched((prev) => ({ ...prev, [key]: true }))

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
            {map ?? <Placeholder kind="image" size="fill" label="지도 준비 중" />}
          </div>
        )}

        <div className={styles.body}>
          <header className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            {description !== '' && <p className={styles.description}>{description}</p>}
          </header>

          {/* 오시는 길 정보 — 레퍼런스에는 없다(기본 OFF) */}
          {showInfo && location != null && (
            <div className={styles.infoGrid}>
              {INFO_ITEMS.map(({ key, label, Icon }) => (
                <div key={key} className={styles.infoCard}>
                  <p className={styles.infoLabel}>
                    <Icon size={16} aria-hidden="true" />
                    {label}
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
                label="업체 분류"
                value={value.type}
                onChange={(type) => {
                  markTouched('type')
                  patch({ type })
                }}
                options={types}
                placeholder="분류를 선택해주세요"
                error={shows('type')}
                helperText={errorOf('type')}
              />
              <InputBase
                fullWidth
                label="성함"
                required
                value={value.name}
                onChange={(name) => patch({ name })}
                onBlur={() => markTouched('name')}
                placeholder="성함을 입력해주세요"
                error={shows('name')}
                helperText={errorOf('name')}
              />
            </div>

            <div className={styles.row2}>
              <InputBase
                fullWidth
                label="이메일"
                required
                type="email"
                inputMode="email"
                value={value.email}
                onChange={(email) => patch({ email })}
                onBlur={() => markTouched('email')}
                placeholder="이메일을 입력해주세요"
                error={shows('email')}
                helperText={errorOf('email')}
              />
              <InputBase
                fullWidth
                label="연락처"
                required
                type="tel"
                inputMode="tel"
                value={value.phone}
                onChange={(phone) => patch({ phone })}
                onBlur={() => markTouched('phone')}
                placeholder="연락처를 입력해주세요"
                error={shows('phone')}
                helperText={errorOf('phone')}
              />
            </div>

            <InputBase
              fullWidth
              label="문의 제목"
              required
              value={value.title}
              onChange={(title) => patch({ title })}
              onBlur={() => markTouched('title')}
              placeholder="제목을 입력해주세요"
              maxLength={60}
              error={shows('title')}
              helperText={errorOf('title')}
            />

            <Textarea
              fullWidth
              label="문의 내용"
              required
              rows={6}
              value={value.content}
              onChange={(content) => patch({ content })}
              placeholder="문의 내용을 상세히 입력해주세요"
              maxLength={2000}
              error={shows('content')}
              helperText={errorOf('content')}
            />

            {showAttachment && (
              <div className={styles.files}>
                <span className={styles.fieldLabel}>파일 첨부</span>
                <DropZone
                  multiple
                  maxSizeMb={MAX_FILE_MB}
                  disabled={submitting}
                  onFiles={handleFiles}
                  hint={`현장 사진이나 도면이 있다면 첨부해주세요 (최대 ${MAX_FILE_MB}MB)`}
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
              label="개인정보 수집 및 이용에 동의합니다"
            />

            {/* 폭을 꽉 채운 제출 CTA — 레퍼런스의 '검은 버튼'. 색은 neutral 토큰(프리셋별 잉크)이다 */}
            <Button
              variant="neutral"
              size="lg"
              fullWidth
              label={submitting ? '전송 중…' : submitLabel}
              disabled={!canSubmit}
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </SiteSection>
  )
}
