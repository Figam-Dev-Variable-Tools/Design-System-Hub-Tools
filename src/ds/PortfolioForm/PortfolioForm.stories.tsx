import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { PortfolioForm, type PortfolioFormProps, type PortfolioFormValue } from './PortfolioForm'

/** 카테고리 목데이터 — 레퍼런스처럼 라벨 앞에 이모지를 붙인다 */
const CATEGORIES = [
  { label: '🏢 오피스', value: 'office' },
  { label: '🛍️ 리테일', value: 'retail' },
  { label: '🏠 주거', value: 'residential' },
  { label: '🎪 전시 · 팝업', value: 'exhibition' },
  { label: '✨ 브랜딩', value: 'branding' },
]

const EMPTY_VALUE: PortfolioFormValue = {
  category: null,
  title: '',
  link: '',
  image: undefined,
  content: '',
  active: true,
  detailEnabled: true,
}

/** 수정 모드 목데이터 — 카테고리·제목·링크·대표 이미지·상세 내용이 모두 채워진 상태 */
const FILLED_VALUE: PortfolioFormValue = {
  category: 'office',
  title: '성수 크리에이티브 오피스 리뉴얼',
  link: 'https://spaceplanning.ai/portfolio/seongsu-office',
  image: mockImage('대표 이미지', 'sage'),
  content: [
    '<p><b>성수동 연면적 1,240㎡ 오피스</b>를 하이브리드 워크 환경으로 재구성한 프로젝트입니다.</p>',
    '<ul><li>기획 · 설계 · 시공 총괄 (2025.11 ~ 2026.03)</li><li>집중 좌석 68석 · 협업 라운지 3개소</li><li>공용부 동선 재배치로 회의실 가동률 42% 개선</li></ul>',
    '<p>마감은 저채도 우드와 화이트 톤으로 통일해 브랜드 아이덴티티를 유지했습니다.</p>',
  ].join(''),
  active: true,
  detailEnabled: true,
}

// 제어 컴포넌트라 스토리가 값을 들고 있는다 — 토글·업로드·에디터가 실제로 반응한다
function PortfolioFormDemo({ value: initial, ...rest }: PortfolioFormProps) {
  const [value, setValue] = useState<PortfolioFormValue>(initial)
  return <PortfolioForm {...rest} value={value} onChange={setValue} />
}

const meta = {
  title: 'Admin/PortfolioForm',
  component: PortfolioForm,
  tags: ['autodocs'],
  args: {
    value: FILLED_VALUE,
    // 실제 상태는 데모 래퍼가 들고 있으므로 여기서는 no-op
    onChange: () => {},
    categories: CATEGORIES,
    mode: 'edit',
    submitting: false,
    loading: false,
    density: 'compact',
    maxWidth: 'lg',
    onSubmit: () => {},
    onCancel: () => {},
  },
  argTypes: {
    onChange: { control: false },
    onSubmit: { control: false },
    onCancel: { control: false },
    errors: { control: false },
    // ON/OFF — 끄면 썸네일 블록이 사라지고 드롭존(교체 UI)만 남는다
    showPreview: { control: 'boolean' },
    // 문구
    removeImageLabel: { control: 'text' },
    dropLabel: { control: 'text' },
    imageHint: { control: 'text' },
    submitLabel: { control: 'text' },
    savingLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    labels: { control: 'object' },
    // 아이콘 슬롯은 ReactNode라 컨트롤을 붙이지 않는다
    removeImageIcon: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
    layout: 'fullscreen',
  },
  render: (args) => <PortfolioFormDemo {...args} />,
} satisfies Meta<typeof PortfolioForm>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 전부 ON — 레퍼런스 화면 그대로.
 * 헤더('포트폴리오 수정' + 활성 배지 + [저장]) · 1 기본 정보(카테고리 · 제목 · 링크) ·
 * 2 이미지 · 상세 내용(상세 페이지 사용 ON) · 하단 [취소] [저장].
 */
export const AllSections: Story = {
  args: {
    show: {
      header: true,
      basic: true,
      category: true,
      title: true,
      link: true,
      media: true,
      image: true,
      content: true,
      footer: true,
    },
  },
}

/**
 * 대부분 OFF — 제목 하나만 남긴 최소 폼.
 * 헤더 · 카테고리 · 링크 · '이미지 · 상세 내용' 섹션 · 하단 바가 통째로 사라지고,
 * 남은 카드에 빈 자리·여백이 남지 않는다(섹션 번호도 1로 다시 매겨진다).
 */
