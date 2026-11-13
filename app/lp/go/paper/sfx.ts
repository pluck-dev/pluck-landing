"use client";

/**
 * Shared paper sounds for every /lp/go moment, synthesized with WebAudio (no files) + navigator.vibrate.
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

/* ---------- receipt printer ---------- */

/** Printer waking up: relay click + short motor spin-up. */
export function sfxPrinterOn() {
  const audio = ready();
  if (!audio) return;
  burst(audio, { dur: 0.018, gain: 0.16, type: "highpass", freq: 3000 });
  burst(audio, { at: 0.03, dur: 0.22, gain: 0.05, type: "bandpass", freq: 300, freqTo: 900, q: 3 });
}

/** One line fed: a quick motor zip and the print head's tick. Pitch walks a little per line. */
export function sfxFeed(index: number) {
  const audio = ready();
  if (!audio) return;
  const f = 1100 + (index % 4) * 70;
  burst(audio, { dur: 0.07, gain: 0.07, type: "bandpass", freq: f, freqTo: f * 1.35, q: 4 });
  burst(audio, { at: 0.05, dur: 0.016, gain: 0.13, type: "highpass", freq: 3600 });
}

/** Cutter at the end of the receipt. */
export function sfxCut() {
  const audio = ready();
  if (!audio) return;
  burst(audio, { dur: 0.09, gain: 0.12, type: "highpass", freq: 2200, freqTo: 5200 });
  burst(audio, { at: 0.085, dur: 0.02, gain: 0.14, type: "bandpass", freq: 2600, q: 2 });
}

/* ---------- rubber stamps ---------- */

/**
 * "쿵": a rubber stamp hitting paper on a table. Low body thump + rubber slap + wood knock.
 * weight 0..1 (the last stamp of a set lands heavier and lower).
 */
export function sfxStamp(weight = 0, index = 0) {
  const audio = ready();
  if (!audio) return;
  const low = 1 - weight * 0.25;
  tone(audio, { dur: 0.16 + weight * 0.08, gain: 0.26 + weight * 0.08, freq: 150 * low + index * 4, freqTo: 52 });
  burst(audio, { dur: 0.07, gain: 0.2, type: "lowpass", freq: 900 + weight * 300 });
  burst(audio, { dur: 0.02, gain: 0.08, type: "bandpass", freq: 2400, q: 1.5 });
  tone(audio, { at: 0.005, dur: 0.035, gain: 0.04, freq: 520 - weight * 80, type: "triangle" });
}

/* ---------- crumpling a sheet ---------- */

/** A handful of crackles; k (0..1) = how far the crumple has gone (later = tighter, higher). */
export function sfxCrumple(k: number) {
  const audio = ready();
  if (!audio) return;
  let at = 0;
  const n = 3 + Math.round(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    const dur = 0.012 + Math.random() * 0.03;
    burst(audio, { at, dur, gain: 0.07 + Math.random() * 0.1, type: "bandpass", freq: 1800 + k * 2200 + Math.random() * 1600, q: 1.2 });
    at += dur * (0.4 + Math.random() * 0.9);
  }
  burst(audio, { dur: 0.09, gain: 0.03, type: "lowpass", freq: 700 });
}

/** Paper ball tossed aside. */
export function sfxToss() {
  const audio = ready();
  if (!audio) return;
  burst(audio, { dur: 0.3, gain: 0.06, type: "bandpass", freq: 1800, freqTo: 500, q: 0.8 });
}

/** A sheet settling onto the table. */
export function sfxSettle() {
  const audio = ready();
  if (!audio) return;
  burst(audio, { dur: 0.12, gain: 0.08, type: "lowpass", freq: 600 });
  tone(audio, { dur: 0.09, gain: 0.06, freq: 95, freqTo: 60 });
}

/* ---------- folding a letter ---------- */

/** One fold: paper swish, then the crease pressed flat. */
export function sfxFold() {
  const audio = ready();
  if (!audio) return;
  burst(audio, { dur: 0.18, gain: 0.06, type: "bandpass", freq: 900, freqTo: 2600, q: 0.9 });
  burst(audio, { at: 0.17, dur: 0.03, gain: 0.1, type: "bandpass", freq: 1700, q: 1.4 });
}

/** Envelope pushed out of frame. */
export function sfxSend() {
  const audio = ready();
  if (!audio) return;
  burst(audio, { dur: 0.36, gain: 0.07, type: "bandpass", freq: 500, freqTo: 2800, q: 0.7 });
  tone(audio, { at: 0.3, dur: 0.6, gain: 0.05, freq: 784 });
  tone(audio, { at: 0.39, dur: 0.8, gain: 0.045, freq: 1175 });
}

/* ---------- split-flap counter ---------- */

/**
 * One flap dropping onto the stop: a tiny plastic "탁". `heavy` = the last flap of a module, lower and
 * fuller (the module has settled). `index` walks the pitch a little so a run doesn't sound like a loop.
 */
