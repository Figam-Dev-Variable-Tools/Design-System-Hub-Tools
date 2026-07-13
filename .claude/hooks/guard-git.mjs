#!/usr/bin/env node
/**
 * PreToolUse(Bash) 가드 — 공유 워크트리에서 "작업 트리를 버리는" git 명령을 물리적으로 차단한다.
 *
 * 왜 존재하나 (docs/process-log.md 사고 1):
 *   한 에이전트가 "게이트 기준선을 잡겠다"며 `git stash` 를 실행했다. 이 저장소는 모든 에이전트가
 *   같은 워크트리를 공유하므로, 다른 에이전트 53개 파일의 미커밋 작업이 HEAD 로 되돌아갔다.
 *   되돌아간 파일도 타입체크는 통과하기 때문에 아무도 알아채지 못했다.
 *   CLAUDE.md §0-0 에 금지로 적어뒀지만 "문서에 적힌 금지"는 이미 한 번 뚫렸다 → 기계로 막는다.
 *
 * 정책: 미커밋 변경을 **버리거나 덮어쓰는** 명령만 차단한다.
 *   차단: stash(save/push/pop/apply/drop/clear) · checkout(-b 제외) · switch(-c 제외) · restore
 *        · reset --hard/--merge/--keep · clean · rebase · merge · revert · cherry-pick
 *        · branch -D/-d/-f · worktree remove/prune · push --force
 *   허용: status · diff · log · show · stash list/show · add · commit · push · fetch · branch(조회/생성)
 *        · rev-parse · ls-files · cat-file · blame · worktree list · checkout -b · switch -c
 *
 * 차단은 exit 2 + stderr → 모델에게 이유와 대안이 그대로 전달된다.
 */

const READ_ONLY_STASH = /^(list|show)\b/
const DESTRUCTIVE = [
  {
    sub: 'stash',
    hit: (rest) => !READ_ONLY_STASH.test(rest.trim()),
    why: '공유 워크트리에서 stash 는 다른 에이전트의 미커밋 작업을 통째로 걷어간다.',
  },
  {
    sub: 'checkout',
    // `git checkout -b <new>` 는 브랜치만 새로 만들고 작업 트리를 보존한다 → 허용
    hit: (rest) => !/^-b\s+\S/.test(rest.trim()),
    why: 'checkout 은 경로/브랜치를 가리지 않고 미커밋 편집을 HEAD 로 덮어쓴다.',
  },
  {
    sub: 'switch',
    hit: (rest) => !/^-c\s+\S/.test(rest.trim()),
    why: 'switch 는 브랜치를 갈아끼우며 작업 트리를 바꾼다.',
  },
  { sub: 'restore', hit: () => true, why: 'restore 는 미커밋 편집을 되돌린다.' },
  {
    sub: 'reset',
    hit: (rest) => /(^|\s)--(hard|merge|keep)(\s|$)/.test(rest),
    why: 'reset --hard/--merge/--keep 는 작업 트리를 파괴한다.',
  },
  { sub: 'clean', hit: () => true, why: 'clean 은 추적되지 않는 새 파일(= 방금 만든 컴포넌트)을 지운다.' },
  { sub: 'rebase', hit: () => true, why: 'rebase 는 히스토리와 작업 트리를 동시에 바꾼다.' },
  { sub: 'merge', hit: () => true, why: 'merge 는 작업 트리를 덮어쓴다. 병합은 오너/오케스트레이터가 한다.' },
  { sub: 'revert', hit: () => true, why: 'revert 는 커밋과 작업 트리를 동시에 바꾼다.' },
  { sub: 'cherry-pick', hit: () => true, why: 'cherry-pick 은 작업 트리를 덮어쓴다.' },
  {
    sub: 'branch',
    hit: (rest) => /(^|\s)-(D|d|f|-delete|-force)(\s|$)/.test(rest),
    why: '브랜치 삭제/강제 이동은 오케스트레이터만 한다.',
  },
  {
    sub: 'worktree',
    hit: (rest) => /^(remove|prune)\b/.test(rest.trim()),
    why: '워크트리 제거는 다른 에이전트의 작업 디렉터리를 날린다.',
  },
  {
    sub: 'push',
    hit: (rest) => /(^|\s)(-f|--force)(\s|$|-)/.test(rest),
    why: '강제 푸시는 원격 히스토리를 파괴한다. 푸시는 오케스트레이터만 한다.',
  },
]

