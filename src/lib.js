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
    if (s && typeof s === 'object') return { checked: s.checked || {}, notes: s.notes || {}, dates: s.dates || {} }
  } catch { /* storage unavailable or corrupt: start fresh */ }
  return { checked: {}, notes: {}, dates: {} }
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
