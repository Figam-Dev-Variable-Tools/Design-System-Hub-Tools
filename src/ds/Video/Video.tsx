import { ratioClassName, type MediaRatio } from '../Image/Image'
import { Placeholder } from '../../shared/placeholders'
import styles from './Video.module.css'

export type VideoProps = {
  src?: string
  poster?: string
  title?: string
  /** 비율 축 — 단일 출처는 src/ds/Image/Image.tsx의 MediaRatio */
  ratio?: MediaRatio
  rounded?: boolean
}

export function Video({ src, poster, title, ratio = '16x9', rounded = true }: VideoProps) {
  const rootClassName = [styles.video, rounded ? styles.rounded : ''].filter(Boolean).join(' ')
  const frameClassName = [styles.frame, ratioClassName(styles, ratio)].filter(Boolean).join(' ')

  return (
    <figure className={rootClassName}>
      <div className={frameClassName}>
        {src ? (
          <video className={styles.player} controls poster={poster}>
            <source src={src} />
          </video>
        ) : (
          // src가 없으면 공용 대체 영상 그림(src/shared/placeholders.tsx)
          <div className={styles.placeholder} role="img" aria-label={title ?? 'Video preview'}>
            <Placeholder kind="video" size="fill" />
          </div>
        )}
      </div>
      {title && <figcaption className={styles.caption}>{title}</figcaption>}
    </figure>
  )
}
