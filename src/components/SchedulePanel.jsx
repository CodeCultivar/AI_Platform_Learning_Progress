import { useMemo, useState } from 'react'
import { buildSchedule, normalizeSchedule, PACE_OPTIONS, hoursPerWeek, paceForHours, isIso, fmtDay, fmtRange } from '../lib.js'

const paceLabel = (p) => `${p === 1 ? '1 week' : `${p} weeks`} each · ~${hoursPerWeek(p)} h/week${p === 1 ? ' (as designed)' : ''}`

export default function SchedulePanel({ value, onSave, onClose, signedIn, defaults, units = 12, parked }) {
  const init = normalizeSchedule(value, defaults)
  const [start, setStart] = useState(init.start)
  const [weeksPer, setWeeksPer] = useState(init.weeksPer)
  const [breaks, setBreaks] = useState(init.breaks)
  const [hours, setHours] = useState(String(init.hours ?? hoursPerWeek(init.weeksPer)))
  const hNum = Number(hours)
  const hoursOk = hours !== '' && Number.isFinite(hNum) && hNum >= 1 && hNum <= 40

  const errors = []
  if (!isIso(start)) errors.push('Pick a start date.')
  if (!hoursOk) errors.push('Hours per week: enter a number from 1 to 40.')
  breaks.forEach((b, i) => {
    if (!isIso(b.start) || !isIso(b.end)) errors.push(`Break ${i + 1}: fill in both dates.`)
    else if (b.start > b.end) errors.push(`Break ${i + 1}: the end is before the start.`)
  })
  const valid = errors.length === 0
  const preview = useMemo(() => (valid ? buildSchedule({ start, weeksPer, breaks }, units, defaults) : null), [valid, start, weeksPer, breaks, units, defaults])
  const calWeeks = preview ? Math.round(((new Date(preview.end) - new Date(preview.start)) / 86400000 + 1) / 7) : 0

  const setBreak = (i, k, v) => setBreaks((bs) => bs.map((b, j) => (j === i ? { ...b, [k]: v } : b)))

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal card" role="dialog" aria-modal="true" aria-label="Schedule settings" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Adjust your schedule</h2>
        <p className="muted">The plan is {units} weeks of work. Change when it starts, how fast you go, and when you take breaks. Every date on the site updates, and your progress is kept.</p>

        {parked && <p className="note">{parked}</p>}
        <label htmlFor="sc-start">Start date</label>
        <input id="sc-start" className="field" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <button type="button" className="linklike" onClick={() => { const d = new Date(); d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7)); setStart(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`) }}>Start next Monday</button>

        <label htmlFor="sc-hours">Hours you can study each week</label>
        <input id="sc-hours" className="field" type="number" inputMode="decimal" min="1" max="40" step="0.5" value={hours}
          onChange={(e) => { setHours(e.target.value); const n = Number(e.target.value); if (e.target.value !== '' && n >= 1 && n <= 40) setWeeksPer(paceForHours(n)) }} />
        <p className="muted" style={{ margin: '4px 0 0' }}>
          {hoursOk
            ? <>The plan is built for about 5 hours a week. At {hNum} h/week each plan week takes <b>{weeksPer === 1 ? '1 week' : `${weeksPer} weeks`}</b> (about {hoursPerWeek(weeksPer)} h/week){hNum < hoursPerWeek(weeksPer) ? '. That is the slowest pace available, so the load is a little more than you planned.' : '.'}</>
            : 'Enter how many hours you can realistically give it.'}
        </p>

        <label htmlFor="sc-pace">Pace (set by your hours; change it to override)</label>
        <select id="sc-pace" className="field" value={weeksPer} onChange={(e) => { const p = Number(e.target.value); setWeeksPer(p); setHours(String(hoursPerWeek(p))) }}>
          {PACE_OPTIONS.map((p) => <option key={p} value={p}>{paceLabel(p)}</option>)}
        </select>

        <label>Breaks (vacations, busy periods)</label>
        {breaks.length === 0 && <p className="muted" style={{ margin: '4px 0' }}>No breaks. The plan runs straight through.</p>}
        {breaks.map((b, i) => (
          <div className="break-row" key={i}>
            <input className="field" type="date" aria-label={`Break ${i + 1} start`} value={b.start} onChange={(e) => setBreak(i, 'start', e.target.value)} />
            <span>to</span>
            <input className="field" type="date" aria-label={`Break ${i + 1} end`} value={b.end} onChange={(e) => setBreak(i, 'end', e.target.value)} />
            <button type="button" className="x" aria-label={`Remove break ${i + 1}`} onClick={() => setBreaks((bs) => bs.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        {breaks.length < 12 && <button type="button" className="linklike" onClick={() => setBreaks((bs) => [...bs, { start: preview ? preview.start : start, end: preview ? preview.start : start }])}>+ Add a break</button>}

        {errors.length > 0 && <ul className="plain sync-status error">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}

        {preview && (
          <div className="preview">
            <p><b>{fmtDay(preview.start)}</b> to <b>{fmtDay(preview.end)}</b><br /><span className="muted">{calWeeks} calendar weeks · about {preview.hours} hours a week</span></p>
            <details>
              <summary>See every week</summary>
              <ol className="plain">
                {preview.weeks.map((w) => <li key={w.n}>Week {w.n}: {fmtRange(w.start, w.end)}{w.breakDays ? ` (includes ${w.breakDays} break days)` : ''}</li>)}
              </ol>
            </details>
          </div>
        )}

        <p className="muted" style={{ margin: '10px 0 0' }}>{signedIn ? 'Signed in: your schedule syncs to your Google account and to your other devices.' : 'Your schedule is saved in this browser. Sign in with Google to sync it across devices.'}</p>

        <div className="modal-actions">
          <button className="btn" disabled={!valid} onClick={() => onSave({ start, weeksPer, breaks, hours: hNum })}>Save schedule</button>
          <button onClick={() => { const d = defaults; setStart(d.start); setWeeksPer(d.weeksPer); setBreaks(d.breaks); setHours(String(hoursPerWeek(d.weeksPer))) }}>Use the original dates</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
