import type { ReactNode } from 'react'
import { AdminFormPage, type AdminFormField } from '../AdminFormPage/AdminFormPage'
import { Callout } from '../Callout/Callout'
import { Toggle } from '../Toggle/Toggle'
import { mergeLabels, type DeepPartialOneLevel } from '../../shared/labels'
import styles from './MainVisualForm.module.css'

/* ── 값 ──────────────────────────────────────────────────────────────────── */

export type MainVisualValue = {
  /** 배너가 붙는 섹션 — 저장 후에는 바꾸지 않는다 */
  section: string | null
  /** 문구 사용 ON/OFF — OFF면 이미지만 노출된다 */
  useCopy: boolean
  title: string
  overline?: string
  menuLabel?: string
  buttonLabel?: string
  /** 대표 이미지 URL(업로드 응답 URL 또는 data URL) */
  image?: string
  link?: string
  /** 클라이언트 페이지 노출 여부 */
  active: boolean
}

export type MainVisualSectionOption = {
  value: string
  label: string
}

/** 필드별 에러 문구 — 서버 검증 결과를 그대로 꽂는다 */
export type MainVisualErrors = {
  section?: string
  title?: string
  image?: string
  link?: string
}

/* ── ON/OFF ──────────────────────────────────────────────────────────────── */

/**
 * 화면 ON/OFF 스위치. 기본값은 전부 true이고, false면 그 영역이 DOM에서 완전히 사라진다
 * (빈 자리·여백·구분선이 남지 않는다 — 섹션 카드가 통째로 빠지면 content의 gap도 함께 사라진다).
 * Figma에서는 같은 키가 BOOLEAN 컴포넌트 속성 `Show <Key>`로 노출된다.
 */
export type MainVisualShow = {
  /** 페이지 헤더(타이틀 · 상태 배지 · 저장) */
  header?: boolean
  /** 헤더의 활성/비활성 배지 */
  statusBadge?: boolean
  /** 헤더 우측 [저장] */
  headerSave?: boolean
  /** 1. 배너 구분 */
  banner?: boolean
  /** 2. 문구·콘텐츠 */
  content?: boolean
  /** 3. 이미지 */
  image?: boolean
  /** 4. 링크·노출 */
  link?: boolean
  /** 하단 [취소] [저장] 바 */
  footer?: boolean

  // ── 필드 단위 ──
  /** 1. 섹션 Select */
  sectionField?: boolean
  /** 2. 제목 */
  titleField?: boolean
  /** 2. 오버라인 문구 */
  overlineField?: boolean
  /** 2. 우측 메뉴 라벨 */
  menuLabelField?: boolean
  /** 2. 버튼 문구 */
  buttonLabelField?: boolean
  /** 4. 링크 URL */
  linkField?: boolean
  /** 4. '활성화' 토글 밴드 */
  visibility?: boolean
  /** 섹션 하단 도움말(Callout) */
  help?: boolean
}

const DEFAULT_SHOW: Required<MainVisualShow> = {
  header: true,
  statusBadge: true,
  headerSave: true,
  banner: true,
  content: true,
  image: true,
  link: true,
  footer: true,
  sectionField: true,
  titleField: true,
  overlineField: true,
  menuLabelField: true,
  buttonLabelField: true,
  linkField: true,
  visibility: true,
  help: true,
}

/* ── 문구 ────────────────────────────────────────────────────────────────── */

/**
 * 화면에 나오는 모든 글자 — 값(value)과 섹션 후보(sections)만 데이터다.
 * 중첩은 표면 기준 1단계다(sections / fields / placeholders / helpers / image / …).
 */
