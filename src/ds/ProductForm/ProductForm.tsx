import type { ReactNode } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { InputBase } from '../InputBase/InputBase'
import { Select } from '../Select/Select'
import { CurrencyField } from '../CurrencyField/CurrencyField'
import { NumberField } from '../NumberField/NumberField'
import { Toggle } from '../Toggle/Toggle'
import { Button } from '../Button/Button'
import { FormSection } from '../FormSection/FormSection'
import { OptionRows, type OptionRow } from '../OptionRows/OptionRows'
import { RichTextEditor } from '../RichTextEditor/RichTextEditor'
import { readFileAsDataUrl } from '../MainVisualUploader/MainVisualUploader'
import { DropZone } from '../DropZone/DropZone'
import { SortableList } from '../SortableList/SortableList'
import { mergeLabels, type DeepPartialOneLevel, type LabelFn } from '../../shared/labels'
import styles from './ProductForm.module.css'

export type ProductFormValue = {
  name: string
  /** 카테고리 value — 미선택이면 null */
  category: string | null
  /** 판매가 — 숫자만 담긴 문자열(CurrencyField 규약) */
  price: string
  stock: number
  /** 판매 상태 — true면 판매중 */
  onSale: boolean
  /** 상품 이미지 URL 목록 — 첫 번째가 대표 이미지 */
  images: string[]
  options: OptionRow[]
  /** 상세 설명 HTML (RichTextEditor) */
  description: string
}

/**
 * 화면에 나오는 모든 글자 — 값(value)과 카테고리 후보(categories)만 데이터다.
 * 중첩은 표면 기준 1단계다(sections / fields / placeholders / helpers / images / actions).
 */
export type ProductFormLabels = {
  /** 섹션 카드 제목 */
  sections: { basic: string; images: string; options: string; description: string }
  /** 섹션 카드 설명 — 이미지 섹션은 상한 장수(maxImages)를 받는다 */
  sectionDescriptions: { images: LabelFn<number>; options: string }
  /** 필드 라벨 */
  fields: { name: string; category: string; price: string; stock: string; onSale: string }
  /** 필드 플레이스홀더 */
  placeholders: { name: string; category: string; description: string }
  /** 필드 보조설명 */
  helpers: { price: string }
  /** 값의 단위 — 재고 '개' */
  units: { stock: string }
  /** 판매 상태 토글 — Toggle의 label이 곧 상태 표시다 */
  onSale: { on: string; off: string }
  /** 이미지 타일·드롭존 */
  images: {
    /** 첫 번째 타일의 '대표' 배지 */
    coverBadge: string
    /** 드롭존 안 문구 */
    addLabel: string
    /** 타일 삭제 버튼의 접근성 이름 — 몇 번째 이미지인지 알려야 한다(1-based) */
    removeAria: LabelFn<number>
    /** 드롭존 하단 안내 — 아직 여유가 있을 때 */
    hint: (arg: { count: number; max: number }) => string
    /** 드롭존 하단 안내 — 상한을 채웠을 때 */
    fullHint: LabelFn<number>
  }
  /** 액션 버튼 — 제출 문구는 mode가 고른다 */
  actions: { create: string; edit: string; cancel: string; saving: string; saveDraft: string }
}

export type ProductFormProps = {
  value: ProductFormValue
  onChange: (v: ProductFormValue) => void
  categories: { label: string; value: string }[]
  onSubmit?: () => void
  onCancel?: () => void
  /** 임시저장 — 없으면 임시저장 버튼을 숨긴다 */
  onSaveDraft?: () => void
  submitting?: boolean
  mode?: 'create' | 'edit'
  /** 문구 — 개별 prop(submitLabel·cancelLabel·savingLabel)이 있으면 그쪽이 이긴다 */
  labels?: DeepPartialOneLevel<ProductFormLabels>
  /**
   * 기본 정보 그리드의 열 수 (기본 2).
   * 모달·태블릿 분할처럼 폭이 좁은 자리에서는 1열로 낮춰 필드가 짓눌리지 않게 한다.
   */
  columns?: 1 | 2
  /** 이미지 최대 장수 (기본 6) — ProductEditPage의 maxImages와 같은 축이다 */
  maxImages?: number

  /* ── 섹션 ON/OFF ──
     같은 폼을 화면마다 잘라 써야 한다(무형 상품은 이미지가 없고, 단품만 파는 몰은 옵션이 없다).
     섹션을 지우는 대신 끄면 폼을 복제하지 않아도 된다. 기본은 전부 켜짐이라 기존 화면은 그대로다. */
  /** 이미지가 없는 상품(쿠폰·서비스)에서 끈다 */
  showImages?: boolean
  /** 단일 상품만 다루는 화면에서 옵션 표를 끈다 */
  showOptions?: boolean
  /** 상세 설명을 별도 단계에서 받는 마법사형 등록에서 끈다 */
  showDescription?: boolean
  /** 모달·인라인 폼처럼 되돌아갈 곳이 없으면 취소를 끈다 */
  showCancel?: boolean

  /* ── 아이콘 슬롯 ──
     서비스마다 아이콘 세트가 달라 lucide를 강제할 수 없다. 기본값은 지금 쓰는 아이콘 그대로다. */
  addImageIcon?: ReactNode
  removeImageIcon?: ReactNode

  /* ── 카피 ──
     '등록/수정 완료' 대신 '발행'·'승인 요청' 같은 도메인 용어를 쓰는 화면이 있다. */
  /** @deprecated labels.actions.create / edit을 쓴다(개별 prop이 우선하며 두 모드를 모두 덮는다) */
  submitLabel?: string
  /** @deprecated labels.actions.cancel을 쓴다 */
  cancelLabel?: string
  /** @deprecated labels.actions.saving을 쓴다 */
  savingLabel?: string
}

