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
    show: { control: 'object' },
    mode: { control: 'radio', options: ['create', 'edit'] },
    submitting: { control: 'boolean' },
    loading: { control: 'boolean' },
    stickyFooter: { control: 'boolean' },
    maxWidth: { control: 'radio', options: ['md', 'lg', 'full'] },
    density: { control: 'radio', options: ['compact', 'comfortable'] },
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
