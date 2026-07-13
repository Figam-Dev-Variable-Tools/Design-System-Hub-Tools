import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp, ImagePlus, Trash2 } from 'lucide-react'
import { Button } from '../Button/Button'
import { InputBase } from '../InputBase/InputBase'
import { Toggle } from '../Toggle/Toggle'
import { DropZone } from '../DropZone/DropZone'
import { SortableHandle, SortableList } from '../SortableList/SortableList'
import styles from './MainVisualUploader.module.css'

export type MainVisualItem = {
  id: string
  imageUrl: string
  title: string
  link?: string
  visible: boolean
}

export type MainVisualUploaderProps = {
  items: MainVisualItem[]
  onChange: (items: MainVisualItem[]) => void
  /** 최대 배너 수 */
  max?: number
  /** 권장 이미지 비율 안내 문구 (예: '권장 1920×640') */
  ratioHint?: string

  /*
   * ── 요소 ON/OFF (기본 전부 true) ──
   * 배너 목록은 화면마다 쓰는 축이 다르다 — 링크가 없는 단순 이미지 슬라이드,
   * 노출 스위치를 쓰지 않는 상시 노출 배너, 드래그만으로 충분해 위/아래 버튼이 필요 없는 경우 등.
   * false면 그 컨트롤이 DOM에서 완전히 사라진다(빈 자리·여백이 남지 않는다).
   */
  /** 항목별 '링크 URL' 입력 */
  showLinkField?: boolean
  /** 항목별 '노출' 토글 */
  showVisibleToggle?: boolean
  /** 위/아래 이동 버튼 — 드래그의 키보드 대안이라 기본은 켠다 */
  showMoveButtons?: boolean
  /** 썸네일 좌상단 순서 배지 */
  showOrder?: boolean

  /* ── 아이콘 슬롯 — 없으면 기존 lucide 기본 아이콘 ── */
  moveUpIcon?: ReactNode
  moveDownIcon?: ReactNode
  removeIcon?: ReactNode
  /** 하단 드롭존 아이콘 */
  addIcon?: ReactNode

  /** 하단 드롭존 문구 — 기본 '배너 추가' */
  addLabel?: string
}

let bannerSeq = 0

const nextBannerId = () => {
  bannerSeq += 1
  return `banner-${Date.now().toString(36)}-${bannerSeq}`
}

/**
 * 선택한 이미지 파일을 data URL로 읽는다.
 * ImageUpload/Upload는 File[] 모델이라 imageUrl(string) 기반 아이템 목록과 맞지 않으므로,
 * 이 컴포넌트는 파일을 URL 문자열로 변환해 넘긴다.
 * 실제 서비스에서는 이 함수 대신 업로드 API 응답 URL을 사용하면 된다.
 * ProductForm의 이미지 타일에서도 재사용한다.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function MainVisualUploader({
  items,
  onChange,
  max = 8,
  ratioHint = '권장 1920×640',
  showLinkField = true,
  showVisibleToggle = true,
  showMoveButtons = true,
  showOrder = true,
  moveUpIcon,
  moveDownIcon,
  removeIcon,
  addIcon,
  addLabel = '배너 추가',
}: MainVisualUploaderProps) {
  const full = items.length >= max

  const patch = (id: string, next: Partial<MainVisualItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...next } : item)))
  }

  const remove = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  // 위/아래 버튼 — 드래그의 키보드/접근성 대안으로 그대로 유지한다
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next)
  }

  const handleFiles = async (files: File[]) => {
    const room = max - items.length
    if (room <= 0) return
    const picked = files.slice(0, room)
    const added = await Promise.all(
      picked.map(async (file) => ({
        id: nextBannerId(),
        imageUrl: await readFileAsDataUrl(file),
        title: file.name.replace(/\.[^.]+$/, ''),
        visible: true,
      })),
    )
    onChange([...items, ...added])
  }

  return (
    <div className={styles.uploader}>
      {/* 노출 순서를 드래그로 바꾼다 — 핸들에서만 드래그가 시작되도록 해 입력 필드 조작을 방해하지 않는다 */}
      <SortableList
        items={items}
        getId={(item) => item.id}
        onReorder={onChange}
        handleOnly
        renderItem={(item, { index }) => (
          <div className={styles.item}>
            <SortableHandle />

            <div className={styles.thumb}>
              {item.imageUrl !== '' && <img src={item.imageUrl} alt="" className={styles.img} />}
              {showOrder && <span className={styles.order}>{index + 1}</span>}
            </div>

            <div className={styles.fields}>
              <InputBase
                label="제목"
                value={item.title}
                onChange={(title) => patch(item.id, { title })}
                placeholder="배너 제목"
              />
              {showLinkField && (
                <InputBase
                  label="링크 URL"
                  value={item.link ?? ''}
                  onChange={(link) => patch(item.id, { link: link === '' ? undefined : link })}
                  placeholder="https://example.com/event"
                />
              )}
            </div>

            {/* 우측 컨트롤이 전부 꺼지면 열 자체를 지운다 — 빈 칸이 남으면 안 된다 */}
            {(showVisibleToggle || showMoveButtons) && (
              <div className={styles.side}>
                {showVisibleToggle && (
                  <Toggle
                    checked={item.visible}
                    onChange={(visible) => patch(item.id, { visible })}
                    size="sm"
                    label="노출"
                  />
                )}
                <div className={styles.actions}>
                  {/*
                   * 아이콘 버튼은 공용 Button(outline)의 iconOnly 축으로 그린다 — 포커스 링·disabled·톤·
                   * 라벨 감추기가 모두 한 곳에서 온다. label은 화면에서만 감춰지고 DOM에는 남아
                   * 그대로 버튼의 접근성 이름이 된다.
                   */}
                  {showMoveButtons && (
                    <>
                      <Button
                        variant="secondary"
                        appearance="outline"
                        size="sm"
                        label={`${index + 1}번째 배너 위로`}
                        iconOnly
                        showLeftIcon
                        leftIcon={moveUpIcon ?? <ChevronUp size={16} />}
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                      />
                      <Button
                        variant="secondary"
                        appearance="outline"
                        size="sm"
                        label={`${index + 1}번째 배너 아래로`}
                        iconOnly
                        showLeftIcon
                        leftIcon={moveDownIcon ?? <ChevronDown size={16} />}
                        disabled={index === items.length - 1}
                        onClick={() => move(index, 1)}
                      />
                    </>
                  )}
                  <Button
                    variant="error"
                    appearance="outline"
                    size="sm"
                    label={`${index + 1}번째 배너 삭제`}
                    iconOnly
                    showLeftIcon
                    leftIcon={removeIcon ?? <Trash2 size={16} />}
                    onClick={() => remove(item.id)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      />

      <DropZone
        onFiles={(files) => void handleFiles(files)}
        accept="image/*"
        multiple
        disabled={full}
        hint={full ? undefined : `${ratioHint} · 클릭하거나 이미지를 끌어다 놓으세요`}
      >
        {addIcon ?? <ImagePlus size={20} aria-hidden="true" />}
        <span className={styles.dropzoneLabel}>
          {full ? `최대 ${max}개까지 등록할 수 있습니다` : addLabel}
        </span>
      </DropZone>
    </div>
  )
}
