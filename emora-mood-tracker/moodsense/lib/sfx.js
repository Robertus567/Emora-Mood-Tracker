"use client";

// All sounds are synthesized on the fly with the Web Audio API — no mp3/wav
// assets to host or license. A single shared AudioContext is created lazily
// (and resumed on first real user gesture, since browsers block audio
// before that) and reused for every effect.

let ctx = null;
let unlocked = false;

function getCtx() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

export function unlockAudio() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  unlocked = true;
}

function tone(c, { freq, start, dur, type = "sine", gain = 0.14, freqEnd, curve = "linear" }) {
  const osc = c.createOscillator();
  const amp = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (freqEnd) {
    if (curve === "exponential") {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), start + dur);
    } else {
      osc.frequency.linearRampToValueAtTime(freqEnd, start + dur);
    }
  }
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.012, dur * 0.3));
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(amp);
  amp.connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function noiseBurst(c, { start, dur, gain = 0.18, hp = 1200 }) {
  const bufferSize = Math.floor(c.sampleRate * dur);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = hp;
  const amp = c.createGain();
  amp.gain.setValueAtTime(gain, start);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  src.connect(filter);
  filter.connect(amp);
  amp.connect(c.destination);
  src.start(start);
  src.stop(start + dur + 0.02);
}

function safe(fn) {
  try {
    const c = getCtx();
    if (!c) return;
    if (c.state === "suspended") c.resume().catch(() => {});
    fn(c);
  } catch {
    // Audio is a nice-to-have; never let it break the UI.
  }
}

export const sfx = {
  hover() {
    safe((c) => {
      const t = c.currentTime;
      tone(c, { freq: 1180, start: t, dur: 0.05, type: "sine", gain: 0.045 });
    });
  },
  click() {
    safe((c) => {
      const t = c.currentTime;
      tone(c, { freq: 620, freqEnd: 340, start: t, dur: 0.07, type: "triangle", gain: 0.11 });
    });
  },
  toggle() {
    safe((c) => {
      const t = c.currentTime;
      tone(c, { freq: 520, freqEnd: 760, start: t, dur: 0.09, type: "sine", gain: 0.1 });
    });
  },
  shutter() {
    safe((c) => {
      const t = c.currentTime;
      noiseBurst(c, { start: t, dur: 0.045, gain: 0.22, hp: 2200 });
      tone(c, { freq: 1400, start: t + 0.006, dur: 0.03, type: "square", gain: 0.05 });
      noiseBurst(c, { start: t + 0.07, dur: 0.05, gain: 0.16, hp: 1600 });
    });
  },
  success() {
    safe((c) => {
      const t = c.currentTime;
      tone(c, { freq: 660, start: t, dur: 0.14, type: "sine", gain: 0.11 });
      tone(c, { freq: 880, start: t + 0.09, dur: 0.22, type: "sine", gain: 0.12 });
    });
  },
  delete() {
    safe((c) => {
      const t = c.currentTime;
      tone(c, { freq: 420, freqEnd: 180, start: t, dur: 0.16, type: "sawtooth", gain: 0.08 });
    });
  },
  error() {
    safe((c) => {
      const t = c.currentTime;
      tone(c, { freq: 220, start: t, dur: 0.18, type: "square", gain: 0.07 });
    });
  },
};

export function useSfxHandlers(overrides) {
  return {
    onMouseEnter: (e) => {
      sfx.hover();
      overrides?.onMouseEnter?.(e);
    },
    onClick: (e) => {
      sfx.click();
      overrides?.onClick?.(e);
    },
  };
}
