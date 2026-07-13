import { useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { Compass, Globe, Hammer, Leaf, MessageCircle, Ruler, Send } from 'lucide-react'
import { mockImage } from '../../shared/mediaMock'
import { AboutPage, type AboutCapability, type AboutStat } from '../../ds/AboutPage/AboutPage'
import { Button } from '../../ds/Button/Button'
import {
  ContactPage,
  type ContactLocation,
  type InquiryFormValue,
  type InquiryType,
} from '../../ds/ContactPage/ContactPage'
import { HistoryPage, type HistoryGroup } from '../../ds/HistoryPage/HistoryPage'
import {
  PortfolioPage,
  type PortfolioCategory,
  type PortfolioItem,
} from '../../ds/PortfolioPage/PortfolioPage'
import { ShopPage, type ShopCategory, type ShopItem } from '../../ds/ShopPage/ShopPage'
import { SiteFooter } from '../../ds/SiteFooter/SiteFooter'
import { SiteHeader } from '../../ds/SiteHeader/SiteHeader'
import { Toast } from '../../ds/Toast/Toast'

/* ────────────────────────────────────────────────────────────────────────────
 * Templates/SiteSuite — 프론트 5개 페이지를 하나의 사이트로 엮는다.
 *
 *   SiteHeader(GNB) → 본문(선택된 페이지) → SiteFooter
 *
 * 페이지 전환은 useState 하나로 끝낸다(라우터 없음). 각 페이지 컴포넌트는 이미
 * 제어형(props in / callback out)이라, 이 템플릿은 "상태를 쥐고 목데이터를 먹이는" 역할만 한다.
 * 사이트는 라이트(흰색) 단일 테마다 — 면·최대 폭·헤딩 타이포는 전부 SiteSection의 몫이라
 * 여기서 CSS를 새로 짜지 않는다.
 * ──────────────────────────────────────────────────────────────────────────── */

export type SiteSuitePage = 'about' | 'history' | 'portfolio' | 'shop' | 'contact'

/** GNB 메뉴 = 페이지 목록의 단일 출처. value가 곧 SiteSuitePage다. */
const MENU: { label: string; value: SiteSuitePage }[] = [
  { label: '회사 소개', value: 'about' },
  { label: '연혁', value: 'history' },
  { label: '포트폴리오', value: 'portfolio' },
  { label: '상품', value: 'shop' },
  { label: '오시는길', value: 'contact' },
]

/** SiteHeader·SiteFooter는 value/href를 string으로 돌려준다 — 페이지 값인지 여기서 좁힌다. */
function isPage(value: string): value is SiteSuitePage {
  return MENU.some((item) => item.value === value)
}

const BRAND = 'SPACE PLANNING'

/* ── 목데이터: 회사 소개 ──────────────────────────────────────────────────── */

const ABOUT_HERO = {
  eyebrow: 'About us',
  title: 'We plan the space, not the furniture.',
  subtitle:
    '가구를 채우기 전에 머무는 시간을 먼저 설계합니다. 공간의 쓰임에서 출발하는 인테리어 스튜디오입니다.',
  imageSrc: mockImage('SPACE', 'dusk'),
  imageAlt: '스튜디오가 설계한 공간 전경',
}

const ABOUT_INTRO = {
  title: 'Who we are',
  subtitle: '2022년 서울에서 시작한 공간 설계 스튜디오입니다.',
  paragraphs: [
    '스페이스플래닝은 카페와 리테일 매장에서 출발해 사무실, 주거, 상업 공간까지 다뤄왔습니다. 도면을 받는 순간부터 준공 후 하자 보수까지, 한 팀이 처음과 끝을 함께 책임집니다.',
    '좋은 공간은 자재 목록이 아니라 사람의 동선에서 나온다고 믿습니다. 누가 얼마나 오래 머무는지를 먼저 읽고, 그다음에 마감재를 고릅니다.',
    '2026년부터는 공간을 채우는 화분과 식물을 직접 골라 파는 온라인 스토어도 함께 운영합니다.',
  ],
  imageSrc: mockImage('OFFICE', 'sage'),
  imageAlt: '작업 중인 스튜디오 내부',
}

const ABOUT_CAPABILITIES: AboutCapability[] = [
  {
    id: 'planning',
    icon: <Compass size={22} />,
    title: '공간 기획',
    description: '브랜드와 운영 방식을 먼저 듣고, 평면을 그리기 전에 쓰임을 정리합니다.',
  },
  {
    id: 'design',
    icon: <Ruler size={22} />,
    title: '설계·도면',
    description: '평면·입면·전기·조명 도면을 한 벌로 냅니다. 시공사와 같은 도면 위에서 일합니다.',
  },
  {
    id: 'build',
    icon: <Hammer size={22} />,
    title: '시공 관리',
    description: '직영 반장이 현장에 상주해 공정과 품질을 관리하고 주 1회 사진으로 보고합니다.',
  },
  {
    id: 'styling',
    icon: <Leaf size={22} />,
    title: '스타일링·식재',
    description: '준공 후 화분과 식물, 소품까지 배치해 첫 손님을 맞을 수 있는 상태로 넘깁니다.',
  },
]

const ABOUT_STATS: AboutStat[] = [
  { label: '누적 프로젝트', value: '252' },
  { label: '함께한 고객사', value: '104' },
  { label: '업력', value: '5년' },
  { label: '재의뢰율', value: '78%' },
]

const ABOUT_CTA = {
  title: "Let's plan it together.",
  subtitle: '공간과 예산만 알려주시면 3일 안에 제안서를 보내드립니다.',
  buttonLabel: '프로젝트 문의하기',
}

/* ── 목데이터: 연혁 5년치 ─────────────────────────────────────────────────── */

/** 사진은 '연대 칸'의 대표컷이다 — 항목마다가 아니라 그룹에 하나(EraTimeline 규격). */
const HISTORY_GROUPS: HistoryGroup[] = [
  {
    year: '2026',
    image: mockImage('SHOP', 'sage'),
    items: [
      {
        month: '3월',
        title: '온라인 스토어 오픈',
        description: '공간을 채우는 화분·식물·용토를 직접 골라 파는 스토어를 열었습니다.',
      },
      { month: '6월', title: '누적 프로젝트 250건 돌파', description: '상업공간 비중이 절반을 넘었습니다.' },
    ],
  },
  {
    year: '2025',
    image: mockImage('SHOWROOM', 'dusk'),
    items: [
      {
        month: '2월',
        title: '성수 쇼룸 오픈',
        description: '설계 사무실과 쇼룸을 합쳐 실제 마감재를 만져보고 고를 수 있게 했습니다.',
      },
      { month: '7월', title: '굿디자인 어워드 공간부문 수상', description: '연남동 로스터리 카페 프로젝트' },
      { month: '11월', title: '팀 30명 규모로 확대', description: '설계·시공·스타일링 3개 팀 체제로 전환' },
    ],
  },
  {
    year: '2024',
    image: mockImage('PANGYO', 'slate'),
    items: [
      { month: '4월', title: '법인 전환 및 사명 변경', description: '스페이스플래닝 주식회사로 새로 출발했습니다.' },
      {
        month: '9월',
        title: '판교 IT기업 사옥 라운지 수주',
        description: '단일 프로젝트로는 첫 1,000㎡ 규모.',
      },
    ],
  },
  {
    year: '2023',
    items: [
      { month: '5월', title: '제주 세컨하우스 프로젝트 착수', description: '주거 공간으로 영역을 넓혔습니다.' },
      { month: '10월', title: '시공 파트너십 체결', description: '직영 시공팀을 두고 공정 관리를 내재화했습니다.' },
    ],
  },
  {
    year: '2022',
    image: mockImage('START', 'sand'),
    items: [
      {
        month: '1월',
        title: '스페이스플래닝 설립',
        description: '망원동 6평 사무실에서 두 명으로 시작했습니다.',
      },
      { month: '8월', title: '첫 상업공간 프로젝트 완료', description: '연희동 15평 베이커리' },
    ],
  },
]

/* ── 목데이터: 포트폴리오 9건 ────────────────────────────────────────────── */

/** '전체' 탭 — 필터를 걸지 않는 값 */
const ALL = 'all'

const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  { label: '전체', value: ALL },
  { label: '카페', value: 'cafe' },
  { label: '사무실', value: 'office' },
  { label: '주거', value: 'house' },
  { label: '상업', value: 'retail' },
]