export type MainVisualFormLabels = {
  /** 페이지 헤더 타이틀 */
  title: string
  /** 헤더 상태 배지 — value.active에 따라 갈린다 */
  status: { active: string; inactive: string }
  /** 섹션 카드 제목(카드 번호 1~4는 고정이다) */
  sections: { banner: string; copy: string; image: string; link: string }
  /** 섹션 카드 설명 */
  sectionDescriptions: { banner: string }
  /** 2번 섹션의 밴드 스위치(value.useCopy) */
  copyToggle: { label: string; description: string; disabledHint: string }
  /** 필드 라벨 */
  fields: {
    section: string
    title: string
    overline: string
    menuLabel: string
    buttonLabel: string
    image: string
    link: string
  }
  /** 필드 플레이스홀더 */
  placeholders: {
    section: string
    title: string
    overline: string
    menuLabel: string
    buttonLabel: string
    link: string
  }
  /** 필드 보조설명(FieldRow 설명 줄) */
  helpers: { buttonLabel: string; link: string }
  /** 섹션 하단 도움말(Callout) */
  help: { title: string; banner: string; copy: string }
  /** 이미지 블록 */
  image: {
    /** 썸네일 삭제 버튼의 접근성 이름 */
    removeLabel: string
    /** 드롭존 하단 제약 안내 */
    hint: string
    /** 드롭존 안 문구 — 이미 이미지가 있으면 '교체', 없으면 '선택' */
    dropReplace: string
    dropSelect: string
  }
  /** 4번 섹션의 '활성화' 밴드(value.active) */
  visibility: {
    label: string
    on: string
    off: string
    /** 켜져 있을 때/꺼져 있을 때의 설명 */
    onDescription: string
    offDescription: string
  }
  /** 액션 버튼 */
  actions: { save: string; cancel: string; saving: string }
}

export const DEFAULT_MAIN_VISUAL_FORM_LABELS: MainVisualFormLabels = {
  title: '메인 비주얼 수정',
  status: { active: '활성', inactive: '비활성' },
  sections: { banner: '배너 구분', copy: '문구·콘텐츠', image: '이미지', link: '링크·노출' },
  sectionDescriptions: {
    banner: '노출 위치(섹션)는 목록 탭에서 정해지며 고정됩니다. 배너 형태만 선택합니다.',
  },
  copyToggle: {
    label: '문구 사용',
    description: '이미지 위에 제목·문구를 함께 노출합니다.',
    disabledHint: '문구를 사용하지 않으면 배너 이미지만 노출됩니다.',
  },
  fields: {
    section: '섹션',
    title: '제목',
    overline: '오버라인 문구',
    menuLabel: '우측 메뉴 라벨',
    buttonLabel: '버튼 문구',
    image: '배너 이미지(대표)',
    link: '링크 URL',
  },
  placeholders: {
    section: '섹션을 선택하세요',
    title: '예: 사무실 이전, 중고 가구로 예산을 아끼세요',
    overline: '예: 신규 입고',
    menuLabel: '예: 중고 가구',
    buttonLabel: '예: 매물 보러가기',
    link: 'https://spaceplanning.ai/used',
  },
  helpers: {
    buttonLabel: '비우면 버튼이 노출되지 않습니다.',
    link: '비우면 배너를 눌러도 이동하지 않습니다.',
  },
  help: {
    title: '도움말',
    banner:
      '섹션은 저장 후 변경할 수 없습니다. 다른 섹션에 노출하려면 해당 섹션 목록에서 새로 등록하세요.',
    copy: '오버라인 문구는 제목 위 작은 글씨로, 우측 메뉴 라벨은 메인 우측 퀵메뉴에 표시됩니다. 제목은 두 줄(60자) 안으로 맞추는 것을 권장합니다.',
  },
  image: {
    removeLabel: '배너 이미지 삭제',
    hint: 'JPG·PNG 이미지 · 최대 10MB',
    dropReplace: '다른 이미지를 끌어다 놓거나 클릭해서 교체하세요',
    dropSelect: '이미지를 끌어다 놓거나 클릭해서 선택하세요',
  },
  visibility: {
    label: '활성화',
    on: 'ON',
    off: 'OFF',
    onDescription: '클라이언트 페이지에 노출됩니다.',
    offDescription: '저장해도 클라이언트 페이지에 노출되지 않습니다.',
  },
  actions: { save: '저장', cancel: '취소', saving: '저장 중…' },
}

