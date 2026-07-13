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
  submitLabel?: string
  cancelLabel?: string
  savingLabel?: string
}

const MAX_IMAGES = 6

export function ProductForm({
  value,
  onChange,
  categories,
  onSubmit,
  onCancel,
  onSaveDraft,
  submitting = false,
  mode = 'create',
  showImages = true,
  showOptions = true,
  showDescription = true,
  showCancel = true,
  addImageIcon,
  removeImageIcon,
  submitLabel,
  cancelLabel = '취소',
  savingLabel = '저장 중…',
}: ProductFormProps) {
  const patch = (next: Partial<ProductFormValue>) => onChange({ ...value, ...next })
  const imagesFull = value.images.length >= MAX_IMAGES

  const addImages = async (files: File[]) => {
    const room = MAX_IMAGES - value.images.length
    if (room <= 0) return
    const urls = await Promise.all(files.slice(0, room).map((file) => readFileAsDataUrl(file)))
    patch({ images: [...value.images, ...urls] })
  }

  const removeImage = (index: number) => {
    patch({ images: value.images.filter((_, i) => i !== index) })
  }

  // 라벨을 넘기지 않으면 지금처럼 모드에서 뽑는다
  const resolvedSubmitLabel = submitLabel ?? (mode === 'edit' ? '수정 완료' : '등록')

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
    >
      <FormSection title="기본 정보">
        <div className={styles.grid}>
          <div className={styles.col}>
            <InputBase
              label="상품명"
              value={value.name}
              onChange={(name) => patch({ name })}
              placeholder="상품명을 입력하세요"
              required
              maxLength={100}
              showCounter
              disabled={submitting}
            />
          </div>
          <div className={styles.col}>
            <Select
              label="카테고리"
              value={value.category}
              onChange={(category) => patch({ category })}
              options={categories}
              placeholder="카테고리를 선택하세요"
              disabled={submitting}
            />
          </div>
          <div className={styles.col}>
            <CurrencyField
              label="판매가"
              value={value.price}
              onChange={(price) => patch({ price })}
              disabled={submitting}
              helperText="부가세 포함 금액을 입력하세요."
            />
          </div>
          <div className={styles.col}>
            <NumberField
              label="재고"
              value={value.stock}
              onChange={(stock) => patch({ stock })}
              min={0}
              unit="개"
              disabled={submitting}
            />
          </div>
          <div className={[styles.col, styles.colFull].join(' ')}>
            <span className={styles.inlineLabel}>판매 상태</span>
            <div className={styles.inlineControl}>
              <Toggle
                checked={value.onSale}
                onChange={(onSale) => patch({ onSale })}
                disabled={submitting}
                label={value.onSale ? '판매중' : '판매중지'}
              />
            </div>
          </div>
        </div>
      </FormSection>

      {showImages && (
        <FormSection
          title="상품 이미지"
          description={`대표 이미지 1장을 포함해 최대 ${MAX_IMAGES}장까지 등록할 수 있습니다. 이미지를 끌어다 놓아 순서를 바꿀 수 있고, 첫 번째 이미지가 대표 이미지로 노출됩니다.`}
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
                  {index === 0 && <span className={styles.tileBadge}>대표</span>}
                  {/* 타일 위에 얹히는 20px 칩이라 DS Button(최소 패딩·라벨 필수)으로는 만들 수 없다.
                      Button은 aria-label도 받지 않아 '몇 번째 이미지'인지 알릴 방법이 사라진다 —
                      그래서 여기만 raw button을 유지한다. */}
                  <button
                    type="button"
                    className={styles.tileRemove}
                    aria-label={`${index + 1}번째 이미지 삭제`}
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
            maxSizeMb={10}
            disabled={submitting || imagesFull}
            compact
            hint={
              imagesFull
                ? `최대 ${MAX_IMAGES}장까지 등록할 수 있습니다`
                : `${value.images.length}/${MAX_IMAGES} · JPG·PNG · 10MB 이하`
            }
          >
            {addImageIcon ?? <ImagePlus size={16} aria-hidden="true" />}
            <span className={styles.dropLabel}>이미지 추가</span>
          </DropZone>
        </FormSection>
      )}

      {showOptions && (
        <FormSection
          title="옵션"
          description="색상·사이즈처럼 선택지가 필요한 상품이라면 옵션을 추가하세요."
        >
          <OptionRows
            rows={value.options}
            onChange={(options) => patch({ options })}
            disabled={submitting}
          />
        </FormSection>
      )}

      {showDescription && (
        <FormSection title="상세 설명">
          <RichTextEditor
            value={value.description}
            onChange={(description) => patch({ description })}
            placeholder="상품 상세 설명을 입력하세요"
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
            label={cancelLabel}
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
            label="임시저장"
            disabled={submitting}
            onClick={onSaveDraft}
          />
        )}
        <Button
          variant="primary"
          size="md"
          label={submitting ? savingLabel : resolvedSubmitLabel}
          disabled={submitting}
          onClick={onSubmit}
        />
      </div>
    </form>
  )
}
