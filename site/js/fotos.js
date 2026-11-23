// Fotos de Unsplash (licencia Unsplash) descargadas y guardadas en el repo: no dependen de un servicio externo
// para verse. Cada show tiene dos recortes: "ficha" (4:3, al lado del nombre en computadora)
// y "franja" (5:2, arriba de la fila en el celular).

const ID_VALIDO = /^[a-z0-9-]+$/;
export const VARIANTES = { ficha: [480, 360], franja: [960, 384] };

/** Ruta local de la foto de un show. '' si el id o la variante no son válidos. */
export function rutaFoto(id, variante) {
  if (typeof id !== 'string' || !ID_VALIDO.test(id) || !Object.hasOwn(VARIANTES, variante)) return '';
  return `img/shows/${id}-${variante}.webp`;
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
