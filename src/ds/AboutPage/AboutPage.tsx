import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '../Button/Button'
import { Card } from '../Card/Card'
import { Image } from '../Image/Image'
import { SiteSection } from '../SiteSection/SiteSection'
import { Skeleton } from '../Skeleton/Skeleton'
import { Placeholder } from '../../shared/placeholders'
import { mergeLabels, resolveLabel, type DeepPartialOneLevel } from '../../shared/labels'
import styles from './AboutPage.module.css'

/**
 * 회사 소개(About) 페이지. 라이트(흰색) 단일 테마다 — 다크 밴드는 없다.
 *
 * 레이아웃은 직접 짜지 않고 SiteSection으로만 조합한다 —
 * 면·최대 폭·섹션 패딩·헤딩 타이포·강조색은 전부 SiteSection이 단일 출처다.
 * 위계는 색 반전이 아니라 tone 교차로 만든다:
 *   히어로(plain) → 개요(plain) → 역량(subtle·흰 카드) → 숫자(plain) → CTA(subtle)
 *
 * 강조색도 SiteSection이 내려주는 --site-accent-text(흰 면 위 글자용 셰이드)를 소비만 한다.
 *
 * 조각도 새로 만들지 않는다 — 히어로 카피는 SiteSection(align="center"),
 * 이미지는 Image(플레이스홀더 폴백 포함), 역량 카드는 Card가 각각 단일 출처다.
 */

export type AboutHero = {
  /** 헤드라인 위 작은 라벨 — 강조색 */
  eyebrow?: string
  /** 영문 대형 헤드라인. 노드를 넘기면 Highlight로 한 단어만 강조색을 줄 수 있다 */
  title: ReactNode
  /** 한글 서브카피 */
  subtitle: ReactNode
  /** 배경 이미지 — 없으면 Image가 공용 Placeholder로 대체한다 */
  imageSrc?: string
  imageAlt?: string
}

export type AboutIntro = {
  /** 영문 헤드라인 */
  title: ReactNode
  /** 한글 서브카피 */
  subtitle?: ReactNode
  /** 미션/비전 문단 2~3개 */
  paragraphs: string[]
  imageSrc?: string
  imageAlt?: string
}

export type AboutCapability = {
  id: string
  /** lucide-react 아이콘 노드 — 없으면 공용 Placeholder */
  icon?: ReactNode
  title: string
  description: string
}

export type AboutStat = {
  /** 라벨 — 숫자 아래 */
  label: string
  /** 큰 숫자 — '120+' '15년'처럼 접미사를 포함할 수 있어 string이다 */
  value: string
}

/** 섹션 헤딩(영문 대형 + 한글 서브) */
export type AboutSectionCopy = {
  title: ReactNode
  subtitle?: ReactNode
}

export type AboutCta = {
  title: string
  subtitle?: string
  buttonLabel: string
}

/**
 * 화면이 스스로 들고 있는 문구 — hero·intro는 전부 데이터(props)라 여기 없다.
 * 남는 건 섹션 헤딩 2개와 CTA 밴드뿐이다.
 */
export type AboutPageLabels = {
  capabilities: AboutSectionCopy
  stats: AboutSectionCopy
  cta: AboutCta
}

export type AboutPageProps = {
  hero: AboutHero
  intro: AboutIntro
  capabilities: AboutCapability[]
  /**
   * @deprecated labels.capabilities를 쓴다. 하위호환으로 유지되며, 넘기면 labels보다 우선한다
   *   (통째로 대체된다 — 부분 오버라이드는 labels 쪽을 써라).
   */
  capabilitiesCopy?: AboutSectionCopy
  stats: AboutStat[]
  /** @deprecated labels.stats를 쓴다(개별 prop이 우선하며 통째로 대체된다) */
  statsCopy?: AboutSectionCopy
  /** @deprecated labels.cta를 쓴다(개별 prop이 우선하며 통째로 대체된다) */
  cta?: AboutCta
  /** 문구 — 개별 prop(capabilitiesCopy·statsCopy·cta)이 있으면 그쪽이 이긴다 */
  labels?: DeepPartialOneLevel<AboutPageLabels>
  /** 역량 카드 열 수 (기본 4) — 항목이 3·6개일 때 마지막 줄이 비지 않게 맞춘다 */
  capabilityColumns?: 2 | 3 | 4
  /** 숫자 성과 열 수 (기본 4) */
  statColumns?: 2 | 3 | 4
  /**
   * CTA 버튼의 면 처리 (기본 solid).
   * 색(variant)은 accent에서 파생되지만, 한 사이트 안에서 ContactPage(검은 CTA)와 톤을 맞춰야 할 때
   * outline·ghost로 낮춘다.
   */
  ctaAppearance?: 'solid' | 'outline' | 'ghost'
  onInquiry?: () => void
  /** 강조색 — 기본 success(레퍼런스의 그린) */
  accent?: 'primary' | 'success'
  /** 스켈레톤 표시 */
  loading?: boolean
  /**
   * CTA 밴드 노출 (기본 true).
   * 회사 소개가 사내 인트라넷·IR 페이지처럼 '문의받지 않는' 자리에 붙을 때 밴드째 끈다.
   */
  showCta?: boolean
  /**
   * 섹션 헤딩 아래 구분선 + 강조색 세그먼트 (기본 true).
   * 한 페이지에 About을 부분 삽입할 때 선이 겹쳐 보이면 끈다.
   */
  showDivider?: boolean
  /**
   * 히어로 이미지 위 흰 스크림 (기본 true).
   * 사진 자체를 보여주는 것이 목적일 때(사옥 준공 사진 등) 끄면 원본 대비 그대로 나온다.
   */
  showHeroScrim?: boolean
  /** CTA 버튼 우측 아이콘 — 기본 ArrowRight. 문의가 외부 링크면 ExternalLink 등으로 바꾼다 */
  ctaIcon?: ReactNode
}

