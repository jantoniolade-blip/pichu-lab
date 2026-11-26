"use strict";
/* Trampa Cero · Los 17 retos.
   Retos 1–7: acertijos en la escena (tocar, arrastrar, descubrir).
   Retos 8–17: problemas de clase con respuesta escrita (fechas y saldos). */

const sg = n => (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n);   // con signo: +3, −5, 0
const ng = n => (n < 0 ? "−" : "") + Math.abs(n);                  // signo solo si es negativo
const par = n => (n < 0 ? "(" + sg(n) + ")" : sg(n));

const RETOS = [
  /* 1 · COMPARAR */
  {
    titulo: "El más pequeño",
    pregunta: "Toca el número <b>más pequeño</b>.",
    escena: "aula", profe: "gafas",
    pista: "No te fíes del tamaño de la letra. Mira bien por toda el aula.",
    montar(j) {
      const tiza = (n, x, y, tam, extra = "") => j.obj({
        x, y, cls: "tiza " + extra, html: sg(n), label: "Número " + sg(n), estilo: `font-size:${tam}cqw`,
        alTocar: () => elegir(n)
      });
      tiza(-1, 41, 31, 21, "gigante");
      tiza(3, 67, 21, 7);
      tiza(-5, 66, 41, 7);
      tiza(0, 27, 22, 7);
      j.obj({ x: 85.6, y: 30.4, cls: "notita", html: "−8", label: "Número −8 en una nota del corcho", alTocar: () => elegir(-8) });
      function elegir(n) {
        if (n === -8) j.ok("−8 &lt; −5 &lt; −1 &lt; 0 &lt; +3. El más pequeño estaba escondido en el corcho: el tamaño de la letra no cuenta.");
        else if (n === -1) j.mal("¡Tiene la letra enorme, pero no es el más pequeño!");
        else if (n === -5) j.mal("−5 es menor que todos los de la pizarra… pero en el aula hay un número todavía más pequeño.");
        else if (n === 0) j.mal("El 0 es mayor que cualquier número negativo.");
        else j.mal("+3 es positivo: está entre los más grandes.");
      }
    }
  },

  /* 2 · ORDENAR */
  {
    titulo: "La murga en fila",
    pregunta: "Los <b>5</b> murguistas desfilan de <b>menor a mayor</b>. Tócalos en ese orden.",
    escena: "carrera",
    pista: "¿Cuántos murguistas ves? Cuéntalos antes de empezar.",
    montar(j) {
      const orden = [-7, -3, 0, 2, 5];
      const datos = [[2, 12, "#3b8fc4"], [-3, 31, "#5aa65a"], [-7, 52, "#c45bb0"], [0, 71, "#f2b632"], [5, 89, "#e0483e"]];
      const botones = {};
      let paso = 0, visto = false;
      for (const [n, x, color] of datos) {
        botones[n] = j.obj({
          x, y: 69, w: 15, cls: "murguista", label: "Murguista con el cartel " + sg(n),
          html: OBJ.murguista(color) + `<span class="cartel">${sg(n)}</span>`,
          alTocar: () => tocar(n)
        });
      }
      const bombo = j.obj({
        x: 52, y: 73, w: 25, cls: "bombo", html: OBJ.bombo(), label: "Bombo de la murga",
        alTocar: () => {
          if (visto) return;
          visto = true;
          bombo.classList.add("apartado");
          j.sonar("bom");
          j.info("¡BOM! Detrás del bombo había otro murguista.");
        }
      });
      function tocar(n) {
        if (n === -7 && !visto) return;
        if (n === orden[paso]) {
          paso++;
          botones[n].insertAdjacentHTML("beforeend", `<i class="orden">${paso}</i>`);
          botones[n].disabled = true;
          if (paso === 5) j.ok("−7 &lt; −3 &lt; 0 &lt; +2 &lt; +5. El quinto murguista se escondía detrás del bombo.");
          else j.info("Bien: " + paso + " de 5.");
        } else {
          const msg = (!visto && paso === 0 && n === -3)
            ? "¿Seguro que −3 es el más pequeño? Solo ves 4 murguistas y la pregunta dice 5."
            : sg(n) + " no va en ese puesto. La fila vuelve a empezar.";
          paso = 0;
          Object.values(botones).forEach(b => { b.disabled = false; b.querySelector(".orden")?.remove(); });
          j.mal(msg, botones[n]);
        }
      }
    }
  },

  /* 3 · OPUESTO */
  {
    titulo: "La pizarra del revés",
    pregunta: "Haz que en la pizarra aparezca el <b>opuesto de −6</b>. ¡Sin escribir nada!",
    escena: "aula", profe: "perilla",
    pista: "Lo que ya está escrito puede cambiar si lo tocas.",
    montar(j) {
      const signo = j.obj({ x: 39, y: 30, cls: "tiza signo", html: "<span>−</span>", estilo: "font-size:24cqw", label: "Signo menos",
        alTocar: () => {
          signo.classList.add("girado");
          signo.setAttribute("aria-label", "Signo más");
          j.ok("El opuesto de −6 es +6: está a la misma distancia del 0, pero al otro lado. Bastaba con girar el signo.");
        } });
      j.obj({ x: 59, y: 30, cls: "tiza", html: "6", estilo: "font-size:24cqw", label: "Número 6",
        alTocar: el => j.mal("El 6 no tiene la culpa. El opuesto conserva el 6.", el) });
      j.obj({ x: 30, y: 51.5, w: 13, cls: "esponja", html: OBJ.esponja(), label: "Borrador",
        alTocar: el => {
          j.capa.classList.add("borrando");
          setTimeout(() => j.capa.classList.remove("borrando"), 900);
          j.mal("¡Lo has borrado todo! El opuesto de −6 no es «nada».", el);
        } });
      j.obj({ x: 41, y: 51.5, cls: "tizapalo", html: "", label: "Tiza",
        alTocar: el => j.mal("La tiza está de vacaciones: hoy no se escribe nada.", el) });
    }
  },

  /* 4 · SUMA CON TEMPERATURAS */
  {
    titulo: "La fuente helada",
    pregunta: "La helada ha dejado el agua a <b>−4 °C</b>. Arrastra una ficha al termómetro para dejarla <b>justo en 0 °C</b>.",
    escena: "fuente", fondo: { helada: true },
    pista: "¿La temperatura tiene que subir o bajar? ¿Cuántos grados?",
    montar(j) {
      const hielo = j.obj({ x: 50, y: 64, w: 22, cls: "hielo", html: OBJ.rana(false), label: "Rana atrapada en el hielo" });
      const termo = j.obj({ x: 84, y: 42, cls: "termometro", tag: "div",
        html: `<span class="tubo"><i></i></span><b>−4 °C</b>`, label: "Termómetro a menos 4 grados" });
      const fichas = [[2, 18, "coral"], [-4, 37, "lila"], [4, 56, "verde"], [6, 75, "azul"]]
        .map(([n, x, c]) => j.ficha(n, { x, y: 88, color: c, arrastrable: true }));
      j.arrastre(fichas, [termo, hielo], n => {
        const t = -4 + n;
        if (t === 0) {
          termo.querySelector("b").textContent = "0 °C";
          termo.classList.add("templado");
          hielo.innerHTML = OBJ.rana(true);
          hielo.classList.add("libre");
          j.fondo({ helada: false });
          j.ok("−4 + (+4) = 0. El agua sube 4 grados y llega justo a 0 °C. ¡La rana se libra del hielo!");
        } else if (t < -4) j.mal("−4 + (" + sg(n) + ") = " + sg(t) + " °C. ¡Todavía más hielo!");
        else if (t < 0) j.mal("−4 + (" + sg(n) + ") = " + sg(t) + " °C. Aún bajo cero: la rana sigue congelada.");
        else j.mal("−4 + (" + sg(n) + ") = " + sg(t) + " °C. Te has pasado: se pedía justo 0 °C.");
      });
    }
  },

  /* 5 · RESTAR UN NEGATIVO */
  {
    titulo: "El puesto de entornaos",
    pregunta: "La cuenta del puesto marca <b>−7 €</b>. Borra <b>un</b> apunte para que marque <b>−3 €</b>.",
    escena: "carrera", profe: "gafas",
    pista: "Fíjate en el signo del apunte que borras.",
    montar(j) {
      j.obj({ x: 44, y: 54, w: 64, cls: "puesto", tag: "div", html: OBJ.puesto() });
      const plato = j.obj({ x: 44, y: 63, w: 30, cls: "plato", tag: "div", html: OBJ.entornaos() });
      const pizarra = j.obj({ x: 44, y: 41, w: 40, cls: "cuenta", tag: "div",
        html: `<span class="cuenta-tit">Cuenta del puesto</span><div class="apuntes"></div><span class="cuenta-total">Total: <b>−7 €</b></span>` });
      const caja = pizarra.querySelector(".apuntes");
      const apuntes = [2, -4, -5];
      for (const n of apuntes) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "apunte"; b.textContent = sg(n) + " €";
        b.setAttribute("aria-label", "Borrar el apunte " + sg(n) + " euros");
        b.addEventListener("click", () => borrar(n, b));
        caja.append(b);
      }
      function borrar(n, b) {
        if (j.ganado()) return;
        const total = -7 - n;
        b.classList.add("tachado");
        pizarra.querySelector("b").textContent = sg(total) + " €";
        if (total === -3) {
          plato.classList.add("bota");
          j.ok("−7 − (−4) = −7 + 4 = −3. Quitar una deuda de 4 € hace subir la cuenta 4 €.");
        } else {
          j.mal("Sin el apunte " + sg(n) + " €, la cuenta queda en " + sg(total) + " €.", b);
          setTimeout(() => { b.classList.remove("tachado"); if (!j.ganado()) pizarra.querySelector("b").textContent = "−7 €"; }, 1400);
        }
      }
    }
  },

  /* 6 · MULTIPLICAR */
  {
    titulo: "La murga sin voz",
    pregunta: "El altavoz de la murga solo se enciende con <b>dos fichas</b> cuyo producto sea <b>+12</b>.",
    escena: "plaza",
    pista: "No basta con que salga 12: el signo del resultado también cuenta.",
    montar(j) {
      const alt = j.obj({ x: 50, y: 56, w: 14, cls: "altavoz", tag: "div", html: OBJ.altavoz(false) });
      const pant = j.obj({ x: 50, y: 13, cls: "marcador", tag: "div", html: "? × ?" });
      const elegidas = [];
      const fichas = [[-6, 14, "coral"], [-3, 32, "lila"], [4, 50, "verde"], [-4, 68, "azul"], [2, 86, "amarilla"]]
        .map(([n, x, c]) => j.ficha(n, { x, y: 80, color: c, alTocar: (el) => tocar(n, el) }));
      function tocar(n, el) {
        const k = elegidas.indexOf(n);
        if (k >= 0) { elegidas.splice(k, 1); el.classList.remove("sel"); }
        else { elegidas.push(n); el.classList.add("sel"); }
        pant.textContent = elegidas.length ? elegidas.map(par).join(" × ") + (elegidas.length < 2 ? " × ?" : "") : "? × ?";
        if (elegidas.length < 2) return;
        const [a, b] = elegidas, p = a * b;
        if (p === 12) {
          alt.innerHTML = OBJ.altavoz(true);
          alt.classList.add("suena");
          pant.textContent = par(a) + " × " + par(b) + " = +12";
          j.ok("(−3) × (−4) = +12. Menos por menos da más. ¡Que suenen las coplas!");
        } else {
          j.mal(par(a) + " × " + par(b) + " = " + sg(p) + ". El altavoz pide +12.");
          elegidas.length = 0;
          setTimeout(() => { if (!j.ganado()) { pant.textContent = "? × ?"; fichas.forEach(f => f.classList.remove("sel")); } }, 900);
        }
      }
    }
  },

  /* 7 · SUMA CERO (objeto escondido) */
  {
    titulo: "El baúl de los Alarifes",
    pregunta: "El baúl se abre con <b>tres fichas</b> que sumen <b>0</b>.",
    escena: "aula", fondo: { sinMesa: true }, profe: "perilla",
    pista: "No todo lo que hay en el baúl está a la vista.",
    montar(j) {
      const baul = j.obj({ x: 46, y: 73, w: 38, cls: "baul", tag: "div", html: OBJ.baul(false) });
      let visto = false;
      const elegidas = [];
      const pant = j.obj({ x: 50, y: 19, cls: "tiza suma", tag: "div", html: "_ + _ + _", estilo: "font-size:7cqw" });
      const fichas = [[-8, 28, "coral"], [-4, 44, "lila"], [3, 60, "verde"], [2, 76, "azul"]]
        .map(([n, x, c]) => j.ficha(n, { x, y: 37, color: c, alTocar: el => tocar(n, el) }));
      const tapa = j.obj({ x: 46, y: 80, cls: "cerradura", html: "0", label: "Cerradura con forma de cero",
        alTocar: () => {
          if (visto) return;
          visto = true;
          tapa.remove();
          fichas.push(j.ficha(5, { x: 46, y: 80, color: "amarilla", alTocar: el => tocar(5, el), cls: "aparece" }));
          j.info("¡El 0 de la cerradura era una tapa! Debajo había una ficha.");
        } });
      function tocar(n, el) {
        const k = elegidas.indexOf(n);
        if (k >= 0) { elegidas.splice(k, 1); el.classList.remove("sel"); }
        else { elegidas.push(n); el.classList.add("sel"); }
        pant.textContent = [0, 1, 2].map(i => elegidas[i] === undefined ? "_" : par(elegidas[i])).join(" + ");
        if (elegidas.length < 3) return;
        const s = elegidas.reduce((a, b) => a + b, 0);
        if (s === 0) {
          baul.innerHTML = OBJ.baul(true);
          pant.textContent = elegidas.map(par).join(" + ") + " = 0";
          j.ok("(−8) + (+3) + (+5) = 0. Los positivos suman 8 y compensan el −8. La ficha clave estaba bajo el cero.");
        } else {
          j.mal("Suman " + sg(s) + "." + (visto ? " Prueba otra combinación." : " Ninguna combinación de estas cuatro fichas da 0… ¿las has visto todas?"));
          elegidas.length = 0;
          setTimeout(() => { if (!j.ganado()) { pant.textContent = "_ + _ + _"; fichas.forEach(f => f.classList.remove("sel")); } }, 900);
        }
      }
    }
  },

  /* ---------- PROBLEMAS DE CLASE: FECHAS ---------- */
  {
    titulo: "La lápida de la alfarera",
    pregunta: "Una alfarera romana nació en el <b>80 a. C.</b> y murió el día de su cumpleaños en el <b>23 a. C.</b> ¿Cuántos años cumplió?",
    escena: "archivo", profe: "gafas", tipo: "edad",
    respuesta: 57,
    pista: "Dibuja una recta del tiempo y marca las dos fechas.",
    errores: { 103: "Las dos fechas son a. C.: no hay que sumarlas.", "-57": "Una edad no puede ser negativa." },
    explica: "(−23) − (−80) = −23 + 80 = 57. Cumplió 57 años.",
    doc: r => `<div class="doc lapida"><b>D · M</b><span>FIGVLA</span><span>n. 80 a. C.</span><span>m. 23 a. C.</span><span>vivió <em>${r ?? "?"}</em> años</span></div>`
  },
  {
    titulo: "El cumpleaños del escriba",
    pregunta: "Un aprendiz de escriba nació en el <b>68 a. C.</b> ¿En qué año cumplió <b>36 años</b>? Escribe los años a. C. con signo −.",
    escena: "archivo", profe: "perilla", tipo: "año",
    respuesta: -32,
    pista: "Cuando una persona cumple años, ¿se acerca o se aleja del cambio de era?",
    errores: { "-104": "Al cumplir años nos acercamos al cambio de era, no nos alejamos.", 32: "Ese año todavía es antes de Cristo: le falta el signo −.", "-36": "El 36 es la edad, no el año." },
    explica: "−68 + 36 = −32. Cumplió 36 años en el 32 a. C.",
    doc: r => `<div class="doc pergamino"><span>Aprendiz de escriba</span><span>nace: 68 a. C.</span><span>36 años en: <em>${r ?? "?"}</em></span></div>`
  },
  {
    titulo: "La villa y el mosaico",
    pregunta: "Una villa romana se fundó en el <b>45 a. C.</b> y su mosaico se colocó en el <b>120 d. C.</b> ¿Cuántos años pasaron? Recuerda: <b>no hubo año 0</b>; tras el 1 a. C. vino el 1 d. C.",
    escena: "archivo", tipo: "edad",
    respuesta: 164,
    pista: "Cuenta por tramos: hasta el cambio de era y desde él.",
    errores: { 165: "Revisa el cambio de era: no hubo año 0.", 75: "Las dos fechas están en eras distintas: una a cada lado del cambio de era.", "-164": "Los años que pasan entre dos fechas no son negativos." },
    explica: "Del 45 a. C. al 1 a. C. pasan 44 años; del 1 a. C. al 1 d. C., 1 año; y del 1 d. C. al 120 d. C., 119. En total, 164 años (120 + 45 − 1).",
    doc: r => `<div class="doc linea"><span class="ltit">Línea del tiempo</span><div class="eje"><i class="m1">45 a. C.<br>villa</i><i class="m0">cambio de era</i><i class="m2">120 d. C.<br>mosaico</i></div><span>Pasaron <em>${r ?? "?"}</em> años</span></div>`
  },
  {
    titulo: "El legionario",
    pregunta: "Un legionario nació en el <b>14 a. C.</b> y celebró su cumpleaños en el <b>12 d. C.</b> ¿Qué edad cumplió? Recuerda: <b>no hubo año 0</b>.",
    escena: "archivo", profe: "perilla", tipo: "edad",
    respuesta: 25,
    pista: "Prueba con fechas pequeñas: del 1 a. C. al 1 d. C., ¿cuántos años pasan?",
    errores: { 26: "Revisa el cambio de era: no hubo año 0.", 2: "Las fechas están a lados distintos del cambio de era: no se restan así." },
    explica: "Del 14 a. C. al 1 a. C. cumple 13; en el 1 d. C., 14; y en el 12 d. C., 25. Es decir, 14 + 12 − 1 = 25 años.",
    doc: r => `<div class="doc escudo"><span>LEGIO</span><span>n. 14 a. C.</span><span>12 d. C. → <em>${r ?? "?"}</em> años</span></div>`
  },
  {
    titulo: "El poeta del foro",
    pregunta: "Un poeta murió el día de su cumpleaños, con <b>60 años</b>, en el <b>17 d. C.</b> ¿En qué año nació? <b>No hubo año 0</b>. Escribe el año con su signo.",
    escena: "archivo", profe: "gafas", tipo: "año",
    respuesta: -44,
    pista: "Retrocede desde su muerte y fíjate bien en qué pasa al cruzar el cambio de era.",
    errores: { "-43": "Revisa el cambio de era: no hubo año 0.", 44: "Nació antes de Cristo: el año lleva signo −.", 43: "Nació antes de Cristo: el año lleva signo −. Y revisa el año 0.", 77: "¡No pudo nacer después de morir! Hay que ir hacia atrás.", "-60": "El 60 es su edad, no el año." },
    explica: "17 − 60 sería −43 si hubiera año 0. Como no lo hubo, hay que retroceder un año más: nació en el 44 a. C. (−44).",
    doc: r => `<div class="doc pergamino"><span>Poeta del foro</span><span>nace: <em>${r ?? "?"}</em></span><span>muere: 17 d. C. (60 años)</span></div>`
  },

  /* ---------- PROBLEMAS DE CLASE: SALDOS ---------- */
  {
    titulo: "La cuenta de la murga",
    pregunta: "La cuenta de la murga está en <b>−32 €</b>. Ingresa <b>50 €</b> del premio del concurso y le cobran <b>27 €</b> de las máscaras. ¿Cuál es el saldo final?",
    escena: "banco", profe: "perilla", tipo: "euros",
    respuesta: -9,
    pista: "Separa lo que entra en la cuenta de lo que sale.",
    errores: { 9: "Revisa el signo: ¿la cuenta queda en positivo o en descubierto?", 45: "Los 27 € de las máscaras salen de la cuenta, no entran.", "-109": "Los 50 € del premio entran en la cuenta." },
    explica: "−32 + 50 = +18 y +18 − 27 = −9. La cuenta queda en descubierto: −9 €.",
    doc: r => `<div class="doc cajero"><span class="ctit">CUENTA MURGA</span><span>Saldo: −32 €</span><span>Ingreso: +50 €</span><span>Cobro: −27 €</span><span class="cfin">Saldo final: <em>${r ?? "?"}</em></span></div>`
  },
  {
    titulo: "El viaje de 1.º ESO",
    pregunta: "La cuenta del viaje de 1.º ESO estaba en descubierto: <b>−24 €</b>. Tras el ingreso de las familias marca <b>+13 €</b>. ¿Cuántos euros se ingresaron?",
    escena: "banco", profe: "gafas", tipo: "euros",
    respuesta: 37,
    pista: "Sitúa los dos saldos en una recta: ¿cuánto hay del primero al segundo?",
    errores: { 11: "Ese ingreso no basta para salir del descubierto y llegar a +13 €.", "-37": "Un ingreso es dinero que entra: escribe cuántos euros, sin signo −.", "-11": "Un ingreso es dinero que entra, y además tiene que salir del descubierto." },
    explica: "+13 − (−24) = 13 + 24 = 37. Se ingresaron 37 €: 24 € para llegar a 0 y 13 € más.",
    doc: r => `<div class="doc libreta"><span class="ltit">Libreta · Viaje 1.º ESO</span><span>Saldo anterior: −24 €</span><span>Ingreso: <em>${r ?? "?"}</em></span><span>Saldo actual: +13 €</span></div>`
  },
  {
    titulo: "El recibo del aceite",
    pregunta: "El puesto de entornaos tenía <b>+15 €</b>. Tras cobrarle el recibo del aceite, la cuenta queda en <b>−28 €</b>. ¿De cuántos euros fue el cobro?",
    escena: "banco", profe: "perilla", tipo: "euros",
    respuesta: 43,
    pista: "Un cobro hace bajar el saldo. ¿Cuánto ha bajado en total?",
    errores: { 13: "El saldo ha bajado más: ha pasado por debajo del 0.", "-43": "Se pregunta cuántos euros cobraron: escribe el importe sin signo.", "-13": "Se pregunta cuántos euros cobraron: escribe el importe, y revisa que el saldo cruza el 0." },
    explica: "+15 − (−28) = 15 + 28 = 43. El recibo fue de 43 €: 15 € hasta el 0 y 28 € más.",
    doc: r => `<div class="doc recibo"><span class="ltit">RECIBO · Aceite</span><span>Saldo antes: +15 €</span><span>Importe: <em>${r ?? "?"}</em></span><span>Saldo después: −28 €</span></div>`
  },
  {
    titulo: "Dos cuentas en la Carrera",
    pregunta: "En la tienda de máscaras de la calle Carrera, la cuenta A tiene <b>−18 €</b> y la cuenta B, <b>+12 €</b>. ¿Cuántos euros más tiene la cuenta B que la A?",
    escena: "banco", profe: "gafas", tipo: "euros",
    respuesta: 30,
    pista: "Coloca los dos saldos en una recta y mide la distancia.",
    errores: { 6: "Los saldos están a lados distintos del 0.", "-30": "Se pregunta cuánto más tiene B: la respuesta es positiva.", "-6": "Los saldos están a lados distintos del 0." },
    explica: "+12 − (−18) = 12 + 18 = 30. La cuenta B tiene 30 € más que la A.",
    doc: r => `<div class="doc tarjetas"><div class="tj a"><b>A</b>−18 €</div><div class="tj b"><b>B</b>+12 €</div><span>B tiene <em>${r ?? "?"}</em> más</span></div>`
  },
  {
    titulo: "El extracto con un borrón",
    pregunta: "En el extracto de la murga hay un borrón en el saldo inicial. Después hubo un ingreso de <b>35 €</b> y un cobro de <b>61 €</b>, y el saldo final es <b>−42 €</b>. ¿Cuál era el saldo inicial?",
    escena: "banco", profe: "perilla", tipo: "euros",
    respuesta: -16,
    pista: "Lee el extracto de abajo arriba: deshaz cada movimiento.",
    errores: { 16: "Revisa el signo: ¿la cuenta empezó en positivo o en descubierto?", "-68": "Al ir hacia atrás, cada movimiento se deshace al revés.", 54: "Al deshacer el ingreso de 35 €, el saldo tiene que bajar.", "-138": "Al deshacer el cobro de 61 €, el saldo tiene que subir." },
    explica: "Hacia atrás: −42 + 61 = +19 (deshacemos el cobro) y +19 − 35 = −16 (deshacemos el ingreso). El saldo inicial era −16 €.",
    doc: r => `<div class="doc extracto"><span class="ltit">EXTRACTO · Murga</span><span>Saldo inicial: ${r == null ? '<button type="button" class="borron" aria-label="Borrón de tinta">▓▓▓</button>' : `<em>${r}</em>`}</span><span>Ingreso: +35 €</span><span>Cobro: −61 €</span><span>Saldo final: −42 €</span></div>`,
    montarDoc(j) {
      j.capa.querySelector(".borron")?.addEventListener("click", e => j.mal("¡No vale rascar! El saldo inicial hay que calcularlo.", e.currentTarget));
    }
  }
];

window.RETOS = RETOS;
window.sg = sg;
