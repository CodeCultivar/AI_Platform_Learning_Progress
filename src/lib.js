import plan from './data/plan.json'

export const STORE_KEY = 'ai-platform-plan-progress-v1'

// Every checkable thing in the plan gets a stable id.
export function taskIds() {
  const ids = []
  plan.kickoff.steps.forEach((_, i) => ids.push(`k${i}`))
  ids.push('k-done')
  plan.weeks.forEach((w) => {
    w.steps.forEach((_, i) => ids.push(`w${w.n}-s${i}`))
    ids.push(`w${w.n}-done`)
  })
  return ids
}

export function weekTaskIds(w) {
  return [...w.steps.map((_, i) => `w${w.n}-s${i}`), `w${w.n}-done`]
}
export const kickoffIds = () => [...plan.kickoff.steps.map((_, i) => `k${i}`), 'k-done']

export function pct(ids, checked) {
  if (!ids.length) return 0
  return Math.round((ids.filter((id) => checked[id]).length / ids.length) * 100)
}

export function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY))
    if (s && typeof s === 'object') return normalizeState(s)
  } catch { /* storage unavailable or corrupt: start fresh */ }
  return emptyState()
}
export const emptyState = () => ({ checked: {}, notes: {}, dates: {}, settings: {}, ts: {} })
export const normalizeState = (s) => ({ checked: s?.checked || {}, notes: s?.notes || {}, dates: s?.dates || {}, settings: s?.settings || {}, ts: s?.ts || {} })

// ---- sync support -------------------------------------------------------
// Every edit is stamped: ts["c:<taskId>"] / ts["n:<noteKey>"] = epoch ms. Merging keeps the newer
// edit per item, so two devices that edit different things never overwrite each other, and an
// un-check is remembered (a timestamp with no value) instead of being resurrected by the other side.
const hasValue = (st, k) => (k[0] === 'c' ? !!st.checked[k.slice(2)] : k[0] === 'n' ? !!st.notes[k.slice(2)] : !!st.settings[k.slice(2)])
const stamp = (st, k) => st.ts[k] ?? (hasValue(st, k) ? 1 : 0) // legacy data without stamps counts as old

export function mergeStates(a, b) {
  a = normalizeState(a); b = normalizeState(b)
  const out = emptyState()
  const keys = new Set([
    ...Object.keys(a.ts), ...Object.keys(b.ts),
    ...Object.keys(a.checked).map((i) => 'c:' + i), ...Object.keys(b.checked).map((i) => 'c:' + i),
    ...Object.keys(a.notes).map((i) => 'n:' + i), ...Object.keys(b.notes).map((i) => 'n:' + i),
    ...Object.keys(a.settings).map((i) => 's:' + i), ...Object.keys(b.settings).map((i) => 's:' + i),
  ])
  for (const k of keys) {
    const ta = stamp(a, k), tb = stamp(b, k)
    if (ta === 0 && tb === 0) continue
    const src = tb > ta ? b : a
    const id = k.slice(2)
    out.ts[k] = Math.max(ta, tb)
    if (k[0] === 'c') {
      if (src.checked[id]) { out.checked[id] = true; if (src.dates[id]) out.dates[id] = src.dates[id] }
    } else if (k[0] === 'n') { if (src.notes[id]) out.notes[id] = src.notes[id] }
    else if (src.settings[id]) out.settings[id] = src.settings[id]
  }
  return out
}

// True if this browser holds any progress, notes or schedule.
export const hasData = (s) => { const n = normalizeState(s); return Object.keys(n.checked).length > 0 || Object.keys(n.notes).length > 0 || Object.keys(n.settings).length > 0 }
// On a shared computer, a different Google account must not silently inherit the previous person's local data.
export const needsAccountChoice = (lastUid, uid, st) => !!lastUid && !!uid && lastUid !== uid && hasData(st)

const stable = (o) => JSON.stringify(o, (_, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([x], [y]) => (x < y ? -1 : 1))) : v))
export const sameState = (a, b) => stable(normalizeState(a)) === stable(normalizeState(b))

