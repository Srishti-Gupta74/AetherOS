import { useRef, useMemo, Suspense, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, OrbitControls, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Floating crystal debris ─── */
function CrystalField({ count = 80 }) {
  const group = useRef()
  const data = useMemo(() => Array.from({ length: count }, (_, i) => ({
    pos: [
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 18,
    ],
    rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    scale: 0.04 + Math.random() * 0.12,
    speed: 0.002 + Math.random() * 0.008,
    color: i % 3 === 0 ? '#7B2FFF' : i % 3 === 1 ? '#00F2FE' : '#FF0055',
  })), [count])

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.015
  })

  return (
    <group ref={group}>
      {data.map((d, i) => (
        <RotatingCrystal key={i} {...d} />
      ))}
    </group>
  )
}

function RotatingCrystal({ pos, rot, scale, speed, color }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.x += dt * speed * 40
      ref.current.rotation.z += dt * speed * 25
    }
  })
  return (
    <mesh ref={ref} position={pos} rotation={rot} scale={scale}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0.2} metalness={0.9} />
    </mesh>
  )
}

/* ─── Core pulsing orb (Smooth Glowing Sphere) ─── */
function CoreOrb({ riskColor, spliced }) {
  const coreRef = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const ring3Ref = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.004
      coreRef.current.rotation.x += 0.002
      const s = 1 + Math.sin(t * 1.8) * 0.06
      coreRef.current.scale.setScalar(s)
    }
    if (ring1Ref.current) { ring1Ref.current.rotation.z += 0.014; ring1Ref.current.rotation.x = Math.PI/2 + Math.sin(t*0.4)*0.4 }
    if (ring2Ref.current) { ring2Ref.current.rotation.z -= 0.009; ring2Ref.current.rotation.y = t*0.2 }
    if (ring3Ref.current) { ring3Ref.current.rotation.x += 0.006; ring3Ref.current.rotation.z = t*0.15 }
  })

  return (
    <group>
      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial color={riskColor} emissive={riskColor} emissiveIntensity={0.2} transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.8, 64, 64]} />
        <meshStandardMaterial color={riskColor} emissive={riskColor} emissiveIntensity={spliced ? 0.4 : 1.1} roughness={0.1} metalness={0.95} />
      </mesh>

      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.72, 32, 32]} />
        <meshStandardMaterial color={riskColor} emissive={riskColor} emissiveIntensity={1.8} transparent opacity={0.25} side={THREE.BackSide} />
      </mesh>

      {/* Ring 1 — violet */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.4, 0.025, 16, 100]} />
        <meshStandardMaterial color='#7B2FFF' emissive='#7B2FFF' emissiveIntensity={1.5} />
      </mesh>

      {/* Ring 2 — cyan */}
      <mesh ref={ring2Ref} rotation={[Math.PI/3, 0, Math.PI/6]}>
        <torusGeometry args={[1.75, 0.018, 16, 100]} />
        <meshStandardMaterial color='#00F2FE' emissive='#00F2FE' emissiveIntensity={1.2} />
      </mesh>

      {/* Ring 3 — thin outer */}
      <mesh ref={ring3Ref} rotation={[Math.PI/1.5, Math.PI/4, 0]}>
        <torusGeometry args={[2.1, 0.01, 12, 100]} />
        <meshStandardMaterial color='#a855f7' emissive='#a855f7' emissiveIntensity={0.8} transparent opacity={0.6} />
      </mesh>

      {/* Point lights */}
      <pointLight color={riskColor} intensity={4} distance={8} decay={2} />
      <pointLight color='#7B2FFF' intensity={1.5} distance={5} decay={2} position={[2, 1, 0]} />
    </group>
  )
}

