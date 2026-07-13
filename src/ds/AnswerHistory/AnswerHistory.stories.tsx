import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FIGMA_FILE } from '../../shared/figma'
import { AnswerHistory, type AnswerHistoryProps, type AnswerVersion } from './AnswerHistory'

const versions: AnswerVersion[] = [
  {
    version: 4,
    author: '김상담',
    createdAt: '2026-07-13 09:12',
    updatedAt: '2026-07-13 09:40',
    changeNote: '재발송 일정이 하루 앞당겨져 날짜를 수정했습니다.',
    content:
      '<p>안녕하세요, 고객님.</p><p>교환 접수가 완료되었습니다. 회수 기사님이 <b>7월 15일</b>에 방문 예정이며, 재발송은 <b>7월 17일</b>로 앞당겨졌습니다.</p><p>감사합니다.</p>',
  },
  {
    version: 3,
    author: '김상담',
    createdAt: '2026-07-12 17:05',
    updatedAt: '2026-07-12 17:22',
    changeNote: '오탈자 수정 및 회수 일정 안내 문구 추가.',
    content:
      '<p>안녕하세요, 고객님.</p><p>교환 접수가 완료되었습니다. 회수 기사님이 <b>7월 15일</b>에 방문 예정입니다.</p><ul><li>회수 예정일: 7월 15일</li><li>재발송 예정일: 7월 18일</li></ul>',
  },
  {
    version: 2,
    author: '박운영',
    createdAt: '2026-07-12 11:48',
    changeNote: '배송비 부담 주체(판매자 부담)를 명시했습니다.',
    content:
      '<p>안녕하세요, 고객님.</p><p>상품 하자로 확인되어 교환 배송비는 <b>판매자 부담</b>으로 처리됩니다.</p>',
  },
  {
    version: 1,
    author: '박운영',
    createdAt: '2026-07-11 15:30',
    content: '<p>안녕하세요, 고객님.</p><p>문의하신 내용 확인 중입니다. 잠시만 기다려 주세요.</p>',
  },
]

/** 복원을 눌러 볼 수 있는 로컬 데모 — 복원하면 해당 버전이 최신으로 쌓인다 */
function AnswerHistoryDemo({ versions: initial, ...rest }: AnswerHistoryProps) {
  const [list, setList] = useState(initial)

  return (
    <div style={{ width: 560, maxWidth: '100%' }}>
      <AnswerHistory
        {...rest}
        versions={list}
        onRestore={(v) => {
          setList((prev) => {
            const nextVersion = Math.max(...prev.map((p) => p.version)) + 1
            return [
              ...prev,
              {
                ...v,
                version: nextVersion,
                author: '김상담',
                createdAt: '2026-07-13 10:02',
                updatedAt: undefined,
                changeNote: `v${v.version} 내용으로 복원했습니다.`,
              },
            ]
          })
        }}
      />
    </div>
  )
}

const meta = {
  title: 'Admin/AnswerHistory',
  component: AnswerHistory,
  tags: ['autodocs'],
  args: {
    versions,
    showView: true,
    showLatestBadge: true,
    showMeta: true,
    latestLabel: '현재 버전',
    viewLabel: '이전 버전 보기',
    restoreLabel: '복원',
  },
  argTypes: {
    versions: { control: 'object' },
    // 요소 ON/OFF
    showView: { control: 'boolean' },
    showLatestBadge: { control: 'boolean' },
    showMeta: { control: 'boolean' },
    // 문구
    emptyTitle: { control: 'text' },
    emptyDescription: { control: 'text' },
    latestLabel: { control: 'text' },
    viewLabel: { control: 'text' },
    restoreLabel: { control: 'text' },
    // 노드 슬롯
    viewIcon: { control: false },
    onViewVersion: { control: false },
    onRestore: { control: false },
  },
  parameters: {
    design: { type: 'figma', url: `${FIGMA_FILE}?node-id=0-1` },
  },
} satisfies Meta<typeof AnswerHistory>

export default meta
type Story = StoryObj<typeof meta>

/** 버전 4개 — 최신이 위. '이전 버전 보기'로 내용 모달, '복원'으로 되돌린다 */
export const Default: Story = {
  args: {
    onViewVersion: () => {},
    onRestore: () => {},
  },
  render: (args) => <AnswerHistoryDemo {...args} />,
}

/** 최초 답변 1건 — 수정 이력이 없어 복원 대상도 없다 */
export const Single: Story = {
  args: {
    versions: [versions[3]],
    onViewVersion: () => {},
  },
  render: (args) => (
    <div style={{ width: 560, maxWidth: '100%' }}>
      <AnswerHistory {...args} />
    </div>
  ),
}

/** 이력 0건 — 공용 EmptyState. emptyTitle/emptyDescription으로 문구를 갈아끼운다 */
export const Empty: Story = {
  args: { versions: [] },
  render: (args) => (
    <div style={{ width: 560, maxWidth: '100%' }}>
      <AnswerHistory {...args} />
    </div>
  ),
}

/**
 * 요소 OFF 조합 — showView · showLatestBadge · showMeta를 모두 끈 읽기 전용 요약.
 * 버전과 작성자, 변경 내용만 남는다(복원은 onRestore를 준 행에만).
 */
export const Compact: Story = {
  args: {
    showView: false,
    showLatestBadge: false,
    showMeta: false,
    onRestore: () => {},
  },
  render: (args) => (
    <div style={{ width: 560, maxWidth: '100%' }}>
      <AnswerHistory {...args} />
    </div>
  ),
}

/** 문구 교체 — 도메인 용어에 맞춰 배지·버튼 라벨만 바꾼다 */
export const CustomLabels: Story = {
  args: {
    latestLabel: '최신본',
    viewLabel: '내용 보기',
    restoreLabel: '되돌리기',
    onViewVersion: () => {},
    onRestore: () => {},
  },
  render: (args) => <AnswerHistoryDemo {...args} />,
}

/**
 * Labels: 영문 오버라이드 — 버전 접두·작성/수정 메타·모달 제목까지 labels 통로로 화면까지 닿는다.
 * 기존 개별 prop(latestLabel·viewLabel·restoreLabel)이 labels보다 우선하므로, 여기서는 비워 둔다.
 */
export const Labels: Story = {
  args: {
    latestLabel: undefined,
    viewLabel: undefined,
    restoreLabel: undefined,
    labels: {
      versionPrefix: 'v',
      latest: 'Current',
      actions: { view: 'View version', restore: 'Restore' },
      meta: {
        created: (at) => `Created ${at}`,
        updated: (at) => `Updated ${at}`,
      },
      empty: {
        title: 'No answer history yet.',
        description: 'Versions appear here once an answer is posted.',
      },
      modal: {
        title: (version) => `Version v${version}`,
        close: 'Close',
        restore: (restoreLabel) => `${restoreLabel} this version`,
        meta: (v) => `${v.author} · created ${v.createdAt}`,
        note: (note) => `Change note: ${note}`,
      },
    },
    onViewVersion: () => {},
    onRestore: () => {},
  },
  render: (args) => <AnswerHistoryDemo {...args} />,
}
