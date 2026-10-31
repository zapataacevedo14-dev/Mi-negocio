/**
 * ALABASTRO — Configuración y Gestión de Base de Datos
 * Soporte Dual: PostgreSQL 16 Dockerizada (Producción/Contenedor)
 * con Fallback Embebido Resiliente (Alabastro Local Engine) si Docker no está activo.
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let usePostgres = false;
const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'local_store.json');

// Pool de conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'alabastro_db',
  user: process.env.DB_USER || 'alabastro_user',
  password: process.env.DB_PASSWORD || 'AlabastroSecure2026!',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2500, // Timeout ágil para detectar si Docker está activo
});

pool.on('error', (err) => {
  if (usePostgres) {
    console.error('[PostgreSQL] Error inesperado en el pool inactivo:', err);
  }
});

/**
 * 12 Fragancias Árabes de Lujo y Nicho Auténticas
 */
const DEFAULT_PRODUCTS = [
  {
    id: 'lattafa-asad',
    name: 'Lattafa Asad',
    full_name: 'Lattafa Asad Eau de Parfum 100ml',
    brand: 'Lattafa',
    gender: 'hombre',
    gender_display: 'Hombre',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'oriental',
    family_display: 'Oriental Especiada Cálida',
    price: 195000,
    stock: 45,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum (Alta Fijación)',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/lattafa-asad.png',
    description: 'La fragancia masculina árabe más reconocida a nivel mundial. Inicia con un estallido magnético de pimienta negra crujiente, piña caramelizada y hojas de tabaco rubio curado. En su evolución emerge un corazón reconfortante de café arábico tostado, pachulí e iris aterciopelado, reposando sobre un fondo rico y duradero de vainilla bourbon, ámbar cálido, benjuí y cedro seco.',
    top_notes: ['Pimienta Negra', 'Piña Jugosa', 'Tabaco Maduro'],
    heart_notes: ['Café Arábico Tostado', 'Pachulí de Indonesia', 'Iris Sedoso'],
    base_notes: ['Vainilla Bourbon', 'Ámbar Cálido', 'Benjuí de Siam', 'Madera de Cedro'],
    longevity: '+12 a 14 Horas garantizadas en piel',
    sillage: 'Intensa, envolvente y distinguida',
    best_for: 'Noches templadas, citas, oficina ejecutiva y eventos de alta presencia',
    gradient: { liquid1: '#261C14', liquid2: '#120B07', accent: '#D4AF7A', cap: '#C5A059' },
    quiz_tags: {
      occasions: ['noche', 'gala', 'diario'],
      sensations: ['seduccion', 'confort'],
      intensities: ['notable', 'intensa']
    },
    is_active: true
  },
  {
    id: 'lattafa-yara',
    name: 'Lattafa Yara',
    full_name: 'Lattafa Yara Eau de Parfum 100ml',
    brand: 'Lattafa',
    gender: 'mujer',
    gender_display: 'Mujer',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'gourmand',
    family_display: 'Dulce Gourmand Frutal',
    price: 189000,
    stock: 50,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/lattafa-yara.png',
    description: 'El fenómeno viral femenino de Lattafa que conquistó la perfumería internacional. Una composición dulce, cremosa y etérea que recuerda a un batido de fresas silvestres y orquídeas con crema batida. Abre con toques luminosos de heliotropo y mandarina, fusionándose con frutas tropicales maduras sobre un manto de vainilla pura de Madagascar, almizcle blanco y sándalo sedoso.',
    top_notes: ['Heliotropo', 'Orquídea', 'Mandarina Dulce'],
    heart_notes: ['Acorde Gourmand Cremoso', 'Frutas Tropicales Maduras'],
    base_notes: ['Vainilla de Madagascar', 'Almizcle Blanco', 'Sándalo Cremoso'],
    longevity: '8 a 10 Horas en piel y ropa',
    sillage: 'Moderada a notable, dulce y encantadora',
    best_for: 'Uso diario, primavera, citas románticas y salidas casuales',
    gradient: { liquid1: '#6E2A36', liquid2: '#331017', accent: '#E8A7B5', cap: '#D4AF7A' },
    quiz_tags: {
      occasions: ['diario', 'noche'],
      sensations: ['romance', 'confort'],
      intensities: ['moderada', 'notable']
    },
    is_active: true
  },
  {
    id: 'lattafa-khamrah',
    name: 'Lattafa Khamrah',
    full_name: 'Lattafa Khamrah Eau de Parfum 100ml',
    brand: 'Lattafa',
    gender: 'unisex',
    gender_display: 'Unisex',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'oriental',
    family_display: 'Oriental Especiada Gourmand',
    price: 235000,
    stock: 35,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum de Lujo',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/lattafa-khamrah.png',
    description: 'La joya gourmet más prestigiosa de Lattafa, envasada en un frasco de cristal tallado estilo licorera de lujo. Una opulenta danza de canela dulce de Ceilán y nuez moscada con dátiles del desierto y praliné tostado. El secado es pura calidez aristocrática con vainilla bourbon, haba tonka tostada, resinas de benjuí y mirra sagrada.',
    top_notes: ['Canela de Ceilán', 'Nuez Moscada', 'Bergamota'],
    heart_notes: ['Dátiles del Desierto', 'Praliné Tostado', 'Nardos Nobles', 'Mahonial'],
    base_notes: ['Vainilla Bourbon', 'Haba Tonka Negra', 'Benjuí', 'Madera de Ámbar', 'Mirra'],
    longevity: '+14 Horas de fijación excepcional',
    sillage: 'Pesada, hipnótica y memorable',
    best_for: 'Noches frías, celebraciones de gala, veladas inolvidables',
    gradient: { liquid1: '#5A3515', liquid2: '#281507', accent: '#ECC88F', cap: '#B28A56' },
    quiz_tags: {
      occasions: ['noche', 'gala'],
      sensations: ['seduccion', 'confort'],
      intensities: ['notable', 'intensa']
    },
    is_active: true
  },
  {
    id: 'lattafa-badee-al-oud',
    name: "Lattafa Bade'e Al Oud",
    full_name: "Lattafa Bade'e Al Oud (Oud for Glory) 100ml",
    brand: 'Lattafa',
    gender: 'unisex',
    gender_display: 'Unisex',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'amaderada',
    family_display: 'Oriental Amaderada Misteriosa',
    price: 215000,
    stock: 28,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum Intenso',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/lattafa-badee-al-oud.png',
    description: 'Conocido mundialmente como "Oud for Glory", este perfume representa el lujo oscuro y majestuoso de Oriente Medio. Abre con acordes preciosos de azafrán, lavanda y nuez moscada, dando paso a una madera de Oud natural envolvente fusionada con pachulí terroso y almizcle negro.',
    top_notes: ['Azafrán Noble', 'Nuez Moscada', 'Lavanda Francesa'],
    heart_notes: ['Madera de Oud Natural', 'Pachulí Oscuro'],
    base_notes: ['Oud Resinoso', 'Pachulí Macerado', 'Almizcle Negro'],
    longevity: '+14 a 16 Horas de fijación garantizada',
    sillage: 'Poderosa, profunda y dominante',
    best_for: 'Galas nocturnas, clima fresco, eventos de alta distinción',
    gradient: { liquid1: '#3D2214', liquid2: '#140A06', accent: '#ECC88F', cap: '#B28A56' },
    quiz_tags: {
      occasions: ['noche', 'gala'],
      sensations: ['seduccion'],
      intensities: ['intensa']
    },
    is_active: true
  },
  {
    id: 'afnan-9pm',
    name: 'Afnan 9 PM',
    full_name: 'Afnan 9 PM Eau de Parfum 100ml',
    brand: 'Afnan',
    gender: 'hombre',
    gender_display: 'Hombre',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'oriental',
    family_display: 'Oriental Fougère Dulce Especiada',
    price: 229000,
    stock: 38,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Emiratos Árabes Unidos',
    image: 'assets/perfumes/afnan-9pm.png',
    description: 'El rey de la noche y de los cumplidos. Afnan 9 PM abre con una salida irresistible de manzana silvestre dulce, canela cálida, bergamota y lavanda aromática, evolucionando hacia un corazón de flor de azahar y asentándose sobre una base seductora de vainilla negra, haba tonka y ámbar gris.',
    top_notes: ['Manzana Silvestre', 'Canela Cálida', 'Lavanda Salvaje', 'Bergamota'],
    heart_notes: ['Flor de Azahar del Naranjo', 'Lirio de los Valles'],
    base_notes: ['Vainilla Negra', 'Haba Tonka', 'Ámbar Gris', 'Pachulí'],
    longevity: '+12 Horas de proyección continua',
    sillage: 'Envolvente, seductora y sumamente atractiva',
    best_for: 'Fiestas nocturnas, salidas nocturnas, citas y clima templado',
    gradient: { liquid1: '#1F2A38', liquid2: '#0D131B', accent: '#B4C7DC', cap: '#D4AF7A' },
    quiz_tags: {
      occasions: ['noche', 'diario'],
      sensations: ['seduccion', 'confort'],
      intensities: ['notable', 'intensa']
    },
    is_active: true
  },
  {
    id: 'armaf-club-de-nuit-intense-man',
    name: 'Armaf Club de Nuit Intense Man',
    full_name: 'Armaf Club de Nuit Intense Man EDT 105ml',
    brand: 'Armaf',
    gender: 'hombre',
    gender_display: 'Hombre',
    subtitle: 'Eau de Toilette — 105ml / 3.6 FL. OZ.',
    family: 'citrica',
    family_display: 'Cítrica Amaderada Ahumada',
    price: 219000,
    stock: 40,
    size: '105 ml / 3.6 FL. OZ.',
    concentration: 'Eau de Toilette Concentrado',
    origin: 'Emiratos Árabes Unidos',
    image: 'assets/perfumes/armaf-club-de-nuit-intense-man.jpg',
    description: 'El perfume más influyente de la casa Armaf. Su salida chispeante de limón siciliano, piña y grosellas negras evoluciona hacia un corazón ahumado de madera de abedul y jazmín blanco, con un fondo icónico de almizcle, ámbar gris y pachulí que proyecta poder y confianza.',
    top_notes: ['Limón Siciliano', 'Piña Fresca', 'Grosellas Negras', 'Bergamota', 'Manzana'],
    heart_notes: ['Madera de Abedul Ahumada', 'Jazmín Blanco', 'Rosa de Damasco'],
    base_notes: ['Almizcle Sensual', 'Ámbar Gris Mineral', 'Pachulí Terroso', 'Vainilla'],
    longevity: '+10 a 12 Horas de duración',
    sillage: 'Muy alta, firma inmediatamente reconocible',
    best_for: 'Oficina ejecutiva, uso diario versátil, eventos formales y todas las estaciones',
    gradient: { liquid1: '#1E1E1E', liquid2: '#0A0A0A', accent: '#C0C0C0', cap: '#8A8A8A' },
    quiz_tags: {
      occasions: ['diario', 'gala', 'noche'],
      sensations: ['seduccion', 'frescura'],
      intensities: ['notable', 'intensa']
    },
    is_active: true
  },
  {
    id: 'armaf-club-de-nuit-woman',
    name: 'Armaf Club de Nuit Woman',
    full_name: 'Armaf Club de Nuit Woman EDP 105ml',
    brand: 'Armaf',
    gender: 'mujer',
    gender_display: 'Mujer',
    subtitle: 'Eau de Parfum — 105ml / 3.6 FL. OZ.',
    family: 'floral',
    family_display: 'Floral Frutal Chipre Elegante',
    price: 209000,
    stock: 32,
    size: '105 ml / 3.6 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Emiratos Árabes Unidos',
    image: 'assets/perfumes/armaf-club-de-nuit-woman.png',
    description: 'Una fragancia femenina refinada de estirpe chipre floral. Combina acordes cítricos luminosos de naranja y toronja con un ramo opulento de rosas, jazmín y durazno melocotón, cerrando con la sensualidad limpia del pachulí macerado, vainilla y vetiver.',
    top_notes: ['Naranja Dulce', 'Bergamota', 'Toronja', 'Durazno Melocotón'],
    heart_notes: ['Rosa Romántica', 'Jazmín Sambac', 'Lichi Jugoso', 'Geranio'],
    base_notes: ['Pachulí Radiante', 'Vainilla Bourbon', 'Almizcle Limpio', 'Vetiver'],
    longevity: '+9 a 11 Horas de fijación',
    sillage: 'Moderada a notable, elegante y femenina',
    best_for: 'Eventos diurnos, cócteles, oficina, primavera y ocasiones formales',
    gradient: { liquid1: '#4A3B2C', liquid2: '#241B12', accent: '#E8D5B5', cap: '#D4AF7A' },
    quiz_tags: {
      occasions: ['diario', 'gala'],
      sensations: ['romance', 'seduccion'],
      intensities: ['moderada', 'notable']
    },
    is_active: true
  },
  {
    id: 'rasasi-hawas-for-him',
    name: 'Rasasi Hawas for Him',
    full_name: 'Rasasi Hawas for Him Eau de Parfum 100ml',
    brand: 'Rasasi',
    gender: 'hombre',
    gender_display: 'Hombre',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'acuatica',
    family_display: 'Acuática Marina Aromática Especiada',
    price: 295000,
    stock: 22,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum de Alta Proyección',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/rasasi-hawas-for-him.png',
    description: 'La cumbre de la frescura acuática y especiada de Rasasi. Una explosión vibrante de notas marinas, ciruela violeta, manzana crujiente y limón de Amalfi se combinan con cardamomo y azahar sobre una base oceánica de ámbar gris mineral y maderas flotantes.',
    top_notes: ['Manzana Crujiente', 'Bergamota Italiana', 'Limón', 'Canela'],
    heart_notes: ['Notas Acuáticas Marinas', 'Ciruela Violeta', 'Cardamomo', 'Flor de Azahar'],
    base_notes: ['Ámbar Gris Mineral', 'Almizcle Limpio', 'Madera Flotante', 'Pachulí'],
    longevity: '+10 a 12 Horas con excelente rendimiento',
    sillage: 'Fuerte, fresca y de largo alcance',
    best_for: 'Verano, clima tropical, salidas informales, calor y momentos activos',
    gradient: { liquid1: '#263B4D', liquid2: '#101B24', accent: '#8ABFD4', cap: '#B28A56' },
    quiz_tags: {
      occasions: ['calor', 'diario'],
      sensations: ['frescura', 'seduccion'],
      intensities: ['notable', 'intensa']
    },
    is_active: true
  },
  {
    id: 'al-haramain-amber-oud-gold',
    name: 'Al Haramain Amber Oud Gold Edition',
    full_name: 'Al Haramain Amber Oud Gold Edition 120ml',
    brand: 'Al Haramain',
    gender: 'unisex',
    gender_display: 'Unisex',
    subtitle: 'Eau de Parfum — 120ml / 4.0 FL. OZ.',
    family: 'oriental',
    family_display: 'Oriental Frutal Ambarada de Lujo',
    price: 345000,
    stock: 18,
    size: '120 ml / 4.0 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Emiratos Árabes Unidos',
    image: 'assets/perfumes/al-haramain-amber-oud-gold.png',
    description: 'Una fragancia icónica de puro prestigio. Notas dulces y jugosas de melón maduro y piña fresca se funden con bergamota y un acorde ambarado suntuoso, descansando sobre una base de maderas nobles, almizcle blanco y vainilla cremosa. Fijación insuperable y estela opulenta.',
    top_notes: ['Bergamota de Calabria', 'Notas Verdes Frescas'],
    heart_notes: ['Melón Dulce', 'Piña Exótica', 'Notas Ámbar', 'Acorde Gourmand'],
    base_notes: ['Vainilla Cremosa', 'Almizcle Puro', 'Maderas Nobles Orientales'],
    longevity: '+16 Horas de fijación extrema en piel',
    sillage: 'Pesada, opulenta y radiante',
    best_for: 'Ocasiones de lujo, eventos de gala y noches especiales',
    gradient: { liquid1: '#5E411B', liquid2: '#2B1B09', accent: '#ECC88F', cap: '#D4AF7A' },
    quiz_tags: {
      occasions: ['gala', 'noche'],
      sensations: ['seduccion', 'confort'],
      intensities: ['intensa']
    },
    is_active: true
  },
  {
    id: 'swiss-arabian-shaghaf-oud',
    name: 'Swiss Arabian Shaghaf Oud',
    full_name: 'Swiss Arabian Shaghaf Oud EDP 75ml',
    brand: 'Swiss Arabian',
    gender: 'unisex',
    gender_display: 'Unisex',
    subtitle: 'Eau de Parfum — 75ml / 2.5 FL. OZ.',
    family: 'amaderada',
    family_display: 'Oriental Amaderada Gourmand con Oud',
    price: 249000,
    stock: 25,
    size: '75 ml / 2.5 FL. OZ.',
    concentration: 'Eau de Parfum Oro Puro',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/swiss-arabian-shaghaf-oud.png',
    description: 'La fragancia más emblemática de la histórica casa suizo-árabe Swiss Arabian. Azafrán precioso abre paso a un corazón apasionado de rosa damascena y madera de Oud natural, bañado en praliné dulce y vainilla dorada. Calidez, pasión y lujo en un frasco dorado.',
    top_notes: ['Azafrán Imperial de Persia'],
    heart_notes: ['Rosa de Damasco Macerada', 'Madera de Agar (Oud)'],
    base_notes: ['Praliné Dulce', 'Vainilla Cálida', 'Oud Dorado'],
    longevity: '+14 a 16 Horas de rendimiento',
    sillage: 'Intensa, cálida, dulce y envolvente',
    best_for: 'Noches frías, celebraciones invernales y amantes del Oud gourmet',
    gradient: { liquid1: '#523A1B', liquid2: '#24180A', accent: '#F5DC9A', cap: '#B28A56' },
    quiz_tags: {
      occasions: ['noche', 'gala'],
      sensations: ['seduccion', 'confort'],
      intensities: ['intensa']
    },
    is_active: true
  },
  {
    id: 'maison-alhambra-kismet-magic',
    name: 'Maison Alhambra Kismet Magic',
    full_name: 'Maison Alhambra Kismet Magic EDP 100ml',
    brand: 'Maison Alhambra',
    gender: 'unisex',
    gender_display: 'Unisex',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'gourmand',
    family_display: 'Oriental Gourmand Licorosa',
    price: 195000,
    stock: 30,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/maison-alhambra-kismet-magic.png',
    description: 'Una experiencia olfativa adictiva y licorosa. Apertura de coñac añejo y canela dulce que da paso a notas tostadas de haba tonka y roble maduro, coronadas con un fondo delicioso de praliné crocante, vainilla bourbon y sándalo cremoso.',
    top_notes: ['Coñac Francés Licoroso', 'Canela Dulce'],
    heart_notes: ['Haba Tonka Negra', 'Madera de Roble', 'Caramelo Tostado'],
    base_notes: ['Vainilla Bourbon', 'Praliné Crocante', 'Sándalo Cremoso'],
    longevity: '+10 a 12 Horas de duración',
    sillage: 'Cálida, magnética y sensual',
    best_for: 'Citas nocturnas, otoño/invierno, veladas íntimas y cenas elegantes',
    gradient: { liquid1: '#4F2E1B', liquid2: '#231209', accent: '#ECC88F', cap: '#B28A56' },
    quiz_tags: {
      occasions: ['noche', 'diario'],
      sensations: ['seduccion', 'confort'],
      intensities: ['notable', 'intensa']
    },
    is_active: true
  },
  {
    id: 'fragrance-world-signature',
    name: 'Fragrance World Signature',
    full_name: 'Fragrance World Signature EDP 80ml',
    brand: 'Fragrance World',
    gender: 'unisex',
    gender_display: 'Unisex',
    subtitle: 'Eau de Parfum — 80ml / 2.7 FL. OZ.',
    family: 'amaderada',
    family_display: 'Amaderada Aromática Especiada',
    price: 185000,
    stock: 26,
    size: '80 ml / 2.7 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/fragrance-world-signature.png',
    description: 'La creación insignia de Fragrance World. Destaca por su frescura herbal de albahaca y pimienta rosa, con un corazón elegante de vetiver y maderas ahumadas, y un fondo distinguido de cedro del Atlas, pachulí y ámbar seco.',
    top_notes: ['Albahaca Fresca', 'Pimienta Rosa'],
    heart_notes: ['Vetiver de Haití', 'Maderas Nobles Ahumadas'],
    base_notes: ['Cedro Atlas', 'Pachulí Terroso', 'Ámbar Seco'],
    longevity: '8 a 10 Horas de fijación',
    sillage: 'Elegante, equilibrada y pulcra',
    best_for: 'Oficina, reuniones de negocios y uso diario sofisticado',
    gradient: { liquid1: '#36402E', liquid2: '#1A2116', accent: '#A8C99B', cap: '#D4AF7A' },
    quiz_tags: {
      occasions: ['diario', 'calor'],
      sensations: ['frescura', 'confort'],
      intensities: ['moderada', 'notable']
    },
    is_active: true
  },
  {
    id: 'lattafa-fakhar-black',
    name: 'Fakhar Black',
    full_name: 'Lattafa Fakhar Black Eau de Parfum 100ml',
    brand: 'Lattafa',
    gender: 'hombre',
    gender_display: 'Hombre',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'amaderada',
    family_display: 'Aromático / Amaderado',
    price: 165000,
    stock: 40,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/lattafa-fakhar-black.png',
    description: 'La icónica fragancia masculina de Lattafa que combina la frescura aromática de la manzana verde, bergamota y lavanda con un corazón de flor de naranja y geranio, culminando en un fondo profundo de haba tonka, vetiver, cedro y ámbar sedoso.',
    top_notes: ['Manzana Verde', 'Bergamota', 'Lavanda Francesa'],
    heart_notes: ['Flor de Naranja', 'Geranio', 'Salvia'],
    base_notes: ['Haba Tonka', 'Madera de Cedro', 'Vetiver', 'Ámbar'],
    longevity: '+10 a 12 Horas de duración',
    sillage: 'Notable, elegante y versátil',
    best_for: 'Oficina, eventos de día, salidas casuales y cenas',
    gradient: { liquid1: '#1A1A1A', liquid2: '#0D0D0D', accent: '#D4AF7A', cap: '#C0C0C0' },
    quiz_tags: { occasions: ['diario', 'noche'], sensations: ['frescura', 'seduccion'], intensities: ['moderada', 'notable'] },
    is_active: true
  },
  {
    id: 'afnan-supremacy-not-only-intense',
    name: 'Supremacy Not Only Intense',
    full_name: 'Afnan Supremacy Not Only Intense Extrait de Parfum 100ml',
    brand: 'Afnan',
    gender: 'hombre',
    gender_display: 'Hombre',
    subtitle: 'Extrait de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'amaderada',
    family_display: 'Frutal / Musgo',
    price: 280000,
    stock: 35,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Extrait de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/afnan-supremacy-not-only-intense.png',
    description: 'Extrait de Parfum chipre frutal de altísima concentración. Abre con una explosión jugosa de grosella negra, bergamota y manzana fresca, evolucionando hacia un corazón de musgo de roble, pachulí y lavanda, anclado en ámbar gris, almizcle y azafrán.',
    top_notes: ['Grosellas Negras', 'Bergamota', 'Manzana Crujiente'],
    heart_notes: ['Musgo de Roble', 'Pachulí Terroso', 'Lavanda'],
    base_notes: ['Ámbar Gris', 'Almizcle Blanco', 'Azafrán'],
    longevity: '+14 a 16 Horas de fijación extrema',
    sillage: 'Poderosa, imponente y aristocrática',
    best_for: 'Reuniones ejecutivas, galas, climas templados a fríos',
    gradient: { liquid1: '#2D3134', liquid2: '#16191B', accent: '#E0E0E0', cap: '#A0A0A0' },
    quiz_tags: { occasions: ['gala', 'noche', 'diario'], sensations: ['seduccion', 'confort'], intensities: ['intensa'] },
    is_active: true
  },
  {
    id: 'lattafa-nebras',
    name: 'Nebras',
    full_name: 'Lattafa Nebras Eau de Parfum 100ml',
    brand: 'Lattafa',
    gender: 'unisex',
    gender_display: 'Unisex',
    subtitle: 'Eau de Parfum de Lujo — 100ml / 3.4 FL. OZ.',
    family: 'gourmand',
    family_display: 'Dulce / Gourmand',
    price: 210000,
    stock: 45,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/lattafa-nebras.png',
    description: 'Un homenaje a la dulzura sensual y gourmand. Abre con bayas rojas jugosas y mandarina madura, fundiéndose en un corazón irresistible de cacao intenso, vainilla cremosa y rosa suave, sobre una base de azúcar morena, haba tonka y ámbar cálido.',
    top_notes: ['Bayas Rojas', 'Mandarina Jugosa'],
    heart_notes: ['Cacao Puro', 'Vainilla Cremosa', 'Rosa Damascena'],
    base_notes: ['Azúcar Morena', 'Haba Tonka', 'Ámbar Cálido', 'Almizcle'],
    longevity: '+12 a 14 Horas de presencia',
    sillage: 'Envolvente, cálida y deliciosa',
    best_for: 'Citas románticas, noches frías, momentos íntimos',
    gradient: { liquid1: '#5E381A', liquid2: '#281406', accent: '#ECC88F', cap: '#D4AF7A' },
    quiz_tags: { occasions: ['noche', 'diario'], sensations: ['seduccion', 'confort'], intensities: ['notable'] },
    is_active: true
  },
  {
    id: 'maison-alhambra-porto-neroli',
    name: 'Porto Neroli',
    full_name: 'Maison Alhambra Porto Neroli Eau de Parfum 80ml',
    brand: 'Maison Alhambra',
    gender: 'unisex',
    gender_display: 'Unisex',
    subtitle: 'Eau de Parfum — 80ml / 2.7 FL. OZ.',
    family: 'citrica',
    family_display: 'Cítricos / Fresco',
    price: 160000,
    stock: 40,
    size: '80 ml / 2.7 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/maison-alhambra-porto-neroli.png',
    description: 'Evocación luminosa de la Riviera y la brisa mediterránea. Destaca por sus notas vivaces de neroli de Túnez, flor de azahar, bergamota italiana y limón siciliano, suavizadas por una caricia de lavanda, romero, ámbar y mirto fresco.',
    top_notes: ['Neroli de Túnez', 'Limón Siciliano', 'Mandarina'],
    heart_notes: ['Flor de Azahar', 'Jazmín Marino', 'Lavanda'],
    base_notes: ['Ámbar Blanco', 'Almizcle Puro', 'Madera de Cedro'],
    longevity: '7 a 9 Horas de frescura radiante',
    sillage: 'Moderada, limpia y revitalizante',
    best_for: 'Días soleados, verano, oficina, paseos al aire libre',
    gradient: { liquid1: '#0E7C86', liquid2: '#05383E', accent: '#5CE1E6', cap: '#D4AF7A' },
    quiz_tags: { occasions: ['diario'], sensations: ['frescura'], intensities: ['moderada'] },
    is_active: true
  },
  {
    id: 'al-haramain-laventure',
    name: "L'Aventure",
    full_name: "Al Haramain L'Aventure Eau de Parfum 100ml",
    brand: 'Al Haramain',
    gender: 'hombre',
    gender_display: 'Hombre',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'amaderada',
    family_display: 'Cítricos / Amaderados',
    price: 220000,
    stock: 50,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/al-haramain-laventure.png',
    description: 'Una joya emiratí aclamada por su apertura cítrica electrizante de bergamota y limón con elemí, transitando con maestría hacia notas de lirio de los valles, jazmín y maderas nobles, reposando en pachulí, ámbar y almizcle blanco.',
    top_notes: ['Bergamota Chispeante', 'Limón', 'Elemí'],
    heart_notes: ['Lirio de los Valles', 'Jazmín Suave', 'Maderas Blancas'],
    base_notes: ['Pachulí', 'Ámbar Seco', 'Almizcle'],
    longevity: '+11 Horas de rendimiento',
    sillage: 'Marcada, pulcra y sofisticada',
    best_for: 'Uso profesional diario, firmas de contratos, ocasiones distinguidas',
    gradient: { liquid1: '#3A3F44', liquid2: '#1C1F22', accent: '#E8E8E8', cap: '#C0C0C0' },
    quiz_tags: { occasions: ['diario', 'gala'], sensations: ['frescura', 'seduccion'], intensities: ['notable'] },
    is_active: true
  },
  {
    id: 'swiss-arabian-casablanca',
    name: 'Casablanca',
    full_name: 'Swiss Arabian Casablanca Eau de Parfum 100ml',
    brand: 'Swiss Arabian',
    gender: 'mujer',
    gender_display: 'Mujer',
    subtitle: 'Eau de Parfum de Lujo — 100ml / 3.4 FL. OZ.',
    family: 'gourmand',
    family_display: 'Dulce / Frutal',
    price: 260000,
    stock: 40,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/swiss-arabian-casablanca.png',
    description: 'Inspirada en el misterio y la elegancia de la mítica ciudad marroquí. Abre con manzanas crujientes y uvas maduras, entrelazadas con caramelo dorado y pachulí aterciopelado, reposando sobre un lecho sensual de ámbar líquido, gamuza y almizcle blanco.',
    top_notes: ['Manzana Madura', 'Uvas Jugosas'],
    heart_notes: ['Caramelo Tostado', 'Pachulí Aterciopelado', 'Lirio'],
    base_notes: ['Ámbar Líquido', 'Gamuza Suave', 'Almizcle Blanco'],
    longevity: '+12 Horas de encanto garantizado',
    sillage: 'Sensual, envolvente y adictiva',
    best_for: 'Citas especiales, noches templadas, tardes elegantes',
    gradient: { liquid1: '#6E4518', liquid2: '#2F1A06', accent: '#ECC88F', cap: '#C5A059' },
    quiz_tags: { occasions: ['noche', 'diario'], sensations: ['seduccion', 'romance'], intensities: ['notable', 'intensa'] },
    is_active: true
  },
  {
    id: 'armaf-tres-nuit',
    name: 'Tres Nuit',
    full_name: 'Armaf Tres Nuit Eau de Parfum 100ml',
    brand: 'Armaf',
    gender: 'hombre',
    gender_display: 'Hombre',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'floral',
    family_display: 'Floral / Fresco',
    price: 155000,
    stock: 45,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/armaf-tres-nuit.png',
    description: 'Una oda a la frescura verde aristocrática. Abre con notas limpias de verbena de limón, iris empolvado y lavanda, desplegando un corazón floral de violetas silvestres y toques especiados, finalizando en un fondo de sándalo y ámbar gris refinado.',
    top_notes: ['Verbena de Limón', 'Iris Noble', 'Limón'],
    heart_notes: ['Hojas de Violeta', 'Lavanda', 'Toques Especiados'],
    base_notes: ['Ámbar Gris', 'Madera de Sándalo'],
    longevity: '8 a 10 Horas en piel',
    sillage: 'Agradable, pulcra y caballerosa',
    best_for: 'Primavera, verano, oficina, eventos de día',
    gradient: { liquid1: '#1E293B', liquid2: '#0F172A', accent: '#94A3B8', cap: '#CBD5E1' },
    quiz_tags: { occasions: ['diario'], sensations: ['frescura'], intensities: ['moderada'] },
    is_active: true
  },
  {
    id: 'fragrance-world-barakkat-rouge-540',
    name: 'Barakkat Rouge 540',
    full_name: 'Fragrance World Barakkat Rouge 540 Eau de Parfum 100ml',
    brand: 'Fragrance World',
    gender: 'unisex',
    gender_display: 'Unisex',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'amaderada',
    family_display: 'Dulce / Amaderado',
    price: 145000,
    stock: 55,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/fragrance-world-barakkat-rouge-540.png',
    description: 'El aclamado tributo al brillo del cristal y el ámbar mineral. Inicia con azafrán resplandeciente y jazmín aéreo, transformándose en una estela de madera de cedro dulce, ámbar gris mineral y toques algodonados de azúcar caramelizada.',
    top_notes: ['Azafrán Radiante', 'Jazmín Grandiflorum'],
    heart_notes: ['Madera de Ámbar', 'Ámbar Gris Mineral'],
    base_notes: ['Resina de Abeto', 'Cedro Rojo de Virginia'],
    longevity: '+12 Horas de presencia hipnótica',
    sillage: 'Inolvidable, etérea y magnética',
    best_for: 'Celebraciones, galas, cualquier época del año',
    gradient: { liquid1: '#7A1C20', liquid2: '#350A0C', accent: '#F0C068', cap: '#ECC88F' },
    quiz_tags: { occasions: ['gala', 'noche'], sensations: ['seduccion'], intensities: ['intensa'] },
    is_active: true
  },
  {
    id: 'paris-corner-emir-celestial',
    name: 'Emir Celestial',
    full_name: 'Paris Corner Emir Celestial Eau de Parfum 100ml',
    brand: 'Paris Corner',
    gender: 'unisex',
    gender_display: 'Unisex',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'amaderada',
    family_display: 'Cuero / Especiado',
    price: 195000,
    stock: 35,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/paris-corner-emir-celestial.png',
    description: 'Composición futurista y vanguardista con matices minerales y de cuero suave. Despliega notas fascinantes de hojas de violeta, mandarina italiana y flor de siempreviva, complementadas con cuero fino, gamuza y un fondo mineral magnético de Akigalawood.',
    top_notes: ['Mandarina Italiana', 'Flor de Siempreviva', 'Azafrán'],
    heart_notes: ['Hojas de Violeta', 'Gamuza Fina', 'Osmanthus'],
    base_notes: ['Madera de Akigala', 'Cuero Suave', 'Notas Minerales'],
    longevity: '+12 a 14 Horas de fijación',
    sillage: 'Distinguida, única y vanguardista',
    best_for: 'Noches cosmopolitas, clima templado a fresco, arte y diseño',
    gradient: { liquid1: '#142850', liquid2: '#081226', accent: '#D4AF7A', cap: '#C5A059' },
    quiz_tags: { occasions: ['noche', 'gala'], sensations: ['seduccion', 'confort'], intensities: ['notable'] },
    is_active: true
  },
  {
    id: 'lattafa-ameer-al-oudh-intense-oud',
    name: 'Ameer Al Oudh Intense Oud',
    full_name: 'Lattafa Ameer Al Oudh Intense Oud 100ml',
    brand: 'Lattafa',
    gender: 'unisex',
    gender_display: 'Unisex',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'oriental',
    family_display: 'Oriental / Dulce',
    price: 185000,
    stock: 45,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/lattafa-ameer-al-oudh-intense-oud.png',
    description: 'El aroma de una chimenea aristocrática en una noche árabe de invierno. Un abrazo cálido de maderas tostadas, azúcar morena caramelizada y vainilla bourbon, enriquecido con madera de oud especiada, ládano y notas balsámicas profundamente reconfortantes.',
    top_notes: ['Madera de Oud Especiada', 'Maderas Tostadas'],
    heart_notes: ['Vainilla Bourbon', 'Azúcar Caramelizada'],
    base_notes: ['Oud Puro', 'Sándalo', 'Resinas de Benjuí'],
    longevity: '+14 Horas de fijación acogedora',
    sillage: 'Cálida, generosa y envolvente',
    best_for: 'Climas fríos, invierno, veladas nocturnas junto al fuego',
    gradient: { liquid1: '#542E10', liquid2: '#201004', accent: '#ECC88F', cap: '#B28A56' },
    quiz_tags: { occasions: ['noche', 'diario'], sensations: ['confort', 'seduccion'], intensities: ['intensa'] },
    is_active: true
  }
];

