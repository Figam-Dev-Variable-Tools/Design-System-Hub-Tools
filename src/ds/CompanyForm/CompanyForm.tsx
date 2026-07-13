import type { ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  AdminFormPage,
  type AdminFormField,
  type AdminFormSection,
} from '../AdminFormPage/AdminFormPage'
import type { AboutPageProps } from '../AboutPage/AboutPage'
import { Button } from '../Button/Button'
import { EmptyState } from '../EmptyState/EmptyState'
import { FieldRow } from '../FieldRow/FieldRow'
import { InputBase } from '../InputBase/InputBase'
import type { SelectOption } from '../Select/Select'
import { Skeleton } from '../Skeleton/Skeleton'
import { Textarea } from '../Textarea/Textarea'

/*
 * CompanyForm — '회사소개 관리'(어드민). 고객용 화면은 AboutPage다.
 *
 * 이 화면이 편집하는 값은 AboutPage가 실제로 소비하는 props 그대로다 —
 *   hero(eyebrow·title·subtitle·image) · intro(문단·이미지) · capabilities[] · stats[] · cta ·
 *   accent · showCta · showDivider · showHeroScrim
 * 저장된 값이 그대로 고객 화면이 되도록 toAboutPageData()로 되돌릴 수 있게 열어 둔다.
 *
 * 골격(레이아웃·헤더·섹션 카드·필드 행·이미지 업로드·sticky 액션 바)은 AdminFormPage 셸이 갖는다.
 * 이 파일에 남는 건 값 타입 · 필드 선언 · 한국어 문구뿐이다(CategoryForm·PortfolioForm과 같은 결).
 *
 * 반복 항목(역량 카드·통계)은 셸이 모르는 컨트롤이라 custom 필드로 낸다.
 * 다만 마크업을 새로 짜지 않는다 — 라벨 없는 custom은 FormSection 3열 그리드의 직계 자식이 되므로,
 * 항목 하나를 FieldRow(span=1) 세 개로 흘려 [제목][설명][삭제] 한 줄을 만든다(전용 CSS 0줄).
 */

/** 역량 카드 한 장 — AboutCapability와 같은 모양(아이콘은 데이터가 아니라 렌더 슬롯이라 뺀다) */
export type CompanyCapability = {
  /** 재정렬·삭제에도 흔들리지 않는 React key. AboutCapability.id로 그대로 넘어간다 */
  id: string
  title: string
  description: string
}

/** 숫자 성과 한 칸 — AboutStat({ value, label })에 편집용 id만 얹은 것 */
export type CompanyStat = {
  id: string
  /** '120+' '15년'처럼 접미사를 포함할 수 있어 문자열이다 */
  value: string
  label: string
}

/** 강조색 — AboutPage.accent와 같은 축 */
export type CompanyAccent = 'primary' | 'success'

/**
 * 회사소개 한 건의 값 — 화면이 들고 있는 유일한 상태(제어 컴포넌트).
 * 키는 AboutPage props를 1:1로 편 것이다. 셸의 text/textarea/select/toggle/image 필드가
 * 값의 키에 직접 물려야 하므로 중첩(hero.title) 대신 평평한 키(heroTitle)로 편다.
 */
export type CompanyValue = {
  /* 히어로 — AboutHero */
  heroEyebrow: string
  heroTitle: string
  heroSubtitle: string
  heroImage?: string
  heroImageAlt: string

  /* 회사 개요 — AboutIntro */
  introTitle: string
  introSubtitle: string
  /** 미션/비전 문단. 빈 줄로 문단을 나눈다 → AboutIntro.paragraphs 배열로 펴진다 */
  introParagraphs: string
  introImage?: string
  introImageAlt: string

  /* 핵심 역량 — AboutPage.capabilitiesCopy + capabilities */
  capabilitiesTitle: string
  capabilitiesSubtitle: string
  capabilities: CompanyCapability[]

  /* 숫자 성과 — AboutPage.statsCopy + stats */
  statsTitle: string
  statsSubtitle: string
  stats: CompanyStat[]

  /* CTA 밴드 — AboutCta */
  ctaTitle: string
  ctaSubtitle: string
  ctaButtonLabel: string
  /** CTA 밴드 노출(AboutPage.showCta) — 섹션 밴드 스위치가 이 값을 켠다 */
  ctaEnabled: boolean

  /* 노출 설정 — AboutPage의 표시 축 */
  accent: CompanyAccent
  /** 섹션 헤딩 아래 구분선(AboutPage.showDivider) */
  showDivider: boolean
  /** 히어로 이미지 위 흰 스크림(AboutPage.showHeroScrim) */
  showHeroScrim: boolean
}

