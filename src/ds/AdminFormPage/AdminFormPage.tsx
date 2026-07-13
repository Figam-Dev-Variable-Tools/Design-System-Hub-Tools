import { Fragment } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Trash2, X } from 'lucide-react'
import { mergeLabels, resolveLabel } from '../../shared/labels'
import { Placeholder } from '../../shared/placeholders'
import { AdminPageLayout } from '../AdminPageLayout/AdminPageLayout'
import { Button } from '../Button/Button'
import { DropZone } from '../DropZone/DropZone'
import { FieldRow, type FieldRowLabelPlacement } from '../FieldRow/FieldRow'
import {
  DEFAULT_FORM_SECTION_LABELS,
  FormSection,
  type FormSectionAppearance,
  type FormSectionColumns,
} from '../FormSection/FormSection'
import { Image, type ImageProps } from '../Image/Image'
import { InputBase } from '../InputBase/InputBase'
import { PageHeaderBar, type PageHeaderBarTone } from '../PageHeaderBar/PageHeaderBar'
import { Select, type SelectOption } from '../Select/Select'
import { Textarea } from '../Textarea/Textarea'
import { Toggle } from '../Toggle/Toggle'
// 파일 → data URL 변환은 MainVisualUploader가 이미 갖고 있다(업로드 API 응답 URL 대체용)
import { readFileAsDataUrl } from '../MainVisualUploader/MainVisualUploader'
import styles from './AdminFormPage.module.css'

/*
 * 왜 이 컴포넌트가 있나 —
 * 어드민 폼 화면(카테고리·포트폴리오·메인비주얼…)은 골격이 한 글자도 다르지 않다.
 *   AdminPageLayout → PageHeaderBar(타이틀·배지·저장) → FormSection[] → FieldRow[] → sticky 액션 바
 * 화면마다 진짜로 다른 건 세 가지뿐이다 — 값 타입(V), 필드 목록, 한국어 문구.
 * 그 세 가지만 화면에 남기고 골격·조립·ON/OFF 규약은 전부 이 셸이 갖는다.
 * (AdminListPage가 목록 13종에 대해 하는 일을, 이 셸이 폼 화면에 대해 한다)
 *
 * 값 상태는 셸이 갖지 않는다 — 제어 컴포넌트다(value/onChange를 호출자가 들고 있는다).
 * 셸이 하는 건 '값을 어떤 컨트롤로 그릴지'를 스키마(sections)에서 읽어 조립하는 것뿐이다.
 */

/* ── 필드 ────────────────────────────────────────────────────────────────── */

/** 값(V)에 실제로 존재하는 키만 컨트롤에 물릴 수 있다 — 오타는 타입에서 걸린다 */
type ValueKey<V> = Extract<keyof V, string>

/** 모든 필드가 공유하는 축 — 라벨·설명·필수·열 폭 */
type FieldCommon = {
  /** 값의 키(custom은 React key로만 쓰인다). errors[key]가 있으면 그 행이 에러 톤이 된다 */
  key: string
  /** 컨트롤 아래 회색 보조 설명(FieldRow). error가 있으면 에러 문구가 이 자리를 대신한다 */
  description?: string
  /** 라벨 옆 * 표시 + 컨트롤의 required 속성 */
  required?: boolean
  /** FormSection 본문(3열 그리드) 기준 점유 열 수. 생략하면 한 줄 전체 */
  span?: 1 | 2 | 3
  /** 컨트롤 자체가 갖는 보조 문구(image의 DropZone hint). FieldRow의 description과는 다른 자리다 */
  hint?: string
  /** 이 필드만 잠근다 — 폼 전체를 잠그는 건 AdminFormPage의 disabled */
  disabled?: boolean
}

export type AdminFormTextField<V> = FieldCommon & {
  kind: 'text'
  key: ValueKey<V>
  label: string
  placeholder?: string
  maxLength?: number
  showCounter?: boolean
  type?: 'text' | 'password' | 'email' | 'search' | 'tel'
}

export type AdminFormTextareaField<V> = FieldCommon & {
  kind: 'textarea'
  key: ValueKey<V>
  label: string
  placeholder?: string
  rows?: number
  maxLength?: number
  showCounter?: boolean
}

