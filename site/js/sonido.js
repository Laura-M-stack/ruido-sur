// Cada disco tiene un riff que se genera en el navegador con Web Audio: batería, bajo y guitarra distorsionada
// sintetizados en vivo, sin archivos de audio. Los patrones son datos puros (se testean en Node);
// el motor de audio solo existe en el navegador.

export const PASOS = 32; // dos compases de semicorcheas

/** Repite `cada` pasos desde `desde`, dentro de [desde, hasta). */
const cada = (n, desde = 0, hasta = PASOS) => Array.from({ length: Math.ceil((hasta - desde) / n) }, (_, i) => desde + i * n).filter((p) => p < hasta);

/** Notas de guitarra a partir de una progresión: un acorde por negra, golpeado cada `golpe` pasos. */
function rasgueo(progresion, { golpe = 2, dur = 2, desde = 0 } = {}) {
  const out = [];
  progresion.forEach((nota, negra) => {
    if (nota == null) return;
    for (let p = negra * 4; p < negra * 4 + 4; p += golpe) if (p >= desde) out.push({ paso: p, nota, dur });
  });
  return out;
}

const PATRONES = {
  // Punk: corcheas abiertas, mi menor, rápido
  barras: () => ({
    bpm: 176, raiz: 40, distorsion: 320, brillo: 3200, eco: false, ruido: false,
    guitarra: rasgueo([0, 0, 3, 5, 0, 0, -2, -2]),
    bajo: cada(2).map((paso) => ({ paso, nota: [0, 0, 3, 5, 0, 0, -2, -2][Math.floor(paso / 4)], dur: 2 })),
    bombo: [0, 6, 8, 16, 22, 24], caja: [4, 12, 20, 28], hat: cada(2),
  }),
  // Post-punk: bajo melódico adelante, guitarra limpia en arpegio y eco
  circulos: () => ({
    bpm: 138, raiz: 45, distorsion: 40, brillo: 4200, eco: true, ruido: false,
    guitarra: [12, 19, 24, 19, 15, 19, 22, 19].flatMap((n, i) => [{ paso: i * 4, nota: n, dur: 3 }]),
    bajo: [0, 0, 7, 5, 3, 3, 5, 7, 0, 0, 7, 5, 8, 7, 5, 3].map((nota, i) => ({ paso: i * 2, nota, dur: 2 })),
    bombo: cada(4), caja: [4, 12, 20, 28], hat: cada(1),
  }),
  // Hardcore: d-beat y después un breakdown a medio tiempo con palm mute
  diagonal: () => ({
    bpm: 200, raiz: 38, distorsion: 520, brillo: 2600, eco: false, ruido: false,
    guitarra: [
      ...rasgueo([0, 0, 1, 1], { golpe: 1, dur: 1 }),
      ...[16, 19, 22, 24, 27, 30].map((paso) => ({ paso, nota: 0, dur: 1 })),
      { paso: 28, nota: 6, dur: 4 },
    ],
    bajo: [...cada(2, 0, 16).map((paso) => ({ paso, nota: paso < 8 ? 0 : 1, dur: 2 })), ...[16, 19, 22, 24, 27, 30].map((paso) => ({ paso, nota: 0, dur: 1 }))],
    bombo: [0, 3, 8, 11, 16, 19, 22, 24, 27, 30], caja: [4, 12, 24], hat: cada(2, 0, 16),
  }),
  // Noise: acordes que se sostienen con mucha saturación y un ruido que barre
  cuadricula: () => ({
    bpm: 110, raiz: 40, distorsion: 900, brillo: 2200, eco: true, ruido: true,
    guitarra: [{ paso: 0, nota: 0, dur: 14 }, { paso: 16, nota: 1, dur: 14 }],
    bajo: [{ paso: 0, nota: 0, dur: 16 }, { paso: 16, nota: 1, dur: 16 }],
    bombo: [0, 10, 16, 26], caja: [8, 24], hat: [],
  }),
  // Punk en sol: más melódico, sube al final
  triangulo: () => ({
    bpm: 168, raiz: 43, distorsion: 280, brillo: 3400, eco: false, ruido: false,
    guitarra: rasgueo([0, 0, 5, 5, 7, 7, 5, 3]),
    bajo: cada(2).map((paso) => ({ paso, nota: [0, 0, 5, 5, 7, 7, 5, 3][Math.floor(paso / 4)], dur: 2 })),
    bombo: [0, 6, 8, 14, 16, 22, 24, 30], caja: [4, 12, 20, 28], hat: cada(2),
  }),
  // Noise lento: olas de guitarra con eco y bombo espaciado
  ondas: () => ({
    bpm: 96, raiz: 38, distorsion: 180, brillo: 1800, eco: true, ruido: true,
    guitarra: [{ paso: 0, nota: 0, dur: 8 }, { paso: 8, nota: 3, dur: 8 }, { paso: 16, nota: -2, dur: 8 }, { paso: 24, nota: 5, dur: 8 }],
    bajo: [{ paso: 0, nota: 0, dur: 8 }, { paso: 8, nota: 3, dur: 8 }, { paso: 16, nota: -2, dur: 8 }, { paso: 24, nota: 5, dur: 8 }],
    bombo: [0, 16], caja: [8, 24], hat: cada(4, 2),
  }),
};

