import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import {
  EMPTY_MAIN_VISUAL_VALUE,
  MainVisualForm,
  type MainVisualFormProps,
  type MainVisualValue,
} from './MainVisualForm'

/* ── 목데이터 ─────────────────────────────────────────────────────────────── */

/** 중고 섹션에 걸린 운영 중 배너 — 필수값이 모두 채워진 수정 화면 */
const SAMPLE_VALUE: MainVisualValue = {
  section: 'used',
  useCopy: true,
  title: '사무실 이전, 중고 가구로 예산을 아끼세요',
  overline: '신규 입고',
  menuLabel: '중고 가구',
  buttonLabel: '매물 보러가기',
  image: mockImage('메인 배너', 'sage'),
  link: 'https://spaceplanning.ai/used',
  active: true,
}

/** 문구 없이 이미지만 쓰는 렌탈 배너 */
const IMAGE_ONLY_VALUE: MainVisualValue = {
  section: 'rental',
  useCopy: false,
  title: '',
  image: mockImage('렌탈 배너', 'sand'),
  link: 'https://spaceplanning.ai/rental',
  active: false,
}

/* ── 제어 래퍼 ────────────────────────────────────────────────────────────── */

/** 제어 컴포넌트라 스토리가 값을 들고 있는다 */
function MainVisualFormDemo({ value: initial, onChange, ...rest }: MainVisualFormProps) {
  const [value, setValue] = useState<MainVisualValue>(initial)

  return (
    <MainVisualForm
      {...rest}
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange(next)
      }}
    />
  )
}

const meta = {
  title: 'Admin/MainVisualForm',
  component: MainVisualForm,
  tags: ['autodocs'],
  args: {
    value: SAMPLE_VALUE,
    onChange: () => {},
    saving: false,
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    sections: { control: false },
    errors: { control: false },
    show: { control: 'object' },
    saving: { control: 'boolean' },
    // ON/OFF — 끄면 썸네일 블록이 사라지고 드롭존이 필드 폭을 전부 쓴다
    showPreview: { control: 'boolean' },
    // 문구
    removeImageLabel: { control: 'text' },
    dropLabel: { control: 'text' },
    imageHint: { control: 'text' },
    saveLabel: { control: 'text' },
    savingLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    // 아이콘 슬롯은 ReactNode라 컨트롤을 붙이지 않는다
    removeImageIcon: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  render: (args) => <MainVisualFormDemo {...args} />,
} satisfies Meta<typeof MainVisualForm>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 전부 ON — 헤더(활성 배지 + 저장) · FormSection 4장 · 하단 [취소][저장].
 * show를 넘기지 않으면 이 상태가 기본값이다.
 */
export const AllSections: Story = {}

/**
 * 대부분 OFF — 섹션 2장(문구·이미지)만 남는다.
 * 배너 구분·링크 노출 섹션, 헤더 배지·저장, 하단 바, 보조 필드가 모두 사라지고
 * 빈 자리나 여백이 남지 않는다.
 */
export const Minimal: Story = {
  args: {
    show: {
      statusBadge: false,
      headerSave: false,
      banner: false,
      link: false,
      footer: false,
      overlineField: false,
      menuLabelField: false,
      buttonLabelField: false,
      help: false,
    },
  },
}

/** 문구 사용 OFF — 2번 섹션 본문이 통째로 사라지고 토글 밴드만 남는다 */
export const CopyOff: Story = {
  args: { value: IMAGE_ONLY_VALUE },
}

/** 신규 등록 — 값이 비어 있다. 썸네일 없이 드롭존(공용 Placeholder)이 폭을 전부 쓴다 */
export const Empty: Story = {
  args: { value: EMPTY_MAIN_VISUAL_VALUE },
}

/** 검증 실패 — 필수 필드에 에러 문구와 error 톤 테두리 */
export const WithErrors: Story = {
  args: {
    value: { ...EMPTY_MAIN_VISUAL_VALUE, link: 'spaceplanning.ai/used' },
    errors: {
      section: '섹션을 선택하세요.',
      title: '제목을 입력하세요.',
      image: '배너 이미지를 등록하세요.',
      link: 'http:// 또는 https:// 로 시작하는 주소를 입력하세요.',
    },
  },
}

/** 저장 중 — 모든 컨트롤이 잠기고 버튼 문구가 바뀐다 */
export const Saving: Story = {
  args: { saving: true },
}

/**
 * 썸네일 OFF — 이미지가 이미 있어도 미리보기(+삭제)를 그리지 않고 드롭존이 폭을 전부 쓴다.
 * 미리보기를 별도 패널에서 띄우는 화면용. 값(value.image)은 그대로 유지된다.
 */
export const WithoutPreview: Story = {
  args: { showPreview: false },
}

/** 문구 교체 — 드롭존 안내·제약 문구와 액션 버튼 라벨을 화면 결에 맞춘다 */
export const CustomCopy: Story = {
  args: {
    dropLabel: '배너 이미지를 여기에 올려 주세요',
    imageHint: '권장 1920×640 · JPG/PNG',
    saveLabel: '변경사항 저장',
    cancelLabel: '되돌리기',
    removeImageLabel: '배너 이미지 지우기',
  },
}
