import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { rutaFoto, urlPerfil, creditos, VARIANTES } from '../site/js/fotos.js';
import { SHOWS_BASE, FOTO_HERO } from '../site/js/datos.js';

const sitio = new URL('../site/', import.meta.url);

test('rutaFoto arma la ruta local de cada variante', () => {
  assert.equal(rutaFoto('ruta-cero', 'ficha'), 'img/shows/ruta-cero-ficha.webp');
  assert.equal(rutaFoto('ruta-cero', 'franja'), 'img/shows/ruta-cero-franja.webp');
});

test('rutaFoto rechaza ids o variantes raras (no arma rutas fuera de la carpeta)', () => {
  for (const malo of ['', null, undefined, '../x', 'a/b', 'A B', 'x.webp']) assert.equal(rutaFoto(malo, 'ficha'), '', String(malo));
  assert.equal(rutaFoto('ruta-cero', 'grande'), '');
  assert.equal(rutaFoto('ruta-cero', 'toString'), '');
});

test('urlPerfil lleva la referencia y no acepta usuarios con caracteres raros', () => {
  assert.equal(urlPerfil('tijsvl'), 'https://unsplash.com/@tijsvl?utm_source=ruido_sur&utm_medium=referral');
  assert.equal(urlPerfil('a/b?c'), 'https://unsplash.com/');
});

test('créditos sin repetir y en orden', () => {
  const c = creditos([{ usuario: 'a', autor: 'A' }, null, { usuario: 'b', autor: 'B' }, { usuario: 'a', autor: 'A' }]);
  assert.deepEqual(c.map((x) => x.usuario), ['a', 'b']);
});

test('cada show tiene sus dos fotos en el repo y su crédito', () => {
  for (const s of SHOWS_BASE) {
    assert.ok(s.foto?.autor && s.foto?.usuario, `${s.id}: falta el crédito`);
    for (const v of Object.keys(VARIANTES)) {
      const archivo = new URL(rutaFoto(s.id, v), sitio);
      assert.ok(existsSync(archivo), `falta ${rutaFoto(s.id, v)}`);
      assert.ok(statSync(archivo).size < 120_000, `${rutaFoto(s.id, v)} pesa demasiado`);
    }
  }
});

test('la foto del hero está en el repo y acreditada', () => {
  assert.ok(FOTO_HERO.autor && FOTO_HERO.usuario);
  for (const f of ['img/hero-720.webp', 'img/hero-1200.webp']) assert.ok(existsSync(new URL(f, sitio)), `falta ${f}`);
});
