import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { AdminFormPage, type AdminFormPageProps, type AdminFormSection } from './AdminFormPage'
import { Callout } from '../Callout/Callout'
import type { SelectOption } from '../Select/Select'

/*
 * 셸이 무엇을 대신해 주는지 보이기 위한 데모 —
 * 스토리가 선언하는 건 화면마다 다른 세 가지(값 타입 · 필드 목록 · 문구)뿐이고,
 * 골격(헤더·카드·3열 그리드·sticky 액션 바)·이미지 업로드·섹션 번호는 전부 AdminFormPage가 갖는다.
 */
type DemoValue = {
  name: string
  category: string | null
  summary: string
  image?: string
  link: string
  active: boolean
  detailEnabled: boolean
}

const CATEGORIES: SelectOption[] = [
  { label: '🏢 오피스', value: 'office' },
  { label: '🛍️ 리테일', value: 'retail' },
  { label: '🏠 주거', value: 'residential' },
]

const EMPTY: DemoValue = {
  name: '',
  category: null,
  summary: '',
  link: '',
  active: true,
  detailEnabled: true,
}

const FILLED: DemoValue = {
  name: '성수 크리에이티브 오피스',
  category: 'office',
  summary: '연면적 1,240㎡ 오피스를 하이브리드 워크 환경으로 재구성한 프로젝트입니다.',
  image: mockImage('대표 이미지', 'sage'),
  link: 'https://spaceplanning.ai/portfolio/seongsu',
  active: true,
  detailEnabled: true,
}

/**
 * 섹션 스키마 — 값을 바꾸는 섹션 토글(detailEnabled)은 화면이 갖는다.
 * 여섯 가지 kind가 모두 한 번씩 나온다(text · select · textarea · toggle · image · custom).
 */
function buildSections(
  value: DemoValue,
  onChange: (next: DemoValue) => void,
): AdminFormSection<DemoValue>[] {
  return [
    {
      key: 'basic',
      title: '기본 정보',
      description: '목록 카드에 그대로 노출되는 정보입니다.',
      fields: [
        {
          kind: 'text',
          key: 'name',
          label: '이름',
          required: true,
          span: 2,
          placeholder: '예: 성수 크리에이티브 오피스',
          maxLength: 40,
          showCounter: true,
        },
        {
          kind: 'select',
          key: 'category',
          label: '카테고리',
          required: true,
          span: 1,
          options: CATEGORIES,
          placeholder: '카테고리를 선택하세요',
        },
        {
          kind: 'textarea',
          key: 'summary',
          label: '요약',
          placeholder: '한두 문장으로 소개하세요.',
          rows: 3,
          maxLength: 120,
          showCounter: true,
        },
      ],
    },
    {
      key: 'media',
      title: '미디어',
      description: '상세 페이지에 노출되는 대표 이미지입니다.',
      // 섹션 자체를 끄는 밴드 스위치 — 값(detailEnabled)이 곧 스위치다
      toggleable: true,
      enabled: value.detailEnabled,
      onEnabledChange: (detailEnabled) => onChange({ ...value, detailEnabled }),
      toggleLabel: '상세 페이지 사용',
      toggleDescription: '끄면 카드를 눌렀을 때 링크로 바로 이동합니다.',
      disabledHint: '상세 페이지를 쓰지 않습니다. 대표 이미지는 저장되지 않습니다.',
      fields: [
        {
          kind: 'image',
          key: 'image',
          label: '대표 이미지',
          description: 'JPG · PNG 이미지 · 최대 10MB',
          ratio: '4x3',
          previewWidth: 160,
          accept: 'image/jpeg,image/png',
          maxSizeMb: 10,
          dropLabel: '대표 이미지를 끌어다 놓거나 클릭해서 선택하세요',
        },
        // 라벨이 없는 custom은 FieldRow 없이 섹션 본문 한 줄을 통째로 쓴다
        {
          kind: 'custom',
          key: 'help',
          render: () => (
            <Callout tone="info" title="도움말">
              대표 이미지는 목록 썸네일로도 함께 쓰입니다. 가로형(4:3) 이미지를 권장합니다.
            </Callout>
          ),
        },
      ],
    },
    {
      key: 'publish',
      title: '링크·노출',
      fields: [
        {
          kind: 'text',
          key: 'link',
          label: '링크 URL',
          description: '비우면 카드를 눌러도 이동하지 않습니다.',
          span: 2,
          placeholder: 'https://example.com/project',
        },
        {
          kind: 'toggle',
          key: 'active',
          label: '활성화',
          description: '끄면 목록에서 이 항목이 노출되지 않습니다.',
        },
      ],
    },
  ]
}

/** 제어 컴포넌트다 — 값은 스토리(데모 래퍼)가 들고 있는다 */
function Demo({ value: initial, sections: _sections, ...rest }: AdminFormPageProps<DemoValue>) {
  const [value, setValue] = useState<DemoValue>(initial)

  return (
    <AdminFormPage<DemoValue>
      {...rest}
      value={value}
      onChange={setValue}
      sections={buildSections(value, setValue)}
    />
  )
}