/* ─── Timeline waveform strands (Interactive with causality scrubber) ─── */
function WaveStrand({ yBase, color, freq, phase, speed, scrub, spliced }) {
  const ref = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const geo = ref.current?.geometry
    if (!geo) return
    const pos = geo.attributes.position
    const count = pos.count
    for (let i = 0; i < count; i++) {
      const u = i / (count - 1)
      const x = (u - 0.5) * 14
      const distort = spliced ? 0 : Math.max(0, (0.55 - Math.abs(u - scrub/100) * 2.5)) * 0.8
      const y = yBase + Math.sin(u * Math.PI * 4 * freq + t * speed + phase) * (0.35 + distort)
      pos.setXYZ(i, x, y, 0)
    }
    pos.needsUpdate = true
  })

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pts = []
    for (let i = 0; i < 120; i++) {
      const x = ((i / 119) - 0.5) * 14
      pts.push(x, yBase, 0)
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [yBase])

  return (
    <line geometry={geo} ref={ref}>
      <lineBasicMaterial color={color} transparent opacity={0.75} linewidth={2} />
    </line>
  )
}

/* ─── Anomaly tears ─── */
function TearSpark({ pos, i }) {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ref.current) {
      const s = 0.1 + Math.sin(t * 3.5 + i * 1.3) * 0.06
      ref.current.scale.setScalar(s)
      ref.current.rotation.x += 0.02
      ref.current.rotation.y += 0.015
    }
  })
  return (
    <mesh ref={ref} position={pos}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color='#FF0055' emissive='#FF0055' emissiveIntensity={2.5} transparent opacity={0.9} wireframe />
    </mesh>
  )
}

/* ─── Splice beam ─── */
function SpliceBeam() {
  const ref = useRef()
  const pts = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5, -0.4, 0),
      new THREE.Vector3(-2, 0.3, 0.5),
      new THREE.Vector3(2, -0.3, -0.5),
      new THREE.Vector3(5, 0.4, 0),
    ])
    return curve.getPoints(80)
  }, [])
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(pts), [pts])

  useFrame((state) => {
    if (ref.current) {
      ref.current.material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 4) * 0.3
    }
  })

  return (
    <line ref={ref} geometry={geo}>
      <lineBasicMaterial color='#00F2FE' transparent opacity={0.8} linewidth={3} />
    </line>
  )
}

