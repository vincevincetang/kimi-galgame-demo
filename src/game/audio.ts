import type { BgmId, Speaker } from './types'

// ============ WebAudio 生成式音频引擎（无外部音频资源）============

interface TrackDef {
  bpm: number
  chords: number[][] // 每小节的和弦（频率）
  bass?: number[] // 每小节根音
  pad: { type: OscillatorType; gain: number; detune?: number }
  arp?: { type: OscillatorType; gain: number; steps: number[] } // steps: 每小节16分里触发哪些
  hat?: boolean
  lofi?: boolean
}

const N = (semi: number) => 440 * Math.pow(2, (semi - 9) / 12) // semi: 相对C4的半音数（A4=9）

// 和弦表（半音）
const CH = {
  Cmaj9: [0, 4, 7, 14],
  Am9: [-3, 0, 4, 10],
  Fmaj9: [-7, -3, 0, 7],
  G9: [-5, -1, 2, 8],
  Dm9: [-10, -6, -3, 4],
  Bbmaj9: [-14, -10, -7, 0],
  Em7: [-8, -5, -1, 2],
  Am7: [-3, 0, 4, 7],
  FMaj7: [-7, -3, 0, 4],
  Cmaj7: [0, 4, 7, 11],
  Dm7: [-10, -6, -3, 0],
  G7: [-5, -1, 2, 5],
  Em9: [-8, -4, -1, 5],
  Amaj9: [-9, -5, -2, 5],
  Dmaj9: [-2, 2, 5, 12],
  Bm9: [-13, -9, -6, 1],
  Fsm7b5: [-6, -3, 0, 4],
}

const TRACKS: Record<BgmId, TrackDef> = {
  title: {
    bpm: 66,
    chords: [CH.Cmaj9, CH.Am9, CH.Fmaj9, CH.G9],
    bass: [-24, -27, -31, -29],
    pad: { type: 'sawtooth', gain: 0.05, detune: 8 },
    arp: { type: 'sine', gain: 0.09, steps: [0, 4, 8, 12, 14] },
  },
  daily: {
    bpm: 84,
    chords: [CH.FMaj7, CH.Cmaj7, CH.Dm9, CH.Bbmaj9],
    bass: [-31, -24, -34, -38],
    pad: { type: 'triangle', gain: 0.06 },
    arp: { type: 'triangle', gain: 0.08, steps: [0, 2, 4, 7, 8, 11, 12, 14] },
    hat: true,
    lofi: true,
  },
  night: {
    bpm: 56,
    chords: [CH.Am9, CH.Em9, CH.Fmaj9, CH.Dm9],
    bass: [-27, -32, -31, -34],
    pad: { type: 'sine', gain: 0.08, detune: 5 },
    arp: { type: 'sine', gain: 0.05, steps: [0, 6, 10] },
  },
  emotion: {
    bpm: 60,
    chords: [CH.Am7, CH.FMaj7, CH.Cmaj7, CH.G7],
    bass: [-27, -31, -24, -29],
    pad: { type: 'triangle', gain: 0.055 },
    arp: { type: 'sine', gain: 0.075, steps: [0, 8, 12] },
  },
  festival: {
    bpm: 96,
    chords: [CH.Dmaj9, CH.Amaj9, CH.Bm9, CH.Amaj9],
    bass: [-26, -33, -37, -33],
    pad: { type: 'sawtooth', gain: 0.04, detune: 6 },
    arp: { type: 'square', gain: 0.045, steps: [0, 2, 4, 6, 8, 10, 12, 14] },
    hat: true,
  },
  signal: {
    bpm: 50,
    chords: [CH.Dm9, CH.Fsm7b5, CH.Dm9, CH.Am9],
    bass: [-34, -30, -34, -27],
    pad: { type: 'sawtooth', gain: 0.035, detune: 18 },
    arp: { type: 'sine', gain: 0.05, steps: [0, 5, 7, 11] },
  },
  ending: {
    bpm: 62,
    chords: [CH.Cmaj7, CH.Em7, CH.FMaj7, CH.G9],
    bass: [-24, -32, -31, -29],
    pad: { type: 'triangle', gain: 0.07 },
    arp: { type: 'sine', gain: 0.08, steps: [0, 4, 8, 12] },
  },
}

class AudioEngine {
  ctx: AudioContext | null = null
  master: GainNode | null = null
  bgmGain: GainNode | null = null
  sfxGain: GainNode | null = null
  padFilter: BiquadFilterNode | null = null

  current: BgmId | null = null
  timer: number | null = null
  step = 0
  nextTime = 0
  muted = false
  vols = { bgm: 0.5, sfx: 0.6 }

