import { useState, useEffect } from 'react'
import styles from './TopNav.module.css'

export default function TopNav({ timeline, timelines, activeTimeline, switchTimeline, cascadeRisk, openProtocolZero }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const formatTime = (d) => {
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const riskColor = cascadeRisk > 70
    ? 'var(--crimson)'
    : cascadeRisk > 40
      ? 'var(--gold)'
      : 'var(--cyan)'

  return (
    <nav className={`glass-panel ${styles.nav}`}>
      {/* Left: Logo & Coordinates */}
      <div className={styles.left}>
        <div className={styles.logo}>
          <span className={styles.logoMain}>AETHER-OS</span>
          <span className={styles.logoSub}>v9.4</span>
        </div>
        <div className={styles.coords}>
          <span className="font-mono text-muted" style={{ fontSize: 10 }}>
            NEXUS-ZERO · {formatTime(time)} · SECTOR-4
          </span>
        </div>
      </div>

      {/* Center: Timeline tabs */}
      <div className={styles.tabs}>
        {Object.values(timelines).map(tl => (
          <button
            key={tl.id}
            id={`tab-${tl.id}`}
            className={`${styles.tab} ${activeTimeline === tl.id ? styles.tabActive : ''}`}
            style={activeTimeline === tl.id ? { borderColor: tl.colorVal, color: tl.colorVal, boxShadow: `0 0 15px ${tl.colorVal}55` } : {}}
            onClick={() => switchTimeline(tl.id)}
          >
            <span className={styles.tabDot} style={{ background: tl.colorVal, boxShadow: `0 0 8px ${tl.colorVal}` }} />
            {tl.label}
            <span className={styles.tabStatus} style={{ color: tl.colorVal }}>{tl.status}</span>
          </button>
        ))}
      </div>

      {/* Right: Risk + Emergency */}
      <div className={styles.right}>
        <div className={styles.riskDisplay}>
          <span className="font-mono text-muted" style={{ fontSize: 10 }}>CASCADE RISK</span>
          <span className={styles.riskVal} style={{ color: riskColor }}>
            {cascadeRisk.toFixed(1)}%
          </span>
        </div>
        <button
          id="protocol-zero-btn"
          className={styles.emergencyBtn}
          onClick={openProtocolZero}
        >
          <span className={styles.emergencyDot} />
          PROTOCOL ZERO
        </button>
      </div>
    </nav>
  )
}
