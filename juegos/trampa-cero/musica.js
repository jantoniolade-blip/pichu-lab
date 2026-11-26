"use strict";
/* Trampa Cero · Melodía chiptune original (Web Audio, sin archivos).
   Compuesta para este juego: La menor, 138 ppm, bucle de 16 compases.
   Empieza apagada; solo suena al pulsar ♫. */

const Musica = (() => {
  let ctx = null, master = null, sonando = false, timer = null, paso = 0, siguienteT = 0;
  const BPM = 138, CORCHEA = 60 / BPM / 2, ADELANTO = 0.12;

  // Notación: nota+octava, "-" prolonga la anterior, "." silencio. 8 corcheas por compás.
  const MELODIA = [
    "A4 . C5 E5 A5 - G5 E5", "F5 - E5 C5 A4 - C5 .", "G4 . C5 E5 G5 - F5 E5", "D5 - - B4 G4 - . .",
    "A4 C5 E5 A5 C6 - B5 A5", "A5 - F5 - C6 - A5 F5", "G#5 - E5 - B4 - E5 -", "G#5 A5 B5 - . . E5 .",
    "D5 - F5 A5 - F5 D5 F5", "G5 - B4 D5 G5 - F5 D5", "E5 - G5 C6 - B5 G5 E5", "A5 - E5 C5 A4 - B4 C5",
    "D5 F5 A5 D6 - C6 A5 F5", "E5 - G#5 B5 - G#5 E5 D5", "C5 - B4 A4 E5 - A5 -", "A5 . E5 . A4 . . ."
  ].join(" ").split(" ");
  const ACORDES = ["A", "F", "C", "G", "A", "F", "E", "E", "D", "G", "C", "A", "D", "E", "A", "A"];
  const RAIZ = { A: 45, F: 41, C: 48, G: 43, E: 40, D: 50 };           // MIDI del bajo
  const TRIADA = { A: [0, 3, 7], D: [0, 3, 7], F: [0, 4, 7], C: [0, 4, 7], G: [0, 4, 7], E: [0, 4, 7] };

  const midi = n => {
    const m = /^([A-G])(#?)(\d)$/.exec(n);
    return 12 * (+m[3] + 1) + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0);
  };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  let ondaPulso = null, ruido = null;
  function preparar() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);
    // Onda de pulso al 25 % (timbre de consola clásica)
    const n = 32, re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) im[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25);
    ondaPulso = ctx.createPeriodicWave(re, im);
    ruido = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  function tono(t, f, dur, { tipo = "pulso", vol = 0.3 } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    if (tipo === "pulso") o.setPeriodicWave(ondaPulso); else o.type = tipo;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.setValueAtTime(vol, t + Math.max(0.01, dur - 0.04));
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function golpe(t, tipo) {
    const s = ctx.createBufferSource(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
    s.buffer = ruido;
    fl.type = tipo === "hat" ? "highpass" : "bandpass";
    fl.frequency.value = tipo === "hat" ? 7000 : 1800;
    const v = tipo === "hat" ? 0.06 : 0.22, d = tipo === "hat" ? 0.03 : 0.12;
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + d);
    s.connect(fl).connect(g).connect(master);
    s.start(t); s.stop(t + d + 0.02);
  }
  function bombo(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + 0.16);
  }

  function programarPaso(i, t) {
    const total = MELODIA.length, k = i % total, compas = Math.floor(k / 8), c = k % 8;
    const nota = MELODIA[k];
    if (nota !== "-" && nota !== ".") {
      let dur = 1;
      while (MELODIA[(k + dur) % total] === "-" && dur < 8) dur++;
      tono(t, hz(midi(nota)), dur * CORCHEA * 0.95, { vol: 0.22 });
    }
    // Bajo: raíz y octava alternadas
    const raiz = RAIZ[ACORDES[compas]];
    const patronBajo = [0, null, 12, null, 0, 0, 12, null];
    if (patronBajo[c] !== null) tono(t, hz(raiz - 12 + patronBajo[c]), CORCHEA * 0.9, { tipo: "triangle", vol: 0.45 });
    // Arpegio suave en semicorcheas, segunda mitad del bucle
    if (compas >= 8) {
      const tr = TRIADA[ACORDES[compas]];
      for (let s = 0; s < 2; s++) {
        const nota2 = raiz + 12 + tr[(c * 2 + s) % 3];
        tono(t + s * CORCHEA / 2, hz(nota2), CORCHEA / 2 * 0.8, { vol: 0.05 });
      }
    }
    // Batería
    if (c === 0 || c === 4 || (c === 5 && compas % 2)) bombo(t);
    if (c === 2 || c === 6) golpe(t, "caja");
    golpe(t, "hat");
  }

  function bucle() {
    while (siguienteT < ctx.currentTime + ADELANTO) {
      programarPaso(paso, siguienteT);
      paso++;
      siguienteT += CORCHEA;
    }
  }

  function alternar() {
    if (!ctx) preparar();
    if (sonando) {
      sonando = false;
      clearInterval(timer);
      ctx.suspend();
      return false;
    }
    sonando = true;
    ctx.resume();
    siguienteT = ctx.currentTime + 0.06;
    timer = setInterval(bucle, 25);
    return true;
  }

  // Efectos cortos: solo suenan si la música está activada
  function sfx(tipo) {
    if (!sonando || !ctx) return;
    const t = ctx.currentTime + 0.01;
    const notas = { bien: ["C6", "E6", "G6", "C7"], mal: ["E4", "C4"], bom: ["A2"], fin: ["C5", "E5", "G5", "C6", "E6", "G6", "C7"] }[tipo] || [];
    notas.forEach((n, i) => tono(t + i * 0.07, hz(midi(n)), tipo === "bom" ? 0.25 : 0.09, { vol: tipo === "mal" ? 0.18 : 0.15, tipo: tipo === "mal" || tipo === "bom" ? "square" : "pulso" }));
    if (tipo === "bom") bombo(t);
  }

  return { alternar, sfx, get activa() { return sonando; }, get estadoAudio() { return ctx ? ctx.state : "sin-iniciar"; } };
})();
window.Musica = Musica;