/* ── 목데이터 ────────────────────────────────────────────────────────────── */

/** 배너가 붙을 수 있는 섹션 — 목록 탭과 같은 축이다 */
const SECTION_OPTIONS: MainVisualSectionOption[] = [
  { value: 'used', label: '중고' },
  { value: 'rental', label: '렌탈' },
  { value: 'construction', label: '시공' },
]

/** 업로드 제약 — 안내 문구(labels.image.hint)와 DropZone 검증이 같은 상한을 본다 */
const MAX_IMAGE_MB = 10

/** 신규 등록 시작값 */
export const EMPTY_MAIN_VISUAL_VALUE: MainVisualValue = {
  section: null,
  useCopy: true,
  title: '',
  active: true,
}

/* ── 화면 ────────────────────────────────────────────────────────────────── */

export type MainVisualFormProps = {
  value: MainVisualValue
  onChange: (value: MainVisualValue) => void
  /** 섹션 Select 항목 — 기본은 중고/렌탈/시공 */
  sections?: MainVisualSectionOption[]
  errors?: MainVisualErrors
  saving?: boolean
  onSave?: () => void
  onCancel?: () => void
  show?: MainVisualShow
  /** 문구 — 개별 prop(saveLabel·imageHint …)이 있으면 그쪽이 이긴다 */
  labels?: DeepPartialOneLevel<MainVisualFormLabels>
  /** 목록 밀도 — 페이지 리듬을 다른 폼과 맞춘다 */
  density?: 'compact' | 'comfortable'
  maxWidth?: 'md' | 'lg' | 'full'

  /**
   * 올린 이미지의 썸네일 블록(미리보기 + 삭제 버튼). 기본 true.
   * 파일명만 확인하면 되는 좁은 폼이나, 미리보기를 별도 패널에서 띄우는 화면에서 끈다.
   * 끄면 드롭존이 필드 폭을 전부 쓴다(빈 자리가 남지 않는다). 값(value.image)은 그대로 유지된다.
   */
  showPreview?: boolean

  /* ── 아이콘 슬롯 — 없으면 기존 lucide 기본 아이콘 ── */
  /** 썸네일 우상단 삭제(x) */
  removeImageIcon?: ReactNode

  /* ── 문구 (없으면 기존 기본 문구 그대로) ── */
  /** @deprecated labels.image.removeLabel을 쓴다(개별 prop이 우선한다) */
  removeImageLabel?: string
  /** @deprecated labels.image.dropReplace / dropSelect를 쓴다. 주면 이미지 유무와 무관하게 이 문구가 뜬다 */
  dropLabel?: string
  /** @deprecated labels.image.hint를 쓴다 */
  imageHint?: string
  /** @deprecated labels.actions.save를 쓴다 */
  saveLabel?: string
  /** @deprecated labels.actions.saving을 쓴다 */
  savingLabel?: string
  /** @deprecated labels.actions.cancel을 쓴다 */
  cancelLabel?: string
}

/**
 * 메인 비주얼 수정 — AdminFormPage 셸의 얇은 프리셋.
 *
 *   header  : PageHeaderBar('메인 비주얼 수정' + 활성 배지 + [저장])
 *   content : FormSection 4장 (1 배너 구분 / 2 문구·콘텐츠 / 3 이미지 / 4 링크·노출)
 *   footer  : [취소] [저장]
 *
 * 골격·조립·이미지 업로드 블록(썸네일 + 드롭존 + 삭제)은 전부 셸이 갖는다.
 * 여기 남는 건 값 타입 · 필드 선언 · 한국어 문구, 그리고 이 화면만의 조각 둘 —
 * 섹션 하단 도움말(Callout)과 '활성화' 밴드다.
 *
 * 값·에러·핸들러를 모두 props로 받는 제어 컴포넌트다.
 * 카드 번호(1~4)는 고정이다 — 앞 섹션을 꺼도 뒤 번호가 당겨지지 않는다(레퍼런스 화면의 규약).
 */
