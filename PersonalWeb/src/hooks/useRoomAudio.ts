import { useCallback, useEffect, useRef, useState } from 'react'

const MUTE_KEY = 'harbor.room-muted.v1'
const MUSIC_DURATION = 148

type DeviceKind = 'airConditioner' | 'fan'

interface DeviceLoop {
  gain: GainNode
  sources: AudioScheduledSourceNode[]
}

interface MusicNodes {
  gain: GainNode
  sources: OscillatorNode[]
}

interface AudioGraph {
  context: AudioContext
  master: GainNode
  noiseBuffer: AudioBuffer
  devices: Partial<Record<DeviceKind, DeviceLoop>>
  music: MusicNodes | null
}

function readMuted(): boolean {
  try {
    return sessionStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

function makeNoiseBuffer(context: AudioContext): AudioBuffer {
  const length = context.sampleRate * 2
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const channel = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1
    last = last * 0.985 + white * 0.015
    channel[i] = last * 2.4
  }
  return buffer
}

export function useRoomAudio({ airConditioner, fan }: { airConditioner: boolean; fan: boolean }) {
  const graphRef = useRef<AudioGraph | null>(null)
  const stopTimersRef = useRef<number[]>([])
  const [muted, setMutedState] = useState(readMuted)
  const mutedRef = useRef(muted)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [musicPosition, setMusicPosition] = useState(0)
  const musicOffsetRef = useRef(0)
  const musicStartedAtRef = useRef(0)

  const ensureGraph = useCallback(async (): Promise<AudioGraph> => {
    let graph = graphRef.current
    if (!graph) {
      const context = new AudioContext()
      const master = context.createGain()
      master.gain.value = mutedRef.current ? 0 : 0.55
      master.connect(context.destination)
      graph = {
        context,
        master,
        noiseBuffer: makeNoiseBuffer(context),
        devices: {},
        music: null,
      }
      graphRef.current = graph
    }
    if (graph.context.state === 'suspended') await graph.context.resume()
    return graph
  }, [])

  const stopLoop = useCallback((kind: DeviceKind) => {
    const graph = graphRef.current
    const loop = graph?.devices[kind]
    if (!graph || !loop) return
    delete graph.devices[kind]
    const now = graph.context.currentTime
    loop.gain.gain.cancelScheduledValues(now)
    loop.gain.gain.setValueAtTime(loop.gain.gain.value, now)
    loop.gain.gain.linearRampToValueAtTime(0, now + 0.5)
    const timer = window.setTimeout(() => {
      loop.sources.forEach((source) => {
        try {
          source.stop()
        } catch {
          /* source may already be stopped */
        }
      })
    }, 560)
    stopTimersRef.current.push(timer)
  }, [])

  const startLoop = useCallback(async (kind: DeviceKind) => {
    const graph = await ensureGraph()
    if (graph.devices[kind]) return

    const now = graph.context.currentTime
    const gain = graph.context.createGain()
    const filter = graph.context.createBiquadFilter()
    const noise = graph.context.createBufferSource()
    noise.buffer = graph.noiseBuffer
    noise.loop = true
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(graph.master)

    const sources: AudioScheduledSourceNode[] = [noise]
    const targetGain = kind === 'airConditioner' ? 0.065 : 0.052
    filter.type = kind === 'airConditioner' ? 'lowpass' : 'bandpass'
    filter.frequency.value = kind === 'airConditioner' ? 520 : 760
    filter.Q.value = kind === 'airConditioner' ? 0.55 : 1.25

    if (kind === 'fan') {
      const hum = graph.context.createOscillator()
      const humGain = graph.context.createGain()
      hum.type = 'sine'
      hum.frequency.value = 92
      humGain.gain.value = 0.014
      hum.connect(humGain)
      humGain.connect(gain)
      hum.start(now)
      sources.push(hum)
    }

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(targetGain, now + 0.55)
    noise.start(now)
    graph.devices[kind] = { gain, sources }
  }, [ensureGraph])

  useEffect(() => {
    if (airConditioner) void startLoop('airConditioner').catch(() => undefined)
    else stopLoop('airConditioner')
  }, [airConditioner, startLoop, stopLoop])

  useEffect(() => {
    if (fan) void startLoop('fan').catch(() => undefined)
    else stopLoop('fan')
  }, [fan, startLoop, stopLoop])

  const playClick = useCallback(async () => {
    const graph = await ensureGraph()
    const now = graph.context.currentTime
    const oscillator = graph.context.createOscillator()
    const gain = graph.context.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(520, now)
    oscillator.frequency.exponentialRampToValueAtTime(310, now + 0.075)
    gain.gain.setValueAtTime(0.035, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)
    oscillator.connect(gain)
    gain.connect(graph.master)
    oscillator.start(now)
    oscillator.stop(now + 0.1)
  }, [ensureGraph])

  const stopMusicNodes = useCallback(() => {
    const graph = graphRef.current
    if (!graph?.music) return
    const music = graph.music
    graph.music = null
    const now = graph.context.currentTime
    music.gain.gain.cancelScheduledValues(now)
    music.gain.gain.setValueAtTime(music.gain.gain.value, now)
    music.gain.gain.linearRampToValueAtTime(0, now + 0.22)
    const timer = window.setTimeout(() => {
      music.sources.forEach((source) => {
        try {
          source.stop()
        } catch {
          /* source may already be stopped */
        }
      })
    }, 260)
    stopTimersRef.current.push(timer)
  }, [])

  const startMusicNodes = useCallback(async () => {
    const graph = await ensureGraph()
    if (graph.music) return
    const now = graph.context.currentTime
    const gain = graph.context.createGain()
    const filter = graph.context.createBiquadFilter()
    const sources: OscillatorNode[] = []
    filter.type = 'lowpass'
    filter.frequency.value = 860
    filter.Q.value = 0.7
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.036, now + 0.8)
    filter.connect(gain)
    gain.connect(graph.master)

    for (const [frequency, detune] of [[130.81, -4], [196, 3], [261.63, -2]] as const) {
      const oscillator = graph.context.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      oscillator.detune.value = detune
      oscillator.connect(filter)
      oscillator.start(now)
      sources.push(oscillator)
    }
    graph.music = { gain, sources }
  }, [ensureGraph])

  const setMusicPlayingSafe = useCallback((next: boolean) => {
    if (next) {
      void startMusicNodes().then(() => {
        const graph = graphRef.current
        if (!graph) return
        musicStartedAtRef.current = graph.context.currentTime
        setMusicPlaying(true)
      }).catch(() => setMusicPlaying(false))
      return
    }
    const graph = graphRef.current
    if (graph && musicPlaying) {
      musicOffsetRef.current = (musicOffsetRef.current + graph.context.currentTime - musicStartedAtRef.current) % MUSIC_DURATION
      setMusicPosition(musicOffsetRef.current)
    }
    stopMusicNodes()
    setMusicPlaying(false)
  }, [musicPlaying, startMusicNodes, stopMusicNodes])

  const seekMusic = useCallback((position: number) => {
    const next = Math.max(0, Math.min(MUSIC_DURATION, position))
    musicOffsetRef.current = next
    setMusicPosition(next)
    const graph = graphRef.current
    if (graph && musicPlaying) musicStartedAtRef.current = graph.context.currentTime
  }, [musicPlaying])

  useEffect(() => {
    if (!musicPlaying) return
    const timer = window.setInterval(() => {
      const graph = graphRef.current
      if (!graph) return
      const next = (musicOffsetRef.current + graph.context.currentTime - musicStartedAtRef.current) % MUSIC_DURATION
      setMusicPosition(next)
    }, 250)
    return () => window.clearInterval(timer)
  }, [musicPlaying])

  const setMuted = useCallback((next: boolean) => {
    mutedRef.current = next
    setMutedState(next)
    try {
      sessionStorage.setItem(MUTE_KEY, next ? '1' : '0')
    } catch {
      /* storage is optional */
    }
    const graph = graphRef.current
    if (!graph) return
    const now = graph.context.currentTime
    graph.master.gain.cancelScheduledValues(now)
    graph.master.gain.setValueAtTime(graph.master.gain.value, now)
    graph.master.gain.linearRampToValueAtTime(next ? 0 : 0.55, now + 0.18)
  }, [])

  useEffect(() => () => {
    stopTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    const graph = graphRef.current
    graph?.context.close().catch(() => undefined)
    graphRef.current = null
  }, [])

  return {
    muted,
    setMuted,
    playClick,
    musicPlaying,
    setMusicPlaying: setMusicPlayingSafe,
    musicPosition,
    musicDuration: MUSIC_DURATION,
    seekMusic,
  }
}
