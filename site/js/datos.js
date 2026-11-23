// Datos de ejemplo. Las fechas de los shows son "hoy + N días" para que la demo nunca quede vencida.

export const GENEROS = ['Punk', 'Hardcore', 'Post-punk', 'Noise'];

/** @typedef {{id:string, autor:string, usuario:string}} Foto */
/** @typedef {{id:string, banda:string, genero:string, lugar:string, barrio:string, enDias:number, hora:string, precio:number, cupos:number, nota:string, foto:Foto}} Show */

/** @type {Show[]} */
export const SHOWS_BASE = [
  { id: 'cuerda-floja', banda: 'Cuerda Floja', genero: 'Punk', lugar: 'Galpón Dock', barrio: 'Avellaneda', enDias: 0, hora: '23:30', precio: 6000, cupos: 60, nota: 'Más teloneros. Abre puertas a las 22.', foto: { id: 'photo-1575672913784-11a7cd4f25f4', autor: 'Natalie Parham', usuario: 'natalieparham' } },
  { id: 'vidrio-molido', banda: 'Vidrio Molido', genero: 'Post-punk', lugar: 'Sótano La Boca', barrio: 'La Boca', enDias: 3, hora: '21:00', precio: 7500, cupos: 40, nota: 'Presentan su primer EP en vivo.', foto: { id: 'photo-1490915829216-3f2347b1e830', autor: 'AJ Garcia', usuario: 'ajgarciaco' } },
  { id: 'cemento-fresco', banda: 'Cemento Fresco', genero: 'Hardcore', lugar: 'Galpón Dock', barrio: 'Avellaneda', enDias: 6, hora: '20:00', precio: 5000, cupos: 0, nota: 'Agotado. Hay lista de espera en la puerta.', foto: { id: 'photo-1665342460603-73fd09ce19f2', autor: 'Joshua Tsu', usuario: 'joshdatsu' } },
  { id: 'ruta-cero', banda: 'Ruta Cero', genero: 'Punk', lugar: 'Club Social Lanús', barrio: 'Lanús', enDias: 10, hora: '22:00', precio: 6500, cupos: 80, nota: 'Matiné para todas las edades a las 17.', foto: { id: 'photo-1605722243979-fe0be8158232', autor: 'Geo Chierchia', usuario: 'geochierchia' } },
  { id: 'ecos-de-obra', banda: 'Ecos de Obra', genero: 'Noise', lugar: 'Sótano La Boca', barrio: 'La Boca', enDias: 15, hora: '21:30', precio: 4500, cupos: 30, nota: 'Set de una hora, sin pausa. Tapones de oído gratis.', foto: { id: 'photo-1759719440801-67fafb52c937', autor: 'Brooke Balentine', usuario: 'brookebalentine' } },
  { id: 'la-ultima-linea', banda: 'La Última Línea', genero: 'Post-punk', lugar: 'Casa Tomada', barrio: 'Barracas', enDias: 22, hora: '21:00', precio: 7000, cupos: 50, nota: 'Con proyecciones en vivo.', foto: { id: 'photo-1583795311768-2ef98ac78740', autor: 'Spencer Davis', usuario: 'spencerdavis' } },
  { id: 'trinchera', banda: 'Trinchera', genero: 'Hardcore', lugar: 'Galpón Dock', barrio: 'Avellaneda', enDias: 29, hora: '19:30', precio: 5500, cupos: 100, nota: 'Festival de cierre de temporada, cuatro bandas.', foto: { id: 'photo-1590721791974-d6c8ca43f6bc', autor: 'Kelvin Moquete', usuario: 'kelmoquete' } },
  { id: 'anemona', banda: 'Anémona', genero: 'Noise', lugar: 'Casa Tomada', barrio: 'Barracas', enDias: 38, hora: '22:30', precio: 4500, cupos: 35, nota: 'Estreno de su segundo disco.', foto: { id: 'photo-1541592553160-82008b127ccb', autor: 'Panos Sakalakis', usuario: 'meymigrou' } },
];

export const DISCOS = [
  { id: 'rs-001', banda: 'Cuerda Floja', titulo: 'Sin red', anio: 2024, formato: 'LP', precio: 28000, forma: 'barras' },
  { id: 'rs-002', banda: 'Vidrio Molido', titulo: 'Filo', anio: 2024, formato: 'EP 7"', precio: 14000, forma: 'circulos' },
  { id: 'rs-003', banda: 'Cemento Fresco', titulo: 'Obra en curso', anio: 2025, formato: 'LP', precio: 28000, forma: 'diagonal' },
  { id: 'rs-004', banda: 'Ecos de Obra', titulo: 'Ruido blanco', anio: 2025, formato: 'Cassette', precio: 9000, forma: 'cuadricula' },
  { id: 'rs-005', banda: 'Ruta Cero', titulo: 'Kilómetro 0', anio: 2026, formato: 'LP', precio: 30000, forma: 'triangulo' },
  { id: 'rs-006', banda: 'Anémona', titulo: 'Marea baja', anio: 2026, formato: 'EP 7"', precio: 15000, forma: 'ondas' },
];

/** Foto del hero. Todas las fotos son de Unsplash (licencia libre) y se acreditan en el pie. */
export const FOTO_HERO = { id: 'photo-1565035010268-a3816f98589a', autor: 'Tijs van Leur', usuario: 'tijsvl' };