// Clearing everything must also sync, so reset stamps each item as "emptied now".
export function resetState(st, now = Date.now()) {
  const out = emptyState()
  out.settings = { ...st.settings } // Reset clears progress and notes, not your schedule
  const keys = new Set([...Object.keys(st.ts), ...Object.keys(st.checked).map((i) => 'c:' + i), ...Object.keys(st.notes).map((i) => 'n:' + i)])
  keys.forEach((k) => { out.ts[k] = k[0] === 's' ? st.ts[k] : now })
  return out
}
export function saveState(s) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

// ---- schedule -----------------------------------------------------------
// Dates are never stored in the plan. They are computed from the user's settings:
// a start date, how many calendar weeks each plan week gets, and any break periods.
export const DEFAULT_SCHEDULE = { start: '2026-11-03', weeksPer: 1, breaks: [{ start: '2026-12-21', end: '2027-01-02' }] }
export const PACE_OPTIONS = [0.5, 1, 1.5, 2, 3, 4]

const DAY = 86400000
const toMs = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))
const toIso = (ms) => new Date(ms).toISOString().slice(0, 10)
export const addDays = (iso, n) => toIso(toMs(iso) + n * DAY)
const dow = (iso) => new Date(toMs(iso)).getUTCDay() // 0 = Sunday
export const isIso = (x) => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) && toIso(toMs(x)) === x
export const localIso = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function normalizeSchedule(c) {
  if (!c) return DEFAULT_SCHEDULE
  const wp = Number(c.weeksPer)
  const h = Number(c.hours)
  return {
    start: isIso(c.start) ? c.start : DEFAULT_SCHEDULE.start,
    weeksPer: PACE_OPTIONS.includes(wp) ? wp : 1,
    ...(Number.isFinite(h) && h >= 1 && h <= 40 ? { hours: Math.round(h * 2) / 2 } : {}), // hours a week the person said they have
    breaks: (Array.isArray(c.breaks) ? c.breaks : []).filter((b) => isIso(b?.start) && isIso(b?.end) && b.start <= b.end).slice(0, 12).map((b) => ({ start: b.start, end: b.end })),
  }
}
// The fastest pace whose weekly load fits in the hours a person has (the slowest pace if even that is too much).
export const paceForHours = (h) => PACE_OPTIONS.find((p) => 50 / p / 10 <= h + 1e-9) ?? PACE_OPTIONS[PACE_OPTIONS.length - 1]
export const hoursPerWeek = (weeksPer) => Math.round(50 / weeksPer) / 10 // the plan is designed for 5 hours a week

export function buildSchedule(cfg, n = plan.weeks.length) {
  const c = normalizeSchedule(cfg)
  const whole = Number.isInteger(c.weeksPer)
  const inBreak = (iso) => c.breaks.find((b) => iso >= b.start && iso <= b.end)
  const breakDaysIn = (a, b) => { let k = 0; for (let d = a; d <= b; d = addDays(d, 1)) if (inBreak(d)) k++; return k }
  const sundayOnOrAfter = (iso) => addDays(iso, (7 - dow(iso)) % 7)
  const weeks = []
  let cursor = c.start
  for (let i = 1; i <= n; i++) {
    // jump past breaks and weekends so a week never starts on a break day or a weekend (except day 1)
    for (let g = 0; g < 60; g++) {
      const b = inBreak(cursor)
      if (b) { cursor = addDays(b.end, 1); continue }
      if (i > 1 && (dow(cursor) === 0 || dow(cursor) === 6)) { cursor = addDays(cursor, dow(cursor) === 6 ? 2 : 1); continue }
      break
    }
    const nominal = whole ? addDays(sundayOnOrAfter(cursor), 7 * (c.weeksPer - 1)) : addDays(cursor, Math.round(c.weeksPer * 7) - 1)
    let extra = 0, end = nominal
    for (let g = 0; g < 20; g++) {
      end = addDays(nominal, extra)
      if (whole) end = sundayOnOrAfter(end)
      const bd = breakDaysIn(cursor, end)
      if (bd <= extra) break
      extra = bd
    }
    weeks.push({ n: i, start: cursor, end, breakDays: breakDaysIn(cursor, end) })
    cursor = addDays(end, 1)
  }
  return { weeks, start: weeks[0].start, end: weeks[weeks.length - 1].end, config: c, hours: hoursPerWeek(c.weeksPer) }
}

