/*
 * AdminTable 컬럼 프리셋 — 자주 쓰는 컬럼 조합을 '선언'으로만 남긴다.
 *
 * 왜 여기 있나: 상품 목록은 원래 AdminTable을 한 겹 감싼 별도 컴포넌트(상품 게시판)로 있었다.
 * 표 구현이 둘이 되면 정렬·고정·내보내기 같은 표의 능력이 한쪽에만 생기고 계속 어긋난다.
 * 그래서 그 컴포넌트의 유일한 알맹이였던 '하드코딩된 상품 컬럼'만 이 프리셋으로 옮기고,
 * 표 구현은 AdminTable 하나로 남겼다. 프리셋은 데이터일 뿐이라 AdminTable의 동작을 바꾸지 않는다.
 *
 * 쓰는 법:  <AdminTable columns={PRODUCT_COLUMNS} rows={rows} rowKey={(row) => row.id} />
 * 열을 빼고 싶으면 buildProductColumns({ showThumbnail: false })처럼 조합을 다시 만든다
 * (켠 열만 배열에 들어가므로 빈 열이 남지 않는다). 컬럼 자체가 다르면 AdminTable을 직접 쓰면 된다.
 */
import { createElement } from 'react'
import { Badge } from '../Badge/Badge'
import type { AdminColumn } from './AdminTable'

/** 상품 목록 프리셋이 요구하는 행 — 이보다 많은 필드를 가진 행을 그대로 넘겨도 된다 */
export type ProductBoardRow = {
  id: string
  /** 없으면 rows 배열 순서(1부터)로 자동 부여 */
  index?: number
  thumbnail?: string
  name: string
  category: string
  price: number
  stock: number
  active: boolean
  createdAt: string
}

/**
 * 컬럼 조합 옵션 — 지워진 상품 게시판 컴포넌트의 show* 토글이 그대로 여기로 왔다.
 * 기본값은 전부 켬(= 그 컴포넌트의 기본 컬럼 구성과 동일).
 */
export type ProductColumnOptions = {
  /** 좌측 전체선택 체크박스 열 — 일괄 처리가 없는 읽기 전용 목록에서 끈다 */
  showSelect?: boolean
  /** 순번 열 — 정렬을 자주 바꾸는 목록에서는 번호가 오히려 방해가 된다 */
  showIndex?: boolean
  /** 썸네일 열 — 이미지가 없는 상품군(서비스·티켓 등)에서 끄면 행이 확 가벼워진다 */
  showThumbnail?: boolean
  /** 관리(수정/삭제) 열 — 권한이 없는 사용자에게는 끈다 */
  showActions?: boolean
  /** 재고 0을 '품절' 배지로 강조 — 끄면 숫자 0을 그대로 보여준다 */
  showSoldOutBadge?: boolean
  /** 품절 배지 문구 — 도메인에 따라 '재고없음' 등으로 바꾼다 */
  soldOutLabel?: string
}

/**
 * 상품 목록 컬럼 — 선택 · 순번 · 이미지 · 이름 · 카테고리 · 가격 · 재고 · 상태 · 등록일자 · 관리.
 * 켠 열만 배열에 들어간다.
 */
export function buildProductColumns({
  showSelect = true,
  showIndex = true,
  showThumbnail = true,
  showActions = true,
  showSoldOutBadge = true,
  soldOutLabel = '품절',
}: ProductColumnOptions = {}): AdminColumn<ProductBoardRow>[] {
  const columns: AdminColumn<ProductBoardRow>[] = []

  if (showSelect) columns.push({ kind: 'select', key: 'select' })
  if (showIndex) columns.push({ kind: 'index', key: 'index', value: (row) => row.index })
  if (showThumbnail) {
    columns.push({
      kind: 'thumbnail',
      key: 'thumbnail',
      header: '이미지',
      value: (row) => row.thumbnail,
    })
  }

  columns.push(
    { kind: 'title', key: 'name', header: '이름', sortable: true },
    { kind: 'category', key: 'category', header: '카테고리' },
    { kind: 'price', key: 'price', header: '가격', sortable: true },
    {
      kind: 'number',
      key: 'stock',
      header: '재고',
      sortable: true,
      // 재고 0은 '품절' 배지로 강조 — 배지를 끄면 숫자 그대로(정렬/내보내기 값은 어느 쪽이든 동일).
      // .ts 파일이라 JSX 대신 createElement로 노드를 만든다(프리셋은 데이터라 .tsx로 승격하지 않는다).
      render: (row) =>
        showSoldOutBadge && row.stock === 0
          ? createElement(Badge, {
              variant: 'error',
              appearance: 'soft',
              size: 'sm',
              label: soldOutLabel,
            })
          : createElement('span', null, row.stock.toLocaleString('ko-KR')),
    },
    { kind: 'status', key: 'active', header: '상태' },
    { kind: 'date', key: 'createdAt', header: '등록일자', sortable: true },
  )

  if (showActions) columns.push({ kind: 'actions', key: 'actions', header: '관리' })

  return columns
}

/**
 * 상품 목록 기본 컬럼 — 열을 하나도 끄지 않은 조합.
 * 모듈 최상위에서 한 번만 만든다: 렌더마다 새 배열을 넘기면 표가 통째로 다시 그려진다.
 */
export const PRODUCT_COLUMNS: AdminColumn<ProductBoardRow>[] = buildProductColumns()

/** 상품 목록의 기본 빈 문구 — 표의 기본값('데이터가 없습니다.')보다 도메인 말이 낫다 */
export const PRODUCT_EMPTY_TEXT = '등록된 상품이 없습니다.'
