import { useState } from 'react'
import type { ReactNode } from 'react'
import { Ban, List, Pencil, ShieldCheck, Trash2 } from 'lucide-react'
import { AdminPageLayout } from '../AdminPageLayout/AdminPageLayout'
import { Avatar } from '../Avatar/Avatar'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import { ConsentList, type ConsentItem } from '../ConsentList/ConsentList'
import { CrudDialog } from '../CrudDialog/CrudDialog'
import { DefinitionList, type DefinitionItem } from '../DefinitionList/DefinitionList'
import { EmptyState } from '../EmptyState/EmptyState'
import { MemoBox } from '../MemoBox/MemoBox'
import { PageHeaderBar } from '../PageHeaderBar/PageHeaderBar'
import { PageSection } from '../PageContainer/PageContainer'
import { Skeleton } from '../Skeleton/Skeleton'
import { ActivityStats, type ActivityStat } from './activityStats'
import styles from './CustomerDetail.module.css'

/** 배지 톤 — 회원 유형(일반/VIP/휴면/차단)에 맞춰 호출부가 고른다 */
export type CustomerTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error'

export type CustomerProfile = {
  /** 회원 ID — 값 자리에 흐리게 표기되는 내부 식별자 */
  id: string
  name: string
  avatarUrl?: string
  /** 이름 옆 가입 수단 배지 — '이메일 가입' / '카카오 가입' */
  signupBadge?: string
  /** 회원 유형 — 일반 / VIP / 휴면 */
  memberType: string
  memberTypeTone?: CustomerTone
  /** 계정(이메일) */
  email: string
  phone?: string
  /** 연락처 옆 '인증됨' 표시 */
  phoneVerified?: boolean
  birthday?: string
  /** 남성 / 여성 / 미입력 */
  gender?: string
  /** 가입 경로 — '이메일 · PC 웹' */
  signupPath?: string
  /** 가입 경로 보조 설명 — 유입 캠페인 등 */
  signupPathHint?: string
}

export type CustomerActivity = {
  orderCount: number
  /** 누적 구매금액(원) */
  totalPurchase: number
  inquiryCount: number
  commentCount: number
  /** 가입일 — 'YYYY-MM-DD' 또는 ISO */
  joinedAt: string
  /** 상대시간 문구 — 없으면 joinedAt에서 계산한다 */
  joinedAtHint?: string
  /** 최근 로그인 — 없으면 '기록 없음' */
  lastLoginAt?: string
  lastLoginHint?: string
}

/**
 * ON/OFF 규약 — 기본값은 전부 true. false면 그 영역이 DOM에서 완전히 사라진다
 * (빈 자리·여백·구분선을 남기지 않는다).
 *
 * 화면마다 필요한 카드가 다르다(메모를 안 쓰는 CS 화면, 동의 정보가 없는 B2B 화면 …).
 * 그럴 때 화면을 새로 만들지 않고 이 키만 끄라고 두는 스위치다.
 *
 * 필드 단위 키(memberType … memberId)는 쌍둥이였던 CustomerDetailPage가 갖고 있던 기능이다.
 * 화면을 둘로 나눠 두면 같은 버그를 두 번 고쳐야 해서, 그쪽을 지우고 그 능력만 여기로 흡수했다.
 * (Figma에서는 같은 키가 BOOLEAN 컴포넌트 속성 `Show <Key>`로 노출된다)
 */
export type CustomerDetailShow = {
  /** 페이지 헤더 — 타이틀 + 설명 */
  header?: boolean
  /** 좌: [회원 정보] 카드 */
  profile?: boolean
  /** 우: [활동 정보] 카드 */
  activity?: boolean
  /** 우: [동의 정보] 카드 */
  consent?: boolean
  /** 우: [관리자 메모] 카드 */
  adminMemo?: boolean
  /** 하단 액션 바 */
  footer?: boolean

  /* ── 필드 단위 — [회원 정보] 정의 표의 행을 하나씩 끈다 ── */
  /** 회원 정보 > 회원 유형(배지) */
  memberType?: boolean
  /** 회원 정보 > 계정(이메일) */
  account?: boolean
  /** 회원 정보 > 이름 */
  name?: boolean
  /** 회원 정보 > 연락처(+인증됨) */
  phone?: boolean
  /** 회원 정보 > 생년월일 */
  birthday?: boolean
  /** 회원 정보 > 성별 */
  gender?: boolean
  /** 회원 정보 > 가입 경로 */
  signupPath?: boolean
  /** 회원 정보 > 회원 ID */
  memberId?: boolean

  /** 활동 정보 > 통계 4칸(주문 수·누적 구매금액·문의·댓글) */
  activityStats?: boolean
  /** 활동 정보 > 가입일·최근 로그인 */
  activityDates?: boolean
}

