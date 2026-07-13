// 어드민 좌측 내비게이션(메뉴)의 단일 소스.
//
// 왜 별도 파일인가: 메뉴를 봐야 하는 곳이 둘이다 —
//   1) admin.ts renderAdminSidebar  : DS/AdminSidebar 컴포넌트 세트(메뉴를 '그리는' 쪽)
//   2) screens.ts                   : 화면 셸이 어떤 항목을 '현재 메뉴'로 세울지(active 베리언트) +
//                                     세트가 없을 때의 직접 그리기 폴백
// 두 파일이 각자 라벨 배열을 들고 있으면 메뉴를 고칠 때 반드시 한쪽이 어긋난다
// (실제로 site.ts:518 ↔ site-screens.ts:142의 GNB MENU가 그렇게 이중 선언돼 있다 — 같은 실수를 반복하지 않는다).

/**
 * 사이드바 'active' 베리언트 축의 값 = 선택 가능한 메뉴 항목의 id.
 * 그룹(회원관리·상품관리·회사관리)은 그 자체로는 선택되지 않는다 — 항상 자식 중 하나가 선택된다.
 * 'none' = 메뉴에 없는 화면(예: 공지사항) — 사이드바를 그리되 아무 항목도 강조하지 않는다.
 */
export type AdminActive =
  | 'dashboard'
  | 'users'
  | 'staff'
  | 'categories'
  | 'products'
  | 'orders'
  | 'inquiries'
  | 'about'
  | 'history'
  | 'portfolio'
  | 'mainvisual'
  | 'none'

/** 서브메뉴 항목 — id가 곧 active 값이다. */
export type AdminSubItem = { id: AdminActive; label: string }

export type AdminMenuItem = {
  /** 자식이 없으면 이 id가 곧 active 값. 자식이 있으면 그룹 키(active로는 쓰이지 않는다). */
  id: AdminActive | 'members' | 'productsGroup' | 'company'
  label: string
  /** icons-data.ts의 _Icon/* 키. */
  iconKey: string
  /**
   * 세트 안 아이콘 레이어 이름. INSTANCE_SWAP 속성('Item Icon')이 이 이름에 붙으므로
   * 상품관리 행의 레이어명은 반드시 'Item Icon'을 유지한다(기존 세트 속성을 깨지 않는다).
   */
  iconLayer: string
  /** 우측 카운트 배지 — TEXT 속성 'Badge'가 이 레이어에 붙는다(문의관리 미답변 건수). */
  badge?: string
  children?: AdminSubItem[]
}

/**
 * 메뉴 구조(오너 확정 2026-07).
 *   1 대시보드
 *   2 회원관리 — 사용자 / 운영자
 *   3 상품관리 — 카테고리 / 상품 / 주문
 *   4 문의관리
 *   5 회사관리 — 회사소개 / 연혁 / 포트폴리오
 *   6 메인비주얼 관리
 * 개발용 중복 항목(대시보드 v2 · ~(프리셋) · 고객 목록(그룹) 등)은 메뉴에 넣지 않는다
 * — 화면 빌더는 남지만 메뉴에는 노출되지 않는다(그런 화면은 active='none').
 */
export const ADMIN_MENU: AdminMenuItem[] = [
  { id: 'dashboard', label: '대시보드', iconKey: '_Icon/Grid', iconLayer: 'Nav Icon 1' },
  {
    id: 'members',
    label: '회원관리',
    iconKey: '_Icon/Users',
    iconLayer: 'Nav Icon 2',
    children: [
      { id: 'users', label: '사용자' },
      { id: 'staff', label: '운영자' },
    ],
  },
  {
    id: 'productsGroup',
    label: '상품관리',
    iconKey: '_Icon/Package',
    iconLayer: 'Item Icon', // 기존 INSTANCE_SWAP 속성('Item Icon')이 붙는 레이어 — 이름 유지
    children: [
      { id: 'categories', label: '카테고리' },
      { id: 'products', label: '상품' },
      { id: 'orders', label: '주문' },
    ],
  },
  // 배지는 '미답변 문의 건수'로 옮겼다(예전엔 상품 관리에 달려 있었다) — TEXT 속성 'Badge'는 그대로 산다.
  { id: 'inquiries', label: '문의관리', iconKey: '_Icon/Chat', iconLayer: 'Nav Icon 4', badge: '12' },
  {
    id: 'company',
    label: '회사관리',
    iconKey: '_Icon/Building',
    iconLayer: 'Nav Icon 5',
    children: [
      { id: 'about', label: '회사소개' },
      { id: 'history', label: '연혁' },
      { id: 'portfolio', label: '포트폴리오' },
    ],
  },
  { id: 'mainvisual', label: '메인비주얼 관리', iconKey: '_Icon/Image', iconLayer: 'Nav Icon 6' },
]

/**
 * DS/AdminSidebar의 'active' 축 값 목록 — 선택 가능한 항목(리프) 순서대로 + 'none'.
 * 첫 값(dashboard)이 defaultVariant가 된다(Figma: 기본 변형 = 각 축 values[0] 조합).
 */
export const ADMIN_ACTIVE_VALUES: string[] = (() => {
  const out: string[] = []
  for (const item of ADMIN_MENU) {
    if (item.children && item.children.length) for (const kid of item.children) out.push(kid.id)
    else out.push(item.id as AdminActive)
  }
  out.push('none')
  return out
})()

/**
 * active 항목이 속한 그룹 = 서브메뉴를 펼칠 그룹.
 * 스토리북 AdminShell과 같은 규칙 — 선택된 항목의 부모만 펼쳐진다(나머지는 접힌다).
 */
export function groupOfActive(active: string): AdminMenuItem | null {
  for (const item of ADMIN_MENU) {
    if (!item.children) continue
    for (const kid of item.children) if (kid.id === active) return item
  }
  return null
}
