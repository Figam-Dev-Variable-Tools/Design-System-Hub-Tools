import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Eye, Save, Send, X } from 'lucide-react'
import { AttachmentList, type Attachment } from '../AttachmentList/AttachmentList'
import { Button } from '../Button/Button'
import { Checkbox } from '../Checkbox/Checkbox'
import { DropZone } from '../DropZone/DropZone'
import { InputBase } from '../InputBase/InputBase'
import { Modal } from '../Modal/Modal'
import { RichTextEditor } from '../RichTextEditor/RichTextEditor'
import { Select } from '../Select/Select'
import { Toggle } from '../Toggle/Toggle'
import { mergeLabels, type DeepPartialOneLevel, type LabelFn } from '../../shared/labels'
import styles from './AnswerForm.module.css'

/** 자주 쓰는 답변 템플릿 */
export type AnswerTemplate = { key: string; label: string; content: string }

/** 발송 채널 — 문자/이메일/알림톡 */
export type AnswerNotify = { sms: boolean; email: boolean; kakao: boolean }

export type AnswerDraft = {
  content: string
  isPublic: boolean
  attachments: Attachment[]
  notify: AnswerNotify
  templateKey?: string
}

export type AnswerFormLabels = {
  /** 수정 모드 배너 */
  editBanner: {
    title: string
    reason: string
    reasonPlaceholder: string
    /** 사유가 비었을 때의 오류 문구 */
    reasonRequired: string
    /** 사유가 채워졌을 때의 도움말 */
    reasonHint: string
  }
  template: {
    label: string
    placeholder: string
    hint: string
    /** 작성 중인 내용을 덮어쓰기 전 확인 */
    overwriteConfirm: string
  }
  content: { label: string; placeholder: string }
  attachments: {
    label: string
    /** 인자는 허용 최대 용량(MB) */
    hint: LabelFn<number>
  }
  visibility: { label: string; publicHint: string; privateHint: string }
  notify: {
    label: string
    hint: string
    /** 채널 체크박스 문구 — 키는 AnswerNotify와 1:1 */
    channels: Record<keyof AnswerNotify, string>
  }
  actions: {
    /** 제출 중 — submitLabel을 넘겨도 '지금 보내는 중'이 먼저다 */
    submitting: string
    /** mode='create' 제출 버튼 */
    submitCreate: string
    /** mode='edit' 제출 버튼 */
    submitEdit: string
    cancel: string
    preview: string
    draft: string
  }
  preview: {
    title: string
    close: string
    public: string
    private: string
    /** 인자는 선택된 채널 문구 목록 */
    sent: LabelFn<string[]>
    noChannel: string
  }
}

export const DEFAULT_ANSWER_FORM_LABELS: AnswerFormLabels = {
  editBanner: {
    title: '답변 수정',
    reason: '수정 사유',
    reasonPlaceholder: '수정 사유를 입력하세요 (이력에 기록됩니다)',
    reasonRequired: '수정 사유는 필수입니다.',
    reasonHint: '답변 이력에 변경 내용으로 남습니다.',
  },
  template: {
    label: '자주 쓰는 답변',
    placeholder: '템플릿을 선택하세요',
    hint: '선택하면 답변 내용이 템플릿으로 채워집니다.',
    overwriteConfirm: '작성 중인 내용을 템플릿으로 덮어씁니다. 계속할까요?',
  },
  content: { label: '답변 내용', placeholder: '답변 내용을 입력하세요' },
  attachments: {
    label: '이미지/파일 첨부',
    hint: (maxSizeMb) => `이미지·문서 파일 · 최대 ${maxSizeMb}MB`,
  },
  visibility: {
    label: '공개 여부',
    publicHint: '다른 고객에게도 공개됩니다.',
    privateHint: '문의한 고객만 볼 수 있습니다.',
  },
  notify: {
    label: '발송 채널',
    hint: '답변 등록 시 선택한 채널로 알림을 보냅니다.',
    channels: { sms: 'SMS', email: '이메일', kakao: '알림톡' },
  },
  actions: {
    submitting: '등록 중...',
    submitCreate: '등록',
    submitEdit: '수정 완료',
    cancel: '취소',
    preview: '미리보기',
    draft: '임시저장',
  },
  preview: {
    title: '답변 미리보기',
    close: '닫기',
    public: '공개 답변',
    private: '비공개 답변',
    sent: (channels) => `발송: ${channels.join(' · ')}`,
    noChannel: '발송 채널 없음',
  },
}

