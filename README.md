# Ruido Sur

Sitio de demostración para un sello independiente y ciclo de shows ficticio del sur de Buenos Aires. Estilo Swiss punk (amarillo ácido, negro y blanco hueso; Anton + Space Mono), hecho con HTML, CSS y JavaScript sin dependencias.

Demo: https://laura-m-stack.github.io/ruido-sur/

## Qué tiene

- **Agenda viva:** las fechas son "hoy + N días" en hora de Buenos Aires, así la demo nunca queda vencida. Los shows que terminaron (3 horas después de empezar) desaparecen solos, y la cuenta regresiva de la próxima fecha se actualiza sin recargar.
- **Filtros:** por género, búsqueda sin distinguir acentos y mayúsculas, y "solo con entradas".
- **Reserva de entradas:** máximo 4 por persona y por show, respeta los cupos, valida el nombre, calcula el total y permite copiar la reserva. Los shows agotados quedan marcados y sin botón.
- **Mis reservas:** se guardan en el navegador (`localStorage`). Al leerlas se descartan datos inválidos o manipulados, y se pueden cancelar.
- **Accesibilidad:** contraste AA, foco visible, `<dialog>` nativo con foco devuelto al cerrar, `prefers-reduced-motion`, objetivos táctiles de 44 px.
- **Lógica pura y testeada:** `site/js/agenda.js` no toca el DOM (18 tests con el runner nativo de Node).

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
  js/datos.js      shows y discos de ejemplo
  js/main.js       interfaz y manejo del DOM
tests/agenda.test.js
```

## Despliegue

GitHub Actions corre los tests y publica `site/` en GitHub Pages en cada push a `main`. En el repositorio: Settings > Pages > Source: GitHub Actions.