/** 이미지 상한 기본값 — maxImages prop의 기본값이다(안내 문구와 업로드 게이트가 같은 값을 본다) */
const DEFAULT_MAX_IMAGES = 6

/** 업로드 1장당 용량 상한(MB) — DropZone 검증과 안내 문구가 같은 값을 쓴다 */
const MAX_IMAGE_MB = 10

export const DEFAULT_PRODUCT_FORM_LABELS: ProductFormLabels = {
  sections: {
    basic: '기본 정보',
    images: '상품 이미지',
    options: '옵션',
    description: '상세 설명',
  },
  sectionDescriptions: {
    images: (max) =>
      `대표 이미지 1장을 포함해 최대 ${max}장까지 등록할 수 있습니다. 이미지를 끌어다 놓아 순서를 바꿀 수 있고, 첫 번째 이미지가 대표 이미지로 노출됩니다.`,
    options: '색상·사이즈처럼 선택지가 필요한 상품이라면 옵션을 추가하세요.',
  },
  fields: {
    name: '상품명',
    category: '카테고리',
    price: '판매가',
    stock: '재고',
    onSale: '판매 상태',
  },
  placeholders: {
    name: '상품명을 입력하세요',
    category: '카테고리를 선택하세요',
    description: '상품 상세 설명을 입력하세요',
  },
  helpers: { price: '부가세 포함 금액을 입력하세요.' },
  units: { stock: '개' },
  onSale: { on: '판매중', off: '판매중지' },
  images: {
    coverBadge: '대표',
    addLabel: '이미지 추가',
    removeAria: (position) => `${position}번째 이미지 삭제`,
    hint: ({ count, max }) => `${count}/${max} · JPG·PNG · ${MAX_IMAGE_MB}MB 이하`,
    fullHint: (max) => `최대 ${max}장까지 등록할 수 있습니다`,
  },
  actions: {
    create: '등록',
    edit: '수정 완료',
    cancel: '취소',
    saving: '저장 중…',
    saveDraft: '임시저장',
  },
}

