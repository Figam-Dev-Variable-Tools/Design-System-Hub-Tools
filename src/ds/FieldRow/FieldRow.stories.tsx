import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { InputBase } from '../InputBase/InputBase'
import { Select } from '../Select/Select'
import { FormSection } from '../FormSection/FormSection'
import { FieldRow, type FieldRowProps } from './FieldRow'

/** 컨트롤이 제어 컴포넌트라 스토리가 값을 들고 있는다 */
function FieldRowDemo({ children: _children, error, ...rest }: FieldRowProps) {
  const [value, setValue] = useState('')

  return (
    <div style={{ width: 420, maxWidth: '100%' }}>
      <FieldRow {...rest} error={error}>
        {/* InputBase는 임의 prop을 spread하지 않으므로 error 톤은 자체 prop으로 함께 넘긴다 */}
        <InputBase
          value={value}
          onChange={setValue}
          placeholder="주문번호를 입력하세요"
          error={error != null && error !== ''}
        />
      </FieldRow>
    </div>
  )
}

const meta = {
  title: 'Admin/FieldRow',
  component: FieldRow,
  tags: ['autodocs'],
  args: {
    label: '주문번호',
    required: false,
    requiredMark: '*',
    children: null,
  },
  argTypes: {
    label: { control: 'text' },
    required: { control: 'boolean' },
    description: { control: 'text' },
    error: { control: 'text' },
    htmlFor: { control: false },
    span: { control: 'inline-radio', options: [1, 2, 3] },
    children: { control: false },
    requiredMark: { control: 'text', description: '필수 표시 기호(기본 *) — 장식이라 낭독되지 않는다' },
    labelPlacement: {
      control: 'inline-radio',
      options: ['top', 'left'],
      description: 'left=어드민 설정 화면의 2열 폼(좁은 폭에서는 자동으로 top)',
    },
    labelWidth: { control: { type: 'number', min: 80, step: 20 }, description: 'left 배치의 라벨 열 폭(px)' },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
  render: (args) => <FieldRowDemo {...args} />,
} satisfies Meta<typeof FieldRow>

export default meta
type Story = StoryObj<typeof meta>

/** 1. 기본 — 라벨 + 컨트롤만 */
export const Default: Story = {}

/** 필수 — 라벨 뒤 error 톤 * */
export const Required: Story = {
  args: { required: true },
}

/** 2. description — 컨트롤 아래 회색 보조 설명 */
export const WithDescription: Story = {
  args: {
    required: true,
    description: '주문 상세에서 복사한 20자리 번호를 그대로 붙여 넣으세요.',
  },
}

/** 3. error — 설명 자리를 에러 문구가 대체하고 컨트롤에 aria-invalid가 걸린다 */
export const WithError: Story = {
  args: {
    required: true,
    description: '주문 상세에서 복사한 20자리 번호를 그대로 붙여 넣으세요.',
    error: '존재하지 않는 주문번호입니다.',
  },
}

/** 3상태를 나란히 — 기본 / description / error */
export const States: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-5)',
        width: 420,
        maxWidth: '100%',
      }}
    >
      <FieldRowDemo label="주문번호" required>
        {null}
      </FieldRowDemo>
      <FieldRowDemo
        label="주문번호"
        required
        description="주문 상세에서 복사한 20자리 번호를 그대로 붙여 넣으세요."
      >
        {null}
      </FieldRowDemo>
      <FieldRowDemo
        label="주문번호"
        required
        description="주문 상세에서 복사한 20자리 번호를 그대로 붙여 넣으세요."
        error="존재하지 않는 주문번호입니다."
      >
        {null}
      </FieldRowDemo>
    </div>
  ),
}