/** 필드별 에러 문구 — 있는 키만 그 FieldRow가 에러 톤이 된다 */
export type CompanyFormErrors = {
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: string
  introTitle?: string
  introParagraphs?: string
  introImage?: string
  /** 목록 전체에 대한 에러('역량은 1개 이상 필요합니다') — 역량 블록 머리 행에 붙는다 */
  capabilities?: string
  stats?: string
  ctaTitle?: string
  ctaButtonLabel?: string
}

/** 섹션 키 — show와 sectionCopy가 같은 키를 쓴다 */
export type CompanySectionKey =
  | 'hero'
  | 'heroImage'
  | 'intro'
  | 'capabilities'
  | 'stats'
  | 'cta'
  | 'visibility'

/** 섹션 머리글 문구 — 기본값을 덮어쓸 때만 넘긴다 */
export type CompanySectionCopy = { title?: string; description?: string }

/**
 * 섹션 ON/OFF — 전부 기본 true(오너 확정 규약, 키마다 `?? true`).
 * false면 그 섹션이 스키마에서 빠지고, 셸이 빈 카드를 그리지 않는다
 * (빈 자리·여백·구분선이 남지 않는다).
 */
export type CompanyFormShow = {
  /** 페이지 헤더(타이틀·설명·[저장]) */
  header?: boolean
  /** 기본 정보(히어로 카피) */
  hero?: boolean
  /** 히어로 이미지 */
  heroImage?: boolean
  /** 소개 본문(회사 개요) */
  intro?: boolean
  /** 핵심 역량 카드 */
  capabilities?: boolean
  /** 숫자 성과 */
  stats?: boolean
  /** CTA 밴드 */
  cta?: boolean
  /** 노출 설정(강조색·구분선·스크림) */
  visibility?: boolean
  /** 하단 [취소] [저장] 바 */
  footer?: boolean
}

export type CompanyFormProps = {
  value: CompanyValue
  onChange: (v: CompanyValue) => void
  errors?: CompanyFormErrors
  /** 등록/수정 — 기본 제출 문구('등록'/'저장')를 가른다 */
  mode?: 'create' | 'edit'
  show?: CompanyFormShow
  /** 저장 중 — 모든 입력과 액션이 잠긴다 */
  submitting?: boolean
  /** 조회 중 — 섹션 본문이 스켈레톤으로 대체된다 */
  loading?: boolean
  onSubmit?: () => void
  /** 없으면 하단 [취소]가 사라진다 */
  onCancel?: () => void
  density?: 'compact' | 'comfortable'
  maxWidth?: 'md' | 'lg' | 'full'

  /* ── 문구 — 기본값이 있고 전부 교체 가능하다 ── */
  title?: string
  description?: string
  /** 섹션 머리글 교체 — 넘긴 키만 기본 문구를 덮어쓴다 */
  sectionCopy?: Partial<Record<CompanySectionKey, CompanySectionCopy>>
  submitLabel?: string
  cancelLabel?: string
  /** 저장 중 버튼 문구 — 기본 '저장 중…' */
  savingLabel?: string
  /** 이미지 업로드 제약 안내 — 기본 'JPG · PNG 이미지 · 최대 10MB' */
  imageHint?: string
  /** 드롭존 안 문구 — 기본 '이미지를 끌어다 놓거나 클릭해서 선택하세요' */
  imageDropLabel?: string
  addCapabilityLabel?: string
  addStatLabel?: string
  /** 항목 삭제 버튼 — 기본 '삭제' */
  removeLabel?: string
  capabilitiesEmptyTitle?: string
  capabilitiesEmptyDescription?: string
  statsEmptyTitle?: string
  statsEmptyDescription?: string
  /** 강조색 후보 — value는 CompanyAccent('primary'|'success')와 맞춰야 한다 */
  accentOptions?: SelectOption[]

  /* ── 아이콘 슬롯 — 없으면 기본 lucide 아이콘 ── */
  /** 항목 추가 버튼 (기본 Plus) */
  addIcon?: ReactNode
  /** 항목 삭제 버튼 (기본 Trash2) */
  removeIcon?: ReactNode
  /** 이미지 썸네일의 삭제(x) 버튼 */
  removeImageIcon?: ReactNode
}

