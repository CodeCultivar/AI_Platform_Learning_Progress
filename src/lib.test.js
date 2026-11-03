import { describe, it, expect } from 'vitest'
import { parseInline, currentWeek, pct, taskIds, searchPlan, daysUntil, mergeStates, sameState, resetState, emptyState, buildSchedule, normalizeSchedule, hasData, needsAccountChoice, DEFAULT_SCHEDULE, hoursPerWeek, fmtRange } from './lib.js'
import { syncOnce } from './sync.js'
import { SOURCES } from './data/sources.js'
import { validFirebaseConfig, loadFirebaseConfig, mergeWithRemote, encodeState, decodeState, describeSyncError } from './sync-cloud.js'
import plan from './data/plan.json'

describe('parseInline', () => {
  it('splits bold, code and links', () => {
    const p = parseInline('**Mon:** run `pytest` see [[LINK https://x.dev|docs]].')
    expect(p.map((x) => x.t)).toEqual(['b', 's', 'c', 's', 'a', 's'])
    expect(p[4]).toMatchObject({ v: 'docs', url: 'https://x.dev' })
  })
})

describe('schedule', () => {
  const starts = (s) => s.weeks.map((w) => w.start)
  it('default settings reproduce the original calendar', () => {
    const s = buildSchedule(undefined)
    expect(starts(s)).toEqual(['2026-11-03', '2026-11-09', '2026-11-16', '2026-11-23', '2026-11-30', '2026-12-07', '2026-12-14', '2027-01-04', '2027-01-11', '2027-01-18', '2027-01-25', '2027-02-01'])
    expect(s.end).toBe('2027-02-07')
    expect(s.hours).toBe(5)
  })
  it('moving the start date moves everything', () => {
    const s = buildSchedule({ start: '2026-11-09', weeksPer: 1, breaks: [] })
    expect(starts(s)[0]).toBe('2026-11-09'); expect(starts(s)[11]).toBe('2027-01-25'); expect(s.end).toBe('2027-01-31')
  })
  it('a slower pace stretches the plan', () => {
    const s = buildSchedule({ start: '2026-11-02', weeksPer: 2, breaks: [] })
    expect(starts(s).slice(0, 3)).toEqual(['2026-11-02', '2026-11-16', '2026-11-30'])
    expect(s.hours).toBe(2.5)
  })
  it('a faster pace uses half-week windows without drifting', () => {
    const s = buildSchedule({ start: '2026-11-02', weeksPer: 0.5, breaks: [] })
    expect(s.weeks[11].end > s.weeks[10].end).toBe(true)
    expect(s.weeks.every((w) => w.end >= w.start)).toBe(true)
    expect(s.hours).toBe(10)
  })
  it('a break pushes later weeks and never starts a week on a break or weekend', () => {
    const s = buildSchedule({ start: '2026-11-02', weeksPer: 1, breaks: [{ start: '2026-11-10', end: '2026-11-23' }] })
    expect(s.weeks[1].start).toBe('2026-11-09') // week 2 begins before the break and runs through it
    expect(s.weeks[1].breakDays).toBeGreaterThan(0)
    s.weeks.forEach((w) => { expect(w.start >= '2026-11-10' && w.start <= '2026-11-23').toBe(false) })
    expect(s.weeks[2].start > '2026-11-23').toBe(true)
  })
  it('bad settings fall back safely', () => {
    expect(normalizeSchedule(null)).toEqual(DEFAULT_SCHEDULE)
    const n = normalizeSchedule({ start: 'nope', weeksPer: 7, breaks: [{ start: '2026-02-30', end: '2026-03-01' }, { start: '2026-12-05', end: '2026-12-01' }] })
    expect(n).toEqual({ start: DEFAULT_SCHEDULE.start, weeksPer: 1, breaks: [] })
  })
  it('currentWeek follows the schedule', () => {
    const s = buildSchedule(undefined)
    expect(currentWeek(s, new Date(2026, 10, 3, 12))).toBe(1)
    expect(currentWeek(s, new Date(2026, 10, 12, 12))).toBe(2)
    expect(currentWeek(s, new Date(2026, 11, 25, 12))).toBe(8) // during the break -> next week
    expect(currentWeek(s, new Date(2026, 9, 1, 12))).toBe(1)
    expect(currentWeek(s, new Date(2027, 5, 1, 12))).toBe(12)
  })
  it('helpers', () => { expect(hoursPerWeek(2)).toBe(2.5); expect(fmtRange('2026-11-03', '2026-11-08')).toBe('Nov 3 – Nov 8') })
})

