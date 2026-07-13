import type { ReactNode } from 'react'
import { AdminFormPage, type AdminFormField } from '../AdminFormPage/AdminFormPage'
import { RichTextEditor } from '../RichTextEditor/RichTextEditor'
import type { SelectOption } from '../Select/Select'
import { Skeleton } from '../Skeleton/Skeleton'
import { mergeLabels, type DeepPartialOneLevel } from '../../shared/labels'

export type PortfolioFormValue = {
  /** 카테고리 value — 미선택이면 null */
  category: string | null
  title: string
  /** 외부 링크 URL — 선택 항목 */
  link: string
  /** 대표 이미지 URL(data URI 포함) — 없으면 드롭존이 뜬다 */
  image?: string
  /** 상세 내용 HTML (RichTextEditor) */
  content: string
  /** 노출 여부 — true면 헤더에 '활성' 배지 */
  active: boolean
  /**
   * 상세 페이지 사용 — '이미지 · 상세 내용' 섹션의 자체 ON/OFF(FormSection toggleable).
   * false면 이미지·상세 내용을 쓰지 않고 카드가 링크 URL로 바로 이동한다.
   */
  detailEnabled: boolean
}

/** 필드별 에러 메시지 — 값이 있으면 해당 컨트롤이 error 상태가 된다 */
export type PortfolioFormErrors = {
  category?: string
  title?: string
  link?: string
  image?: string
  content?: string
}

/**
 * 섹션·요소 ON/OFF — 기본값은 전부 true.
 * false면 그 영역이 DOM에서 완전히 사라진다(빈 자리·여백·구분선을 남기지 않는다).
 * 한 섹션의 필드가 모두 꺼지면 섹션 카드 자체도 렌더하지 않는다.
 */
export type PortfolioFormShow = {
  /** 페이지 헤더 — 타이틀 + 활성 배지 + [저장] */
  header?: boolean
  /** 섹션: 기본 정보 */
  basic?: boolean
  /** 기본 정보 > 카테고리 */
  category?: boolean
  /** 기본 정보 > 제목 */
  title?: boolean
  /** 기본 정보 > 링크 URL */
  link?: boolean
  /** 섹션: 이미지 · 상세 내용 */
  media?: boolean
  /** 이미지 · 상세 내용 > 대표 이미지 */
  image?: boolean
  /** 이미지 · 상세 내용 > 상세 내용(에디터) */
  content?: boolean
  /** 하단 액션 바 — [취소] [저장] */
  footer?: boolean
}

/**
 * 화면에 나오는 모든 글자 — 값(value)과 카테고리 후보(categories)만 데이터다.
 * 중첩은 표면 기준 1단계다(sections / fields / placeholders / helpers / image / actions).
 */
export type PortfolioFormLabels = {
  /** 페이지 헤더 타이틀 — mode가 고른다 */
  title: { create: string; edit: string }
  /** 헤더 설명 */
  description: string
  /** 헤더 상태 배지 — value.active에 따라 갈린다 */
  status: { active: string; inactive: string }
  /** 섹션 카드 제목 */
  sections: { basic: string; media: string }
  /** 섹션 카드 설명 */
  sectionDescriptions: { basic: string; media: string }
  /** 2번 섹션의 밴드 스위치(value.detailEnabled) */
  detailToggle: { label: string; description: string; disabledHint: string }
  /** 필드 라벨 */
  fields: { category: string; title: string; link: string; image: string; content: string }
  /** 필드 플레이스홀더 */
  placeholders: { category: string; title: string; link: string; content: string }
  /** 필드 보조설명(FieldRow 설명 줄) */
  helpers: { link: string }
  /** 이미지 블록 */
  image: {
    /** 썸네일 삭제 버튼의 접근성 이름 */
    removeLabel: string
    /** 제약 안내 — FieldRow 설명 자리에 놓인다 */
    hint: string
    /** 드롭존 안 문구 */
    dropLabel: string
    /** 썸네일 대체 텍스트 */
    alt: string
  }
  /** 액션 버튼 — submit을 비우면 mode에 따라 '등록'/'저장'이 된다(셸 규약) */
  actions: { submit?: string; cancel: string; saving: string }
}

