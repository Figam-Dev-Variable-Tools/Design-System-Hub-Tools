import type { Meta, StoryObj } from '@storybook/react'
import { Blocks, Headphones, Mail, Ruler, Waves } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { Highlight } from '../Highlight/Highlight'
import { AboutPage, type AboutCapability, type AboutStat } from './AboutPage'

/* ── 목데이터: 공간 음향 디자인 스튜디오 ── */

const HERO = {
  eyebrow: 'About us',
  title: 'We design the sound of space.',
  subtitle:
    '공간이 먼저 말을 걸도록 만듭니다. 소리를 채우는 것이 아니라, 그 공간에 맞는 소리를 설계합니다.',
  imageSrc: mockImage('STUDIO', 'dusk'),
  imageAlt: '스튜디오 전경',
}

const INTRO = {
  title: 'Who we are',
  subtitle: '2011년 서울에서 시작한 공간 음향 디자인 스튜디오입니다.',
  paragraphs: [
    '사운드플랜은 카페와 리테일 매장에서 출발해 호텔, 전시장, 공연장까지 공간의 소리를 다뤄왔습니다. 도면을 받는 순간부터 준공 후 튜닝까지, 한 팀이 처음과 끝을 함께 책임집니다.',
    '좋은 음향은 장비 목록이 아니라 공간에 대한 이해에서 나온다고 믿습니다. 천장고와 마감재, 사람의 동선과 머무는 시간을 먼저 읽고 그다음에 스피커를 고릅니다.',
    '그래서 저희의 결과물은 늘 조용합니다. 소리가 앞서지 않고 공간이 앞서는 것 — 그것이 저희가 생각하는 잘된 음향입니다.',
  ],
  imageSrc: mockImage('OFFICE', 'sage'),
  imageAlt: '작업 중인 스튜디오 내부',
}

const CAPABILITIES: AboutCapability[] = [
  {
    id: 'acoustics',
    icon: <Waves size={22} />,
    title: '음향 설계',
    description:
      '도면 단계에서 잔향과 반사를 시뮬레이션해 마감재와 스피커 배치를 함께 제안합니다.',
  },
  {
    id: 'system',
    icon: <Blocks size={22} />,
    title: '시스템 구축',
    description: '앰프·스피커·네트워크 오디오까지 공간 규모에 맞는 구성으로 설치합니다.',
  },
  {
    id: 'interior',
    icon: <Ruler size={22} />,
    title: '인테리어 협업',
    description: '설계사·시공사와 같은 도면 위에서 일합니다. 음향 때문에 디자인을 포기하지 않습니다.',
  },
  {
    id: 'tuning',
    icon: <Headphones size={22} />,
    title: '준공 후 튜닝',
    description: '오픈 후 실제 사람이 찬 상태에서 다시 측정하고 6개월간 무상으로 조정합니다.',
  },
]

const STATS: AboutStat[] = [
  { label: '누적 프로젝트', value: '248' },
  { label: '함께한 고객사', value: '96' },
  { label: '업력', value: '15년' },
  { label: '재의뢰율', value: '82%' },
]

const meta = {
  title: 'Site/AboutPage',
  component: AboutPage,
  tags: ['autodocs'],
  args: {
    hero: HERO,
    intro: INTRO,
    capabilities: CAPABILITIES,
    stats: STATS,
    accent: 'success',
    loading: false,
    showCta: true,
    showDivider: true,
    showHeroScrim: true,
  },
  argTypes: {
    onInquiry: { action: 'inquiry' },
    showCta: { control: 'boolean', description: 'CTA 밴드 노출' },
    showDivider: { control: 'boolean', description: '섹션 헤딩 아래 구분선' },
    showHeroScrim: { control: 'boolean', description: '히어로 이미지 위 흰 스크림' },
    ctaIcon: { control: false, description: 'CTA 버튼 우측 아이콘(기본 ArrowRight)' },
    hero: { control: false },
    intro: { control: false },
    capabilities: { control: false },
    stats: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AboutPage>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 히어로(흰 면) → 개요(흰 면) → 역량(옅은 회색 면 + 흰 카드) → 숫자(흰 면) → CTA(옅은 회색 면) */
export const Default: Story = {}

/** 강조색 primary — 가격·아이콘·숫자·CTA 버튼이 모두 따라 바뀐다 */
export const AccentPrimary: Story = {
  args: {
    accent: 'primary',
  },
}

/** 이미지 없음 — 히어로/개요가 공용 Placeholder로 대체된다(레이아웃은 그대로) */
export const NoImages: Story = {
  args: {
    hero: { ...HERO, imageSrc: undefined },
    intro: { ...INTRO, imageSrc: undefined },
  },
}

/**
 * 빈 상태 — 역량·숫자 데이터가 아직 없을 때.
 * 빈 그리드를 노출하는 대신 두 섹션을 접고 히어로·개요·CTA만 남긴다.
 */
export const Empty: Story = {
  args: {
    capabilities: [],
    stats: [],
    intro: { ...INTRO, paragraphs: [INTRO.paragraphs[0]] },
  },
}

/** 로딩 — 개요 문단·역량 카드·숫자를 Skeleton으로 대체한다 */
export const Loading: Story = {
  args: {
    loading: true,
  },
}

/**
 * 강조어 — 히어로 헤드라인은 노드를 받으므로 Highlight로 한 단어만 강조색을 준다.
 * (색은 SiteSection이 내려주는 --site-accent-text를 그대로 소비한다)
 */
export const HighlightedHeadline: Story = {
  args: {
    hero: {
      ...HERO,
      title: (
        <>
          We design the <Highlight>sound</Highlight> of space.
        </>
      ),
    },
  },
}

/**
 * 토글 OFF — CTA 밴드·섹션 구분선·히어로 스크림을 모두 끈 최소 구성.
 * (사내 인트라넷처럼 문의를 받지 않고, 사진을 원본 대비로 보여줘야 할 때)
 */
export const TogglesOff: Story = {
  args: {
    showCta: false,
    showDivider: false,
    showHeroScrim: false,
  },
}

/** CTA 아이콘 교체 — 문의가 메일로 연결될 때 */
export const MailCta: Story = {
  args: {
    ctaIcon: <Mail size={18} />,
  },
}
