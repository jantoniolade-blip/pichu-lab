/* =====================================================================
   GALOIS LEGACY · los diez mundos jugables
   ---------------------------------------------------------------------
   Cada mundo tiene un mapa de 32×24 tiles, monumentos, vecinos, cofres
   del saber y cinco aventuras (coleccion/datos.js):
     1 Exploración  · hablar con un vecino, reunir 3 fragmentos y resolver
     2 Combate      · vencer al primer enemigo
     3 Construcción · restaurar un monumento resolviendo retos
     4 Minijefe     · vencer al segundo enemigo
     5 Jefe         · combate en tres fases (solo tras las aventuras 1-4)
   Los textos culturales son breves y generales; conviene contrastarlos.
   ===================================================================== */
(function (root) {
  'use strict';
  var W = 32, H = 24;

  function Mapa(fondo) { this.t = []; for (var y = 0; y < H; y++) { this.t.push([]); for (var x = 0; x < W; x++) this.t[y].push(fondo || '.'); } }
  Mapa.prototype.rect = function (x, y, w, h, c) { for (var j = y; j < y + h; j++) for (var i = x; i < x + w; i++) if (j >= 0 && j < H && i >= 0 && i < W) this.t[j][i] = c; return this; };
  Mapa.prototype.borde = function (c) { this.rect(0, 0, W, 1, c).rect(0, H - 1, W, 1, c).rect(0, 0, 1, H, c).rect(W - 1, 0, 1, H, c); return this; };
  Mapa.prototype.salpicar = function (c, x, y, w, h, n, seed) { for (var k = 0; k < n; k++) { var i = x + Math.floor(rnd(seed + k * 7) * w), j = y + Math.floor(rnd(seed + k * 13 + 1) * h); this.t[j][i] = c; } return this; };
  function rnd(s) { var v = Math.sin(s * 12.9898) * 43758.5453; return v - Math.floor(v); }

  /* ---------- Plantilla común (mundos 2-10) ---------- */
  function plantilla(o) {
    var m = new Mapa(o.suelo || '.');
    m.salpicar(',', 1, 1, 30, 22, 40, o.id * 11);
    m.borde(o.borde || 'h');
    if (o.campoE) m.rect(1, 14, 12, 8, o.campoE);
    if (o.campoF) m.rect(19, 15, 12, 7, o.campoF);
    if (o.arbolesE) m.salpicar(o.arbolesE, 1, 15, 12, 7, 14, o.id * 3);
    if (o.arbolesF) m.salpicar(o.arbolesF, 19, 15, 12, 7, 12, o.id * 5);
    m.rect(15, 8, 2, 16, ':').rect(1, 12, 30, 1, ':');
    m.rect(11, 8, 10, 7, o.plaza || '=');
    if (o.rio) { m.rect(1, 17, 30, 2, '~').rect(15, 17, 2, 2, 'B'); }
    m.rect(15, 23, 2, 1, ':');
    [[11, 8], [20, 8], [11, 14], [20, 14]].forEach(function (p) { m.t[p[1]][p[0]] = 'F'; });
    m.t[11][12] = 'L'; m.t[11][19] = 'L';
    (o.extra || function () {})(m);
    return m;
  }

  var M = [];
  /* ===================== 1 · Fuentes de Andalucía (mapa propio) ===================== */
  (function () {
    var m = new Mapa('.');
    m.salpicar(',', 1, 1, 30, 22, 50, 5).borde('h');
    m.rect(1, 1, 10, 5, 'w');            // trigales de la Campiña
    m.rect(19, 16, 12, 6, 'w');
    m.rect(1, 15, 12, 7, '.').salpicar('o', 1, 15, 12, 7, 16, 9); // olivar
    m.rect(15, 8, 2, 16, ':').rect(1, 12, 30, 1, ':').rect(22, 6, 1, 6, ':');
    m.rect(11, 8, 10, 7, '=');
    [[11, 8], [20, 8], [11, 14], [20, 14]].forEach(function (p) { m.t[p[1]][p[0]] = 'F'; });
    m.t[11][12] = 'L'; m.t[11][19] = 'L'; m.t[9][12] = 'T'; m.t[9][19] = 'T';
    M.push({
      id: 1, mapa: m, inicio: [5, 12], salida: [15, 23], musica: 'campina',
      edificios: [
        { t: 'ies', x: 1, y: 7, nombre: 'IES Alarifes Ruiz Florindo', texto: 'El instituto, punto de partida de la aventura. En sus aulas comienza la búsqueda del Compás de los Alarifes.' },
        { t: 'iglesia', x: 13, y: 1, nombre: 'Iglesia barroca', obra: true, texto: 'Una iglesia barroca de Fuentes con su espadaña. Los alarifes de la familia Ruiz Florindo trabajaron en el barroco del siglo XVIII.' },
        { t: 'castillo', x: 24, y: 0, nombre: 'Castillo de la Monclova', texto: 'Fortaleza de la campiña, en el término de Fuentes. Radicósmico se ha encerrado en su bóveda.' },
        { t: 'palacio', x: 24, y: 7, nombre: 'Casa palacio', texto: 'Una casa señorial con portada de ladrillo y balcón de forja, como las de las familias nobles de Fuentes.' },
        { t: 'fuente', x: 15, y: 10, nombre: 'La fuente de la plaza', texto: 'Fuentes de Andalucía debe su nombre al agua de sus manantiales y fuentes.' },
        { t: 'casa', x: 18, y: 1, nombre: 'Casa encalada' }, { t: 'casa', x: 8, y: 15, nombre: 'Casa encalada', o: { teja: '#b04a30' } }
      ],
      vecinos: [
        { v: 'maestra', x: 6, y: 13, nombre: 'Profesora Florinda', aventura: 1, dir: 'down',
          dialogo: ['¡Por fin llegas! Soy la profesora Florinda, del IES Alarifes Ruiz Florindo.', 'Los planos de los antiguos alarifes guardaban el Compás de los Alarifes, pero se ha roto en diez piezas repartidas por la Campiña.', 'Para empezar, recoge los tres fragmentos del cuaderno del maestro de obras que el viento ha esparcido por el pueblo. ✦'],
          pedido: 'Busca los tres fragmentos brillantes (✦) y vuelve a hablar conmigo.', listo: '¡Los tienes todos! Ahora ordena los materiales del maestro: compara los números cifra a cifra.' },
        { v: 'abuela', x: 18, y: 13, nombre: 'Doña Remedios', dialogo: ['En Fuentes siempre ha habido agua: de ahí viene el nombre del pueblo.', 'Si te faltan fuerzas, el puesto de la plaza vende pociones a cambio de monedas.'] },
        { v: 'agricultor', x: 22, y: 15, nombre: 'Manolo el del trigo', dialogo: ['Esta es tierra de cereal y olivar. Cada espiga cuenta... ¡y mucho más si se multiplican como las potencias!', 'He visto un bloque amarillo con un exponente rondando por mis trigales.'] },
        { v: 'pastelera', x: 13, y: 13, nombre: 'Puesto de la plaza', tienda: true, dialogo: ['¿Una poción de vida? Son 15 monedas. Las monedas se ganan en las aventuras y en los cofres del saber.'] },
        { v: 'alumno', x: 9, y: 12, nombre: 'Rafa (1.º ESO)', dialogo: ['¡Elige bien la dificultad! Explorador tiene pistas y menos opciones; Maestro te pide escribir las respuestas.', 'Si fallas, lee la explicación: así se aprende de verdad.'] }
      ],
      fragmentos: [[3, 6], [28, 13], [10, 21]],
      enemigo2: [24, 19], obra: 1, minijefe: [5, 19], jefe: [26, 6],
      cofres: [{ id: 'c1-a', x: 2, y: 14, monedas: 12 }, { id: 'c1-b', x: 29, y: 22, monedas: 15 }, { id: 'c1-c', x: 11, y: 6, monedas: 10 }]
    });
  })();

  /* ===================== 2-10 · Plantilla con identidad propia ===================== */
  function mundo(o) {
    var m = plantilla(o), solidos = 'oTPrkhfM';
    // despeja el terreno alrededor de los objetivos (los árboles se reparten al azar)
    [o.enemigo2 || [24, 20], o.minijefe || [6, 20], o.jefe].concat(o.fragmentos || [[3, 7], [28, 13], [8, 21]]).forEach(function (q) {
      for (var j = q[1] - 1; j <= q[1] + 1; j++) for (var i = q[0] - 1; i <= q[0] + 1; i++) if (j > 0 && i > 0 && j < H - 1 && i < W - 1 && solidos.indexOf(m.t[j][i]) >= 0) m.t[j][i] = o.suelo === 's' ? 's' : '.';
    });
    M.push({
      id: o.id, mapa: m, inicio: [15, 21], salida: [15, 23],
      edificios: o.edificios, vecinos: o.vecinos,
      fragmentos: o.fragmentos || [[3, 7], [28, 13], [8, 21]], enemigo2: o.enemigo2 || [24, 20], obra: o.obra, minijefe: o.minijefe || [6, 20], jefe: o.jefe,
      cofres: o.cofres
    });
  }
  function c(id, x, y, mo) { return { id: id, x: x, y: y, monedas: mo || 12 }; }

  mundo({ id: 2, borde: 'M', campoE: 'c', arbolesF: 'o',
    edificios: [
      { t: 'puerta', x: 2, y: 2, nombre: 'Puerta de Sevilla', obra: true, texto: 'La gran puerta fortificada de Carmona, con siglos de historia romana, islámica y cristiana.' },
      { t: 'castillo', x: 24, y: 1, nombre: 'Alcázar de la Puerta de Sevilla', texto: 'Fortaleza que protege la entrada a la ciudad. Prímox custodia aquí el último sello.' },
      { t: 'necropolis', x: 3, y: 8, nombre: 'Necrópolis romana', texto: 'Carmona conserva una necrópolis romana con tumbas excavadas en la roca.' },
      { t: 'puerta', x: 22, y: 7, nombre: 'Puerta de Córdoba', o: { piedra: '#b8946a' }, texto: 'Otra de las puertas de la muralla, en el camino hacia Córdoba.' },
      { t: 'casa', x: 9, y: 1 }, { t: 'fuente', x: 15, y: 10, nombre: 'Fuente de la plaza' }
    ],
    vecinos: [
      { v: 'guardia', x: 6, y: 13, nombre: 'Guardia de la muralla', aventura: 1, dialogo: ['¡Alto! Las puertas de Carmona solo se abren con números que se dejan dividir.', 'Han desaparecido tres sillares mágicos de la muralla. Tráemelos y te enseñaré a abrir los portones.'], pedido: 'Busca los tres sillares brillantes (✦).', listo: 'Bien hecho. Ahora, cada portón: ¿se puede repartir el grupo exactamente?' },
      { v: 'romano', x: 9, y: 13, nombre: 'Arqueóloga Julia', dialogo: ['Carmona fue una ciudad importante en época romana: la llamaban Carmo.', 'Los números primos son como sillares que no se pueden partir en piezas iguales más pequeñas.'] },
      { v: 'pastelera', x: 13, y: 13, nombre: 'Puesto de la plaza', tienda: true, dialogo: ['Pociones de vida a 15 monedas.'] },
      { v: 'alumna', x: 22, y: 13, nombre: 'Lucía', dialogo: ['Truco: un número es divisible entre 3 si la suma de sus cifras es múltiplo de 3.'] }
    ],
    obra: 0, jefe: [26, 6], cofres: [c('c2-a', 2, 14), c('c2-b', 29, 21, 15), c('c2-c', 12, 6)] });

  mundo({ id: 3, suelo: 's', borde: 'h', campoE: 'w', campoF: 'c', arbolesF: 'T',
    edificios: [
      { t: 'torre_barroca', x: 4, y: 0, nombre: 'Torre de San Juan', obra: true, texto: 'Écija es «la ciudad de las torres»: sus torres barrocas lucen azulejos de colores.' },
      { t: 'torre_barroca', x: 7, y: 0, nombre: 'Torre de Santa Cruz', texto: 'Otra de las once torres de Écija.' },
      { t: 'iglesia', x: 24, y: 1, nombre: 'Templo del reloj', o: { ocre: '#e8a060' }, texto: 'Paréntesis Maldito ha convertido el reloj de la torre en una trampa.' },
      { t: 'palacio', x: 2, y: 8, nombre: 'Palacio ecijano', texto: 'Écija tiene muchos palacios barrocos.' },
      { t: 'fuente', x: 15, y: 10, nombre: 'Fuente de la Plaza de España', texto: 'La plaza mayor de Écija, «el Salón».' },
      { t: 'casa', x: 22, y: 8 }
    ],
    vecinos: [
      { v: 'abuela', x: 6, y: 13, nombre: 'Doña Astigi', aventura: 1, dialogo: ['A Écija la llaman «la sartén de Andalucía» por su calor... pero en invierno se baja de cero.', 'El ascensor mágico de la torre necesita tres engranajes perdidos. ¿Me los traes?'], pedido: 'Busca los tres engranajes (✦).', listo: '¡Perfecto! El ascensor sube y baja por plantas positivas y negativas. ¿Cuál está más alta?' },
      { v: 'romano', x: 9, y: 13, nombre: 'Mosaicista', dialogo: ['En época romana Écija se llamaba Astigi y tenía mosaicos espléndidos.'] },
      { v: 'pastelera', x: 13, y: 13, nombre: 'Puesto de la plaza', tienda: true, dialogo: ['Pociones de vida a 15 monedas.'] },
      { v: 'alumno', x: 22, y: 13, nombre: 'Javi', dialogo: ['Menos por menos da más. ¡No lo olvides en el campanario!'] }
    ],
    obra: 0, jefe: [26, 7], cofres: [c('c3-a', 2, 14), c('c3-b', 29, 21, 15), c('c3-c', 12, 6)] });

  mundo({ id: 4, borde: 'M', arbolesE: 'o', campoF: 'w',
    edificios: [
      { t: 'almazara', x: 3, y: 2, nombre: 'Almazara tradicional', obra: true, texto: 'En la almazara se muele la aceituna para obtener el aceite de oliva.' },
      { t: 'puerta', x: 23, y: 1, nombre: 'Puerta de Sevilla de Marchena', texto: 'Puerta de la antigua muralla de Marchena. Simplifract ha robado el libro de las cosechas.' },
      { t: 'casa', x: 9, y: 2 }, { t: 'palacio', x: 2, y: 8, nombre: 'Casa de labor' }, { t: 'casa', x: 23, y: 8 },
      { t: 'fuente', x: 15, y: 10, nombre: 'Fuente' }
    ],
    vecinos: [
      { v: 'agricultor', x: 6, y: 13, nombre: 'Aceitunero Paco', aventura: 1, dialogo: ['El olivar de Marchena se ha dividido en parcelas desiguales.', 'Encuentra los tres sacos de aceitunas perdidos y te enseño a repartir la cosecha.'], pedido: 'Busca los tres sacos (✦).', listo: 'Muy bien. Ahora dime qué fracción de la parcela se ha cosechado.' },
      { v: 'molinera', x: 9, y: 13, nombre: 'Maestra almazarera', dialogo: ['Para sumar fracciones de aceite hay que usar el mismo tamaño de jarra: el común denominador.'] },
      { v: 'pastelera', x: 13, y: 13, nombre: 'Puesto de la plaza', tienda: true, dialogo: ['Pociones de vida a 15 monedas.'] },
      { v: 'alumna', x: 22, y: 13, nombre: 'Carmen', dialogo: ['6/8 y 3/4 son la misma cantidad. ¡Es la misma parcela cortada de otra forma!'] }
    ],
    obra: 0, jefe: [25, 6], cofres: [c('c4-a', 2, 14), c('c4-b', 29, 21, 15), c('c4-c', 12, 6)] });

  mundo({ id: 5, borde: 'h', arbolesE: 'o', arbolesF: 'o', campoE: '.',
    edificios: [
      { t: 'torre_homenaje', x: 25, y: 1, nombre: 'Torre del Homenaje', texto: 'Desde el Cerro de San Cristóbal, la torre domina la campiña: Estepa es el «Balcón de Andalucía».' },
      { t: 'ermita', x: 3, y: 2, nombre: 'Ermita del cerro', obra: true, texto: 'Hay que reconstruir el plano de la ermita a escala.' },
      { t: 'puesto', x: 8, y: 2, nombre: 'Obrador de mantecados', o: { toldo: '#d9a441', genero: '#e8c890' }, texto: 'Estepa es famosa por sus mantecados y polvorones.' },
      { t: 'casa', x: 2, y: 8 }, { t: 'casa', x: 23, y: 8 }, { t: 'fuente', x: 15, y: 10 }
    ],
    vecinos: [
      { v: 'pastelera', x: 6, y: 13, nombre: 'Maestra pastelera', aventura: 1, dialogo: ['¡Se me han perdido tres recetas de mantecados! Están escritas a escala, en proporción.', 'Tráemelas y aprenderás a calcular precios proporcionales.'], pedido: 'Busca las tres recetas (✦).', listo: '¡Gracias! Si 3 cajas cuestan tanto... ¿cuánto cuestan 5?' },
      { v: 'agricultor', x: 9, y: 13, nombre: 'Topógrafo', dialogo: ['En un mapa a escala 1:100 000, 1 cm son 100 000 cm reales, es decir, 1 km.'] },
      { v: 'jardinero', x: 13, y: 13, nombre: 'Puesto de la plaza', tienda: true, dialogo: ['Pociones de vida a 15 monedas.'] },
      { v: 'alumno', x: 22, y: 13, nombre: 'Pablo', dialogo: ['El 25 % es la cuarta parte. ¡Porcentajín intenta liarte con las rebajas!'] }
    ],
    obra: 1, jefe: [26, 7], cofres: [c('c5-a', 2, 14), c('c5-b', 29, 21, 15), c('c5-c', 12, 6)] });

  mundo({ id: 6, borde: 'h', campoE: 'c', arbolesF: 'T', plaza: '=',
    edificios: [
      { t: 'universidad', x: 1, y: 1, nombre: 'Antigua Universidad de Osuna', obra: true, texto: 'La Universidad de Osuna se fundó en el siglo XVI. Sus pergaminos esconden expresiones algebraicas.' },
      { t: 'colegiata', x: 24, y: 1, nombre: 'Colegiata de Osuna', texto: 'Gran templo renacentista. Polinomio Mutante transforma aquí los manuscritos.' },
      { t: 'palacio', x: 2, y: 8, nombre: 'Palacio de la calle San Pedro', texto: 'La calle San Pedro reúne portadas barrocas muy admiradas.' },
      { t: 'palacio', x: 23, y: 8, nombre: 'Casa señorial' }, { t: 'fuente', x: 15, y: 10 }
    ],
    vecinos: [
      { v: 'maestra', x: 6, y: 13, nombre: 'Bibliotecaria', aventura: 1, dialogo: ['Los pergaminos de la Universidad están codificados con letras que valen números.', 'Recupera las tres hojas sueltas y te enseño a descifrarlas.'], pedido: 'Busca las tres hojas (✦).', listo: 'Ahora traduce: «el doble de un número más tres».' },
      { v: 'alumno', x: 9, y: 13, nombre: 'Estudiante', dialogo: ['3x + 5x = 8x porque son términos semejantes. Pero 3x + 5 no se puede juntar.'] },
      { v: 'pastelera', x: 13, y: 13, nombre: 'Puesto de la plaza', tienda: true, dialogo: ['Pociones de vida a 15 monedas.'] },
      { v: 'abuela', x: 22, y: 13, nombre: 'Doña Úrsula', dialogo: ['Un signo menos delante de un paréntesis cambia el signo de todo lo de dentro.'] }
    ],
    obra: 0, jefe: [26, 7], cofres: [c('c6-a', 2, 14), c('c6-b', 29, 21, 15), c('c6-c', 12, 6)] });

  mundo({ id: 7, borde: 'h', rio: true, plaza: 'a', arbolesE: 'P',
    fragmentos: [[3, 7], [28, 13], [8, 21]], enemigo2: [24, 21], minijefe: [6, 21],
    edificios: [
      { t: 'alfareria', x: 3, y: 2, nombre: 'Alfarería trianera', obra: true, texto: 'Triana es famosa por su cerámica y sus azulejos.' },
      { t: 'alcazar', x: 23, y: 1, nombre: 'Torno del Despeje', texto: 'Despejador Oscuro protege el último torno del barrio.' },
      { t: 'casa', x: 8, y: 2 }, { t: 'casa', x: 2, y: 8 }, { t: 'alfareria', x: 23, y: 8, nombre: 'Taller de azulejos' }, { t: 'fuente', x: 15, y: 10 }
    ],
    vecinos: [
      { v: 'alfarero', x: 6, y: 13, nombre: 'Maestro alfarero', aventura: 1, dialogo: ['La balanza del viejo puente solo responde a igualdades equilibradas.', 'Tráeme las tres pesas perdidas y te enseño a equilibrarla.'], pedido: 'Busca las tres pesas (✦).', listo: 'Lo que hagas en un platillo, hazlo en el otro: x + 3 = 7...' },
      { v: 'molinera', x: 9, y: 13, nombre: 'Vecina de Triana', dialogo: ['El Puente de Isabel II, el «puente de Triana», une el barrio con Sevilla desde el siglo XIX.'] },
      { v: 'pastelera', x: 13, y: 13, nombre: 'Puesto de la plaza', tienda: true, dialogo: ['Pociones de vida a 15 monedas.'] },
      { v: 'alumna', x: 22, y: 13, nombre: 'Rocío', dialogo: ['Para comprobar una ecuación, sustituye la solución: los dos lados deben dar lo mismo.'] }
    ],
    obra: 0, jefe: [26, 6], cofres: [c('c7-a', 2, 14), c('c7-b', 29, 21, 15), c('c7-c', 12, 6)] });

  mundo({ id: 8, borde: 'h', rio: true, arbolesE: 'T', arbolesF: 'o',
    fragmentos: [[3, 7], [28, 13], [8, 21]], enemigo2: [24, 21], minijefe: [6, 21],
    edificios: [
      { t: 'molino', x: 3, y: 2, nombre: 'Molino del Guadaíra', obra: true, texto: 'Alcalá de Guadaíra tuvo muchos molinos harineros a orillas del río: de ahí su fama de pueblo panadero.' },
      { t: 'castillo', x: 24, y: 1, nombre: 'Castillo de Alcalá', texto: 'Castillo de origen almohade sobre el río. Parábola Vórtice retuerce aquí el cauce.' },
      { t: 'casa', x: 9, y: 2 }, { t: 'puesto', x: 3, y: 9, nombre: 'Panadería', o: { toldo: '#d9a441', genero: '#d8a050' } }, { t: 'casa', x: 23, y: 8 }, { t: 'fuente', x: 15, y: 10 }
    ],
    vecinos: [
      { v: 'molinera', x: 6, y: 13, nombre: 'Molinera', aventura: 1, dialogo: ['Las ruedas del molino giran al ritmo de las gráficas.', 'Encuentra las tres palas perdidas de la rueda y te enseño el plano de coordenadas.'], pedido: 'Busca las tres palas (✦).', listo: 'Primero la x (izquierda-derecha), luego la y (arriba-abajo). ¿En qué cuadrante está?' },
      { v: 'agricultor', x: 9, y: 13, nombre: 'Panadero', dialogo: ['El pan de Alcalá era famoso en Sevilla. Cuanto más trigo, más pan: ¡una función creciente!'] },
      { v: 'pastelera', x: 13, y: 13, nombre: 'Puesto de la plaza', tienda: true, dialogo: ['Pociones de vida a 15 monedas.'] },
      { v: 'alumno', x: 22, y: 13, nombre: 'Dani', dialogo: ['Si en y = mx + n la m es negativa, la recta baja.'] }
    ],
    obra: 0, jefe: [26, 6], cofres: [c('c8-a', 2, 14), c('c8-b', 29, 21, 15), c('c8-c', 12, 6)] });

  mundo({ id: 9, suelo: 's', borde: 'h', plaza: 'x', arbolesE: 'r', arbolesF: 'k',
    edificios: [
      { t: 'columnas', x: 3, y: 3, nombre: 'Ruinas de Itálica', obra: true, texto: 'Itálica fue fundada por Escipión en el 206 a. C., cerca de la actual Santiponce.' },
      { t: 'anfiteatro', x: 22, y: 1, nombre: 'Anfiteatro de Itálica', texto: 'Uno de los mayores anfiteatros del mundo romano. Gráfico Tramposo controla la votación.' },
      { t: 'columnas', x: 8, y: 3, nombre: 'Templo' }, { t: 'casa', x: 2, y: 8, o: { cal: '#f0e4cc', teja: '#a8503a' } }, { t: 'casa', x: 23, y: 8, o: { cal: '#f0e4cc', teja: '#a8503a' } }, { t: 'fuente', x: 15, y: 10 }
    ],
    vecinos: [
      { v: 'romano', x: 6, y: 13, nombre: 'Organizador del censo', aventura: 1, dialogo: ['Necesito contar a los espectadores del anfiteatro, ¡pero se han perdido las tablillas!', 'Tráeme las tres tablillas y ordenaremos los datos.'], pedido: 'Busca las tres tablillas (✦).', listo: 'Veamos qué dato se repite más en el censo.' },
      { v: 'romano', x: 9, y: 13, nombre: 'Historiadora', dialogo: ['Los emperadores Trajano y Adriano están ligados a Itálica.'] },
      { v: 'pastelera', x: 13, y: 13, nombre: 'Puesto de la plaza', tienda: true, dialogo: ['Pociones de vida a 15 monedas.'] },
      { v: 'alumna', x: 22, y: 13, nombre: 'Marta', dialogo: ['Desconfía de los gráficos cuyo eje no empieza en cero.'] }
    ],
    obra: 0, jefe: [26, 7], cofres: [c('c9-a', 2, 14), c('c9-b', 29, 21, 15), c('c9-c', 12, 6)] });

  mundo({ id: 10, borde: 'h', plaza: 'a', arbolesE: 'T', arbolesF: 'P', campoE: '.', fragmentos: [[10, 4], [28, 13], [8, 21]],
    edificios: [
      { t: 'alcazar', x: 1, y: 2, nombre: 'Real Alcázar', obra: true, texto: 'Palacio con jardines y arcos de tradición mudéjar.' },
      { t: 'giralda', x: 27, y: 0, nombre: 'La Giralda', texto: 'Antiguo alminar almohade convertido en campanario de la Catedral, coronado por el Giraldillo.' },
      { t: 'torre_oro', x: 22, y: 2, nombre: 'Torre del Oro', texto: 'Torre almohade junto al Guadalquivir.' },
      { t: 'plaza_espana', x: 1, y: 7, nombre: 'Plaza de España', texto: 'Construida para la Exposición Iberoamericana de 1929.' },
      { t: 'casa', x: 18, y: 1 }, { t: 'fuente', x: 15, y: 10 }
    ],
    vecinos: [
      { v: 'jardinero', x: 11, y: 13, nombre: 'Jardinero del Alcázar', aventura: 1, dialogo: ['En los jardines aparecen dados con rutas alternativas.', 'Encuentra los tres dados perdidos y aprenderemos qué puede pasar al lanzarlos.'], pedido: 'Busca los tres dados (✦).', listo: '¿Cuántos resultados distintos tiene un dado de seis caras?' },
      { v: 'abuela', x: 9, y: 13, nombre: 'Sevillana', dialogo: ['La probabilidad siempre está entre 0 (imposible) y 1 (seguro).'] },
      { v: 'pastelera', x: 13, y: 13, nombre: 'Puesto de la plaza', tienda: true, dialogo: ['Pociones de vida a 15 monedas.'] },
      { v: 'alumno', x: 22, y: 13, nombre: 'Álvaro', dialogo: ['¡Último mundo! Ruleta Imposible guarda la décima pieza del Compás.'] }
    ],
    jefe: [24, 8], obra: 0, cofres: [c('c10-a', 2, 14), c('c10-b', 29, 21, 15), c('c10-c', 12, 6)] });

  root.GaloisMundos = { lista: M, W: W, H: H };
})(window);
