import type { ReactNode } from 'react'
import { mergeLabels, resolveLabel, type DeepPartialOneLevel } from '../../shared/labels'
import styles from './QaList.module.css'

export type QaItem = {
  question: string
  /** 답변 — 텍스트뿐 아니라 링크/목록 같은 노드도 받는다 */
  answer: ReactNode
}

/* ── 문구(labels) ───────────────────────────────────────────────────────────
   Q/A 마크는 세 조각으로 쪼개진다 — 접두사('Q') · 번호 · 구분 기호('.').
   구분 기호가 리터럴로 박혀 있어 'Q1.'을 'Q1)'이나 '1.'로 바꿀 수 없었다.
   우선순위: 개별 prop(questionPrefix …) > labels.* > 기본값. */
type QaListLabelsResolved = {
  /** Q 마크의 글자 — 'Q' → 'Q1.' 'Q2.' */
  questionPrefix: string
  /** 번호 뒤 구분 기호 — 'Q1.' → 'Q1)' */
  questionSuffix: string
  /** A 마크 전체 문자열(구분 기호 포함) */
  answerPrefix: string
}

export const DEFAULT_QA_LIST_LABELS: QaListLabelsResolved = {
  questionPrefix: 'Q',
  questionSuffix: '.',
  answerPrefix: 'A.',
} as const

export type QaListLabels = DeepPartialOneLevel<QaListLabelsResolved>

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
  /** @deprecated labels.questionPrefix 를 쓰세요 (개별 prop이 labels보다 우선한다) */
  questionPrefix?: string
  /** @deprecated labels.answerPrefix 를 쓰세요 */
  answerPrefix?: string
  /** 화면 문구를 통째로 갈아끼우는 단일 통로 — 개별 카피 prop이 우선한다 */
  labels?: QaListLabels
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
  // 기본값은 DEFAULT_QA_LIST_LABELS가 갖는다 — 여기서 기본값을 주면
  // 넘기지 않은 개별 prop이 labels를 항상 이겨 통로가 막힌다
  questionPrefix,
  answerPrefix,
  labels,
}: QaListProps) {
  const L = mergeLabels(DEFAULT_QA_LIST_LABELS, labels)
  const qMark = resolveLabel(questionPrefix, L.questionPrefix)
  const aMark = resolveLabel(answerPrefix, L.answerPrefix)

  const rootClassName = [styles.root, divider ? '' : styles.noDivider].filter(Boolean).join(' ')

  return (
    <ol className={rootClassName}>
      {items.map((item, index) => (
        <li key={`${index}-${item.question}`} className={styles.item}>
          <div className={styles.row}>
            <span className={styles.qMark} aria-hidden="true">
              {qMark}
              {numbered ? index + 1 : ''}
              {L.questionSuffix}
            </span>
            <p className={styles.question}>{item.question}</p>
          </div>

          <div className={styles.row}>
            <span className={styles.aMark} aria-hidden="true">
              {aMark}
            </span>
            <div className={styles.answer}>{item.answer}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}
