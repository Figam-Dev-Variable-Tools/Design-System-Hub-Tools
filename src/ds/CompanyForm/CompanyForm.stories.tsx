import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { CompanyForm, type CompanyFormProps, type CompanyValue } from './CompanyForm'

/** 운영 중인 회사소개 — 고객용 AboutPage 기본 스토리와 같은 결의 목데이터 */
const FILLED: CompanyValue = {
  heroEyebrow: 'About us',
  heroTitle: 'We design sound for space.',
  heroSubtitle: '공간의 쓰임을 먼저 읽고, 그 위에 소리를 얹습니다.',
  heroImage: mockImage('스튜디오 전경', 'slate'),
  heroImageAlt: '스튜디오 전경',

  introTitle: 'Who we are',
  introSubtitle: '2011년부터 공간의 소리를 설계해 왔습니다.',
  introParagraphs: [
    '작은 녹음실 한 칸에서 시작했습니다. 좋은 소리는 장비가 아니라 공간이 만든다는 믿음 하나로, 설계 도면을 먼저 읽는 음향 스튜디오가 되었습니다.',
    '지금은 공연장·전시장·오피스까지 120여 개 공간의 소리를 맡고 있습니다. 준공 후에도 계절마다 다시 찾아가 튜닝합니다.',
  ].join('\n\n'),
  introImage: mockImage('작업 중인 팀', 'sand'),
  introImageAlt: '작업 중인 팀',

  capabilitiesTitle: 'What we do',
  capabilitiesSubtitle: '설계부터 튜닝까지, 공간의 소리를 만드는 네 가지 축입니다.',
  capabilities: [
    { id: 'c1', title: '음향 설계', description: '도면 단계에서 잔향과 소음 경로를 계산해 반영합니다.' },
    { id: 'c2', title: '시공 감리', description: '자재와 시공 품질을 현장에서 직접 확인합니다.' },
    { id: 'c3', title: '장비 셋업', description: '공간의 특성에 맞춰 스피커와 신호 체계를 구성합니다.' },
    { id: 'c4', title: '사후 튜닝', description: '계절과 사용 패턴에 따라 정기적으로 다시 맞춥니다.' },
  ],

  statsTitle: 'By the numbers',
  statsSubtitle: '숫자로 보는 스튜디오의 기록입니다.',
  stats: [
    { id: 's1', value: '15년', label: '업력' },
    { id: 's2', value: '120+', label: '완료 프로젝트' },
    { id: 's3', value: '38', label: '공연장·전시장' },
    { id: 's4', value: '96%', label: '재의뢰율' },
  ],

  ctaTitle: "Let's build it together.",
  ctaSubtitle: '공간과 예산만 알려주시면 3일 안에 제안서를 보내드립니다.',
  ctaButtonLabel: '프로젝트 문의하기',
  ctaEnabled: true,

  accent: 'success',
  showDivider: true,
  showHeroScrim: true,
}

/** 신규 등록 — 아직 아무것도 없는 상태(역량·통계는 빈 상태 그림이 뜬다) */
const EMPTY: CompanyValue = {
  heroEyebrow: '',
  heroTitle: '',
  heroSubtitle: '',
  heroImageAlt: '',
  introTitle: '',
  introSubtitle: '',
  introParagraphs: '',
  introImageAlt: '',
  capabilitiesTitle: '',
  capabilitiesSubtitle: '',
  capabilities: [],
  statsTitle: '',
  statsSubtitle: '',
  stats: [],
  ctaTitle: '',
  ctaSubtitle: '',
  ctaButtonLabel: '',
  ctaEnabled: true,
  accent: 'success',
  showDivider: true,
  showHeroScrim: true,
}

/** 제어 컴포넌트다 — 스토리가 값을 들고 있는다(카드 추가/삭제도 여기서 반영된다) */
function CompanyFormDemo({ value: initial, onChange: _onChange, ...rest }: CompanyFormProps) {
  const [value, setValue] = useState<CompanyValue>(initial)

  return <CompanyForm {...rest} value={value} onChange={setValue} />
}

