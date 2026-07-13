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
import type { MediaRatio } from '../Image/Image'
import { InputBase } from '../InputBase/InputBase'
import type { SelectOption } from '../Select/Select'
import { Skeleton } from '../Skeleton/Skeleton'
import { Textarea } from '../Textarea/Textarea'
import {
  mergeLabels,
  type DeepPartialOneLevel,
  type EmptyLabels,
  type LabelFn,
} from '../../shared/labels'

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

/**
 * 화면에 나오는 모든 글자 — 값(value)과 강조색 후보(accentOptions)만 데이터다.
 * 중첩은 표면 기준 1단계다(sections / fields / placeholders / helpers / images / capabilities / …).
 * 반복 항목의 빈 상태는 공용 EmptyLabels를 그대로 쓴다(같은 문구가 두 이름으로 존재하지 않게).
 */
export type CompanyFormLabels = {
  /** 페이지 헤더 */
  title: string
  description: string
  /** 섹션 카드 제목 — 기존 sectionCopy prop이 우선한다 */
  sections: Record<CompanySectionKey, string>
  /** 섹션 카드 설명 */
  sectionDescriptions: Record<CompanySectionKey, string>
  /** 필드 라벨 (키 = 값의 키 + 목록 머리 행) */
  fields: {
    heroEyebrow: string
    heroTitle: string
    heroSubtitle: string
    heroImage: string
    heroImageAlt: string
    introTitle: string
    introSubtitle: string
    introParagraphs: string
    introImage: string
    introImageAlt: string
    capabilitiesTitle: string
    capabilitiesSubtitle: string
    /** 역량 목록의 머리 행 */
    capabilities: string
    statsTitle: string
    statsSubtitle: string
    /** 통계 목록의 머리 행 */
    stats: string
    ctaTitle: string
    ctaSubtitle: string
    ctaButtonLabel: string
    accent: string
    showDivider: string
    showHeroScrim: string
  }
  /** 필드 플레이스홀더 */
  placeholders: {
    heroEyebrow: string
    heroTitle: string
    heroSubtitle: string
    heroImageAlt: string
    introTitle: string
    introSubtitle: string
    introParagraphs: string
    introImageAlt: string
    capabilitiesTitle: string
    capabilitiesSubtitle: string
    statsTitle: string
    statsSubtitle: string
    ctaTitle: string
    ctaSubtitle: string
    ctaButtonLabel: string
    accent: string
  }
  /** 필드 보조설명(FieldRow 설명 줄) */
  helpers: {
    heroEyebrow: string
    heroImageAlt: string
    introParagraphs: string
    capabilities: string
    stats: string
    accent: string
    showDivider: string
    showHeroScrim: string
  }
  /** 이미지 블록 — 두 이미지가 업로드 제약·드롭존 문구를 공유한다 */
  images: {
    hint: string
    dropLabel: string
    heroAlt: string
    heroRemove: string
    introAlt: string
    introRemove: string
  }
  /** 역량 카드 목록 — 항목 행([제목][설명][삭제])과 추가 버튼 */
  capabilities: {
    /** 항목 제목의 라벨 — 몇 번째 카드인지 알려야 한다(1-based) */
    itemTitle: LabelFn<number>
    itemTitlePlaceholder: string
    itemDescription: string
    itemDescriptionPlaceholder: string
    /** 삭제 열의 라벨 */
    itemActions: string
    add: string
    remove: string
  }
  /** 역량이 하나도 없을 때 */
  capabilitiesEmpty: EmptyLabels
  /** 통계 목록 */
  stats: {
    itemValue: LabelFn<number>
    itemValuePlaceholder: string
    itemLabel: string
    itemLabelPlaceholder: string
    itemActions: string
    add: string
    remove: string
  }
  statsEmpty: EmptyLabels
  /** CTA 섹션의 밴드 스위치(value.ctaEnabled) */
  cta: { toggleLabel: string; toggleDescription: string; disabledHint: string }
  /** 헤더 상태 배지 — 현재 강조색을 계속 보여 준다 */
  headerBadge: Record<CompanyAccent, string>
  /** 액션 버튼 — submit을 비우면 mode에 따라 '등록'/'저장'이 된다(셸 규약) */
  actions: { submit?: string; cancel: string; saving: string }
}

