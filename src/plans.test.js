import { describe, it, expect } from 'vitest'
import { PLANS } from './plans.js'
import { aiQuiz } from './data/ai-quiz.js'
import { deQuiz, deBlockOf } from './data/de-quiz.js'
import { taskIds, buildSchedule, mergeStates, emptyState, resetPlanState, inPlan, searchPlan } from './lib.js'
import { buildQuiz, gradeQuiz, attemptKey, makeAttempt, attemptsFor, hasPassed, seenMap, bestAttempt, reviewPool, passMarkFor } from './quiz.js'

const seeded = (seed = 1) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }

describe('data engineering plan', () => {
  const { plan } = PLANS.de
  it('has 40 weeks of five Mon-Fri steps plus a done line', () => {
    expect(plan.weeks).toHaveLength(40)
    plan.weeks.forEach((w, i) => {
      expect(w.n).toBe(i + 1)
      expect(w.steps.map((s) => s.label)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
      expect(w.done.length).toBeGreaterThan(20)
      expect(w.links.length).toBeGreaterThan(0)
    })
  })
  it('has four checkpoints, each on a Friday step', () => {
    const gates = plan.weeks.filter((w) => w.gate)
    expect(gates.map((w) => w.gate)).toEqual([1, 2, 3, 4])
    gates.forEach((w) => expect(w.steps.filter((s) => s.gate)).toHaveLength(1))
  })
  it('has unique prefixed task ids that never collide with the AI plan', () => {
    const de = taskIds(plan, 'de:')
    const ai = taskIds(PLANS.ai.plan, '')
    expect(new Set(de).size).toBe(de.length)
    expect(de.every((id) => id.startsWith('de:'))).toBe(true)
    expect(de.some((id) => ai.includes(id))).toBe(false)
    expect(de.length).toBe(plan.kickoff.steps.length + 1 + 40 * 6)
  })
  it('lays 40 weeks on a calendar from the placeholder start', () => {
    const s = buildSchedule(undefined, 40, PLANS.de.defaultSchedule)
    expect(s.weeks).toHaveLength(40)
    expect(s.start).toBe('2027-02-08')
  })
  it('uses no absolute dates in the week text', () => {
    const text = JSON.stringify(plan.weeks.map((w) => [w.steps, w.done, w.summary]))
    expect(text).not.toMatch(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2}\b/)
  })
})

describe('question banks', () => {
  const check = (bank, name) => bank.forEach((x, i) => {
    expect(x.q.length, `${name} #${i} question`).toBeGreaterThan(10)
    expect(x.o, `${name} #${i} options`).toHaveLength(4)
    expect(new Set(x.o).size, `${name} #${i} distinct options`).toBe(4)
    expect(x.a, `${name} #${i} answer index`).toBeGreaterThanOrEqual(0)
    expect(x.a).toBeLessThan(4)
    expect(x.why.length, `${name} #${i} explanation`).toBeGreaterThan(5)
  })
  it('AI plan has a bank of at least 6 questions for each of its 12 weeks', () => {
    expect(Object.keys(aiQuiz).map(Number)).toEqual(PLANS.ai.plan.weeks.map((w) => w.n))
    Object.entries(aiQuiz).forEach(([k, b]) => { expect(b.length).toBeGreaterThanOrEqual(6); check(b, `ai ${k}`) })
  })
  it('data engineering has a bank for each of its 20 blocks, and every week maps to one', () => {
    expect(Object.keys(deQuiz).map(Number)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1))
    Object.entries(deQuiz).forEach(([k, b]) => { expect(b.length).toBeGreaterThanOrEqual(6); check(b, `de ${k}`) })
    PLANS.de.plan.weeks.forEach((w) => expect(deQuiz[PLANS.de.quizUnitOf(w)]).toBeTruthy())
    expect(deBlockOf(40)).toBe(20)
  })
  it('no question text is repeated within a plan', () => {
    for (const bank of [aiQuiz, deQuiz]) {
      const all = Object.values(bank).flat().map((x) => x.q)
      expect(new Set(all).size).toBe(all.length)
    }
  })
})

