// Datos de ejemplo. Las fechas de los shows son "hoy + N días" para que la demo nunca quede vencida.

export const GENEROS = ['Punk', 'Hardcore', 'Post-punk', 'Noise'];

/** @typedef {{id:string, banda:string, genero:string, lugar:string, barrio:string, enDias:number, hora:string, precio:number, cupos:number, nota:string}} Show */

/** @type {Show[]} */
export const SHOWS_BASE = [
  { id: 'cuerda-floja', banda: 'Cuerda Floja', genero: 'Punk', lugar: 'Galpón Dock', barrio: 'Avellaneda', enDias: 0, hora: '23:30', precio: 6000, cupos: 60, nota: 'Más teloneros. Abre puertas a las 22.' },
  { id: 'vidrio-molido', banda: 'Vidrio Molido', genero: 'Post-punk', lugar: 'Sótano La Boca', barrio: 'La Boca', enDias: 3, hora: '21:00', precio: 7500, cupos: 40, nota: 'Presentan su primer EP en vivo.' },
  { id: 'cemento-fresco', banda: 'Cemento Fresco', genero: 'Hardcore', lugar: 'Galpón Dock', barrio: 'Avellaneda', enDias: 6, hora: '20:00', precio: 5000, cupos: 0, nota: 'Agotado. Hay lista de espera en la puerta.' },
  { id: 'ruta-cero', banda: 'Ruta Cero', genero: 'Punk', lugar: 'Club Social Lanús', barrio: 'Lanús', enDias: 10, hora: '22:00', precio: 6500, cupos: 80, nota: 'Matiné para todas las edades a las 17.' },
  { id: 'ecos-de-obra', banda: 'Ecos de Obra', genero: 'Noise', lugar: 'Sótano La Boca', barrio: 'La Boca', enDias: 15, hora: '21:30', precio: 4500, cupos: 30, nota: 'Set de una hora, sin pausa. Tapones de oído gratis.' },
  { id: 'la-ultima-linea', banda: 'La Última Línea', genero: 'Post-punk', lugar: 'Casa Tomada', barrio: 'Barracas', enDias: 22, hora: '21:00', precio: 7000, cupos: 50, nota: 'Con proyecciones en vivo.' },
  { id: 'trinchera', banda: 'Trinchera', genero: 'Hardcore', lugar: 'Galpón Dock', barrio: 'Avellaneda', enDias: 29, hora: '19:30', precio: 5500, cupos: 100, nota: 'Festival de cierre de temporada, cuatro bandas.' },
  { id: 'anemona', banda: 'Anémona', genero: 'Noise', lugar: 'Casa Tomada', barrio: 'Barracas', enDias: 38, hora: '22:30', precio: 4500, cupos: 35, nota: 'Estreno de su segundo disco.' },
];

export const DISCOS = [
  { id: 'rs-001', banda: 'Cuerda Floja', titulo: 'Sin red', anio: 2024, formato: 'LP', precio: 28000, forma: 'barras' },
  { id: 'rs-002', banda: 'Vidrio Molido', titulo: 'Filo', anio: 2024, formato: 'EP 7"', precio: 14000, forma: 'circulos' },
  { id: 'rs-003', banda: 'Cemento Fresco', titulo: 'Obra en curso', anio: 2025, formato: 'LP', precio: 28000, forma: 'diagonal' },
  { id: 'rs-004', banda: 'Ecos de Obra', titulo: 'Ruido blanco', anio: 2025, formato: 'Cassette', precio: 9000, forma: 'cuadricula' },
  { id: 'rs-005', banda: 'Ruta Cero', titulo: 'Kilómetro 0', anio: 2026, formato: 'LP', precio: 30000, forma: 'triangulo' },
  { id: 'rs-006', banda: 'Anémona', titulo: 'Marea baja', anio: 2026, formato: 'EP 7"', precio: 15000, forma: 'ondas' },
];
