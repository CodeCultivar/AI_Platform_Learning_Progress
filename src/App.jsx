import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import plan from './data/plan.json'
import { Ring } from './components/Inline.jsx'
import { Dashboard, Kickoff, Week, Gates, Links, Guide, After, Search } from './components/Views.jsx'
import SyncPanel from './components/SyncPanel.jsx'
import Home from './components/Home.jsx'
import SchedulePanel from './components/SchedulePanel.jsx'
import { SchedCtx } from './schedule-context.js'
import { loadState, saveState, pct, weekTaskIds, kickoffIds, taskIds, searchPlan, currentWeek, buildSchedule, mergeStates, normalizeState, resetState, sameState } from './lib.js'
import { loadConfig, saveConfig, clearConfig, syncOnce } from './sync.js'

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
  const [cfg, setCfg] = useState(loadConfig)
  const [status, setStatus] = useState({ state: 'off', msg: '', last: null })
  const [showSync, setShowSync] = useState(false)
  const [showSched, setShowSched] = useState(false)
  const stRef = useRef(st); stRef.current = st
  const cfgRef = useRef(cfg); cfgRef.current = cfg
  const busy = useRef(false); const again = useRef(false)

  const runSync = useCallback(async () => {
    const c = cfgRef.current
    if (!c) return
    if (busy.current) { again.current = true; return }
    busy.current = true
    setStatus((x) => ({ ...x, state: 'syncing' }))
    try {
      const r = await syncOnce(c, stRef.current)
      if (r.gistId !== c.gistId) { const n = { ...c, gistId: r.gistId }; saveConfig(n); setCfg(n); cfgRef.current = n }
      // merge into the latest local state: edits made while the request was in flight are kept
      setSt((cur) => { const m = mergeStates(cur, r.state); return sameState(m, cur) ? cur : m })
      setStatus({ state: 'ok', msg: '', last: new Date() })
    } catch (e) {
      setStatus((x) => ({ ...x, state: 'error', msg: e.message || 'sync failed' }))
    } finally {
      busy.current = false
      if (again.current) { again.current = false; runSync() }
    }
  }, [])

  // push shortly after any edit; pull on start, on tab focus and every minute
  useEffect(() => { if (!cfg) return; const t = setTimeout(runSync, 1500); return () => clearTimeout(t) }, [st, cfg, runSync])
  useEffect(() => {
    if (!cfg) return
    const vis = () => document.visibilityState === 'visible' && runSync()
    document.addEventListener('visibilitychange', vis)
    const iv = setInterval(vis, 60000)
    return () => { document.removeEventListener('visibilitychange', vis); clearInterval(iv) }
  }, [cfg, runSync])

  const connect = (token, gistId) => {
    const n = { token, gistId: gistId || '' }
    saveConfig(n); cfgRef.current = n; setCfg(n); setStatus({ state: 'syncing', msg: '', last: null }); runSync()
  }
  const disconnect = () => { clearConfig(); cfgRef.current = null; setCfg(null); setStatus({ state: 'off', msg: '', last: null }); setShowSync(false) }

  useEffect(() => { saveState(st) }, [st])
  useEffect(() => { setMenu(false) }, [hash])

  const toggle = (id) => setSt((s) => {
    const checked = { ...s.checked }
    const dates = { ...s.dates }
    if (checked[id]) { delete checked[id]; delete dates[id] } else { checked[id] = true; dates[id] = new Date().toISOString().slice(0, 10) }
    return { ...s, checked, dates, ts: { ...s.ts, ['c:' + id]: Date.now() } }
  })
  const setNote = (k, v) => setSt((s) => {
    const notes = { ...s.notes }
    if (v) notes[k] = v; else delete notes[k]
    return { ...s, notes, ts: { ...s.ts, ['n:' + k]: Date.now() } }
  })

  const sched = useMemo(() => buildSchedule(st.settings.schedule), [st.settings.schedule])
  const saveSchedule = (cfg) => { setSt((s) => ({ ...s, settings: { ...s.settings, schedule: cfg }, ts: { ...s.ts, 's:schedule': Date.now() } })); setShowSched(false) }
  const results = useMemo(() => searchPlan(q), [q])
  const route = hash.replace(/^#\/?/, '').split('/')
  const cw = currentWeek(sched)
  const total = pct(taskIds(), st.checked)

  const exportData = () => {
    const blob = new Blob([JSON.stringify(st, null, 2)], { type: 'application/json' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'ai-plan-progress.json' })
    a.click(); URL.revokeObjectURL(a.href)
  }
  const importData = (e) => {
    const f = e.target.files[0]; if (!f) return
    f.text().then((t) => {
      try { const d = normalizeState(JSON.parse(t)); setSt((cur) => mergeStates(cur, d)) } catch { alert('That file is not a valid progress export.') }
    })
    e.target.value = ''
  }
  const reset = () => { if (confirm('Clear all progress and notes in this browser? Export first if you want a backup.')) setSt((cur) => resetState(cur)) }

  let view
  if (q.trim().length > 0) view = <Search results={results} q={q} />
  else if (route[0] === 'kickoff') view = <Kickoff st={st} toggle={toggle} setNote={setNote} />
  else if (route[0] === 'week') view = <Week n={Number(route[1])} st={st} toggle={toggle} setNote={setNote} />
  else if (route[0] === 'gates') view = <Gates st={st} toggle={toggle} />
  else if (route[0] === 'links') view = <Links />
  else if (route[0] === 'guide') view = <Guide />
  else if (route[0] === 'after') view = <After />
  else if (route[0] === 'dashboard') view = <Dashboard st={st} toggle={toggle} onSchedule={() => setShowSched(true)} />
  else view = <Home onSchedule={() => setShowSched(true)} />

  const active = (r) => (route[0] === r ? 'active' : '')
  const isWeek = (n) => route[0] === 'week' && Number(route[1]) === n

  return (
    <SchedCtx.Provider value={sched}>
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      <button className="menu-btn" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Toggle navigation">☰ <span>{total}% done</span></button>
      <aside className={`side ${menu ? 'open' : ''}`}>
        <a className="brand" href="#/" onClick={() => setQ('')}><span className="logo">✓</span><span>90-Day AI Platform<small>{total}% complete</small></span></a>
        <input className="field" type="search" placeholder="Search the plan…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the plan" />
        <nav>
          <a className={route[0] === '' || route[0] === undefined ? 'active' : ''} href="#/" onClick={() => setQ('')}>Home</a>
          <a className={active('dashboard')} href="#/dashboard" onClick={() => setQ('')}>Dashboard</a>
          <a className={active('kickoff')} href="#/kickoff" onClick={() => setQ('')}>
            Kickoff · day 1 <em>{pct(kickoffIds(), st.checked)}%</em>
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
          <a className={active('guide')} href="#/guide" onClick={() => setQ('')}>Rules & structure</a>
          <a className={active('after')} href="#/after" onClick={() => setQ('')}>After the 90 days</a>
        </nav>
        <div className="tools">
          <button onClick={exportData}>Export</button>
          <button onClick={() => fileRef.current.click()}>Import</button>
          <button onClick={reset} className="danger">Reset</button>
          <button className="sync-btn" onClick={() => setShowSched(true)}>Schedule · {sched.hours} h/week</button>
          <button className={`sync-btn ${status.state}`} onClick={() => setShowSync(true)}>{cfg ? (status.state === 'error' ? 'Sync problem' : status.state === 'syncing' ? 'Syncing…' : 'Synced ✓') : 'Sync devices'}</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
          <p>{cfg ? 'Progress syncs through your private gist.' : 'Progress is saved in this browser. Turn on Sync to share it across devices.'}</p>
        </div>
      </aside>
      <main id="main">{view}</main>
      {showSched && <SchedulePanel value={st.settings.schedule} onSave={saveSchedule} onClose={() => setShowSched(false)} />}
      {showSync && <SyncPanel cfg={cfg} status={status} onConnect={connect} onDisconnect={disconnect} onSyncNow={runSync} onClose={() => setShowSync(false)} />}
    </div>
    </SchedCtx.Provider>
  )
}
