import { useState } from 'react'
import { ratioClassName, type MediaRatio } from '../Image/Image'
import { Placeholder } from '../../shared/placeholders'
import styles from './ImageSlide.module.css'

export type ImageSlideProps = {
  images?: string[]
  /** 비율 축 — 단일 출처는 src/ds/Image/Image.tsx의 MediaRatio */
  ratio?: MediaRatio
}

const PLACEHOLDER_COUNT = 3

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      className={styles.chevron}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {dir === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  )
}

export function ImageSlide({ images, ratio = '16x9' }: ImageSlideProps) {
  const [index, setIndex] = useState(0)

  const list = images ?? []
  const usePlaceholders = list.length === 0
  const count = usePlaceholders ? PLACEHOLDER_COUNT : list.length

  const go = (next: number) => {
    setIndex((next + count) % count)
  }

  const viewportClassName = [styles.viewport, ratioClassName(styles, ratio)]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={styles.root}>
      <div className={viewportClassName}>
        {usePlaceholders ? (
          // images가 없으면 공용 대체 이미지 — label이 SVG 안에 찍혀 슬라이드 전환이 보인다
          <Placeholder
            kind="image"
            size="fill"
            className={styles.placeholder}
            label={`Slide ${index + 1}`}
          />
        ) : (
          <img className={styles.image} src={list[index]} alt={`Slide ${index + 1}`} />
        )}

        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={() => go(index - 1)}
          aria-label="Previous slide"
        >
          <Chevron dir="left" />
        </button>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={() => go(index + 1)}
          aria-label="Next slide"
        >
          <Chevron dir="right" />
        </button>
      </div>

      <div className={styles.dots}>
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
          />
        ))}
      </div>
    </div>
  )
}
