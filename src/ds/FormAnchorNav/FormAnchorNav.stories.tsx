import { useEffect, useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { FormAnchorNav, type FormAnchorSection } from './FormAnchorNav'

// 상품 등록 폼의 표준 섹션 구성
const SECTIONS: FormAnchorSection[] = [
  { key: 'basic', label: '상품 정보' },
  { key: 'detail', label: '상세 설명' },
  { key: 'price', label: '가격' },
  { key: 'point', label: '적립금' },
  { key: 'shipping', label: '배송' },
  { key: 'stock', label: '재고' },
  { key: 'option', label: '옵션' },
  { key: 'highlight', label: '상품 강조' },
  { key: 'visibility', label: '노출 설정' },
  { key: 'seo', label: 'SEO' },
]

const INVALID_SECTIONS: FormAnchorSection[] = SECTIONS.map((section) =>
  section.key === 'price' || section.key === 'shipping' ? { ...section, invalid: true } : section,
)

type DemoProps = {
  sections?: FormAnchorSection[]
}

/**
 * 스크롤 스파이 데모 — 컴포넌트는 activeKey를 받기만 하므로,
 * "지금 어느 섹션을 보고 있는지"를 계산하는 쪽은 이렇게 사용처가 만든다.
 * 여기서는 스크롤 주체가 내부 div라 sticky={false}로 두고 래퍼가 직접 고정한다.
 */
function FormAnchorNavDemo({ sections = SECTIONS }: DemoProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [activeKey, setActiveKey] = useState(sections[0]?.key ?? '')

  // 스크롤 컨테이너 상단에 가장 가까운 섹션을 활성으로 — IntersectionObserver 대신
  // 단순 offsetTop 비교(스크롤 컨테이너가 window가 아니어도 동작)
  useEffect(() => {
    const scroller = scrollRef.current
    if (scroller == null) return

    const sync = () => {
      // 상단에서 24px 아래 지점을 기준선으로 잡는다
      const line = scroller.scrollTop + 24
      let next = sections[0]?.key ?? ''
      for (const section of sections) {
        const el = scroller.querySelector<HTMLElement>(`#demo-${section.key}`)
        if (el != null && el.offsetTop <= line) next = section.key
      }
      setActiveKey(next)
    }

    sync()
    scroller.addEventListener('scroll', sync, { passive: true })
    return () => scroller.removeEventListener('scroll', sync)
  }, [sections])

  const handleSelect = (key: string) => {
    setActiveKey(key)
    const scroller = scrollRef.current
    const el = scroller?.querySelector<HTMLElement>(`#demo-${key}`)
    if (scroller == null || el == null) return
    scroller.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px minmax(0, 1fr)', gap: 24 }}>
      <div style={{ alignSelf: 'start' }}>
        <FormAnchorNav sections={sections} activeKey={activeKey} onSelect={handleSelect} sticky={false} />
      </div>

      <div
        ref={scrollRef}
        style={{
          height: 420,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          padding: 4,
        }}
      >
        {sections.map((section) => (
          <section
            key={section.key}
            id={`demo-${section.key}`}
            style={{
              minHeight: 160,
              padding: 20,
              border: '1px solid var(--ds-color-border)',
              borderRadius: 'var(--ds-radius-lg)',
              background: 'var(--ds-color-bg)',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 'var(--ds-font-size-md)',
                fontWeight: 'var(--ds-font-weight-bold)',
                color: 'var(--ds-color-text)',
              }}
            >
              {section.label}
            </h3>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--ds-color-secondary)' }}>
              {section.invalid === true
                ? '필수 입력값이 비어 있습니다 — 좌측 앵커에 오류 점이 표시됩니다.'
                : '섹션 본문 자리입니다.'}
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}

const meta = {
  title: 'Admin/FormAnchorNav',
  component: FormAnchorNav,
  tags: ['autodocs'],
  args: {
    sections: SECTIONS,
    activeKey: 'basic',
    // 스토리는 각자 데모 래퍼에서 상태를 들고 있다 — meta에는 no-op
    onSelect: () => {},
    sticky: true,
    showInvalidDot: true,
  },
  argTypes: {
    sections: { control: false },
    activeKey: { control: false },
    onSelect: { control: false },
    showInvalidDot: { control: 'boolean', description: '오류 섹션의 error 점' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof FormAnchorNav>

export default meta
type Story = StoryObj<typeof meta>

// 스크롤하면 활성 섹션이 따라오고, 앵커를 누르면 해당 섹션으로 이동한다
export const Default: Story = {
  render: (args) => <FormAnchorNavDemo sections={args.sections} />,
}

// 유효성 오류가 있는 섹션 — 가격·배송에 error 점
export const WithInvalid: Story = {
  render: () => <FormAnchorNavDemo sections={INVALID_SECTIONS} />,
}

/**
 * sticky={true}의 실제 동작 — 스크롤 주체가 페이지(window)일 때.
 * 레일은 topbar(--admin-topbar-h = 72) 아래에 붙는다. 캔버스를 스크롤해 보라.
 */
export const StickyOnPageScroll: Story = {
  render: function StickyOnPageScroll() {
    const [activeKey, setActiveKey] = useState('basic')

    const handleSelect = (key: string) => {
      setActiveKey(key)
      document.getElementById(`page-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '200px minmax(0, 1fr)', gap: 24 }}>
        <FormAnchorNav sections={SECTIONS} activeKey={activeKey} onSelect={handleSelect} sticky />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {SECTIONS.map((section) => (
            <section
              key={section.key}
              id={`page-${section.key}`}
              style={{
                minHeight: 220,
                padding: 20,
                border: '1px solid var(--ds-color-border)',
                borderRadius: 'var(--ds-radius-lg)',
                background: 'var(--ds-color-bg)',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 'var(--ds-font-size-md)',
                  fontWeight: 'var(--ds-font-weight-bold)',
                  color: 'var(--ds-color-text)',
                }}
              >
                {section.label}
              </h3>
            </section>
          ))}
        </div>
      </div>
    )
  },
}

/**
 * 오류 점 OFF — 같은 sections(invalid 포함)를 그대로 넘기되 점만 감춘다.
 * 첫 제출 전에는 아직 검증하지 않은 섹션까지 빨갛게 보이지 않게 한다.
 */
export const InvalidDotOff: Story = {
  render: function InvalidDotOff() {
    const [activeKey, setActiveKey] = useState('price')
    return (
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ width: 200 }}>
          <FormAnchorNav
            sections={INVALID_SECTIONS}
            activeKey={activeKey}
            onSelect={setActiveKey}
            sticky={false}
          />
        </div>
        <div style={{ width: 200 }}>
          <FormAnchorNav
            sections={INVALID_SECTIONS}
            activeKey={activeKey}
            onSelect={setActiveKey}
            sticky={false}
            showInvalidDot={false}
          />
        </div>
      </div>
    )
  },
}

// 앵커만 — 제어 컴포넌트라 activeKey를 바꾸면 표시가 바뀐다
export const Standalone: Story = {
  render: function Standalone() {
    const [activeKey, setActiveKey] = useState('price')
    return (
      <div style={{ width: 200 }}>
        <FormAnchorNav
          sections={INVALID_SECTIONS}
          activeKey={activeKey}
          onSelect={setActiveKey}
          sticky={false}
        />
      </div>
    )
  },
}

// 라벨이 길어져도 1줄 말줄임 — 레일 폭이 좁을 때
export const LongLabels: Story = {
  render: function LongLabels() {
    const [activeKey, setActiveKey] = useState('seo')
    return (
      <div style={{ width: 160 }}>
        <FormAnchorNav
          sections={[
            { key: 'basic', label: '상품 정보' },
            { key: 'detail', label: '상세 설명(에디터)' },
            { key: 'point', label: '적립금 · 쿠폰 · 할인 설정' },
            { key: 'seo', label: 'SEO 검색엔진 최적화 설정', invalid: true },
          ]}
          activeKey={activeKey}
          onSelect={setActiveKey}
          sticky={false}
        />
      </div>
    )
  },
}
