import { useEffect, useState, useSyncExternalStore } from 'react'
import { isApp, getServer, setServer, subscribe, getStatus } from '../sync.js'

export default function SyncCard() {
  const status = useSyncExternalStore(subscribe, getStatus)
  const [address, setAddress] = useState(getServer)
  // Only present inside the Windows app
  const desktop = window.desktop
  const [autoStart, setAutoStart] = useState(false)
  useEffect(() => { desktop?.getAutoStart().then(setAutoStart) }, [desktop])

  const text = status.ok === null ? 'Connecting…'
    : status.ok ? `Synced with your PC · ${new Date(status.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
    : "Can't reach the server. Using this device's data until it's back."

  return (
    <section>
      <h2 className="stitle">Sync</h2>
      <div className="card">
        <p className={`sync-status${status.ok ? ' ok' : ''}`}>{text}</p>
        {isApp && (
          <form className="sync-form" onSubmit={e => { e.preventDefault(); setServer(address) }}>
            <input value={address} onChange={e => setAddress(e.target.value)} inputMode="url" autoCapitalize="off" autoCorrect="off" spellCheck="false" aria-label="Server address" />
            <button type="submit">Save</button>
          </form>
        )}
        {desktop && (
          <label className="sync-check">
            <input type="checkbox" checked={autoStart} onChange={e => desktop.setAutoStart(e.target.checked).then(setAutoStart)} />
            Start with Windows
          </label>
        )}
      </div>
    </section>
  )
}
