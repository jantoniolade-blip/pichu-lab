/* Exporta las hojas de sprites a PNG + JSON en assets/galois/sprites/.
   Uso (desde la raíz del repositorio):  node herramientas/exportar-sprites.js
   Requiere Playwright con Chromium (ya instalado en el entorno de desarrollo). */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const raiz = path.resolve(__dirname, '..');
  const out = path.join(raiz, 'assets/galois/sprites');
  fs.mkdirSync(path.join(out, 'heroes'), { recursive: true });
  fs.mkdirSync(path.join(out, 'enemigos'), { recursive: true });
  fs.mkdirSync(path.join(out, 'jefes'), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file://' + path.join(raiz, 'herramientas/sprites.html'));
  const datos = await p.evaluate(() => {
    const S = window.GaloisSprites, r = { heroes: {}, enemigos: {}, jefes: {} };
    const meta = h => ({ fw: h.fw, fh: h.fh, pie: h.pie, filas: h.filas, anims: h.anims });
    Object.keys(S.heroes).forEach(id => { const h = S.hojaHeroe(id); r.heroes[id] = { png: h.canvas.toDataURL('image/png'), meta: meta(h) }; });
    Object.keys(S.enemigos).forEach(id => {
      const h = S.hojaEnemigo(id); r.enemigos[id] = { png: h.canvas.toDataURL('image/png'), meta: meta(h) };
      [1, 2, 3].forEach(f => { const j = S.hojaEnemigo(id, { jefe: true, fase: f }); r.jefes[id + '-fase' + f] = { png: j.canvas.toDataURL('image/png'), meta: meta(j) }; });
    });
    return r;
  });
  const atlas = { generador: 'shared/galois-sprites.js', nota: 'Fotogramas por fila: animación-dirección. Columnas: fotogramas.', heroes: {}, enemigos: {}, jefes: {} };
  for (const grupo of ['heroes', 'enemigos', 'jefes']) {
    for (const [id, v] of Object.entries(datos[grupo])) {
      const file = `${grupo}/${id}.png`;
      fs.writeFileSync(path.join(out, file), Buffer.from(v.png.split(',')[1], 'base64'));
      atlas[grupo][id] = Object.assign({ imagen: file }, v.meta);
    }
  }
  fs.writeFileSync(path.join(out, 'atlas.json'), JSON.stringify(atlas, null, 1));
  console.log('Hojas exportadas en', out);
  await b.close();
})();
