# Reino de la divisibilidad · πCHU ROYALE

Dos formas de jugar, con las mismas preguntas y la misma corrección:

| Archivo | Qué es |
|---|---|
| `index.html` | **Duelo de cartas** original (artefacto «πCHU Royale · Duelo de divisibilidad», versión 1793520555-a842). Jugabilidad sin cambios. |
| `facil.html` | **Modo fácil, sin cartas**: 10 preguntas de 4 opciones contra Múltiplax o Prímox. Fallar no quita vidas: se muestra la explicación y se sigue. |
| `motor.js` | Copia literal del bloque «MOTOR (sin DOM)» de `index.html`. El modo fácil usa sus generadores (`GEN`) y su corrección (`evaluar`), así que las preguntas y explicaciones son las mismas que en el duelo. |
| `pixel-skin.css` | Capa pixel art del duelo (solo aspecto). |

## Cambios en `index.html` (ver `git diff c9359d1 -- juegos/divisibilidad/index.html`)

- `theme-color`, fuentes pixel, `pixel-skin.css` y `../../shared/pixel-sprites.js` (retratos pixelados).
- Enlaces «◀ πCHU ROYALE» y «MODO FÁCIL ▶», visibles solo en la pantalla de inicio.

## Modo fácil

- Temas: Divisores (¿cuántos divisores?, el intruso) · Primos y potencias (reconstruye el número) · MCD y mcm · Mezcla (incluye el número secreto).
- Dificultad Fácil/Medio = niveles 0 y 2 del motor (las dos tablas de números del original).
- Comprobado con 36 000 preguntas generadas: siempre una única respuesta correcta y al menos 3 incorrectas.
- Guarda en el navegador el tema elegido y el récord por tema (sin datos personales).