export type AdminFormSelectField<V> = FieldCommon & {
  kind: 'select'
  key: ValueKey<V>
  label: string
  options: SelectOption[]
  placeholder?: string
}

export type AdminFormToggleField<V> = FieldCommon & {
  kind: 'toggle'
  key: ValueKey<V>
  label: string
  size?: 'sm' | 'md'
  /** 스위치 옆 문구 — Toggle은 label이 곧 접근성 이름이자 상태 표시다 */
  onLabel?: string
  offLabel?: string
}

/** 썸네일 배치 — swap: 이미지가 있으면 드롭존을 대체 / row: 썸네일이 드롭존 왼쪽에 붙는다 */
export type AdminFormImageLayout = 'swap' | 'row'

/** 삭제 버튼 — round·square: 썸네일 우상단 오버레이 / side: 썸네일 옆 라벨 버튼 */
export type AdminFormImageRemove = 'round' | 'square' | 'side'

export type AdminFormImageField<V> = FieldCommon & {
  kind: 'image'
  key: ValueKey<V>
  label: string
  layout?: AdminFormImageLayout
  ratio?: ImageProps['ratio']
  /** 썸네일 폭(px) — Image의 기본 상한 360을 열 폭에 맞춰 푼다 */
  previewWidth?: number
  /** remove='side'일 때 삭제 버튼 위에 붙는 안내(업로드 제약 등) */
  previewHint?: string
  alt?: string
  remove?: AdminFormImageRemove
  removeLabel?: string
  removeIcon?: ReactNode
  accept?: string
  maxSizeMb?: number
  /**
   * 드롭존 안 문구. 주면 기본 내용(파일 아이콘 + 기본 라벨) 대신 '이미지 Placeholder + 이 문구'를 그린다.
   * ReactNode를 주면 그대로 쓴다 — 문구 톤을 화면이 직접 잡아야 할 때의 탈출구다.
   */
  dropLabel?: ReactNode
  /** 미리보기 ON/OFF (기본 true). false면 이미지가 있어도 드롭존(교체 UI)만 남는다 — 값은 유지된다 */
  showPreview?: boolean
}

/** 셸이 모르는 컨트롤(에디터·아이콘 피커·안내 배너…)의 탈출구 */
export type AdminFormCustomField<V> = FieldCommon & {
  kind: 'custom'
  /** 없으면 FieldRow 없이 그대로 그린다 — 섹션 본문 한 줄을 통째로 쓰는 Callout·밴드용 */
  label?: string
  render: (ctx: AdminFormFieldContext<V>) => ReactNode
}

export type AdminFormField<V> =
  | AdminFormTextField<V>
  | AdminFormTextareaField<V>
  | AdminFormSelectField<V>
  | AdminFormToggleField<V>
  | AdminFormImageField<V>
  | AdminFormCustomField<V>

/** custom.render가 받는 통로 — 값 읽기·부분 수정·잠금 상태 */
export type AdminFormFieldContext<V> = {
  value: V
  /** 값 일부만 바꾼다 — onChange({ ...value, ...next }) */
  patch: (next: Partial<V>) => void
  errors?: Partial<Record<keyof V, string>>
  /** 폼이 잠겼는가(저장 중 등) — 컨트롤에 그대로 물린다 */
  disabled: boolean
}

/* ── 섹션 ────────────────────────────────────────────────────────────────── */

