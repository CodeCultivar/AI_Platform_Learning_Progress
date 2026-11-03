import { useEffect, useMemo, useRef, useState } from 'react'
import plan from './data/plan.json'
import { Ring } from './components/Inline.jsx'
import { Dashboard, Kickoff, Week, Gates, Links, Guide, After, Search } from './components/Views.jsx'
import { loadState, saveState, pct, weekTaskIds, kickoffIds, taskIds, searchPlan, currentWeek } from './lib.js'

function useHash() {
  const [h, setH] = useState(window.location.hash || '#/')
  useEffect(() => {
    const f = () => { setH(window.location.hash || '#/'); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return h
}

export default function App() {
  const hash = useHash()
  const [st, setSt] = useState(loadState)
  const [q, setQ] = useState('')
  const [menu, setMenu] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => { saveState(st) }, [st])
  useEffect(() => { setMenu(false) }, [hash])

  const toggle = (id) => setSt((s) => {
    const checked = { ...s.checked }
    const dates = { ...s.dates }
    if (checked[id]) { delete checked[id]; delete dates[id] } else { checked[id] = true; dates[id] = new Date().toISOString().slice(0, 10) }
    return { ...s, checked, dates }
  })
  const setNote = (k, v) => setSt((s) => ({ ...s, notes: { ...s.notes, [k]: v } }))

  const results = useMemo(() => searchPlan(q), [q])
  const route = hash.replace(/^#\/?/, '').split('/')
  const cw = currentWeek()
  const total = pct(taskIds(), st.checked)

  const exportData = () => {
    const blob = new Blob([JSON.stringify(st, null, 2)], { type: 'application/json' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'ai-plan-progress.json' })
    a.click(); URL.revokeObjectURL(a.href)
  }
  const importData = (e) => {
    const f = e.target.files[0]; if (!f) return
    f.text().then((t) => {
      try { const d = JSON.parse(t); setSt({ checked: d.checked || {}, notes: d.notes || {}, dates: d.dates || {} }) } catch { alert('That file is not a valid progress export.') }
    })
    e.target.value = ''
  }
  const reset = () => { if (confirm('Clear all progress and notes in this browser? Export first if you want a backup.')) setSt({ checked: {}, notes: {}, dates: {} }) }

  let view
  if (q.trim().length > 0) view = <Search results={results} q={q} />
  else if (route[0] === 'kickoff') view = <Kickoff st={st} toggle={toggle} setNote={setNote} />
  else if (route[0] === 'week') view = <Week n={Number(route[1])} st={st} toggle={toggle} setNote={setNote} />
  else if (route[0] === 'gates') view = <Gates st={st} toggle={toggle} />
  else if (route[0] === 'links') view = <Links />
  else if (route[0] === 'guide') view = <Guide />
  else if (route[0] === 'after') view = <After />
  else view = <Dashboard st={st} toggle={toggle} />

  const active = (r) => (route[0] === r ? 'active' : '')
  const isWeek = (n) => route[0] === 'week' && Number(route[1]) === n

  return (
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      <button className="menu-btn" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Toggle navigation">☰ <span>{total}% done</span></button>
      <aside className={`side ${menu ? 'open' : ''}`}>
        <a className="brand" href="#/" onClick={() => setQ('')}><span className="logo">✓</span><span>90-Day AI Platform<small>{total}% complete</small></span></a>
        <input className="field" type="search" placeholder="Search the plan…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the plan" />
        <nav>
          <a className={route[0] === '' || route[0] === undefined ? 'active' : ''} href="#/" onClick={() => setQ('')}>Dashboard</a>
          <a className={active('kickoff')} href="#/kickoff" onClick={() => setQ('')}>
            Kickoff · tonight <em>{pct(kickoffIds(), st.checked)}%</em>
          </a>
          <p className="nav-h">Weeks</p>
          {plan.weeks.map((w) => (
            <a key={w.n} className={`${isWeek(w.n) ? 'active' : ''} ${w.n === cw ? 'now' : ''}`} href={`#/week/${w.n}`} onClick={() => setQ('')}>
              <span>{w.n}. {w.topic[0].toUpperCase() + w.topic.slice(1)}</span>
              <Ring value={pct(weekTaskIds(w), st.checked)} size={26} />
            </a>
          ))}
          <p className="nav-h">Reference</p>
          <a className={active('gates')} href="#/gates" onClick={() => setQ('')}>Gates</a>
          <a className={active('links')} href="#/links" onClick={() => setQ('')}>All links</a>
          <a className={active('guide')} href="#/guide" onClick={() => setQ('')}>Rules & changes</a>
          <a className={active('after')} href="#/after" onClick={() => setQ('')}>After the 90 days</a>
        </nav>
        <div className="tools">
          <button onClick={exportData}>Export</button>
          <button onClick={() => fileRef.current.click()}>Import</button>
          <button onClick={reset} className="danger">Reset</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
          <p>Progress is saved in this browser. Export to back it up or move devices.</p>
        </div>
      </aside>
      <main id="main">{view}</main>
    </div>
  )
}
