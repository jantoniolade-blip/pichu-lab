/* =====================================================================
   GALOIS LEGACY · motor de sprites pixel art 16-bit
   ---------------------------------------------------------------------
   Dibuja por código (sin recursos de terceros) los fotogramas de los
   matemáticos y de los enemigos. Cada fotograma es una pose distinta:
   piernas, brazos, cabeza, ojos y efectos cambian entre fotogramas,
   con la misma ropa, rostro y paleta.

   API (window.GaloisSprites):
     ANIM_HEROE   animaciones de héroe {nombre:{n,fps,loop}}
     ANIM_ENEMIGO animaciones de enemigo
     heroes, enemigos            paletas y formas
     hojaHeroe(id)   -> {canvas, fw, fh, filas:{'walk-down':fila,...}, anims}
     hojaEnemigo(id, {jefe, fase}) -> {canvas, fw, fh, filas, anims}
     frame(hoja, anim, dir, t)   -> {sx, sy} del fotograma a dibujar en t (s)
     pintar(ctx, hoja, anim, dir, i, x, y, escala)
   Las hojas son <canvas> que también se exportan como PNG
   (herramientas/exportar-sprites.mjs).
   ===================================================================== */
(function (root) {
  'use strict';
  var OUT = '#1a1124';

  /* ---------- Búfer de píxeles ---------- */
  function Buf(w, h) { this.w = w; this.h = h; this.p = new Array(w * h).fill(null); }
  Buf.prototype.set = function (x, y, c) { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < this.w && y < this.h) this.p[y * this.w + x] = c; };
  Buf.prototype.get = function (x, y) { return (x < 0 || y < 0 || x >= this.w || y >= this.h) ? null : this.p[y * this.w + x]; };
  Buf.prototype.rect = function (x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.set(x + i, y + j, c); };
  Buf.prototype.clear = function (x, y) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.p[y * this.w + x] = null; };
  Buf.prototype.line = function (x0, y0, x1, y1, c, t) {
    t = t || 1; var dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy), 1);
    for (var i = 0; i <= n; i++) this.rect(Math.round(x0 + dx * i / n), Math.round(y0 + dy * i / n), t, t, c);
  };
  Buf.prototype.ellipse = function (cx, cy, rx, ry, c) {
    for (var y = -ry; y <= ry; y++) for (var x = -rx; x <= rx; x++) if ((x * x) / (rx * rx + .01) + (y * y) / (ry * ry + .01) <= 1.02) this.set(cx + x, cy + y, c);
  };
  Buf.prototype.outline = function (c) {
    var o = [], w = this.w, h = this.h;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) if (!this.get(x, y) && (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1))) o.push(y * w + x);
    for (var i = 0; i < o.length; i++) this.p[o[i]] = c || OUT;
  };
  Buf.prototype.mirror = function () { var b = new Buf(this.w, this.h); for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) b.p[y * this.w + (this.w - 1 - x)] = this.p[y * this.w + x]; return b; };
  Buf.prototype.map = function (fn) { for (var i = 0; i < this.p.length; i++) if (this.p[i]) this.p[i] = fn(this.p[i], i); return this; };
  Buf.prototype.paste = function (b, dx, dy) { for (var y = 0; y < b.h; y++) for (var x = 0; x < b.w; x++) { var c = b.p[y * b.w + x]; if (c) this.set(dx + x, dy + y, c); } };
  /* Gira 90° (cuerpo tumbado en la animación de derrota) */
  Buf.prototype.tumbar = function (suelo) {
    var b = new Buf(this.w, this.h);
    for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) {
      var c = this.p[y * this.w + x]; if (!c) continue;
      var nx = y - 12, ny = suelo - (x - 8); // cabeza a la izquierda
      b.set(nx, ny - 14, c);
    }
    return b;
  };
  Buf.prototype.toCanvas = function (cv, ox, oy) {
    var ctx = cv.getContext('2d');
    for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) { var c = this.p[y * this.w + x]; if (c) { ctx.fillStyle = c; ctx.fillRect(ox + x, oy + y, 1, 1); } }
  };

  /* ---------- Color ---------- */
  function hex(c) { c = c.replace('#', ''); if (c.length === 3) c = c.split('').map(function (k) { return k + k; }).join(''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
  function rgb(a) { return '#' + a.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }
  function mix(a, b, t) { var x = hex(a), y = hex(b); return rgb([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
  function dark(c, t) { return mix(c, '#140a1e', t == null ? .3 : t); }
  function light(c, t) { return mix(c, '#fff8e6', t == null ? .3 : t); }
  function hash(x, y, s) { var h = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

  /* ---------- Fuente de 3×5 para símbolos de los enemigos ---------- */
  var FONT = {
    '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
    '5': '111100111001111', '6': '111100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001111',
    'a': '000011101101011', 'n': '000110101101101', 'x': '000101010101000', 'P': '110101110100100', '%': '101001010100101',
    '+': '000010111010000', '-': '000000111000000', '*': '000101010101000', '/': '001001010100100', '=': '000111000111000',
    'v': '000001101101010', '(': '010100100100010', ')': '010001001001010', '?': '111001011000010', 'y': '000101111001110',
    'f': '011010111010010', 'M': '101111101101101', 'e': '000111111100111', 'd': '001001111101111', 'p': '000111101111100',
    ':': '000010000010000', '^': '010101000000000', 'R': '110101110101101', 'E': '111100111100111', 'X': '101101010101101', 'I': '111010010010111', 'S': '111100111001111', 'A': '010101111101101', 'O': '111101101101111', 'C': '111100100100111', 'T': '111010010010010', 'L': '100100100100111', 'N': '101111111111101', 'G': '111100101101111', 'U': '101101101101111', 'D': '110101101101110', 'F': '111100110100100', 'H': '101101111101101', 'B': '110101110101110', 'Y': '101101010010010', 'R': '110101110101101', 'M': '101111101101101', 'P': '110101110100100', 'E': '111100111100111', 'V': '101101101101010', 'K': '101101110101101', 'W': '101101111111101'
  };
  function texto(b, s, x, y, c, k) {
    k = k || 1; for (var n = 0; n < s.length; n++) {
      var g = FONT[s[n]]; if (!g) { x += 2 * k; continue; }
      for (var j = 0; j < 5; j++) for (var i = 0; i < 3; i++) if (g[j * 3 + i] === '1') b.rect(x + i * k, y + j * k, k, k, c);
      x += 4 * k;
    }
  }
  function anchoTexto(s, k) { return s.length * 4 * (k || 1) - (k || 1); }

  /* =====================================================================
     HÉROES
     ===================================================================== */
  var heroes = {
    galois:        { skin: '#f2c39b', hair: '#5a3622', pelo: 'rizado', coat: '#b8323a', shirt: '#f4efe6', pants: '#24305e', shoes: '#2a1d1d', acc: '#24305e', cape: '#1f2c5c', magia: '#7fd8ff' },
    gauss:         { skin: '#efc6a6', hair: '#e8e4dc', pelo: 'corto', hat: 'boina', hatC: '#1d1f2b', coat: '#2a2c38', shirt: '#f2f2f2', pants: '#2c2d3a', shoes: '#181820', acc: '#c9a44a', magia: '#ffd86b' },
    euler:         { skin: '#f0c4a0', hair: '#cfc6b8', pelo: 'corto', hat: 'turbante', hatC: '#efe2c4', hatB: '#8a5a32', coat: '#7a4b2a', shirt: '#f2ead8', pants: '#4a3424', shoes: '#2a1d1d', acc: '#d8b45a', magia: '#9df07a' },
    emmy_noether:  { skin: '#f1c7a5', hair: '#3b2a20', pelo: 'melena', gafas: true, coat: '#56607a', shirt: '#e8e8f0', vestido: true, shoes: '#22222c', acc: '#a7b4d8', magia: '#c59bff' },
    hipatia:       { skin: '#d9a27a', hair: '#2b1b14', pelo: 'mono', coat: '#efe9dc', shirt: '#efe9dc', vestido: true, shoes: '#8a5a32', acc: '#d9a441', diadema: '#d9a441', magia: '#ffe9a0' },
    ada_lovelace:  { skin: '#f3cdb0', hair: '#2c1c18', pelo: 'mono', coat: '#6a3f8f', shirt: '#e9dff5', vestido: true, shoes: '#2a1830', acc: '#e9dff5', magia: '#ff9be0' },
    fibonacci:     { skin: '#efc19b', hair: '#6b4226', pelo: 'corto', hat: 'gorro', hatC: '#a8322f', coat: '#3f7a3a', shirt: '#e9dcc0', pants: '#7a5a3a', shoes: '#3a2418', acc: '#d9a441', magia: '#b6f56a' },
    fermat:        { skin: '#f0c6a2', hair: '#3a2a24', pelo: 'largo', coat: '#1c1a24', shirt: '#f4f1e8', cuello: '#f4f1e8', pants: '#1c1a24', shoes: '#120e14', acc: '#8a2b3a', magia: '#ff7a6a' },
    sophie_germain:{ skin: '#f2c8aa', hair: '#7a4a2a', pelo: 'rizos', coat: '#3c6fb4', shirt: '#f2efe8', vestido: true, shoes: '#22222c', acc: '#f2efe8', magia: '#8fd7ff' },
    ramanujan:     { skin: '#a8714f', hair: '#1a1414', pelo: 'corto', coat: '#ece7da', shirt: '#ffffff', pants: '#3a3a46', shoes: '#1c1414', acc: '#7a5a3a', magia: '#ffb45a' },
    al_juarismi:   { skin: '#c48a5f', hair: '#2a2020', pelo: 'corto', hat: 'turbante', hatC: '#f4f1ea', hatB: '#2a7a7a', barba: '#2a2020', coat: '#2a7a7a', shirt: '#f4f1ea', vestido: true, shoes: '#3a2418', acc: '#d9a441', magia: '#6af5e0' }
  };

  var ANIM_HEROE = {
    idle: { n: 4, fps: 4, loop: true }, walk: { n: 8, fps: 10, loop: true }, run: { n: 8, fps: 14, loop: true },
    jump: { n: 6, fps: 10, loop: false }, attack: { n: 7, fps: 14, loop: false }, cast: { n: 8, fps: 10, loop: false },
    hurt: { n: 3, fps: 9, loop: false }, victory: { n: 6, fps: 8, loop: true }, defeat: { n: 5, fps: 6, loop: false }
  };
  var DIRS = ['down', 'left', 'right', 'up'];
  var FW = 32, FH = 44, OY = 12; // fotograma 32×44; el suelo está en y = 42

  function pose() { return { bx: 0, by: 0, hL: [0, 0], hR: [0, 0], fL: [0, 0], fR: [0, 0], ojos: 'open', boca: 'n', arma: null, fx: [], aire: false, tint: null, cabeza: 0 }; }

  /* Poses de cada fotograma. "L" es la mano/pie izquierdo en vista frontal y el
     cercano en vista lateral. En vista lateral "adelante" es x negativa. */
  function poseHeroe(anim, f, lado) {
    var p = pose(), ph = f / 8 * Math.PI * 2, s = Math.sin(ph), c = Math.cos(ph);
    switch (anim) {
      case 'idle':
        if (f >= 2) { p.by = 1; p.hL = [0, 1]; p.hR = [0, 1]; }
        if (f === 3) p.ojos = 'closed';
        break;
      case 'walk': case 'run':
        var k = anim === 'run' ? 1.7 : 1;
        if (lado) {
          p.fL = [-Math.round(3 * k * s), -Math.max(0, Math.round(2 * k * c))];
          p.fR = [Math.round(3 * k * s), -Math.max(0, Math.round(-2 * k * c))];
          p.hL = [Math.round(3 * k * s), anim === 'run' ? -3 : 0];
          p.hR = [-Math.round(3 * k * s), anim === 'run' ? -3 : 0];
          if (anim === 'run') p.bx = -1;
        } else {
          p.fL = [0, -Math.max(0, Math.round(2 * k * s))];
          p.fR = [0, -Math.max(0, Math.round(-2 * k * s))];
          p.hL = [0, Math.round(1.5 * k * s) + (anim === 'run' ? -2 : 0)];
          p.hR = [0, -Math.round(1.5 * k * s) + (anim === 'run' ? -2 : 0)];
        }
        p.by = Math.abs(s) > .7 ? 1 : 0;
        if (anim === 'run') { p.by -= (f % 4 === 1 || f % 4 === 2) ? 1 : 0; p.boca = 'o'; }
        break;
      case 'jump':
        var J = [[2, 0, 1, 0], [-3, -2, -2, 0], [-7, -4, -8, 1], [-9, -4, -9, 1], [-5, -1, -4, 2], [2, 0, 1, 2]][f];
        p.by = J[0]; p.aire = true; p.fL = [lado ? -1 : 1 * (J[1] < -2 ? 1 : 0), J[1]]; p.fR = [lado ? 1 : -(J[1] < -2 ? 1 : 0), J[1]];
        if (J[3] === 2) { p.hL = [-3, -4]; p.hR = [3, -4]; } else if (J[3] === 1) { p.hL = [-1, J[2]]; p.hR = [1, J[2]]; } else { p.hL = [-1, J[2]]; p.hR = [1, J[2]]; }
        if (f === 5) { p.hL = [-2, 0]; p.hR = [2, 0]; }
        p.boca = f >= 2 && f <= 3 ? 'o' : 'n';
        break;
      case 'attack':
        var A = lado ? [[0, -1], [5, -6], [2, -11], [-7, -6], [-8, -3], [-4, -1], [0, 0]][f] : [[0, -2], [1, -12], [2, -13], [-6, -4], [-8, 0], [-3, -1], [0, 0]][f];
        if (lado) p.hL = A; else p.hR = A;
        p.arma = 'compas'; if (f === 3 || f === 4) p.fx.push({ t: 'tajo', f: f - 3 });
        p.bx = lado ? (f === 3 || f === 4 ? -1 : f === 1 ? 1 : 0) : 0; p.by = f === 3 ? 1 : 0; p.boca = f >= 3 && f <= 4 ? 'o' : 'n';
        if (lado) { p.fL = [f >= 3 && f <= 4 ? -2 : 0, 0]; }
        break;
      case 'cast':
        var C = [[0, 0], [2, -3], [3, -7], [2, -10], [2, -11], [2, -12], [-1, -6], [0, -1]][f];
        p.hL = [-C[0], C[1]]; p.hR = [C[0], C[1]];
        if (lado && f === 6) { p.hL = [-7, -6]; p.hR = [-6, -5]; }
        if (f >= 3 && f <= 5) p.fx.push({ t: 'orbe', r: f - 2 });
        if (f === 6) p.fx.push({ t: 'rayo' });
        if (f >= 4 && f <= 6) p.fx.push({ t: 'chispas', f: f });
        p.ojos = f >= 4 && f <= 5 ? 'closed' : 'open'; p.boca = f === 6 ? 'o' : 'n';
        break;
      case 'hurt':
        p.bx = lado ? [3, 1, 0][f] : 0; p.by = lado ? 0 : [-1, 0, 0][f]; p.tint = ['#ffffff', '#ff5a5a', null][f];
        p.hL = [-2, -2]; p.hR = [2, -2]; p.ojos = 'closed'; p.boca = 'o';
        break;
      case 'victory':
        var V = [[2, 0], [-5, -14], [-7, -15], [-4, -14], [0, -13], [0, -11]][f];
        p.by = V[0]; p.aire = true; p.hR = [lado ? 0 : 1, V[1]]; p.hL = [lado ? 1 : -2, f === 0 ? 1 : -1];
        p.boca = 'sonrisa'; if (f === 2 || f === 5) p.fx.push({ t: 'chispas', f: f });
        if (f === 0) p.hR = [1, 0];
        break;
      case 'defeat':
        p.ojos = 'closed'; p.boca = 'o';
        if (f === 0) { p.bx = 1; p.hL = [-2, -1]; p.hR = [2, -1]; }
        if (f === 1) { p.by = 4; p.fL = [-2, -2]; p.fR = [2, -2]; p.hL = [0, 2]; p.hR = [0, 2]; }
        if (f === 2) { p.by = 5; p.fL = [-2, -2]; p.fR = [2, -2]; p.hL = [0, 3]; p.hR = [0, 3]; p.cabeza = 1; }
        if (f >= 3) { p.tumbado = true; p.ojos = 'x'; }
        if (f === 4) p.fx.push({ t: 'mareo' });
        break;
    }
    return p;
  }

  function brazo(b, sx, sy, hx, hy, C, ropa, piel) {
    b.line(sx, sy, hx, hy, ropa, 2);
    b.rect(hx, hy + 1, 2, 2, piel);
  }
  function pierna(b, hx, hy, fx, fy, ropa, zap, dir) {
    b.line(hx, hy, fx, fy, ropa, 3);
    if (dir === 'side') b.rect(fx - 1, fy + 1, 4, 2, zap); else b.rect(fx - (dir === 'L' ? 1 : 0), fy + 1, 4, 2, zap);
  }

  function pelo(b, P, vista, x0, y0) {
    var H = P.hair, Hs = dark(P.hair, .25), st = P.pelo;
    if (vista === 'up') {
      b.rect(x0, y0 - 1, 12, 11, H); b.rect(x0 + 1, y0 + 9, 10, 1, Hs);
      if (st === 'largo' || st === 'rizos' || st === 'melena') b.rect(x0, y0 + 9, 12, st === 'melena' ? 2 : 5, H);
      if (st === 'mono') { b.rect(x0 + 3, y0 - 3, 6, 4, H); b.rect(x0 + 4, y0 - 3, 4, 1, light(H, .2)); }
      if (st === 'rizado' || st === 'rizos') for (var i = 0; i < 12; i += 2) b.set(x0 + i, y0 - 2, H);
      return;
    }
    if (vista === 'side') {
      b.rect(x0, y0 - 1, 11, 4, H); b.rect(x0 + 6, y0, 5, 7, H); b.rect(x0 + 1, y0 + 3, 3, 1, H);
      if (st === 'largo' || st === 'rizos') b.rect(x0 + 7, y0 + 6, 4, 7, H);
      if (st === 'melena') b.rect(x0 + 6, y0 + 6, 5, 3, H);
      if (st === 'mono') { b.rect(x0 + 8, y0 - 2, 4, 4, H); }
      if (st === 'rizado' || st === 'rizos') { b.set(x0 + 2, y0 - 2, H); b.set(x0 + 5, y0 - 2, H); b.set(x0 + 8, y0 - 2, H); b.set(x0 + 11, y0 + 2, H); }
      b.rect(x0 + 6, y0 + 2, 5, 1, Hs);
      return;
    }
    // frontal
    b.rect(x0, y0 - 1, 12, 4, H); b.rect(x0, y0 + 2, 2, 4, H); b.rect(x0 + 10, y0 + 2, 2, 4, H);
    b.rect(x0 + 2, y0 + 3, 3, 1, H); b.rect(x0 + 7, y0 + 3, 2, 1, H); b.rect(x0 + 1, y0 + 2, 10, 1, Hs);
    if (st === 'largo' || st === 'rizos') { b.rect(x0 - 1, y0 + 2, 2, 11, H); b.rect(x0 + 11, y0 + 2, 2, 11, H); }
    if (st === 'melena') { b.rect(x0 - 1, y0 + 2, 2, 8, H); b.rect(x0 + 11, y0 + 2, 2, 8, H); }
    if (st === 'mono') { b.rect(x0 + 3, y0 - 3, 6, 3, H); b.rect(x0 + 4, y0 - 3, 4, 1, light(H, .2)); }
    if (st === 'rizado' || st === 'rizos') { for (var j = 0; j < 12; j += 2) b.set(x0 + j, y0 - 2, H); b.set(x0 - 1, y0 + 1, H); b.set(x0 + 12, y0 + 1, H); }
  }
  function sombrero(b, P, vista, x0, y0) {
    if (!P.hat) return;
    var C = P.hatC, Cs = dark(C, .25);
    if (P.hat === 'boina') { b.rect(x0 - 1, y0 - 2, 14, 3, C); b.rect(x0 + 1, y0 - 4, 10, 2, C); b.rect(x0 - 1, y0, 14, 1, Cs); if (vista === 'side') b.rect(x0 - 2, y0 - 1, 3, 1, C); }
    if (P.hat === 'turbante') { b.rect(x0 - 1, y0 - 4, 14, 6, C); b.rect(x0, y0 - 5, 12, 1, C); b.rect(x0 - 1, y0 - 1, 14, 1, P.hatB); b.line(x0 + 1, y0 - 4, x0 + 9, y0 - 2, Cs, 1); if (vista === 'up') b.rect(x0 + 3, y0 + 1, 6, 1, Cs); }
    if (P.hat === 'gorro') { b.rect(x0 - 1, y0 - 3, 14, 4, C); b.rect(x0 + 2, y0 - 5, 9, 2, C); b.rect(x0 - 1, y0, 14, 1, Cs); if (vista !== 'down') b.rect(vista === 'side' ? x0 + 10 : x0 + 4, y0 + 1, 3, 5, C); }
  }

  function dibujarHeroe(P, anim, f, dir) {
    var b = new Buf(FW, FH), lado = dir === 'left' || dir === 'right', vista = lado ? 'side' : dir;
    var p = poseHeroe(anim, f, lado);
    var bx = p.bx, by = p.by, o = OY;
    var coat = P.coat, coatS = dark(coat, .28), coatL = light(coat, .18), skin = P.skin, skinS = dark(skin, .18);
    var pants = P.pants || coatS, shoes = P.shoes;
    var fy0 = 28 + o; // pie
    var afL = p.aire ? by : 0;

    if (vista === 'side') {
      // brazo lejano, pierna lejana, capa, pierna cercana, torso, cabeza, brazo cercano
      var shx = 16 + bx, shy = 14 + by + o;
      brazo(b, shx + 1, shy, 17 + bx + p.hR[0], 19 + by + o + p.hR[1], null, coatS, skinS);
      if (!P.vestido) pierna(b, 16 + bx, 21 + by + o, 16 + p.fR[0] + bx, fy0 - 1 + p.fR[1] + afL, dark(pants, .25), dark(shoes, .2), 'side');
      if (P.cape) { var fl = anim === 'run' ? 3 : anim === 'walk' ? 1 : 0; b.rect(19 + bx, 13 + by + o, 3, 12, P.cape); b.rect(22 + bx, 16 + by + o, fl, 9 - fl, P.cape); }
      if (!P.vestido) pierna(b, 15 + bx, 21 + by + o, 15 + p.fL[0] + bx, fy0 - 1 + p.fL[1] + afL, pants, shoes, 'side');
      else {
        for (var r = 0; r < 9; r++) b.rect(12 + bx - (r >> 2), 20 + r + by + o, 9 + (r >> 1), 1, r === 8 ? coatS : coat);
        b.rect(13 + p.fL[0] + bx, fy0 + p.fL[1] + afL, 4, 2, shoes);
      }
      b.rect(12 + bx, 13 + by + o, 8, 9, coat); b.rect(19 + bx, 13 + by + o, 1, 9, coatS); b.rect(12 + bx, 13 + by + o, 1, 9, coatL);
      b.rect(12 + bx, 13 + by + o, 3, 3, P.shirt); if (P.cuello) b.rect(12 + bx, 13 + by + o, 5, 2, P.cuello);
      if (!P.vestido) b.rect(12 + bx, 20 + by + o, 8, 1, coatS);
      var hx = 10 + bx, hy = 3 + by + o + p.cabeza;
      b.rect(hx, hy, 11, 10, skin); b.clear(hx, hy); b.clear(hx, hy + 9); b.clear(hx + 10, hy + 9);
      b.set(hx - 1, hy + 6, skin); // nariz
      b.rect(hx + 6, hy + 5, 2, 2, skinS); // oreja
      pelo(b, P, 'side', hx, hy); sombrero(b, P, 'side', hx, hy);
      if (P.barba) b.rect(hx + 1, hy + 7, 6, 3, P.barba);
      var ex = hx + 2, ey = hy + 5;
      if (p.ojos === 'open') b.rect(ex, ey, 1, 2, '#24162e'); else if (p.ojos === 'closed') b.set(ex, ey + 1, '#24162e'); else { b.set(ex, ey, '#24162e'); b.set(ex + 1, ey + 1, '#24162e'); b.set(ex, ey + 2, '#24162e'); }
      if (P.gafas) { b.rect(ex - 1, ey - 1, 3, 1, '#2a2a3a'); b.rect(ex + 2, ey, 4, 1, '#2a2a3a'); }
      b.set(hx + 1, hy + 8, p.boca === 'o' ? '#6a2a3a' : skinS); if (p.boca === 'sonrisa') b.set(hx + 2, hy + 8, '#6a2a3a');
      if (P.diadema) b.rect(hx, hy + 1, 7, 1, P.diadema);
      brazo(b, shx - 1, shy, 15 + bx + p.hL[0], 19 + by + o + p.hL[1], null, coatL, skin);
      if (p.arma) arma(b, 15 + bx + p.hL[0], 19 + by + o + p.hL[1], shx - 1, shy, P);
    } else {
      var back = vista === 'up';
      var sLx = 10 + bx, sRx = 20 + bx, sy = 14 + by + o;
      // piernas
      if (!P.vestido) {
        pierna(b, 13 + bx, 21 + by + o, 12 + p.fL[0] + bx, fy0 - 1 + p.fL[1] + afL, pants, shoes, 'L');
        pierna(b, 17 + bx, 21 + by + o, 17 + p.fR[0] + bx, fy0 - 1 + p.fR[1] + afL, dark(pants, .1), shoes, 'R');
      } else {
        for (var r2 = 0; r2 < 9; r2++) b.rect(11 + bx - (r2 >> 2), 20 + r2 + by + o, 10 + 2 * (r2 >> 2), 1, r2 === 8 ? coatS : coat);
        b.rect(20 + bx, 20 + by + o, 1, 9, coatS);
        b.rect(11 + p.fL[0] + bx, fy0 + p.fL[1] + afL, 4, 2, shoes); b.rect(17 + p.fR[0] + bx, fy0 + p.fR[1] + afL, 4, 2, shoes);
      }
      if (P.cape && !back) { b.rect(9 + bx, 13 + by + o, 2, 12, dark(P.cape, .1)); b.rect(21 + bx, 13 + by + o, 2, 12, dark(P.cape, .1)); }
      // torso
      b.rect(11 + bx, 13 + by + o, 10, 9, coat); b.rect(20 + bx, 13 + by + o, 1, 9, coatS); b.rect(11 + bx, 13 + by + o, 1, 9, coatL);
      if (!back) {
        b.rect(14 + bx, 13 + by + o, 4, 3, P.shirt);
        if (P.cuello) b.rect(12 + bx, 13 + by + o, 8, 2, P.cuello);
        if (P.cape) b.rect(11 + bx, 13 + by + o, 10, 1, P.cape);
        b.set(15 + bx, 17 + by + o, P.acc); b.set(16 + bx, 19 + by + o, P.acc);
        if (!P.vestido) b.rect(11 + bx, 20 + by + o, 10, 1, coatS); else b.rect(11 + bx, 19 + by + o, 10, 1, P.acc);
      } else if (P.cape) { b.rect(10 + bx, 13 + by + o, 12, 13, P.cape); b.rect(10 + bx, 25 + by + o, 12, 1, dark(P.cape, .3)); b.rect(15 + bx, 14 + by + o, 1, 11, dark(P.cape, .15)); }
      // cabeza
      var hx2 = 10 + bx, hy2 = 3 + by + o + p.cabeza;
      b.rect(hx2, hy2, 12, 10, skin); b.clear(hx2, hy2); b.clear(hx2 + 11, hy2); b.clear(hx2, hy2 + 9); b.clear(hx2 + 11, hy2 + 9);
      b.rect(hx2 + 1, hy2 + 9, 10, 1, skinS);
      pelo(b, P, back ? 'up' : 'down', hx2, hy2); sombrero(b, P, back ? 'up' : 'down', hx2, hy2);
      if (!back) {
        if (P.barba) b.rect(hx2 + 2, hy2 + 7, 8, 3, P.barba);
        var e1 = hx2 + 3, e2 = hx2 + 8, ey2 = hy2 + 5;
        [e1, e2].forEach(function (ex) {
          if (p.ojos === 'open') { b.rect(ex, ey2, 1, 2, '#24162e'); }
          else if (p.ojos === 'closed') b.rect(ex - 1 + (ex === e2 ? 1 : 0), ey2 + 1, 2, 1, '#24162e');
          else { b.set(ex - 1, ey2, '#24162e'); b.set(ex + 1, ey2, '#24162e'); b.set(ex, ey2 + 1, '#24162e'); }
        });
        if (P.gafas) { b.rect(e1 - 1, ey2 - 1, 3, 1, '#2a2a3a'); b.rect(e2 - 1, ey2 - 1, 3, 1, '#2a2a3a'); b.rect(e1 + 2, ey2, 3, 1, '#2a2a3a'); }
        b.set(hx2 + 2, hy2 + 7, mix(skin, '#ff6a7a', .35)); b.set(hx2 + 9, hy2 + 7, mix(skin, '#ff6a7a', .35));
        if (!P.barba) { if (p.boca === 'o') b.rect(hx2 + 5, hy2 + 7, 2, 2, '#6a2a3a'); else if (p.boca === 'sonrisa') { b.rect(hx2 + 5, hy2 + 8, 2, 1, '#6a2a3a'); b.set(hx2 + 4, hy2 + 7, '#6a2a3a'); b.set(hx2 + 7, hy2 + 7, '#6a2a3a'); } else b.rect(hx2 + 5, hy2 + 8, 2, 1, skinS); }
        if (P.diadema) b.rect(hx2 + 1, hy2 + 1, 10, 1, P.diadema);
      }
      // brazos
      var lHx = 9 + bx + p.hL[0], lHy = 19 + by + o + p.hL[1], rHx = 21 + bx + p.hR[0], rHy = 19 + by + o + p.hR[1];
      brazo(b, sLx, sy, lHx, lHy, null, back ? coatS : coatL, skin);
      brazo(b, sRx, sy, rHx, rHy, null, coatS, skin);
      if (p.arma) arma(b, rHx, rHy, sRx, sy, P);
    }
    b.outline();
    // efectos (sin contorno, encima)
    p.fx.forEach(function (e) { efecto(b, e, P, lado, bx, by); });
    if (p.tint) b.map(function (c) { return c === OUT ? (p.tint === '#ffffff' ? '#ffffff' : dark(p.tint, .5)) : mix(c, p.tint, .65); });
    if (p.tumbado) b = b.tumbar(42);
    if (dir === 'right') b = b.mirror();
    return b;
  }

  function arma(b, hx, hy, sx, sy, P) {
    // El «compás de los alarifes»: dos patas doradas y una gema
    var dx = hx - sx, dy = hy - sy, n = Math.max(1, Math.hypot(dx, dy)), ux = dx / n, uy = dy / n;
    var tx = hx + ux * 7, ty = hy + uy * 7;
    b.line(hx, hy, tx - uy * 2, ty + ux * 2, '#f2c14e', 1);
    b.line(hx, hy, tx + uy * 2, ty - ux * 2, '#b07a1c', 1);
    b.set(hx, hy, P.magia);
  }
  function efecto(b, e, P, lado, bx, by) {
    var M = P.magia, W = '#fffbe8';
    if (e.t === 'tajo') {
      var cx = lado ? 9 + bx : 13, cy = 24 + by;
      for (var a = 0; a < 9; a++) {
        var ang = (lado ? Math.PI * .75 : Math.PI * .1) + (lado ? 1 : 1) * a * .2 + e.f * .5, r = 10 - e.f;
        b.set(cx + Math.cos(ang) * r * (lado ? -1 : 1), cy - Math.sin(ang) * r, a % 2 ? M : W);
        b.set(cx + Math.cos(ang) * (r - 1) * (lado ? -1 : 1), cy - Math.sin(ang) * (r - 1), W);
      }
    } else if (e.t === 'orbe') {
      var ox = lado ? 13 + bx : 16, oy = 5 + by;
      b.ellipse(ox, oy, e.r + 1, e.r + 1, M); b.ellipse(ox, oy, Math.max(0, e.r - 1), Math.max(0, e.r - 1), W);
    } else if (e.t === 'rayo') {
      for (var i = 0; i < 12; i++) b.set((lado ? 6 - i * .4 : 16) + (i % 2), lado ? 26 - i * .3 : 18 - i, i % 3 ? M : W);
    } else if (e.t === 'chispas') {
      for (var j = 0; j < 6; j++) { var hx = hash(j, e.f, 7), hy = hash(e.f, j, 9); b.set(4 + hx * 24, 4 + hy * 20, j % 2 ? M : '#ffe28a'); }
    } else if (e.t === 'mareo') {
      [[6, 30], [10, 28], [14, 30]].forEach(function (q) { b.set(q[0], q[1], '#ffe28a'); b.set(q[0] + 1, q[1], '#ffe28a'); b.set(q[0], q[1] - 1, '#ffffff'); });
    }
  }

  var cacheH = {};
  function hojaHeroe(id, paleta) {
    if (cacheH[id]) return cacheH[id];
    var P = paleta || heroes[id] || heroes.galois, names = Object.keys(ANIM_HEROE);
    var maxN = 8, filas = {}, row = 0;
    var cv = document.createElement('canvas'); cv.width = FW * maxN; cv.height = FH * names.length * DIRS.length;
    names.forEach(function (a) { DIRS.forEach(function (d) { filas[a + '-' + d] = row; for (var f = 0; f < ANIM_HEROE[a].n; f++) dibujarHeroe(P, a, f, d).toCanvas(cv, f * FW, row * FH); row++; }); });
    return (cacheH[id] = { canvas: cv, fw: FW, fh: FH, filas: filas, anims: ANIM_HEROE, pie: 42 });
  }

  /* =====================================================================
     ENEMIGOS (cuerpo, símbolo y ataque propios de cada concepto)
     ===================================================================== */
  var enemigos = {
    potenciator:       { forma: 'bloque', c: '#f2b632', g: 'an', ataque: ['2^', '3^', 'a^'], brazos: true },
    radicosmico:       { forma: 'espina', c: '#7a4fd0', g: 'v', ataque: ['v9', 'v4', 'v16'] },
    multiplax:         { forma: 'espina', c: '#d9483b', g: '*', ataque: ['*2', '*3', '12'] },
    primox:            { forma: 'espina', c: '#8a49c9', g: 'P', ataque: ['2', '3', '5', '7'] },
    negatron:          { forma: 'iman', c: '#d8423f', c2: '#3f6fd8', g: '-', ataque: ['-', '-3', '-7'] },
    parentesis_maldito:{ forma: 'parentesis', c: '#e0a53a', g: '()', ataque: ['(', ')', '-('] },
    denominadoron:     { forma: 'bloque', c: '#4fb0a8', g: '/', ataque: ['1/2', '3/4', '/'] , brazos: true },
    simplifract:       { forma: 'bola', c: '#f0c03c', g: '/', ataque: ['6/8', '2/4', '='] },
    senor_escala:      { forma: 'bloque', c: '#c88f52', g: ':', ataque: ['1:5', ':', 'x2'], brazos: true },
    porcentajin:       { forma: 'bola', c: '#57c25a', g: '%', ataque: ['%', '25%', '50%'] },
    incognita_x:       { forma: 'espectro', c: '#4a5ad8', g: 'x', ataque: ['x', '2x', 'x?'] },
    polinomio_mutante: { forma: 'gota', c: '#6fbf3a', g: 'x', ataque: ['x+1', '3x', '2x'] },
    equilibrius:       { forma: 'balanza', c: '#d0b45a', g: '=', ataque: ['=', '+3', '-3'] },
    despejador_oscuro: { forma: 'espectro', c: '#3a2a5a', g: '=', ataque: ['x=', '=', '-2'] },
    pendientor:        { forma: 'grafica', c: '#3aa0d8', g: '/', ataque: ['y', '/', 'm'] },
    parabola_vortice:  { forma: 'gota', c: '#d84fa0', g: 'y', ataque: ['x^', 'y', 'f'] },
    mediana_traviesa:  { forma: 'grafica', c: '#e07a3a', g: 'M', ataque: ['M', '3', '5'] },
    grafico_tramposo:  { forma: 'grafica', c: '#c43a6a', g: '?', ataque: ['?', '95', '%'] },
    dado_caotico:      { forma: 'dado', c: '#f4efe6', g: '', ataque: ['1', '6', '?'] },
    ruleta_imposible:  { forma: 'ruleta', c: '#c8323a', c2: '#202030', g: '', ataque: ['0', '1/2', 'p'] }
  };
  var ANIM_ENEMIGO = { idle: { n: 4, fps: 5, loop: true }, move: { n: 4, fps: 8, loop: true }, attack: { n: 6, fps: 10, loop: false }, hurt: { n: 3, fps: 9, loop: false }, defeat: { n: 6, fps: 8, loop: false } };

  function poseEnemigo(anim, f) {
    var q = { ox: 0, oy: 0, sx: 1, sy: 1, ojos: 'open', boca: 'n', pies: [0, 0], tint: null, disolver: 0, chispas: false, brazo: 0, proyectil: null };
    if (anim === 'idle') { q.sy = [1, .96, .92, .96][f]; q.sx = [1, 1.02, 1.05, 1.02][f]; if (f === 3) q.ojos = 'closed'; q.brazo = [0, 1, 2, 1][f]; }
    if (anim === 'move') { q.oy = [0, -3, -4, -1][f]; q.sy = [.88, 1.06, 1.04, .94][f]; q.sx = [1.1, .96, .98, 1.04][f]; q.pies = [[0, 0], [-1, 1], [0, 0], [1, -1]][f]; q.brazo = f; }
    if (anim === 'attack') {
      var A = [[2, 2, 1.12, .84], [5, 0, .92, 1.08], [-6, -1, 1.08, .95], [-8, 0, 1.12, .92], [-3, 0, 1, 1], [0, 0, 1, 1]][f];
      q.ox = A[0]; q.oy = A[1]; q.sx = A[2]; q.sy = A[3]; q.boca = f >= 2 && f <= 3 ? 'abierta' : 'n'; q.ojos = 'furia'; q.brazo = f === 1 ? 3 : f >= 2 && f <= 3 ? -2 : 0;
      if (f >= 3 && f <= 4) q.proyectil = f - 3;
    }
    if (anim === 'hurt') { q.tint = ['#ffffff', '#ff5050', null][f]; q.ox = [2, 4, 1][f]; q.sx = [1.12, .94, 1][f]; q.sy = [.86, 1.06, 1][f]; q.ojos = 'closed'; q.boca = 'abierta'; }
    if (anim === 'defeat') {
      q.ojos = 'x'; q.boca = 'abierta'; q.sx = [1.1, .85, .8, .78, .72, .66][f]; q.sy = [.9, 1.15, .82, .78, .72, .66][f];
      q.oy = [0, -2, 2, 3, 4, 5][f]; q.tint = f === 0 ? '#ffffff' : null; q.disolver = [0, 0, 0, .3, .6, .85][f]; q.chispas = f >= 3;
    }
    return q;
  }

  function cuerpoEnemigo(b, E, q, W, H, cx, base, fase) {
    var c = E.c, cs = dark(c, .32), cl = light(c, .3);
    var w = Math.round(W * q.sx), h = Math.round(H * q.sy), x0 = Math.round(cx - w / 2 + q.ox), y0 = Math.round(base - h + q.oy);
    var ecx = x0 + w / 2, ecy = y0 + h / 2;
    // pies
    var fcol = dark(c, .55);
    if (E.forma !== 'espectro' && E.forma !== 'ruleta') { b.rect(Math.round(ecx - w / 4 - 2 + q.pies[0]), base - 2 + q.oy, 4, 3, fcol); b.rect(Math.round(ecx + w / 4 - 2 + q.pies[1]), base - 2 + q.oy, 4, 3, fcol); }
    switch (E.forma) {
      case 'bloque':
        b.rect(x0, y0, w, h - 2, c); b.rect(x0, y0 + h - 4, w, 2, cs); b.rect(x0 + 1, y0 + 1, w - 2, 1, cl); b.clear(x0, y0); b.clear(x0 + w - 1, y0);
        break;
      case 'bola':
        b.ellipse(Math.round(ecx), Math.round(ecy), Math.round(w / 2), Math.round(h / 2) - 1, c);
        b.ellipse(Math.round(ecx), Math.round(ecy) + Math.round(h / 4), Math.round(w / 2) - 2, Math.round(h / 5), cs);
        b.ellipse(Math.round(ecx), Math.round(ecy), Math.round(w / 2) - 2, Math.round(h / 2) - 4, c);
        b.rect(Math.round(ecx - w / 4), y0 + 3, 3, 2, cl);
        break;
      case 'espina':
        var r = Math.round(Math.min(w, h) / 2) - 2;
        for (var k = 0; k < 10; k++) { var a = k / 10 * Math.PI * 2 + (fase || 0) * .3; b.line(ecx + Math.cos(a) * r, ecy + Math.sin(a) * r, ecx + Math.cos(a) * (r + 4), ecy + Math.sin(a) * (r + 4), k % 2 ? cl : cs, 2); }
        b.ellipse(Math.round(ecx), Math.round(ecy), r, r, c); b.ellipse(Math.round(ecx) + 1, Math.round(ecy) + 2, r - 2, r - 3, c);
        b.rect(Math.round(ecx - r / 2), Math.round(ecy - r / 2) - 1, 3, 2, cl);
        break;
      case 'iman':
        var t = Math.max(5, Math.round(w / 4));
        b.rect(x0, y0 + 4, t, h - 8, c); b.rect(x0 + w - t, y0 + 4, t, h - 8, E.c2);
        b.ellipse(Math.round(ecx), y0 + h - 7, Math.round(w / 2), 6, c); for (var yy = y0 + h - 13; yy < y0 + h; yy++) for (var xx = Math.round(ecx); xx < x0 + w; xx++) if (b.get(xx, yy) === c) b.set(xx, yy, E.c2);
        b.ellipse(Math.round(ecx), y0 + h - 8, Math.round(w / 2) - t, 3, null);
        for (var yy2 = y0 + h - 11; yy2 < y0 + h - 5; yy2++) for (var xx2 = x0 + t; xx2 < x0 + w - t; xx2++) b.clear(xx2, yy2);
        b.rect(x0, y0, t, 4, '#f2efe6'); b.rect(x0 + w - t, y0, t, 4, '#f2efe6');
        break;
      case 'parentesis':
        for (var s = 0; s < 2; s++) { var px = s ? x0 + w - 7 : x0; for (var j = 0; j < h; j++) { var off = Math.round(Math.sin(j / h * Math.PI) * 4); b.rect(s ? px - off + 4 : px + off - 0, y0 + j, 4, 1, s ? cs : c); } }
        b.ellipse(Math.round(ecx), Math.round(ecy), Math.round(w / 4), Math.round(h / 4), dark(c, .1));
        break;
      case 'espectro':
        b.ellipse(Math.round(ecx), y0 + Math.round(w / 2), Math.round(w / 2), Math.round(w / 2), c);
        b.rect(x0, y0 + Math.round(w / 2), w, h - Math.round(w / 2) - 2, c);
        for (var i = 0; i < w; i++) if ((i + (fase || 0) * 2) % 6 < 3) b.set(x0 + i, y0 + h - 2, c); else b.clear(x0 + i, y0 + h - 3);
        b.rect(x0 + 2, y0 + 3, w - 4, Math.round(w / 2), dark(c, .55));
        break;
      case 'gota':
        b.ellipse(Math.round(ecx), Math.round(ecy) + 3, Math.round(w / 2), Math.round(h / 2) - 3, c);
        for (var g = 0; g < 6; g++) b.rect(Math.round(ecx - 3 + g / 2), y0 + g, 6 - g, 1, c);
        b.rect(x0 + 2, y0 + h - 5, 3, 3, c); b.rect(x0 + w - 5, y0 + h - 4, 3, 2, c);
        b.rect(Math.round(ecx - w / 4), Math.round(ecy) - 2, 3, 2, cl);
        break;
      case 'balanza':
        b.rect(Math.round(ecx) - 1, y0 + 4, 3, h - 6, cs); b.rect(Math.round(ecx) - 6, y0 + h - 4, 12, 3, cs);
        var tilt = q.brazo % 2 ? 1 : -1; b.line(x0, y0 + 5 + tilt, x0 + w, y0 + 5 - tilt, c, 2);
        b.ellipse(x0 + 3, y0 + 13 + tilt, 5, 2, c); b.ellipse(x0 + w - 3, y0 + 13 - tilt, 5, 2, c);
        b.line(x0 + 3, y0 + 6 + tilt, x0 + 3, y0 + 11 + tilt, cs); b.line(x0 + w - 3, y0 + 6 - tilt, x0 + w - 3, y0 + 11 - tilt, cs);
        b.ellipse(Math.round(ecx), y0 + 3, 5, 5, c);
        break;
      case 'grafica':
        var bars = [.5, .8, .35, 1], bw = Math.floor((w - 2) / 4);
        b.rect(x0, y0 + h - 3, w, 2, cs);
        for (var m = 0; m < 4; m++) { var bh = Math.round((h - 6) * bars[(m + (q.brazo | 0)) % 4]); b.rect(x0 + 1 + m * bw, y0 + h - 3 - bh, bw - 1, bh, m % 2 ? c : cl); }
        b.rect(x0 + 2, y0 + 3, w - 4, 11, light(c, .55));
        break;
      case 'dado':
        b.rect(x0, y0 + 2, w, h - 4, c); b.rect(x0 + 2, y0, w - 4, h, c); b.rect(x0, y0 + h - 5, w, 3, '#c9c2b4'); b.rect(x0 + 2, y0 + 1, w - 6, 1, '#ffffff');
        [[.25, .3], [.75, .3], [.25, .7], [.75, .7]].forEach(function (d, i2) { if ((i2 + (fase || 0)) % 4 !== 3 || true) b.rect(Math.round(x0 + w * d[0]) - 1, Math.round(y0 + h * d[1]) + 2, 3, 3, i2 === 0 ? '#d83a3a' : '#2a2030'); });
        break;
      case 'ruleta':
        var R = Math.round(Math.min(w, h) / 2), rot = (q.brazo || 0) * .4;
        for (var yy3 = -R; yy3 <= R; yy3++) for (var xx3 = -R; xx3 <= R; xx3++) { var d2 = xx3 * xx3 + yy3 * yy3; if (d2 <= R * R) { var an = Math.atan2(yy3, xx3) + rot; var seg = Math.floor(((an / (Math.PI * 2)) + 1) * 8) % 2; b.set(ecx + xx3, ecy + yy3, d2 > (R - 2) * (R - 2) ? '#d9a441' : seg ? E.c : E.c2); } }
        b.ellipse(Math.round(ecx), Math.round(ecy), 3, 3, '#d9a441');
        b.rect(Math.round(ecx) - 3, base - 3 + q.oy, 7, 3, '#5a3a24');
        break;
    }
    return { x0: x0, y0: y0, w: w, h: h, cx: ecx, cy: ecy };
  }

  function caraEnemigo(b, q, G, E) {
    var ey = Math.round(G.y0 + Math.max(5, G.h * .22)), ex1 = Math.round(G.cx - 5), ex2 = Math.round(G.cx + 2);
    if (E.forma === 'grafica') ey = G.y0 + 6;
    if (E.forma === 'espectro') ey = G.y0 + 6;
    if (E.forma === 'ruleta') return;
    var white = '#fffbe8', pup = '#1a1124';
    [ex1, ex2].forEach(function (ex, i) {
      if (q.ojos === 'closed') b.rect(ex, ey + 1, 3, 1, pup);
      else if (q.ojos === 'x') { b.set(ex, ey, pup); b.set(ex + 2, ey, pup); b.set(ex + 1, ey + 1, pup); b.set(ex, ey + 2, pup); b.set(ex + 2, ey + 2, pup); }
      else { b.rect(ex, ey, 3, 3, white); b.rect(ex + (i ? 0 : 0), ey + 1, 2, 2, E.forma === 'espectro' ? '#ffe04a' : pup); if (E.forma === 'espectro') b.rect(ex, ey, 3, 3, '#ffe04a'); }
      // cejas enfadadas
      if (q.ojos !== 'x') { if (i === 0) b.line(ex - 1, ey - 2, ex + 2, ey - 1, pup); else b.line(ex, ey - 1, ex + 3, ey - 2, pup); }
      if (q.ojos === 'furia') b.set(ex + 1, ey + 1, '#ff3a3a');
    });
    var my = ey + 4;
    if (E.forma === 'dado' || E.forma === 'grafica') my = ey + 4;
    if (q.boca === 'abierta') { b.rect(Math.round(G.cx - 3), my, 6, 3, '#4a1020'); b.rect(Math.round(G.cx - 2), my, 1, 1, white); b.rect(Math.round(G.cx + 1), my, 1, 1, white); }
    else { b.rect(Math.round(G.cx - 2), my + 1, 5, 1, pup); b.set(Math.round(G.cx - 3), my, pup); b.set(Math.round(G.cx + 3), my, pup); }
  }

  function dibujarEnemigo(id, anim, f, opt) {
    opt = opt || {};
    var E0 = enemigos[id] || enemigos.primox, E = Object.assign({}, E0);
    var fase = opt.fase || 1, jefe = !!opt.jefe;
    if (jefe && fase === 2) E.c = mix(E.c, '#ff3a2a', .35);
    if (jefe && fase === 3) E.c = mix(E.c, '#2a0a3a', .45);
    var S = jefe ? 64 : 40, base = S - 3;
    var b = new Buf(S, S), q = poseEnemigo(anim, f);
    var W = jefe ? 38 : 24, H = jefe ? 38 : 24;
    if (E.forma === 'espectro' || E.forma === 'balanza') H += jefe ? 6 : 4;
    var G = cuerpoEnemigo(b, E, q, W, H, S / 2, base, f);
    // brazos (los que los tienen)
    if (E.brazos) {
      var ay = Math.round(G.y0 + G.h / 2), sw = q.brazo;
      b.line(G.x0 - 1, ay, G.x0 - 5, ay - 2 - sw, dark(E.c, .45), 2); b.rect(G.x0 - 7, ay - 4 - sw, 3, 3, light(E.c, .2));
      b.line(G.x0 + G.w, ay, G.x0 + G.w + 4, ay - 2 + sw, dark(E.c, .45), 2); b.rect(G.x0 + G.w + 4, ay - 4 + sw, 3, 3, light(E.c, .2));
    }
    // símbolo matemático en el cuerpo
    if (E.g) {
      var k = jefe ? 2 : 1, gw = anchoTexto(E.g, k), gy = Math.round(G.y0 + G.h - 5 * k - (E.forma === 'bloque' ? 5 : E.forma === 'bola' || E.forma === 'gota' ? 4 : 3) * k);
      if (E.forma === 'espectro') gy = G.y0 + G.h - 9 * k;
      if (E.forma === 'grafica') gy = G.y0 + 15 * k;
      if (E.forma === 'iman' || E.forma === 'balanza') gy = G.y0 - 1;
      texto(b, E.g, Math.round(G.cx - gw / 2), Math.round(gy), E.forma === 'bloque' || E.forma === 'bola' ? '#2a1a20' : '#fffbe8', k);
    }
    caraEnemigo(b, q, G, E);
    if (jefe) { // corona del jefe
      var cx = Math.round(G.cx), cy = G.y0 - 5;
      b.rect(cx - 7, cy + 2, 15, 3, '#f2c14e'); [-7, -3, 1, 5].forEach(function (d, i) { b.rect(cx + d, cy - (i % 2 ? 2 : 0), 3, 3, '#f2c14e'); });
      b.set(cx - 2, cy + 3, '#d83a3a'); b.set(cx + 2, cy + 3, '#3a8ad8');
      if (fase >= 2) { b.line(G.x0 - 2, G.y0 + 4, G.x0 - 6, G.y0 - 4, '#ffefe0', 2); b.line(G.x0 + G.w + 1, G.y0 + 4, G.x0 + G.w + 5, G.y0 - 4, '#ffefe0', 2); }
    }
    b.outline();
    if (jefe && fase >= 2) { for (var i = 0; i < 14; i++) { var a = i / 14 * Math.PI * 2 + f * .4, rr = S / 2 - 3 - (i % 3); b.set(S / 2 + Math.cos(a) * rr, S / 2 + 2 + Math.sin(a) * rr * .8, fase === 3 ? '#c06aff' : '#ff8a3a'); } }
    if (q.proyectil !== null && E.ataque) { var tok = E.ataque[f % E.ataque.length]; texto(b, tok, Math.round(G.x0 - 4 - q.proyectil * 6 - anchoTexto(tok)), Math.round(G.cy - 3), '#fffbe8'); }
    if (q.tint) b.map(function (c) { return mix(c, q.tint, .7); });
    if (q.disolver) b.map(function (c, i) { return hash(i % S, (i / S) | 0, 3) < q.disolver ? null : c; });
    if (q.chispas) for (var j = 0; j < 10; j++) b.set(hash(j, f, 1) * S, hash(f, j, 2) * S, j % 2 ? '#ffe28a' : '#ffffff');
    return b;
  }

  var cacheE = {};
  function hojaEnemigo(id, opt) {
    opt = opt || {}; var key = id + (opt.jefe ? ':j' + (opt.fase || 1) : '');
    if (cacheE[key]) return cacheE[key];
    var names = Object.keys(ANIM_ENEMIGO), S = opt.jefe ? 64 : 40, filas = {};
    var cv = document.createElement('canvas'); cv.width = S * 6; cv.height = S * names.length;
    names.forEach(function (a, row) { filas[a + '-left'] = row; for (var f = 0; f < ANIM_ENEMIGO[a].n; f++) dibujarEnemigo(id, a, f, opt).toCanvas(cv, f * S, row * S); });
    return (cacheE[key] = { canvas: cv, fw: S, fh: S, filas: filas, anims: ANIM_ENEMIGO, pie: S - 3 });
  }

  /* ---------- Reproducción ---------- */
  function indice(hoja, anim, t) {
    var A = hoja.anims[anim]; if (!A) return 0;
    var i = Math.floor(t * A.fps);
    return A.loop ? i % A.n : Math.min(i, A.n - 1);
  }
  function pintar(ctx, hoja, anim, dir, i, x, y, k) {
    var row = hoja.filas[anim + '-' + dir]; if (row == null) row = hoja.filas[anim + '-left'] || 0;
    k = k || 1;
    ctx.drawImage(hoja.canvas, i * hoja.fw, row * hoja.fh, hoja.fw, hoja.fh, Math.round(x - hoja.fw * k / 2), Math.round(y - hoja.pie * k), hoja.fw * k, hoja.fh * k);
  }
  function duracion(hoja, anim) { var A = hoja.anims[anim]; return A ? A.n / A.fps : 0; }

  root.GaloisSprites = {
    Buf: Buf, mix: mix, dark: dark, light: light, hash: hash, texto: texto, anchoTexto: anchoTexto, OUT: OUT,
    heroes: heroes, enemigos: enemigos, ANIM_HEROE: ANIM_HEROE, ANIM_ENEMIGO: ANIM_ENEMIGO, DIRS: DIRS,
    dibujarHeroe: dibujarHeroe, dibujarEnemigo: dibujarEnemigo, hojaHeroe: hojaHeroe, hojaEnemigo: hojaEnemigo,
    indice: indice, pintar: pintar, duracion: duracion
  };
})(window);
