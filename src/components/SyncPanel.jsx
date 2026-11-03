import { useState } from 'react'

const NEW_TOKEN = 'https://github.com/settings/personal-access-tokens/new'
const CLASSIC_TOKEN = 'https://github.com/settings/tokens/new?scopes=gist&description=AI%20plan%20progress%20sync'

function Status({ status, active }) {
  if (!active) return null
  const text = status.state === 'error' ? `Problem: ${status.msg}` : status.state === 'syncing' ? 'Syncing…' : status.last ? `Synced at ${status.last.toLocaleTimeString()}` : 'Connected'
  return <p className={`sync-status ${status.state}`}>{text}</p>
}

function GoogleTab({ google, status, active, onSyncNow, onClose }) {
  const { phase, user, error, onSignIn, onSignOut, onDelete } = google
  if (phase === 'loading') return <p className="muted">Checking for Google sync…</p>
  if (phase === 'error') return <p className="sync-status error">Could not start Google sync: {error}</p>
  if (phase === 'unconfigured') {
    return (
      <>
        <p>Sign-in sync is not turned on for this site. You can still use the GitHub gist option, or Export and Import to move your progress by hand.</p>
        <p className="muted"><b>Site owner:</b> turning it on takes about 10 minutes, once. The steps are in <code>docs/GOOGLE_SYNC_SETUP.md</code> in the repository.</p>
        <div className="modal-actions"><button onClick={onClose}>Close</button></div>
      </>
    )
  }
  if (!user) {
    return (
      <>
        <p>Sign in with Google and your progress follows you to every device where you sign in. Nothing to set up, and it syncs by itself from then on.</p>
        <p className="muted">What is stored: your progress, notes and schedule, under your Google account in this site's database. Only your account can read it through the app, but whoever runs this site's database can technically see it, so keep confidential details out of your notes. You can delete it any time.</p>
        {status.state === 'error' && <p className="sync-status error">Problem: {status.msg}</p>}
        <div className="modal-actions">
          <button className="btn" onClick={onSignIn}>Sign in with Google</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </>
    )
  }
  return (
    <>
      <p>Signed in as <b>{user.email}</b>.</p>
      <Status status={status} active={active} />
      <p className="muted">Changes appear on your other signed-in devices within seconds while the site is open. Signing out keeps the copy in this browser and your saved copy in the cloud.</p>
      <p><button className="linklike danger-text" onClick={() => { if (window.confirm('Delete your saved progress, notes and schedule from the cloud and sign out? The copy in this browser stays.')) onDelete() }}>Delete my cloud data and sign out</button></p>
      <div className="modal-actions">
        <button className="btn" onClick={onSyncNow}>Sync now</button>
        <button onClick={onSignOut}>Sign out</button>
        <button onClick={onClose}>Close</button>
      </div>
    </>
  )
}

function GistTab({ gist, status, active, onSyncNow, onClose }) {
  const { cfg, onConnect, onDisconnect } = gist
  const [token, setToken] = useState('')
  const [gistId, setGistId] = useState('')
  if (cfg) {
    return (
      <>
        <Status status={status} active={active} />
        <p className="muted">Your progress is stored in a private GitHub gist. On another device, choose this option and enter the same token and this gist ID:</p>
        <p><code>{cfg.gistId || '(created on first sync)'}</code></p>
        <div className="modal-actions">
          <button className="btn" onClick={onSyncNow}>Sync now</button>
          <button onClick={onDisconnect} className="danger">Disconnect this browser</button>
          <button onClick={onClose}>Close</button>
        </div>
      </>
    )
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); onConnect(token.trim(), gistId.trim()) }}>
      <ol className="plain">
        <li><a href={NEW_TOKEN} target="_blank" rel="noreferrer noopener">Create a fine-grained GitHub token ↗</a> with no repository access and only the <b>Gists: Read and write</b> account permission, plus an expiration. If GitHub rejects it, use a <a href={CLASSIC_TOKEN} target="_blank" rel="noreferrer noopener">classic token with the gist scope ↗</a>. Paste it below.</li>
        <li><b>First device:</b> leave Gist ID empty and a private gist is created for you.<br /><b>Other devices:</b> paste the Gist ID shown here on your first device.</li>
      </ol>
      <label className="muted" htmlFor="tok">GitHub token (gist access only)</label>
      <input id="tok" className="field" type="password" autoComplete="off" required value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_… or ghp_…" />
      <label className="muted" htmlFor="gid">Gist ID (optional on the first device)</label>
      <input id="gid" className="field" value={gistId} onChange={(e) => setGistId(e.target.value)} placeholder="e.g. 3f2a9c…" />
      {status.state === 'error' && <p className="sync-status error">Problem: {status.msg}</p>}
      <p className="muted">The token is saved only in this browser. It can reach all of your gists, so treat it like a password and delete it on GitHub if a device is lost.</p>
      <div className="modal-actions">
        <button className="btn" type="submit">Connect and sync</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  )
}

export default function SyncPanel({ active, status, google, gist, onSyncNow, onClose }) {
  const [tab, setTab] = useState(active === 'gist' ? 'gist' : 'google')
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal card" role="dialog" aria-modal="true" aria-label="Sync settings" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Sync across devices</h2>
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'google'} className={tab === 'google' ? 'on' : ''} onClick={() => setTab('google')}>Google (recommended)</button>
          <button role="tab" aria-selected={tab === 'gist'} className={tab === 'gist' ? 'on' : ''} onClick={() => setTab('gist')}>GitHub gist</button>
        </div>
        {tab === 'google'
          ? <GoogleTab google={google} status={status} active={active === 'google'} onSyncNow={onSyncNow} onClose={onClose} />
          : <GistTab gist={gist} status={status} active={active === 'gist'} onSyncNow={onSyncNow} onClose={onClose} />}
        <p className="muted"><a href="#/" onClick={onClose}>How sync works and its limits</a></p>
      </div>
    </div>
  )
}