export type PortfolioFormProps = {
  value: PortfolioFormValue
  onChange: (v: PortfolioFormValue) => void
  categories: SelectOption[]
  mode?: 'create' | 'edit'
  errors?: PortfolioFormErrors
  /** 섹션·요소 ON/OFF — 생략하면 전부 ON */
  show?: PortfolioFormShow
  /** 문구 — 개별 prop(submitLabel·imageHint …)이 있으면 그쪽이 이긴다 */
  labels?: DeepPartialOneLevel<PortfolioFormLabels>
  onSubmit?: () => void
  /** 없으면 하단 [취소] 버튼을 숨긴다 */
  onCancel?: () => void
  /** 저장 중 — 모든 입력과 액션이 잠긴다 */
  submitting?: boolean
  /** 조회 중 — 섹션 본문을 스켈레톤으로 대체한다 */
  loading?: boolean
  density?: 'compact' | 'comfortable'
  maxWidth?: 'md' | 'lg' | 'full'

  /**
   * 대표 이미지의 썸네일 블록(미리보기 + 삭제 버튼). 기본 true.
   * 끄면 이미지가 이미 있어도 드롭존(교체 UI)만 남는다 — 미리보기를 상세 모달에서 따로 띄우거나,
   * 폼 폭이 좁아 160×120 썸네일이 들어가지 않는 화면을 위한 스위치다. 값(value.image)은 유지된다.
   */
  showPreview?: boolean

  /* ── 아이콘 슬롯 — 없으면 기존 lucide 기본 아이콘 ── */
  /** 썸네일 우상단 삭제(x) */
  removeImageIcon?: ReactNode

  /* ── 문구 (없으면 기존 기본 문구 그대로) ── */
  /** @deprecated labels.image.removeLabel을 쓴다(개별 prop이 우선한다) */
  removeImageLabel?: string
  /** @deprecated labels.image.dropLabel을 쓴다 */
  dropLabel?: string
  /** @deprecated labels.image.hint를 쓴다 */
  imageHint?: string
  /** @deprecated labels.actions.submit을 쓴다 */
  submitLabel?: string
  /** @deprecated labels.actions.saving을 쓴다 */
  savingLabel?: string
  /** @deprecated labels.actions.cancel을 쓴다 */
  cancelLabel?: string
}

/** 대표 이미지 제약 — 안내 문구와 DropZone 검증이 같은 상수를 본다 */
const MAX_IMAGE_MB = 10
const IMAGE_ACCEPT = 'image/jpeg,image/png'

export const DEFAULT_PORTFOLIO_FORM_LABELS: PortfolioFormLabels = {
  title: { create: '포트폴리오 등록', edit: '포트폴리오 수정' },
  description: '목록과 상세 페이지에 노출되는 포트폴리오 정보를 관리합니다.',
  status: { active: '활성', inactive: '비활성' },
  sections: { basic: '기본 정보', media: '이미지 · 상세 내용' },
  sectionDescriptions: {
    basic: '목록 카드에 그대로 노출되는 정보입니다.',
    media: '상세 페이지에 노출되는 대표 이미지와 본문입니다.',
  },
  detailToggle: {
    label: '상세 페이지 사용',
    description: '끄면 카드를 눌렀을 때 링크 URL로 바로 이동합니다.',
    disabledHint:
      '상세 페이지를 쓰지 않는 포트폴리오입니다. 대표 이미지·상세 내용은 저장되지 않습니다.',
  },
  fields: {
    category: '카테고리',
    title: '제목',
    link: '링크 URL',
    image: '대표 이미지',
    content: '상세 내용',
  },
  placeholders: {
    category: '카테고리를 선택하세요',
    title: '포트폴리오 제목을 입력하세요',
    link: 'https://example.com/project',
    content: '프로젝트 개요 · 역할 · 성과를 입력하세요',
  },
  helpers: { link: '선택 항목입니다. 입력하면 카드에 바로가기가 노출됩니다.' },
  image: {
    removeLabel: '대표 이미지 삭제',
    hint: `JPG · PNG 이미지 · 최대 ${MAX_IMAGE_MB}MB`,
    dropLabel: '대표 이미지를 끌어다 놓거나 클릭해서 선택하세요',
    alt: '대표 이미지 미리보기',
  },
  actions: { cancel: '취소', saving: '저장 중…' },
}

/** show 기본값 — 전부 ON */
const DEFAULT_SHOW: Required<PortfolioFormShow> = {
  header: true,
  basic: true,
  category: true,
  title: true,
  link: true,
  media: true,
  image: true,
  content: true,
  footer: true,
}

/**
 * 포트폴리오 등록/수정 폼 — AdminFormPage 셸의 얇은 프리셋.
 *
 *   header   PageHeaderBar — '포트폴리오 수정' + 활성 배지 + [저장]
 *   1        기본 정보 — 카테고리(필수) · 제목(필수) · 링크 URL(선택)
 *   2        이미지 · 상세 내용 — 대표 이미지(업로드·썸네일·삭제) + RichTextEditor
 *   footer   [취소] [저장] — sticky 액션 바
 *
 * 골격·조립·섹션 번호 재부여·이미지 업로드 블록은 전부 셸이 갖는다.
 * 이 파일에 남는 건 값 타입 · 필드 선언 · 한국어 문구뿐이다.
 *
 * ON/OFF는 두 층이다.
 *  - show                : 화면 구성(디자인 타임). 끄면 섹션·필드가 스키마에서 빠진다.
 *                          Figma에서는 같은 키가 BOOLEAN 속성 `Show <Key>`로 노출된다.
 *  - value.detailEnabled : 데이터(런타임). '상세 페이지 사용' 밴드 스위치 — FormSection의 toggleable.
 */
