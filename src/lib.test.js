import { describe, it, expect } from 'vitest'
import { parseInline, currentWeek, pct, taskIds, searchPlan, daysUntil, mergeStates, sameState, resetState, emptyState } from './lib.js'
import { syncOnce } from './sync.js'
import { SOURCES } from './data/sources.js'
import plan from './data/plan.json'

describe('parseInline', () => {
  it('splits bold, code and links', () => {
    const p = parseInline('**Mon:** run `pytest` see [[LINK https://x.dev|docs]].')
    expect(p.map((x) => x.t)).toEqual(['b', 's', 'c', 's', 'a', 's'])
    expect(p[4]).toMatchObject({ v: 'docs', url: 'https://x.dev' })
  })
})

describe('currentWeek', () => {
  it('maps dates to weeks', () => {
    expect(currentWeek(new Date('2026-11-03T12:00:00Z'))).toBe(1)
    expect(currentWeek(new Date('2026-11-12T12:00:00Z'))).toBe(2)
    expect(currentWeek(new Date('2026-12-25T12:00:00Z'))).toBe(8) // holiday break -> next week
    expect(currentWeek(new Date('2026-10-01T12:00:00Z'))).toBe(1)
    expect(currentWeek(new Date('2027-06-01T12:00:00Z'))).toBe(12)
  })
})

describe('plan data', () => {
  it('has 12 weeks, 4 gates, 25 links, unique task ids', () => {
    expect(plan.weeks).toHaveLength(12)
    expect(plan.weeks.filter((w) => w.gate).map((w) => w.gate)).toEqual([1, 2, 3, 4])
    expect(plan.links.length).toBe(25)
    const ids = taskIds()
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('every week has steps and a done-when', () => {
    plan.weeks.forEach((w) => { expect(w.steps.length).toBeGreaterThan(0); expect(w.done).toBeTruthy() })
  })
})

describe('helpers', () => {
  it('pct', () => {
    expect(pct(['a', 'b', 'c', 'd'], { a: true })).toBe(25)
    expect(pct([], {})).toBe(0)
  })
  it('search finds terraform', () => {
    expect(searchPlan('terraform').length).toBeGreaterThan(3)
    expect(searchPlan('x')).toEqual([])
  })
  it('daysUntil', () => {
    expect(daysUntil('2026-11-10', new Date('2026-11-03T12:00:00'))).toBe(7)
  })
})

const S = (checked = {}, notes = {}, ts = {}) => ({ checked, notes, dates: {}, ts })

describe('mergeStates', () => {
  it('keeps edits made on different devices', () => {
    const a = S({ x: true }, {}, { 'c:x': 10 })
    const b = S({ y: true }, {}, { 'c:y': 20 })
    expect(mergeStates(a, b).checked).toEqual({ x: true, y: true })
  })
  it('newest edit wins, including an un-check', () => {
    const a = S({ x: true }, {}, { 'c:x': 10 })
    const b = S({}, {}, { 'c:x': 20 }) // unchecked later on another device
    expect(mergeStates(a, b).checked).toEqual({})
    expect(mergeStates(b, a).checked).toEqual({}) // order-independent
  })
  it('merges notes by timestamp', () => {
    const a = S({}, { week1: 'old' }, { 'n:week1': 5 })
    const b = S({}, { week1: 'new' }, { 'n:week1': 9 })
    expect(mergeStates(a, b).notes.week1).toBe('new')
  })
  it('treats unstamped legacy data as old but not lost', () => {
    const legacy = S({ x: true }, {}, {})
    expect(mergeStates(legacy, emptyState()).checked).toEqual({ x: true })
    expect(mergeStates(legacy, S({}, {}, { 'c:x': 3 })).checked).toEqual({})
  })
  it('is idempotent', () => {
    const a = S({ x: true }, { k: 'v' }, { 'c:x': 1, 'n:k': 2 })
    expect(sameState(mergeStates(a, a), a)).toBe(true)
  })
  it('reset propagates as a newer empty state', () => {
    const a = S({ x: true }, { k: 'v' }, { 'c:x': 1, 'n:k': 2 })
    const r = resetState(a, 100)
    expect(mergeStates(a, r).checked).toEqual({})
    expect(mergeStates(a, r).notes).toEqual({})
  })
})

describe('syncOnce', () => {
  const mk = (remote) => {
    const calls = []
    const f = async (url, init = {}) => {
      calls.push([init.method || 'GET', url.replace('https://api.github.com', '')])
      if (init.method === 'POST') return { ok: true, json: async () => ({ id: 'g1' }) }
      if (init.method === 'PATCH') { remote.content = JSON.parse(init.body).files['progress.json'].content; return { ok: true, json: async () => ({}) } }
      return { ok: true, json: async () => ({ files: { 'progress.json': { content: remote.content } } }) }
    }
    return { f, calls }
  }
  it('creates a gist on first use', async () => {
    const { f, calls } = mk({})
    const r = await syncOnce({ token: 't' }, S({ x: true }, {}, { 'c:x': 1 }), f)
    expect(r.gistId).toBe('g1'); expect(calls).toEqual([['POST', '/gists']])
  })
  it('merges remote changes and pushes only when remote is behind', async () => {
    const remote = { content: JSON.stringify(S({ y: true }, {}, { 'c:y': 5 })) }
    const { f, calls } = mk(remote)
    const r = await syncOnce({ token: 't', gistId: 'g1' }, S({ x: true }, {}, { 'c:x': 9 }), f)
    expect(r.state.checked).toEqual({ x: true, y: true }); expect(r.pushed).toBe(true)
    calls.length = 0
    const r2 = await syncOnce({ token: 't', gistId: 'g1' }, r.state, f)
    expect(r2.pushed).toBe(false); expect(calls).toEqual([['GET', '/gists/g1']])
  })
  it('reports a rejected token', async () => {
    const f = async () => ({ ok: false, status: 401 })
    await expect(syncOnce({ token: 'bad', gistId: 'g1' }, emptyState(), f)).rejects.toThrow(/token rejected/)
  })
})

describe('sources', () => {
  it('are numbered 1..n, unique and https', () => {
    expect(SOURCES.map((s) => s.n)).toEqual(SOURCES.map((_, i) => i + 1))
    SOURCES.forEach((s) => expect(s.url.startsWith('https://')).toBe(true))
  })
})