/** 업로드 제약 — 안내 문구와 DropZone 검증이 같은 상수를 본다 */
const MAX_IMAGE_MB = 10
const IMAGE_ACCEPT = 'image/jpeg,image/png'
const IMAGE_HINT = `JPG · PNG 이미지 · 최대 ${MAX_IMAGE_MB}MB`

/** 강조색 — AboutPage가 아는 두 값뿐이다 */
const ACCENT_OPTIONS: SelectOption[] = [
  { value: 'success', label: '그린(기본)' },
  { value: 'primary', label: '블루' },
]

/** 섹션 기본 머리글 — sectionCopy로 키 단위 교체된다 */
const SECTION_COPY: Record<CompanySectionKey, Required<CompanySectionCopy>> = {
  hero: {
    title: '기본 정보',
    description: '회사소개 첫 화면(히어로)에 가운데로 놓이는 카피입니다.',
  },
  heroImage: {
    title: '히어로 이미지',
    description: '히어로 카피 아래에 깔리는 배경 사진입니다. 없으면 대체 그림이 표시됩니다.',
  },
  intro: {
    title: '소개 본문',
    description: '미션·비전 문단과 우측 이미지로 구성되는 회사 개요입니다.',
  },
  capabilities: {
    title: '핵심 역량',
    description: '옅은 회색 면 위 흰 카드로 나열됩니다. 4개 단위로 줄이 나뉩니다.',
  },
  stats: {
    title: '숫자 성과',
    description: '큰 숫자(강조색)와 라벨 한 쌍이 한 칸입니다.',
  },
  cta: {
    title: 'CTA 밴드',
    description: '페이지 맨 아래 문의 유도 밴드입니다.',
  },
  visibility: {
    title: '노출 설정',
    description: '강조색과 장식 요소의 노출을 정합니다. 저장 즉시 고객 화면에 반영됩니다.',
  },
}

/** show 기본값 — 전부 true. 스프레드로 합치면 명시적 undefined가 기본값을 덮으므로 키마다 ?? true */
function resolveShow(show: CompanyFormShow = {}): Required<CompanyFormShow> {
  return {
    header: show.header ?? true,
    hero: show.hero ?? true,
    heroImage: show.heroImage ?? true,
    intro: show.intro ?? true,
    capabilities: show.capabilities ?? true,
    stats: show.stats ?? true,
    cta: show.cta ?? true,
    visibility: show.visibility ?? true,
    footer: show.footer ?? true,
  }
}

let seq = 0

/** 새 항목의 id — 배열 안에서 흔들리지 않는 key여야 삭제/입력 중 포커스를 잃지 않는다 */
function nextId(prefix: string): string {
  seq += 1
  return `${prefix}-${Date.now().toString(36)}-${seq}`
}

/** 빈 역량 카드 — 초기값을 만드는 호출자도 쓸 수 있게 연다 */
export function createCapability(): CompanyCapability {
  return { id: nextId('capability'), title: '', description: '' }
}

/** 빈 통계 항목 */
export function createStat(): CompanyStat {
  return { id: nextId('stat'), value: '', label: '' }
}

