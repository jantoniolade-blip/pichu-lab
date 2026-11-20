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


## Revisión de noviembre de 2026 · RPG jugable de la Campiña

Trabajo hecho en la rama `claude/galois-legacy-rpg-9nanbv` (creada desde `dev`; `main` sin tocar).

### Qué hay implementado

| Fase | Contenido | Archivos |
|---|---|---|
| A · Auditoría | Se conservan los tres juegos (sin tocar preguntas, motores ni correcciones), el banco de recursos, la colección de 60 cartas y su puente. | — |
| B · Recursos gráficos | Motor de sprites 16-bit: 11 matemáticos × 9 animaciones (reposo 4, caminar 8, correr 8, saltar 6, atacar 7, habilidad 8, daño 3, victoria 6, derrota 5 fotogramas) × 4 direcciones. 20 enemigos con reposo, movimiento, ataque propio de su concepto, daño y derrota; jefes en 3 fases (tinte, cuernos, aura). Tiles animados y 23 monumentos y edificios. Hojas PNG exportadas. | `shared/galois-sprites.js`, `shared/galois-escenarios.js`, `assets/galois/sprites/` (PNG + `atlas.json`), `herramientas/sprites.html`, `herramientas/exportar-sprites.js` |
| C · Álbum | Ilustración pixel art original para las 60 cartas, reverso común, marcos por rareza, brillo legendario, volteo al descubrir, ficha con anverso/reverso, filtro por rareza, panel de nivel, monedas, insignias y logros. Exportar/importar incluye el progreso. | `coleccion/arte.js`, `coleccion/album.js`, `coleccion/estilo.css`, `coleccion/bridge.js` |
| D · Mundos jugables | Las **50 aventuras de los 10 mundos son jugables**: mapa explorable por mundo (Fuentes de Andalucía con mapa propio y el IES Alarifes Ruiz Florindo como punto de partida), vecinos, fragmentos, cofres del saber, tienda de pociones, combates, construcción de monumentos y jefes en tres fases (descubrir, resolver, explicar/transferir). Retos generados según la biblia, con 3 dificultades, pistas y explicación tras cada error. | `aventura/` (`index.html`, `aventura.css`, `motor.js`, `mundos.js`, `retos.js`) |
| E · Integración | Botón «⚔ Aventura» en portada y en cada mundo; mapa general de la Campiña dentro de la aventura con desbloqueo progresivo; habilidades de los matemáticos activas en combate; recompensas (XP, niveles, monedas, insignias, logros, cartas aleatorias) en el mismo guardado por alias. Los minijuegos siguen concediendo cartas con la regla de siempre. | `index.html`, `shared/galois-campina.js`, `shared/galois-data.js` |
| F · Pruebas | `node pruebas/retos.test.js` (81 000 preguntas: respuesta correcta, distractores distintos y recálculo independiente de 15 tipos de reto) y `node pruebas/e2e.js` (sin errores JS en 7 páginas, todos los objetivos alcanzables en los 10 mapas, partida completa de los 10 mundos, reglas de recompensa). Capturas revisadas en escritorio 1280×800, tableta 1024×768 y móvil 390×844. | `pruebas/` |

### Fase B · Revisión del arte en `codex/sprites-hd`

- Los 11 matemáticos tienen ropa y peinados propios inspirados en los retratos del proyecto, luz superior izquierda, rostro expresivo y pliegues. La carrera, el salto, el golpe y la caída tienen poses de transición. La capa y las puntas del pelo siguen el movimiento con retraso.
- Los 20 enemigos se dibujan con siluetas basadas en su concepto. El Dado Caótico cambia de cara y perspectiva. Al recibir daño, las criaturas se deforman y, al caer, se dispersan en fragmentos. Los jefes pasan del ocre de la primera fase al cobre de la segunda y al violeta de la última, con cuernos y auras progresivos.
- Los vecinos heredan el nuevo dibujo en la aventura y en el trigal del álbum. Los pasos de palio incorporan vecinos en primer plano. El trigo, el agua y las cubiertas de teja tienen más textura.
- La escala y la estructura de las hojas siguen el contrato del juego. El generador reutiliza los tonos, refleja la vista lateral izquierda para componer la derecha y guarda las hojas en caché. El exportador genera 11 hojas de héroe, 20 de enemigo, 60 de jefe y `atlas.json`.
- [Capturas comparativas de la hoja de Galois, cuatro héroes, los veinte enemigos y un jefe en tres fases](pruebas/capturas/sprites-hd/).