export const Minimal: Story = {
  args: {
    show: {
      header: false,
      basic: true,
      category: false,
      title: true,
      link: false,
      media: false,
      image: false,
      content: false,
      footer: false,
    },
  },
}

/** 상세 페이지 미사용 — FormSection 밴드 스위치가 OFF라 본문(이미지·에디터)이 사라진다(카드는 남는다) */
export const DetailDisabled: Story = {
  args: {
    value: { ...FILLED_VALUE, detailEnabled: false, image: undefined, content: '' },
  },
}

/** 신규 등록 — 빈 폼. 대표 이미지가 없으면 드롭존이 뜨고, 파일을 넣으면 썸네일 + 삭제로 바뀐다 */
export const CreateEmpty: Story = {
  args: {
    value: EMPTY_VALUE,
    mode: 'create',
  },
}

/** 필수값 누락 — 카테고리·제목 미입력과 링크 형식 오류를 FieldRow 에러 문구로 표시한다 */
export const WithErrors: Story = {
  args: {
    value: { ...EMPTY_VALUE, link: 'spaceplanning', active: false },
    mode: 'create',
    errors: {
      category: '카테고리를 선택하세요.',
      title: '제목을 입력하세요.',
      link: 'http:// 또는 https:// 로 시작하는 주소를 입력하세요.',
    },
  },
}

/** 조회 중 — 카드 골격은 유지한 채 본문만 스켈레톤으로 대체하고 저장을 잠근다 */
export const Loading: Story = {
  args: {
    value: EMPTY_VALUE,
    loading: true,
  },
}

/**
 * 썸네일 OFF — 대표 이미지가 이미 있어도 미리보기(+삭제)를 그리지 않고 드롭존만 남는다.
 * 폼 폭이 좁아 160×120 썸네일이 들어가지 않는 화면용. 값(value.image)은 유지된다.
 */
export const WithoutPreview: Story = {
  args: { showPreview: false },
}

/** 문구 교체 — 드롭존 안내·제약 문구와 액션 버튼 라벨을 화면 결에 맞춘다 */
export const CustomCopy: Story = {
  args: {
    dropLabel: '시공 사진을 여기에 올려 주세요',
    imageHint: '가로형 이미지 권장 · 최대 10MB',
    submitLabel: '변경사항 저장',
    cancelLabel: '되돌리기',
    removeImageLabel: '대표 이미지 지우기',
  },
}

/**
 * Labels — 영문 오버라이드. 타이틀(등록/수정)·상태 배지·섹션 2장·밴드 스위치·필드·이미지까지 전부 열려 있다.
 * (카테고리 후보 문구는 데이터라 categories prop으로 넘긴다)
 */
export const Labels: Story = {
  args: {
    categories: [
      { label: '🏢 Office', value: 'office' },
      { label: '🛍️ Retail', value: 'retail' },
      { label: '🏠 Residential', value: 'residential' },
    ],
    labels: {
      title: { create: 'New portfolio item', edit: 'Edit portfolio item' },
      description: 'Information shown in the catalog and on the detail page.',
      status: { active: 'Live', inactive: 'Hidden' },
      sections: { basic: 'Basics', media: 'Image & detail' },
      sectionDescriptions: {
        basic: 'Shown on the catalog card as-is.',
        media: 'The cover image and body of the detail page.',
      },
      detailToggle: {
        label: 'Use detail page',
        description: 'When off, the card links straight to the URL.',
        disabledHint: 'This item has no detail page — the cover image and body are not saved.',
      },
      fields: {
        category: 'Category',
        title: 'Title',
        link: 'Link URL',
        image: 'Cover image',
        content: 'Detail',
      },
      placeholders: {
        category: 'Choose a category',
        title: 'Name of the project',
        link: 'https://example.com/project',
        content: 'Scope, role and outcome of the project.',
      },
      helpers: { link: 'Optional. If set, the card shows a shortcut.' },
      image: {
        removeLabel: 'Remove cover image',
        hint: 'JPG · PNG · up to 10MB',
        dropLabel: 'Drop the cover image or click to select',
        alt: 'Cover image preview',
      },
      actions: { submit: 'Save changes', cancel: 'Cancel', saving: 'Saving…' },
    },
  },
}