/** 상세 본문 목 — 에디터가 저장하는 HTML 형태 그대로 */
const PORTFOLIO_BODY = `
<p>오래된 인쇄소 건물의 층고와 목재 트러스를 그대로 살리고, 그 아래에 가벼운 가구만 얹었습니다.
낮에는 창으로 들어온 빛이 바(bar)를 지나 안쪽 좌석까지 닿도록 동선을 한 줄로 정리했습니다.</p>
<h3>설계 의도</h3>
<ul>
  <li>기존 구조체는 <strong>철거 대신 노출</strong> — 마감재를 걷어내고 도장만 새로 했습니다.</li>
  <li>좌석은 2인 8석 · 4인 5석 · 바 6석으로 나눠 체류 시간이 다른 손님을 섞었습니다.</li>
  <li>주방과 홀의 소음을 끊기 위해 픽업대를 벽에서 900mm 띄웠습니다.</li>
</ul>
<p>운영 6개월 차 기준 평일 회전율이 기존 대비 1.4배로 올랐습니다.</p>
`.trim()

const PORTFOLIO_GALLERY = [
  { url: mockImage('01', 'sage'), name: '홀 전경' },
  { url: mockImage('02', 'sand'), name: '바 카운터' },
  { url: mockImage('03', 'slate'), name: '창가 좌석' },
  { url: mockImage('04', 'dusk'), name: '외부 파사드' },
]

