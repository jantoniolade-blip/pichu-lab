/* =====================================================================
   GALOIS LEGACY · motor de aventuras
   ---------------------------------------------------------------------
   Exploración libre (teclado y controles táctiles), diálogos, cofres del
   saber, combates matemáticos animados, construcción de monumentos y
   jefes en tres fases. Las recompensas solo se conceden cuando el motor
   ha validado todas las respuestas de una aventura.
   Depende de: galois-sprites, galois-escenarios, coleccion/datos.js,
   coleccion/bridge.js, coleccion/arte.js, aventura/retos.js y mundos.js.
   ===================================================================== */
(function () {
  'use strict';
  var S = window.GaloisSprites, E = window.GaloisEscenarios, D = window.GALOIS_CAMPINA, C = window.GaloisColeccion, RT = window.GaloisRetos, MW = window.GaloisMundos, GD = window.GALOIS;
  var T = 16, $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(location.search), PRUEBA = params.get('prueba') === '1';
  var REDUCIDO = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  var NOMBRE_ENEMIGO = { potenciator: 'Potenciator', radicosmico: 'Radicósmico', multiplax: 'Múltiplax', primox: 'Prímox', negatron: 'Negatrón', parentesis_maldito: 'Paréntesis Maldito', denominadoron: 'Denominadorón', simplifract: 'Simplifract', senor_escala: 'Señor Escala', porcentajin: 'Porcentajín', incognita_x: 'Incógnita X', polinomio_mutante: 'Polinomio Mutante', equilibrius: 'Equilibrius', despejador_oscuro: 'Despejador Oscuro', pendientor: 'Pendientor', parabola_vortice: 'Parábola Vórtice', mediana_traviesa: 'Mediana Traviesa', grafico_tramposo: 'Gráfico Tramposo', dado_caotico: 'Dado Caótico', ruleta_imposible: 'Ruleta Imposible' };
  var HABILIDAD = { galois: 'eliminar', sophie_germain: 'eliminar', al_juarismi: 'eliminar', gauss: 'doble', fibonacci: 'doble', hipatia: 'escudo', euler: 'pista', emmy_noether: 'pista', ada_lovelace: 'pista', ramanujan: 'pista', fermat: 'pista' };
  var DESC_HAB = { eliminar: 'descarta una respuesta incorrecta', doble: 'tu próximo acierto vale doble', escudo: 'el próximo fallo no te quita vida', pista: 'muestra una pista del reto' };
  var MUS = window.GaloisMusica || { tocar: function () {}, fase: function () {}, parar: function () {}, activar: function () {}, activa: function () { return false; }, volumen: function () { return 0; } };
  var DIF = { explorador: 0, aventurero: 1, maestro: 2 };
  var FASES = ['', 'Descubrir la regla', 'Resolver el desafío', 'Explicar y transferir'];

  /* ---------- Estado global ---------- */
  var G = {
    heroeId: 'galois', dif: 'aventurero', mundo: null, modo: 'campina', t: 0,
    jug: { x: 0, y: 0, dir: 'down', anim: 'idle', t0: 0 }, cam: { x: 0, y: 0 },
    teclas: {}, tactil: { dx: 0, dy: 0 }, correr: false, sonido: true,
    recogidos: {}, hablado: {}, batalla: null, dialogo: null
  };
  function heroesTodos() { return GD.heroes.concat(GD.aliados); }
  function estado() { return C.rpg.estado(); }
  var pruebaHechas = {};
  function hecha(m, e) { if (PRUEBA && pruebaHechas[m + '-' + e]) return true; var a = estado().aventuras[m + '-' + e]; return !!(a && a.hecha); }
  function docente() { try { return localStorage.getItem('galoisLegacy.docente') === '1'; } catch (e) { return false; } }
  function desbloqueado(m) { return m === 1 || hecha(m - 1, 5) || docente(); }
  function pendiente(m) { for (var e = 1; e <= 5; e++) if (!hecha(m, e)) return e; return 0; }

  /* ---------- Sonido (sintetizado, sin archivos) ---------- */
  var AC = null;
  function tono(f, d, tipo, v, cuando) {
    if (!G.sonido) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + (cuando || 0);
    o.type = tipo || 'square'; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v || .06, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d);
  }
  var SFX = {
    ok: function () { tono(660, .1); tono(880, .12, 'square', .06, .09); tono(1320, .15, 'square', .05, .18); },
    mal: function () { tono(220, .18, 'sawtooth', .05); tono(160, .25, 'sawtooth', .05, .12); },
    golpe: function () { tono(120, .12, 'triangle', .1); },
    cofre: function () { [523, 659, 784, 1046].forEach(function (f, i) { tono(f, .14, 'square', .05, i * .09); }); },
    paso: function () { tono(90, .03, 'triangle', .02); },
    habla: function () { tono(440 + Math.random() * 80, .03, 'square', .02); },
    victoria: function () { [523, 659, 784, 659, 784, 1046].forEach(function (f, i) { tono(f, .16, 'square', .05, i * .12); }); }
  };

  /* ---------- Lienzo ---------- */
  var cv = $('lienzo'), ctx = cv.getContext('2d'), ESC = 3, VW = 320, VH = 200;
  function ajustar() {
    var w = innerWidth, h = innerHeight;
    ESC = Math.max(2, Math.floor(Math.min(w, h) / 210));
    VW = Math.ceil(w / ESC); VH = Math.ceil(h / ESC);
    cv.width = VW; cv.height = VH; cv.style.width = VW * ESC + 'px'; cv.style.height = VH * ESC + 'px';
    ctx.imageSmoothingEnabled = false;
  }
  addEventListener('resize', ajustar);

  /* ---------- Mundo cargado ---------- */
  var W = null, capas = [], solidos = null, edificios = [], vecinos = [], cofres = [], enemigos = [], fragmentos = [], jefe = null;
  function cargarMundo(id) {
    var def = MW.lista.find(function (m) { return m.id === id; }), wd = D.mundos[id - 1];
    W = { def: def, datos: wd, id: id };
    G.mundo = id; G.recogidos = {}; G.hablado = {};
    // capas de tiles (dos fotogramas para agua y trigo)
    capas = [0, 1].map(function (f) {
      var c = document.createElement('canvas'); c.width = MW.W * T; c.height = MW.H * T; var x = c.getContext('2d');
      for (var j = 0; j < MW.H; j++) for (var i = 0; i < MW.W; i++) x.drawImage(E.tile(def.mapa.t[j][i], i, j, f), i * T, j * T);
      return c;
    });
    solidos = []; for (var j = 0; j < MW.H; j++) { solidos.push([]); for (var i = 0; i < MW.W; i++) solidos[j].push(E.solido(def.mapa.t[j][i])); }
    edificios = def.edificios.map(function (b, k) {
      var ed = E.edificio(b.t, b.o); for (var j2 = b.y; j2 < b.y + ed.h; j2++) for (var i2 = b.x; i2 < b.x + ed.w; i2++) if (solidos[j2]) solidos[j2][i2] = true;
      return Object.assign({ k: k, w: ed.w, h: ed.h }, b);
    });
    var fsal = def.salida; solidos[fsal[1]][fsal[0]] = false;
    vecinos = def.vecinos.map(function (v) { return Object.assign({ hoja: E.hojaVecino(v.v), px: v.x * T + 8, py: v.y * T + 14, dirA: v.dir || 'down' }, v); });
    cofres = def.cofres.map(function (c) { return Object.assign({ abierto: estado().cofres.indexOf(c.id) >= 0, anim: 0 }, c); });
    fragmentos = def.fragmentos.map(function (p, i) { return { i: i, x: p[0] * T + 8, y: p[1] * T + 10 }; });
    G.jug.x = def.inicio[0] * T + 8; G.jug.y = def.inicio[1] * T + 14; G.jug.dir = 'up';
    prepararEnemigos();
    G.modo = 'mapa'; MUS.tocar('mundo', { mundo: id });
    $('campina').hidden = true; $('hud').hidden = false; $('controles').hidden = !tactilVisible();
    actualizarHUD();
    var e = pendiente(id);
    mostrarAviso(wd.nombre + ' · ' + wd.lugar, e ? 'Aventura ' + e + ': ' + wd.aventuras[e - 1].nombre : '¡Mundo completado! Puedes repetir los combates para practicar.');
  }
  function prepararEnemigos() {
    var def = W.def, wd = W.datos, p = pendiente(W.id), todo = p === 0;
    enemigos = [];
    if (p === 2 || todo) enemigos.push(nuevoEnemigo(wd.enemigos[0], def.enemigo2, 2, false));
    if (p === 4 || todo) enemigos.push(nuevoEnemigo(wd.enemigos[1], def.minijefe, 4, false));
    jefe = nuevoEnemigo(wd.jefe, def.jefe, 5, true);
  }
  function nuevoEnemigo(id, pos, etapa, esJefe) {
    return { id: id, etapa: etapa, jefe: esJefe, hoja: S.hojaEnemigo(id, esJefe ? { jefe: true, fase: 1 } : null), x0: pos[0] * T + 8, y0: pos[1] * T + 14, x: pos[0] * T + 8, y: pos[1] * T + 14, vx: 0, vy: 0, cambio: 0 };
  }

  /* ---------- Colisiones ---------- */
  function libre(x, y) {
    var pts = [[x - 5, y - 4], [x + 5, y - 4], [x - 5, y], [x + 5, y]];
    for (var k = 0; k < 4; k++) { var i = Math.floor(pts[k][0] / T), j = Math.floor(pts[k][1] / T); if (i < 0 || j < 0 || i >= MW.W || j >= MW.H) return false; if (solidos[j][i]) return false; }
    for (var v = 0; v < vecinos.length; v++) if (Math.abs(vecinos[v].px - x) < 10 && Math.abs(vecinos[v].py - y) < 7) return false;
    for (var c = 0; c < cofres.length; c++) if (Math.abs(cofres[c].x * T + 8 - x) < 11 && Math.abs(cofres[c].y * T + 12 - y) < 8) return false;
    if (jefe && Math.abs(jefe.x - x) < 18 && Math.abs(jefe.y - y) < 9) return false;
    return true;
  }

  /* ---------- Entrada ---------- */
  var MAPA_TECLAS = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
  addEventListener('keydown', function (e) {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (MAPA_TECLAS[e.code]) { G.teclas[MAPA_TECLAS[e.code]] = true; if (G.modo === 'mapa') e.preventDefault(); }
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') G.correr = true;
    if ((e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') && !e.repeat) { if (G.modo === 'mapa') { e.preventDefault(); accion(); } else if (G.modo === 'dialogo') { e.preventDefault(); avanzarDialogo(); } }
    if (e.code === 'Escape' && G.modo === 'mapa') abrirMenu('misiones');
  });
  addEventListener('keyup', function (e) { if (MAPA_TECLAS[e.code]) G.teclas[MAPA_TECLAS[e.code]] = false; if (/Shift/.test(e.code)) G.correr = false; });
  function tactilVisible() { try { var v = localStorage.getItem('galoisLegacy.tactil'); if (v) return v === '1'; } catch (e) {} return matchMedia('(pointer: coarse)').matches; }
  // cruceta táctil
  (function () {
    var pad = $('cruceta'), activo = null;
    function mover(ev) {
      var r = pad.getBoundingClientRect(), t = ev.touches ? ev.touches[0] : ev, dx = t.clientX - (r.left + r.width / 2), dy = t.clientY - (r.top + r.height / 2), n = Math.hypot(dx, dy);
      if (n < 8) { G.tactil.dx = G.tactil.dy = 0; return; }
      G.tactil.dx = dx / n; G.tactil.dy = dy / n; G.correr = n > r.width * .42;
    }
    function fin() { G.tactil.dx = G.tactil.dy = 0; G.correr = false; activo = null; }
    pad.addEventListener('pointerdown', function (e) { activo = e.pointerId; pad.setPointerCapture(e.pointerId); mover(e); e.preventDefault(); });
    pad.addEventListener('pointermove', function (e) { if (activo === e.pointerId) mover(e); });
    pad.addEventListener('pointerup', fin); pad.addEventListener('pointercancel', fin);
    $('botonA').addEventListener('pointerdown', function (e) { e.preventDefault(); if (G.modo === 'mapa') accion(); else if (G.modo === 'dialogo') avanzarDialogo(); });
  })();
  cv.addEventListener('pointerdown', function () { if (G.modo === 'dialogo') avanzarDialogo(); });

  /* ---------- Bucle ---------- */
  var ultimo = performance.now();
  function bucle(ahora) {
    var dt = Math.min(.05, (ahora - ultimo) / 1000); ultimo = ahora; G.t += dt;
    if (G.modo === 'mapa' || G.modo === 'dialogo') { if (G.modo === 'mapa') actualizarMapa(dt); actualizarEnemigos(dt); dibujarMapa(); }
    else if (G.modo === 'batalla') { actualizarBatalla(dt); dibujarBatalla(); }
    else if (G.modo === 'campina') { ctx.fillStyle = '#0c1424'; ctx.fillRect(0, 0, VW, VH); }
    requestAnimationFrame(bucle);
  }

  var pasoT = 0;
  function actualizarMapa(dt) {
    var dx = (G.teclas.right ? 1 : 0) - (G.teclas.left ? 1 : 0) + G.tactil.dx, dy = (G.teclas.down ? 1 : 0) - (G.teclas.up ? 1 : 0) + G.tactil.dy;
    var n = Math.hypot(dx, dy), J = G.jug, anim = 'idle';
    if (n > .2) {
      dx /= Math.max(1, n); dy /= Math.max(1, n);
      var v = (G.correr ? 105 : 62) * dt;
      if (Math.abs(dx) > Math.abs(dy)) J.dir = dx > 0 ? 'right' : 'left'; else J.dir = dy > 0 ? 'down' : 'up';
      var nx = J.x + dx * v, ny = J.y + dy * v;
      if (libre(nx, J.y)) J.x = nx; if (libre(J.x, ny)) J.y = ny;
      anim = G.correr ? 'run' : 'walk';
      pasoT += dt; if (pasoT > (G.correr ? .18 : .28)) { pasoT = 0; SFX.paso(); }
    }
    if (anim !== J.anim) { J.anim = anim; J.t0 = G.t; }
    // recoger fragmentos (solo si la aventura 1 está activa y ya se habló con el vecino)
    if (pendiente(W.id) === 1 && G.hablado.mision1) fragmentos.forEach(function (f) { if (!G.recogidos[f.i] && Math.abs(f.x - J.x) < 10 && Math.abs(f.y - J.y) < 12) { G.recogidos[f.i] = true; SFX.cofre(); var n2 = Object.keys(G.recogidos).length; mostrarAviso('Fragmento ' + n2 + ' de 3', n2 === 3 ? 'Vuelve con ' + vecinoMision().nombre : ''); actualizarHUD(); } });
    // salida
    var s = W.def.salida; if (Math.abs(J.x - (s[0] * T + 8)) < 12 && J.y > s[1] * T + 6) { abrirCampina(); return; }
    // enemigos
    enemigos.forEach(function (e) { if (Math.abs(e.x - J.x) < 13 && Math.abs(e.y - J.y) < 10) iniciarAventura(e.etapa, e); });
    // cámara
    G.cam.x = Math.max(0, Math.min(MW.W * T - VW, J.x - VW / 2)); G.cam.y = Math.max(0, Math.min(MW.H * T - VH, J.y - VH / 2));
    if (MW.W * T < VW) G.cam.x = (MW.W * T - VW) / 2; if (MW.H * T < VH) G.cam.y = (MW.H * T - VH) / 2;
  }
  function actualizarEnemigos(dt) {
    enemigos.forEach(function (e) {
      e.cambio -= dt;
      if (e.cambio <= 0) { e.cambio = 1 + Math.random() * 1.5; var a = Math.random() * Math.PI * 2; e.vx = Math.random() < .3 ? 0 : Math.cos(a) * 22; e.vy = Math.random() < .3 ? 0 : Math.sin(a) * 22; }
      var nx = e.x + e.vx * dt, ny = e.y + e.vy * dt;
      if (Math.hypot(nx - e.x0, ny - e.y0) < 34 && libre(nx, ny)) { e.x = nx; e.y = ny; } else e.cambio = 0;
    });
  }

  /* ---------- Interacción ---------- */
  function delante() { var J = G.jug, d = { up: [0, -12], down: [0, 12], left: [-12, 0], right: [12, 0] }[J.dir]; return { x: J.x + d[0], y: J.y - 4 + d[1] }; }
  function vecinoMision() { return vecinos.find(function (v) { return v.aventura === 1; }); }
  function accion() {
    var p = delante(), J = G.jug;
    var v = vecinos.find(function (v) { return Math.abs(v.px - p.x) < 12 && Math.abs(v.py - 6 - p.y) < 14; });
    if (v) { v.dirA = { up: 'down', down: 'up', left: 'right', right: 'left' }[J.dir]; return hablar(v); }
    var c = cofres.find(function (c) { return Math.abs(c.x * T + 8 - p.x) < 12 && Math.abs(c.y * T + 8 - p.y) < 12; });
    if (c) return abrirCofre(c);
    if (jefe && Math.abs(jefe.x - p.x) < 22 && Math.abs(jefe.y - 10 - p.y) < 22) return hablarJefe();
    var i = Math.floor(p.x / T), j = Math.floor((p.y + 2) / T);
    var b = edificios.find(function (b) { return i >= b.x && i < b.x + b.w && j >= b.y && j < b.y + b.h; });
    if (b) {
      if (b.obra && pendiente(W.id) === 3) return dialogo([{ quien: b.nombre, txt: W.datos.aventuras[2].historia + ' Resuelve los retos para reconstruirlo.' }], function () { iniciarAventura(3); });
      if (b.obra && pendiente(W.id) < 3) return dialogo([{ quien: b.nombre, txt: 'Está en obras: hay andamios y piezas por colocar. Vuelve cuando hayas avanzado en las aventuras anteriores.' }]);
      return dialogo([{ quien: b.nombre || 'Edificio', txt: b.texto || 'Una casa encalada con rejas de forja y macetas.' }]);
    }
  }
  function hablar(v) {
    var wd = W.datos, p = pendiente(W.id);
    if (v.tienda) return dialogo(v.dialogo.map(function (t) { return { quien: v.nombre, txt: t, v: v }; }), function () { abrirMenu('tienda'); });
    if (v.aventura === 1 && p === 1) {
      var n = Object.keys(G.recogidos).length;
      if (!G.hablado.mision1) { G.hablado.mision1 = true; return dialogo(v.dialogo.map(function (t) { return { quien: v.nombre, txt: t, v: v }; }), function () { actualizarHUD(); }); }
      if (n < 3) return dialogo([{ quien: v.nombre, txt: v.pedido + ' (' + n + '/3)', v: v }]);
      return dialogo([{ quien: v.nombre, txt: v.listo, v: v }], function () { iniciarAventura(1, null, v); });
    }
    if (v.aventura === 1 && p > 1) return dialogo([{ quien: v.nombre, txt: p === 0 ? '¡Has restaurado la pieza del Compás de este mundo! Gracias, ' + heroe().corto + '.' : 'Sigue adelante: ' + wd.aventuras[p - 1].historia, v: v }]);
    dialogo(v.dialogo.map(function (t) { return { quien: v.nombre, txt: t, v: v }; }));
  }
  function hablarJefe() {
    var p = pendiente(W.id);
    if (p > 0 && p < 5) return dialogo([{ quien: NOMBRE_ENEMIGO[W.datos.jefe], txt: '¡Ja! Aún no puedes desafiarme. Completa antes las aventuras de este mundo (te quedan ' + (5 - p) + ').' }]);
    dialogo([{ quien: NOMBRE_ENEMIGO[W.datos.jefe], txt: W.datos.aventuras[4].historia + ' ¡Prepárate para un combate en tres fases!' }], function () { iniciarAventura(5, jefe); });
  }
  function abrirCofre(c) {
    if (c.abierto) return dialogo([{ quien: 'Cofre', txt: 'Este cofre ya está vacío.' }]);
    dialogo([{ quien: 'Cofre del saber', txt: 'Un cofre cerrado con un candado numérico. Resuelve un reto para abrirlo.' }], function () { iniciarAventura(0, null, null, c); });
  }

  /* ---------- Diálogos ---------- */
  function dialogo(lineas, alFinal) { G.dialogo = { l: lineas, i: 0, fin: alFinal, letras: 0 }; G.modo = 'dialogo'; pintarDialogo(); }
  function pintarDialogo() {
    var d = G.dialogo, l = d.l[d.i];
    $('dialogo').hidden = false; $('dQuien').textContent = l.quien; $('dTexto').textContent = '';
    var txt = l.txt, k = 0; clearInterval(d.int);
    if (REDUCIDO) { $('dTexto').textContent = txt; return; }
    d.int = setInterval(function () { k += 2; $('dTexto').textContent = txt.slice(0, k); if (k % 6 === 0) SFX.habla(); if (k >= txt.length) clearInterval(d.int); }, 22);
  }
  function avanzarDialogo() {
    var d = G.dialogo; if (!d) return;
    var l = d.l[d.i]; if ($('dTexto').textContent.length < l.txt.length) { clearInterval(d.int); $('dTexto').textContent = l.txt; return; }
    d.i++; if (d.i < d.l.length) return pintarDialogo();
    $('dialogo').hidden = true; G.dialogo = null; G.modo = 'mapa'; if (d.fin) d.fin();
  }
  $('dialogo').addEventListener('click', avanzarDialogo);

  /* ---------- Avisos ---------- */
  var avisoT = null;
  function mostrarAviso(t, sub) { var a = $('aviso'); a.innerHTML = '<b>' + esc(t) + '</b>' + (sub ? '<small>' + esc(sub) + '</small>' : ''); a.hidden = false; a.classList.remove('sale'); void a.offsetWidth; a.classList.add('sale'); clearTimeout(avisoT); avisoT = setTimeout(function () { a.hidden = true; }, 3800); }

  /* =====================================================================
     AVENTURAS Y COMBATES
     ===================================================================== */
  function heroe() { return heroesTodos().find(function (h) { return h.id === G.heroeId; }) || GD.heroes[0]; }
  function vidasMax() { return Math.min(6, 3 + Math.floor((estado().nivel - 1) / 3)); }
  function iniciarAventura(etapa, enem, vecino, cofre) {
    var wd = W.datos, dif = DIF[G.dif], qs;
    if (cofre) qs = RT.preguntas(W.id, 1 + Math.floor(Math.random() * 3), dif).slice(0, 1);
    else qs = RT.preguntas(W.id, etapa, dif);
    var tipo = cofre ? 'cofre' : etapa === 1 ? 'exploracion' : etapa === 3 ? 'construccion' : 'combate';
    var enemigoId = etapa === 2 ? wd.enemigos[0] : etapa === 4 ? wd.enemigos[1] : etapa === 5 ? wd.jefe : null;
    var B = G.batalla = {
      etapa: etapa, tipo: tipo, cofre: cofre, preguntas: qs, i: 0, errores: 0, aciertos: 0, necesarios: qs.length,
      vidas: vidasMax(), vidasMax: vidasMax(), fase: etapa === 5 ? 1 : 0, enemigoId: enemigoId, jefe: etapa === 5,
      hojaE: enemigoId ? S.hojaEnemigo(enemigoId, etapa === 5 ? { jefe: true, fase: 1 } : null) : null,
      hojaV: vecino ? vecino.hoja : (tipo === 'construccion' || tipo === 'cofre') ? null : null,
      hA: 'idle', hT: 0, eA: 'idle', eT: 0, proy: [], textos: [], sacudir: 0,
      escudo: false, doble: false, habUsada: false, pistasUsadas: 0, ent: enem, terminado: false
    };
    G.modo = 'batalla'; G.teclas = {}; MUS.tocar(etapa === 5 ? 'jefe' : tipo === 'combate' ? 'combate' : 'reto', { mundo: W.id }); G.tactil.dx = G.tactil.dy = 0;
    $('controles').hidden = true; $('hud').hidden = true; $('aviso').hidden = true; $('reto').hidden = false;
    var titulo = cofre ? 'Cofre del saber' : 'Aventura ' + etapa + ' · ' + wd.aventuras[etapa - 1].nombre;
    $('rTitulo').textContent = titulo;
    $('rTipo').textContent = cofre ? 'Reto del candado' : wd.aventuras[etapa - 1].tipo + (enemigoId ? ' contra ' + NOMBRE_ENEMIGO[enemigoId] : '');
    siguientePregunta();
  }

  function siguientePregunta() {
    var B = G.batalla, q = B.preguntas[B.i];
    if (!q) return victoria();
    if (B.jefe && q.fase !== B.fase) cambiarFase(q.fase);
    B.q = q; B.opciones = construirOpciones(q); B.respondida = false;
    pintarPregunta();
  }
  function construirOpciones(q) {
    var n = G.dif === 'explorador' ? 3 : 4, ds = q.distractores.slice();
    for (var i = ds.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = ds[i]; ds[i] = ds[j]; ds[j] = t; }
    var ops = [q.respuesta].concat(ds.slice(0, n - 1));
    for (var k = ops.length - 1; k > 0; k--) { var m = Math.floor(Math.random() * (k + 1)); var u = ops[k]; ops[k] = ops[m]; ops[m] = u; }
    return ops;
  }
  function escribir() { return G.dif === 'maestro' && G.batalla.q.numerica; }
  function pintarPregunta() {
    var B = G.batalla, q = B.q;
    $('rFase').textContent = B.jefe ? 'Fase ' + B.fase + ' de 3 · ' + FASES[B.fase] : '';
    $('rProgreso').textContent = (B.tipo === 'combate' ? 'Vida del enemigo: ' : 'Progreso: ') + (B.necesarios - B.aciertos) + ' / ' + B.necesarios;
    $('rTexto').textContent = q.texto;
    $('rVisual').innerHTML = q.visual ? visual(q.visual) : '';
    $('rExpl').hidden = true; $('rPista').hidden = true;
    var o = $('rOpciones'); o.innerHTML = '';
    if (escribir()) {
      o.innerHTML = '<div class="teclado"><output id="rEntrada" aria-live="polite"></output><div class="teclas">' + ['7', '8', '9', '4', '5', '6', '1', '2', '3', '−', '0', '/'].map(function (k) { return '<button type="button" data-k="' + k + '">' + k + '</button>'; }).join('') + '<button type="button" data-k="⌫" aria-label="Borrar">⌫</button><button type="button" class="ok" data-k="ok">Comprobar ✔</button></div></div>';
      o.querySelectorAll('[data-k]').forEach(function (b) { b.onclick = function () { var k = b.dataset.k, out = $('rEntrada'); if (k === 'ok') return responder(out.textContent); if (k === '⌫') out.textContent = out.textContent.slice(0, -1); else if (out.textContent.length < 8) out.textContent += k; }; });
    } else {
      B.opciones.forEach(function (op, i) { var b = document.createElement('button'); b.type = 'button'; b.className = 'op'; b.textContent = op; b.dataset.op = op; b.onclick = function () { responder(op, b); }; o.appendChild(b); });
    }
    var h = heroe(), hab = HABILIDAD[h.id] || 'pista';
    $('rHab').hidden = B.tipo === 'cofre'; $('rHab').disabled = B.habUsada; $('rHab').textContent = '✦ ' + h.habilidad + ' (' + DESC_HAB[hab] + ')';
    var maxPistas = G.dif === 'explorador' ? 99 : G.dif === 'aventurero' ? 2 : 0;
    $('rPistaBtn').hidden = maxPistas === 0; $('rPistaBtn').disabled = B.pistasUsadas >= maxPistas;
    $('rPocion').textContent = '🧪 Poción (' + estado().inv.pocion + ')'; $('rPocion').disabled = estado().inv.pocion < 1 || B.vidas >= B.vidasMax || B.tipo === 'cofre';
    pintarVidas();
    var first = o.querySelector('button'); if (first && !('ontouchstart' in window)) first.focus({ preventScroll: true });
  }
  function visual(v) {
    if (v.tipo === 'barra') { var s = '<div class="vis-barra" aria-hidden="true">'; for (var i = 0; i < v.partes; i++) s += '<i class="' + (i < v.marcadas ? 'on' : '') + '"></i>'; return s + '</div>'; }
    if (v.tipo === 'barras' || v.tipo === 'frecuencias') {
      var datos = v.datos, cuenta = {}; if (v.tipo === 'frecuencias') { datos.forEach(function (d) { cuenta[d] = (cuenta[d] || 0) + 1; }); }
      var ks = v.tipo === 'frecuencias' ? Object.keys(cuenta).sort() : datos.map(function (_, i) { return i; }), mx = Math.max.apply(null, v.tipo === 'frecuencias' ? ks.map(function (k) { return cuenta[k]; }) : datos);
      if (v.tipo === 'frecuencias') return '<div class="vis-graf" aria-hidden="true">' + ks.map(function (k) { return '<span><i style="height:0"></i><b>' + k + '</b></span>'; }).join('') + '</div><small>Completa tú las alturas: cuenta los datos.</small>';
      return '<div class="vis-graf" aria-hidden="true">' + ks.map(function (k) { return '<span><i style="height:' + Math.round(datos[k] / mx * 100) + '%"></i><b>' + k + '</b></span>'; }).join('') + '</div>';
    }
    if (v.tipo === 'truncado') return '<div class="vis-graf trunc" aria-hidden="true"><span><i style="height:' + ((v.a - 95) / (v.b - 95 + 1) * 100) + '%"></i><b>A</b></span><span><i style="height:' + ((v.b - 95) / (v.b - 95 + 1) * 100) + '%"></i><b>B</b></span><em>95</em></div>';
    if (v.tipo === 'plano') { var cx = 50 + v.x * 7, cy = 50 - v.y * 7; return '<svg class="vis-plano" viewBox="0 0 100 100" aria-hidden="true"><path d="M0 50H100M50 0V100" stroke="#fbf0d6" stroke-width="1.5"/><path d="' + [10, 20, 30, 40, 60, 70, 80, 90].map(function (k) { return 'M' + k + ' 0V100M0 ' + k + 'H100'; }).join('') + '" stroke="#fff3" stroke-width=".5"/><text x="74" y="22" fill="#f2c14e" font-size="10">I</text><text x="20" y="22" fill="#f2c14e" font-size="10">II</text><text x="18" y="86" fill="#f2c14e" font-size="10">III</text><text x="72" y="86" fill="#f2c14e" font-size="10">IV</text><rect x="' + (cx - 3) + '" y="' + (cy - 3) + '" width="6" height="6" fill="#ff6a6a"/></svg>'; }
    return '';
  }
  function pintarVidas() {
    var B = G.batalla, s = ''; for (var i = 0; i < B.vidasMax; i++) s += '<i class="' + (B.vidas >= i + 1 ? 'on' : B.vidas > i ? 'medio' : '') + '"></i>';
    $('rVidas').innerHTML = s; $('rVidas').setAttribute('aria-label', 'Vida: ' + B.vidas + ' de ' + B.vidasMax);
  }
  function animH(a) { var B = G.batalla; B.hA = a; B.hT = G.t; }
  function animE(a) { var B = G.batalla; B.eA = a; B.eT = G.t; }

  function responder(valor, boton) {
    var B = G.batalla; if (B.respondida || B.terminado) return;
    if (escribir() && !String(valor).trim()) return;
    B.respondida = true;
    var ok = RT.igual(valor, B.q.respuesta);
    $('rOpciones').querySelectorAll('button').forEach(function (b) { b.disabled = true; if (b.dataset.op != null && RT.igual(b.dataset.op, B.q.respuesta)) b.classList.add('bien'); });
    if (ok) {
      SFX.ok(); var dmg = B.doble ? 2 : 1; B.doble = false; B.aciertos = Math.min(B.necesarios, B.aciertos + dmg);
      animH(B.tipo === 'combate' ? 'attack' : 'cast');
      setTimeout(function () { B.proy.push({ de: 'h', t: G.t, txt: '✦' }); }, 250);
      setTimeout(function () { if (B.enemigoId) animE('hurt'); SFX.golpe(); B.sacudir = .25; B.textos.push({ txt: dmg > 1 ? '¡DOBLE!' : '¡BIEN!', t: G.t, lado: 'e' }); }, 520);
      $('rExpl').hidden = false; $('rExpl').className = 'expl ok'; $('rExpl').innerHTML = '<b>✔ ¡Correcto!</b> ' + esc(B.q.explicacion) + '<button type="button" id="rSeguir">Continuar ▶</button>';
      if (boton) boton.classList.add('bien');
      B.i++;
      // si el «doble» completa antes la fase del jefe, se salta a la siguiente fase
      if (B.jefe) { var vistos = B.preguntas.slice(0, B.i).length; if (B.aciertos >= vistos + 0 && dmg > 1) { var faseAct = B.q.fase; while (B.preguntas[B.i] && B.preguntas[B.i].fase === faseAct) B.i++; } }
      else if (dmg > 1 && B.aciertos >= B.necesarios) B.i = B.preguntas.length;
    } else {
      SFX.mal(); B.errores++;
      if (boton) boton.classList.add('mal');
      var dano = B.escudo ? 0 : G.dif === 'explorador' ? .5 : 1; B.escudo = false;
      if (B.tipo === 'cofre') dano = 0;
      if (B.enemigoId) { animE('attack'); setTimeout(function () { var tok = (S.enemigos[B.enemigoId].ataque || ['?'])[Math.floor(Math.random() * 3) % (S.enemigos[B.enemigoId].ataque || ['?']).length]; B.proy.push({ de: 'e', t: G.t, txt: tok.replace('^', '²').replace('v', '√') }); }, 250); }
      setTimeout(function () { if (dano) { animH('hurt'); B.sacudir = .3; } B.textos.push({ txt: dano ? '−' + (dano === .5 ? '½' : '1') + ' ♥' : '¡Protegido!', t: G.t, lado: 'h' }); B.vidas = Math.max(0, B.vidas - dano); pintarVidas(); }, 560);
      $('rExpl').hidden = false; $('rExpl').className = 'expl mal';
      $('rExpl').innerHTML = '<b>✘ No es correcto.</b> Respuesta correcta: <strong>' + esc(B.q.respuesta) + '</strong>. ' + esc(B.q.explicacion) + '<button type="button" id="rSeguir">Entendido: otro reto ▶</button>';
      // la pregunta fallada se sustituye por otra parecida (no se puede ganar memorizando)
      var nueva = RT.preguntas(W.id, B.etapa || 1, DIF[G.dif]).filter(function (x) { return !B.jefe || x.fase === B.q.fase; })[0];
      if (nueva) { if (B.jefe) nueva.fase = B.q.fase; B.preguntas[B.i] = nueva; }
    }
    $('rSeguir').onclick = function () { if (B.vidas <= 0) return derrota(); siguientePregunta(); };
    $('rSeguir').focus({ preventScroll: true });
    PRUEBA && (window.__GL.ultima = ok);
  }
  function cambiarFase(f) {
    var B = G.batalla; B.fase = f; MUS.fase(f); B.hojaE = S.hojaEnemigo(B.enemigoId, { jefe: true, fase: f });
    B.sacudir = .6; B.textos.push({ txt: 'FASE ' + f + ': ' + FASES[f].toUpperCase(), t: G.t, lado: 'c' }); animE('attack'); SFX.mal();
  }
  $('rHab').onclick = function () {
    var B = G.batalla; if (B.habUsada) return; B.habUsada = true; $('rHab').disabled = true;
    var hab = HABILIDAD[heroe().id] || 'pista'; animH('cast'); SFX.ok();
    if (hab === 'eliminar' && !escribir()) { var malas = [].slice.call($('rOpciones').querySelectorAll('.op')).filter(function (b) { return !RT.igual(b.dataset.op, B.q.respuesta) && !b.disabled; }); if (malas[0]) { malas[0].disabled = true; malas[0].classList.add('tachada'); } }
    else if (hab === 'doble') { B.doble = true; B.textos.push({ txt: '×2', t: G.t, lado: 'h' }); }
    else if (hab === 'escudo') { B.escudo = true; B.textos.push({ txt: '🛡', t: G.t, lado: 'h' }); }
    else { $('rPista').hidden = false; $('rPista').textContent = '💡 ' + B.q.pista; }
  };
  $('rPistaBtn').onclick = function () { var B = G.batalla; B.pistasUsadas++; $('rPista').hidden = false; $('rPista').textContent = '💡 ' + B.q.pista; var max = G.dif === 'explorador' ? 99 : 2; $('rPistaBtn').disabled = B.pistasUsadas >= max; };
  $('rPocion').onclick = function () { var B = G.batalla; if (B.vidas >= B.vidasMax) return; if (C.rpg.usarPocion()) { B.vidas = Math.min(B.vidasMax, B.vidas + 2); pintarVidas(); B.textos.push({ txt: '+2 ♥', t: G.t, lado: 'h' }); SFX.cofre(); $('rPocion').textContent = '🧪 Poción (' + estado().inv.pocion + ')'; $('rPocion').disabled = estado().inv.pocion < 1 || B.vidas >= B.vidasMax; actualizarHUD(); } };
  $('rHuir').onclick = function () { cerrarReto(); mostrarAviso('Has salido del reto', 'Puedes volver a intentarlo cuando quieras.'); };

  function derrota() {
    var B = G.batalla; B.terminado = true; MUS.tocar('derrota'); animH('defeat');
    $('rOpciones').innerHTML = ''; $('rExpl').hidden = false; $('rExpl').className = 'expl mal';
    $('rExpl').innerHTML = '<b>¡Ánimo, ' + esc(heroe().corto) + '!</b> Te has quedado sin vida, pero no pierdes nada: ni monedas ni cartas. Repasa las explicaciones y vuelve a intentarlo.' + '<button type="button" id="rSeguir">Reintentar ▶</button> <button type="button" id="rSalir" class="sec">Volver al mapa</button>';
    $('rSeguir').onclick = function () { var e = B.etapa, en = B.ent, cf = B.cofre; cerrarReto(); if (cf) iniciarAventura(0, null, null, cf); else iniciarAventura(e, en, B.tipo === 'exploracion' ? vecinoMision() : null); };
    $('rSalir').onclick = cerrarReto;
  }
  function cerrarReto() { $('reto').hidden = true; $('hud').hidden = false; MUS.tocar('mundo', { mundo: W.id }); G.batalla = null; G.modo = 'mapa'; $('controles').hidden = !tactilVisible(); prepararEnemigos(); empujarJugador(); actualizarHUD(); }
  function empujarJugador() { var J = G.jug; for (var r = 0; r < 60; r += 4) { var ok = enemigos.every(function (e) { return Math.hypot(e.x - J.x, e.y - J.y) > 26; }); if (ok) return; J.y += 4; if (!libre(J.x, J.y)) J.y -= 8; } }

  function victoria() {
    var B = G.batalla; B.terminado = true; MUS.tocar('victoria'); animH('victory'); if (B.enemigoId) animE('defeat');
    $('rOpciones').innerHTML = ''; $('rFase').textContent = '';
    var res = null;
    if (B.cofre) {
      res = PRUEBA ? { monedas: 0, logros: [] } : C.rpg.abrirCofre(B.cofre.id, B.cofre.monedas);
      B.cofre.abierto = true; B.cofre.anim = G.t;
      setTimeout(function () { mostrarPremio({ cofre: true, monedas: res ? res.monedas : 0, logros: res ? res.logros : [] }); }, 900);
      return;
    }
    if (!PRUEBA) res = C.rpg.completarAventura({ mundo: W.id, etapa: B.etapa, errores: B.errores, dificultad: G.dif });
    else pruebaHechas[W.id + '-' + B.etapa] = true;
    setTimeout(function () { mostrarPremio(res || { xp: 0, monedas: 0, cartas: [], logros: [], prueba: true }, B); }, 1400);
  }

  /* ---------- Pantalla de recompensa (cofre animado + cartas) ---------- */
  function mostrarPremio(r, B) {
    $('reto').hidden = true;
    var p = $('premio'), leg = r.cartas && r.cartas.some(function (c) { return c.rareza === 'legendaria'; });
    var cartas = (r.cartas || []).map(function (c) { return '<div class="pc"><div class="pc-i"><img src="' + GaloisArte.carta(c) + '" alt="' + esc(c.nombre) + '"><img src="' + GaloisArte.reverso(c.mundo) + '" alt=""></div><b>' + esc(c.nombre) + '</b><small>' + esc(D.rarezas[c.rareza]) + ' · ' + esc(D.categorias[c.categoria]) + '</small></div>'; }).join('');
    var titulo = r.cofre ? '¡Cofre abierto!' : B && B.etapa === 5 ? '¡Jefe derrotado! Pieza del Compás recuperada' : '¡Aventura superada!';
    $('pTitulo').textContent = titulo;
    $('pCofre').className = 'cofre-anim' + (leg ? ' legendario' : '');
    $('pCuerpo').innerHTML =
      (r.prueba ? '<p class="nota">Modo de prueba: no se guardan recompensas.</p>' : '') +
      '<ul class="botin">' + (r.xp ? '<li>⭐ +' + r.xp + ' XP</li>' : '') + (r.monedas ? '<li><span class="moneda"></span> +' + r.monedas + ' monedas</li>' : '') + (r.subeNivel ? '<li class="sube">⬆ ¡Nivel ' + r.nivel + '!</li>' : '') + (r.insignia ? '<li>🏅 Insignia del mundo ' + r.insignia + '</li>' : '') + '</ul>' +
      (cartas ? '<h3>' + ((r.cartas.length > 1) ? 'Cartas nuevas' : 'Carta nueva') + '</h3><div class="pcartas">' + cartas + '</div>' : (r.cofre || r.prueba ? '' : '<p class="nota">' + (r.primera === false ? 'Ya habías superado esta aventura: repetirla da un poco de experiencia, pero no más cartas.' : 'Ya tienes todas las cartas normales de este mundo.') + '</p>')) +
      (r.logros && r.logros.length ? '<h3>Logros</h3><ul class="botin">' + r.logros.map(function (l) { return '<li>' + l.icono + ' ' + esc(l.nombre) + '</li>'; }).join('') + '</ul>' : '') +
      (B && B.etapa === 5 && W.id < 10 ? '<p class="nota">Se ha abierto el camino hacia ' + esc(D.mundos[W.id].lugar) + '.</p>' : '') +
      (B && B.etapa === 5 && W.id === 10 ? '<p class="nota">¡Has reunido las diez piezas! El Compás de los Alarifes vuelve a brillar sobre la Campiña.</p>' : '');
    p.hidden = false; SFX.cofre();
    var cc = $('pCofre'), x2 = cc.getContext('2d'), fr = 0; x2.imageSmoothingEnabled = false; clearInterval(G.cofreInt);
    G.cofreInt = setInterval(function () { x2.clearRect(0, 0, 64, 64); x2.drawImage(E.objeto('cofre', Math.min(3, fr), leg ? 'legendaria' : (r.cartas && r.cartas.some(function (c) { return c.rareza === 'epica'; }) ? 'epica' : '')), 0, 0, 64, 64); if (++fr > 3) clearInterval(G.cofreInt); }, REDUCIDO ? 0 : 180);
    $('pSeguir').focus({ preventScroll: true });
  }
  $('pSeguir').onclick = function () { $('premio').hidden = true; $('hud').hidden = false; MUS.tocar('mundo', { mundo: W.id }); G.batalla = null; G.modo = 'mapa'; $('controles').hidden = !tactilVisible(); prepararEnemigos(); empujarJugador(); actualizarHUD(); var e = pendiente(W.id); mostrarAviso(e ? 'Siguiente: aventura ' + e : '¡Mundo completado!', e ? W.datos.aventuras[e - 1].nombre : 'Sal por el camino del sur para volver a la Campiña.'); };

  /* =====================================================================
     DIBUJO
     ===================================================================== */
  function dibujarMapa() {
    var cx = Math.round(G.cam.x), cy = Math.round(G.cam.y), f = Math.floor(G.t * 2) % 2;
    ctx.fillStyle = '#1a2a1a'; ctx.fillRect(0, 0, VW, VH);
    ctx.drawImage(capas[f], -cx, -cy);
    // fragmentos
    if (pendiente(W.id) === 1 && G.hablado.mision1) fragmentos.forEach(function (fr) { if (!G.recogidos[fr.i]) ctx.drawImage(E.objeto('brillo', Math.floor(G.t * 8)), fr.x - 8 - cx, fr.y - 12 - cy + Math.round(Math.sin(G.t * 4) * 2)); });
    // lista ordenada por profundidad
    var L = [];
    edificios.forEach(function (b) { L.push({ y: (b.y + b.h) * T, d: function () { var ed = E.edificio(b.t, b.o, b.t === 'molino' ? Math.floor(G.t * 6) % 16 : 0); ctx.drawImage(ed.canvas, b.x * T - cx, b.y * T - cy); if (b.obra && pendiente(W.id) <= 3) andamio(b, cx, cy); } }); });
    cofres.forEach(function (c) { L.push({ y: c.y * T + 14, d: function () { var fr = c.abierto ? (c.anim && G.t - c.anim < .4 ? Math.min(3, Math.floor((G.t - c.anim) * 10)) : 3) : 0; ctx.drawImage(E.objeto('cofre', fr), c.x * T - cx, c.y * T - cy); } }); });
    vecinos.forEach(function (v) { L.push({ y: v.py, d: function () { sombra(v.px - cx, v.py - cy); S.pintar(ctx, v.hoja, 'idle', v.dirA, S.indice(v.hoja, 'idle', G.t + v.x), v.px - cx, v.py - cy + 2, .5); } }); });
    enemigos.forEach(function (e) { L.push({ y: e.y, d: function () { sombra(e.x - cx, e.y - cy); var a = (e.vx || e.vy) ? 'move' : 'idle'; S.pintar(ctx, e.hoja, a, 'left', S.indice(e.hoja, a, G.t), e.x - cx, e.y - cy + 3, e.etapa === 4 ? .75 : .6); } }); });
    if (jefe) L.push({ y: jefe.y, d: function () { sombra(jefe.x - cx, jefe.y - cy, 14); S.pintar(ctx, jefe.hoja, 'idle', 'left', S.indice(jefe.hoja, 'idle', G.t), jefe.x - cx, jefe.y - cy + 3, .55); } });
    var J = G.jug, hoja = S.hojaHeroe(G.heroeId);
    L.push({ y: J.y, d: function () { sombra(J.x - cx, J.y - cy); S.pintar(ctx, hoja, J.anim, J.dir, S.indice(hoja, J.anim, G.t - J.t0), J.x - cx, J.y - cy + 2, .5); } });
    L.sort(function (a, b) { return a.y - b.y; }).forEach(function (o) { o.d(); });
    // marcador de misión
    var obj = objetivo();
    if (obj) { var bob = Math.round(Math.sin(G.t * 5) * 2); marcador(obj.x - cx, obj.y - cy + bob); }
    // salida
    var s = W.def.salida; ctx.fillStyle = '#fbf0d6'; S.texto && textoPx('▼', s[0] * T + 8 - cx, s[1] * T + 2 - cy);
  }
  function textoPx(t, x, y) { ctx.font = '8px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#1a1124'; ctx.fillText(t, x + 1, y + 1); ctx.fillStyle = '#ffe28a'; ctx.fillText(t, x, y); }
  function sombra(x, y, r) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(Math.round(x - (r || 5)), Math.round(y - 1), (r || 5) * 2, 2); ctx.fillRect(Math.round(x - (r || 5) + 2), Math.round(y - 2), (r || 5) * 2 - 4, 4); }
  function andamio(b, cx, cy) {
    var x0 = b.x * T - cx, y0 = b.y * T - cy, w = b.w * T, h = b.h * T;
    ctx.fillStyle = 'rgba(30,20,40,.35)'; ctx.fillRect(x0, y0, w, h * .5);
    ctx.fillStyle = '#8a6a3a'; for (var i = 4; i < w; i += 14) ctx.fillRect(x0 + i, y0 + 4, 2, h - 4); for (var j = 10; j < h; j += 14) ctx.fillRect(x0, y0 + j, w, 2);
  }
  function marcador(x, y) { ctx.fillStyle = '#1a1124'; ctx.fillRect(Math.round(x) - 3, Math.round(y) - 13, 7, 11); ctx.fillStyle = '#ffe28a'; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 12, 5, 6); ctx.fillRect(Math.round(x) - 2, Math.round(y) - 5, 5, 2); }
  function objetivo() {
    var p = pendiente(W.id), def = W.def;
    if (p === 1) { var v = vecinoMision(); if (G.hablado.mision1 && Object.keys(G.recogidos).length < 3) return null; return { x: v.px, y: v.py - 22 }; }
    if (p === 3) { var b = edificios.find(function (b) { return b.obra; }); return { x: (b.x + b.w / 2) * T, y: b.y * T + 6 }; }
    if (p === 5) return { x: jefe.x, y: jefe.y - 34 };
    var e = enemigos.find(function (e) { return e.etapa === p; }); return e ? { x: e.x, y: e.y - 20 } : null;
  }

  function dibujarBatalla() {
    var B = G.batalla; if (!B) return;
    var panel = $('reto').getBoundingClientRect(), altoEsc = Math.max(90, Math.min(VH, panel.top / ESC));
    var sh = B.sacudir > 0 ? Math.round((Math.random() - .5) * 4) : 0;
    // cielo y suelo del mundo
    var cielo = ctx.createLinearGradient(0, 0, 0, altoEsc); cielo.addColorStop(0, '#2a3a78'); cielo.addColorStop(1, '#f0a868');
    ctx.fillStyle = cielo; ctx.fillRect(0, 0, VW, VH);
    var suelo = Math.round(altoEsc * .78);
    for (var x = 0; x < VW; x += T) for (var y = suelo; y < VH; y += T) ctx.drawImage(E.tile(W.def.mapa.t[12][8] === ':' ? '.' : '.', x / T | 0, y / T | 0, 0), x + sh, y);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(0, suelo, VW, 3);
    // monumento de fondo
    var obra = edificios.find(function (b) { return b.obra; }) || edificios[0];
    var ed = E.edificio(obra.t, obra.o), k = Math.min(1, (suelo - 8) / ed.canvas.height);
    if (B.tipo === 'construccion') {
      var prog = B.aciertos / B.necesarios, hh = Math.round(ed.canvas.height * (0.25 + .75 * prog));
      ctx.globalAlpha = .25; ctx.drawImage(ed.canvas, VW * .62 - ed.canvas.width * k / 2, suelo - ed.canvas.height * k, ed.canvas.width * k, ed.canvas.height * k); ctx.globalAlpha = 1;
      ctx.drawImage(ed.canvas, 0, ed.canvas.height - hh, ed.canvas.width, hh, VW * .62 - ed.canvas.width * k / 2, suelo - hh * k, ed.canvas.width * k, hh * k);
    } else { ctx.globalAlpha = .35; ctx.drawImage(ed.canvas, VW * .5 - ed.canvas.width * k / 2, suelo - ed.canvas.height * k, ed.canvas.width * k, ed.canvas.height * k); ctx.globalAlpha = 1; }
    // héroe
    var hoja = S.hojaHeroe(G.heroeId), hx = Math.round(VW * .24), hk = Math.max(1, Math.min(2, Math.floor(altoEsc / 70)));
    if (B.hA !== 'idle' && B.hA !== 'victory' && B.hA !== 'defeat' && G.t - B.hT > S.duracion(hoja, B.hA) + .1) B.hA = 'idle';
    sombra(hx + sh, suelo + 4, 10); S.pintar(ctx, hoja, B.hA, 'right', S.indice(hoja, B.hA, G.t - B.hT), hx + sh, suelo + 4, hk);
    // enemigo o vecino
    if (B.hojaE) {
      var ex = Math.round(VW * .74), ek = B.jefe ? hk : hk * 1.2, hE = B.hojaE;
      if (B.eA !== 'idle' && B.eA !== 'defeat' && G.t - B.eT > S.duracion(hE, B.eA) + .1) B.eA = 'idle';
      sombra(ex + sh, suelo + 4, 14 * hk); S.pintar(ctx, hE, B.eA, 'left', S.indice(hE, B.eA, G.t - B.eT), ex + sh, suelo + 4, ek);
      // barra de vida del enemigo
      var bw = 60 * hk / 1.5, vida = 1 - B.aciertos / B.necesarios;
      ctx.fillStyle = '#1a1124'; ctx.fillRect(ex - bw / 2 - 1, 6, bw + 2, 6); ctx.fillStyle = '#5a1a2a'; ctx.fillRect(ex - bw / 2, 7, bw, 4); ctx.fillStyle = '#e0565b'; ctx.fillRect(ex - bw / 2, 7, Math.round(bw * vida), 4);
    } else if (B.tipo === 'exploracion' || B.tipo === 'cofre') {
      if (B.tipo === 'cofre') { var fr = B.terminado ? Math.min(3, Math.floor((G.t - (B.cofre.anim || G.t)) * 8)) : 0; ctx.save(); ctx.translate(Math.round(VW * .72), suelo - 32); ctx.scale(2, 2); ctx.drawImage(E.objeto('cofre', fr), 0, 0); ctx.restore(); }
      else { var v = vecinoMision(); S.pintar(ctx, v.hoja, 'idle', 'left', S.indice(v.hoja, 'idle', G.t), Math.round(VW * .74), suelo + 4, hk); }
    }
    // proyectiles
    B.proy = B.proy.filter(function (p) { var u = (G.t - p.t) / .45; if (u > 1) return false; var x0 = p.de === 'h' ? hx + 14 : VW * .74 - 14, x1 = p.de === 'h' ? VW * .74 : hx, xx = x0 + (x1 - x0) * u, yy = suelo - 20 * hk - Math.sin(u * Math.PI) * 14; ctx.font = 'bold ' + (8 * hk) + 'px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#1a1124'; ctx.fillText(p.txt, xx + 1, yy + 1); ctx.fillStyle = p.de === 'h' ? S.heroes[G.heroeId] ? S.heroes[G.heroeId].magia : '#7fd8ff' : '#ff8a6a'; ctx.fillText(p.txt, xx, yy); return true; });
    // textos flotantes
    B.textos = B.textos.filter(function (t) { var u = G.t - t.t; if (u > 1.4) return false; var x = t.lado === 'h' ? hx : t.lado === 'e' ? VW * .74 : VW / 2; ctx.font = 'bold ' + (t.lado === 'c' ? 9 : 8) * hk / 1.2 + 'px monospace'; ctx.textAlign = 'center'; var y = (t.lado === 'c' ? altoEsc * .35 : suelo - 44 * hk) - u * 10; ctx.fillStyle = '#1a1124'; ctx.fillText(t.txt, x + 1, y + 1); ctx.fillStyle = '#ffe28a'; ctx.fillText(t.txt, x, y); return true; });
    B.sacudir = Math.max(0, B.sacudir - 1 / 60);
  }
  function actualizarBatalla() {}

  /* =====================================================================
     INTERFAZ: HUD, Campiña, menús
     ===================================================================== */
  function actualizarHUD() {
    var e = estado(), h = heroe();
    $('hNivel').textContent = 'Nv ' + e.nivel; $('hXp').style.width = Math.round(100 * (e.xp - e.xpNivel) / Math.max(1, e.xpSiguiente - e.xpNivel)) + '%';
    $('hMonedas').textContent = e.monedas; $('hPociones').textContent = e.inv.pocion; $('hHeroe').textContent = h.corto;
    if (W) {
      var p = pendiente(W.id), wd = W.datos;
      var txt = p === 0 ? '¡Mundo completado!' : p === 1 ? (G.hablado.mision1 ? 'Reúne los fragmentos ✦ (' + Object.keys(G.recogidos).length + '/3)' : 'Habla con ' + vecinoMision().nombre) : 'Aventura ' + p + ': ' + wd.aventuras[p - 1].nombre;
      $('hMision').textContent = txt; $('hMundo').textContent = wd.id + ' · ' + wd.lugar;
    }
  }
  function abrirCampina() {
    G.modo = 'campina'; MUS.tocar('campina'); $('hud').hidden = true; $('controles').hidden = true; $('campina').hidden = false;
    var cont = $('cMarcas'); cont.innerHTML = '';
    D.mundos.forEach(function (w) {
      var ok = desbloqueado(w.id), p = pendiente(w.id), n = 5 - (p === 0 ? 0 : 6 - p) ;
      var hechas = [1, 2, 3, 4, 5].filter(function (e) { return hecha(w.id, e); }).length;
      var b = document.createElement('button'); b.type = 'button'; b.className = 'cm' + (ok ? '' : ' bloq') + (hechas === 5 ? ' hecho' : '');
      b.style.left = w.x + '%'; b.style.top = w.y + '%';
      b.innerHTML = '<span class="num">' + w.id + '</span><span class="nom">' + esc(w.lugar) + '</span><span class="pr">' + (ok ? hechas + '/5' : '🔒') + '</span>';
      b.setAttribute('aria-label', 'Mundo ' + w.id + ': ' + w.lugar + ', ' + w.tema + (ok ? ', ' + hechas + ' de 5 aventuras' : ', bloqueado'));
      b.onclick = function () { fichaMundo(w); };
      cont.appendChild(b);
    });
    fichaMundo(D.mundos[(G.mundo || 1) - 1]);
    actualizarHUD();
  }
  function fichaMundo(w) {
    var ok = desbloqueado(w.id), hechas = [1, 2, 3, 4, 5].filter(function (e) { return hecha(w.id, e); }).length;
    $('cFicha').innerHTML = '<h2>' + w.id + ' · ' + esc(w.nombre) + '</h2><p class="lugar">' + esc(w.lugar) + ' · <b>' + esc(w.tema) + '</b></p><p>' + esc(w.sinopsis) + '</p>' +
      '<div class="enem">' + w.enemigos.map(function (e) { return '<img src="../assets/pichu-royale/enemigos/' + e + '.png" alt="" width="48" height="48"><span>' + NOMBRE_ENEMIGO[e] + '</span>'; }).join('') + '</div>' +
      '<ol class="avs">' + w.aventuras.map(function (a, i) { return '<li class="' + (hecha(w.id, i + 1) ? 'ok' : '') + '">' + esc(a.nombre) + ' <small>' + esc(a.tipo) + '</small></li>'; }).join('') + '</ol>' +
      (ok ? '<button type="button" class="gl-btn" id="cEntrar">▶ ' + (hechas ? 'Volver a ' : 'Entrar en ') + esc(w.lugar) + '</button>' : '<p class="bloqueo">🔒 Derrota al jefe del mundo ' + (w.id - 1) + ' (' + esc(D.mundos[w.id - 2].lugar) + ') para abrir este camino.</p>');
    var b = $('cEntrar'); if (b) b.onclick = function () { cargarMundo(w.id); };
    document.querySelectorAll('.cm').forEach(function (m, i) { m.setAttribute('aria-current', String(i + 1 === w.id)); });
  }

  /* ---------- Menús (misiones, inventario, tienda, ajustes) ---------- */
  function abrirMenu(cual) {
    var e = estado(), h = heroe(), m = $('menu'), cuerpo = $('mCuerpo');
    G.modoPrevio = G.modo === 'menu' ? G.modoPrevio : G.modo; G.modo = 'menu';
    document.querySelectorAll('#menu [data-pest]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.pest === cual)); });
    if (cual === 'misiones') {
      cuerpo.innerHTML = '<h2>Misiones</h2>' + D.mundos.map(function (w) { var ok = desbloqueado(w.id); return '<details' + (W && w.id === W.id ? ' open' : '') + '><summary>' + (ok ? '' : '🔒 ') + w.id + ' · ' + esc(w.lugar) + ' — ' + [1, 2, 3, 4, 5].filter(function (k) { return hecha(w.id, k); }).length + '/5</summary><ol class="avs">' + w.aventuras.map(function (a, i) { return '<li class="' + (hecha(w.id, i + 1) ? 'ok' : '') + '"><b>' + esc(a.nombre) + '</b> <small>' + esc(a.tipo) + '</small><br><small>' + esc(a.historia) + '</small></li>'; }).join('') + '</ol></details>'; }).join('');
    } else if (cual === 'inventario') {
      cuerpo.innerHTML = '<h2>Inventario de ' + esc(h.corto) + '</h2><div class="inv"><div><span class="moneda"></span><b>' + e.monedas + '</b> monedas</div><div>🧪 <b>' + e.inv.pocion + '</b> pociones (+2 ♥ en combate)</div><div>⭐ Nivel <b>' + e.nivel + '</b> · ' + e.xp + ' XP</div><div>♥ Vida máxima: <b>' + vidasMax() + '</b></div><div>🃏 <b>' + e.cartas.length + '</b> / 60 cartas</div><div>🗝️ <b>' + e.cofres.length + '</b> cofres abiertos</div></div>' +
        '<h3>Piezas del Compás e insignias</h3><div class="insignias">' + D.mundos.map(function (w) { var ok = e.insignias.indexOf(w.id) >= 0; return '<span class="ins' + (ok ? ' ok' : '') + '" title="' + esc(w.lugar) + '">' + w.id + '</span>'; }).join('') + '</div>' +
        '<h3>Habilidad</h3><p>✦ <b>' + esc(h.habilidad) + '</b>: ' + DESC_HAB[HABILIDAD[h.id] || 'pista'] + ' (una vez por combate).</p><p><a class="gl-btn azul" href="../coleccion/index.html">🃏 Abrir el álbum</a></p>';
    } else if (cual === 'tienda') {
      cuerpo.innerHTML = '<h2>Puesto de la plaza</h2><p>Tienes <span class="moneda"></span><b id="tM">' + e.monedas + '</b> monedas y 🧪 <b id="tP">' + e.inv.pocion + '</b> pociones.</p><button type="button" class="gl-btn" id="comprar">Comprar poción · 15 monedas</button><p class="nota" id="tMsg">Las monedas solo sirven dentro del juego y no cambian ninguna nota.</p>';
      $('comprar').onclick = function () { var ok = C.rpg.comprarPocion(15); $('tMsg').textContent = ok ? '¡Poción comprada!' : 'No tienes monedas suficientes. Abre cofres del saber o supera aventuras.'; if (ok) SFX.cofre(); var e2 = estado(); $('tM').textContent = e2.monedas; $('tP').textContent = e2.inv.pocion; actualizarHUD(); };
    } else if (cual === 'ajustes') {
      cuerpo.innerHTML = '<h2>Ajustes</h2><h3>Matemático</h3><div class="heroes" id="aHeroes"></div>' +
        '<h3>Dificultad</h3><div class="difs">' + [['explorador', 'Explorador', '3 opciones, pistas ilimitadas, los fallos quitan medio corazón'], ['aventurero', 'Aventurero', '4 opciones, 2 pistas por reto'], ['maestro', 'Maestro', 'escribes las respuestas numéricas, sin pistas']].map(function (d) { return '<label><input type="radio" name="dif" value="' + d[0] + '"' + (G.dif === d[0] ? ' checked' : '') + '> <b>' + d[1] + '</b> <small>' + d[2] + '</small></label>'; }).join('') + '</div>' +
        '<h3>Opciones</h3><label><input type="checkbox" id="aMus"' + (MUS.activa() ? ' checked' : '') + '> Música</label> <label>Volumen <input type="range" id="aVol" min="0" max="1" step="0.05" value="' + MUS.volumen() + '"></label><br><label><input type="checkbox" id="aSon"' + (G.sonido ? ' checked' : '') + '> Efectos de sonido</label> <label><input type="checkbox" id="aTac"' + (tactilVisible() ? ' checked' : '') + '> Controles táctiles en pantalla</label>' +
        '<h3>Perfil</h3><p>Alias: <b>' + esc(C.activo()) + '</b>. Cambia de alias o exporta tu progreso desde el <a href="../coleccion/index.html">álbum</a>.</p>' +
        '<details><summary>Modo docente</summary><p>Permite abrir todos los mundos para revisarlos en clase. No concede cartas ni recompensas: hay que superar las aventuras igualmente.</p><input id="aCod" placeholder="Código docente" autocomplete="off"> <button type="button" id="aDoc">' + (docente() ? 'Desactivar' : 'Activar') + '</button> <span id="aDocMsg"></span></details>';
      var hs = heroesTodos(); $('aHeroes').innerHTML = hs.map(function (x) { return '<button type="button" data-h="' + x.id + '" aria-pressed="' + (x.id === G.heroeId) + '"><canvas width="32" height="44"></canvas><b>' + esc(x.corto) + '</b></button>'; }).join('');
      $('aHeroes').querySelectorAll('button').forEach(function (b) { var c2 = b.querySelector('canvas').getContext('2d'); S.pintar(c2, S.hojaHeroe(b.dataset.h), 'idle', 'down', 0, 16, 42, 1); b.onclick = function () { G.heroeId = b.dataset.h; try { localStorage.setItem('galoisLegacy.heroe', G.heroeId); } catch (e2) {} C.rpg.preferencias({ heroe: G.heroeId }); abrirMenu('ajustes'); actualizarHUD(); }; });
      cuerpo.querySelectorAll('[name=dif]').forEach(function (r) { r.onchange = function () { G.dif = r.value; C.rpg.preferencias({ dificultad: G.dif }); }; });
      $('aMus').onchange = function () { MUS.activar(this.checked); pintarBotonMusica(); };
      $('aVol').oninput = function () { MUS.volumen(this.value); };
      $('aSon').onchange = function () { G.sonido = this.checked; try { localStorage.setItem('galoisLegacy.sonido', G.sonido ? '1' : '0'); } catch (e2) {} };
      $('aTac').onchange = function () { try { localStorage.setItem('galoisLegacy.tactil', this.checked ? '1' : '0'); } catch (e2) {} };
      $('aDoc').onclick = function () { try { if (docente()) { localStorage.removeItem('galoisLegacy.docente'); $('aDocMsg').textContent = 'Desactivado.'; } else if ($('aCod').value.trim().toUpperCase() === 'ALARIFES') { localStorage.setItem('galoisLegacy.docente', '1'); $('aDocMsg').textContent = 'Todos los mundos abiertos.'; } else $('aDocMsg').textContent = 'Código incorrecto.'; } catch (e2) {} };
    } else if (cual === 'ayuda') {
      cuerpo.innerHTML = '<h2>Cómo se juega</h2><ul class="ayuda"><li><b>Moverse:</b> flechas o WASD (Mayúsculas para correr). En tableta y móvil, la cruceta: si la empujas hasta el borde, corres.</li><li><b>Hablar, abrir, examinar:</b> Espacio, Intro o E; en pantalla táctil, el botón A.</li><li><b>Misión:</b> sigue la marca amarilla <span style="color:#ffe28a">▮</span>. Cada mundo tiene cinco aventuras en orden: exploración, combate, construcción, minijefe y jefe.</li><li><b>Combates:</b> cada acierto daña al enemigo. Si fallas, verás por qué y recibirás otro reto parecido. Nunca pierdes monedas ni cartas.</li><li><b>Habilidad:</b> cada matemático tiene una habilidad que puedes usar una vez por combate.</li><li><b>Cofres del saber:</b> resuélvelos para ganar monedas; con ellas compras pociones.</li><li><b>Recompensas:</b> XP, niveles, monedas, insignias y cartas son del juego y <b>no cambian tus notas</b>.</li></ul>';
    }
    m.hidden = false;
  }
  document.querySelectorAll('#menu [data-pest]').forEach(function (b) { b.onclick = function () { abrirMenu(b.dataset.pest); }; });
  $('mCerrar').onclick = function () { $('menu').hidden = true; G.modo = G.modoPrevio || 'mapa'; if (G.modo === 'campina') abrirCampina(); else actualizarHUD(); };
  $('bMenu').onclick = function () { abrirMenu('misiones'); };
  $('bAjustes').onclick = function () { abrirMenu('ajustes'); };
  $('bInv').onclick = function () { abrirMenu('inventario'); };
  $('bCampina').onclick = function () { abrirCampina(); };
  function pintarBotonMusica() { ['bMusica', 'cMusica'].forEach(function (id) { var b = $(id); if (!b) return; b.setAttribute('aria-pressed', String(MUS.activa())); b.title = MUS.activa() ? 'Silenciar música' : 'Activar música'; b.firstChild.textContent = MUS.activa() ? '🎵' : '🔇'; }); }
  ['bMusica', 'cMusica'].forEach(function (id) { var b = $(id); if (b) b.onclick = function () { MUS.activar(!MUS.activa()); pintarBotonMusica(); }; });
  pintarBotonMusica();
  $('cAjustes').onclick = function () { abrirMenu('ajustes'); };
  $('cAyuda').onclick = function () { abrirMenu('ayuda'); };

  /* ---------- Arranque ---------- */
  function iniciar() {
    ajustar();
    try { G.heroeId = localStorage.getItem('galoisLegacy.heroe') || estado().heroe || 'galois'; G.sonido = localStorage.getItem('galoisLegacy.sonido') !== '0'; } catch (e) {}
    if (!S.heroes[G.heroeId]) G.heroeId = 'galois';
    G.dif = estado().dificultad || 'aventurero';
    var m = +params.get('mundo');
    if (m >= 1 && m <= 10 && desbloqueado(m)) cargarMundo(m); else abrirCampina();
    if (m && !desbloqueado(m)) mostrarAviso('Ese mundo aún está bloqueado', 'Supera antes al jefe del mundo anterior.');
    requestAnimationFrame(bucle);
    if (PRUEBA) window.__GL = { G: G, respuesta: function () { return G.batalla && G.batalla.q && G.batalla.q.respuesta; }, cargarMundo: cargarMundo, iniciarAventura: function (e) { iniciarAventura(e, e === 5 ? jefe : null, e === 1 ? vecinoMision() : null); }, pendiente: function () { return pendiente(G.mundo); } };
  }
  iniciar();
})();
