import { useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import {
  AdminFormImageField,
  AdminFormPage,
  type AdminFormField,
} from '../AdminFormPage/AdminFormPage'
import { Toggle } from '../Toggle/Toggle'
import styles from './CategoryForm.module.css'

/** 카테고리 한 건의 값 — 화면이 들고 있는 유일한 상태 */
export type CategoryValue = {
  name: string
  /** true면 이미지 업로드, false면 아이콘(이모지) 선택으로 대체된다 */
  useImage: boolean
  /** 업로드된 이미지 URL(data URL) — 없으면 드롭존이 뜬다 */
  image?: string
  /** useImage=false일 때 고르는 아이콘 */
  emoji?: string
  description?: string
  active: boolean
}

/** 필드별 에러 문구 — 있는 키만 해당 FieldRow가 에러 톤이 된다 */
export type CategoryFormErrors = {
  name?: string
  image?: string
  description?: string
}

/**
 * 섹션·필드 단위 ON/OFF. 기본값은 전부 true이며,
 * false면 해당 영역이 DOM에서 완전히 사라진다(빈 자리·여백·구분선을 남기지 않는다).
 */
export type CategoryFormShow = {
  /** 페이지 헤더(타이틀·설명·저장) */
  header?: boolean
  /** '카테고리 정보' 섹션 카드 전체 */
  info?: boolean
  /** 카테고리명 */
  name?: boolean
  /** 카테고리 이미지 / 아이콘 */
  image?: boolean
  /** 설명 */
  description?: boolean
  /** 활성화 */
  active?: boolean
  /** 하단 [취소] [저장] 바 */
  footer?: boolean
}

export type CategoryFormProps = {
  value: CategoryValue
  onChange: (v: CategoryValue) => void
  /** 헤더 문구 — 등록/수정 화면이 같은 컴포넌트를 쓴다 */
  title?: string
  description?: string
  /** 아이콘 선택 후보 — 생략하면 내부 기본 목록 */
  emojiOptions?: string[]
  errors?: CategoryFormErrors
  onSubmit?: () => void
  onCancel?: () => void
  submitting?: boolean
  submitLabel?: string
  cancelLabel?: string
  show?: CategoryFormShow

  /**
   * 업로드된 이미지의 미리보기 블록(썸네일 + 안내 + 삭제 버튼). 기본 true.
   * 끄면 이미지가 이미 있어도 드롭존(교체 UI)만 남는다 — 목록에서 이미 썸네일을 보여 주는 화면이나,
   * 폼이 좁아 160×160 미리보기가 들어가지 않을 때를 위한 스위치다. 값(value.image)은 유지된다.
   */
  showPreview?: boolean

  /* ── 아이콘 슬롯 — 없으면 기존 lucide 기본 아이콘 ── */
  /** 미리보기 옆 '이미지 삭제' 버튼 아이콘 */
  removeImageIcon?: ReactNode

  /* ── 문구 (없으면 기존 기본 문구 그대로) ── */
  /** 이미지 삭제 버튼 문구 — 기본 '이미지 삭제' */
  removeImageLabel?: string
  /** 업로드 제약 안내 — 기본 '권장 640×640 · JPG/PNG · 2MB 이하' */
  imageHint?: string
  /** 저장 중 버튼 문구 — 기본 '저장 중…' */
  savingLabel?: string
}

/** 기본 아이콘 후보 — 쇼핑몰/시공 카테고리에서 실제로 쓰이는 결 */
const DEFAULT_EMOJIS = ['🛋️', '🏠', '🍽️', '🛏️', '🚿', '💡', '🪴', '🧺', '🎨', '🔧', '📦', '⭐'] as const

/** 업로드 가이드 — 레퍼런스의 이미지 영역 하단 문구 */
const IMAGE_HINT = '권장 640×640 · JPG/PNG · 2MB 이하'

const DEFAULT_SHOW: Required<CategoryFormShow> = {
  header: true,
  info: true,
  name: true,
  image: true,
  description: true,
  active: true,
  footer: true,
}

/** 아이콘(이모지) 선택 — 단일 선택이라 radiogroup 의미를 준다(roving tabindex) */
function EmojiPicker({
  options,
  selected,
  onSelect,
}: {
  options: string[]
  selected?: string
  onSelect: (emoji: string) => void
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  // 선택이 없으면 첫 칸이 탭 진입점이 된다
  const selectedIndex = selected == null ? -1 : options.indexOf(selected)
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0

  const move = (from: number, delta: number) => {
    const next = (from + delta + options.length) % options.length
    onSelect(options[next])
    refs.current[next]?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      move(index, 1)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      move(index, -1)
    }
  }

  return (
    <div className={styles.emojiGrid} role="radiogroup" aria-label="카테고리 아이콘">
      {options.map((emoji, index) => {
        const on = emoji === selected
        return (
          <button
            key={emoji}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={index === activeIndex ? 0 : -1}
            className={[styles.emojiItem, on ? styles.emojiItemOn : ''].filter(Boolean).join(' ')}
            onClick={() => onSelect(emoji)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {emoji}
          </button>
        )
      })}
    </div>
  )
}

/**
 * CategoryForm — 카테고리 등록/수정 화면.
 *
 * 화면 골격(AdminPageLayout · PageHeaderBar · FormSection · FieldRow · sticky 액션 바)과
 * 이미지 업로드/썸네일/삭제는 AdminFormPage 셸이 갖는다.
 * 이 파일에 남는 것은 이 화면만의 것 세 가지뿐이다 —
 *   1) 값 타입    : CategoryValue / CategoryFormErrors
 *   2) 필드 선언  : 카테고리명 · 이미지(또는 아이콘) · 설명 · 활성화
 *   3) 한국어 문구: 타이틀 · 섹션 제목 · 플레이스홀더 · 업로드 안내
 *
 * 두 종류의 ON/OFF가 있다(섞이지 않는다).
 *  1) show — 화면 구성. false면 그 필드가 스키마에서 빠진다. 필드가 전부 꺼지면 셸이 섹션 카드도 지운다.
 *  2) value.useImage — 데이터. 이미지 업로드 영역과 아이콘(이모지) 선택을 **맞바꾼다**(빈 자리 없음).
 */
export function CategoryForm({
  value,
  onChange,
  title = '카테고리 등록',
  description,
  emojiOptions = [...DEFAULT_EMOJIS],
  errors,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = '저장',
  cancelLabel = '취소',
  show,
  showPreview = true,
  removeImageIcon,
  removeImageLabel = '이미지 삭제',
  imageHint = IMAGE_HINT,
  savingLabel = '저장 중…',
}: CategoryFormProps) {
  const s = { ...DEFAULT_SHOW, ...show }

  const fields: AdminFormField<CategoryValue>[] = []

  if (s.name) {
    fields.push({
      kind: 'text',
      key: 'name',
      label: '카테고리명',
      required: true,
      span: 2,
      placeholder: '예: 거실 인테리어',
      maxLength: 30,
    })
  }

  if (s.image) {
    fields.push({
      kind: 'custom',
      key: 'image',
      label: '카테고리 이미지',
      description: '이미지를 쓰지 않으면 아이콘으로 대신 표시됩니다.',
      /*
       * 셸의 image 필드를 그대로 쓰되, 그 위에 '이미지 사용' 스위치를 얹는다 —
       * 스위치가 OFF면 업로드 영역이 통째로 사라지고 아이콘(이모지) 선택이 그 자리를 채운다.
       * 이 '맞바꿈'은 이 화면만의 규약이라 셸에 넣지 않고 여기 남긴다.
       */
      render: ({ value: v, patch }) => (
        <div className={styles.imageField}>
          <div
            className={[styles.switchRow, v.useImage ? styles.switchOn : styles.switchOff].join(' ')}
          >
            <span className={styles.switchLabel}>이미지 사용</span>
            <Toggle
              checked={v.useImage}
              onChange={(useImage) => patch({ useImage })}
              size="sm"
              label={v.useImage ? 'ON' : 'OFF'}
            />
          </div>

          {v.useImage ? (
            <AdminFormImageField
              value={v.image}
              onChange={(image) => patch({ image })}
              showPreview={showPreview}
              ratio="1x1"
              previewWidth={160}
              remove="side"
              removeLabel={removeImageLabel}
              removeIcon={removeImageIcon}
              previewHint={imageHint}
              hint={imageHint}
              accept="image/*"
              maxSizeMb={2}
            />
          ) : (
            <EmojiPicker
              options={emojiOptions}
              selected={v.emoji}
              onSelect={(emoji) => patch({ emoji })}
            />
          )}
        </div>
      ),
    })
  }

  if (s.description) {
    fields.push({
      kind: 'textarea',
      key: 'description',
      label: '설명',
      placeholder: '카테고리를 설명하는 문구를 입력하세요.',
      rows: 4,
      maxLength: 200,
      showCounter: true,
    })
  }

  if (s.active) {
    fields.push({
      kind: 'toggle',
      key: 'active',
      label: '활성화',
      description: '끄면 목록과 메뉴에서 이 카테고리가 노출되지 않습니다.',
    })
  }

  return (
    <AdminFormPage<CategoryValue>
      value={value}
      onChange={onChange}
      errors={errors}
      sections={[
        {
          key: 'info',
          title: '카테고리 정보',
          description: '목록과 상단 메뉴에 노출되는 카테고리의 기본 정보입니다.',
          // show.info=false면 필드를 넘기지 않는다 — 셸이 빈 카드를 그리지 않는다
          fields: s.info ? fields : [],
        },
      ]}
      title={title}
      description={description}
      submitLabel={submitLabel}
      submittingLabel={savingLabel}
      cancelLabel={cancelLabel}
      submitting={submitting}
      onSubmit={onSubmit}
      onCancel={onCancel}
      // 하단 [취소]는 핸들러가 있을 때만 — [저장]은 항상 자리를 지킨다(기존 화면 규약)
      show={{ header: s.header, footer: s.footer, footerCancel: onCancel != null }}
    />
  )
}
