import type { ReactNode } from 'react'
import { mergeLabels, resolveLabel } from '../../shared/labels'
import { Toggle } from '../Toggle/Toggle'
import styles from './FormSection.module.css'

/** 본문 그리드 열 수 — 3열이 기본이고, 좁은 폼(maxWidth='md')이나 1열 폼을 위해 연다 */
export type FormSectionColumns = 1 | 2 | 3

/** 카드 크롬 — card=흰 카드(기본) / plain=크롬 없음(모달·드로어 안에서 카드가 겹치지 않게) */
export type FormSectionAppearance = 'card' | 'plain'

/**
 * FormSection의 문구 — 밴드(토글 행)가 전부다.
 * 나머지(title·description·disabledHint)는 이미 개별 prop이라 통로를 두 개로 늘리지 않는다.
 */
export type FormSectionLabels = {
  toggle?: {
    /** 밴드 좌측 문구 — 기본 '사용' */
    label?: string
    /** 스위치 켜짐 문구 — 기본 'ON' */
    on?: string
    /** 스위치 꺼짐 문구 — 기본 'OFF' */
    off?: string
  }
}

/**
 * Toggle은 label이 곧 접근성 이름이자 상태 표시다 — 화면 언어가 한글로 통일된 폼에서는
 * '사용/미사용'처럼 바꿔 달아야 스위치만 영어로 튀지 않는다.
 * (AdminFormPage의 toggle 필드도 이 값을 단일 출처로 가져다 쓴다)
 */
export const DEFAULT_FORM_SECTION_LABELS = {
  toggle: { label: '사용', on: 'ON', off: 'OFF' },
} satisfies FormSectionLabels

export type FormSectionProps = {
  /** 카드 좌측 번호 — 레퍼런스의 '1. 배너 구분'에서 1 */
  index?: number
  title: string
  description?: string
  children: ReactNode
  /** 섹션 자체를 켜고 끄는 토글 */
  toggleable?: boolean
  enabled?: boolean
  onEnabledChange?: (v: boolean) => void
  /**
   * 강조 밴드 좌측 문구 (기본 '사용') — 레퍼런스의 '문구 사용', '활성화'
   * @deprecated labels.toggle.label을 쓴다(개별 prop이 이긴다 — 기존 화면은 그대로 동작한다)
   */
  toggleLabel?: string
  /** 밴드 문구 아래 보조 설명 */
  toggleDescription?: string
  /** 꺼졌을 때 밴드 안에 남기는 안내 — 본문 자리에는 아무것도 남기지 않는다 */
  disabledHint?: string
  /** 헤더 우측 액션(추가/초기화 버튼 등) */
  actions?: ReactNode
  /**
   * 토글 스위치의 켜짐 문구 (기본 'ON').
   * @deprecated labels.toggle.on을 쓴다(개별 prop이 이긴다)
   */
  onLabel?: string
  /**
   * 토글 스위치의 꺼짐 문구 (기본 'OFF').
   * @deprecated labels.toggle.off를 쓴다(개별 prop이 이긴다)
   */
  offLabel?: string
  /** 문구 통로 — 개별 prop > labels.* > 기본값 */
  labels?: FormSectionLabels
  /**
   * 본문 그리드 열 수 (기본 3).
   * 3열 고정이라 좁은 폭(maxWidth='md') 폼에서 span 계산이 무너지고 1열 폼을 선언할 수 없었다.
   */
  columns?: FormSectionColumns
  /**
   * 카드 크롬 (기본 card).
   * plain은 모달·드로어 안에 폼을 넣을 때 — 항상 카드라 보더가 이중으로 겹치던 것을 푼다.
   */
  appearance?: FormSectionAppearance
}

/**
 * FormSection — 폼 화면을 이루는 번호 카드 한 장.
 * ('1. 배너 구분 / 2. 문구·콘텐츠 / 3. 이미지 / 4. 링크·노출')
 *
 * ON/OFF 규약
 *  - toggleable이면 헤더 아래에 강조 밴드(연한 primary 배경 + 1px 보더)로 '문구 사용 [ON]' 행이 뜬다.
 *  - enabled=false면 본문(children)을 DOM에서 지운다 — 빈 자리·여백·구분선이 남지 않는다.
 *    (본문 래퍼 자체를 렌더하지 않으므로 카드의 flex gap도 함께 사라진다)
 *  - 토글 행은 꺼져도 남는다. 다시 켜는 스위치가 사라지면 안 되기 때문이다.
 *
 * 제어 컴포넌트다 — enabled/onEnabledChange를 사용처가 들고 있는다.
 *
 * 본문은 기본 3열 그리드다(columns). 직계 자식은 기본으로 한 줄을 전부 쓰고(표·업로더 등),
 * FieldRow만 span(1|2|3)으로 열을 나눠 가진다.
 */
export function FormSection({
  index,
  title,
  description,
  children,
  toggleable = false,
  enabled = true,
  onEnabledChange,
  toggleLabel,
  toggleDescription,
  disabledHint,
  actions,
  onLabel,
  offLabel,
  labels,
  columns = 3,
  appearance = 'card',
}: FormSectionProps) {
  const L = mergeLabels(DEFAULT_FORM_SECTION_LABELS, labels)

  // 개별 prop > labels.* > 기본값
  const bandLabel = resolveLabel(toggleLabel, L.toggle.label)
  const switchOn = resolveLabel(onLabel, L.toggle.on)
  const switchOff = resolveLabel(offLabel, L.toggle.off)

  // 토글이 없는 섹션은 항상 본문을 보여준다
  const showBody = !toggleable || enabled

  return (
    <section className={[styles.root, styles[appearance]].join(' ')}>
      <header className={styles.head}>
        <div className={styles.headings}>
          <h3 className={styles.title}>
            {index != null && (
              // 번호는 장식 — 제목을 읽을 때 숫자가 끼어들지 않게 스크린리더에서 숨긴다
              <span className={styles.index} aria-hidden="true">
                {index}
              </span>
            )}
            <span className={styles.titleText}>{title}</span>
          </h3>
          {description != null && <p className={styles.description}>{description}</p>}
        </div>
        {actions != null && <div className={styles.actions}>{actions}</div>}
      </header>

      {toggleable && (
        <div className={[styles.band, enabled ? styles.bandOn : styles.bandOff].join(' ')}>
          <div className={styles.bandRow}>
            <div className={styles.bandText}>
              <span className={styles.bandLabel}>{bandLabel}</span>
              {toggleDescription != null && (
                <span className={styles.bandDesc}>{toggleDescription}</span>
              )}
            </div>
            {/* Toggle은 props 고정(9종) 대상이라 aria-label을 넘길 수 없다.
                대신 label로 'ON'/'OFF'를 붙여 스위치에 이름과 상태를 함께 준다 — 레퍼런스의 [ON] 표기와도 같다. */}
            <Toggle
              checked={enabled}
              onChange={onEnabledChange}
              size="sm"
              label={enabled ? switchOn : switchOff}
            />
          </div>
          {!enabled && disabledHint != null && <p className={styles.hint}>{disabledHint}</p>}
        </div>
      )}

      {showBody && (
        <div className={styles.body} data-columns={columns}>
          {children}
        </div>
      )}
    </section>
  )
}