const DEFAULT_CAPABILITIES_COPY: AboutSectionCopy = {
  title: 'What we do',
  subtitle: '설계부터 튜닝까지, 공간의 소리를 만드는 네 가지 축입니다.',
}

const DEFAULT_STATS_COPY: AboutSectionCopy = {
  title: 'By the numbers',
  subtitle: '숫자로 보는 스튜디오의 기록입니다.',
}

const DEFAULT_CTA: AboutCta = {
  title: "Let's build it together.",
  subtitle: '공간과 예산만 알려주시면 3일 안에 제안서를 보내드립니다.',
  buttonLabel: '프로젝트 문의하기',
}

/** 문구 기본값 — 같은 값을 두 번 적지 않는다(위 상수를 그대로 묶는다) */
export const DEFAULT_ABOUT_PAGE_LABELS: AboutPageLabels = {
  capabilities: DEFAULT_CAPABILITIES_COPY,
  stats: DEFAULT_STATS_COPY,
  cta: DEFAULT_CTA,
}

/** 로딩 중에 그릴 자리표시 개수 — 실제 데이터가 오면 곧바로 교체된다 */
const SKELETON_CAPABILITIES = 4
const SKELETON_STATS = 4

/**
 * 그리드 열 수 → 보조 클래스.
 * 기본 4열은 .capabilityGrid / .statGrid 규칙이 이미 갖고 있으므로 아무 클래스도 덧붙이지 않는다 —
 * 그래야 기본 렌더(레퍼런스 시안)의 DOM이 한 글자도 바뀌지 않는다.
 */
function columnClass(columns: 2 | 3 | 4): string {
  return columns === 4 ? '' : styles[`cols${columns}`]
}

/** 역량 카드 스켈레톤 높이 — 아이콘 + 제목 + 4줄 설명이 들어가는 실측 높이 */
const CAPABILITY_SKELETON_HEIGHT = 200

