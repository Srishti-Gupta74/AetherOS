import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './TelemetryLog.module.css'

const BASE_LOGS = [
  { type: 'ok',   text: 'AETHER-OS v9.4 core systems online.' },
  { type: 'warn', text: '[ALERT] Unauthorized temporal event at Node Alpha-7.' },
  { type: 'info', text: 'Scanning causal integrity of Sector 4...' },
  { type: 'crit', text: '[CRITICAL] Paradox Cascade detected — 84.2% threshold.' },
  { type: 'info', text: 'Automated failsafes overloaded. Manual override required.' },
  { type: 'warn', text: '[ALERT] Tear coordinates locked: [38, 91, -4.2z].' },
  { type: 'ok',   text: 'Awaiting Reality Architect manual intervention...' },
  { type: 'info', text: 'Oracle-AI analysis complete. Recommendation ready.' },
]

const ORACLE_STEPS = [
  'Initializing Oracle-AI dimensional analysis...',
  'Cross-referencing 14,822 prior paradox events...',
  'Optimal mitigation path calculated.',
  'Recommendation: Splice Node A → Node B. Re-tune to 432.8 MHz. Execute Protocol Zero if cascade exceeds 90%.',
]

export default function TelemetryLog({ cascadeRisk, isAligned, nodesSpliced, timeline }) {
  const [logs, setLogs] = useState([])
  const [oracleStep, setOracleStep] = useState(0)
  const [oracleRunning, setOracleRunning] = useState(false)
  const [patchApplied, setPatchApplied] = useState(false)
  const logEndRef = useRef(null)
  const oracleInterval = useRef(null)

  // Stream initial logs on mount
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < BASE_LOGS.length) {
        setLogs(prev => [...prev, { ...BASE_LOGS[i], id: Date.now() + i }])
        i++
      } else {
        clearInterval(interval)
      }
    }, 300)
    return () => clearInterval(interval)
  }, [])

  // Reactive log on cascade risk changes
  useEffect(() => {
    if (isAligned) {
      setLogs(prev => [...prev, { type: 'ok', text: `Frequency aligned to 432.8 MHz — reality grid stabilizing on ${timeline.label}.`, id: Date.now() }])
    }
  }, [isAligned])

  useEffect(() => {
    if (nodesSpliced) {
      setLogs(prev => [...prev, { type: 'ok', text: 'Causal nodes spliced. Energy rerouted from Prime Anchor to Alpha-7.', id: Date.now() }])
    }
  }, [nodesSpliced])

  useEffect(() => {
    if (cascadeRisk === 0) {
      setLogs(prev => [...prev, { type: 'ok', text: '✦ PARADOX CASCADE NEUTRALIZED. Sector 4 stabilized. 42 billion lives preserved.', id: Date.now() }])
    }
  }, [cascadeRisk])

  // Scroll to latest log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const runOraclePatch = useCallback(() => {
    if (oracleRunning || patchApplied) return
    setOracleRunning(true)
    setOracleStep(0)
    let step = 0
    oracleInterval.current = setInterval(() => {
      step++
      setOracleStep(step)
      setLogs(prev => [...prev, { type: 'info', text: `[ORACLE-AI] ${ORACLE_STEPS[step - 1]}`, id: Date.now() + step }])
      if (step >= ORACLE_STEPS.length) {
        clearInterval(oracleInterval.current)
        setOracleRunning(false)
        setPatchApplied(true)
      }
    }, 700)
  }, [oracleRunning, patchApplied])

  const logColor = { ok: '#00F2FE', warn: '#FFD700', crit: '#FF0055', info: '#94a3b8' }

  return (
    <div className={`glass-panel ${styles.telem}`}>
      <div className="panel-label">[04] Live Telemetry & Oracle-AI</div>

      {/* Terminal log */}
      <div className={styles.terminal}>
        {logs.map((log, i) => (
          <div key={log.id || i} className={styles.logLine}>
            <span className={styles.logPrefix} style={{ color: logColor[log.type] }}>
              {log.type === 'crit' ? '!' : log.type === 'warn' ? '⚠' : log.type === 'ok' ? '✓' : '>'}
            </span>
            <span style={{ color: logColor[log.type] }}>{log.text}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Oracle-AI card */}
      <div className={styles.oracleCard}>
        <div className={styles.oracleHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className={styles.oracleDot} />
            <span className="font-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--violet-mid)' }}>
              Oracle-AI  ·  Status: {patchApplied ? 'RECOMMENDATION COMPLETE' : oracleRunning ? 'ANALYZING...' : 'READY'}
            </span>
          </div>
        </div>

        <div className={styles.oracleBody}>
          {patchApplied ? (
            <p>Optimal path confirmed: <span className="text-cyan">Splice causal nodes</span>, align to <span className="text-cyan">432.8 MHz</span>, engage <span className="text-crimson">Protocol Zero</span> if cascade exceeds 90%.</p>
          ) : (
            <p>Causal pattern analysis ready. Click <span className="text-violet">Auto-Patch</span> to run full dimensional diagnosis and generate step-by-step mitigation protocol.</p>
          )}
        </div>

        <button
          id="oracle-autopatch-btn"
          className={styles.oracleBtn}
          onClick={runOraclePatch}
          disabled={oracleRunning || patchApplied}
          style={{ opacity: patchApplied ? 0.5 : 1 }}
        >
          {patchApplied ? '✓ PATCH APPLIED' : oracleRunning ? 'ANALYZING...' : '⚡ APPLY AUTO-PATCH RECOMMENDATION'}
        </button>
      </div>
    </div>
  )
}
