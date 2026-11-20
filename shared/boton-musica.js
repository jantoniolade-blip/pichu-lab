/* =========================================================
   GALOIS LEGACY · boton-musica.js
   Añade a cualquier juego la insignia pixel «♪» para encender
   o apagar la música de fondo, igual que volver.js añade «◀ Mapa».
   Va abajo a la derecha; volver.js va abajo a la izquierda.

   En cada juego basta con estas dos líneas (en este orden):
     <script src="../../shared/musica.js"></script>
     <script src="../../shared/boton-musica.js" defer></script>

   Sus estilos viven en un Shadow DOM, así no chocan con el CSS
   del juego ni el juego con ellos. No guarda nada: del ajuste
   «musica» se encarga shared/musica.js.
   ========================================================= */
(function () {
  "use strict";
  if (!window.Musica) return;                       // sin musica.js no hay nada que encender

  const anfitrion = document.createElement("div");
  anfitrion.id = "pichu-musica";
  anfitrion.style.cssText = "position:fixed;right:13px;bottom:13px;z-index:2147483000;";
  const sombra = anfitrion.attachShadow({ mode: "open" });
  const o = "#E8B53A";   // oro
  sombra.innerHTML = `
    <style>
      button{display:inline-flex;align-items:center;gap:.4em;min-height:44px;min-width:44px;padding:.2em .8em;margin:3px;
        background:#16122C;color:#F3ECD6;border:0;border-radius:0;font:700 16px/1 GaloisPixel,"Lato",system-ui,sans-serif;
        cursor:pointer;opacity:.92;
        box-shadow:0 -3px 0 ${o},0 3px 0 ${o},-3px 0 0 ${o},3px 0 0 ${o},0 7px 0 rgba(0,0,0,.45),inset -3px -3px 0 rgba(0,0,0,.35)}
      button:hover,button:focus-visible{opacity:1;background:#4A3290}
      button:active{transform:translateY(3px);box-shadow:0 -3px 0 ${o},0 3px 0 ${o},-3px 0 0 ${o},3px 0 0 ${o}}
      button:focus-visible{outline:3px solid #FFE08A;outline-offset:6px}
      .nota{color:#FFE08A;font-size:19px}
      @media (max-width:600px){button{padding:.2em .45em;justify-content:center}.txt{display:none}}
      @media print{button{display:none}}
    </style>
    <button type="button" aria-pressed="true"><span class="nota" aria-hidden="true">♪</span><span class="txt">Música</span></button>`;

  const b = sombra.querySelector("button"), nota = sombra.querySelector(".nota");
  function pintar() {
    const si = Musica.encendida();
    nota.textContent = si ? "♪" : "🔇";
    b.setAttribute("aria-pressed", String(si));
    b.setAttribute("aria-label", si ? "Música de fondo encendida" : "Música de fondo apagada");
    b.title = si ? "Quitar la música" : "Poner la música";
  }
  b.addEventListener("click", () => { Musica.alternar(); pintar(); });
  pintar();

  const poner = () => document.body && document.body.appendChild(anfitrion);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", poner); else poner();
})();
