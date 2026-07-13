import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Plus } from 'lucide-react'
import { FIGMA_FILE } from '../../shared/figma'
import { Button } from '../Button/Button'
import { InputBase } from '../InputBase/InputBase'
import { Textarea } from '../Textarea/Textarea'
import { FieldRow } from '../FieldRow/FieldRow'
import { FormSection, type FormSectionProps } from './FormSection'

/** 제어 컴포넌트라 스토리가 enabled를 들고 있는다 */
function FormSectionDemo({ enabled: initial, ...rest }: FormSectionProps) {
  const [enabled, setEnabled] = useState(initial ?? true)

  return (
    <div style={{ width: 760, maxWidth: '100%' }}>
      <FormSection {...rest} enabled={enabled} onEnabledChange={setEnabled} />
    </div>
  )
}

/** 카드 본문 샘플 — 3열 그리드에서 FieldRow가 열을 나눠 쓴다 */
function SampleFields() {
  const [title, setTitle] = useState('여름 시즌 프로모션')
  const [sub, setSub] = useState('')

  return (
    <>
      <FieldRow label="배너 제목" required span={2}>
        <InputBase value={title} onChange={setTitle} placeholder="배너 제목을 입력하세요" />
      </FieldRow>
      <FieldRow label="노출 순서" description="숫자가 작을수록 먼저" span={1}>
        <InputBase value="1" onChange={() => {}} inputMode="numeric" />
      </FieldRow>
      <FieldRow label="보조 문구" description="최대 40자. 비우면 제목만 노출된다.">
        <Textarea value={sub} onChange={setSub} rows={2} maxLength={40} autoResize={false} />
      </FieldRow>
    </>
  )
}

const meta = {
  title: 'Admin/FormSection',
  component: FormSection,
  tags: ['autodocs'],
  args: {
    title: '문구·콘텐츠',
    description: '배너에 얹을 제목과 보조 문구를 입력합니다.',
    toggleable: false,
    enabled: true,
    toggleLabel: '사용',
    onLabel: 'ON',
    offLabel: 'OFF',
    children: <SampleFields />,
  },
  argTypes: {
    index: { control: { type: 'number', min: 1, step: 1 } },
    title: { control: 'text' },
    description: { control: 'text' },
    toggleable: { control: 'boolean' },
    enabled: { control: 'boolean' },
    toggleLabel: { control: 'text' },
    toggleDescription: { control: 'text' },
    disabledHint: { control: 'text' },
    children: { control: false },
    actions: { control: false },
    onEnabledChange: { control: false },
    onLabel: { control: 'text', description: '@deprecated labels.toggle.on' },
    offLabel: { control: 'text', description: '@deprecated labels.toggle.off' },
    labels: { control: 'object', description: '문구 통로 — 개별 prop > labels.* > 기본값' },
    columns: {
      control: 'inline-radio',
      options: [1, 2, 3],
      description: '본문 그리드 열 수(기본 3)',
    },
    appearance: {
      control: 'inline-radio',
      options: ['card', 'plain'],
      description: 'plain=모달·드로어 안에서 카드 보더가 겹치지 않게',
    },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  render: (args) => <FormSectionDemo {...args} />,
} satisfies Meta<typeof FormSection>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 토글 없는 섹션. 본문은 항상 보인다 */
export const Default: Story = {}

/** 번호 카드 — 레퍼런스의 '1. 배너 구분' */
export const Numbered: Story = {
  args: {
    index: 1,
    title: '배너 구분',
    description: '노출 위치와 기간을 정합니다.',
  },
}

/** 헤더 우측 액션 — 항목 추가 버튼 등 */
export const WithActions: Story = {
  args: {
    index: 3,
    title: '이미지',
    description: '권장 1920×640, 최대 8장.',
    actions: (
      <Button
        variant="secondary"
        appearance="outline"
        size="sm"
        label="이미지 추가"
        showLeftIcon
        leftIcon={<Plus size={14} />}
      />
    ),
  },
}

/** 토글 ON — 강조 밴드가 primary 톤이고 본문이 보인다 */
export const ToggleableOn: Story = {
  args: {
    index: 2,
    title: '문구·콘텐츠',
    toggleable: true,
    enabled: true,
    toggleLabel: '문구 사용',
    toggleDescription: '끄면 이미지만 노출됩니다.',
    disabledHint: '문구를 사용하지 않습니다. 배너 이미지만 노출됩니다.',
  },
}

/** 토글 OFF — 본문이 DOM에서 사라진다(빈 자리·여백 없음). 토글 행과 안내만 남는다 */
export const ToggleableOff: Story = {
  args: {
    index: 2,
    title: '문구·콘텐츠',
    toggleable: true,
    enabled: false,
    toggleLabel: '문구 사용',
    toggleDescription: '끄면 이미지만 노출됩니다.',
    disabledHint: '문구를 사용하지 않습니다. 배너 이미지만 노출됩니다.',
  },
}

/**
 * 레퍼런스 폼 한 장 — 번호 카드 4개를 쌓는다.
 * 2번(문구)과 4번(링크)은 토글로 꺼진 상태라 본문이 통째로 빠져 있다.
 */
export const Composed: Story = {
  render: () => {
    function ComposedDemo() {
      const [useText, setUseText] = useState(true)
      const [useLink, setUseLink] = useState(false)
      const [name, setName] = useState('메인 상단 배너')
      const [headline, setHeadline] = useState('여름 시즌 최대 50% 할인')
      const [url, setUrl] = useState('')

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-4)',
            width: 880,
            maxWidth: '100%',
          }}
        >
          <FormSection index={1} title="배너 구분" description="노출 위치와 관리용 이름을 정합니다.">
            <FieldRow label="배너 이름" required span={2}>
              <InputBase value={name} onChange={setName} placeholder="관리자만 보는 이름" />
            </FieldRow>
            <FieldRow label="노출 순서" description="숫자가 작을수록 먼저" span={1}>
              <InputBase value="1" onChange={() => {}} inputMode="numeric" />
            </FieldRow>
          </FormSection>

          <FormSection
            index={2}
            title="문구·콘텐츠"
            toggleable
            enabled={useText}
            onEnabledChange={setUseText}
            toggleLabel="문구 사용"
            toggleDescription="끄면 이미지만 노출됩니다."
            disabledHint="문구를 사용하지 않습니다. 배너 이미지만 노출됩니다."
          >
            <FieldRow label="헤드라인" required span={3}>
              <InputBase value={headline} onChange={setHeadline} maxLength={40} />
            </FieldRow>
          </FormSection>

          <FormSection index={3} title="이미지" description="권장 1920×640. PC/모바일 각각 등록합니다.">
            <FieldRow label="PC 이미지" required span={3}>
              <InputBase value="summer-pc.jpg" onChange={() => {}} readOnly />
            </FieldRow>
          </FormSection>

          <FormSection
            index={4}
            title="링크·노출"
            toggleable
            enabled={useLink}
            onEnabledChange={setUseLink}
            toggleLabel="클릭 링크 사용"
            toggleDescription="배너를 누르면 지정한 주소로 이동합니다."
            disabledHint="링크 없이 이미지만 노출됩니다."
          >
            <FieldRow
              label="이동 주소"
              required
              error={url === '' ? 'https:// 로 시작하는 주소를 입력하세요.' : undefined}
              span={3}
            >
              <InputBase value={url} onChange={setUrl} error={url === ''} placeholder="https://" />
            </FieldRow>
          </FormSection>
        </div>
      )
    }

    return <ComposedDemo />
  },
}

