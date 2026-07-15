import styles from './ResonanceTuner.module.css'

const TARGET_FREQ = 72   // 0-100 maps to display 200–700 MHz; 72 = 432.8 MHz
const TARGET_PHASE = 80  // 0-100; 80 = aligned

function mhzFromSlider(val) {
  return (200 + val * 5).toFixed(1)
}

function phaseLabel(val) {
  if (val > 76 && val < 84) return 'ALIGNED ✓'
  if (val > 60) return 'CONVERGING...'
  return 'DRIFTING'
}

export default function ResonanceTuner({ frequencyVal, phaseVal, updateFrequency, updatePhase, isAligned, glitchActive }) {
  const freqAligned = frequencyVal > 68 && frequencyVal < 76
  const phaseSynced = phaseVal > 76 && phaseVal < 84

  return (
    <div className={`glass-panel ${styles.tuner}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div className="panel-label">[03] Harmonic Resonance Tuner</div>
        <div className={styles.targetHint}>
          <span className="font-mono text-muted" style={{ fontSize: 9 }}>TARGET ANCHOR →</span>
          <span className="font-mono text-cyan" style={{ fontSize: 11 }}>432.8 MHz · Phase: Aligned</span>
        </div>
      </div>

      <div className={styles.sliders}>
        {/* Frequency */}
        <div className={styles.sliderRow}>
          <div className={styles.sliderLabel}>
            <span className="font-mono" style={{ fontSize: 11, color: freqAligned ? 'var(--cyan)' : 'var(--text-secondary)' }}>Frequency</span>
            <span className={styles.sliderVal} style={{ color: freqAligned ? 'var(--cyan)' : 'var(--gold)' }}>
              {mhzFromSlider(frequencyVal)} MHz
              {freqAligned && <span className={styles.alignedTag}>LOCKED</span>}
            </span>
          </div>
          <div className={styles.trackWrapper}>
            <div className={styles.track}>
              <div
                className={styles.fill}
                style={{
                  width: `${frequencyVal}%`,
                  background: freqAligned
                    ? 'linear-gradient(90deg, var(--cyan), var(--violet-mid))'
                    : 'linear-gradient(90deg, var(--gold), var(--crimson))',
                  boxShadow: freqAligned ? '0 0 12px rgba(0,242,254,0.7)' : '0 0 8px rgba(255,215,0,0.5)',
                }}
              />
              <div
                className={styles.targetMarker}
                style={{ left: `${TARGET_FREQ}%` }}
                title="Target: 432.8 MHz"
              />
            </div>
            <input
              id="freq-slider"
              type="range"
              min={0}
              max={100}
              value={frequencyVal}
              onChange={e => updateFrequency(Number(e.target.value))}
              className={styles.rangeInput}
              style={{ '--thumb-color': freqAligned ? '#00F2FE' : '#FFD700' }}
            />
          </div>
          <div className={styles.waveform}>
            {Array.from({ length: 40 }).map((_, i) => {
              const h = 4 + Math.abs(Math.sin(i * 0.5 + frequencyVal * 0.1)) * (freqAligned ? 14 : 8)
              return (
                <div
                  key={i}
                  className={styles.bar}
                  style={{
                    height: h,
                    background: freqAligned ? 'var(--cyan)' : 'var(--gold)',
                    opacity: freqAligned ? 0.9 : 0.5,
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Phase */}
        <div className={styles.sliderRow}>
          <div className={styles.sliderLabel}>
            <span className="font-mono" style={{ fontSize: 11, color: phaseSynced ? 'var(--violet-mid)' : 'var(--text-secondary)' }}>Phase Sync</span>
            <span className={styles.sliderVal} style={{ color: phaseSynced ? 'var(--violet-mid)' : 'var(--text-muted)' }}>
              {phaseLabel(phaseVal)}
              {phaseSynced && <span className={styles.alignedTag} style={{ background: 'rgba(168,85,247,0.2)', color: 'var(--violet-mid)' }}>SYNC</span>}
            </span>
          </div>
          <div className={styles.trackWrapper}>
            <div className={styles.track}>
              <div
                className={styles.fill}
                style={{
                  width: `${phaseVal}%`,
                  background: phaseSynced
                    ? 'linear-gradient(90deg, var(--violet-mid), var(--cyan))'
                    : 'linear-gradient(90deg, var(--violet-mid)66, var(--violet-mid)33)',
                  boxShadow: phaseSynced ? '0 0 12px rgba(127,0,255,0.7)' : 'none',
                }}
              />
              <div
                className={styles.targetMarker}
                style={{ left: `${TARGET_PHASE}%`, background: 'var(--violet-mid)' }}
              />
            </div>
            <input
              id="phase-slider"
              type="range"
              min={0}
              max={100}
              value={phaseVal}
              onChange={e => updatePhase(Number(e.target.value))}
              className={styles.rangeInput}
              style={{ '--thumb-color': phaseSynced ? '#a855f7' : '#64748b' }}
            />
          </div>
        </div>
      </div>

      {isAligned && (
        <div className={styles.alignedBanner}>
          <span>✦</span>
          <span>DIMENSIONAL FREQUENCY ALIGNED — REALITY GRID STABILIZING</span>
          <span>✦</span>
        </div>
      )}
    </div>
  )
}