export type AnswerFormProps = {
  value: AnswerDraft
  onChange: (v: AnswerDraft) => void
  /** 자주 쓰는 답변 — 고르면 content를 채운다 */
  templates?: AnswerTemplate[]
  onSubmit?: () => void
  onSaveDraft?: () => void
  onCancel?: () => void
  onPreview?: () => void
  submitting?: boolean
  /** edit면 '수정 사유' 필드가 노출된다 */
  mode?: 'create' | 'edit'
  editReason?: string
  onEditReasonChange?: (v: string) => void
  /** mode='edit' 수정일/수정자 표기 슬롯 (선택) */
  editMeta?: ReactNode

  /* ── 섹션 ON/OFF — 전부 기본 true. false면 그 블록이 DOM에서 통째로 사라진다 ── */
  /** 이미지/파일 첨부(DropZone + 목록). 첨부를 안 받는 문의 유형에서 끈다 */
  showAttachments?: boolean
  /** 공개 여부 토글 — 항상 비공개로만 답하는 채널(1:1 상담)에서는 선택지 자체가 없다 */
  showVisibility?: boolean
  /** 발송 채널 체크박스 — 알림 발송을 서버가 정하는 운영에서는 끈다 */
  showNotify?: boolean
  /** 미리보기 버튼 + 미리보기 모달 */
  showPreview?: boolean

  /* ── 아이콘 슬롯 ── */
  /** 미리보기 버튼 아이콘 (기본 Eye) */
  viewIcon?: ReactNode
  /** 임시저장 버튼 아이콘 (기본 Save) */
  saveIcon?: ReactNode
  /** 등록 버튼 아이콘 (기본 Send) */
  submitIcon?: ReactNode

  /** 문구 — 개별 prop(submitLabel·cancelLabel·previewLabel·draftLabel)이 있으면 그쪽이 이긴다 */
  labels?: DeepPartialOneLevel<AnswerFormLabels>

  /* ── 버튼 문구 ── */
  /** 등록 버튼 문구 — 기본은 모드에 따라 '등록' / '수정 완료'. 제출 중에는 '등록 중...'이 우선한다 */
  submitLabel?: string
  /**
   * @deprecated labels.actions.cancel을 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
  cancelLabel?: string
  /**
   * @deprecated labels.actions.preview를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
  previewLabel?: string
  /**
   * @deprecated labels.actions.draft를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다.
   */
  draftLabel?: string
}

/** 체크박스 렌더 순서 — 문구는 labels.notify.channels가 갖는다 */
const NOTIFY_KEYS: (keyof AnswerNotify)[] = ['sms', 'email', 'kakao']

const ACCEPT = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.hwp,.hwpx,.zip'
const MAX_SIZE_MB = 20

/** 빈 본문 판정 — RichTextEditor(execCommand)가 남기는 <br>, <p><br></p>도 빈 것으로 본다 */
function isEmptyHtml(html: string): boolean {
  return html.replace(/<br\s*\/?>|<\/?(p|div)>|&nbsp;|\s/gi, '') === ''
}