// Which plan week is "now"? Before the start -> 1; after the end -> last; in a gap/break -> the next week.
export function currentWeek(sched, today = new Date()) {
  const t = localIso(today)
  const w = sched.weeks
  if (t < w[0].start) return 1
  const hit = w.find((x) => t >= x.start && t <= x.end)
  if (hit) return hit.n
  const next = w.find((x) => x.start > t)
  return next ? next.n : w[w.length - 1].n
}

const fmt = (iso, o) => new Date(toMs(iso)).toLocaleDateString('en-US', { timeZone: 'UTC', ...o })
export const fmtDay = (iso) => fmt(iso, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
export const fmtShort = (iso) => fmt(iso, { month: 'short', day: 'numeric' })
export function fmtRange(a, b) {
  return a.slice(0, 4) === b.slice(0, 4) ? `${fmtShort(a)} – ${fmtShort(b)}` : `${fmtShort(a)}, ${a.slice(0, 4)} – ${fmtShort(b)}, ${b.slice(0, 4)}`
}

export function daysUntil(iso, today = new Date()) {
  const a = new Date(iso + 'T00:00:00')
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((a - b) / 86400000)
}

// Inline markup used by the plan text: **bold**, `code`, [[LINK url|label]]
const TOKEN = /(\*\*.+?\*\*|`[^`]+`|\[\[LINK .+?\|.+?\]\])/g
export function parseInline(text) {
  return text.split(TOKEN).filter(Boolean).map((part) => {
    if (part.startsWith('**')) return { t: 'b', v: part.slice(2, -2) }
    if (part.startsWith('`')) return { t: 'c', v: part.slice(1, -1) }
    if (part.startsWith('[[LINK ')) {
      const [url, label] = part.slice(7, -2).split('|')
      return { t: 'a', v: label, url }
    }
    return { t: 's', v: part }
  })
}

export function plainText(text) {
  return parseInline(text).map((p) => p.v).join('')
}

export function searchPlan(q) {
  const needle = q.trim().toLowerCase()
  if (needle.length < 2) return []
  const hits = []
  const test = (s) => plainText(s).toLowerCase().includes(needle)
  plan.kickoff.steps.forEach((s, i) => {
    if (test(s.label + ' ' + s.text)) hits.push({ kind: 'Kickoff', title: s.label, text: s.text, to: '#/kickoff' })
  })
  plan.weeks.forEach((w) => {
    if (test(w.title + ' ' + w.summary)) hits.push({ kind: `Week ${w.n}`, title: w.topic, text: w.summary, to: `#/week/${w.n}` })
    w.steps.forEach((s) => {
      if (test(s.label + ' ' + s.text)) hits.push({ kind: `Week ${w.n}`, title: s.label, text: s.text, to: `#/week/${w.n}` })
    })
  })
  plan.links.forEach((l) => {
    if (test(l.label + ' ' + l.use + ' ' + l.url)) hits.push({ kind: 'Link', title: l.label, text: l.use, to: '#/links' })
  })
  ;[plan.changed, plan.rules, plan.after].forEach((sec) => {
    sec.blocks.forEach((b) => {
      const texts = b.t === 'ul' ? b.items : [b.text]
      texts.forEach((x) => {
        if (test(x)) hits.push({ kind: 'Guide', title: sec.title, text: x, to: sec === plan.after ? '#/after' : '#/guide' })
      })
    })
  })
  return hits.slice(0, 30)
}
