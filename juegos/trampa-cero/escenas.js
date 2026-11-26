"use strict";
/* Trampa Cero · Fondos y objetos ilustrados (SVG original).
   Todos los fondos usan viewBox 400×300 (4:3). */

const K = "#2a1e2e";            // tinta
const L = `stroke="${K}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;
const l = `stroke="${K}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"`;

function svg(body, extra = "") {
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" ${extra}>${body}</svg>`;
}

/* Pequeñas piezas reutilizables */
function casita(x, y, w, h, techo = "#c4553b", zocalo = "#e7b64a") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fffaf0" ${l}/>
    <path d="M${x - 2} ${y} L${x + w / 2} ${y - h * .28} L${x + w + 2} ${y} Z" fill="${techo}" ${l}/>
    <rect x="${x}" y="${y + h - 5}" width="${w}" height="5" fill="${zocalo}" ${l}/>`;
}
function torre(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-9" y="0" width="18" height="46" fill="#fff6e2" ${l}/>
    <rect x="-11" y="-14" width="22" height="16" fill="#f3e2bd" ${l}/>
    <path d="M-5 -10 v8 M5 -10 v8" ${l}/>
    <path d="M-11 -14 L0 -30 L11 -14 Z" fill="#7aa3b8" ${l}/>
    <path d="M0 -30 v-7 M-3 -34 h6" ${l}/></g>`;
}
function banderines(y, colores = ["#e0483e", "#f2b632", "#3b8fc4", "#5aa65a", "#c45bb0"]) {
  let s = `<path d="M-5 ${y} Q100 ${y + 18} 200 ${y + 4} T405 ${y + 6}" fill="none" ${l}/>`;
  for (let i = 0; i < 17; i++) {
    const x = i * 25 + 4, yy = y + 6 + Math.sin(i * .7) * 4 + (i > 3 && i < 13 ? 6 : 0);
    s += `<path d="M${x} ${yy} l12 0 l-6 13 Z" fill="${colores[i % colores.length]}" ${l}/>`;
  }
  return s;
}
function confeti(n = 60, semilla = 3) {
  let s = "", r = semilla;
  const c = ["#e0483e", "#f2b632", "#3b8fc4", "#5aa65a", "#c45bb0", "#fff"];
  for (let i = 0; i < n; i++) {
    r = (r * 9301 + 49297) % 233280;
    const x = (r / 233280) * 400;
    r = (r * 9301 + 49297) % 233280;
    const y = (r / 233280) * 300;
    s += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="4" height="2.4" fill="${c[i % c.length]}" transform="rotate(${(i * 37) % 180} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return s;
}
function maceta(x, y) {
  return `<path d="M${x - 9} ${y} h18 l-3 14 h-12 Z" fill="#c4553b" ${l}/>
    <circle cx="${x - 5}" cy="${y - 5}" r="6" fill="#5aa65a" ${l}/><circle cx="${x + 5}" cy="${y - 6}" r="6" fill="#4b9550" ${l}/>
    <circle cx="${x}" cy="${y - 10}" r="3" fill="#e0483e" ${l}/>`;
}

/* ---------- FONDOS ---------- */
const FONDOS = {
  aula(op = {}) {
    let azulejos = "";
    for (let x = 0; x < 400; x += 16) {
      azulejos += `<rect x="${x}" y="196" width="16" height="16" fill="${(x / 16) % 2 ? "#2f5d8c" : "#fbf5ea"}" ${l}/>
        <circle cx="${x + 8}" cy="204" r="3" fill="${(x / 16) % 2 ? "#f2b632" : "#2f5d8c"}"/>`;
    }
    let tablas = "";
    for (let y = 222; y < 300; y += 16) tablas += `<path d="M0 ${y} H400" stroke="#9d6334" stroke-width="1.4"/>`;
    return svg(`
      <rect width="400" height="300" fill="#f4e7cc"/>
      <rect width="400" height="12" fill="#e5cfa4"/>
      <!-- ventana con vista del pueblo -->
      <rect x="10" y="36" width="64" height="110" rx="3" fill="#a8dcf0" ${L}/>
      ${casita(14, 112, 22, 30)}${casita(40, 104, 26, 38, "#b9472f", "#3b8fc4")}
      ${torre(56, 70, .8)}
      <path d="M42 36 v110 M10 90 h64" ${L}/>
      <rect x="6" y="144" width="72" height="7" fill="#fffaf0" ${L}/>
      <!-- pizarra -->
      <rect x="88" y="32" width="226" height="124" rx="4" fill="#8a5a33" ${L}/>
      <rect x="96" y="40" width="210" height="108" fill="${op.pizarra || "#2f5b47"}" ${l}/>
      <path d="M104 52 q30 -4 50 2 M260 136 q20 3 38 -2" stroke="#ffffff22" stroke-width="3" fill="none"/>
      <rect x="110" y="156" width="182" height="7" fill="#a46c3e" ${l}/>
      <rect x="128" y="151" width="14" height="5" fill="#fffaf0" ${l}/><rect x="150" y="151" width="10" height="5" fill="#f2b632" ${l}/>
      <!-- placa del instituto -->
      <rect x="124" y="13" width="154" height="16" rx="3" fill="#fffaf0" ${l}/>
      <text x="201" y="24.5" text-anchor="middle" font-family="Baloo 2, Trebuchet MS, sans-serif" font-weight="800" font-size="8.6" fill="${K}">IES ALARIFES RUIZ FLORINDO</text>
      <!-- reloj y corcho -->
      <circle cx="350" cy="44" r="16" fill="#fffaf0" ${L}/><path d="M350 44 v-10 M350 44 l7 4" ${L}/>
      <rect x="326" y="74" width="62" height="74" rx="3" fill="#c9915a" ${L}/>
      <rect x="333" y="82" width="20" height="18" fill="#f2b632" ${l} transform="rotate(-6 343 91)"/>
      <rect x="358" y="84" width="22" height="16" fill="#9fd3ea" ${l} transform="rotate(5 369 92)"/>
      <rect x="336" y="110" width="24" height="26" fill="#fffaf0" ${l}/>
      <path d="M340 117 h16 M340 123 h12 M340 129 h14" ${l}/>
      <rect x="364" y="112" width="18" height="18" fill="#e9a3c9" ${l}/>
      ${azulejos}
      <rect y="212" width="400" height="88" fill="#c98b4e"/>
      ${tablas}
      <path d="M0 212 H400" ${L}/>
      ${op.sinMesa ? "" : `<!-- mesa del profe -->
      <rect x="14" y="228" width="104" height="12" fill="#a46c3e" ${L}/>
      <path d="M22 240 v40 M110 240 v40" ${L}/>
      <rect x="28" y="216" width="26" height="12" fill="#3b8fc4" ${l}/><rect x="31" y="210" width="22" height="7" fill="#e0483e" ${l}/>
      <path d="M90 228 v-14 h12 v14" fill="#fffaf0" ${l}/>`}
    `);
  },

  fuente(op = {}) {
    const helada = !!op.helada;
    const agua = helada ? "#d4f1fb" : "#5fb4d6";
    let chorros = "";
    [150, 200, 250].forEach(x => {
      chorros += `<rect x="${x - 4}" y="150" width="8" height="12" rx="2" fill="#b98b4a" ${l}/>`;
      chorros += helada
        ? `<path d="M${x - 3} 162 l3 18 l3 -18 Z" fill="#eafaff" ${l}/>`
        : `<path d="M${x} 162 q4 18 3 40" stroke="#5fb4d6" stroke-width="5" fill="none"/><path d="M${x} 162 q4 18 3 40" stroke="#ffffffaa" stroke-width="1.5" fill="none"/>`;
    });
    let sillares = "";
    for (let y = 110; y < 200; y += 15) for (let x = 84 + ((y / 15) % 2) * 14; x < 316; x += 28)
      sillares += `<rect x="${x}" y="${y}" width="28" height="15" fill="none" stroke="#b49a72" stroke-width="1"/>`;
    return svg(`
      <defs><linearGradient id="cieloF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${helada ? "#b9d6ea" : "#8fd0f0"}"/><stop offset="1" stop-color="#e8f6fb"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#cieloF)"/>
      ${helada ? `<circle cx="340" cy="46" r="18" fill="#fffaf0" opacity=".8"/>` : `<circle cx="340" cy="46" r="18" fill="#ffd75e" ${l}/>`}
      ${casita(0, 120, 44, 70)}${casita(356, 118, 50, 72, "#b9472f")}${torre(30, 60, .9)}
      <!-- muro de la fuente -->
      <path d="M80 210 V110 Q200 40 320 110 V210 Z" fill="#dcc7a2" ${L}/>
      ${sillares}
      <path d="M80 110 Q200 40 320 110" fill="none" ${L}/>
      <path d="M96 110 Q200 56 304 110" fill="none" stroke="#b49a72" stroke-width="2"/>
      <!-- escudo -->
      <path d="M186 80 h28 v18 q0 12 -14 18 q-14 -6 -14 -18 Z" fill="#c4553b" ${L}/>
      <path d="M200 84 v26 M190 94 h20" stroke="#f2b632" stroke-width="3"/>
      <rect x="150" y="122" width="100" height="16" rx="2" fill="#f4ead6" ${l}/>
      <text x="200" y="133.5" text-anchor="middle" font-family="Baloo 2, Trebuchet MS, sans-serif" font-weight="800" font-size="8.5" fill="${K}">FUENTE DE LA REINA</text>
      ${chorros}
      <!-- pilar (abrevadero) -->
      <rect x="40" y="200" width="320" height="52" fill="#cdb48c" ${L}/>
      <rect x="48" y="204" width="304" height="12" fill="${agua}" ${l}/>
      ${helada ? `<path d="M70 208 l14 4 l10 -5 M180 206 l8 6 l14 -3 M290 210 l12 -4 l9 5" stroke="#8cc3d8" stroke-width="1.5" fill="none"/>` : `<path d="M60 210 q8 -3 16 0 M170 209 q8 -3 16 0 M280 210 q8 -3 16 0" stroke="#fff" stroke-width="1.4" fill="none"/>`}
      <rect y="252" width="400" height="48" fill="#e6c47c"/>
      <path d="M0 252 H400" ${L}/>
      <path d="M30 270 q10 -3 20 0 M300 284 q12 -3 24 0 M150 290 q10 -3 20 0" stroke="#c7a25a" stroke-width="2" fill="none"/>
      ${maceta(22, 238)}${maceta(378, 238)}
      ${helada ? `<path d="M0 0 h400 v6 q-10 8 -20 0 q-10 10 -20 0 q-10 7 -20 0 q-10 9 -20 0 q-10 8 -20 0 q-10 10 -20 0 q-10 7 -20 0 q-10 9 -20 0 q-10 8 -20 0 q-10 10 -20 0 q-10 7 -20 0 q-10 9 -20 0 q-10 8 -20 0 q-10 10 -20 0 q-10 7 -20 0 q-10 9 -20 0 q-10 8 -20 0 q-10 10 -20 0 q-10 7 -20 0 q-10 9 -20 0 Z" fill="#fff" opacity=".85"/>` : ""}
    `);
  },

  carrera(op = {}) {
    let ventanasI = "", ventanasD = "";
    for (let i = 0; i < 3; i++) {
      const x = 14 + i * 40, h = 30 - i * 6;
      ventanasI += `<rect x="${x}" y="${120 + i * 6}" width="${16 - i * 2}" height="${h}" fill="#3a2a2a" ${l}/>
        <path d="M${x + 4} ${120 + i * 6} v${h} M${x + 8} ${120 + i * 6} v${h} M${x + 12 - i * 2} ${120 + i * 6} v${h}" stroke="${K}" stroke-width="1.2"/>`;
      const xd = 370 - i * 40;
      ventanasD += `<rect x="${xd}" y="${120 + i * 6}" width="${16 - i * 2}" height="${h}" fill="#3a2a2a" ${l}/>
        <path d="M${xd + 4} ${120 + i * 6} v${h} M${xd + 8} ${120 + i * 6} v${h}" stroke="${K}" stroke-width="1.2"/>`;
    }
    return svg(`
      <defs><linearGradient id="cieloC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4ec"/><stop offset="1" stop-color="#dff2fb"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#cieloC)"/>
      ${torre(200, 70, 1.5)}
      <rect x="170" y="140" width="60" height="50" fill="#fff6e2" ${l}/>
      <path d="M186 190 v-18 q14 -14 28 0 v18" fill="#8a5a33" ${l}/>
      <!-- casas izquierda -->
      <path d="M0 70 L150 128 L150 205 L0 236 Z" fill="#fffaf0" ${L}/>
      <path d="M0 70 L150 128" stroke="#c4553b" stroke-width="7"/>
      <path d="M0 220 L150 196 L150 205 L0 236 Z" fill="#e7b64a" ${l}/>
      <path d="M60 94 v128 M110 113 v90" stroke="#e8dcc4" stroke-width="2"/>
      ${ventanasI}
      <path d="M128 150 v46 h14 v-50 Z" fill="#2f5d8c" ${l}/>
      <!-- casas derecha -->
      <path d="M400 70 L250 128 L250 205 L400 236 Z" fill="#fffaf0" ${L}/>
      <path d="M400 70 L250 128" stroke="#b9472f" stroke-width="7"/>
      <path d="M400 220 L250 196 L250 205 L400 236 Z" fill="#c4553b" ${l}/>
      <path d="M340 94 v128 M290 113 v90" stroke="#e8dcc4" stroke-width="2"/>
      ${ventanasD}
      <path d="M262 146 v50 h14 v-46 Z" fill="#5aa65a" ${l}/>
      <rect x="16" y="88" width="46" height="13" rx="2" fill="#fbf5ea" ${l} transform="rotate(20 39 94)"/>
      <text x="39" y="97" text-anchor="middle" font-family="Baloo 2, Trebuchet MS, sans-serif" font-weight="800" font-size="7.4" fill="#2f5d8c" transform="rotate(20 39 94)">C/ CARRERA</text>
      <!-- calle -->
      <path d="M0 236 L150 205 L250 205 L400 236 L400 300 L0 300 Z" fill="#e6c47c" ${L}/>
      <path d="M200 210 V300" stroke="#d1aa5e" stroke-width="3" stroke-dasharray="10 9"/>
      ${op.carnaval !== false ? banderines(16) + banderines(54, ["#3b8fc4", "#f2b632", "#e0483e", "#5aa65a"]) + confeti(30, 8) : ""}
    `);
  },

  plaza(op = {}) {
    let luces = "";
    for (let i = 0; i < 20; i++) {
      const x = i * 21 + 4, y = 32 + Math.sin(i / 19 * Math.PI) * 18;
      luces += `<circle cx="${x}" cy="${y}" r="3.2" fill="${["#ffd75e", "#ff8a7a", "#9fe0ff"][i % 3]}" ${l}/>`;
    }
    let publico = "";
    for (let i = 0; i < 18; i++) {
      const x = i * 24 + 6, y = 280 + (i % 3) * 5;
      publico += `<circle cx="${x}" cy="${y - 18}" r="11" fill="${["#4a3a5e", "#3d2f50", "#56446c"][i % 3]}"/><rect x="${x - 14}" y="${y - 8}" width="28" height="40" rx="10" fill="${["#4a3a5e", "#3d2f50", "#56446c"][i % 3]}"/>`;
    }
    return svg(`
      <defs><linearGradient id="cieloP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a6b"/><stop offset=".6" stop-color="#c25b7a"/><stop offset="1" stop-color="#f7a65b"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#cieloP)"/>
      <circle cx="60" cy="30" r="1.5" fill="#fff"/><circle cx="300" cy="20" r="1.5" fill="#fff"/><circle cx="350" cy="60" r="1.2" fill="#fff"/>
      ${casita(0, 120, 60, 100, "#8b3a2e")}${casita(340, 116, 60, 104, "#8b3a2e")}${torre(372, 52, .9)}
      <!-- escenario -->
      <rect x="70" y="80" width="260" height="140" fill="#7a1f3d" ${L}/>
      <path d="M70 80 q30 40 0 140 M330 80 q-30 40 0 140" fill="#b3264f" ${L}/>
      <path d="M70 80 h260 v18 q-16 10 -32 0 q-16 10 -32 0 q-16 10 -33 0 q-16 10 -33 0 q-16 10 -32 0 q-16 10 -32 0 q-16 10 -33 0 q-16 10 -33 0 Z" fill="#f2b632" ${L}/>
      <rect x="128" y="102" width="144" height="18" rx="4" fill="#fbf5ea" ${l}/>
      <text x="200" y="115" text-anchor="middle" font-family="Baloo 2, Trebuchet MS, sans-serif" font-weight="800" font-size="9.5" fill="#7a1f3d">CARNAVAL FONTANIEGO</text>
      <rect x="56" y="220" width="288" height="18" fill="#8a5a33" ${L}/>
      <path d="M0 238 H400 V300 H0 Z" fill="#6b4e3a"/>
      ${luces}
      <path d="M-5 30 Q200 72 405 30" fill="none" stroke="${K}" stroke-width="1.4"/>
      ${confeti(70, 5)}
      ${op.sinPublico ? "" : publico}
    `);
  },

  archivo(op = {}) {
    let bloques = "";
    for (let y = 0; y < 210; y += 18) for (let x = ((y / 18) % 2) * -20; x < 400; x += 40)
      bloques += `<rect x="${x}" y="${y}" width="40" height="18" fill="none" stroke="#a88e68" stroke-width="1"/>`;
    const estante = (x) => {
      let s = `<rect x="${x}" y="58" width="72" height="140" fill="#8a5a33" ${L}/>`;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
        const cx = x + 6 + c * 22, cy = 64 + r * 33;
        s += `<rect x="${cx}" y="${cy}" width="18" height="27" fill="#4a2f1d" ${l}/>`;
        s += `<circle cx="${cx + 6}" cy="${cy + 19}" r="5" fill="#f4e2b8" ${l}/><circle cx="${cx + 12}" cy="${cy + 13}" r="5" fill="#ead2a0" ${l}/>`;
      }
      return s;
    };
    const columna = x => `<rect x="${x - 10}" y="40" width="20" height="170" fill="#efe3c8" ${L}/>
      <path d="M${x - 4} 46 v158 M${x + 4} 46 v158" stroke="#cdbb98" stroke-width="2"/>
      <rect x="${x - 16}" y="30" width="32" height="12" fill="#efe3c8" ${L}/><rect x="${x - 15}" y="206" width="30" height="10" fill="#efe3c8" ${L}/>`;
    let mosaico = "";
    for (let y = 216; y < 300; y += 14) for (let x = 0; x < 400; x += 14)
      mosaico += `<rect x="${x}" y="${y}" width="14" height="14" fill="${(Math.round(x / 14) + Math.round((y - 216) / 14)) % 2 ? "#f1e3c3" : "#b9573c"}"/>`;
    return svg(`
      <rect width="400" height="300" fill="#cdb48c"/>
      ${bloques}
      <rect x="120" y="8" width="160" height="22" rx="2" fill="#efe3c8" ${L}/>
      <text x="200" y="24" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="13" letter-spacing="3" fill="${K}">TABVLARIVM</text>
      ${estante(8)}${estante(320)}
      ${columna(104)}${columna(296)}
      <!-- antorchas -->
      <path d="M128 70 h10 l-2 14 h-6 Z" fill="#8a5a33" ${l}/><path d="M133 52 q-8 10 0 18 q8 -8 0 -18 Z" fill="#f2b632" ${l}/>
      <path d="M262 70 h10 l-2 14 h-6 Z" fill="#8a5a33" ${l}/><path d="M267 52 q-8 10 0 18 q8 -8 0 -18 Z" fill="#f2b632" ${l}/>
      ${mosaico}
      <path d="M0 216 H400" ${L}/>
      <!-- ánforas -->
      <path d="M30 216 q-12 -22 0 -40 h12 q12 18 0 40 Z" fill="#c4553b" ${L}/><path d="M32 176 v-8 h8 v8" fill="#c4553b" ${l}/>
      <path d="M362 216 q-12 -22 0 -40 h12 q12 18 0 40 Z" fill="#b9472f" ${L}/><path d="M364 176 v-8 h8 v8" fill="#b9472f" ${l}/>
    `);
  },

  banco(op = {}) {
    let suelo = "";
    for (let y = 228; y < 300; y += 18) for (let x = 0; x < 400; x += 18)
      suelo += `<rect x="${x}" y="${y}" width="18" height="18" fill="${(Math.round(x / 18) + Math.round((y - 228) / 18)) % 2 ? "#ece4d4" : "#3e5a73"}"/>`;
    return svg(`
      <rect width="400" height="300" fill="#e7eef0"/>
      <rect y="150" width="400" height="78" fill="#b98b5a"/>
      <path d="M0 150 H400" ${L}/>
      <path d="M0 166 H400 M0 212 H400" stroke="#9d6f42" stroke-width="2"/>
      <rect x="110" y="10" width="180" height="24" rx="4" fill="#2f5d8c" ${L}/>
      <text x="200" y="27" text-anchor="middle" font-family="Baloo 2, Trebuchet MS, sans-serif" font-weight="800" font-size="11" fill="#fff">BANCO · OFICINA DE FUENTES</text>
      <!-- ventanillas -->
      <rect x="40" y="46" width="150" height="104" fill="#cfe9f2" ${L}/>
      <rect x="210" y="46" width="150" height="104" fill="#cfe9f2" ${L}/>
      <path d="M60 60 l30 -10 M70 80 l40 -14 M230 60 l30 -10 M240 80 l40 -14" stroke="#fff" stroke-width="3"/>
      <rect x="92" y="50" width="46" height="14" rx="2" fill="#f2b632" ${l}/><text x="115" y="60.5" text-anchor="middle" font-family="Baloo 2, Trebuchet MS, sans-serif" font-weight="800" font-size="8" fill="${K}">CAJA 1</text>
      <rect x="262" y="50" width="46" height="14" rx="2" fill="#f2b632" ${l}/><text x="285" y="60.5" text-anchor="middle" font-family="Baloo 2, Trebuchet MS, sans-serif" font-weight="800" font-size="8" fill="${K}">CAJA 2</text>
      <circle cx="200" cy="80" r="11" fill="#fffaf0" ${L}/><path d="M200 80 v-7 M200 80 l5 3" ${l}/>
      ${suelo}
      <path d="M0 228 H400" ${L}/>
      <!-- planta -->
      <path d="M372 228 h20 l-3 -20 h-14 Z" fill="#c4553b" ${l}/>
      <path d="M382 208 q-14 -18 -6 -40 M382 208 q4 -26 14 -36 M382 208 q-2 -30 -18 -30" stroke="#4b9550" stroke-width="5" fill="none" stroke-linecap="round"/>
    `);
  }
};