const meta = {
  title: 'Admin/AdminFormPage',
  component: Demo,
  tags: ['autodocs'],
  args: {
    value: EMPTY,
    onChange: () => {},
    sections: [],
    title: '포트폴리오 등록',
    description: '목록과 상세 페이지에 노출되는 정보를 관리합니다.',
    mode: 'create',
    submitting: false,
    loading: false,
    onSubmit: () => {},
    onCancel: () => {},
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    sections: { control: false },
    errors: { control: false },
    headerBadge: { control: false },
    headerActions: { control: false },
    side: { control: false },
    aside: { control: false },
    show: { control: 'object' },
    labels: { control: 'object', description: '문구 통로 — 개별 prop > labels.* > 기본값' },
    mode: { control: 'radio', options: ['create', 'edit'] },
    submitting: { control: 'boolean' },
    loading: { control: 'boolean' },
    stickyFooter: { control: 'boolean' },
    maxWidth: { control: 'radio', options: ['md', 'lg', 'full'] },
    density: { control: 'radio', options: ['compact', 'comfortable'] },
    submitLabel: { control: 'text', description: '@deprecated labels.submit' },
    cancelLabel: { control: 'text', description: '@deprecated labels.cancel' },
    submittingLabel: { control: 'text', description: '@deprecated labels.submitting' },
    // 변형 축
    columns: {
      control: 'inline-radio',
      options: [1, 2, 3],
      description: '섹션 본문 열 수(기본 3) — 섹션별로 section.columns가 이긴다',
    },
    sectionAppearance: {
      control: 'inline-radio',
      options: ['card', 'plain'],
      description: 'plain=모달·드로어 안에서 카드 보더가 겹치지 않게',
    },
    labelPlacement: {
      control: 'inline-radio',
      options: ['top', 'left'],
      description: 'left=어드민 설정 화면의 2열 폼',
    },
    labelWidth: { control: { type: 'number', min: 80, step: 20 } },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
    layout: 'fullscreen',
  },
  // key로 스토리가 바뀔 때 데모의 내부 상태를 초기값에서 다시 시작시킨다
  render: (args) => <Demo key={JSON.stringify(args.value)} {...args} />,
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** 등록 — 빈 폼. 헤더 [등록] + 카드 3장 + 하단 [취소] [등록] */
export const Default: Story = {}

/** 수정 — mode='edit'면 기본 제출 문구가 '저장'이 되고, 헤더에 상태 배지가 붙는다 */
export const EditMode: Story = {
  args: {
    mode: 'edit',
    title: '포트폴리오 수정',
    value: FILLED,
    headerBadge: { label: '활성', tone: 'success' },
  },
}

/**
 * 크롬 대부분 OFF — 헤더 배지·저장, 하단 바가 통째로 사라진다.
 * 빈 자리·여백·구분선이 남지 않는다(카드만 남는다).
 */
export const SectionsOff: Story = {
  args: {
    value: FILLED,
    show: { headerBadge: false, headerSave: false, footer: false },
    headerBadge: { label: '활성', tone: 'success' },
  },
}

/** 저장 중 — 헤더/하단 버튼이 잠기고 문구가 '저장 중…'으로 바뀐다 */
export const Submitting: Story = {
  args: {
    value: FILLED,
    mode: 'edit',
    submitting: true,
    disabled: true,
  },
}

/** 검증 실패 — errors의 키가 있는 FieldRow만 에러 톤 + 문구가 된다(설명 자리를 대신한다) */
export const WithErrors: Story = {
  args: {
    value: { ...EMPTY, link: 'spaceplanning' },
    errors: {
      name: '이름을 입력하세요.',
      category: '카테고리를 선택하세요.',
      image: '대표 이미지를 등록하세요.',
      link: 'http:// 또는 https:// 로 시작하는 주소를 입력하세요.',
    },
  },
}

/**
 * 문구 전면 교체(labels) — 개별 prop을 하나도 주지 않고 통로 하나로 영문화한다.
 * labels.toggle 하나가 toggle 필드와 섹션 밴드 스위치를 함께 바꾼다
 * (지금까지는 필드마다 onLabel/offLabel을 반복해 적어야 했다).
 */
export const Labels: Story = {
  args: {
    mode: 'edit',
    value: FILLED,
    title: 'Edit portfolio',
    description: 'Same shell, English copy — nothing but labels changed.',
    labels: {
      submitByMode: { create: 'Create', edit: 'Save' },
      submitting: 'Saving…',
      cancel: 'Cancel',
      toggle: { on: 'On', off: 'Off' },
      image: { removeLabel: 'Remove image', dropLabel: 'Drop an image or click to upload' },
    },
  },
}

/**
 * 설정 화면 규격 — 1열 + 좌측 라벨(labelPlacement='left') + 크롬 없는 섹션.
 * 세 축 모두 없어서 이런 화면은 셸을 버리고 폼을 직접 조립하고 있었다.
 */
export const SettingsForm: Story = {
  args: {
    value: FILLED,
    mode: 'edit',
    title: '서비스 설정',
    description: '좌측 라벨 2열 폼 — 어드민 설정 화면의 흔한 규격입니다.',
    maxWidth: 'md',
    columns: 1,
    labelPlacement: 'left',
    labelWidth: 160,
    stickyFooter: false,
  },
}

/**
 * 좌측 앵커 내비 + 우측 미리보기 — AdminPageLayout의 side/aside 자리를 셸이 이제 통과시킨다.
 * (긴 폼과 편집+미리보기 화면이 레이아웃을 직접 조립하지 않아도 된다)
 */
export const WithRails: Story = {
  args: {
    value: FILLED,
    mode: 'edit',
    maxWidth: 'full',
    columns: 2,
    side: (
      <nav
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-2)',
          padding: 'var(--ds-spacing-5)',
          background: 'var(--ds-color-bg)',
          border: 'var(--ds-border-width) solid var(--ds-color-border)',
          borderRadius: 'var(--ds-radius-lg)',
          fontSize: 'var(--ds-font-size-sm)',
          color: 'var(--ds-color-secondary)',
        }}
      >
        <span>1. 기본 정보</span>
        <span>2. 미디어</span>
        <span>3. 링크·노출</span>
      </nav>
    ),
    aside: (
      <div
        style={{
          boxSizing: 'border-box',
          padding: 'var(--ds-spacing-5)',
          background: 'var(--ds-color-bg)',
          border: 'var(--ds-border-width) solid var(--ds-color-border)',
          borderRadius: 'var(--ds-radius-lg)',
          fontSize: 'var(--ds-font-size-sm)',
          color: 'var(--ds-color-secondary)',
        }}
      >
        미리보기 자리(MobilePreview)
      </div>
    ),
  },
}

