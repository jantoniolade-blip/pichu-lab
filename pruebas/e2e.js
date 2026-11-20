/* Pruebas de extremo a extremo con Playwright (Chromium).
   Uso: node pruebas/e2e.js   (abre las páginas con file://, sin servidor)
   1. Sin errores de JavaScript en portada, álbum, aventura y los tres juegos.
   2. Cada objetivo de los 10 mapas es alcanzable caminando desde el inicio.
   3. Partida completa de los 10 mundos en modo prueba (?prueba=1, sin guardar
      recompensas): se responde bien a todo y se comprueba que avanzan las aventuras.
   4. Reglas de recompensa: cartas aleatorias, legendaria con excelencia, sin
      cartas extra al repetir, y ninguna recompensa por solo abrir la página. */
const { chromium } = require('playwright');
const path = require('path');
const raiz = 'file://' + path.resolve(__dirname, '..') + '/';
let fallos = 0;
const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fallos++; };

(async () => {
  const b = await chromium.launch();
  // 1. errores de carga
  for (const pag of ['index.html', 'coleccion/index.html', 'aventura/index.html', 'juegos/divisibilidad/facil.html', 'juegos/fracciones/index.html', 'juegos/integer-ninja/index.html', 'herramientas/sprites.html']) {
    const p = await b.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(raiz + pag); await p.waitForTimeout(700);
    ok(errs.length === 0, 'sin errores JS en ' + pag + (errs.length ? ' → ' + errs.join(' | ') : ''));
    await p.close();
  }
  // 2. alcanzabilidad
  {
    const p = await b.newPage(); await p.goto(raiz + 'aventura/index.html?prueba=1'); await p.waitForTimeout(400);
    const res = await p.evaluate(() => {
      const E = GaloisEscenarios, MW = GaloisMundos, out = [];
      MW.lista.forEach(m => {
        const sol = m.mapa.t.map(r => r.map(c => E.solido(c) && !E.TILES[c].cortable && !E.saltable(c)));  // con el compás y el salto
        m.edificios.forEach(bd => { const d = E.EDIF[bd.t]; for (let j = bd.y; j < bd.y + d[1]; j++) for (let i = bd.x; i < bd.x + d[0]; i++) if (sol[j]) sol[j][i] = !(bd.paso && bd.paso.includes(i - bd.x)); });
        const ocupado = {}; m.vecinos.forEach(v => { ocupado[v.x + ',' + v.y] = 'vecino ' + v.nombre; }); m.cofres.forEach(c => { ocupado[c.x + ',' + c.y] = 'cofre ' + c.id; });
        const problemas = [];
        Object.entries(ocupado).forEach(([k, n]) => { const [x, y] = k.split(',').map(Number); if (sol[y][x]) problemas.push(n + ' sobre casilla sólida'); });
        const vis = {}, cola = [m.inicio]; vis[m.inicio.join()] = 1;
        while (cola.length) { const [x, y] = cola.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (nx < 0 || ny < 0 || nx >= MW.W || ny >= MW.H || vis[k] || sol[ny][nx] || ocupado[k]) return; vis[k] = 1; cola.push([nx, ny]); }); }
        const cerca = (x, y) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => vis[(x + dx) + ',' + (y + dy)]);
        if (sol[m.inicio[1]][m.inicio[0]]) problemas.push('inicio sólido');
        m.fragmentos.forEach((f, i) => { if (!vis[f.join()]) problemas.push('fragmento ' + i + ' inalcanzable'); });
        m.vecinos.forEach(v => { if (!cerca(v.x, v.y)) problemas.push('vecino ' + v.nombre + ' inalcanzable'); });
        m.cofres.forEach(c => { if (!cerca(c.x, c.y)) problemas.push('cofre ' + c.id + ' inalcanzable'); });
        [['enemigo2', m.enemigo2], ['minijefe', m.minijefe], ['jefe', m.jefe]].forEach(([n, q]) => { if (sol[q[1]][q[0]]) problemas.push(n + ' sobre casilla sólida'); if (!cerca(q[0], q[1])) problemas.push(n + ' inalcanzable'); });
        const ob = m.edificios[m.obra], d = E.EDIF[ob.t]; let fr = false; for (let i = ob.x; i < ob.x + d[0]; i++) if (vis[i + ',' + (ob.y + d[1])]) fr = true; if (!fr) problemas.push('fachada de la obra inalcanzable');
        if (!vis[m.salida.join()] && !cerca(m.salida[0], m.salida[1] - 1)) problemas.push('salida inalcanzable');
        out.push([m.id, problemas]);
      });
      return out;
    });
    res.forEach(([id, pr]) => ok(pr.length === 0, 'mundo ' + id + ': todos los objetivos alcanzables' + (pr.length ? ' → ' + pr.join('; ') : '')));
    await p.close();
  }
  // 2b. atacar y saltar en la exploración
  {
    const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(raiz + 'aventura/index.html?prueba=1'); await p.waitForTimeout(300);
    const r = await p.evaluate(async () => {
      const espera = ms => new Promise(f => setTimeout(f, ms)), G = __GL.G, out = {};
      __GL.cargarMundo(2); G.jug.x = 25 * 16 + 4; G.jug.y = 15 * 16 + 14; G.jug.dir = 'right';
      out.antes = __GL.tile(26, 15); __GL.atacar(); out.despues = __GL.tile(26, 15);
      __GL.cargarMundo(3); G.jug.x = 23 * 16 + 8; G.jug.y = 10 * 16 + 14; G.jug.dir = 'up'; const y0 = G.jug.y;
      __GL.saltar(); await espera(700); out.salto = y0 - G.jug.y;
      __GL.cargarMundo(1); await espera(50); G.jug.x = 0; const pend = __GL.pendiente();
      return out;
    });
    ok(r.antes === 'm' && r.despues === '.', 'el compás corta un matorral');
    ok(r.salto >= 28, 'se puede saltar una valla (' + r.salto + ' px)');
    ok(errs.length === 0, 'atacar y saltar sin errores JS');
    await p.close();
  }
  // 3. partida completa (modo prueba)
  {
    const ctx = await b.newContext({ viewport: { width: 1024, height: 768 } }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(raiz + 'aventura/index.html?prueba=1'); await p.waitForTimeout(400);
    for (let m = 1; m <= 10; m++) {
      await p.evaluate(mm => __GL.cargarMundo(mm), m);
      for (let e = 1; e <= 5; e++) {
        await p.evaluate(ee => __GL.iniciarAventura(ee), e);
        for (let k = 0; k < 12; k++) {
          const fin = await p.evaluate(() => !__GL.G.batalla || __GL.G.batalla.terminado);
          if (fin) break;
          await p.evaluate(() => {
            const r = __GL.respuesta(), op = [...document.querySelectorAll('#rOpciones .op')].find(x => GaloisRetos.igual(x.dataset.op, r));
            if (op) op.click(); else { document.getElementById('rEntrada').textContent = r.replace('−', '−'); document.querySelector('[data-k=ok]').click(); }
          });
          await p.waitForTimeout(30);
          await p.evaluate(() => { const s = document.getElementById('rSeguir'); if (s) s.click(); });
        }
        await p.waitForTimeout(1500);
        await p.evaluate(() => { const s = document.getElementById('pSeguir'); if (!document.getElementById('premio').hidden) s.click(); });
      }
      const pend = await p.evaluate(() => __GL.pendiente());
      ok(pend === 0, 'mundo ' + m + ': las cinco aventuras se completan respondiendo bien');
    }
    ok(errs.length === 0, 'partida sin errores JS' + (errs.length ? ' → ' + errs.slice(0, 3).join(' | ') : ''));
    const guardado = await p.evaluate(() => GaloisColeccion.rpg.estado());
    ok(guardado.xp === 0 && guardado.cartas.length === 0, 'el modo prueba no guarda recompensas');
    await ctx.close();
  }
  // 4. reglas de recompensa
  {
    const ctx = await b.newContext(); const p = await ctx.newPage();
    await p.goto(raiz + 'aventura/index.html'); await p.waitForTimeout(400);
    const r = await p.evaluate(() => {
      const C = GaloisColeccion, out = {};
      out.inicial = C.rpg.estado().cartas.length;
      const a1 = C.rpg.completarAventura({ mundo: 3, etapa: 1, errores: 0, dificultad: 'aventurero' });
      out.unaCarta = a1.cartas.length === 1 && a1.cartas[0].mundo === 3 && a1.cartas[0].etapa <= 5;
      const rep = C.rpg.completarAventura({ mundo: 3, etapa: 1, errores: 0, dificultad: 'aventurero' });
      out.repetir = rep.cartas.length === 0 && rep.xp < a1.xp;
      [2, 3, 4].forEach(e => C.rpg.completarAventura({ mundo: 3, etapa: e, errores: 0, dificultad: 'aventurero' }));
      const jefe = C.rpg.completarAventura({ mundo: 3, etapa: 5, errores: 1, dificultad: 'maestro' });
      out.legendaria = jefe.cartas.some(c => c.etapa === 6);
      out.insignia = C.rpg.estado().insignias.includes(3);
      out.seis = C.rpg.estado().cartas.filter(id => id.startsWith('campina-3-')).length === 6;
      out.logros = C.rpg.estado().logros;
      // la compatibilidad con los minijuegos: 5 retos distintos → 5 cartas
      ['n1', 'n2', 'n2', 'n3', 'n4', 'n5'].forEach(k => C.registrarResultado({ mundo: 4, reto: k, superado: true, excelencia: false }, true));
      out.mini = C.rpg.estado().cartas.filter(id => id.startsWith('campina-4-')).length === 5;
      return out;
    });
    ok(r.inicial === 0, 'abrir la aventura no concede cartas');
    ok(r.unaCarta, 'superar una aventura concede una carta del mundo (al azar entre las 5 normales)');
    ok(r.repetir, 'repetir una aventura no concede cartas y da menos experiencia');
    ok(r.legendaria && r.seis, 'vencer al jefe con como mucho un error concede la legendaria');
    ok(r.insignia && r.logros.includes('mundo-3') && r.logros.includes('maestro'), 'insignia y logros del mundo');
    ok(r.mini, 'los minijuegos siguen concediendo una carta por reto distinto');
    await ctx.close();
  }
  // 5. música: cada pista suena (render sin conexión) y no rompe la aventura
  {
    const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(raiz + 'aventura/index.html?prueba=1'); await p.waitForTimeout(300);
    const niveles = await p.evaluate(async () => { const out = {}; for (const [n, op] of [['campina'], ['mundo', { mundo: 1 }], ['mundo', { mundo: 7 }], ['reto', { mundo: 3 }], ['combate'], ['jefe', { fase: 3 }], ['victoria'], ['derrota']]) out[n + (op && op.mundo || '')] = await GaloisMusica._renderizar(n, op, 3); return out; });
    Object.entries(niveles).forEach(([n, v]) => ok(v.rms > .005 && v.pico < 1.5, 'música «' + n + '» suena (RMS ' + v.rms.toFixed(3) + ')'));
    const distintas = await p.evaluate(() => { const a = GaloisMusica._pista('mundo', { mundo: 1 }).mel.join(), c = GaloisMusica._pista('mundo', { mundo: 2 }).mel.join(); return a !== c; });
    ok(distintas, 'cada mundo tiene su propia melodía');
    ok(errs.length === 0, 'música sin errores JS');
    await p.close();
  }
  await b.close();
  console.log(fallos ? `✗ ${fallos} comprobaciones fallidas` : '✓ Todas las comprobaciones superadas');
  process.exit(fallos ? 1 : 0);
})();