/**
 * 헤더 골격 — 어떤 조각으로 헤더 줄을 그릴지.
 *  - 'layout'(기본) : AdminPageLayout의 title/description 슬롯. 문자열이라 배지를 붙일 수 없다.
 *  - 'bar'          : PageHeaderBar. 제목 옆에 회원 유형 배지가 붙고 우측 액션(headerActions)을 받는다.
 *
 * 'bar'는 지워진 CustomerDetailPage의 헤더다 — 화면을 하나 더 두는 대신 prop 한 개로 남겼다.
 */
export type CustomerDetailHeader = 'layout' | 'bar'

export type CustomerDetailProps = {
  profile: CustomerProfile
  activity: CustomerActivity
  /** 동의 정보 — 비면 빈 상태로 대체된다 */
  consents?: ConsentItem[]

  /** 관리자 메모 — 제어 값 */
  memo: string
  onMemoChange: (value: string) => void
  onMemoSave?: () => void
  memoSaving?: boolean
  memoMaxLength?: number

  /** 페이지 헤더 */
  title?: string
  description?: string
  /** 헤더 골격 — 기본은 지금까지의 동작(AdminPageLayout 헤더) */
  header?: CustomerDetailHeader
  /** 헤더 우측 액션 슬롯 — [엑셀 다운로드] 등 */
  headerActions?: ReactNode

  /** 섹션·필드 ON/OFF (기본 전부 true) */
  show?: CustomerDetailShow

  /* ── 문구 — 같은 화면을 다른 도메인(회원/파트너/작가)에 쓸 때 라벨만 갈아끼운다 ── */
  /** 동의 내역이 비었을 때의 제목 */
  emptyTitle?: string
  /** 동의 내역 빈 상태 보조 설명 — 기본은 제목만 띄운다 */
  emptyDescription?: string

  /* ── 아이콘 슬롯 — 프로덕트마다 아이콘 세트가 달라 lucide 기본값만 갈아끼우게 연다 ── */
  /** [목록] 버튼 아이콘 */
  backIcon?: ReactNode
  /** [수정] 버튼 아이콘 */
  editIcon?: ReactNode
  /** [차단 · 차단 해제] 버튼 아이콘 */
  blockIcon?: ReactNode
  /** [삭제] 버튼 아이콘 */
  deleteIcon?: ReactNode

  /** 데이터 로딩 — 카드 골격만 남기고 스켈레톤을 그린다 */
  loading?: boolean
  /** 차단된 회원 — 헤더 배지와 하단 버튼 라벨('차단 해제')이 바뀐다 */
  blocked?: boolean
  /** 밀도 — 정의 행 44 / 56 */
  density?: 'compact' | 'comfortable'

  onBackToList?: () => void
  onEdit?: () => void
  /** 차단 · 차단 해제 — 확인 다이얼로그를 거친다 */
  onBlock?: (next: boolean) => void
  onDelete?: () => void
}

/* ── 옛 이름 별칭 ────────────────────────────────────────────────────────────
 * 쌍둥이 화면(고객 상세 Page)을 이 파일로 합치면서 그쪽 타입 이름을 그대로 남긴다.
 * 이미 그 이름으로 프로필/활동 데이터를 만들어 두고 있는 호출부가 있어서, 이름만 바꾸려고
 * 화면 코드를 건드리게 하지 않는다(구조는 완전히 같다 — 별칭일 뿐 새 타입이 아니다).
 */
export type CustomerPageTone = CustomerTone
export type CustomerPageProfile = CustomerProfile
export type CustomerPageActivity = CustomerActivity

/** show 기본값 — 스프레드로 합치면 명시적 undefined가 기본값을 덮어써서 하나씩 ?? true 로 푼다 */
function resolveShow(show: CustomerDetailShow = {}): Required<CustomerDetailShow> {
  return {
    header: show.header ?? true,
    profile: show.profile ?? true,
    activity: show.activity ?? true,
    consent: show.consent ?? true,
    adminMemo: show.adminMemo ?? true,
    footer: show.footer ?? true,
    memberType: show.memberType ?? true,
    account: show.account ?? true,
    name: show.name ?? true,
    phone: show.phone ?? true,
    birthday: show.birthday ?? true,
    gender: show.gender ?? true,
    signupPath: show.signupPath ?? true,
    memberId: show.memberId ?? true,
    activityStats: show.activityStats ?? true,
    activityDates: show.activityDates ?? true,
  }
}

