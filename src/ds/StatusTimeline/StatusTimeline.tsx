import type { ReactNode } from 'react'
import { Check, Minus } from 'lucide-react'
import styles from './StatusTimeline.module.css'

export type StatusStep = {
  key: string
  label: string
  /** 처리 시각 */
  at?: string
  /** 처리 담당자 */
  by?: string
  state: 'done' | 'current' | 'todo' | 'skipped'
}

export type StatusTimelineProps = {
  steps: StatusStep[]
  direction?: 'horizontal' | 'vertical'
  /**
   * 시각·담당자 줄(at · by) 노출. 기본 true.
   * 좁은 aside나 헤더 요약처럼 '어디까지 왔는지'만 보이면 되는 자리에서 끄면
   * 단계 라벨만 남아 가로형이 짜부라지지 않는다.
   */
  showMeta?: boolean
  /**
   * done 단계의 점 안 마크. 기본 체크(Check).
   * 도메인마다 '완료'의 그림이 달라서(결제 완료=원화, 배송 완료=박스) 노드로 갈아끼울 수 있게 연다.
   */
  doneIcon?: ReactNode
  /** skipped 단계의 점 안 마크. 기본 빼기(Minus) — '건너뜀'을 그림으로도 알린다 */
  skippedIcon?: ReactNode
}

/**
 * StatusTimeline — 처리 상태 진행(접수 → 확인중 → 답변완료 → 종료).
 *
 * 기존 Timeline과 시각 언어를 맞춘다(20px 점 · 2px 연결선 · done=success 체크 · current=primary 링).
 * 다른 점은 역할이다:
 *  - Timeline      : 시간순 **이벤트 로그**. 항목이 계속 쌓이고 순서가 곧 시간이다.
 *  - StatusTimeline: 정해진 **단계 진행**. 단계 수가 고정이고, 건너뛴 단계(skipped)와
 *                    가로 진행 표시(direction)가 필요하다.
 */
export function StatusTimeline({
  steps,
  direction = 'vertical',
  showMeta = true,
  doneIcon,
  skippedIcon,
}: StatusTimelineProps) {
  const rootClassName = [styles.root, styles[direction]].join(' ')

  return (
    <ol className={rootClassName}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        // 연결선은 "이 단계에서 다음 단계로" 가는 구간 — 이 단계가 done일 때만 채운다
        const connectorClassName = [
          styles.connector,
          step.state === 'done' ? styles.connectorDone : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <li key={step.key} className={[styles.step, styles[step.state]].join(' ')}>
            <div className={styles.marker}>
              <span className={styles.dot} aria-hidden="true">
                {step.state === 'done' && (doneIcon ?? <Check size={12} strokeWidth={3} />)}
                {step.state === 'skipped' && (skippedIcon ?? <Minus size={12} strokeWidth={3} />)}
              </span>
              {!isLast && <span className={connectorClassName} aria-hidden="true" />}
            </div>

            <div className={styles.content}>
              <span className={styles.label} title={step.label}>
                {step.label}
              </span>
              {showMeta && (step.at != null || step.by != null) && (
                <span className={styles.meta}>
                  {step.at != null && <span className={styles.at}>{step.at}</span>}
                  {step.at != null && step.by != null && (
                    <span className={styles.sep} aria-hidden="true">
                      ·
                    </span>
                  )}
                  {step.by != null && <span className={styles.by}>{step.by}</span>}
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
