/**
 * ALABASTRO — Lógica de la Consola de Administración (consola.js)
 * Gestión completa de catálogo, pedidos, inventario, usuarios y métricas con PostgreSQL y Motor Local Resiliente.
 */

'use strict';

const CONSOLA_STATE = {
  token: localStorage.getItem('alabastro_admin_token') || null,
  currentUser: null,
  currentTab: 'dashboard',
  products: [],
  orders: [],
  users: [],
  subscribers: [],
  reviews: [],
  metrics: null,
  settings: null,
  currentStatusFilter: 'todos',
  backendOnline: true
};

// Detección inteligente del endpoint backend (soporta port 3000, Live Server en otros puertos o file://)
const API_BASE = (function() {
  if (typeof window !== 'undefined' && window.location) {
    if ((window.location.protocol === 'http:' || window.location.protocol === 'https:') && window.location.port === '3000') {
      return '';
    }
  }
  return 'http://localhost:3000';
})();

/**
 * Normaliza la URL de una fotografía de perfume para asegurar que cargue
 * tanto en la consola (/consola/) como en Live Server o file:// sin depender de puerto externo.
 */
function resolvePerfumeImg(imgPath) {
  if (!imgPath || typeof imgPath !== 'string') {
    return '../assets/perfumes/lattafa-asad.png';
  }
  const trimmed = imgPath.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const clean = trimmed.replace(/^[\/\\]+/, '');
  return `../${clean}`;
}

/**
 * Manejo de error de imagen (Requisito 8):
 * Oculta el icono de imagen rota y el texto alternativo desbordado,
 * desplegando un contenedor de lujo con opción inmediata de subir o corregir la fotografía.
 */
function handleTableImgError(imgEl, prodId, prodName) {
  if (!imgEl) return;
  imgEl.onerror = null;
  imgEl.style.display = 'none';

  const parent = imgEl.parentElement;
  if (parent) {
    parent.classList.add('has-fallback');
    if (!parent.querySelector('.thumb-fallback')) {
      const fb = document.createElement('div');
      fb.className = 'thumb-fallback';
      fb.title = `Sin fotografía válida para «${prodName || 'Fragancia'}». Clic para subir o corregir.`;
      fb.innerHTML = `
        <span class="fallback-icon">💎</span>
        <span class="fallback-label">Subir</span>
      `;
      fb.onclick = (e) => {
        e.stopPropagation();
        editProductModal(prodId);
      };
      parent.appendChild(fb);
    }
  }
}

window.resolvePerfumeImg = resolvePerfumeImg;
window.handleTableImgError = handleTableImgError;