/**
 * 토글 문구 교체 — 화면 언어가 한글로 통일된 폼에서 스위치만 영어(ON/OFF)로 튀지 않게.
 * (Toggle은 label이 곧 접근성 이름이자 상태 표시라, 문구를 바꾸면 낭독도 함께 바뀐다)
 *
 * 개별 prop(onLabel/offLabel)은 그대로 살아 있고 labels보다 우선한다 — 기존 화면이 깨지지 않는다.
 */
export const KoreanToggleLabels: Story = {
  args: {
    index: 4,
    title: '링크·노출',
    description: '배너를 눌렀을 때의 동작을 정합니다.',
    toggleable: true,
    toggleLabel: '클릭 링크 사용',
    onLabel: '사용',
    offLabel: '미사용',
    disabledHint: '링크 없이 이미지만 노출됩니다.',
  },
}

/** labels 통로 하나로 밴드 문구·스위치를 영문으로 갈아끼운다(개별 prop은 주지 않는다) */
export const Labels: Story = {
  args: {
    index: 2,
    title: 'Content',
    description: 'Headline and supporting copy shown on the banner.',
    toggleable: true,
    toggleLabel: undefined,
    onLabel: undefined,
    offLabel: undefined,
    labels: { toggle: { label: 'Use content', on: 'On', off: 'Off' } },
    disabledHint: 'Content is disabled. Only the image is shown.',
  },
}

/** 1열 폼 — 좁은 폭(maxWidth='md')이나 드로어 안 폼. span은 열 수에 맞춰 자동으로 눕는다 */
export const SingleColumn: Story = {
  args: {
    index: 1,
    title: '배너 구분',
    columns: 1,
  },
  render: (args) => (
    <div style={{ width: 420, maxWidth: '100%' }}>
      <FormSectionDemo {...args} />
    </div>
  ),
}

/** 크롬 없음(appearance='plain') — 모달·드로어가 이미 카드 면을 갖고 있을 때 보더 이중 겹침을 막는다 */
export const PlainAppearance: Story = {
  args: {
    title: '문구·콘텐츠',
    appearance: 'plain',
  },
}
