# GALOIS LEGACY · inspección y plan de transformación

Documento de trabajo que sigue el «Orden de trabajo» del documento de diseño
*GALOIS LEGACY · Diseño y prompt para Claude* (referencia visual en
`assets/galois/identidad/concepto-referencia.jpg`).

## 1. Estado del proyecto

**Tecnología:** sitio estático en HTML, CSS y JavaScript sin dependencias ni compilación,
publicado con GitHub Pages. Fuente Jersey 10 (Google Fonts). Cada juego es un módulo
independiente en `juegos/<id>/`.

| Pieza | Archivo | Qué hace |
|---|---|---|
| Integer Ninja | `juegos/integer-ninja/` | Números enteros: cortar frutas, niveles, jefes (Rey de los Signos), logros, retos por código. Ranking en vivo solo en Vercel. |
| Divisibilidad | `juegos/divisibilidad/index.html` y `facil.html` | Duelo de cartas y modo fácil de 10 preguntas. Motor compartido en `motor.js`. |
| Fracciones | `juegos/fracciones/` | Laboratorio: colorear, probeta, simplificar, problemas de Biología y Geología. |
| Capa visual de cada juego | `pixel-skin.css` y `pixel-skin.js` | Solo aspecto: no toca la lógica. |
| Tema anterior | `shared/pichu-theme.css`, `shared/pixel-sprites.js` | Paleta y componentes de πCHU ROYALE. |
| Banco de recursos | `assets/pichu-royale/` | 8 héroes, 20 enemigos (2 por tema), 26 iconos (corazón, cofre, pociones, llave…), 4 escenarios. |

## 2. Qué se reutiliza y qué hay que adaptar

**Se reutiliza tal cual:** los tres juegos, con sus preguntas, correcciones, niveles y
puntuaciones; los enemigos del banco (se convierten en los enemigos de cada reino); los iconos
(corazones, cofres, pociones, llaves, gemas) para la interfaz RPG; los héroes del banco que coinciden
con el documento (Gauss, Noether, Hipatia, Ada Lovelace y Fibonacci).

**Hay que crear:** Galois, Euler y Fermat (no estaban en el banco), el logotipo, el mapa,
la pantalla de selección, los jefes de los reinos que aún no tienen uno, y animaciones de movimiento y combate.

**Hay que adaptar:** la marca πCHU dentro de los juegos (textos y estilos de cada `pixel-skin`),
el tema común (de violeta nocturno a verde, azul, dorado y violeta) y la conexión entre los juegos
y el progreso del jugador (corazones, experiencia, símbolos recuperados).

**Diferencias con el documento que necesitan decisión:**

1. El documento propone 5 reinos de ejemplo; el proyecto tiene juego para 3 unidades
   (Enteros, Divisibilidad y Fracciones). Divisibilidad no aparece en el documento: se ha
   llamado provisionalmente **Minas de los Primos**. Álgebra, Geometría y Costa de π se muestran
   bloqueados («Por descubrir») hasta que haya juego.
2. Sophie Germain, Ramanujan y Al-Juarismi estaban en el banco y no figuran en el documento.
   No se han eliminado: aparecen como «Más aliados» en la selección.
3. Bosque de las Fracciones y Minas de los Primos no tienen todavía jefe final.

## 3. Plan incremental y reversible

Cada fase va en commits propios en la rama `dev` y solo pasa a `main` tras probarla.
Ninguna fase modifica la lógica matemática de los juegos.

| Fase | Contenido | Estado |
|---|---|---|
| A | Identidad: logotipo, tema `galois-theme.css`, pantalla de inicio, selección de matemático, mapa de Gaussoria con enlaces a los juegos | **Hecha (primera versión)** |
| B | Marca GALOIS LEGACY dentro de los juegos: nueva paleta en sus `pixel-skin`, matemático elegido visible en el juego | Pendiente |
| C | Progreso común (`localStorage` del navegador): corazones, experiencia y símbolo recuperado al terminar un juego, mostrado en el mapa | Pendiente: requiere un pequeño gancho al final de cada juego |
| D | Habilidades de los matemáticos actuando dentro de los juegos (pistas, segundo intento, más tiempo…) | Pendiente: hay que decidir cuáles se aplican a cada juego |
| E | Animaciones: paseo por el mapa, ataques y golpes en combate | Pendiente |
| F | Jefes que faltan y nuevos reinos cuando se añadan juegos | Pendiente |

**Cómo deshacer la fase A:** la portada anterior se conserva en `pichu-royale.html`. Basta con
volver a llamarla `index.html` y restaurar el enlace «◀ πCHU ROYALE» de los cuatro juegos
(solo cambió esa línea en cada uno).

## Recursos nuevos (fase A)

- `assets/galois/identidad/logo-galois-legacy.svg`: logotipo pixel art original (SVG nítido a cualquier tamaño).
- `assets/galois/heroes/galois.png`, `euler.png`, `fermat.png`: sprites originales de 64×64 ampliados a 256 px.
  Galois con levita de la década de 1830 y capa; Euler con el gorro de tela de su retrato más conocido; Fermat con toga de magistrado y cuello blanco.
- `assets/galois/mapa/gaussoria.png`: mapa de 192×120 px generado por código, sin recursos de terceros.
- `shared/galois-data.js`: fuente única de matemáticos, habilidades y reinos.
- `shared/galois-theme.css`: paleta y componentes (marco dorado, cinta, botones de 48 px como mínimo).

No se usan nombres, personajes, símbolos, música ni diseños de ninguna saga comercial.


## Campiña sevillana y álbum de cartas (expansión)

La nueva capa de mundo `shared/galois-campina.js` transforma Gaussoria en 10 reinos de la Campiña sevillana; el mapa se encuentra en `assets/galois/mapa/campina-sevillana.svg`. Los tres juegos activos se conservan y los siete mundos sin minijuego siguen bloqueados.

[🃏 Abrir el álbum de 60 cartas](coleccion/index.html) · [Ver el catálogo y las 50 aventuras](coleccion/CATALOGO_60_CARTAS.md) · [Guía de integración para Claude](coleccion/GUIA_PARA_CLAUDE.md).

El progreso es cosmético, separado de la evaluación y asociado a un alias local del navegador; se puede importar/exportar en JSON. Los iconos de las cartas son SVG originales generados desde `coleccion/album.js` (no se han importado retratos, insignias ni imágenes oficiales).