// =========================================================================
// MOTOR LOCAL RESILIENTE EMBEBIDO (Fallback automático si puerto 3000 no responde)
// =========================================================================
const DEFAULT_CONSOLE_STORE = {"users":[{"id":"usr-admin-master-001","name":"Director Alabastro","email":"admin@alabastro.com","phone":"+57 311 254 9053","password_hash":"$2a$10$pfX7DsKQo1mXbCrm7AZD4OxrpNLg82cOpIABE4.hUCBPec0Janzpm","role":"admin","created_at":"2026-10-26T03:27:29.625Z","updated_at":"2026-10-26T03:27:29.625Z"},{"id":"usr-customer-001","name":"Santiago Zapata","email":"santiago@alabastro.co","phone":"+57 311 254 9053","password_hash":"$2a$10$pfX7DsKQo1mXbCrm7AZD4Od4K07kW/zkg4FctPTlKCfP4C5WbFpK2","role":"customer","created_at":"2026-10-26T03:27:29.703Z","updated_at":"2026-10-26T03:27:29.703Z"}],"products":[{"id":"lattafa-asad","name":"Lattafa Asad","full_name":"Lattafa Asad Eau de Parfum 100ml","brand":"Lattafa","gender":"hombre","gender_display":"Hombre","subtitle":"Eau de Parfum — 100ml / 3.4 FL. OZ.","family":"oriental","family_display":"Oriental Especiada Cálida","price":195000,"stock":45,"size":"100 ml / 3.4 FL. OZ.","concentration":"Eau de Parfum (Alta Fijación)","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/lattafa-asad.png","description":"La fragancia masculina árabe más reconocida a nivel mundial. Inicia con un estallido magnético de pimienta negra crujiente, piña caramelizada y hojas de tabaco rubio curado. En su evolución emerge un corazón reconfortante de café arábico tostado, pachulí e iris aterciopelado, reposando sobre un fondo rico y duradero de vainilla bourbon, ámbar cálido, benjuí y cedro seco.","top_notes":["Pimienta Negra","Piña Jugosa","Tabaco Maduro"],"heart_notes":["Café Arábico Tostado","Pachulí de Indonesia","Iris Sedoso"],"base_notes":["Vainilla Bourbon","Ámbar Cálido","Benjuí de Siam","Madera de Cedro"],"longevity":"+12 a 14 Horas garantizadas en piel","sillage":"Intensa, envolvente y distinguida","best_for":"Noches templadas, citas, oficina ejecutiva y eventos de alta presencia","gradient":{"liquid1":"#261C14","liquid2":"#120B07","accent":"#D4AF7A","cap":"#C5A059"},"quiz_tags":{"occasions":["noche","gala","diario"],"sensations":["seduccion","confort"],"intensities":["notable","intensa"]},"is_active":true,"updated_at":"2026-10-26T04:17:41.267Z"},{"id":"lattafa-yara","name":"Lattafa Yara","full_name":"Lattafa Yara Eau de Parfum 100ml","brand":"Lattafa","gender":"mujer","gender_display":"Mujer","subtitle":"Eau de Parfum — 100ml / 3.4 FL. OZ.","family":"gourmand","family_display":"Dulce Gourmand Frutal","price":189000,"stock":50,"size":"100 ml / 3.4 FL. OZ.","concentration":"Eau de Parfum","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/lattafa-yara.png","description":"El fenómeno viral femenino de Lattafa que conquistó la perfumería internacional. Una composición dulce, cremosa y etérea que recuerda a un batido de fresas silvestres y orquídeas con crema batida. Abre con toques luminosos de heliotropo y mandarina, fusionándose con frutas tropicales maduras sobre un manto de vainilla pura de Madagascar, almizcle blanco y sándalo sedoso.","top_notes":["Heliotropo","Orquídea","Mandarina Dulce"],"heart_notes":["Acorde Gourmand Cremoso","Frutas Tropicales Maduras"],"base_notes":["Vainilla de Madagascar","Almizcle Blanco","Sándalo Cremoso"],"longevity":"8 a 10 Horas en piel y ropa","sillage":"Moderada a notable, dulce y encantadora","best_for":"Uso diario, primavera, citas románticas y salidas casuales","gradient":{"liquid1":"#6E2A36","liquid2":"#331017","accent":"#E8A7B5","cap":"#D4AF7A"},"quiz_tags":{"occasions":["diario","noche"],"sensations":["romance","confort"],"intensities":["moderada","notable"]},"is_active":true},{"id":"lattafa-khamrah","name":"Lattafa Khamrah","full_name":"Lattafa Khamrah Eau de Parfum 100ml","brand":"Lattafa","gender":"unisex","gender_display":"Unisex","subtitle":"Eau de Parfum — 100ml / 3.4 FL. OZ.","family":"oriental","family_display":"Oriental Especiada Gourmand","price":235000,"stock":35,"size":"100 ml / 3.4 FL. OZ.","concentration":"Eau de Parfum de Lujo","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/lattafa-khamrah.png","description":"La joya gourmet más prestigiosa de Lattafa, envasada en un frasco de cristal tallado estilo licorera de lujo. Una opulenta danza de canela dulce de Ceilán y nuez moscada con dátiles del desierto y praliné tostado. El secado es pura calidez aristocrática con vainilla bourbon, haba tonka tostada, resinas de benjuí y mirra sagrada.","top_notes":["Canela de Ceilán","Nuez Moscada","Bergamota"],"heart_notes":["Dátiles del Desierto","Praliné Tostado","Nardos Nobles","Mahonial"],"base_notes":["Vainilla Bourbon","Haba Tonka Negra","Benjuí","Madera de Ámbar","Mirra"],"longevity":"+14 Horas de fijación excepcional","sillage":"Pesada, hipnótica y memorable","best_for":"Noches frías, celebraciones de gala, veladas inolvidables","gradient":{"liquid1":"#5A3515","liquid2":"#281507","accent":"#ECC88F","cap":"#B28A56"},"quiz_tags":{"occasions":["noche","gala"],"sensations":["seduccion","confort"],"intensities":["notable","intensa"]},"is_active":true},{"id":"lattafa-badee-al-oud","name":"Lattafa Bade'e Al Oud","full_name":"Lattafa Bade'e Al Oud (Oud for Glory) 100ml","brand":"Lattafa","gender":"unisex","gender_display":"Unisex","subtitle":"Eau de Parfum — 100ml / 3.4 FL. OZ.","family":"amaderada","family_display":"Oriental Amaderada Misteriosa","price":215000,"stock":28,"size":"100 ml / 3.4 FL. OZ.","concentration":"Eau de Parfum Intenso","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/lattafa-badee-al-oud.png","description":"Conocido mundialmente como \"Oud for Glory\", este perfume representa el lujo oscuro y majestuoso de Oriente Medio. Abre con acordes preciosos de azafrán, lavanda y nuez moscada, dando paso a una madera de Oud natural envolvente fusionada con pachulí terroso y almizcle negro.","top_notes":["Azafrán Noble","Nuez Moscada","Lavanda Francesa"],"heart_notes":["Madera de Oud Natural","Pachulí Oscuro"],"base_notes":["Oud Resinoso","Pachulí Macerado","Almizcle Negro"],"longevity":"+14 a 16 Horas de fijación garantizada","sillage":"Poderosa, profunda y dominante","best_for":"Galas nocturnas, clima fresco, eventos de alta distinción","gradient":{"liquid1":"#3D2214","liquid2":"#140A06","accent":"#ECC88F","cap":"#B28A56"},"quiz_tags":{"occasions":["noche","gala"],"sensations":["seduccion"],"intensities":["intensa"]},"is_active":true},{"id":"afnan-9pm","name":"Afnan 9 PM","full_name":"Afnan 9 PM Eau de Parfum 100ml","brand":"Afnan","gender":"hombre","gender_display":"Hombre","subtitle":"Eau de Parfum — 100ml / 3.4 FL. OZ.","family":"oriental","family_display":"Oriental Fougère Dulce Especiada","price":229000,"stock":38,"size":"100 ml / 3.4 FL. OZ.","concentration":"Eau de Parfum","origin":"Emiratos Árabes Unidos","image":"assets/perfumes/afnan-9pm.png","description":"El rey de la noche y de los cumplidos. Afnan 9 PM abre con una salida irresistible de manzana silvestre dulce, canela cálida, bergamota y lavanda aromática, evolucionando hacia un corazón de flor de azahar y asentándose sobre una base seductora de vainilla negra, haba tonka y ámbar gris.","top_notes":["Manzana Silvestre","Canela Cálida","Lavanda Salvaje","Bergamota"],"heart_notes":["Flor de Azahar del Naranjo","Lirio de los Valles"],"base_notes":["Vainilla Negra","Haba Tonka","Ámbar Gris","Pachulí"],"longevity":"+12 Horas de proyección continua","sillage":"Envolvente, seductora y sumamente atractiva","best_for":"Fiestas nocturnas, salidas nocturnas, citas y clima templado","gradient":{"liquid1":"#1F2A38","liquid2":"#0D131B","accent":"#B4C7DC","cap":"#D4AF7A"},"quiz_tags":{"occasions":["noche","diario"],"sensations":["seduccion","confort"],"intensities":["notable","intensa"]},"is_active":true},{"id":"armaf-club-de-nuit-intense-man","name":"Armaf Club de Nuit Intense Man","full_name":"Armaf Club de Nuit Intense Man EDT 105ml","brand":"Armaf","gender":"hombre","gender_display":"Hombre","subtitle":"Eau de Toilette — 105ml / 3.6 FL. OZ.","family":"citrica","family_display":"Cítrica Amaderada Ahumada","price":219000,"stock":40,"size":"105 ml / 3.6 FL. OZ.","concentration":"Eau de Toilette Concentrado","origin":"Emiratos Árabes Unidos","image":"assets/perfumes/armaf-club-de-nuit-intense-man.jpg","description":"El perfume más influyente de la casa Armaf. Su salida chispeante de limón siciliano, piña y grosellas negras evoluciona hacia un corazón ahumado de madera de abedul y jazmín blanco, con un fondo icónico de almizcle, ámbar gris y pachulí que proyecta poder y confianza.","top_notes":["Limón Siciliano","Piña Fresca","Grosellas Negras","Bergamota","Manzana"],"heart_notes":["Madera de Abedul Ahumada","Jazmín Blanco","Rosa de Damasco"],"base_notes":["Almizcle Sensual","Ámbar Gris Mineral","Pachulí Terroso","Vainilla"],"longevity":"+10 a 12 Horas de duración","sillage":"Muy alta, firma inmediatamente reconocible","best_for":"Oficina ejecutiva, uso diario versátil, eventos formales y todas las estaciones","gradient":{"liquid1":"#1E1E1E","liquid2":"#0A0A0A","accent":"#C0C0C0","cap":"#8A8A8A"},"quiz_tags":{"occasions":["diario","gala","noche"],"sensations":["seduccion","frescura"],"intensities":["notable","intensa"]},"is_active":true},{"id":"armaf-club-de-nuit-woman","name":"Armaf Club de Nuit Woman","full_name":"Armaf Club de Nuit Woman EDP 105ml","brand":"Armaf","gender":"mujer","gender_display":"Mujer","subtitle":"Eau de Parfum — 105ml / 3.6 FL. OZ.","family":"floral","family_display":"Floral Frutal Chipre Elegante","price":209000,"stock":32,"size":"105 ml / 3.6 FL. OZ.","concentration":"Eau de Parfum","origin":"Emiratos Árabes Unidos","image":"assets/perfumes/armaf-club-de-nuit-woman.png","description":"Una fragancia femenina refinada de estirpe chipre floral. Combina acordes cítricos luminosos de naranja y toronja con un ramo opulento de rosas, jazmín y durazno melocotón, cerrando con la sensualidad limpia del pachulí macerado, vainilla y vetiver.","top_notes":["Naranja Dulce","Bergamota","Toronja","Durazno Melocotón"],"heart_notes":["Rosa Romántica","Jazmín Sambac","Lichi Jugoso","Geranio"],"base_notes":["Pachulí Radiante","Vainilla Bourbon","Almizcle Limpio","Vetiver"],"longevity":"+9 a 11 Horas de fijación","sillage":"Moderada a notable, elegante y femenina","best_for":"Eventos diurnos, cócteles, oficina, primavera y ocasiones formales","gradient":{"liquid1":"#4A3B2C","liquid2":"#241B12","accent":"#E8D5B5","cap":"#D4AF7A"},"quiz_tags":{"occasions":["diario","gala"],"sensations":["romance","seduccion"],"intensities":["moderada","notable"]},"is_active":true},{"id":"rasasi-hawas-for-him","name":"Rasasi Hawas for Him","full_name":"Rasasi Hawas for Him Eau de Parfum 100ml","brand":"Rasasi","gender":"hombre","gender_display":"Hombre","subtitle":"Eau de Parfum — 100ml / 3.4 FL. OZ.","family":"acuatica","family_display":"Acuática Marina Aromática Especiada","price":295000,"stock":22,"size":"100 ml / 3.4 FL. OZ.","concentration":"Eau de Parfum de Alta Proyección","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/rasasi-hawas-for-him.png","description":"La cumbre de la frescura acuática y especiada de Rasasi. Una explosión vibrante de notas marinas, ciruela violeta, manzana crujiente y limón de Amalfi se combinan con cardamomo y azahar sobre una base oceánica de ámbar gris mineral y maderas flotantes.","top_notes":["Manzana Crujiente","Bergamota Italiana","Limón","Canela"],"heart_notes":["Notas Acuáticas Marinas","Ciruela Violeta","Cardamomo","Flor de Azahar"],"base_notes":["Ámbar Gris Mineral","Almizcle Limpio","Madera Flotante","Pachulí"],"longevity":"+10 a 12 Horas con excelente rendimiento","sillage":"Fuerte, fresca y de largo alcance","best_for":"Verano, clima tropical, salidas informales, calor y momentos activos","gradient":{"liquid1":"#263B4D","liquid2":"#101B24","accent":"#8ABFD4","cap":"#B28A56"},"quiz_tags":{"occasions":["calor","diario"],"sensations":["frescura","seduccion"],"intensities":["notable","intensa"]},"is_active":true},{"id":"al-haramain-amber-oud-gold","name":"Al Haramain Amber Oud Gold Edition","full_name":"Al Haramain Amber Oud Gold Edition 120ml","brand":"Al Haramain","gender":"unisex","gender_display":"Unisex","subtitle":"Eau de Parfum — 120ml / 4.0 FL. OZ.","family":"oriental","family_display":"Oriental Frutal Ambarada de Lujo","price":345000,"stock":18,"size":"120 ml / 4.0 FL. OZ.","concentration":"Eau de Parfum","origin":"Emiratos Árabes Unidos","image":"assets/perfumes/al-haramain-amber-oud-gold.png","description":"Una fragancia icónica de puro prestigio. Notas dulces y jugosas de melón maduro y piña fresca se funden con bergamota y un acorde ambarado suntuoso, descansando sobre una base de maderas nobles, almizcle blanco y vainilla cremosa. Fijación insuperable y estela opulenta.","top_notes":["Bergamota de Calabria","Notas Verdes Frescas"],"heart_notes":["Melón Dulce","Piña Exótica","Notas Ámbar","Acorde Gourmand"],"base_notes":["Vainilla Cremosa","Almizcle Puro","Maderas Nobles Orientales"],"longevity":"+16 Horas de fijación extrema en piel","sillage":"Pesada, opulenta y radiante","best_for":"Ocasiones de lujo, eventos de gala y noches especiales","gradient":{"liquid1":"#5E411B","liquid2":"#2B1B09","accent":"#ECC88F","cap":"#D4AF7A"},"quiz_tags":{"occasions":["gala","noche"],"sensations":["seduccion","confort"],"intensities":["intensa"]},"is_active":true},{"id":"swiss-arabian-shaghaf-oud","name":"Swiss Arabian Shaghaf Oud","full_name":"Swiss Arabian Shaghaf Oud EDP 75ml","brand":"Swiss Arabian","gender":"unisex","gender_display":"Unisex","subtitle":"Eau de Parfum — 75ml / 2.5 FL. OZ.","family":"amaderada","family_display":"Oriental Amaderada Gourmand con Oud","price":249000,"stock":27,"size":"75 ml / 2.5 FL. OZ.","concentration":"Eau de Parfum Oro Puro","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/swiss-arabian-shaghaf-oud.png","description":"La fragancia más emblemática de la histórica casa suizo-árabe Swiss Arabian. Azafrán precioso abre paso a un corazón apasionado de rosa damascena y madera de Oud natural, bañado en praliné dulce y vainilla dorada. Calidez, pasión y lujo en un frasco dorado.","top_notes":["Azafrán Imperial de Persia"],"heart_notes":["Rosa de Damasco Macerada","Madera de Agar (Oud)"],"base_notes":["Praliné Dulce","Vainilla Cálida","Oud Dorado"],"longevity":"+14 a 16 Horas de rendimiento","sillage":"Intensa, cálida, dulce y envolvente","best_for":"Noches frías, celebraciones invernales y amantes del Oud gourmet","gradient":{"liquid1":"#523A1B","liquid2":"#24180A","accent":"#F5DC9A","cap":"#B28A56"},"quiz_tags":{"occasions":["noche","gala"],"sensations":["seduccion","confort"],"intensities":["intensa"]},"is_active":true,"updated_at":"2026-10-26T04:17:12.040Z"},{"id":"maison-alhambra-kismet-magic","name":"Maison Alhambra Kismet Magic","full_name":"Maison Alhambra Kismet Magic EDP 100ml","brand":"Maison Alhambra","gender":"unisex","gender_display":"Unisex","subtitle":"Eau de Parfum — 100ml / 3.4 FL. OZ.","family":"gourmand","family_display":"Oriental Gourmand Licorosa","price":195000,"stock":31,"size":"100 ml / 3.4 FL. OZ.","concentration":"Eau de Parfum","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/maison-alhambra-kismet-magic.png","description":"Una experiencia olfativa adictiva y licorosa. Apertura de coñac añejo y canela dulce que da paso a notas tostadas de haba tonka y roble maduro, coronadas con un fondo delicioso de praliné crocante, vainilla bourbon y sándalo cremoso.","top_notes":["Coñac Francés Licoroso","Canela Dulce"],"heart_notes":["Haba Tonka Negra","Madera de Roble","Caramelo Tostado"],"base_notes":["Vainilla Bourbon","Praliné Crocante","Sándalo Cremoso"],"longevity":"+10 a 12 Horas de duración","sillage":"Cálida, magnética y sensual","best_for":"Citas nocturnas, otoño/invierno, veladas íntimas y cenas elegantes","gradient":{"liquid1":"#4F2E1B","liquid2":"#231209","accent":"#ECC88F","cap":"#B28A56"},"quiz_tags":{"occasions":["noche","diario"],"sensations":["seduccion","confort"],"intensities":["notable","intensa"]},"is_active":true,"updated_at":"2026-10-26T04:17:12.048Z"},{"id":"fragrance-world-signature","name":"Fragrance World Signature","full_name":"Fragrance World Signature EDP 80ml","brand":"Fragrance World","gender":"unisex","gender_display":"Unisex","subtitle":"Eau de Parfum — 80ml / 2.7 FL. OZ.","family":"amaderada","family_display":"Amaderada Aromática Especiada","price":185000,"stock":26,"size":"80 ml / 2.7 FL. OZ.","concentration":"Eau de Parfum","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/fragrance-world-signature.png","description":"La creación insignia de Fragrance World. Destaca por su frescura herbal de albahaca y pimienta rosa, con un corazón elegante de vetiver y maderas ahumadas, y un fondo distinguido de cedro del Atlas, pachulí y ámbar seco.","top_notes":["Albahaca Fresca","Pimienta Rosa"],"heart_notes":["Vetiver de Haití","Maderas Nobles Ahumadas"],"base_notes":["Cedro Atlas","Pachulí Terroso","Ámbar Seco"],"longevity":"8 a 10 Horas de fijación","sillage":"Elegante, equilibrada y pulcra","best_for":"Oficina, reuniones de negocios y uso diario sofisticado","gradient":{"liquid1":"#36402E","liquid2":"#1A2116","accent":"#A8C99B","cap":"#D4AF7A"},"quiz_tags":{"occasions":["diario","calor"],"sensations":["frescura","confort"],"intensities":["moderada","notable"]},"is_active":true},{"id":"lattafa-fakhar-black","name":"Fakhar Black","full_name":"Lattafa Fakhar Black Eau de Parfum 100ml","brand":"Lattafa","gender":"hombre","gender_display":"Hombre","subtitle":"Eau de Parfum — 100ml / 3.4 FL. OZ.","family":"amaderada","family_display":"Aromático / Amaderado","price":165000,"stock":40,"size":"100 ml / 3.4 FL. OZ.","concentration":"Eau de Parfum","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/lattafa-fakhar-black.png","description":"La icónica fragancia masculina de Lattafa que combina la frescura aromática de la manzana verde, bergamota y lavanda con un corazón de flor de naranja y geranio, culminando en un fondo profundo de haba tonka, vetiver, cedro y ámbar sedoso.","top_notes":["Manzana Verde","Bergamota","Lavanda Francesa"],"heart_notes":["Flor de Naranja","Geranio","Salvia"],"base_notes":["Haba Tonka","Madera de Cedro","Vetiver","Ámbar"],"longevity":"+10 a 12 Horas de duración","sillage":"Notable, elegante y versátil","best_for":"Oficina, eventos de día, salidas casuales y cenas","gradient":{"liquid1":"#1A1A1A","liquid2":"#0D0D0D","accent":"#D4AF7A","cap":"#C0C0C0"},"quiz_tags":{"occasions":["diario","noche"],"sensations":["frescura","seduccion"],"intensities":["moderada","notable"]},"is_active":true,"updated_at":"2026-10-27T18:07:19.446Z"},{"id":"afnan-supremacy-not-only-intense","name":"Supremacy Not Only Intense","full_name":"Afnan Supremacy Not Only Intense Extrait de Parfum 100ml","brand":"Afnan","gender":"hombre","gender_display":"Hombre","subtitle":"Extrait de Parfum — 100ml / 3.4 FL. OZ.","family":"amaderada","family_display":"Frutal / Musgo","price":280000,"stock":35,"size":"100 ml / 3.4 FL. OZ.","concentration":"Extrait de Parfum","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/afnan-supremacy-not-only-intense.png","description":"Extrait de Parfum chipre frutal de altísima concentración. Abre con una explosión jugosa de grosella negra, bergamota y manzana fresca, evolucionando hacia un corazón de musgo de roble, pachulí y lavanda, anclado en ámbar gris, almizcle y azafrán.","top_notes":["Grosellas Negras","Bergamota","Manzana Crujiente"],"heart_notes":["Musgo de Roble","Pachulí Terroso","Lavanda"],"base_notes":["Ámbar Gris","Almizcle Blanco","Azafrán"],"longevity":"+14 a 16 Horas de fijación extrema","sillage":"Poderosa, imponente y aristocrática","best_for":"Reuniones ejecutivas, galas, climas templados a fríos","gradient":{"liquid1":"#2D3134","liquid2":"#16191B","accent":"#E0E0E0","cap":"#A0A0A0"},"quiz_tags":{"occasions":["gala","noche","diario"],"sensations":["seduccion","confort"],"intensities":["intensa"]},"is_active":true},{"id":"lattafa-nebras","name":"Nebras","full_name":"Lattafa Nebras Eau de Parfum 100ml","brand":"Lattafa","gender":"unisex","gender_display":"Unisex","subtitle":"Eau de Parfum de Lujo — 100ml / 3.4 FL. OZ.","family":"gourmand","family_display":"Dulce / Gourmand","price":210000,"stock":45,"size":"100 ml / 3.4 FL. OZ.","concentration":"Eau de Parfum","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/lattafa-nebras.png","description":"Un homenaje a la dulzura sensual y gourmand. Abre con bayas rojas jugosas y mandarina madura, fundiéndose en un corazón irresistible de cacao intenso, vainilla cremosa y rosa suave, sobre una base de azúcar morena, haba tonka y ámbar cálido.","top_notes":["Bayas Rojas","Mandarina Jugosa"],"heart_notes":["Cacao Puro","Vainilla Cremosa","Rosa Damascena"],"base_notes":["Azúcar Morena","Haba Tonka","Ámbar Cálido","Almizcle"],"longevity":"+12 a 14 Horas de presencia","sillage":"Envolvente, cálida y deliciosa","best_for":"Citas románticas, noches frías, momentos íntimos","gradient":{"liquid1":"#5E381A","liquid2":"#281406","accent":"#ECC88F","cap":"#D4AF7A"},"quiz_tags":{"occasions":["noche","diario"],"sensations":["seduccion","confort"],"intensities":["notable"]},"is_active":true},{"id":"maison-alhambra-porto-neroli","name":"Porto Neroli","full_name":"Maison Alhambra Porto Neroli Eau de Parfum 80ml","brand":"Maison Alhambra","gender":"unisex","gender_display":"Unisex","subtitle":"Eau de Parfum — 80ml / 2.7 FL. OZ.","family":"citrica","family_display":"Cítricos / Fresco","price":160000,"stock":40,"size":"80 ml / 2.7 FL. OZ.","concentration":"Eau de Parfum","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/maison-alhambra-porto-neroli.png","description":"Evocación luminosa de la Riviera y la brisa mediterránea. Destaca por sus notas vivaces de neroli de Túnez, flor de azahar, bergamota italiana y limón siciliano, suavizadas por una caricia de lavanda, romero, ámbar y mirto fresco.","top_notes":["Neroli de Túnez","Limón Siciliano","Mandarina"],"heart_notes":["Flor de Azahar","Jazmín Marino","Lavanda"],"base_notes":["Ámbar Blanco","Almizcle Puro","Madera de Cedro"],"longevity":"7 a 9 Horas de frescura radiante","sillage":"Moderada, limpia y revitalizante","best_for":"Días soleados, verano, oficina, paseos al aire libre","gradient":{"liquid1":"#0E7C86","liquid2":"#05383E","accent":"#5CE1E6","cap":"#D4AF7A"},"quiz_tags":{"occasions":["diario"],"sensations":["frescura"],"intensities":["moderada"]},"is_active":true},{"id":"al-haramain-laventure","name":"L'Aventure","full_name":"Al Haramain L'Aventure Eau de Parfum 100ml","brand":"Al Haramain","gender":"hombre","gender_display":"Hombre","subtitle":"Eau de Parfum — 100ml / 3.4 FL. OZ.","family":"amaderada","family_display":"Cítricos / Amaderados","price":220000,"stock":50,"size":"100 ml / 3.4 FL. OZ.","concentration":"Eau de Parfum","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/al-haramain-laventure.png","description":"Una joya emiratí aclamada por su apertura cítrica electrizante de bergamota y limón con elemí, transitando con maestría hacia notas de lirio de los valles, jazmín y maderas nobles, reposando en pachulí, ámbar y almizcle blanco.","top_notes":["Bergamota Chispeante","Limón","Elemí"],"heart_notes":["Lirio de los Valles","Jazmín Suave","Maderas Blancas"],"base_notes":["Pachulí","Ámbar Seco","Almizcle"],"longevity":"+11 Horas de rendimiento","sillage":"Marcada, pulcra y sofisticada","best_for":"Uso profesional diario, firmas de contratos, ocasiones distinguidas","gradient":{"liquid1":"#3A3F44","liquid2":"#1C1F22","accent":"#E8E8E8","cap":"#C0C0C0"},"quiz_tags":{"occasions":["diario","gala"],"sensations":["frescura","seduccion"],"intensities":["notable"]},"is_active":true},{"id":"swiss-arabian-casablanca","name":"Casablanca","full_name":"Swiss Arabian Casablanca Eau de Parfum 100ml","brand":"Swiss Arabian","gender":"mujer","gender_display":"Mujer","subtitle":"Eau de Parfum de Lujo — 100ml / 3.4 FL. OZ.","family":"gourmand","family_display":"Dulce / Frutal","price":260000,"stock":40,"size":"100 ml / 3.4 FL. OZ.","concentration":"Eau de Parfum","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/swiss-arabian-casablanca.png","description":"Inspirada en el misterio y la elegancia de la mítica ciudad marroquí. Abre con manzanas crujientes y uvas maduras, entrelazadas con caramelo dorado y pachulí aterciopelado, reposando sobre un lecho sensual de ámbar líquido, gamuza y almizcle blanco.","top_notes":["Manzana Madura","Uvas Jugosas"],"heart_notes":["Caramelo Tostado","Pachulí Aterciopelado","Lirio"],"base_notes":["Ámbar Líquido","Gamuza Suave","Almizcle Blanco"],"longevity":"+12 Horas de encanto garantizado","sillage":"Sensual, envolvente y adictiva","best_for":"Citas especiales, noches templadas, tardes elegantes","gradient":{"liquid1":"#6E4518","liquid2":"#2F1A06","accent":"#ECC88F","cap":"#C5A059"},"quiz_tags":{"occasions":["noche","diario"],"sensations":["seduccion","romance"],"intensities":["notable","intensa"]},"is_active":true},{"id":"armaf-tres-nuit","name":"Tres Nuit","full_name":"Armaf Tres Nuit Eau de Parfum 100ml","brand":"Armaf","gender":"hombre","gender_display":"Hombre","subtitle":"Eau de Parfum — 100ml / 3.4 FL. OZ.","family":"floral","family_display":"Floral / Fresco","price":155000,"stock":45,"size":"100 ml / 3.4 FL. OZ.","concentration":"Eau de Parfum","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/armaf-tres-nuit.png","description":"Una oda a la frescura verde aristocrática. Abre con notas limpias de verbena de limón, iris empolvado y lavanda, desplegando un corazón floral de violetas silvestres y toques especiados, finalizando en un fondo de sándalo y ámbar gris refinado.","top_notes":["Verbena de Limón","Iris Noble","Limón"],"heart_notes":["Hojas de Violeta","Lavanda","Toques Especiados"],"base_notes":["Ámbar Gris","Madera de Sándalo"],"longevity":"8 a 10 Horas en piel","sillage":"Agradable, pulcra y caballerosa","best_for":"Primavera, verano, oficina, eventos de día","gradient":{"liquid1":"#1E293B","liquid2":"#0F172A","accent":"#94A3B8","cap":"#CBD5E1"},"quiz_tags":{"occasions":["diario"],"sensations":["frescura"],"intensities":["moderada"]},"is_active":true},{"id":"fragrance-world-barakkat-rouge-540","name":"Barakkat Rouge 540","full_name":"Fragrance World Barakkat Rouge 540 Eau de Parfum 100ml","brand":"Fragrance World","gender":"unisex","gender_display":"Unisex","subtitle":"Eau de Parfum — 100ml / 3.4 FL. OZ.","family":"amaderada","family_display":"Dulce / Amaderado","price":145000,"stock":55,"size":"100 ml / 3.4 FL. OZ.","concentration":"Eau de Parfum","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/fragrance-world-barakkat-rouge-540.png","description":"El aclamado tributo al brillo del cristal y el ámbar mineral. Inicia con azafrán resplandeciente y jazmín aéreo, transformándose en una estela de madera de cedro dulce, ámbar gris mineral y toques algodonados de azúcar caramelizada.","top_notes":["Azafrán Radiante","Jazmín Grandiflorum"],"heart_notes":["Madera de Ámbar","Ámbar Gris Mineral"],"base_notes":["Resina de Abeto","Cedro Rojo de Virginia"],"longevity":"+12 Horas de presencia hipnótica","sillage":"Inolvidable, etérea y magnética","best_for":"Celebraciones, galas, cualquier época del año","gradient":{"liquid1":"#7A1C20","liquid2":"#350A0C","accent":"#F0C068","cap":"#ECC88F"},"quiz_tags":{"occasions":["gala","noche"],"sensations":["seduccion"],"intensities":["intensa"]},"is_active":true},{"id":"paris-corner-emir-celestial","name":"Emir Celestial","full_name":"Paris Corner Emir Celestial Eau de Parfum 100ml","brand":"Paris Corner","gender":"unisex","gender_display":"Unisex","subtitle":"Eau de Parfum — 100ml / 3.4 FL. OZ.","family":"amaderada","family_display":"Cuero / Especiado","price":195000,"stock":35,"size":"100 ml / 3.4 FL. OZ.","concentration":"Eau de Parfum","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/paris-corner-emir-celestial.png","description":"Composición futurista y vanguardista con matices minerales y de cuero suave. Despliega notas fascinantes de hojas de violeta, mandarina italiana y flor de siempreviva, complementadas con cuero fino, gamuza y un fondo mineral magnético de Akigalawood.","top_notes":["Mandarina Italiana","Flor de Siempreviva","Azafrán"],"heart_notes":["Hojas de Violeta","Gamuza Fina","Osmanthus"],"base_notes":["Madera de Akigala","Cuero Suave","Notas Minerales"],"longevity":"+12 a 14 Horas de fijación","sillage":"Distinguida, única y vanguardista","best_for":"Noches cosmopolitas, clima templado a fresco, arte y diseño","gradient":{"liquid1":"#142850","liquid2":"#081226","accent":"#D4AF7A","cap":"#C5A059"},"quiz_tags":{"occasions":["noche","gala"],"sensations":["seduccion","confort"],"intensities":["notable"]},"is_active":true},{"id":"lattafa-ameer-al-oudh-intense-oud","name":"Ameer Al Oudh Intense Oud","full_name":"Lattafa Ameer Al Oudh Intense Oud 100ml","brand":"Lattafa","gender":"unisex","gender_display":"Unisex","subtitle":"Eau de Parfum — 100ml / 3.4 FL. OZ.","family":"oriental","family_display":"Oriental / Dulce","price":185000,"stock":45,"size":"100 ml / 3.4 FL. OZ.","concentration":"Eau de Parfum","origin":"Dubái, Emiratos Árabes Unidos","image":"assets/perfumes/lattafa-ameer-al-oudh-intense-oud.png","description":"El aroma de una chimenea aristocrática en una noche árabe de invierno. Un abrazo cálido de maderas tostadas, azúcar morena caramelizada y vainilla bourbon, enriquecido con madera de oud especiada, ládano y notas balsámicas profundamente reconfortantes.","top_notes":["Madera de Oud Especiada","Maderas Tostadas"],"heart_notes":["Vainilla Bourbon","Azúcar Caramelizada"],"base_notes":["Oud Puro","Sándalo","Resinas de Benjuí"],"longevity":"+14 Horas de fijación acogedora","sillage":"Cálida, generosa y envolvente","best_for":"Climas fríos, invierno, veladas nocturnas junto al fuego","gradient":{"liquid1":"#542E10","liquid2":"#201004","accent":"#ECC88F","cap":"#B28A56"},"quiz_tags":{"occasions":["noche","diario"],"sensations":["confort","seduccion"],"intensities":["intensa"]},"is_active":true}],"orders":[{"id":"ORD-2026-2954","user_id":null,"customer_name":"Cliente Alabastro","customer_email":"cliente.web@alabastro.com","customer_phone":"+57 311 254 9053","shipping_address":"Carrera 7 # 116-50","city":"Bogotá D.C.","payment_method":"Tarjeta de Crédito / PSE","status":693000,"subtotal":0,"shipping_cost":693000,"total":0,"gift_packaging":false,"notes":"[{\"id\":\"swiss-arabian-shaghaf-oud\",\"name\":\"Swiss Arabian Shaghaf Oud\",\"price\":249000,\"quantity\":2},{\"id\":\"maison-alhambra-kismet-magic\",\"name\":\"Maison Alhambra Kismet Magic\",\"price\":195000,\"quantity\":1}]","created_at":"2026-10-26T04:17:12.053Z","updated_at":"2026-10-26T04:17:12.053Z"},{"id":"ORD-2026-9041","user_id":null,"customer_name":"Valeria Restrepo","customer_email":"valeria.restrepo@luxury.co","customer_phone":"+57 312 458 9912","shipping_address":"Cra 43A # 1-50, Edificio Santillana Apto 902","city":"Medellín","payment_method":"transferencia","status":"entregado","subtotal":470000,"shipping_cost":0,"total":470000,"gift_packaging":true,"notes":"Fragancia empacada con cinta dorada de lujo para obsequio.","items":[{"id":"lattafa-khamrah","name":"Lattafa Khamrah","price":235000,"quantity":2}],"created_at":"2026-10-24T03:27:29.525Z","updated_at":"2026-10-25T03:27:29.525Z"},{"id":"ORD-2026-9042","user_id":null,"customer_name":"Camilo Echeverri","customer_email":"camilo.ech@bogota.co","customer_phone":"+57 300 891 2244","shipping_address":"Calle 116 # 9-45, Chicó Norte","city":"Bogotá","payment_method":"contraentrega","status":"en_preparacion","subtotal":195000,"shipping_cost":15000,"total":210000,"gift_packaging":false,"notes":"Favor timbrar en recepción.","items":[{"id":"lattafa-asad","name":"Lattafa Asad","price":195000,"quantity":1}],"created_at":"2026-10-25T22:27:29.525Z","updated_at":"2026-10-26T01:27:29.525Z"},{"id":"ORD-2026-9043","user_id":null,"customer_name":"Mariana Zuluaga","customer_email":"mariana.z@cali.co","customer_phone":"+57 315 780 1234","shipping_address":"Avenida Colombia # 4N-20, Ciudad Jardín","city":"Cali","payment_method":"wompi","status":"confirmado","subtotal":378000,"shipping_cost":0,"total":378000,"gift_packaging":true,"notes":"Regalo especial de aniversario.","items":[{"id":"lattafa-yara","name":"Lattafa Yara","price":189000,"quantity":2}],"created_at":"2026-10-26T02:27:29.525Z","updated_at":"2026-10-26T02:27:29.525Z"}],"subscribers":[{"id":1,"email":"sofia.duque@luxury.com","active":true,"created_at":"2026-10-26T03:27:29.703Z"},{"id":2,"email":"felipe.arias@inversionistas.co","active":true,"created_at":"2026-10-26T03:27:29.703Z"}],"reviews":[{"id":1,"product_id":"lattafa-asad","author_name":"Andrés Felipe M.","rating":5,"comment":"La mejor compra de perfumería nicho que he hecho en Colombia. Dura fácilmente 14 horas en mi piel y la estela es imponente.","verified_purchase":true,"status":"aprobada","created_at":"2026-10-26T03:27:29.703Z"},{"id":2,"product_id":"lattafa-khamrah","author_name":"Carolina V.","rating":5,"comment":"Un licor de canela y dátiles sumamente refinado. El frasco de cristal tallado y la presentación deslumbran tanto como el aroma.","verified_purchase":true,"status":"aprobada","created_at":"2026-10-26T03:27:29.703Z"}],"settings":[{"key":"store_config","value":{"storeName":"ALABASTRO — Alta Perfumería","contactPhone":"+57 311 254 9053","contactEmail":"concierge@alabastro.com.co","whatsappSales":"573112549053","freeShippingThreshold":350000,"bannerNotice":"Envíos Nacionales Asegurados sin costo en compras superiores a $350.000 COP","enableStoreOrders":true},"updated_at":"2026-10-26T03:27:29.703Z"}],"activity_logs":[{"id":1,"user_id":"usr-admin-master-001","user_name":"Director Alabastro","action":"SISTEMA_INIT","details":"Alabastro Engine activado con catálogo verificado de 12 fragancias.","created_at":"2026-10-26T03:27:29.703Z"}]};