/** 인용 힙독(`<<'EOF' … EOF`)의 본문은 **데이터**지 명령이 아니다. 문서에 "git stash" 를 쓰는 것까지 막으면 안 된다. */
function stripQuotedHeredocs(s) {
  return s.replace(/<<-?\s*(['"])(\w+)\1[\s\S]*?^\s*\2\s*$/gm, '<<HEREDOC_BODY_STRIPPED')
}

/** git 이 **명령 위치**에 있을 때만 명령으로 본다: 줄 시작 / `;` `&&` `||` `|` `(` `{` 뒤. */
const GIT_AT_COMMAND_POS =
  /(?<=^|[\n;(){}]|&&|\|\||[|&]|^\s*)\s*(?:\w+=\S+\s+)*git\s+((?:-c\s+\S+\s+|--no-pager\s+|-C\s+\S+\s+)*)([a-z][a-z-]*)([^\n;&|]*)/gim

/** 셸을 한 겹 더 띄워 우회하는 형태(`bash -c "git stash"`, `eval`, `xargs git checkout`)는 위치를 따지지 않고 막는다. */
const EXEC_WRAPPER = /\b(eval|xargs|(?:ba|z|)sh\s+-c|pwsh\s+-c|powershell\s+-(?:c|command))\b/i

function scan(text, { anywhere = false } = {}) {
  const re = anywhere
    ? /\bgit\s+((?:-c\s+\S+\s+|--no-pager\s+|-C\s+\S+\s+)*)([a-z][a-z-]*)([^\n;&|"']*)/gi
    : GIT_AT_COMMAND_POS
  let m
  while ((m = re.exec(text)) !== null) {
    const rule = DESTRUCTIVE.find((r) => r.sub === m[2].toLowerCase())
    if (rule && rule.hit(m[3] ?? '')) return { cmd: m[0].trim(), rule }
  }
  return null
}

function findViolation(command) {
  const code = stripQuotedHeredocs(command)
  // `cd x && git stash`, `foo; git clean -fd` 같은 합성 명령도 잡는다.
  return scan(code) ?? (EXEC_WRAPPER.test(code) ? scan(code, { anywhere: true }) : null)
}

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (c) => (raw += c))
process.stdin.on('end', () => {
  let command = ''
  try {
    command = JSON.parse(raw)?.tool_input?.command ?? ''
  } catch {
    process.exit(0) // 입력을 못 읽으면 통과시킨다 (가드가 작업을 막는 사고를 내지 않도록)
  }
  const v = findViolation(command)
  if (!v) process.exit(0)

  process.stderr.write(
    [
      `🛑 차단됨: ${v.cmd}`,
      ``,
      `이 저장소는 여러 에이전트가 **하나의 워크트리를 공유**한다. ${v.rule.why}`,
      `실제 사고: 한 에이전트의 \`git stash\` 로 다른 에이전트 53개 파일의 미커밋 작업이 사라졌고,`,
      `되돌아간 파일도 타입체크는 통과하기 때문에 아무도 알아채지 못했다. (docs/process-log.md)`,
      ``,
      `대신 이렇게 해라:`,
      `  · 기준선(변경 전 원본)이 필요하면  →  git show HEAD:<path>   (파일을 건드리지 않고 읽는다)`,
      `  · 내 편집을 되돌리고 싶으면        →  Edit/Write 로 직접 되돌린다. git 으로 되돌리지 마라.`,
      `  · 백업이 필요하면                  →  cp <path> <path>.bak   (git 상태를 바꾸지 않는다)`,
      `  · 커밋 / 브랜치 / 푸시              →  오케스트레이터(메인 세션)만 한다. 하지 마라.`,
      ``,
      `읽기 전용 git(status·diff·log·show·stash list)은 그대로 허용된다.  — CLAUDE.md §0-0`,
    ].join('\n') + '\n',
  )
  process.exit(2)
})
