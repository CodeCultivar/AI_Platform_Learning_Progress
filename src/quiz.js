// Quiz engine: pure functions, no React and no storage of its own.
//
// A question bank is an array of { q, o: [4 option strings], a: index of the right option, why }.
// Each quiz asks QUIZ_LEN questions drawn from a bank, with the options shuffled. The pass mark is 4 of 5.
// Attempts are saved as notes under the key  qz:<plan>:<unit>:<timestamp>  so they sync like any other
// note (one key per attempt means two devices never overwrite each other's history).

export const QUIZ_LEN = 5
export const PASS_MARK = 4

export const passMarkFor = (n) => (n >= QUIZ_LEN ? PASS_MARK : Math.max(1, Math.ceil(n * 0.8)))

export function shuffle(arr, rnd = Math.random) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Pick questions for a quiz.
 * `bank` entries may be plain questions or { id, ...question } (the id is how history is matched).
 * `seen` maps question id -> 'ok' | 'bad' from earlier attempts: questions you got wrong come back first,
 * then ones you have never seen, then ones you already answered correctly.
 */
export function buildQuiz(bank, { n = QUIZ_LEN, rnd = Math.random, seen = {} } = {}) {
  const items = bank.map((q, i) => ({ ...q, id: q.id ?? String(i) }))
  const bad = shuffle(items.filter((q) => seen[q.id] === 'bad'), rnd)
  const fresh = shuffle(items.filter((q) => !seen[q.id]), rnd)
  const ok = shuffle(items.filter((q) => seen[q.id] === 'ok'), rnd)
  const chosen = shuffle([...bad, ...fresh, ...ok].slice(0, Math.min(n, items.length)), rnd)
  return chosen.map((q) => {
    const opts = shuffle(q.o.map((text, k) => ({ text, right: k === q.a })), rnd)
    return { id: q.id, q: q.q, why: q.why, options: opts.map((x) => x.text), correct: opts.findIndex((x) => x.right), unit: q.unit }
  })
}

/** answers[i] is the chosen option index for quiz[i] (or undefined). */
export function gradeQuiz(quiz, answers) {
  const results = quiz.map((q, i) => ({ id: q.id, picked: answers[i], correct: q.correct, ok: answers[i] === q.correct }))
  const score = results.filter((r) => r.ok).length
  const total = quiz.length
  return { score, total, passed: total > 0 && score >= passMarkFor(total), results }
}

// ---- attempt history, stored in notes -----------------------------------
const PREFIX = 'qz:'
export const attemptKey = (planId, unit, ts) => `${PREFIX}${planId}:${unit}:${ts}`

export function makeAttempt(grade, ts = Date.now(), date) {
  return {
    ts,
    d: date || new Date(ts).toISOString().slice(0, 10),
    s: grade.score,
    n: grade.total,
    p: grade.passed ? 1 : 0,
    ok: grade.results.filter((r) => r.ok).map((r) => r.id),
    bad: grade.results.filter((r) => !r.ok).map((r) => r.id),
  }
}

export function attemptsFor(notes, planId, unit) {
  const head = `${PREFIX}${planId}:${unit}:`
  const out = []
  for (const k of Object.keys(notes || {})) {
    if (!k.startsWith(head)) continue
    try {
      const v = JSON.parse(notes[k])
      if (v && typeof v.s === 'number' && typeof v.n === 'number') out.push({ ...v, ts: Number(k.slice(head.length)) || v.ts || 0 })
    } catch { /* ignore a corrupt note */ }
  }
  return out.sort((a, b) => a.ts - b.ts)
}

export const bestAttempt = (list) => list.reduce((b, a) => (!b || a.s / a.n > b.s / b.n ? a : b), null)
export const hasPassed = (list) => list.some((a) => a.p === 1)

/** question id -> 'ok' | 'bad' from the most recent time each was answered */
export function seenMap(list) {
  const m = {}
  list.forEach((a) => {
    ;(a.ok || []).forEach((id) => { m[id] = 'ok' })
    ;(a.bad || []).forEach((id) => { m[id] = 'bad' })
  })
  return m
}

/** How many of a plan's graded units have a passing attempt. */
export function quizProgress(notes, planId, units) {
  const passed = units.filter((u) => hasPassed(attemptsFor(notes, planId, u))).length
  return { passed, total: units.length }
}

/** Questions for a cumulative review: pooled from the given units, each tagged with its unit. */
export function reviewPool(banks, units) {
  const pool = []
  units.forEach((u) => (banks[u] || []).forEach((q, i) => pool.push({ ...q, id: `${u}:${i}`, unit: u })))
  return pool
}