const LocalConsoleEngine = {
  STORAGE_KEY: 'alabastro_console_store_v1',

  getStore() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    const fresh = JSON.parse(JSON.stringify(DEFAULT_CONSOLE_STORE));
    this.saveStore(fresh);
    return fresh;
  },

  saveStore(store) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(store));
    } catch (e) {}
  },

  addLog(store, action, details) {
    if (!Array.isArray(store.activity_logs)) store.activity_logs = [];
    store.activity_logs.push({
      id: store.activity_logs.length + 1,
      user_id: 'usr-admin-master-001',
      user_name: (CONSOLA_STATE.currentUser && CONSOLA_STATE.currentUser.name) || 'Director Alabastro',
      action,
      details,
      created_at: new Date().toISOString()
    });
  },

  async handleRequest(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};
    const store = this.getStore();

    const cleanUrl = url.replace(/^https?:\/\/[^/]+/, '');
    const [pathname, queryString] = cleanUrl.split('?');
    const params = new URLSearchParams(queryString || '');

    // 1. Auth Login
    if (pathname === '/api/auth/login' && method === 'POST') {
      const email = (body.email || '').trim().toLowerCase();
      const pass = body.password || '';
      const user = (store.users || []).find(u => u.email.toLowerCase() === email);
      const isMaster = email === 'admin@alabastro.com' && (pass === 'AdminAlabastro2026!' || pass === 'admin123');
      if ((user && user.role === 'admin' && isMaster) || isMaster) {
        const adminUser = user || {
          id: 'usr-admin-master-001',
          name: 'Director Alabastro',
          email: 'admin@alabastro.com',
          phone: '+57 311 254 9053',
          role: 'admin'
        };
        this.addLog(store, 'LOGIN_ADMIN', 'Ingreso a la Consola de Administración');
        this.saveStore(store);
        return {
          status: 200,
          data: {
            success: true,
            token: 'local-admin-token-alabastro-2026',
            user: adminUser
          }
        };
      }
      return {
        status: 401,
        data: { success: false, message: 'Credenciales inválidas. Usa admin@alabastro.com / AdminAlabastro2026!' }
      };
    }

    // 2. Auth Me
    if (pathname === '/api/auth/me' && method === 'GET') {
      if (CONSOLA_STATE.token) {
        const adminUser = (store.users || []).find(u => u.role === 'admin') || {
          id: 'usr-admin-master-001',
          name: 'Director Alabastro',
          email: 'admin@alabastro.com',
          phone: '+57 311 254 9053',
          role: 'admin'
        };
        return { status: 200, data: { success: true, user: adminUser } };
      }
      return { status: 401, data: { success: false, message: 'No autorizado' } };
    }

    // 3. Users
    if (pathname === '/api/auth/users' && method === 'GET') {
      return { status: 200, data: { success: true, users: store.users || [] } };
    }
    const roleMatch = pathname.match(/^\/api\/auth\/users\/([^/]+)\/role$/);
    if (roleMatch && method === 'PATCH') {
      const uid = decodeURIComponent(roleMatch[1]);
      const u = (store.users || []).find(x => x.id === uid);
      if (!u) return { status: 404, data: { success: false, message: 'Usuario no encontrado.' } };
      u.role = body.role;
      u.updated_at = new Date().toISOString();
      this.addLog(store, 'CAMBIO_ROL', `Rol de ${u.email} modificado a ${body.role}`);
      this.saveStore(store);
      return { status: 200, data: { success: true, message: `Rol actualizado a ${body.role}.`, user: u } };
    }

    // 4. Metrics
    if (pathname === '/api/metrics' && method === 'GET') {
      const orders = store.orders || [];
      const products = store.products || [];
      const users = store.users || [];
      const subscribers = store.subscribers || [];
      const logs = store.activity_logs || [];

      const nonCancelled = orders.filter(o => o.status !== 'cancelado');
      const totalSales = nonCancelled.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const statusCounts = { pendiente: 0, confirmado: 0, en_preparacion: 0, enviado: 0, entregado: 0, cancelado: 0 };
      orders.forEach(o => {
        if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
      });

      const activeProds = products.filter(p => p.is_active !== false);
      const pausedProds = products.filter(p => p.is_active === false);
      const outOfStockCount = activeProds.filter(p => Number(p.stock) === 0).length;
      const lowStockCount = activeProds.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 15).length;
      const totalStockUnits = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);

      const lowStockProducts = [...products]
        .filter(p => Number(p.stock) <= 20)
        .sort((a, b) => Number(a.stock) - Number(b.stock))
        .slice(0, 8);

      const recentOrders = [...orders]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      const recentLogs = [...logs]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      return {
        status: 200,
        data: {
          success: true,
          metrics: {
            totalSales,
            totalOrders: nonCancelled.length,
            statusCounts,
            pendingOrders: statusCounts.pendiente || 0,
            totalRegisteredProducts: products.length,
            activeProducts: activeProds.length,
            pausedProducts: pausedProds.length,
            outOfStockCount,
            lowStockCount,
            totalStockUnits,
            totalUsers: users.filter(u => u.role === 'customer').length,
            totalSubscribers: subscribers.length,
            recentOrders,
            recentLogs,
            lowStockProducts
          }
        }
      };
    }

    // 5. Products
    if (pathname === '/api/products' && method === 'GET') {
      const all = params.get('all') === 'true';
      let list = [...(store.products || [])];
      if (!all) list = list.filter(p => p.is_active !== false);
      return { status: 200, data: { success: true, count: list.length, products: list } };
    }

    if (pathname === '/api/products/upload-image' && method === 'POST') {
      return {
        status: 200,
        data: {
          success: true,
          message: 'Fotografía cargada exitosamente.',
          imageUrl: body.imageBase64 || 'assets/perfumes/lattafa-asad.png'
        }
      };
    }

    if (pathname === '/api/products' && method === 'POST') {
      const baseSlug = (body.name || 'perfume').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const id = body.id ? body.id.trim() : (baseSlug + '-' + Math.random().toString(36).substring(2, 6));
      const newProd = {
        id,
        name: (body.name || '').trim(),
        full_name: body.fullName || `${body.brand || 'Lattafa'} ${body.name || ''}`,
        brand: body.brand || 'Lattafa',
        gender: body.gender || 'unisex',
        gender_display: body.genderDisplay || 'Unisex',
        subtitle: body.subtitle || 'Eau de Parfum — 100ml',
        family: body.family || 'oriental',
        family_display: body.familyDisplay || 'Oriental',
        price: Number(body.price || 195000),
        stock: Number(body.stock !== undefined ? body.stock : 25),
        size: body.size || '100 ml / 3.4 FL. OZ.',
        concentration: body.concentration || 'Eau de Parfum',
        origin: body.origin || 'Dubái, Emiratos Árabes Unidos',
        image: body.image || 'assets/perfumes/lattafa-asad.png',
        description: body.description || '',
        top_notes: body.topNotes || [],
        heart_notes: body.heartNotes || [],
        base_notes: body.baseNotes || [],
        longevity: body.longevity || '+12 Horas',
        sillage: body.sillage || 'Intensa',
        best_for: body.bestFor || 'Ocasiones especiales',
        gradient: body.gradient || { liquid1: '#523A21', liquid2: '#24180D', accent: '#D4AF7A', cap: '#B28A56' },
        quiz_tags: body.quizTags || { occasions: ['noche'], sensations: ['seduccion'], intensities: ['intensa'] },
        is_active: body.isActive !== undefined ? Boolean(body.isActive) : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      store.products.push(newProd);
      this.addLog(store, 'CREAR_PRODUCTO', `Nueva fragancia creada: ${newProd.name} (${id})`);
      this.saveStore(store);
      return {
        status: 201,
        data: {
          success: true,
          message: `Fragancia «${newProd.name}» agregada exitosamente al catálogo.`,
          product: newProd
        }
      };
    }

    const prodToggleMatch = pathname.match(/^\/api\/products\/([^/]+)\/toggle$/);
    if (prodToggleMatch && method === 'PATCH') {
      const id = decodeURIComponent(prodToggleMatch[1]);
      const p = (store.products || []).find(x => x.id === id);
      if (!p) return { status: 404, data: { success: false, message: 'Producto no encontrado.' } };
      p.is_active = !p.is_active;
      p.updated_at = new Date().toISOString();
      const actionText = p.is_active ? 'activada en la tienda pública' : 'pausada del catálogo público';
      this.addLog(store, p.is_active ? 'ACTIVAR_PRODUCTO' : 'PAUSAR_PRODUCTO', `Fragancia «${p.name}» (${id}) ${actionText}.`);
      this.saveStore(store);
      return {
        status: 200,
        data: {
          success: true,
          message: `Fragancia «${p.name}» ${actionText}.`,
          product: p
        }
      };
    }

    const prodStockMatch = pathname.match(/^\/api\/products\/([^/]+)\/stock$/);
    if (prodStockMatch && method === 'PATCH') {
      const id = decodeURIComponent(prodStockMatch[1]);
      const parsedStock = parseInt(body.stock, 10);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return { status: 400, data: { success: false, message: 'El inventario debe ser mayor o igual a 0.' } };
      }
      const p = (store.products || []).find(x => x.id === id);
      if (!p) return { status: 404, data: { success: false, message: 'Producto no encontrado.' } };
      p.stock = parsedStock;
      p.updated_at = new Date().toISOString();
      this.addLog(store, 'AJUSTE_STOCK', `Stock de «${p.name}» ajustado a ${parsedStock} unidades.`);
      this.saveStore(store);
      return {
        status: 200,
        data: {
          success: true,
          message: `Stock de «${p.name}» ajustado a ${parsedStock} unidades.`,
          product: p
        }
      };
    }

    const prodItemMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
    if (prodItemMatch && method === 'PUT') {
      const id = decodeURIComponent(prodItemMatch[1]);
      const p = (store.products || []).find(x => x.id === id);
      if (!p) return { status: 404, data: { success: false, message: 'Producto no encontrado.' } };
      if (body.name !== undefined) p.name = body.name;
      if (body.fullName !== undefined) p.full_name = body.fullName;
      if (body.brand !== undefined) p.brand = body.brand;
      if (body.gender !== undefined) p.gender = body.gender;
      if (body.genderDisplay !== undefined) p.gender_display = body.genderDisplay;
      if (body.subtitle !== undefined) p.subtitle = body.subtitle;
      if (body.family !== undefined) p.family = body.family;
      if (body.familyDisplay !== undefined) p.family_display = body.familyDisplay;
      if (body.price !== undefined) p.price = Number(body.price);
      if (body.stock !== undefined) p.stock = Number(body.stock);
      if (body.size !== undefined) p.size = body.size;
      if (body.concentration !== undefined) p.concentration = body.concentration;
      if (body.origin !== undefined) p.origin = body.origin;
      if (body.image !== undefined) p.image = body.image;
      if (body.description !== undefined) p.description = body.description;
      if (body.topNotes !== undefined) p.top_notes = body.topNotes;
      if (body.heartNotes !== undefined) p.heart_notes = body.heartNotes;
      if (body.baseNotes !== undefined) p.base_notes = body.baseNotes;
      if (body.longevity !== undefined) p.longevity = body.longevity;
      if (body.sillage !== undefined) p.sillage = body.sillage;
      if (body.bestFor !== undefined) p.best_for = body.bestFor;
      if (body.isActive !== undefined) p.is_active = Boolean(body.isActive);
      p.updated_at = new Date().toISOString();
      this.addLog(store, 'ACTUALIZAR_PRODUCTO', `Fragancia actualizada: ${p.name} (${id})`);
      this.saveStore(store);
      return {
        status: 200,
        data: {
          success: true,
          message: `Fragancia «${p.name}» actualizada exitosamente.`,
          product: p
        }
      };
    }

    if (prodItemMatch && method === 'DELETE') {
      const id = decodeURIComponent(prodItemMatch[1]);
      const permanent = params.get('permanent') === 'true';
      const idx = (store.products || []).findIndex(x => x.id === id);
      if (idx === -1) return { status: 404, data: { success: false, message: 'Producto no encontrado.' } };
      const prod = store.products[idx];

      const hasOrders = (store.orders || []).some(o => JSON.stringify(o.items || []).includes(id));
      if (hasOrders && permanent) {
        return {
          status: 409,
          data: {
            success: false,
            hasOrders: true,
            message: `No es posible eliminar permanentemente «${prod.name}» porque tiene pedidos asociados. Puedes pausarlo en su lugar.`
          }
        };
      }

      if (permanent) {
        store.products.splice(idx, 1);
        this.addLog(store, 'ELIMINAR_PRODUCTO_PERMANENTE', `Producto eliminado definitivamente: ${prod.name} (${id})`);
        this.saveStore(store);
        return { status: 200, data: { success: true, message: `Fragancia «${prod.name}» eliminada definitivamente.` } };
      } else {
        prod.is_active = false;
        this.addLog(store, 'PAUSAR_PRODUCTO', `Fragancia pausada: ${prod.name} (${id})`);
        this.saveStore(store);
        return { status: 200, data: { success: true, message: `Fragancia «${prod.name}» pausada del catálogo público.` } };
      }
    }

    // 6. Orders
    if (pathname === '/api/orders' && method === 'GET') {
      return { status: 200, data: { success: true, orders: store.orders || [] } };
    }
    const orderStatusMatch = pathname.match(/^\/api\/orders\/([^/]+)\/status$/);
    if (orderStatusMatch && method === 'PATCH') {
      const oid = decodeURIComponent(orderStatusMatch[1]);
      const ord = (store.orders || []).find(o => o.id === oid);
      if (!ord) return { status: 404, data: { success: false, message: 'Pedido no encontrado.' } };
      const prev = ord.status;
      ord.status = body.status;
      ord.updated_at = new Date().toISOString();
      this.addLog(store, 'CAMBIO_ESTADO_PEDIDO', `Pedido ${oid} pasó de «${prev}» a «${body.status}»`);
      this.saveStore(store);
      return { status: 200, data: { success: true, message: `Estado del pedido ${oid} actualizado a «${body.status}».`, order: ord } };
    }

    // 7. Subscribers
    if (pathname === '/api/subscribers' && method === 'GET') {
      return { status: 200, data: { success: true, subscribers: store.subscribers || [] } };
    }
    const subDelMatch = pathname.match(/^\/api\/subscribers\/([^/]+)$/);
    if (subDelMatch && method === 'DELETE') {
      const sid = subDelMatch[1];
      store.subscribers = (store.subscribers || []).filter(s => String(s.id) !== String(sid));
      this.saveStore(store);
      return { status: 200, data: { success: true, message: 'Suscriptor eliminado.' } };
    }

    // 8. Reviews
    if (pathname === '/api/reviews' && method === 'GET') {
      const list = (store.reviews || []).map(r => {
        const p = (store.products || []).find(x => x.id === r.product_id);
        return { ...r, product_name: r.product_name || (p ? p.name : r.product_id) };
      });
      return { status: 200, data: { success: true, reviews: list } };
    }
    const revStatusMatch = pathname.match(/^\/api\/reviews\/([^/]+)\/status$/);
    if (revStatusMatch && method === 'PATCH') {
      const rid = revStatusMatch[1];
      const rev = (store.reviews || []).find(r => String(r.id) === String(rid));
      if (rev) {
        rev.status = body.status;
        this.saveStore(store);
      }
      return { status: 200, data: { success: true, message: `Reseña marcada como «${body.status}».`, review: rev } };
    }
    const revDelMatch = pathname.match(/^\/api\/reviews\/([^/]+)$/);
    if (revDelMatch && method === 'DELETE') {
      const rid = revDelMatch[1];
      store.reviews = (store.reviews || []).filter(r => String(r.id) !== String(rid));
      this.saveStore(store);
      return { status: 200, data: { success: true, message: 'Reseña eliminada.' } };
    }

    // 9. Settings
    if (pathname === '/api/settings' && method === 'GET') {
      const row = (store.settings || []).find(s => s.key === 'store_config');
      return { status: 200, data: { success: true, settings: row ? row.value : {} } };
    }
    if (pathname === '/api/settings' && method === 'PUT') {
      let row = (store.settings || []).find(s => s.key === 'store_config');
      if (row) {
        row.value = body;
      } else {
        if (!store.settings) store.settings = [];
        store.settings.push({ key: 'store_config', value: body });
      }
      this.addLog(store, 'ACTUALIZAR_AJUSTES', 'Configuración de tienda actualizada');
      this.saveStore(store);
      return { status: 200, data: { success: true, message: 'Configuración guardada exitosamente.', settings: body } };
    }

    return { status: 200, data: { success: true } };
  }
};


