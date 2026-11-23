import { SHOWS_BASE, GENEROS, DISCOS, FOTO_HERO } from './datos.js';
import { rutaFoto, urlPerfil, creditos } from './fotos.js';
import { patronDe, hayAudio, crearReproductor } from './sonido.js';
import {
  MAX_ENTRADAS, cancelar, construirAgenda, cuando, cuposRestantes, estado, faltan, fechaCorta, filtrar,
  maxPedible, parseReservas, pesos, proximo, reservar, resumen, total,
} from './agenda.js';

const KEY = 'ruido-sur:reservas';
const $ = (id) => document.getElementById(id);

/** Crea un elemento. Los textos entran como nodos de texto, nunca como HTML. */
function h(tag, attrs = {}, ...hijos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of hijos.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
  return el;
}

let agenda = construirAgenda(SHOWS_BASE);
let reservas = leerReservas();
const filtros = { genero: 'Todos', texto: '', soloDisponibles: false };

function leerReservas() {
  try {
    return parseReservas(localStorage.getItem(KEY), SHOWS_BASE.map((s) => s.id));
  } catch {
    return {};
  }
}
function guardarReservas() {
  try {
    localStorage.setItem(KEY, JSON.stringify(reservas));
  } catch {
    /* sin almacenamiento: la reserva vive solo mientras la página está abierta */
  }
}

/* ---------- Hero ---------- */
function pintarProximo() {
  const s = proximo(agenda);
  if (!s) {
    $('next-band').textContent = 'Sin fechas';
    $('next-meta').textContent = 'Volvemos pronto.';
    $('next-count').textContent = '';
    return;
  }
  $('next-band').textContent = s.banda;
  $('next-meta').textContent = `${fechaCorta(s.fecha)} · ${s.hora} h · ${s.lugar}, ${s.barrio}`;
  const f = faltan(s);
  $('next-count').textContent = f ? `Faltan ${f}` : 'En curso ahora';
}

/* ---------- Agenda ---------- */
function pintarChips() {
  const cont = $('chips');
  cont.replaceChildren(
    ...['Todos', ...GENEROS].map((g) =>
      h('button', {
        class: 'chip', type: 'button', 'aria-pressed': String(filtros.genero === g),
        onclick: () => { filtros.genero = g; pintarChips(); pintarAgenda(); },
      }, g),
    ),
  );
}

function pintarAgenda() {
  const lista = filtrar(agenda, filtros, reservas);
  $('shows').replaceChildren(...lista.map(filaShow));
  $('empty').hidden = lista.length > 0;
  $('live').textContent = lista.length === 1 ? '1 show' : `${lista.length} shows`;
}

/** Foto del show: ficha 4:3 en computadora, franja 5:2 en el celular. Si no carga, queda un bloque oscuro con el nombre. */
function fotoShow(s) {
  const ficha = rutaFoto(s.id, 'ficha');
  const franja = rutaFoto(s.id, 'franja');
  if (!ficha) return null;
  const img = h('img', { src: franja, alt: '', width: 960, height: 384, loading: 'lazy', decoding: 'async' });
  img.addEventListener('error', () => img.closest('.show-foto')?.classList.add('sin-foto'), { once: true });
  return h('div', { class: 'show-foto', 'aria-hidden': 'true', 'data-banda': s.banda },
    h('picture', {},
      h('source', { media: '(min-width: 900px)', srcset: ficha, width: 480, height: 360 }),
      img,
    ),
  );
}

function filaShow(s) {
  const libres = cuposRestantes(s, reservas);
  const agotado = s.cupos === 0;
  const tuyas = reservas[s.id] ?? 0;
  const rel = cuando(s);
  const pocos = !agotado && libres <= 10;
  return h('li', { class: `show${agotado ? ' is-out' : ''}` },
    fotoShow(s),
    h('p', { class: 'show-date' }, fechaCorta(s.fecha), h('small', {}, `${s.hora} h`)),
    h('div', { class: 'show-body' },
      h('h3', { class: 'show-band' }, s.banda),
      h('p', { class: 'show-where' }, h('span', { class: `tag${rel === 'Hoy' || rel === 'En curso' ? ' tag-hoy' : ''}` }, rel), s.genero, ' · ', s.lugar, ', ', s.barrio),
      h('p', { class: 'show-note' }, s.nota),
    ),
    h('div', { class: 'show-buy' },
      agotado
        ? h('p', { class: 'agotado' }, 'Agotado')
        : [
            h('p', { class: 'price' }, pesos(s.precio)),
            h('p', { class: `cupos${pocos ? ' poco' : ''}` }, pocos ? `Quedan ${libres}` : 'Hay entradas'),
            h('button', {
              class: 'btn', type: 'button', 'data-id': s.id,
              'aria-label': `${tuyas ? 'Reservar más entradas' : 'Reservar'} para ${s.banda}`,
              onclick: (e) => abrirReserva(s, e.currentTarget),
            }, tuyas ? `Reservar más (tenés ${tuyas})` : 'Reservar'),
          ],
    ),
  );
}