/* ---------- OBJETOS (SVG para botones y adornos) ---------- */
const OBJ = {
  murguista(color, sombrero = "#2a1e2e", cara = "#f6c49a") {
    return `<svg viewBox="0 0 60 110" aria-hidden="true">
      <path d="M14 108 l4 -40 h24 l4 40 Z" fill="${color}" ${l}/>
      <path d="M18 68 q12 8 24 0" fill="none" ${l}/>
      <circle cx="30" cy="40" r="15" fill="${cara}" ${l}/>
      <path d="M15 37 q15 -8 30 0 v6 q-7 4 -11 0 q-4 -3 -8 0 q-4 4 -11 0 Z" fill="${color}" ${l}/>
      <circle cx="23" cy="40" r="2" fill="${K}"/><circle cx="37" cy="40" r="2" fill="${K}"/>
      <path d="M25 49 q5 4 10 0" fill="none" ${l}/>
      <path d="M10 28 h40 l-6 -6 h-28 Z" fill="${sombrero}" ${l}/><rect x="17" y="8" width="26" height="16" rx="3" fill="${sombrero}" ${l}/>
      <path d="M17 19 h26" stroke="#f2b632" stroke-width="3"/>
    </svg>`;
  },
  bombo() {
    return `<svg viewBox="0 0 100 90" aria-hidden="true">
      <ellipse cx="50" cy="48" rx="44" ry="38" fill="#e0483e" ${L}/>
      <ellipse cx="50" cy="48" rx="34" ry="29" fill="#fffaf0" ${L}/>
      <path d="M10 30 l14 10 l-8 14 l14 10 M90 30 l-14 10 l8 14 l-14 10" fill="none" stroke="#f2b632" stroke-width="3"/>
      <text x="50" y="56" text-anchor="middle" font-family="Baloo 2, Trebuchet MS, sans-serif" font-weight="800" font-size="20" fill="#e0483e">BOM</text>
      <path d="M82 6 l-16 22" ${L}/><circle cx="84" cy="5" r="5" fill="#fffaf0" ${l}/>
    </svg>`;
  },
  rana(feliz) {
    return `<svg viewBox="0 0 80 64" aria-hidden="true">
      <ellipse cx="40" cy="44" rx="28" ry="18" fill="#6cc04a" ${L}/>
      <circle cx="26" cy="22" r="11" fill="#6cc04a" ${L}/><circle cx="54" cy="22" r="11" fill="#6cc04a" ${L}/>
      <circle cx="26" cy="22" r="6" fill="#fff" ${l}/><circle cx="54" cy="22" r="6" fill="#fff" ${l}/>
      <circle cx="27" cy="23" r="3" fill="${K}"/><circle cx="55" cy="23" r="3" fill="${K}"/>
      ${feliz ? `<path d="M26 42 q14 14 28 0" fill="#e0483e" ${l}/>` : `<path d="M28 46 q4 -3 8 0 q4 3 8 0 q4 -3 8 0" fill="none" ${l}/>`}
      <ellipse cx="18" cy="58" rx="9" ry="4" fill="#5aa63a" ${l}/><ellipse cx="62" cy="58" rx="9" ry="4" fill="#5aa63a" ${l}/>
    </svg>`;
  },
  esponja() {
    return `<svg viewBox="0 0 80 40" aria-hidden="true">
      <rect x="4" y="6" width="72" height="28" rx="5" fill="#8a5a33" ${L}/>
      <rect x="4" y="24" width="72" height="10" rx="3" fill="#3b8fc4" ${l}/>
      <path d="M14 13 h52" stroke="#c9915a" stroke-width="3"/>
    </svg>`;
  },
  baul(abierto) {
    return `<svg viewBox="0 0 160 110" aria-hidden="true">
      ${abierto
        ? `<path d="M14 44 L30 6 H130 L146 44 Z" fill="#a46c3e" ${L}/><path d="M60 22 h40" stroke="#f2b632" stroke-width="3"/>`
        : `<path d="M14 44 q66 -44 132 0 Z" fill="#a46c3e" ${L}/>`}
      <rect x="14" y="44" width="132" height="62" rx="4" fill="#8a5a33" ${L}/>
      <path d="M14 60 H146 M40 44 v62 M120 44 v62" stroke="#f2b632" stroke-width="4"/>
      ${abierto ? `<circle cx="60" cy="40" r="7" fill="#f2b632" ${l}/><circle cx="80" cy="36" r="7" fill="#ffd75e" ${l}/><circle cx="100" cy="40" r="7" fill="#f2b632" ${l}/>` : ""}
    </svg>`;
  },
  altavoz(encendido) {
    return `<svg viewBox="0 0 100 120" aria-hidden="true">
      <rect x="10" y="6" width="80" height="110" rx="10" fill="#3d2f50" ${L}/>
      <circle cx="50" cy="40" r="20" fill="${encendido ? "#f2b632" : "#594a6e"}" ${L}/>
      <circle cx="50" cy="40" r="8" fill="${K}"/>
      <circle cx="50" cy="88" r="16" fill="${encendido ? "#f2b632" : "#594a6e"}" ${L}/>
      <circle cx="50" cy="88" r="6" fill="${K}"/>
      <circle cx="80" cy="16" r="4" fill="${encendido ? "#6cc04a" : "#e0483e"}" ${l}/>
    </svg>`;
  },
  entornaos() {
    return `<svg viewBox="0 0 120 50" aria-hidden="true">
      <ellipse cx="60" cy="36" rx="56" ry="12" fill="#fffaf0" ${L}/>
      ${[30, 52, 74, 92, 42, 64, 84].map((x, i) => `<ellipse cx="${x}" cy="${i < 4 ? 30 : 22}" rx="12" ry="7" fill="#d99a3e" ${l}/><path d="M${x - 6} ${i < 4 ? 29 : 21} q6 -4 12 0" stroke="#fffaf0" stroke-width="2" fill="none"/>`).join("")}
    </svg>`;
  },
  mascara(color = "#c45bb0") {
    return `<svg viewBox="0 0 90 50" aria-hidden="true">
      <path d="M6 14 q39 -16 78 0 q0 26 -18 30 q-12 2 -16 -10 q-5 -4 -10 0 q-4 12 -16 10 q-18 -4 -18 -30 Z" fill="${color}" ${L}/>
      <ellipse cx="28" cy="22" rx="9" ry="6" fill="${K}"/><ellipse cx="62" cy="22" rx="9" ry="6" fill="${K}"/>
      <path d="M84 12 q8 -14 2 -26" stroke="#f2b632" stroke-width="3" fill="none"/>
      <circle cx="18" cy="36" r="2.5" fill="#f2b632"/><circle cx="72" cy="36" r="2.5" fill="#f2b632"/>
    </svg>`;
  },
  puesto() {
    let toldo = "";
    for (let i = 0; i < 8; i++) toldo += `<path d="M${10 + i * 30} 10 h30 v30 q-15 10 -30 0 Z" fill="${i % 2 ? "#fffaf0" : "#e0483e"}" ${l}/>`;
    return `<svg viewBox="0 0 260 200" aria-hidden="true" preserveAspectRatio="none">
      <path d="M14 40 v150 M246 40 v150" ${L}/>
      ${toldo}
      <rect x="20" y="130" width="220" height="62" fill="#a46c3e" ${L}/>
      <path d="M20 146 H240" stroke="#8a5a33" stroke-width="3"/>
      <rect x="70" y="150" width="120" height="26" rx="4" fill="#fbf5ea" ${l}/>
      <text x="130" y="169" text-anchor="middle" font-family="Baloo 2, Trebuchet MS, sans-serif" font-weight="800" font-size="17" fill="#b9472f">ENTORNAOS</text>
    </svg>`;
  }
};

window.FONDOS = FONDOS;
window.OBJ = OBJ;