/** 목데이터 — 레이아웃 검증용이며 실제 프로젝트가 아니다. */
const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'pf-01',
    title: '연남동 로스터리 카페',
    category: 'cafe',
    year: '2025',
    place: '서울 마포구 연남동',
    summary: '인쇄소를 개조한 60평 로스터리 — 층고와 목재 트러스를 그대로 살렸습니다.',
    thumbnail: mockImage('카페', 'sage'),
    cover: mockImage('연남동', 'sage'),
    bodyHtml: PORTFOLIO_BODY,
    gallery: PORTFOLIO_GALLERY,
  },
  {
    id: 'pf-02',
    title: '반포 아파트 34평 리모델링',
    category: 'house',
    year: '2026',
    place: '서울 서초구 반포동',
    summary: '벽을 하나 걷어내 주방과 거실을 잇고, 창가를 온전히 비웠습니다.',
    thumbnail: mockImage('주거', 'sand'),
    cover: mockImage('반포', 'sand'),
    bodyHtml: PORTFOLIO_BODY,
    gallery: PORTFOLIO_GALLERY.slice(0, 3),
  },
  {
    id: 'pf-03',
    title: '가로수길 플래그십 스토어',
    category: 'retail',
    year: '2026',
    place: '서울 강남구 신사동',
    summary: '3개 층을 하나의 동선으로 잇고, 계단참마다 머무는 자리를 뒀습니다.',
    thumbnail: mockImage('상업', 'dusk'),
    cover: mockImage('가로수길', 'dusk'),
    bodyHtml: PORTFOLIO_BODY,
    gallery: PORTFOLIO_GALLERY,
  },
  {
    id: 'pf-04',
    title: '성수 공유오피스 리뉴얼',
    category: 'office',
    year: '2025',
    place: '서울 성동구 성수동',
    summary: '고정석을 줄이고 라운지를 넓혀 체류 시간을 늘렸습니다.',
    thumbnail: mockImage('사무실', 'slate'),
    cover: mockImage('성수', 'slate'),
    bodyHtml: PORTFOLIO_BODY,
  },
  {
    id: 'pf-05',
    title: '판교 IT기업 사옥 라운지',
    category: 'office',
    year: '2024',
    place: '경기 성남시 판교',
    summary: '1,000㎡ 라운지 — 회의·식사·휴식이 한 층에서 겹치지 않게 나눴습니다.',
    thumbnail: mockImage('라운지', 'slate'),
    gallery: PORTFOLIO_GALLERY.slice(0, 2),
  },
  {
    id: 'pf-06',
    title: '한남동 디저트 바',
    category: 'cafe',
    year: '2024',
    place: '서울 용산구 한남동',
    summary: '12평 — 바 하나로 주방과 객석을 붙였습니다.',
    thumbnail: mockImage('디저트', 'sand'),
    bodyHtml: PORTFOLIO_BODY,
  },
  {
    id: 'pf-07',
    title: '잠실 팝업 스토어',
    category: 'retail',
    year: '2024',
    place: '서울 송파구 잠실동',
    summary: '2주 운영 후 철거를 전제로, 조립·해체가 가능한 모듈 구조로 짰습니다.',
    thumbnail: mockImage('팝업', 'dusk'),
  },
  {
    // 썸네일 미등록 — 카드가 공용 대체 그림(Placeholder)을 그린다
    id: 'pf-08',
    title: '여의도 금융사 회의동',
    category: 'office',
    year: '2023',
    place: '서울 영등포구 여의도동',
    summary: '회의실 12개 — 흡음과 프라이버시를 기준으로 유리와 벽의 비율을 정했습니다.',
  },
  {
    id: 'pf-09',
    title: '제주 세컨하우스',
    category: 'house',
    year: '2023',
    place: '제주 서귀포시',
    summary: '바람과 빛의 방향에 맞춰 창을 다시 뚫었습니다.',
    thumbnail: mockImage('제주', 'sage'),
    cover: mockImage('제주', 'sage'),
    gallery: PORTFOLIO_GALLERY.slice(0, 3),
  },
]