/** AboutPage가 받는 데이터 — 폼 값이 곧 고객 화면이 된다는 것을 타입으로 못 박는다 */
export type AboutPageData = Pick<
  AboutPageProps,
  | 'hero'
  | 'intro'
  | 'capabilities'
  | 'capabilitiesCopy'
  | 'stats'
  | 'statsCopy'
  | 'cta'
  | 'accent'
  | 'showCta'
  | 'showDivider'
  | 'showHeroScrim'
>

/**
 * 폼 값 → 고객 화면(AboutPage) props.
 *
 * 미리보기·저장 후 렌더에서 매핑을 각자 다시 짜면 두 화면이 어긋난다 — 변환은 여기 한 곳뿐이다.
 * 문단은 빈 줄(\n\n) 기준으로 나눈다. 역량 아이콘(AboutCapability.icon)은 ReactNode라
 * 데이터로 저장할 수 없다 — 코드가 주입하는 렌더 슬롯이고, 비면 AboutPage가 Placeholder로 채운다.
 */
export function toAboutPageData(value: CompanyValue): AboutPageData {
  return {
    hero: {
      eyebrow: value.heroEyebrow,
      title: value.heroTitle,
      subtitle: value.heroSubtitle,
      imageSrc: value.heroImage,
      imageAlt: value.heroImageAlt,
    },
    intro: {
      title: value.introTitle,
      subtitle: value.introSubtitle,
      paragraphs: value.introParagraphs
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph !== ''),
      imageSrc: value.introImage,
      imageAlt: value.introImageAlt,
    },
    capabilities: value.capabilities.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
    })),
    capabilitiesCopy: { title: value.capabilitiesTitle, subtitle: value.capabilitiesSubtitle },
    stats: value.stats.map((item) => ({ value: item.value, label: item.label })),
    statsCopy: { title: value.statsTitle, subtitle: value.statsSubtitle },
    cta: {
      title: value.ctaTitle,
      subtitle: value.ctaSubtitle,
      buttonLabel: value.ctaButtonLabel,
    },
    accent: value.accent,
    showCta: value.ctaEnabled,
    showDivider: value.showDivider,
    showHeroScrim: value.showHeroScrim,
  }
}

/**
 * CompanyForm — 회사소개 관리 화면(AdminFormPage 프리셋).
 *
 *   header  PageHeaderBar — 타이틀 + 강조색 배지 + [저장]
 *   1       기본 정보     — 라벨 · 헤드라인 · 서브카피
 *   2       히어로 이미지 — 업로드 · 대체 텍스트
 *   3       소개 본문     — 헤드라인 · 서브카피 · 문단 · 이미지
 *   4       핵심 역량     — 섹션 카피 + 카드 목록(추가/삭제)
 *   5       숫자 성과     — 섹션 카피 + 통계 목록(추가/삭제)
 *   6       CTA 밴드      — 밴드 스위치(value.ctaEnabled) + 문구
 *   7       노출 설정     — 강조색 · 구분선 · 히어로 스크림
 *   footer  [취소] [저장] — sticky 액션 바
 *
 * ON/OFF는 두 층이다(섞이지 않는다).
 *  - show           : 화면 구성(디자인 타임). 끄면 섹션이 스키마에서 빠진다.
 *  - value.ctaEnabled : 데이터(런타임). CTA 밴드를 고객 화면에서 끈다 — FormSection의 toggleable.
 */
