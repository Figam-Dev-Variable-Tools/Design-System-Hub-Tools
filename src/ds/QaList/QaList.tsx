import type { ReactNode } from 'react'
import styles from './QaList.module.css'

export type QaItem = {
  question: string
  /** 답변 — 텍스트뿐 아니라 링크/목록 같은 노드도 받는다 */
  answer: ReactNode
}

export type QaListProps = {
  items: QaItem[]
  /** Q에 번호 매기기 — Q1. Q2. … (기본 true) */
  numbered?: boolean
  /**
   * 항목 사이 1px 구분선. 기본 true.
   * 카드 안에 Q/A 한두 건만 얹는 자리에서는 선이 오히려 시끄러워 끌 수 있게 연다
   * (간격은 그대로 — 선만 사라진다).
   */
  divider?: boolean
  /**
   * Q 마크의 글자. 기본 'Q' → 'Q1.' 'Q2.'
   * 설문/체크리스트처럼 '문항'이 질문이 아닌 화면에서 갈아끼운다.
   */
  questionPrefix?: string
  /** A 마크 전체 문자열(마침표 포함). 기본 'A.' */
  answerPrefix?: string
}

/**
 * QaList — 문의 응답(Q/A) 나열.
 *
 * Q 마크와 A 마크는 같은 고정폭 열에 놓아 질문·답변 본문의 왼쪽 라인이 맞는다.
 * 답변은 길어질 수 있으므로 줄바꿈으로 흐르고(클램프 없음), 항목 사이만 1px 구분선.
 */
export function QaList({
  items,
  numbered = true,
  divider = true,
  questionPrefix = 'Q',
  answerPrefix = 'A.',
}: QaListProps) {
  const rootClassName = [styles.root, divider ? '' : styles.noDivider].filter(Boolean).join(' ')

  return (
    <ol className={rootClassName}>
      {items.map((item, index) => (
        <li key={`${index}-${item.question}`} className={styles.item}>
          <div className={styles.row}>
            <span className={styles.qMark} aria-hidden="true">
              {questionPrefix}
              {numbered ? index + 1 : ''}.
            </span>
            <p className={styles.question}>{item.question}</p>
          </div>

          <div className={styles.row}>
            <span className={styles.aMark} aria-hidden="true">
              {answerPrefix}
            </span>
            <div className={styles.answer}>{item.answer}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}
