import type { Meta, StoryObj } from '@storybook/react'
import { Building2 } from 'lucide-react'
import { AdminLogin } from './AdminLogin'

// 어드민 화면 계열 스토리는 'Admin/…'을 쓴다(DashboardScreen.stories.tsx 참조).
// 이 컴포넌트는 아직 Figma 세트가 없다 — verify-parity의 커버리지 검사는 'Admin/'로
// 시작하는 제목을 세트가 아니라 "화면"으로 취급해 갭 목록에서 아예 빠진다(스크립트 §6 참조).
const meta = {
  title: 'Admin/AdminLogin',
  component: AdminLogin,
  tags: ['autodocs'],
  argTypes: {
    show: { control: 'object' },
    labels: { control: 'object' },
    socialProviders: { control: 'object' },
    logo: { control: false },
    onSubmit: { control: false },
    onForgotPassword: { control: false },
    onSocialLogin: { control: false },
  },
} satisfies Meta<typeof AdminLogin>

export default meta
type Story = StoryObj<typeof meta>

/** 기본 — 아이디·비밀번호·로그인 유지·비밀번호 찾기. 소셜 로그인은 기본 꺼짐 */
export const Default: Story = {
  args: {
    onSubmit: (email, password, remember) => console.log('submit:', { email, password, remember }),
    onForgotPassword: () => console.log('forgot password'),
  },
}

/** 로그인 실패 — 폼 위에 Alert(error)가 뜬다 */
export const WithError: Story = {
  args: {
    ...Default.args,
    error: '아이디 또는 비밀번호가 올바르지 않습니다.',
  },
}

/** 제출 처리 중 — 입력·버튼이 잠기고 버튼 라벨이 로딩 문구로 바뀐다 */
export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
  },
}

/** 문구 오버라이드 — labels로 타이틀·서브타이틀·버튼 문구를 통째로 갈아끼운다 */
export const LabelOverride: Story = {
  args: {
    ...Default.args,
    labels: {
      title: '스페이스플래닝 어드민',
      subtitle: '사내 계정으로 로그인하세요.',
      emailLabel: '사번 또는 이메일',
      submitLabel: '접속하기',
    },
  },
}

/** 로고 + 소셜 로그인 켠 상태 — show.social을 켜면 구분선과 소셜 버튼이 나타난다 */
export const WithLogoAndSocial: Story = {
  args: {
    ...Default.args,
    logo: <Building2 size={32} aria-hidden="true" />,
    show: { social: true },
    socialProviders: ['google', 'kakao'],
    onSocialLogin: (provider) => console.log('social login:', provider),
  },
}
