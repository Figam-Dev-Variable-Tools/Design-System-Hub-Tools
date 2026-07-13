import { useState } from 'react'
import type { ReactNode } from 'react'
import { History, RotateCcw } from 'lucide-react'
import { Badge, type BadgeProps } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { EmptyState } from '../EmptyState/EmptyState'
import { Modal } from '../Modal/Modal'
import {
  mergeLabels,
  type DeepPartialOneLevel,
  type EmptyLabels,
  type LabelFn,
} from '../../shared/labels'
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

export type AnswerHistoryLabels = {
  /** 버전 접두 — 'v' + 3 → v3 */
  versionPrefix: string
  /** 최신 버전 배지 */
  latest: string
  actions: {
    view: string
    /** 복원 — 모달 확인 버튼은 modal.restore가 이 문구를 받아 조립한다 */
    restore: string
  }
  meta: {
    created: LabelFn<string>
    updated: LabelFn<string>
  }
  empty: EmptyLabels
  modal: {
    title: LabelFn<number>
    close: string
    /** 확인 버튼 — 인자는 actions.restore로 해석된 문구다 */
    restore: LabelFn<string>
    meta: (version: AnswerVersion) => string
    note: LabelFn<string>
  }
}

/** EmptyLabels의 title/description은 옵셔널(공용 타입)이라 최종 기본값을 이름으로 둔다 */
const DEFAULT_EMPTY_TITLE = '답변 이력이 없습니다.'

export const DEFAULT_ANSWER_HISTORY_LABELS: AnswerHistoryLabels = {
  versionPrefix: 'v',
  latest: '현재 버전',
  actions: { view: '이전 버전 보기', restore: '복원' },
  meta: {
    created: (at) => `작성 ${at}`,
    updated: (at) => `수정 ${at}`,
  },
  empty: {
    title: DEFAULT_EMPTY_TITLE,
    description: '답변이 등록되면 버전별 이력이 여기에 쌓입니다.',
  },
  modal: {
    title: (version) => `버전 v${version} 내용`,
    close: '닫기',
    restore: (restoreLabel) => `이 버전으로 ${restoreLabel}`,
    meta: (v) => `${v.author} · 작성 ${v.createdAt}`,
    note: (note) => `변경 내용: ${note}`,
  },
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

  /** '현재 버전' 배지 톤 (기본 primary) — 강조 규약이 다른 화면에 맞춘다 */
  latestTone?: BadgeProps['variant']

  /** 문구 — 개별 prop(emptyTitle·latestLabel·viewLabel·restoreLabel …)이 있으면 그쪽이 이긴다 */
  labels?: DeepPartialOneLevel<AnswerHistoryLabels>

  /**
   * @deprecated labels.empty.title을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
  emptyTitle?: string
  /**
   * @deprecated labels.empty.description을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
  emptyDescription?: string
  /**
   * @deprecated labels.latest를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
  latestLabel?: string
  /**
   * @deprecated labels.actions.view를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
  viewLabel?: string
  /**
   * @deprecated labels.actions.restore를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
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
  latestTone = 'primary',
  labels,
  emptyTitle,
  emptyDescription,
  latestLabel,
  viewLabel,
  restoreLabel,
}: AnswerHistoryProps) {
  const [viewing, setViewing] = useState<AnswerVersion | null>(null)

  // 우선순위: 개별 prop > labels > 기본값.
  // mergeLabels는 그룹 안의 undefined를 걸러내므로, 넘기지 않은 개별 prop이 기본값을 지우지 않는다.
  const L = mergeLabels(mergeLabels(DEFAULT_ANSWER_HISTORY_LABELS, labels), {
    latest: latestLabel,
    actions: { view: viewLabel, restore: restoreLabel },
    empty: { title: emptyTitle, description: emptyDescription },
  })

  if (versions.length === 0) {
    return (
      <EmptyState
        kind="empty"
        title={L.empty.title ?? DEFAULT_EMPTY_TITLE}
        description={L.empty.description}
        compact
      />
    )
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
                  <span className={styles.version}>
                    {L.versionPrefix}
                    {item.version}
                  </span>
                  {isLatest && showLatestBadge && (
                    <Badge variant={latestTone} appearance="soft" size="sm" label={L.latest} />
                  )}
                  <span className={styles.author} title={item.author}>
                    {item.author}
                  </span>
                </div>

                {showMeta && (
                  <div className={styles.meta}>
                    <span className={styles.metaItem}>{L.meta.created(item.createdAt)}</span>
                    {item.updatedAt != null && (
                      <>
                        <span className={styles.sep} aria-hidden="true">
                          ·
                        </span>
                        <span className={styles.metaItem}>{L.meta.updated(item.updatedAt)}</span>
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
                        label={L.actions.view}
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
                        label={L.actions.restore}
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
        title={viewing == null ? undefined : L.modal.title(viewing.version)}
        size="md"
        footer={
          <div className={styles.modalFooter}>
            <Button
              variant="secondary"
              appearance="outline"
              size="md"
              label={L.modal.close}
              onClick={() => setViewing(null)}
            />
            {onRestore != null && viewing != null && viewing.version !== latest && (
              <Button
                variant="primary"
                size="md"
                label={L.modal.restore(L.actions.restore)}
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
              <span className={styles.metaItem}>{L.modal.meta(viewing)}</span>
              {viewing.changeNote != null && viewing.changeNote !== '' && (
                <span className={styles.previewNote}>{L.modal.note(viewing.changeNote)}</span>
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