const meta = {
  title: 'Admin/CompanyForm',
  component: CompanyForm,
  tags: ['autodocs'],
  args: {
    value: EMPTY,
    onChange: () => {},
    mode: 'create',
    submitting: false,
    loading: false,
    onSubmit: () => {},
    onCancel: () => {},
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false },
    errors: { control: false },
    sectionCopy: { control: false },
    accentOptions: { control: false },
    show: { control: 'object' },
    mode: { control: 'inline-radio', options: ['create', 'edit'] },
    // 문구 — 같은 폼을 '브랜드 소개'·'팀 소개'로도 쓴다
    title: { control: 'text' },
    description: { control: 'text' },
    submitLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    savingLabel: { control: 'text' },
    imageHint: { control: 'text' },
    imageDropLabel: { control: 'text' },
    addCapabilityLabel: { control: 'text' },
    addStatLabel: { control: 'text' },
    removeLabel: { control: 'text' },
    capabilitiesEmptyTitle: { control: 'text' },
    statsEmptyTitle: { control: 'text' },
    // 상태
    submitting: { control: 'boolean' },
    loading: { control: 'boolean' },
    // 아이콘 슬롯은 ReactNode라 컨트롤을 붙이지 않는다
    addIcon: { control: false },
    removeIcon: { control: false },
    removeImageIcon: { control: false },
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  // key로 스토리가 바뀔 때 데모의 내부 상태를 초기값에서 다시 시작시킨다
  render: (args) => <CompanyFormDemo key={JSON.stringify(args.value)} {...args} />,
} satisfies Meta<typeof CompanyForm>

export default meta
type Story = StoryObj<typeof meta>

/** 등록 — 빈 폼. 역량·통계는 빈 상태 그림에서 바로 [추가]로 첫 항목을 만든다 */
export const Default: Story = {}

/**
 * 수정 — 운영 중인 회사소개를 불러온 상태.
 * 역량 카드 4장 · 통계 4칸이 각각 [제목][설명][삭제] 한 줄로 편집된다.
 */
export const EditMode: Story = {
  args: {
    mode: 'edit',
    value: FILLED,
  },
}

/** 저장 중 — 모든 입력과 헤더/하단 버튼이 잠기고 제출 버튼이 '저장 중…'이 된다 */
export const Submitting: Story = {
  args: {
    mode: 'edit',
    value: FILLED,
    submitting: true,
  },
}

/** 검증 실패 — 필드별 error 문구 + 에러 톤(목록 에러는 역량/통계 머리 행에 붙는다) */
export const WithErrors: Story = {
  args: {
    value: { ...EMPTY, capabilities: [], stats: [] },
    errors: {
      heroTitle: '헤드라인을 입력하세요.',
      heroSubtitle: '서브카피를 입력하세요.',
      introTitle: '소개 헤드라인을 입력하세요.',
      introParagraphs: '소개 문단을 1개 이상 입력하세요.',
      capabilities: '역량 카드를 1개 이상 등록하세요.',
      stats: '통계 항목을 1개 이상 등록하세요.',
      ctaTitle: 'CTA 제목을 입력하세요.',
      ctaButtonLabel: '버튼 문구를 입력하세요.',
    },
  },
}

/**
 * 섹션 OFF — 히어로 이미지·역량·통계·CTA·노출 설정을 끈 '카피만' 폼.
 * 꺼진 섹션은 카드째 사라지고, 남은 카드의 번호가 1부터 다시 매겨진다.
 */
export const SectionsOff: Story = {
  args: {
    mode: 'edit',
    value: FILLED,
    show: {
      heroImage: false,
      capabilities: false,
      stats: false,
      cta: false,
      visibility: false,
    },
  },
}