/** Patrón del riff de un disco según la forma de su tapa. Si la forma no existe, null. */
export function patronDe(forma) {
  return Object.hasOwn(PATRONES, forma) ? PATRONES[forma]() : null;
}

/** Segundos que dura una vuelta del patrón. */
export function duracionVuelta(patron) {
  return (PASOS * 60) / patron.bpm / 4;
}

/** Frecuencia (Hz) de una nota MIDI. */
export function frecuencia(midi) {
  return 440 * 2 ** ((midi - 69) / 12);
}

/** Curva de saturación (waveshaper). Más `k`, más distorsión. */
export function curvaDistorsion(k, muestras = 1024) {
  const c = new Float32Array(muestras);
  for (let i = 0; i < muestras; i++) {
    const x = (i * 2) / muestras - 1;
    c[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
  }
  return c;
}

/* ------------------------------------------------------------------ */
/* Motor de audio (solo navegador)                                     */
/* ------------------------------------------------------------------ */

export const hayAudio = () => typeof window !== 'undefined' && Boolean(window.AudioContext || window.webkitAudioContext);

/**
 * Reproductor de un solo riff a la vez. `tocar` arranca un patrón (y corta el anterior),
 * `detener` lo corta. Se programa con anticipación (look-ahead) para que el tempo no dependa de los timers.
 */
export function crearReproductor({ maxSegundos = 30 } = {}) {
  let ctx = null;
  let salida = null;
  let analizador = null;
  let ruidoBuf = null;
  let sesion = null;
  let turnos = 0;

  function asegurar() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 6;
    salida = ctx.createGain();
    salida.gain.value = 0.5;
    analizador = ctx.createAnalyser();
    analizador.fftSize = 128;
    analizador.smoothingTimeConstant = 0.75;
    salida.connect(comp).connect(analizador).connect(ctx.destination);
    ruidoBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = ruidoBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  const ruido = () => {
    const s = ctx.createBufferSource();
    s.buffer = ruidoBuf;
    s.loop = true;
    return s;
  };

  function envolvente(g, t, pico, ataque, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(pico, t + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  function bombo(bus, t) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    envolvente(g, t, 1, 0.003, 0.32);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 0.35);
  }

  function caja(bus, t) {
    const n = ruido();
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1400;
    const g = ctx.createGain();
    envolvente(g, t, 0.55, 0.002, 0.18);
    n.connect(hp).connect(g).connect(bus);
    n.start(t, Math.random());
    n.stop(t + 0.2);
    const o = ctx.createOscillator();
    const go = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = 190;
    envolvente(go, t, 0.35, 0.002, 0.1);
    o.connect(go).connect(bus);
    o.start(t);
    o.stop(t + 0.12);
  }

  function hat(bus, t) {
    const n = ruido();
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 8000;
    const g = ctx.createGain();
    envolvente(g, t, 0.16, 0.001, 0.05);
    n.connect(hp).connect(g).connect(bus);
    n.start(t, Math.random());
    n.stop(t + 0.06);
  }

  function guitarra(bus, t, dur, midi, p) {
    const sh = ctx.createWaveShaper();
    sh.curve = curvaDistorsion(p.distorsion);
    sh.oversample = '2x';
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = dur <= 0.12 ? p.brillo * 0.45 : p.brillo; // palm mute: más opaco
    const g = ctx.createGain();
    const largo = Math.max(0.08, dur * 0.95);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.006);
    g.gain.setTargetAtTime(0.1, t + 0.02, 0.15);
    g.gain.setTargetAtTime(0.0001, t + largo, 0.03);
    sh.connect(lp).connect(g).connect(bus);
    // power chord: raíz, quinta y octava, dos osciladores desafinados por nota
    for (const intervalo of p.distorsion < 100 ? [0] : [0, 7, 12]) {
      for (const cents of [-7, 7]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = frecuencia(midi + intervalo);
        o.detune.value = cents;
        o.connect(sh);
        o.start(t);
        o.stop(t + largo + 0.2);
      }
    }
  }

  function bajo(bus, t, dur, midi) {
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = frecuencia(midi - 12);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 700;
    const g = ctx.createGain();
    const largo = Math.max(0.08, dur * 0.9);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.008);
    g.gain.setTargetAtTime(0.0001, t + largo, 0.03);
    o.connect(lp).connect(g).connect(bus);
    o.start(t);
    o.stop(t + largo + 0.2);
  }

  function barrido(bus, t, vuelta) {
    const n = ruido();
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 3;
    bp.frequency.setValueAtTime(250, t);
    bp.frequency.exponentialRampToValueAtTime(3200, t + vuelta / 2);
    bp.frequency.exponentialRampToValueAtTime(250, t + vuelta);
    const g = ctx.createGain();
    g.gain.value = 0.12;
    n.connect(bp).connect(g).connect(bus);
    n.start(t);
    n.stop(t + vuelta);
  }

  function programarPaso(s, paso, t) {
    const p = s.patron;
    const semi = 60 / p.bpm / 4;
    if (paso === 0 && p.ruido) barrido(s.bus, t, duracionVuelta(p));
    if (p.bombo.includes(paso)) bombo(s.bus, t);
    if (p.caja.includes(paso)) caja(s.bus, t);
    if (p.hat.includes(paso)) hat(s.bus, t);
    for (const n of p.guitarra) if (n.paso === paso) guitarra(s.bus, t, n.dur * semi, p.raiz + 12 + n.nota, p);
    for (const n of p.bajo) if (n.paso === paso) bajo(s.bus, t, n.dur * semi, p.raiz + 12 + n.nota);
  }

  function detener() {
    if (!sesion) return;
    const s = sesion;
    sesion = null;
    clearInterval(s.timer);
    clearTimeout(s.limite);
    const ahora = ctx.currentTime;
    s.bus.gain.cancelScheduledValues(ahora);
    s.bus.gain.setTargetAtTime(0, ahora, 0.04);
    setTimeout(() => s.bus.disconnect(), 400);
    s.alTerminar?.();
  }

  async function tocar(id, patron, { alTerminar } = {}) {
    const turno = ++turnos;
    detener();
    asegurar();
    if (ctx.state !== 'running') await ctx.resume();
    if (turno !== turnos) return false; // se pidió otro disco mientras el audio despertaba
    detener();
    const bus = ctx.createGain();
    bus.gain.value = 1;
    if (patron.eco) {
      const eco = ctx.createDelay(1);
      eco.delayTime.value = (60 / patron.bpm) * 0.75;
      const fb = ctx.createGain();
      fb.gain.value = 0.32;
      const mezcla = ctx.createGain();
      mezcla.gain.value = 0.3;
      bus.connect(eco).connect(fb).connect(eco);
      eco.connect(mezcla).connect(salida);
    }
    bus.connect(salida);
    const s = { id, patron, bus, paso: 0, t: ctx.currentTime + 0.06, alTerminar };
    const semi = 60 / patron.bpm / 4;
    const programar = () => {
      while (s.t < ctx.currentTime + 0.12) {
        programarPaso(s, s.paso, s.t);
        s.t += semi;
        s.paso = (s.paso + 1) % PASOS;
      }
    };
    s.timer = setInterval(programar, 25);
    s.limite = setTimeout(detener, maxSegundos * 1000);
    sesion = s;
    programar();
    return true;
  }

  return {
    tocar,
    detener,
    sonando: () => sesion?.id ?? null,
    /** Niveles por banda de frecuencia (0 a 255) para el visualizador. */
    niveles(buffer) {
      if (!analizador) return null;
      analizador.getByteFrequencyData(buffer);
      return buffer;
    },
    bandas: () => (analizador ? analizador.frequencyBinCount : 64),
  };
}
