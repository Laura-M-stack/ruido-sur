// Fotos de Unsplash servidas desde su CDN (licencia Unsplash: uso libre, con crédito como cortesía).
// El CDN recorta y comprime según el tamaño pedido, así cada lugar baja solo los píxeles que usa.

const CDN = 'https://images.unsplash.com/';
const ID_VALIDO = /^photo-[\w-]+$/;

/**
 * URL de una foto recortada al tamaño pedido.
 * Devuelve '' si el id no tiene el formato de Unsplash (así una foto mal cargada no rompe la página).
 */
export function urlFoto(id, { w = 800, h, q = 60 } = {}) {
  if (typeof id !== 'string' || !ID_VALIDO.test(id)) return '';
  const ancho = Math.max(16, Math.min(2400, Math.round(Number(w) || 800)));
  const params = new URLSearchParams({ auto: 'format', fit: 'crop', crop: 'entropy', w: String(ancho), q: String(q) });
  if (h) params.set('h', String(Math.max(16, Math.min(2400, Math.round(Number(h) || ancho)))));
  return `${CDN}${id}?${params}`;
}

/** srcset con varios anchos y la misma proporción. */
export function srcsetFoto(id, anchos, proporcion) {
  if (!urlFoto(id)) return '';
  return anchos
    .map((w) => `${urlFoto(id, { w, h: proporcion ? Math.round(w / proporcion) : undefined })} ${w}w`)
    .join(', ');
}

/** Link al perfil del fotógrafo, con la referencia que pide Unsplash. */
export function urlPerfil(usuario) {
  if (typeof usuario !== 'string' || !/^[\w.-]+$/.test(usuario)) return 'https://unsplash.com/';
  return `https://unsplash.com/@${usuario}?utm_source=ruido_sur&utm_medium=referral`;
}

/** Fotógrafos sin repetir, en el orden en que aparecen. */
export function creditos(fotos) {
  const vistos = new Map();
  for (const f of fotos) if (f?.usuario && !vistos.has(f.usuario)) vistos.set(f.usuario, f);
  return [...vistos.values()];
}
