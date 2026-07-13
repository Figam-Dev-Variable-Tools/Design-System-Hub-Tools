import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { mockImage } from '../../shared/mediaMock'
import { MEDIA_RATIOS, MEDIA_RATIO_LABEL } from '../Image/Image'
import { ImageCard, type ImageCardProps } from './ImageCard'

const SAMPLE = mockImage('', 'slate')

const meta = {
  title: '3. 컴포넌트/Media/ImageCard',
  component: ImageCard,
  tags: ['autodocs'],
  args: {
    title: '이미지 카드',
    description: '설명 텍스트가 여기에 표시됩니다.',
    eyebrow: '',
    ratio: '16x9',
    layout: 'below',
    align: 'bottom',
    scrim: 'gradient',
    rounded: true,
    fill: false,
  },
  argTypes: {
    ratio: { control: 'inline-radio', options: MEDIA_RATIOS },
    layout: { control: 'inline-radio', options: ['below', 'overlay'] },
    align: { control: 'inline-radio', options: ['top', 'center', 'bottom'] },
    scrim: { control: 'inline-radio', options: ['gradient', 'solid', 'none'] },
    eyebrow: { control: 'text', description: 'below 배치에서 제목 위에 놓이는 분류 라벨' },
    fill: { control: 'boolean', description: '그리드 셀을 채운다(기본 320px 상한 해제)' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof ImageCard>

export default meta
type Story = StoryObj<typeof meta>

/** 기존 동작 — 이미지 아래 캡션 */
export const Default: Story = {
  args: {
    image: SAMPLE,
  },
}

export const WithoutDescription: Story = {
  args: {
    description: undefined,
    ratio: '4x3',
  },
}

/** 이미지 위에 텍스트를 얹는 오버레이 구조(기본: 하단 정렬 + 그라데이션 스크림) */
export const Overlay: Story = {
  args: {
    image: SAMPLE,
    layout: 'overlay',
    align: 'bottom',
    scrim: 'gradient',
    title: '가을 신상 컬렉션',
    description: '이미지 위에 얹힌 텍스트는 스크림으로 대비를 확보합니다.',
  },
}

const ALIGNS: NonNullable<ImageCardProps['align']>[] = ['top', 'center', 'bottom']
const SCRIMS: NonNullable<ImageCardProps['scrim']>[] = ['gradient', 'solid', 'none']

/** align 3종 × scrim 3종 = 9가지 오버레이 조합 매트릭스 */
export const OverlayVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, fontFamily: 'var(--ds-font-family)' }}>
      {ALIGNS.map((align) => (
        <div key={align}>
          <h4
            style={{
              margin: '0 0 12px',
              fontSize: 13,
              color: 'var(--ds-color-secondary)',
            }}
          >
            align = {align}
          </h4>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {SCRIMS.map((scrim) => (
              <div key={scrim} style={{ width: 260 }}>
                <ImageCard
                  image={SAMPLE}
                  layout="overlay"
                  align={align}
                  scrim={scrim}
                  ratio="4x3"
                  title="오버레이 카드"
                  description="스크림 위 텍스트 대비를 확인합니다."
                />
                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: 12,
                    color: 'var(--ds-color-secondary)',
                  }}
                >
                  scrim = {scrim}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
}

/** 배지 + CTA + 카드 전체 클릭(키보드 포커스 가능) */
export const WithBadgeAndAction: Story = {
  args: {
    image: mockImage('', 'sage'),
    layout: 'overlay',
    align: 'bottom',
    scrim: 'gradient',
    ratio: '4x5',
    badge: 'NEW',
    title: '한정 이벤트',
    description: 'CTA는 카드 클릭과 분리되어 동작합니다(stopPropagation).',
    actionLabel: '자세히 보기',
    onAction: () => {},
    onClick: () => {},
  },
}

/** 이미지가 없을 때 — 플레이스홀더 위에서도 오버레이 텍스트가 읽힌다 */
export const OverlayWithoutImage: Story = {
  args: {
    layout: 'overlay',
    align: 'bottom',
    scrim: 'gradient',
    badge: '이벤트',
    title: '플레이스홀더 배경',
    description: '이미지가 없어도 스크림과 그림자로 가독성을 확보합니다.',
    actionLabel: '살펴보기',
    onAction: () => {},
  },
}

/** 웹 표준 비율 전체 — overlay 모드로 나열 */
export const AllRatios: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 24,
        alignItems: 'start',
      }}
    >
      {MEDIA_RATIOS.map((ratio) => (
        <div key={ratio}>
          <ImageCard
            image={mockImage(MEDIA_RATIO_LABEL[ratio], 'slate')}
            layout="overlay"
            ratio={ratio}
            title={MEDIA_RATIO_LABEL[ratio]}
            description="오버레이 텍스트"
          />
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 12,
              fontFamily: 'var(--ds-font-family)',
              color: 'var(--ds-color-secondary)',
            }}
          >
            {MEDIA_RATIO_LABEL[ratio]}
          </p>
        </div>
      ))}
    </div>
  ),
}

/**
 * 분류 라벨(eyebrow) — below 배치에서 제목 위에 한 줄.
 * 포트폴리오·목록 카드에서 "무엇에 대한 카드인지"를 제목보다 먼저 읽히게 한다.
 */
export const WithEyebrow: Story = {
  args: {
    image: SAMPLE,
    eyebrow: '조경설계',
    title: '자연석 조경 자갈',
    description: '천연 자연석 화분 및 실내 조경 장식재',
    ratio: '4x3',
    fill: true,
  },
}
