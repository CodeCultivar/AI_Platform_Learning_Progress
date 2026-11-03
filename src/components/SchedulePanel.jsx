import { useMemo, useState } from 'react'
import { buildSchedule, normalizeSchedule, DEFAULT_SCHEDULE, PACE_OPTIONS, hoursPerWeek, isIso, fmtDay, fmtRange } from '../lib.js'

const paceLabel = (p) => `${p === 1 ? '1 week' : `${p} weeks`} each · ~${hoursPerWeek(p)} h/week${p === 1 ? ' (as designed)' : ''}`

export default function SchedulePanel({ value, onSave, onClose }) {
  const init = normalizeSchedule(value)
  const [start, setStart] = useState(init.start)
  const [weeksPer, setWeeksPer] = useState(init.weeksPer)
  const [breaks, setBreaks] = useState(init.breaks)

  const errors = []
  if (!isIso(start)) errors.push('Pick a start date.')
  breaks.forEach((b, i) => {
    if (!isIso(b.start) || !isIso(b.end)) errors.push(`Break ${i + 1}: fill in both dates.`)
    else if (b.start > b.end) errors.push(`Break ${i + 1}: the end is before the start.`)
  })
  const valid = errors.length === 0
  const preview = useMemo(() => (valid ? buildSchedule({ start, weeksPer, breaks }) : null), [valid, start, weeksPer, breaks])
  const calWeeks = preview ? Math.round(((new Date(preview.end) - new Date(preview.start)) / 86400000 + 1) / 7) : 0

  const setBreak = (i, k, v) => setBreaks((bs) => bs.map((b, j) => (j === i ? { ...b, [k]: v } : b)))

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal card" role="dialog" aria-modal="true" aria-label="Schedule settings" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Adjust your schedule</h2>
        <p className="muted">The plan is 12 weeks of work. Change when it starts, how fast you go, and when you take breaks. Every date on the site updates, and your progress is kept.</p>

        <label htmlFor="sc-start">Start date</label>
        <input id="sc-start" className="field" type="date" value={start} onChange={(e) => setStart(e.target.value)} />

        <label htmlFor="sc-pace">Pace: calendar time for each plan week</label>
        <select id="sc-pace" className="field" value={weeksPer} onChange={(e) => setWeeksPer(Number(e.target.value))}>
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

        <div className="modal-actions">
          <button className="btn" disabled={!valid} onClick={() => onSave({ start, weeksPer, breaks })}>Save schedule</button>
          <button onClick={() => { const d = DEFAULT_SCHEDULE; setStart(d.start); setWeeksPer(d.weeksPer); setBreaks(d.breaks); }}>Use the original dates</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
