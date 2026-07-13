import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { CategoryForm, type CategoryFormProps, type CategoryValue } from './CategoryForm'

/** 빈 등록 폼 — 이미지 사용 ON, 아직 업로드 전 */
const EMPTY_CATEGORY: CategoryValue = {
  name: '',
  useImage: true,
  active: true,
}

/** 작성이 끝난 카테고리 — 레퍼런스와 같은 결의 현실적 한글 목데이터 */
const FILLED_CATEGORY: CategoryValue = {
  name: '거실 인테리어',
  useImage: true,
  image: mockImage('거실', 'sand'),
  description: '아파트·주택 거실 시공 사례를 모아 보여주는 카테고리입니다. 대표 이미지는 목록 썸네일로도 함께 쓰입니다.',
  active: true,
}

/** 이미지 사용 OFF — 업로드 영역이 사라지고 아이콘(이모지) 선택이 그 자리를 채운다 */
const EMOJI_CATEGORY: CategoryValue = {
  name: '주방·다이닝',
  useImage: false,
  emoji: '🍽️',
  description: '싱크대·아일랜드 등 주방 시공 사례.',
  active: false,
}

/** 제어 컴포넌트다 — 스토리가 값을 들고 있는다 */
function CategoryFormDemo({ value: initial, onChange: _onChange, ...rest }: CategoryFormProps) {
  const [value, setValue] = useState<CategoryValue>(initial)

  return <CategoryForm {...rest} value={value} onChange={setValue} />
}

const meta = {
  title: 'Admin/CategoryForm',
  component: CategoryForm,
  tags: ['autodocs'],
  args: {
    value: EMPTY_CATEGORY,
    onChange: () => {},
    title: '카테고리 등록',
    onSubmit: () => {},
    onCancel: () => {},
    submitting: false,
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    errors: { control: false },
    show: { control: 'object' },
    title: { control: 'text' },
    description: { control: 'text' },
    submitLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    submitting: { control: 'boolean' },
    // ON/OFF — 끄면 미리보기 블록이 사라지고 드롭존(교체 UI)만 남는다
    showPreview: { control: 'boolean' },
    // 문구
    removeImageLabel: { control: 'text' },
    imageHint: { control: 'text' },
    savingLabel: { control: 'text' },
    // 아이콘 슬롯은 ReactNode라 컨트롤을 붙이지 않는다
    removeImageIcon: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
    layout: 'fullscreen',
  },
  // key로 스토리가 바뀔 때 데모의 내부 상태를 초기값에서 다시 시작시킨다
  render: (args) => <CategoryFormDemo key={JSON.stringify(args.value)} {...args} />,
} satisfies Meta<typeof CategoryForm>

export default meta
type Story = StoryObj<typeof meta>

/** 등록 — 빈 폼. 헤더 [저장] + 하단 [취소] [저장] */
export const Default: Story = {}

/**
 * 전부 ON — show의 모든 키가 true(기본값).
 * 헤더 · 카테고리명 · 이미지 · 설명 · 활성화 · 하단 액션 바가 모두 보인다.
 */
export const AllSections: Story = {
  args: {
    title: '카테고리 수정',
    description: '목록·상단 메뉴에 노출되는 카테고리 정보를 수정합니다.',
    value: FILLED_CATEGORY,
    show: {
      header: true,
      info: true,
      name: true,
      image: true,
      description: true,
      active: true,
      footer: true,
    },
  },
}

/**
 * 대부분 OFF — 카테고리명 하나만 남긴다.
 * 헤더·이미지·설명·활성화·하단 바가 **완전히 사라진다**(빈 자리·여백·구분선 없음).
 */
export const Minimal: Story = {
  args: {
    value: { name: '신규 카테고리', useImage: true, active: true },
    show: {
      header: false,
      image: false,
      description: false,
      active: false,
      footer: false,
    },
  },
}

/** 이미지 사용 OFF — 업로드 영역 대신 아이콘(이모지) 선택 */
export const EmojiIcon: Story = {
  args: {
    title: '카테고리 수정',
    value: EMOJI_CATEGORY,
  },
}

/** 섹션 통째로 OFF — show.info=false면 카드가 사라지고 헤더/하단 바만 남는다 */
export const HeaderAndFooterOnly: Story = {
  args: {
    value: FILLED_CATEGORY,
    show: { info: false },
  },
}

/** 검증 실패 — 필드별 error 문구 + 에러 톤 */
export const WithErrors: Story = {
  args: {
    value: { name: '', useImage: true, active: true },
    errors: {
      name: '카테고리명을 입력하세요.',
      image: '대표 이미지를 등록하세요.',
    },
  },
}

/** 저장 중 — 헤더/하단 버튼이 잠긴다 */
export const Submitting: Story = {
  args: {
    value: FILLED_CATEGORY,
    submitting: true,
  },
}

/**
 * 미리보기 OFF — 이미지가 이미 있어도 썸네일(+삭제)을 그리지 않고 드롭존만 남는다.
 * 목록에서 이미 썸네일을 보여 주는 화면용. 값(value.image)은 유지된다.
 */
export const WithoutPreview: Story = {
  args: {
    value: FILLED_CATEGORY,
    showPreview: false,
  },
}

/** 문구 교체 — 업로드 제약 안내와 삭제 버튼 라벨을 화면 결에 맞춘다 */
export const CustomCopy: Story = {
  args: {
    value: FILLED_CATEGORY,
    imageHint: '정사각형 이미지(1:1) · 1MB 이하',
    removeImageLabel: '사진 지우기',
    submitLabel: '등록하기',
  },
}
