/**
 * Media 스토리용 목(mock) 이미지.
 * 외부 URL을 쓰지 않고 인라인 SVG data URI를 만든다.
 * SVG 내부 색은 스토리 전용 중립 톤 고정색이며, 컴포넌트 CSS의 토큰 규칙과는 무관하다.
 */
const TONES = {
  slate: ['#9aa3b2', '#5c6577'],
  sand: ['#c6b79c', '#8d7f66'],
  sage: ['#9bb0a0', '#67806d'],
  dusk: ['#a89bb4', '#6b5f7c'],
} as const

export type MockTone = keyof typeof TONES

/**
 * @param label 이미지 중앙에 찍히는 라벨(비율 확인용)
 * @param tone  중립 톤 색상
 */
export function mockImage(label = '', tone: MockTone = 'slate'): string {
  const [from, to] = TONES[tone]

  // preserveAspectRatio="slice" + object-fit:cover 조합이라 어떤 비율 박스에도 꽉 찬다.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
</linearGradient></defs>
<rect width="480" height="480" fill="url(#g)"/>
<circle cx="360" cy="120" r="150" fill="#ffffff" opacity="0.10"/>
<circle cx="110" cy="380" r="110" fill="#000000" opacity="0.08"/>
${
  label
    ? `<text x="240" y="240" font-family="system-ui, sans-serif" font-size="44" font-weight="700" fill="#ffffff" fill-opacity="0.9" text-anchor="middle" dominant-baseline="middle">${label}</text>`
    : ''
}
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