/**
 * 셸 → 자식 통과 축 — 폼 화면의 글자가 **전부** 셸의 labels 하나로 갈린다.
 *
 * 지금까지 셸은 자식에게 문구를 흘려보내지 않아, 섹션 밴드의 '사용'과 업로드 영역의 보이지 않는 문구
 * (접근성 이름 · '10MB를 초과합니다' 같은 검증 실패 문구)는 갈아끼울 방법이 없었다.
 *   labels.toggle   → FormSection (밴드 좌측 문구 + 스위치 ON/OFF)
 *   labels.dropZone → DropZone    (접근성 이름 · 검증 실패 문구)
 *   labels.image    → 이미지 필드 (삭제 버튼 · 드롭존 안내문)
 *   requiredMark    → FieldRow    (문구가 아니라 장식이라 labels가 아니라 prop이다)
 *
 * 파일 규칙에 어긋나는 파일을 끌어다 놓으면 검증 실패 문구까지 영문으로 나온다(통로가 실제로 닿는다).
 */
function LabelsToChildrenDemo() {
  const [value, setValue] = useState<DemoValue>(EMPTY)

  return (
    <AdminFormPage<DemoValue>
      value={value}
      onChange={setValue}
      title="New portfolio"
      description="Same shell, English copy — every string comes from labels."
      // FieldRow의 '*' 대신 화면 관례를 따른다(장식이라 스크린리더 낭독에는 끼어들지 않는다)
      requiredMark=" (required)"
      sections={[
        {
          key: 'basic',
          title: 'Basics',
          fields: [
            { kind: 'text', key: 'name', label: 'Name', required: true, span: 2 },
            { kind: 'select', key: 'category', label: 'Category', span: 1, options: CATEGORIES },
          ],
        },
        {
          key: 'media',
          title: 'Media',
          // toggleLabel(개별 prop)을 주지 않는다 — 밴드 문구가 labels.toggle.label로 열리는 것을 보인다
          toggleable: true,
          enabled: value.detailEnabled,
          onEnabledChange: (detailEnabled) => setValue({ ...value, detailEnabled }),
          fields: [
            {
              kind: 'image',
              key: 'image',
              label: 'Cover image',
              ratio: '4x3',
              accept: 'image/jpeg,image/png',
              maxSizeMb: 10,
            },
          ],
        },
        {
          key: 'publish',
          title: 'Publish',
          fields: [{ kind: 'toggle', key: 'active', label: 'Active' }],
        },
      ]}
      labels={{
        submitByMode: { create: 'Create', edit: 'Save' },
        submitting: 'Saving…',
        cancel: 'Cancel',
        toggle: { label: 'Detail page', on: 'On', off: 'Off' },
        image: {
          removeLabel: 'Remove image',
          dropLabel: 'Drag a file here or click to upload',
          hint: 'JPG · PNG · up to 10MB',
        },
        dropZone: {
          // 보이지 않는 문구 — 업로드 영역의 접근성 이름과 검증 실패 문구
          upload: 'Upload cover image',
          rejectedType: (name) => `${name} is not an allowed file type.`,
          tooLarge: ({ name, maxSizeMb }) => `${name} is larger than ${maxSizeMb}MB.`,
        },
      }}
      onSubmit={() => {}}
      onCancel={() => {}}
    />
  )
}

export const LabelsToChildren: Story = {
  render: () => <LabelsToChildrenDemo />,
}
