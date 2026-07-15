import { useState } from 'react'
import styles from './ProtocolZeroModal.module.css'

export default function ProtocolZeroModal({ open, confirmed, onConfirm, onClose }) {
  const [toggles, setToggles] = useState({ t1: false, t2: false, t3: false })

  if (!open) return null

  const allEnabled = toggles.t1 && toggles.t2 && toggles.t3

  const toggle = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Alert bar */}
        <div className={styles.alertBar}>
          <span className={styles.alertDot} />
          <span>LEVEL-9 EMERGENCY OVERRIDE SEQUENCE INITIATED</span>
          <span className={styles.alertDot} />
        </div>

        <div className={styles.title}>
          PROTOCOL <span className={styles.titleRed}>ZERO</span>
        </div>

        <div className={styles.subtitle}>
          Dimensional Quarantine & Cascade Termination
        </div>

        <p className={styles.desc}>
          This will execute a <span className={styles.hl}>full dimensional quarantine</span> of Timelines Alpha-7, Alpha-8, and Alpha-9.
          All temporal access will be locked for <span className={styles.hl}>72 chrono-cycles</span>. Rogue anomaly signatures will
          be permanently isolated in <span className={styles.hl}>Quantum Foam Containment</span>. This action is <span className={styles.hlRed}>irreversible</span>.
        </p>

        <div className={styles.separator} />

        {/* Confirm toggles */}
        <div className={styles.toggleSection}>
          <div className={styles.toggleLabel}>Authorization Protocol: Confirm all three clearance locks to proceed.</div>
          <div className={styles.toggles}>
            {[
              { key: 't1', label: 'CONFIRM: Cascade exceeds safe threshold (>70%)' },
              { key: 't2', label: 'CONFIRM: Automated failsafes have been exhausted' },
              { key: 't3', label: 'CONFIRM: Reality Architect Level-9 override authorized' },
            ].map(({ key, label }) => (
              <div key={key} className={styles.toggleRow} onClick={() => toggle(key)}>
                <div className={`${styles.toggleBox} ${toggles[key] ? styles.toggleOn : ''}`}>
                  {toggles[key] && <span>✓</span>}
                </div>
                <span className={styles.toggleText} style={{ color: toggles[key] ? 'var(--cyan)' : 'var(--text-muted)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.separator} />

        {/* Buttons */}
        {confirmed ? (
          <div className={styles.confirmedBanner}>
            <div className={styles.confirmedIcon}>✦</div>
            <div>
              <div className={styles.confirmedTitle}>PROTOCOL ZERO ENGAGED</div>
              <div className={styles.confirmedSub}>Paradox Cascade neutralized. Timeline sealed. 42 billion lives preserved.</div>
            </div>
          </div>
        ) : (
          <div className={styles.btnRow}>
            <button
              id="protocol-zero-abort"
              className={styles.abortBtn}
              onClick={onClose}
            >
              ABORT SEQUENCE
            </button>
            <button
              id="protocol-zero-confirm"
              className={`${styles.confirmBtn} ${!allEnabled ? styles.confirmDisabled : ''}`}
              onClick={allEnabled ? onConfirm : undefined}
              disabled={!allEnabled}
            >
              <span className={styles.confirmDot} />
              ENGAGE PROTOCOL ZERO
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
