import { ratioClassName, type MediaRatio } from '../Image/Image'
import { Placeholder } from '../../shared/placeholders'
import styles from './YouTube.module.css'

export type YouTubeProps = {
  id?: string
  title?: string
  /** 비율 축 — 단일 출처는 src/ds/Image/Image.tsx의 MediaRatio */
  ratio?: MediaRatio
}

export function YouTube({
  id = 'dQw4w9WgXcQ',
  title = 'YouTube video',
  ratio = '16x9',
}: YouTubeProps) {
  const className = [styles.wrapper, ratioClassName(styles, ratio)].filter(Boolean).join(' ')
  const videoId = id.trim()

  // id가 없으면 임베드 자체를 만들지 않고 공용 대체 그림만 보여준다
  if (videoId === '') {
    return (
      <div className={className}>
        <Placeholder kind="video" size="fill" className={styles.fallback} label={title} />
      </div>
    )
  }

  return (
    <div className={className}>
      {/* 폴백은 iframe 뒤에 깔아 둔다 — 오프라인·차단 등으로 임베드가 그려지지 않으면
          빈 검은 박스 대신 이 대체 그림이 그대로 드러난다. */}
      <Placeholder kind="video" size="fill" className={styles.fallback} />
      <iframe
        className={styles.frame}
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
