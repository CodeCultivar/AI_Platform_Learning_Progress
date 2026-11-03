import { useState } from 'react'
import plan from '../data/plan.json'
import { Inline, Blocks, Ring, Bar, Check } from './Inline.jsx'
import { weekTaskIds, kickoffIds, pct, taskIds, daysUntil, currentWeek, fmtRange, fmtDay, fmtShort } from '../lib.js'
import { useSched } from '../schedule-context.js'

const rangeOf = (sched, n) => { const w = sched.weeks[n - 1]; return fmtRange(w.start, w.end) }
const breakNote = (sched, n) => { const b = sched.weeks[n - 1].breakDays; return b ? `Includes ${b} break day${b === 1 ? '' : 's'}, so this week runs longer.` : '' }

export function Dashboard({ st, toggle, onSchedule }) {
  const sched = useSched()
  const all = taskIds()
  const total = pct(all, st.checked)
  const doneCount = all.filter((id) => st.checked[id]).length
  const cw = currentWeek(sched)
  const week = plan.weeks.find((w) => w.n === cw)
  const next = [...week.steps.map((s, i) => ({ id: `w${week.n}-s${i}`, s })), { id: `w${week.n}-done`, s: { label: 'Done when', text: week.done } }].filter((t) => !st.checked[t.id])
  const kPct = pct(kickoffIds(), st.checked)
  const gates = plan.weeks.filter((w) => w.gate)
  const start = daysUntil(sched.start)
  const end = daysUntil(sched.end)

  return (
    <>
      <header className="hero">
        <p className="eyebrow">{fmtDay(sched.start)} → {fmtDay(sched.end)}</p>
        <h1>{plan.title}</h1>
        <p className="lede">{plan.intro}</p>
        <div className="stats">
          <div><b>{total}%</b><span>{doneCount} of {all.length} tasks</span></div>
          <div><b>{cw}</b><span>current week of 12</span></div>
          <div><b>{Object.keys(st.checked).filter((k) => /^w\d+-done$/.test(k) && st.checked[k]).length}</b><span>weeks finished</span></div>
          <div><b>{end > 0 ? end : 0}</b><span>days until {fmtShort(sched.end)}{start > 0 ? ` (starts in ${start}d)` : ''}</span></div>
        </div>
        <Bar value={total} />
        <button className="linklike" onClick={onSchedule}>Adjust schedule ({sched.hours} h/week)</button>
      </header>

      {kPct < 100 && (
        <section className="callout">
          <h2>Start here: the 90-minute kickoff</h2>
          <p>90 minutes. A Python project on GitHub, a running FastAPI app, one passing test. <b>{kPct}%</b> done.</p>
          <a className="btn" href="#/kickoff">Open the kickoff checklist</a>
        </section>
      )}

      <section>
        <div className="row-head">
          <h2>This week: Week {week.n}, {week.topic}</h2>
          <a href={`#/week/${week.n}`}>Open week →</a>
        </div>
        <p className="muted">{rangeOf(sched, week.n)} {breakNote(sched, week.n)}</p>
        {next.length === 0 ? <p className="ok">Everything in this week is checked off. Nice.</p> : (
          <div className="card tasks">
            {next.slice(0, 4).map((t) => (
              <Check key={t.id} id={t.id} checked={st.checked[t.id]} onToggle={toggle}>
                <b>{t.s.label}</b> <Inline text={t.s.text} />
              </Check>
            ))}
            {next.length > 4 && <a className="more" href={`#/week/${week.n}`}>+ {next.length - 4} more this week</a>}
          </div>
        )}
      </section>

      <section>
        <h2>All 12 weeks</h2>
        <div className="grid">
          {plan.weeks.map((w) => {
            const v = pct(weekTaskIds(w), st.checked)
            return (
              <a key={w.n} className={`card week-card ${w.n === cw ? 'now' : ''}`} href={`#/week/${w.n}`}>
                <Ring value={v} />
                <div>
                  <small>Week {w.n} · {rangeOf(sched, w.n)}{w.gate ? ` · Gate ${w.gate}` : ''}</small>
                  <strong>{w.topic}</strong>
                </div>
              </a>
            )
          })}
        </div>
      </section>

      <section>
        <div className="row-head"><h2>Gates</h2><a href="#/gates">Details →</a></div>
        <div className="gate-row">
          {gates.map((w) => {
            const id = `w${w.n}-s${w.steps.findIndex((s) => s.gate)}`
            return <a key={w.gate} href="#/gates" className={`pill ${st.checked[id] ? 'pass' : ''}`}>Gate {w.gate} · Wk {w.n} · {st.checked[id] ? 'passed' : 'pending'}</a>
          })}
        </div>
      </section>
    </>
  )
}

function Notes({ keyName, st, setNote }) {
  return (
    <div className="card">
      <label htmlFor={`n-${keyName}`}><b>Your log</b> <span className="muted">date, what worked, what blocked you</span></label>
      <textarea id={`n-${keyName}`} rows={4} value={st.notes[keyName] || ''} onChange={(e) => setNote(keyName, e.target.value)} placeholder="Saved in this browser only." />
    </div>
  )
}

function Checklist({ plan: u, prefix, st, toggle, doneId }) {
  return (
    <div className="card tasks">
      {u.steps.map((s, i) => {
        const id = `${prefix}${i}`
        return (
          <Check key={id} id={id} checked={st.checked[id]} onToggle={toggle} gate={!!s.gate}>
            <b className="lab">{s.label}</b> <Inline text={s.text} />
          </Check>
        )
      })}
      {u.done && (
        <Check id={doneId} checked={st.checked[doneId]} onToggle={toggle}>
          <b className="lab done-lab">Done when</b> <Inline text={u.done} />
        </Check>
      )}
    </div>
  )
}

