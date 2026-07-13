import type { ReactNode } from 'react'
import styles from './placeholders.module.css'

/**
 * 공용 SVG 플레이스홀더 — 예외/빈 상태 그림의 **단일 출처**.
 *
 * 저장소 관례상 컴포넌트는 `src/ds/<Name>/`에 두지만, 이것은 Image·Video·EmptyState·
 * AdminTable·CrudDialog 등 여러 컴포넌트가 공유하는 **프리미티브**라 `src/shared/`에 둔다
 * (figma.ts·mediaMock.ts와 같은 자리). 갤러리 스토리만 `src/ds/Placeholder/`에 있다.
 *
 * 디자인 언어(8종 공통)
 *  - 모티프: 둥근 사각 프레임(rx 10) + 그 안의 심볼. 프레임이 8종을 한 가족으로 묶는다.
 *  - 획: 1.5px 고정(non-scaling-stroke) · 둥근 캡/조인.
 *  - 색: 선 = currentColor · 면 = --ds-color-bgSubtle/--ds-color-border ·
 *        강조 = 심볼 안의 작은 요소 하나에만(--ph-accent).
 *  - 토큰만 쓰므로 다크/프리셋 전환에 자동으로 따라간다.
 */
export type PlaceholderKind =
  | 'image' // 이미지 없음
  | 'video' // 동영상 없음/재생 불가
  | 'file' // 첨부/문서 없음
  | 'empty' // 작성된 내용 없음(목록/게시판 빈 상태)
  | 'search' // 검색 결과 없음
  | 'error' // 오류
  | 'delete' // 삭제 확인(팝업/모달)
  | 'success' // 완료

export type PlaceholderProps = {
  kind: PlaceholderKind
  /** px 크기(정사각 아이콘형) 또는 'fill'(부모를 채우는 대체 이미지형) */
  size?: number | 'fill'
  /** 아래 표기할 짧은 문구 — 'fill'에서는 SVG 안에, 아이콘형에서는 생략 가능 */
  label?: string
  className?: string
}

/** 심볼 캔버스 — 8종 모두 이 좌표계 위에 그린다(프레임 6,8 → 52×48, rx 10). */
const CANVAS = 64

/** 모든 kind가 공유하는 둥근 사각 프레임 */
function Frame() {
  return <rect className={styles.line} x="6" y="8" width="52" height="48" rx="10" />
}

/**
 * kind별 심볼 — 프레임 안에 들어가는 기하 요소.
 * 강조(accent)는 각 심볼에서 **정확히 하나**의 요소에만 쓴다.
 */
const SYMBOL: Record<PlaceholderKind, ReactNode> = {
  // 이미지: 산등성이 + 해(강조)
  image: (
    <>
      <circle className={styles.accentFill} cx="21" cy="22" r="3.5" />
      <path className={styles.line} d="M8 47 L22 33 L31 42 L40 34 L56 50" />
    </>
  ),

  // 동영상: 중앙 재생 삼각형(강조)
  video: <path className={styles.accentShape} d="M27 23 L44 32 L27 41 Z" />,

  // 파일: 문서 시트 + 접힌 모서리(강조) + 본문 2줄
  file: (
    <>
      <path
        className={styles.surface}
        d="M24 17 h9 l9 9 v21 a2 2 0 0 1 -2 2 h-16 a2 2 0 0 1 -2 -2 v-28 a2 2 0 0 1 2 -2 z"
      />
      <path className={styles.accentLine} d="M33 17 v7 a2 2 0 0 0 2 2 h7" />
      <path className={styles.line} d="M27 34 h10 M27 41 h6" />
    </>
  ),

  // 빈 목록: 본문 줄 3개 — 마지막 줄만 짧고 강조(=아직 쓰이지 않은 자리)
  empty: (
    <>
      <path className={styles.line} d="M16 25 h32 M16 33 h32" />
      <path className={styles.accentLine} d="M16 41 h14" />
    </>
  ),

  // 검색: 돋보기 렌즈 + 손잡이(강조)
  search: (
    <>
      <circle className={styles.line} cx="29" cy="29" r="9" />
      <path className={styles.accentLine} d="M36 36 L46 46" />
    </>
  ),

  // 오류: 느낌표 — 점만 강조(error)
  error: (
    <>
      <path className={styles.line} d="M32 20 v15" />
      <circle className={styles.accentFill} cx="32" cy="43" r="2.5" />
    </>
  ),

  // 삭제: 휴지통 — 안쪽 바 2개만 강조(error)
  delete: (
    <>
      <path className={styles.line} d="M21 25 h22" />
      <path className={styles.line} d="M28 25 v-2.5 a2 2 0 0 1 2 -2 h4 a2 2 0 0 1 2 2 v2.5" />
      <path
        className={styles.line}
        d="M24.5 25 v19 a3 3 0 0 0 3 3 h9 a3 3 0 0 0 3 -3 v-19"
      />
      <path className={styles.accentLine} d="M29 31 v10 M35 31 v10" />
    </>
  ),

  // 완료: 원 안의 체크 — 체크만 강조(success)
  success: (
    <>
      <circle className={styles.surface} cx="32" cy="32" r="11" />
      <path className={styles.accentLine} d="M27 32.5 l3.5 3.5 L38 28" />
    </>
  ),
}

/** kind → 강조 톤 클래스. 기본은 primary, 의미가 강한 3종만 semantic 토큰. */
const TONE_CLASS: Record<PlaceholderKind, string> = {
  image: styles.toneBrand,
  video: styles.toneBrand,
  file: styles.toneBrand,
  empty: styles.toneBrand,
  search: styles.toneBrand,
  error: styles.toneError,
  delete: styles.toneError,
  success: styles.toneSuccess,
}

export function Placeholder({ kind, size = 48, label, className }: PlaceholderProps): JSX.Element {
  const isFill = size === 'fill'
  const hasLabel = label != null && label !== ''

  // label이 있으면 접근성 이름을 갖는 이미지, 없으면 장식(주변 텍스트가 의미를 갖는다)
  const a11y = hasLabel
    ? ({ role: 'img', 'aria-label': label } as const)
    : ({ 'aria-hidden': true } as const)

  const symbol = (
    <>
      <Frame />
      {SYMBOL[kind]}
    </>
  )

  // fill형에서만 심볼 아래에 문구를 붙인다(아이콘형은 호출부가 자기 텍스트를 갖는다).
  // 문구는 SVG <text>가 아니라 HTML로 찍는다 — SVG 텍스트는 줄바꿈이 안 돼
  // 긴 label("이미지를 불러올 수 없습니다" 등)이 viewBox 밖으로 나가 잘렸다.
  if (isFill) {
    return (
      <div className={[styles.fill, className].filter(Boolean).join(' ')} {...a11y}>
        <svg
          className={[styles.root, styles.fillSvg, TONE_CLASS[kind]].join(' ')}
          viewBox={`0 0 ${CANVAS} ${CANVAS}`}
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {symbol}
        </svg>
        {hasLabel && <span className={styles.label}>{label}</span>}
      </div>
    )
  }

  return (
    <svg
      className={[styles.root, styles.icon, TONE_CLASS[kind], className].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox={`0 0 ${CANVAS} ${CANVAS}`}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...a11y}
    >
      {symbol}
    </svg>
  )
}