export function PortfolioForm({
  value,
  onChange,
  categories,
  mode = 'create',
  errors,
  show,
  labels,
  onSubmit,
  onCancel,
  submitting = false,
  loading = false,
  density = 'compact',
  maxWidth = 'lg',
  showPreview = true,
  removeImageIcon,
  removeImageLabel,
  dropLabel,
  imageHint,
  submitLabel,
  savingLabel,
  cancelLabel,
}: PortfolioFormProps) {
  // 우선순위: 개별 prop > labels > 기본값. mergeLabels는 undefined를 무시한다.
  const L = mergeLabels(mergeLabels(DEFAULT_PORTFOLIO_FORM_LABELS, labels), {
    image: { hint: imageHint, removeLabel: removeImageLabel, dropLabel },
    actions: { submit: submitLabel, cancel: cancelLabel, saving: savingLabel },
  })

  const s = { ...DEFAULT_SHOW, ...show }

  const heading = mode === 'edit' ? L.title.edit : L.title.create

  // ── 1. 기본 정보 ──────────────────────────────────────────────────────────
  const basicFields: AdminFormField<PortfolioFormValue>[] = []

  if (s.basic && s.category) {
    basicFields.push({
      kind: 'select',
      key: 'category',
      label: L.fields.category,
      required: true,
      span: 1,
      options: categories,
      placeholder: L.placeholders.category,
    })
  }

  if (s.basic && s.title) {
    basicFields.push({
      kind: 'text',
      key: 'title',
      label: L.fields.title,
      required: true,
      span: 2,
      placeholder: L.placeholders.title,
      maxLength: 60,
      showCounter: true,
    })
  }

  if (s.basic && s.link) {
    basicFields.push({
      kind: 'text',
      key: 'link',
      label: L.fields.link,
      description: L.helpers.link,
      span: 3,
      placeholder: L.placeholders.link,
    })
  }

  // ── 2. 이미지 · 상세 내용 ─────────────────────────────────────────────────
  const mediaFields: AdminFormField<PortfolioFormValue>[] = []

  if (s.media && s.image) {
    mediaFields.push({
      kind: 'image',
      key: 'image',
      label: L.fields.image,
      // 제약(용량·형식)은 FieldRow 설명 자리, 안내 문구는 드롭존 안 — 두 말이 겹치지 않는다
      description: L.image.hint,
      ratio: '4x3',
      previewWidth: 160,
      alt: L.image.alt,
      remove: 'square',
      removeLabel: L.image.removeLabel,
      removeIcon: removeImageIcon,
      accept: IMAGE_ACCEPT,
      maxSizeMb: MAX_IMAGE_MB,
      dropLabel: L.image.dropLabel,
      showPreview,
    })
  }

  if (s.media && s.content) {
    mediaFields.push({
      kind: 'custom',
      key: 'content',
      label: L.fields.content,
      // 에디터는 셸이 모르는 컨트롤이다 — 값 갱신만 셸에서 받아 쓴다
      render: ({ value: v, patch, disabled }) => (
        <RichTextEditor
          value={v.content}
          onChange={(content) => patch({ content })}
          placeholder={L.placeholders.content}
          minHeight={260}
          disabled={disabled}
        />
      ),
    })
  }

  return (
    <AdminFormPage<PortfolioFormValue>
      value={value}
      onChange={onChange}
      errors={errors}
      sections={[
        {
          key: 'basic',
          title: L.sections.basic,
          description: L.sectionDescriptions.basic,
          skeleton: <Skeleton variant="block" height={72} />,
          fields: basicFields,
        },
        {
          key: 'media',
          title: L.sections.media,
          description: L.sectionDescriptions.media,
          toggleable: true,
          enabled: value.detailEnabled,
          onEnabledChange: (detailEnabled) => onChange({ ...value, detailEnabled }),
          toggleLabel: L.detailToggle.label,
          toggleDescription: L.detailToggle.description,
          disabledHint: L.detailToggle.disabledHint,
          skeleton: (
            <>
              <Skeleton variant="block" width={160} height={120} />
              <Skeleton variant="text" lines={4} />
            </>
          ),
          fields: mediaFields,
        },
      ]}
      mode={mode}
      title={heading}
      description={L.description}
      headerBadge={{
        label: value.active ? L.status.active : L.status.inactive,
        tone: value.active ? 'success' : 'secondary',
      }}
      submitLabel={L.actions.submit}
      submittingLabel={L.actions.saving}
      cancelLabel={L.actions.cancel}
      submitting={submitting}
      loading={loading}
      // 저장 중에는 모든 입력이 잠긴다(조회 중에는 본문이 스켈레톤이라 컨트롤 자체가 없다)
      disabled={submitting}
      onSubmit={onSubmit}
      onCancel={onCancel}
      density={density}
      maxWidth={maxWidth}
      // 액션 버튼은 핸들러가 있을 때만 — 둘 다 없으면 하단 바가 통째로 사라진다
      show={{
        header: s.header,
        headerSave: onSubmit != null,
        footer: s.footer,
        footerCancel: onCancel != null,
        footerSubmit: onSubmit != null,
      }}
    />
  )
}