export function AnswerForm({
  value,
  onChange,
  templates = [],
  onSubmit,
  onSaveDraft,
  onCancel,
  onPreview,
  submitting = false,
  mode = 'create',
  editReason = '',
  onEditReasonChange,
  editMeta,
  showAttachments = true,
  showVisibility = true,
  showNotify = true,
  showPreview = true,
  viewIcon,
  saveIcon,
  submitIcon,
  labels,
  submitLabel,
  cancelLabel,
  previewLabel,
  draftLabel,
}: AnswerFormProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  // 첨부 id 채번 — File에는 안정적인 식별자가 없다
  const seq = useRef(0)

  // 우선순위: 개별 prop > labels > 기본값.
  // mergeLabels는 그룹 안의 undefined를 걸러내므로, 넘기지 않은 개별 prop이 기본값을 지우지 않는다.
  const L = mergeLabels(mergeLabels(DEFAULT_ANSWER_FORM_LABELS, labels), {
    actions: { cancel: cancelLabel, preview: previewLabel, draft: draftLabel },
  })

  const isEdit = mode === 'edit'
  const contentEmpty = isEmptyHtml(value.content)
  const reasonEmpty = editReason.trim() === ''
  // 등록 가능 조건: 본문 필수 + (수정 모드면) 수정 사유 필수
  const canSubmit = !submitting && !contentEmpty && (!isEdit || !reasonEmpty)

  // 제출 중 문구가 늘 앞선다 — submitLabel을 넘겨도 '지금 보내는 중'이라는 사실이 먼저다
  const submitText = submitting
    ? L.actions.submitting
    : (submitLabel ?? (isEdit ? L.actions.submitEdit : L.actions.submitCreate))

  // 공개 여부·발송 채널이 둘 다 꺼지면 옵션 줄 자체가 없다(빈 보더 블록 금지)
  const hasOptions = showVisibility || showNotify

  const patch = (next: Partial<AnswerDraft>) => onChange({ ...value, ...next })

  /** 템플릿 선택 — 작성 중인 내용이 있으면 덮어쓰기 전에 확인 */
  const selectTemplate = (key: string) => {
    const template = templates.find((t) => t.key === key)
    if (template == null) return
    if (!contentEmpty && !window.confirm(L.template.overwriteConfirm)) return
    patch({ content: template.content, templateKey: key })
  }

  const addFiles = (files: File[]) => {
    const added: Attachment[] = files.map((file) => {
      seq.current += 1
      // 로컬 미리보기용 objectURL — 이미지는 썸네일로도 쓴다
      const url = URL.createObjectURL(file)
      return {
        id: `a${seq.current}-${file.name}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url,
        thumbnail: file.type.startsWith('image/') ? url : undefined,
      }
    })
    patch({ attachments: [...value.attachments, ...added] })
  }

  const removeAttachment = (target: Attachment) => {
    patch({ attachments: value.attachments.filter((a) => a.id !== target.id) })
  }

  const openPreview = () => {
    setPreviewOpen(true)
    onPreview?.()
  }

  const notifyLabels = NOTIFY_KEYS.filter((key) => value.notify[key]).map(
    (key) => L.notify.channels[key],
  )

  return (
    <div className={styles.root}>
      {/* ── 수정 모드 — 수정 사유(필수) + 수정일/수정자 슬롯 ── */}
      {isEdit && (
        <section className={styles.editBanner}>
          <div className={styles.editHead}>
            <h3 className={styles.editTitle}>{L.editBanner.title}</h3>
            {editMeta != null && <div className={styles.editMeta}>{editMeta}</div>}
          </div>
          <InputBase
            label={L.editBanner.reason}
            required
            value={editReason}
            onChange={(v) => onEditReasonChange?.(v)}
            placeholder={L.editBanner.reasonPlaceholder}
            error={reasonEmpty}
            helperText={reasonEmpty ? L.editBanner.reasonRequired : L.editBanner.reasonHint}
            maxLength={100}
            showCounter
          />
        </section>
      )}

      {/* ── 템플릿 ── */}
      {templates.length > 0 && (
        <section className={styles.section}>
          <Select
            label={L.template.label}
            value={value.templateKey ?? null}
            onChange={selectTemplate}
            options={templates.map((t) => ({ value: t.key, label: t.label }))}
            placeholder={L.template.placeholder}
            helperText={L.template.hint}
          />
        </section>
      )}

      {/* ── 답변 내용 ── */}
      <section className={styles.section}>
        <span className={styles.label}>
          {L.content.label}
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        </span>
        <RichTextEditor
          value={value.content}
          onChange={(html) => patch({ content: html })}
          placeholder={L.content.placeholder}
          minHeight={200}
          disabled={submitting}
        />
      </section>

      {/* ── 첨부 ── */}
      {showAttachments && (
        <section className={styles.section}>
          <span className={styles.label}>{L.attachments.label}</span>
          <DropZone
            onFiles={addFiles}
            accept={ACCEPT}
            multiple
            maxSizeMb={MAX_SIZE_MB}
            disabled={submitting}
            hint={L.attachments.hint(MAX_SIZE_MB)}
          />
          {value.attachments.length > 0 && (
            <div className={styles.attachments}>
              <AttachmentList items={value.attachments} onRemove={removeAttachment} compact />
            </div>
          )}
        </section>
      )}

      {/* ── 공개 여부 · 발송 채널 ── */}
      {hasOptions && (
        <section className={styles.options}>
          {showVisibility && (
            <div className={styles.option}>
              <div className={styles.optionText}>
                <span className={styles.label}>{L.visibility.label}</span>
                <span className={styles.help}>
                  {value.isPublic ? L.visibility.publicHint : L.visibility.privateHint}
                </span>
              </div>
              <Toggle
                checked={value.isPublic}
                onChange={(checked) => patch({ isPublic: checked })}
                disabled={submitting}
              />
            </div>
          )}

          {showNotify && (
            <div className={styles.option}>
              <div className={styles.optionText}>
                <span className={styles.label}>{L.notify.label}</span>
                <span className={styles.help}>{L.notify.hint}</span>
              </div>
              <div className={styles.channels}>
                {NOTIFY_KEYS.map((key) => (
                  <Checkbox
                    key={key}
                    label={L.notify.channels[key]}
                    checked={value.notify[key]}
                    disabled={submitting}
                    onChange={(checked) => patch({ notify: { ...value.notify, [key]: checked } })}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── 액션 ── */}
      <div className={styles.actions}>
        {/* 미리보기를 끄면 좌측 묶음도 함께 사라진다 — 우측 버튼들은 actions의 정렬로 그대로 오른쪽에 붙는다 */}
        {showPreview && (
          <div className={styles.actionsLeft}>
            <Button
              variant="secondary"
              appearance="outline"
              size="md"
              label={L.actions.preview}
              showLeftIcon
              leftIcon={viewIcon ?? <Eye size={16} />}
              disabled={contentEmpty}
              onClick={openPreview}
            />
          </div>
        )}
        <div className={styles.actionsRight}>
          <Button
            variant="secondary"
            appearance="ghost"
            size="md"
            label={L.actions.cancel}
            showLeftIcon
            leftIcon={<X size={16} />}
            disabled={submitting}
            onClick={onCancel}
          />
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label={L.actions.draft}
            showLeftIcon
            leftIcon={saveIcon ?? <Save size={16} />}
            disabled={submitting}
            onClick={onSaveDraft}
          />
          <Button
            variant="primary"
            size="md"
            label={submitText}
            showLeftIcon
            leftIcon={submitIcon ?? <Send size={16} />}
            disabled={!canSubmit}
            onClick={onSubmit}
          />
        </div>
      </div>

      {/* ── 미리보기 ── */}
      <Modal
        open={showPreview && previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={L.preview.title}
        size="md"
        footer={
          <Button
            variant="secondary"
            appearance="outline"
            size="md"
            label={L.preview.close}
            onClick={() => setPreviewOpen(false)}
          />
        }
      >
        <div className={styles.preview}>
          <div className={styles.previewMeta}>
            <span className={styles.previewTag}>
              {value.isPublic ? L.preview.public : L.preview.private}
            </span>
            <span className={styles.previewChannels}>
              {notifyLabels.length > 0 ? L.preview.sent(notifyLabels) : L.preview.noChannel}
            </span>
          </div>
          {/* 에디터가 만든 자체 HTML을 그대로 렌더한다(외부 입력 아님) */}
          <div
            className={styles.previewBody}
            dangerouslySetInnerHTML={{ __html: value.content }}
          />
          {value.attachments.length > 0 && (
            <div className={styles.previewAttachments}>
              <AttachmentList items={value.attachments} compact />
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