describe('schedule settings sync', () => {
  const cfg1 = { start: '2026-11-10', weeksPer: 1, breaks: [] }
  it('newest schedule edit wins and reset keeps it', () => {
    const a = { ...emptyState(), settings: { schedule: cfg1 }, ts: { 's:schedule': 5 } }
    const b = { ...emptyState(), settings: { schedule: { ...cfg1, weeksPer: 2 } }, ts: { 's:schedule': 9 } }
    expect(mergeStates(a, b).settings.schedule.weeksPer).toBe(2)
    expect(resetState(a, 100).settings.schedule).toEqual(cfg1)
    expect(resetState(a, 100).ts['s:schedule']).toBe(5)
  })
  it('clearing the schedule (back to default) propagates', () => {
    const a = { ...emptyState(), settings: { schedule: cfg1 }, ts: { 's:schedule': 5 } }
    const cleared = { ...emptyState(), ts: { 's:schedule': 9 } }
    expect(mergeStates(a, cleared).settings.schedule).toBeUndefined()
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

describe('google/firebase sync logic', () => {
  const good = { apiKey: 'k', authDomain: 'p.firebaseapp.com', projectId: 'p', appId: '1:2:web:3' }
  const res = (body, ok = true) => async () => ({ ok, text: async () => body })
  it('validates the config and rejects placeholders', () => {
    expect(validFirebaseConfig(good)).toBe(true)
    expect(validFirebaseConfig({ ...good, apiKey: 'YOUR_API_KEY' })).toBe(false)
    expect(validFirebaseConfig({ ...good, appId: '' })).toBe(false)
    expect(validFirebaseConfig(null)).toBe(false)
  })
  it('loads the config only when the file is real JSON with real values', async () => {
    expect(await loadFirebaseConfig(res(JSON.stringify(good)), 'https://x.github.io/app/')).toEqual(good)
    expect(await loadFirebaseConfig(res('', false), 'https://x.github.io/app/')).toBeNull()
    expect(await loadFirebaseConfig(res('<!doctype html><html>'), 'https://x.github.io/app/')).toBeNull() // host returned the index page
    expect(await loadFirebaseConfig(res(JSON.stringify({ ...good, apiKey: 'YOUR_API_KEY' })), 'https://x.github.io/app/')).toBeNull()
    expect(await loadFirebaseConfig(async () => { throw new Error('offline') }, 'https://x.github.io/app/')).toBeNull()
  })
  it('first sync creates the cloud copy', () => {
    const local = S({ x: true }, {}, { 'c:x': 1 })
    const r = mergeWithRemote(local, undefined)
    expect(r.push).toBe(true); expect(r.merged.checked).toEqual({ x: true })
  })
  it('does not write when the cloud copy is already up to date', () => {
    const local = S({ x: true }, {}, { 'c:x': 1 })
    expect(mergeWithRemote(local, encodeState(local)).push).toBe(false)
  })
  it('merges a newer cloud copy and writes back only what is missing', () => {
    const local = S({ x: true }, {}, { 'c:x': 5 })
    const remote = S({ y: true }, { w1: 'n' }, { 'c:y': 9, 'n:w1': 9 })
    const r = mergeWithRemote(local, encodeState(remote))
    expect(r.merged.checked).toEqual({ x: true, y: true }); expect(r.merged.notes.w1).toBe('n'); expect(r.push).toBe(true)
    expect(mergeWithRemote(r.merged, encodeState(r.merged)).push).toBe(false)
  })
  it('two devices that sync in turn converge to the same state', () => {
    const a = S({ a: true }, {}, { 'c:a': 3 }), b = S({ b: true }, {}, { 'c:b': 4 })
    const cloud1 = mergeWithRemote(a, undefined).merged
    const bMerged = mergeWithRemote(b, encodeState(cloud1)).merged
    const aMerged = mergeWithRemote(a, encodeState(bMerged)).merged
    expect(sameState(aMerged, bMerged)).toBe(true); expect(aMerged.checked).toEqual({ a: true, b: true })
  })
  it('rejects a corrupt cloud copy instead of overwriting it', () => {
    expect(() => decodeState('not json')).toThrow(/not valid JSON/)
    expect(() => mergeWithRemote(emptyState(), '{oops')).toThrow()
  })
  it('explains common Google errors', () => {
    expect(describeSyncError({ code: 'auth/unauthorized-domain' })).toMatch(/Authorized domains/)
    expect(describeSyncError({ code: 'permission-denied' })).toMatch(/security rules/)
    expect(describeSyncError({ code: 'auth/popup-blocked' })).toMatch(/popup/)
    expect(describeSyncError(new Error('boom'))).toBe('boom')
  })
})

describe('account switching on a shared browser', () => {
  const data = S({ x: true }, {}, { 'c:x': 1 })
  it('detects local data', () => { expect(hasData(emptyState())).toBe(false); expect(hasData(data)).toBe(true); expect(hasData(S({}, {}, {}))).toBe(false) })
  it('asks only when a different account meets existing local data', () => {
    expect(needsAccountChoice('uidA', 'uidB', data)).toBe(true)
    expect(needsAccountChoice('uidA', 'uidA', data)).toBe(false)   // same person again
    expect(needsAccountChoice(null, 'uidB', data)).toBe(false)     // offline progress before ever signing in
    expect(needsAccountChoice('uidA', 'uidB', emptyState())).toBe(false) // nothing to leak
  })
})
