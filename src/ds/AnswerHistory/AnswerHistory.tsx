import { useState } from 'react'
import type { ReactNode } from 'react'
import { History, RotateCcw } from 'lucide-react'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { EmptyState } from '../EmptyState/EmptyState'
import { Modal } from '../Modal/Modal'
import styles from './AnswerHistory.module.css'

export type AnswerVersion = {
  version: number
  author: string
  createdAt: string
  updatedAt?: string
  /** 변경 내용(수정 사유) */
  changeNote?: string
  content: string
}

export type AnswerHistoryProps = {
  versions: AnswerVersion[]
  onViewVersion?: (v: AnswerVersion) => void
  onRestore?: (v: AnswerVersion) => void

  /** '이전 버전 보기' 버튼 + 내용 모달. 기본 true — 읽기 전용 요약에서 끈다 */
  showView?: boolean
  /** 최신 버전의 '현재 버전' 배지. 기본 true — 목록이 1건뿐이면 군더더기라 끌 수 있다 */
  showLatestBadge?: boolean
  /** 작성일 · 수정일 줄. 기본 true */
  showMeta?: boolean

  /** '이전 버전 보기' 아이콘 (기본 History) */
  viewIcon?: ReactNode

  /** 이력이 0건일 때 빈 상태 제목 */
  emptyTitle?: string
  /** 이력이 0건일 때 빈 상태 설명 */
  emptyDescription?: string
  /** 최신 버전 배지 문구 (기본 '현재 버전') */
  latestLabel?: string
  /** 보기 버튼 문구 (기본 '이전 버전 보기') */
  viewLabel?: string
  /** 복원 버튼 문구 (기본 '복원') — 모달의 확인 버튼은 '이 버전으로 {restoreLabel}' */
  restoreLabel?: string
}

/**
 * AnswerHistory — 답변 이력.
 *
 * 시각 언어는 Timeline/StatusTimeline과 맞춘다(점 + 연결선).
 *
 * 공용 Timeline을 쓰지 않고 점·연결선을 직접 그리는 이유:
 * Timeline의 항목(TimelineItem)은 title·description·time·status만 받는 **데이터 슬롯**이라
 * 이 화면이 행마다 요구하는 배지('현재 버전')와 버튼([보기][복원])을 꽂을 자리가 없다.
 * 항목을 ReactNode로 여는 건 공용 Timeline의 계약을 바꾸는 일이라(다른 사용처 전부에 영향),
 * 여기서는 같은 토큰(12px 점 · 2px 연결선)으로 시각만 맞추고 마크업은 따로 든다.
 */
export function AnswerHistory({
  versions,
  onViewVersion,
  onRestore,
  showView = true,
  showLatestBadge = true,
  showMeta = true,
  viewIcon,
  emptyTitle = '답변 이력이 없습니다.',
  emptyDescription = '답변이 등록되면 버전별 이력이 여기에 쌓입니다.',
  latestLabel = '현재 버전',
  viewLabel = '이전 버전 보기',
  restoreLabel = '복원',
}: AnswerHistoryProps) {
  const [viewing, setViewing] = useState<AnswerVersion | null>(null)

  if (versions.length === 0) {
    return <EmptyState kind="empty" title={emptyTitle} description={emptyDescription} compact />
  }

  // 최신 버전이 위로 — 원본 배열은 건드리지 않는다
  const ordered = [...versions].sort((a, b) => b.version - a.version)
  const latest = ordered[0].version

  const view = (target: AnswerVersion) => {
    setViewing(target)
    onViewVersion?.(target)
  }

  return (
    <div className={styles.root}>
      <ol className={styles.list}>
        {ordered.map((item, index) => {
          const isLatest = item.version === latest
          const isLast = index === ordered.length - 1

          return (
            <li key={item.version} className={styles.item}>
              <div className={styles.marker}>
                <span
                  className={[styles.dot, isLatest ? styles.dotLatest : ''].filter(Boolean).join(' ')}
                  aria-hidden="true"
                />
                {!isLast && <span className={styles.connector} aria-hidden="true" />}
              </div>

              <div className={styles.card}>
                <div className={styles.head}>
                  <span className={styles.version}>v{item.version}</span>
                  {isLatest && showLatestBadge && (
                    <Badge variant="primary" appearance="soft" size="sm" label={latestLabel} />
                  )}
                  <span className={styles.author} title={item.author}>
                    {item.author}
                  </span>
                </div>

                {showMeta && (
                  <div className={styles.meta}>
                    <span className={styles.metaItem}>작성 {item.createdAt}</span>
                    {item.updatedAt != null && (
                      <>
                        <span className={styles.sep} aria-hidden="true">
                          ·
                        </span>
                        <span className={styles.metaItem}>수정 {item.updatedAt}</span>
                      </>
                    )}
                  </div>
                )}

                {item.changeNote != null && item.changeNote !== '' && (
                  <p className={styles.note} title={item.changeNote}>
                    {item.changeNote}
                  </p>
                )}

                {/* 보기·복원이 둘 다 없으면 빈 액션 줄이 남지 않게 통째로 뺀다 */}
                {(showView || (onRestore != null && !isLatest)) && (
                  <div className={styles.actions}>
                    {showView && (
                      <Button
                        variant="secondary"
                        appearance="outline"
                        size="sm"
                        label={viewLabel}
                        showLeftIcon
                        leftIcon={viewIcon ?? <History size={14} />}
                        onClick={() => view(item)}
                      />
                    )}
                    {onRestore != null && !isLatest && (
                      <Button
                        variant="secondary"
                        appearance="ghost"
                        size="sm"
                        label={restoreLabel}
                        showLeftIcon
                        leftIcon={<RotateCcw size={14} />}
                        onClick={() => onRestore(item)}
                      />
                    )}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      <Modal
        open={viewing != null}
        onClose={() => setViewing(null)}
        title={viewing == null ? undefined : `버전 v${viewing.version} 내용`}
        size="md"
        footer={
          <div className={styles.modalFooter}>
            <Button
              variant="secondary"
              appearance="outline"
              size="md"
              label="닫기"
              onClick={() => setViewing(null)}
            />
            {onRestore != null && viewing != null && viewing.version !== latest && (
              <Button
                variant="primary"
                size="md"
                label={`이 버전으로 ${restoreLabel}`}
                showLeftIcon
                leftIcon={<RotateCcw size={16} />}
                onClick={() => {
                  onRestore(viewing)
                  setViewing(null)
                }}
              />
            )}
          </div>
        }
      >
        {viewing != null && (
          <div className={styles.preview}>
            <div className={styles.previewMeta}>
              <span className={styles.metaItem}>
                {viewing.author} · 작성 {viewing.createdAt}
              </span>
              {viewing.changeNote != null && viewing.changeNote !== '' && (
                <span className={styles.previewNote}>변경 내용: {viewing.changeNote}</span>
              )}
            </div>
            {/* 저장된 답변 HTML을 그대로 렌더한다(에디터 자체 출력) */}
            <div
              className={styles.previewBody}
              dangerouslySetInnerHTML={{ __html: viewing.content }}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
