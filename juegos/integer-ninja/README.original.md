# Integer Ninja — pendiente de subir el juego original

Esta carpeta está preparada para alojar el juego **Integer Ninja** de 1.º ESO C. Actualmente **no contiene el juego**, por lo que todavía no hay ninguna partida publicada.

## Incorporar el juego
1. Obtén el ZIP original creado con Claude y descomprímelo.
2. Abre la carpeta `dist/` de ese ZIP.
3. Sube **todos los archivos dentro de dist**, manteniendo sus subcarpetas y rutas, a `integer-ninja/` de este repositorio.
4. Debe existir `integer-ninja/index.html` y, si hay recursos, conservar sus carpetas originales.
5. Si el ZIP incluye `apps-script/Code.gs`, súbelo también a `apps-script/Code.gs` (NO publiques ninguna clave de clase).
6. Comprueba las rutas relativas de CSS, JavaScript e imágenes. Si se usan rutas absolutas `/assets/...`, adaptarlas para que funcionen en la subruta `/integer-ninja/`.

## Publicación
Una vez añadido el juego, publicar mediante GitHub Pages (si el plan y la visibilidad del repositorio lo permiten) o importar el repositorio en Vercel. Verificar la URL real en el panel del proveedor antes de compartirla con Classroom.

## Ranking
El ranking en vivo requiere desplegar el backend original de Apps Script, autorizarlo y conectar la URL `/exec` desde los ajustes docentes del juego. No se debe afirmar que funciona hasta realizar una prueba real de escritura y lectura en Google Sheets.
