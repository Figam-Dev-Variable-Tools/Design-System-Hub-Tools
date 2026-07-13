import { useState } from 'react'
import type { ReactNode } from 'react'
import { Bell, Mail, MessageCircle, Plus, Smartphone } from 'lucide-react'
import styles from './InquirySettings.module.css'
import { AdminTable, type AdminColumn } from '../AdminTable/AdminTable'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { CrudDialog } from '../CrudDialog/CrudDialog'
import { EmptyState } from '../EmptyState/EmptyState'
import { InputBase } from '../InputBase/InputBase'
import { MultiSelect } from '../MultiSelect/MultiSelect'
import { NumberField } from '../NumberField/NumberField'
import { PageContainer, PageSection } from '../PageContainer/PageContainer'
import { RowActions } from '../RowActions/RowActions'
import { Select, type SelectOption } from '../Select/Select'
import { SortableHandle, SortableList } from '../SortableList/SortableList'
import { Tab } from '../Tab/Tab'
import { Textarea } from '../Textarea/Textarea'
import { Toggle } from '../Toggle/Toggle'

/** 배지/라벨 톤 — Badge variant와 1:1 */
export type InquiryTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error'

/** 문의 유형 1건 — 배열 순서가 곧 노출 순서 */
export type InquiryTypeItem = { key: string; label: string; enabled: boolean }

/** 문의 상태 배지 스타일 — 라벨/톤을 운영자가 편집한다 */
export type InquiryStatusStyle = { key: string; label: string; tone: InquiryTone }

/** 자동 기능 — SLA는 응답 목표 시간(시간 단위) */
export type InquiryAutomation = {
  autoAssign: boolean
  autoReply: boolean
  faqSuggest: boolean
  slaHours: number
}

/** 알림 채널 on/off */
export type InquiryNotification = { email: boolean; sms: boolean; kakao: boolean; admin: boolean }

export type InquiryNotificationChannel = keyof InquiryNotification

/** 채널별 수신 대상 (targetOptions의 value 목록) */
export type InquiryNotificationTargets = Record<InquiryNotificationChannel, string[]>

/** 답변 템플릿 1건 */
export type InquiryTemplate = {
  id: string
  title: string
  /** 연결된 문의 유형 키 — 미지정이면 전체 공통 */
  typeKey: string
  body: string
  updatedAt: string
}

export type InquirySection = 'types' | 'automation' | 'notification' | 'status'

export type InquirySettingsProps = {
  types: InquiryTypeItem[]
  onTypesChange?: (next: InquiryTypeItem[]) => void
  automation: InquiryAutomation
  onAutomationChange?: (next: InquiryAutomation) => void
  notification: InquiryNotification
  onNotificationChange?: (next: InquiryNotification) => void
  statuses: InquiryStatusStyle[]
  onStatusesChange?: (next: InquiryStatusStyle[]) => void
  /** 답변 템플릿 목록 — 자동화 섹션에서 CRUD */
  templates?: InquiryTemplate[]
  onTemplatesChange?: (next: InquiryTemplate[]) => void
  /** 채널별 수신 대상 — 미지정 시 컴포넌트가 내부 상태로 관리(비제어) */
  notificationTargets?: InquiryNotificationTargets
  onNotificationTargetsChange?: (next: InquiryNotificationTargets) => void
  /** 수신 대상 후보 */
  targetOptions?: SelectOption[]
  /** 노출할 섹션 — 1개면 탭 바를 숨긴다 */
  sections?: InquirySection[]
  /** 처음 열릴 탭 */
  defaultSection?: InquirySection

  /* ── 요소 ON/OFF — 기본 true. false면 그 영역이 DOM에서 통째로 사라진다 ── */
  /** 자동화 탭의 [답변 템플릿] 카드 — 템플릿을 안 쓰는 운영에서 끈다 */
  showTemplates?: boolean
  /** 상태 배지 탭의 '미리보기' 열 — 끄면 그리드가 3열로 줄어든다(빈 열이 남지 않게) */
  showPreview?: boolean

  /* ── 아이콘 슬롯 ── */
  /**
   * '유형 추가' · '템플릿 추가' 버튼 아이콘 (기본 Plus).
   * 행의 [수정][삭제] 아이콘은 공용 RowActions가 갖고 있어 여기서 열지 않는다.
   */
  addIcon?: ReactNode
}