export type AdminFormSection<V> = {
  key: string
  title?: string
  description?: string
  /** 이 섹션만 열 수를 바꾼다 — 없으면 폼 전체 columns를 따른다 */
  columns?: FormSectionColumns
  /** 이 섹션만 크롬을 바꾼다 — 없으면 폼 전체 sectionAppearance를 따른다 */
  appearance?: FormSectionAppearance
  /**
   * 카드 번호. 주지 않으면 '보이는 섹션' 순서대로 1, 2, 3…으로 다시 매긴다
   * (앞 섹션이 꺼지면 뒷 섹션이 1번이 된다). 번호를 고정해야 하면 값을 주고, 없애려면 null.
   */
  index?: number | null
  /** 섹션 자체를 켜고 끄는 밴드 스위치 — 꺼지면 본문(fields)이 DOM에서 사라진다 */
  toggleable?: boolean
  enabled?: boolean
  onEnabledChange?: (v: boolean) => void
  toggleLabel?: string
  toggleDescription?: string
  disabledHint?: string
  /** loading일 때 본문 자리에 대신 그릴 것(Skeleton 등). 없으면 loading이어도 필드를 그대로 그린다 */
  skeleton?: ReactNode
  /** 이 섹션이 그리는 필드 — 비면 카드 자체를 그리지 않는다(빈 카드를 남기지 않는다) */
  fields: AdminFormField<V>[]
}

/* ── ON/OFF ──────────────────────────────────────────────────────────────── */

/**
 * 페이지 크롬 ON/OFF — 전부 기본 true(오너 확정 규약).
 * false면 그 요소가 DOM에서 통째로 사라진다(빈 자리·여백·구분선이 남지 않는다).
 * 섹션·필드 단위 ON/OFF는 여기가 아니다 — 화면이 sections/fields 배열을 걸러서 넘긴다.
 */
export type AdminFormPageShow = {
  /** 페이지 헤더(PageHeaderBar) 전체 */
  header?: boolean
  /** 헤더의 설명 줄 */
  headerDescription?: boolean
  /** 헤더의 상태 배지 */
  headerBadge?: boolean
  /** 헤더 우측 [저장] */
  headerSave?: boolean
  /** 하단 액션 바 — 두 버튼이 모두 꺼지면 바도 사라진다 */
  footer?: boolean
  /** 하단 [취소] */
  footerCancel?: boolean
  /** 하단 [저장] */
  footerSubmit?: boolean
}

/**
 * show 기본값 — 전부 true.
 * 스프레드로 합치면 `show={{ header: undefined }}` 같은 명시적 undefined가 기본값을 덮어써
 * 헤더가 통째로 사라진다 — 그래서 키마다 ?? true 로 푼다(AdminListPage와 같은 규약).
 */
function resolveShow(show: AdminFormPageShow = {}): Required<AdminFormPageShow> {
  return {
    header: show.header ?? true,
    headerDescription: show.headerDescription ?? true,
    headerBadge: show.headerBadge ?? true,
    headerSave: show.headerSave ?? true,
    footer: show.footer ?? true,
    footerCancel: show.footerCancel ?? true,
    footerSubmit: show.footerSubmit ?? true,
  }
}

/* ── 이미지 필드 ─────────────────────────────────────────────────────────── */

export type AdminFormImageFieldProps = {
  /** 이미지 URL(data URL 포함) — 없으면 드롭존이 뜬다 */
  value?: string
  /** 업로드하면 data URL, 삭제하면 undefined */
  onChange: (next: string | undefined) => void
  showPreview?: boolean
  layout?: AdminFormImageLayout
  ratio?: ImageProps['ratio']
  previewWidth?: number
  previewHint?: string
  alt?: string
  remove?: AdminFormImageRemove
  removeLabel?: string
  removeIcon?: ReactNode
  accept?: string
  maxSizeMb?: number
  /** 드롭존 하단 제약 안내 */
  hint?: string
  dropLabel?: ReactNode
  disabled?: boolean
}

/**
 * 업로드 → 썸네일 → 삭제를 한 자리에서 처리하는 이미지 필드.
 *
 * FieldSpec의 kind='image'가 이걸 그린다. 따로 export하는 이유는,
 * 카테고리 폼처럼 이 블록을 다른 컨트롤(이미지 사용 스위치·아이콘 선택)과 맞바꿔야 하는 화면이
 * custom.render 안에서 같은 블록을 다시 만들지 않고 그대로 쓰기 위해서다.
 */
