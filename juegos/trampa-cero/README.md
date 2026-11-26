# Trampa Cero

Prueba interactiva de números enteros para 1.º ESO: 17 retos en una sola partida, ambientados en Fuentes de Andalucía y en el IES Alarifes Ruiz Florindo.

- **Retos 1–7**: acertijos en la escena (tocar, arrastrar, descubrir objetos escondidos): comparar, ordenar, opuesto, suma, resta, producto y suma cero.
- **Retos 8–17**: problemas de clase con respuesta escrita: edades y fechas a. C./d. C. (sin año 0) y saldos bancarios (saldo final, ingreso, cobro, diferencia y saldo inicial).
- Una pista opcional por reto con «?». Música chiptune original (Web Audio), apagada al empezar, con «♫».
- El avance se guarda en el navegador (`localStorage`, clave `trampa-cero-v2`).

## Archivos

| Archivo | Contenido |
|---|---|
| `index.html` | Página del juego |
| `estilo.css` | Estilos |
| `escenas.js` | Fondos y objetos ilustrados en SVG |
| `retos.js` | Los 17 retos: textos, soluciones, pistas y errores típicos |
| `juego.js` | Motor: escena, arrastre táctil, respuestas escritas, progreso |
| `musica.js` | Melodía chiptune original sintetizada |
| `img/` | Caricaturas de los dos profes (dos poses por imagen) |

Es estático: no necesita servidor ni compilación. Se puede alojar en cualquier hosting de archivos.
