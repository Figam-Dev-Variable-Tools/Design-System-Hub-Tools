import type { ReactNode } from 'react'
import { AdminFormPage, type AdminFormField } from '../AdminFormPage/AdminFormPage'
import { Callout } from '../Callout/Callout'
import { Toggle } from '../Toggle/Toggle'
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

/* ── 목데이터 ────────────────────────────────────────────────────────────── */

/** 배너가 붙을 수 있는 섹션 — 목록 탭과 같은 축이다 */
const SECTION_OPTIONS: MainVisualSectionOption[] = [
  { value: 'used', label: '중고' },
  { value: 'rental', label: '렌탈' },
  { value: 'construction', label: '시공' },
]

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
  /** 썸네일 삭제 버튼의 접근성 이름 — 기본 '배너 이미지 삭제' */
  removeImageLabel?: string
  /** 드롭존 안내 문구 — 기본은 이미지 유무에 따라 '교체/선택' 문구가 갈린다 */
  dropLabel?: string
  /** 드롭존 하단 제약 안내 — 기본 'JPG·PNG 이미지 · 최대 10MB' */
  imageHint?: string
  /** 저장 버튼 — 기본 '저장' */
  saveLabel?: string
  /** 저장 중 버튼 문구 — 기본 '저장 중…' */
  savingLabel?: string
  /** 하단 취소 버튼 — 기본 '취소' */
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
  showPreview = true,
  removeImageIcon,
  removeImageLabel = '배너 이미지 삭제',
  dropLabel,
  imageHint = 'JPG·PNG 이미지 · 최대 10MB',
  saveLabel = '저장',
  savingLabel = '저장 중…',
  cancelLabel = '취소',
}: MainVisualFormProps) {
  const s = { ...DEFAULT_SHOW, ...show }

  const hasImage = value.image != null && value.image !== ''

  // ── 1. 배너 구분 — 노출 위치는 목록 탭에서 정해지므로 여기서는 형태만 고른다 ──
  const bannerFields: AdminFormField<MainVisualValue>[] = []

  if (s.banner && s.sectionField) {
    bannerFields.push({
      kind: 'select',
      key: 'section',
      label: '섹션',
      required: true,
      span: 1,
      options: sections,
      placeholder: '섹션을 선택하세요',
    })
  }

  if (s.banner && s.help) {
    // 라벨이 없는 custom은 FieldRow 없이 섹션 본문 한 줄을 통째로 쓴다
    bannerFields.push({
      kind: 'custom',
      key: 'banner-help',
      render: () => (
        <Callout tone="info" title="도움말">
          섹션은 저장 후 변경할 수 없습니다. 다른 섹션에 노출하려면 해당 섹션 목록에서 새로
          등록하세요.
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
      label: '제목',
      required: true,
      span: 3,
      placeholder: '예: 사무실 이전, 중고 가구로 예산을 아끼세요',
      rows: 2,
      maxLength: 60,
      showCounter: true,
    })
  }

  if (s.content && s.overlineField) {
    copyFields.push({
      kind: 'text',
      key: 'overline',
      label: '오버라인 문구',
      span: 1,
      placeholder: '예: 신규 입고',
    })
  }

  if (s.content && s.menuLabelField) {
    copyFields.push({
      kind: 'text',
      key: 'menuLabel',
      label: '우측 메뉴 라벨',
      span: 1,
      placeholder: '예: 중고 가구',
    })
  }

  if (s.content && s.buttonLabelField) {
    copyFields.push({
      kind: 'text',
      key: 'buttonLabel',
      label: '버튼 문구',
      description: '비우면 버튼이 노출되지 않습니다.',
      span: 1,
      placeholder: '예: 매물 보러가기',
    })
  }

  if (s.content && s.help) {
    copyFields.push({
      kind: 'custom',
      key: 'copy-help',
      render: () => (
        <Callout tone="info" title="도움말">
          오버라인 문구는 제목 위 작은 글씨로, 우측 메뉴 라벨은 메인 우측 퀵메뉴에 표시됩니다.
          제목은 두 줄(60자) 안으로 맞추는 것을 권장합니다.
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
      label: '배너 이미지(대표)',
      required: true,
      layout: 'row',
      ratio: '16x9',
      previewWidth: 200,
      remove: 'round',
      removeLabel: removeImageLabel,
      removeIcon: removeImageIcon,
      accept: 'image/jpeg,image/png',
      maxSizeMb: 10,
      hint: imageHint,
      // 드롭존 문구는 이 화면의 톤(weight 400)을 지킨다 — 셸의 기본 라벨 규격보다 약하게 둔다
      dropLabel: (
        <span className={styles.dropLabel}>
          {dropLabel ??
            (hasImage
              ? '다른 이미지를 끌어다 놓거나 클릭해서 교체하세요'
              : '이미지를 끌어다 놓거나 클릭해서 선택하세요')}
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
      label: '링크 URL',
      description: '비우면 배너를 눌러도 이동하지 않습니다.',
      span: 2,
      placeholder: 'https://spaceplanning.ai/used',
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
            <span className={styles.bandLabel}>활성화</span>
            <span className={styles.bandDesc}>
              {v.active
                ? '클라이언트 페이지에 노출됩니다.'
                : '저장해도 클라이언트 페이지에 노출되지 않습니다.'}
            </span>
          </div>
          <Toggle
            checked={v.active}
            onChange={(active) => patch({ active })}
            size="sm"
            disabled={disabled}
            label={v.active ? 'ON' : 'OFF'}
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
          title: '배너 구분',
          description:
            '노출 위치(섹션)는 목록 탭에서 정해지며 고정됩니다. 배너 형태만 선택합니다.',
          fields: bannerFields,
        },
        {
          key: 'copy',
          index: 2,
          title: '문구·콘텐츠',
          toggleable: true,
          toggleLabel: '문구 사용',
          toggleDescription: '이미지 위에 제목·문구를 함께 노출합니다.',
          enabled: value.useCopy,
          onEnabledChange: (useCopy) => onChange({ ...value, useCopy }),
          disabledHint: '문구를 사용하지 않으면 배너 이미지만 노출됩니다.',
          fields: copyFields,
        },
        { key: 'image', index: 3, title: '이미지', fields: imageFields },
        { key: 'link', index: 4, title: '링크·노출', fields: linkFields },
      ]}
      title="메인 비주얼 수정"
      headerBadge={
        value.active
          ? { label: '활성', tone: 'success' }
          : { label: '비활성', tone: 'secondary' }
      }
      submitLabel={saveLabel}
      submittingLabel={savingLabel}
      cancelLabel={cancelLabel}
      submitting={saving}
      // 저장 중에는 모든 컨트롤이 잠긴다
      disabled={saving}
      onSubmit={onSave}
      onCancel={onCancel}
      show={{
        header: s.header,
        headerBadge: s.statusBadge,
        headerSave: s.headerSave,
        footer: s.footer,
      }}
    />
  )
}
