import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ACTIVE as P } from './plans.js'
import { PlanCtx } from './plan-context.js'
import { Tests } from './components/Quiz.jsx'
import HomeDE from './components/HomeDE.jsx'
import { quizProgress } from './quiz.js'
import { Ring } from './components/Inline.jsx'
import { Dashboard, Kickoff, Week, Gates, Links, Guide, After, Search } from './components/Views.jsx'
import SyncPanel from './components/SyncPanel.jsx'
import Home from './components/Home.jsx'
import SchedulePanel from './components/SchedulePanel.jsx'
import AccountChoice from './components/AccountChoice.jsx'
import { SchedCtx } from './schedule-context.js'
import { loadState, saveState, pct, weekTaskIds, kickoffIds, taskIds, searchPlan, currentWeek, buildSchedule, mergeStates, normalizeState, resetPlanState, sameState, emptyState, needsAccountChoice } from './lib.js'
import { loadConfig, saveConfig, clearConfig, syncOnce } from './sync.js'
import { loadFirebaseConfig, initCloud, describeSyncError, isQuietAuthError } from './sync-cloud.js'

const LAST_UID = 'ai-platform-plan-last-uid'
const plan = P.plan

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
  const [cfg, setCfg] = useState(loadConfig) // GitHub gist sync settings
  const [fb, setFb] = useState({ phase: 'loading', config: null, api: null, user: null, error: '' }) // Google / Firebase
  const [status, setStatus] = useState({ state: 'off', msg: '', last: null })
  const [showSync, setShowSync] = useState(false)
  const [showSched, setShowSched] = useState(false)
  const [conflict, setConflict] = useState(null) // a different Google account signed in on a browser holding someone else's data
  const stRef = useRef(st); stRef.current = st
  useEffect(() => { saveState(st) }, [st]) // keep progress in this browser even when sync is off
  const cfgRef = useRef(cfg); cfgRef.current = cfg
  const fbRef = useRef(fb); fbRef.current = fb
  const busy = useRef(false); const again = useRef(false)
  const syncMode = fb.user ? (conflict ? null : 'google') : cfg ? 'gist' : null
  const syncModeRef = useRef(syncMode); syncModeRef.current = syncMode

  // Firebase is only loaded when the site ships a valid firebase-config.json
  useEffect(() => {
    let dead = false; let off = () => {}
    loadFirebaseConfig().then(async (config) => {
      if (dead) return
      if (!config) { setFb((f) => ({ ...f, phase: 'unconfigured' })); return }
      try {
        const api = await initCloud(config)
        if (dead) return
        setFb((f) => ({ ...f, phase: 'ready', config, api }))
        off = api.onUser((user) => setFb((f) => ({ ...f, user })))
      } catch (e) { setFb((f) => ({ ...f, phase: 'error', error: describeSyncError(e) })) }
    })
    return () => { dead = true; off() }
  }, [])

  // remember which account this browser's data belongs to, and ask before mixing two people's data
  useEffect(() => {
    if (!fb.user) { setConflict(null); return }
    let last = null
    try { last = localStorage.getItem(LAST_UID) } catch { /* storage blocked */ }
    if (needsAccountChoice(last, fb.user.uid, stRef.current)) { setShowSync(false); setConflict(fb.user) }
    else { try { localStorage.setItem(LAST_UID, fb.user.uid) } catch { /* ignore */ } }
  }, [fb.user])
  const settleAccount = (fresh) => {
    if (fresh) setSt(emptyState())
    try { localStorage.setItem(LAST_UID, conflict.uid) } catch { /* ignore */ }
    setConflict(null)
  }

  // signing in with Google replaces the gist connection so two syncs never run side by side (local data is kept)
  useEffect(() => { if (fb.user && cfg) { clearConfig(); setCfg(null) } }, [fb.user, cfg])

  const runSync = useCallback(async () => {
    const mode = syncModeRef.current
    if (!mode) return
    if (busy.current) { again.current = true; return }
    busy.current = true
    setStatus((x) => ({ ...x, state: 'syncing' }))
    try {
      let merged
      if (mode === 'google') {
        merged = (await fbRef.current.api.syncOnce(stRef.current)).state
      } else {
        const c = cfgRef.current
        const r = await syncOnce(c, stRef.current)
        if (r.gistId !== c.gistId) { const n = { ...c, gistId: r.gistId }; saveConfig(n); setCfg(n); cfgRef.current = n }
        merged = r.state
      }
      // merge into the latest local state: edits made while the request was in flight are kept
      setSt((cur) => { const m = mergeStates(cur, merged); return sameState(m, cur) ? cur : m })
      setStatus({ state: 'ok', msg: '', last: new Date() })
    } catch (e) {
      setStatus((x) => ({ ...x, state: 'error', msg: mode === 'google' ? describeSyncError(e) : e.message || 'sync failed' }))
    } finally {
      busy.current = false
      if (again.current) { again.current = false; runSync() }
    }
  }, [])

  // push shortly after any edit; pull on start, on tab focus and every minute
  useEffect(() => { if (!syncMode) return; const t = setTimeout(runSync, 1500); return () => clearTimeout(t) }, [st, syncMode, runSync])
  useEffect(() => {
    if (!syncMode) return
    const vis = () => document.visibilityState === 'visible' && runSync()
    document.addEventListener('visibilitychange', vis)
    const iv = setInterval(vis, 60000)
    return () => { document.removeEventListener('visibilitychange', vis); clearInterval(iv) }
  }, [syncMode, runSync])

  // Google only: pull edits from other devices the moment they land
  useEffect(() => {
    if (syncMode !== 'google') return
    return fb.api.subscribe(
      (remote) => setSt((cur) => { const m = mergeStates(cur, remote); return sameState(m, cur) ? cur : m }),
      (e) => setStatus((x) => ({ ...x, state: 'error', msg: describeSyncError(e) })),
    )
  }, [syncMode, fb.api])

  const connect = (token, gistId) => {
    const n = { token, gistId: gistId || '' }
    saveConfig(n); cfgRef.current = n; syncModeRef.current = 'gist'; setCfg(n); setStatus({ state: 'syncing', msg: '', last: null }); runSync()
  }
  const disconnect = () => { clearConfig(); cfgRef.current = null; setCfg(null); setStatus({ state: 'off', msg: '', last: null }) }
  const googleSignIn = async () => {
    setStatus({ state: 'syncing', msg: '', last: null })
    try { await fb.api.signIn(); setStatus({ state: 'syncing', msg: '', last: null }) } catch (e) {
      setStatus(isQuietAuthError(e) ? { state: 'off', msg: '', last: null } : { state: 'error', msg: describeSyncError(e), last: null })
    }
  }
  const googleSignOut = async () => { try { await fb.api.signOut() } finally { setStatus({ state: 'off', msg: '', last: null }) } }
  // erase this account's cloud copy, then sign out so auto-sync cannot upload it again
  const googleDelete = async () => {
    try { await fb.api.deleteData(); await fb.api.signOut(); setStatus({ state: 'off', msg: '', last: null }) }
    catch (e) { setStatus({ state: 'error', msg: describeSyncError(e), last: null }) }
  }
  const statusLabel = status.state === 'error' ? 'Sync problem' : status.state === 'syncing' ? 'Syncing…' : 'Synced ✓'

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

  const sched = useMemo(() => buildSchedule(st.settings[P.settingKey], plan.weeks.length, P.defaultSchedule), [st.settings[P.settingKey]])
  const saveSchedule = (cfg) => { setSt((s) => ({ ...s, settings: { ...s.settings, [P.settingKey]: cfg }, ts: { ...s.ts, ['s:' + P.settingKey]: Date.now() } })); setShowSched(false) }
  const results = useMemo(() => searchPlan(q, { plan, base: P.base }), [q])
  const route = hash.replace(/^#\/?/, '').split('/')
  const cw = currentWeek(sched)
  const total = pct(taskIds(plan, P.idp), st.checked)
  const quizzes = quizProgress(st.notes, P.id, plan.weeks.map((w) => w.n))
  useEffect(() => { document.title = P.brand + ' progress' }, [])

  const exportData = () => {
    const blob = new Blob([JSON.stringify(st, null, 2)], { type: 'application/json' })
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${P.id}-plan-progress.json` })
    a.click(); URL.revokeObjectURL(a.href)
  }
  const importData = (e) => {
    const f = e.target.files[0]; if (!f) return
    f.text().then((t) => {
      try { const d = normalizeState(JSON.parse(t)); setSt((cur) => mergeStates(cur, d)) } catch { alert('That file is not a valid progress export.') }
    })
    e.target.value = ''
  }
  const reset = () => { if (confirm(`Clear all ${P.short} progress, notes and quiz history in this browser? Your schedule is kept. Export first if you want a backup.`)) setSt((cur) => resetPlanState(cur, P.idp)) }

  let view
  if (q.trim().length > 0) view = <Search results={results} q={q} />
  else if (route[0] === 'kickoff') view = <Kickoff st={st} toggle={toggle} setNote={setNote} />
  else if (route[0] === 'week') view = <Week n={Number(route[1])} st={st} toggle={toggle} setNote={setNote} />
  else if (route[0] === 'tests') view = <Tests st={st} setNote={setNote} />
  else if (route[0] === 'gates') view = <Gates st={st} toggle={toggle} />
  else if (route[0] === 'links') view = <Links />
  else if (route[0] === 'guide') view = <Guide />
  else if (route[0] === 'after') view = <After />
  else if (route[0] === 'dashboard') view = <Dashboard st={st} toggle={toggle} onSchedule={() => setShowSched(true)} />
  else view = P.id === 'de' ? <HomeDE onSchedule={() => setShowSched(true)} canSignIn={fb.phase === 'ready' && !fb.user} onSignIn={googleSignIn} /> : <Home onSchedule={() => setShowSched(true)} canSignIn={fb.phase === 'ready' && !fb.user} onSignIn={googleSignIn} />

  const active = (r) => (route[0] === r ? 'active' : '')
  const isWeek = (n) => route[0] === 'week' && Number(route[1]) === n

  return (
    <PlanCtx.Provider value={P}>
    <SchedCtx.Provider value={sched}>
    <div className="shell">
      <a className="skip" href="#main">Skip to content</a>
      <button className="menu-btn" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Toggle navigation">☰ <span>{total}% done</span></button>
      <aside className={`side ${menu ? 'open' : ''}`}>
        <a className="brand" href="#/" onClick={() => setQ('')}><span className="logo">✓</span><span>{P.brand}<small>{total}% complete</small></span></a>
        <input className="field" type="search" placeholder="Search the plan…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search the plan" />
        <nav>
          <a className={route[0] === '' || route[0] === undefined ? 'active' : ''} href="#/" onClick={() => setQ('')}>Home</a>
          <a className={active('dashboard')} href="#/dashboard" onClick={() => setQ('')}>Dashboard</a>
          <a className={active('kickoff')} href="#/kickoff" onClick={() => setQ('')}>
            {P.copy.kickoffNav} <em>{pct(kickoffIds(plan, P.idp), st.checked)}%</em>
          </a>
          <p className="nav-h">Weeks</p>
          {plan.weeks.map((w) => (
            <a key={w.n} className={`${isWeek(w.n) ? 'active' : ''} ${w.n === cw ? 'now' : ''}`} href={`#/week/${w.n}`} onClick={() => setQ('')}>
              <span>{w.n}. {w.topic[0].toUpperCase() + w.topic.slice(1)}</span>
              <Ring value={pct(weekTaskIds(w, P.idp), st.checked)} size={26} />
            </a>
          ))}
          <p className="nav-h">Reference</p>
          <a className={active('tests')} href="#/tests" onClick={() => setQ('')}>Tests <em>{quizzes.passed}/{quizzes.total}</em></a>
          <a className={active('gates')} href="#/gates" onClick={() => setQ('')}>{P.id === 'de' ? 'Checkpoints' : 'Gates'}</a>
          <a className={active('links')} href="#/links" onClick={() => setQ('')}>All links</a>
          <a className={active('guide')} href="#/guide" onClick={() => setQ('')}>Rules & structure</a>
          <a className={active('after')} href="#/after" onClick={() => setQ('')}>{P.copy.afterNav}</a>
        </nav>
        <div className="tools">
          <button onClick={exportData}>Export</button>
          <button onClick={() => fileRef.current.click()}>Import</button>
          <button onClick={reset} className="danger">Reset</button>
          <button className="sync-btn" onClick={() => setShowSched(true)}>Schedule</button>
          {fb.phase === 'ready' && !fb.user && !cfg && (
            <div className="account">
              <button className="btn" onClick={googleSignIn}>Sign in with Google to sync</button>
              <p>One click. Your progress, notes and schedule then stay in step on every device you sign in on.</p>
              {status.state === 'error' && <p className="sync-status error">{status.msg}</p>}
            </div>
          )}
          {fb.user && <p className="account-line"><b>{fb.user.email}</b></p>}
          <button className={`sync-btn ${status.state}`} onClick={() => setShowSync(true)}>{fb.user ? `Account · ${syncMode ? statusLabel : 'paused'}` : syncMode ? statusLabel : fb.phase === 'ready' ? 'Other sync options' : 'Sync devices'}</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
          <p>{syncMode === 'google' ? 'Progress syncs with your Google account.' : syncMode === 'gist' ? 'Progress syncs through your private gist.' : 'Progress is saved in this browser. Turn on Sync to share it across devices.'}</p>
        </div>
      </aside>
      <main id="main">{view}</main>
      {showSched && <SchedulePanel signedIn={!!fb.user} value={st.settings[P.settingKey]} defaults={P.defaultSchedule} units={plan.weeks.length} parked={st.settings[P.settingKey] ? undefined : P.parkedNote} onSave={saveSchedule} onClose={() => setShowSched(false)} />}
      {showSync && <SyncPanel active={syncMode} status={status} onSyncNow={runSync} onClose={() => setShowSync(false)}
        google={{ phase: fb.phase, user: fb.user, error: fb.error, onSignIn: googleSignIn, onSignOut: googleSignOut, onDelete: googleDelete }}
        gist={{ cfg, onConnect: connect, onDisconnect: disconnect }} />}
      {conflict && <AccountChoice user={conflict} onFresh={() => settleAccount(true)} onMerge={() => settleAccount(false)} onCancel={googleSignOut} />}
    </div>
    </SchedCtx.Provider>
    </PlanCtx.Provider>
  )
}