/* ---------- Discos ---------- */
function cover(forma, i) {
  const fondos = [['#f5e500', '#0a0a0a'], ['#0a0a0a', '#f5e500'], ['#f1ede4', '#0a0a0a']];
  const [bg, fg] = fondos[i % 3];
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 200');
  svg.setAttribute('class', 'cover');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-hidden', 'true');
  const add = (tag, a) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(a)) e.setAttribute(k, v);
    svg.append(e);
  };
  add('rect', { width: 200, height: 200, fill: bg });
  if (forma === 'barras') for (let k = 0; k < 7; k++) add('rect', { x: 14 + k * 26, y: 200 - (40 + ((k * 37) % 120)), width: 16, height: 40 + ((k * 37) % 120), fill: fg });
  if (forma === 'circulos') { add('circle', { cx: 80, cy: 100, r: 62, fill: fg }); add('circle', { cx: 130, cy: 100, r: 62, fill: 'none', stroke: bg === '#0a0a0a' ? '#f5e500' : '#f1ede4', 'stroke-width': 8 }); }
  if (forma === 'diagonal') for (let k = -4; k < 12; k++) add('rect', { x: k * 26, y: -20, width: 12, height: 260, fill: fg, transform: 'rotate(35 100 100)' });
  if (forma === 'cuadricula') for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) if ((a * 3 + b * 7) % 4 !== 0) add('rect', { x: 20 + a * 34, y: 20 + b * 34, width: 26, height: 26, fill: fg });
  if (forma === 'triangulo') { add('polygon', { points: '100,20 185,180 15,180', fill: fg }); add('polygon', { points: '100,80 140,160 60,160', fill: bg }); }
  if (forma === 'ondas') for (let k = 0; k < 6; k++) add('path', { d: `M0 ${30 + k * 30} q25 -22 50 0 t50 0 t50 0 t50 0`, fill: 'none', stroke: fg, 'stroke-width': 9 });
  return svg;
}

const reproductor = hayAudio() ? crearReproductor() : null;
const COLORES_ETIQUETA = [['#f5e500', '#0a0a0a'], ['#0a0a0a', '#f5e500'], ['#f1ede4', '#0a0a0a']];
const ICONO_PLAY = 'M8 5v14l11-7z';
const ICONO_STOP = 'M6 6h12v12H6z';

function icono(d) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', d);
  svg.append(path);
  return svg;
}

function pintarDiscos() {
  $('releases').replaceChildren(...DISCOS.map((d, i) => {
    const [fondo, tinta] = COLORES_ETIQUETA[i % 3];
    const patron = patronDe(d.forma);
    const boton = reproductor && patron
      ? h('button', {
          class: 'play', type: 'button', 'aria-pressed': 'false', 'data-disco': d.id,
          'aria-label': `Escuchar un adelanto de ${d.titulo}, de ${d.banda}`,
          onclick: () => alternarDisco(d, patron),
        }, icono(ICONO_PLAY))
      : null;
    return h('li', { class: 'release', 'data-disco': d.id },
      h('div', { class: 'funda' },
        h('div', { class: 'vinilo', 'aria-hidden': 'true', style: `--etiqueta:${fondo};--etiqueta-tinta:${tinta}` }, h('div', { class: 'surcos' })),
        cover(d.forma, i),
        boton,
      ),
      reproductor ? h('canvas', { class: 'eq', width: 240, height: 36, 'aria-hidden': 'true' }) : null,
      h('h3', { class: 'rel-title' }, d.titulo),
      h('p', { class: 'rel-meta' }, `${d.banda} · ${d.anio} · ${d.formato}`),
      h('p', { class: 'rel-price' }, pesos(d.precio)),
    );
  }));
}

let dibujo = 0;
const niveles = new Uint8Array(64);

function marcarDisco(id) {
  for (const li of document.querySelectorAll('.release')) {
    const activo = li.dataset.disco === id;
    li.classList.toggle('is-playing', activo);
    const b = li.querySelector('.play');
    if (!b) continue;
    const d = DISCOS.find((x) => x.id === li.dataset.disco);
    b.setAttribute('aria-pressed', String(activo));
    b.setAttribute('aria-label', activo ? `Detener ${d.titulo}` : `Escuchar un adelanto de ${d.titulo}, de ${d.banda}`);
    b.replaceChildren(icono(activo ? ICONO_STOP : ICONO_PLAY));
    if (!activo) limpiarEq(li.querySelector('.eq'));
  }
}

