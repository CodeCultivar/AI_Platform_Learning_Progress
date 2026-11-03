import { parseInline } from '../lib.js'

export function Inline({ text }) {
  return parseInline(text).map((p, i) => {
    if (p.t === 'b') return <strong key={i}>{p.v}</strong>
    if (p.t === 'c') return <code key={i}>{p.v}</code>
    if (p.t === 'a') return <a key={i} href={p.url} target="_blank" rel="noreferrer noopener">{p.v}<span aria-hidden> ↗</span></a>
    return <span key={i}>{p.v}</span>
  })
}

export function Blocks({ blocks }) {
  return blocks.map((b, i) =>
    b.t === 'ul' ? (
      <ul className="plain" key={i}>
        {b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}
      </ul>
    ) : (
      <p key={i}><Inline text={b.text} /></p>
    ),
  )
}

export function Ring({ value, size = 44, label }) {
  const r = (size - 6) / 2
  const c = 2 * Math.PI * r
  return (
    <svg className="ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label || `${value}% complete`}>
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-bg" />
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="50%" dy=".35em" textAnchor="middle" className="ring-t">{value}</text>
    </svg>
  )
}

export function Bar({ value }) {
  return <div className="bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${value}%` }} /></div>
}

export function Check({ id, checked, onToggle, children, gate }) {
  return (
    <label className={`task ${checked ? 'done' : ''} ${gate ? 'gate' : ''}`}>
      <input type="checkbox" checked={!!checked} onChange={() => onToggle(id)} />
      <span className="box" aria-hidden />
      <span className="task-body">{children}</span>
    </label>
  )
}
