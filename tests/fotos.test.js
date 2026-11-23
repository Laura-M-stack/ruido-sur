import { test } from 'node:test';
import assert from 'node:assert/strict';
import { urlFoto, srcsetFoto, urlPerfil, creditos } from '../site/js/fotos.js';
import { SHOWS_BASE, FOTO_HERO } from '../site/js/datos.js';

test('urlFoto arma la URL del CDN con recorte y tamaño acotado', () => {
  const u = new URL(urlFoto('photo-123-abc', { w: 720, h: 288 }));
  assert.equal(u.origin, 'https://images.unsplash.com');
  assert.equal(u.pathname, '/photo-123-abc');
  assert.equal(u.searchParams.get('w'), '720');
  assert.equal(u.searchParams.get('h'), '288');
  assert.equal(u.searchParams.get('fit'), 'crop');
  assert.equal(new URL(urlFoto('photo-1', { w: 99999 })).searchParams.get('w'), '2400');
  assert.equal(new URL(urlFoto('photo-1', { w: 'nada' })).searchParams.get('w'), '800');
});

test('urlFoto rechaza ids que no son de Unsplash (no arma URLs raras)', () => {
  for (const malo of ['', null, undefined, '../x', 'photo-1?x=1', 'https://evil.example/a.jpg', 'photo 1']) {
    assert.equal(urlFoto(malo), '', String(malo));
  }
  assert.equal(srcsetFoto('nope', [400]), '');
});

test('srcsetFoto mantiene la proporción en cada ancho', () => {
  const partes = srcsetFoto('photo-1', [480, 960], 2.5).split(', ');
  assert.equal(partes.length, 2);
  assert.match(partes[0], /w=480.*h=192.* 480w$/);
  assert.match(partes[1], /w=960.*h=384.* 960w$/);
});

test('urlPerfil lleva la referencia y no acepta usuarios con caracteres raros', () => {
  assert.equal(urlPerfil('tijsvl'), 'https://unsplash.com/@tijsvl?utm_source=ruido_sur&utm_medium=referral');
  assert.equal(urlPerfil('a/b?c'), 'https://unsplash.com/');
});

test('créditos sin repetir y en orden', () => {
  const c = creditos([{ usuario: 'a', autor: 'A' }, null, { usuario: 'b', autor: 'B' }, { usuario: 'a', autor: 'A' }]);
  assert.deepEqual(c.map((x) => x.usuario), ['a', 'b']);
});

test('cada show y el hero tienen una foto válida y acreditada', () => {
  for (const f of [FOTO_HERO, ...SHOWS_BASE.map((s) => s.foto)]) {
    assert.ok(urlFoto(f?.id), `foto inválida: ${JSON.stringify(f)}`);
    assert.ok(f.autor && f.usuario, 'falta el crédito');
  }
  const ids = SHOWS_BASE.map((s) => s.foto.id);
  assert.equal(new Set(ids).size, ids.length, 'dos shows con la misma foto');
});
