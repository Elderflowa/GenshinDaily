import { useEffect, useRef } from 'react'

// Reusable modal with backdrop click to close, ESC to close, focus trap
export default function Modal({ isOpen, onClose, title, children, className = '' }) {
  const overlayRef = useRef(null)
  const contentRef = useRef(null)
  const previousActive = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    previousActive.current = document.activeElement
    document.body.style.overflow = 'hidden'
    contentRef.current?.focus()
    const onKeyDown = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') trapFocus(e)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
      previousActive.current?.focus()
    }
  }, [isOpen, onClose])

  function trapFocus(e) {
    const focusable = contentRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (!focusable?.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`modal-content${className}`} ref={contentRef} tabIndex={-1}>
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}