  ensure() {
    if (this.ctx) return
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.connect(this.ctx.destination)
      this.bgmGain = this.ctx.createGain()
      this.padFilter = this.ctx.createBiquadFilter()
      this.padFilter.type = 'lowpass'
      this.padFilter.frequency.value = 1600
      this.padFilter.Q.value = 0.5
      this.bgmGain.connect(this.padFilter)
      this.padFilter.connect(this.master)
      this.sfxGain = this.ctx.createGain()
      this.sfxGain.connect(this.master)
      this.applyVolumes()
    } catch {
      this.ctx = null // 无声环境下静默降级，不影响游戏
    }
  }

  unlock() {
    this.ensure()
    if (this.ctx && this.ctx.state === 'suspended') void this.ctx.resume()
  }

  applyVolumes() {
    if (!this.ctx || !this.master || !this.bgmGain || !this.sfxGain) return
    this.master.gain.value = this.muted ? 0 : 1
    this.bgmGain.gain.value = this.vols.bgm
    this.sfxGain.gain.value = this.vols.sfx
  }

  setVolumes(bgm: number, sfx: number) {
    this.vols = { bgm, sfx }
    this.applyVolumes()
  }

  setMute(m: boolean) {
    this.muted = m
    this.applyVolumes()
  }

  play(track: BgmId | null) {
    this.ensure()
    if (this.current === track) return
    this.stopBgm()
    this.current = track
    if (!track || !this.ctx) return
    this.step = 0
    this.nextTime = this.ctx.currentTime + 0.1
    this.timer = window.setInterval(() => this.schedule(), 80)
  }

  stopBgm() {
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private schedule() {
    if (!this.ctx || !this.current) return
    const def = TRACKS[this.current]
    const stepDur = 60 / def.bpm / 4 // 16分音符
    while (this.nextTime < this.ctx.currentTime + 0.3) {
      this.scheduleStep(def, this.step, this.nextTime, stepDur)
      this.step++
      this.nextTime += stepDur
    }
  }

  private scheduleStep(def: TrackDef, step: number, time: number, stepDur: number) {
    if (!this.ctx || !this.bgmGain) return
    const stepsPerBar = 16
    const bar = Math.floor(step / stepsPerBar) % def.chords.length
    const inBar = step % stepsPerBar
    const chord = def.chords[bar]

    // Pad：每小节头触发，覆盖整小节
    if (inBar === 0) {
      const dur = stepDur * stepsPerBar
      chord.forEach((semi) => {
        this.tone(N(semi), time, dur, def.pad.type, def.pad.gain, 0.4, def.pad.detune)
      })
      if (def.bass) {
        this.tone(N(def.bass[bar]), time, dur * 0.9, 'sine', 0.09, 0.2)
      }
      if (def.lofi) this.vinyl(time, dur)
    }
    // Arp
    if (def.arp && def.arp.steps.includes(inBar)) {
      const note = chord[(step * 7 + bar * 3) % chord.length] + 12
      const oct = (step % 32 >= 16 ? 12 : 0)
      this.tone(N(note + oct), time, stepDur * 3, def.arp.type, def.arp.gain, 0.01)
    }
    // Hat
    if (def.hat && inBar % 2 === 0) {
      this.noiseHat(time, inBar % 4 === 2 ? 0.035 : 0.02)
    }
  }

  private tone(
    freq: number,
    time: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    attack: number,
    detune = 0,
  ) {
    if (!this.ctx || !this.bgmGain) return
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    osc.detune.value = (Math.random() - 0.5) * detune
    g.gain.setValueAtTime(0, time)
    g.gain.linearRampToValueAtTime(gain, time + attack)
    g.gain.setTargetAtTime(0, time + dur * 0.7, dur * 0.15)
    osc.connect(g)
    g.connect(this.bgmGain)
    osc.start(time)
    osc.stop(time + dur + 0.5)
  }

  private noiseHat(time: number, gain: number) {
    if (!this.ctx || !this.bgmGain) return
    const len = 0.05
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * len, this.ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    const f = this.ctx.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = 7000
    const g = this.ctx.createGain()
    g.gain.value = gain
    src.connect(f)
    f.connect(g)
    g.connect(this.bgmGain)
    src.start(time)
  }

  private vinyl(time: number, dur: number) {
    if (!this.ctx || !this.bgmGain) return
    const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.012 + (Math.random() < 0.0002 ? (Math.random() - 0.5) * 0.4 : 0)
    }
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    const g = this.ctx.createGain()
    g.gain.value = 0.5
    src.connect(g)
    g.connect(this.bgmGain)
    src.start(time)
  }

  // ===== SFX =====
  blip(who: Speaker) {
    this.unlock()
    if (!this.ctx || !this.sfxGain) return
    const base = who === 'wanqing' ? 660 : who === 'xingmian' ? 520 : who === 'bailu' ? 780 : who === 'player' ? 360 : 300
    const t = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = who === 'bailu' ? 'sine' : 'triangle'
    osc.frequency.value = base * (1 + Math.random() * 0.06)
    g.gain.setValueAtTime(0.12, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
    osc.connect(g)
    g.connect(this.sfxGain)
    osc.start(t)
    osc.stop(t + 0.08)
  }

  ui(kind: 'hover' | 'confirm' | 'back' | 'unlock') {
    this.unlock()
    if (!this.ctx || !this.sfxGain) return
    const t = this.ctx.currentTime
    const mk = (freq: number, delay: number, dur: number, gain = 0.1) => {
      if (!this.ctx || !this.sfxGain) return
      const osc = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      g.gain.setValueAtTime(gain, t + delay)
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur)
      osc.connect(g)
      g.connect(this.sfxGain)
      osc.start(t + delay)
      osc.stop(t + delay + dur + 0.02)
    }
    if (kind === 'hover') mk(880, 0, 0.05, 0.05)
    if (kind === 'confirm') { mk(660, 0, 0.08); mk(990, 0.07, 0.12) }
    if (kind === 'back') { mk(520, 0, 0.08); mk(390, 0.07, 0.1) }
    if (kind === 'unlock') { mk(523, 0, 0.15); mk(659, 0.12, 0.15); mk(784, 0.24, 0.25) }
  }
}

export const audio = new AudioEngine()