export function AdminFormImageField({
  value,
  onChange,
  showPreview = true,
  layout = 'swap',
  ratio = '16x9',
  previewWidth = 160,
  previewHint,
  alt = '',
  remove = 'square',
  removeLabel = '이미지 삭제',
  removeIcon,
  accept,
  maxSizeMb,
  hint,
  dropLabel,
  disabled = false,
}: AdminFormImageFieldProps) {
  const hasImage = value != null && value !== ''
  // 미리보기가 꺼져 있으면 이미지가 있어도 드롭존(교체 UI)만 남는다
  const previewVisible = showPreview && hasImage

  const pick = async (files: File[]) => {
    const file = files[0]
    if (file == null) return
    onChange(await readFileAsDataUrl(file))
  }

  const dropZone = (
    <DropZone
      onFiles={(files) => void pick(files)}
      accept={accept}
      maxSizeMb={maxSizeMb}
      hint={hint}
      disabled={disabled}
    >
      {/* dropLabel이 없으면 children을 넘기지 않는다 — DropZone의 기본 내용이 그대로 뜬다 */}
      {dropLabel != null ? (
        <>
          {/* 빈/예외 그림은 공용 Placeholder로 통일한다 */}
          <Placeholder kind="image" size={32} />
          {typeof dropLabel === 'string' ? (
            <span className={styles.dropLabel}>{dropLabel}</span>
          ) : (
            dropLabel
          )}
        </>
      ) : undefined}
    </DropZone>
  )

  /*
   * 삭제 — 알맹이는 공용 Button이다.
   *   side          : 썸네일 옆에 서는 라벨 버튼(error 톤 outline)
   *   round·square  : 썸네일 우상단 오버레이. 라벨은 iconOnly로 화면에서만 감춰지고
   *                   버튼의 접근성 이름으로 남는다. 래퍼는 Button에 없는 축(절대 배치·규격)만 맡는다.
   */
  const removeButton =
    remove === 'side' ? (
      <Button
        variant="error"
        appearance="outline"
        size="sm"
        label={removeLabel}
        showLeftIcon
        leftIcon={removeIcon ?? <Trash2 size={14} aria-hidden="true" />}
        disabled={disabled}
        onClick={() => onChange(undefined)}
      />
    ) : (
      <span className={remove === 'round' ? styles.removeRound : styles.removeSquare}>
        <Button
          variant="secondary"
          appearance="outline"
          size="sm"
          label={removeLabel}
          iconOnly
          showLeftIcon
          leftIcon={removeIcon ?? <X size={remove === 'round' ? 14 : 12} aria-hidden="true" />}
          disabled={disabled}
          onClick={() => onChange(undefined)}
        />
      </span>
    )

  // 썸네일 폭은 CSS 변수로 넘긴다 — 미디어쿼리(좁은 폭에서 100%)가 이길 수 있게 인라인 width를 쓰지 않는다
  const vars = { '--afp-preview-w': `${previewWidth}px` } as CSSProperties

  const preview =
    remove === 'side' ? (
      <div className={styles.preview}>
        <span className={styles.previewImg} style={vars}>
          <Image src={value} alt={alt} ratio={ratio} />
        </span>
        <div className={styles.previewSide}>
          {previewHint != null && <p className={styles.previewHint}>{previewHint}</p>}
          {removeButton}
        </div>
      </div>
    ) : (
      <div className={styles.thumb} style={vars}>
        <Image src={value} alt={alt} ratio={ratio} />
        {removeButton}
      </div>
    )

  // row — 썸네일과 드롭존이 한 줄에 선다(교체가 잦은 배너). 썸네일이 없으면 드롭존이 폭을 전부 쓴다
  if (layout === 'row') {
    return (
      <div className={styles.imageRow}>
        {previewVisible && preview}
        <div className={styles.drop}>{dropZone}</div>
      </div>
    )
  }

  // swap — 이미지가 있으면 썸네일이 드롭존 자리를 대신한다(지우면 다시 드롭존)
  return previewVisible ? preview : dropZone
}

/* ── 문구 ────────────────────────────────────────────────────────────────── */

/**
 * 셸이 직접 그리는 문구.
 * 확인창·표·검색처럼 공용 표면이 없어(폼은 제출/취소/스위치가 전부다) 공용 타입에서 가져올 것이 없다 —
 * 대신 여기서 정한 이름을 자식(FormSection)이 그대로 받아 쓴다(같은 문구를 두 이름으로 만들지 않는다).
 */
