import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Bold,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignStart,
  Underline,
} from 'lucide-react'
import { Button } from '../Button/Button'
import { Divider } from '../Divider/Divider'
import styles from './RichTextEditor.module.css'

export type RichTextEditorProps = {
  /** 에디터 본문 HTML */
  value: string
  onChange?: (html: string) => void
  placeholder?: string
  /** 본문 영역 최소 높이(px) */
  minHeight?: number
  disabled?: boolean
  /** 이미지 삽입 훅 — 업로드 후 이미지 URL을 반환한다. 없으면 URL prompt 폴백 */
  onInsertImage?: () => Promise<string> | string

  /*
   * ── 요소 ON/OFF (기본 전부 true) ──
   * 같은 에디터가 '상세 본문'(전체 서식)과 '간단 메모'(서식 없이 본문만)에 함께 쓰인다.
   * false면 그 영역이 DOM에서 완전히 사라진다(빈 툴바 줄이 남지 않는다).
   */
  /** 툴바 줄 전체 — 끄면 본문만 남는 순수 contentEditable이 된다 */
  showToolbar?: boolean
  /** 툴바의 링크 삽입 버튼 — 외부 링크를 막는 화면에서 끈다 */
  showLinkButton?: boolean
  /** 툴바의 이미지 삽입 버튼 — 이미지가 별도 업로드 필드로 빠진 화면에서 끈다 */
  showImageButton?: boolean
}

// ⚠️ document.execCommand는 deprecated API다(표준에서 제거 예정, 브라우저별 출력 HTML 차이 있음).
// 의존성을 늘리지 않기 위한 경량 구현이며, 프로덕션에서는 TipTap/Lexical 등 에디터 라이브러리로
// 교체할 수 있다. 그때도 value/onChange(html) 인터페이스는 그대로 유지되므로 호출부는 바뀌지 않는다.
const QUERY_COMMANDS = [
  'bold',
  'italic',
  'underline',
  'insertUnorderedList',
  'insertOrderedList',
  'justifyLeft',
  'justifyCenter',
  'justifyRight',
] as const

type QueryCommand = (typeof QUERY_COMMANDS)[number]

type ToolbarButton = {
  command: QueryCommand
  label: string
  icon: ReactNode
}

const ICON_SIZE = 16

// 툴바 그룹 — 서식 / 리스트 / 정렬
const FORMAT_BUTTONS: ToolbarButton[] = [
  { command: 'bold', label: '굵게', icon: <Bold size={ICON_SIZE} /> },
  { command: 'italic', label: '기울임', icon: <Italic size={ICON_SIZE} /> },
  { command: 'underline', label: '밑줄', icon: <Underline size={ICON_SIZE} /> },
]

const LIST_BUTTONS: ToolbarButton[] = [
  { command: 'insertUnorderedList', label: '글머리 기호 목록', icon: <List size={ICON_SIZE} /> },
  { command: 'insertOrderedList', label: '번호 매기기 목록', icon: <ListOrdered size={ICON_SIZE} /> },
]

const ALIGN_BUTTONS: ToolbarButton[] = [
  { command: 'justifyLeft', label: '왼쪽 정렬', icon: <TextAlignStart size={ICON_SIZE} /> },
  { command: 'justifyCenter', label: '가운데 정렬', icon: <TextAlignCenter size={ICON_SIZE} /> },
  { command: 'justifyRight', label: '오른쪽 정렬', icon: <TextAlignEnd size={ICON_SIZE} /> },
]

