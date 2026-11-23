import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PASOS, patronDe, duracionVuelta, frecuencia, curvaDistorsion, hayAudio } from '../site/js/sonido.js';
import { DISCOS } from '../site/js/datos.js';

test('cada disco tiene un patrón válido', () => {
  for (const d of DISCOS) {
    const p = patronDe(d.forma);
    assert.ok(p, `sin patrón para ${d.forma}`);
    assert.ok(p.bpm >= 60 && p.bpm <= 240, 'tempo fuera de rango');
    assert.ok(p.raiz >= 28 && p.raiz <= 52, 'raíz fuera del registro de guitarra');
    for (const lista of [p.bombo, p.caja, p.hat]) {
      for (const paso of lista) assert.ok(Number.isInteger(paso) && paso >= 0 && paso < PASOS, `${d.forma}: paso ${paso}`);
    }
    for (const n of [...p.guitarra, ...p.bajo]) {
      assert.ok(n.paso >= 0 && n.paso < PASOS, `${d.forma}: nota fuera del compás`);
      assert.ok(n.dur > 0 && n.paso + n.dur <= PASOS + 2, `${d.forma}: duración rara`);
      assert.ok(n.nota >= -12 && n.nota <= 24, `${d.forma}: nota fuera de rango`);
    }
    assert.ok(p.guitarra.length > 0 && p.bombo.length > 0);
  }
});

test('los riffs son distintos entre sí', () => {
  const firmas = DISCOS.map((d) => JSON.stringify(patronDe(d.forma)));
  assert.equal(new Set(firmas).size, firmas.length);
});

test('cada llamada devuelve un patrón nuevo (modificarlo no rompe el siguiente)', () => {
  const a = patronDe('barras');
  a.bombo.push(99);
  assert.ok(!patronDe('barras').bombo.includes(99));
});

test('formas desconocidas o heredadas no dan patrón', () => {
  assert.equal(patronDe('nada'), null);
  assert.equal(patronDe('toString'), null);
  assert.equal(patronDe('__proto__'), null);
});

test('duración, frecuencia y curva de distorsión', () => {
  assert.equal(duracionVuelta({ bpm: 120 }), 4);
  assert.equal(frecuencia(69), 440);
  assert.ok(Math.abs(frecuencia(40) - 82.41) < 0.01);
  const c = curvaDistorsion(400, 256);
  assert.equal(c.length, 256);
  assert.ok(c[0] < 0 && c[255] > 0, 'la curva va de negativo a positivo');
  for (let i = 1; i < c.length; i++) assert.ok(c[i] >= c[i - 1], 'la curva es monótona');
});

test('sin navegador no hay audio', () => {
  assert.equal(hayAudio(), false);
});
