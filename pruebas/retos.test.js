/* Pruebas de los generadores de retos (node pruebas/retos.test.js).
   Comprueba miles de preguntas: respuesta presente, distractores distintos de
   la respuesta, textos sin «undefined»/«NaN» y verificaciones matemáticas
   independientes para los retos numéricos que se pueden recalcular. */
const R = require('../aventura/retos.js');
let fallos = 0, total = 0;
function mal(id, msg, q) { fallos++; if (fallos < 40) console.log('✗', id, msg, JSON.stringify(q)); }
const num = s => R.valor(s);
const checks = {
  // recalcula a partir del enunciado
  '1-2': q => { const m = q.texto.match(/vale (\d)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/); if (!m) return true; const e = +[...m[2]].map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join(''); return num(q.respuesta) === Math.pow(+m[1], e); },
  '1-4': q => { const m = q.texto.match(/√(\d+)|mide (\d+) m²/); const n = +(m[1] || m[2]); return num(q.respuesta) ** 2 === n; },
  '2-4': q => { const m = q.texto.match(/MCD\((\d+), (\d+)\)/); return num(q.respuesta) === R.mcd(+m[1], +m[2]); },
  '2-1': q => { const m = q.texto.match(/¿(\d+) es divisible entre (\d+)/); return (q.respuesta === 'Sí') === (+m[1] % +m[2] === 0); },
  '2-2': q => R.esPrimo(+q.respuesta) && q.distractores.every(d => !R.esPrimo(+d)),
  '3-2': q => { const m = q.texto.match(/Calcula (−?\d+) ([−+]) (\d+)/); const a = num(m[1]), b = +m[3] * (m[2] === '−' ? -1 : 1); return num(q.respuesta) === a + b; },
  '3-4': q => { const m = q.texto.match(/(−\d+)·\((\d+) − (\d+)\)/); return num(q.respuesta) === num(m[1]) * (+m[2] - +m[3]); },
  '4-4': q => { const m = q.texto.match(/mezcla (\d+)\/(\d+) y (\d+)\/(\d+)/); return Math.abs(num(q.respuesta) - (m[1] / m[2] + m[3] / m[4])) < 1e-9; },
  '5-2': q => { const m = q.texto.match(/(\d+)\/(\d+) = x\/(\d+)/); return num(q.respuesta) === m[1] * m[3] / m[2]; },
  '6-2': q => { const m = q.texto.match(/calcula (\d+)x \+ (\d+) para x = (−?\d+)/); return num(q.respuesta) === m[1] * num(m[3]) + +m[2]; },
  '7-1': q => { const m = q.texto.match(/x \+ (\d+) = (\d+)/); return num(q.respuesta) + +m[1] === +m[2]; },
  '7-2': q => { const m = q.texto.match(/x − (\d+) = (−?\d+)/); return num(q.respuesta) - +m[1] === num(m[2]); },
  '7-3': q => { const m = q.texto.match(/(\d+)x \+ (\d+) = (\d*)x \+ (\d+)/); const x = num(q.respuesta), c = m[3] === '' ? 1 : +m[3]; return m[1] * x + +m[2] === c * x + +m[4]; },
  '9-2': q => { const d = q.texto.match(/MEDIA de ([\d, ]+)\?/)[1].split(',').map(Number); return Math.abs(num(q.respuesta) - d.reduce((a, b) => a + b) / d.length) < 1e-9; },
  '10-5': q => { if (q.fase !== 2) return true; const m = q.texto.match(/(\d+) bolas rojas y (\d+) azules/); return Math.abs(num(q.respuesta) - m[1] / (+m[1] + +m[2])) < 1e-9; }
};
for (let w = 1; w <= 10; w++) for (let e = 1; e <= 5; e++) for (let dif = 0; dif <= 2; dif++) for (let it = 0; it < 150; it++) {
  const id = w + '-' + e, qs = R.preguntas(w, e, dif);
  if (!qs.length) { mal(id, 'sin preguntas'); continue; }
  if (e === 5 && dif > 0 && qs.length !== 6) mal(id, 'jefe debe tener 6 preguntas', qs.length);
  for (const q of qs) {
    total++;
    const txt = JSON.stringify(q);
    if (/undefined|NaN|null|Infinity/.test(txt)) mal(id, 'texto inválido', q);
    if (!q.respuesta) mal(id, 'sin respuesta', q);
    if (q.distractores.length < 2) mal(id, 'menos de 2 distractores', q);
    if (q.distractores.some(d => R.igual(d, q.respuesta))) mal(id, 'un distractor coincide con la respuesta', q);
    if (!q.explicacion || !q.pista) mal(id, 'sin explicación o pista', q);
    if (checks[id] && !checks[id](q)) mal(id, 'respuesta matemáticamente incorrecta', q);
  }
}
console.log(fallos ? `✗ ${fallos} fallos en ${total} preguntas` : `✓ ${total} preguntas comprobadas sin fallos`);
process.exit(fallos ? 1 : 0);