/** 목록 한 페이지에 6칸(3열 × 2줄) → 전체 9건이면 2페이지 */
const PORTFOLIO_PAGE_SIZE = 6

/* ── 목데이터: 상품 10건 ─────────────────────────────────────────────────── */

const SHOP_CATEGORIES: ShopCategory[] = [
  { label: '전체', value: ALL },
  { label: '화분', value: 'pot' },
  { label: '식물', value: 'plant' },
  { label: '흙·용토', value: 'soil' },
]

const SHOP_SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'priceAsc', label: '낮은 가격순' },
  { value: 'priceDesc', label: '높은 가격순' },
]

const SHOP_SERVICE_OPTIONS = [
  { value: ALL, label: '서비스별' },
  { value: 'delivery', label: '배송 설치' },
  { value: 'care', label: '정기 관리' },
  { value: 'rental', label: '렌탈' },
]

/**
 * ShopItem에 목록 조작용 필드를 얹은 목 타입.
 * 카테고리·서비스는 필터의 키, createdAt·popularity는 정렬의 키다
 * (ShopPage는 이 필드들을 읽지 않는다 — 필터/정렬은 이 템플릿의 몫).
 */
type ShopMockItem = ShopItem & {
  category: string
  service: string
  createdAt: string
  popularity: number
}