/** 빈 본문 판정 — execCommand가 남기는 <br>, <p><br></p> 등도 빈 것으로 본다 */
function isEmptyHtml(html: string) {
  return html.replace(/<br\s*\/?>|<\/?(p|div)>|&nbsp;|\s/gi, '') === ''
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요',
  minHeight = 200,
  disabled = false,
  onInsertImage,
  showToolbar = true,
  showLinkButton = true,
  showImageButton = true,
}: RichTextEditorProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  // 마지막으로 DOM에 반영된 HTML — 외부 value 변경일 때만 innerHTML을 덮어써 캐럿을 보존한다
  const syncedHtml = useRef<string | null>(null)
  const savedRange = useRef<Range | null>(null)
  const [active, setActive] = useState<Partial<Record<QueryCommand, boolean>>>({})

  const syncActive = useCallback(() => {
    const body = bodyRef.current
    const selection = document.getSelection()
    if (!body || !selection || selection.rangeCount === 0) return
    // 선택 영역이 본문 안에 있을 때만 활성 서식을 갱신
    if (!body.contains(selection.anchorNode)) return
    const next: Partial<Record<QueryCommand, boolean>> = {}
    for (const command of QUERY_COMMANDS) {
      try {
        next[command] = document.queryCommandState(command)
      } catch {
        next[command] = false
      }
    }
    setActive(next)
    savedRange.current = selection.getRangeAt(0).cloneRange()
  }, [])

  // 외부 value → DOM 반영
  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    if (syncedHtml.current === value) return
    body.innerHTML = value
    syncedHtml.current = value
  }, [value])

  // 선택 변경에 따른 활성 서식 추적
  useEffect(() => {
    document.addEventListener('selectionchange', syncActive)
    return () => document.removeEventListener('selectionchange', syncActive)
  }, [syncActive])

  const emit = () => {
    const html = bodyRef.current?.innerHTML ?? ''
    syncedHtml.current = html
    onChange?.(html)
  }

  /** 비동기 이미지 업로드 등으로 포커스가 빠졌을 때 직전 선택 영역을 되살린다 */
  const restoreSelection = () => {
    const body = bodyRef.current
    const range = savedRange.current
    body?.focus()
    if (!range) return
    const selection = document.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  const exec = (command: string, argument?: string) => {
    if (disabled) return
    restoreSelection()
    document.execCommand(command, false, argument)
    emit()
    syncActive()
  }

  const insertLink = () => {
    if (disabled) return
    const url = window.prompt('링크 URL을 입력하세요', 'https://')
    if (url == null || url.trim() === '') return
    const selection = document.getSelection()
    // 선택된 텍스트가 없으면 URL 자체를 링크 텍스트로 삽입
    if (selection == null || selection.isCollapsed) {
      exec('insertHTML', `<a href="${url}" target="_blank" rel="noreferrer">${url}</a>`)
      return
    }
    exec('createLink', url)
  }

  const insertImage = async () => {
    if (disabled) return
    const src = onInsertImage
      ? await onInsertImage()
      : window.prompt('이미지 URL을 입력하세요', 'https://')
    if (src == null || src === '') return
    exec('insertImage', src)
  }

  /**
   * 툴바 버튼 한 칸 — 알맹이는 공용 Button(ghost, iconOnly)이다.
   * 라벨은 Button의 iconOnly 축이 화면에서만 감추고 접근성 이름으로 남긴다.
   *
   * Button이 못 가진 두 축은 래퍼(span)가 계속 대신한다.
   *  - mousedown 기본동작 차단: Button에는 onMouseDown 슬롯이 없다. mousedown의 기본동작(선택 해제)은
   *    전파 경로 어디서 preventDefault를 해도 취소되므로, 버블링을 받는 래퍼에서 막아도 본문 선택이 유지된다.
   *  - 눌림 상태: Button에는 aria-pressed 축이 없다. 그래서 적용 여부를 접근성 이름 뒤에 붙여
   *    ('굵게 적용됨') 스크린리더에 알리고, 화면에서는 .toolBtnOn 클래스로 톤을 준다.
   */
  const renderToolButton = (
    key: string,
    label: string,
    icon: ReactNode,
    onClick: () => void,
    on = false,
  ) => (
    <span
      key={key}
      className={[styles.toolBtn, on ? styles.toolBtnOn : ''].filter(Boolean).join(' ')}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
    >
      <Button
        variant={on ? 'primary' : 'secondary'}
        appearance="ghost"
        size="sm"
        label={on ? `${label} 적용됨` : label}
        iconOnly
        showLeftIcon
        leftIcon={icon}
        disabled={disabled}
        onClick={onClick}
      />
    </span>
  )

  const renderButtons = (buttons: ToolbarButton[]) =>
    buttons.map((button) =>
      renderToolButton(
        button.command,
        button.label,
        button.icon,
        () => exec(button.command),
        active[button.command] ?? false,
      ),
    )

  const empty = isEmptyHtml(value)

  return (
    <div className={[styles.editor, disabled ? styles.disabled : ''].filter(Boolean).join(' ')}>
      {showToolbar && (
        <div className={styles.toolbar} role="toolbar" aria-label="서식 도구 모음">
          {renderButtons(FORMAT_BUTTONS)}
          {/* 구분선은 공용 Divider — 가로선 전용이라 래퍼가 세로로 눕힌다(Divider에 orientation 축이 없다) */}
          <span className={styles.divider} aria-hidden="true">
            <Divider />
          </span>
          {renderButtons(LIST_BUTTONS)}
          {(showLinkButton || showImageButton) && (
            <span className={styles.divider} aria-hidden="true">
              <Divider />
            </span>
          )}
          {showLinkButton &&
            renderToolButton('link', '링크 삽입', <LinkIcon size={ICON_SIZE} />, insertLink)}
          {showImageButton &&
            renderToolButton('image', '이미지 삽입', <ImageIcon size={ICON_SIZE} />, () => {
              void insertImage()
            })}
          <span className={styles.divider} aria-hidden="true">
            <Divider />
          </span>
          {renderButtons(ALIGN_BUTTONS)}
        </div>
      )}

      <div className={styles.bodyWrap}>
        {empty && (
          <div className={styles.placeholder} aria-hidden="true">
            {placeholder}
          </div>
        )}
        <div
          ref={bodyRef}
          className={styles.body}
          style={{ minHeight }}
          contentEditable={!disabled}
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="본문"
          onInput={emit}
          onBlur={emit}
          onKeyUp={syncActive}
          onMouseUp={syncActive}
        />
      </div>
    </div>
  )
}
