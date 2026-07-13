import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronRight, Plus } from 'lucide-react'
import { Badge } from '../Badge/Badge'
import { Button } from '../Button/Button'
import styles from './CategoryTree.module.css'

export type CategoryNode = {
  key: string
  label: string
  /** 카테고리 상품 수 — 행 우측 Badge로 찍힌다 */
  count?: number
  children?: CategoryNode[]
}

export type CategoryTreeProps = {
  nodes: CategoryNode[]
  value: string
  onChange: (key: string) => void
  /** 없으면 상단 '추가' 버튼이 렌더되지 않는다 */
  onAdd?: () => void
  addLabel?: string
  /** 상단 탭(카테고리/기획전) 슬롯 */
  tabs?: ReactNode
  /** false면 항상 펼친 상태로 고정되고 chevron이 사라진다 */
  collapsible?: boolean
  /** 넘치면 세로 스크롤 */
  maxHeight?: number

  /**
   * 행 우측 건수 배지. 기본 true.
   * 상품 수를 아직 집계하지 않는 화면(등록 폼의 상위 카테고리 선택 등)에서는
   * 숫자가 오히려 노이즈라 통째로 끈다. 끄면 배지가 DOM에서 사라진다(빈 자리 없음).
   */
  showCount?: boolean

  /* ── 아이콘 슬롯 — 없으면 기존 lucide 기본 아이콘 ── */
  /** 상단 '추가' 버튼 아이콘 */
  addIcon?: ReactNode
  /** 가지 펼침 chevron */
  expandIcon?: ReactNode
}

// 선택된 key까지의 조상 key 목록 — 접힌 가지 안이 선택되면 자동으로 펼치기 위함
function findAncestorKeys(nodes: CategoryNode[], target: string, trail: string[] = []): string[] | null {
  for (const node of nodes) {
    if (node.key === target) return trail
    const found = node.children ? findAncestorKeys(node.children, target, [...trail, node.key]) : null
    if (found) return found
  }
  return null
}

// 초기 펼침 — 최상위 가지 + 선택 항목의 조상
function initialExpanded(nodes: CategoryNode[], value: string): Set<string> {
  const keys = nodes.filter((node) => node.children?.length).map((node) => node.key)
  return new Set([...keys, ...(findAncestorKeys(nodes, value) ?? [])])
}

type CategoryTreeItemProps = {
  node: CategoryNode
  level: number
  expanded: Set<string>
  value: string
  collapsible: boolean
  showCount: boolean
  expandIcon?: ReactNode
  onToggle: (key: string) => void
  onChange: (key: string) => void
}

