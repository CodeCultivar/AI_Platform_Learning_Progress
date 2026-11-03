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
export const emptyState = () => ({ checked: {}, notes: {}, dates: {}, ts: {} })
export const normalizeState = (s) => ({ checked: s?.checked || {}, notes: s?.notes || {}, dates: s?.dates || {}, ts: s?.ts || {} })

// ---- sync support -------------------------------------------------------
// Every edit is stamped: ts["c:<taskId>"] / ts["n:<noteKey>"] = epoch ms. Merging keeps the newer
// edit per item, so two devices that edit different things never overwrite each other, and an
// un-check is remembered (a timestamp with no value) instead of being resurrected by the other side.
const hasValue = (st, k) => (k[0] === 'c' ? !!st.checked[k.slice(2)] : !!st.notes[k.slice(2)])
const stamp = (st, k) => st.ts[k] ?? (hasValue(st, k) ? 1 : 0) // legacy data without stamps counts as old

export function mergeStates(a, b) {
  a = normalizeState(a); b = normalizeState(b)
  const out = emptyState()
  const keys = new Set([
    ...Object.keys(a.ts), ...Object.keys(b.ts),
    ...Object.keys(a.checked).map((i) => 'c:' + i), ...Object.keys(b.checked).map((i) => 'c:' + i),
    ...Object.keys(a.notes).map((i) => 'n:' + i), ...Object.keys(b.notes).map((i) => 'n:' + i),
  ])
  for (const k of keys) {
    const ta = stamp(a, k), tb = stamp(b, k)
    if (ta === 0 && tb === 0) continue
    const src = tb > ta ? b : a
    const id = k.slice(2)
    out.ts[k] = Math.max(ta, tb)
    if (k[0] === 'c') {
      if (src.checked[id]) { out.checked[id] = true; if (src.dates[id]) out.dates[id] = src.dates[id] }
    } else if (src.notes[id]) out.notes[id] = src.notes[id]
  }
  return out
}

const stable = (o) => JSON.stringify(o, (_, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([x], [y]) => (x < y ? -1 : 1))) : v))
export const sameState = (a, b) => stable(normalizeState(a)) === stable(normalizeState(b))

// Clearing everything must also sync, so reset stamps each item as "emptied now".
export function resetState(st, now = Date.now()) {
  const out = emptyState()
  const keys = new Set([...Object.keys(st.ts), ...Object.keys(st.checked).map((i) => 'c:' + i), ...Object.keys(st.notes).map((i) => 'n:' + i)])
  keys.forEach((k) => { out.ts[k] = now })
  return out
}
export function saveState(s) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

// Which week is "now"? Before the start -> week 1; break/after -> next week or last.
export function currentWeek(today = new Date()) {
  const t = today.toISOString().slice(0, 10)
  const weeks = plan.weeks
  if (t < weeks[0].start) return weeks[0].n
  for (const w of weeks) {
    if (t <= w.end) return w.n
  }
  // between weeks (weekends, holiday break): the next upcoming week
  const next = weeks.find((w) => w.start > t)
  return next ? next.n : weeks[weeks.length - 1].n
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
