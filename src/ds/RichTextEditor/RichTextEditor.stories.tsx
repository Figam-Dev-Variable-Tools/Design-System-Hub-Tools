import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { RichTextEditor, type RichTextEditorProps } from './RichTextEditor'

/** 외부 이미지 대신 사용하는 인라인 SVG 플레이스홀더 */
const placeholderImage = (label: string, w = 480, h = 240) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#E5E8EB"/><text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#8B95A1" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`,
  )}`

// 상태를 가진 컴포넌트라 스토리 안에서 로컬 데모 래퍼로 감싼다
function RichTextEditorDemo(props: RichTextEditorProps) {
  const [html, setHtml] = useState(props.value)
  return <RichTextEditor {...props} value={html} onChange={setHtml} />
}

/** value/onChange가 그대로 노출되는지 확인하는 HTML 미리보기 데모 */
function WithSourceDemo(props: RichTextEditorProps) {
  const [html, setHtml] = useState(props.value)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <RichTextEditor {...props} value={html} onChange={setHtml} />
      <pre
        style={{
          margin: 0,
          padding: 12,
          background: 'var(--ds-color-bgSubtle)',
          border: '1px solid var(--ds-color-border)',
          borderRadius: 'var(--ds-radius-md)',
          fontSize: 'var(--ds-font-size-xs)',
          color: 'var(--ds-color-secondary)',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
        }}
      >
        {html || '(비어 있음)'}
      </pre>
    </div>
  )
}

const meta = {
  title: 'Admin/RichTextEditor',
  component: RichTextEditor,
  tags: ['autodocs'],
  args: {
    value: '',
    placeholder: '내용을 입력하세요',
    minHeight: 200,
    disabled: false,
  },
  argTypes: {
    onChange: { control: false },
    onInsertImage: { control: false },
    // ON/OFF — 끄면 그 버튼(또는 툴바 줄 전체)이 DOM에서 사라진다
    showToolbar: { control: 'boolean' },
    showLinkButton: { control: 'boolean' },
    showImageButton: { control: 'boolean' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
    layout: 'padded',
  },
} satisfies Meta<typeof RichTextEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => <RichTextEditorDemo {...args} />,
}

/** 회사 소개 관리 — 서식이 적용된 본문을 편집하는 실제 시나리오 */
export const CompanyIntro: Story = {
  args: {
    minHeight: 240,
    value: [
      '<p><b>스페이스플래닝</b>은 공간 데이터를 다루는 팀입니다.</p>',
      '<ul><li>설립 2019년</li><li>서울 강남구</li><li>구성원 42명</li></ul>',
      '<p>자세한 내용은 <a href="https://example.com" target="_blank" rel="noreferrer">회사 소개서</a>를 확인하세요.</p>',
    ].join(''),
  },
  render: (args) => <RichTextEditorDemo {...args} />,
}

/** 상품 상세 설명 — 이미지 삽입 훅(onInsertImage)으로 업로드 결과 URL을 주입 */
export const ProductDescription: Story = {
  args: {
    minHeight: 260,
    placeholder: '상품 상세 설명을 입력하세요',
    value: '<p>가벼운 알루미늄 바디에 <u>무접점 스위치</u>를 적용했습니다.</p>',
    // 실제로는 업로드 API를 호출하고 반환된 URL을 넣는다
    onInsertImage: () => placeholderImage('업로드된 이미지'),
  },
  render: (args) => <WithSourceDemo {...args} />,
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: '<p>읽기 전용 상태에서는 툴바와 본문이 모두 비활성화됩니다.</p>',
  },
  render: (args) => <RichTextEditorDemo {...args} />,
}

/**
 * 삽입 버튼 OFF — 링크·이미지 버튼을 끈 서식 전용 툴바.
 * 외부 링크와 외부 이미지를 막아야 하는 본문(공지·약관)에서 쓴다.
 */
export const WithoutInsertButtons: Story = {
  args: {
    showLinkButton: false,
    showImageButton: false,
    value: '<p>서식만 쓰는 본문입니다.</p>',
  },
  render: (args) => <RichTextEditorDemo {...args} />,
}

/** 툴바 OFF — 서식 없이 본문만 받는 간단 메모 입력 */
export const WithoutToolbar: Story = {
  args: {
    showToolbar: false,
    minHeight: 120,
    placeholder: '메모를 입력하세요',
  },
  render: (args) => <RichTextEditorDemo {...args} />,
}
