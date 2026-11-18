# pichu-lab

**πCHU ROYALE — La rebelión de los números.** Juegos de Matemáticas de 1.º ESO adaptados a pixel art 16-bit.

Los juegos se copian desde `Aula-de-Matematicas` (que no se modifica) y aquí solo cambia su aspecto: preguntas, mecánicas, niveles y puntuaciones se conservan.

## Estructura

```
index.html                 Portada: acceso a todos los juegos y galería de héroes
shared/pichu-theme.css     Tema común (paleta, fuentes Jersey 10 y Press Start 2P, botones)
assets/pichu-royale/       Banco de recursos (héroes, enemigos, iconos, escenarios, logo, manifest.json)
juegos/<juego>/            Cada juego es un módulo independiente
  integer-ninja/            Números enteros (cortar frutas)
  divisibilidad/            Duelo de cartas + modo fácil sin cartas (facil.html)
  fracciones/               Pizza Duel
shared/pixel-sprites.js     Sprites pixelados reutilizables

Cada juego tiene su README con lo que se ha cambiado respecto al original.
```

## Añadir un juego

1. Copiar su carpeta del repositorio original a `juegos/<id>/` en un commit sin cambios.
2. Añadir la capa visual en archivos aparte (`pixel-skin.css`/`.js`) y enlazarla.
3. Añadir una entrada en la lista `JUEGOS` de `index.html`.

## Probar en local

```
python -m http.server 8765
```

y abrir `http://localhost:8765/`.

## Publicación

- **GitHub Pages**: todo funciona salvo el **ranking en vivo** de Integer Ninja, porque `api/ranking.js` es una función de servidor (Vercel) y GitHub Pages solo sirve archivos estáticos. Partidas, niveles, logros, retos por código y justificantes funcionan.
- **Vercel**: el ranking podría funcionar importando este repositorio, pero el juego llama a `/api/ranking` en la raíz del dominio, así que habría que colocar una copia de `api/ranking.js` en la raíz del repositorio. Pendiente de decidir.

El desarrollo se hace en la rama `dev`; `main` se actualiza solo tras comprobarlo.
