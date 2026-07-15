import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import './index.css'
import Scene3D from './components/Scene3D'

/* ══════════════════════════════════════════════
   AUDIO SYSTEM — Web Audio API
══════════════════════════════════════════════ */
const AudioSystem = (() => {
  let ctx = null
  const init = () => {
    try { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)() } catch(e) {}
  }
  const tone = (freq, dur, type = 'sine', vol = 0.07) => {
    try {
      init(); if (!ctx) return
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = type; osc.frequency.value = freq
      gain.gain.setValueAtTime(vol, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
      osc.start(); osc.stop(ctx.currentTime + dur)
    } catch(e) {}
  }
  return {
    alert:    () => { tone(260, 0.22, 'sawtooth', 0.05); setTimeout(() => tone(210, 0.3, 'sawtooth', 0.04), 280) },
    success:  () => { tone(523, 0.12); setTimeout(() => tone(659, 0.12), 130); setTimeout(() => tone(784, 0.28), 260) },
    splice:   () => { [0,55,120].forEach((t,i) => setTimeout(() => tone(440*(2**i), 0.1+i*0.08, i===2?'sine':'square', 0.05), t)) },
    lock:     () => { tone(900, 0.08, 'sine', 0.04); setTimeout(() => tone(1100, 0.15, 'sine', 0.04), 110) },
    protocol: () => { [0,90,180,270,360].forEach((t,i) => setTimeout(() => tone(180+i*28, 0.15, 'sawtooth', 0.07), t)) },
    click:    () => tone(1400, 0.04, 'square', 0.025),
    tab:      () => { tone(440, 0.06, 'sine', 0.04); setTimeout(() => tone(550, 0.09, 'sine', 0.03), 70) },
    warpLeap: () => {
      // Soft, breathtaking celestial crystal Solfeggio arpeggio (pure sine waves)
      [432.8, 528, 639, 852].forEach((f, idx) => {
        setTimeout(() => tone(f, 0.85, 'sine', 0.05 - idx * 0.008), idx * 140)
      })
      // Deep calming quantum bass hum (pure sine)
      tone(108, 1.2, 'sine', 0.06)
    },
    reboot:   () => {
      // Calming descending celestial harp sweep (pure sine waves)
      [852, 639, 528, 432.8].forEach((f, idx) => {
        setTimeout(() => tone(f, 0.65, 'sine', 0.045), idx * 110)
      })
      tone(216, 0.8, 'sine', 0.05)
    },
    celestialTab: () => {
      // Crisp, gentle double crystal chime when switching tabs (pure sine)
      tone(528, 0.2, 'sine', 0.04)
      setTimeout(() => tone(639, 0.25, 'sine', 0.035), 80)
    },
    victoryFanfare: () => {
      // Cinematic triumphant sci-fi hyperspeed warp & crystal Solfeggio chord when mission completes!
      // 1. Deep quantum warp swell (bass sine)
      tone(108, 1.8, 'sine', 0.08)
      tone(216, 1.5, 'sine', 0.06)
      
      // 2. Triumphant ascending celestial crystal chords (432.8 Hz -> 528 Hz -> 639 Hz -> 852 Hz -> 1056 Hz)
      const fanfareFreqs = [432.8, 528, 639, 852, 1056]
      fanfareFreqs.forEach((f, idx) => {
        setTimeout(() => {
          tone(f, 1.4 - idx * 0.1, 'sine', 0.065 - idx * 0.006)
          // Add a subtle sawtooth harmonic shimmer for sci-fi richness
          tone(f * 1.5, 0.4, 'triangle', 0.02)
        }, idx * 160)
      })
    }
  }
})()

/* ══════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════ */
const TIMELINES = {
  alpha7: { id:'alpha7', label:'Alpha-7', status:'CRITICAL', colorVal:'#FF0055', cascadeRisk:84.2 },
  alpha8: { id:'alpha8', label:'Alpha-8', status:'UNSTABLE', colorVal:'#FFD700', cascadeRisk:52.7 },
  alpha9: { id:'alpha9', label:'Alpha-9', status:'DECAYING', colorVal:'#a855f7', cascadeRisk:68.4 },
  prime:  { id:'prime',  label:'Prime',   status:'ANCHOR',   colorVal:'#00F2FE', cascadeRisk:4.1  },
}

const BOOT_LINES = [
  { text: 'Initializing Multi-Stream Timeline Loom & quantum core...', color: '#00F2FE' },
  { text: '[ALERT] Paradox Cascade across Alpha-7, Alpha-8 & Alpha-9 detected.', color: '#FF0055' },
  { text: 'Synchronizing Resonance Matrix target frequency to 432.8 MHz...', color: '#a855f7' },
  { text: 'Loading Reality Architect profile — clearance LEVEL-9 (42B lives at stake).', color: '#00F2FE' },
  { text: 'AETHER-OS v9.4 (Sector 4 Command) — SYSTEM READY.', color: '#ffffff' },
]

const BASE_LOGS = [
  { t:'ok',   s:'AETHER-OS v9.4 online. Multi-Stream Timeline Loom active.' },
  { t:'warn', s:'[ALERT] Unauthorized temporal jump fractured Alpha-7 anchor grid.' },
  { t:'info', s:'Scanning Sector 4 parallel branches (Alpha-7, Alpha-8, Alpha-9)...' },
  { t:'crit', s:'[CRITICAL] Paradox Cascade at 84.2% criticality. 42 Billion lives endangered.' },
  { t:'info', s:'Automated failsafes overloaded. Causality Scrubber & Resonance Matrix unlocked.' },
  { t:'warn', s:'Tear coordinates: [38, 91, -4.2z] active on Causality Loom.' },
  { t:'ok',   s:'Awaiting Reality Architect manual intervention...' },
]
const LOG_COLOR = { ok:'#00F2FE', warn:'#FFD700', crit:'#FF0055', info:'#4A5568' }

const STARS = Array.from({ length: 120 }, (_, i) => ({
  id: i, left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
  size: 1+Math.random()*2, dur:`${3+Math.random()*8}s`, delay:`${Math.random()*8}s`,
  color: i%4===0?'#00F2FE':i%4===1?'#a855f7':'#ffffff', opacity: 0.3+Math.random()*0.7,
}))

