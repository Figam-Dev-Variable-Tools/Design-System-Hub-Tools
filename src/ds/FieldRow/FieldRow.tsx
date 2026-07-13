import { cloneElement, isValidElement, useId } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import styles from './FieldRow.module.css'

/** cloneElement로 주입하는 ARIA 속성 — 자식이 DOM 요소면 그대로 붙는다 */
type AriaInjected = {
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

/** 라벨 자리 — top=컨트롤 위(기본) / left=컨트롤 왼쪽(어드민 설정 화면의 2열 폼) */
export type FieldRowLabelPlacement = 'top' | 'left'

/** left 배치의 라벨 열 기본 폭 — '휴대폰 번호' 같은 6자 라벨이 말줄임 없이 들어가는 최소치 */
const DEFAULT_LABEL_WIDTH = 140

export type FieldRowProps = {
  label: string
  required?: boolean
  /** 기본 상태의 보조 설명 — error가 있으면 대신 에러 문구가 나온다 */
  description?: string
  /** 에러 문구 — 있으면 error 톤 + 컨트롤에 aria-invalid */
  error?: string
  /** 라벨과 컨트롤을 잇는 id. InputBase처럼 id를 자체 생성하는 컴포넌트에는 넘기지 않는다 */
  htmlFor?: string
  children: ReactNode
  /** FormSection 본문(3열 그리드) 기준 점유 열 수. 생략하면 한 줄 전체 */
  span?: 1 | 2 | 3
  /**
   * 필수 표시 기호 (기본 '*').
   * 화면마다 관례가 다르다 — '필수' 텍스트나 '●'를 쓰는 어드민도 있다.
   * 장식(aria-hidden)이라 무엇을 넣어도 스크린리더 낭독에는 끼어들지 않는다.
   */
  requiredMark?: ReactNode
  /**
   * 라벨 자리 (기본 top).
   * left는 어드민 설정 화면에서 흔한 좌측 라벨(2열) 폼이다 — 이 축이 없어서
   * 그런 화면은 FieldRow를 버리고 라벨 마크업을 직접 만들고 있었다.
   * (좁은 폭(1023 이하)에서는 자동으로 top으로 풀린다 — 라벨 열이 컨트롤을 짓누르지 않게)
   */
  labelPlacement?: FieldRowLabelPlacement
  /** labelPlacement='left'의 라벨 열 폭(px) — 기본 140 */
  labelWidth?: number
}

/**
 * FieldRow — 라벨 + 필수(*) + 설명/에러를 한 규격으로 묶는 폼 행.
 *
 * 3상태
 *  1. 기본        : 라벨 + 컨트롤
 *  2. description : 컨트롤 아래 회색 보조 설명
 *  3. error       : 설명 자리를 에러 문구(error 톤)가 대체하고, 컨트롤에 aria-invalid가 걸린다
 *     (설명과 에러를 동시에 쌓지 않는다 — 줄 수가 바뀌면 그리드 행 높이가 흔들린다)
 *
 * aria 연결: 자식이 React 엘리먼트면 aria-invalid / aria-describedby를 cloneElement로 주입한다.
 * 네이티브 input·select·textarea에는 그대로 DOM에 붙는다.
 * DS 프리미티브(InputBase 등)는 임의 prop을 spread하지 않으므로, 그런 컨트롤에는
 * 컴포넌트 자체의 error prop(<InputBase error />)을 함께 넘겨야 테두리까지 에러 톤이 된다.
 *
 * 문구는 label·description·error·requiredMark가 전부 prop이다 — 컴포넌트 안에 리터럴이 없어
 * labels 통로를 두지 않는다.
 */
export function FieldRow({
  label,
  required = false,
  description,
  error,
  htmlFor,
  children,
  span,
  requiredMark = '*',
  labelPlacement = 'top',
  labelWidth = DEFAULT_LABEL_WIDTH,
}: FieldRowProps) {
  const uid = useId()
  const messageId = `${uid}-message`

  const hasError = error != null && error !== ''
  const hasDescription = !hasError && description != null && description !== ''
  const messageFor = hasError || hasDescription ? messageId : undefined

  let control: ReactNode = children
  if (isValidElement<AriaInjected>(children)) {
    // 자식이 이미 들고 있던 describedby를 지우지 않고 합친다
    const describedBy = [children.props['aria-describedby'], messageFor].filter(Boolean).join(' ')
    control = cloneElement(children, {
      'aria-invalid': hasError ? true : children.props['aria-invalid'],
      'aria-describedby': describedBy === '' ? undefined : describedBy,
    })
  }

  // htmlFor가 없으면 label 요소를 쓰지 않는다 — 빈 for는 스크린리더에서 라벨을 끊는다
  const labelContent = (
    <>
      <span className={styles.labelText}>{label}</span>
      {required && (
        <span className={styles.required} aria-hidden="true">
          {requiredMark}
        </span>
      )}
    </>
  )

  // 라벨 열 폭은 CSS 변수로 넘긴다 — 미디어쿼리(좁은 폭에서 1열)가 인라인 스타일에 지지 않게
  const vars = { '--fr-label-w': `${labelWidth}px` } as CSSProperties

  return (
    <div className={styles.row} data-span={span} data-label-placement={labelPlacement} style={vars}>
      {htmlFor != null ? (
        <label className={styles.label} htmlFor={htmlFor}>
          {labelContent}
        </label>
      ) : (
        <span className={styles.label}>{labelContent}</span>
      )}

      <div className={styles.control}>{control}</div>

      {hasError && (
        <p className={styles.error} id={messageId} role="alert">
          {error}
        </p>
      )}
      {hasDescription && (
        <p className={styles.description} id={messageId}>
          {description}
        </p>
      )}
    </div>
  )
}