const API = {
  async fetch(url, options = {}) {
    const fullUrl = (url.startsWith('http://') || url.startsWith('https://'))
      ? url
      : `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (CONSOLA_STATE.token) {
      headers['Authorization'] = `Bearer ${CONSOLA_STATE.token}`;
    }

    // Si estamos en protocolo http/https y no tenemos un token estrictamente local, probar primero el backend REST
    if (window.location.protocol !== 'file:' && CONSOLA_STATE.token !== 'local-admin-token-alabastro-2026') {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 1500);
        const response = await fetch(fullUrl, { ...options, headers, signal: ctrl.signal });
        clearTimeout(timer);
        const data = await response.json();

        if (response.status === 401) {
          // Si el token expiró en el backend, verificar con el motor local o cerrar sesión
          const localRes = await LocalConsoleEngine.handleRequest(url, options);
          if (localRes.status === 200) {
            return localRes.data;
          }
          handleAdminLogout();
          showToast('Sesión expirada. Por favor ingresa nuevamente.', '🔒');
        }

        CONSOLA_STATE.backendOnline = true;
        return data;
      } catch (err) {
        CONSOLA_STATE.backendOnline = false;
      }
    } else if (window.location.protocol !== 'file:') {
      // Incluso con token local, verificar si el backend está activo para operaciones públicas o re-login
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 1200);
        const response = await fetch(fullUrl, { ...options, headers, signal: ctrl.signal });
        clearTimeout(timer);
        if (response.ok) {
          const data = await response.json();
          CONSOLA_STATE.backendOnline = true;
          return data;
        }
      } catch (e) {
        CONSOLA_STATE.backendOnline = false;
      }
    }

    // Fallback transparente al Motor Local Resiliente Embebido
    const localResult = await LocalConsoleEngine.handleRequest(url, options);
    return localResult.data;
  }
};

/* ==========================================================================
   1. Inicialización y Autenticación
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  initClock();
  setupSidebarNavigation();
  setupAuthEventListeners();
  setupActionListeners();

  // Verificar si hay sesión previa
  if (CONSOLA_STATE.token) {
    await verifyCurrentSession();
  } else {
    showAuthGate();
  }
});

function initClock() {
  const clockEl = document.getElementById('currentClock');
  const update = () => {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  };
  update();
  setInterval(update, 1000);
}

async function verifyCurrentSession() {
  try {
    const res = await API.fetch('/api/auth/me');
    if (res.success && res.user && res.user.role === 'admin') {
      CONSOLA_STATE.currentUser = res.user;
      showConsolaApp();
      loadAllData();
    } else {
      handleAdminLogout();
      showAuthGate();
    }
  } catch {
    handleAdminLogout();
    showAuthGate();
  }
}

function showAuthGate() {
  document.getElementById('authGate').style.display = 'flex';
  document.getElementById('consolaApp').style.display = 'none';
}

function showConsolaApp() {
  document.getElementById('authGate').style.display = 'none';
  document.getElementById('consolaApp').style.display = 'flex';

  if (CONSOLA_STATE.currentUser) {
    const nameEl = document.getElementById('adminName');
    const avatarEl = document.getElementById('adminAvatar');
    if (nameEl) nameEl.textContent = CONSOLA_STATE.currentUser.name;
    if (avatarEl) avatarEl.textContent = CONSOLA_STATE.currentUser.name.charAt(0).toUpperCase();
  }
}

function handleAdminLogout() {
  CONSOLA_STATE.token = null;
  CONSOLA_STATE.currentUser = null;
  localStorage.removeItem('alabastro_admin_token');
  showAuthGate();
}

function setupAuthEventListeners() {
  const loginForm = document.getElementById('adminLoginForm');
  const quickDemoBtn = document.getElementById('btnQuickDemoLogin');
  const logoutBtn = document.getElementById('btnLogoutAdmin');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('adminEmail')?.value.trim();
      const password = document.getElementById('adminPassword')?.value;

      try {
        const res = await API.fetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        if (res.success && res.token && res.user.role === 'admin') {
          CONSOLA_STATE.token = res.token;
          CONSOLA_STATE.currentUser = res.user;
          localStorage.setItem('alabastro_admin_token', res.token);
          showConsolaApp();
          loadAllData();
          showToast(`¡Bienvenido a la Consola, ${res.user.name.split(' ')[0]}!`, '👑');
          loginForm.reset();
        } else {
          showToast(res.message || 'Credenciales o privilegios insuficientes.', '⚠️');
        }
      } catch (err) {
        showToast('Error al conectar con el servidor.', '❌');
      }
    });
  }

  if (quickDemoBtn) {
    quickDemoBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('adminEmail');
      const passInput = document.getElementById('adminPassword');
      if (emailInput) emailInput.value = 'admin@alabastro.com';
      if (passInput) passInput.value = 'AdminAlabastro2026!';
      showToast('Credenciales maestras ingresadas. Iniciando sesión...', '👑');
      if (typeof loginForm.requestSubmit === 'function') {
        loginForm.requestSubmit();
      } else {
        loginForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      handleAdminLogout();
      showToast('Has cerrado sesión en la Consola.', '👋');
    });
  }
}

/* ==========================================================================
   2. Navegación del Menú en el Lado Izquierdo (Sidebar)
   ========================================================================== */
function setupSidebarNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      switchTab(targetTab);
    });
  });

  // Enlace desde dashboard para ver todos los pedidos
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.goto);
    });
  });
}

function switchTab(tabId) {
  CONSOLA_STATE.currentTab = tabId;

  // Actualizar botones de navegación izquierda
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Actualizar vistas
  document.querySelectorAll('.consola-view').forEach(view => {
    if (view.id === `view-${tabId}`) {
      view.classList.add('active');
    } else {
      view.classList.remove('active');
    }
  });

  // Título en el topbar
  const titles = {
    dashboard: 'Panel General',
    products: 'Catálogo de Fragancias',
    orders: 'Gestión de Pedidos',
    users: 'Usuarios y Privilegios',
    subscribers: 'Suscriptores Newsletter',
    reviews: 'Reseñas & Testimonios',
    settings: 'Ajustes de Tienda'
  };

  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = titles[tabId] || 'Consola';
}

/* ==========================================================================
   3. Carga Centralizada de Datos desde PostgreSQL
   ========================================================================== */
async function loadAllData() {
  await Promise.allSettled([
    loadMetrics(),
    loadProducts(),
    loadOrders(),
    loadUsers(),
    loadSubscribers(),
    loadReviews(),
    loadSettings()
  ]);
}

/* ==========================================================================
   4. Métricas & Dashboard
   ========================================================================== */
async function loadMetrics() {
  try {
    const res = await API.fetch('/api/metrics');
    if (res.success && res.metrics) {
      CONSOLA_STATE.metrics = res.metrics;
      renderMetricsUI();
    }
  } catch (err) {
    console.error('Error al cargar métricas:', err);
  }
}

function renderMetricsUI() {
  const m = CONSOLA_STATE.metrics;
  if (!m) return;

  const totalSalesEl = document.getElementById('metricTotalSales');
  const salesSubEl = document.getElementById('metricSalesSub');
  const activeOrdersEl = document.getElementById('metricActiveOrders');
  const pendingCountEl = document.getElementById('metricPendingCount');
  const totalProductsEl = document.getElementById('metricTotalProducts');
  const activeCountEl = document.getElementById('metricActiveCount');
  const lowStockAlertEl = document.getElementById('metricLowStockAlert');
  const lowStockSubEl = document.getElementById('metricLowStockSub');
  const audienceEl = document.getElementById('metricAudience');
  const audienceSubEl = document.getElementById('metricAudienceSub');

  if (totalSalesEl) totalSalesEl.textContent = formatCOP(m.totalSales || 0);
  if (salesSubEl) salesSubEl.textContent = `${m.totalOrders || 0} pedidos confirmados`;
  if (activeOrdersEl) activeOrdersEl.textContent = m.totalOrders || 0;
  if (pendingCountEl) pendingCountEl.textContent = `${m.pendingOrders || (m.statusCounts && m.statusCounts.pendiente) || 0} pendientes de despacho`;
  if (totalProductsEl) totalProductsEl.textContent = m.totalRegisteredProducts || m.totalProducts || CONSOLA_STATE.products.length;
  if (activeCountEl) activeCountEl.textContent = `${m.activeProducts || m.totalProducts || CONSOLA_STATE.products.length} activos en catálogo`;
  if (lowStockAlertEl) lowStockAlertEl.textContent = (m.outOfStockCount || 0) + (m.lowStockCount || 0);
  if (lowStockSubEl) lowStockSubEl.textContent = `${m.outOfStockCount || 0} agotados / ${m.lowStockCount || 0} bajo inventario`;
  if (audienceEl) audienceEl.textContent = (m.totalUsers || 0) + (m.totalSubscribers || 0);
  if (audienceSubEl) audienceSubEl.textContent = `${m.totalUsers || 0} clientes / ${m.totalSubscribers || 0} suscriptores`;

  // Actualizar badge en menú lateral
  const orderBadge = document.getElementById('sidebarOrderCount');
  const pendingOrders = m.pendingOrders || (m.statusCounts && m.statusCounts.pendiente) || 0;
  if (orderBadge) {
    orderBadge.textContent = pendingOrders;
    orderBadge.style.display = pendingOrders > 0 ? 'inline-block' : 'none';
  }

  // Renderizar tabla de pedidos recientes en Dashboard
  renderDashboardOrders(m.recentOrders || []);

  // Renderizar lista de alertas de stock
  renderDashboardStockAlerts(m.lowStockProducts || []);

  // Renderizar logs de auditoría
  renderDashboardActivityLogs(m.recentLogs || []);
}

function renderDashboardOrders(orders) {
  const tbody = document.getElementById('dashboardOrdersTable');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No hay pedidos registrados en PostgreSQL aún.</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(ord => {
    return `
      <tr>
        <td><strong>${ord.id}</strong></td>
        <td>${escapeHTML(ord.customer_name)}</td>
        <td><strong>${formatCOP(ord.total)}</strong></td>
        <td><span class="status-badge ${ord.status}">${formatStatus(ord.status)}</span></td>
        <td>${new Date(ord.created_at).toLocaleDateString('es-CO')}</td>
        <td>
          <button class="btn-action-sm" onclick="openOrderDetailModal('${ord.id}')">Ver Detalle</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderDashboardStockAlerts(products) {
  const container = document.getElementById('dashboardStockList');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = '<div class="table-empty" style="padding: 16px;">Todos los perfumes tienen existencias suficientes.</div>';
    return;
  }

  container.innerHTML = products.map(p => {
    const pillClass = p.stock === 0 ? 'critical' : (p.stock <= 15 ? 'low' : 'ok');
    const label = p.stock === 0 ? 'Agotado (0 u.)' : (p.stock <= 15 ? `Bajo (${p.stock} u.)` : `${p.stock} u.`);
    const photoSrc = resolvePerfumeImg(p.image);
    const safeName = escapeHTML(p.name || '');

    return `
      <div class="stock-alert-item">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="table-perfume-thumb" style="width: 36px; height: 42px;" onclick="editProductModal('${p.id}')">
            <img src="${escapeHTML(photoSrc)}" 
                 alt="${safeName}" 
                 loading="lazy"
                 onerror="handleTableImgError(this, '${p.id}', '${safeName.replace(/'/g, "\\'")}')">
          </div>
          <div class="stock-info">
            <span class="stock-name">${safeName}</span>
            <span class="stock-family">${escapeHTML(p.brand || '')} • ${escapeHTML(p.family_display || '')}</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="stock-pill ${pillClass}">${label}</span>
          <button class="btn-action-sm" onclick="openStockModal('${p.id}')">Ajustar</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderDashboardActivityLogs(logs) {
  const container = document.getElementById('dashboardActivityLogs');
  if (!container) return;

  if (logs.length === 0) {
    container.innerHTML = '<div class="table-empty">No hay registros de auditoría en PostgreSQL aún.</div>';
    return;
  }

  container.innerHTML = logs.map(l => {
    const time = new Date(l.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    return `
      <div class="log-entry">
        <span class="log-time">${time}</span>
        <span class="log-user">[${escapeHTML(l.user_name || 'Sistema')}]:</span>
        <span class="log-desc">${escapeHTML(l.details || l.action)}</span>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   5. Catálogo de Productos (CRUD Completo conectado a PostgreSQL)
   ========================================================================== */
async function loadProducts() {
  try {
    const res = await API.fetch('/api/products?all=true');
    if (res.success && res.products) {
      CONSOLA_STATE.products = res.products;
      renderProductsTable();

      const badge = document.getElementById('sidebarProductCount');
      if (badge) badge.textContent = res.products.length;
    }
  } catch (err) {
    console.error('Error al cargar productos desde PostgreSQL:', err);
  }
}

function renderProductsTable() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  const search = document.getElementById('productSearchInput')?.value.trim().toLowerCase() || '';
  const family = document.getElementById('productFamilyFilter')?.value || 'todos';
  const statusFilter = document.getElementById('productStatusFilter')?.value || 'todos';

  const filtered = CONSOLA_STATE.products.filter(p => {
    const brandStr = (p.brand || '').toLowerCase();
    const nameStr = (p.name || '').toLowerCase();
    const fullNameStr = (p.full_name || '').toLowerCase();
    const descStr = (p.description || '').toLowerCase();
    const familyDisplayStr = (p.family_display || '').toLowerCase();

    const matchesSearch = !search ||
      nameStr.includes(search) ||
      brandStr.includes(search) ||
      fullNameStr.includes(search) ||
      descStr.includes(search) ||
      familyDisplayStr.includes(search);

    const matchesFamily = family === 'todos' || p.family === family;

    let matchesStatus = true;
    if (statusFilter === 'activos') matchesStatus = Boolean(p.is_active);
    else if (statusFilter === 'pausados') matchesStatus = !p.is_active;

    return matchesSearch && matchesFamily && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="table-empty">No se encontraron fragancias en la base de datos con los filtros seleccionados.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const stockPillClass = p.stock === 0 ? 'out' : (p.stock <= 15 ? 'low' : 'ok');
    const stockText = p.stock === 0 ? 'Agotado (0 u.)' : (p.stock <= 15 ? `Poco (${p.stock} u.)` : `Disponible (${p.stock} u.)`);
    const photoSrc = resolvePerfumeImg(p.image);
    const safeName = escapeHTML(p.name || 'Fragancia');
    const safeBrand = escapeHTML(p.brand || 'Lattafa');

    return `
      <tr>
        <td>
          <div class="table-perfume-thumb" title="${safeName}" onclick="editProductModal('${p.id}')">
            <img src="${escapeHTML(photoSrc)}" 
                 alt="${safeName}" 
                 loading="lazy" 
                 onerror="handleTableImgError(this, '${p.id}', '${safeName.replace(/'/g, "\\'")}')">
          </div>
        </td>
        <td>
          <div class="table-perfume-brand">${escapeHTML(p.brand || 'Lattafa')}</div>
          <div class="table-perfume-title">${escapeHTML(p.name)}</div>
          <div style="font-size: 11px; color: var(--color-gris-texto);">${escapeHTML(p.subtitle || p.size || '')}</div>
        </td>
        <td>
          <span class="status-badge customer">${escapeHTML(p.family_display || p.family)}</span>
        </td>
        <td>
          <strong style="color: var(--color-dorado-brillo); font-size: 14px;">${formatCOP(p.price)}</strong>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="stock-pill ${stockPillClass}">${stockText}</span>
            <button class="btn-action-sm" onclick="openStockModal('${p.id}')" title="Ajustar inventario rápido">📦</button>
          </div>
        </td>
        <td>
          <span style="font-size: 12px; color: var(--color-gris-claro);">${escapeHTML(p.concentration || 'Eau de Parfum')}</span>
        </td>
        <td>
          <span class="status-badge ${p.is_active ? 'aprobada' : 'rechazada'}">
            ${p.is_active ? '● Activo' : '○ Pausado'}
          </span>
        </td>
        <td style="text-align: right;">
          <div style="display: flex; gap: 6px; justify-content: flex-end;">
            <button class="btn-action-sm" onclick="editProductModal('${p.id}')" title="Editar todos los datos">✏️ Editar</button>
            <button class="btn-action-sm" style="${p.is_active ? 'color: #E59840;' : 'color: #66BB6A;'}" onclick="toggleProductActive('${p.id}', ${p.is_active})" title="${p.is_active ? 'Ocultar de la tienda' : 'Hacer visible en la tienda'}">
              ${p.is_active ? '⏸️ Pausar' : '▶️ Activar'}
            </button>
            <button class="btn-action-sm btn-action-danger" onclick="openDeleteModal('${p.id}')" title="Administrar eliminación o pausa">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Variables para modales auxiliares
let CURRENT_STOCK_PRODUCT_ID = null;
let CURRENT_DELETE_PRODUCT_ID = null;

function openStockModal(id) {
  const prod = CONSOLA_STATE.products.find(p => p.id === id);
  if (!prod) return;

  CURRENT_STOCK_PRODUCT_ID = id;
  const nameEl = document.getElementById('stockModalProdName');
  const inputEl = document.getElementById('stockModalInput');

  if (nameEl) nameEl.textContent = `${prod.brand || ''} ${prod.name}`;
  if (inputEl) {
    inputEl.value = prod.stock;
    inputEl.focus();
  }

  document.getElementById('stockModal').style.display = 'flex';
}

function closeStockModal() {
  document.getElementById('stockModal').style.display = 'none';
  CURRENT_STOCK_PRODUCT_ID = null;
}

function openDeleteModal(id) {
  const prod = CONSOLA_STATE.products.find(p => p.id === id);
  if (!prod) return;

  CURRENT_DELETE_PRODUCT_ID = id;
  const nameEl = document.getElementById('deleteModalProdName');
  if (nameEl) nameEl.textContent = `«${prod.brand || ''} ${prod.name}»`;

  document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
  document.getElementById('deleteModal').style.display = 'none';
  CURRENT_DELETE_PRODUCT_ID = null;
}

async function toggleProductActive(id, currentActive) {
  const actionWord = currentActive ? 'pausar' : 'activar';
  try {
    const res = await API.fetch(`/api/products/${id}/toggle`, { method: 'PATCH' });
    if (res.success) {
      showToast(res.message, currentActive ? '⏸️' : '✨');
      await loadProducts();
      await loadMetrics();
    }
  } catch (err) {
    showToast('Error al actualizar estado en PostgreSQL.', '❌');
  }
}

function openCreateProductModal() {
  document.getElementById('prodFormId').value = '';
  document.getElementById('productForm').reset();

  document.getElementById('prodFormBrand').value = 'Lattafa';
  document.getElementById('prodFormGender').value = 'unisex';
  document.getElementById('prodFormFamily').value = 'oriental';
  document.getElementById('prodFormSize').value = '100 ml / 3.4 FL. OZ.';
  document.getElementById('prodFormConcentration').value = 'Eau de Parfum';
  document.getElementById('prodFormOrigin').value = 'Dubái, Emiratos Árabes Unidos';
  document.getElementById('prodFormPrice').value = '195000';
  document.getElementById('prodFormStock').value = '25';
  document.getElementById('prodFormStatus').value = 'true';
  document.getElementById('prodFormImage').value = 'assets/perfumes/lattafa-asad.png';

  const preview = document.getElementById('prodImagePreview');
  if (preview) {
    preview.style.display = 'block';
    preview.src = resolvePerfumeImg('assets/perfumes/lattafa-asad.png');
  }

  const hint = document.getElementById('prodPriceHint');
  if (hint) hint.textContent = formatCOP(195000);

  document.getElementById('productModalTitle').textContent = 'Agregar Nueva Fragancia Árabe';
  document.getElementById('productModal').style.display = 'flex';
}

function editProductModal(id) {
  const prod = CONSOLA_STATE.products.find(p => p.id === id);
  if (!prod) return;

  document.getElementById('prodFormId').value = prod.id;
  document.getElementById('prodFormBrand').value = prod.brand || 'Lattafa';
  document.getElementById('prodFormName').value = prod.name;
  document.getElementById('prodFormGender').value = prod.gender || 'unisex';
  document.getElementById('prodFormSubtitle').value = prod.subtitle || '';
  document.getElementById('prodFormFamily').value = prod.family;
  document.getElementById('prodFormPrice').value = Number(prod.price);
  document.getElementById('prodFormStock').value = prod.stock;
  document.getElementById('prodFormStatus').value = prod.is_active ? 'true' : 'false';
  document.getElementById('prodFormSize').value = prod.size || '100 ml / 3.4 FL. OZ.';
  document.getElementById('prodFormConcentration').value = prod.concentration || 'Eau de Parfum';
  document.getElementById('prodFormOrigin').value = prod.origin || 'Dubái, Emiratos Árabes Unidos';

  const imgVal = prod.image || 'assets/perfumes/lattafa-asad.png';
  document.getElementById('prodFormImage').value = imgVal;
  const preview = document.getElementById('prodImagePreview');
  if (preview) {
    preview.style.display = 'block';
    preview.src = resolvePerfumeImg(imgVal);
    preview.onerror = () => {
      preview.onerror = null;
      preview.src = resolvePerfumeImg('assets/perfumes/lattafa-asad.png');
    };
  }

  const hint = document.getElementById('prodPriceHint');
  if (hint) hint.textContent = formatCOP(prod.price);

  document.getElementById('prodFormDesc').value = prod.description || '';

  const top = Array.isArray(prod.top_notes) ? prod.top_notes.join(', ') : (typeof prod.top_notes === 'string' ? JSON.parse(prod.top_notes || '[]').join(', ') : '');
  const heart = Array.isArray(prod.heart_notes) ? prod.heart_notes.join(', ') : (typeof prod.heart_notes === 'string' ? JSON.parse(prod.heart_notes || '[]').join(', ') : '');
  const base = Array.isArray(prod.base_notes) ? prod.base_notes.join(', ') : (typeof prod.base_notes === 'string' ? JSON.parse(prod.base_notes || '[]').join(', ') : '');

  document.getElementById('prodFormTopNotes').value = top;
  document.getElementById('prodFormHeartNotes').value = heart;
  document.getElementById('prodFormBaseNotes').value = base;
  document.getElementById('prodFormLongevity').value = prod.longevity || '+12 a 14 Horas';
  document.getElementById('prodFormSillage').value = prod.sillage || 'Intensa, envolvente y distinguida';
  document.getElementById('prodFormBestFor').value = prod.best_for || 'Noches especiales y eventos';

  document.getElementById('productModalTitle').textContent = `Editar Fragancia: ${prod.brand || ''} ${prod.name}`;
  document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
  document.getElementById('productModal').style.display = 'none';
}

/* ==========================================================================
   6. Gestión de Pedidos / Órdenes
   ========================================================================== */
async function loadOrders() {
  try {
    const res = await API.fetch('/api/orders');
    if (res.success && res.orders) {
      CONSOLA_STATE.orders = res.orders;
      renderOrdersTable();
    }
  } catch (err) {
    console.error('Error al cargar pedidos:', err);
  }
}

function renderOrdersTable() {
  const tbody = document.getElementById('ordersTableBody');
  if (!tbody) return;

  const search = document.getElementById('orderSearchInput')?.value.trim().toLowerCase() || '';
  const status = CONSOLA_STATE.currentStatusFilter;

  const filtered = CONSOLA_STATE.orders.filter(o => {
    const matchesSearch = !search ||
      o.id.toLowerCase().includes(search) ||
      o.customer_name.toLowerCase().includes(search) ||
      o.customer_email.toLowerCase().includes(search) ||
      o.city.toLowerCase().includes(search);

    const matchesStatus = status === 'todos' || o.status === status;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="table-empty">No se encontraron pedidos con los criterios seleccionados.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(o => {
    const itemsCount = Array.isArray(o.items) ? o.items.reduce((acc, it) => acc + (it.quantity || 1), 0) : 1;
    const dateStr = new Date(o.created_at).toLocaleDateString('es-CO');

    return `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>${dateStr}</td>
        <td>
          <strong>${escapeHTML(o.customer_name)}</strong>
          <div style="font-size: 11px; color: var(--color-gris-texto);">${escapeHTML(o.customer_email)}</div>
          <div style="font-size: 11px; color: var(--color-gris-texto);">${escapeHTML(o.customer_phone || '')}</div>
        </td>
        <td>
          <div>${escapeHTML(o.city)}</div>
          <div style="font-size: 11px; color: var(--color-gris-texto);">${escapeHTML(o.shipping_address)}</div>
        </td>
        <td>${itemsCount} fragancia(s)</td>
        <td><strong>${formatCOP(o.total)}</strong></td>
        <td>
          <select class="form-control" style="padding: 4px 8px; font-size: 12px; width: 140px;" onchange="updateOrderStatus('${o.id}', this.value)">
            <option value="pendiente" ${o.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="confirmado" ${o.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
            <option value="en_preparacion" ${o.status === 'en_preparacion' ? 'selected' : ''}>En Preparación</option>
            <option value="enviado" ${o.status === 'enviado' ? 'selected' : ''}>Enviado</option>
            <option value="entregado" ${o.status === 'entregado' ? 'selected' : ''}>Entregado</option>
            <option value="cancelado" ${o.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>
        </td>
        <td>
          <button class="btn-action-sm" onclick="openOrderDetailModal('${o.id}')">Ver Detalle</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await API.fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    if (res.success) {
      showToast(res.message, '📦');
      await loadOrders();
      await loadMetrics();
    }
  } catch (err) {
    showToast('Error al actualizar estado del pedido.', '❌');
  }
}

function openOrderDetailModal(orderId) {
  const order = CONSOLA_STATE.orders.find(o => o.id === orderId);
  if (!order) return;

  const modalBody = document.getElementById('orderModalBody');
  document.getElementById('orderModalTitle').textContent = `Pedido: ${order.id}`;

  const itemsHtml = (order.items || []).map(it => `
    <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
      <span>${escapeHTML(it.name)} × ${it.quantity}</span>
      <strong>${formatCOP(it.price * it.quantity)}</strong>
    </div>
  `).join('');

  modalBody.innerHTML = `
    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 14px; color: var(--color-dorado-brillo); margin-bottom: 8px;">Datos del Cliente &amp; Envío</h4>
      <p><strong>Cliente:</strong> ${escapeHTML(order.customer_name)}</p>
      <p><strong>Correo:</strong> ${escapeHTML(order.customer_email)}</p>
      <p><strong>Teléfono:</strong> ${escapeHTML(order.customer_phone || 'No especificado')}</p>
      <p><strong>Ciudad:</strong> ${escapeHTML(order.city)}</p>
      <p><strong>Dirección:</strong> ${escapeHTML(order.shipping_address)}</p>
      <p><strong>Método de Pago:</strong> ${escapeHTML(order.payment_method || 'Transferencia')}</p>
      ${order.gift_packaging ? '<p style="color: #ECC88F;">🎁 <strong>Empaque de regalo y tarjeta solicitada</strong></p>' : ''}
      ${order.notes ? `<p style="margin-top: 6px; font-style: italic; color: var(--color-gris-claro);">Nota del cliente: «${escapeHTML(order.notes)}»</p>` : ''}
    </div>

    <div style="margin-bottom: 16px;">
      <h4 style="font-size: 14px; color: var(--color-dorado-brillo); margin-bottom: 8px;">Fragancias Solicitadas</h4>
      ${itemsHtml}
    </div>

    <div style="display: flex; justify-content: space-between; font-size: 16px; padding-top: 10px; border-top: 1px solid var(--color-negro-borde);">
      <span>Total Liquidado:</span>
      <strong style="color: var(--color-dorado-brillo);">${formatCOP(order.total)}</strong>
    </div>
  `;

  document.getElementById('orderModal').style.display = 'flex';
}

function closeOrderModal() {
  document.getElementById('orderModal').style.display = 'none';
}

/* ==========================================================================
   7. Usuarios y Roles
   ========================================================================== */
async function loadUsers() {
  try {
    const res = await API.fetch('/api/auth/users');
    if (res.success && res.users) {
      CONSOLA_STATE.users = res.users;
      renderUsersTable();
    }
  } catch (err) {
    console.error('Error al cargar usuarios:', err);
  }
}

function renderUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  if (CONSOLA_STATE.users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No hay usuarios registrados.</td></tr>';
    return;
  }

  tbody.innerHTML = CONSOLA_STATE.users.map(u => {
    const dateStr = new Date(u.created_at).toLocaleDateString('es-CO');
    const isMasterAdmin = u.email === 'admin@alabastro.com';

    return `
      <tr>
        <td><strong>${escapeHTML(u.name)}</strong></td>
        <td>${escapeHTML(u.email)}</td>
        <td>${escapeHTML(u.phone || '—')}</td>
        <td><span class="status-badge ${u.role}">${u.role === 'admin' ? 'ADMINISTRADOR' : 'CLIENTE'}</span></td>
        <td>${dateStr}</td>
        <td>
          ${isMasterAdmin ? '<span style="font-size: 11px; color: var(--color-dorado-brillo);">Cuenta Maestra</span>' : `
            <button class="btn-action-sm" onclick="toggleUserRole('${u.id}', '${u.role}')">
              ${u.role === 'admin' ? 'Degradar a Cliente' : 'Ascender a Admin'}
            </button>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

async function toggleUserRole(userId, currentRole) {
  const newRole = currentRole === 'admin' ? 'customer' : 'admin';
  if (!confirm(`¿Deseas cambiar el rol de este usuario a ${newRole}?`)) return;

  try {
    const res = await API.fetch(`/api/auth/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole })
    });
    if (res.success) {
      showToast(res.message, '👥');
      await loadUsers();
    }
  } catch (err) {
    showToast('Error al modificar rol.', '❌');
  }
}

/* ==========================================================================
   8. Suscriptores Newsletter
   ========================================================================== */
async function loadSubscribers() {
  try {
    const res = await API.fetch('/api/subscribers');
    if (res.success && res.subscribers) {
      CONSOLA_STATE.subscribers = res.subscribers;
      renderSubscribersTable();

      const badge = document.getElementById('sidebarSubCount');
      if (badge) badge.textContent = res.subscribers.length;
    }
  } catch (err) {
    console.error('Error al cargar suscriptores:', err);
  }
}

function renderSubscribersTable() {
  const tbody = document.getElementById('subscribersTableBody');
  if (!tbody) return;

  if (CONSOLA_STATE.subscribers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-empty">No hay suscriptores aún.</td></tr>';
    return;
  }

  tbody.innerHTML = CONSOLA_STATE.subscribers.map((s, idx) => {
    const dateStr = new Date(s.created_at).toLocaleDateString('es-CO');
    return `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${escapeHTML(s.email)}</strong></td>
        <td>${dateStr}</td>
        <td><span class="status-badge aprobada">Activo</span></td>
        <td>
          <button class="btn-action-sm btn-action-danger" onclick="deleteSubscriber(${s.id})">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function deleteSubscriber(id) {
  if (!confirm('¿Eliminar este suscriptor?')) return;
  try {
    const res = await API.fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
    if (res.success) {
      showToast(res.message, '🗑️');
      await loadSubscribers();
    }
  } catch (err) {
    showToast('Error al eliminar suscriptor.', '❌');
  }
}

function exportSubscribersCSV() {
  if (CONSOLA_STATE.subscribers.length === 0) {
    showToast('No hay suscriptores para exportar.', '⚠️');
    return;
  }

  let csv = 'ID,Email,Fecha_Suscripcion\n';
  CONSOLA_STATE.subscribers.forEach(s => {
    csv += `${s.id},"${s.email}","${s.created_at}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alabastro_suscriptores_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  showToast('Archivo CSV descargado con éxito.', '📥');
}

/* ==========================================================================
   9. Reseñas y Testimonios
   ========================================================================== */
async function loadReviews() {
  try {
    const res = await API.fetch('/api/reviews');
    if (res.success && res.reviews) {
      CONSOLA_STATE.reviews = res.reviews;
      renderReviewsTable();
    }
  } catch (err) {
    console.error('Error al cargar reseñas:', err);
  }
}

function renderReviewsTable() {
  const tbody = document.getElementById('reviewsTableBody');
  if (!tbody) return;

  if (CONSOLA_STATE.reviews.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No hay reseñas para moderar.</td></tr>';
    return;
  }

  tbody.innerHTML = CONSOLA_STATE.reviews.map(r => {
    const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    return `
      <tr>
        <td><strong>${escapeHTML(r.product_name || r.product_id)}</strong></td>
        <td>${escapeHTML(r.author_name)}</td>
        <td style="color: #D4AF7A; font-size: 14px;">${stars}</td>
        <td style="font-style: italic; max-width: 300px;">«${escapeHTML(r.comment)}»</td>
        <td><span class="status-badge ${r.status}">${r.status}</span></td>
        <td>
          <div style="display: flex; gap: 4px;">
            ${r.status !== 'aprobada' ? `<button class="btn-action-sm" onclick="moderateReview(${r.id}, 'aprobada')">Aprobar</button>` : ''}
            ${r.status !== 'rechazada' ? `<button class="btn-action-sm btn-action-danger" onclick="moderateReview(${r.id}, 'rechazada')">Rechazar</button>` : ''}
            <button class="btn-action-sm btn-action-danger" onclick="deleteReview(${r.id})">✕</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function moderateReview(id, status) {
  try {
    const res = await API.fetch(`/api/reviews/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    if (res.success) {
      showToast(res.message, '⭐');
      await loadReviews();
    }
  } catch (err) {
    showToast('Error al moderar reseña.', '❌');
  }
}

async function deleteReview(id) {
  if (!confirm('¿Eliminar esta reseña definitivamente?')) return;
  try {
    const res = await API.fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    if (res.success) {
      showToast(res.message, '🗑️');
      await loadReviews();
    }
  } catch (err) {
    showToast('Error al eliminar reseña.', '❌');
  }
}

/* ==========================================================================
   10. Ajustes y Configuración de Tienda
   ========================================================================== */
async function loadSettings() {
  try {
    const res = await API.fetch('/api/settings');
    if (res.success && res.settings) {
      CONSOLA_STATE.settings = res.settings;
      populateSettingsForm(res.settings);
    }
  } catch (err) {
    console.error('Error al cargar configuración:', err);
  }
}

function populateSettingsForm(s) {
  const freeShipInput = document.getElementById('settingFreeShipping');
  const whatsappInput = document.getElementById('settingWhatsapp');
  const bannerInput = document.getElementById('settingBannerNotice');
  const phoneInput = document.getElementById('settingContactPhone');
  const emailInput = document.getElementById('settingContactEmail');

  if (freeShipInput && s.freeShippingThreshold) freeShipInput.value = s.freeShippingThreshold;
  if (whatsappInput && s.whatsappSales) whatsappInput.value = s.whatsappSales;
  if (bannerInput && s.bannerNotice) bannerInput.value = s.bannerNotice;
  if (phoneInput && s.contactPhone) phoneInput.value = s.contactPhone;
  if (emailInput && s.contactEmail) emailInput.value = s.contactEmail;
}

/* ==========================================================================
   11. Listeners de Acciones y Formularios
   ========================================================================== */
function setupActionListeners() {
  // Botón refrescar datos
  document.getElementById('btnRefreshData')?.addEventListener('click', async () => {
    showToast('Sincronizando datos con PostgreSQL...', '🔄');
    await loadAllData();
    showToast('Datos actualizados en tiempo real.', '✅');
  });

  // Botón nueva fragancia
  document.getElementById('btnCreateProduct')?.addEventListener('click', openCreateProductModal);
  document.getElementById('btnQuickNewProduct')?.addEventListener('click', () => {
    switchTab('products');
    openCreateProductModal();
  });

  // Modal producto: cerrar
  document.getElementById('btnCloseProductModal')?.addEventListener('click', closeProductModal);
  document.getElementById('btnCancelProductModal')?.addEventListener('click', closeProductModal);

  // Modal orden: cerrar
  document.getElementById('btnCloseOrderModal')?.addEventListener('click', closeOrderModal);
  document.getElementById('btnCloseOrderModal2')?.addEventListener('click', closeOrderModal);

  // Formulario Producto Submit (Crear o Actualizar)
  document.getElementById('productForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('prodFormId').value;
    const isEdit = Boolean(id);

    const brand = document.getElementById('prodFormBrand').value.trim();
    const name = document.getElementById('prodFormName').value.trim();
    const gender = document.getElementById('prodFormGender').value;
    const subtitle = document.getElementById('prodFormSubtitle').value.trim();
    const family = document.getElementById('prodFormFamily').value;
    const price = parseFloat(document.getElementById('prodFormPrice').value);
    const stock = parseInt(document.getElementById('prodFormStock').value, 10);
    const size = document.getElementById('prodFormSize').value.trim();
    const concentration = document.getElementById('prodFormConcentration').value.trim();
    const origin = document.getElementById('prodFormOrigin').value.trim();
    const image = document.getElementById('prodFormImage').value.trim() || 'assets/perfumes/lattafa-asad.png';
    const isActive = document.getElementById('prodFormStatus').value === 'true';
    const description = document.getElementById('prodFormDesc').value.trim();

    if (!name || !brand || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
      showToast('Verifica que el nombre, marca, precio (> 0) y stock (>= 0) sean válidos.', '⚠️');
      return;
    }

    const parseNotes = (val) => val.split(',').map(s => s.trim()).filter(Boolean);
    const topNotes = parseNotes(document.getElementById('prodFormTopNotes').value);
    const heartNotes = parseNotes(document.getElementById('prodFormHeartNotes').value);
    const baseNotes = parseNotes(document.getElementById('prodFormBaseNotes').value);

    const longevity = document.getElementById('prodFormLongevity').value.trim();
    const sillage = document.getElementById('prodFormSillage').value.trim();
    const bestFor = document.getElementById('prodFormBestFor').value.trim();

    const genderDisplay = gender === 'hombre' ? 'Hombre' : (gender === 'mujer' ? 'Mujer' : 'Unisex');
    const familyDisplay = family.charAt(0).toUpperCase() + family.slice(1);

    const payload = {
      name,
      fullName: `${brand} ${name}`,
      brand,
      gender,
      genderDisplay,
      subtitle: subtitle || `${concentration} — ${size}`,
      family,
      familyDisplay,
      price,
      stock,
      size,
      concentration,
      origin,
      image,
      description,
      topNotes,
      heartNotes,
      baseNotes,
      longevity,
      sillage,
      bestFor,
      isActive
    };

    try {
      const url = isEdit ? `/api/products/${id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await API.fetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (res.success) {
        showToast(res.message, '✨');
        closeProductModal();
        await loadProducts();
        await loadMetrics();
      } else {
        showToast(res.message || 'Error al guardar fragancia.', '❌');
      }
    } catch (err) {
      showToast('Error al conectar con la base de datos PostgreSQL.', '❌');
    }
  });

  // Selector y subida de fotografía en modal de producto
  const imgInput = document.getElementById('prodFormImage');
  const imgPreview = document.getElementById('prodImagePreview');
  const imgSelect = document.getElementById('prodFormImageSelect');
  const fileInput = document.getElementById('prodFormFileInput');
  const btnUploadTrigger = document.getElementById('btnUploadImageTrigger');

  imgInput?.addEventListener('input', () => {
    if (imgPreview && imgInput.value.trim()) {
      imgPreview.style.display = 'block';
      imgPreview.src = resolvePerfumeImg(imgInput.value.trim());
    }
  });

  imgSelect?.addEventListener('change', () => {
    if (imgSelect.value) {
      imgInput.value = imgSelect.value;
      if (imgPreview) {
        imgPreview.style.display = 'block';
        imgPreview.src = resolvePerfumeImg(imgSelect.value);
      }
    }
  });

  btnUploadTrigger?.addEventListener('click', () => {
    fileInput?.click();
  });

  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      if (imgPreview) {
        imgPreview.style.display = 'block';
        imgPreview.src = base64Data;
      }

      try {
        showToast('Subiendo fotografía...', '⏳');
        const uploadRes = await API.fetch('/api/products/upload-image', {
          method: 'POST',
          body: JSON.stringify({
            filename: file.name,
            imageBase64: base64Data
          })
        });

        if (uploadRes.success && uploadRes.imageUrl) {
          imgInput.value = uploadRes.imageUrl;
          if (imgPreview) {
            imgPreview.style.display = 'block';
            imgPreview.src = resolvePerfumeImg(uploadRes.imageUrl);
          }
          showToast(uploadRes.message, '📸');
        } else {
          showToast(uploadRes.message || 'Error al subir fotografía', '⚠️');
        }
      } catch (err) {
        showToast('Error al procesar la subida del archivo.', '❌');
      }
    };
    reader.readAsDataURL(file);
  });

  // Formato dinámico del precio en el modal
  document.getElementById('prodFormPrice')?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    const hint = document.getElementById('prodPriceHint');
    if (hint) {
      hint.textContent = !isNaN(val) && val > 0 ? formatCOP(val) : '$ 0 COP';
    }
  });

  // Modal Ajuste de Stock
  document.getElementById('btnCloseStockModal')?.addEventListener('click', closeStockModal);
  document.getElementById('btnCancelStockModal')?.addEventListener('click', closeStockModal);
  document.getElementById('btnConfirmStockModal')?.addEventListener('click', async () => {
    if (!CURRENT_STOCK_PRODUCT_ID) return;
    const input = document.getElementById('stockModalInput');
    const val = parseInt(input.value, 10);
    if (isNaN(val) || val < 0) {
      showToast('Ingresa un número entero no negativo.', '⚠️');
      return;
    }

    try {
      const res = await API.fetch(`/api/products/${CURRENT_STOCK_PRODUCT_ID}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stock: val })
      });
      if (res.success) {
        showToast(res.message, '📦');
        closeStockModal();
        await loadProducts();
        await loadMetrics();
      }
    } catch (err) {
      showToast('Error al actualizar inventario en PostgreSQL.', '❌');
    }
  });

  // Modal Eliminar / Pausar
  document.getElementById('btnCloseDeleteModal')?.addEventListener('click', closeDeleteModal);
  document.getElementById('btnCancelDeleteModal')?.addEventListener('click', closeDeleteModal);

  document.getElementById('btnPauseInstead')?.addEventListener('click', async () => {
    if (!CURRENT_DELETE_PRODUCT_ID) return;
    try {
      const res = await API.fetch(`/api/products/${CURRENT_DELETE_PRODUCT_ID}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: false })
      });
      if (res.success) {
        showToast('Fragancia pausada del catálogo público.', '⏸️');
        closeDeleteModal();
        await loadProducts();
        await loadMetrics();
      }
    } catch (err) {
      showToast('Error al pausar la fragancia.', '❌');
    }
  });

  document.getElementById('btnConfirmPermanentDelete')?.addEventListener('click', async () => {
    if (!CURRENT_DELETE_PRODUCT_ID) return;
    try {
      const res = await API.fetch(`/api/products/${CURRENT_DELETE_PRODUCT_ID}?permanent=true`, {
        method: 'DELETE'
      });
      if (res.success) {
        showToast(res.message, '🗑️');
        closeDeleteModal();
        await loadProducts();
        await loadMetrics();
      } else {
        showToast(res.message || 'No fue posible eliminar el producto.', '⚠️');
        if (res.hasOrders) {
          const pauseBtn = document.getElementById('btnPauseInstead');
          if (pauseBtn) pauseBtn.focus();
        }
      }
    } catch (err) {
      showToast('Error al procesar eliminación en base de datos.', '❌');
    }
  });

  // Filtros de productos en tiempo real
  document.getElementById('productSearchInput')?.addEventListener('input', renderProductsTable);
  document.getElementById('productFamilyFilter')?.addEventListener('change', renderProductsTable);
  document.getElementById('productStatusFilter')?.addEventListener('change', renderProductsTable);

  // Filtros de pedidos en tiempo real
  document.getElementById('orderSearchInput')?.addEventListener('input', renderOrdersTable);
  document.querySelectorAll('#orderStatusTabs .status-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#orderStatusTabs .status-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      CONSOLA_STATE.currentStatusFilter = btn.dataset.status;
      renderOrdersTable();
    });
  });

  // Exportar suscriptores
  document.getElementById('btnExportSubscribers')?.addEventListener('click', exportSubscribersCSV);

  // Guardar Ajustes
  document.getElementById('settingsForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      freeShippingThreshold: parseFloat(document.getElementById('settingFreeShipping').value),
      whatsappSales: document.getElementById('settingWhatsapp').value.trim(),
      bannerNotice: document.getElementById('settingBannerNotice').value.trim(),
      contactPhone: document.getElementById('settingContactPhone').value.trim(),
      contactEmail: document.getElementById('settingContactEmail').value.trim()
    };

    try {
      const res = await API.fetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      if (res.success) {
        showToast(res.message, '⚙️');
        CONSOLA_STATE.settings = res.settings;
      }
    } catch (err) {
      showToast('Error al actualizar configuración.', '❌');
    }
  });
}

/* ==========================================================================
   12. Utilidades & Helpers
   ========================================================================== */
function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

function formatStatus(status) {
  const map = {
    pendiente: 'Pendiente',
    confirmado: 'Confirmado',
    en_preparacion: 'En Preparación',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
  };
  return map[status] || status;
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(message, icon = '✨') {
  const container = document.getElementById('consolaToastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'consola-toast';
  toast.innerHTML = `<span>${icon}</span> <span>${escapeHTML(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Exponer en window para llamadas desde botones onclick
window.openOrderDetailModal = openOrderDetailModal;
window.updateOrderStatus = updateOrderStatus;
window.openStockModal = openStockModal;
window.closeStockModal = closeStockModal;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.editProductModal = editProductModal;
window.toggleProductActive = toggleProductActive;
window.toggleUserRole = toggleUserRole;
window.deleteSubscriber = deleteSubscriber;
window.moderateReview = moderateReview;
window.deleteReview = deleteReview;