const SHOP_ITEMS: ShopMockItem[] = [
  {
    id: 'sh-01',
    image: mockImage('토분', 'sand'),
    brand: 'Space Planning',
    name: '이탈리아 토분 3종 세트',
    description: '통기성이 좋은 테라코타 토분 — 소·중·대 한 세트',
    price: 58_000,
    salePrice: 43_500,
    category: 'pot',
    service: 'delivery',
    createdAt: '2026-07-10',
    popularity: 92,
  },
  {
    id: 'sh-02',
    image: mockImage('세라믹', 'slate'),
    brand: '클레이랩',
    name: '무광 세라믹 화분 (중형)',
    description: '어떤 식물에도 무난하게 어울리는 무광 마감',
    price: 34_000,
    category: 'pot',
    service: 'delivery',
    createdAt: '2026-07-08',
    popularity: 74,
  },
  {
    id: 'sh-03',
    image: mockImage('스톤웨어', 'dusk'),
    brand: '클레이랩',
    name: '스톤웨어 원형 화분',
    // 긴 설명이 카드 폭을 밀지 않고 말줄임되는지 확인하는 케이스
    description: '손으로 성형한 스톤웨어 화분입니다. 같은 모양이 하나도 없어 개체마다 표면 질감이 조금씩 다릅니다',
    price: 46_000,
    soldOut: true,
    category: 'pot',
    service: 'delivery',
    createdAt: '2026-07-05',
    popularity: 61,
  },
  {
    // 이미지가 없으면 ProductCard가 공용 Placeholder로 흰 판을 채운다
    id: 'sh-04',
    brand: 'Space Planning',
    name: '자기 화분 받침 4P',
    description: '물받이 겸용 — 바닥 긁힘을 막는 실리콘 패드 포함',
    price: 18_000,
    category: 'pot',
    service: 'delivery',
    createdAt: '2026-06-28',
    popularity: 38,
  },
  {
    id: 'sh-05',
    image: mockImage('몬스테라', 'sage'),
    brand: '그린하우스',
    name: '몬스테라 델리시오사',
    description: '초보자도 키우기 쉬운 대형 관엽식물',
    price: 42_000,
    category: 'plant',
    service: 'care',
    createdAt: '2026-07-12',
    popularity: 98,
  },
  {
    id: 'sh-06',
    image: mockImage('홍콩야자', 'sage'),
    brand: '그린하우스',
    name: '홍콩야자 대형 화분',
    description: '빛이 적은 실내에서도 잘 버티는 공기정화 식물',
    price: 68_000,
    salePrice: 54_400,
    category: 'plant',
    service: 'care',
    createdAt: '2026-07-02',
    popularity: 83,
  },
  {
    id: 'sh-07',
    image: mockImage('스투키', 'dusk'),
    brand: '그린하우스',
    name: '스투키 중형 화분',
    description: '물을 자주 주지 않아도 되는 다육 식물',
    price: 29_000,
    category: 'plant',
    service: 'care',
    createdAt: '2026-06-24',
    popularity: 55,
  },
  {
    id: 'sh-08',
    image: mockImage('아레카', 'sage'),
    brand: '플랜트키트',
    name: '아레카야자 150cm',
    description: '사무실 로비용 대형 식물 — 월 단위 렌탈 가능',
    price: 89_000,
    category: 'plant',
    service: 'rental',
    createdAt: '2026-06-18',
    popularity: 47,
  },
  {
    id: 'sh-09',
    image: mockImage('배양토', 'slate'),
    brand: '소일랩',
    name: '실내식물 전용 배양토 5L',
    description: '펄라이트와 코코피트를 배합해 배수와 보습을 함께 잡았습니다',
    price: 12_000,
    category: 'soil',
    service: 'delivery',
    createdAt: '2026-06-30',
    popularity: 66,
  },
  {
    id: 'sh-10',
    image: mockImage('자갈', 'slate'),
    brand: '소일랩',
    name: '자연석 조경 자갈 5kg',
    description: '화분 마감재 · 테라리움용 천연 자연석',
    price: 24_000,
    category: 'soil',
    service: 'delivery',
    createdAt: '2026-06-12',
    popularity: 29,
  },
]

/** 5열 그리드(1920 기준) 한 줄 = 한 페이지 → 전체 10건이면 2페이지 */
const SHOP_PAGE_SIZE = 5

/** 할인가가 있으면 그 값이 실제 지불가다 — 가격 정렬의 기준 */
function paidPrice(item: ShopMockItem): number {
  return item.salePrice ?? item.price
}

/** 정렬 규칙의 단일 출처 — Select 옵션 value가 곧 키다 */
const SHOP_SORTERS: Record<string, (a: ShopMockItem, b: ShopMockItem) => number> = {
  latest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  popular: (a, b) => b.popularity - a.popularity,
  priceAsc: (a, b) => paidPrice(a) - paidPrice(b),
  priceDesc: (a, b) => paidPrice(b) - paidPrice(a),
}

/* ── 목데이터: 오시는 길 · 문의 ──────────────────────────────────────────── */

const CONTACT_LOCATION: ContactLocation = {
  address: ['서울특별시 성동구 아차산로 111', '성수 쇼룸 2층 (성수동2가)'],
  phone: ['02-1234-5678', '평일 상담 · 부재 시 콜백'],
  email: ['hello@spaceplanning.ai', '견적 문의는 24시간 접수'],
  hours: ['평일 09:00 - 18:00', '점심 12:30 - 13:30 · 주말·공휴일 휴무'],
}

const INQUIRY_TYPES: InquiryType[] = [
  { value: 'interior', label: '인테리어 시공 문의' },
  { value: 'consulting', label: '공간 컨설팅' },
  { value: 'estimate', label: '견적 요청' },
  { value: 'product', label: '상품 구매 문의' },
  { value: 'partnership', label: '제휴·협업 제안' },
  { value: 'etc', label: '기타 문의' },
]

