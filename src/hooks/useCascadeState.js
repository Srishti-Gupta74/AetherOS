import { useState, useCallback } from 'react'

// Timeline data
const TIMELINES = {
  'alpha7': {
    id: 'alpha7',
    label: 'Alpha-7',
    status: 'CRITICAL',
    statusColor: 'var(--crimson)',
    cascadeRisk: 84.2,
    stability: 15.8,
    color: '--crimson',
    colorVal: '#FF0055',
    tabClass: 'tab-critical',
  },
  'alpha8': {
    id: 'alpha8',
    label: 'Alpha-8',
    status: 'UNSTABLE',
    statusColor: 'var(--gold)',
    cascadeRisk: 52.7,
    stability: 47.3,
    color: '--gold',
    colorVal: '#FFD700',
    tabClass: 'tab-unstable',
  },
  'prime': {
    id: 'prime',
    label: 'Prime',
    status: 'ANCHOR',
    statusColor: 'var(--cyan)',
    cascadeRisk: 4.1,
    stability: 95.9,
    color: '--cyan',
    colorVal: '#00F2FE',
    tabClass: 'tab-stable',
  },
}

export function useCascadeState() {
  const [activeTimeline, setActiveTimeline] = useState('alpha7')
  const [cascadeRisk, setCascadeRisk] = useState(84.2)
  const [frequencyVal, setFrequencyVal] = useState(38)   // 0-100, target is ~72 (432.8 MHz)
  const [phaseVal, setPhaseVal] = useState(25)            // 0-100, target is ~80
  const [isAligned, setIsAligned] = useState(false)
  const [glitchActive, setGlitchActive] = useState(true)
  const [nodesSpliced, setNodesSpliced] = useState(false)
  const [protocolZeroOpen, setProtocolZeroOpen] = useState(false)
  const [protocolZeroConfirmed, setProtocolZeroConfirmed] = useState(false)
  const [scrubPosition, setScrubPosition] = useState(30) // 0-100

  const timeline = TIMELINES[activeTimeline]

  const switchTimeline = useCallback((id) => {
    setActiveTimeline(id)
    setCascadeRisk(TIMELINES[id].cascadeRisk)
    setGlitchActive(id === 'alpha7')
    setIsAligned(false)
    setFrequencyVal(id === 'prime' ? 72 : 38)
    setPhaseVal(id === 'prime' ? 80 : 25)
    setNodesSpliced(false)
  }, [])

  const updateFrequency = useCallback((val) => {
    setFrequencyVal(val)
    const freqAligned = val > 68 && val < 76
    const phaseAligned = phaseVal > 76 && phaseVal < 84
    const aligned = freqAligned && phaseAligned
    setIsAligned(aligned)
    if (aligned) {
      setGlitchActive(false)
      setCascadeRisk(prev => Math.max(prev - 15, 0))
    } else {
      setGlitchActive(activeTimeline === 'alpha7' && !nodesSpliced)
    }
  }, [phaseVal, activeTimeline, nodesSpliced])

  const updatePhase = useCallback((val) => {
    setPhaseVal(val)
    const freqAligned = frequencyVal > 68 && frequencyVal < 76
    const phaseAligned = val > 76 && val < 84
    const aligned = freqAligned && phaseAligned
    setIsAligned(aligned)
    if (aligned) {
      setGlitchActive(false)
      setCascadeRisk(prev => Math.max(prev - 15, 0))
    } else {
      setGlitchActive(activeTimeline === 'alpha7' && !nodesSpliced)
    }
  }, [frequencyVal, activeTimeline, nodesSpliced])

  const spliceCausalNodes = useCallback(() => {
    setNodesSpliced(true)
    setGlitchActive(false)
    setCascadeRisk(prev => Math.max(prev - 20, 0))
  }, [])

  const openProtocolZero = useCallback(() => {
    setProtocolZeroOpen(true)
  }, [])

  const confirmProtocolZero = useCallback(() => {
    setProtocolZeroConfirmed(true)
    setGlitchActive(false)
    setCascadeRisk(0)
    setNodesSpliced(true)
    setIsAligned(true)
    setFrequencyVal(72)
    setPhaseVal(80)
    setTimeout(() => {
      setProtocolZeroOpen(false)
    }, 3000)
  }, [])

  const closeProtocolZero = useCallback(() => {
    setProtocolZeroOpen(false)
    setProtocolZeroConfirmed(false)
  }, [])

  return {
    timeline,
    timelines: TIMELINES,
    activeTimeline,
    switchTimeline,
    cascadeRisk,
    frequencyVal,
    phaseVal,
    isAligned,
    glitchActive,
    nodesSpliced,
    scrubPosition,
    setScrubPosition,
    updateFrequency,
    updatePhase,
    spliceCausalNodes,
    protocolZeroOpen,
    protocolZeroConfirmed,
    openProtocolZero,
    confirmProtocolZero,
    closeProtocolZero,
  }
}