export function MainVisualForm({
  value,
  onChange,
  sections = SECTION_OPTIONS,
  errors,
  saving = false,
  onSave,
  onCancel,
  show,
  labels,
  density = 'compact',
  maxWidth = 'lg',
  showPreview = true,
  removeImageIcon,
  removeImageLabel,
  dropLabel,
  imageHint,
  saveLabel,
  savingLabel,
  cancelLabel,
}: MainVisualFormProps) {
  // 우선순위: 개별 prop > labels > 기본값. mergeLabels는 undefined를 무시한다.
  const L = mergeLabels(mergeLabels(DEFAULT_MAIN_VISUAL_FORM_LABELS, labels), {
    image: { hint: imageHint, removeLabel: removeImageLabel },
    actions: { save: saveLabel, cancel: cancelLabel, saving: savingLabel },
  })

  const s = { ...DEFAULT_SHOW, ...show }

  const hasImage = value.image != null && value.image !== ''

  // ── 1. 배너 구분 — 노출 위치는 목록 탭에서 정해지므로 여기서는 형태만 고른다 ──
  const bannerFields: AdminFormField<MainVisualValue>[] = []

  if (s.banner && s.sectionField) {
    bannerFields.push({
      kind: 'select',
      key: 'section',
      label: L.fields.section,
      required: true,
      span: 1,
      options: sections,
      placeholder: L.placeholders.section,
    })
  }

  if (s.banner && s.help) {
    // 라벨이 없는 custom은 FieldRow 없이 섹션 본문 한 줄을 통째로 쓴다
    bannerFields.push({
      kind: 'custom',
      key: 'banner-help',
      render: () => (
        <Callout tone="info" title={L.help.title}>
          {L.help.banner}
        </Callout>
      ),
    })
  }

  // ── 2. 문구·콘텐츠 — '문구 사용' 밴드가 OFF면 본문(문구 필드)이 통째로 사라진다 ──
  const copyFields: AdminFormField<MainVisualValue>[] = []

  if (s.content && s.titleField) {
    copyFields.push({
      kind: 'textarea',
      key: 'title',
      label: L.fields.title,
      required: true,
      span: 3,
      placeholder: L.placeholders.title,
      rows: 2,
      maxLength: 60,
      showCounter: true,
    })
  }

  if (s.content && s.overlineField) {
    copyFields.push({
      kind: 'text',
      key: 'overline',
      label: L.fields.overline,
      span: 1,
      placeholder: L.placeholders.overline,
    })
  }

  if (s.content && s.menuLabelField) {
    copyFields.push({
      kind: 'text',
      key: 'menuLabel',
      label: L.fields.menuLabel,
      span: 1,
      placeholder: L.placeholders.menuLabel,
    })
  }

  if (s.content && s.buttonLabelField) {
    copyFields.push({
      kind: 'text',
      key: 'buttonLabel',
      label: L.fields.buttonLabel,
      description: L.helpers.buttonLabel,
      span: 1,
      placeholder: L.placeholders.buttonLabel,
    })
  }

  if (s.content && s.help) {
    copyFields.push({
      kind: 'custom',
      key: 'copy-help',
      render: () => (
        <Callout tone="info" title={L.help.title}>
          {L.help.copy}
        </Callout>
      ),
    })
  }

  // ── 3. 이미지 — 대표 1장. 올린 뒤에는 썸네일 + 삭제(x)가 드롭존 옆에 붙는다 ──
  const imageFields: AdminFormField<MainVisualValue>[] = []

  if (s.image) {
    imageFields.push({
      kind: 'image',
      key: 'image',
      label: L.fields.image,
      required: true,
      layout: 'row',
      ratio: '16x9',
      previewWidth: 200,
      remove: 'round',
      removeLabel: L.image.removeLabel,
      removeIcon: removeImageIcon,
      accept: 'image/jpeg,image/png',
      maxSizeMb: MAX_IMAGE_MB,
      hint: L.image.hint,
      // 드롭존 문구는 이 화면의 톤(weight 400)을 지킨다 — 셸의 기본 라벨 규격보다 약하게 둔다
      dropLabel: (
        <span className={styles.dropLabel}>
          {dropLabel ?? (hasImage ? L.image.dropReplace : L.image.dropSelect)}
        </span>
      ),
      showPreview,
    })
  }

  // ── 4. 링크·노출 ──────────────────────────────────────────────────────────
  const linkFields: AdminFormField<MainVisualValue>[] = []

  if (s.link && s.linkField) {
    linkFields.push({
      kind: 'text',
      key: 'link',
      label: L.fields.link,
      description: L.helpers.link,
      span: 2,
      placeholder: L.placeholders.link,
    })
  }

  if (s.link && s.visibility) {
    /*
     * '활성화'는 섹션 ON/OFF가 아니라 저장되는 값(active)이다.
     * FormSection.toggleable로 걸면 OFF일 때 본문(링크 URL)까지 지워지므로,
     * 같은 밴드 모양만 유지한 채 값 토글로 둔다. 섹션 자체를 지우는 스위치는 show.link다.
     */
    linkFields.push({
      kind: 'custom',
      key: 'visibility',
      render: ({ value: v, patch, disabled }) => (
        <div className={[styles.band, v.active ? styles.bandOn : styles.bandOff].join(' ')}>
          <div className={styles.bandText}>
            <span className={styles.bandLabel}>{L.visibility.label}</span>
            <span className={styles.bandDesc}>
              {v.active ? L.visibility.onDescription : L.visibility.offDescription}
            </span>
          </div>
          <Toggle
            checked={v.active}
            onChange={(active) => patch({ active })}
            size="sm"
            disabled={disabled}
            label={v.active ? L.visibility.on : L.visibility.off}
          />
        </div>
      ),
    })
  }

  return (
    <AdminFormPage<MainVisualValue>
      value={value}
      onChange={onChange}
      errors={errors}
      sections={[
        {
          key: 'banner',
          index: 1,
          title: L.sections.banner,
          description: L.sectionDescriptions.banner,
          fields: bannerFields,
        },
        {
          key: 'copy',
          index: 2,
          title: L.sections.copy,
          toggleable: true,
          toggleLabel: L.copyToggle.label,
          toggleDescription: L.copyToggle.description,
          enabled: value.useCopy,
          onEnabledChange: (useCopy) => onChange({ ...value, useCopy }),
          disabledHint: L.copyToggle.disabledHint,
          fields: copyFields,
        },
        { key: 'image', index: 3, title: L.sections.image, fields: imageFields },
        { key: 'link', index: 4, title: L.sections.link, fields: linkFields },
      ]}
      title={L.title}
      headerBadge={
        value.active
          ? { label: L.status.active, tone: 'success' }
          : { label: L.status.inactive, tone: 'secondary' }
      }
      submitLabel={L.actions.save}
      submittingLabel={L.actions.saving}
      cancelLabel={L.actions.cancel}
      submitting={saving}
      // 저장 중에는 모든 컨트롤이 잠긴다
      disabled={saving}
      onSubmit={onSave}
      onCancel={onCancel}
      density={density}
      maxWidth={maxWidth}
      show={{
        header: s.header,
        headerBadge: s.statusBadge,
        headerSave: s.headerSave,
        footer: s.footer,
      }}
    />
  )
}