const EMPTY_INQUIRY: InquiryFormValue = {
  name: '',
  email: '',
  phone: '',
  type: null,
  title: '',
  content: '',
  files: [],
  agreed: false,
}

/* ── 목데이터: 푸터 ──────────────────────────────────────────────────────── */

const FOOTER_COMPANY = [
  { label: '상호', value: '스페이스플래닝 주식회사' },
  { label: '대표', value: '홍성보' },
  { label: '사업자번호', value: '123-45-67890' },
  { label: '주소', value: '서울특별시 성동구 아차산로 111, 2층' },
  { label: '전화', value: '02-1234-5678' },
  { label: '이메일', value: 'hello@spaceplanning.ai' },
]

/** 푸터 링크 = GNB와 같은 메뉴. href의 해시가 곧 페이지 값이다(아래 위임 핸들러 참고). */
const FOOTER_LINKS = MENU.map((item) => ({ label: item.label, href: `#${item.value}` }))

// SNS 아이콘 슬롯 — lucide에는 브랜드 아이콘이 없어 일반 아이콘으로 대체한다
function FooterSocial() {
  return (
    <>
      <a href="#blog" aria-label="블로그" style={{ color: 'inherit' }}>
        <Globe size={18} aria-hidden="true" />
      </a>
      <a href="#channel" aria-label="채널톡" style={{ color: 'inherit' }}>
        <MessageCircle size={18} aria-hidden="true" />
      </a>
      <a href="#newsletter" aria-label="뉴스레터" style={{ color: 'inherit' }}>
        <Send size={18} aria-hidden="true" />
      </a>
    </>
  )
}

/* ── 템플릿 ─────────────────────────────────────────────────────────────── */

/** 페이지·상세를 오갈 때 맨 위로. 스토리북 문서 모드에서 마운트만으로 튀지 않도록 클릭 시에만 부른다. */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export type SiteSuiteProps = {
  /** 처음 열릴 페이지 — GNB 메뉴 값(about · history · portfolio · shop · contact) */
  initialPage?: SiteSuitePage
}

/**
 * Templates/SiteSuite — 헤더 하나로 프론트 5개 페이지를 오간다. 전부 라이트(흰색)다.
 *
 *   회사 소개   AboutPage      (히어로·개요·역량·숫자·CTA — 흰 면 ↔ 옅은 회색 면 교차)
 *   연혁       HistoryPage    (연도 그룹 5년치)
 *   포트폴리오  PortfolioPage  (목록 ⇄ 상세, 카테고리·페이지네이션)
 *   상품       ShopPage       (흰 배경 + 흰 상품 카드 + 그린 가격)
 *   오시는길    ContactPage    (지도 + 1:1 문의 폼)
 *
 * 상단 '1:1 문의' 버튼과 회사 소개의 CTA, 상품 카드 클릭이 모두 문의 페이지로 모인다.
 * 헤더는 흰 면 + 하단 보더, 푸터는 옅은 회색 면 — 사이트 크롬도 다크는 없다.
 */
