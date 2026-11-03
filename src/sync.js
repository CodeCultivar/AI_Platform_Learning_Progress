import { mergeStates, sameState, normalizeState } from './lib.js'

const CFG_KEY = 'ai-platform-plan-sync-v1'
const FILE = 'progress.json'
const API = 'https://api.github.com'

export function loadConfig() {
  try {
    const c = JSON.parse(localStorage.getItem(CFG_KEY))
    if (c && c.token) return c
  } catch { /* none */ }
  return null
}
export function saveConfig(c) { try { localStorage.setItem(CFG_KEY, JSON.stringify(c)) } catch { /* ignore */ } }
export function clearConfig() { try { localStorage.removeItem(CFG_KEY) } catch { /* ignore */ } }

async function gh(fetchImpl, token, path, init = {}) {
  const res = await fetchImpl(API + path, {
    ...init,
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  })
  if (!res.ok) {
    const hint = res.status === 401 ? 'token rejected (expired or wrong)' : res.status === 404 ? 'gist not found for this token' : `GitHub returned ${res.status}`
    throw new Error(hint)
  }
  return res.json()
}

const body = (state) => JSON.stringify({ files: { [FILE]: { content: JSON.stringify(normalizeState(state)) } } })

/**
 * One sync round: pull the gist, merge with local, push back only if the gist is behind.
 * Creates a secret gist on first use. Returns { state, gistId, pushed }.
 */
export async function syncOnce(cfg, local, fetchImpl = fetch) {
  if (!cfg.gistId) {
    const g = await gh(fetchImpl, cfg.token, '/gists', {
      method: 'POST',
      body: JSON.stringify({ description: '90-day AI plan progress (synced)', public: false, files: { [FILE]: { content: JSON.stringify(normalizeState(local)) } } }),
    })
    return { state: normalizeState(local), gistId: g.id, pushed: true }
  }
  const g = await gh(fetchImpl, cfg.token, `/gists/${cfg.gistId}`)
  const file = g.files?.[FILE]
  let remote = normalizeState(null)
  if (file) {
    let text = file.content
    if (file.truncated) text = await (await fetchImpl(file.raw_url)).text()
    try { remote = normalizeState(JSON.parse(text)) } catch { throw new Error('the gist file is not valid JSON') }
  }
  const merged = mergeStates(local, remote)
  let pushed = false
  if (!sameState(merged, remote)) {
    await gh(fetchImpl, cfg.token, `/gists/${cfg.gistId}`, { method: 'PATCH', body: body(merged) })
    pushed = true
  }
  return { state: merged, gistId: cfg.gistId, pushed }
}