export function sfxFlap(index: number, heavy = false) {
  const audio = ready();
  if (!audio) return;
  const f = 3000 + ((index * 37) % 9) * 140;
  burst(audio, { dur: heavy ? 0.03 : 0.014, gain: heavy ? 0.16 : 0.09, type: "bandpass", freq: heavy ? f * 0.7 : f, q: 2.4 });
  tone(audio, { dur: heavy ? 0.07 : 0.025, gain: heavy ? 0.1 : 0.035, freq: heavy ? 260 : 420, freqTo: heavy ? 120 : 260, type: "triangle" });
}

/* ---------- desk shredder ---------- */

let hum: { gain: GainNode; osc: OscillatorNode; sub: OscillatorNode } | null = null;

/**
 * The shredder motor: a low saw + sub through a lowpass, held open while paper is being fed.
 * level 0..1 (0 = off). Pitch sags a little under load, as a small motor does.
 */
export function shredHum(level: number) {
  const audio = ready();
  if (!audio) {
    if (hum && ctx) hum.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
    return;
  }
  if (!hum) {
    const gain = audio.createGain();
    gain.gain.value = 0;
    const filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 520;
    filter.Q.value = 0.8;
    const osc = audio.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 96;
    const sub = audio.createOscillator();
    sub.type = "square";
    sub.frequency.value = 48;
    const subGain = audio.createGain();
    subGain.gain.value = 0.35;
    osc.connect(filter);
    sub.connect(subGain).connect(filter);
    filter.connect(gain).connect(audio.destination);
    osc.start();
    sub.start();
    hum = { gain, osc, sub };
  }
  const now = audio.currentTime;
  hum.gain.gain.setTargetAtTime(Math.min(1, level) * 0.05, now, level > 0 ? 0.04 : 0.09);
  hum.osc.frequency.setTargetAtTime(96 - level * 12, now, 0.08);
  hum.sub.frequency.setTargetAtTime(48 - level * 6, now, 0.08);
}

/** Cutter teeth chewing paper: a few dry crackles. load 0..1. */
export function sfxChew(load: number) {
  const audio = ready();
  if (!audio) return;
  let at = 0;
  for (let i = 0; i < 3; i++) {
    const dur = 0.01 + Math.random() * 0.02;
    burst(audio, { at, dur, gain: 0.05 + load * 0.07, type: "bandpass", freq: 2200 + Math.random() * 2400, q: 1.6 });
    at += dur * (0.5 + Math.random());
  }
}

/** The teeth biting the leading edge of a sheet. */
export function sfxBite() {
  const audio = ready();
  if (!audio) return;
  burst(audio, { dur: 0.06, gain: 0.16, type: "bandpass", freq: 1500, q: 1.1 });
  tone(audio, { dur: 0.08, gain: 0.08, freq: 140, freqTo: 80 });
}

/** The tail of a sheet sucked in, strips dropping into the basket. */
export function sfxSwallow() {
  const audio = ready();
  if (!audio) return;
  burst(audio, { dur: 0.12, gain: 0.12, type: "bandpass", freq: 2600, freqTo: 900, q: 0.9 });
  burst(audio, { at: 0.1, dur: 0.22, gain: 0.06, type: "lowpass", freq: 900 });
}

/** Motor winding down when the last sheet is through. */
export function sfxMotorOff() {
  const audio = ready();
  if (!audio) return;
  tone(audio, { dur: 0.5, gain: 0.05, freq: 90, freqTo: 40, type: "sawtooth" });
  burst(audio, { at: 0.02, dur: 0.02, gain: 0.1, type: "highpass", freq: 3200 });
}

/* ---------- indicator lamp panel ---------- */

/** A relay pulling in behind a panel lamp. heavy = the last one (the whole bank latched). */
export function sfxRelay(index: number, heavy = false) {
  const audio = ready();
  if (!audio) return;
  const f = 1900 + ((index * 53) % 7) * 120;
  burst(audio, { dur: heavy ? 0.035 : 0.012, gain: heavy ? 0.2 : 0.11, type: "bandpass", freq: heavy ? 1300 : f, q: 3 });
  tone(audio, { at: 0.004, dur: heavy ? 0.14 : 0.03, gain: heavy ? 0.12 : 0.03, freq: heavy ? 180 : 620, freqTo: heavy ? 70 : 380, type: "triangle" });
}

/** Label maker pressing one character into the tape. */
export function sfxEmboss(index: number) {
  const audio = ready();
  if (!audio) return;
  burst(audio, { dur: 0.022, gain: 0.14, type: "bandpass", freq: 1500 + (index % 3) * 180, q: 2 });
  tone(audio, { dur: 0.04, gain: 0.05, freq: 300, freqTo: 160, type: "triangle" });
}
