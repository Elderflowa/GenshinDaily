// Keeps checkmarks and timers in step between the PC page and the phone app through the Docker server.
// Every key stores a timestamp; the newest write wins.
import { Capacitor } from '@capacitor/core'

const META = 'gd_sync_meta'
const LOCAL_ONLY = new Set(['gd_calendar', 'gd_icons', 'gd_server', META])
const isSynced = key => key.startsWith('gd_') && !LOCAL_ONLY.has(key)

export const isApp = Capacitor.isNativePlatform()
const DEFAULT_SERVER = 'http://192.168.0.50:3050' // your PC; change it in the app under Events & Banners > Sync

const read = (key, fallback) => {
  try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw) } catch { return fallback }
}
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage full or blocked */ }
}

// In the browser the page and the server are the same address; the phone app needs one typed in.
export const getServer = () => (isApp ? read('gd_server', DEFAULT_SERVER) : '')
export const setServer = url => { write('gd_server', url.trim().replace(/\/+$/, '')); sync() }

// Sync status for the UI
let status = { ok: null, at: 0 }
const subscribers = new Set()
export const getStatus = () => status
export const subscribe = fn => { subscribers.add(fn); return () => subscribers.delete(fn) }
function setStatus(ok) {
  if (status.ok === ok && !ok) return
  status = { ok, at: ok ? Date.now() : status.at }
  subscribers.forEach(fn => fn())
}

let timer
export function markChanged(key) {
  if (!isSynced(key)) return
  write(META, { ...read(META, {}), [key]: Date.now() })
  clearTimeout(timer)
  timer = setTimeout(sync, 400)
}

let busy = false
export async function sync() {
  if (busy) return
  busy = true
  try {
    const base = getServer()
    const res = await fetch(`${base}/api/state`, { cache: 'no-store' })
    if (!res.ok) throw new Error(res.status)
    const remote = await res.json()

    const meta = read(META, {})
    const local = Object.keys(localStorage).filter(isSynced)
    const push = {}
    const changed = []
    for (const key of new Set([...Object.keys(remote), ...local])) {
      const remoteTime = remote[key]?.t ?? 0
      const has = localStorage.getItem(key) !== null
      const localTime = has ? meta[key] ?? 1 : 0 // data from before syncing counts as oldest
      if (remoteTime > localTime) {
        write(key, remote[key].v)
        meta[key] = remoteTime
        changed.push(key)
      } else if (localTime > remoteTime) {
        push[key] = { v: read(key, null), t: localTime }
      }
    }
    write(META, meta)
    if (Object.keys(push).length) {
      await fetch(`${base}/api/state`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(push) })
    }
    if (changed.length) window.dispatchEvent(new CustomEvent('gd-sync', { detail: changed }))
    setStatus(true)
  } catch {
    setStatus(false)
  } finally {
    busy = false
  }
}

export function startSync() {
  sync()
  setInterval(() => { if (!document.hidden) sync() }, 5000)
  document.addEventListener('visibilitychange', () => { if (!document.hidden) sync() })
  window.addEventListener('online', sync)
}