/** 원화 — 통화 기호 없이 '원'만 붙인다(표/통계에서 자릿수 정렬) */
function formatKrw(value: number): string {
  if (!Number.isFinite(value)) return '-'
  return `${Math.round(value).toLocaleString('ko-KR')}원`
}

/** 건수 */
function formatCount(value: number): string {
  if (!Number.isFinite(value)) return '-'
  return `${Math.round(value).toLocaleString('ko-KR')}건`
}

/** 'YYYY-MM-DD HH:mm' / ISO 모두 받는다 — 공백 구분자는 T로 바꿔야 사파리에서 파싱된다 */
function toDate(value: string): Date | null {
  const parsed = new Date(value.trim().replace(' ', 'T'))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * 상대시간 — '3일 전' / '1년 8개월 전'.
 * 파싱 실패나 미래 시각이면 undefined를 돌려 hint 자리를 비운다(엉뚱한 문구를 만들지 않는다).
 */
export function formatRelativeKo(value: string, now: Date = new Date()): string | undefined {
  const date = toDate(value)
  if (date == null) return undefined

  const diffMs = now.getTime() - date.getTime()
  if (diffMs < 0) return undefined

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}일 전`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months}개월 전`

  const years = Math.floor(months / 12)
  const restMonths = months % 12
  return restMonths === 0 ? `${years}년 전` : `${years}년 ${restMonths}개월 전`
}

/** 값이 비었으면 '-' — 표의 빈칸을 흐린 대시 하나로 통일한다 */
function orDash(value: string | undefined): ReactNode {
  return value != null && value.trim() !== '' ? value : <span className={styles.muted}>-</span>
}

/**
 * CustomerDetail — 고객 상세 화면(고객 상세 단일 구현).
 *
 * 레이아웃은 AdminPageLayout(content + aside + footer) 조합만 한다. 직접 그리드를 짜지 않는다.
 *   header  : header='layout'(기본) 이면 AdminPageLayout 헤더, 'bar'면 PageHeaderBar(제목 + 유형 배지 + 액션)
 *   content : 회원 정보(아바타 + 이름 + 가입 배지 + DefinitionList)
 *   aside   : 활동 정보(통계 4칸 + 가입일/최근 로그인) · 동의 정보(ConsentList) · 관리자 메모(MemoBox)
 *   footer  : 목록 · 수정 · 차단 · 삭제 (차단/삭제는 CrudDialog 확인을 거친다)
 *
 * ON/OFF(show)
 *  - 섹션 키가 false면 그 카드가 통째로 사라진다. aside 카드가 전부 꺼지면 aside 슬롯 자체를 넘기지
 *    않아 우측 360 칼럼이 남지 않고, profile이 꺼지면 aside 카드를 본문으로 끌어올려 좌측 1fr 칼럼이
 *    비지 않게 한다(빈 자리 금지).
 *  - 필드 키가 false면 정의 표에서 그 행만 빠진다. 전부 끄면 정의 표 자체를 그리지 않는다.
 */
