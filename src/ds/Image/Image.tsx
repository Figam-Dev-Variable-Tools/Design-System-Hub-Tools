import { Placeholder } from '../../shared/placeholders'
import styles from './Image.module.css'

/**
 * 웹 표준 미디어 비율 축 — Media 카테고리(Image · Video · YouTube · ImageCard · ImageSlide) 공용.
 * 이 파일이 단일 출처이며, 다른 컴포넌트는 `import type { MediaRatio } from '../Image/Image'` 로 가져다 쓴다.
 * (저장소에 barrel이 없어, Select가 useDismiss를 내보내 MultiSelect가 쓰는 것과 동일한 공유 패턴)
 */
export type MediaRatio =
  | '1x1' // 정사각 — 프로필·썸네일·인스타 피드
  | '4x3' // 클래식 사진
  | '3x2' // DSLR 사진
  | '16x9' // 와이드·동영상 표준
  | '21x9' // 시네마틱 배너
  | '4x5' // 인스타 세로
  | '3x4' // 세로 사진
  | '9x16' // 숏폼·스토리
  | '2x1' // 와이드 배너
  | 'auto' // 원본 비율 유지

/** 컨트롤·스토리에서 쓰는 비율 목록(선언 순서 = 표시 순서) */
export const MEDIA_RATIOS: readonly MediaRatio[] = [
  '1x1',
  '4x3',
  '3x2',
  '16x9',
  '21x9',
  '4x5',
  '3x4',
  '9x16',
  '2x1',
  'auto',
]

/** 사람이 읽는 비율 라벨 (1x1 → 1:1) */
export const MEDIA_RATIO_LABEL: Record<MediaRatio, string> = {
  '1x1': '1:1',
  '4x3': '4:3',
  '3x2': '3:2',
  '16x9': '16:9',
  '21x9': '21:9',
  '4x5': '4:5',
  '3x4': '3:4',
  '9x16': '9:16',
  '2x1': '2:1',
  auto: 'auto',
}

/**
 * MediaRatio → CSS Module 클래스 키.
 * Media 컴포넌트들의 module.css는 모두 이 이름의 비율 클래스 세트를 동일하게 갖는다.
 */
const RATIO_CLASS_KEY: Record<MediaRatio, string> = {
  '1x1': 'ratio1x1',
  '4x3': 'ratio4x3',
  '3x2': 'ratio3x2',
  '16x9': 'ratio16x9',
  '21x9': 'ratio21x9',
  '4x5': 'ratio4x5',
  '3x4': 'ratio3x4',
  '9x16': 'ratio9x16',
  '2x1': 'ratio2x1',
  auto: 'ratioAuto',
}

/** 각 컴포넌트의 CSS Module에서 비율 클래스를 꺼낸다. */
export function ratioClassName(
  moduleStyles: Record<string, string>,
  ratio: MediaRatio
): string {
  return moduleStyles[RATIO_CLASS_KEY[ratio]] ?? ''
}

export type ImageProps = {
  src?: string
  alt?: string
  ratio?: MediaRatio
  rounded?: boolean
}

export function Image({ src, alt = '', ratio = '16x9', rounded = false }: ImageProps) {
  const className = [styles.frame, ratioClassName(styles, ratio), rounded ? styles.rounded : '']
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      {src ? (
        <img className={styles.img} src={src} alt={alt} />
      ) : (
        // src가 없으면 공용 대체 이미지(src/shared/placeholders.tsx)로 채운다
        <div className={styles.placeholder} role="img" aria-label={alt || 'Image placeholder'}>
          <Placeholder kind="image" size="fill" />
        </div>
      )}
    </div>
  )
}
