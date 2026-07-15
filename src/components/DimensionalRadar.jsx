import { useEffect, useRef } from 'react'
import styles from './DimensionalRadar.module.css'

export default function DimensionalRadar({ timeline, cascadeRisk, nodesSpliced, isAligned }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const angleRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = canvas.width

    function draw() {
      ctx.clearRect(0, 0, size, size)
      const cx = size / 2
      const cy = size / 2
      const r = size * 0.38

      // Outer glow ring
      const grad = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.2)
      grad.addColorStop(0, 'rgba(0,242,254,0.08)')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, r * 1.2, 0, Math.PI * 2)
      ctx.fill()

      // Outer ring
      ctx.strokeStyle = 'rgba(127,0,255,0.5)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()

      // Mid ring
      ctx.strokeStyle = 'rgba(0,242,254,0.25)'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 6])
      ctx.beginPath()
      ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2)
      ctx.stroke()

      // Cross lines
      ctx.setLineDash([])
      ctx.strokeStyle = 'rgba(0,242,254,0.1)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy)
      ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r)
      ctx.stroke()

      // Radar sweep arm
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angleRef.current)
      const sweep = ctx.createLinearGradient(0, 0, r, 0)
      sweep.addColorStop(0, 'rgba(0,242,254,0.7)')
      sweep.addColorStop(1, 'transparent')
      ctx.strokeStyle = sweep
      ctx.lineWidth = 2
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(r, 0)
      ctx.stroke()

      // Sweep fill arc
      ctx.fillStyle = 'rgba(0,242,254,0.04)'
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, r, 0, Math.PI * 0.3)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      // Anomaly blips (only for critical timeline)
      if (cascadeRisk > 20 && !nodesSpliced) {
        const blips = [
          { angle: 0.8, dist: 0.55 },
          { angle: 2.4, dist: 0.7 },
          { angle: 4.2, dist: 0.4 },
        ]
        blips.forEach(b => {
          const bx = cx + Math.cos(b.angle) * r * b.dist
          const by = cy + Math.sin(b.angle) * r * b.dist
          const alpha = (Math.sin(Date.now() * 0.005 + b.angle) + 1) / 2
          ctx.fillStyle = `rgba(255,0,85,${0.4 + alpha * 0.6})`
          ctx.beginPath()
          ctx.arc(bx, by, 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = `rgba(255,0,85,${alpha * 0.3})`
          ctx.beginPath()
          ctx.arc(bx, by, 10, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // Center orb
      const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.25)
      orbGrad.addColorStop(0, 'rgba(127,0,255,0.6)')
      orbGrad.addColorStop(0.5, 'rgba(0,242,254,0.25)')
      orbGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = orbGrad
      ctx.beginPath()
      ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2)
      ctx.fill()

      // Center icon
      ctx.fillStyle = 'rgba(0,242,254,0.9)'
      ctx.font = `${size * 0.12}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('🌌', cx, cy)

      angleRef.current += 0.025
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [cascadeRisk, nodesSpliced, isAligned])

  const stabPct = Math.max(0, 100 - cascadeRisk)
  const stabColor = stabPct > 70 ? '#00F2FE' : stabPct > 40 ? '#FFD700' : '#FF0055'

  return (
    <div className={`glass-panel ${styles.radar}`}>
      <div className="panel-label">[01] Dimensional Radar</div>

      <div className={styles.orbWrapper}>
        <canvas ref={canvasRef} width={180} height={180} className={styles.canvas} />
      </div>

      <div className={styles.targetLabel}>
        <span className="font-mono text-muted" style={{ fontSize: 9, letterSpacing: 2 }}>TARGET</span>
        <span className="font-mono text-cyan" style={{ fontSize: 12 }}>Sector 4 · Nexus-Zero</span>
      </div>

      <div className={styles.anomalyCount}>
        <div className={styles.statRow}>
          <span className="font-mono text-muted" style={{ fontSize: 9 }}>ANOMALIES DETECTED</span>
          <span className="font-mono" style={{ color: cascadeRisk > 20 && !nodesSpliced ? 'var(--crimson)' : 'var(--cyan)', fontSize: 14, fontWeight: 700 }}>
            {cascadeRisk > 20 && !nodesSpliced ? 3 : 0}
          </span>
        </div>
      </div>

      <div className={styles.progressBlock}>
        <div className={styles.progressHeader}>
          <span className="font-mono text-muted" style={{ fontSize: 9, letterSpacing: 1 }}>PARADOX CASCADE RISK</span>
          <span className="font-mono" style={{ color: stabColor === '#FF0055' ? 'var(--crimson)' : stabColor === '#FFD700' ? 'var(--gold)' : 'var(--cyan)', fontSize: 15, fontWeight: 700 }}>
            {cascadeRisk.toFixed(1)}%
          </span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{
              width: `${cascadeRisk}%`,
              background: `linear-gradient(90deg, ${stabColor}, ${stabColor}88)`,
              boxShadow: `0 0 10px ${stabColor}88`,
              transition: 'width 0.8s ease, background 0.5s ease',
            }}
          />
        </div>

        <div className={styles.progressHeader} style={{ marginTop: 10 }}>
          <span className="font-mono text-muted" style={{ fontSize: 9, letterSpacing: 1 }}>SECTOR STABILITY</span>
          <span className="font-mono" style={{ color: 'var(--cyan)', fontSize: 13, fontWeight: 700 }}>
            {stabPct.toFixed(1)}%
          </span>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{
              width: `${stabPct}%`,
              background: 'linear-gradient(90deg, var(--cyan), var(--violet-mid))',
              boxShadow: '0 0 10px rgba(0,242,254,0.5)',
              transition: 'width 0.8s ease',
            }}
          />
        </div>
      </div>

      <div className={styles.statusBadge} style={{ borderColor: stabColor, color: stabColor, boxShadow: `0 0 12px ${stabColor}44` }}>
        {nodesSpliced && isAligned
          ? '✓ TIMELINE STABILIZED'
          : cascadeRisk > 70
            ? '⚠ CRITICAL — TAKE ACTION'
            : cascadeRisk > 30
              ? '~ INSTABILITY DETECTED'
              : '◉ MONITORING NOMINAL'}
      </div>
    </div>
  )
}