// The plan's link sentence sometimes carries advice ("read the first section only"); show it only then.
const hasExtra = (t) => !!t && t.replace(/\[\[LINK .*?\]\]/g, '').replace(/[\s.,;:]/g, '').length > 0

function LinkList({ links, text }) {
  if (!links.length && !text) return null
  return (
    <div className="card links-box">
      <h3>Links you need</h3>
      {links.length > 0 && <ul className="plain">{links.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noreferrer noopener">{l.label} ↗</a></li>)}</ul>}
      {hasExtra(text) && <p className="muted"><Inline text={text} /></p>}
    </div>
  )
}

export function Kickoff({ st, toggle, setNote }) {
  const sched = useSched()
  const k = plan.kickoff
  return (
    <>
      <p className="eyebrow">Day 1 ({fmtDay(sched.start)}) · 90 minutes</p>
      <h1>{k.title}</h1>
      <p className="lede">{k.summary}</p>
      <Bar value={pct(kickoffIds(), st.checked)} />
      <Checklist plan={k} prefix="k" doneId="k-done" st={st} toggle={toggle} />
      <LinkList links={k.links} />
      <Notes keyName="kickoff" st={st} setNote={setNote} />
    </>
  )
}

export function Week({ n, st, toggle, setNote }) {
  const sched = useSched()
  const w = plan.weeks.find((x) => x.n === n)
  if (!w) return <p>No such week. <a href="#/">Back to dashboard</a></p>
  const v = pct(weekTaskIds(w), st.checked)
  return (
    <>
      <p className="eyebrow">Week {w.n} of 12 · {rangeOf(sched, w.n)}{w.light ? ' · light week' : ''}{w.gate ? ` · Gate ${w.gate}` : ''}</p>
      <h1>{w.topic[0].toUpperCase() + w.topic.slice(1)}</h1>
      <p className="lede"><Inline text={w.summary} /></p>
      {breakNote(sched, w.n) && <p className="note">{breakNote(sched, w.n)}</p>}
      <Bar value={v} />
      <Checklist plan={w} prefix={`w${w.n}-s`} doneId={`w${w.n}-done`} st={st} toggle={toggle} />
      {w.notes.map((t, i) => <p key={i} className="note"><Inline text={t} /></p>)}
      <LinkList links={w.links} text={w.linksText} />
      <Notes keyName={`week${w.n}`} st={st} setNote={setNote} />
      <nav className="pager">
        {n > 1 ? <a href={`#/week/${n - 1}`}>← Week {n - 1}</a> : <a href="#/kickoff">← Kickoff</a>}
        {n < 12 ? <a href={`#/week/${n + 1}`}>Week {n + 1} →</a> : <a href="#/after">After the 90 days →</a>}
      </nav>
    </>
  )
}

export function Gates({ st, toggle }) {
  const sched = useSched()
  const gates = plan.weeks.filter((w) => w.gate)
  return (
    <>
      <h1>Gates</h1>
      <p className="lede">Four checkpoints. If you miss one, repeat that week before moving on. The later weeks assume the earlier ones work.</p>
      {gates.map((w) => {
        const idx = w.steps.findIndex((s) => s.gate)
        const id = `w${w.n}-s${idx}`
        const s = w.steps[idx]
        return (
          <div key={w.gate} className={`card gate-card ${st.checked[id] ? 'pass' : ''}`}>
            <small>Gate {w.gate} · Week {w.n} · {rangeOf(sched, w.n)}</small>
            <h3>{w.topic}</h3>
            <Check id={id} checked={st.checked[id]} onToggle={toggle} gate>
              <b className="lab">{s.label}</b> <Inline text={s.text} />
            </Check>
            <p className="muted"><b>Week done when:</b> <Inline text={w.done} /></p>
            <a href={`#/week/${w.n}`}>Open Week {w.n} →</a>
          </div>
        )
      })}
    </>
  )
}

export function Links() {
  const [q, setQ] = useState('')
  const rows = plan.links.filter((l) => (l.label + l.use + l.weeks).toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <h1>All links</h1>
      <p className="lede">{plan.linksNote}</p>
      <input className="field" type="search" placeholder="Filter links (docker, terraform, week 6…)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter links" />
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Resource</th><th>Weeks</th><th>Use it for</th></tr></thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.url}>
                <td><a href={l.url} target="_blank" rel="noreferrer noopener">{l.label} ↗</a></td>
                <td>{l.weeks}</td>
                <td>{l.use}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={3} className="muted">No links match.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function Guide() {
  return (
    <>
      <h1>How this plan works</h1>
      <section><h2>{plan.changed.title}</h2><Blocks blocks={plan.changed.blocks} /></section>
      <section><h2>{plan.rules.title}</h2><Blocks blocks={plan.rules.blocks} /></section>
    </>
  )
}

export function After() {
  return (
    <>
      <h1>{plan.after.title}</h1>
      <Blocks blocks={plan.after.blocks} />
    </>
  )
}

export function Search({ results, q }) {
  return (
    <>
      <h1>Search</h1>
      <p className="muted">{q.trim().length < 2 ? 'Type at least 2 characters.' : `${results.length} result${results.length === 1 ? '' : 's'} for “${q}”`}</p>
      <div className="results">
        {results.map((r, i) => (
          <a key={i} className="card result" href={r.to}>
            <small>{r.kind}</small>
            <b>{r.title}</b>
            <span><Inline text={r.text.length > 220 ? r.text.slice(0, 220) + '…' : r.text} /></span>
          </a>
        ))}
      </div>
    </>
  )
}