function limpiarEq(canvas) {
  const c = canvas?.getContext('2d');
  if (!c) return;
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = '#4f4c45';
  c.fillRect(0, canvas.height - 2, canvas.width, 2);
}

function dibujarEq() {
  const id = reproductor?.sonando();
  const canvas = id && document.querySelector(`.release[data-disco="${CSS.escape(id)}"] .eq`);
  if (!canvas) { dibujo = 0; return; }
  const c = canvas.getContext('2d');
  reproductor.niveles(niveles);
  const barras = 24;
  const ancho = canvas.width / barras;
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = '#f5e500';
  for (let i = 0; i < barras; i++) {
    const v = niveles[Math.min(niveles.length - 1, Math.floor((i / barras) ** 1.4 * niveles.length * 0.9))] / 255;
    const alto = Math.max(2, v * canvas.height);
    c.fillRect(i * ancho + 1, canvas.height - alto, ancho - 2, alto);
  }
  dibujo = requestAnimationFrame(dibujarEq);
}

async function alternarDisco(d, patron) {
  if (reproductor.sonando() === d.id) {
    reproductor.detener();
    return;
  }
  let arranco = false;
  try {
    arranco = await reproductor.tocar(d.id, patron, {
      alTerminar: () => {
        marcarDisco(null);
        $('sonando').textContent = '';
      },
    });
  } catch {
    $('sonando').textContent = 'Tu navegador no dejó reproducir el sonido.';
    return;
  }
  if (!arranco) return;
  marcarDisco(d.id);
  $('sonando').textContent = `Sonando: ${d.titulo}, de ${d.banda}. Generado en vivo, sin archivos.`;
  cancelAnimationFrame(dibujo);
  dibujo = requestAnimationFrame(dibujarEq);
}

// Si la pestaña queda en segundo plano, se corta: no queremos ruido que el usuario no ve.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) reproductor?.detener();
});

/* ---------- Fotos del hero, marquesinas y créditos ---------- */
function pintarHero() {
  const img = $('hero-img');
  img.addEventListener('error', () => img.closest('.hero-foto')?.classList.add('sin-foto'), { once: true });
}

function pintarMarquesinas() {
  const fechas = agenda.map((s) => `${fechaCorta(s.fecha)} ${s.banda}`);
  const lema = ['Sin permiso', 'Sin cargo de servicio', 'Hecho en el sur', 'Fuerte y barato'];
  const llenar = (el, items) => {
    // dos copias seguidas: la animación corre una copia entera y vuelve al principio sin salto
    const copia = () => h('span', { class: 'marquesina-copia' }, ...items.flatMap((t) => [h('span', {}, t), h('span', { class: 'sep' }, '/')]));
    el.replaceChildren(copia(), copia());
  };
  llenar($('marquesina'), fechas.length ? fechas : ['Volvemos pronto']);
  llenar($('marquesina-2'), lema);
}

function pintarCreditos() {
  const fotos = creditos([FOTO_HERO, ...SHOWS_BASE.map((s) => s.foto)]);
  $('creditos').replaceChildren('Fotos de ', ...fotos.flatMap((f, i) => [
    i ? (i === fotos.length - 1 ? ' y ' : ', ') : '',
    h('a', { href: urlPerfil(f.usuario), target: '_blank', rel: 'noopener' }, f.autor),
  ]), ' en Unsplash.');
}


/* ---------- Reserva ---------- */
const dlg = $('dlg-reserva');
let showActual = null;
let opener = null;

function limpiarErroresReserva() {
  for (const id of ['dr-err-nombre', 'dr-err-cant']) $(id).textContent = '';
  for (const el of $('form-reserva').querySelectorAll('[aria-invalid]')) el.removeAttribute('aria-invalid');
}

function abrirReserva(show, trigger) {
  showActual = show;
  opener = trigger;
  limpiarErroresReserva();
  $('dr-done').hidden = true;
  $('dr-copied').textContent = '';
  $('dr-info').textContent = `${show.banda} · ${fechaCorta(show.fecha)} · ${show.hora} h · ${show.lugar}`;
  const tope = maxPedible(show, reservas);
  const sel = $('dr-cant');
  sel.replaceChildren(...Array.from({ length: tope }, (_, i) => h('option', { value: String(i + 1) }, String(i + 1))));
  $('form-reserva').hidden = tope === 0;
  $('dr-blocked').hidden = tope !== 0;
  if (tope === 0) $('dr-blocked').textContent = `Ya reservaste el máximo de ${MAX_ENTRADAS} entradas para este show.`;
  $('dr-help').textContent = `Máximo ${tope} más para este show.`;
  pintarTotalReserva();
  dlg.showModal();
  $('dr-title').focus();
}

