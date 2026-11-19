// Lógica pura de la agenda y las reservas. No toca el DOM, así se prueba con `node --test`.
// Argentina no usa horario de verano: se toma UTC-3 fijo para armar el instante de cada show.

export const ZONA = 'America/Argentina/Buenos_Aires';
export const OFFSET = '-03:00';
export const MAX_ENTRADAS = 4;
export const DURACION_SHOW_HS = 3;

const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const DIAS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Fecha de hoy (AAAA-MM-DD) en Buenos Aires, sin depender de la zona del navegador. */
export function hoyISO(ahora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(ahora);
}

function partes(iso) {
  const m = ISO.exec(iso);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const f = new Date(Date.UTC(y, mo - 1, d));
  if (f.getUTCFullYear() !== y || f.getUTCMonth() !== mo - 1 || f.getUTCDate() !== d) return null;
  return { y, mo, d, f };
}

export function sumarDias(iso, n) {
  const p = partes(iso);
  if (!p) return '';
  const f = new Date(p.f.getTime() + n * 86_400_000);
  return f.toISOString().slice(0, 10);
}

export function diaDeSemana(iso) {
  const p = partes(iso);
  return p ? p.f.getUTCDay() : NaN;
}

/** Instante exacto (Date) en que empieza un show. Devuelve null si fecha u hora son inválidas. */
export function inicio(show) {
  if (!partes(show.fecha) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(show.hora)) return null;
  return new Date(`${show.fecha}T${show.hora}:00${OFFSET}`);
}

/** Convierte la lista base (con `enDias`) en shows con fecha real, ordenados y sin los que ya terminaron. */
export function construirAgenda(base, ahora = new Date()) {
  const hoy = hoyISO(ahora);
  return base
    .map((s) => ({ ...s, fecha: sumarDias(hoy, s.enDias) }))
    .filter((s) => estado(s, ahora) !== 'pasado')
    .sort((a, b) => inicio(a) - inicio(b));
}

/** 'proximo' | 'en-curso' | 'pasado' */
export function estado(show, ahora = new Date()) {
  const t = inicio(show);
  if (!t) return 'pasado';
  const diff = t.getTime() - ahora.getTime();
  if (diff > 0) return 'proximo';
  return -diff < DURACION_SHOW_HS * 3_600_000 ? 'en-curso' : 'pasado';
}

export function proximo(shows, ahora = new Date()) {
  return shows.find((s) => estado(s, ahora) !== 'pasado') ?? null;
}

/** "SÁB 21 NOV" */
export function fechaCorta(iso) {
  const p = partes(iso);
  return p ? `${DIAS[p.f.getUTCDay()]} ${p.d} ${MESES[p.mo - 1]}` : '';
}

/** Texto relativo: "En curso", "Hoy", "Mañana" o "En 5 días", según los días de calendario de Buenos Aires. */
export function cuando(show, ahora = new Date()) {
  const e = estado(show, ahora);
  if (e === 'pasado') return 'Finalizado';
  if (e === 'en-curso') return 'En curso';
  const hoy = hoyISO(ahora);
  const dias = Math.round((partes(show.fecha).f - partes(hoy).f) / 86_400_000);
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Mañana';
  return `En ${dias} días`;
}

/** Cuenta regresiva corta: "2 d 5 h", "5 h 12 min", "12 min". Vacío si ya empezó. */
export function faltan(show, ahora = new Date()) {
  const t = inicio(show);
  if (!t) return '';
  const min = Math.floor((t.getTime() - ahora.getTime()) / 60_000);
  if (min <= 0) return '';
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  if (d > 0) return `${d} d ${h} h`;
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
}

const sinAcentos = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Filtra por género, texto (banda, lugar o barrio, sin acentos) y disponibilidad. */
export function filtrar(shows, { genero = 'Todos', texto = '', soloDisponibles = false } = {}, reservas = {}) {
  const q = sinAcentos(texto);
  return shows.filter((s) => {
    if (genero !== 'Todos' && s.genero !== genero) return false;
    if (q && !sinAcentos(`${s.banda} ${s.lugar} ${s.barrio}`).includes(q)) return false;
    if (soloDisponibles && cuposRestantes(s, reservas) === 0) return false;
    return true;
  });
}

/** Cupos que quedan: los del show menos lo que ya reservó esta persona en este navegador. */
export function cuposRestantes(show, reservas = {}) {
  const propias = Number.isInteger(reservas[show.id]) ? reservas[show.id] : 0;
  return Math.max(0, show.cupos - propias);
}

/** Cuántas entradas más puede pedir: el menor entre el tope por persona y los cupos que quedan. */
export function maxPedible(show, reservas = {}) {
  const propias = Number.isInteger(reservas[show.id]) ? reservas[show.id] : 0;
  return Math.max(0, Math.min(MAX_ENTRADAS - propias, cuposRestantes(show, reservas)));
}

export function pesos(n) {
  return '$ ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function total(show, cantidad) {
  return Number.isInteger(cantidad) && cantidad > 0 ? show.precio * cantidad : 0;
}

/**
 * Valida y agrega una reserva. No muta el objeto recibido.
 * @returns {{ok:true, reservas:Record<string,number>} | {ok:false, error:string}}
 */
export function reservar(reservas, show, cantidad, ahora = new Date()) {
  if (estado(show, ahora) === 'pasado') return { ok: false, error: 'Este show ya terminó.' };
  if (!Number.isInteger(cantidad) || cantidad < 1) return { ok: false, error: 'Elegí al menos una entrada.' };
  const tope = maxPedible(show, reservas);
  if (show.cupos === 0) return { ok: false, error: 'Este show está agotado.' };
  if (tope === 0) return { ok: false, error: `Ya reservaste el máximo de ${MAX_ENTRADAS} entradas para este show.` };
  if (cantidad > tope) return { ok: false, error: `Podés pedir hasta ${tope} entrada${tope === 1 ? '' : 's'} más para este show.` };
  const propias = Number.isInteger(reservas[show.id]) ? reservas[show.id] : 0;
  return { ok: true, reservas: { ...reservas, [show.id]: propias + cantidad } };
}

export function cancelar(reservas, id) {
  const { [id]: _quitada, ...resto } = reservas;
  return resto;
}

/** Lee lo guardado en localStorage sin confiar en él: descarta ids desconocidos y cantidades inválidas. */
export function parseReservas(raw, idsValidos) {
  let data;
  try {
    data = JSON.parse(raw ?? '{}');
  } catch {
    return {};
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
  const ok = new Set(idsValidos);
  const limpio = {};
  for (const [id, n] of Object.entries(data)) {
    if (ok.has(id) && Number.isInteger(n) && n >= 1 && n <= MAX_ENTRADAS) limpio[id] = n;
  }
  return limpio;
}

/** Texto de la reserva, listo para copiar. */
export function resumen(show, cantidad, nombre) {
  const quien = nombre.trim();
  return [
    'Reserva de entradas (demo, no es una compra real)',
    quien && `A nombre de: ${quien}`,
    `Show: ${show.banda} en ${show.lugar}, ${show.barrio}`,
    `Fecha: ${fechaCorta(show.fecha)} · ${show.hora} h`,
    `Entradas: ${cantidad} × ${pesos(show.precio)}`,
    `Total a pagar en la puerta: ${pesos(total(show, cantidad))}`,
  ].filter(Boolean).join('\n');
}
