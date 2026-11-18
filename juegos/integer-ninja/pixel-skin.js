/* =====================================================================
   πCHU ROYALE · capa pixel art para Integer Ninja
   ---------------------------------------------------------------------
   Solo cambia el ASPECTO. No toca reglas, preguntas, niveles ni puntos.

   1. El lienzo se dibuja a menor resolución y el navegador lo amplía
      sin suavizar (image-rendering: pixelated). Las coordenadas del juego
      siguen en píxeles CSS, así que los cortes y colisiones no cambian.
   2. Las ilustraciones del DOM (πCHU, guardianes) se reducen a una
      rejilla pequeña y se amplían en bloques, como un sprite de 16 bits.

   Para desactivar la capa: quitar las dos líneas que cargan
   pixel-skin.css y pixel-skin.js en index.html.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- 1. Lienzo pixelado ---------- */
  // Tamaño del "píxel" del juego en píxeles CSS.
  //   1 = lienzo a resolución CSS (en móviles/tabletas con pantalla densa
  //       se ve en bloques; las etiquetas pequeñas de la recta siguen legibles).
  //   2 = aspecto retro más marcado, pero los números pequeños de la recta
  //       numérica (−10 … +10) dejan de leerse bien en el móvil.
  var PIXEL = 1;
  try {
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      get: function () { return 1 / PIXEL; }
    });
  } catch (e) { /* navegador sin soporte: el juego se ve igual que antes */ }

  /* ---------- 2. Ilustraciones del DOM en pixel art ---------- */
  var GRID = 72;               // resolución máxima del sprite reducido
  var done = new WeakMap();    // img -> src ya pixelado (evita bucles)
  var SELECTOR = '.pichu-img, .lv-enemy, #introEnemyImg';

  function pixelate(img) {
    if (!img || !img.src || done.get(img) === img.src) return;
    var src = img.src;
    var run = function () {
      if (img.src !== src || !img.naturalWidth) return;
      var w = img.naturalWidth, h = img.naturalHeight;
      var k = GRID / Math.max(w, h);
      if (k >= 1) { done.set(img, src); return; }
      var cw = Math.max(1, Math.round(w * k)), ch = Math.max(1, Math.round(h * k));
      var c = document.createElement('canvas');
      c.width = cw; c.height = ch;
      var x = c.getContext('2d');
      x.imageSmoothingEnabled = true;
      x.drawImage(img, 0, 0, cw, ch);
      // Alfa binaria: bordes nítidos, sin semitransparencias "borrosas"
      try {
        var d = x.getImageData(0, 0, cw, ch), p = d.data;
        for (var i = 3; i < p.length; i += 4) p[i] = p[i] < 110 ? 0 : 255;
        x.putImageData(d, 0, 0);
      } catch (e) { /* imagen de otro origen: se deja sin binarizar */ }
      var out = c.toDataURL('image/png');
      done.set(img, out);
      img.src = out;
      img.classList.add('px-done');
    };
    if (img.complete && img.naturalWidth) run(); else img.addEventListener('load', run, { once: true });
  }

  function scan(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.matches && root.matches(SELECTOR)) pixelate(root);
    root.querySelectorAll(SELECTOR).forEach(pixelate);
  }

  function start() {
    scan(document.body);
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        if (m.type === 'attributes') { if (m.target.matches && m.target.matches(SELECTOR)) pixelate(m.target); }
        else m.addedNodes.forEach(scan);
      });
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
