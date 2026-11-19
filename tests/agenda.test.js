import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_ENTRADAS, cancelar, construirAgenda, cuando, cuposRestantes, diaDeSemana, estado, faltan, fechaCorta,
  filtrar, hoyISO, inicio, maxPedible, parseReservas, pesos, proximo, reservar, resumen, sumarDias, total,
} from '../site/js/agenda.js';
import { SHOWS_BASE, GENEROS } from '../site/js/datos.js';

const ahora = new Date('2026-12-02T15:00:00-03:00'); // miércoles
const show = (extra = {}) => ({ id: 'x', banda: 'Banda', genero: 'Punk', lugar: 'Sótano', barrio: 'La Boca', fecha: '2026-12-05', hora: '21:00', precio: 6000, cupos: 20, ...extra });

test('hoyISO usa Buenos Aires y no UTC', () => {
  assert.equal(hoyISO(new Date('2026-12-03T01:00:00Z')), '2026-12-02');
  assert.equal(hoyISO(new Date('2026-12-03T03:00:00Z')), '2026-12-03');
});

test('sumarDias cruza meses, años y bisiestos; rechaza fechas inválidas', () => {
  assert.equal(sumarDias('2026-12-30', 3), '2027-01-02');
  assert.equal(sumarDias('2028-02-28', 1), '2028-02-29');
  assert.equal(sumarDias('2026-02-30', 1), '');
  assert.equal(sumarDias('basura', 1), '');
});

test('diaDeSemana', () => {
  assert.equal(diaDeSemana('2026-12-05'), 6);
  assert.ok(Number.isNaN(diaDeSemana('2026-13-01')));
});

test('inicio valida fecha y hora', () => {
  assert.equal(inicio(show()).toISOString(), '2026-12-06T00:00:00.000Z');
  assert.equal(inicio(show({ hora: '25:00' })), null);
  assert.equal(inicio(show({ fecha: '' })), null);
});

test('estado: próximo, en curso (3 horas) y pasado', () => {
  const s = show({ fecha: '2026-12-02', hora: '16:00' });
  assert.equal(estado(s, ahora), 'proximo');
  assert.equal(estado(s, new Date('2026-12-02T17:00:00-03:00')), 'en-curso');
  assert.equal(estado(s, new Date('2026-12-02T19:00:00-03:00')), 'pasado');
  assert.equal(estado(show({ hora: 'xx' }), ahora), 'pasado');
});

test('cuando: hoy, mañana y en N días según el calendario de Buenos Aires', () => {
  assert.equal(cuando(show({ fecha: '2026-12-02', hora: '23:30' }), ahora), 'Hoy');
  assert.equal(cuando(show({ fecha: '2026-12-03' }), ahora), 'Mañana');
  assert.equal(cuando(show({ fecha: '2026-12-09' }), ahora), 'En 7 días');
  assert.equal(cuando(show({ fecha: '2026-12-02', hora: '16:00' }), new Date('2026-12-02T17:00:00-03:00')), 'En curso');
  // A las 23:30 del miércoles en Buenos Aires ya es jueves en UTC: "mañana" sigue siendo el jueves local.
  assert.equal(cuando(show({ fecha: '2026-12-03' }), new Date('2026-12-02T23:30:00-03:00')), 'Mañana');
});

test('faltan formatea días, horas y minutos', () => {
  assert.equal(faltan(show({ fecha: '2026-12-04', hora: '20:00' }), ahora), '2 d 5 h');
  assert.equal(faltan(show({ fecha: '2026-12-02', hora: '20:12' }), ahora), '5 h 12 min');
  assert.equal(faltan(show({ fecha: '2026-12-02', hora: '15:12' }), ahora), '12 min');
  assert.equal(faltan(show({ fecha: '2026-12-02', hora: '14:00' }), ahora), '');
});

test('construirAgenda calcula fechas, ordena y descarta los terminados', () => {
  const base = [
    { ...show({ id: 'b' }), enDias: 5 },
    { ...show({ id: 'a' }), enDias: 0, hora: '10:00' }, // hoy a las 10, ya terminó a las 15
    { ...show({ id: 'c' }), enDias: 1, hora: '20:00' },
  ];
  const ag = construirAgenda(base, ahora);
  assert.deepEqual(ag.map((s) => s.id), ['c', 'b']);
  assert.equal(ag[0].fecha, '2026-12-03');
  assert.equal(ag[1].fecha, '2026-12-07');
});

test('la agenda de ejemplo es coherente', () => {
  const ag = construirAgenda(SHOWS_BASE, ahora);
  assert.ok(ag.length >= 6);
  assert.equal(new Set(SHOWS_BASE.map((s) => s.id)).size, SHOWS_BASE.length);
  for (const s of SHOWS_BASE) {
    assert.ok(GENEROS.includes(s.genero), s.id);
    assert.ok(s.precio > 0 && Number.isInteger(s.cupos) && s.cupos >= 0, s.id);
    assert.match(s.hora, /^\d{2}:\d{2}$/);
  }
});