export function AboutPage({
  hero,
  intro,
  capabilities,
  capabilitiesCopy,
  stats,
  statsCopy,
  cta,
  labels,
  capabilityColumns = 4,
  statColumns = 4,
  ctaAppearance = 'solid',
  onInquiry,
  accent = 'success',
  loading = false,
  showCta = true,
  showDivider = true,
  showHeroScrim = true,
  ctaIcon,
}: AboutPageProps) {
  const L = mergeLabels(DEFAULT_ABOUT_PAGE_LABELS, labels)

  // 개별 prop은 '통째로' 이긴다 — 오늘 `capabilitiesCopy={{ title }}`만 넘기면 서브카피가 없는 화면이
  // 나오므로, 여기서 기본 서브카피를 되살리면 기존 화면이 바뀐다(그래서 group merge가 아니라 resolveLabel이다).
  const capabilitiesText = resolveLabel(capabilitiesCopy, L.capabilities)
  const statsText = resolveLabel(statsCopy, L.stats)
  const ctaText = resolveLabel(cta, L.cta)

  // 데이터가 비면 빈 그리드를 보여주는 대신 섹션 자체를 접는다(회사 소개에서 자연스러운 축약).
  const showCapabilities = loading || capabilities.length > 0
  const showStats = loading || stats.length > 0

  const ctaVariant = accent === 'primary' ? 'primary' : 'success'

  // 히어로 카피 — SiteSection에 eyebrow 슬롯이 없으므로 헤드라인 노드 안에 작은 블록으로 함께 넘긴다.
  // (색·크기는 heroEyebrow가 잡고, 가운데 정렬은 SiteSection의 headerCenter가 상속시킨다)
  const heroTitle = (
    <>
      {hero.eyebrow != null && <span className={styles.heroEyebrow}>{hero.eyebrow}</span>}
      {hero.title}
    </>
  )

  return (
    <div className={styles.root}>
      {/* ── 히어로: 가운데 정렬 카피(SiteSection) + 아래 이미지 밴드 ── */}
      <SiteSection
        accent={accent}
        padding="lg"
        align="center"
        title={heroTitle}
        subtitle={hero.subtitle}
      >
        <div className={styles.hero}>
          {/* 이미지·플레이스홀더 폴백은 Image가 이미 갖고 있다 — 여기서 <img>를 다시 만들지 않는다 */}
          <div className={styles.heroMedia}>
            <Image src={hero.imageSrc} alt={hero.imageAlt ?? ''} />
          </div>

          {/* 스크림도 raw hex 없이 토큰만 — 흰 면(--ds-color-bg)을 투명도만 섞어 사진을 눌러 준다 */}
          {showHeroScrim && <div className={styles.heroScrim} aria-hidden="true" />}
        </div>
      </SiteSection>

      {/* ── 회사 개요: 좌 텍스트(미션/비전) + 우 이미지 ── */}
      <SiteSection
        accent={accent}
        title={intro.title}
        subtitle={intro.subtitle}
        divider={showDivider}
      >
        <div className={styles.introGrid}>
          <div className={styles.introText}>
            {loading ? (
              <Skeleton variant="text" lines={7} />
            ) : (
              intro.paragraphs.map((paragraph) => (
                <p key={paragraph} className={styles.introParagraph}>
                  {paragraph}
                </p>
              ))
            )}
          </div>

          <div className={styles.introMedia}>
            {loading ? (
              <Skeleton variant="block" width="100%" height={320} />
            ) : (
              <Image src={intro.imageSrc} alt={intro.imageAlt ?? ''} ratio="4x3" rounded />
            )}
          </div>
        </div>
      </SiteSection>

      {/* ── 핵심 역량: 옅은 회색 면 위의 흰 카드(Card) ── */}
      {showCapabilities && (
        <SiteSection
          tone="subtle"
          accent={accent}
          title={capabilitiesText.title}
          subtitle={capabilitiesText.subtitle}
          divider={showDivider}
        >
          <div
            className={[styles.capabilityGrid, columnClass(capabilityColumns)]
              .filter(Boolean)
              .join(' ')}
          >
            {loading
              ? Array.from({ length: SKELETON_CAPABILITIES }, (_, i) => (
                  <Skeleton
                    key={i}
                    variant="block"
                    width="100%"
                    height={CAPABILITY_SKELETON_HEIGHT}
                  />
                ))
              : capabilities.map((capability) => (
                  // 카드 크롬(면·보더·radius·호버)은 Card가 단일 출처다 — 본문만 채운다
                  <Card key={capability.id} title={capability.title}>
                    <div className={styles.capabilityBody}>
                      <span className={styles.capabilityIcon} aria-hidden="true">
                        {capability.icon ?? <Placeholder kind="empty" size={24} />}
                      </span>
                      <p className={styles.capabilityDescription}>{capability.description}</p>
                    </div>
                  </Card>
                ))}
          </div>
        </SiteSection>
      )}

      {/* ── 숫자 성과: 큰 숫자(강조색) + 라벨 ── */}
      {showStats && (
        <SiteSection
          accent={accent}
          title={statsText.title}
          subtitle={statsText.subtitle}
          divider={showDivider}
        >
          <div className={[styles.statGrid, columnClass(statColumns)].filter(Boolean).join(' ')}>
            {loading
              ? Array.from({ length: SKELETON_STATS }, (_, i) => (
                  <div key={i} className={styles.statItem}>
                    <Skeleton variant="block" width="60%" height={48} />
                    <Skeleton variant="text" lines={1} />
                  </div>
                ))
              : stats.map((stat) => (
                  <div key={stat.label} className={styles.statItem}>
                    <span className={styles.statValue}>{stat.value}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                ))}
          </div>
        </SiteSection>
      )}

      {/* ── CTA 밴드(옅은 회색 면) ── */}
      {showCta && (
        <SiteSection tone="subtle" accent={accent} padding="lg">
          <div className={styles.ctaBand}>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaTitle}>{ctaText.title}</h2>
              {ctaText.subtitle != null && <p className={styles.ctaSubtitle}>{ctaText.subtitle}</p>}
            </div>

            <div className={styles.ctaAction}>
              <Button
                variant={ctaVariant}
                appearance={ctaAppearance}
                size="lg"
                label={ctaText.buttonLabel}
                showRightIcon
                rightIcon={ctaIcon ?? <ArrowRight size={18} />}
                onClick={onInquiry}
              />
            </div>
          </div>
        </SiteSection>
      )}
    </div>
  )
}
