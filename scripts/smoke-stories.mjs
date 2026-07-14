#!/usr/bin/env node
/**
 * 스토리 런타임 스모크 — 전체 스토리를 실제로 렌더해 보고 `pageerror` 와 빈 렌더를 잡는다.
 *
 * 타입체크와 게이트는 **정적** 검사다. 렌더 중에 터지는 것(undefined 접근, 무한 루프, 빈 화면)은
 * 실행해 봐야 안다. 큰 리팩터 뒤에는 이걸 돌린다.
 *
 * 전제: Storybook 이 6006 에 떠 있어야 한다 (`pnpm storybook`).
 * 사용: node scripts/smoke-stories.mjs
 *
 * ⚠️ Shadow DOM 주의: `frameworks-*` 스토리(Bootstrap·Bulma·Foundation·Materialize)는
 *    CSS 격리를 위해 **Shadow DOM 안에** 렌더한다. 섀도 루트를 안 따라가면 35개가
 *    전부 "빈 렌더"로 오탐된다 — 실제로 그렇게 거짓 실패를 낸 적이 있다.
 */
import { chromium } from 'playwright'

const BASE = process.env.SB_URL ?? 'http://localhost:6006'
/** 마운트 완료까지 기다리는 상한. 이걸 넘겨도 루트가 비어 있으면 그게 진짜 빈 렌더다. */
const RENDER_TIMEOUT_MS = 5000
/** 마운트 후 레이아웃 안정화 — 애니메이션·지연 로드가 끝나기를 잠깐 기다린다. */
const SETTLE_MS = 150

const res = await fetch(`${BASE}/index.json`).catch(() => null)
if (!res?.ok) {
  console.error(`✗ Storybook 을 ${BASE} 에서 찾지 못했다 — \`pnpm storybook\` 으로 먼저 띄워라.`)
  process.exit(1)
}
const index = await res.json()
const stories = Object.values(index.entries ?? index.stories ?? {}).filter((e) => e.type !== 'docs')

const browser = await chromium.launch()
const page = await browser.newPage()

const failures = []
let checked = 0

for (const s of stories) {
  const errors = []
  const onError = (e) => errors.push(String(e))
  page.on('pageerror', onError)

  try {
    await page.goto(`${BASE}/iframe.html?id=${s.id}&viewMode=story`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    })

    // 고정 대기(setTimeout)로 판정하면 **오탐이 난다** — Storybook 이 마운트를 끝내기 전에 읽으면
    // 45KB 짜리 아이콘 갤러리도 "빈 렌더"로 보인다(실제로 그렇게 거짓 실패를 냈다).
    // 루트에 자식이 생길 때까지 **실제로 기다린다.** 끝내 안 생기면 그때가 진짜 빈 렌더다.
    await page
      .waitForFunction(() => (document.querySelector('#storybook-root')?.childElementCount ?? 0) > 0, {
        timeout: RENDER_TIMEOUT_MS,
      })
      .catch(() => {}) // 타임아웃이면 아래 판정이 EMPTY 로 잡는다 — 여기서 실패시키지 않는다
    await page.waitForTimeout(SETTLE_MS)

    // 빈 렌더 판정 — "글자가 있는가"로 보면 안 된다.
    //   · 아이콘 전용 버튼·SVG 갤러리는 글자가 없다 (그리고 SVG 의 tagName 은 소문자 'svg' 다)
    //   · 로딩 스켈레톤은 글자도 이미지도 없지만 **분명히 렌더된 것**이다
    // → **실제로 그려진 박스가 있는가**(non-zero bounding box)로 판정한다. 섀도 루트도 따라간다.
    const filled = await page.evaluate(() => {
      const painted = (root) => {
        if (!root) return false
        for (const el of root.querySelectorAll?.('*') ?? []) {
          if (el.shadowRoot && painted(el.shadowRoot)) return true
          const r = el.getBoundingClientRect?.()
          if (r && r.width > 0 && r.height > 0) return true
        }
        return (root.textContent ?? '').trim().length > 0
      }
      return painted(document.querySelector('#storybook-root') ?? document.body)
    })

    if (errors.length) failures.push(`${s.id} :: ERROR :: ${errors[0].split('\n')[0]}`)
    else if (!filled) failures.push(`${s.id} :: EMPTY`)
  } catch (e) {
    failures.push(`${s.id} :: LOAD-FAIL :: ${e.message.split('\n')[0]}`)
  } finally {
    page.off('pageerror', onError)
    checked++
  }
}

await browser.close()

console.log(`검사: ${checked} · 실패: ${failures.length}`)
for (const f of failures) console.log('  ' + f)
process.exit(failures.length ? 1 : 0)