/* ─── 3D Spacetime Curvature Mesh Fabric (Interactive Touch & Click Ripples) ─── */
function SpacetimeCurvatureGrid({ spliced, scrub, riskColor }) {
  const meshRef = useRef()
  const wireRef = useRef()
  const pointsRef = useRef()
  const touchRipplesRef = useRef([])

  const { pointsGeo } = useMemo(() => {
    const pGeo = new THREE.BufferGeometry()
    const pCount = 35 * 35
    const posArr = new Float32Array(pCount * 3)
    let idx = 0
    for (let r = 0; r < 35; r++) {
      for (let c = 0; c < 35; c++) {
        const u = r / 34, v = c / 34
        posArr[idx * 3] = (u - 0.5) * 30
        posArr[idx * 3 + 1] = (v - 0.5) * 30
        posArr[idx * 3 + 2] = 0
        idx++
      }
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
    return { pointsGeo: pGeo }
  }, [])

  const handleFabricClick = useCallback((e) => {
    e.stopPropagation()
    if (!meshRef.current) return
    const pt = e.point.clone()
    meshRef.current.worldToLocal(pt)
    // Add interactive click ripple to our active gravitational shockwave buffer (Crisp & Obvious Goldilocks Sweet Spot)
    touchRipplesRef.current.push({
      x: pt.x,
      y: pt.y,
      worldPos: e.point.clone(),
      time: performance.now() / 1000,
      strength: 1.05
    })
    // Keep max 10 active ripples for satisfying visual feedback without clutter
    if (touchRipplesRef.current.length > 10) touchRipplesRef.current.shift()
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const geo = meshRef.current?.geometry
    if (!geo) return
    const pos = geo.attributes.position
    const count = pos.count

    // Clean up expired touch ripples after 2.8 seconds for crisp, visible propagation
    const curTime = performance.now() / 1000
    touchRipplesRef.current = touchRipplesRef.current.filter(r => (curTime - r.time) < 2.8)
    const activeRipples = touchRipplesRef.current

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i) // local y before rotation
      const distToCore = Math.sqrt(x * x + y * y)

      // 1. Spacetime gravity well depression under the quantum orb
      let z = -Math.exp(-distToCore * 0.36) * 1.5

      // 2. Smooth undulating harmonic ripples across the deep fabric
      z += Math.sin(distToCore * 1.5 - t * 1.8 + (scrub / 25)) * 0.14
      z += Math.cos(x * 0.6 + t * 1.1) * Math.sin(y * 0.6 + t * 1.1) * 0.1

      // 3. Interactive Touch / Click Ripples (Clearly Visible Goldilocks Sweet Spot!)
      for (let rIdx = 0; rIdx < activeRipples.length; rIdx++) {
        const rp = activeRipples[rIdx]
        const dt = curTime - rp.time
        if (dt <= 0) continue
        const distToClick = Math.sqrt((x - rp.x) ** 2 + (y - rp.y) ** 2)
        
        // 2 to 3 smooth concentric wave rings rolling visibly across the grid
        const waveRadius = dt * 8.0
        const distFromRing = distToClick - waveRadius
        if (Math.abs(distFromRing) < 5.5) {
          const osc = Math.sin(distToClick * 2.4 - dt * 10.0)
          const env = Math.exp(-Math.abs(distFromRing) * 0.45) * Math.exp(-dt * 0.95)
          z += osc * env * rp.strength * 1.2
        }

        // Elastic localized spring right at the exact touch coordinate
        if (distToClick < 3.8 && dt < 1.4) {
          const rebound = Math.sin(dt * 14.0) * Math.exp(-distToClick * 0.75) * Math.exp(-dt * 2.0) * rp.strength
          z += rebound
        }
      }

      // 4. Spacetime tears when anomalies active
      if (!spliced) {
        const dTear1 = Math.sqrt((x - 3.5) ** 2 + (y - 1.0) ** 2)
        const dTear2 = Math.sqrt((x + 3.2) ** 2 + (y - 1.5) ** 2)
        if (dTear1 < 3.0) z -= (3.0 - dTear1) * 0.45 * Math.sin(t * 4.5)
        if (dTear2 < 3.0) z -= (3.0 - dTear2) * 0.38 * Math.cos(t * 4.0)
      }

      pos.setZ(i, z)
    }
    pos.needsUpdate = true
    if (geo.computeVertexNormals) geo.computeVertexNormals()

    // Sync wireframe copy exact geometry
    if (wireRef.current && wireRef.current.geometry) {
      wireRef.current.geometry.attributes.position.array.set(pos.array)
      wireRef.current.geometry.attributes.position.needsUpdate = true
    }

    // Sync floating quantum points and ripple them clearly too
    if (pointsRef.current && pointsRef.current.geometry) {
      const pPos = pointsRef.current.geometry.attributes.position
      for (let i = 0; i < pPos.count; i++) {
        const px = pPos.getX(i), py = pPos.getY(i)
        const d = Math.sqrt(px * px + py * py)
        let pz = -Math.exp(-d * 0.36) * 1.5 + Math.sin(d * 1.5 - t * 1.8 + (scrub / 25)) * 0.14
        
        for (let rIdx = 0; rIdx < activeRipples.length; rIdx++) {
          const rp = activeRipples[rIdx]
          const dt = curTime - rp.time
          if (dt <= 0) continue
          const distToClick = Math.sqrt((px - rp.x) ** 2 + (py - rp.y) ** 2)
          const waveRadius = dt * 8.0
          const distFromRing = distToClick - waveRadius
          if (Math.abs(distFromRing) < 5.5) {
            const osc = Math.sin(distToClick * 2.4 - dt * 10.0)
            const env = Math.exp(-Math.abs(distFromRing) * 0.45) * Math.exp(-dt * 0.95)
            pz += osc * env * rp.strength * 1.2
          }
        }

        if (!spliced) {
          const dT = Math.sqrt((px - 3.5) ** 2 + (py - 1.0) ** 2)
          if (dT < 3.0) pz -= (3.0 - dT) * 0.45 * Math.sin(t * 4.5)
        }
        pPos.setZ(i, pz + 0.05)
      }
      pPos.needsUpdate = true
    }
  })

  return (
    <group position={[0, -2.4, 0]} rotation={[-Math.PI / 2.15, 0, 0]}>
      {/* Deep translucent obsidian-indigo glass sheet with click/touch handler */}
      <mesh ref={meshRef} onPointerDown={handleFabricClick} cursor="pointer">
        <planeGeometry args={[32, 32, 48, 48]} />
        <meshStandardMaterial
          color="#050814"
          emissive={spliced ? '#0f172a' : '#1e1b4b'}
          emissiveIntensity={0.25}
          roughness={0.15}
          metalness={0.95}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Subtle, delicate indigo-cyan holographic wireframe (clicks pass through to glass sheet) */}
      <mesh ref={wireRef} pointerEvents="none">
        <planeGeometry args={[32, 32, 48, 48]} />
        <meshStandardMaterial
          wireframe
          color="#38bdf8"
          emissive="#4f46e5"
          emissiveIntensity={spliced ? 0.3 : 0.45}
          transparent
          opacity={0.18}
        />
      </mesh>

      {/* Sparkling quantum intersection motes floating along the mesh */}
      <points ref={pointsRef} geometry={pointsGeo} pointerEvents="none">
        <pointsMaterial
          size={0.065}
          color="#00F2FE"
          transparent
          opacity={0.65}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

