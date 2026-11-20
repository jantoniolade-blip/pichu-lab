# GALOIS LEGACY · Campiña sevillana y álbum de cartas

## Alcance

- Diez mundos vinculados a diez bloques de Matemáticas de 1.º ESO; cada uno tiene **cinco aventuras** y un jefe.
- **60 cartas**: seis por mundo, en seis familias (devociones populares, fútbol, patrimonio, historia, tradiciones y Campiña).
- Ilustraciones **pixel art originales** generadas por código (`coleccion/arte.js`), sin fotografías, escudos oficiales, logotipos o retratos licenciados. Futbolistas de espaldas y sin dorsal; advocaciones como paso de palio sin rostro.
- Las cartas se muestran en `coleccion/` y se desbloquean con éxitos **reales de los minijuegos** que ya funcionan.
- Los diez mundos tienen sus cinco aventuras jugables en `aventura/` (se desbloquean en orden al vencer a cada jefe).

## Regla de obtención

La primera victoria en un reto distinto de un mundo desbloquea una carta **al azar** entre las cinco normales de ese mundo que aún no se tengan, hasta cinco. Tras completar cinco retos distintos y obtener una victoria con excelencia (3 estrellas o condición equivalente), se obtiene la sexta carta legendaria. **Las cartas no modifican notas, puntuaciones ni la evaluación.** Repetir un mismo reto no permite conseguir varias cartas normales.

## Puente de integración

Cargar (desde un minijuego situado en `juegos/NOMBRE/`):

```html
<script src="../../coleccion/datos.js"></script>
<script src="../../coleccion/bridge.js"></script>
```

Al finalizar una prueba, solo una vez:

```js
window.GaloisColeccion?.registrarResultado({
  mundo: 2, reto: 'divisores-facil', superado: true, excelencia: false
});
```

Tres minijuegos enlazados en esta revisión: Enteros, Divisibilidad (modo fácil) y Fracciones. El duelo de cartas y los mundos futuros requieren adaptar su propio punto de victoria.

## Perfiles locales

El álbum usa un **alias**, sin nombres reales ni cuentas. Datos solo en `localStorage` del navegador; no se sincronizan entre dispositivos ni son una prueba oficial de evaluación. Para uso compartido, elegir el perfil en el álbum antes de jugar. Borrar los datos del navegador borra la colección.

## Sensibilidad cultural

Las advocaciones marianas aparecen como **patrimonio artístico y cultural**, nunca como exigencia religiosa; las categorías pueden filtrarse. Se representa tanto el legado sevillista como el bético sin usar escudos, fotos o publicidad oficial. Proyecto educativo independiente no patrocinado ni avalado por clubes o hermandades.

## Referencias de contexto

- Fuentes de Andalucía: https://www.andalucia.org/listing/fuentes-de-andaluc%C3%ADa/20016102/
- Ruta cultural campiñesa: https://www.andalucia.org/listing/ruta-de-washington-irving/21470102/
- Las once torres de Écija: https://www.andalucia.org/listing/ruta-de-las-once-torres-de-%C3%89cija/21482102/
- Semana Santa y patrimonio: https://visitasevilla.es/semana-santa-en-los-barrios/
- Jesús Navas: https://sevillafc.es/actualidad/noticias/reportaje-20-anos-debut-jesus-navas-2023
- Joaquín Sánchez: https://www.realbetisbalompie.es/noticias/amp/actualidad/cronica-gracias-joaquin-29089

## Siguiente fase de Claude

1. Sustituir iconos SVG genéricos por sprites 16-bit reconocibles por carta, manteniendo iconografía respetuosa y licencias seguras.
2. Crear nivel jugable real para cada una de las 50 aventuras; **conectar el evento de superación** al puente sin conceder recompensas solo por abrir la página.
3. Crear animaciones de carta volteándose, cofre y álbum; usar CSS reducido en modo `prefers-reduced-motion`.
4. Añadir exportación/importación del progreso para uso en varios dispositivos, con consentimiento del usuario y sin cuentas infantiles obligatorias.
5. Revisar cartelas culturales con fuentes oficiales y corregir las simplificaciones narrativas.

## Estado tras la revisión de noviembre de 2026

Hecho: puntos 1 (ilustraciones pixel art por carta), 2 (las 50 aventuras son jugables y conceden cartas solo al validar todas las respuestas), 3 (volteo de cartas, cofre animado, `prefers-reduced-motion`) y 4 (exportación/importación con el progreso del aventurero). Pendiente: punto 5, revisar las cartelas culturales con fuentes oficiales.

API nueva del puente (`bridge.js`): `GaloisColeccion.rpg.estado()`, `completarAventura()`, `abrirCofre()`, `comprarPocion()`, `usarPocion()` y la lista `GaloisColeccion.LOGROS`.