/* ══════════════════════════════════════════════
   BOOT SCREEN
══════════════════════════════════════════════ */
function BootScreen({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [lines, setLines] = useState([])
  const [fading, setFading] = useState(false)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    const pIv = setInterval(() => setProgress(p => Math.min(p+2, 100)), 38)
    let idx = 0
    const lIv = setInterval(() => {
      if (idx < BOOT_LINES.length) { const l={...BOOT_LINES[idx]}; setLines(p=>[...p,l]); idx++ }
      else clearInterval(lIv)
    }, 430)
    const doneT = setTimeout(() => { setFading(true); setTimeout(() => doneRef.current(), 700) }, 2500)
    return () => { clearInterval(pIv); clearInterval(lIv); clearTimeout(doneT) }
  }, [])

  return (
    <div className="boot" style={{ opacity:fading?0:1, pointerEvents:fading?'none':'all' }}>
      <div style={{ position:'relative', marginBottom:8 }}>
        {[200,280,360].map((s,i) => (
          <div key={i} style={{
            position:'absolute', top:'50%', left:'50%', width:s, height:s,
            borderRadius:'50%', border:`1px solid rgba(${i===0?'0,242,254':i===1?'168,85,247':'123,47,255'},0.15)`,
            transform:'translate(-50%,-50%)', animation:`spin ${12+i*5}s linear infinite`,
          }}/>
        ))}
        <div className="boot-logo">AETHER-OS</div>
      </div>
      <div className="boot-sub">The Reality Loom · v9.4 · Stellar Hack 2026</div>
      <div className="boot-lines" style={{ marginTop:8 }}>
        {lines.map((l,i) => (
          <div key={i} className="boot-line" style={{ color:l.color, animationDelay:`${i*0.05}s` }}>
            <span style={{ color: i<lines.length-1?'#00F2FE':'#a855f7' }}>{i<lines.length-1?'✓':'>'}</span>
            {' '}{l.text}
          </div>
        ))}
      </div>
      <div className="boot-track" style={{ marginTop:8 }}>
        <div className="boot-fill" style={{ width:`${progress}%` }}/>
      </div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'#2d3748', letterSpacing:3, marginTop:4 }}>
        BIOMETRIC SCAN COMPLETE · SECTOR-4 · NEXUS-ZERO
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   LORE / MISSION BRIEFING CAROUSEL (3-STEP WIZARD)
══════════════════════════════════════════════ */
/* ══════════════════════════════════════════════
   LORE / MISSION BRIEFING CAROUSEL (3-STEP WIZARD)
══════════════════════════════════════════════ */
/* ══════════════════════════════════════════════
   LORE / MISSION BRIEFING CAROUSEL (4-STEP UNIVERSE & MISSION WIZARD)
══════════════════════════════════════════════ */
function LoreModal({ open, onClose }) {
  const [slide, setSlide] = useState(0) // 0: The Universe Card | 1: The Crisis | 2: The Protocol | 3: The Launch
  const [launching, setLaunching] = useState(false)
  const [warpText, setWarpText] = useState('INITIALIZING MULTIDIMENSIONAL HYPER-WARP...')

  useEffect(() => {
    if (open) {
      setSlide(0)
      setLaunching(false)
      setWarpText('INITIALIZING MULTIDIMENSIONAL HYPER-WARP...')
    }
  }, [open])

  if (!open) return null

  const nextSlide = () => {
    AudioSystem.celestialTab()
    if (slide < 3) setSlide(slide + 1)
    else triggerMultidimensionalLaunch()
  }

  const prevSlide = () => {
    AudioSystem.celestialTab()
    if (slide > 0) setSlide(slide - 1)
  }

  const triggerMultidimensionalLaunch = () => {
    setLaunching(true)
    AudioSystem.warpLeap()
    
    // Dynamic countdown sequence through multidimensional space
    setTimeout(() => setWarpText('BREACHING QUANTUM TIMELINES ALPHA-7, 8 & 9...'), 700)
    setTimeout(() => setWarpText('ENGAGING 432.8 MHz HARMONIC MATRIX LINK...'), 1400)
    setTimeout(() => setWarpText('WARP TUNNEL ANCHORED · CAUSAL HIGHWAYS ONLINE!'), 2100)
    setTimeout(() => setWarpText('WELCOME TO THE REALITY LOOM · SECTOR 4'), 2700)
    
    setTimeout(() => {
      AudioSystem.celestialTab()
      onClose()
    }, 3200)
  }

  return (
    <div className="modal-ov" style={{ zIndex: 99999, background: 'rgba(2, 4, 12, 0.92)', backdropFilter: 'blur(24px)' }}>
      {/* Sleek Cybernetic Dashboard Data-Pad */}
      <div className="lore-box" style={{
        maxWidth: 820, width: '95%', maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        padding: '28px 34px', border: '1.5px solid rgba(0, 242, 254, 0.35)',
        boxShadow: '0 0 100px rgba(0,0,0,0.8), 0 0 40px rgba(0,242,254,0.2), inset 0 0 30px rgba(0,242,254,0.06)',
        borderRadius: 20, background: 'linear-gradient(165deg, rgba(13,17,28,0.98), rgba(8,11,20,0.99))',
        overflow: 'hidden', position: 'relative'
      }}>
        
        {/* ─── MULTIDIMENSIONAL HYPER-WARP ANIMATED LAUNCH SEQUENCE ─── */}
        {launching ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '50px 20px', minHeight: '62vh', textAlign: 'center', animation: 'fadeIn 0.3s ease',
            position: 'relative', overflow: 'hidden'
          }}>
            {/* Animated Hyperspace Radial Rings & Light Streaks */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', width: '160vw', height: '160vw',
              transform: 'translate(-50%, -50%)', pointerEvents: 'none',
              background: 'radial-gradient(circle, rgba(0,242,254,0.3) 0%, rgba(168,85,247,0.15) 30%, rgba(0,255,136,0.05) 60%, transparent 80%)',
              animation: 'spin 4s linear infinite'
            }}/>
            {[180, 300, 440, 580].map((s, idx) => (
              <div key={idx} style={{
                position: 'absolute', top: '50%', left: '50%', width: s, height: s,
                borderRadius: '50%', border: `1.5px dashed ${idx % 2 === 0 ? '#00F2FE' : idx === 1 ? '#a855f7' : '#00ff88'}`,
                opacity: 0.65, transform: 'translate(-50%, -50%)',
                animation: `spin ${3 + idx * 1.5}s linear infinite ${idx % 2 === 0 ? '' : 'reverse'}`
              }}/>
            ))}

            {/* Glowing Center Portal Orb */}
            <div style={{
              width: 110, height: 110, borderRadius: '50%', marginBottom: 30, position: 'relative',
              background: 'radial-gradient(circle at center, #fff 0%, #00F2FE 40%, #a855f7 80%, transparent 100%)',
              boxShadow: '0 0 60px #00F2FE, 0 0 120px #a855f7, inset 0 0 25px #fff',
              animation: 'pulse 0.8s ease-in-out infinite'
            }}>
              <div style={{
                position: 'absolute', top: -15, left: -15, right: -15, bottom: -15, borderRadius: '50%',
                border: '2px solid rgba(0,242,254,0.6)', animation: 'spin 2s linear infinite'
              }}/>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: '#00F2FE', letterSpacing: 3, marginBottom: 14 }}>
              ✦ MULTIDIMENSIONAL TRAVERSAL ACTIVE ✦
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 950, color: '#fff', letterSpacing: 2, marginBottom: 20, textShadow: '0 0 24px rgba(0,242,254,0.8)' }}>
              {warpText}
            </div>

            <div style={{ width: '70%', maxWidth: 440, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', position: 'relative', marginTop: 10 }}>
              <div style={{
                height: '100%', background: 'linear-gradient(90deg, #00ff88, #00F2FE, #a855f7)',
                animation: 'fillBar 3s linear forwards', boxShadow: '0 0 16px #00F2FE'
              }}/>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#94a3b8', letterSpacing: 1.5, marginTop: 20 }}>
              WARP VELOCITY: <span style={{ color: '#00ff88', fontWeight: 800 }}>99.98% LIGHTSPEED</span> · CAUSAL DRIFT: <span style={{ color: '#00F2FE', fontWeight: 800 }}>0.00%</span>
            </div>
          </div>
        ) : (
          <>
            {/* Top Header (`AETHER-OS v9.4 & Tabs`) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, flexShrink: 0 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00F2FE', letterSpacing: 2, fontWeight: 800 }}>
                  <span style={{ display: 'inline-block', width: 7, height: 7, background: '#00F2FE', boxShadow: '0 0 8px #00F2FE' }}/>
                  SYSTEM STATUS: OPTIMAL · STELLAR HACK SUBMISSION
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 950, color: '#fff', letterSpacing: 3, marginTop: 6 }}>
                  AETHER-OS <span style={{ fontSize: 18, color: '#FFD700', fontWeight: 800 }}>v9.4</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  Chrono-Synthesized Multiverse Command Console. Select briefing module below.
                </div>
              </div>

              {/* 4 Step Tabs (`01 UNIVERSE • 02 CRISIS • 03 PROTOCOL • 04 LAUNCH`) */}
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { id: '01', l: 'UNIVERSE' },
                  { id: '02', l: 'CRISIS' },
                  { id: '03', l: 'PROTOCOL' },
                  { id: '04', l: 'LAUNCH' }
                ].map((tb, idx) => (
                  <button
                    key={tb.id}
                    onClick={() => { AudioSystem.celestialTab(); setSlide(idx) }}
                    style={{
                      padding: '7px 12px', borderRadius: 10, cursor: 'pointer',
                      border: slide === idx ? '1px solid #00F2FE' : '1px solid rgba(255,255,255,0.08)',
                      background: slide === idx ? 'rgba(0, 54, 62, 0.75)' : 'rgba(18, 24, 38, 0.6)',
                      color: slide === idx ? '#fff' : '#64748b',
                      fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 800,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72,
                      boxShadow: slide === idx ? '0 0 20px rgba(0,242,254,0.25)' : 'none', transition: 'all 0.25s'
                    }}
                  >
                    <span style={{ fontSize: 9, color: slide === idx ? '#00F2FE' : '#475569', fontWeight: 900 }}>{tb.id}</span>
                    <span style={{ letterSpacing: 1, marginTop: 2 }}>{tb.l}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Scrollable Inner Slide Content Area ─── */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 6, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              
              {/* SLIDE 0: THE UNIVERSE CARD (Ultra-concise, non-scrollable) */}
              {slide === 0 && (
                <div style={{ animation: 'fadeIn 0.35s ease', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 900, color: '#FFD700', letterSpacing: 2 }}>
                      🪐 THE UNIVERSE CARD · REALITY REIMAGINED
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, padding: '3px 10px', borderRadius: 12, background: 'rgba(255,215,0,0.15)', border: '1px solid #FFD700', color: '#FFD700', fontWeight: 800 }}>
                      THEME: REALITY REIMAGINED
                    </span>
                  </div>

                  <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(13, 17, 28, 0.9)', border: '1px solid rgba(0,242,254,0.3)', borderLeft: '4px solid #00F2FE' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, color: '#00F2FE', letterSpacing: 1.5, marginBottom: 4 }}>
                      UNIVERSE NAME: AETHER-OS: The Reality Loom
                    </div>
                    <p style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.5, margin: 0 }}>
                      In <strong>2184</strong>, physical laws are treated as editable, living code. <strong>AETHER-OS</strong> is an interactive quantum operating system used by Reality Architects to monitor parallel timelines (`Alpha 7-9`), mend causal tears, and quarantine collapsing branches before total simulation decay occurs.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { t: 'Multi-Stream Loom', d: 'Side-by-side 3D cosmic visualization of parallel realities.', c: '#00F2FE' },
                      { t: 'Causality Scrubber', d: 'Interactive temporal slider (+1h) to pinpoint paradox origins.', c: '#FFD700' },
                      { t: 'Resonance Matrix', d: 'Audio-visual sliders (432.8 MHz) to tune timelines into alignment.', c: '#a855f7' },
                      { t: 'Protocol Zero', d: 'One-click Level-9 emergency quarantine of collapsing branches.', c: '#00ff88' }
                    ].map(kf => (
                      <div key={kf.t} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(8,12,22,0.85)', border: `1px solid ${kf.c}44`, borderTop: `2px solid ${kf.c}` }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 900, color: kf.c, marginBottom: 3 }}>{kf.t}</div>
                        <div style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.35 }}>{kf.d}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SLIDE 1: THE CRISIS IN SECTOR 4 (Ultra-concise) */}
              {slide === 1 && (
                <div style={{ animation: 'fadeIn 0.35s ease', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 800, color: '#FF0055', letterSpacing: 2 }}>
                    🚨 EMERGENCY IN SECTOR 4 · PARADOX CASCADE DETECTED
                  </div>
                  <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                    Timeline <strong>Alpha-7</strong> has fractured due to unauthorized temporal leaps. This has triggered a <strong>Paradox Cascade at 84.2% criticality</strong>, causing matter distortions and gravity inversions across billions of worlds (`Alpha 7-9`). You must manually stabilize the grid before total simulation collapse.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[
                      { v: '84.2%', l: 'CASCADE CRITICALITY', d: 'Paradox overload in Sector 4', c: '#FF0055' },
                      { v: '42 BILLION', l: 'LIVES AT STAKE', d: 'Inhabiting Timelines Alpha 7-9', c: '#FFD700' },
                      { v: 'T−06 HOURS', l: 'SIMULATION COLLAPSE', d: 'Estimated causal point of no return', c: '#ff7700' },
                      { v: 'LEVEL-9', l: 'CLEARANCE UNLOCKED', d: 'Full override of 3D Loom & Solfeggio', c: '#00F2FE' }
                    ].map(st => (
                      <div key={st.l} style={{
                        padding: '12px 14px', borderRadius: 12, background: 'rgba(13, 17, 28, 0.85)',
                        border: '1px solid #1e293b', borderLeft: `3.5px solid ${st.c}`
                      }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 950, color: st.c, textShadow: `0 0 14px ${st.c}66` }}>{st.v}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 800, color: '#fff', letterSpacing: 1, marginTop: 3 }}>{st.l}</div>
                        <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{st.d}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SLIDE 2: PROTOCOL OBJECTIVES (Ultra-concise) */}
              {slide === 2 && (
                <div style={{ animation: 'fadeIn 0.35s ease', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 800, color: '#FFD700', letterSpacing: 2 }}>
                    ⚡ STAGE 2 OF 4: CHRONO-ARCHITECT OBJECTIVES
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { id: 'OBJECTIVE 1', t: 'LOCATE & TRIANGULATE', d: 'Scrub temporal slider right below 3D viewport (+1h) to pinpoint coordinates of primary tears.', c: '#00F2FE' },
                      { id: 'OBJECTIVE 2', t: 'RE-TUNE HARMONIC FREQ', d: 'Adjust Resonance sliders exact to 432.8 MHz (or click Auto-Lock) to clear screen distortions.', c: '#FFD700' },
                      { id: 'OBJECTIVE 3', t: 'SPLICE CAUSAL NODES', d: 'Inside the 3D space, drag Node B (purple sphere) onto Node A (gold sphere) to weld the timeline.', c: '#a855f7' },
                      { id: 'OBJECTIVE 4', t: 'ENGAGE QUARANTINE', d: 'Execute Protocol Zero (Level-9 Override), confirming all 3 safety locks to permanently seal anomalies.', c: '#00ff88' }
                    ].map(st => (
                      <div key={st.id} style={{
                        padding: '12px 14px', borderRadius: 12, background: 'rgba(13, 17, 28, 0.85)',
                        border: '1px solid #1e293b', borderLeft: `3.5px solid ${st.c}`,
                        display: 'flex', flexDirection: 'column', gap: 6
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 800, color: st.c,
                            padding: '2px 7px', borderRadius: 6, border: `1px solid ${st.c}44`, background: `${st.c}15`
                          }}>
                            {st.id}
                          </span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 900, color: '#fff', letterSpacing: 0.5 }}>
                          {st.t}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.4 }}>
                          {st.d}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(0, 255, 136, 0.35)',
                    background: 'radial-gradient(ellipse at center, rgba(0,255,136,0.1) 0%, rgba(8,12,24,0.95) 100%)',
                    textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 900, color: '#00ff88', letterSpacing: 1.5
                  }}>
                    ✦ TARGET OUTCOME: 99.9% STABILITY · 42 BILLION LIVES SAVED ✦
                  </div>
                </div>
              )}

              {/* SLIDE 3: FINAL CLEARANCE & LAUNCH (Ultra-concise) */}
              {slide === 3 && (
                <div style={{ animation: 'fadeIn 0.35s ease', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 800, color: '#00ff88', letterSpacing: 2 }}>
                    🚀 STAGE 4 OF 4: LEVEL-9 CLEARANCE AUTHORIZED
                  </div>
                  <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                    Automated failsafes offline. Your <span style={{ color: '#00F2FE', fontWeight: 800 }}>Clearance Level 9</span> grants full manual override to the 3D Reality Loom.
                  </p>

                  <div style={{
                    padding: '16px 20px', borderRadius: 12, background: 'rgba(13, 17, 28, 0.85)',
                    border: '1.5px solid #00F2FE', boxShadow: '0 0 20px rgba(0,242,254,0.18)'
                  }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 900, color: '#00F2FE', marginBottom: 10, letterSpacing: 1 }}>
                      ✦ MANUAL OVERRIDE CHECKLIST:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#fff', fontWeight: 600 }}>
                      <div>✓ 3D Reality Loom Navigation & Touch Warp: <span style={{ color: '#00ff88', fontWeight: 800 }}>ONLINE</span></div>
                      <div>✓ Solfeggio Crystal Harmonic Generators: <span style={{ color: '#00ff88', fontWeight: 800 }}>ARMED (432.8 MHz)</span></div>
                      <div>✓ Quantum Splicing Nodes (Drag & Drop): <span style={{ color: '#00ff88', fontWeight: 800 }}>UNLOCKED</span></div>
                    </div>
                  </div>

                  {/* Multidimensional Launch Banner */}
                  <div style={{
                    padding: '14px 18px', borderRadius: 12, border: '1.5px solid #00ff88',
                    background: 'radial-gradient(ellipse at center, rgba(0,255,136,0.15) 0%, rgba(8,12,24,0.95) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 0 20px rgba(0,255,136,0.2)'
                  }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 900, color: '#00ff88', letterSpacing: 1.5 }}>
                        ✦ MULTIDIMENSIONAL LOOM STANDING BY
                      </div>
                      <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 4 }}>
                        Initiate hyperspace leap using the launch button below.
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 14px', borderRadius: 20, background: 'rgba(0,255,136,0.2)', border: '1px solid #00ff88',
                      color: '#00ff88', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 900, letterSpacing: 1, whiteSpace: 'nowrap'
                    }}>
                      STATUS: ARMED ✓
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Navigation & Cybernetic Footer Bar */}
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  {slide > 0 ? (
                    <button
                      onClick={prevSlide}
                      style={{
                        padding: '10px 20px', borderRadius: 10, background: 'rgba(18, 24, 38, 0.6)',
                        border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontFamily: 'var(--font-mono)',
                        fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      ⬅ Previous
                    </button>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#64748b' }}>Step 1 of 4</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <button
                    onClick={() => { AudioSystem.click(); triggerMultidimensionalLaunch() }}
                    style={{
                      padding: '10px 16px', background: 'transparent', border: 'none',
                      color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    SKIP BRIEFING
                  </button>
                  {slide < 3 ? (
                    <button
                      onClick={nextSlide}
                      style={{
                        padding: '10px 24px', borderRadius: 10,
                        background: 'linear-gradient(90deg, #00F2FE, #0088ff)',
                        border: '1px solid #fff', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 13.5,
                        fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 20px rgba(0,242,254,0.6)', letterSpacing: 1
                      }}
                    >
                      Next Step ➔
                    </button>
                  ) : (
                    <button
                      onClick={triggerMultidimensionalLaunch}
                      style={{
                        padding: '12px 28px', borderRadius: 10,
                        background: 'linear-gradient(90deg, #00ff88, #00F2FE)',
                        border: '2px solid #fff', color: '#000', fontFamily: 'var(--font-mono)', fontSize: 14,
                        fontWeight: 950, cursor: 'pointer', boxShadow: '0 0 32px rgba(0,255,136,0.9)', letterSpacing: 1
                      }}
                    >
                      🚀 LAUNCH WARP ➔
                    </button>
                  )}
                </div>
              </div>

              {/* Exact Footer Telemetry (`NODE: OB-492 / SECTOR 7G`) */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 10, color: '#475569', letterSpacing: 1.5,
                borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10
              }}>
                <span>NODE: OB-492 / SECTOR 7G</span>
                <span>AUTHORIZED REALITY ARCHITECT</span>
                <span>ENCRYPTION: ACTIVE [2048-BIT]</span>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MISSION PROGRESS STEPS
══════════════════════════════════════════════ */
function MissionProgress({ steps }) {
  const labels = [
    { key:'detect', label:'DETECT' },
    { key:'isolate', label:'ISOLATE' },
    { key:'retune', label:'RE-TUNE' },
    { key:'splice', label:'SPLICE & SEAL' },
  ]
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
      {labels.map((s, i) => (
        <div key={s.key} style={{ display:'flex', alignItems:'center', gap:4 }}>
          <div style={{
            display:'flex', alignItems:'center', gap:5,
            padding:'4px 9px', borderRadius:5,
            border: `1px solid ${steps[s.key] ? 'rgba(0,242,254,0.5)' : 'rgba(255,255,255,0.08)'}`,
            background: steps[s.key] ? 'rgba(0,242,254,0.08)' : 'transparent',
            transition:'all 0.4s ease',
          }}>
            <div style={{
              width:5, height:5, borderRadius:'50%',
              background: steps[s.key] ? '#00F2FE' : '#2d3748',
              boxShadow: steps[s.key] ? '0 0 8px #00F2FE' : 'none',
              transition:'all 0.4s ease',
            }}/>
            <span style={{
              fontFamily:'var(--font-mono)', fontSize:7, fontWeight:700, letterSpacing:1.5,
              color: steps[s.key] ? '#00F2FE' : '#2d3748',
              transition:'color 0.4s ease',
            }}>{steps[s.key] ? '✓ ' : ''}{s.label}</span>
          </div>
          {i < labels.length-1 && (
            <div style={{ width:16, height:1, background: steps[s.key] ? 'rgba(0,242,254,0.4)' : 'rgba(255,255,255,0.06)', transition:'background 0.4s' }}/>
          )}
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════
   TOP NAV
══════════════════════════════════════════════ */
function TopNav({ active, switchTimeline, risk, onEmergency, steps, onLore, onVictory, telemetryOpen, onToggleTelemetry }) {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])
  const riskColor = risk>70?'#FF0055':risk>40?'#FFD700':'#00F2FE'

  return (
    <div className="glass nav" style={{ borderColor:'rgba(0,242,254,0.18)' }}>
      {['tl','tr','bl','br'].map(c => (
        <div key={c} className={`corner corner-${c}`} style={{ borderColor:'rgba(0,242,254,0.4)' }}/>
      ))}

      {/* ROW 1 — Logo + Time + Risk + Protocol Zero */}
      <div className="nav-row1">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button id="lore-btn" onClick={() => { AudioSystem.click(); onLore() }} style={{
            width:26, height:26, borderRadius:13, border:'1.5px solid rgba(0,242,254,0.4)',
            background:'rgba(0,242,254,0.08)', color:'#00F2FE', fontFamily:'var(--font-mono)',
            fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.2s', flexShrink:0,
          }} title="View Story / Lore Guide">?</button>
          <button id="telemetry-toggle-btn" onClick={() => { AudioSystem.click(); onToggleTelemetry?.() }} style={{
            background: telemetryOpen ? 'rgba(168,85,247,0.28)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${telemetryOpen ? '#a855f7' : 'rgba(255,255,255,0.18)'}`,
            color: telemetryOpen ? '#fff' : '#cbd5e1', fontFamily:'var(--font-mono)',
            fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 6, cursor:'pointer', display:'flex', alignItems:'center', gap: 5,
            transition:'all 0.2s', flexShrink:0, boxShadow: telemetryOpen ? '0 0 14px rgba(168,85,247,0.4)' : 'none'
          }} title="Toggle Oracle Logs & Diagnostics">💻 {telemetryOpen ? 'LOGS (ACTIVE)' : 'LOGS'}</button>
          <div className="nav-logo">
            <span className="nav-logo-main">AETHER-OS</span>
            <span className="nav-logo-ver">v9.4</span>
          </div>
          <div className="nav-divider"/>
          <div className="nav-coords">{time.toLocaleTimeString('en-US',{hour12:false})} · NEXUS-ZERO · SECTOR-4</div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div className="nav-risk">
            <span className="nav-risk-label">CASCADE RISK</span>
            <span className="nav-risk-val" style={{ color:riskColor }}>{risk.toFixed(1)}%</span>
          </div>
          {risk === 0 ? (
            <button id="victory-btn" className="e-btn"
              style={{
                background: 'linear-gradient(90deg, #00F2FE, #a855f7)', borderColor: '#00F2FE',
                color: '#fff', boxShadow: '0 0 24px rgba(0,242,254,0.6)', animation: 'alertP 1.5s infinite'
              }}
              onClick={() => { AudioSystem.success(); onVictory?.() }}>
              🎉 VICTORY SIMULATION
            </button>
          ) : (
            <button id="protocol-zero-btn" className="e-btn"
              style={{
                animation: steps.splice && risk > 0 ? 'alertP 0.7s ease-in-out infinite' : undefined,
                boxShadow: steps.splice && risk > 0 ? '0 0 28px #FF0055, inset 0 0 14px rgba(255,0,85,0.4)' : undefined,
                transform: steps.splice && risk > 0 ? 'scale(1.05)' : undefined
              }}
              onClick={() => { AudioSystem.protocol(); onEmergency() }}>
              <div className="e-dot"/> PROTOCOL ZERO
            </button>
          )}
        </div>
      </div>

      {/* ROW 2 — Mission Steps + Timeline Tabs */}
      <div className="nav-row2">
        <MissionProgress steps={steps}/>
        <div className="nav-tabs">
          {Object.values(TIMELINES).map(tl => {
            const isDone = risk === 0
            const statusText = isDone ? 'STABILIZED ✓' : tl.status
            const statusColor = isDone ? '#00ff88' : tl.colorVal
            return (
              <button key={tl.id} id={`tab-${tl.id}`} className="nav-tab"
                style={active===tl.id ? { borderColor:statusColor, color:statusColor, background:`${statusColor}18`, boxShadow:`0 0 14px ${statusColor}33` } : {}}
                onClick={() => { AudioSystem.tab(); switchTimeline(tl.id) }}>
                <div className="nav-tab-dot" style={{
                  background:statusColor, boxShadow:`0 0 8px ${statusColor}`,
                  animation:active===tl.id?'blink 0.8s ease-in-out infinite':'blink 2.5s ease-in-out infinite',
                }}/>
                {tl.label}
                <span className="nav-tab-status" style={{ color:statusColor }}>{statusText}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   DRAG-AND-DROP SPLICE NODES
══════════════════════════════════════════════ */
function DragNodes({ onSplice, spliced }) {
  const [nodeB, setNodeB] = useState({ x: 67, y: 43 })
  const [dragging, setDragging] = useState(false)
  const [nearAnchor, setNearAnchor] = useState(false)
  const containerRef = useRef()
  const dragData = useRef({ startCX:0, startCY:0, startPos:{ x:67, y:43 }, rectW:1, rectH:1 })
  const NODE_A = { x:29, y:50 }

  const onMouseDown = useCallback((e) => {
    if (spliced) return
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    dragData.current = { startCX:e.clientX, startCY:e.clientY, startPos:{...nodeB}, rectW:rect.width, rectH:rect.height }
    setDragging(true)
    AudioSystem.click()
  }, [spliced, nodeB])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const d = dragData.current
      const dx = ((e.clientX - d.startCX) / d.rectW) * 100
      const dy = ((e.clientY - d.startCY) / d.rectH) * 100
      const nx = Math.max(5, Math.min(93, d.startPos.x + dx))
      const ny = Math.max(12, Math.min(88, d.startPos.y + dy))
      setNodeB({ x:nx, y:ny })
      const dist = Math.sqrt((nx - NODE_A.x)**2 + (ny - NODE_A.y)**2)
      setNearAnchor(dist < 13)
    }
    const onUp = () => {
      setDragging(false)
      if (nearAnchor) {
        setNodeB({ x:NODE_A.x+3, y:NODE_A.y })
        onSplice()
      } else {
        setNearAnchor(false)
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, nearAnchor, onSplice])

  const svgLine = (x1pct, y1pct, x2pct, y2pct, color, dash, opacity=1) => (
    <line
      x1={`${x1pct}%`} y1={`${y1pct}%`}
      x2={`${x2pct}%`} y2={`${y2pct}%`}
      stroke={color} strokeWidth="2"
      strokeDasharray={dash} opacity={opacity}
    />
  )

  return (
    <div ref={containerRef} style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
      {/* SVG connector beam */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}>
        {dragging && svgLine(NODE_A.x, NODE_A.y, nodeB.x, nodeB.y,
          nearAnchor ? '#00F2FE' : 'rgba(168,85,247,0.4)',
          nearAnchor ? '4,3' : '2,6',
          nearAnchor ? 1 : 0.6
        )}
        {spliced && svgLine(NODE_A.x, NODE_A.y, NODE_A.x+3, NODE_A.y, '#00F2FE', 'none', 1)}
      </svg>

      {/* Node A — Prime Anchor (fixed) */}
      <div style={{
        position:'absolute', left:`${NODE_A.x}%`, top:`${NODE_A.y}%`,
        transform:'translate(-50%,-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:5,
        pointerEvents:'none', zIndex:10,
      }}>
        <div style={{
          padding:'5px 12px', borderRadius:20,
          background: spliced ? 'rgba(0,242,254,0.18)' : 'rgba(255,215,0,0.12)',
          border:`1.5px solid ${spliced?'#00F2FE':'#FFD700'}`,
          fontFamily:'var(--font-mono)', fontSize:9, fontWeight:700,
          color: spliced?'#00F2FE':'#FFD700', letterSpacing:1,
          whiteSpace:'nowrap', boxShadow:`0 0 18px ${spliced?'rgba(0,242,254,0.35)':'rgba(255,215,0,0.25)'}`,
          transition:'all 0.4s ease',
        }}>
          {spliced ? '✓' : '⚡'} Node A: Prime Anchor
        </div>
        <div style={{
          width:10, height:10, borderRadius:'50%',
          background: spliced?'#00F2FE':'#FFD700',
          boxShadow:`0 0 ${spliced?16:8}px ${spliced?'#00F2FE':'#FFD700'}`,
          animation:'blink 1.5s ease-in-out infinite', transition:'all 0.4s',
        }}/>
      </div>

      {/* Node B — Reroute Splice (draggable) */}
      {!spliced && (
        <div
          onMouseDown={onMouseDown}
          style={{
            position:'absolute', left:`${nodeB.x}%`, top:`${nodeB.y}%`,
            transform:'translate(-50%,-50%)',
            display:'flex', flexDirection:'column', alignItems:'center', gap:5,
            pointerEvents:'all', cursor:dragging?'grabbing':'grab',
            userSelect:'none', zIndex:11, transition: dragging?'none':'all 0.05s',
          }}
        >
          <div style={{
            width:10, height:10, borderRadius:'50%',
            background: nearAnchor?'#00F2FE':'#a855f7',
            boxShadow:`0 0 ${nearAnchor?20:10}px ${nearAnchor?'#00F2FE':'#a855f7'}`,
            transition:'all 0.15s', animation: nearAnchor ? 'blink 0.4s ease-in-out infinite' : 'blink 2s ease-in-out infinite',
          }}/>
          <div style={{
            padding:'5px 12px', borderRadius:20,
            background: nearAnchor?'rgba(0,242,254,0.18)':'rgba(168,85,247,0.12)',
            border:`1.5px solid ${nearAnchor?'#00F2FE':'#a855f7'}`,
            fontFamily:'var(--font-mono)', fontSize:9, fontWeight:700,
            color: nearAnchor?'#00F2FE':'#a855f7', letterSpacing:1,
            whiteSpace:'nowrap',
            boxShadow:`0 0 ${nearAnchor?24:14}px ${nearAnchor?'rgba(0,242,254,0.55)':'rgba(168,85,247,0.3)'}`,
            transition:'all 0.2s', transform: nearAnchor?'scale(1.08)':'scale(1)',
          }}>
            {nearAnchor ? '→ RELEASE TO CONNECT' : '⟁ Node B: Reroute Splice'}
          </div>
        </div>
      )}

      {/* Tear marker */}
      {!spliced && (
        <div style={{
          position:'absolute', left:'56%', top:'33%', transform:'translate(-50%,-50%)',
          pointerEvents:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:3,
        }}>
          <div style={{
            padding:'3px 10px', borderRadius:4,
            background:'rgba(255,0,85,0.1)', border:'1px solid rgba(255,0,85,0.55)',
            fontFamily:'var(--font-mono)', fontSize:8, color:'#FF0055',
            letterSpacing:1, whiteSpace:'nowrap', animation:'blink 1.4s ease-in-out infinite',
          }}>⚠ Tear: Alpha-7 Anomaly</div>
        </div>
      )}

      {/* Drag instruction */}
      {!spliced && !dragging && (
        <div style={{
          position:'absolute', bottom:44, left:'50%', transform:'translateX(-50%)',
          fontFamily:'var(--font-mono)', fontSize:8, color:'rgba(168,85,247,0.55)',
          letterSpacing:1.5, pointerEvents:'none', whiteSpace:'nowrap',
          animation:'hintFade 3s ease-in-out infinite',
        }}>
          DRAG Node B → Node A to splice the causal tear
        </div>
      )}

      {/* Near anchor pulse ring */}
      {dragging && nearAnchor && (
        <div style={{
          position:'absolute', left:`${NODE_A.x}%`, top:`${NODE_A.y}%`,
          transform:'translate(-50%,-50%)',
          width:48, height:48, borderRadius:'50%',
          border:'2px solid #00F2FE', opacity:0.6,
          pointerEvents:'none',
          animation:'popIn 0.3s ease forwards',
        }}/>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   DIMENSIONAL RADAR (Left Panel - Interactive Tactical Hub)
══════════════════════════════════════════════ */
function RadarPanel({ risk, spliced, onAutoCalibrate }) {
  const cvRef = useRef()
  const animRef = useRef()
  const angleRef = useRef(0)
  const [activeSector, setActiveSector] = useState(3) // 0 to 3 for Sectors 1-4
  const [pingActive, setPingActive] = useState(false)
  const [shieldActive, setShieldActive] = useState(false)

  const sectors = [
    { id: 0, name: 'SECTOR 1: Alpha-7 Fracture', angle: Math.PI * 0.25, riskVal: spliced ? 0.2 : 84.2, status: spliced ? 'SEALED ✓' : 'CRITICAL', c: '#FF0055' },
    { id: 1, name: 'SECTOR 2: Alpha-8 Matrix', angle: Math.PI * 0.75, riskVal: spliced ? 0.0 : 52.7, status: 'UNSTABLE', c: '#FFD700' },
    { id: 2, name: 'SECTOR 3: Alpha-9 Decay', angle: Math.PI * 1.25, riskVal: spliced ? 0.0 : 68.4, status: 'DECAYING', c: '#a855f7' },
    { id: 3, name: 'SECTOR 4: Nexus-Zero Hub', angle: Math.PI * 1.75, riskVal: risk, status: risk === 0 ? 'STABILIZED ✓' : spliced ? 'RUN PROTOCOL 0' : 'ACTIVE HUB', c: '#00F2FE' },
  ]
  const curSector = sectors[activeSector] || sectors[3]

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return
    const ctx = cv.getContext('2d')
    const S = cv.width
    function draw() {
      ctx.clearRect(0, 0, S, S)
      const cx = S / 2, cy = S / 2, r = S * 0.42

      // Radar background glow
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.1)
      bg.addColorStop(0, shieldActive ? 'rgba(0, 255, 136, 0.15)' : 'rgba(0, 242, 254, 0.1)')
      bg.addColorStop(1, 'transparent')
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2); ctx.fill()

      // Concentric grid rings
      const rings = [
        { f: 1, c: shieldActive ? 'rgba(0,255,136,0.6)' : 'rgba(123,47,255,0.5)', d: [4, 5] },
        { f: 0.68, c: 'rgba(0,242,254,0.3)', d: [2, 6] },
        { f: 0.35, c: 'rgba(0,242,254,0.22)', d: [1, 6] }
      ]
      rings.forEach(function(rg) {
        ctx.strokeStyle = rg.c; ctx.lineWidth = 1.5; ctx.setLineDash(rg.d)
        ctx.beginPath(); ctx.arc(cx, cy, r * rg.f, 0, Math.PI * 2); ctx.stroke()
      })

      // 4 Sector dividing lines & sector highlights
      ctx.setLineDash([]); ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)'; ctx.lineWidth = 1
      for (let a = 0; a < 4; a++) {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate((a * Math.PI / 2) + (Math.PI / 4))
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, 0); ctx.stroke(); ctx.restore()
      }

      // Highlight active clicked sector wedge
      ctx.save(); ctx.translate(cx, cy); ctx.rotate((activeSector * Math.PI / 2))
      ctx.fillStyle = `${curSector.c}18`
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, 0, Math.PI / 2); ctx.closePath(); ctx.fill()
      ctx.restore()

      // Rotating radar sweep beam
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(angleRef.current)
      const sw = ctx.createLinearGradient(0, 0, r, 0)
      sw.addColorStop(0, shieldActive ? '#00ff88' : '#00F2FE'); sw.addColorStop(1, 'transparent')
      ctx.strokeStyle = sw; ctx.lineWidth = 3; ctx.setLineDash([])
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, 0); ctx.stroke()
      ctx.fillStyle = shieldActive ? 'rgba(0,255,136,0.08)' : 'rgba(0,242,254,0.06)'
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, 0, Math.PI * 0.28); ctx.closePath(); ctx.fill()
      ctx.restore()

      // Active Sonar Ping ripple animation when button clicked
      if (pingActive) {
        const pingR = ((Date.now() % 1200) / 1200) * r
        const pingAlpha = 1 - ((Date.now() % 1200) / 1200)
        ctx.strokeStyle = `rgba(0, 242, 254, ${pingAlpha})`
        ctx.lineWidth = 2.5; ctx.setLineDash([])
        ctx.beginPath(); ctx.arc(cx, cy, pingR, 0, Math.PI * 2); ctx.stroke()
      }

      // Anomaly targets on radar canvas
      if (!spliced && risk > 20) {
        [[Math.PI * 0.35, 0.65], [Math.PI * 0.85, 0.72], [Math.PI * 1.8, 0.5]].forEach(function(ab, idx) {
          const a = ab[0], d = ab[1]
          const bx = cx + Math.cos(a) * r * d, by = cy + Math.sin(a) * r * d
          const al = (Math.sin(Date.now() * 0.008 + idx * 2) + 1) / 2
          ctx.fillStyle = `rgba(255,0,85,${0.6 + al * 0.4})`
          ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = `rgba(255,0,85,${al * 0.25})`
          ctx.beginPath(); ctx.arc(bx, by, 14, 0, Math.PI * 2); ctx.fill()
          // Crosshairs around anomaly
          ctx.strokeStyle = '#FF0055'; ctx.lineWidth = 1; ctx.setLineDash([])
          ctx.strokeRect(bx - 8, by - 8, 16, 16)
        })
      }

      // Center quantum hub core icon
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.24)
      cg.addColorStop(0, shieldActive ? 'rgba(0,255,136,0.9)' : 'rgba(123,47,255,0.9)')
      cg.addColorStop(0.6, 'rgba(0,242,254,0.4)')
      cg.addColorStop(1, 'transparent')
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, r * 0.24, 0, Math.PI * 2); ctx.fill()
      ctx.font = '16px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(shieldActive ? '🛡️' : '🌌', cx, cy)

      angleRef.current += pingActive ? 0.06 : 0.028
      animRef.current = requestAnimationFrame(draw)
    }
    draw(); return () => cancelAnimationFrame(animRef.current)
  }, [risk, spliced, activeSector, pingActive, shieldActive])

  const stab = Math.max(0, 100 - risk)
  const sc = stab > 60 ? '#00F2FE' : stab > 35 ? '#FFD700' : '#FF0055'

  const triggerPing = () => {
    AudioSystem.click()
    setPingActive(true)
    setTimeout(() => setPingActive(false), 2600)
  }

  const toggleShield = () => {
    AudioSystem.click()
    setShieldActive(!shieldActive)
  }

  return (
    <div className="glass l-panel" style={{ borderColor: 'rgba(0,242,254,0.25)', minWidth: 260 }}>
      <div className="ph" style={{ fontSize: 13, fontWeight: 800 }}>
        <div className="ph-dot" style={{ background: '#00F2FE', width: 8, height: 8 }}/>
        [01] Dimensional Radar Hub
      </div>

      {/* Radar Canvas with click-to-scan */}
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', cursor: 'crosshair', margin: '8px 0' }} onClick={triggerPing}>
        <canvas ref={cvRef} width={200} height={200}/>
      </div>

      {/* Active Sector High-Contrast Readout */}
      <div style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.45)', borderLeft: `3px solid ${curSector.c}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, color: '#fff' }}>{curSector.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: `${curSector.c}22`, color: curSector.c }}>
            {curSector.status}
          </span>
        </div>
      </div>

      {/* High-Contrast Stat Metrics */}
      <div className="stat-blk" style={{ padding: '10px 12px' }}>
        <div className="stat-row">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#e2e8f0', letterSpacing: 0.5 }}>ACTIVE ANOMALIES</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: !spliced && curSector.riskVal > 20 ? '#FF0055' : '#00F2FE' }}>
            {!spliced && curSector.riskVal > 20 ? 3 : 0}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
        {[
          { label: 'CASCADE RISK', val: `${curSector.riskVal.toFixed(1)}%`, pct: curSector.riskVal, c: curSector.riskVal > 70 ? '#FF0055' : curSector.riskVal > 30 ? '#FFD700' : '#00ff88' },
          { label: 'SECTOR STABILITY', val: `${Math.max(0, 100 - curSector.riskVal).toFixed(1)}%`, pct: Math.max(0, 100 - curSector.riskVal), c: '#00F2FE' },
        ].map(it => (
          <div key={it.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: '#e2e8f0', letterSpacing: 0.5 }}>{it.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 800, color: it.c }}>{it.val}</span>
            </div>
            <div className="bar-track" style={{ height: 6 }}>
              <div className="bar-fill" style={{ width: `${it.pct}%`, background: it.c, boxShadow: `0 0 10px ${it.c}` }}/>
            </div>
          </div>
        ))}
      </div>

      <div className="status-badge" style={{ borderColor: sc, color: sc, boxShadow: `0 0 14px ${sc}35`, fontSize: 12, fontWeight: 800, padding: '8px 10px' }}>
        {risk === 0 ? '✦ ALL TIMELINES STABILIZED (0.0%)' : spliced ? '⚡ NODES SPLICED — RUN PROTOCOL ZERO' : curSector.riskVal > 70 ? '⚠ CRITICAL SECTOR — ACT NOW' : '~ RE-TUNING IN PROGRESS...'}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   STORY & MISSION COMMANDER (Hero AI Dialogue Banner)
══════════════════════════════════════════════ */
function StoryCommander({ steps = {}, risk = 84.2, aligned = false, spliced = false, onVictory, onQuickAction }) {
  let stage = 1
  if (steps.p0 || (steps.splice && risk === 0)) stage = 5
  else if (spliced || steps.splice) stage = 4
  else if (aligned || steps.retune) stage = 3
  else if (steps.isolate) stage = 2
  else stage = 1

  const [minimized, setMinimized] = useState(stage === 5)

  useEffect(() => {
    if (stage === 5) setMinimized(true)
  }, [stage])

  const narrative = [
    {
      stage: 1,
      speaker: 'ORACLE-AI EMERGENCY BROADCAST',
      story: 'Welcome, Architect! For the most immersive evaluation, click [ ⛶ ENTER FULLSCREEN MODE ] at the top right! A timeline anomaly appeared in this sector 12 hours ago. Look at the 3D screen below — see the pulsing red tear? We need to fast-forward the timeline to locate and repair it.',
      action: '👉 STEP 1 ACTION: Click "+1h FAST FORWARD ⏭" below the 3D screen (or drag the slider) until the time reaches 100%.',
      quickBtn: '✨ Auto-Lock (100%)',
      target: 'Timeline Scrubber [Below 3D Screen]',
      c: '#00F2FE'
    },
    {
      stage: 2,
      speaker: 'ORACLE-AI SECTOR STATUS',
      story: 'Great job locking onto the anomaly! Now the screen might look slightly unstable or distorted. Let us tune our harmonic frequencies to clear up the visual interference.',
      action: '👉 STEP 2 ACTION: Look at the bottom Stage Control Dock right below the 3D universe! Drag the Frequency slider or click [ ✨ AUTO-LOCK 432.8 MHz & PHASE SYNC ] to pass.',
      quickBtn: '✨ Auto-Tune (432.8 MHz)',
      target: 'Resonance Tuner [Bottom Stage Dock]',
      c: '#FFD700'
    },
    {
      stage: 3,
      speaker: 'ORACLE-AI CAUSAL DIRECTIVE',
      story: 'Harmonics locked at 432.8 MHz! The screen is crystal clear now. Look back inside the 3D screen: we must reconnect the broken timeline branch to seal the anomaly.',
      action: '👉 STEP 3 ACTION: Inside the 3D screen below, click and drag Node B (purple circle) directly onto Node A (gold circle) to connect them.',
      quickBtn: '⚡ Quick Weld Nodes',
      target: 'Causality Loom [3D Screen]',
      c: '#a855f7'
    },
    {
      stage: 4,
      speaker: 'ORACLE-AI CRITICAL ALERT',
      story: 'Timeline nodes are connected! To finalize your repairs and protect the sector from future anomalies, you must activate the emergency shield protocol.',
      action: '👉 FINAL STEP (4/4): Look at the bottom Stage Control Dock right below the 3D universe! Click the glowing red button: [ 🛡️ ENGAGE PROTOCOL ZERO ] and confirm the 3 safety locks.',
      quickBtn: '🚀 Launch Protocol Zero',
      target: 'Protocol Zero Button [Bottom Stage Dock]',
      c: '#FF0055'
    },
    {
      stage: 5,
      speaker: 'INTERDIMENSIONAL COUNCIL LOG',
      story: '🎉 PROTOCOL ZERO ENGAGED! Sector quarantine complete and stability restored to 99.9%. You have halted the cascade and saved 42 billion lives across three timelines.',
      action: '✦ MISSION COMPLETED (5/5) — Feel free to orbit the 3D quantum core, switch timelines in the top right, or launch the victory simulation.',
      quickBtn: '🎉 Launch Victory Sim',
      target: 'Sector 4 Stabilized',
      c: '#00ff88'
    }
  ]

  const n = narrative[stage - 1] || narrative[0]

  if (stage === 5) {
    return (
      <div style={{
        position: 'relative', width: '100%', marginBottom: 8, zIndex: 20, flexShrink: 0,
        padding: '10px 16px', borderRadius: 10,
        background: 'rgba(6, 12, 28, 0.88)', border: '1.5px solid #00ff88',
        boxShadow: '0 0 24px rgba(0,255,136,0.25)', backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 12px #00ff88', animation: 'blink 1.2s infinite' }}/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 900, color: '#00ff88', letterSpacing: 1.5 }}>
            INTERDIMENSIONAL COUNCIL LOG
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, padding: '2px 8px', borderRadius: 12, background: 'rgba(0,255,136,0.2)', color: '#00ff88', fontWeight: 700 }}>
            STAGE 5 / 5
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#cbd5e1', marginLeft: 6 }}>
            TARGET: Sector 4 Stabilized (0.0% Risk)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => { AudioSystem.celestialTab(); setMinimized(!minimized) }}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', borderRadius: 6, padding: '6px 10px', fontSize: 10, cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontWeight: 700
            }}
          >
            {minimized ? '▼ EXPAND' : '▲ MINIMIZE'}
          </button>
        </div>
        {!minimized && (
          <div style={{ width: '100%', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 13, color: '#e2e8f0', margin: 0, lineHeight: 1.5 }}>
              {n.story}
            </p>
            <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(0,255,136,0.1)', borderLeft: '3px solid #00ff88', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13 }}>✦</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                {n.action}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      position: 'relative', width: '100%', marginBottom: 8, zIndex: 20, flexShrink: 0,
      padding: '14px 18px', borderRadius: 14,
      background: 'radial-gradient(ellipse at center, rgba(8, 16, 32, 0.96) 0%, rgba(4, 8, 18, 0.98) 100%)',
      border: `2px solid ${n.c}`,
      boxShadow: `0 0 28px ${n.c}33`, backdropFilter: 'blur(20px)', transition: 'all 0.3s ease', animation: 'fadeIn 0.4s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%', background: n.c,
            boxShadow: `0 0 12px ${n.c}`, animation: 'blink 1.2s ease-in-out infinite'
          }}/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 950, color: n.c, letterSpacing: 2 }}>
            {n.speaker}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 10px', borderRadius: 12, background: `${n.c}25`, color: n.c, fontWeight: 800 }}>
            STAGE {stage} / 5
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#e2e8f0', marginLeft: 6, fontWeight: 600 }}>
            TARGET: <strong style={{ color: n.c }}>{n.target}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => { AudioSystem.celestialTab(); setMinimized(!minimized) }}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', borderRadius: 6, padding: '5px 12px', fontSize: 10.5, cursor: 'pointer',
              fontFamily: 'var(--font-mono)', transition: 'all 0.2s', fontWeight: 800
            }}
          >
            {minimized ? '▼ EXPAND HUD' : '▲ MINIMIZE HUD'}
          </button>
        </div>
      </div>

      {!minimized && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, color: '#F8FAFC', lineHeight: 1.6, margin: 0, fontWeight: 500, letterSpacing: 0.3 }}>
            {n.story}
          </p>
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: `linear-gradient(90deg, ${n.c}22, rgba(0,242,254,0.14))`,
            borderLeft: `4px solid ${n.c}`,
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: 15 }}>⚡</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 900, color: '#FFFFFF', letterSpacing: 0.6 }}>
              {n.action}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   3D VIEWPORT PANEL (Center)
