// 外部音源を使わず Web Audio API だけで効果音を生成する。
let ctx = null

function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    ctx = new AudioCtx()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone({ freq, freqEnd, duration = 0.15, type = 'sine', gain = 0.18, delay = 0 }) {
  const audioCtx = getCtx()
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const g = audioCtx.createGain()
  const startTime = audioCtx.currentTime + delay
  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)
  if (freqEnd) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), startTime + duration)
  }
  g.gain.setValueAtTime(gain, startTime)
  g.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.connect(g)
  g.connect(audioCtx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.03)
}

export function playHit(amount) {
  const intensity = Math.min(1, amount / 36)
  tone({
    freq: 150 + intensity * 90,
    freqEnd: 55,
    duration: 0.1 + intensity * 0.12,
    type: 'square',
    gain: 0.16 + intensity * 0.14,
  })
  if (intensity > 0.7) {
    tone({ freq: 90, freqEnd: 30, duration: 0.18, type: 'sawtooth', gain: 0.14, delay: 0.02 })
  }
}

export function playTakeDamage(amount) {
  const intensity = Math.min(1, amount / 30)
  tone({
    freq: 130,
    freqEnd: 45,
    duration: 0.14 + intensity * 0.12,
    type: 'sawtooth',
    gain: 0.18 + intensity * 0.16,
  })
}

export function playBlock() {
  tone({ freq: 320, freqEnd: 220, duration: 0.09, type: 'triangle', gain: 0.14 })
}

export function playHeal() {
  tone({ freq: 440, freqEnd: 680, duration: 0.26, type: 'sine', gain: 0.14 })
}

export function playBuff() {
  tone({ freq: 520, freqEnd: 820, duration: 0.18, type: 'triangle', gain: 0.14 })
  tone({ freq: 700, freqEnd: 1050, duration: 0.16, type: 'triangle', gain: 0.12, delay: 0.09 })
}

export function playMiss() {
  tone({ freq: 950, freqEnd: 1500, duration: 0.1, type: 'sine', gain: 0.12 })
}

export function playNearDeath() {
  tone({ freq: 220, freqEnd: 80, duration: 0.45, type: 'sawtooth', gain: 0.2 })
}

export function playVictory() {
  ;[523, 659, 784, 1046].forEach((f, i) => {
    tone({ freq: f, duration: 0.2, type: 'triangle', gain: 0.16, delay: i * 0.11 })
  })
}

export function playDefeat() {
  ;[300, 250, 200, 140].forEach((f, i) => {
    tone({ freq: f, duration: 0.32, type: 'sawtooth', gain: 0.15, delay: i * 0.15 })
  })
}