const ALL_SECTIONS: InquirySection[] = ['types', 'automation', 'notification', 'status']

const SECTION_LABEL: Record<InquirySection, string> = {
  types: '문의 유형',
  automation: '자동화',
  notification: '알림',
  status: '상태 배지',
}

const TONE_OPTIONS: SelectOption[] = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
]

const DEFAULT_TARGET_OPTIONS: SelectOption[] = [
  { value: 'customer', label: '문의 고객' },
  { value: 'manager', label: '담당자' },
  { value: 'admin', label: '관리자' },
  { value: 'cs-team', label: 'CS팀 전체' },
]

const DEFAULT_TARGETS: InquiryNotificationTargets = {
  email: ['customer'],
  sms: ['customer'],
  kakao: ['customer'],
  admin: ['manager'],
}

const NOTIFICATION_CHANNELS: {
  key: InquiryNotificationChannel
  title: string
  description: string
  icon: ReactNode
}[] = [
  { key: 'email', title: '이메일', description: '접수·답변 완료 시 메일을 발송합니다.', icon: <Mail size={16} /> },
  { key: 'sms', title: 'SMS', description: '답변 완료 시 문자 메시지를 발송합니다.', icon: <Smartphone size={16} /> },
  { key: 'kakao', title: '카카오 알림톡', description: '알림톡 템플릿으로 발송합니다.', icon: <MessageCircle size={16} /> },
  { key: 'admin', title: '관리자 알림', description: '새 문의·SLA 임박을 관리자에게 알립니다.', icon: <Bell size={16} /> },
]

/** 유형/템플릿 다이얼로그 — 대상 없이 열리면 등록 */
type DialogMode = 'create' | 'edit' | 'delete'
type DialogState<T> = { mode: DialogMode; target: T | null }

const EMPTY_TYPE: InquiryTypeItem = { key: '', label: '', enabled: true }
const EMPTY_TEMPLATE: InquiryTemplate = { id: '', title: '', typeKey: '', body: '', updatedAt: '' }