// Pedidos de muestra
const DEFAULT_ORDERS = [
  {
    id: 'ORD-2026-9041',
    user_id: null,
    customer_name: 'Valeria Restrepo',
    customer_email: 'valeria.restrepo@luxury.co',
    customer_phone: '+57 312 458 9912',
    shipping_address: 'Cra 43A # 1-50, Edificio Santillana Apto 902',
    city: 'Medellín',
    payment_method: 'transferencia',
    status: 'entregado',
    subtotal: 470000,
    shipping_cost: 0,
    total: 470000,
    gift_packaging: true,
    notes: 'Fragancia empacada con cinta dorada de lujo para obsequio.',
    items: [
      { id: 'lattafa-khamrah', name: 'Lattafa Khamrah', price: 235000, quantity: 2 }
    ],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'ORD-2026-9042',
    user_id: null,
    customer_name: 'Camilo Echeverri',
    customer_email: 'camilo.ech@bogota.co',
    customer_phone: '+57 300 891 2244',
    shipping_address: 'Calle 116 # 9-45, Chicó Norte',
    city: 'Bogotá',
    payment_method: 'contraentrega',
    status: 'en_preparacion',
    subtotal: 195000,
    shipping_cost: 15000,
    total: 210000,
    gift_packaging: false,
    notes: 'Favor timbrar en recepción.',
    items: [
      { id: 'lattafa-asad', name: 'Lattafa Asad', price: 195000, quantity: 1 }
    ],
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'ORD-2026-9043',
    user_id: null,
    customer_name: 'Mariana Zuluaga',
    customer_email: 'mariana.z@cali.co',
    customer_phone: '+57 315 780 1234',
    shipping_address: 'Avenida Colombia # 4N-20, Ciudad Jardín',
    city: 'Cali',
    payment_method: 'wompi',
    status: 'confirmado',
    subtotal: 378000,
    shipping_cost: 0,
    total: 378000,
    gift_packaging: true,
    notes: 'Regalo especial de aniversario.',
    items: [
      { id: 'lattafa-yara', name: 'Lattafa Yara', price: 189000, quantity: 2 }
    ],
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 1).toISOString()
  }
];