/* ─── Deep background void grid ─── */
function Floor() {
  return <gridHelper args={[80, 80, '#0f172a', '#050816']} position={[0, -6.5, 0]} />
}

/* ─── Main exported scene ─── */
export default function Scene3D({ riskColor, spliced, scrub, anomaliesActive, aligned = false }) {
  return (
    <Canvas
      camera={{ position: [0, 1.8, 8.5], fov: 58 }}
      gl={{ antialias: true, alpha: false }}
      scene={{ background: new THREE.Color('#04050A') }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        {/* Lighting */}
        <ambientLight intensity={0.18} />
        <directionalLight position={[5, 8, 5]} intensity={0.4} />
        <pointLight position={[-6, 4, -4]} intensity={2.5} color='#7B2FFF' />
        <pointLight position={[6, -2, 5]} intensity={1.5} color='#00F2FE' />

        {/* Stars */}
        <Stars radius={100} depth={60} count={8000} factor={4} fade speed={0.4} />

        {/* Sparkles */}
        <Sparkles count={60} size={1.5} scale={[20, 10, 20]} speed={0.3} color='#a855f7' />

        {/* Deep background floor grid */}
        <Floor />

        {/* 3D Spacetime Curvature Mesh Fabric */}
        <SpacetimeCurvatureGrid spliced={spliced} scrub={scrub} riskColor={riskColor} />

        {/* Crystal debris */}
        <CrystalField count={70} />

        {/* Timeline waveform strands (Interactive with causality scrubber) */}
        <WaveStrand yBase={1.4}  color="#00F2FE" freq={1.2} phase={0.2} speed={1.2} scrub={scrub} spliced={spliced} />
        <WaveStrand yBase={-0.5} color="#FFD700" freq={0.9} phase={1.5} speed={0.9} scrub={scrub} spliced={spliced} />
        <WaveStrand yBase={-2.2} color="#FF0055" freq={1.5} phase={2.8} speed={1.5} scrub={scrub} spliced={spliced} />

        {/* Anomaly tears */}
        {anomaliesActive && <>
          <TearSpark pos={[3.5, 0.5, 1]}   i={0} />
          <TearSpark pos={[-3.2, -0.7, 1.5]} i={1} />
          <TearSpark pos={[1.2, 1.5, -2]}  i={2} />
        </>}

        {/* Splice beam */}
        {spliced && <SpliceBeam />}

        {/* Core orb */}
        <CoreOrb riskColor={riskColor} spliced={spliced} />

        {/* Orbit controls — INTERACTIVE & ELEVATED TARGET */}
        <OrbitControls
          enableZoom={true} enablePan={false}
          minDistance={3} maxDistance={18}
          autoRotate autoRotateSpeed={0.6}
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI * 0.1}
          zoomSpeed={0.8} rotateSpeed={0.6}
          target={[0, -0.6, 0]}
        />
      </Suspense>
    </Canvas>
  )
}