describe('quiz engine', () => {
  const bank = deQuiz[1]
  it('draws 5 distinct questions with 4 shuffled options and the right index', () => {
    const quiz = buildQuiz(bank, { rnd: seeded(7) })
    expect(quiz).toHaveLength(5)
    expect(new Set(quiz.map((x) => x.id)).size).toBe(5)
    quiz.forEach((x) => {
      const src = bank[Number(x.id)]
      expect(x.options).toHaveLength(4)
      expect(x.options[x.correct]).toBe(src.o[src.a])
    })
  })
  it('passes at 4 of 5 and fails at 3 of 5', () => {
    const quiz = buildQuiz(bank, { rnd: seeded(3) })
    const ans = (n) => quiz.map((x, i) => (i < n ? x.correct : (x.correct + 1) % 4))
    expect(gradeQuiz(quiz, ans(5))).toMatchObject({ score: 5, passed: true })
    expect(gradeQuiz(quiz, ans(4))).toMatchObject({ score: 4, passed: true })
    expect(gradeQuiz(quiz, ans(3))).toMatchObject({ score: 3, passed: false })
    expect(gradeQuiz(quiz, [])).toMatchObject({ score: 0, passed: false })
  })
  it('scales the pass mark for tiny banks', () => {
    expect(passMarkFor(5)).toBe(4)
    expect(passMarkFor(3)).toBe(3)
  })
  it('asks missed questions first on a retake', () => {
    const first = buildQuiz(bank, { rnd: seeded(11) })
    const miss = first.slice(0, 2).map((x) => x.id)
    const seen = {}
    first.forEach((x) => { seen[x.id] = miss.includes(x.id) ? 'bad' : 'ok' })
    for (let s = 1; s < 20; s++) {
      const ids = buildQuiz(bank, { rnd: seeded(s), seen }).map((x) => x.id)
      miss.forEach((id) => expect(ids).toContain(id))
    }
  })
  it('stores attempts as notes and reads them back in order', () => {
    const quiz = buildQuiz(bank, { rnd: seeded(5) })
    const g = gradeQuiz(quiz, quiz.map((x) => x.correct))
    const notes = {}
    notes[attemptKey('de', 3, 2000)] = JSON.stringify(makeAttempt({ ...g, score: 3, passed: false }, 2000, '2027-02-10'))
    notes[attemptKey('de', 3, 3000)] = JSON.stringify(makeAttempt(g, 3000, '2027-02-12'))
    notes[attemptKey('de', 4, 1000)] = JSON.stringify(makeAttempt(g, 1000, '2027-02-09'))
    notes[attemptKey('de', 3, 9)] = 'not json'
    const list = attemptsFor(notes, 'de', 3)
    expect(list.map((a) => a.ts)).toEqual([2000, 3000])
    expect(hasPassed(list)).toBe(true)
    expect(bestAttempt(list).s).toBe(5)
    expect(Object.keys(seenMap(list)).length).toBeGreaterThan(0)
  })
  it('pools a review from several banks with unit-tagged ids', () => {
    const pool = reviewPool(deQuiz, [1, 2])
    expect(pool).toHaveLength(deQuiz[1].length + deQuiz[2].length)
    expect(new Set(pool.map((p) => p.id)).size).toBe(pool.length)
    expect(buildQuiz(pool, { rnd: seeded(2) })).toHaveLength(5)
  })
})

describe('two plans sharing one saved state', () => {
  const now = 1000
  const a = { ...emptyState(), checked: { 'w1-s0': true, 'de:w1-s0': true }, notes: { week1: 'ai note', 'de:week1': 'de note', [attemptKey('ai', 1, 5)]: '{}', [attemptKey('de', 1, 5)]: '{}' },
    dates: {}, settings: { schedule: { start: '2026-11-03' }, 'schedule-de': { start: '2027-02-08' } },
    ts: { 'c:w1-s0': now, 'c:de:w1-s0': now, 'n:week1': now, 'n:de:week1': now, 'n:qz:ai:1:5': now, 'n:qz:de:1:5': now } }
  it('knows which keys belong to which plan', () => {
    expect(inPlan('w1-s0', '')).toBe(true)
    expect(inPlan('de:w1-s0', '')).toBe(false)
    expect(inPlan('qz:de:1:5', 'de:')).toBe(true)
    expect(inPlan('qz:ai:1:5', 'de:')).toBe(false)
    expect(inPlan('schedule-de', 'de:')).toBe(true)
  })
  it('resets one plan and leaves the other and every schedule alone', () => {
    const r = resetPlanState(a, 'de:', 2000)
    expect(r.checked).toEqual({ 'w1-s0': true })
    expect(Object.keys(r.notes).sort()).toEqual(['qz:ai:1:5', 'week1'].sort())
    expect(r.settings).toEqual(a.settings)
    const r2 = resetPlanState(a, '', 2000)
    expect(r2.checked).toEqual({ 'de:w1-s0': true })
    expect(r2.notes['de:week1']).toBe('de note')
  })
  it('a reset wins a later merge with an older copy, so synced devices do not resurrect it', () => {
    const r = resetPlanState(a, 'de:', 2000)
    const m = mergeStates(r, a)
    expect(m.checked['de:w1-s0']).toBeUndefined()
    expect(m.checked['w1-s0']).toBe(true)
  })
  it('merges quiz attempts from two devices without losing either', () => {
    const d1 = { ...emptyState(), notes: { [attemptKey('de', 2, 100)]: 'x' }, ts: { 'n:qz:de:2:100': 1 } }
    const d2 = { ...emptyState(), notes: { [attemptKey('de', 2, 200)]: 'y' }, ts: { 'n:qz:de:2:200': 2 } }
    expect(Object.keys(mergeStates(d1, d2).notes).sort()).toEqual([attemptKey('de', 2, 100), attemptKey('de', 2, 200)])
  })
})

describe('search across a plan', () => {
  it('finds data engineering content with links under the shared base', () => {
    const r = searchPlan('terraform', { plan: PLANS.de.plan, base: PLANS.de.base })
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((x) => x.to.startsWith('#/'))).toBe(true)
  })
})
