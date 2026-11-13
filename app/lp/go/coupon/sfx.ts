"use client";

/**
 * Paper sounds synthesized with WebAudio (no files) + navigator.vibrate.
 * Silent until the visitor has touched the page: the AudioContext is only created inside a gesture
 * (unlock), so idle auto-open on an untouched page makes no sound and no vibration.
 */
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let muted = false;

export function unlockSound() {
  if (ctx) {
    if (ctx.state === "suspended") void ctx.resume();
    return;
  }
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  try {
    ctx = new Ctor();
    const length = Math.floor(ctx.sampleRate * 0.6);
    noise = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  } catch {
    ctx = null;
  }
}

export function setMuted(value: boolean) {
  muted = value;
}

function ready() {
  return !muted && ctx && noise && ctx.state === "running" ? ctx : null;
}

function hasActivated() {
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return activation ? activation.hasBeenActive : Boolean(ctx);
}

export function vibrate(pattern: number | number[]) {
  if (muted || !hasActivated()) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Not supported (iOS Safari, desktop).
  }
}

function burst(
  audio: AudioContext,
  { at = 0, dur, gain, type, freq, q = 1, freqTo }: { at?: number; dur: number; gain: number; type: BiquadFilterType; freq: number; q?: number; freqTo?: number },
) {
  const start = audio.currentTime + at;
  const src = audio.createBufferSource();
  src.buffer = noise;
  const filter = audio.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(freq, start);
  if (freqTo) filter.frequency.exponentialRampToValueAtTime(freqTo, start + dur);
  const amp = audio.createGain();
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.004, dur / 4));
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(filter).connect(amp).connect(audio.destination);
  src.start(start, Math.random() * 0.3, dur + 0.02);
}

function tone(audio: AudioContext, { at = 0, dur, gain, freq, freqTo, type = "sine" }: { at?: number; dur: number; gain: number; freq: number; freqTo?: number; type?: OscillatorType }) {
  const start = audio.currentTime + at;
  const osc = audio.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (freqTo) osc.frequency.exponentialRampToValueAtTime(freqTo, start + dur);
  const amp = audio.createGain();
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.006);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(amp).connect(audio.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/** One perforation hole giving way. Pitch climbs a little as the strip runs out. */
export function sfxTick(progress: number) {
  const audio = ready();
  if (!audio) return;
  burst(audio, { dur: 0.035, gain: 0.22, type: "bandpass", freq: 2600 + progress * 1400, q: 2.2 });
  tone(audio, { dur: 0.02, gain: 0.03, freq: 1900 + progress * 500 });
}

/** Knuckle on paper. */
export function sfxTap(index: number) {
  const audio = ready();
  if (!audio) return;
  tone(audio, { dur: 0.09, gain: 0.18, freq: 150 + index * 18, freqTo: 70 });
  burst(audio, { dur: 0.06, gain: 0.12, type: "lowpass", freq: 1400 });
}

/** "찢": a ragged run of noise crackles sweeping up, plus a dull body thump. */
export function sfxRip() {
  const audio = ready();
  if (!audio) return;
  let at = 0;
  for (let i = 0; i < 9; i++) {
    const dur = 0.025 + Math.random() * 0.035;
    burst(audio, { at, dur, gain: 0.16 + Math.random() * 0.12, type: "bandpass", freq: 1300 + i * 320, q: 0.9 });
    at += dur * (0.55 + Math.random() * 0.4);
  }
  burst(audio, { at: 0, dur: 0.28, gain: 0.08, type: "highpass", freq: 900, freqTo: 3800 });
  tone(audio, { at: at, dur: 0.12, gain: 0.14, freq: 110, freqTo: 60 });
}

/** Coupon sliding out of the paper. */
export function sfxSlide() {
  const audio = ready();
  if (!audio) return;
  burst(audio, { dur: 0.42, gain: 0.07, type: "bandpass", freq: 600, freqTo: 2400, q: 0.7 });
}

/** Soft two-note bell when the coupon settles. */
export function sfxChime() {
  const audio = ready();
  if (!audio) return;
  tone(audio, { dur: 0.7, gain: 0.07, freq: 784 });
  tone(audio, { at: 0.09, dur: 0.9, gain: 0.06, freq: 1175 });
  tone(audio, { at: 0.09, dur: 0.5, gain: 0.015, freq: 2350, type: "triangle" });
}