export function SiteSuite({ initialPage = 'about' }: SiteSuiteProps = {}) {
  const [page, setPage] = useState<SiteSuitePage>(initialPage)

  // ── 포트폴리오: 카테고리 · 페이지 · 열린 상세 ──
  const [portfolioCategory, setPortfolioCategory] = useState(ALL)
  const [portfolioPage, setPortfolioPage] = useState(1)
  const [portfolioId, setPortfolioId] = useState<string | null>(null)

  // ── 상품: 카테고리 · 정렬 · 서비스 · 페이지 ──
  const [shopCategory, setShopCategory] = useState(ALL)
  const [shopSort, setShopSort] = useState('latest')
  const [shopService, setShopService] = useState(ALL)
  const [shopPage, setShopPage] = useState(1)

  // ── 문의: 폼 값 · 접수 완료 토스트 ──
  const [inquiry, setInquiry] = useState<InquiryFormValue>(EMPTY_INQUIRY)
  const [submitted, setSubmitted] = useState(false)
  // 접수 후 폼을 새로 세우기 위한 키. ContactPage는 touched/submitted를 내부에 쥐고 있어
  // value만 비우면 "빈 폼이 빨갛게 남는다" — 키를 바꿔 다시 마운트하는 것이 유일한 초기화다.
  const [formKey, setFormKey] = useState(0)

  /** 페이지 전환 — 사용자가 누른 순간에만 맨 위로 올린다(마운트 시에는 건드리지 않는다) */
  const go = (next: SiteSuitePage) => {
    setPage(next)
    scrollToTop()
  }

  /** 푸터 링크는 href만 받고 콜백 슬롯이 없다 — 앵커 클릭을 위임으로 받아 페이지 전환에 잇는다. */
  const handleFooterNav = (event: MouseEvent<HTMLDivElement>) => {
    // 아이콘(svg) 안쪽이 눌릴 수 있어 Element로 받아 가장 가까운 앵커를 찾는다
    const href = (event.target as Element).closest('a')?.getAttribute('href')
    const value = href != null && href.startsWith('#') ? href.slice(1) : null
    if (value == null || !isPage(value)) return
    event.preventDefault()
    go(value)
  }

  // ── 포트폴리오 파생값 ──
  const portfolioFiltered = useMemo(
    () =>
      portfolioCategory === ALL
        ? PORTFOLIO_ITEMS
        : PORTFOLIO_ITEMS.filter((item) => item.category === portfolioCategory),
    [portfolioCategory],
  )

  const portfolioTotalPages = Math.max(1, Math.ceil(portfolioFiltered.length / PORTFOLIO_PAGE_SIZE))
  const portfolioSelected = portfolioFiltered.find((item) => item.id === portfolioId) ?? null

  // 상세에서는 페이지 슬라이스가 아니라 카테고리 전체를 넘긴다 —
  // PortfolioPage가 이 배열에서 이전/다음을 계산하므로, 페이지 경계에서 끊기지 않게 한다.
  const portfolioVisible =
    portfolioSelected != null
      ? portfolioFiltered
      : portfolioFiltered.slice(
          (portfolioPage - 1) * PORTFOLIO_PAGE_SIZE,
          portfolioPage * PORTFOLIO_PAGE_SIZE,
        )

  /** 상세 열기 — 목록으로 돌아왔을 때 그 항목이 있는 페이지가 보이도록 페이지도 맞춰 둔다 */
  const openPortfolio = (item: PortfolioItem) => {
    const index = portfolioFiltered.findIndex((row) => row.id === item.id)
    if (index >= 0) setPortfolioPage(Math.floor(index / PORTFOLIO_PAGE_SIZE) + 1)
    setPortfolioId(item.id)
    scrollToTop()
  }

  const closePortfolio = () => {
    setPortfolioId(null)
    scrollToTop()
  }

  const changePortfolioCategory = (value: string) => {
    setPortfolioCategory(value)
    setPortfolioPage(1)
    setPortfolioId(null)
  }

  // ── 상품 파생값 ──
  const shopFiltered = useMemo(() => {
    const filtered = SHOP_ITEMS.filter(
      (item) =>
        (shopCategory === ALL || item.category === shopCategory) &&
        (shopService === ALL || item.service === shopService),
    )
    // 원본 상수를 뒤집지 않도록 복사본을 정렬한다
    return [...filtered].sort(SHOP_SORTERS[shopSort] ?? SHOP_SORTERS.latest)
  }, [shopCategory, shopService, shopSort])

  const shopTotalPages = Math.max(1, Math.ceil(shopFiltered.length / SHOP_PAGE_SIZE))
  const shopVisible = shopFiltered.slice((shopPage - 1) * SHOP_PAGE_SIZE, shopPage * SHOP_PAGE_SIZE)

  // 필터·정렬이 바뀌면 1페이지로 — 사라진 페이지에 남아 빈 화면을 보는 일을 막는다
  const changeShopCategory = (value: string) => {
    setShopCategory(value)
    setShopPage(1)
  }

  const changeShopSort = (value: string) => {
    setShopSort(value)
    setShopPage(1)
  }

  const changeShopService = (value: string) => {
    setShopService(value)
    setShopPage(1)
  }

  /**
   * 상품 카드 클릭 → 상품 상세 대신 1:1 문의로. 유형·제목만 채우고 나머지는 쓰던 값을 남긴다.
   * (문의 페이지는 조건부 렌더라 떠날 때 언마운트된다 → ContactPage의 touched/submitted는 저절로 초기화된다.)
   */
  const askAboutProduct = (item: ShopItem) => {
    setInquiry((prev) => ({ ...prev, type: 'product', title: `상품 문의: ${item.name}` }))
    setSubmitted(false)
    go('contact')
  }

  /** 접수 — 서버가 없으므로 폼을 비우고(재마운트) 토스트만 띄운다 */
  const submitInquiry = () => {
    setInquiry(EMPTY_INQUIRY)
    setFormKey((key) => key + 1)
    setSubmitted(true)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader
        brand={
          <button
            type="button"
            onClick={() => go('about')}
            style={{
              background: 'none',
              border: 0,
              padding: 0,
              font: 'inherit',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            {BRAND}
          </button>
        }
        items={MENU}
        value={page}
        onChange={(value) => {
          if (isPage(value)) go(value)
        }}
        actions={
          <Button variant="success" size="sm" label="1:1 문의" onClick={() => go('contact')} />
        }
        sticky
      />

      <main style={{ flex: 1 }}>
        {page === 'about' && (
          <AboutPage
            hero={ABOUT_HERO}
            intro={ABOUT_INTRO}
            capabilities={ABOUT_CAPABILITIES}
            stats={ABOUT_STATS}
            cta={ABOUT_CTA}
            onInquiry={() => go('contact')}
          />
        )}

        {page === 'history' && (
          <HistoryPage
            groups={HISTORY_GROUPS}
            title="History"
            subtitle="망원동 6평 사무실에서 시작해 지금까지 걸어온 길입니다."
          />
        )}

        {page === 'portfolio' && (
          <PortfolioPage
            items={portfolioVisible}
            categories={PORTFOLIO_CATEGORIES}
            category={portfolioCategory}
            onCategoryChange={changePortfolioCategory}
            page={portfolioPage}
            totalPages={portfolioTotalPages}
            onPageChange={setPortfolioPage}
            onOpen={openPortfolio}
            selected={portfolioSelected}
            onClose={closePortfolio}
          />
        )}

        {page === 'shop' && (
          <ShopPage
            items={shopVisible}
            categories={SHOP_CATEGORIES}
            category={shopCategory}
            onCategoryChange={changeShopCategory}
            sort={shopSort}
            onSortChange={changeShopSort}
            sortOptions={SHOP_SORT_OPTIONS}
            service={shopService}
            onServiceChange={changeShopService}
            serviceOptions={SHOP_SERVICE_OPTIONS}
            total={shopFiltered.length}
            page={shopPage}
            totalPages={shopTotalPages}
            onPageChange={setShopPage}
            onOpen={askAboutProduct}
          />
        )}

        {page === 'contact' && (
          <ContactPage
            key={formKey}
            location={CONTACT_LOCATION}
            map={<img src={mockImage('MAP', 'sage')} alt="성수 쇼룸 위치 약도" />}
            value={inquiry}
            onChange={(value) => {
              setInquiry(value)
              setSubmitted(false)
            }}
            onSubmit={submitInquiry}
            types={INQUIRY_TYPES}
          />
        )}
      </main>

      {/* 푸터 링크는 앵커라 클릭을 위임으로 가로채 페이지 전환에 잇는다 */}
      <div onClick={handleFooterNav}>
        <SiteFooter
          brand={BRAND}
          company={FOOTER_COMPANY}
          links={FOOTER_LINKS}
          social={<FooterSocial />}
          copyright="© 2026 SPACE PLANNING Inc. All rights reserved."
        />
      </div>

      {/* 접수 완료 — 서버가 없으므로 토스트로만 알린다 */}
      {submitted && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 'var(--ds-spacing-6)',
            transform: 'translateX(-50%)',
            zIndex: 200,
          }}
        >
          <Toast
            tone="success"
            message="문의가 접수되었습니다. 영업일 기준 1~2일 안에 회신드립니다."
            onClose={() => setSubmitted(false)}
          />
        </div>
      )}
    </div>
  )
}
