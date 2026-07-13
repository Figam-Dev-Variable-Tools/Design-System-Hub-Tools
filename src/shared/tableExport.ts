/**
 * 표 내보내기 유틸 — CSV / Excel(SpreadsheetML). 외부 라이브러리 없음.
 *
 * shared는 ds를 import하지 않는다(AdminTable이 shared를 import하므로 순환이 된다).
 * 그래서 컬럼은 `ExportColumn`이라는 최소 계약만 받는다 — AdminTable이 자기 컬럼을
 * 이 모양으로 변환해서 넘긴다.
 *
 * 한글 깨짐 방지: 두 포맷 모두 UTF-8 + BOM으로 내보낸다(엑셀은 BOM이 없으면 CSV를
 * 시스템 인코딩으로 읽어 한글이 깨진다).
 */

/** 내보내기가 아는 컬럼의 전부 — 헤더 문자열과 값 추출 함수 */
export type ExportColumn<T> = {
  key: string
  header: string
  value: (row: T) => unknown
}

/** UTF-8 BOM — 엑셀이 파일을 UTF-8로 인식하게 하는 유일한 신호 */
const BOM = '\uFEFF'

/** XML 1.0이 허용하지 않는 제어문자(탭/개행 제외) — 있으면 엑셀이 파일을 거부한다 */
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g

/** 셀 값 → 문자열. boolean은 ON/OFF, null/undefined는 빈칸 */
function toText(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'boolean') return value ? 'ON' : 'OFF'
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value)
}

/** RFC 4180 — 쉼표·큰따옴표·개행이 있으면 감싸고, 큰따옴표는 두 번 */
function escapeCsv(text: string): string {
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** 표 → CSV 문자열(BOM은 붙이지 않는다 — 다운로드 시점의 몫) */
export function toCsv<T>(rows: T[], columns: ExportColumn<T>[]): string {
  const head = columns.map((col) => escapeCsv(col.header)).join(',')
  const body = rows.map((row) =>
    columns.map((col) => escapeCsv(toText(col.value(row)))).join(','),
  )
  return [head, ...body].join('\r\n')
}

/** XML 예약문자 이스케이프 + 제어문자 제거 */
function escapeXml(text: string): string {
  return text
    .replace(CONTROL_CHARS, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** 숫자는 Number 셀로(엑셀에서 합계가 된다), 나머지는 String 셀 */
function cellXml(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`
  }
  return `<Cell><Data ss:Type="String">${escapeXml(toText(value))}</Data></Cell>`
}

/** SpreadsheetML 2003 — .xls로 저장하면 엑셀이 그대로 연다(별도 라이브러리 불필요) */
function toExcelXml<T>(rows: T[], columns: ExportColumn<T>[]): string {
  const head = columns
    .map(
      (col) =>
        `<Cell ss:StyleID="head"><Data ss:Type="String">${escapeXml(col.header)}</Data></Cell>`,
    )
    .join('')
  const body = rows
    .map((row) => `<Row>${columns.map((col) => cellXml(col.value(row))).join('')}</Row>`)
    .join('')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?mso-application progid="Excel.Sheet"?>',
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">',
    '<Styles><Style ss:ID="head"><Font ss:Bold="1"/></Style></Styles>',
    '<Worksheet ss:Name="Sheet1"><Table>',
    `<Row>${head}</Row>`,
    body,
    '</Table></Worksheet></Workbook>',
  ].join('')
}

/** 파일명 정리 — 경로/예약문자 제거 + 확장자 보장 */
function withExtension(filename: string, extension: string): string {
  const trimmed = filename.trim()
  const base = (trimmed === '' ? 'table' : trimmed).replace(/[\\/:*?"<>|]/g, '_')
  return base.toLowerCase().endsWith(extension) ? base : `${base}${extension}`
}

/** Blob → 임시 <a>로 다운로드. 브라우저가 아니면 아무것도 하지 않는다 */
function download(filename: string, content: string, mime: string): void {
  if (typeof document === 'undefined' || typeof URL.createObjectURL !== 'function') return

  const blob = new Blob([BOM + content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // 일부 브라우저는 클릭 직후 revoke하면 다운로드가 취소된다 — 다음 틱에 해제
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** CSV 다운로드(UTF-8 BOM 포함) */
export function downloadCsv(filename: string, csv: string): void {
  download(withExtension(filename, '.csv'), csv, 'text/csv;charset=utf-8')
}

/** Excel 다운로드 — SpreadsheetML을 .xls로 */
export function downloadExcelXml<T>(
  filename: string,
  rows: T[],
  columns: ExportColumn<T>[],
): void {
  download(
    withExtension(filename, '.xls'),
    toExcelXml(rows, columns),
    'application/vnd.ms-excel;charset=utf-8',
  )
}
