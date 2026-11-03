import { useState } from 'react'

const NEW_TOKEN = 'https://github.com/settings/tokens/new?scopes=gist&description=AI%20plan%20progress%20sync'

export default function SyncPanel({ cfg, status, onConnect, onDisconnect, onSyncNow, onClose }) {
  const [token, setToken] = useState('')
  const [gistId, setGistId] = useState('')
  const connected = !!cfg
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal card" role="dialog" aria-modal="true" aria-label="Sync settings" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Sync across devices</h2>
        {connected ? (
          <>
            <p className={`sync-status ${status.state}`}>{status.state === 'error' ? `Problem: ${status.msg}` : status.state === 'syncing' ? 'Syncing…' : status.last ? `Synced at ${status.last.toLocaleTimeString()}` : 'Connected'}</p>
            <p className="muted">Your progress is stored in a private GitHub gist. On another device, open this site, choose Sync, and enter the same token and this gist ID:</p>
            <p><code>{cfg.gistId || '(created on first sync)'}</code></p>
            <div className="modal-actions">
              <button className="btn" onClick={onSyncNow}>Sync now</button>
              <button onClick={onDisconnect} className="danger">Disconnect this browser</button>
              <button onClick={onClose}>Close</button>
            </div>
          </>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); onConnect(token.trim(), gistId.trim()); }}>
            <ol className="plain">
              <li><a href={NEW_TOKEN} target="_blank" rel="noreferrer noopener">Create a GitHub token ↗</a> with only the <code>gist</code> scope, and paste it below.</li>
              <li><b>First device:</b> leave Gist ID empty and a private gist is created for you.<br /><b>Other devices:</b> paste the Gist ID shown here on your first device.</li>
            </ol>
            <label className="muted" htmlFor="tok">GitHub token (classic, gist scope)</label>
            <input id="tok" className="field" type="password" autoComplete="off" required value={token} onChange={(e) => setToken(e.target.value)} placeholder="ghp_…" />
            <label className="muted" htmlFor="gid">Gist ID (optional on the first device)</label>
            <input id="gid" className="field" value={gistId} onChange={(e) => setGistId(e.target.value)} placeholder="e.g. 3f2a9c…" />
            {status.state === 'error' && <p className="sync-status error">Problem: {status.msg}</p>}
            <p className="muted">The token is saved only in this browser. It can reach all of your gists, so treat it like a password and revoke it on GitHub if a device is lost.</p>
            <div className="modal-actions">
              <button className="btn" type="submit">Connect and sync</button>
              <button type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