function pintarTotalReserva() {
  $('dr-total').textContent = showActual ? pesos(total(showActual, Number($('dr-cant').value))) : '—';
}

$('dr-cant').addEventListener('change', pintarTotalReserva);

$('form-reserva').addEventListener('submit', (ev) => {
  ev.preventDefault();
  limpiarErroresReserva();
  const nombre = $('dr-nombre').value.trim();
  const cant = Number($('dr-cant').value);
  if (nombre.length < 2) {
    $('dr-nombre').setAttribute('aria-invalid', 'true');
    $('dr-err-nombre').textContent = 'Escribí tu nombre para anotar la reserva.';
    $('dr-nombre').focus();
    return;
  }
  const r = reservar(reservas, showActual, cant);
  if (!r.ok) {
    $('dr-cant').setAttribute('aria-invalid', 'true');
    $('dr-err-cant').textContent = r.error;
    $('dr-cant').focus();
    return;
  }
  reservas = r.reservas;
  guardarReservas();
  pintarContador();
  pintarAgenda();
  $('dr-resumen').textContent = resumen(showActual, cant, nombre);
  $('form-reserva').hidden = true;
  $('dr-done').hidden = false;
  $('dr-done-title').focus();
});

$('dr-copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('dr-resumen').textContent ?? '');
    $('dr-copied').textContent = 'Copiado.';
  } catch {
    $('dr-copied').textContent = 'No se pudo copiar solo. Seleccioná el texto y copialo a mano.';
  }
});

dlg.addEventListener('close', () => {
  // Si el botón que abrió el diálogo se redibujó, se busca el equivalente por id.
  const id = opener?.dataset.id;
  const destino = opener?.isConnected ? opener : id && document.querySelector(`[data-id="${CSS.escape(id)}"]`);
  (destino || $('open-res')).focus();
});

/* ---------- Mis reservas ---------- */
const dlgMis = $('dlg-mis');

function pintarContador() {
  const n = Object.values(reservas).reduce((a, b) => a + b, 0);
  $('res-count').textContent = String(n);
  $('res-count').setAttribute('aria-label', `${n} ${n === 1 ? 'entrada' : 'entradas'}`);
}

function pintarMis() {
  const base = Object.keys(reservas).map((id) => SHOWS_BASE.find((s) => s.id === id)).filter(Boolean);
  const items = base.map((b) => agenda.find((s) => s.id === b.id)).filter(Boolean);
  $('dm-empty').hidden = items.length > 0;
  $('dm-list').replaceChildren(...items.map((s) =>
    h('li', {},
      h('div', {}, h('strong', {}, s.banda), `${reservas[s.id]} × ${pesos(s.precio)} = ${pesos(total(s, reservas[s.id]))}`, h('br'), `${fechaCorta(s.fecha)} · ${s.hora} h`),
      h('button', {
        class: 'btn btn-alt', type: 'button', 'aria-label': `Cancelar la reserva de ${s.banda}`,
        onclick: () => { reservas = cancelar(reservas, s.id); guardarReservas(); pintarContador(); pintarAgenda(); pintarMis(); $('dm-title').focus(); },
      }, 'Cancelar'),
    )));
}

$('open-res').addEventListener('click', () => {
  pintarMis();
  dlgMis.showModal();
  $('dm-title').focus();
});
dlgMis.addEventListener('close', () => $('open-res').focus());

/* ---------- Filtros ---------- */
$('q').addEventListener('input', (e) => { filtros.texto = e.target.value; pintarAgenda(); });
$('solo').addEventListener('change', (e) => { filtros.soloDisponibles = e.target.checked; pintarAgenda(); });

/* ---------- Reloj: cuenta regresiva y shows que terminan ---------- */
function tick() {
  const nueva = construirAgenda(SHOWS_BASE);
  if (nueva.map((s) => s.id).join() !== agenda.map((s) => s.id).join() || nueva.some((s, i) => estado(s) !== estado(agenda[i]))) {
    agenda = nueva;
    pintarAgenda();
    pintarMarquesinas();
  }
  pintarProximo();
}

pintarHero();
pintarChips();
pintarAgenda();
pintarMarquesinas();
pintarDiscos();
document.querySelectorAll('.eq').forEach(limpiarEq);
pintarCreditos();
pintarContador();
pintarProximo();
setInterval(tick, 30_000);
