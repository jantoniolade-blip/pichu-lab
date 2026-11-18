# πCHU ROYALE — Banco de recursos pixel art

**Subtítulo:** *La rebelión de los números*  
**Curso:** Matemáticas de 1.º ESO  
**Versión:** 1.0 — concepto visual y assets estáticos.

Este pack sirve para continuar el videojuego con Claude, sin perder los juegos existentes.

## Contenido

- `heroes/`: **8 matemáticas y matemáticos** jugables, retratos PNG con transparencia, 256 × 256 px.
- `enemigos/`: **20 adversarios** (2 por tema × 10 temas), PNG con transparencia, 256 × 256 px.
- `iconos/`: 26 iconos y tiles sencillos, 128 × 128 px; los tiles tienen fondo y los objetos se han segmentado.
- `escenarios/`: 4 vistas de escenarios 512 × 368 px para referencia y prototipos, no fondos finales de alta resolución.
- `identidad/`: logo ilustrado. Es un recorte conceptual de la lámina, no una identidad vectorial terminada.
- `catalogo/`: 3 láminas maestras originales para usar como referencias visuales.
- `atlas/`: 3 atlas transparentes para motores de juego y un `atlas.json` con coordenadas exactas.
- `manifest.json`: catálogo estructurado con nombres, habilidades, relación tema-enemigo y rutas de imagen.
- `index.html`: galería local navegable con buscador, filtros y fichas.
- `PROMPT_PARA_CLAUDE.md`: encargo listo para copiar en Claude.

## Nombre recomendado

**πCHU ROYALE** — *La rebelión de los números*. Conserva tu identidad original y sustituye **Math/Mad Quest** en pantallas, títulos y menús.

Alternativas: **πCHU ARCADE**, **NUMERIA: Pixel Legends**, **EL REINO DE π**.

## Integración rápida

1. Descomprime la carpeta `Pichu_Royale_Banco_Assets` dentro del proyecto del videojuego (por ejemplo `public/assets/pichu-royale/`).
2. Lee `manifest.json` para asociar personajes, enemigos y temas. Evita introducir nombres a mano.
3. Usa CSS `image-rendering: pixelated` para escalar los PNG sin suavizarlos.
4. Conserva el videojuego existente y añade el selector de héroe y el catálogo de enemigos de forma modular.
5. Carga de manera diferida los assets y ofrece controles táctiles para móviles y tabletas.

## Importante para el desarrollo

- Los héroes son **retratos estáticos** y los enemigos son **sprites estáticos**. Todavía no incluyen `idle`, `run`, `attack`, `hurt` ni `defeat` animados. Son aptos para menús, selectores, tarjetas y prototipos de encuentros.
- Algunas imágenes provienen de una lámina conceptual generada: revisa los contornos y la legibilidad visual en pequeño antes de publicarlas.
- Las habilidades son mecánicas propuestas, no hechos históricos; sus fichas históricas pueden ampliarse en el juego.
- El catálogo adopta diez bloques para este juego. Puedes reorganizarlos conforme a la programación oficial y evitar que los alumnos vean criterios aún no trabajados.
- Los puntos y recompensas del juego no deben reemplazar la evaluación oficial por criterios; usa alias y evita publicar información del alumnado.