export type AdminFormPageLabels = {
  /** 제출 버튼 — 주면 mode와 무관하게 이 문구를 쓴다 */
  submit?: string
  /** mode별 제출 문구 — 기본 create='등록' / edit='저장' */
  submitByMode?: { create?: string; edit?: string }
  /** 저장 중 제출 버튼 — 기본 '저장 중…' */
  submitting?: string
  /** 취소 버튼 — 기본 '취소' */
  cancel?: string
  /**
   * 스위치 문구 — 기본 'ON'/'OFF'. toggle 필드와 섹션 밴드가 함께 쓴다.
   * (필드마다 onLabel/offLabel을 반복해 적던 것을 폼 전체 기본값 하나로 대신한다)
   */
  toggle?: { on?: string; off?: string }
  /** image 필드 기본값 — 필드의 removeLabel/dropLabel/hint가 이긴다 */
  image?: { removeLabel?: string; dropLabel?: string; hint?: string }
}

/*
 * 기본 문구 값의 단일 출처 — Button.label처럼 string이 필수인 자리의 최종 폴백으로도 쓰인다.
 */
const DEFAULT_SUBMIT_CREATE = '등록'
const DEFAULT_SUBMIT_EDIT = '저장'
const DEFAULT_SUBMITTING_LABEL = '저장 중…'
const DEFAULT_CANCEL_LABEL = '취소'

export const DEFAULT_ADMIN_FORM_PAGE_LABELS: AdminFormPageLabels = {
  submitByMode: { create: DEFAULT_SUBMIT_CREATE, edit: DEFAULT_SUBMIT_EDIT },
  submitting: DEFAULT_SUBMITTING_LABEL,
  cancel: DEFAULT_CANCEL_LABEL,
  // 'ON'/'OFF'의 단일 출처는 FormSection이다 — 같은 값을 여기 다시 적지 않는다
  toggle: {
    on: DEFAULT_FORM_SECTION_LABELS.toggle.on,
    off: DEFAULT_FORM_SECTION_LABELS.toggle.off,
  },
  // image 기본 문구('이미지 삭제' 등)는 AdminFormImageField가 갖는다 — 여기서 비워 두면 그 기본값이 그대로 쓰인다
}

/* ── 화면 ────────────────────────────────────────────────────────────────── */