export function CompanyForm({
  value,
  onChange,
  errors,
  mode = 'edit',
  show,
  submitting = false,
  loading = false,
  onSubmit,
  onCancel,
  density = 'compact',
  maxWidth = 'lg',
  title = '회사소개 관리',
  description = '고객용 회사소개 페이지에 그대로 노출되는 내용입니다.',
  sectionCopy,
  submitLabel,
  cancelLabel = '취소',
  savingLabel = '저장 중…',
  imageHint = IMAGE_HINT,
  imageDropLabel = '이미지를 끌어다 놓거나 클릭해서 선택하세요',
  addCapabilityLabel = '역량 카드 추가',
  addStatLabel = '통계 항목 추가',
  removeLabel = '삭제',
  capabilitiesEmptyTitle = '등록된 역량 카드가 없습니다.',
  capabilitiesEmptyDescription = '카드를 추가하지 않으면 고객 화면에서 핵심 역량 섹션이 통째로 접힙니다.',
  statsEmptyTitle = '등록된 통계가 없습니다.',
  statsEmptyDescription = '항목을 추가하지 않으면 고객 화면에서 숫자 성과 섹션이 통째로 접힙니다.',
  accentOptions = ACCENT_OPTIONS,
  addIcon,
  removeIcon,
  removeImageIcon,
}: CompanyFormProps) {
  const on = resolveShow(show)

  /** 섹션 머리글 — 기본 문구 위에 sectionCopy를 얹는다 */
  const copyOf = (key: CompanySectionKey): Required<CompanySectionCopy> => ({
    ...SECTION_COPY[key],
    ...sectionCopy?.[key],
  })

  // 저장 중에는 입력을 잠근다(조회 중에는 본문이 스켈레톤이라 컨트롤 자체가 없다)
  const locked = submitting

  /* ── 1. 기본 정보(히어로 카피) ─────────────────────────────────────────── */
  const heroFields: AdminFormField<CompanyValue>[] = [
    {
      kind: 'text',
      key: 'heroEyebrow',
      label: '상단 라벨',
      span: 1,
      description: '헤드라인 위 작은 라벨입니다. 강조색으로 표시됩니다.',
      placeholder: '예: About us',
      maxLength: 30,
    },
    {
      kind: 'text',
      key: 'heroTitle',
      label: '헤드라인',
      required: true,
      span: 2,
      placeholder: '예: We design sound for space.',
      maxLength: 60,
      showCounter: true,
    },
    {
      kind: 'textarea',
      key: 'heroSubtitle',
      label: '서브카피',
      required: true,
      span: 3,
      placeholder: '헤드라인 아래에 놓이는 한글 카피를 입력하세요.',
      rows: 2,
      maxLength: 120,
      showCounter: true,
    },
  ]

  /* ── 2. 히어로 이미지 ──────────────────────────────────────────────────── */
  const heroImageFields: AdminFormField<CompanyValue>[] = [
    {
      kind: 'image',
      key: 'heroImage',
      label: '배경 이미지',
      description: imageHint,
      // 가로로 넓게 깔리는 배경이라 16:9 — 교체가 잦은 자리라 썸네일 옆에 드롭존을 함께 세운다(row)
      layout: 'row',
      ratio: '16x9',
      previewWidth: 240,
      alt: '히어로 배경 이미지 미리보기',
      remove: 'square',
      removeLabel: '히어로 이미지 삭제',
      removeIcon: removeImageIcon,
      accept: IMAGE_ACCEPT,
      maxSizeMb: MAX_IMAGE_MB,
      dropLabel: imageDropLabel,
    },
    {
      kind: 'text',
      key: 'heroImageAlt',
      label: '대체 텍스트',
      span: 3,
      description: '이미지를 볼 수 없는 사용자(스크린리더)에게 읽히는 설명입니다.',
      placeholder: '예: 스튜디오 전경',
      maxLength: 60,
    },
  ]

  /* ── 3. 소개 본문 ──────────────────────────────────────────────────────── */
  const introFields: AdminFormField<CompanyValue>[] = [
    {
      kind: 'text',
      key: 'introTitle',
      label: '헤드라인',
      required: true,
      span: 1,
      placeholder: '예: Who we are',
      maxLength: 40,
    },
    {
      kind: 'text',
      key: 'introSubtitle',
      label: '서브카피',
      span: 2,
      placeholder: '헤드라인 아래 한 줄 설명',
      maxLength: 80,
    },
    {
      kind: 'textarea',
      key: 'introParagraphs',
      label: '소개 문단',
      required: true,
      // 문단 배열을 관리하는 UI를 따로 만들지 않는다 — 빈 줄이 곧 문단 경계다(toAboutPageData가 편다)
      description: '빈 줄(엔터 2번)로 문단을 나눕니다. 문단마다 별도 <p>로 노출됩니다.',
      placeholder: '미션·비전을 2~3개 문단으로 입력하세요.',
      rows: 8,
      maxLength: 1000,
      showCounter: true,
    },
    {
      kind: 'image',
      key: 'introImage',
      label: '본문 이미지',
      description: imageHint,
      ratio: '4x3',
      previewWidth: 200,
      alt: '회사 개요 이미지 미리보기',
      remove: 'square',
      removeLabel: '본문 이미지 삭제',
      removeIcon: removeImageIcon,
      accept: IMAGE_ACCEPT,
      maxSizeMb: MAX_IMAGE_MB,
      dropLabel: imageDropLabel,
    },
    {
      kind: 'text',
      key: 'introImageAlt',
      label: '대체 텍스트',
      span: 3,
      placeholder: '예: 작업 중인 팀',
      maxLength: 60,
    },
  ]

  /* ── 4. 핵심 역량 ──────────────────────────────────────────────────────── */
  const addCapability = () => onChange({ ...value, capabilities: [...value.capabilities, createCapability()] })

  const patchCapability = (id: string, next: Partial<CompanyCapability>) =>
    onChange({
      ...value,
      capabilities: value.capabilities.map((item) => (item.id === id ? { ...item, ...next } : item)),
    })

  const removeCapability = (id: string) =>
    onChange({ ...value, capabilities: value.capabilities.filter((item) => item.id !== id) })

  const capabilityFields: AdminFormField<CompanyValue>[] = [
    {
      kind: 'text',
      key: 'capabilitiesTitle',
      label: '섹션 헤드라인',
      span: 1,
      placeholder: '예: What we do',
      maxLength: 40,
    },
    {
      kind: 'text',
      key: 'capabilitiesSubtitle',
      label: '섹션 서브카피',
      span: 2,
      placeholder: '섹션 헤드라인 아래 한 줄 설명',
      maxLength: 80,
    },
    {
      // 목록의 머리 행 — 라벨·설명·에러(errors.capabilities)와 [추가] 버튼이 여기 모인다
      kind: 'custom',
      key: 'capabilities',
      label: '역량 카드',
      description: '카드는 입력한 순서대로 노출됩니다.',
      span: 3,
      render: ({ value: v, disabled }) =>
        v.capabilities.length === 0 ? (
          // 빈 상태 그림·문구·액션은 공용 EmptyState가 단일 출처다 — 여기서 다시 만들지 않는다
          <EmptyState
            kind="empty"
            compact
            title={capabilitiesEmptyTitle}
            description={capabilitiesEmptyDescription}
            actionLabel={disabled ? undefined : addCapabilityLabel}
            onAction={addCapability}
          />
        ) : (
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label={addCapabilityLabel}
            showLeftIcon
            leftIcon={addIcon ?? <Plus size={16} aria-hidden="true" />}
            disabled={disabled}
            onClick={addCapability}
          />
        ),
    },
    // 카드 하나 = FieldRow 세 칸([제목][설명][삭제]) — 3열 그리드가 그대로 한 줄이 된다
    ...value.capabilities.map<AdminFormField<CompanyValue>>((item, index) => ({
      kind: 'custom',
      key: `capability-${item.id}`,
      render: ({ disabled }) => (
        <>
          <FieldRow label={`역량 ${index + 1} 제목`} span={1}>
            <InputBase
              value={item.title}
              onChange={(next) => patchCapability(item.id, { title: next })}
              placeholder="예: 음향 설계"
              maxLength={30}
              disabled={disabled}
            />
          </FieldRow>
          <FieldRow label="설명" span={1}>
            <Textarea
              value={item.description}
              onChange={(next) => patchCapability(item.id, { description: next })}
              placeholder="카드 본문에 들어갈 설명을 입력하세요."
              rows={2}
              maxLength={120}
              disabled={disabled}
            />
          </FieldRow>
          <FieldRow label="관리" span={1}>
            {/* 라벨에 순번을 넣어 스크린리더가 어떤 카드를 지우는지 알 수 있게 한다 */}
            <Button
              variant="error"
              appearance="outline"
              size="md"
              label={removeLabel}
              showLeftIcon
              leftIcon={removeIcon ?? <Trash2 size={14} aria-hidden="true" />}
              disabled={disabled}
              onClick={() => removeCapability(item.id)}
            />
          </FieldRow>
        </>
      ),
    })),
  ]

  /* ── 5. 숫자 성과 ──────────────────────────────────────────────────────── */
  const addStat = () => onChange({ ...value, stats: [...value.stats, createStat()] })

  const patchStat = (id: string, next: Partial<CompanyStat>) =>
    onChange({
      ...value,
      stats: value.stats.map((item) => (item.id === id ? { ...item, ...next } : item)),
    })

  const removeStat = (id: string) =>
    onChange({ ...value, stats: value.stats.filter((item) => item.id !== id) })

  const statFields: AdminFormField<CompanyValue>[] = [
    {
      kind: 'text',
      key: 'statsTitle',
      label: '섹션 헤드라인',
      span: 1,
      placeholder: '예: By the numbers',
      maxLength: 40,
    },
    {
      kind: 'text',
      key: 'statsSubtitle',
      label: '섹션 서브카피',
      span: 2,
      placeholder: '섹션 헤드라인 아래 한 줄 설명',
      maxLength: 80,
    },
    {
      kind: 'custom',
      key: 'stats',
      label: '통계 항목',
      description: '숫자는 접미사를 포함해 그대로 노출됩니다(예: 120+, 15년).',
      span: 3,
      render: ({ value: v, disabled }) =>
        v.stats.length === 0 ? (
          <EmptyState
            kind="empty"
            compact
            title={statsEmptyTitle}
            description={statsEmptyDescription}
            actionLabel={disabled ? undefined : addStatLabel}
            onAction={addStat}
          />
        ) : (
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label={addStatLabel}
            showLeftIcon
            leftIcon={addIcon ?? <Plus size={16} aria-hidden="true" />}
            disabled={disabled}
            onClick={addStat}
          />
        ),
    },
    ...value.stats.map<AdminFormField<CompanyValue>>((item, index) => ({
      kind: 'custom',
      key: `stat-${item.id}`,
      render: ({ disabled }) => (
        <>
          <FieldRow label={`통계 ${index + 1} 숫자`} span={1}>
            <InputBase
              value={item.value}
              onChange={(next) => patchStat(item.id, { value: next })}
              placeholder="예: 120+"
              maxLength={12}
              disabled={disabled}
            />
          </FieldRow>
          <FieldRow label="라벨" span={1}>
            <InputBase
              value={item.label}
              onChange={(next) => patchStat(item.id, { label: next })}
              placeholder="예: 완료 프로젝트"
              maxLength={20}
              disabled={disabled}
            />
          </FieldRow>
          <FieldRow label="관리" span={1}>
            <Button
              variant="error"
              appearance="outline"
              size="md"
              label={removeLabel}
              showLeftIcon
              leftIcon={removeIcon ?? <Trash2 size={14} aria-hidden="true" />}
              disabled={disabled}
              onClick={() => removeStat(item.id)}
            />
          </FieldRow>
        </>
      ),
    })),
  ]

  /* ── 6. CTA 밴드 ───────────────────────────────────────────────────────── */
  const ctaFields: AdminFormField<CompanyValue>[] = [
    {
      kind: 'text',
      key: 'ctaTitle',
      label: '밴드 제목',
      required: true,
      span: 1,
      placeholder: "예: Let's build it together.",
      maxLength: 40,
    },
    {
      kind: 'text',
      key: 'ctaSubtitle',
      label: '밴드 설명',
      span: 2,
      placeholder: '문의를 유도하는 한 줄 설명',
      maxLength: 80,
    },
    {
      kind: 'text',
      key: 'ctaButtonLabel',
      label: '버튼 문구',
      required: true,
      span: 1,
      placeholder: '예: 프로젝트 문의하기',
      maxLength: 20,
    },
  ]

  /* ── 7. 노출 설정 ──────────────────────────────────────────────────────── */
  const visibilityFields: AdminFormField<CompanyValue>[] = [
    {
      kind: 'select',
      key: 'accent',
      label: '강조색',
      span: 1,
      description: '헤드라인 강조어·숫자·버튼에 쓰이는 색입니다.',
      options: accentOptions,
      placeholder: '강조색을 선택하세요',
    },
    {
      kind: 'toggle',
      key: 'showDivider',
      label: '섹션 구분선',
      span: 1,
      description: '섹션 헤딩 아래 구분선과 강조색 세그먼트를 표시합니다.',
    },
    {
      kind: 'toggle',
      key: 'showHeroScrim',
      label: '히어로 스크림',
      span: 1,
      description: '끄면 배경 사진이 원본 대비 그대로 보입니다.',
    },
  ]

  // show=false인 섹션은 fields를 비워 넘긴다 — 셸이 빈 카드를 그리지 않는다(카드 번호도 다시 매긴다)
  const sections: AdminFormSection<CompanyValue>[] = [
    {
      key: 'hero',
      ...copyOf('hero'),
      skeleton: <Skeleton variant="block" height={72} />,
      fields: on.hero ? heroFields : [],
    },
    {
      key: 'heroImage',
      ...copyOf('heroImage'),
      skeleton: <Skeleton variant="block" height={140} />,
      fields: on.heroImage ? heroImageFields : [],
    },
    {
      key: 'intro',
      ...copyOf('intro'),
      skeleton: (
        <>
          <Skeleton variant="text" lines={4} />
          <Skeleton variant="block" height={140} />
        </>
      ),
      fields: on.intro ? introFields : [],
    },
    {
      key: 'capabilities',
      ...copyOf('capabilities'),
      skeleton: <Skeleton variant="block" height={120} />,
      fields: on.capabilities ? capabilityFields : [],
    },
    {
      key: 'stats',
      ...copyOf('stats'),
      skeleton: <Skeleton variant="block" height={120} />,
      fields: on.stats ? statFields : [],
    },
    {
      key: 'cta',
      ...copyOf('cta'),
      // 데이터 스위치 — 끄면 고객 화면에서 CTA 밴드가 통째로 사라진다(AboutPage.showCta)
      toggleable: true,
      enabled: value.ctaEnabled,
      onEnabledChange: (ctaEnabled) => onChange({ ...value, ctaEnabled }),
      toggleLabel: 'CTA 밴드 사용',
      toggleDescription: '끄면 회사소개 맨 아래 문의 밴드가 노출되지 않습니다.',
      disabledHint: '문의를 받지 않는 회사소개입니다. 밴드 문구는 저장되지만 노출되지 않습니다.',
      skeleton: <Skeleton variant="block" height={72} />,
      fields: on.cta ? ctaFields : [],
    },
    {
      key: 'visibility',
      ...copyOf('visibility'),
      skeleton: <Skeleton variant="block" height={72} />,
      fields: on.visibility ? visibilityFields : [],
    },
  ]

  return (
    <AdminFormPage<CompanyValue>
      value={value}
      onChange={onChange}
      errors={errors}
      sections={sections}
      mode={mode}
      title={title}
      description={description}
      // 강조색은 저장 즉시 고객 화면 전체의 톤을 바꾼다 — 헤더 배지로 현재 값을 계속 보여 준다
      headerBadge={{
        label: value.accent === 'primary' ? '강조색 블루' : '강조색 그린',
        tone: value.accent === 'primary' ? 'primary' : 'success',
      }}
      submitLabel={submitLabel}
      submittingLabel={savingLabel}
      cancelLabel={cancelLabel}
      submitting={submitting}
      loading={loading}
      disabled={locked}
      onSubmit={onSubmit}
      onCancel={onCancel}
      density={density}
      maxWidth={maxWidth}
      // 액션 버튼은 핸들러가 있을 때만 — 둘 다 없으면 하단 바가 통째로 사라진다
      show={{
        header: on.header,
        headerSave: onSubmit != null,
        footer: on.footer,
        footerCancel: onCancel != null,
        footerSubmit: onSubmit != null,
      }}
    />
  )
}