// 재귀 렌더 — chevron은 펼침 전용, 행 본문 클릭은 선택 전용(서로 섞지 않는다)
function CategoryTreeItem({
  node,
  level,
  expanded,
  value,
  collapsible,
  showCount,
  expandIcon,
  onToggle,
  onChange,
}: CategoryTreeItemProps) {
  const hasChildren = (node.children?.length ?? 0) > 0
  const open = !collapsible || expanded.has(node.key)
  const selected = node.key === value

  return (
    <li role="treeitem" aria-expanded={hasChildren ? open : undefined} aria-selected={selected}>
      <div
        className={[styles.row, selected ? styles.selected : ''].filter(Boolean).join(' ')}
        style={{ paddingLeft: `${level * 16}px` }}
      >
        {hasChildren && collapsible ? (
          <button
            type="button"
            className={[styles.chevron, open ? styles.chevronOpen : ''].filter(Boolean).join(' ')}
            aria-label={`${node.label} ${open ? '접기' : '펼치기'}`}
            onClick={() => onToggle(node.key)}
          >
            {expandIcon ?? <ChevronRight size={14} aria-hidden="true" />}
          </button>
        ) : (
          <span className={styles.chevronSpacer} aria-hidden="true" />
        )}

        <button type="button" className={styles.main} onClick={() => onChange(node.key)}>
          <span className={styles.label}>{node.label}</span>
          {/* 건수는 공용 Badge(secondary soft) — 톤·크기·말줄임 규격을 저장소 전체와 맞춘다 */}
          {showCount && node.count !== undefined && (
            <span className={styles.count}>
              <Badge
                variant="secondary"
                appearance="soft"
                size="sm"
                label={node.count.toLocaleString()}
              />
            </span>
          )}
        </button>
      </div>

      {hasChildren && open && (
        <ul className={styles.group} role="group">
          {node.children?.map((child) => (
            <CategoryTreeItem
              key={child.key}
              node={child}
              level={level + 1}
              expanded={expanded}
              value={value}
              collapsible={collapsible}
              showCount={showCount}
              expandIcon={expandIcon}
              onToggle={onToggle}
              onChange={onChange}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

/**
 * 상품 목록 좌측 카테고리 트리 — 2~3단 계층, 상단 탭/추가 슬롯, maxHeight 넘치면 세로 스크롤.
 *
 * 공용 Tree(src/ds/Tree/Tree.tsx)와 role=tree/treeitem·chevron·펼침 상태가 겹치지만,
 * Tree의 API로는 이 패널을 만들 수 없어 자체 구현을 유지한다. 없는 축은 넷이다.
 *  1) 건수 슬롯: TreeNode는 { id, label, children, disabled }뿐이라 라벨 우측 배지를 붙일 자리가 없다.
 *  2) 헤더 슬롯: 상단 탭(카테고리/기획전) + [추가] 줄을 넣을 자리가 없다.
 *  3) 펼침/선택 분리: Tree의 행은 버튼 하나라 클릭 한 번이 토글과 선택을 동시에 한다.
 *     여기서는 chevron(펼침)과 행 본문(선택)이 서로 다른 버튼이어야 한다.
 *  4) 외부 선택 추종: Tree는 defaultExpandedIds(비제어)뿐이라, 접힌 가지 안의 항목이
 *     밖에서 선택됐을 때 조상을 자동으로 펼칠 수 없다.
 * 대신 겹치는 조각(건수 배지 = Badge, 추가 버튼 = Button)은 공용 컴포넌트를 그대로 쓴다.
 */
export function CategoryTree({
  nodes,
  value,
  onChange,
  onAdd,
  addLabel = '추가',
  tabs,
  collapsible = true,
  maxHeight,
  showCount = true,
  addIcon,
  expandIcon,
}: CategoryTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => initialExpanded(nodes, value))

  // 외부에서 선택이 바뀌어 접힌 가지 안을 가리키면 조상을 펼쳐 보이게 한다
  useEffect(() => {
    const ancestors = findAncestorKeys(nodes, value)
    if (!ancestors?.length) return
    setExpanded((prev) => {
      if (ancestors.every((key) => prev.has(key))) return prev
      const next = new Set(prev)
      for (const key of ancestors) next.add(key)
      return next
    })
  }, [nodes, value])

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <aside className={styles.panel}>
      {(tabs || onAdd) && (
        <div className={styles.header}>
          <div className={styles.tabs}>{tabs}</div>
          {onAdd && (
            // 추가 버튼은 공용 Button(primary ghost) — 톤·포커스 링이 한 곳에서 온다
            <span className={styles.add}>
              <Button
                variant="primary"
                appearance="ghost"
                size="sm"
                label={addLabel}
                showLeftIcon
                leftIcon={addIcon ?? <Plus size={14} aria-hidden="true" />}
                onClick={onAdd}
              />
            </span>
          )}
        </div>
      )}

      <div className={styles.body} style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}>
        <ul className={styles.tree} role="tree">
          {nodes.map((node) => (
            <CategoryTreeItem
              key={node.key}
              node={node}
              level={0}
              expanded={expanded}
              value={value}
              collapsible={collapsible}
              showCount={showCount}
              expandIcon={expandIcon}
              onToggle={toggle}
              onChange={onChange}
            />
          ))}
        </ul>
      </div>
    </aside>
  )
}
