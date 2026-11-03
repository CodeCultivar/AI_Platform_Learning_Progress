import { mergeStates, sameState, normalizeState } from './lib.js'

// Google sign-in + Cloud Firestore sync. Firebase is loaded lazily, and only when the site ships a
// valid firebase-config.json, so sites without it pay nothing for it.

export const REQUIRED = ['apiKey', 'authDomain', 'projectId', 'appId']
export const validFirebaseConfig = (c) =>
  !!c && typeof c === 'object' && REQUIRED.every((k) => typeof c[k] === 'string' && c[k].trim() !== '' && !c[k].startsWith('YOUR_'))

export async function loadFirebaseConfig(fetchImpl = fetch, base = document.baseURI) {
  try {
    const res = await fetchImpl(new URL('firebase-config.json', base).href, { cache: 'no-cache' })
    if (!res.ok) return null
    const c = JSON.parse(await res.text()) // a missing file on some hosts returns the HTML page: parse fails -> null
    return validFirebaseConfig(c) ? c : null
  } catch {
    return null
  }
}

export const encodeState = (s) => JSON.stringify(normalizeState(s))
export function decodeState(data) {
  try { return normalizeState(JSON.parse(data)) } catch { throw new Error('the cloud copy is not valid JSON') }
}

/** Pure core of one sync round (also what the Firestore transaction runs). `remoteData` is undefined if no cloud copy exists yet. */
export function mergeWithRemote(local, remoteData) {
  const exists = typeof remoteData === 'string'
  const remote = exists ? decodeState(remoteData) : normalizeState(null)
  const merged = mergeStates(local, remote)
  return { merged, push: !exists || !sameState(merged, remote) }
}

export function describeSyncError(e) {
  const code = e?.code || ''
  if (code === 'permission-denied') return 'Firestore refused the request. Check your security rules, and that you signed in with the account they allow.'
  if (code === 'unavailable' || code === 'auth/network-request-failed') return 'Could not reach Google (offline?). It will retry.'
  if (code === 'auth/unauthorized-domain') return 'This site\'s domain is not authorized. In the Firebase console, open Authentication, then Settings, then Authorized domains, and add it.'
  if (code === 'auth/popup-blocked') return 'The browser blocked the sign-in popup. Allow popups for this site and try again.'
  if (code === 'auth/operation-not-allowed') return 'Google sign-in is not enabled in your Firebase project (Authentication, then Sign-in method).'
  if (code === 'failed-precondition' || /database.*(not|does not) exist|NOT_FOUND/i.test(e?.message || '')) return 'The Firestore database has not been created yet in your Firebase project.'
  return e?.message || 'sync failed'
}

export const isQuietAuthError = (e) => e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request'

export async function initCloud(config) {
  const [{ initializeApp }, auth, fs] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')])
  const app = initializeApp(config)
  const a = auth.getAuth(app)
  const db = fs.getFirestore(app)
  const ref = () => {
    if (!a.currentUser) throw new Error('not signed in')
    return fs.doc(db, 'users', a.currentUser.uid, 'progress', 'state')
  }
  return {
    onUser: (cb) => auth.onAuthStateChanged(a, (u) => cb(u ? { uid: u.uid, email: u.email, name: u.displayName } : null)),
    signIn: () => auth.signInWithPopup(a, new auth.GoogleAuthProvider()),
    signOut: () => auth.signOut(a),
    // read, merge and write inside one transaction so two devices syncing at once cannot overwrite each other
    syncOnce: (local) => {
      const r = ref()
      return fs.runTransaction(db, async (tx) => {
        const snap = await tx.get(r)
        const { merged, push } = mergeWithRemote(local, snap.exists() ? snap.data().data : undefined)
        if (push) tx.set(r, { data: encodeState(merged), updatedAt: fs.serverTimestamp() })
        return { state: merged, pushed: push }
      })
    },
    // live updates from other devices
    subscribe: (cb, onErr) =>
      fs.onSnapshot(ref(), (snap) => {
        if (snap.metadata.hasPendingWrites || !snap.exists()) return
        try { cb(decodeState(snap.data().data)) } catch (e) { onErr?.(e) }
      }, (e) => onErr?.(e)),
  }
}
