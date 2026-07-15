import { useState, useEffect } from 'react'

const BOOT_STEPS = [
  'Initializing quantum core...',
  'Scanning dimensional tethers...',
  'Synchronizing chrono-frequency array...',
  'Loading Reality Architect profile...',
  'AETHER-OS v9.4 ready.',
]

export default function BootSequence({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 40)

    // Cycle boot lines
    const lineInterval = setInterval(() => {
      setLineIndex(prev => {
        if (prev >= BOOT_STEPS.length - 1) {
          clearInterval(lineInterval)
          return prev
        }
        return prev + 1
      })
    }, 400)

    // Complete after ~2.2s
    const doneTimer = setTimeout(() => {
      setDone(true)
      setTimeout(onComplete, 500)
    }, 2200)

    return () => {
      clearInterval(progressInterval)
      clearInterval(lineInterval)
      clearTimeout(doneTimer)
    }
  }, [onComplete])

  return (
    <div className="boot-overlay" style={{ opacity: done ? 0 : 1, transition: 'opacity 0.5s ease' }}>
      <div className="boot-logo">AETHER-OS</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 3 }}>
        THE REALITY LOOM  ·  v9.4
      </div>

      <div style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {BOOT_STEPS.slice(0, lineIndex + 1).map((line, i) => (
          <div
            key={i}
            className="boot-line"
            style={{
              animationDelay: `${i * 0.05}s`,
              color: i === lineIndex ? 'var(--cyan)' : 'var(--text-muted)',
            }}
          >
            {i < lineIndex ? '✓' : '>'} {line}
          </div>
        ))}
      </div>

      <div className="boot-bar-track">
        <div className="boot-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2 }}>
        BIOMETRIC SCAN COMPLETE  ·  CLEARANCE: LEVEL-9
      </div>
    </div>
  )
}