══════════════════════════════════════════════ */
function ViewportPanel({ risk, spliced, scrub, setScrub, doSplice, onScrubUsed, steps = {}, aligned = false, onVictory, onQuickAction, telemetryOpen, onToggleTelemetry, onLore, freq, setFreq, phase, setPhase, doRetune, modalOpen, modalDone, confirmP0, onEmergency, onEmergencyClose, victoryOpen, onVictoryClose, onRestart }) {
  const [isFull, setIsFull] = useState(false)
  const [uiCollapsed, setUiCollapsed] = useState(false)
  const [fsPromptDismissed, setFsPromptDismissed] = useState(false)

  useEffect(() => {
    if (steps.detect && !steps.isolate && !spliced && risk > 80) {
      setFsPromptDismissed(false)
    }
  }, [steps.detect, steps.isolate, spliced, risk])

  const panelRef = useRef()
  const riskColor = risk>70?'#FF0055':risk>40?'#FFD700':'#00F2FE'
  const h=Math.floor(scrub/100*12), m=Math.floor((scrub/100*12*60)%60), s=Math.floor((scrub/100*720*60)%60)

  let stage = 1
  if (steps.p0 || (steps.splice && risk === 0)) stage = 5
  else if (spliced || steps.splice) stage = 4
  else if (aligned || steps.retune) stage = 3
  else if (steps.isolate) stage = 2
  else stage = 1

  const toggleFull = () => {
    AudioSystem.click()
    if (!isFull) {
      setIsFull(true)
      try { if (panelRef.current?.requestFullscreen) panelRef.current.requestFullscreen() } catch(e) {}
    } else {
      setIsFull(false)
      try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen() } catch(e) {}
    }
  }

  useEffect(() => {
    const onFsChange = () => { if (!document.fullscreenElement && isFull) setIsFull(false) }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [isFull])

  const handleScrub = (v) => {
    setScrub(v)
    onScrubUsed()
  }

  return (
    <div ref={panelRef} className={`glass c-panel ${isFull?'is-fullscreen':''}`} style={{ borderColor: 'rgba(0,242,254,0.22)' }}>
      <div className="viewport-label">
        <div className="ph" style={{marginBottom:0}}>
          <div className="ph-dot" style={{background:'#00F2FE'}}/>
          [02] Causality Loom — 3D Reality Viewport
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button id="toggle-ui-collapse-btn" className="fs-btn" onClick={() => { AudioSystem.click(); setUiCollapsed(!uiCollapsed) }} style={{
            background: uiCollapsed ? 'rgba(0,255,136,0.25)' : 'rgba(0,242,254,0.1)',
            borderColor: uiCollapsed ? '#00ff88' : 'rgba(0,242,254,0.4)',
            color: uiCollapsed ? '#00ff88' : '#00F2FE',
            fontWeight: 800
          }}>
            👁️ {uiCollapsed ? '▲ SHOW ALL UI' : '▼ COLLAPSE ALL UI'}
          </button>
          <button id="viewport-lore-btn" className="fs-btn" onClick={() => { AudioSystem.click(); onLore?.() }} style={{
            background: 'linear-gradient(90deg, rgba(255,215,0,0.18), rgba(0,242,254,0.12))',
            borderColor: '#FFD700',
            color: '#FFD700',
            fontWeight: 850
          }}>
            🪐 UNIVERSE CARD
          </button>
          <button id="viewport-telemetry-toggle-btn" className="fs-btn" onClick={() => { AudioSystem.click(); onToggleTelemetry?.() }} style={{
            background: telemetryOpen ? 'rgba(168,85,247,0.28)' : 'rgba(168,85,247,0.1)',
            borderColor: telemetryOpen ? '#a855f7' : 'rgba(168,85,247,0.4)',
            color: telemetryOpen ? '#fff' : '#c084fc',
          }}>
            💻 {telemetryOpen ? '✕ HIDE DIAGNOSTICS' : '▸ TERMINAL LOGS'}
          </button>
          <button id="fullscreen-btn" className="fs-btn" onClick={toggleFull} style={{
            background: isFull ? 'rgba(255,0,85,0.2)' : 'linear-gradient(90deg, rgba(0,242,254,0.35), rgba(255,215,0,0.3))',
            borderColor: isFull ? '#FF0055' : '#00F2FE',
            color: isFull ? '#FF0055' : '#00F2FE',
            fontWeight: 950,
            boxShadow: isFull ? 'none' : '0 0 25px rgba(0,242,254,0.8)',
            animation: !isFull ? 'quantumPulse 2s infinite ease-in-out' : 'none',
            letterSpacing: 0.8,
            padding: '6px 16px'
          }}>
            {isFull ? '✕ EXIT FULLSCREEN' : '⛶ ENTER FULLSCREEN (RECOMMENDED)'}
          </button>
          {spliced
            ? <div className="spliced-tag">✓ Causal Nodes Sealed</div>
            : <button id="splice-btn" className="splice-btn" onClick={() => { AudioSystem.click(); doSplice() }} style={{ animation: stage === 3 ? 'alertP 1s infinite' : 'none' }}>⚡ Quick Splice</button>
          }
        </div>
      </div>

      {!uiCollapsed && (isFull || stage !== 1 || fsPromptDismissed) && (
        <StoryCommander steps={steps} risk={risk} aligned={aligned} spliced={spliced} onVictory={onVictory} onQuickAction={onQuickAction} />
      )}

      <div className="viewport-3d">
        {/* Stage 1 Fullscreen Recommendation Pop-Up Banner (Ultra-futuristic Quantum Cockpit theme) */}
        {!isFull && stage === 1 && !fsPromptDismissed && (
          <div style={{
            position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 999, width: '92%', maxWidth: 560, maxHeight: '92%', overflowY: 'auto',
            padding: '18px 22px', borderRadius: 16,
            background: 'radial-gradient(ellipse at center, rgba(10, 16, 36, 0.98) 0%, rgba(4, 7, 18, 0.99) 100%)',
            border: '2px solid #00F2FE',
            boxShadow: '0 0 50px rgba(0, 242, 254, 0.45), inset 0 0 25px rgba(0, 242, 254, 0.15)',
            backdropFilter: 'blur(24px)', animation: 'fadeIn 0.4s ease, cyanGlow 3s infinite ease-in-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 950, color: '#00F2FE', letterSpacing: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 15 }}>✦</span> AETHER-OS COCKPIT DIRECTIVE · STELLAR HACK 2026
              </div>
              <button onClick={() => { AudioSystem.click(); setFsPromptDismissed(true) }} style={{
                background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 18, cursor: 'pointer', padding: '0 4px', fontWeight: 900
              }}>✕</button>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 900, color: '#FFFFFF', letterSpacing: 1.1, marginBottom: 8, textShadow: '0 0 16px rgba(0,242,254,0.6)' }}>
              OPTIMIZE YOUR 3D REALITY LOOM EVALUATION
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: '#E2E8F0', lineHeight: 1.5, margin: '0 0 12px', fontWeight: 500 }}>
              To inspect the quantum starfield, causality rings, and timeline anomalies with <strong style={{ color: '#00F2FE', fontWeight: 900 }}>100% visual clarity</strong> and maximum screen real estate, we strongly recommend engaging <strong style={{ color: '#FFD700', fontWeight: 900 }}>FULLSCREEN COCKPIT MODE</strong> right now before initializing Stage 1.
            </p>

            {/* Interactive 3D Capabilities Highlight Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14,
              fontFamily: 'var(--font-mono)'
            }}>
              <div style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(0, 242, 254, 0.12)', border: '1px solid rgba(0, 242, 254, 0.4)', textAlign: 'left' }}>
                <div style={{ fontSize: 10.5, fontWeight: 900, color: '#00F2FE', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>🖱️</span> ROTATE & PAN 3D
                </div>
                <div style={{ fontSize: 10, color: '#CBD5E1', lineHeight: 1.25 }}>Click & drag anywhere to orbit the reality loom.</div>
              </div>

              <div style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(255, 215, 0, 0.12)', border: '1px solid rgba(255, 215, 0, 0.4)', textAlign: 'left' }}>
                <div style={{ fontSize: 10.5, fontWeight: 900, color: '#FFD700', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>🔍</span> SCROLL TO ZOOM
                </div>
                <div style={{ fontSize: 10, color: '#CBD5E1', lineHeight: 1.25 }}>Use mouse wheel / touchpad to zoom into quantum nodes.</div>
              </div>

              <div style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.45)', textAlign: 'left' }}>
                <div style={{ fontSize: 10.5, fontWeight: 900, color: '#D8B4FE', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>✨</span> HOVER & DRAG
                </div>
                <div style={{ fontSize: 10, color: '#CBD5E1', lineHeight: 1.25 }}>Hover elements & drag glowing nodes to splice timelines.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button onClick={() => { AudioSystem.click(); setFsPromptDismissed(true) }} style={{
                padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.35)',
                color: '#E2E8F0', fontFamily: 'var(--font-mono)', fontSize: 11.5, cursor: 'pointer', fontWeight: 800, transition: 'all 0.2s',
                letterSpacing: 0.8
              }}>
                Skip / Windowed HUD
              </button>
              <button id="stage1-fullscreen-popup-btn" onClick={() => { AudioSystem.click(); setFsPromptDismissed(true); toggleFull() }} style={{
                padding: '9px 18px', borderRadius: 8,
                background: 'linear-gradient(135deg, #00F2FE 0%, #38bdf8 50%, #00F2FE 100%)',
                border: '2px solid #FFFFFF',
                color: '#04050A', fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 950, cursor: 'pointer',
                boxShadow: '0 0 25px rgba(0, 242, 254, 0.9), 0 0 10px rgba(255, 255, 255, 0.8)',
                letterSpacing: 1.1, display: 'flex', alignItems: 'center', gap: 8,
                animation: 'quantumPulse 2s infinite ease-in-out',
                textTransform: 'uppercase'
              }}>
                <span style={{ fontSize: 16 }}>⛶</span> ENGAGE FULLSCREEN IMMERSION ➔
              </button>
            </div>
          </div>
        )}

        <Scene3D riskColor={riskColor} spliced={spliced} scrub={scrub} anomaliesActive={!spliced && risk>20} aligned={aligned}/>
        {/* Drag-and-drop overlay */}
        <DragNodes onSplice={doSplice} spliced={spliced}/>
        <div className="viewport-hint">
          {isFull ? '✦ FULL DIMENSIONAL IMMERSION · DRAG TO ROTATE · SCROLL TO ZOOM ✦' : '🖱 DRAG TO EXPLORE 3D SPACE · SCROLL TO ZOOM'}
        </div>
        {['tl','tr','bl','br'].map(c => (
          <div key={c} className={`corner corner-${c}`} style={{ borderColor:'rgba(0,242,254,0.5)' }}/>
        ))}
      </div>

      {/* Dynamic Stage Action Dock (Ultra-compact, shows only what is required for the active stage in Fullscreen & Normal view!) */}
      {!uiCollapsed && (
        <div className="scrub-bar" style={{
          border: `1.5px solid ${stage === 5 ? '#00ff88' : stage === 4 ? '#FF0055' : stage === 3 ? '#a855f7' : stage === 2 ? '#FFD700' : '#00F2FE'}`,
          boxShadow: `0 0 18px ${stage === 5 ? 'rgba(0,255,136,0.3)' : stage === 4 ? 'rgba(255,0,85,0.4)' : stage === 3 ? 'rgba(168,85,247,0.35)' : stage === 2 ? 'rgba(255,215,0,0.35)' : 'rgba(0,242,254,0.3)'}`,
          transition: 'all 0.3s', padding: '6px 14px', gap: 12, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {/* Stage Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: 1,
              background: stage === 5 ? 'rgba(0,255,136,0.2)' : stage === 4 ? 'rgba(255,0,85,0.2)' : stage === 3 ? 'rgba(168,85,247,0.2)' : stage === 2 ? 'rgba(255,215,0,0.2)' : 'rgba(0,242,254,0.2)',
              color: stage === 5 ? '#00ff88' : stage === 4 ? '#FF0055' : stage === 3 ? '#c084fc' : stage === 2 ? '#FFD700' : '#00F2FE',
              border: `1px solid ${stage === 5 ? '#00ff88' : stage === 4 ? '#FF0055' : stage === 3 ? '#a855f7' : stage === 2 ? '#FFD700' : '#00F2FE'}`
            }}>
              {stage === 5 ? 'STAGE 5/5 ✓' : `STAGE ${stage}/5`}
            </div>
          </div>

          {/* Dynamic Stage Controls */}
          {stage === 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center' }}>
              <button id="scrub-rewind-btn" className="scrub-btn" onClick={() => { AudioSystem.click(); handleScrub(Math.max(0, scrub - 25)) }} style={{ padding: '5px 12px', fontSize: 11 }}>
                ⏮ −1h REWIND
              </button>
              <input id="causality-scrubber" type="range" min={0} max={100} value={scrub} onChange={e => handleScrub(+e.target.value)} className="scrub-range" style={{ maxWidth: 280 }} />
              <span className="scrub-time" style={{ fontSize: 11, padding: '3px 8px' }}>T−{String(h).padStart(2,'0')}h:{String(m).padStart(2,'0')}m</span>
              <button id="scrub-ff-btn" className="scrub-btn" onClick={() => { AudioSystem.click(); handleScrub(100) }} style={{ padding: '6px 14px', fontSize: 11.5, background: 'rgba(0,242,254,0.25)', borderColor: '#00F2FE', color: '#fff', boxShadow: '0 0 14px rgba(0,242,254,0.5)' }}>
                +1h FAST FORWARD (LOCK 100%) ⏭
              </button>
            </div>
          )}

          {stage === 2 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>
                <span>📻 FREQ TUNER: <strong style={{ color: '#FFD700' }}>{(200 + (freq || 38) * 3.2333).toFixed(1)} MHz</strong></span>
                <input type="range" min={30} max={80} value={freq || 38} onChange={e => setFreq?.(+e.target.value)} className="scrub-range" style={{ width: 150 }} />
              </div>
              <button onClick={() => { AudioSystem.click(); doRetune?.() }} style={{
                padding: '6px 16px', borderRadius: 8, background: 'linear-gradient(90deg, #FFD700, #00F2FE)', border: '1.5px solid #fff',
                color: '#04050A', fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 20px rgba(255,215,0,0.6)', letterSpacing: 0.5
              }}>
                ✨ AUTO-LOCK 432.8 MHz & PHASE SYNC (PASS STAGE 2) ➔
              </button>
            </div>
          )}

          {stage === 3 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 11.5, color: '#cbd5e1', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🔮 TEAR LOCATED:</span> <strong style={{ color: '#c084fc' }}>Drag Node B (purple sphere) onto Node A (gold sphere) inside 3D space</strong>
              </div>
              <button onClick={() => { AudioSystem.click(); doSplice() }} style={{
                padding: '6px 16px', borderRadius: 8, background: 'linear-gradient(90deg, #a855f7, #00F2FE)', border: '1.5px solid #fff',
                color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 20px rgba(168,85,247,0.6)', letterSpacing: 0.5, animation: 'alertP 1s infinite'
              }}>
                ⚡ QUICK SPLICE NODES (SEAL TEAR NOW) ➔
              </button>
            </div>
          )}

          {stage === 4 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 11.5, color: '#FF0055', fontFamily: 'var(--font-mono)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="e-dot"/> <span>CRITICAL ALERT: PARADOX CASCADE DETECTED (CLEARANCE REQUIRED)</span>
              </div>
              <button onClick={() => { AudioSystem.click(); onEmergency?.() }} style={{
                padding: '6px 16px', borderRadius: 8, background: 'linear-gradient(90deg, #FF0055, #a855f7)', border: '1.5px solid #fff',
                color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 25px rgba(255,0,85,0.8)', letterSpacing: 0.5, animation: 'alertP 0.7s infinite'
              }}>
                🛡️ ENGAGE PROTOCOL ZERO (LEVEL-9 OVERRIDE) ➔
              </button>
            </div>
          )}

          {stage === 5 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 11.5, color: '#00ff88', fontFamily: 'var(--font-mono)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>✓ CAUSAL CONTINUITY RESTORED AT 99.9% STABILITY</span>
              </div>
              <button onClick={() => { AudioSystem.success(); onVictory?.() }} style={{
                padding: '6px 16px', borderRadius: 8, background: 'linear-gradient(90deg, #00ff88, #00F2FE)', border: '1.5px solid #fff',
                color: '#04050A', fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 900, cursor: 'pointer', boxShadow: '0 0 25px rgba(0,255,136,0.8)', letterSpacing: 0.5, animation: 'alertP 1.2s infinite'
              }}>
                🏆 ENTER VICTORY SIMULATION & COUNCIL DOSSIER ➔
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals rendered directly inside ViewportPanel so they appear above HTML5 Native Fullscreen! */}
      <ProtocolModal open={modalOpen} confirmed={modalDone} onConfirm={confirmP0} onClose={()=>onEmergencyClose?.()}/>
      <VictoryModal open={victoryOpen} onClose={()=>onVictoryClose?.()} onRestart={onRestart}/>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MISSION DIRECTIVE ASSISTANT HUD
══════════════════════════════════════════════ */
function MissionDirectiveBox({ steps = {}, risk = 84.2 }) {
  let cur = 1
  if (steps.p0 || (steps.splice && risk === 0)) cur = 6
  else if (steps.splice) cur = 5
  else if (steps.retune) cur = 4
  else if (steps.isolate) cur = 3
  else cur = 2

  const objectives = [
    { n:'01', title:'LOCATE TIMELINE TEAR', desc:'Radar detected an anomaly in Sector 4. Use the timeline control bar below the 3D screen to find it.', action:'Click Fast Forward (⏭) or Rewind (⏮) below until time locks at 100%.' },
    { n:'02', title:'PINPOINT TEAR ORIGIN', desc:'Timeline anomaly located! Now fast-forward or rewind along the time bar until coordinates lock.', action:'Click "+1h FAST FORWARD ⏭" below the 3D screen to reach 100%.' },
    { n:'03', title:'CLEAR SCREEN DISTORTIONS', desc:'Visual interference detected. Align the audio slider at the bottom to clear up the screen.', action:'Go to bottom panel [03]. Drag Frequency to exact 432.8 MHz & click Phase Sync.' },
    { n:'04', title:'CONNECT TIMELINE NODES', desc:'Screen cleared! Now connect the broken timeline branch inside the 3D screen to repair the tear.', action:'Click and drag Node B (purple circle) onto Node A (gold circle) in the 3D screen.' },
    { n:'05', title:'ACTIVATE EMERGENCY SHIELD', desc:'Timeline repaired! Now activate the emergency quarantine shield to protect the sector.', action:'Click [PROTOCOL ZERO] in top right & confirm the 3 safety locks.' },
    { n:'✓', title:'MISSION SUCCESS', desc:'Sector 4 stabilized at 99.9%. 42 billion lives saved across all timelines.', action:'Repairs complete. Feel free to explore the 3D core or switch timelines.' },
  ]
  const o = objectives[cur - 1] || objectives[5]
  const isDone = cur === 6

  return (
    <div style={{
      background: isDone ? 'rgba(0,242,254,0.1)' : 'rgba(255,0,85,0.08)',
      border: `1.5px solid ${isDone ? '#00F2FE' : '#FF0055'}`,
      borderRadius: 10, padding: '10px 12px', marginBottom: 8, flexShrink: 0,
      boxShadow: `0 0 16px ${isDone ? 'rgba(0,242,254,0.2)' : 'rgba(255,0,85,0.18)'}`,
      transition: 'all 0.3s ease',
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 6 }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize: 9.5, fontWeight:800, color: isDone ? '#00F2FE' : '#FF0055', letterSpacing:1.5 }}>
          ▸ ACTIVE MISSION DIRECTIVE
        </span>
        <span style={{ fontFamily:'var(--font-mono)', fontSize: 9, padding:'2px 8px', borderRadius: 4, background: isDone?'rgba(0,242,254,0.2)':'rgba(255,0,85,0.2)', color: isDone?'#00F2FE':'#FF0055', fontWeight:800 }}>
          {isDone ? 'COMPLETED ✓' : `STEP ${cur} / 05`}
        </span>
      </div>
      <div style={{ fontFamily:'var(--font-mono)', fontSize: 11.5, fontWeight:800, color:'#fff', letterSpacing:1, marginBottom: 4 }}>
        {o.title}
      </div>
      <div style={{ fontSize: 11, color:'#e2e8f0', lineHeight:1.4, marginBottom: isDone ? 0 : 6 }}>
        {o.desc}
      </div>
      {!isDone && (
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 8px', background:'rgba(0,0,0,0.45)', borderRadius:6, border:'1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize:11 }}>⚡</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:9.5, color:'#00F2FE', fontWeight:700 }}>
            {o.action}
          </span>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   TELEMETRY PANEL (Right)
══════════════════════════════════════════════ */
function TelemetryPanel({ risk, spliced, aligned, timeline, steps, open, onClose }) {
  const [logs, setLogs] = useState([])
  const [oState, setOState] = useState('idle')
  const endRef = useRef()

  useEffect(() => {
    setLogs(BASE_LOGS.map((l, i) => ({ ...l, id: Date.now() + i })))
  }, [])

  useEffect(() => {
    if (aligned) setLogs(p => [...p, { t:'ok', s:`Freq locked to 432.8 MHz — ${timeline?.label||'Alpha-7'} stabilizing.`, id:Date.now() }])
  }, [aligned, timeline])
  useEffect(() => {
    if (spliced) setLogs(p => [...p, { t:'ok', s:'⚡ Causal nodes spliced. Tear sealed. Energy rerouted from Prime.', id:Date.now() }])
  }, [spliced])
  useEffect(() => {
    if (risk===0) setLogs(p => [...p, { t:'ok', s:'✦ CASCADE NEUTRALIZED. 42 billion lives preserved across Sector 4.', id:Date.now() }])
  }, [risk])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [logs, open])

  const runOracle = useCallback(() => {
    if (oState!=='idle') return
    setOState('running')
    AudioSystem.click()
    const oSteps=[
      { t:'info', s:'[ORACLE-AI] Initiating dimensional pattern analysis...' },
      { t:'info', s:'[ORACLE-AI] Cross-referencing 14,822 paradox events across Alpha 7-9...' },
      { t:'info', s:'[ORACLE-AI] Optimal repair path calculated.' },
      { t:'ok',   s:'[ORACLE-AI] → Scrub temporal slider, align 432.8 MHz, drag Node B to Node A, engage Protocol Zero.' },
    ]
    let i=0
    const iv=setInterval(()=>{
      if(i<oSteps.length){setLogs(p=>[...p,{...oSteps[i],id:Date.now()+i}]);i++}
      else{clearInterval(iv);setOState('done');AudioSystem.success()}
    },720)
  }, [oState])

  if (!open) return null

  return (
    <div className="glass r-panel" style={{
      position: 'fixed', top: 88, right: 16, width: 360, maxHeight: 'calc(100vh - 240px)',
      zIndex: 8000, borderColor:'rgba(168,85,247,0.5)', boxShadow: '-12px 0 40px rgba(0,0,0,0.8), 0 0 40px rgba(168,85,247,0.35)',
      padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10,
      animation: 'alertP 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div className="ph" style={{ marginBottom: 0, fontSize: 13, fontWeight: 800 }}>
          <div className="ph-dot" style={{ background: 'var(--violet-mid)', width: 8, height: 8 }}/>
          [04] Telemetry & Diagnostics
        </div>
        <button
          onClick={() => { AudioSystem.click(); onClose?.() }}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 800, cursor: 'pointer'
          }}
        >
          ✕ CLOSE
        </button>
      </div>
      <MissionDirectiveBox steps={steps} risk={risk} />
      <div className="terminal" style={{ padding: 12, gap: 6 }}>
        {logs.map((l,i) => (
          <div key={l.id||i} className="log-line" style={{ fontSize: 12, lineHeight: 1.45 }}>
            <span style={{ color: LOG_COLOR[l.t]||'#cbd5e1', flexShrink: 0, fontWeight: 800 }}>
              {l.t==='crit'?'!':l.t==='warn'?'⚠':l.t==='ok'?'✓':'>'}
            </span>
            <span style={{ color: l.t==='crit'?LOG_COLOR.crit:l.t==='ok'?LOG_COLOR.ok:l.t==='warn'?LOG_COLOR.warn:'#e2e8f0', fontWeight: 600 }}>{l.s}</span>
          </div>
        ))}
        <div ref={endRef}/>
      </div>
      <div className="oracle-card" style={{ marginTop: 4, padding: 12 }}>
        <div className="oracle-hdr" style={{ fontSize: 12.5, fontWeight: 800 }}>
          <div className="oracle-dot" style={{ width: 8, height: 8 }}/>
          Oracle-AI · {oState==='done'?'ANALYSIS COMPLETE':oState==='running'?'ANALYZING...':'READY'}
        </div>
        <div className="oracle-body" style={{ fontSize: 12, lineHeight: 1.45, color: '#cbd5e1' }}>
          {oState==='done'
            ? <span>Path confirmed: <span style={{color:'#00F2FE', fontWeight:700}}>Scrub coordinates</span>, align <span style={{color:'#00F2FE', fontWeight:700}}>432.8 MHz</span>, drag <span style={{color:'#00F2FE', fontWeight:700}}>Node B → A</span>, engage <span style={{color:'#FF0055', fontWeight:700}}>Protocol Zero</span>.</span>
            : 'Full causal pattern analysis ready. Click to run Sector 4 diagnosis.'}
        </div>
        <button id="oracle-autopatch-btn" className="oracle-btn" onClick={runOracle} disabled={oState!=='idle'} style={{ opacity: oState==='done'?0.6:1, marginTop: 6, padding: '9px 12px', fontSize: 11, fontWeight: 800 }}>
          {oState==='done'?'✓ ANALYSIS COMPLETE':oState==='running'?'ANALYZING...':'⚡ AUTO-PATCH RECOMMENDATION'}
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   RESONANCE TUNER (Bottom with Dynamic Guidance Spotlights)
══════════════════════════════════════════════ */
function ResonanceTuner({ freq, phase, setFreq, setPhase, aligned, doRetune }) {
  const fa=freq>68&&freq<76, pa=phase>76&&phase<84
  const mhz=fa?'432.8':(200+freq*3.2333).toFixed(1)
  const phLbl=pa?'ALIGNED ✓':phase>60?'CONVERGING...':'DRIFTING'

  let stage = aligned ? 3 : 2

  const sliders=[
    { id:'freq-slider', label:'Frequency', val:`${mhz} MHz`, pct:freq, set:setFreq, target:72, isA:fa, color:fa?'#00F2FE':'#FFD700', tag:fa?'LOCKED':null },
    { id:'phase-slider', label:'Phase Sync', val:phLbl, pct:phase, set:setPhase, target:80, isA:pa, color:pa?'#a855f7':'var(--muted)', tag:pa?'SYNC':null },
  ]

  return (
    <div className="glass b-panel" style={{ borderColor: stage === 2 ? '#FFD700' : 'rgba(0,242,254,0.22)', boxShadow: stage === 2 ? '0 0 24px rgba(255,215,0,0.3)' : 'none', padding: '14px 22px', transition: 'all 0.3s' }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,marginBottom:10}}>
        <div className="ph" style={{marginBottom:0, fontSize: 13, fontWeight: 800}}><div className="ph-dot" style={{width:8,height:8}}/>[03] Harmonic Resonance Tuner Array</div>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:12,color:'#e2e8f0',letterSpacing:0.5,fontWeight:600}}>
            TARGET → <span style={{color:'#00F2FE',fontWeight:800,fontSize:13}}>432.8 MHz · Phase Aligned (80%)</span>
          </span>
          {!aligned && (
            <button
              onClick={() => { AudioSystem.click(); doRetune?.() }}
              style={{
                padding: '6px 14px', borderRadius: 8, background: 'linear-gradient(90deg, #FFD700, #a855f7)',
                border: 'none', color: '#000', fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 950,
                cursor: 'pointer', boxShadow: '0 0 18px rgba(255,215,0,0.7)', animation: 'alertP 1.5s infinite',
                letterSpacing: 0.5
              }}
            >
              ✨ AUTO-LOCK 432.8 MHz ➔
            </button>
          )}
        </div>
      </div>
      <div className="tuner-rows" style={{ gap: 16 }}>
        {sliders.map(s => (
          <div key={s.label} className="s-row" style={{ gap: 8 }}>
            <div className="s-hdr">
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <span className="s-name" style={{color:s.isA?s.color:'#e2e8f0', fontSize: 13, fontWeight: 700}}>{s.label}</span>
              </div>
              <span className="s-val" style={{color:s.color, fontSize: 15, fontWeight: 800}}>
                {s.val}
                {s.tag && <span className="s-tag" style={{background:`${s.color}22`,color:s.color, fontSize: 10, padding: '3px 8px'}}>{s.tag}</span>}
              </span>
            </div>
            <div className="tw" style={{position:'relative',marginTop:8}}>
              <div className="tb" style={{ height: 6 }}>
                <div className="tf" style={{
                  width:`${s.pct}%`,
                  background:s.isA?`linear-gradient(90deg,${s.color},#a855f7)`:`${s.color}77`,
                  boxShadow:s.isA?`0 0 14px ${s.color}99`:'none',
                }}/>
                <div className="tm" style={{left:`${s.target}%`,background:s.isA?s.color:'rgba(255,255,255,0.4)',boxShadow:`0 0 8px ${s.color}`, height: 18, top: -6, width: 3}}>
                  <div style={{ position:'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 4, background: s.color, color: '#000', fontSize: 9.5, fontWeight: 900, padding: '2px 6px', borderRadius: 10, whiteSpace: 'nowrap', boxShadow: `0 0 8px ${s.color}` }}>
                    ▼ TARGET ({s.target}%)
                  </div>
                </div>
              </div>
              <input id={s.id} type="range" min={0} max={100} step={0.1} value={s.pct}
                onChange={e => s.set(+e.target.value)} className="ri" style={{ height: 6 }}/>
            </div>
            <div className="wf" style={{marginTop:6, height: 22}}>
              {Array.from({length:60}).map((_,i)=>{
                const h=3+Math.abs(Math.sin(i*0.45+s.pct*0.09))*(s.isA?18:7)
                return <div key={i} className="wb" style={{height:h,background:s.color,opacity:s.isA?0.9:0.35}}/>
              })}
            </div>
          </div>
        ))}
      </div>
      {aligned && (
        <div className="align-banner" style={{ fontSize: 12, padding: '8px 20px', marginTop: 4 }}>
          <span>✦</span>
          <span>DIMENSIONAL FREQUENCY ALIGNED — REALITY GRID STABILIZING</span>
          <span>✦</span>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   MISSION ACCOMPLISHED — HYPERSPEED WARP ENDING
══════════════════════════════════════════════ */
function VictoryModal({ open, onClose, onRestart }) {
  const [phase, setPhase] = useState('transit') // 'transit' = Hyperspeed Warp | 'docked' = Council Terminal | 'dossier' = Classified Military Certificate
  
  // Reset to transit and play triumphant sci-fi victory sound when opened
  useEffect(() => {
    if (open) {
      setPhase('transit')
      AudioSystem.victoryFanfare()
    }
  }, [open])

  if (!open) return null

  // Generate deterministic hyperspeed light streaks for the warp tunnel background
  const warpLines = Array.from({ length: 48 }).map((_, i) => ({
    id: i,
    angle: (i * 360) / 48 + (i % 3) * 5,
    delay: (i % 7) * 0.15,
    duration: 0.7 + (i % 4) * 0.2,
    length: 160 + (i % 5) * 80,
    color: i % 4 === 0 ? '#FFD700' : i % 3 === 0 ? '#00ff88' : i % 2 === 0 ? '#a855f7' : '#00F2FE'
  }))

  return (
    <div className="modal-ov" style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#04060E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', perspective: '1200px', pointerEvents: 'auto'
    }}>
      
      {/* ─── RADIATING LIGHT WARP LINES IN BACKGROUND (Smooth light animation along rays) ─── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Subtle Center Glow */}
        <div style={{
          position: 'absolute', width: 700, height: 700,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 242, 254, 0.12) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 70%)'
        }}/>

        {/* Radiating Light Streaks */}
        {warpLines.map(w => (
          <div key={w.id} style={{
            position: 'absolute', top: '50%', left: '50%',
            width: w.length, height: 1.5,
            background: `linear-gradient(90deg, transparent, ${w.color}, rgba(255,255,255,0.8))`,
            transformOrigin: '0 50%',
            '--angle': `${w.angle}deg`,
            transform: `rotate(${w.angle}deg) translateX(${50 + (w.id % 4) * 20}px)`,
            opacity: 0.65,
            animation: `warpStreak ${w.duration}s linear infinite`,
            animationDelay: `${w.delay}s`
          }}/>
        ))}

        {/* ─── 4 CORNER HUD RETICLE LABELS (Exact Mockup Match) ─── */}
        <div style={{ position: 'absolute', inset: 32, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00F2FE', letterSpacing: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#00ff88', fontSize: 13 }}>●</span> AETHER-OS CHRONO-NAVIGATION HUD // FLIGHT NEXUS-7
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00F2FE', letterSpacing: 2, fontWeight: 700 }}>
              [ HYPERSPEED WARP VECTOR: 99.999% c ]
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FFD700', letterSpacing: 2, fontWeight: 700 }}>
              SECTOR 4 PARADOX CASCADE: 0.0% (SEALED)
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#a855f7', letterSpacing: 2, fontWeight: 700 }}>
              DESTINATION: INTERDIMENSIONAL COUNCIL HQ
            </div>
          </div>
        </div>
      </div>

      {/* ─── PHASE 1: HYPERSPEED WARP ENGAGED (EXACT CLEAN MOCKUP DESIGN) ─── */}
      {phase === 'transit' && (
        <div style={{ position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 840, textAlign: 'center', padding: 24 }}>
          
          {/* Top Circular Emblem with Mission Complete Tab */}
          <div style={{ position: 'relative', margin: '0 auto 36px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Top Pill Tab */}
            <div style={{
              position: 'absolute', top: -14, zIndex: 5,
              padding: '3px 14px', borderRadius: 12,
              background: 'rgba(0, 242, 254, 0.15)', border: '1px solid #00F2FE',
              fontFamily: 'var(--font-mono)', fontSize: 9.5, color: '#00F2FE', fontWeight: 800, letterSpacing: 1.5,
              textTransform: 'uppercase'
            }}>
              MISSION COMPLETE
            </div>
            {/* Circular Ring */}
            <div style={{
              width: 84, height: 84, borderRadius: '50%',
              border: '1.5px solid rgba(0, 242, 254, 0.45)',
              background: 'radial-gradient(circle at center, rgba(0, 242, 254, 0.15) 0%, rgba(4, 6, 14, 0.9) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(0, 242, 254, 0.2), inset 0 0 15px rgba(0, 242, 254, 0.1)'
            }}>
              <span style={{ fontSize: 32, color: '#00F2FE', filter: 'drop-shadow(0 0 10px #00F2FE)' }}>⚡</span>
            </div>
          </div>

          {/* Crisp Main Heading */}
          <h1 style={{
            fontFamily: 'var(--font-mono)', fontSize: 48, fontWeight: 950,
            color: '#FFFFFF', margin: '0 0 20px', letterSpacing: 8,
            textTransform: 'uppercase', lineHeight: 1.15
          }}>
            HYPERSPEED<br/>
            WARP<br/>
            <span style={{ color: '#00F2FE', filter: 'drop-shadow(0 0 20px rgba(0, 242, 254, 0.7))' }}>ENGAGED</span>
          </h1>

          {/* Subtitle Text */}
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 15, color: '#94a3b8',
            lineHeight: 1.7, margin: '0 auto 36px', maxWidth: 640, fontWeight: 500
          }}>
            Chief Reality Architect, your temporal precision has neutralised the Sector 4 Paradox Cascade. Your Chrono-Shuttle is travelling at lightspeed bearing <strong style={{ color: '#E2E8F0', fontWeight: 800 }}>42 Billion rescued lives</strong> back to headquarters.
          </p>

          {/* Single Rounded Frosted Glass Card (`FLIGHT VECTOR`, `CAUSAL INTEGRITY`, `PASSENGER STATUS`) */}
          <div style={{
            width: '100%', maxWidth: 680, padding: '24px 36px', borderRadius: 20,
            background: 'rgba(10, 16, 36, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20,
            fontFamily: 'var(--font-mono)', textAlign: 'left', boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.02)'
          }}>
            <div>
              <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 1.5, fontWeight: 700, marginBottom: 6 }}>FLIGHT VECTOR</div>
              <div style={{ fontSize: 16, color: '#00F2FE', fontWeight: 900 }}>LIGHTSPEED WARP</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 1.5, fontWeight: 700, marginBottom: 6 }}>CAUSAL INTEGRITY</div>
              <div style={{ fontSize: 16, color: '#00ff88', fontWeight: 900 }}>100.0% SEALED</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 1.5, fontWeight: 700, marginBottom: 6 }}>PASSENGER STATUS</div>
              <div style={{ fontSize: 16, color: '#FFD700', fontWeight: 900 }}>42.0B SECURED</div>
            </div>
          </div>

          {/* Sleek Minimalist Obsidian Action Button (`NO BUTTON EFFECTS`) */}
          <button
            onClick={() => { AudioSystem.warpLeap(); setPhase('docked') }}
            style={{
              padding: '16px 36px', borderRadius: 36,
              background: '#050712', border: '1.5px solid rgba(0, 242, 254, 0.5)',
              color: '#FFFFFF', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800,
              cursor: 'pointer', letterSpacing: 2, textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: 14,
              boxShadow: '0 0 30px rgba(0, 242, 254, 0.18)', transition: 'border-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00F2FE'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.5)'}
          >
            <span style={{ color: '#00F2FE', fontSize: 15 }}>⚡</span>
            <span>DOCK AT COUNCIL HEADQUARTERS & RECEIVE HONORS</span>
            <span style={{ color: '#94a3b8', fontSize: 16 }}>→</span>
          </button>
        </div>
      )}

      {/* ─── PHASE 2: COUNCIL TERMINAL (`CLEAN MINIMALIST DESIGN WITH ZERO BUTTON EFFECTS`) ─── */}
      {phase === 'docked' && (
        <div style={{ position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 760, pointerEvents: 'auto', padding: 24 }}>
          
          <div style={{ width: '100%', padding: '44px 48px', borderRadius: 28, background: 'rgba(8, 14, 32, 0.85)', border: '1px solid rgba(0, 242, 254, 0.3)', boxShadow: '0 25px 60px rgba(0,0,0,0.7)', backdropFilter: 'blur(30px)', textAlign: 'center', position: 'relative' }}>
            
            {/* Top Emblem */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 20px', borderRadius: 20, background: 'rgba(255, 215, 0, 0.12)', border: '1px solid #FFD700', color: '#FFD700', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, letterSpacing: 2.5, marginBottom: 20 }}>
              <span>✦ INTERDIMENSIONAL OVERSIGHT COUNCIL ✦</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-mono)', fontSize: 34, fontWeight: 950,
              color: '#FFFFFF', margin: '0 0 10px', letterSpacing: 4, textTransform: 'uppercase'
            }}>
              GRAND MASTER CHRONO-ARCHITECT
            </h1>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00F2FE', letterSpacing: 2, fontWeight: 800, marginBottom: 30 }}>
              RANK #001 AWARDED · SECTOR 4 PARADOX CASCADE PURGED
            </div>

            {/* Clean Telemetry Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 36 }}>
              
              <div style={{ padding: '18px 22px', borderRadius: 16, background: 'rgba(4, 8, 20, 0.6)', border: '1px solid rgba(0, 255, 136, 0.3)', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#64748b', letterSpacing: 1.5, fontWeight: 700 }}>
                  <span>QUARANTINE PROTOCOL</span>
                  <span style={{ color: '#00ff88' }}>[ SEALED ]</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 900, color: '#00ff88', marginTop: 8 }}>
                  0.0% LOSS <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>(42B SAVED)</span>
                </div>
              </div>

              <div style={{ padding: '18px 22px', borderRadius: 16, background: 'rgba(4, 8, 20, 0.6)', border: '1px solid rgba(0, 242, 254, 0.3)', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#64748b', letterSpacing: 1.5, fontWeight: 700 }}>
                  <span>HARMONIC MATRIX</span>
                  <span style={{ color: '#00F2FE' }}>[ LOCKED ]</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 900, color: '#00F2FE', marginTop: 8 }}>
                  432.8 MHz EXACT
                </div>
              </div>

              <div style={{ padding: '18px 22px', borderRadius: 16, background: 'rgba(4, 8, 20, 0.6)', border: '1px solid rgba(168, 85, 247, 0.3)', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#64748b', letterSpacing: 1.5, fontWeight: 700 }}>
                  <span>CAUSAL SPLICE</span>
                  <span style={{ color: '#c084fc' }}>[ ANCHORED ]</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 900, color: '#c084fc', marginTop: 8 }}>
                  PRIME ➔ ALPHA SPLICED
                </div>
              </div>

              <div style={{ padding: '18px 22px', borderRadius: 16, background: 'rgba(4, 8, 20, 0.6)', border: '1px solid rgba(255, 215, 0, 0.3)', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#64748b', letterSpacing: 1.5, fontWeight: 700 }}>
                  <span>COUNCIL CITATION</span>
                  <span style={{ color: '#FFD700' }}>[ AWARDED ]</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 900, color: '#FFD700', marginTop: 8 }}>
                  GRAND MASTER #001
                </div>
              </div>

            </div>

            {/* Minimalist Action Buttons (`NO BUTTON EFFECTS`) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
              <button
                onClick={() => { AudioSystem.celestialTab(); setPhase('dossier') }}
                style={{
                  width: '100%', padding: '16px 28px', borderRadius: 30,
                  background: '#050712', border: '1px solid rgba(255, 215, 0, 0.5)',
                  color: '#FFFFFF', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800,
                  cursor: 'pointer', letterSpacing: 2, textTransform: 'uppercase'
                }}
              >
                ► ACCESS CLASSIFIED MILITARY DOSSIER (OFFICIAL CITATION & LOGS)
              </button>
              <div style={{ display: 'flex', gap: 14, width: '100%' }}>
                <button
                  onClick={() => { AudioSystem.warpLeap(); setPhase('transit') }}
                  style={{
                    flex: 1, padding: '14px 24px', borderRadius: 28, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.18)', color: '#cbd5e1', fontFamily: 'var(--font-mono)',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 1.5
                  }}
                >
                  ◄ RETURN TO WARP
                </button>
                <button
                  onClick={() => { AudioSystem.reboot(); onRestart?.() }}
                  style={{
                    flex: 1.2, padding: '14px 24px', borderRadius: 28,
                    background: '#050712', border: '1px solid rgba(0, 242, 254, 0.5)',
                    color: '#00F2FE', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800,
                    cursor: 'pointer', letterSpacing: 1.5
                  }}
                >
                  ↻ RE-INITIALIZE AETHER-OS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PHASE 3: MILITARY DOSSIER (`CLEAN MINIMALIST DESIGN`) ─── */}
      {phase === 'dossier' && (
        <div style={{ position: 'relative', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 760, pointerEvents: 'auto', padding: 24 }}>
          <div style={{ width: '100%', padding: '44px 48px', borderRadius: 28, background: 'rgba(8, 14, 32, 0.85)', border: '1px solid rgba(255, 215, 0, 0.4)', boxShadow: '0 25px 60px rgba(0,0,0,0.7)', backdropFilter: 'blur(30px)', relative: 'position' }}>
            
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 20px', borderRadius: 20, background: 'rgba(255, 215, 0, 0.12)', border: '1px solid #FFD700', color: '#FFD700', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, letterSpacing: 2.5, marginBottom: 16 }}>
                <span>✦ INTERDIMENSIONAL OVERSIGHT COUNCIL · MILITARY ARCHIVE ✦</span>
              </div>
              <h1 style={{
                fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 950,
                color: '#FFFFFF', margin: '0 0 8px', letterSpacing: 3, textTransform: 'uppercase'
              }}>
                OFFICIAL VICTORY CERTIFICATE
              </h1>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00F2FE', letterSpacing: 2, fontWeight: 800 }}>
                LOG ID: #AETHER-2184-SECTOR-4 · GRAND MASTER LEVEL 9 ✓
              </div>
            </div>

            <div style={{ padding: 24, borderRadius: 18, background: 'rgba(4, 8, 20, 0.65)', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: 28, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              <div style={{ borderLeft: '3px solid #00ff88', paddingLeft: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#64748b', letterSpacing: 1.5, fontWeight: 700 }}>SECTOR 4 INTEGRITY</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: '#00ff88', marginTop: 4 }}>100% STABLE <span style={{ fontSize: 12, color: '#cbd5e1' }}>(0.0% Risk)</span></div>
                <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 3 }}>Timelines Alpha-7, 8 & 9 permanently anchored.</div>
              </div>
              <div style={{ borderLeft: '3px solid #FFD700', paddingLeft: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#64748b', letterSpacing: 1.5, fontWeight: 700 }}>LIVES PRESERVED</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: '#FFD700', marginTop: 4 }}>42,000,000,000</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 3 }}>Zero casualty causal quarantine achieved.</div>
              </div>
              <div style={{ borderLeft: '3px solid #00F2FE', paddingLeft: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#64748b', letterSpacing: 1.5, fontWeight: 700 }}>RESONANCE TUNING</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: '#00F2FE', marginTop: 4 }}>432.8 MHz — Phase Locked</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 3 }}>Quantum matter grid decay permanently halted.</div>
              </div>
              <div style={{ borderLeft: '3px solid #a855f7', paddingLeft: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#64748b', letterSpacing: 1.5, fontWeight: 700 }}>COUNCIL CITATION</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: '#c084fc', marginTop: 4 }}>GRAND CHRONO-ARCHITECT</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 3 }}>Clearance Level 9 Awarded by Council.</div>
              </div>
            </div>

            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, textAlign: 'center', margin: '0 auto 28px', maxWidth: 640 }}>
              By isolating the temporal tear, re-tuning the 432.8 MHz harmonic grid, and grafting causal energy from the Prime Anchor via Protocol Zero, you have prevented total simulation de-sync across <strong style={{ color: '#FFFFFF' }}>AETHER-OS v9.4</strong>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              <button
                onClick={() => { AudioSystem.warpLeap(); setPhase('docked') }}
                style={{
                  padding: '14px 28px', borderRadius: 28, background: '#050712',
                  border: '1px solid rgba(0, 242, 254, 0.4)', color: '#00F2FE', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800,
                  cursor: 'pointer', letterSpacing: 1.5
                }}
              >
                ◄ RETURN TO COUNCIL DOCKING TERMINAL
              </button>
              <button
                onClick={() => { AudioSystem.reboot(); onRestart?.() }}
                style={{
                  padding: '14px 28px', borderRadius: 28, background: '#050712',
                  border: '1px solid rgba(255, 215, 0, 0.5)', color: '#FFD700', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800,
                  cursor: 'pointer', letterSpacing: 1.5
                }}
              >
                ↻ RESTART MISSION FROM ZERO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   PROTOCOL ZERO MODAL
══════════════════════════════════════════════ */
function ProtocolModal({ open, confirmed, onConfirm, onClose }) {
  const [tg, setTg] = useState({ a:false, b:false, c:false })
  if (!open) return null
  const allOn=tg.a&&tg.b&&tg.c
  const tog=(k)=>{ AudioSystem.click(); setTg(p=>({...p,[k]:!p[k]})) }

  return (
    <div className="modal-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <div className="m-alert"><div className="e-dot"/> LEVEL-9 EMERGENCY OVERRIDE INITIATED <div className="e-dot"/></div>
        <div className="m-title">PROTOCOL <span>ZERO</span></div>
        <div className="m-sub">Dimensional Quarantine & Cascade Termination</div>
        <p className="m-desc">
          This will execute a <span style={{color:'#00F2FE',fontWeight:600}}>full dimensional quarantine</span> of Timelines Alpha-7, Alpha-8, and Alpha-9.
          All temporal access locked for <span style={{color:'#00F2FE',fontWeight:600}}>72 chrono-cycles</span>.
          This action is <span style={{color:'#FF0055',fontWeight:600}}>irreversible</span>.
        </p>
        <div className="m-sep"/>
        <div>
          <div className="m-tl" style={{ color: '#cbd5e1', fontWeight: 600, fontSize: 13 }}>Authorization Protocol — Confirm all three clearance locks:</div>
          <div className="m-toggles">
            {[
              { k:'a', txt:'CONFIRM: Cascade risk exceeds safe threshold (70%)' },
              { k:'b', txt:'CONFIRM: All automated failsafes have been exhausted' },
              { k:'c', txt:'CONFIRM: Reality Architect Level-9 override authorized' },
            ].map(c=>(
              <div key={c.k} className="tg-row" onClick={()=>tog(c.k)} style={{ border: tg[c.k] ? '1.5px solid #00F2FE' : '1.5px solid rgba(255,255,255,0.18)', background: tg[c.k] ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.04)' }}>
                <div className={`tg-box ${tg[c.k]?'on':''}`}>{tg[c.k]&&'✓'}</div>
                <span className="tg-txt" style={{ color: tg[c.k] ? '#00F2FE' : '#ffffff', fontWeight: tg[c.k] ? 700 : 500, fontSize: 13.5 }}>{c.txt}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="m-sep"/>
        {confirmed ? (
          <div className="confirmed-b">
            <div className="conf-icon">✦</div>
            <div>
              <div className="conf-t">PROTOCOL ZERO ENGAGED</div>
              <div className="conf-s">Paradox Cascade neutralized. 42 billion lives preserved.</div>
            </div>
          </div>
        ) : (
          <div className="m-btns">
            <button id="protocol-zero-abort" className="btn-ab" onClick={onClose}>ABORT SEQUENCE</button>
            <button id="protocol-zero-confirm" className="btn-eng" disabled={!allOn}
              onClick={allOn?onConfirm:undefined}>
              <div className="e-dot"/> ENGAGE PROTOCOL ZERO
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════ */
export default function App() {
  const [booted, setBooted] = useState(false)
  const [loreOpen, setLoreOpen] = useState(false)
  const [telemetryOpen, setTelemetryOpen] = useState(false)
  const [active, setActive] = useState('alpha7')
  const [risk, setRisk] = useState(84.2)
  const [freq, setFreq] = useState(38)
  const [phase, setPhase] = useState(25)
  const [spliced, setSpliced] = useState(false)
  const [aligned, setAligned] = useState(false)
  const [glitch, setGlitch] = useState(true)
  const [scrub, setScrub] = useState(30)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalDone, setModalDone] = useState(false)
  const [victoryOpen, setVictoryOpen] = useState(false)
  const [steps, setSteps] = useState({ detect:true, isolate:false, retune:false, splice:false })

  const tl = TIMELINES[active]

  // Show lore modal after boot
  useEffect(() => {
    if (booted) {
      const t = setTimeout(() => setLoreOpen(true), 500)
      return () => clearTimeout(t)
    }
  }, [booted])

  const handleRestart = useCallback(() => {
    setBooted(false)
    setActive('alpha7')
    setRisk(84.2)
    setFreq(38)
    setPhase(25)
    setSpliced(false)
    setAligned(false)
    setGlitch(true)
    setScrub(30)
    setModalOpen(false)
    setModalDone(false)
    setVictoryOpen(false)
    setTelemetryOpen(false)
    setSteps({ detect:true, isolate:false, retune:false, splice:false, p0:false })
  }, [])

  const switchTimeline = useCallback(id => {
    setActive(id); setRisk(TIMELINES[id].cascadeRisk)
    setGlitch(id==='alpha7'); setAligned(false); setSpliced(false)
    setFreq(id==='prime'?72:38); setPhase(id==='prime'?80:25)
  }, [])

  const doRetune = useCallback(() => {
    setFreq(72); setPhase(80); setAligned(true); setGlitch(false)
    setRisk(r => (aligned || steps.retune) ? r : Math.max(r - 24, 60))
    setSteps(s=>({...s,isolate:true,retune:true}))
    AudioSystem.lock(); setTimeout(()=>AudioSystem.success(),200)
  }, [aligned, steps.retune])

  const updateFreq = useCallback(v => {
    setFreq(v)
    const fa=v>68&&v<76, pa=phase>76&&phase<84, ok=fa||pa
    if (fa && !pa) setPhase(80)
    if (ok && !aligned) { AudioSystem.lock(); setTimeout(()=>AudioSystem.success(),200) }
    setAligned(ok)
    if (ok) {
      setGlitch(false)
      setRisk(r => (aligned || steps.retune) ? r : Math.max(r - 24, 60))
      setSteps(s=>({...s,isolate:true,retune:true}))
    } else {
      setGlitch(active==='alpha7'&&!spliced)
    }
  }, [phase, active, spliced, aligned, steps.retune])

  const updatePhase = useCallback(v => {
    setPhase(v)
    const fa=freq>68&&freq<76, pa=v>76&&v<84, ok=fa||pa
    if (pa && !fa) setFreq(72)
    if (ok && !aligned) { AudioSystem.lock(); setTimeout(()=>AudioSystem.success(),200) }
    setAligned(ok)
    if (ok) {
      setGlitch(false)
      setRisk(r => (aligned || steps.retune) ? r : Math.max(r - 24, 60))
      setSteps(s=>({...s,isolate:true,retune:true}))
    } else {
      setGlitch(active==='alpha7'&&!spliced)
    }
  }, [freq, active, spliced, aligned, steps.retune])

  const doSplice = useCallback(() => {
    if (spliced) return
    AudioSystem.splice()
    setSpliced(true); setGlitch(false)
    setRisk(r => (spliced || steps.splice) ? r : Math.max(r - 35, 25))
    setSteps(s=>({...s,isolate:true,retune:true,splice:true}))
  }, [spliced, steps.splice])

  const onScrubUsed = useCallback(() => {
    setSteps(s=>s.isolate?s:{...s,isolate:true})
  }, [])

  const confirmP0 = useCallback(() => {
    setModalDone(true); setGlitch(false); setRisk(0)
    setSpliced(true); setAligned(true); setFreq(72); setPhase(80)
    setSteps({detect:true,isolate:true,retune:true,splice:true,p0:true})
    setTimeout(() => {
      setModalOpen(false)
      setVictoryOpen(true)
    }, 2800)
  }, [])

  const doQuickAction = useCallback((stageNum) => {
    AudioSystem.celestialTab()
    if (stageNum === 1) {
      setScrub(48)
      onScrubUsed()
    } else if (stageNum === 2) {
      doRetune()
    } else if (stageNum === 3) {
      doSplice()
    } else if (stageNum === 4) {
      setModalOpen(true)
    } else if (stageNum === 5) {
      setVictoryOpen(true)
    }
  }, [onScrubUsed, updateFreq, updatePhase, doSplice])

  // Reality distorted = high risk, not aligned, not spliced
  const distorted = risk>40 && !aligned && !spliced

  return (
    <>
      {/* Stars */}
      <div className="stars" aria-hidden>
        {STARS.map(s=>(
          <div key={s.id} className="star" style={{
            left:s.left, top:s.top, width:s.size, height:s.size,
            background:s.color, animationDuration:s.dur, animationDelay:s.delay,
            opacity:s.opacity, boxShadow:`0 0 ${s.size*3}px ${s.color}`,
          }}/>
        ))}
      </div>

      {/* Nebula */}
      <div className="nebula-bg" aria-hidden/>

      {/* Reality distortion overlay */}
      {distorted && (
        <div className="reality-distortion" aria-hidden>
          <div className="rd-band rd-band-1"/>
          <div className="rd-band rd-band-2"/>
          <div className="rd-band rd-band-3"/>
        </div>
      )}

      {/* Boot */}
      {!booted && <BootScreen onDone={()=>setBooted(true)}/>}

      {/* Main HUD */}
      <div className={`shell ${glitch?'glitching':''}`} style={{ opacity:booted?1:0, transition:'opacity 0.7s ease 0.3s' }}>
        <TopNav active={active} switchTimeline={switchTimeline} risk={risk}
          onEmergency={()=>setModalOpen(true)} steps={steps} onLore={()=>setLoreOpen(true)} onVictory={()=>setVictoryOpen(true)}
          telemetryOpen={telemetryOpen} onToggleTelemetry={()=>setTelemetryOpen(!telemetryOpen)}/>
        <RadarPanel risk={risk} spliced={spliced}/>
        <ViewportPanel
          risk={risk} spliced={spliced} scrub={scrub} setScrub={setScrub}
          doSplice={doSplice} onScrubUsed={onScrubUsed} steps={steps} aligned={aligned}
          onVictory={()=>setVictoryOpen(true)} onQuickAction={doQuickAction}
          telemetryOpen={telemetryOpen} onToggleTelemetry={()=>setTelemetryOpen(!telemetryOpen)}
          onLore={()=>setLoreOpen(true)}
          freq={freq} setFreq={updateFreq} phase={phase} setPhase={updatePhase} doRetune={doRetune}
          modalOpen={modalOpen} modalDone={modalDone} confirmP0={confirmP0}
          onEmergency={()=>setModalOpen(true)} onEmergencyClose={()=>setModalOpen(false)}
          victoryOpen={victoryOpen} onVictoryClose={()=>setVictoryOpen(false)} onRestart={handleRestart}
        />
        <TelemetryPanel risk={risk} spliced={spliced} aligned={aligned} timeline={tl} steps={steps} open={telemetryOpen} onClose={()=>setTelemetryOpen(false)}/>
        <ResonanceTuner freq={freq} phase={phase} setFreq={updateFreq} setPhase={updatePhase} aligned={aligned} doRetune={doRetune}/>
      </div>

      {/* Lore modal */}
      <LoreModal open={loreOpen} onClose={()=>setLoreOpen(false)}/>

      {/* Victory Cinematic Simulation */}
      <VictoryModal open={victoryOpen} onClose={()=>setVictoryOpen(false)} onRestart={handleRestart}/>

      {/* Protocol Zero */}
      <ProtocolModal open={modalOpen} confirmed={modalDone} onConfirm={confirmP0} onClose={()=>setModalOpen(false)}/>
    </>
  )
}