### Reglas de recompensa

- Nada se concede por abrir una página ni por parámetros de URL: el motor solo llama a `completarAventura` cuando se han respondido bien todas las preguntas. Con `?prueba=1` (pruebas automáticas) no se guarda ninguna recompensa.
- Cada aventura superada por primera vez: XP, monedas y una carta al azar del mundo. Jefe con ≤ 1 error: carta legendaria. Repetir: poca XP y ninguna carta.
- Fallar nunca quita monedas ni cartas; en Explorador cada fallo cuesta medio corazón. La pregunta fallada se sustituye por otra parecida.
- Las recompensas no cambian notas. Modo docente (código `ALARIFES` en Ajustes): abre todos los mundos para revisarlos, sin conceder recompensas.

### Pendiente (honestamente)

- Los retratos del banco πCHU siguen en los menús. La revisión de la Fase B actualiza los sprites generados por código.
- Textos culturales: revisados y ampliados (noviembre de 2026, `herramientas/textos-cartas.js`), pero conviene que el profesorado los contraste, sobre todo los detalles de Fuentes de Andalucía (Iglesia de San José, Casa Fernández Peñaranda), que se han dejado en términos generales.
- Ranking de Integer Ninja: igual que antes.

### Música (`shared/galois-musica.js`)

Chiptune original sintetizado con Web Audio, sin archivos de audio ni melodías de terceros. Las melodías se componen por reglas (motivo de dos compases en forma A A′ B A″ sobre progresiones de acordes) con una semilla fija, así que cada pista suena siempre igual:

- **Campiña** (mapa general y portada), **un tema propio para cada mundo** (escala, tempo y carácter distintos; Écija, Triana y Sevilla con modo frigio andaluz, cadencia andaluza y palmas), **reto** (versión tranquila del tema del mundo), **combate**, **jefe** (se acelera y se intensifica en cada fase), **victoria** y **derrota**.
- Botón 🎵 en el HUD, en el mapa de la Campiña y en la portada; en Ajustes, música y volumen por separado de los efectos. Se recuerda en el navegador.
- Empieza con el primer toque o tecla (los navegadores no permiten sonar antes) y se pausa si se cambia de pestaña.

### Mapas propios, salto y ataque (noviembre de 2026)

- **Los diez mundos tienen mapa propio** (`aventura/mundos.js`, vista completa en `herramientas/mapas.html`): Carmona amurallada con la necrópolis fuera de la muralla y se entra por el arco de la Puerta de Sevilla; Écija con sus torres y el Genil; Marchena entre hileras de olivos con el Arco de la Rosa; Estepa con el camino entre rocas hasta el Cerro de San Cristóbal; Osuna con la Universidad, la Colegiata y la calle San Pedro; Triana con el río y el Puente de Isabel II; Alcalá con el Guadaíra, sus molinos y el castillo; Itálica con su cuadrícula romana, el anfiteatro y Santiponce; Sevilla con el Guadalquivir, la Torre del Oro, la Giralda, la Catedral y un **laberinto de setos** en los jardines del Alcázar donde espera el jefe final.
- **Atacar con el compás** (X/J o botón B): corta matorrales y aturde enemigos; si tocas uno aturdido, empiezas el combate con escudo (no salta preguntas). **Saltar** (C/K o botón ⤴): salta vallas, rocas y macetas. Hay cofres escondidos tras matorrales y vallas.
- Las puertas monumentales (Carmona, Marchena, Universidad de Osuna) se pueden atravesar por su arco.
