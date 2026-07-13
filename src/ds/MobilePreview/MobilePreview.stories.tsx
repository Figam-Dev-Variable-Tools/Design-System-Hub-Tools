import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BatteryLow } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { Placeholder } from '../../shared/placeholders'
import { InputBase } from '../InputBase/InputBase'
import { MobilePreview } from './MobilePreview'

/** 미리보기 안에 그릴 상품 상세 목업 — 사용처(상품 등록 폼)가 넘기는 children 예시 */
function ProductPreviewBody({ name, price }: { name: string; price: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* 대표 이미지 — 1:1 */}
      <div style={{ aspectRatio: '1 / 1', background: 'var(--ds-color-bgSubtle)' }}>
        <Placeholder kind="image" size="fill" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
        <span style={{ fontSize: 11, color: 'var(--ds-color-secondary)' }}>아우터 &gt; 코트</span>
        <strong
          style={{
            fontSize: 16,
            fontWeight: 'var(--ds-font-weight-bold)',
            color: 'var(--ds-color-text)',
            // 상품명은 2줄까지
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}
        >
          {name}
        </strong>
        <span
          style={{
            fontSize: 19,
            fontWeight: 'var(--ds-font-weight-bold)',
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--ds-color-text)',
          }}
        >
          {price}원
        </span>
        <span style={{ fontSize: 12, color: 'var(--ds-color-secondary)' }}>무료배송 · 오늘 출발</span>
      </div>

      <div style={{ height: 8, background: 'var(--ds-color-bgSubtle)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
        <strong style={{ fontSize: 13, fontWeight: 'var(--ds-font-weight-bold)' }}>상세 설명</strong>
        {[0, 1, 2].map((i) => (
          <p key={i} style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: 'var(--ds-color-secondary)' }}>
            부드러운 울 혼방 원단으로 만든 오버핏 코트입니다. 어깨선을 낮춰 편안하게 떨어지며, 이너에 두꺼운
            니트를 입어도 넉넉합니다.
          </p>
        ))}
        <div style={{ aspectRatio: '3 / 4', background: 'var(--ds-color-bgSubtle)' }}>
          <Placeholder kind="image" size="fill" />
        </div>
      </div>
    </div>
  )
}

const meta = {
  title: 'Admin/MobilePreview',
  component: MobilePreview,
  tags: ['autodocs'],
  args: {
    width: 320,
    statusBar: true,
    note: '실제 상세페이지와 다르게 보일 수 있어요',
    showHomeIndicator: true,
    showNote: true,
    statusTime: '9:41',
  },
  argTypes: {
    children: { control: false },
    showHomeIndicator: { control: 'boolean', description: '하단 홈 인디케이터' },
    showNote: { control: 'boolean', description: '프레임 아래 안내 문구 노출' },
    statusIcons: { control: false, description: '상태바 우측 아이콘(기본 신호/와이파이/배터리)' },
    statusTime: { control: 'text', description: '상태바 시계' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof MobilePreview>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: <ProductPreviewBody name="오버핏 울 블렌드 싱글 코트" price="129,000" />,
  },
}

// 폼 입력이 곧바로 미리보기에 반영되는 상품 등록 화면
export const InProductForm: Story = {
  args: { children: null },
  render: function InProductForm(args) {
    const [name, setName] = useState('오버핏 울 블렌드 싱글 코트')
    const [price, setPrice] = useState('129,000')

    return (
      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 320, minWidth: 0 }}>
          <InputBase label="상품명" value={name} onChange={setName} placeholder="상품명" />
          <InputBase label="판매가" value={price} onChange={setPrice} placeholder="0" inputMode="numeric" />
          <p style={{ margin: 0, fontSize: 12, color: 'var(--ds-color-secondary)' }}>
            입력하면 우측 미리보기에 즉시 반영됩니다.
          </p>
        </div>

        <MobilePreview width={args.width} statusBar={args.statusBar} note={args.note}>
          <ProductPreviewBody name={name} price={price} />
        </MobilePreview>
      </div>
    )
  },
}

// 상태바 없이 · 좁은 폭 · note 커스텀
export const Variants: Story = {
  args: { children: null },
  render: () => (
    <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <MobilePreview width={280} note="width 280">
        <ProductPreviewBody name="오버핏 울 블렌드 싱글 코트" price="129,000" />
      </MobilePreview>
      <MobilePreview statusBar={false} note="statusBar 없음">
        <ProductPreviewBody name="오버핏 울 블렌드 싱글 코트" price="129,000" />
      </MobilePreview>
      <MobilePreview width={360} note="">
        <ProductPreviewBody name="오버핏 울 블렌드 싱글 코트" price="129,000" />
      </MobilePreview>
    </div>
  ),
}

/**
 * 기기 크롬 토글 — 홈 인디케이터·안내 문구를 끄고, 상태바 시계/아이콘을 갈아 끼운다.
 * (스크린샷용 깨끗한 프레임 / 안드로이드 3버튼 내비 흉내)
 */
export const DeviceChrome: Story = {
  args: { children: null },
  render: () => (
    <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <MobilePreview showHomeIndicator={false} note="홈 인디케이터 없음">
        <ProductPreviewBody name="오버핏 울 블렌드 싱글 코트" price="129,000" />
      </MobilePreview>
      <MobilePreview showNote={false}>
        <ProductPreviewBody name="오버핏 울 블렌드 싱글 코트" price="129,000" />
      </MobilePreview>
      <MobilePreview
        statusTime="14:20"
        statusIcons={<BatteryLow size={16} strokeWidth={2} />}
        note="시계·상태 아이콘 교체"
      >
        <ProductPreviewBody name="오버핏 울 블렌드 싱글 코트" price="129,000" />
      </MobilePreview>
    </div>
  ),
}

// 아직 아무것도 입력하지 않은 상태
export const Empty: Story = {
  args: {
    children: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          height: '100%',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <Placeholder kind="empty" size={64} />
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ds-color-secondary)' }}>
          상품 정보를 입력하면 여기에 미리보기가 표시됩니다.
        </p>
      </div>
    ),
  },
}