export type AdminFormPageProps<V extends object> = {
  /** 폼 값 — 셸은 상태를 갖지 않는다(제어 컴포넌트) */
  value: V
  onChange: (next: V) => void
  /** 필드별 에러 문구 — 있는 키만 그 FieldRow가 에러 톤이 된다 */
  errors?: Partial<Record<keyof V, string>>
  /** 섹션·필드 스키마 — 화면이 진짜로 갖는 유일한 선언 */
  sections: AdminFormSection<V>[]

  /* ── 헤더 ── */
  /** 등록/수정 — 기본 제출 문구('등록'/'저장')를 가른다 */
  mode?: 'create' | 'edit'
  title?: string
  description?: string
  /** 제목 옆 상태 배지 */
  headerBadge?: { label: string; tone?: PageHeaderBarTone }
  /** 헤더 [저장] 왼쪽에 붙는 추가 액션 */
  headerActions?: ReactNode

  /* ── 액션 ── */
  /**
   * 제출 버튼 문구 (기본: mode='edit'이면 '저장', 아니면 '등록')
   * @deprecated labels.submit / labels.submitByMode를 쓴다(개별 prop이 이긴다)
   */
  submitLabel?: string
  /**
   * 취소 버튼 문구 (기본 '취소')
   * @deprecated labels.cancel을 쓴다(개별 prop이 이긴다)
   */
  cancelLabel?: string
  /**
   * 저장 중 제출 버튼 문구 — 기본 '저장 중…'
   * @deprecated labels.submitting을 쓴다(개별 prop이 이긴다)
   */
  submittingLabel?: string
  /** 저장 중 — 헤더·하단 버튼이 잠긴다 */
  submitting?: boolean
  /** 조회 중 — 섹션 본문을 section.skeleton으로 대체하고 제출을 잠근다 */
  loading?: boolean
  /**
   * 모든 컨트롤을 잠근다. 기본 false —
   * '저장 중에 입력을 잠글지'는 화면 규약이라 셸이 정하지 않는다(disabled={submitting}처럼 명시한다).
   */
  disabled?: boolean
  onSubmit?: () => void
  onCancel?: () => void

  /* ── 골격 ── */
  show?: AdminFormPageShow
  /** 하단 액션 바를 화면 아래에 붙인다(기본 true). false면 본문 끝에 그대로 놓인다 */
  stickyFooter?: boolean
  density?: 'compact' | 'comfortable'
  maxWidth?: 'md' | 'lg' | 'full'
  /**
   * 좌측 레일 — FormAnchorNav처럼 긴 폼의 앵커 내비.
   * 레이아웃에는 있던 자리인데 셸이 통과시키지 않아 그런 화면은 셸을 못 쓰고 레이아웃을 직접 조립하고 있었다.
   */
  side?: ReactNode
  /** 좌측 레일 폭 (기본 240) */
  sideWidth?: number
  /** 우측 레일 — MobilePreview 등 편집+미리보기 화면 */
  aside?: ReactNode
  /** 우측 레일 폭 (기본 360) */
  asideWidth?: number
  /** 우측 레일을 스크롤에 고정 (기본 true) */
  asideSticky?: boolean
  /** 섹션 본문 그리드 열 수 (기본 3) — 섹션별로 section.columns가 이긴다 */
  columns?: FormSectionColumns
  /** 섹션 크롬 (기본 card) — 섹션별로 section.appearance가 이긴다 */
  sectionAppearance?: FormSectionAppearance
  /** 필드 라벨 자리 (기본 top) — left는 어드민 설정 화면의 2열 폼 */
  labelPlacement?: FieldRowLabelPlacement
  /** labelPlacement='left'의 라벨 열 폭(px) */
  labelWidth?: number

  /** 문구 통로 — 개별 prop > labels.* > 기본값 */
  labels?: AdminFormPageLabels
}

/**
 * AdminFormPage — 어드민 폼 화면의 공용 셸.
 *
 *   header   : PageHeaderBar — title · description · badge · headerActions · [저장]   (show.header)
 *   content  : FormSection[] — 스키마의 섹션 순서대로. 필드가 없는 섹션은 카드째 빠진다
 *   footer   : [취소] [저장] — AdminPageLayout의 sticky 액션 바                        (show.footer)
 *
 * 값은 호출자가 갖는다. 셸은 sections 스키마를 읽어 FieldRow + 컨트롤로 조립하고,
 * 값 갱신은 onChange({ ...value, [key]: next })로 되돌려 준다.
 * 셸이 모르는 컨트롤은 kind='custom'으로 넘긴다 — 라벨이 없으면 FieldRow 없이 한 줄을 통째로 쓴다.
 */
