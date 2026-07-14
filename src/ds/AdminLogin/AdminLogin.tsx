import { useState, type ReactNode } from 'react'
import { mergeLabels } from '../../shared/labels'
import { Alert } from '../Alert/Alert'
import { Button } from '../Button/Button'
import { Card } from '../Card/Card'
import { Checkbox } from '../Checkbox/Checkbox'
import { Divider } from '../Divider/Divider'
import { InputBase } from '../InputBase/InputBase'
import { PasswordField } from '../PasswordField/PasswordField'
import { SocialLoginButton, type SocialLoginButtonProps } from '../SocialLoginButton/SocialLoginButton'
import styles from './AdminLogin.module.css'

/**
 * AdminLogin 문구 — 표면이 로그인 카드 하나뿐이라 그룹 없이 1단계 평탄 구조로 둔다
 * (§3: 중첩은 표면 기준 1단계까지만 — 표면이 하나면 그룹 자체가 필요 없다).
 */
export type AdminLoginLabels = {
  title?: string
  subtitle?: string
  emailLabel?: string
  emailPlaceholder?: string
  passwordLabel?: string
  passwordPlaceholder?: string
  rememberLabel?: string
  forgotPasswordLabel?: string
  submitLabel?: string
  submitLoadingLabel?: string
  /** 소셜 로그인 구분선 라벨(예: '또는') */
  dividerLabel?: string
}

export const DEFAULT_ADMIN_LOGIN_LABELS: Required<AdminLoginLabels> = {
  title: '관리자 로그인',
  subtitle: '운영 콘솔에 접속하려면 계정 정보를 입력하세요.',
  emailLabel: '아이디',
  emailPlaceholder: 'admin@example.com',
  passwordLabel: '비밀번호',
  passwordPlaceholder: '비밀번호를 입력하세요',
  rememberLabel: '로그인 유지',
  forgotPasswordLabel: '비밀번호를 잊으셨나요?',
  submitLabel: '로그인',
  submitLoadingLabel: '로그인 중…',
  dividerLabel: '또는',
}

export type AdminLoginShow = {
  /** logo 슬롯을 그릴지 — 슬롯이 비어 있으면(logo 미전달) 어차피 렌더되지 않는다 */
  logo?: boolean
  /** '로그인 유지' 체크박스 */
  remember?: boolean
  /** '비밀번호를 잊으셨나요?' 링크 */
  forgotPassword?: boolean
  /** 소셜 로그인 버튼 묶음. 어드민 계정은 사내 인증이 기본이라 기본값은 꺼짐 — 켜고 싶은 화면만 열어라 */
  social?: boolean
}

export type AdminLoginProps = {
  /** 상단 브랜드 슬롯(로고 이미지·워드마크 등). DS에 전용 로고 컴포넌트가 없어 ReactNode로 연다 */
  logo?: ReactNode
  /** 로그인 실패 등 폼 상단 에러 — 있으면 Alert(error)로 뜬다 */
  error?: string
  /** 제출 처리 중 — 입력·버튼을 잠그고 제출 버튼 라벨을 loading 문구로 바꾼다 */
  loading?: boolean
  show?: AdminLoginShow
  /** show.social이 켜졌을 때 그릴 provider 목록. 기본은 사내 어드민에서 흔한 구글 하나만 */
  socialProviders?: SocialLoginButtonProps['provider'][]
  onSubmit?: (email: string, password: string, remember: boolean) => void
  onForgotPassword?: () => void
  onSocialLogin?: (provider: SocialLoginButtonProps['provider']) => void
  labels?: AdminLoginLabels
}

const DEFAULT_SOCIAL_PROVIDERS: SocialLoginButtonProps['provider'][] = ['google']

export function AdminLogin({
  logo,
  error,
  loading = false,
  show,
  socialProviders = DEFAULT_SOCIAL_PROVIDERS,
  onSubmit,
  onForgotPassword,
  onSocialLogin,
  labels,
}: AdminLoginProps) {
  const L = mergeLabels(DEFAULT_ADMIN_LOGIN_LABELS, labels)

  const showLogo = show?.logo ?? true
  const showRemember = show?.remember ?? true
  const showForgotPassword = show?.forgotPassword ?? true
  const showSocial = show?.social ?? false

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  // Button은 항상 type="button"이다(§공용 프리미티브는 읽기 전용) — 그래서 제출은 두 경로가
  // 같은 함수를 부른다: form의 onSubmit(Enter 키 암묵 제출)과 버튼의 onClick(마우스 클릭).
  // 이 이중 배선은 이 저장소의 기존 관행이다(ProductForm.tsx의 제출 버튼과 동일한 패턴).
  function submit() {
    onSubmit?.(email, password, remember)
  }

  return (
    <div className={styles.page}>
      <Card title={L.title}>
        <div className={styles.body}>
          {showLogo && logo != null && <div className={styles.logo}>{logo}</div>}
          <p className={styles.subtitle}>{L.subtitle}</p>

          {error != null && <Alert variant="error" label={error} showIcon />}

          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <InputBase
              label={L.emailLabel}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder={L.emailPlaceholder}
              required
              disabled={loading}
              fullWidth
            />
            <PasswordField
              label={L.passwordLabel}
              value={password}
              onChange={setPassword}
              placeholder={L.passwordPlaceholder}
              required
              disabled={loading}
              fullWidth
            />

            {(showRemember || showForgotPassword) && (
              <div className={styles.row}>
                {showRemember ? (
                  <Checkbox
                    checked={remember}
                    onChange={setRemember}
                    label={L.rememberLabel}
                    disabled={loading}
                  />
                ) : (
                  <span />
                )}
                {showForgotPassword && (
                  <button
                    type="button"
                    className={styles.forgotLink}
                    onClick={onForgotPassword}
                    disabled={loading}
                  >
                    {L.forgotPasswordLabel}
                  </button>
                )}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              label={loading ? L.submitLoadingLabel : L.submitLabel}
              fullWidth
              disabled={loading}
              onClick={submit}
            />
          </form>

          {showSocial && socialProviders.length > 0 && (
            <div className={styles.social}>
              <Divider label={L.dividerLabel} />
              <div className={styles.socialButtons}>
                {socialProviders.map((provider) => (
                  <SocialLoginButton
                    key={provider}
                    provider={provider}
                    size="md"
                    onClick={() => onSocialLogin?.(provider)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
