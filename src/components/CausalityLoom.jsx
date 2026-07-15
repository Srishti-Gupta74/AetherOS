import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './CausalityLoom.module.css'

const NODES = [
  { id: 'nodeA', label: 'Node A: Prime Anchor', x: 0.18, y: 0.3, color: '#c88dff', stable: true },
  { id: 'tear',  label: '⚠ Tear: Alpha-7',     x: 0.5,  y: 0.62, color: '#FF0055', stable: false },
  { id: 'nodeB', label: 'Node B: Reroute',      x: 0.78, y: 0.28, color: '#00F2FE', stable: true },
]

export default function CausalityLoom({ timeline, scrubPosition, setScrubPosition, spliceCausalNodes, nodesSpliced, cascadeRisk }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const scrubRef = useRef(scrubPosition)
  const isDraggingRef = useRef(false)
  const splicedRef = useRef(nodesSpliced)
  const [draggingNode, setDraggingNode] = useState(null)
  const [spliceBeam, setSpliceBeam] = useState(false)

  scrubRef.current = scrubPosition
  splicedRef.current = nodesSpliced

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function draw() {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const t = Date.now() * 0.001
      const scrub = scrubRef.current / 100

      // Grid lines
      ctx.strokeStyle = 'rgba(0,242,254,0.06)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 16])
      for (let i = 1; i < 6; i++) {
        ctx.beginPath()
        ctx.moveTo(W * i / 6, 0)
        ctx.lineTo(W * i / 6, H)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, H * i / 5)
        ctx.lineTo(W, H * i / 5)
        ctx.stroke()
      }
      ctx.setLineDash([])

      // Waveform lines (timeline strings)
      const waves = [
        { color: '#c88dff', amp: 22, freq: 1.2, phase: 0,    y: H * 0.28 },
        { color: '#00F2FE', amp: 28, freq: 0.9, phase: 1.1,  y: H * 0.5  },
        { color: '#FF0055', amp: splicedRef.current ? 8 : 38, freq: 1.8, phase: 2.3, y: H * 0.72 },
      ]

      waves.forEach(w => {
        ctx.beginPath()
        ctx.strokeStyle = w.color + '88'
        ctx.lineWidth = 1.5
        for (let x = 0; x <= W; x += 2) {
          const progress = x / W
          const distortion = splicedRef.current ? 0 : Math.max(0, (0.6 - Math.abs(progress - scrub) * 2)) * 15
          const yy = w.y + Math.sin(progress * Math.PI * 4 * w.freq + t + w.phase) * (w.amp + distortion)
          if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy)
        }
        ctx.stroke()

        // Glow pass
        ctx.beginPath()
        ctx.strokeStyle = w.color + '33'
        ctx.lineWidth = 4
        ctx.filter = 'blur(3px)'
        for (let x = 0; x <= W; x += 4) {
          const progress = x / W
          const distortion = splicedRef.current ? 0 : Math.max(0, (0.6 - Math.abs(progress - scrub) * 2)) * 15
          const yy = w.y + Math.sin(progress * Math.PI * 4 * w.freq + t + w.phase) * (w.amp + distortion)
          if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy)
        }
        ctx.stroke()
        ctx.filter = 'none'
      })

      // Splice beam
      if (splicedRef.current) {
        const nA = NODES[0]
        const nB = NODES[2]
        const ax = nA.x * W, ay = nA.y * H
        const bx = nB.x * W, by = nB.y * H
        const beamGrad = ctx.createLinearGradient(ax, ay, bx, by)
        beamGrad.addColorStop(0, '#c88dff')
        beamGrad.addColorStop(0.5, '#00F2FE')
        beamGrad.addColorStop(1, '#c88dff')
        ctx.strokeStyle = beamGrad
        ctx.lineWidth = 2.5
        ctx.setLineDash([8, 4])
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.stroke()
        ctx.setLineDash([])

        // Energy particles along beam
        for (let i = 0; i < 5; i++) {
          const prog = ((t * 0.4 + i * 0.2) % 1)
          const px = ax + (bx - ax) * prog
          const py = ay + (by - ay) * prog
          ctx.fillStyle = `rgba(0,242,254,${0.8 - prog * 0.4})`
          ctx.beginPath()
          ctx.arc(px, py, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Draw nodes
      NODES.forEach(node => {
        const nx = node.x * W
        const ny = node.y * H
        const pulse = (Math.sin(t * 2) + 1) / 2

        // Outer glow
        ctx.fillStyle = node.color + '22'
        ctx.beginPath()
        ctx.arc(nx, ny, 18 + pulse * 6, 0, Math.PI * 2)
        ctx.fill()

        // Node circle
        ctx.fillStyle = 'rgba(7,9,14,0.9)'
        ctx.beginPath()
        ctx.arc(nx, ny, 12, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = node.color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(nx, ny, 12, 0, Math.PI * 2)
        ctx.stroke()

        // Node label
        ctx.fillStyle = '#ffffff'
        ctx.font = '10px JetBrains Mono, monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillStyle = node.color
        ctx.fillText(node.label, nx, ny - 16)
      })

      // Scrubber indicator line
      const sx = scrubRef.current / 100 * W
      ctx.strokeStyle = 'rgba(255,215,0,0.7)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(sx, 0)
      ctx.lineTo(sx, H)
      ctx.stroke()
      ctx.setLineDash([])

      // Scrubber handle
      ctx.fillStyle = '#FFD700'
      ctx.beginPath()
      ctx.arc(sx, 12, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(7,9,14,0.9)'
      ctx.beginPath()
      ctx.arc(sx, 12, 4, 0, Math.PI * 2)
      ctx.fill()

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  // Scrubber drag
  const handleCanvasMouseDown = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = (x / rect.width) * 100
    setScrubPosition(Math.max(0, Math.min(100, pct)))
    isDraggingRef.current = true
  }, [setScrubPosition])

  const handleCanvasMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = (x / rect.width) * 100
    setScrubPosition(Math.max(0, Math.min(100, pct)))
  }, [setScrubPosition])

  const handleCanvasMouseUp = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  const scrubHours = Math.floor((scrubPosition / 100) * 12)
  const scrubMins = Math.floor(((scrubPosition / 100) * 12 * 60) % 60)
  const scrubSecs = Math.floor(((scrubPosition / 100) * 12 * 3600) % 60)

  return (
    <div className={`glass-panel ${styles.loom}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div className="panel-label">[02] The Causality Loom</div>
        {!nodesSpliced ? (
          <button
            id="splice-btn"
            className={styles.spliceBtn}
            onClick={() => { spliceCausalNodes(); setSpliceBeam(true) }}
          >
            ⚡ Splice Causal Nodes
          </button>
        ) : (
          <div className={styles.splicedBadge}>✓ Nodes Spliced — Cascade Contained</div>
        )}
      </div>

      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={680}
          height={220}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          style={{ cursor: 'crosshair' }}
        />
      </div>

      <div className={styles.scrubBar}>
        <div className={styles.scrubBtn}>⏮ Rewind Causality</div>
        <div className={styles.scrubTrack}>
          <input
            id="causality-scrubber"
            type="range"
            min={0}
            max={100}
            value={scrubPosition}
            onChange={e => setScrubPosition(Number(e.target.value))}
            className={styles.scrubInput}
          />
          <div className={styles.scrubTime}>
            [ T: -{String(scrubHours).padStart(2,'0')}h : {String(scrubMins).padStart(2,'0')}m : {String(scrubSecs).padStart(2,'0')}s ]
          </div>
        </div>
        <div className={styles.scrubBtn}>Fast Forward ⏭</div>
      </div>
    </div>
  )
}