export type CompanyFormProps = {
  value: CompanyValue
  onChange: (v: CompanyValue) => void
  errors?: CompanyFormErrors
  /** 문구 — 개별 prop(sectionCopy·imageHint·addCapabilityLabel …)이 있으면 그쪽이 이긴다 */
  labels?: DeepPartialOneLevel<CompanyFormLabels>
  /** 히어로 배경 이미지 비율 (기본 16x9 — 가로로 넓게 깔리는 배경) */
  heroImageRatio?: MediaRatio
  /** 소개 본문 이미지 비율 (기본 4x3) */
  introImageRatio?: MediaRatio
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
  /** @deprecated labels.title을 쓴다(개별 prop이 우선한다) */
  title?: string
  /** @deprecated labels.description을 쓴다 */
  description?: string
  /**
   * @deprecated labels.sections / labels.sectionDescriptions를 쓴다.
   * 하위호환으로 유지되며, 넘긴 키만 labels를 덮어쓴다(키 단위 우선).
   */
  sectionCopy?: Partial<Record<CompanySectionKey, CompanySectionCopy>>
  /** @deprecated labels.actions.submit을 쓴다 */
  submitLabel?: string
  /** @deprecated labels.actions.cancel을 쓴다 */
  cancelLabel?: string
  /** @deprecated labels.actions.saving을 쓴다 */
  savingLabel?: string
  /** @deprecated labels.images.hint를 쓴다 */
  imageHint?: string
  /** @deprecated labels.images.dropLabel을 쓴다 */
  imageDropLabel?: string
  /** @deprecated labels.capabilities.add를 쓴다 */
  addCapabilityLabel?: string
  /** @deprecated labels.stats.add를 쓴다 */
  addStatLabel?: string
  /** @deprecated labels.capabilities.remove / labels.stats.remove를 쓴다(두 목록을 함께 덮는다) */
  removeLabel?: string
  /** @deprecated labels.capabilitiesEmpty.title을 쓴다 */
  capabilitiesEmptyTitle?: string
  /** @deprecated labels.capabilitiesEmpty.description을 쓴다 */
  capabilitiesEmptyDescription?: string
  /** @deprecated labels.statsEmpty.title을 쓴다 */
  statsEmptyTitle?: string
  /** @deprecated labels.statsEmpty.description을 쓴다 */
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

export const DEFAULT_COMPANY_FORM_LABELS: CompanyFormLabels = {
  title: '회사소개 관리',
  description: '고객용 회사소개 페이지에 그대로 노출되는 내용입니다.',
  sections: {
    hero: '기본 정보',
    heroImage: '히어로 이미지',
    intro: '소개 본문',
    capabilities: '핵심 역량',
    stats: '숫자 성과',
    cta: 'CTA 밴드',
    visibility: '노출 설정',
  },
  sectionDescriptions: {
    hero: '회사소개 첫 화면(히어로)에 가운데로 놓이는 카피입니다.',
    heroImage: '히어로 카피 아래에 깔리는 배경 사진입니다. 없으면 대체 그림이 표시됩니다.',
    intro: '미션·비전 문단과 우측 이미지로 구성되는 회사 개요입니다.',
    capabilities: '옅은 회색 면 위 흰 카드로 나열됩니다. 4개 단위로 줄이 나뉩니다.',
    stats: '큰 숫자(강조색)와 라벨 한 쌍이 한 칸입니다.',
    cta: '페이지 맨 아래 문의 유도 밴드입니다.',
    visibility: '강조색과 장식 요소의 노출을 정합니다. 저장 즉시 고객 화면에 반영됩니다.',
  },
  fields: {
    heroEyebrow: '상단 라벨',
    heroTitle: '헤드라인',
    heroSubtitle: '서브카피',
    heroImage: '배경 이미지',
    heroImageAlt: '대체 텍스트',
    introTitle: '헤드라인',
    introSubtitle: '서브카피',
    introParagraphs: '소개 문단',
    introImage: '본문 이미지',
    introImageAlt: '대체 텍스트',
    capabilitiesTitle: '섹션 헤드라인',
    capabilitiesSubtitle: '섹션 서브카피',
    capabilities: '역량 카드',
    statsTitle: '섹션 헤드라인',
    statsSubtitle: '섹션 서브카피',
    stats: '통계 항목',
    ctaTitle: '밴드 제목',
    ctaSubtitle: '밴드 설명',
    ctaButtonLabel: '버튼 문구',
    accent: '강조색',
    showDivider: '섹션 구분선',
    showHeroScrim: '히어로 스크림',
  },
  placeholders: {
    heroEyebrow: '예: About us',
    heroTitle: '예: We design sound for space.',
    heroSubtitle: '헤드라인 아래에 놓이는 한글 카피를 입력하세요.',
    heroImageAlt: '예: 스튜디오 전경',
    introTitle: '예: Who we are',
    introSubtitle: '헤드라인 아래 한 줄 설명',
    introParagraphs: '미션·비전을 2~3개 문단으로 입력하세요.',
    introImageAlt: '예: 작업 중인 팀',
    capabilitiesTitle: '예: What we do',
    capabilitiesSubtitle: '섹션 헤드라인 아래 한 줄 설명',
    statsTitle: '예: By the numbers',
    statsSubtitle: '섹션 헤드라인 아래 한 줄 설명',
    ctaTitle: "예: Let's build it together.",
    ctaSubtitle: '문의를 유도하는 한 줄 설명',
    ctaButtonLabel: '예: 프로젝트 문의하기',
    accent: '강조색을 선택하세요',
  },
  helpers: {
    heroEyebrow: '헤드라인 위 작은 라벨입니다. 강조색으로 표시됩니다.',
    heroImageAlt: '이미지를 볼 수 없는 사용자(스크린리더)에게 읽히는 설명입니다.',
    introParagraphs: '빈 줄(엔터 2번)로 문단을 나눕니다. 문단마다 별도 <p>로 노출됩니다.',
    capabilities: '카드는 입력한 순서대로 노출됩니다.',
    stats: '숫자는 접미사를 포함해 그대로 노출됩니다(예: 120+, 15년).',
    accent: '헤드라인 강조어·숫자·버튼에 쓰이는 색입니다.',
    showDivider: '섹션 헤딩 아래 구분선과 강조색 세그먼트를 표시합니다.',
    showHeroScrim: '끄면 배경 사진이 원본 대비 그대로 보입니다.',
  },
  images: {
    hint: IMAGE_HINT,
    dropLabel: '이미지를 끌어다 놓거나 클릭해서 선택하세요',
    heroAlt: '히어로 배경 이미지 미리보기',
    heroRemove: '히어로 이미지 삭제',
    introAlt: '회사 개요 이미지 미리보기',
    introRemove: '본문 이미지 삭제',
  },
  capabilities: {
    itemTitle: (position) => `역량 ${position} 제목`,
    itemTitlePlaceholder: '예: 음향 설계',
    itemDescription: '설명',
    itemDescriptionPlaceholder: '카드 본문에 들어갈 설명을 입력하세요.',
    itemActions: '관리',
    add: '역량 카드 추가',
    remove: '삭제',
  },
  capabilitiesEmpty: {
    title: '등록된 역량 카드가 없습니다.',
    description: '카드를 추가하지 않으면 고객 화면에서 핵심 역량 섹션이 통째로 접힙니다.',
  },
  stats: {
    itemValue: (position) => `통계 ${position} 숫자`,
    itemValuePlaceholder: '예: 120+',
    itemLabel: '라벨',
    itemLabelPlaceholder: '예: 완료 프로젝트',
    itemActions: '관리',
    add: '통계 항목 추가',
    remove: '삭제',
  },
  statsEmpty: {
    title: '등록된 통계가 없습니다.',
    description: '항목을 추가하지 않으면 고객 화면에서 숫자 성과 섹션이 통째로 접힙니다.',
  },
  cta: {
    toggleLabel: 'CTA 밴드 사용',
    toggleDescription: '끄면 회사소개 맨 아래 문의 밴드가 노출되지 않습니다.',
    disabledHint: '문의를 받지 않는 회사소개입니다. 밴드 문구는 저장되지만 노출되지 않습니다.',
  },
  headerBadge: { primary: '강조색 블루', success: '강조색 그린' },
  actions: { cancel: '취소', saving: '저장 중…' },
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
  labels,
  heroImageRatio = '16x9',
  introImageRatio = '4x3',
  title,
  description,
  sectionCopy,
  submitLabel,
  cancelLabel,
  savingLabel,
  imageHint,
  imageDropLabel,
  addCapabilityLabel,
  addStatLabel,
  removeLabel,
  capabilitiesEmptyTitle,
  capabilitiesEmptyDescription,
  statsEmptyTitle,
  statsEmptyDescription,
  accentOptions = ACCENT_OPTIONS,
  addIcon,
  removeIcon,
  removeImageIcon,
}: CompanyFormProps) {
  const on = resolveShow(show)

  // 우선순위: 개별 prop > labels > 기본값. mergeLabels는 undefined를 무시하므로
  // 넘기지 않은 개별 prop이 기본 문구를 지우지 않는다.
  const L = mergeLabels(mergeLabels(DEFAULT_COMPANY_FORM_LABELS, labels), {
    title,
    description,
    images: { hint: imageHint, dropLabel: imageDropLabel },
    capabilities: { add: addCapabilityLabel, remove: removeLabel },
    capabilitiesEmpty: { title: capabilitiesEmptyTitle, description: capabilitiesEmptyDescription },
    stats: { add: addStatLabel, remove: removeLabel },
    statsEmpty: { title: statsEmptyTitle, description: statsEmptyDescription },
    actions: { submit: submitLabel, cancel: cancelLabel, saving: savingLabel },
  })

  /** 섹션 머리글 — labels 위에 sectionCopy(개별 prop)를 키 단위로 얹는다 */
  const copyOf = (key: CompanySectionKey): Required<CompanySectionCopy> => ({
    title: sectionCopy?.[key]?.title ?? L.sections[key],
    description: sectionCopy?.[key]?.description ?? L.sectionDescriptions[key],
  })

  // 저장 중에는 입력을 잠근다(조회 중에는 본문이 스켈레톤이라 컨트롤 자체가 없다)
  const locked = submitting

  /* ── 1. 기본 정보(히어로 카피) ─────────────────────────────────────────── */
  const heroFields: AdminFormField<CompanyValue>[] = [
    {
      kind: 'text',
      key: 'heroEyebrow',
      label: L.fields.heroEyebrow,
      span: 1,
      description: L.helpers.heroEyebrow,
      placeholder: L.placeholders.heroEyebrow,
      maxLength: 30,
    },
    {
      kind: 'text',
      key: 'heroTitle',
      label: L.fields.heroTitle,
      required: true,
      span: 2,
      placeholder: L.placeholders.heroTitle,
      maxLength: 60,
      showCounter: true,
    },
    {
      kind: 'textarea',
      key: 'heroSubtitle',
      label: L.fields.heroSubtitle,
      required: true,
      span: 3,
      placeholder: L.placeholders.heroSubtitle,
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
      label: L.fields.heroImage,
      description: L.images.hint,
      // 가로로 넓게 깔리는 배경이라 기본 16:9 — 교체가 잦은 자리라 썸네일 옆에 드롭존을 함께 세운다(row)
      layout: 'row',
      ratio: heroImageRatio,
      previewWidth: 240,
      alt: L.images.heroAlt,
      remove: 'square',
      removeLabel: L.images.heroRemove,
      removeIcon: removeImageIcon,
      accept: IMAGE_ACCEPT,
      maxSizeMb: MAX_IMAGE_MB,
      dropLabel: L.images.dropLabel,
    },
    {
      kind: 'text',
      key: 'heroImageAlt',
      label: L.fields.heroImageAlt,
      span: 3,
      description: L.helpers.heroImageAlt,
      placeholder: L.placeholders.heroImageAlt,
      maxLength: 60,
    },
  ]

  /* ── 3. 소개 본문 ──────────────────────────────────────────────────────── */
  const introFields: AdminFormField<CompanyValue>[] = [
    {
      kind: 'text',
      key: 'introTitle',
      label: L.fields.introTitle,
      required: true,
      span: 1,
      placeholder: L.placeholders.introTitle,
      maxLength: 40,
    },
    {
      kind: 'text',
      key: 'introSubtitle',
      label: L.fields.introSubtitle,
      span: 2,
      placeholder: L.placeholders.introSubtitle,
      maxLength: 80,
    },
    {
      kind: 'textarea',
      key: 'introParagraphs',
      label: L.fields.introParagraphs,
      required: true,
      // 문단 배열을 관리하는 UI를 따로 만들지 않는다 — 빈 줄이 곧 문단 경계다(toAboutPageData가 편다)
      description: L.helpers.introParagraphs,
      placeholder: L.placeholders.introParagraphs,
      rows: 8,
      maxLength: 1000,
      showCounter: true,
    },
    {
      kind: 'image',
      key: 'introImage',
      label: L.fields.introImage,
      description: L.images.hint,
      ratio: introImageRatio,
      previewWidth: 200,
      alt: L.images.introAlt,
      remove: 'square',
      removeLabel: L.images.introRemove,
      removeIcon: removeImageIcon,
      accept: IMAGE_ACCEPT,
      maxSizeMb: MAX_IMAGE_MB,
      dropLabel: L.images.dropLabel,
    },
    {
      kind: 'text',
      key: 'introImageAlt',
      label: L.fields.introImageAlt,
      span: 3,
      placeholder: L.placeholders.introImageAlt,
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
      label: L.fields.capabilitiesTitle,
      span: 1,
      placeholder: L.placeholders.capabilitiesTitle,
      maxLength: 40,
    },
    {
      kind: 'text',
      key: 'capabilitiesSubtitle',
      label: L.fields.capabilitiesSubtitle,
      span: 2,
      placeholder: L.placeholders.capabilitiesSubtitle,
      maxLength: 80,
    },
    {
      // 목록의 머리 행 — 라벨·설명·에러(errors.capabilities)와 [추가] 버튼이 여기 모인다
      kind: 'custom',
      key: 'capabilities',
      label: L.fields.capabilities,
      description: L.helpers.capabilities,
      span: 3,
      render: ({ value: v, disabled }) =>
        v.capabilities.length === 0 ? (
          // 빈 상태 그림·문구·액션은 공용 EmptyState가 단일 출처다 — 여기서 다시 만들지 않는다
          <EmptyState
            kind="empty"
            compact
            title={L.capabilitiesEmpty.title}
            description={L.capabilitiesEmpty.description}
            actionLabel={disabled ? undefined : L.capabilities.add}
            onAction={addCapability}
          />
        ) : (
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label={L.capabilities.add}
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
          {/* 라벨에 순번을 넣어 스크린리더가 어떤 카드를 다루는지 알 수 있게 한다 */}
          <FieldRow label={L.capabilities.itemTitle(index + 1)} span={1}>
            <InputBase
              value={item.title}
              onChange={(next) => patchCapability(item.id, { title: next })}
              placeholder={L.capabilities.itemTitlePlaceholder}
              maxLength={30}
              disabled={disabled}
            />
          </FieldRow>
          <FieldRow label={L.capabilities.itemDescription} span={1}>
            <Textarea
              value={item.description}
              onChange={(next) => patchCapability(item.id, { description: next })}
              placeholder={L.capabilities.itemDescriptionPlaceholder}
              rows={2}
              maxLength={120}
              disabled={disabled}
            />
          </FieldRow>
          <FieldRow label={L.capabilities.itemActions} span={1}>
            <Button
              variant="error"
              appearance="outline"
              size="md"
              label={L.capabilities.remove}
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
      label: L.fields.statsTitle,
      span: 1,
      placeholder: L.placeholders.statsTitle,
      maxLength: 40,
    },
    {
      kind: 'text',
      key: 'statsSubtitle',
      label: L.fields.statsSubtitle,
      span: 2,
      placeholder: L.placeholders.statsSubtitle,
      maxLength: 80,
    },
    {
      kind: 'custom',
      key: 'stats',
      label: L.fields.stats,
      description: L.helpers.stats,
      span: 3,
      render: ({ value: v, disabled }) =>
        v.stats.length === 0 ? (
          <EmptyState
            kind="empty"
            compact
            title={L.statsEmpty.title}
            description={L.statsEmpty.description}
            actionLabel={disabled ? undefined : L.stats.add}
            onAction={addStat}
          />
        ) : (
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label={L.stats.add}
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
          <FieldRow label={L.stats.itemValue(index + 1)} span={1}>
            <InputBase
              value={item.value}
              onChange={(next) => patchStat(item.id, { value: next })}
              placeholder={L.stats.itemValuePlaceholder}
              maxLength={12}
              disabled={disabled}
            />
          </FieldRow>
          <FieldRow label={L.stats.itemLabel} span={1}>
            <InputBase
              value={item.label}
              onChange={(next) => patchStat(item.id, { label: next })}
              placeholder={L.stats.itemLabelPlaceholder}
              maxLength={20}
              disabled={disabled}
            />
          </FieldRow>
          <FieldRow label={L.stats.itemActions} span={1}>
            <Button
              variant="error"
              appearance="outline"
              size="md"
              label={L.stats.remove}
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
      label: L.fields.ctaTitle,
      required: true,
      span: 1,
      placeholder: L.placeholders.ctaTitle,
      maxLength: 40,
    },
    {
      kind: 'text',
      key: 'ctaSubtitle',
      label: L.fields.ctaSubtitle,
      span: 2,
      placeholder: L.placeholders.ctaSubtitle,
      maxLength: 80,
    },
    {
      kind: 'text',
      key: 'ctaButtonLabel',
      label: L.fields.ctaButtonLabel,
      required: true,
      span: 1,
      placeholder: L.placeholders.ctaButtonLabel,
      maxLength: 20,
    },
  ]

  /* ── 7. 노출 설정 ──────────────────────────────────────────────────────── */
  const visibilityFields: AdminFormField<CompanyValue>[] = [
    {
      kind: 'select',
      key: 'accent',
      label: L.fields.accent,
      span: 1,
      description: L.helpers.accent,
      options: accentOptions,
      placeholder: L.placeholders.accent,
    },
    {
      kind: 'toggle',
      key: 'showDivider',
      label: L.fields.showDivider,
      span: 1,
      description: L.helpers.showDivider,
    },
    {
      kind: 'toggle',
      key: 'showHeroScrim',
      label: L.fields.showHeroScrim,
      span: 1,
      description: L.helpers.showHeroScrim,
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
      toggleLabel: L.cta.toggleLabel,
      toggleDescription: L.cta.toggleDescription,
      disabledHint: L.cta.disabledHint,
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
      title={L.title}
      description={L.description}
      // 강조색은 저장 즉시 고객 화면 전체의 톤을 바꾼다 — 헤더 배지로 현재 값을 계속 보여 준다
      headerBadge={{
        label: L.headerBadge[value.accent],
        tone: value.accent === 'primary' ? 'primary' : 'success',
      }}
      submitLabel={L.actions.submit}
      submittingLabel={L.actions.saving}
      cancelLabel={L.actions.cancel}
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