const DEFAULT_SETTINGS = {
  storeName: 'ALABASTRO — Alta Perfumería',
  contactPhone: '+57 311 254 9053',
  contactEmail: 'concierge@alabastro.com.co',
  whatsappSales: '573112549053',
  freeShippingThreshold: 350000,
  bannerNotice: 'Envíos Nacionales Asegurados sin costo en compras superiores a $350.000 COP',
  enableStoreOrders: true
};

/**
 * Motor Embebido de Almacenamiento (Fallback resiliente en JSON)
 */
class LocalEngine {
  constructor() {
    this.data = {
      users: [],
      products: [],
      orders: [],
      subscribers: [],
      reviews: [],
      settings: [{ key: 'store_config', value: DEFAULT_SETTINGS }],
      activity_logs: []
    };
  }

  load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.data = { ...this.data, ...parsed };
        }
      } else {
        this.initDefaults();
        this.save();
      }
    } catch (e) {
      console.warn('[LocalEngine] Error cargando store:', e.message);
      this.initDefaults();
    }
  }

  initDefaults() {
    // Generar admin por defecto
    const salt = bcrypt.genSaltSync(10);
    const passHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'AdminAlabastro2026!', salt);
    this.data.users = [
      {
        id: 'usr-admin-master-001',
        name: process.env.ADMIN_NAME || 'Director Alabastro',
        email: (process.env.ADMIN_EMAIL || 'admin@alabastro.com').toLowerCase(),
        phone: process.env.ADMIN_PHONE || '+57 311 254 9053',
        password_hash: passHash,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'usr-customer-001',
        name: 'Santiago Zapata',
        email: 'santiago@alabastro.co',
        phone: '+57 311 254 9053',
        password_hash: bcrypt.hashSync('password123', salt),
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    this.data.products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    this.data.orders = JSON.parse(JSON.stringify(DEFAULT_ORDERS));
    this.data.subscribers = [
      { id: 1, email: 'sofia.duque@luxury.com', active: true, created_at: new Date().toISOString() },
      { id: 2, email: 'felipe.arias@inversionistas.co', active: true, created_at: new Date().toISOString() }
    ];
    this.data.reviews = [
      {
        id: 1,
        product_id: 'lattafa-asad',
        author_name: 'Andrés Felipe M.',
        rating: 5,
        comment: 'La mejor compra de perfumería nicho que he hecho en Colombia. Dura fácilmente 14 horas en mi piel y la estela es imponente.',
        verified_purchase: true,
        status: 'aprobada',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        product_id: 'lattafa-khamrah',
        author_name: 'Carolina V.',
        rating: 5,
        comment: 'Un licor de canela y dátiles sumamente refinado. El frasco de cristal tallado y la presentación deslumbran tanto como el aroma.',
        verified_purchase: true,
        status: 'aprobada',
        created_at: new Date().toISOString()
      }
    ];
    this.data.settings = [{ key: 'store_config', value: DEFAULT_SETTINGS, updated_at: new Date().toISOString() }];
    this.data.activity_logs = [
      {
        id: 1,
        user_id: 'usr-admin-master-001',
        user_name: 'Director Alabastro',
        action: 'SISTEMA_INIT',
        details: 'Alabastro Engine activado con catálogo verificado de 12 fragancias.',
        created_at: new Date().toISOString()
      }
    ];
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.warn('[LocalEngine] Error guardando store:', e.message);
    }
  }

  /**
   * Intérprete SQL para emular consultas estándar
   */
  async query(sqlText, params = []) {
    const sql = sqlText.trim();
    const upper = sql.toUpperCase();

    // 1. SELECT NOW()
    if (upper.includes('SELECT NOW()')) {
      return {
        rows: [{ current_time: new Date().toISOString(), products_count: this.data.products.length }]
      };
    }

    // 2. SETTINGS
    if (upper.includes('FROM SETTINGS')) {
      const row = this.data.settings.find(s => s.key === 'store_config');
      return { rows: row ? [row] : [] };
    }
    if (upper.startsWith('INSERT INTO SETTINGS') || upper.startsWith('UPDATE SETTINGS')) {
      const val = typeof params[0] === 'string' ? JSON.parse(params[0]) : params[0];
      const existing = this.data.settings.find(s => s.key === 'store_config');
      if (existing) {
        existing.value = val;
        existing.updated_at = new Date().toISOString();
      } else {
        this.data.settings.push({ key: 'store_config', value: val, updated_at: new Date().toISOString() });
      }
      this.save();
      return { rows: [{ key: 'store_config', value: val }] };
    }

    // 3. USERS
    if (upper.includes('FROM USERS')) {
      if (upper.includes('WHERE EMAIL = $1')) {
        const u = this.data.users.find(x => x.email.toLowerCase() === (params[0] || '').toLowerCase());
        return { rows: u ? [u] : [] };
      }
      if (upper.includes('WHERE ID = $1')) {
        const u = this.data.users.find(x => x.id === params[0]);
        return { rows: u ? [u] : [] };
      }
      if (upper.includes("WHERE ROLE = 'CUSTOMER'")) {
        const count = this.data.users.filter(x => x.role === 'customer').length;
        return { rows: [{ total_users: count }] };
      }
      return { rows: this.data.users };
    }
    if (upper.startsWith('INSERT INTO USERS')) {
      const newUser = {
        id: params[0],
        name: params[1],
        email: params[2].toLowerCase(),
        phone: params[3] || '',
        password_hash: params[4],
        role: params[5] || 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.users.push(newUser);
      this.save();
      return { rows: [newUser] };
    }
    if (upper.startsWith('UPDATE USERS')) {
      if (upper.includes('PASSWORD_HASH = $1')) {
        const u = this.data.users.find(x => x.id === params[1]);
        if (u) {
          u.password_hash = params[0];
          u.updated_at = new Date().toISOString();
          this.save();
          return { rows: [u] };
        }
      } else if (upper.includes('ROLE = $1')) {
        const u = this.data.users.find(x => x.id === params[1]);
        if (u) {
          u.role = params[0];
          u.updated_at = new Date().toISOString();
          this.save();
          return { rows: [u] };
        }
      } else if (upper.includes('NAME = $1')) {
        const u = this.data.users.find(x => x.id === params[2]);
        if (u) {
          u.name = params[0];
          u.phone = params[1];
          u.updated_at = new Date().toISOString();
          this.save();
          return { rows: [u] };
        }
      }
      return { rows: [] };
    }

    // 4. PRODUCTS
    if (upper.startsWith('SELECT') && upper.includes('FROM PRODUCTS')) {
      if (upper.includes('TOTAL_REGISTERED') || upper.includes('COUNT(*) AS TOTAL_PRODUCTS')) {
        const total = this.data.products.length;
        const active = this.data.products.filter(p => p.is_active !== false);
        const paused = this.data.products.filter(p => p.is_active === false);
        const outOfStock = active.filter(p => (p.stock || 0) === 0).length;
        const lowStock = active.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 15).length;
        const totalStock = this.data.products.reduce((sum, p) => sum + (p.stock || 0), 0);
        return {
          rows: [{
            total_registered: total,
            total_products: active.length,
            active_products: active.length,
            paused_products: paused.length,
            out_of_stock_count: outOfStock,
            low_stock_count: lowStock,
            total_stock_units: totalStock
          }]
        };
      }
      if (upper.includes('COUNT(*)')) {
        return { rows: [{ count: this.data.products.length }] };
      }
      if (upper.includes('WHERE ID = $1')) {
        const p = this.data.products.find(x => x.id === params[0]);
        return { rows: p ? [p] : [] };
      }
      // Filtrar
      let res = [...this.data.products];
      if (upper.includes('WHERE STOCK <= 20')) {
        res = res.filter(p => (p.stock || 0) <= 20).sort((a, b) => (a.stock || 0) - (b.stock || 0));
        if (upper.includes('LIMIT 8')) res = res.slice(0, 8);
        return { rows: res };
      }
      if (upper.includes('IS_ACTIVE = TRUE')) {
        res = res.filter(p => p.is_active !== false);
      } else if (upper.includes('IS_ACTIVE = FALSE')) {
        res = res.filter(p => p.is_active === false);
      }
      return { rows: res };
    }
    if (upper.startsWith('INSERT INTO PRODUCTS')) {
      const p = {
        id: params[0],
        name: params[1],
        full_name: params[2] || `${params[3] || 'ALABASTRO'} ${params[1]}`,
        brand: params[3] || 'ALABASTRO',
        gender: params[4] || 'unisex',
        gender_display: params[5] || 'Unisex',
        subtitle: params[6] || 'Eau de Parfum — 100ml',
        family: params[7] || 'oriental',
        family_display: params[8] || (params[7] ? params[7].charAt(0).toUpperCase() + params[7].slice(1) : 'Oriental'),
        price: Number(params[9] || 0),
        stock: Number(params[10] || 0),
        size: params[11] || '100 ml / 3.4 FL. OZ.',
        concentration: params[12] || 'Eau de Parfum',
        origin: params[13] || 'Dubái, Emiratos Árabes Unidos',
        image: params[14] || 'assets/perfumes/lattafa-asad.png',
        description: params[15] || '',
        top_notes: typeof params[16] === 'string' ? JSON.parse(params[16]) : (params[16] || []),
        heart_notes: typeof params[17] === 'string' ? JSON.parse(params[17]) : (params[17] || []),
        base_notes: typeof params[18] === 'string' ? JSON.parse(params[18]) : (params[18] || []),
        longevity: params[19] || '+12 Horas',
        sillage: params[20] || 'Intensa',
        best_for: params[21] || 'Ocasiones especiales',
        gradient: typeof params[22] === 'string' ? JSON.parse(params[22]) : (params[22] || { liquid1: '#523A21', liquid2: '#24180D' }),
        quiz_tags: typeof params[23] === 'string' ? JSON.parse(params[23]) : (params[23] || {}),
        is_active: params[24] !== undefined ? Boolean(params[24]) : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.products.push(p);
      this.save();
      return { rows: [p] };
    }
    if (upper.startsWith('UPDATE PRODUCTS')) {
      if (upper.includes('STOCK = GREATEST')) {
        const p = this.data.products.find(x => x.id === params[1]);
        if (p) {
          p.stock = Math.max(0, (p.stock || 0) - Number(params[0]));
          p.updated_at = new Date().toISOString();
          this.save();
          return { rows: [p] };
        }
      }
      if (upper.includes('STOCK = STOCK + $1')) {
        const p = this.data.products.find(x => x.id === params[1]);
        if (p) {
          p.stock = (p.stock || 0) + Number(params[0]);
          p.updated_at = new Date().toISOString();
          this.save();
          return { rows: [p] };
        }
      }
      if (upper.includes('SET STOCK = $1')) {
        const p = this.data.products.find(x => x.id === params[1]);
        if (p) {
          p.stock = Math.max(0, Number(params[0]));
          p.updated_at = new Date().toISOString();
          this.save();
          return { rows: [p] };
        }
      }
      if (upper.includes('SET IS_ACTIVE = $1')) {
        const p = this.data.products.find(x => x.id === params[1]);
        if (p) {
          p.is_active = Boolean(params[0]);
          p.updated_at = new Date().toISOString();
          this.save();
          return { rows: [p] };
        }
      }
      if (upper.includes('IS_ACTIVE = FALSE') && !upper.includes('COALESCE')) {
        const p = this.data.products.find(x => x.id === params[0]);
        if (p) {
          p.is_active = false;
          p.updated_at = new Date().toISOString();
          this.save();
          return { rows: [p] };
        }
      }
      if (upper.includes('IS_ACTIVE = TRUE') && !upper.includes('COALESCE')) {
        const p = this.data.products.find(x => x.id === params[0]);
        if (p) {
          p.is_active = true;
          p.updated_at = new Date().toISOString();
          this.save();
          return { rows: [p] };
        }
      }
      // General full update
      const id = params[params.length - 1];
      const p = this.data.products.find(x => x.id === id);
      if (p) {
        if (params[0] !== null && params[0] !== undefined) p.name = params[0];
        if (params[1] !== null && params[1] !== undefined) p.full_name = params[1];
        if (params[2] !== null && params[2] !== undefined) p.brand = params[2];
        if (params[3] !== null && params[3] !== undefined) p.gender = params[3];
        if (params[4] !== null && params[4] !== undefined) p.gender_display = params[4];
        if (params[5] !== null && params[5] !== undefined) p.subtitle = params[5];
        if (params[6] !== null && params[6] !== undefined) p.family = params[6];
        if (params[7] !== null && params[7] !== undefined) p.family_display = params[7];
        if (params[8] !== null && params[8] !== undefined) p.price = Number(params[8]);
        if (params[9] !== null && params[9] !== undefined) p.stock = Number(params[9]);
        if (params[10] !== null && params[10] !== undefined) p.size = params[10];
        if (params[11] !== null && params[11] !== undefined) p.concentration = params[11];
        if (params[12] !== null && params[12] !== undefined) p.origin = params[12];
        if (params[13] !== null && params[13] !== undefined) p.image = params[13];
        if (params[14] !== null && params[14] !== undefined) p.description = params[14];
        if (params[15] !== null && params[15] !== undefined) {
          p.top_notes = typeof params[15] === 'string' ? JSON.parse(params[15]) : params[15];
        }
        if (params[16] !== null && params[16] !== undefined) {
          p.heart_notes = typeof params[16] === 'string' ? JSON.parse(params[16]) : params[16];
        }
        if (params[17] !== null && params[17] !== undefined) {
          p.base_notes = typeof params[17] === 'string' ? JSON.parse(params[17]) : params[17];
        }
        if (params[18] !== null && params[18] !== undefined) p.longevity = params[18];
        if (params[19] !== null && params[19] !== undefined) p.sillage = params[19];
        if (params[20] !== null && params[20] !== undefined) p.best_for = params[20];
        if (params[21] !== null && params[21] !== undefined) {
          p.gradient = typeof params[21] === 'string' ? JSON.parse(params[21]) : params[21];
        }
        if (params[22] !== null && params[22] !== undefined) {
          p.quiz_tags = typeof params[22] === 'string' ? JSON.parse(params[22]) : params[22];
        }
        if (params[23] !== null && params[23] !== undefined) p.is_active = Boolean(params[23]);
        p.updated_at = new Date().toISOString();
        this.save();
        return { rows: [p] };
      }
      return { rows: [] };
    }
    if (upper.startsWith('DELETE FROM PRODUCTS')) {
      const idx = this.data.products.findIndex(x => x.id === params[0]);
      if (idx !== -1) {
        const removed = this.data.products.splice(idx, 1)[0];
        this.save();
        return { rows: [removed] };
      }
      return { rows: [] };
    }

    // 5. ORDERS
    if (upper.includes('FROM ORDERS')) {
      if (upper.includes('COALESCE(SUM(TOTAL)')) {
        const nonCancelled = this.data.orders.filter(o => o.status !== 'cancelado');
        const sum = nonCancelled.reduce((acc, o) => acc + Number(o.total || 0), 0);
        return {
          rows: [{ total_sales: sum, total_orders: nonCancelled.length }]
        };
      }
      if (upper.includes('GROUP BY STATUS')) {
        const counts = {};
        this.data.orders.forEach(o => {
          counts[o.status] = (counts[o.status] || 0) + 1;
        });
        const rows = Object.keys(counts).map(k => ({ status: k, count: counts[k] }));
        return { rows };
      }
      if (upper.includes('WHERE ITEMS::TEXT LIKE') || (upper.includes('ITEMS::TEXT') && upper.includes('LIKE'))) {
        const prodId = String(params[0] || '');
        const legacyId = params[1] ? String(params[1]) : null;
        const matches = this.data.orders.filter(o => {
          const itemsStr = JSON.stringify(o.items || []);
          return itemsStr.includes(prodId) || (legacyId && itemsStr.includes(legacyId));
        });
        return { rows: matches.map(o => ({ id: o.id })) };
      }
      if (upper.includes('WHERE ID = $1')) {
        const o = this.data.orders.find(x => x.id === params[0]);
        return { rows: o ? [o] : [] };
      }
      if (upper.includes('WHERE USER_ID = $1 OR CUSTOMER_EMAIL = $2')) {
        const list = this.data.orders.filter(x => x.user_id === params[0] || (x.customer_email && x.customer_email.toLowerCase() === (params[1] || '').toLowerCase()));
        return { rows: list };
      }
      let list = [...this.data.orders];
      if (upper.includes('STATUS = $')) {
        const statusVal = params.find(p => ['pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado'].includes(p));
        if (statusVal) {
          list = list.filter(o => o.status === statusVal);
        }
      }
      if (upper.includes('LOWER(CUSTOMER_NAME) LIKE')) {
        const searchParam = params.find(p => typeof p === 'string' && p.startsWith('%') && p.endsWith('%'));
        if (searchParam) {
          const term = searchParam.slice(1, -1).toLowerCase();
          list = list.filter(o =>
            (o.customer_name && o.customer_name.toLowerCase().includes(term)) ||
            (o.customer_email && o.customer_email.toLowerCase().includes(term)) ||
            (o.id && o.id.toLowerCase().includes(term)) ||
            (o.city && o.city.toLowerCase().includes(term))
          );
        }
      }
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      if (upper.includes('LIMIT 5')) {
        return { rows: list.slice(0, 5) };
      }
      return { rows: list };
    }
    if (upper.startsWith('INSERT INTO ORDERS')) {
      const newOrder = {
        id: params[0],
        user_id: params[1],
        customer_name: params[2],
        customer_email: params[3],
        customer_phone: params[4],
        shipping_address: params[5],
        city: params[6],
        payment_method: params[7],
        status: params[8] || 'pendiente',
        subtotal: Number(params[9]),
        shipping_cost: Number(params[10] || 0),
        total: Number(params[11]),
        gift_packaging: Boolean(params[12]),
        notes: params[13] || '',
        items: typeof params[14] === 'string' ? JSON.parse(params[14]) : params[14],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.data.orders.unshift(newOrder);
      this.save();
      return { rows: [newOrder] };
    }
    if (upper.startsWith('UPDATE ORDERS')) {
      const id = params[params.length - 1];
      const o = this.data.orders.find(x => x.id === id);
      if (o) {
        o.status = params[0];
        if (params.length > 2 && params[1] !== null && params[1] !== undefined) {
          o.notes = params[1];
        }
        o.updated_at = new Date().toISOString();
        this.save();
        return { rows: [o] };
      }
      return { rows: [] };
    }

    // 6. SUBSCRIBERS
    if (upper.startsWith('SELECT') && upper.includes('FROM SUBSCRIBERS')) {
      if (upper.includes('COUNT(*)')) {
        return { rows: [{ total_subscribers: this.data.subscribers.length }] };
      }
      return { rows: this.data.subscribers };
    }
    if (upper.startsWith('INSERT INTO SUBSCRIBERS')) {
      const email = params[0].toLowerCase();
      const existing = this.data.subscribers.find(s => s.email === email);
      if (!existing) {
        const sub = { id: this.data.subscribers.length + 1, email, active: true, created_at: new Date().toISOString() };
        this.data.subscribers.push(sub);
        this.save();
        return { rows: [sub] };
      }
      return { rows: [existing] };
    }
    if (upper.startsWith('DELETE FROM SUBSCRIBERS')) {
      if (upper.includes('WHERE ID = $1')) {
        this.data.subscribers = this.data.subscribers.filter(s => s.id !== Number(params[0]) && String(s.id) !== String(params[0]));
      }
      this.save();
      return { rows: [] };
    }

    // 7. REVIEWS
    if (upper.startsWith('SELECT') && upper.includes('FROM REVIEWS')) {
      let list = this.data.reviews.map(r => {
        const prod = this.data.products.find(p => p.id === r.product_id);
        return { ...r, product_name: r.product_name || (prod ? prod.name : r.product_id) };
      });
      if (upper.includes('WHERE PRODUCT_ID = $1') || upper.includes('R.PRODUCT_ID = $1')) {
        list = list.filter(r => r.product_id === params[0]);
      }
      return { rows: list };
    }
    if (upper.startsWith('INSERT INTO REVIEWS')) {
      const rev = {
        id: this.data.reviews.length + 1,
        product_id: params[0],
        author_name: params[1],
        rating: Number(params[2]),
        comment: params[3],
        verified_purchase: Boolean(params[4]),
        status: params[5] || 'aprobada',
        created_at: new Date().toISOString()
      };
      this.data.reviews.push(rev);
      this.save();
      return { rows: [rev] };
    }
    if (upper.startsWith('UPDATE REVIEWS')) {
      const rev = this.data.reviews.find(r => r.id === Number(params[1]) || String(r.id) === String(params[1]));
      if (rev) {
        rev.status = params[0];
        rev.updated_at = new Date().toISOString();
        this.save();
        return { rows: [rev] };
      }
      return { rows: [] };
    }
    if (upper.startsWith('DELETE FROM REVIEWS')) {
      if (upper.includes('WHERE PRODUCT_ID = $1')) {
        this.data.reviews = this.data.reviews.filter(r => r.product_id !== params[0]);
      } else if (upper.includes('WHERE ID = $1')) {
        this.data.reviews = this.data.reviews.filter(r => r.id !== Number(params[0]) && String(r.id) !== String(params[0]));
      }
      this.save();
      return { rows: [] };
    }

    // 8. ACTIVITY LOGS
    if (upper.startsWith('SELECT') && upper.includes('FROM ACTIVITY_LOGS')) {
      const logs = [...this.data.activity_logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      if (upper.includes('LIMIT 10')) {
        return { rows: logs.slice(0, 10) };
      }
      return { rows: logs };
    }
    if (upper.startsWith('INSERT INTO ACTIVITY_LOGS')) {
      let action = params[2];
      let details = params[3];
      if (!details && action) {
        details = action;
      }
      if (!action && upper.includes('LOGIN_ADMIN')) {
        action = 'LOGIN_ADMIN';
        details = 'Ingreso a la Consola de Administración';
      } else if (!action && upper.includes('ACTUALIZAR_AJUSTES')) {
        action = 'ACTUALIZAR_AJUSTES';
        details = 'Configuración de tienda actualizada';
      }
      const log = {
        id: this.data.activity_logs.length + 1,
        user_id: params[0],
        user_name: params[1],
        action: action || 'OPERACION_ADMIN',
        details: details || action || 'Operación registrada en consola',
        created_at: new Date().toISOString()
      };
      this.data.activity_logs.push(log);
      this.save();
      return { rows: [log] };
    }

    return { rows: [] };
  }
}

const localEngine = new LocalEngine();

/**
 * Inicialización inteligente de base de datos
 */
async function initDatabase() {
  try {
    const client = await pool.connect();
    usePostgres = true;
    console.log('✅ [PostgreSQL] Conectado exitosamente al contenedor de base de datos Docker.');

    await client.query('BEGIN');

    // Tablas
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(30) DEFAULT 'customer',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        full_name VARCHAR(150),
        brand VARCHAR(80),
        gender VARCHAR(30),
        gender_display VARCHAR(50),
        origin VARCHAR(100),
        image VARCHAR(255),
        subtitle VARCHAR(150),
        family VARCHAR(50) NOT NULL,
        family_display VARCHAR(100),
        price NUMERIC(12, 2) NOT NULL,
        stock INTEGER DEFAULT 20,
        size VARCHAR(50) DEFAULT '100 ml / 3.4 FL. OZ.',
        concentration VARCHAR(100),
        description TEXT,
        top_notes JSONB DEFAULT '[]'::jsonb,
        heart_notes JSONB DEFAULT '[]'::jsonb,
        base_notes JSONB DEFAULT '[]'::jsonb,
        longevity VARCHAR(100),
        sillage VARCHAR(100),
        best_for TEXT,
        gradient JSONB DEFAULT '{}'::jsonb,
        quiz_tags JSONB DEFAULT '{}'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        customer_name VARCHAR(120) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        shipping_address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'transferencia',
        status VARCHAR(40) DEFAULT 'pendiente',
        subtotal NUMERIC(12, 2) NOT NULL,
        shipping_cost NUMERIC(12, 2) DEFAULT 0,
        total NUMERIC(12, 2) NOT NULL,
        gift_packaging BOOLEAN DEFAULT FALSE,
        notes TEXT,
        items JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
        author_name VARCHAR(120) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        verified_purchase BOOLEAN DEFAULT TRUE,
        status VARCHAR(30) DEFAULT 'aprobada',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(80) PRIMARY KEY,
        value JSONB NOT NULL,
        description TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(64),
        user_name VARCHAR(120),
        action VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migraciones seguras para columnas añadidas
    await client.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(80);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS gender VARCHAR(30);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS gender_display VARCHAR(50);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS origin VARCHAR(100);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS image VARCHAR(255);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS full_name VARCHAR(150);
    `);

    await client.query('COMMIT');
    client.release();

    // Sembrar datos en PostgreSQL
    await seedPostgresData();

  } catch (err) {
    usePostgres = false;
    console.warn('⚡ [Alabastro DB] Contenedor PostgreSQL no disponible en puerto 5432.');
    console.log('🛡️  [Alabastro DB] Activando Motor Embebido de Alta Resiliencia (JSON Store).');
    localEngine.load();
    console.log(`✨ [Alabastro DB] ${localEngine.data.products.length} fragancias árabes cargadas en memoria.`);
  }
}

/**
 * Siembra datos en PostgreSQL
 */
async function seedPostgresData() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@alabastro.com').toLowerCase();
  const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);

  if (userCheck.rows.length === 0) {
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'AdminAlabastro2026!', salt);
    await pool.query(
      `INSERT INTO users (id, name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, 'admin')`,
      ['usr-admin-master-001', process.env.ADMIN_NAME || 'Director Alabastro', adminEmail, process.env.ADMIN_PHONE || '+57 311 254 9053', passHash]
    );
  }

  for (const prod of DEFAULT_PRODUCTS) {
    await pool.query(
      `INSERT INTO products (
        id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
        family, family_display, price, stock, size, concentration, description,
        top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25
      )
      ON CONFLICT (id) DO UPDATE SET
        brand = COALESCE(products.brand, EXCLUDED.brand),
        image = COALESCE(products.image, EXCLUDED.image),
        full_name = COALESCE(products.full_name, EXCLUDED.full_name),
        gender_display = COALESCE(products.gender_display, EXCLUDED.gender_display)`,
      [
        prod.id, prod.name, prod.full_name, prod.brand, prod.gender, prod.gender_display,
        prod.origin, prod.image, prod.subtitle, prod.family, prod.family_display,
        prod.price, prod.stock, prod.size, prod.concentration, prod.description,
        JSON.stringify(prod.top_notes), JSON.stringify(prod.heart_notes), JSON.stringify(prod.base_notes),
        prod.longevity, prod.sillage, prod.best_for, JSON.stringify(prod.gradient), JSON.stringify(prod.quiz_tags),
        prod.is_active !== undefined ? prod.is_active : true
      ]
    );
  }
}

/**
 * Consulta unificada que despacha a PostgreSQL o al motor local embebido
 */
async function unifiedQuery(text, params = []) {
  if (usePostgres) {
    return pool.query(text, params);
  } else {
    return localEngine.query(text, params);
  }
}

module.exports = {
  pool,
  query: unifiedQuery,
  initDatabase,
  isPostgresConnected: () => usePostgres,
  DEFAULT_PRODUCTS
};
