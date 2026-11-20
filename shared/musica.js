/* =========================================================
   GALOIS LEGACY · musica.js  (un juego de πCHU LAB)
   Música de fondo de aventura de caballeros: una marcha en
   re menor de 16 compases que se repite sin parar.

   Está hecha con código (Web Audio API): no se descarga ningún
   archivo de sonido, no hay derechos de autor de nadie y pesa 0 KB.

   Reglas que cumple:
   - Solo suena si el ajuste «musica» está encendido
     (MathQuest si está cargado; si no, la clave pichu.musica.v1).
   - Los navegadores no permiten sonido hasta que el usuario toca
     algo: por eso espera al primer clic, toque o tecla.
   - Se calla al cambiar de pestaña y vuelve al volver.
   - No guarda nada por su cuenta (el ajuste lo guarda MathQuest).

   Cómo usarla desde una página:
     <script src="shared/musica.js"></script>
     Musica.alternar();        // enciende o apaga (botón ♪)
     Musica.arrancar();        // suena si el ajuste está encendido
     Musica.parar();           // la calla sin tocar el ajuste
     Musica.encendida();       // true/false del ajuste
   ========================================================= */
(function () {
  "use strict";

  const BPM = 108;                     // marcha tranquila, se puede tararear
  const CORCHEA = 60 / BPM / 2;        // segundos que dura una corchea
  const POR_COMPAS = 8;                // corcheas por compás (4/4)
  const VOLUMEN = 0.16;                // bajito: es música de fondo de un aula
  const nota = m => 440 * Math.pow(2, (m - 69) / 12);

  // ---------- La melodía ----------
  // Cada compás es una lista de [nota MIDI, duración en corcheas]; la nota 0 es silencio.
  // Re menor: 62 = re4, 69 = la4, 74 = re5. Dos frases de ocho compases.
  const MELODIA = [
    [[62, 2], [69, 2], [74, 3], [0, 1]],
    [[72, 2], [69, 2], [65, 2], [69, 2]],
    [[70, 2], [69, 2], [67, 3], [0, 1]],
    [[69, 4], [0, 4]],
    [[65, 2], [69, 2], [74, 2], [77, 2]],
    [[76, 2], [74, 2], [72, 2], [69, 2]],
    [[70, 2], [72, 2], [74, 3], [0, 1]],
    [[69, 4], [0, 4]],
    [[74, 1], [76, 1], [77, 2], [76, 2], [74, 2]],
    [[72, 2], [74, 2], [69, 4]],
    [[70, 1], [72, 1], [74, 2], [72, 2], [70, 2]],
    [[69, 4], [67, 4]],
    [[65, 2], [67, 2], [69, 2], [70, 2]],
    [[72, 2], [74, 2], [76, 2], [77, 2]],
    [[76, 3], [74, 1], [72, 2], [69, 2]],
    [[74, 4], [0, 4]]
  ];
  // Nota más grave de cada compás (el acorde): re, fa, sol, la, si bemol, do
  const BAJOS = [50, 53, 55, 57, 50, 58, 60, 50, 50, 53, 55, 57, 58, 60, 57, 50];

  let ctx = null, maestro = null, ruido = null;
  let reloj = 0, compas = 0, temporizador = 0, sonando = false;

  const CLAVE_PROPIA = "pichu.musica.v1";   // solo si el juego no carga mathquest.js
  const MQ = () => window.MathQuest;
  // El ajuste lo guarda MathQuest si está; si no, este módulo usa su propia clave
  function encendida() {
    const mq = MQ();
    if (mq) return mq.ajuste("musica") !== false;
    try { const v = localStorage.getItem(CLAVE_PROPIA); return v === null ? true : v === "1"; } catch (e) { return true; }
  }
  function guardarAjuste(v) {
    const mq = MQ();
    if (mq) { mq.ajuste("musica", v); return; }
    try { localStorage.setItem(CLAVE_PROPIA, v ? "1" : "0"); } catch (e) { /* sin almacenamiento */ }
  }

  function crearContexto() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { ctx = new AC(); } catch (e) { return false; }
    maestro = ctx.createGain();
    maestro.gain.value = 0.0001;
    const filtro = ctx.createBiquadFilter();            // quita los agudos más duros del cuadrado
    filtro.type = "lowpass"; filtro.frequency.value = 5200;
    maestro.connect(filtro); filtro.connect(ctx.destination);
    // Un trocito de ruido para la caja de la percusión
    ruido = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
    const d = ruido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  // Una nota: oscilador + envolvente (ataque corto y caída suave)
  function voz(tipo, frec, t, dur, vol) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.setValueAtTime(frec, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.setTargetAtTime(0.0001, t + dur * 0.7, Math.max(0.04, dur * 0.25));
    o.connect(g); g.connect(maestro);
    o.start(t); o.stop(t + dur + 0.35);
  }
  // Bombo: un seno que cae de golpe
  function bombo(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.14);
    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g); g.connect(maestro);
    o.start(t); o.stop(t + 0.2);
  }
  // Caja: ruido corto y filtrado
  function caja(t) {
    const f = ctx.createBufferSource(), g = ctx.createGain(), p = ctx.createBiquadFilter();
    f.buffer = ruido; p.type = "highpass"; p.frequency.value = 1400;
    g.gain.setValueAtTime(0.22, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    f.connect(p); p.connect(g); g.connect(maestro);
    f.start(t); f.stop(t + 0.14);
  }

  // Programa un compás completo: melodía, bajo de marcha, acorde de fondo y percusión
  function tocarCompas(t0, i) {
    // Melodía (onda cuadrada, como los 8 bits)
    let c = 0;
    for (const [n, dur] of MELODIA[i]) {
      if (n) voz("square", nota(n), t0 + c * CORCHEA, dur * CORCHEA, 0.13);
      c += dur;
    }
    // Bajo de marcha: fundamental, fundamental, quinta, fundamental (negras)
    const raiz = BAJOS[i], patron = [raiz, raiz, raiz + 7, raiz];
    patron.forEach((n, k) => voz("triangle", nota(n), t0 + k * 2 * CORCHEA, 1.7 * CORCHEA, 0.22));
    // Acorde largo de fondo (quintas suaves, como unos cuernos lejanos)
    voz("triangle", nota(raiz + 12), t0, POR_COMPAS * CORCHEA, 0.05);
    voz("triangle", nota(raiz + 19), t0, POR_COMPAS * CORCHEA, 0.04);
    // Percusión: bombo en los tiempos 1 y 3, caja en el 2 y el 4
    [0, 4].forEach(k => bombo(t0 + k * CORCHEA));
    [2, 6].forEach(k => caja(t0 + k * CORCHEA));
    // Redoble al cerrar cada frase de ocho compases
    if (i % 8 === 7) [5, 6, 7].forEach(k => caja(t0 + k * CORCHEA));
  }

  // Va programando los compases un poco antes de que suenen
  function programar() {
    if (!sonando) return;
    while (reloj < ctx.currentTime + 0.5) {
      tocarCompas(reloj, compas % MELODIA.length);
      reloj += POR_COMPAS * CORCHEA;
      compas++;
    }
  }

  function arrancar() {
    if (sonando || !encendida()) return false;
    if (!ctx && !crearContexto()) return false;
    if (ctx.state === "suspended") ctx.resume();
    sonando = true;
    reloj = ctx.currentTime + 0.12;
    maestro.gain.cancelScheduledValues(ctx.currentTime);
    maestro.gain.setValueAtTime(0.0001, ctx.currentTime);
    maestro.gain.linearRampToValueAtTime(VOLUMEN, ctx.currentTime + 1.4);   // entra poco a poco
    programar();
    temporizador = setInterval(programar, 150);
    return true;
  }

  function parar() {
    if (!sonando) return;
    sonando = false;
    clearInterval(temporizador); temporizador = 0;
    const g = maestro.gain, ahora = ctx.currentTime;
    g.cancelScheduledValues(ahora);
    g.setValueAtTime(g.value, ahora);
    g.linearRampToValueAtTime(0.0001, ahora + 0.6);                          // se va poco a poco
  }

  // Botón ♪: enciende o apaga, y lo recuerda en los ajustes
  function alternar() {
    const ahora = encendida();
    guardarAjuste(!ahora);
    if (ahora) parar(); else arrancar();
    return !ahora;
  }
  // Para el interruptor de la ventana de Ajustes: deja la música como diga el ajuste
  function sincronizar() { if (encendida()) arrancar(); else parar(); }

  // El navegador no deja sonar nada hasta que el usuario toca algo
  let esperando = true;
  function alPrimerGesto() {
    if (!esperando) return;
    esperando = false;
    ["pointerdown", "keydown", "touchstart"].forEach(t => document.removeEventListener(t, alPrimerGesto));
    arrancar();
  }
  ["pointerdown", "keydown", "touchstart"].forEach(t => document.addEventListener(t, alPrimerGesto, { passive: true }));

  // Al cambiar de pestaña se calla; al volver, sigue
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) parar();
    else if (!esperando && encendida()) arrancar();
  });

  window.Musica = { arrancar, parar, alternar, sincronizar, encendida, suena: () => sonando };
})();
