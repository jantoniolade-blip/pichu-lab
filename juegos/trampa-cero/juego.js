"use strict";
/* Trampa Cero · Motor del juego */

(() => {
  const $ = s => document.querySelector(s);
  const CLAVE = "trampa-cero-v2";
  const N = RETOS.length;

  const el = {
    contador: $("#contador"), titulo: $("#titulo"), pregunta: $("#pregunta"),
    escena: $("#escena"), fondo: $("#fondo"), capa: $("#capa"),
    profe: $("#profe"), bocadillo: $("#bocadillo"),
    form: $("#respuesta"), input: $("#valor"), signo: $("#signo"), ayudaFormato: $("#formato"),
    estado: $("#estado"), explica: $("#explica"), explicaTxt: $("#explica-txt"), siguiente: $("#siguiente"),
    pistaBtn: $("#btn-pista"), musicaBtn: $("#btn-musica"),
    mapa: $("#mapa"), mapaLista: $("#mapa-lista"), reiniciar: $("#reiniciar")
  };

  /* ---------- Progreso ---------- */
  let progreso = cargar();
  function cargar() {
    try {
      const d = JSON.parse(localStorage.getItem(CLAVE) || "{}");
      const resueltos = Array.isArray(d.resueltos) ? d.resueltos.filter(n => Number.isInteger(n) && n >= 0 && n < N) : [];
      const actual = Number.isInteger(d.actual) && d.actual >= 0 && d.actual <= N ? d.actual : 0;
      return { resueltos: [...new Set(resueltos)], actual };
    } catch { return { resueltos: [], actual: 0 }; }
  }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(progreso)); } catch { /* sin almacenamiento: se juega igual */ }
  }
  const desbloqueado = i => i === 0 || i <= Math.max(-1, ...progreso.resueltos) + 1 || progreso.resueltos.includes(i);

  /* ---------- Estado del reto actual ---------- */
  let idx = 0, ganado = false, fallos = 0, pistaVista = false, ocultarTimer = null;

  const profeDe = i => RETOS[i]?.profe || (i % 2 ? "perilla" : "gafas");

  function ir(i) {
    idx = i;
    ganado = false; fallos = 0; pistaVista = false;
    progreso.actual = i; guardar();
    clearTimeout(ocultarTimer);
    el.capa.innerHTML = "";
    el.capa.className = "capa";
    el.explica.hidden = true;
    el.estado.textContent = ""; el.estado.className = "estado";
    cerrarPista();
    if (i >= N) return final();

    const r = RETOS[i];
    document.body.classList.remove("es-final");
    el.contador.textContent = `Reto ${i + 1}/${N}`;
    el.titulo.textContent = r.titulo;
    el.pregunta.innerHTML = r.pregunta;
    el.pistaBtn.hidden = !r.pista;
    el.escena.dataset.escena = r.escena;
    pintarFondo(r.fondo);

    // Profe: presente en la escena o solo cuando se pide la pista
    el.profe.className = "profe " + profeDe(i) + (r.profe ? " visible" : "");
    el.profe.hidden = false;

    if (r.respuesta !== undefined) montarProblema(r);
    else { el.form.hidden = true; r.montar(api); }
    el.titulo.focus({ preventScroll: true });
  }

  function pintarFondo(op) {
    el.fondo.innerHTML = FONDOS[RETOS[idx]?.escena || "plaza"](op || RETOS[idx]?.fondo || {});
  }

  /* ---------- API para los acertijos ---------- */
  const api = {
    get capa() { return el.capa; },
    ganado: () => ganado,
    fondo: op => pintarFondo(op),
    sonar: t => Musica.sfx(t),
    obj({ x, y, w, html = "", cls = "", label, tag = "button", estilo = "", alTocar }) {
      const n = document.createElement(tag);
      n.className = "obj " + cls;
      n.style.cssText = `left:${x}%;top:${y}%;${w ? `width:${w}%;` : ""}${estilo}`;
      n.innerHTML = html;
      if (tag === "button") n.type = "button";
      if (label) n.setAttribute("aria-label", label);
      if (tag !== "button" && !label) n.setAttribute("aria-hidden", "true");
      if (alTocar) n.addEventListener("click", () => { if (!ganado) alTocar(n); });
      el.capa.append(n);
      return n;
    },
    ficha(v, { x, y, color = "coral", arrastrable = false, alTocar, cls = "" }) {
      const f = api.obj({ x, y, cls: `ficha ${color} ${cls}`, html: sg(v), label: "Ficha " + sg(v), alTocar: alTocar && (n => alTocar(n)) });
      f.dataset.valor = v;
      if (arrastrable) f.dataset.arrastrable = "";
      return f;
    },
    arrastre(fichas, destinos, alSoltar) { configurarArrastre(fichas, destinos, alSoltar); },
    ok, mal, info
  };

  function ok(msg) {
    if (ganado) return;
    ganado = true;
    if (!progreso.resueltos.includes(idx)) progreso.resueltos.push(idx);
    guardar();
    el.capa.querySelectorAll("button").forEach(b => { b.disabled = true; });
    el.estado.textContent = "";
    el.explicaTxt.innerHTML = msg;
    el.siguiente.textContent = idx === N - 1 ? "Ver el final →" : "Siguiente →";
    el.explica.hidden = false;
    cerrarPista();
    el.profe.hidden = false;
    el.profe.classList.add("visible", "contento");
    el.escena.classList.add("acierto");
    setTimeout(() => el.escena.classList.remove("acierto"), 900);
    Musica.sfx("bien");
    pintarMapa();
    el.siguiente.focus({ preventScroll: true });
    el.explica.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  function mal(msg, objeto) {
    if (ganado) return;
    fallos++;
    el.estado.className = "estado mal";
    el.estado.innerHTML = msg + (fallos >= 3 && !pistaVista && RETOS[idx]?.pista ? " <span class='suave'>(Si te atascas, toca «?».)</span>" : "");
    reanimar(el.estado, "tiembla");
    if (objeto) reanimar(objeto, "tiembla");
    sello();
    Musica.sfx("mal");
  }
  function info(msg) {
    if (ganado) return;
    el.estado.className = "estado info";
    el.estado.innerHTML = msg;
  }
  function reanimar(n, c) { n.classList.remove(c); void n.offsetWidth; n.classList.add(c); }
  function sello() {
    const s = document.createElement("div");
    s.className = "sello";
    s.setAttribute("aria-hidden", "true");
    s.textContent = "¡TRAMPA!";
    el.escena.append(s);
    setTimeout(() => s.remove(), 900);
  }

  /* ---------- Arrastrar (ratón y táctil) con alternativa de tocar ---------- */
  function configurarArrastre(fichas, destinos, alSoltar) {
    let elegida = null;
    const marcarDestinos = on => destinos.forEach(d => d.classList.toggle("destino", on));
    const soltar = f => { marcarDestinos(false); f.classList.remove("sel"); elegida = null; alSoltar(Number(f.dataset.valor), f); };

    destinos.forEach(d => {
      d.classList.add("diana");
      d.addEventListener("click", () => {
        if (ganado) return;
        if (elegida) soltar(elegida);
        else info("Primero elige una ficha (o arrástrala hasta aquí).");
      });
    });

    fichas.forEach(f => {
      let p = null;
      f.addEventListener("pointerdown", e => {
        if (ganado || e.button > 0) return;
        p = { id: e.pointerId, x0: e.clientX, y0: e.clientY, mov: false };
        f.setPointerCapture(e.pointerId);
      });
      f.addEventListener("pointermove", e => {
        if (!p || p.id !== e.pointerId) return;
        const dx = e.clientX - p.x0, dy = e.clientY - p.y0;
        if (!p.mov && Math.hypot(dx, dy) > 6) { p.mov = true; f.classList.add("arrastrando"); marcarDestinos(true); }
        if (p.mov) {
          f.style.translate = `${dx}px ${dy}px`;
          const d = destinoEn(e.clientX, e.clientY);
          destinos.forEach(x => x.classList.toggle("encima", x === d));
        }
      });
      const fin = e => {
        if (!p || p.id !== e.pointerId) return;
        const movido = p.mov;
        p = null;
        f.classList.remove("arrastrando");
        f.style.translate = "";
        destinos.forEach(x => x.classList.remove("encima"));
        if (!movido) return;              // fue un toque: lo gestiona "click"
        f.dataset.recienArrastrada = "1";
        setTimeout(() => delete f.dataset.recienArrastrada, 50);
        const d = e.type === "pointerup" ? destinoEn(e.clientX, e.clientY) : null;
        if (d) soltar(f);
        else { marcarDestinos(false); if (!ganado) info("Suelta la ficha encima del objetivo."); }
      };
      f.addEventListener("pointerup", fin);
      f.addEventListener("pointercancel", fin);
      f.addEventListener("click", () => {
        if (ganado || f.dataset.recienArrastrada) return;
        fichas.forEach(o => o.classList.remove("sel"));
        if (elegida === f) { elegida = null; marcarDestinos(false); return; }
        elegida = f;
        f.classList.add("sel");
        marcarDestinos(true);
        info(`Ficha ${f.textContent} elegida. Ahora toca el objetivo.`);
      });
    });

    function destinoEn(x, y) {
      return destinos.find(d => {
        const r = d.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      }) || null;
    }
  }

  /* ---------- Problemas con respuesta escrita ---------- */
  const AYUDA = {
    "edad": "Escribe solo el número.",
    "año": "Años a. C. con signo − (por ejemplo, −50). Años d. C. sin signo o con +.",
    "euros": "Escribe el número en euros, con signo − si es negativo."
  };
  function formatear(n, tipo) {
    if (tipo === "año") return n < 0 ? `${-n} a. C.` : `${n} d. C.`;
    if (tipo === "euros") return (n < 0 ? "−" : "") + Math.abs(n) + " €";
    return String(n);
  }
  function leer(texto) {
    let s = texto.toLowerCase().replace(/[−–—‒]/g, "-").replace(/\s+/g, "").replace(/€|euros?|años?/g, "");
    let era = 0;
    if (/a\.?c\.?$/.test(s)) { era = -1; s = s.replace(/a\.?c\.?$/, ""); }
    else if (/d\.?c\.?$/.test(s)) { era = 1; s = s.replace(/d\.?c\.?$/, ""); }
    s = s.replace(/[.,]$/, "");
    if (!/^[+-]?\d{1,6}$/.test(s)) return null;
    const n = parseInt(s, 10);
    return era ? era * Math.abs(n) : n;
  }
  function montarProblema(r) {
    el.capa.innerHTML = r.doc(null);
    el.capa.firstElementChild?.classList.add("obj-doc");
    r.montarDoc?.(api);
    el.form.hidden = false;
    el.input.value = "";
    el.input.disabled = false;
    el.form.querySelector("button[type=submit]").disabled = false;
    el.signo.disabled = false;
    el.ayudaFormato.textContent = AYUDA[r.tipo];
  }
  el.form.addEventListener("submit", e => {
    e.preventDefault();
    const r = RETOS[idx];
    if (ganado || !r || r.respuesta === undefined) return;
    const n = leer(el.input.value);
    if (n === null) {
      mal(el.input.value.trim() ? "Escribe un número entero, con su signo si hace falta." : "Escribe tu resultado en la casilla.");
      el.input.focus();
      return;
    }
    if (n === r.respuesta) {
      const txt = formatear(n, r.tipo);
      el.capa.innerHTML = r.doc(txt);
      el.capa.firstElementChild?.classList.add("obj-doc", "resuelto");
      el.input.disabled = true; el.signo.disabled = true;
      el.form.querySelector("button[type=submit]").disabled = true;
      ok(r.explica);
      return;
    }
    let msg = r.errores?.[n];
    if (!msg && Math.abs(n) === Math.abs(r.respuesta)) {
      msg = r.tipo === "año" ? "El número está bien, pero revisa el signo: ¿antes o después de Cristo?"
        : r.tipo === "euros" ? "La cantidad está bien, pero revisa el signo."
        : "Revisa el signo.";
    }
    mal((msg || "Todavía no. Revisa la operación y vuelve a intentarlo.") + " ");
    el.input.select();
  });
  el.signo.addEventListener("click", () => {
    const v = el.input.value.trim();
    el.input.value = /^[−-]/.test(v) ? v.replace(/^[−-]\s*/, "") : "−" + v.replace(/^\+\s*/, "");
    el.input.focus();
  });

  /* ---------- Pista y profe ---------- */
  function abrirPista() {
    const r = RETOS[idx];
    if (!r?.pista) return;
    pistaVista = true;
    el.profe.classList.remove("contento");
    el.profe.classList.add("visible", "pista");
    el.bocadillo.textContent = r.pista;
    el.bocadillo.hidden = false;
    el.pistaBtn.setAttribute("aria-expanded", "true");
  }
  function cerrarPista() {
    el.bocadillo.hidden = true;
    el.profe.classList.remove("pista", "contento");
    if (!RETOS[idx]?.profe) el.profe.classList.remove("visible");
    el.pistaBtn.setAttribute("aria-expanded", "false");
  }
  el.pistaBtn.addEventListener("click", () => (el.bocadillo.hidden ? abrirPista() : cerrarPista()));
  el.bocadillo.addEventListener("click", cerrarPista);
  el.profe.addEventListener("click", () => { if (!ganado) (el.bocadillo.hidden ? abrirPista() : cerrarPista()); });

  el.siguiente.addEventListener("click", () => ir(idx >= N ? 0 : idx + 1));

  /* ---------- Mapa de retos ---------- */
  function pintarMapa() {
    el.mapaLista.innerHTML = RETOS.map((r, i) => {
      const hecho = progreso.resueltos.includes(i), abierto = desbloqueado(i);
      return `<button type="button" class="nivel${hecho ? " hecho" : ""}${i === idx ? " actual" : ""}" data-i="${i}" ${abierto ? "" : "disabled"}
        aria-label="Reto ${i + 1}: ${r.titulo}${hecho ? ", resuelto" : abierto ? "" : ", bloqueado"}">${hecho ? "✓" : i + 1}</button>`;
    }).join("");
  }
  el.contador.addEventListener("click", () => { pintarMapa(); el.mapa.showModal(); });
  el.mapaLista.addEventListener("click", e => {
    const b = e.target.closest("button[data-i]");
    if (!b || b.disabled) return;
    el.mapa.close();
    ir(Number(b.dataset.i));
  });
  el.reiniciar.addEventListener("click", () => {
    if (!confirm("¿Borrar el avance guardado en este navegador y empezar desde el reto 1?")) return;
    progreso = { resueltos: [], actual: 0 };
    guardar();
    el.mapa.close();
    ir(0);
  });

  /* ---------- Final ---------- */
  function final() {
    document.body.classList.add("es-final");
    el.contador.textContent = `${progreso.resueltos.length}/${N}`;
    const todo = progreso.resueltos.length === N;
    el.titulo.textContent = todo ? "¡Prueba superada!" : "Fin de la prueba";
    el.pregunta.innerHTML = todo
      ? "Has resuelto los 17 retos de números enteros. ¡Ni una trampa se te ha escapado!"
      : `Has llegado al final con ${progreso.resueltos.length} de ${N} retos resueltos. Toca el contador para repasar los que faltan.`;
    el.pistaBtn.hidden = true;
    el.form.hidden = true;
    el.escena.dataset.escena = "plaza";
    el.fondo.innerHTML = FONDOS.plaza({ sinPublico: true });
    el.profe.hidden = true;
    el.capa.innerHTML = `<div class="obj pareja" role="img" aria-label="Los dos profes de Matemáticas celebran con el pulgar arriba">
        <span class="retrato gafas"></span><span class="retrato perilla"></span></div>
      <div class="obj medalla" aria-hidden="true">${progreso.resueltos.length}<small>/${N}</small></div>`;
    el.explicaTxt.innerHTML = "Puedes volver a cualquier reto tocando el contador de arriba.";
    el.siguiente.textContent = "Jugar otra vez";
    el.explica.hidden = false;
    Musica.sfx("fin");
  }
  /* ---------- Música ---------- */
  el.musicaBtn.addEventListener("click", () => {
    const on = Musica.alternar();
    el.musicaBtn.setAttribute("aria-pressed", String(on));
    el.musicaBtn.title = on ? "Pausar música" : "Activar música";
  });

  /* ---------- Inicio ---------- */
  pintarMapa();
  const inicio = progreso.actual >= N ? N : (desbloqueado(progreso.actual) ? progreso.actual : 0);
  ir(inicio);

  // Para pruebas automáticas
  window.__trampa = { ir, get idx() { return idx; }, get ganado() { return ganado; }, progreso: () => progreso };
})();
