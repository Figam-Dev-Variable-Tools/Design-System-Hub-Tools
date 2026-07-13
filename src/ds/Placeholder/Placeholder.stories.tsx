/**
 * 위치에 대한 결정 — 저장소 관례상 컴포넌트는 `src/ds/<Name>/`(3파일)에 두지만,
 * Placeholder는 Image·Video·EmptyState·AdminTable·CrudDialog 등 여러 컴포넌트가
 * 공유하는 **프리미티브**라 구현을 `src/shared/placeholders.tsx`에 두고(figma.ts·
 * mediaMock.ts와 같은 자리), 이 폴더에는 **갤러리 스토리만** 둔다.
 * re-export 배럴을 만들지 않고 shared에서 직접 import 한다 — 단일 출처를 흐리지 않기 위함.
 */
import type { CSSProperties, ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { Placeholder, type PlaceholderKind } from '../../shared/placeholders'
import { ImageCard } from '../ImageCard/ImageCard'
import { EmptyState } from '../EmptyState/EmptyState'
import { CrudDialog } from '../CrudDialog/CrudDialog'

/** 8종 + 한 줄 설명(표시 순서 = 선언 순서) */
const KINDS: readonly { kind: PlaceholderKind; desc: string }[] = [
  { kind: 'image', desc: '이미지 없음' },
  { kind: 'video', desc: '동영상 없음' },
  { kind: 'file', desc: '첨부/문서 없음' },
  { kind: 'empty', desc: '작성된 내용 없음' },
  { kind: 'search', desc: '검색 결과 없음' },
  { kind: 'error', desc: '오류' },
  { kind: 'delete', desc: '삭제 확인' },
  { kind: 'success', desc: '완료' },
]

const CAPTION: CSSProperties = {
  fontFamily: 'var(--ds-font-family)',
  fontSize: 'var(--ds-font-size-xs)',
  color: 'var(--ds-color-secondary)',
  textAlign: 'center',
}

const SECTION_TITLE: CSSProperties = {
  fontFamily: 'var(--ds-font-family)',
  fontSize: 'var(--ds-font-size-sm)',
  fontWeight: 'var(--ds-font-weight-bold)',
  color: 'var(--ds-color-text)',
  margin: 0,
}

/** fill형을 확인하기 위한 비율 박스(카드 썸네일을 흉내낸다) */
function RatioBox({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '4 / 3',
        overflow: 'hidden',
        borderRadius: 'var(--ds-radius-sm)',
        border: 'var(--ds-border-width) solid var(--ds-color-border)',
      }}
    >
      {children}
    </div>
  )
}

const meta = {
  title: 'Admin/Placeholder',
  component: Placeholder,
  tags: ['autodocs'],
  args: {
    kind: 'image',
    size: 96,
    label: '',
  },
  argTypes: {
    kind: { control: 'select', options: KINDS.map((k) => k.kind) },
    // px 숫자(정사각 아이콘형) 또는 'fill'(부모를 채우는 대체 이미지형)
    size: { control: 'select', options: [24, 32, 48, 64, 96, 128, 'fill'] },
    className: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof Placeholder>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** 8종 × (아이콘형 · fill형) — 같은 프레임·같은 획·같은 색 규칙인지 한눈에 본다 */
export const AllKinds: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={SECTION_TITLE}>아이콘형 — size(px), 주변 텍스트가 의미를 갖는다</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, minmax(72px, 1fr))',
            gap: 16,
            color: 'var(--ds-color-secondary)',
          }}
        >
          {KINDS.map(({ kind, desc }) => (
            <div
              key={kind}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              <Placeholder kind={kind} size={56} />
              <span style={CAPTION}>
                {kind}
                <br />
                {desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={SECTION_TITLE}>fill형 — 부모를 채우는 대체 이미지(배경·라벨까지 SVG 안에)</p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, minmax(72px, 1fr))',
            gap: 16,
          }}
        >
          {KINDS.map(({ kind, desc }) => (
            <div
              key={kind}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              <RatioBox>
                <Placeholder kind={kind} size="fill" label={desc} />
              </RatioBox>
              <span style={CAPTION}>{kind}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
}

/** 실제 얹힌 모습 — 카드 썸네일 · 빈 목록 · 삭제 팝업이 같은 시각 언어를 쓴다 */
export const InContext: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        alignItems: 'start',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={SECTION_TITLE}>카드 썸네일 — image 미지정</p>
        <ImageCard
          title="이미지 없는 상품"
          description="등록된 대표 이미지가 아직 없습니다."
          ratio="4x3"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={SECTION_TITLE}>빈 목록 — kind로 상황을 고른다</p>
        <EmptyState
          kind="empty"
          title="작성된 글이 없습니다"
          description="첫 글을 남겨 보세요."
          actionLabel="글 쓰기"
          compact
        />
        <EmptyState
          kind="search"
          title="검색 결과가 없습니다"
          description="다른 키워드로 다시 검색해 보세요."
          compact
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={SECTION_TITLE}>삭제 팝업 — 모달의 경고 그림</p>
        <CrudDialog open inline mode="delete" description="선택한 3건을 삭제합니다." />
      </div>
    </div>
  ),
}
