import { useEffect, useState, useSyncExternalStore } from 'react'
import { isApp, getServer, setServer, subscribe, getStatus, sync, markChanged } from '../sync.js'

export default function SyncModal({ isOpen, onClose }) {
  const status = useSyncExternalStore(subscribe, getStatus)
  const [address, setAddress] = useState(getServer)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [testing, setTesting] = useState(false)
  const desktop = window.desktop
  const [autoStart, setAutoStartState] = useState(false)
  const [autoStartLoading, setAutoStartLoading] = useState(false)
  const [autoStartSupported, setAutoStartSupported] = useState(true)
  const [testModal, setTestModal] = useState(null)

  useEffect(() => {
    if (isOpen && desktop) {
      desktop.getAutoStart().then(setAutoStartState).catch(() => setAutoStartSupported(false))
    }
  }, [isOpen, desktop])

  // Listen for test notifications from other device (phone -> desktop via IPC, desktop -> phone via gd-sync)
  useEffect(() => {
    const onTest = e => {
      if (e.detail?.testNotification) {
        setTestModal(e.detail.testNotification)
      }
    }
    window.addEventListener('gd-sync', onTest)

    // Desktop: listen for IPC from main process (phone -> desktop)
    let cleanup = () => {}
    if (desktop?.onTestNotification) {
      cleanup = desktop.onTestNotification((payload) => setTestModal(payload))
    }
    return () => {
      window.removeEventListener('gd-sync', onTest)
      cleanup()
    }
  }, [desktop])

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
      setAutoStartSupported(false)
      setAutoStartState(autoStart)
    } finally {
      setAutoStartLoading(false)
    }
  }

  const handleSyncNow = async () => {
    setSyncing(true)
    try {
      await sync()
    } finally {
      setSyncing(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      const payload = {
        from: isApp ? 'phone' : 'desktop',
        at: Date.now(),
        message: 'Connection test successful!'
      }

      if (isApp) {
        // Phone: use existing sync mechanism (markChanged + sync)
        markChanged('gd_test_notification', { testNotification: payload })
        await sync()
      } else if (desktop) {
        // Desktop: POST directly to local server
        await fetch('http://localhost:3050/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gd_test_notification: { v: { testNotification: payload }, t: Date.now() }
          })
        })
      }
    } catch (err) {
      console.error('Test connection failed:', err)
    } finally {
      setTesting(false)
    }
  }

  const isConnected = status.ok === true
  const lastSyncTime = status.ok && status.at
    ? new Date(status.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <>
      <form onSubmit={handleSaveServer}>
        <div className="sync-section sync-status-header">
          <div className="connection-status">
            <span className={`status-badge${isConnected ? ' connected' : ' disconnected'}`}>
              {isConnected ? 'Connected' : 'Not Connected'}
            </span>
            {lastSyncTime && <span className="last-sync">(Last sync: {lastSyncTime})</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" className="btn-sync-now" onClick={handleSyncNow} disabled={syncing}>
              {syncing ? 'Syncing…' : 'Sync Now'}
            </button>
            <button type="button" className="btn-sync-now" onClick={handleTestConnection} disabled={testing || syncing} style={{ background: 'rgba(var(--ok), .15)', color: 'rgb(var(--ok))', borderColor: 'rgba(var(--ok), .3)' }}>
              {testing ? 'Testing…' : 'Test'}
            </button>
          </div>
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
            {autoStartSupported ? (
              <>
                <label className="sync-check">
                  <input
                    type="checkbox"
                    checked={autoStart}
                    onChange={e => handleAutoStartChange(e.target.checked)}
                    disabled={autoStartLoading}
                  />
                  <span>Start with Windows (minimized to tray)</span>
                  {autoStart && <span className="auto-start-active">● Active</span>}
                  {autoStartLoading && <span className="sync-spinner" aria-hidden="true">⟳</span>}
                </label>
              </>
            ) : (
              <div className="sync-unavailable">
                <span className="unavailable-badge">Not available</span>
                <p>Auto-start only works after installing the app via the <strong>.exe installer</strong>.</p>
                <p className="sync-hint">In development mode, this setting cannot be modified.</p>
              </div>
            )}
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

      {testModal && (
        <div className="modal-overlay" onClick={() => setTestModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '340px', textAlign: 'center' }}>
            <div className="modal-header">
              <h2>Connection Test</h2>
              <button className="modal-close" onClick={() => setTestModal(null)} aria-label="Close">×</button>
            </div>
            <div className="modal-body" style={{ padding: '24px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>✓</div>
              <h3 style={{ marginBottom: '8px' }}>Connection Successful</h3>
              <p style={{ color: 'var(--text2)', fontSize: '.9rem' }}>
                Received test from <strong>{testModal.from}</strong> at {new Date(testModal.at).toLocaleTimeString()}
              </p>
              <p style={{ color: 'rgb(var(--ok))', fontSize: '.85rem', marginTop: '8px' }}>{testModal.message}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}