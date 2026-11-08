import { useEffect, useState, useSyncExternalStore } from 'react'
import { isApp, getServer, setServer, subscribe, getStatus } from '../sync.js'

export default function SyncModal({ isOpen, onClose }) {
  const status = useSyncExternalStore(subscribe, getStatus)
  const [address, setAddress] = useState(getServer)
  const [saving, setSaving] = useState(false)
  const desktop = window.desktop
  const [autoStart, setAutoStartState] = useState(false)
  const [autoStartLoading, setAutoStartLoading] = useState(false)

  useEffect(() => {
    if (isOpen && desktop) {
      desktop.getAutoStart().then(setAutoStartState)
    }
  }, [isOpen, desktop])

  const handleSaveServer = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      setServer(address.trim().replace(/\/+$/, ''))
    } finally {
      setSaving(false)
    }
  }

  const handleAutoStartChange = async checked => {
    if (!desktop) return
    setAutoStartLoading(true)
    try {
      const result = await desktop.setAutoStart(checked)
      setAutoStartState(result)
    } catch (err) {
      console.error('Failed to set auto-start:', err)
      setAutoStartState(autoStart) // revert on error
    } finally {
      setAutoStartLoading(false)
    }
  }

  const statusText = status.ok === null ? 'Connecting…'
    : status.ok ? `Synced with your PC · ${new Date(status.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
    : "Can't reach the server. Using this device's data until it's back."

  return (
    <form onSubmit={handleSaveServer}>
      <div className="sync-section">
        <h3>Sync Status</h3>
        <p className={`sync-status${status.ok ? ' ok' : ''}`}>{statusText}</p>
      </div>

      {isApp && (
        <div className="sync-section">
          <h3>Server Address</h3>
          <div className="sync-form">
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              inputMode="url"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
              aria-label="Server address"
              placeholder="http://192.168.x.x:3050"
              disabled={saving}
            />
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
          <p className="sync-hint">Your PC's local IP. Set a DHCP reservation so it never changes.</p>
        </div>
      )}

      {desktop && (
        <div className="sync-section">
          <h3>Windows</h3>
          <label className="sync-check">
            <input
              type="checkbox"
              checked={autoStart}
              onChange={e => handleAutoStartChange(e.target.checked)}
              disabled={autoStartLoading}
            />
            <span>Start with Windows (minimized to tray)</span>
          </label>
          {autoStartLoading && <span className="sync-spinner" aria-hidden="true">⟳</span>}
          <p className="sync-hint">Keeps the sync server running so your phone stays updated.</p>
        </div>
      )}

      {!isApp && !desktop && (
        <div className="sync-section">
          <p className="sync-hint">Open this page in the installed Windows app or iOS app to configure sync.</p>
        </div>
      )}

      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
      </div>
    </form>
  )
}