export function ProductForm({
  value,
  onChange,
  categories,
  onSubmit,
  onCancel,
  onSaveDraft,
  submitting = false,
  mode = 'create',
  labels,
  columns = 2,
  maxImages = DEFAULT_MAX_IMAGES,
  showImages = true,
  showOptions = true,
  showDescription = true,
  showCancel = true,
  addImageIcon,
  removeImageIcon,
  submitLabel,
  cancelLabel,
  savingLabel,
}: ProductFormProps) {
  // 우선순위: 개별 prop > labels > 기본값. mergeLabels는 undefined를 무시한다.
  const L = mergeLabels(mergeLabels(DEFAULT_PRODUCT_FORM_LABELS, labels), {
    actions: { cancel: cancelLabel, saving: savingLabel },
  })

  const patch = (next: Partial<ProductFormValue>) => onChange({ ...value, ...next })
  const imagesFull = value.images.length >= maxImages

  const addImages = async (files: File[]) => {
    const room = maxImages - value.images.length
    if (room <= 0) return
    const urls = await Promise.all(files.slice(0, room).map((file) => readFileAsDataUrl(file)))
    patch({ images: [...value.images, ...urls] })
  }

  const removeImage = (index: number) => {
    patch({ images: value.images.filter((_, i) => i !== index) })
  }

  // 개별 prop(submitLabel)은 모드와 무관하게 이긴다 — 없으면 지금처럼 모드에서 뽑는다
  const resolvedSubmitLabel = submitLabel ?? (mode === 'edit' ? L.actions.edit : L.actions.create)

  const gridClassName = [styles.grid, columns === 1 ? styles.cols1 : ''].filter(Boolean).join(' ')

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
    >
      <FormSection title={L.sections.basic}>
        <div className={gridClassName}>
          <div className={styles.col}>
            <InputBase
              label={L.fields.name}
              value={value.name}
              onChange={(name) => patch({ name })}
              placeholder={L.placeholders.name}
              required
              maxLength={100}
              showCounter
              disabled={submitting}
            />
          </div>
          <div className={styles.col}>
            <Select
              label={L.fields.category}
              value={value.category}
              onChange={(category) => patch({ category })}
              options={categories}
              placeholder={L.placeholders.category}
              disabled={submitting}
            />
          </div>
          <div className={styles.col}>
            <CurrencyField
              label={L.fields.price}
              value={value.price}
              onChange={(price) => patch({ price })}
              disabled={submitting}
              helperText={L.helpers.price}
            />
          </div>
          <div className={styles.col}>
            <NumberField
              label={L.fields.stock}
              value={value.stock}
              onChange={(stock) => patch({ stock })}
              min={0}
              unit={L.units.stock}
              disabled={submitting}
            />
          </div>
          <div className={[styles.col, styles.colFull].join(' ')}>
            <span className={styles.inlineLabel}>{L.fields.onSale}</span>
            <div className={styles.inlineControl}>
              <Toggle
                checked={value.onSale}
                onChange={(onSale) => patch({ onSale })}
                disabled={submitting}
                label={value.onSale ? L.onSale.on : L.onSale.off}
              />
            </div>
          </div>
        </div>
      </FormSection>

      {showImages && (
        <FormSection
          title={L.sections.images}
          description={L.sectionDescriptions.images(maxImages)}
        >
          {value.images.length > 0 && (
            // 이미지 URL을 그대로 키로 쓴다 — 같은 이미지를 중복 등록하지 않는다는 전제
            <SortableList
              items={value.images}
              getId={(url) => url}
              onReorder={(images) => patch({ images })}
              direction="grid"
              disabled={submitting}
              renderItem={(url, { index }) => (
                <div className={styles.tile}>
                  <img src={url} alt="" className={styles.tileImg} />
                  {index === 0 && <span className={styles.tileBadge}>{L.images.coverBadge}</span>}
                  {/* 타일 위에 얹히는 20px 칩이라 DS Button(최소 패딩·라벨 필수)으로는 만들 수 없다.
                      Button은 aria-label도 받지 않아 '몇 번째 이미지'인지 알릴 방법이 사라진다 —
                      그래서 여기만 raw button을 유지한다. */}
                  <button
                    type="button"
                    className={styles.tileRemove}
                    aria-label={L.images.removeAria(index + 1)}
                    disabled={submitting}
                    onClick={() => removeImage(index)}
                  >
                    {removeImageIcon ?? <X size={12} />}
                  </button>
                </div>
              )}
            />
          )}

          <DropZone
            onFiles={(files) => void addImages(files)}
            accept="image/*"
            multiple
            maxSizeMb={MAX_IMAGE_MB}
            disabled={submitting || imagesFull}
            compact
            hint={
              imagesFull
                ? L.images.fullHint(maxImages)
                : L.images.hint({ count: value.images.length, max: maxImages })
            }
          >
            {addImageIcon ?? <ImagePlus size={16} aria-hidden="true" />}
            <span className={styles.dropLabel}>{L.images.addLabel}</span>
          </DropZone>
        </FormSection>
      )}

      {showOptions && (
        <FormSection title={L.sections.options} description={L.sectionDescriptions.options}>
          <OptionRows
            rows={value.options}
            onChange={(options) => patch({ options })}
            disabled={submitting}
          />
        </FormSection>
      )}

      {showDescription && (
        <FormSection title={L.sections.description}>
          <RichTextEditor
            value={value.description}
            onChange={(description) => patch({ description })}
            placeholder={L.placeholders.description}
            minHeight={220}
            disabled={submitting}
          />
        </FormSection>
      )}

      <div className={styles.actions}>
        {showCancel && (
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label={L.actions.cancel}
            disabled={submitting}
            onClick={onCancel}
          />
        )}
        <span className={styles.spacer} />
        {onSaveDraft != null && (
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label={L.actions.saveDraft}
            disabled={submitting}
            onClick={onSaveDraft}
          />
        )}
        <Button
          variant="primary"
          size="md"
          label={submitting ? L.actions.saving : resolvedSubmitLabel}
          disabled={submitting}
          onClick={onSubmit}
        />
      </div>
    </form>
  )
}
