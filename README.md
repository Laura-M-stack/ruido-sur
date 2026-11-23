# Ruido Sur

Sitio de demostración para un sello independiente y ciclo de shows ficticio del sur de Buenos Aires. Estilo Swiss punk de fanzine (amarillo ácido, negro y blanco hueso; Anton + Space Mono), hecho con HTML, CSS y JavaScript sin dependencias.

Demo: https://laura-m-stack.github.io/ruido-sur/

## Qué tiene

- **Riffs generados en vivo:** cada disco tiene un botón de play que sintetiza batería, bajo y guitarra distorsionada con Web Audio, sin archivos de audio. Cada tapa tiene su propio riff (punk, post-punk con eco, hardcore con breakdown, noise), el vinilo asoma y gira mientras suena y un visualizador muestra el espectro. Se corta solo a los 30 segundos o si la pestaña pasa a segundo plano.
- **Fotos con trama de fotocopia:** fotos de Unsplash pasadas a blanco y negro, multiplicadas sobre el amarillo y con una grilla de puntos encima, todo con CSS. En la agenda, la foto de cada banda sigue al cursor (con inercia y un leve giro según la velocidad); en pantallas táctiles cada fila muestra su foto.
- **Tipografía que se estira con el scroll:** "RUIDO SUR" se deforma con `animation-timeline: scroll()`, sin JavaScript. Donde no hay soporte, queda quieta.
- **Marquesinas** con las próximas fechas y el lema del sello, que se pausan con el mouse.
- **Agenda viva:** las fechas son "hoy + N días" en hora de Buenos Aires, así la demo nunca queda vencida. Los shows que terminaron (3 horas después de empezar) desaparecen solos, y la cuenta regresiva de la próxima fecha se actualiza sin recargar.
- **Filtros:** por género, búsqueda sin distinguir acentos y mayúsculas, y "solo con entradas".
- **Reserva de entradas:** máximo 4 por persona y por show, respeta los cupos, valida el nombre, calcula el total y permite copiar la reserva. Los shows agotados quedan marcados y sin botón.
- **Mis reservas:** se guardan en el navegador (`localStorage`). Al leerlas se descartan datos inválidos o manipulados, y se pueden cancelar.
- **Accesibilidad:** contraste AA, foco visible, `<dialog>` nativo con foco devuelto al cerrar, `prefers-reduced-motion` (sin marquesinas, sin giro ni estiramiento), objetivos táctiles de 44 px, botones de play con `aria-pressed` y estado anunciado.
- **Lógica pura y testeada:** agenda, URLs de fotos y patrones de los riffs no tocan el DOM (30 tests con el runner nativo de Node).

Es una demo: no se venden entradas ni discos, y nada se envía a ningún servidor.

## Desarrollo

```powershell
npm test       # tests con el runner nativo de Node (22 o superior recomendado)
npm start      # servidor local en http://localhost:4173
```

No hace falta `npm install`: no hay dependencias.

## Estructura

```
site/
  index.html
  css/styles.css
  js/agenda.js     lógica de fechas, filtros y reservas (con tests)
  js/datos.js      shows, discos y fotos de ejemplo
  js/fotos.js      URLs del CDN de Unsplash y créditos (con tests)
  js/sonido.js     patrones de los riffs (con tests) y motor de Web Audio
  js/main.js       interfaz y manejo del DOM
tests/
```

## Despliegue

GitHub Actions corre los tests y publica `site/` en GitHub Pages en cada push a `main`. En el repositorio: Settings > Pages > Source: GitHub Actions.

## Créditos

Fotos de Unsplash (licencia Unsplash): Tijs van Leur, Natalie Parham, AJ Garcia, Joshua Tsu, Geo Chierchia, Brooke Balentine, Spencer Davis, Kelvin Moquete y Panos Sakalakis. Se acreditan también en el pie del sitio. Las bandas, los lugares y las fechas son ficticios.
