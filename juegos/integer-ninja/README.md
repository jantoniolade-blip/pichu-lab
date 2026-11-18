# Integer Ninja · πCHU ROYALE

Copia de `Aula-de-Matematicas/integer-ninja` (commit `4d88fad`) con aspecto pixel art 16-bit.
**La jugabilidad no cambia**: motor matemático, niveles, misiones, puntuación, logros, retos, ranking y guardado son los originales.

## Qué se ha cambiado en `index.html`

Ver `git diff c0017d8 -- juegos/integer-ninja/index.html`. Son 16 líneas:

1. Título, descripción y `theme-color`: «πCHU ARCADE» → «πCHU ROYALE».
2. Carga de las fuentes pixel (Press Start 2P y Pixelify Sans).
3. Carga de `pixel-skin.css` y `pixel-skin.js` (quitar esas dos líneas devuelve el aspecto original).
4. Menú: botón «◀ πCHU ROYALE» para volver a la portada y cartel «Mundo 3 · Números enteros» con Negatrón y Paréntesis Maldito del banco de recursos.
5. Bloque `MARCA` (el que el propio juego reserva para la identidad): nombre, paleta del manifest y fuente. Los valores originales quedan en un comentario.
6. Texto de marca del justificante: «πCHU ROYALE».

## Capa visual

- `pixel-skin.css`: paleta violeta-dorado-turquesa-crema, ventanas tipo RPG, bordes rectos, sombras duras y barras segmentadas.
- `pixel-skin.js`: πCHU y los guardianes se reducen a sprites de 72 px y se amplían sin suavizar. El lienzo se dibuja con `image-rendering: pixelated`. La variable `PIXEL` (1 por defecto) permite un aspecto más retro (2), pero entonces los números pequeños de la recta numérica dejan de leerse bien en el móvil.

## Sin copiar

- `apps-script/Code.gs` del repositorio original: contiene la clave real de la clase. El juego ya incluye el código de Apps Script con la clave de ejemplo `cambia-esta-clave` en sus ajustes docentes.

## Ranking

`api/ranking.js` es una función de servidor de Vercel. En GitHub Pages el ranking en vivo no funciona; el resto del juego sí.