export function CustomerDetail({
  profile,
  activity,
  consents = [],
  memo,
  onMemoChange,
  onMemoSave,
  memoSaving = false,
  memoMaxLength = 500,
  title = '고객 상세',
  description,
  header = 'layout',
  headerActions,
  show,
  emptyTitle = '동의 내역이 없습니다.',
  emptyDescription,
  backIcon,
  editIcon,
  blockIcon,
  deleteIcon,
  loading = false,
  blocked = false,
  density = 'compact',
  onBackToList,
  onEdit,
  onBlock,
  onDelete,
}: CustomerDetailProps) {
  const [blockOpen, setBlockOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const s = resolveShow(show)

  const joinedHint = activity.joinedAtHint ?? formatRelativeKo(activity.joinedAt)
  const lastLoginHint =
    activity.lastLoginAt == null
      ? undefined
      : (activity.lastLoginHint ?? formatRelativeKo(activity.lastLoginAt))

  // ── 헤더 ──
  // AdminPageLayout에는 노드형 헤더 슬롯이 없다(title/description은 문자열이라 배지를 붙일 수 없다).
  // header='bar'면 body 위 전폭 슬롯(tabs)에 PageHeaderBar를 얹어 헤더 줄을 통째로 대체한다
  // — 탭이 없는 상세 화면이라 이 슬롯은 비어 있다.
  const headerBar =
    header === 'bar' && s.header ? (
      <PageHeaderBar
        title={title}
        description={description}
        badge={{ label: profile.memberType, tone: profile.memberTypeTone ?? 'primary' }}
        actions={headerActions}
      />
    ) : undefined

  // ── 회원 정보 — 필드 단위 ON/OFF. 켠 행만 배열에 담아 빈 줄이 남지 않게 한다 ──
  const infoItems: DefinitionItem[] = []
  if (s.memberType) {
    infoItems.push({
      label: '회원 유형',
      value: (
        <Badge
          variant={profile.memberTypeTone ?? 'secondary'}
          appearance="soft"
          size="sm"
          label={profile.memberType}
        />
      ),
    })
  }
  if (s.account) infoItems.push({ label: '계정(이메일)', value: orDash(profile.email) })
  if (s.name) infoItems.push({ label: '이름', value: orDash(profile.name) })
  if (s.phone) {
    infoItems.push({
      label: '연락처',
      value:
        profile.phone == null || profile.phone === '' ? (
          orDash(undefined)
        ) : (
          <span className={styles.phone}>
            <span className={styles.phoneNumber}>{profile.phone}</span>
            {profile.phoneVerified === true && (
              // 인증됨 — 색은 아이콘만, 위계는 굵기로
              <span className={styles.verified}>
                <ShieldCheck size={13} aria-hidden="true" />
                인증됨
              </span>
            )}
          </span>
        ),
    })
  }
  if (s.birthday) infoItems.push({ label: '생년월일', value: orDash(profile.birthday) })
  if (s.gender) infoItems.push({ label: '성별', value: orDash(profile.gender) })
  if (s.signupPath) {
    infoItems.push({
      label: '가입 경로',
      value: orDash(profile.signupPath),
      hint: profile.signupPathHint,
    })
  }
  if (s.memberId) {
    infoItems.push({ label: '회원 ID', value: <span className={styles.muted}>{profile.id}</span> })
  }

  const profileCard = !s.profile ? null : loading ? (
    <PageSection key="profile" title="회원 정보">
      <div className={styles.skeletonProfile}>
        <Skeleton variant="circle" width={56} height={56} />
        <Skeleton variant="text" lines={2} width="240px" />
      </div>
      <Skeleton variant="block" width="100%" height={280} />
    </PageSection>
  ) : (
    <PageSection key="profile" title="회원 정보">
      <div className={styles.profile}>
        <div className={styles.identity}>
          <Avatar name={profile.name} src={profile.avatarUrl} size="xl" />
          <div className={styles.names}>
            <span className={styles.name} title={profile.name}>
              {profile.name}
            </span>
            <span className={styles.identityBadges}>
              {profile.signupBadge != null && profile.signupBadge !== '' && (
                <Badge variant="secondary" appearance="soft" size="sm" label={profile.signupBadge} />
              )}
              {blocked && <Badge variant="error" appearance="soft" size="sm" label="차단됨" />}
            </span>
          </div>
        </div>

        {/* 필드를 전부 끄면 정의 표를 아예 그리지 않는다 — 빈 보더가 남지 않게 */}
        {infoItems.length > 0 && <DefinitionList items={infoItems} columns={2} density={density} />}
      </div>
    </PageSection>
  )

  // ── 활동 정보 — 통계 2×2. 마크업은 두 상세 화면이 공유하는 ActivityStats 하나뿐이다 ──
  const statItems: ActivityStat[] = [
    { label: '주문 수', value: formatCount(activity.orderCount) },
    { label: '누적 구매금액', value: formatKrw(activity.totalPurchase) },
    { label: '문의', value: formatCount(activity.inquiryCount) },
    { label: '댓글', value: formatCount(activity.commentCount) },
  ]

  const activityItems: DefinitionItem[] = [
    { label: '가입일', value: orDash(activity.joinedAt), hint: joinedHint },
    {
      label: '최근 로그인',
      value:
        activity.lastLoginAt == null || activity.lastLoginAt === '' ? (
          <span className={styles.muted}>기록 없음</span>
        ) : (
          activity.lastLoginAt
        ),
      hint: lastLoginHint,
    },
  ]

  // 통계·날짜가 둘 다 꺼지면 카드 자체가 사라진다(제목만 남은 빈 카드 금지)
  const hasActivityBody = s.activityStats || s.activityDates
  const activityCard = !s.activity || !hasActivityBody ? null : loading ? (
    <PageSection key="activity" title="활동 정보">
      <Skeleton variant="block" width="100%" height={168} />
    </PageSection>
  ) : (
    <PageSection key="activity" title="활동 정보">
      <div className={styles.activity}>
        {s.activityStats && <ActivityStats items={statItems} />}
        {s.activityDates && <DefinitionList items={activityItems} columns={1} density="compact" />}
      </div>
    </PageSection>
  )

  const consentCard = !s.consent ? null : loading ? (
    <PageSection key="consent" title="동의 정보">
      <Skeleton variant="text" lines={3} />
    </PageSection>
  ) : (
    <PageSection key="consent" title="동의 정보">
      {consents.length === 0 ? (
        <EmptyState compact kind="empty" title={emptyTitle} description={emptyDescription} />
      ) : (
        <ConsentList items={consents} />
      )}
    </PageSection>
  )

  const memoCard = !s.adminMemo ? null : loading ? (
    <PageSection key="memo" title="관리자 메모">
      <Skeleton variant="block" width="100%" height={120} />
    </PageSection>
  ) : (
    // MemoBox는 자체 카드 크롬(제목·보더·radius)을 들고 온다 — PageSection으로 또 감싸지 않는다
    <MemoBox
      key="memo"
      value={memo}
      onChange={onMemoChange}
      onSave={onMemoSave}
      maxLength={memoMaxLength}
      saving={memoSaving}
    />
  )

  const asideCards = [activityCard, consentCard, memoCard].filter(Boolean)

  // 회원 정보가 꺼지면 좌측 1fr이 빈 칼럼으로 남는다 — aside 카드를 본문으로 끌어올려 자리를 없앤다
  const mainCards = profileCard != null ? [profileCard] : asideCards
  const aside = profileCard != null && asideCards.length > 0 ? <>{asideCards}</> : undefined

  // ── 하단 액션 바 — 목록 · 수정 · 차단 · 삭제 ──
  const footer = s.footer ? (
    <>
      <span className={styles.footerLeft}>
        <Button
          variant="secondary"
          appearance="outline"
          size="md"
          label="목록"
          showLeftIcon
          leftIcon={backIcon ?? <List size={16} />}
          disabled={loading}
          onClick={onBackToList}
        />
      </span>

      <Button
        variant="secondary"
        appearance="outline"
        size="md"
        label={blocked ? '차단 해제' : '차단'}
        showLeftIcon
        leftIcon={blockIcon ?? <Ban size={16} />}
        disabled={loading}
        onClick={() => setBlockOpen(true)}
      />
      <Button
        variant="error"
        appearance="outline"
        size="md"
        label="삭제"
        showLeftIcon
        leftIcon={deleteIcon ?? <Trash2 size={16} />}
        disabled={loading}
        onClick={() => setDeleteOpen(true)}
      />
      <Button
        variant="primary"
        size="md"
        label="수정"
        showLeftIcon
        leftIcon={editIcon ?? <Pencil size={16} />}
        disabled={loading}
        onClick={onEdit}
      />
    </>
  ) : undefined

  return (
    <>
      <AdminPageLayout
        // show.header=false면 타이틀·설명을 비워 헤더 슬롯을 통째로 지운다.
        // header='bar'면 문자열 슬롯을 비우고 tabs 자리의 PageHeaderBar가 헤더를 대신한다(중복 금지).
        title={s.header && headerBar == null ? title : undefined}
        description={s.header && headerBar == null ? description : undefined}
        headerActions={s.header && headerBar == null ? headerActions : undefined}
        tabs={headerBar}
        maxWidth="full"
        density={density}
        aside={aside}
        footer={footer}
      >
        {mainCards.length > 0 ? mainCards : null}
      </AdminPageLayout>

      {/* 차단 / 차단 해제 */}
      <CrudDialog
        open={blockOpen}
        mode="delete"
        title={blocked ? '차단을 해제할까요?' : '회원을 차단할까요?'}
        description={
          blocked
            ? `${profile.name}(${profile.email}) 님이 다시 로그인할 수 있습니다.`
            : `${profile.name}(${profile.email}) 님은 로그인과 주문이 즉시 차단됩니다.`
        }
        confirmLabel={blocked ? '차단 해제' : '차단'}
        onConfirm={() => {
          onBlock?.(!blocked)
          setBlockOpen(false)
        }}
        onCancel={() => setBlockOpen(false)}
      />

      {/* 삭제 */}
      <CrudDialog
        open={deleteOpen}
        mode="delete"
        title="회원을 삭제할까요?"
        description={`${profile.name}(${profile.id}) 님의 계정과 활동 정보가 함께 삭제됩니다. 되돌릴 수 없습니다.`}
        onConfirm={() => {
          onDelete?.()
          setDeleteOpen(false)
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  )
}
