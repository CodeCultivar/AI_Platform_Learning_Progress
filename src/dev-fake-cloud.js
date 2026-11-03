// DEV/TEST ONLY. A stand-in for Firebase so the sign-in flow can be tested without a real project.
// The backing store lives outside the page (Playwright exposes __fakeStoreGet/Set/Del and __fakeUser).
import { mergeWithRemote, encodeState, decodeState } from './sync-cloud.js'

export function fakeCloud() {
  let user = null
  const listeners = new Set()
  const emit = () => listeners.forEach((f) => f(user))
  const uid = () => { if (!user) throw new Error('not signed in'); return user.uid }
  return {
    onUser: (cb) => { listeners.add(cb); Promise.resolve(window.__fakeStartUser?.()).then((u) => { if (u) { user = u; } cb(user) }); return () => listeners.delete(cb) },
    signIn: async () => { user = await window.__fakeUser(); emit() },
    signOut: async () => { user = null; emit() },
    deleteData: async () => { await window.__fakeStoreDel(uid()) },
    syncOnce: async (local) => {
      const raw = await window.__fakeStoreGet(uid())
      const { merged, push } = mergeWithRemote(local, raw ?? undefined)
      if (push) await window.__fakeStoreSet(uid(), encodeState(merged))
      return { state: merged, pushed: push }
    },
    subscribe: (cb) => {
      const id = uid(); let last = null
      const t = setInterval(async () => { const raw = await window.__fakeStoreGet(id); if (raw && raw !== last) { last = raw; cb(decodeState(raw)) } }, 400)
      return () => clearInterval(t)
    },
  }
}
