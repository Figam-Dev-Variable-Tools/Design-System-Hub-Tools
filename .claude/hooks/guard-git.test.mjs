// 가드 결함 주입 테스트: 차단해야 할 것 / 통과시켜야 할 것을 모두 확인한다.
import { spawnSync } from 'node:child_process'

const HOOK = '.claude/hooks/guard-git.mjs'
const DOC = `node - <<'EOF'
// 문서에 "git stash" 라고 적는 것은 명령이 아니다
fs.writeFileSync(p, '실제로 \`git stash\` 한 번에 53개 파일이 사라졌다')
EOF`

const BLOCK = [
  'git stash',
  'git stash push -u -m wip',
  'git stash pop',
  'git reset --hard HEAD',
  'git checkout -- .',
  'git checkout main',
  'git restore src/ds',
  'git clean -fdx',
  'git rebase main',
  'git merge origin/main',
  'git merge --abort',
  'cd figma-plugin && git stash',
  'pnpm build; git checkout -- src/',
  'git push --force origin main',
  'git branch -D feat/x',
  'git worktree remove ../wt',
  'bash -c "git stash"',            // 셸 한 겹 우회
  'echo src | xargs git checkout --', // 파이프 우회
]

const ALLOW = [
  'git status',
  'git diff --stat',
  'git log --oneline -5',
  'git show HEAD:src/ds/Button/Button.tsx',
  'git stash list',
  'git stash show -p stash@{0}',
  'git add -A',
  'git commit -m "feat: x"',
  'git push origin feat/ds-consolidation',
  'git checkout -b feat/new',
  'git switch -c feat/new',
  'npx tsc -p tsconfig.app.json --noEmit',
  'node scripts/verify-naming.mjs',
  'grep -rn "stash" docs/',
  DOC,                               // 힙독 안의 문서 텍스트는 명령이 아니다
]

const run = (command) =>
  spawnSync('node', [HOOK], {
    input: JSON.stringify({ tool_name: 'Bash', tool_input: { command } }),
    encoding: 'utf8',
  }).status

let fail = 0
for (const c of BLOCK) {
  const code = run(c)
  if (code !== 2) { fail++; console.log(`❌ 막았어야 함 (exit=${code}): ${c}`) }
}
for (const c of ALLOW) {
  const code = run(c)
  if (code !== 0) { fail++; console.log(`❌ 통과시켰어야 함 (exit=${code}): ${c.split('\n')[0]}…`) }
}
console.log(fail === 0
  ? `✅ ${BLOCK.length + ALLOW.length}건 전부 기대대로 (차단 ${BLOCK.length} · 허용 ${ALLOW.length})`
  : `\n실패 ${fail}건`)
process.exit(fail ? 1 : 0)