test('proximo devuelve el primero que no terminó', () => {
  const ag = construirAgenda(SHOWS_BASE, ahora);
  assert.equal(proximo(ag, ahora).id, ag[0].id);
  assert.equal(proximo([], ahora), null);
});

test('fechaCorta', () => {
  assert.equal(fechaCorta('2026-12-05'), 'SÁB 5 DIC');
  assert.equal(fechaCorta('nada'), '');
});

test('filtrar por género, texto sin acentos y disponibilidad', () => {
  const lista = [
    show({ id: '1', banda: 'Anémona', genero: 'Noise', barrio: 'Barracas' }),
    show({ id: '2', banda: 'Ruta Cero', genero: 'Punk', cupos: 0 }),
    show({ id: '3', banda: 'Trinchera', genero: 'Hardcore', lugar: 'Galpón Dock', barrio: 'Avellaneda' }),
  ];
  assert.equal(filtrar(lista).length, 3);
  assert.deepEqual(filtrar(lista, { genero: 'Punk' }).map((s) => s.id), ['2']);
  assert.deepEqual(filtrar(lista, { texto: 'anemona' }).map((s) => s.id), ['1']);
  assert.deepEqual(filtrar(lista, { texto: '  GALPON ' }).map((s) => s.id), ['3']);
  assert.deepEqual(filtrar(lista, { soloDisponibles: true }).map((s) => s.id), ['1', '3']);
  assert.deepEqual(filtrar(lista, { genero: 'Punk', soloDisponibles: true }), []);
});

test('cupos y máximo pedible tienen en cuenta lo ya reservado', () => {
  const s = show({ cupos: 3 });
  assert.equal(cuposRestantes(s, {}), 3);
  assert.equal(cuposRestantes(s, { x: 2 }), 1);
  assert.equal(maxPedible(s, {}), 3);
  assert.equal(maxPedible(show({ cupos: 50 }), {}), MAX_ENTRADAS);
  assert.equal(maxPedible(show({ cupos: 50 }), { x: 3 }), 1);
  assert.equal(maxPedible(show({ cupos: 50 }), { x: 4 }), 0);
});

test('reservar suma sin mutar y respeta los límites', () => {
  const r0 = {};
  const a = reservar(r0, show(), 2, ahora);
  assert.deepEqual(a, { ok: true, reservas: { x: 2 } });
  assert.deepEqual(r0, {});
  const b = reservar(a.reservas, show(), 2, ahora);
  assert.deepEqual(b.reservas, { x: 4 });
  assert.equal(reservar(b.reservas, show(), 1, ahora).ok, false);
  assert.match(reservar({ x: 3 }, show(), 2, ahora).error, /hasta 1 entrada más/);
  assert.match(reservar({}, show({ cupos: 0 }), 1, ahora).error, /agotado/);
  assert.match(reservar({}, show(), 0, ahora).error, /al menos una/);
  assert.match(reservar({}, show(), 1.5, ahora).error, /al menos una/);
  assert.match(reservar({}, show({ fecha: '2026-11-01' }), 1, ahora).error, /ya terminó/);
});

test('cancelar quita solo ese show', () => {
  assert.deepEqual(cancelar({ a: 1, b: 2 }, 'a'), { b: 2 });
  assert.deepEqual(cancelar({ a: 1 }, 'zzz'), { a: 1 });
});

test('parseReservas no confía en lo guardado', () => {
  const ids = ['a', 'b'];
  assert.deepEqual(parseReservas('{"a":2,"b":4}', ids), { a: 2, b: 4 });
  assert.deepEqual(parseReservas('{"a":9,"b":0,"c":1,"d":"2"}', ids), {});
  assert.deepEqual(parseReservas('{"a":1.5}', ids), {});
  assert.deepEqual(parseReservas('no es json', ids), {});
  assert.deepEqual(parseReservas('[1,2]', ids), {});
  assert.deepEqual(parseReservas('null', ids), {});
  assert.deepEqual(parseReservas(null, ids), {});
});

test('pesos y total', () => {
  assert.equal(pesos(12500), '$ 12.500');
  assert.equal(pesos(0), '$ 0');
  assert.equal(total(show(), 3), 18000);
  assert.equal(total(show(), 0), 0);
  assert.equal(total(show(), -2), 0);
});

test('resumen incluye los datos y omite el nombre vacío', () => {
  const r = resumen(show({ banda: 'Vidrio Molido', lugar: 'Sótano La Boca', barrio: 'La Boca' }), 2, ' Laura ');
  assert.match(r, /A nombre de: Laura/);
  assert.match(r, /SÁB 5 DIC · 21:00 h/);
  assert.match(r, /Entradas: 2 × \$ 6\.000/);
  assert.match(r, /Total a pagar en la puerta: \$ 12\.000/);
  assert.doesNotMatch(resumen(show(), 1, '  '), /A nombre de/);
});