/** span — FormSection 본문(3열 그리드)에서 열을 나눠 쓴다. 생략하면 한 줄 전체 */
export const Spans: Story = {
  render: () => {
    function SpansDemo() {
      const [name, setName] = useState('홍길동')
      const [phone, setPhone] = useState('010-0000-0000')
      const [grade, setGrade] = useState<string | null>('vip')
      const [memo, setMemo] = useState('')

      return (
        <div style={{ width: 880, maxWidth: '100%' }}>
          <FormSection index={1} title="고객 정보" description="span으로 3열을 나눠 쓴다.">
            <FieldRow label="이름" required span={1}>
              <InputBase value={name} onChange={setName} />
            </FieldRow>
            <FieldRow label="연락처" required span={1}>
              <InputBase value={phone} onChange={setPhone} inputMode="tel" />
            </FieldRow>
            <FieldRow label="등급" span={1}>
              <Select
                value={grade}
                onChange={setGrade}
                options={[
                  { value: 'vip', label: 'VIP' },
                  { value: 'general', label: '일반' },
                  { value: 'dormant', label: '휴면' },
                ]}
              />
            </FieldRow>
            <FieldRow label="이메일" description="span=2 — 3열 중 2열" span={2}>
              <InputBase value="hong@example.com" onChange={() => {}} type="email" />
            </FieldRow>
            <FieldRow label="추천인 코드" span={1}>
              <InputBase value="" onChange={() => {}} placeholder="선택 입력" />
            </FieldRow>
            <FieldRow label="비고" description="span을 생략하면 한 줄 전체를 쓴다">
              <InputBase value={memo} onChange={setMemo} placeholder="자유 입력" />
            </FieldRow>
          </FormSection>
        </div>
      )
    }

    return <SpansDemo />
  },
}

/**
 * 네이티브 컨트롤 — htmlFor로 라벨을 잇고, error면 aria-invalid / aria-describedby가
 * cloneElement로 실제 DOM에 주입된다(개발자 도구로 확인 가능).
 * DS 프리미티브는 임의 prop을 spread하지 않으므로 이 주입이 닿지 않는다 — 그쪽은 자체 error prop을 쓴다.
 */
export const NativeControl: Story = {
  render: () => {
    function NativeDemo() {
      const [value, setValue] = useState('')
      const invalid = value.trim() === ''

      const inputStyle: CSSProperties = {
        boxSizing: 'border-box',
        width: '100%',
        height: 40,
        padding: '0 var(--ds-spacing-3)',
        fontFamily: 'inherit',
        fontSize: 'var(--ds-font-size-sm)',
        color: 'var(--ds-color-text)',
        background: 'var(--ds-color-bg)',
        border: `var(--ds-border-width) solid ${
          invalid ? 'var(--ds-color-error)' : 'var(--ds-color-border)'
        }`,
        borderRadius: 'var(--ds-radius-md)',
      }

      return (
        <div style={{ width: 420, maxWidth: '100%' }}>
          <FieldRow
            label="쿠폰 코드"
            required
            htmlFor="coupon-code"
            description="영문 대문자와 숫자만."
            error={invalid ? '쿠폰 코드를 입력하세요.' : undefined}
          >
            <input
              id="coupon-code"
              style={inputStyle}
              value={value}
              placeholder="SUMMER2026"
              onChange={(e) => setValue(e.target.value)}
            />
          </FieldRow>
        </div>
      )
    }

    return <NativeDemo />
  },
}

/**
 * 좌측 라벨(labelPlacement='left') — 어드민 설정 화면에서 흔한 2열 폼.
 * 설명·에러는 라벨 아래가 아니라 컨트롤 아래(2번 열)에 선다 — 읽는 순서가 맞아야 한다.
 * 1023px 이하에서는 자동으로 top으로 풀린다(라벨 열이 컨트롤을 짓누르지 않게).
 */
export const LeftLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 560, maxWidth: '100%' }}>
      <FieldRow label="서비스 이름" required labelPlacement="left">
        <InputBase value="스페이스플래닝" onChange={() => {}} />
      </FieldRow>
      <FieldRow
        label="담당자 이메일"
        labelPlacement="left"
        description="장애 알림이 이 주소로 발송됩니다."
      >
        <InputBase value="ops@example.com" onChange={() => {}} type="email" />
      </FieldRow>
      <FieldRow
        label="휴대폰 번호"
        required
        labelPlacement="left"
        labelWidth={180}
        error="숫자만 입력하세요."
      >
        <InputBase value="010-abc" onChange={() => {}} error />
      </FieldRow>
    </div>
  ),
}

/**
 * 필수 표시 교체 — 화면마다 관례가 다르다('*' / '필수' / '●').
 * 장식(aria-hidden)이라 무엇을 넣어도 스크린리더 낭독에는 끼어들지 않는다.
 */
export const RequiredMark: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 420, maxWidth: '100%' }}>
      <FieldRow label="주문번호" required>
        <InputBase value="" onChange={() => {}} placeholder="기본 — *" />
      </FieldRow>
      <FieldRow label="주문번호" required requiredMark="필수">
        <InputBase value="" onChange={() => {}} placeholder="텍스트 표기" />
      </FieldRow>
      <FieldRow label="주문번호" required requiredMark="●">
        <InputBase value="" onChange={() => {}} placeholder="점 표기" />
      </FieldRow>
    </div>
  ),
}