/** 라벨 → 안전한 키. 한글만 남으면 타임스탬프로 대체한다 */
function toKey(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug !== '' ? slug : `type-${Date.now()}`
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/** 아이콘 + 제목/설명 + 우측 컨트롤 — 자동화·알림 섹션 공용 행 */
function SettingRow({
  icon,
  title,
  description,
  children,
}: {
  icon?: ReactNode
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className={styles.settingRow}>
      {icon != null && (
        <span className={styles.settingIcon} aria-hidden="true">
          {icon}
        </span>
      )}
      <div className={styles.settingText}>
        <span className={styles.settingTitle}>{title}</span>
        {description != null && <span className={styles.settingDesc}>{description}</span>}
      </div>
      <div className={styles.settingControl}>{children}</div>
    </div>
  )
}

/** 문의 설정 — 유형 / 자동화 / 알림 / 상태 배지를 한 화면에서 관리한다 */
export function InquirySettings({
  types,
  onTypesChange,
  automation,
  onAutomationChange,
  notification,
  onNotificationChange,
  statuses,
  onStatusesChange,
  templates = [],
  onTemplatesChange,
  notificationTargets,
  onNotificationTargetsChange,
  targetOptions = DEFAULT_TARGET_OPTIONS,
  sections = ALL_SECTIONS,
  defaultSection,
  showTemplates = true,
  showPreview = true,
  addIcon,
}: InquirySettingsProps) {
  const visibleSections = sections.length > 0 ? sections : ALL_SECTIONS
  const [section, setSection] = useState<InquirySection>(defaultSection ?? visibleSections[0])

  // 수신 대상은 제어(prop) / 비제어(내부 상태) 모두 지원
  const [internalTargets, setInternalTargets] = useState<InquiryNotificationTargets>(DEFAULT_TARGETS)
  const targets = notificationTargets ?? internalTargets
  const setTargets = (next: InquiryNotificationTargets) => {
    onNotificationTargetsChange?.(next)
    if (notificationTargets == null) setInternalTargets(next)
  }

  // ── 유형 다이얼로그 ────────────────────────────────────────────────
  const [typeDialog, setTypeDialog] = useState<DialogState<InquiryTypeItem> | null>(null)
  const [typeDraft, setTypeDraft] = useState<InquiryTypeItem>(EMPTY_TYPE)

  const openTypeDialog = (mode: DialogMode, target: InquiryTypeItem | null) => {
    setTypeDraft(target ?? EMPTY_TYPE)
    setTypeDialog({ mode, target })
  }

  const confirmTypeDialog = () => {
    if (typeDialog == null) return
    const { mode, target } = typeDialog

    if (mode === 'delete' && target != null) {
      onTypesChange?.(types.filter((item) => item.key !== target.key))
    } else if (mode === 'create') {
      const key = typeDraft.key.trim() !== '' ? typeDraft.key.trim() : toKey(typeDraft.label)
      onTypesChange?.([...types, { ...typeDraft, key, label: typeDraft.label.trim() }])
    } else if (target != null) {
      onTypesChange?.(
        types.map((item) =>
          item.key === target.key ? { ...typeDraft, key: target.key, label: typeDraft.label.trim() } : item,
        ),
      )
    }
    setTypeDialog(null)
  }

  const toggleType = (target: InquiryTypeItem, enabled: boolean) => {
    onTypesChange?.(types.map((item) => (item.key === target.key ? { ...item, enabled } : item)))
  }

  // ── 템플릿 다이얼로그 ──────────────────────────────────────────────
  const [templateDialog, setTemplateDialog] = useState<DialogState<InquiryTemplate> | null>(null)
  const [templateDraft, setTemplateDraft] = useState<InquiryTemplate>(EMPTY_TEMPLATE)

  const openTemplateDialog = (mode: DialogMode, target: InquiryTemplate | null) => {
    setTemplateDraft(target ?? { ...EMPTY_TEMPLATE, typeKey: types[0]?.key ?? '' })
    setTemplateDialog({ mode, target })
  }

  const confirmTemplateDialog = () => {
    if (templateDialog == null) return
    const { mode, target } = templateDialog

    if (mode === 'delete' && target != null) {
      onTemplatesChange?.(templates.filter((item) => item.id !== target.id))
    } else if (mode === 'create') {
      const id = `tpl-${Date.now()}`
      onTemplatesChange?.([...templates, { ...templateDraft, id, updatedAt: today() }])
    } else if (target != null) {
      onTemplatesChange?.(
        templates.map((item) =>
          item.id === target.id ? { ...templateDraft, id: target.id, updatedAt: today() } : item,
        ),
      )
    }
    setTemplateDialog(null)
  }

  // ── 상태 배지 ────────────────────────────────────────────────────
  const updateStatus = (key: string, patch: Partial<InquiryStatusStyle>) => {
    onStatusesChange?.(statuses.map((item) => (item.key === key ? { ...item, ...patch } : item)))
  }

  const typeLabelOf = (key: string): string =>
    types.find((item) => item.key === key)?.label ?? '전체 공통'

  const typeSelectOptions: SelectOption[] = [
    { value: '', label: '전체 공통' },
    ...types.map((item) => ({ value: item.key, label: item.label })),
  ]

  const templateColumns: AdminColumn<InquiryTemplate>[] = [
    { kind: 'index', key: 'index' },
    { kind: 'title', key: 'title', header: '템플릿명', sortable: true },
    { kind: 'category', key: 'typeKey', header: '문의 유형', value: (row) => typeLabelOf(row.typeKey) },
    { kind: 'text', key: 'body', header: '본문', ratio: 4 },
    { kind: 'date', key: 'updatedAt', header: '수정일', sortable: true },
    { kind: 'actions', key: 'actions' },
  ]

  const isDeleteMode = typeDialog?.mode === 'delete'

  // 미리보기 열이 빠지면 4열 → 3열 (머리줄과 본문 줄이 같은 격자를 써야 칸이 어긋나지 않는다)
  const statusRowClassName = [styles.statusRow, showPreview ? '' : styles.statusRowNoPreview]
    .filter(Boolean)
    .join(' ')

  return (
    <PageContainer maxWidth="lg" padding="md" gap="lg">
      {visibleSections.length > 1 && (
        <div className={styles.tabs}>
          <Tab
            items={visibleSections.map((key) => ({ value: key, label: SECTION_LABEL[key] }))}
            value={section}
            variant="underline"
            onChange={(value) => setSection(value as InquirySection)}
          />
        </div>
      )}

      {/* ── 문의 유형 ── */}
      {section === 'types' && visibleSections.includes('types') && (
        <PageSection
          title="문의 유형 관리"
          description="접수 화면에 노출되는 유형입니다. 핸들을 끌거나 Ctrl/Cmd + ↑ ↓ 로 순서를 바꿉니다."
          actions={
            <Button
              variant="primary"
              size="sm"
              label="유형 추가"
              showIcon
              icon={addIcon ?? <Plus size={14} />}
              onClick={() => openTypeDialog('create', null)}
            />
          }
        >
          {types.length === 0 ? (
            <EmptyState title="등록된 문의 유형이 없습니다." description="유형을 추가해 접수 화면을 구성하세요." compact />
          ) : (
            <SortableList<InquiryTypeItem>
              items={types}
              getId={(item) => item.key}
              onReorder={(next) => onTypesChange?.(next)}
              handleOnly
              renderItem={(item, state) => (
                <div className={styles.typeRow}>
                  <SortableHandle />
                  <span className={styles.order}>{state.index + 1}</span>
                  <span className={styles.typeMain}>
                    <span className={styles.typeLabel}>{item.label}</span>
                    <span className={styles.typeKey}>{item.key}</span>
                  </span>
                  <span className={styles.typeState}>
                    <Badge
                      variant={item.enabled ? 'success' : 'secondary'}
                      appearance="soft"
                      size="sm"
                      label={item.enabled ? '사용' : '미사용'}
                    />
                    <Toggle
                      checked={item.enabled}
                      size="sm"
                      onChange={(next) => toggleType(item, next)}
                    />
                  </span>
                  {/* [수정][삭제]는 공용 RowActions — 아이콘 버튼 한 벌을 화면마다 다시 짜지 않는다 */}
                  <span className={styles.rowActions}>
                    <RowActions
                      size="sm"
                      onEdit={() => openTypeDialog('edit', item)}
                      onDelete={() => openTypeDialog('delete', item)}
                      labels={{ edit: `${item.label} 수정`, delete: `${item.label} 삭제` }}
                    />
                  </span>
                </div>
              )}
            />
          )}
        </PageSection>
      )}

      {/* ── 자동 기능 ── */}
      {section === 'automation' && visibleSections.includes('automation') && (
        <>
          <PageSection title="자동 기능" description="문의 접수 직후 자동으로 실행할 동작입니다.">
            <div className={styles.settingList}>
              <SettingRow title="자동 배정" description="담당자 규칙에 따라 새 문의를 자동으로 배정합니다.">
                <Toggle
                  checked={automation.autoAssign}
                  onChange={(next) => onAutomationChange?.({ ...automation, autoAssign: next })}
                />
              </SettingRow>
              <SettingRow title="자동 답변" description="접수 확인 메시지를 즉시 발송합니다.">
                <Toggle
                  checked={automation.autoReply}
                  onChange={(next) => onAutomationChange?.({ ...automation, autoReply: next })}
                />
              </SettingRow>
              <SettingRow title="FAQ 추천" description="문의 내용과 유사한 FAQ를 고객에게 먼저 제안합니다.">
                <Toggle
                  checked={automation.faqSuggest}
                  onChange={(next) => onAutomationChange?.({ ...automation, faqSuggest: next })}
                />
              </SettingRow>
              <SettingRow title="SLA 응답 목표" description="접수 후 이 시간 안에 첫 답변을 목표로 합니다.">
                <span className={styles.slaField}>
                  <NumberField
                    value={automation.slaHours}
                    min={1}
                    max={168}
                    unit="시간"
                    onChange={(next) => onAutomationChange?.({ ...automation, slaHours: next })}
                  />
                </span>
              </SettingRow>
            </div>
          </PageSection>

          {showTemplates && (
            <PageSection
              title="답변 템플릿"
              description="자동 답변·상담사 답변에 사용하는 문구 묶음입니다."
              actions={
                <Button
                  variant="primary"
                  appearance="outline"
                  size="sm"
                  label="템플릿 추가"
                  showIcon
                  icon={addIcon ?? <Plus size={14} />}
                  onClick={() => openTemplateDialog('create', null)}
                />
              }
            >
              <AdminTable<InquiryTemplate>
                columns={templateColumns}
                rows={templates}
                rowKey={(row) => row.id}
                density="compact"
                emptyText="등록된 답변 템플릿이 없습니다."
                onEdit={(row) => openTemplateDialog('edit', row)}
                onDelete={(row) => openTemplateDialog('delete', row)}
              />
            </PageSection>
          )}
        </>
      )}

      {/* ── 알림 ── */}
      {section === 'notification' && visibleSections.includes('notification') && (
        <PageSection
          title="알림"
          description="채널별로 발송 여부와 수신 대상을 지정합니다."
        >
          <div className={styles.settingList}>
            {NOTIFICATION_CHANNELS.map((channel) => {
              const on = notification[channel.key]
              return (
                <SettingRow
                  key={channel.key}
                  icon={channel.icon}
                  title={channel.title}
                  description={channel.description}
                >
                  <span className={styles.notifyControl}>
                    <span className={styles.targetField}>
                      <MultiSelect
                        values={targets[channel.key]}
                        options={targetOptions}
                        placeholder="수신 대상"
                        disabled={!on}
                        onChange={(next) => setTargets({ ...targets, [channel.key]: next })}
                      />
                    </span>
                    <Toggle
                      checked={on}
                      onChange={(next) => onNotificationChange?.({ ...notification, [channel.key]: next })}
                    />
                  </span>
                </SettingRow>
              )
            })}
          </div>
        </PageSection>
      )}

      {/* ── 상태 배지 ── */}
      {section === 'status' && visibleSections.includes('status') && (
        <PageSection
          title="문의 상태 배지"
          description={
            showPreview
              ? '상태별 노출 라벨과 배지 톤을 편집합니다. 오른쪽에서 실제 배지를 미리 볼 수 있습니다.'
              : '상태별 노출 라벨과 배지 톤을 편집합니다.'
          }
        >
          <div className={styles.statusScroll}>
            {/* showPreview가 꺼지면 미리보기 열이 빠지므로 그리드도 3열로 줄인다(빈 열 금지) */}
            <div className={styles.statusGrid}>
              <div className={[statusRowClassName, styles.statusHead].join(' ')}>
                <span className={styles.cellText}>상태 코드</span>
                <span className={styles.cellText}>라벨</span>
                <span className={styles.cellText}>톤</span>
                {showPreview && <span className={styles.cellText}>미리보기</span>}
              </div>
              {statuses.map((status) => (
                <div key={status.key} className={statusRowClassName}>
                  <span className={styles.statusKey}>{status.key}</span>
                  <span className={styles.statusField}>
                    <InputBase
                      value={status.label}
                      onChange={(label) => updateStatus(status.key, { label })}
                    />
                  </span>
                  <span className={styles.statusField}>
                    <Select
                      value={status.tone}
                      options={TONE_OPTIONS}
                      onChange={(tone) => updateStatus(status.key, { tone: tone as InquiryTone })}
                    />
                  </span>
                  {showPreview && (
                    <span className={styles.statusPreview}>
                      <Badge
                        variant={status.tone}
                        appearance="soft"
                        size="md"
                        label={status.label !== '' ? status.label : status.key}
                      />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </PageSection>
      )}

      {/* ── 유형 등록/수정/삭제 ── */}
      <CrudDialog
        open={typeDialog != null}
        mode={typeDialog?.mode ?? 'create'}
        title={
          isDeleteMode
            ? '문의 유형을 삭제할까요?'
            : typeDialog?.mode === 'edit'
              ? '문의 유형 수정'
              : '문의 유형 추가'
        }
        description={
          isDeleteMode
            ? `'${typeDialog?.target?.label ?? ''}' 유형을 삭제합니다.`
            : undefined
        }
        onCancel={() => setTypeDialog(null)}
        onConfirm={confirmTypeDialog}
      >
        <div className={styles.formGrid}>
          <InputBase
            label="유형명"
            required
            value={typeDraft.label}
            placeholder="예: 배송 문의"
            onChange={(label) => setTypeDraft((prev) => ({ ...prev, label }))}
          />
          <InputBase
            label="코드"
            value={typeDraft.key}
            placeholder="비우면 자동 생성"
            readOnly={typeDialog?.mode === 'edit'}
            helperText={typeDialog?.mode === 'edit' ? '코드는 수정할 수 없습니다.' : '영문/숫자 키로 저장됩니다.'}
            onChange={(key) => setTypeDraft((prev) => ({ ...prev, key }))}
          />
          <Toggle
            checked={typeDraft.enabled}
            label="접수 화면에 노출"
            onChange={(enabled) => setTypeDraft((prev) => ({ ...prev, enabled }))}
          />
        </div>
      </CrudDialog>

      {/* ── 템플릿 등록/수정/삭제 ── */}
      <CrudDialog
        open={templateDialog != null}
        mode={templateDialog?.mode ?? 'create'}
        title={
          templateDialog?.mode === 'delete'
            ? '답변 템플릿을 삭제할까요?'
            : templateDialog?.mode === 'edit'
              ? '답변 템플릿 수정'
              : '답변 템플릿 추가'
        }
        description={
          templateDialog?.mode === 'delete'
            ? `'${templateDialog?.target?.title ?? ''}' 템플릿을 삭제합니다.`
            : undefined
        }
        onCancel={() => setTemplateDialog(null)}
        onConfirm={confirmTemplateDialog}
      >
        <div className={styles.formGrid}>
          <InputBase
            label="템플릿명"
            required
            value={templateDraft.title}
            placeholder="예: 배송 지연 안내"
            onChange={(title) => setTemplateDraft((prev) => ({ ...prev, title }))}
          />
          <Select
            label="문의 유형"
            value={templateDraft.typeKey}
            options={typeSelectOptions}
            onChange={(typeKey) => setTemplateDraft((prev) => ({ ...prev, typeKey }))}
          />
          <Textarea
            label="본문"
            rows={4}
            maxLength={500}
            showCounter
            value={templateDraft.body}
            placeholder="고객에게 발송될 답변 문구를 입력하세요."
            onChange={(body) => setTemplateDraft((prev) => ({ ...prev, body }))}
          />
        </div>
      </CrudDialog>
    </PageContainer>
  )
}