export function AdminFormPage<V extends object>({
  value,
  onChange,
  errors,
  sections,
  mode = 'create',
  title,
  description,
  headerBadge,
  headerActions,
  submitLabel,
  cancelLabel,
  submittingLabel,
  submitting = false,
  loading = false,
  disabled = false,
  onSubmit,
  onCancel,
  show,
  stickyFooter = true,
  density = 'compact',
  maxWidth = 'lg',
  side,
  sideWidth,
  aside,
  asideWidth,
  asideSticky,
  columns = 3,
  sectionAppearance = 'card',
  labelPlacement = 'top',
  labelWidth,
  labels,
}: AdminFormPageProps<V>) {
  const on = resolveShow(show)
  const L = mergeLabels(DEFAULT_ADMIN_FORM_PAGE_LABELS, labels)

  const patch = (next: Partial<V>) => onChange({ ...value, ...next })
  const setField = (key: string, next: unknown) => patch({ [key]: next } as Partial<V>)

  const ctx: AdminFormFieldContext<V> = { value, patch, errors, disabled }

  // 값·에러를 문자열 키로 읽기 위한 통로(스키마의 key는 V의 키다 — 캐스팅은 여기 한 곳뿐이다)
  const bag = value as Record<string, unknown>
  const errorOf = (key: string): string | undefined =>
    (errors as Record<string, string | undefined> | undefined)?.[key]

  // 조회 중에도 액션 버튼은 남기되 잠근다
  const locked = submitting || loading

  // 개별 prop > labels.* > 기본값 (기존 화면은 개별 prop만 쓰므로 화면이 바뀌지 않는다)
  const modeSubmit =
    mode === 'edit'
      ? (L.submitByMode?.edit ?? DEFAULT_SUBMIT_EDIT)
      : (L.submitByMode?.create ?? DEFAULT_SUBMIT_CREATE)
  const submitDone = resolveLabel(submitLabel, L.submit) ?? modeSubmit
  const submittingText = resolveLabel(submittingLabel, L.submitting) ?? DEFAULT_SUBMITTING_LABEL
  const cancelText = resolveLabel(cancelLabel, L.cancel) ?? DEFAULT_CANCEL_LABEL
  const submitText = submitting ? submittingText : submitDone

  const saveButton = (
    <Button variant="primary" size="md" label={submitText} disabled={locked} onClick={onSubmit} />
  )

  const cancelButton = (
    <Button
      variant="secondary"
      appearance="outline"
      size="md"
      label={cancelText}
      disabled={submitting}
      onClick={onCancel}
    />
  )

  // ── 필드 한 칸 ────────────────────────────────────────────────────────────
  const renderControl = (field: AdminFormField<V>): ReactNode => {
    const off = disabled || (field.disabled ?? false)
    const invalid = errorOf(field.key) != null

    if (field.kind === 'text') {
      const raw = bag[field.key]
      return (
        <InputBase
          value={typeof raw === 'string' ? raw : ''}
          onChange={(next) => setField(field.key, next)}
          placeholder={field.placeholder}
          type={field.type}
          maxLength={field.maxLength}
          showCounter={field.showCounter}
          required={field.required}
          helperText={field.hint}
          error={invalid}
          disabled={off}
        />
      )
    }

    if (field.kind === 'textarea') {
      const raw = bag[field.key]
      return (
        <Textarea
          value={typeof raw === 'string' ? raw : ''}
          onChange={(next) => setField(field.key, next)}
          placeholder={field.placeholder}
          rows={field.rows}
          maxLength={field.maxLength}
          showCounter={field.showCounter}
          required={field.required}
          helperText={field.hint}
          error={invalid}
          disabled={off}
        />
      )
    }

    if (field.kind === 'select') {
      const raw = bag[field.key]
      return (
        <Select
          value={typeof raw === 'string' ? raw : null}
          onChange={(next) => setField(field.key, next)}
          options={field.options}
          placeholder={field.placeholder}
          helperText={field.hint}
          error={invalid}
          disabled={off}
        />
      )
    }

    if (field.kind === 'toggle') {
      const checked = bag[field.key] === true
      // 필드의 onLabel/offLabel > 폼 전체 labels.toggle > 기본 'ON'/'OFF'
      return (
        <Toggle
          checked={checked}
          onChange={(next) => setField(field.key, next)}
          size={field.size}
          disabled={off}
          label={
            checked
              ? resolveLabel(field.onLabel, L.toggle?.on)
              : resolveLabel(field.offLabel, L.toggle?.off)
          }
        />
      )
    }

    if (field.kind === 'image') {
      const raw = bag[field.key]
      return (
        <AdminFormImageField
          value={typeof raw === 'string' ? raw : undefined}
          onChange={(next) => setField(field.key, next)}
          showPreview={field.showPreview}
          layout={field.layout}
          ratio={field.ratio}
          previewWidth={field.previewWidth}
          previewHint={field.previewHint}
          alt={field.alt}
          remove={field.remove}
          // 필드 선언 > 폼 전체 labels.image > AdminFormImageField의 기본값
          removeLabel={resolveLabel(field.removeLabel, L.image?.removeLabel)}
          removeIcon={field.removeIcon}
          accept={field.accept}
          maxSizeMb={field.maxSizeMb}
          hint={resolveLabel(field.hint, L.image?.hint)}
          dropLabel={resolveLabel(field.dropLabel, L.image?.dropLabel)}
          disabled={off}
        />
      )
    }

    return field.render({ ...ctx, disabled: off })
  }

  const renderField = (field: AdminFormField<V>): ReactNode => {
    // 라벨이 없는 custom은 FieldRow 없이 그대로 — 섹션 본문 3열 그리드에서 한 줄을 통째로 쓴다
    // (래퍼를 씌우지 않는다. Callout·밴드가 그리드의 직계 자식이어야 기존 마크업과 같다)
    if (field.kind === 'custom' && field.label == null) {
      return <Fragment key={field.key}>{renderControl(field)}</Fragment>
    }

    const label = field.kind === 'custom' ? (field.label ?? '') : field.label

    return (
      <FieldRow
        key={field.key}
        label={label}
        required={field.required}
        description={field.description}
        error={errorOf(field.key)}
        span={field.span}
        labelPlacement={labelPlacement}
        labelWidth={labelWidth}
      >
        {renderControl(field)}
      </FieldRow>
    )
  }

  // ── 섹션 ──────────────────────────────────────────────────────────────────
  // 필드가 하나도 없는 섹션은 카드째로 지운다 — 빈 카드가 남으면 실패다
  const visible = sections.filter((section) => section.fields.length > 0)

  // 카드 번호는 '보이는 섹션' 기준으로 다시 매긴다(index를 직접 주면 그 값이 이긴다)
  let counter = 0

  const cards = visible.map((section) => {
    counter += 1
    const index = section.index === undefined ? counter : section.index

    return (
      <FormSection
        key={section.key}
        index={index ?? undefined}
        title={section.title ?? ''}
        description={section.description}
        toggleable={section.toggleable}
        enabled={section.enabled}
        onEnabledChange={section.onEnabledChange}
        toggleLabel={section.toggleLabel}
        toggleDescription={section.toggleDescription}
        disabledHint={section.disabledHint}
        columns={section.columns ?? columns}
        appearance={section.appearance ?? sectionAppearance}
        // 밴드 스위치 문구는 폼 전체 labels.toggle을 그대로 통과시킨다(같은 문구를 두 번 선언하지 않는다)
        labels={{ toggle: L.toggle }}
      >
        {loading && section.skeleton != null
          ? section.skeleton
          : section.fields.map((field) => renderField(field))}
      </FormSection>
    )
  })

  // ── 액션 바 ───────────────────────────────────────────────────────────────
  // 버튼이 하나도 없으면 바 자체를 그리지 않는다(빈 보더가 남지 않는다)
  const footerCancel = on.footerCancel
  const footerSubmit = on.footerSubmit
  const footerVisible = on.footer && (footerCancel || footerSubmit)

  const actions = (
    <>
      {footerCancel && cancelButton}
      {footerSubmit && saveButton}
    </>
  )

  return (
    <AdminPageLayout
      maxWidth={maxWidth}
      density={density}
      side={side}
      sideWidth={sideWidth}
      aside={aside}
      asideWidth={asideWidth}
      asideSticky={asideSticky}
      // sticky가 아니면 액션 바를 본문 끝(아래)에 그대로 놓는다 — 레이아웃 슬롯은 비운다
      footer={footerVisible && stickyFooter ? actions : undefined}
    >
      {/* 헤더 슬롯은 PageHeaderBar가 통째로 맡는다 — AdminPageLayout의 title/headerActions는 비운다 */}
      {on.header && (
        <PageHeaderBar
          title={title}
          description={on.headerDescription ? description : undefined}
          badge={on.headerBadge ? headerBadge : undefined}
          actions={
            headerActions != null || on.headerSave ? (
              <>
                {headerActions}
                {on.headerSave && saveButton}
              </>
            ) : undefined
          }
        />
      )}

      {cards}

      {footerVisible && !stickyFooter && <div className={styles.actions}>{actions}</div>}
    </AdminPageLayout>
  )
}
