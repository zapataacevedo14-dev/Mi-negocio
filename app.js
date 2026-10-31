/**
 * ALABASTRO — Alta Perfumería
 * Lógica Frontend Principal (app.js)
 * Cumpliendo con la especificación técnica UI/UX:
 * - Catálogo de 8 fragancias premium
 * - Búsqueda, filtros y ordenamiento en tiempo real
 * - Carrito de compras con cálculo dinámico y persistencia en LocalStorage
 * - Lista de favoritos interactiva
 * - Modal de detalle con pirámide olfativa
 * - Recomendador interactivo de aromas
 * - Integración de pedido para WhatsApp y checkout frontend
 */

'use strict';

/* ==========================================================================
   1. Datos de Catálogo — Perfumes Árabes Originales de Lujo
   ========================================================================== */
const PRODUCTS = [
  {
    id: 'lattafa-khamrah',
    name: 'Lattafa Khamrah',
    fullName: 'Lattafa Khamrah Eau de Parfum 100ml',
    brand: 'Lattafa',
    gender: 'unisex',
    genderDisplay: 'Unisex',
    subtitle: 'Eau de Parfum de Lujo — 100ml / 3.4 FL. OZ.',
    family: 'oriental',
    familyDisplay: 'Oriental Especiada Gourmand',
    price: 235000,
    stock: 35,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/lattafa-khamrah.png',
    description: 'La joya gourmet más prestigiosa de Lattafa, presentada en un frasco de cristal tallado estilo licorera de lujo. Una opulenta danza de canela dulce de Ceilán y nuez moscada con dátiles del desierto y praliné tostado. Su secado es pura calidez aristocrática con vainilla bourbon, haba tonka tostada, resinas de benjuí y mirra sagrada.',
    topNotes: ['Canela de Ceilán', 'Nuez Moscada', 'Bergamota'],
    heartNotes: ['Dátiles del Desierto', 'Praliné Tostado', 'Nardos Nobles', 'Mahonial'],
    baseNotes: ['Vainilla Bourbon', 'Haba Tonka Negra', 'Benjuí', 'Madera de Ámbar', 'Mirra'],
    longevity: '+14 Horas de fijación excepcional',
    sillage: 'Pesada, hipnótica y memorable',
    bestFor: 'Noches frías, celebraciones de gala, veladas inolvidables',
    gradient: { liquid1: '#5A3515', liquid2: '#281507', accent: '#ECC88F', cap: '#B28A56' },
    quizTags: {
      occasions: ['noche', 'gala'],
      sensations: ['seduccion', 'confort'],
      intensities: ['notable', 'intensa']
    }
  },
  {
    id: 'lattafa-asad',
    name: 'Lattafa Asad',
    fullName: 'Lattafa Asad Eau de Parfum 100ml',
    brand: 'Lattafa',
    gender: 'hombre',
    genderDisplay: 'Hombre',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'oriental',
    familyDisplay: 'Oriental Especiada Cálida',
    price: 195000,
    stock: 45,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/lattafa-asad.png',
    description: 'La fragancia masculina árabe más aclamada a nivel mundial. Inicia con un estallido magnético de pimienta negra crujiente, piña caramelizada y hojas de tabaco rubio curado. En su evolución emerge un corazón reconfortante de café arábico tostado, pachulí e iris aterciopelado, reposando sobre un fondo rico y duradero de vainilla bourbon, ámbar cálido, benjuí y cedro seco.',
    topNotes: ['Pimienta Negra', 'Piña Jugosa', 'Tabaco Maduro'],
    heartNotes: ['Café Arábico Tostado', 'Pachulí de Indonesia', 'Iris Sedoso'],
    baseNotes: ['Vainilla Bourbon', 'Ámbar Cálido', 'Benjuí de Siam', 'Madera de Cedro'],
    longevity: '+12 a 14 Horas garantizadas en piel',
    sillage: 'Intensa, envolvente y distinguida',
    bestFor: 'Noches templadas, citas, oficina ejecutiva y eventos de alta presencia',
    gradient: { liquid1: '#261C14', liquid2: '#120B07', accent: '#D4AF7A', cap: '#C5A059' },
    quizTags: {
      occasions: ['noche', 'gala', 'diario'],
      sensations: ['seduccion', 'confort'],
      intensities: ['notable', 'intensa']
    }
  },
  {
    id: 'lattafa-yara',
    name: 'Lattafa Yara',
    fullName: 'Lattafa Yara Eau de Parfum 100ml',
    brand: 'Lattafa',
    gender: 'mujer',
    genderDisplay: 'Mujer',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'gourmand',
    familyDisplay: 'Dulce Gourmand Frutal',
    price: 189000,
    stock: 50,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/lattafa-yara.png',
    description: 'El fenómeno viral femenino de Lattafa que conquistó la perfumería internacional. Una composición dulce, cremosa y etérea que recuerda a un batido de fresas silvestres y orquídeas con crema batida. Abre con toques luminosos de heliotropo y mandarina, fusionándose con frutas tropicales maduras sobre un manto de vainilla pura de Madagascar, almizcle blanco y sándalo sedoso.',
    topNotes: ['Heliotropo', 'Orquídea', 'Mandarina Dulce'],
    heartNotes: ['Acorde Gourmand Cremoso', 'Frutas Tropicales Maduras'],
    baseNotes: ['Vainilla de Madagascar', 'Almizcle Blanco', 'Sándalo Cremoso'],
    longevity: '8 a 10 Horas en piel y ropa',
    sillage: 'Moderada a notable, dulce y encantadora',
    bestFor: 'Uso diario, primavera, citas románticas y salidas casuales',
    gradient: { liquid1: '#6E2A36', liquid2: '#331017', accent: '#E8A7B5', cap: '#D4AF7A' },
    quizTags: {
      occasions: ['diario', 'noche'],
      sensations: ['romance', 'confort'],
      intensities: ['moderada', 'notable']
    }
  },
  {
    id: 'lattafa-badee-al-oud',
    name: "Lattafa Bade'e Al Oud",
    fullName: "Lattafa Bade'e Al Oud (Oud for Glory) 100ml",
    brand: 'Lattafa',
    gender: 'unisex',
    genderDisplay: 'Unisex',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'amaderada',
    familyDisplay: 'Oriental Amaderada con Oud',
    price: 215000,
    stock: 28,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum Intenso',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/lattafa-badee-al-oud.png',
    description: 'Conocido mundialmente como "Oud for Glory", este perfume representa el lujo oscuro y majestuoso de Oriente Medio. Abre con acordes preciosos de azafrán, lavanda y nuez moscada, dando paso a una madera de Oud natural envolvente fusionada con pachulí terroso y almizcle negro.',
    topNotes: ['Azafrán Noble', 'Nuez Moscada', 'Lavanda Francesa'],
    heartNotes: ['Madera de Oud Natural', 'Pachulí Oscuro'],
    baseNotes: ['Oud Resinoso', 'Pachulí Macerado', 'Almizcle Negro'],
    longevity: '+14 a 16 Horas de fijación garantizada',
    sillage: 'Poderosa, profunda y dominante',
    bestFor: 'Galas nocturnas, clima fresco, eventos de alta distinción',
    gradient: { liquid1: '#3D2214', liquid2: '#140A06', accent: '#ECC88F', cap: '#B28A56' },
    quizTags: {
      occasions: ['noche', 'gala'],
      sensations: ['seduccion'],
      intensities: ['intensa']
    }
  },
  {
    id: 'afnan-9pm',
    name: 'Afnan 9 PM',
    fullName: 'Afnan 9 PM Eau de Parfum 100ml',
    brand: 'Afnan',
    gender: 'hombre',
    genderDisplay: 'Hombre',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'oriental',
    familyDisplay: 'Oriental Fougère Dulce Especiada',
    price: 229000,
    stock: 38,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Emiratos Árabes Unidos',
    image: 'assets/perfumes/afnan-9pm.png',
    description: 'El rey indiscutible de la noche y de los cumplidos. Afnan 9 PM abre con una salida irresistible de manzana silvestre dulce, canela cálida, bergamota y lavanda aromática, evolucionando hacia un corazón de flor de azahar y asentándose sobre una base seductora de vainilla negra, haba tonka y ámbar gris.',
    topNotes: ['Manzana Silvestre', 'Canela Cálida', 'Lavanda Salvaje', 'Bergamota'],
    heartNotes: ['Flor de Azahar del Naranjo', 'Lirio de los Valles'],
    baseNotes: ['Vainilla Negra', 'Haba Tonka', 'Ámbar Gris', 'Pachulí'],
    longevity: '+12 Horas de proyección continua',
    sillage: 'Envolvente, seductora y sumamente atractiva',
    bestFor: 'Fiestas nocturnas, salidas nocturnas, citas y clima templado',
    gradient: { liquid1: '#1F2A38', liquid2: '#0D131B', accent: '#B4C7DC', cap: '#D4AF7A' },
    quizTags: {
      occasions: ['noche', 'diario'],
      sensations: ['seduccion', 'confort'],
      intensities: ['notable', 'intensa']
    }
  },
  {
    id: 'armaf-club-de-nuit-intense-man',
    name: 'Armaf Club de Nuit Intense Man',
    fullName: 'Armaf Club de Nuit Intense Man EDT 105ml',
    brand: 'Armaf',
    gender: 'hombre',
    genderDisplay: 'Hombre',
    subtitle: 'Eau de Toilette — 105ml / 3.6 FL. OZ.',
    family: 'citrica',
    familyDisplay: 'Cítrica Amaderada Ahumada',
    price: 219000,
    stock: 40,
    size: '105 ml / 3.6 FL. OZ.',
    concentration: 'Eau de Toilette Concentrado',
    origin: 'Emiratos Árabes Unidos',
    image: 'assets/perfumes/armaf-club-de-nuit-intense-man.jpg',
    description: 'El perfume más influyente de la casa Armaf. Su salida chispeante de limón siciliano, piña y grosellas negras evoluciona hacia un corazón ahumado de madera de abedul y jazmín blanco, con un fondo icónico de almizcle, ámbar gris y pachulí que proyecta poder y confianza.',
    topNotes: ['Limón Siciliano', 'Piña Fresca', 'Grosellas Negras', 'Bergamota', 'Manzana'],
    heartNotes: ['Madera de Abedul Ahumada', 'Jazmín Blanco', 'Rosa de Damasco'],
    baseNotes: ['Almizcle Sensual', 'Ámbar Gris Mineral', 'Pachulí Terroso', 'Vainilla'],
    longevity: '+10 a 12 Horas de duración',
    sillage: 'Muy alta, firma inmediatamente reconocible',
    bestFor: 'Oficina ejecutiva, uso diario versátil, eventos formales y todas las estaciones',
    gradient: { liquid1: '#1E1E1E', liquid2: '#0A0A0A', accent: '#C0C0C0', cap: '#8A8A8A' },
    quizTags: {
      occasions: ['diario', 'gala', 'noche'],
      sensations: ['seduccion', 'frescura'],
      intensities: ['notable', 'intensa']
    }
  },
  {
    id: 'armaf-club-de-nuit-woman',
    name: 'Armaf Club de Nuit Woman',
    fullName: 'Armaf Club de Nuit Woman EDP 105ml',
    brand: 'Armaf',
    gender: 'mujer',
    genderDisplay: 'Mujer',
    subtitle: 'Eau de Parfum — 105ml / 3.6 FL. OZ.',
    family: 'floral',
    familyDisplay: 'Floral Frutal Chipre Elegante',
    price: 209000,
    stock: 32,
    size: '105 ml / 3.6 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Emiratos Árabes Unidos',
    image: 'assets/perfumes/armaf-club-de-nuit-woman.png',
    description: 'Una fragancia femenina refinada de estirpe chipre floral. Combina acordes cítricos luminosos de naranja y toronja con un ramo opulento de rosas, jazmín y durazno melocotón, cerrando con la sensualidad limpia del pachulí macerado, vainilla y vetiver.',
    topNotes: ['Naranja Dulce', 'Bergamota', 'Toronja', 'Durazno Melocotón'],
    heartNotes: ['Rosa Romántica', 'Jazmín Sambac', 'Lichi Jugoso', 'Geranio'],
    baseNotes: ['Pachulí Radiante', 'Vainilla Bourbon', 'Almizcle Limpio', 'Vetiver'],
    longevity: '+9 a 11 Horas de fijación',
    sillage: 'Moderada a notable, elegante y femenina',
    bestFor: 'Eventos diurnos, cócteles, oficina, primavera y ocasiones formales',
    gradient: { liquid1: '#4A3B2C', liquid2: '#241B12', accent: '#E8D5B5', cap: '#D4AF7A' },
    quizTags: {
      occasions: ['diario', 'gala'],
      sensations: ['romance', 'seduccion'],
      intensities: ['moderada', 'notable']
    }
  },
  {
    id: 'rasasi-hawas-for-him',
    name: 'Rasasi Hawas for Him',
    fullName: 'Rasasi Hawas for Him Eau de Parfum 100ml',
    brand: 'Rasasi',
    gender: 'hombre',
    genderDisplay: 'Hombre',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'acuatica',
    familyDisplay: 'Acuática Marina Aromática Especiada',
    price: 295000,
    stock: 22,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum de Alta Proyección',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/rasasi-hawas-for-him.png',
    description: 'La cumbre de la frescura acuática y especiada de Rasasi. Una explosión vibrante de notas marinas, ciruela violeta, manzana crujiente y limón de Amalfi se combinan con cardamomo y azahar sobre una base oceánica de ámbar gris mineral y maderas flotantes.',
    topNotes: ['Manzana Crujiente', 'Bergamota Italiana', 'Limón', 'Canela'],
    heartNotes: ['Notas Acuáticas Marinas', 'Ciruela Violeta', 'Cardamomo', 'Flor de Azahar'],
    baseNotes: ['Ámbar Gris Mineral', 'Almizcle Limpio', 'Madera Flotante', 'Pachulí'],
    longevity: '+10 a 12 Horas con excelente rendimiento',
    sillage: 'Fuerte, fresca y de largo alcance',
    bestFor: 'Verano, clima tropical, salidas informales, calor y momentos activos',
    gradient: { liquid1: '#263B4D', liquid2: '#101B24', accent: '#8ABFD4', cap: '#B28A56' },
    quizTags: {
      occasions: ['calor', 'diario'],
      sensations: ['frescura', 'seduccion'],
      intensities: ['notable', 'intensa']
    }
  },
  {
    id: 'al-haramain-amber-oud-gold',
    name: 'Al Haramain Amber Oud Gold Edition',
    fullName: 'Al Haramain Amber Oud Gold Edition 120ml',
    brand: 'Al Haramain',
    gender: 'unisex',
    genderDisplay: 'Unisex',
    subtitle: 'Eau de Parfum — 120ml / 4.0 FL. OZ.',
    family: 'oriental',
    familyDisplay: 'Oriental Frutal Ambarada de Lujo',
    price: 345000,
    stock: 18,
    size: '120 ml / 4.0 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Emiratos Árabes Unidos',
    image: 'assets/perfumes/al-haramain-amber-oud-gold.png',
    description: 'Una fragancia icónica de puro prestigio. Notas dulces y jugosas de melón maduro y piña fresca se funden con bergamota y un acorde ambarado suntuoso, descansando sobre una base de maderas nobles, almizcle blanco y vainilla cremosa. Fijación insuperable y estela opulenta.',
    topNotes: ['Bergamota de Calabria', 'Notas Verdes Frescas'],
    heartNotes: ['Melón Dulce', 'Piña Exótica', 'Notas Ámbar', 'Acorde Gourmand'],
    baseNotes: ['Vainilla Cremosa', 'Almizcle Puro', 'Maderas Nobles Orientales'],
    longevity: '+16 Horas de fijación extrema en piel',
    sillage: 'Pesada, opulenta y radiante',
    bestFor: 'Ocasiones de lujo, eventos de gala y noches especiales',
    gradient: { liquid1: '#5E411B', liquid2: '#2B1B09', accent: '#ECC88F', cap: '#D4AF7A' },
    quizTags: {
      occasions: ['gala', 'noche'],
      sensations: ['seduccion', 'confort'],
      intensities: ['intensa']
    }
  },
  {
    id: 'swiss-arabian-shaghaf-oud',
    name: 'Swiss Arabian Shaghaf Oud',
    fullName: 'Swiss Arabian Shaghaf Oud EDP 75ml',
    brand: 'Swiss Arabian',
    gender: 'unisex',
    genderDisplay: 'Unisex',
    subtitle: 'Eau de Parfum — 75ml / 2.5 FL. OZ.',
    family: 'amaderada',
    familyDisplay: 'Oriental Amaderada Gourmand con Oud',
    price: 249000,
    stock: 25,
    size: '75 ml / 2.5 FL. OZ.',
    concentration: 'Eau de Parfum Oro Puro',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/swiss-arabian-shaghaf-oud.png',
    description: 'La fragancia más emblemática de la histórica casa suizo-árabe Swiss Arabian. Azafrán precioso abre paso a un corazón apasionado de rosa damascena y madera de Oud natural, bañado en praliné dulce y vainilla dorada. Calidez, pasión y lujo en un frasco dorado.',
    topNotes: ['Azafrán Imperial de Persia'],
    heartNotes: ['Rosa de Damasco Macerada', 'Madera de Agar (Oud)'],
    baseNotes: ['Praliné Dulce', 'Vainilla Cálida', 'Oud Dorado'],
    longevity: '+14 a 16 Horas de rendimiento',
    sillage: 'Intensa, cálida, dulce y envolvente',
    bestFor: 'Noches frías, celebraciones invernales y amantes del Oud gourmet',
    gradient: { liquid1: '#523A1B', liquid2: '#24180A', accent: '#F5DC9A', cap: '#B28A56' },
    quizTags: {
      occasions: ['noche', 'gala'],
      sensations: ['seduccion', 'confort'],
      intensities: ['intensa']
    }
  },
  {
    id: 'maison-alhambra-kismet-magic',
    name: 'Maison Alhambra Kismet Magic',
    fullName: 'Maison Alhambra Kismet Magic EDP 100ml',
    brand: 'Maison Alhambra',
    gender: 'unisex',
    genderDisplay: 'Unisex',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'gourmand',
    familyDisplay: 'Oriental Gourmand Licorosa',
    price: 195000,
    stock: 30,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/maison-alhambra-kismet-magic.png',
    description: 'Una experiencia olfativa adictiva y licorosa. Apertura de coñac añejo y canela dulce que da paso a notas tostadas de haba tonka y roble maduro, coronadas con un fondo delicioso de praliné crocante, vainilla bourbon y sándalo cremoso.',
    topNotes: ['Coñac Francés Licoroso', 'Canela Dulce'],
    heartNotes: ['Haba Tonka Negra', 'Madera de Roble', 'Caramelo Tostado'],
    baseNotes: ['Vainilla Bourbon', 'Praliné Crocante', 'Sándalo Cremoso'],
    longevity: '+10 a 12 Horas de duración',
    sillage: 'Cálida, magnética y sensual',
    bestFor: 'Citas nocturnas, otoño/invierno, veladas íntimas y cenas elegantes',
    gradient: { liquid1: '#4F2E1B', liquid2: '#231209', accent: '#ECC88F', cap: '#B28A56' },
    quizTags: {
      occasions: ['noche', 'diario'],
      sensations: ['seduccion', 'confort'],
      intensities: ['notable', 'intensa']
    }
  },
  {
    id: 'fragrance-world-signature',
    name: 'Fragrance World Signature',
    fullName: 'Fragrance World Signature EDP 80ml',
    brand: 'Fragrance World',
    gender: 'unisex',
    genderDisplay: 'Unisex',
    subtitle: 'Eau de Parfum — 80ml / 2.7 FL. OZ.',
    family: 'amaderada',
    familyDisplay: 'Amaderada Aromática Especiada',
    price: 185000,
    stock: 26,
    size: '80 ml / 2.7 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/fragrance-world-signature.png',
    description: 'La creación insignia de Fragrance World. Destaca por su frescura herbal de albahaca y pimienta rosa, con un corazón elegante de vetiver y maderas ahumadas, y un fondo distinguido de cedro del Atlas, pachulí y ámbar seco.',
    topNotes: ['Albahaca Fresca', 'Pimienta Rosa'],
    heartNotes: ['Vetiver de Haití', 'Maderas Nobles Ahumadas'],
    baseNotes: ['Cedro Atlas', 'Pachulí Terroso', 'Ámbar Seco'],
    longevity: '8 a 10 Horas de fijación',
    sillage: 'Elegante, equilibrada y pulcra',
    bestFor: 'Oficina, reuniones de negocios y uso diario sofisticado',
    gradient: { liquid1: '#36402E', liquid2: '#1A2116', accent: '#A8C99B', cap: '#D4AF7A' },
    quizTags: {
      occasions: ['diario', 'calor'],
      sensations: ['frescura', 'confort'],
      intensities: ['moderada', 'notable']
    }
  },
  {
    id: 'lattafa-fakhar-black',
    name: 'Fakhar Black',
    fullName: 'Lattafa Fakhar Black Eau de Parfum 100ml',
    brand: 'Lattafa',
    gender: 'hombre',
    genderDisplay: 'Hombre',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'amaderada',
    familyDisplay: 'Aromático / Amaderado',
    price: 165000,
    stock: 40,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/lattafa-fakhar-black.png',
    description: 'La icónica fragancia masculina de Lattafa que combina la frescura aromática de la manzana verde, bergamota y lavanda con un corazón de flor de naranja y geranio, culminando en un fondo profundo de haba tonka, vetiver, cedro y ámbar sedoso.',
    topNotes: ['Manzana Verde', 'Bergamota', 'Lavanda Francesa'],
    heartNotes: ['Flor de Naranja', 'Geranio', 'Salvia'],
    baseNotes: ['Haba Tonka', 'Madera de Cedro', 'Vetiver', 'Ámbar'],
    longevity: '+10 a 12 Horas de duración',
    sillage: 'Notable, elegante y versátil',
    bestFor: 'Oficina, eventos de día, salidas casuales y cenas',
    gradient: { liquid1: '#1A1A1A', liquid2: '#0D0D0D', accent: '#D4AF7A', cap: '#C0C0C0' },
    quizTags: { occasions: ['diario', 'noche'], sensations: ['frescura', 'seduccion'], intensities: ['moderada', 'notable'] }
  },
  {
    id: 'afnan-supremacy-not-only-intense',
    name: 'Supremacy Not Only Intense',
    fullName: 'Afnan Supremacy Not Only Intense Extrait de Parfum 100ml',
    brand: 'Afnan',
    gender: 'hombre',
    genderDisplay: 'Hombre',
    subtitle: 'Extrait de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'amaderada',
    familyDisplay: 'Frutal / Musgo',
    price: 280000,
    stock: 35,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Extrait de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/afnan-supremacy-not-only-intense.png',
    description: 'Extrait de Parfum chipre frutal de altísima concentración. Abre con una explosión jugosa de grosella negra, bergamota y manzana fresca, evolucionando hacia un corazón de musgo de roble, pachulí y lavanda, anclado en ámbar gris, almizcle y azafrán.',
    topNotes: ['Grosellas Negras', 'Bergamota', 'Manzana Crujiente'],
    heartNotes: ['Musgo de Roble', 'Pachulí Terroso', 'Lavanda'],
    baseNotes: ['Ámbar Gris', 'Almizcle Blanco', 'Azafrán'],
    longevity: '+14 a 16 Horas de fijación extrema',
    sillage: 'Poderosa, imponente y aristocrática',
    bestFor: 'Reuniones ejecutivas, galas, climas templados a fríos',
    gradient: { liquid1: '#2D3134', liquid2: '#16191B', accent: '#E0E0E0', cap: '#A0A0A0' },
    quizTags: { occasions: ['gala', 'noche', 'diario'], sensations: ['seduccion', 'confort'], intensities: ['intensa'] }
  },
  {
    id: 'lattafa-nebras',
    name: 'Nebras',
    fullName: 'Lattafa Nebras Eau de Parfum 100ml',
    brand: 'Lattafa',
    gender: 'unisex',
    genderDisplay: 'Unisex',
    subtitle: 'Eau de Parfum de Lujo — 100ml / 3.4 FL. OZ.',
    family: 'gourmand',
    familyDisplay: 'Dulce / Gourmand',
    price: 210000,
    stock: 45,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/lattafa-nebras.png',
    description: 'Una adictiva oda gourmet de frutos rojos confitados y mandarina jugosa que se funde en un corazón celestial de cacao puro, vainilla cremosa y rosa noble, reposando en una base de azúcar moreno, ámbar cálido y almizcle tonka.',
    topNotes: ['Bayas Rojas', 'Mandarina Dulce'],
    heartNotes: ['Vainilla Madagascar', 'Cacao Puro', 'Rosa de Damasco'],
    baseNotes: ['Azúcar Moreno', 'Haba Tonka', 'Ámbar', 'Almizcle'],
    longevity: '+12 a 14 Horas de duración',
    sillage: 'Dulce, embriagadora y muy seductora',
    bestFor: 'Citas románticas, clima templado o frío, salidas nocturnas',
    gradient: { liquid1: '#4A2A18', liquid2: '#24140B', accent: '#D4AF7A', cap: '#C5A059' },
    quizTags: { occasions: ['noche', 'cita'], sensations: ['seduccion', 'confort'], intensities: ['notable', 'intensa'] }
  },
  {
    id: 'maison-alhambra-porto-neroli',
    name: 'Porto Neroli',
    fullName: 'Maison Alhambra Porto Neroli Eau de Parfum 80ml',
    brand: 'Maison Alhambra',
    gender: 'unisex',
    genderDisplay: 'Unisex',
    subtitle: 'Eau de Parfum — 80ml / 2.7 FL. OZ.',
    family: 'citrica',
    familyDisplay: 'Cítricos / Fresco',
    price: 160000,
    stock: 40,
    size: '80 ml / 2.7 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/maison-alhambra-porto-neroli.png',
    description: 'La vibrante brisa de la Riviera italiana capturada en botella turquesa. Destaca por sus notas chispeantes de neroli tunecino, bergamota italiana, limón de Sicilia y flor de azahar, enriquecida con lavanda y una base luminosa de ámbar y romero.',
    topNotes: ['Neroli de Túnez', 'Limón Siciliano', 'Bergamota Italiana', 'Mandarina'],
    heartNotes: ['Flor de Azahar del Naranjo', 'Lavanda', 'Jazmín'],
    baseNotes: ['Ámbar Soleado', 'Angélica', 'Almizcle Blanco'],
    longevity: '+8 a 10 Horas de frescura marina',
    sillage: 'Limpia, refrescante y revitalizante',
    bestFor: 'Días calurosos, mañanas de verano, playa y eventos al aire libre',
    gradient: { liquid1: '#0E627C', liquid2: '#083B4A', accent: '#D4AF7A', cap: '#C5A059' },
    quizTags: { occasions: ['diario', 'calor'], sensations: ['frescura', 'energia'], intensities: ['moderada'] }
  },
  {
    id: 'al-haramain-laventure',
    name: "L'Aventure",
    fullName: "Al Haramain L'Aventure Eau de Parfum 100ml",
    brand: 'Al Haramain',
    gender: 'hombre',
    genderDisplay: 'Hombre',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'amaderada',
    familyDisplay: 'Cítricos / Amaderados',
    price: 220000,
    stock: 50,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/al-haramain-laventure.png',
    description: 'Elegancia y carácter aventurero en un cubo plateado tipo espejo. Abre con un estallido cítrico de limón, bergamota y elemí, da paso a un corazón sofisticado de lirio de los valles y jazmín, y sella con pachulí, cedro y ámbar amaderado de alta estela.',
    topNotes: ['Bergamota', 'Limón', 'Elemí'],
    heartNotes: ['Lirio de los Valles', 'Jazmín', 'Maderas'],
    baseNotes: ['Pachulí', 'Ámbar', 'Almizcle', 'Madera de Cedro'],
    longevity: '+12 Horas de duración impecable',
    sillage: 'Vibrante, masculina y distinguida',
    bestFor: 'Negocios, uso diario de alta gama, eventos versátiles',
    gradient: { liquid1: '#3D3D3D', liquid2: '#1F1F1F', accent: '#Silver', cap: '#D8D8D8' },
    quizTags: { occasions: ['diario', 'gala'], sensations: ['frescura', 'seduccion'], intensities: ['notable'] }
  },
  {
    id: 'swiss-arabian-casablanca',
    name: 'Casablanca',
    fullName: 'Swiss Arabian Casablanca Eau de Parfum 100ml',
    brand: 'Swiss Arabian',
    gender: 'mujer',
    genderDisplay: 'Mujer',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'gourmand',
    familyDisplay: 'Dulce / Frutal',
    price: 260000,
    stock: 40,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Emiratos Árabes Unidos',
    image: 'assets/perfumes/swiss-arabian-casablanca.png',
    description: 'Inspirada en el romance y la mística de la legendaria ciudad marroquí. Abre con uvas maduras y manzana crujiente bañadas en caramelo líquido, pachulí e iris, culminando en un lecho cálido de ante suave, ámbar dorado y almizcle blanco.',
    topNotes: ['Manzana Crujiente', 'Uva Madura'],
    heartNotes: ['Caramelo Dorado', 'Pachulí', 'Lirio Blanco'],
    baseNotes: ['Ámbar Cálido', 'Almizcle de Ante', 'Bálsamo del Perú'],
    longevity: '+12 a 14 Horas de fijación envolvente',
    sillage: 'Cálida, dulce y cautivadora',
    bestFor: 'Noches especiales, citas, otoño e invierno',
    gradient: { liquid1: '#54361C', liquid2: '#2B1A0D', accent: '#D4AF7A', cap: '#C5A059' },
    quizTags: { occasions: ['noche', 'cita'], sensations: ['seduccion', 'confort'], intensities: ['notable'] }
  },
  {
    id: 'armaf-tres-nuit',
    name: 'Tres Nuit',
    fullName: 'Armaf Tres Nuit Pour Homme Eau de Toilette 100ml',
    brand: 'Armaf',
    gender: 'hombre',
    genderDisplay: 'Hombre',
    subtitle: 'Eau de Toilette — 100ml / 3.4 FL. OZ.',
    family: 'floral',
    familyDisplay: 'Floral / Fresco',
    price: 155000,
    stock: 45,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Toilette Concentrée',
    origin: 'Emiratos Árabes Unidos',
    image: 'assets/perfumes/armaf-tres-nuit.png',
    description: 'Un viaje aromático fresco y distinguido. Se abre con notas brillantes de cedrón (hierba luisa), iris y limón, seguidas de hojas de violeta, lavanda y notas especiadas, reposando sobre una base limpia de ámbar gris y sándalo cremoso.',
    topNotes: ['Cedrón (Hierba Luisa)', 'Iris', 'Limón'],
    heartNotes: ['Hojas de Violeta', 'Lavanda', 'Notas Especiadas'],
    baseNotes: ['Ámbar Gris', 'Madera de Sándalo'],
    longevity: '+8 a 10 Horas de frescor refinado',
    sillage: 'Limpia, sofisticada y verde',
    bestFor: 'Primavera, días cálidos, oficina y encuentros cotidianos',
    gradient: { liquid1: '#1E2D3D', liquid2: '#0D161F', accent: '#A0C0D6', cap: '#304154' },
    quizTags: { occasions: ['diario', 'calor'], sensations: ['frescura'], intensities: ['moderada'] }
  },
  {
    id: 'fragrance-world-barakkat-rouge-540',
    name: 'Barakkat Rouge 540',
    fullName: 'Fragrance World Barakkat Rouge 540 Eau de Parfum 100ml',
    brand: 'Fragrance World',
    gender: 'unisex',
    genderDisplay: 'Unisex',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'oriental',
    familyDisplay: 'Dulce / Amaderado',
    price: 145000,
    stock: 55,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/fragrance-world-barakkat-rouge-540.png',
    description: 'La célebre recreación del aroma más deseado del mundo. Notas deslumbrantes de azafrán y jazmín sambac que flotan sobre un corazón de madera de ámbar y ámbar gris cristalino, con un fondo sublime de resina de abeto y cedro rojo.',
    topNotes: ['Azafrán Rojo', 'Jazmín Sambac'],
    heartNotes: ['Amberwood (Madera de Ámbar)', 'Ámbar Gris'],
    baseNotes: ['Resina de Abeto', 'Cedro Rojo'],
    longevity: '+12 a 14 Horas de proyección magnética',
    sillage: 'Radiante, aérea y sumamente elogiada',
    bestFor: 'Eventos sociales, salidas nocturnas, uso versátil de distinción',
    gradient: { liquid1: '#66161D', liquid2: '#33080C', accent: '#D4AF7A', cap: '#C5A059' },
    quizTags: { occasions: ['gala', 'noche'], sensations: ['seduccion'], intensities: ['notable', 'intensa'] }
  },
  {
    id: 'paris-corner-emir-celestial',
    name: 'Emir Celestial',
    fullName: 'Paris Corner Emir Celestial Eau de Parfum 100ml',
    brand: 'Paris Corner',
    gender: 'unisex',
    genderDisplay: 'Unisex',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'amaderada',
    familyDisplay: 'Cuero / Especiado',
    price: 195000,
    stock: 35,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/paris-corner-emir-celestial.png',
    description: 'Una composición futurista y magnética con notas minerales, hoja de violeta, gamuza italiana y mandarina, fusionadas con osmanto aterciopelado, comino y una base vanguardista de Akigalawood y siempreviva.',
    topNotes: ['Mandarina Italiana', 'Notas Minerales', 'Azafrán'],
    heartNotes: ['Hoja de Violeta', 'Osmanto', 'Gamuza Fina'],
    baseNotes: ['Madera de Akigala', 'Siempreviva', 'Ámbar Seco'],
    longevity: '+12 a 14 Horas de rendimiento estelar',
    sillage: 'Vanguardista, magnética y única',
    bestFor: 'Amantes de la perfumería nicho de vanguardia y veladas exclusivas',
    gradient: { liquid1: '#3D2F40', liquid2: '#1C151E', accent: '#C8A2C8', cap: '#7A6280' },
    quizTags: { occasions: ['gala', 'noche'], sensations: ['seduccion', 'energia'], intensities: ['intensa'] }
  },
  {
    id: 'lattafa-ameer-al-oudh-intense-oud',
    name: 'Ameer Al Oudh Intense Oud',
    fullName: 'Lattafa Ameer Al Oudh Intense Oud Eau de Parfum 100ml',
    brand: 'Lattafa',
    gender: 'unisex',
    genderDisplay: 'Unisex',
    subtitle: 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
    family: 'oriental',
    familyDisplay: 'Oriental / Dulce',
    price: 185000,
    stock: 45,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Eau de Parfum',
    origin: 'Dubái, Emiratos Árabes Unidos',
    image: 'assets/perfumes/lattafa-ameer-al-oudh-intense-oud.png',
    description: 'La calidez de una hoguera oriental bajo el cielo nocturno del desierto. Una apertura envolvente de oud suave y azúcar moreno caramelizado, corazón de vainilla bourbon y maderas nobles, coronado por un fondo resinoso de ládano y notas herbales.',
    topNotes: ['Madera de Oud Dulce', 'Azúcar Tostado'],
    heartNotes: ['Vainilla Bourbon', 'Maderas Nobles Aromáticas'],
    baseNotes: ['Oud Resinoso', 'Sándalo', 'Ládano Balsámico'],
    longevity: '+14 Horas de abrazo cálido',
    sillage: 'Reconfortante, dulce, ahumada y opulenta',
    bestFor: 'Noches frías, celebraciones invernales, ocasiones especiales',
    gradient: { liquid1: '#4A2A0C', liquid2: '#211204', accent: '#D4AF7A', cap: '#B8860B' },
    quizTags: { occasions: ['noche', 'confort'], sensations: ['confort', 'seduccion'], intensities: ['intensa'] }
  }
];

/** Mapeo de compatibilidad con IDs alternativos y pedidos anteriores */
const LEGACY_ID_MAP = {
  'santal-nectar': 'lattafa-khamrah',
  'rose-imperiale': 'lattafa-yara',
  'oud-nocturne': 'lattafa-asad',
  'bergamote-sauvage': 'armaf-club-de-nuit-intense-man',
  'ambre-dore': 'al-haramain-amber-oud-gold',
  'fleur-blanche': 'armaf-club-de-nuit-woman',
  'marina-profonda': 'rasasi-hawas-for-him',
  'vanille-celeste': 'afnan-9pm'
};

/** Resuelve un ID al producto correspondiente del catálogo */
function getProductById(id) {
  if (!id) return null;
  const resolvedId = LEGACY_ID_MAP[id] || id;
  return PRODUCTS.find(p => p.id === resolvedId);
}

/* ==========================================================================
   2. Estado de la Aplicación (State Management)
   ========================================================================== */
const STATE = {
  cart: [],
  favorites: new Set(),
  currentUser: null,
  filters: {
    family: 'all',
    brand: 'all',
    gender: 'all',
    search: '',
    sort: 'featured'
  },
  activeModalProduct: null,
  modalQuantity: 1,
  quizAnswers: {
    occasion: null,
    sensation: null,
    intensity: null
  },
  currentQuizStep: 1
};

const STORAGE_KEYS = {
  cart: 'essenza_cart_v2',
  favorites: 'essenza_favorites_v2',
  users: 'essenza_users_v2',
  currentUser: 'essenza_current_user_v2'
};

const FREE_SHIPPING_THRESHOLD = 350000; // $350.000 COP
const MAX_CART_ITEM_QTY = 10; // Límite de seguridad por artículo

/* ==========================================================================
   2.5. Módulo de Seguridad Frontend (Defense-in-Depth)
   ========================================================================== */
const SecurityModule = (() => {
  'use strict';

  /**
   * Sanitiza HTML para prevenir inyección XSS.
   * Convierte caracteres especiales a entidades HTML seguras.
   */
  function sanitizeHTML(str) {
    if (typeof str !== 'string') return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
      '/': '&#x2F;',
      '`': '&#x60;'
    };
    return str.replace(/[&<>"'\/`]/g, char => map[char]);
  }

  /**
   * Hash SHA-256 asíncrono usando Web Crypto API nativa del navegador.
   * Devuelve un hash hexadecimal determinista.
   */
  async function hashPassword(password) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password + '_ALABASTRO_SALT_2026');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback: hash simple para navegadores sin Web Crypto
      let hash = 0;
      const salted = password + '_ALABASTRO_SALT_2026';
      for (let i = 0; i < salted.length; i++) {
        const char = salted.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return 'fb_' + Math.abs(hash).toString(16);
    }
  }

  /**
   * Rate Limiter para prevenir ataques de fuerza bruta.
   * Máximo 5 intentos de login en ventana de 60 segundos.
   */
  const rateLimiter = {
    attempts: [],
    maxAttempts: 5,
    windowMs: 60000, // 60 segundos
    lockoutMs: 60000, // 60 segundos de bloqueo
    lockedUntil: 0,

    canAttempt() {
      const now = Date.now();
      if (now < this.lockedUntil) {
        const secsLeft = Math.ceil((this.lockedUntil - now) / 1000);
        return { allowed: false, message: `Demasiados intentos. Intenta nuevamente en ${secsLeft} segundos.` };
      }
      // Limpiar intentos vencidos
      this.attempts = this.attempts.filter(t => (now - t) < this.windowMs);
      if (this.attempts.length >= this.maxAttempts) {
        this.lockedUntil = now + this.lockoutMs;
        this.attempts = [];
        return { allowed: false, message: 'Has superado el límite de intentos. Tu cuenta está bloqueada temporalmente por 60 segundos.' };
      }
      return { allowed: true };
    },

    recordAttempt() {
      this.attempts.push(Date.now());
    },

    reset() {
      this.attempts = [];
      this.lockedUntil = 0;
    }
  };

  /**
   * Validadores de entrada robustos.
   */
  const validators = {
    email(value) {
      if (typeof value !== 'string') return false;
      const clean = value.trim().toLowerCase();
      if (clean.length > 254) return false;
      return /^[a-z0-9](?:[a-z0-9._%+\-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?(?:\.[a-z]{2,})+$/i.test(clean);
    },

    password(value) {
      if (typeof value !== 'string') return { valid: false, message: 'Contraseña requerida.' };
      if (value.length < 6) return { valid: false, message: 'La contraseña debe tener mínimo 6 caracteres.' };
      if (value.length > 128) return { valid: false, message: 'Contraseña demasiado larga (máx. 128 caracteres).' };
      if (/^(.)(\1)+$/.test(value)) return { valid: false, message: 'La contraseña no puede ser un solo carácter repetido.' };
      return { valid: true };
    },

    name(value) {
      if (typeof value !== 'string') return false;
      const clean = value.trim();
      if (clean.length < 2 || clean.length > 100) return false;
      // Permite letras, espacios, tildes y ñ; bloquea HTML y scripts
      return /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s.\-']+$/.test(clean);
    },

    phone(value) {
      if (typeof value !== 'string') return true; // Campo opcional
      const clean = value.trim();
      if (clean === '') return true;
      return /^[\d\s+()\-]{7,20}$/.test(clean);
    },

    /** Verifica que un productId sea válido contra el catálogo */
    productId(id) {
      return typeof id === 'string' && (PRODUCTS.some(p => p.id === id) || id in LEGACY_ID_MAP);
    }
  };

  /**
   * JSON.parse seguro con protección contra prototype pollution.
   */
  function safeJSONParse(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      // Bloquear prototype pollution
      if (typeof parsed === 'object' && parsed !== null) {
        if ('__proto__' in parsed || 'constructor' in parsed || 'prototype' in parsed) {
          console.warn('[Seguridad] Intento de prototype pollution bloqueado.');
          return null;
        }
      }
      return parsed;
    } catch (e) {
      console.warn('[Seguridad] Error en JSON.parse seguro:', e);
      return null;
    }
  }

  /**
   * Verifica integridad de datos de carrito desde localStorage.
   */
  function validateCartData(data) {
    if (!Array.isArray(data)) return [];
    return data.filter(item => {
      return item
        && typeof item.id === 'string'
        && typeof item.name === 'string'
        && typeof item.price === 'number'
        && item.price > 0
        && typeof item.quantity === 'number'
        && item.quantity > 0
        && item.quantity <= MAX_CART_ITEM_QTY
        && (PRODUCTS.some(p => p.id === item.id) || item.id in LEGACY_ID_MAP);
    }).map(item => ({
      id: item.id,
      name: item.name,
      familyDisplay: String(item.familyDisplay || ''),
      price: Number(item.price),
      size: String(item.size || ''),
      quantity: Math.min(Number(item.quantity), MAX_CART_ITEM_QTY)
    }));
  }

  /**
   * Genera un token anti-CSRF simple basado en sesión.
   */
  function generateSessionToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  // Inicializar token de sesión
  if (!sessionStorage.getItem('_csrf_token')) {
    sessionStorage.setItem('_csrf_token', generateSessionToken());
  }

  return {
    sanitizeHTML,
    hashPassword,
    rateLimiter,
    validators,
    safeJSONParse,
    validateCartData,
    generateSessionToken
  };
})();

/* ==========================================================================
   3. Helpers y Utilidades
   ========================================================================== */
/**
 * Formatea un número a divisa de Pesos Colombianos (COP)
 */
function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount) + ' COP';
}

/**
 * Genera el vector gráfico SVG de la botella con la paleta de la fragancia
 */
function createBottleSvg(product, width = 130, height = 210) {
  const gradId = `liq-${product.id}`;
  const capId = `cap-${product.id}`;

  return `
    <svg viewBox="0 0 160 260" class="bottle-svg-rendered" width="${width}" height="${height}" role="img" aria-label="Frasco ${product.name}">
      <defs>
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${product.gradient.liquid1}" />
          <stop offset="100%" stop-color="${product.gradient.liquid2}" />
        </linearGradient>
        <linearGradient id="${capId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F7E6C8" />
          <stop offset="45%" stop-color="${product.gradient.cap}" />
          <stop offset="100%" stop-color="#5E4320" />
        </linearGradient>
        <linearGradient id="shine-${product.id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="white" stop-opacity="0.32" />
          <stop offset="40%" stop-color="white" stop-opacity="0.04" />
          <stop offset="85%" stop-color="white" stop-opacity="0.18" />
          <stop offset="100%" stop-color="white" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Tapa pesada de lujo facetada -->
      <rect x="58" y="16" width="44" height="34" rx="3" fill="url(#${capId})" filter="drop-shadow(0 3px 5px rgba(0,0,0,0.35))" />
      <rect x="62" y="20" width="36" height="4" fill="#FFFFFF" opacity="0.45" />

      <!-- Cuello / Atomizador dorado -->
      <rect x="70" y="50" width="20" height="10" fill="url(#${capId})" />

      <!-- Cuerpo principal de cristal grueso -->
      <rect x="28" y="60" width="104" height="162" rx="12" fill="url(#${gradId})" stroke="#B28A56" stroke-width="1.2" />

      <!-- Reflejos de cristal laterales -->
      <path d="M36 68 L52 68 L42 214 L34 214 Z" fill="url(#shine-${product.id})" />
      <rect x="32" y="64" width="96" height="154" rx="9" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.2" />

      <!-- Placa decorativa dorada sin textos falsos -->
      <rect x="46" y="118" width="68" height="52" rx="2" fill="#181412" stroke="url(#${capId})" stroke-width="0.9" />
      <line x1="56" y1="144" x2="104" y2="144" stroke="#B28A56" stroke-width="0.5" opacity="0.6"/>

      <!-- Fondo reforzado de cristal sólido -->
      <rect x="34" y="210" width="92" height="8" rx="3" fill="rgba(255,255,255,0.14)" />
    </svg>
  `;
}

/**
 * Notificaciones Flotantes Toast
 */
function showToast(message, icon = '✦') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';

  // Seguridad: usar textContent para el mensaje y evitar XSS
  const iconSpan = document.createElement('span');
  iconSpan.className = 'toast-icon';
  iconSpan.textContent = icon;

  const msgSpan = document.createElement('span');
  msgSpan.className = 'toast-msg';
  msgSpan.textContent = message;

  toast.appendChild(iconSpan);
  toast.appendChild(msgSpan);
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-remove');
    setTimeout(() => toast.remove(), 320);
  }, 3200);
}

/* ==========================================================================
   4. Almacenamiento Local (LocalStorage)
   ========================================================================== */
function loadStateFromStorage() {
  try {
    const savedCart = localStorage.getItem(STORAGE_KEYS.cart);
    if (savedCart) {
      const parsed = SecurityModule.safeJSONParse(savedCart);
      STATE.cart = SecurityModule.validateCartData(parsed);
    }

    const savedFavs = localStorage.getItem(STORAGE_KEYS.favorites);
    if (savedFavs) {
      const parsed = SecurityModule.safeJSONParse(savedFavs);
      if (Array.isArray(parsed)) {
        // Validar que cada favorito sea un ID de producto válido
        STATE.favorites = new Set(parsed.filter(id => SecurityModule.validators.productId(id)));
      }
    }

    const savedUser = localStorage.getItem(STORAGE_KEYS.currentUser) || sessionStorage.getItem(STORAGE_KEYS.currentUser);
    if (savedUser) {
      const parsed = SecurityModule.safeJSONParse(savedUser);
      if (parsed && typeof parsed.id === 'string' && typeof parsed.email === 'string') {
        // Omitir hash de contraseña del estado en memoria
        STATE.currentUser = {
          id: parsed.id,
          name: SecurityModule.sanitizeHTML(parsed.name || ''),
          email: parsed.email,
          phone: parsed.phone || '',
          role: parsed.role || (parsed.email.toLowerCase() === 'admin@alabastro.com' ? 'admin' : 'customer'),
          createdAt: parsed.createdAt || ''
        };
      }
    }
  } catch (e) {
    console.warn('[Seguridad] No se pudo acceder al LocalStorage:', e);
    // Limpiar datos potencialmente corruptos
    STATE.cart = [];
    STATE.favorites = new Set();
    STATE.currentUser = null;
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(STATE.cart));
  } catch (e) {
    console.warn('Error al guardar carrito:', e);
  }
}

function saveFavoritesToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(Array.from(STATE.favorites)));
  } catch (e) {
    console.warn('Error al guardar favoritos:', e);
  }
}

/* ==========================================================================
   5. Renderizado del Catálogo de Productos
   ========================================================================== */
function filterAndSortProducts() {
  let list = [...PRODUCTS];

  // Filtro por marca
  if (STATE.filters.brand && STATE.filters.brand !== 'all') {
    const b = STATE.filters.brand.toLowerCase();
    list = list.filter(p => (p.brand || '').toLowerCase() === b);
  }

  // Filtro por género (hombre, mujer, unisex)
  if (STATE.filters.gender && STATE.filters.gender !== 'all') {
    list = list.filter(p => p.gender === STATE.filters.gender);
  }

  // Filtro por familia olfativa
  if (STATE.filters.family && STATE.filters.family !== 'all') {
    list = list.filter(p => p.family === STATE.filters.family);
  }

  // Búsqueda por texto (nombre, marca, notas, descripción, género)
  if (STATE.filters.search.trim() !== '') {
    const q = STATE.filters.search.toLowerCase().trim();
    list = list.filter(p => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchFullName = (p.fullName || '').toLowerCase().includes(q);
      const matchBrand = (p.brand || '').toLowerCase().includes(q);
      const matchGender = (p.genderDisplay || '').toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchFamily = p.familyDisplay.toLowerCase().includes(q);
      const matchNotes = [...p.topNotes, ...p.heartNotes, ...p.baseNotes].some(n => n.toLowerCase().includes(q));
      return matchName || matchFullName || matchBrand || matchGender || matchDesc || matchFamily || matchNotes;
    });
  }

  // Ordenamiento
  switch (STATE.filters.sort) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'featured':
    default:
      // Mantener orden curado de la colección
      break;
  }

  return list;
}

function updateActiveFilterTags() {
  const container = document.getElementById('activeFilterTags');
  if (!container) return;

  const tags = [];
  if (STATE.filters.brand && STATE.filters.brand !== 'all') {
    tags.push({ label: `Marca: ${STATE.filters.brand}`, type: 'brand' });
  }
  if (STATE.filters.gender && STATE.filters.gender !== 'all') {
    const gLabels = { hombre: 'Hombre', mujer: 'Mujer', unisex: 'Unisex' };
    tags.push({ label: `Para: ${gLabels[STATE.filters.gender] || STATE.filters.gender}`, type: 'gender' });
  }
  if (STATE.filters.family && STATE.filters.family !== 'all') {
    tags.push({ label: `Familia: ${STATE.filters.family}`, type: 'family' });
  }
  if (STATE.filters.search.trim()) {
    tags.push({ label: `Buscar: "${STATE.filters.search.trim()}"`, type: 'search' });
  }

  if (tags.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = tags.map(t => `
    <span class="active-tag-chip" data-tag-type="${t.type}">
      ${t.label}
      <button type="button" class="remove-tag-btn" data-action="remove-tag" data-tag-type="${t.type}" aria-label="Quitar filtro">&times;</button>
    </span>
  `).join('') + `
    <button type="button" class="clear-all-tags-btn" data-action="clear-all-tags">Limpiar filtros</button>
  `;
}

/**
 * Conexión Real con PostgreSQL: Carga el catálogo en vivo desde el Backend REST
 */
async function loadProductsFromBackend() {
  try {
    const apiBase = (typeof window !== 'undefined' && window.location && window.location.port === '3000') ? '' : 'http://localhost:3000';
    const res = await fetch(`${apiBase}/api/products`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && Array.isArray(data.products) && data.products.length > 0) {
      const liveProducts = data.products.map(p => ({
        id: p.id,
        name: p.name,
        fullName: p.full_name || `${p.brand || ''} ${p.name}`,
        brand: p.brand || 'Lattafa',
        gender: p.gender || 'unisex',
        genderDisplay: p.gender_display || (p.gender === 'hombre' ? 'Hombre' : (p.gender === 'mujer' ? 'Mujer' : 'Unisex')),
        subtitle: p.subtitle || 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
        family: p.family,
        familyDisplay: p.family_display || p.family,
        price: Number(p.price),
        stock: Number(p.stock),
        size: p.size || '100 ml / 3.4 FL. OZ.',
        concentration: p.concentration || 'Eau de Parfum',
        origin: p.origin || 'Dubái, Emiratos Árabes Unidos',
        image: p.image || 'assets/perfumes/lattafa-asad.png',
        description: p.description || '',
        topNotes: typeof p.top_notes === 'string' ? JSON.parse(p.top_notes) : (Array.isArray(p.top_notes) ? p.top_notes : []),
        heartNotes: typeof p.heart_notes === 'string' ? JSON.parse(p.heart_notes) : (Array.isArray(p.heart_notes) ? p.heart_notes : []),
        baseNotes: typeof p.base_notes === 'string' ? JSON.parse(p.base_notes) : (Array.isArray(p.base_notes) ? p.base_notes : []),
        longevity: p.longevity || '+12 Horas de fijación',
        sillage: p.sillage || 'Intensa, envolvente y distinguida',
        bestFor: p.best_for || 'Ocasiones especiales y eventos de presencia',
        gradient: typeof p.gradient === 'string' ? JSON.parse(p.gradient) : (p.gradient || { liquid1: '#261C14', liquid2: '#120B07', accent: '#D4AF7A', cap: '#C5A059' }),
        quizTags: typeof p.quiz_tags === 'string' ? JSON.parse(p.quiz_tags) : (p.quiz_tags || { occasions: ['noche'], sensations: ['seduccion'], intensities: ['notable'] }),
        isActive: p.is_active !== undefined ? p.is_active : true
      }));

      // Reemplazar los datos del catálogo en memoria con los de PostgreSQL
      PRODUCTS.length = 0;
      PRODUCTS.push(...liveProducts);
      renderCatalog();
    }
  } catch (err) {
    try {
      const rawLocal = localStorage.getItem('alabastro_console_store_v1');
      if (rawLocal) {
        const parsedStore = JSON.parse(rawLocal);
        if (parsedStore && Array.isArray(parsedStore.products) && parsedStore.products.length > 0) {
          const activeLocal = parsedStore.products.filter(p => p.is_active !== false).map(p => ({
            id: p.id,
            name: p.name,
            fullName: p.full_name || `${p.brand || ''} ${p.name}`,
            brand: p.brand || 'Lattafa',
            gender: p.gender || 'unisex',
            genderDisplay: p.gender_display || (p.gender === 'hombre' ? 'Hombre' : (p.gender === 'mujer' ? 'Mujer' : 'Unisex')),
            subtitle: p.subtitle || 'Eau de Parfum — 100ml / 3.4 FL. OZ.',
            family: p.family,
            familyDisplay: p.family_display || p.family,
            price: Number(p.price),
            stock: Number(p.stock),
            size: p.size || '100 ml / 3.4 FL. OZ.',
            concentration: p.concentration || 'Eau de Parfum',
            origin: p.origin || 'Dubái, Emiratos Árabes Unidos',
            image: p.image || 'assets/perfumes/lattafa-asad.png',
            description: p.description || '',
            topNotes: Array.isArray(p.top_notes) ? p.top_notes : [],
            heartNotes: Array.isArray(p.heart_notes) ? p.heart_notes : [],
            baseNotes: Array.isArray(p.base_notes) ? p.base_notes : [],
            longevity: p.longevity || '+12 Horas de fijación',
            sillage: p.sillage || 'Intensa, envolvente y distinguida',
            bestFor: p.best_for || 'Ocasiones especiales',
            gradient: p.gradient || { liquid1: '#261C14', liquid2: '#120B07', accent: '#D4AF7A', cap: '#C5A059' },
            quizTags: p.quiz_tags || { occasions: ['noche'], sensations: ['seduccion'], intensities: ['notable'] },
            isActive: true
          }));
          PRODUCTS.length = 0;
          PRODUCTS.push(...activeLocal);
          renderCatalog();
          return;
        }
      }
    } catch {}
    console.warn('[ALABASTRO] Base de datos no disponible directamente, usando reserva local:', err.message);
  }
}

function renderCatalog() {
  const grid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyCatalogState');
  const resultsCount = document.getElementById('resultsCount');

  if (!grid) return;

  const filtered = filterAndSortProducts();
  updateActiveFilterTags();

  // Contador de resultados
  if (resultsCount) {
    resultsCount.textContent = `Mostrando ${filtered.length} ${filtered.length === 1 ? 'fragancia original' : 'fragancias originales'}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  grid.innerHTML = filtered.map(product => {
    const isFav = STATE.favorites.has(product.id);

    return `
      <article class="product-card" data-id="${product.id}">
        <!-- 1. Espacio exclusivo y 100% limpio para la fotografía del perfume -->
        <div class="card-photo-stage" data-action="quick-view" data-id="${product.id}" title="Clic para ver detalles de ${product.name}">
          <button type="button" class="card-fav-btn ${isFav ? 'is-favorite' : ''}" 
                  data-action="toggle-fav" 
                  data-id="${product.id}" 
                  aria-label="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}"
                  title="${isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="${isFav ? 'currentColor' : 'none'}">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          
          <img src="${product.image}" 
               alt="${product.fullName}" 
               class="card-clean-photo" 
               loading="lazy"
               style="mix-blend-mode: multiply;"
               onerror="this.onerror=null; this.src='/assets/perfumes/lattafa-asad.png';">
        </div>

        <!-- 2. Información comercial ordenada debajo de la fotografía -->
        <div class="card-info-content">
          <!-- 1. Marca -->
          <div class="card-brand-label">${product.brand}</div>

          <!-- 2. Nombre del perfume -->
          <h3 class="card-product-title" data-action="quick-view" data-id="${product.id}" title="${product.name}">
            ${product.name}
          </h3>

          <!-- 3. Tamaño en mililitros -->
          <div class="card-product-size">
            <span class="size-val">${product.size}</span>
            <span class="size-separator">•</span>
            <span class="gender-val">${product.genderDisplay}</span>
          </div>

          <!-- 4. Precio -->
          <div class="card-price-row">
            <span class="price-amount">${formatCOP(product.price)}</span>
            ${product.stock <= 0
              ? '<span class="stock-status-pill out-of-stock" style="color: #e57373;"><span class="stock-dot" style="background:#e57373;"></span> Agotado</span>'
              : (product.stock <= 10
                  ? `<span class="stock-status-pill low-stock" style="color: #ffb74d;"><span class="stock-dot" style="background:#ffb74d;"></span> ¡Últimas ${product.stock} un.!</span>`
                  : '<span class="stock-status-pill"><span class="stock-dot"></span> Disponible</span>')}
          </div>

          <!-- 5. Botones: Agregar al carrito + Ver perfume -->
          <div class="card-actions-wrapper">
            ${product.stock <= 0
              ? `<button type="button" class="btn-card-add-cart disabled" disabled title="Fragancia agotada temporalmente" style="opacity: 0.55; cursor: not-allowed;">
                  <span>Agotado</span>
                </button>`
              : `<button type="button" class="btn-card-add-cart" data-action="add-cart" data-id="${product.id}" title="Agregar al carrito">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                  <span>Agregar al carrito</span>
                </button>`}
            <button type="button" class="btn-card-view-details" data-action="quick-view" data-id="${product.id}" title="Ver información de ${product.name}">
              Ver perfume
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/* ==========================================================================
   6. Gestión del Carrito de Compras
   ========================================================================== */
function addToCart(productId, quantity = 1) {
  // Seguridad: validar productId contra el catálogo real
  if (!SecurityModule.validators.productId(productId)) {
    console.warn('[Seguridad] ID de producto inválido:', productId);
    return;
  }
  const product = getProductById(productId);
  if (!product) return;

  // Validación de disponibilidad de stock
  if (product.stock <= 0) {
    showToast(`«${product.name}» está agotado temporalmente`, '⚠️');
    renderCatalog();
    return;
  }

  // Seguridad: sanitizar y limitar cantidad
  quantity = Math.max(1, Math.min(Math.floor(Number(quantity) || 1), MAX_CART_ITEM_QTY));

  const existing = STATE.cart.find(item => item.id === product.id);
  const currentCartQty = existing ? existing.quantity : 0;

  if (currentCartQty + quantity > product.stock) {
    showToast(`Solo quedan ${product.stock} unidades de «${product.name}» disponibles en inventario`, '⚠️');
    return;
  }

  if (existing) {
    existing.quantity += quantity;
  } else {
    STATE.cart.push({
      id: product.id,
      name: product.name,
      familyDisplay: product.familyDisplay,
      price: product.price,
      size: product.size,
      quantity: quantity
    });
  }

  // Descontar inventario localmente en tiempo real
  product.stock = Math.max(0, product.stock - quantity);

  // Sincronizar descuento de stock inmediatamente con la base de datos (Backend)
  const apiBase = (typeof window !== 'undefined' && window.location && window.location.port === '3000') ? '' : 'http://localhost:3000';
  fetch(`${apiBase}/api/products/${encodeURIComponent(product.id)}/decrement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity })
  }).then(res => res.json()).then(data => {
    if (data.success && data.product && typeof data.product.stock === 'number') {
      product.stock = data.product.stock;
      renderCatalog();
    }
  }).catch(() => {});

  saveCartToStorage();
  updateCartUI();
  renderCatalog();
  showToast(`«${product.name}» añadido a la bolsa`, '🛍️');
}

function updateCartItemQuantity(productId, newQty) {
  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }

  const item = STATE.cart.find(i => i.id === productId);
  const product = getProductById(productId);
  if (!item) return;

  if (product) {
    const diff = newQty - item.quantity;
    if (diff > 0) {
      if (product.stock < diff) {
        showToast(`Solo quedan ${product.stock} unidades disponibles de «${product.name}»`, '⚠️');
        return;
      }
      product.stock -= diff;
      const apiBase = (typeof window !== 'undefined' && window.location && window.location.port === '3000') ? '' : 'http://localhost:3000';
      fetch(`${apiBase}/api/products/${encodeURIComponent(product.id)}/decrement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: diff })
      }).catch(() => {});
    } else if (diff < 0) {
      const restoreQty = Math.abs(diff);
      product.stock += restoreQty;
      const apiBase = (typeof window !== 'undefined' && window.location && window.location.port === '3000') ? '' : 'http://localhost:3000';
      fetch(`${apiBase}/api/products/${encodeURIComponent(product.id)}/increment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: restoreQty })
      }).catch(() => {});
    }
  }

  item.quantity = newQty;
  saveCartToStorage();
  updateCartUI();
  renderCatalog();
}

function removeFromCart(productId) {
  const item = STATE.cart.find(i => i.id === productId);
  const name = item ? item.name : 'Producto';
  const qtyToRestore = item ? item.quantity : 0;
  STATE.cart = STATE.cart.filter(i => i.id !== productId);

  // Reintegrar stock al inventario
  const product = getProductById(productId);
  if (product && qtyToRestore > 0) {
    product.stock += qtyToRestore;
    const apiBase = (typeof window !== 'undefined' && window.location && window.location.port === '3000') ? '' : 'http://localhost:3000';
    fetch(`${apiBase}/api/products/${encodeURIComponent(product.id)}/increment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: qtyToRestore })
    }).catch(() => {});
    renderCatalog();
  }

  saveCartToStorage();
  updateCartUI();
  showToast(`«${name}» eliminado de la bolsa`, '✕');
}

function updateCartUI() {
  const cartCountEl = document.getElementById('cartCount');
  const cartDrawerItemCount = document.getElementById('cartDrawerItemCount');
  const cartItemsList = document.getElementById('cartItemsList');
  const emptyCartView = document.getElementById('emptyCartView');
  const cartDrawerFooter = document.getElementById('cartDrawerFooter');
  const cartSubtotalAmount = document.getElementById('cartSubtotalAmount');
  const progressFill = document.getElementById('progressFill');
  const shippingStatusText = document.getElementById('shippingStatusText');

  const totalItems = STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Insignia contador en header
  if (cartCountEl) {
    cartCountEl.textContent = totalItems;
    cartCountEl.setAttribute('aria-label', `${totalItems} productos en el carrito`);
    cartCountEl.style.transform = 'scale(1.25)';
    setTimeout(() => cartCountEl.style.transform = 'scale(1)', 200);
  }

  if (cartDrawerItemCount) {
    cartDrawerItemCount.textContent = `(${totalItems} ${totalItems === 1 ? 'producto' : 'productos'})`;
  }

  if (cartSubtotalAmount) {
    cartSubtotalAmount.textContent = formatCOP(subtotal);
  }

  // Barra de progreso de envío gratuito
  if (progressFill && shippingStatusText) {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      progressFill.style.width = '100%';
      shippingStatusText.innerHTML = '🎉 <strong>¡Felicidades!</strong> Tu pedido califica para <strong>Envío Nacional Gratuito</strong>';
    } else {
      const percentage = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      progressFill.style.width = `${percentage}%`;
      shippingStatusText.innerHTML = `Agrega <strong>${formatCOP(remaining)}</strong> más para obtener <strong>Envío Gratuito</strong>`;
    }
  }

  // Vistas vacía o con productos
  if (STATE.cart.length === 0) {
    if (emptyCartView) emptyCartView.style.display = 'block';
    if (cartDrawerFooter) cartDrawerFooter.style.display = 'none';
    if (cartItemsList) cartItemsList.innerHTML = '';
    return;
  }

  if (emptyCartView) emptyCartView.style.display = 'none';
  if (cartDrawerFooter) cartDrawerFooter.style.display = 'block';

  // Renderizar ítems del carrito
  if (cartItemsList) {
    cartItemsList.innerHTML = STATE.cart.map(item => {
      const product = PRODUCTS.find(p => p.id === item.id);
      const thumbSvg = product ? createBottleSvg(product, 44, 68) : '';
      const safeName = SecurityModule.sanitizeHTML(item.name);
      const safeSize = SecurityModule.sanitizeHTML(item.size);
      const safeFamily = SecurityModule.sanitizeHTML(item.familyDisplay.split(' ')[0]);

      return `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-thumb">
            ${thumbSvg}
          </div>
          <div class="cart-item-info">
            <span class="cart-item-name">${safeName}</span>
            <span class="cart-item-meta">${safeSize} • ${safeFamily}</span>
            <span class="cart-item-price">${formatCOP(item.price)}</span>
          </div>
          <div class="cart-item-controls">
            <div class="quantity-stepper">
              <button type="button" class="stepper-btn" data-action="cart-minus" data-id="${item.id}" aria-label="Disminuir">-</button>
              <span class="stepper-count">${item.quantity}</span>
              <button type="button" class="stepper-btn" data-action="cart-plus" data-id="${item.id}" aria-label="Aumentar">+</button>
            </div>
            <button type="button" class="remove-item-btn" data-action="cart-remove" data-id="${item.id}">
              Eliminar
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

function openCartDrawer() {
  document.getElementById('cartDrawer')?.classList.add('active');
  document.getElementById('cartOverlay')?.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeCartDrawer() {
  document.getElementById('cartDrawer')?.classList.remove('active');
  document.getElementById('cartOverlay')?.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

/**
 * Genera el pedido formal para WhatsApp
 */
function checkoutViaWhatsApp() {
  if (STATE.cart.length === 0) {
    showToast('Tu bolsa de compra está vacía', '⚠️');
    return;
  }

  const isGift = document.getElementById('giftPackagingCheckbox')?.checked;
  const subtotal = STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingText = subtotal >= FREE_SHIPPING_THRESHOLD ? 'GRATUITO (Promoción nacional)' : 'A coordinar';

  let message = `*SOLICITUD DE PEDIDO — ALABASTRO ALTA PERFUMERÍA*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `¡Hola, equipo de ALABASTRO! Deseo realizar el siguiente pedido:\n\n`;

  STATE.cart.forEach((item, idx) => {
    message += `${idx + 1}. *${item.name}* (x${item.quantity})\n`;
    message += `   • Tamaño: ${item.size}\n`;
    message += `   • Valor: ${formatCOP(item.price * item.quantity)}\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `*Subtotal:* ${formatCOP(subtotal)}\n`;
  message += `*Envío:* ${shippingText}\n`;
  message += `*Empaque de regalo:* ${isGift ? 'Sí, por favor (incluir tarjeta)' : 'No necesario'}\n`;
  message += `*Muestras de cortesía:* 3 muestras exclusivas incluidas\n\n`;
  message += `Por favor indíquenme las opciones de pago (PSE / Transferencia) y datos de entrega. ¡Gracias!`;

  const encoded = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/573112549053?text=${encoded}`;

  // Seguridad: noopener y noreferrer previene Reverse Tabnabbing
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  showToast('Redirigiendo a WhatsApp con tu pedido...', '💬');
}

/* ==========================================================================
   7. Gestión de Lista de Deseos / Favoritos
   ========================================================================== */
function toggleFavorite(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  if (STATE.favorites.has(productId)) {
    STATE.favorites.delete(productId);
    showToast(`«${product.name}» retirado de tus favoritos`, '♡');
  } else {
    STATE.favorites.add(productId);
    showToast(`«${product.name}» guardado en tus favoritos`, '❤️');
  }

  saveFavoritesToStorage();
  updateFavoritesUI();
  renderCatalog();

  // Si el modal está abierto para este producto, sincronizar el botón de favorito
  if (STATE.activeModalProduct && STATE.activeModalProduct.id === productId) {
    const modalFavBtn = document.getElementById('modalToggleFavBtn');
    if (modalFavBtn) {
      modalFavBtn.classList.toggle('is-favorite', STATE.favorites.has(productId));
    }
  }
}

function updateFavoritesUI() {
  const countBadge = document.getElementById('favoritesCount');
  const drawerCount = document.getElementById('favoritesDrawerCount');
  const favList = document.getElementById('favoritesList');
  const emptyView = document.getElementById('emptyFavoritesView');

  const count = STATE.favorites.size;
  if (countBadge) {
    countBadge.textContent = count;
    countBadge.setAttribute('aria-label', `${count} productos guardados en favoritos`);
  }
  if (drawerCount) {
    drawerCount.textContent = `(${count})`;
  }

  if (count === 0) {
    if (emptyView) emptyView.style.display = 'block';
    if (favList) favList.innerHTML = '';
    return;
  }

  if (emptyView) emptyView.style.display = 'none';

  if (favList) {
    const favProducts = PRODUCTS.filter(p => STATE.favorites.has(p.id));
    favList.innerHTML = favProducts.map(p => {
      const thumbSvg = createBottleSvg(p, 44, 68);

      return `
        <div class="cart-item" data-id="${p.id}">
          <div class="cart-item-thumb">
            ${thumbSvg}
          </div>
          <div class="cart-item-info">
            <span class="cart-item-name">${p.name}</span>
            <span class="cart-item-meta">${p.familyDisplay}</span>
            <span class="cart-item-price">${formatCOP(p.price)}</span>
          </div>
          <div class="cart-item-controls">
            <button type="button" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.75rem;" data-action="fav-add-cart" data-id="${p.id}">
              + Bolsa
            </button>
            <button type="button" class="remove-item-btn" data-action="fav-remove" data-id="${p.id}">
              Quitar
            </button>
          </div>
        </div>
      `;
    }).join('');
  }
}

function openFavoritesDrawer() {
  document.getElementById('favoritesDrawer')?.classList.add('active');
  document.getElementById('favoritesOverlay')?.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeFavoritesDrawer() {
  document.getElementById('favoritesDrawer')?.classList.remove('active');
  document.getElementById('favoritesOverlay')?.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

/* ==========================================================================
   8. Modal de Detalle de Fragancia
   ========================================================================== */
function openProductModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  STATE.activeModalProduct = product;
  STATE.modalQuantity = 1;

  // Llenar datos
  const modalBottleVisual = document.getElementById('modalBottleVisual');
  const modalFamilyBadge = document.getElementById('modalFamilyBadge');
  const modalProductTitle = document.getElementById('modalProductTitle');
  const modalConcentration = document.getElementById('modalConcentration');
  const modalSize = document.getElementById('modalSize');
  const modalPrice = document.getElementById('modalPrice');
  const modalDescription = document.getElementById('modalDescription');
  const modalTopNotes = document.getElementById('modalTopNotes');
  const modalHeartNotes = document.getElementById('modalHeartNotes');
  const modalBaseNotes = document.getElementById('modalBaseNotes');
  const modalLongevity = document.getElementById('modalLongevity');
  const modalSillage = document.getElementById('modalSillage');
  const modalBestFor = document.getElementById('modalBestFor');
  const modalQtyCount = document.getElementById('modalQtyCount');
  const modalToggleFavBtn = document.getElementById('modalToggleFavBtn');

  if (modalBottleVisual) {
    modalBottleVisual.innerHTML = `
      <img src="${product.image}" 
           alt="${product.fullName}" 
           class="modal-product-img" 
           style="mix-blend-mode: multiply;"
           onerror="this.onerror=null; this.outerHTML=createBottleSvg(product, 180, 290);">
    `;
  }

  if (modalFamilyBadge) modalFamilyBadge.textContent = product.familyDisplay;
  if (modalProductTitle) modalProductTitle.textContent = product.name;
  if (modalConcentration) modalConcentration.textContent = product.concentration;
  if (modalSize) modalSize.textContent = product.size;
  if (modalPrice) modalPrice.textContent = formatCOP(product.price);
  if (modalDescription) modalDescription.textContent = product.description;
  if (modalTopNotes) modalTopNotes.textContent = product.topNotes.join(', ');
  if (modalHeartNotes) modalHeartNotes.textContent = product.heartNotes.join(', ');
  if (modalBaseNotes) modalBaseNotes.textContent = product.baseNotes.join(', ');
  if (modalLongevity) modalLongevity.textContent = product.longevity;
  if (modalSillage) modalSillage.textContent = product.sillage;
  if (modalBestFor) modalBestFor.textContent = product.bestFor;
  if (modalQtyCount) modalQtyCount.textContent = '1';

  if (modalToggleFavBtn) {
    modalToggleFavBtn.classList.toggle('is-favorite', STATE.favorites.has(product.id));
  }

  // Abrir modal
  document.getElementById('productModalBackdrop')?.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeProductModal() {
  document.getElementById('productModalBackdrop')?.classList.remove('active');
  document.body.classList.remove('no-scroll');
  STATE.activeModalProduct = null;
}

/* ==========================================================================
   9. Recomendador Interactivo de Aromas (Fragrance Finder Quiz)
   ========================================================================== */
function setupQuiz() {
  const optionButtons = document.querySelectorAll('.quiz-option-btn');
  optionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.dataset.step, 10);
      const val = btn.dataset.value;

      if (step === 1) {
        STATE.quizAnswers.occasion = val;
        advanceQuizStep(2);
      } else if (step === 2) {
        STATE.quizAnswers.sensation = val;
        advanceQuizStep(3);
      } else if (step === 3) {
        STATE.quizAnswers.intensity = val;
        calculateAndDisplayQuizResult();
      }
    });
  });

  document.getElementById('restartFinderBtn')?.addEventListener('click', () => {
    resetQuiz();
  });
}

function advanceQuizStep(nextStep) {
  STATE.currentQuizStep = nextStep;

  // Actualizar indicadores numéricos
  for (let i = 1; i <= 3; i++) {
    const indicator = document.getElementById(`stepIndicator${i}`);
    if (indicator) {
      indicator.classList.remove('active', 'completed');
      if (i === nextStep) {
        indicator.classList.add('active');
      } else if (i < nextStep) {
        indicator.classList.add('completed');
      }
    }
  }

  // Cambiar vistas de pasos
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step${nextStep}`)?.classList.add('active');
}

function findBestFragranceMatch(answers) {
  const { occasion, sensation, intensity } = answers || STATE.quizAnswers;

  let bestMatch = PRODUCTS[0];
  let highestScore = -1;

  PRODUCTS.forEach(p => {
    let score = 0;
    if (p.quizTags && p.quizTags.occasions && p.quizTags.occasions.includes(occasion)) score += 3;
    if (p.quizTags && p.quizTags.sensations && p.quizTags.sensations.includes(sensation)) score += 4;
    if (p.quizTags && p.quizTags.intensities && p.quizTags.intensities.includes(intensity)) score += 2;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = p;
    }
  });

  return { bestMatch, highestScore };
}

function calculateAndDisplayQuizResult() {
  // Puntuación según coincidencia con las respuestas
  const { bestMatch } = findBestFragranceMatch(STATE.quizAnswers);

  // Ocultar preguntas y mostrar resultado
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
  const resultCard = document.getElementById('finderResult');

  if (resultCard) {
    document.getElementById('resultBottleDisplay').innerHTML = `
      <img src="${bestMatch.image}" 
           alt="${bestMatch.fullName}" 
           class="modal-product-img" 
           style="max-width: 170px; max-height: 220px; object-fit: contain; filter: drop-shadow(0 10px 24px rgba(0,0,0,0.4));"
           onerror="this.onerror=null; this.outerHTML=createBottleSvg(bestMatch, 140, 220);">
    `;
    document.getElementById('resultFamilyTag').textContent = bestMatch.familyDisplay;
    document.getElementById('resultPerfumeName').textContent = bestMatch.name;
    document.getElementById('resultPerfumePrice').textContent = formatCOP(bestMatch.price);
    document.getElementById('resultPerfumeDesc').textContent = bestMatch.description;

    const notesWrap = document.getElementById('resultNotesList');
    if (notesWrap) {
      notesWrap.innerHTML = `
        <span class="note-chip">${bestMatch.topNotes[0]}</span>
        <span class="note-chip">${bestMatch.heartNotes[0]}</span>
        <span class="note-chip">${bestMatch.baseNotes[0]}</span>
      `;
    }

    // Configurar botones del resultado
    const addBtn = document.getElementById('resultAddToCartBtn');
    if (addBtn) {
      addBtn.onclick = () => {
        addToCart(bestMatch.id, 1);
        openCartDrawer();
      };
    }

    const detailsBtn = document.getElementById('resultViewDetailsBtn');
    if (detailsBtn) {
      detailsBtn.onclick = () => {
        openProductModal(bestMatch.id);
      };
    }

    resultCard.style.display = 'block';
  }
}

function resetQuiz() {
  STATE.quizAnswers = { occasion: null, sensation: null, intensity: null };
  document.getElementById('finderResult').style.display = 'none';
  advanceQuizStep(1);
}

/* ==========================================================================
   10. Formulario de Suscripción VIP (Newsletter) — con Seguridad Reforzada
   ========================================================================== */
function setupNewsletter() {
  const form = document.getElementById('newsletterForm');
  const input = document.getElementById('newsletterEmail');
  const feedback = document.getElementById('newsletterFeedback');
  const honeypot = document.getElementById('newsHoneypot');
  let lastSubmitTime = 0;

  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Seguridad 1: Verificar honeypot anti-bot
    if (honeypot && honeypot.value.trim() !== '') {
      console.warn('[Seguridad] Intento de bot detectado vía honeypot.');
      // Simular éxito para no revelar la detección
      feedback.textContent = '✨ ¡Gracias por suscribirte!';
      feedback.className = 'newsletter-feedback success';
      feedback.style.display = 'block';
      input.value = '';
      return;
    }

    // Seguridad 2: Rate limiting (mín. 3 segundos entre envíos)
    const now = Date.now();
    if (now - lastSubmitTime < 3000) {
      feedback.textContent = 'Por favor espera unos segundos antes de intentar nuevamente.';
      feedback.className = 'newsletter-feedback error';
      feedback.style.display = 'block';
      return;
    }
    lastSubmitTime = now;

    const email = input.value.trim();

    // Seguridad 3: Validación robusta de email
    if (!SecurityModule.validators.email(email)) {
      feedback.textContent = 'Por favor ingresa un correo electrónico válido.';
      feedback.className = 'newsletter-feedback error';
      feedback.style.display = 'block';
      return;
    }

    // Seguridad 4: Sanitizar email antes de mostrar (usar textContent, no innerHTML)
    const sanitizedEmail = SecurityModule.sanitizeHTML(email);
    feedback.textContent = `✨ ¡Bienvenido al Círculo Privado! Hemos enviado a ${sanitizedEmail} tu código de bienvenida: ALABASTRO10 (10% de cortesía).`;
    feedback.className = 'newsletter-feedback success';
    feedback.style.display = 'block';
    input.value = '';

    showToast('¡Suscripción exitosa! Cupón: ALABASTRO10', '💎');
  });
}

/* ==========================================================================
   10.5 Gestión de Autenticación y Registro de Clientes — con Seguridad Reforzada
   ========================================================================== */

/**
 * Inicializar usuarios de demostración con contraseñas hasheadas.
 * Se ejecuta de forma asíncrona al arrancar la app.
 */
async function initDefaultUsers() {
  try {
    const adminHash = await SecurityModule.hashPassword('AdminAlabastro2026!');
    const raw = localStorage.getItem(STORAGE_KEYS.users);
    if (raw) {
      const users = SecurityModule.safeJSONParse(raw);
      if (Array.isArray(users)) {
        let needsSave = false;
        for (const u of users) {
          if (u.password && !u.passwordHash) {
            u.passwordHash = await SecurityModule.hashPassword(u.password);
            delete u.password;
            needsSave = true;
          }
          if (u.email && u.email.toLowerCase() === 'admin@alabastro.com' && u.role !== 'admin') {
            u.role = 'admin';
            needsSave = true;
          }
        }
        if (!users.some(u => u.email && u.email.toLowerCase() === 'admin@alabastro.com')) {
          users.unshift({
            id: 'usr-admin-master-001',
            name: 'Director Alabastro',
            email: 'admin@alabastro.com',
            phone: '+57 311 254 9053',
            role: 'admin',
            passwordHash: adminHash,
            createdAt: new Date().toISOString()
          });
          needsSave = true;
        }
        if (needsSave) {
          saveRegisteredUsers(users);
        }
      }
      return;
    }

    const hashedPass = await SecurityModule.hashPassword('password123');
    const defaultUsers = [
      {
        id: 'usr-admin-master-001',
        name: 'Director Alabastro',
        email: 'admin@alabastro.com',
        phone: '+57 311 254 9053',
        role: 'admin',
        passwordHash: adminHash,
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-1',
        name: 'Santiago Zapata',
        email: 'santiago@alabastro.co',
        phone: '311 254 9053',
        role: 'customer',
        passwordHash: hashedPass,
        createdAt: new Date().toISOString()
      }
    ];
    saveRegisteredUsers(defaultUsers);
  } catch (e) {
    console.warn('[Seguridad] Error inicializando usuarios:', e);
  }
}

function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.users);
    if (raw) {
      const parsed = SecurityModule.safeJSONParse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('[Seguridad] Error leyendo usuarios:', e);
  }
  return [];
}

function saveRegisteredUsers(users) {
  try {
    const safeUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role || (u.email && u.email.toLowerCase() === 'admin@alabastro.com' ? 'admin' : 'customer'),
      passwordHash: u.passwordHash || '',
      createdAt: u.createdAt || ''
    }));
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(safeUsers));
  } catch (e) {
    console.warn('[Seguridad] Error guardando usuarios:', e);
  }
}

function openAuthModal() {
  const backdrop = document.getElementById('authModalBackdrop');
  const guestView = document.getElementById('authGuestView');
  const profileView = document.getElementById('authProfileView');

  if (STATE.currentUser) {
    if (guestView) guestView.style.display = 'none';
    if (profileView) profileView.style.display = 'block';
  } else {
    if (guestView) guestView.style.display = 'block';
    if (profileView) profileView.style.display = 'none';
    switchAuthTab('login');
  }

  backdrop?.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeAuthModal() {
  document.getElementById('authModalBackdrop')?.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

function switchAuthTab(tab) {
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (tab === 'login') {
    tabLoginBtn?.classList.add('active');
    tabLoginBtn?.setAttribute('aria-selected', 'true');
    tabRegisterBtn?.classList.remove('active');
    tabRegisterBtn?.setAttribute('aria-selected', 'false');
    if (loginForm) loginForm.style.display = 'flex';
    if (registerForm) registerForm.style.display = 'none';
  } else {
    tabRegisterBtn?.classList.add('active');
    tabRegisterBtn?.setAttribute('aria-selected', 'true');
    tabLoginBtn?.classList.remove('active');
    tabLoginBtn?.setAttribute('aria-selected', 'false');
    if (registerForm) registerForm.style.display = 'flex';
    if (loginForm) loginForm.style.display = 'none';
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();

  // Seguridad 0: Honeypot Anti-Bot invisible
  const honeypot = document.getElementById('loginHoneypot');
  if (honeypot && honeypot.value.trim() !== '') {
    console.warn('[Seguridad] Intento de bot bloqueado en Login vía Honeypot.');
    showToast('Credenciales incorrectas. Por favor verifica tus datos.', '⚠️');
    return;
  }

  // Seguridad 1: Rate limiting anti fuerza bruta
  const rateCheck = SecurityModule.rateLimiter.canAttempt();
  if (!rateCheck.allowed) {
    showToast(rateCheck.message, '🔒');
    return;
  }

  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const rememberMe = document.getElementById('rememberMe')?.checked;

  const email = emailInput?.value.trim().toLowerCase();
  const pass = passInput?.value;

  // Seguridad 2: Validación de inputs
  if (!SecurityModule.validators.email(email)) {
    showToast('Por favor ingresa un correo electrónico válido.', '⚠️');
    return;
  }

  // Seguridad 3: Hash de la contraseña para comparar
  const passHash = await SecurityModule.hashPassword(pass);

  const users = getRegisteredUsers();
  const user = users.find(u => u.email.toLowerCase() === email && u.passwordHash === passHash);

  if (user) {
    SecurityModule.rateLimiter.reset(); // Reset al lograr login exitoso

    // Seguridad 4: No almacenar el hash de contraseña en el estado de sesión
    const role = user.role || (user.email.toLowerCase() === 'admin@alabastro.com' ? 'admin' : 'customer');
    const safeUserData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role,
      createdAt: user.createdAt || ''
    };
    if (role === 'admin') {
      localStorage.setItem('alabastro_admin_token', 'local-admin-token-alabastro-2026');
    }
    STATE.currentUser = safeUserData;
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(safeUserData));
    } else {
      sessionStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(safeUserData));
    }
    updateAuthUI();
    closeAuthModal();
    const safeName = SecurityModule.sanitizeHTML(user.name.split(' ')[0]);
    showToast(`¡Bienvenido/a de nuevo, ${safeName}!`, '✨');
    document.getElementById('loginForm')?.reset();
  } else {
    SecurityModule.rateLimiter.recordAttempt();
    // Seguridad 5: Mensaje genérico (no revelar si el email existe o no)
    showToast('Credenciales incorrectas. Por favor verifica tus datos.', '⚠️');
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();

  // Seguridad 0: Honeypot Anti-Bot invisible
  const honeypot = document.getElementById('registerHoneypot');
  if (honeypot && honeypot.value.trim() !== '') {
    console.warn('[Seguridad] Intento de bot bloqueado en Registro vía Honeypot.');
    return;
  }

  // Seguridad 0.5: Verificación de consentimiento y tratamiento de datos
  const termsCheckbox = document.getElementById('regTerms');
  if (termsCheckbox && !termsCheckbox.checked) {
    showToast('Debes aceptar la política de privacidad y tratamiento seguro de tus datos.', '⚠️');
    return;
  }

  const name = document.getElementById('regName')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim().toLowerCase();
  const phone = document.getElementById('regPhone')?.value.trim() || '';
  const pass = document.getElementById('regPassword')?.value;
  const passConfirm = document.getElementById('regPasswordConfirm')?.value;

  // Seguridad 1: Validación robusta de nombre
  if (!name || !SecurityModule.validators.name(name)) {
    showToast('Por favor ingresa un nombre válido (solo letras, sin caracteres especiales).', '⚠️');
    return;
  }

  // Seguridad 2: Validación robusta de email
  if (!SecurityModule.validators.email(email)) {
    showToast('Por favor ingresa un correo electrónico válido.', '⚠️');
    return;
  }

  // Seguridad 3: Validación de teléfono
  if (!SecurityModule.validators.phone(phone)) {
    showToast('El número de teléfono contiene caracteres no válidos.', '⚠️');
    return;
  }

  // Seguridad 4: Validación robusta de contraseña
  const passCheck = SecurityModule.validators.password(pass);
  if (!passCheck.valid) {
    showToast(passCheck.message, '⚠️');
    return;
  }

  if (pass !== passConfirm) {
    showToast('Las contraseñas no coinciden.', '⚠️');
    return;
  }

  const users = getRegisteredUsers();
  const existing = users.find(u => u.email.toLowerCase() === email);
  if (existing) {
    showToast('Ya existe una cuenta registrada con este correo electrónico.', '⚠️');
    return;
  }

  // Seguridad 5: Hash de contraseña con SHA-256
  const passwordHash = await SecurityModule.hashPassword(pass);

  const newUser = {
    id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8),
    name: SecurityModule.sanitizeHTML(name),
    email,
    phone,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  // Iniciar sesión automáticamente (sin almacenar hash en sesión)
  const safeUserData = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    createdAt: newUser.createdAt
  };
  STATE.currentUser = safeUserData;
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(safeUserData));

  updateAuthUI();
  closeAuthModal();
  const safeName = SecurityModule.sanitizeHTML(name.split(' ')[0]);
  showToast(`¡Cuenta creada con éxito! Bienvenido al Círculo Privado, ${safeName}`, '👑');
  document.getElementById('registerForm')?.reset();
}

function handleLogout() {
  STATE.currentUser = null;
  localStorage.removeItem(STORAGE_KEYS.currentUser);
  sessionStorage.removeItem(STORAGE_KEYS.currentUser);
  updateAuthUI();
  closeAuthModal();
  showToast('Has cerrado sesión correctamente.', '👋');
}

function updateAuthUI() {
  const dot = document.getElementById('userLoggedDot');
  const authBtn = document.getElementById('authBtn');

  if (STATE.currentUser) {
    if (dot) dot.style.display = 'block';
    if (authBtn) {
      authBtn.title = `Mi Perfil: ${STATE.currentUser.name}`;
      authBtn.setAttribute('aria-label', `Perfil de ${STATE.currentUser.name}`);
    }

    const pAvatar = document.getElementById('profileAvatar');
    const pName = document.getElementById('profileName');
    const pEmail = document.getElementById('profileEmail');
    const pPhone = document.getElementById('profilePhoneDisplay');

    if (pAvatar) pAvatar.textContent = STATE.currentUser.name.trim().charAt(0).toUpperCase();
    if (pName) pName.textContent = STATE.currentUser.name;
    if (pEmail) pEmail.textContent = STATE.currentUser.email;
    if (pPhone) pPhone.textContent = STATE.currentUser.phone || '+57 311 254 9053';

    const btnConsola = document.getElementById('btnGoToConsola');
    if (btnConsola) {
      btnConsola.style.display = (STATE.currentUser.role === 'admin') ? 'block' : 'none';
    }
  } else {
    const btnConsola = document.getElementById('btnGoToConsola');
    if (btnConsola) btnConsola.style.display = 'none';
    if (dot) dot.style.display = 'none';
    if (authBtn) {
      authBtn.title = 'Mi Cuenta / Iniciar Sesión';
      authBtn.setAttribute('aria-label', 'Iniciar sesión o registrarse');
    }
  }
}

/* ==========================================================================
   11. Event Listeners y Delegación de Eventos
   ========================================================================== */
function setupEventListeners() {
  // 1. Delegación de clics en el catálogo de productos
  const productsGrid = document.getElementById('productsGrid');
  if (productsGrid) {
    productsGrid.addEventListener('click', (e) => {
      const target = e.target;

      // Botón Añadir al carrito
      const addBtn = target.closest('[data-action="add-cart"]');
      if (addBtn) {
        const id = addBtn.dataset.id;
        addToCart(id, 1);
        return;
      }

      // Botón Favorito
      const favBtn = target.closest('[data-action="toggle-fav"]');
      if (favBtn) {
        const id = favBtn.dataset.id;
        toggleFavorite(id);
        return;
      }

      // Botón Vista Rápida o clic en la tarjeta
      const quickViewBtn = target.closest('[data-action="quick-view"]');
      if (quickViewBtn) {
        const id = quickViewBtn.dataset.id;
        openProductModal(id);
        return;
      }

      // Abrir modal si se hace clic en la imagen de la tarjeta
      const cardVisual = target.closest('.card-photo-stage') || target.closest('.card-visual-wrap');
      if (cardVisual && !target.closest('button')) {
        const card = target.closest('.product-card');
        if (card) openProductModal(card.dataset.id);
      }
    });
  }

  // 2. Filtros por Género (Todos, Hombre, Mujer, Unisex)
  const genderButtons = document.querySelectorAll('.gender-filter-btn');
  genderButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      genderButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      STATE.filters.gender = btn.dataset.gender || 'all';
      renderCatalog();
    });
  });

  // 2.1. Filtros por Familia Olfativa
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      STATE.filters.family = btn.dataset.family;
      renderCatalog();
    });
  });

  // 2.2. Filtro por Marca (Lattafa, Afnan, Armaf, etc.)
  const brandSelect = document.getElementById('brandSelect');
  if (brandSelect) {
    brandSelect.addEventListener('change', () => {
      STATE.filters.brand = brandSelect.value;
      renderCatalog();
    });
  }

  // 3. Enlaces del pie de página que filtran el catálogo
  document.querySelectorAll('a[data-filter]').forEach(link => {
    link.addEventListener('click', (e) => {
      const fam = link.dataset.filter;
      const matchingBtn = document.querySelector(`.filter-btn[data-family="${fam}"]`);
      if (matchingBtn) {
        matchingBtn.click();
      }
    });
  });

  // 4. Búsqueda con debounce
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  if (searchInput) {
    let timeoutId;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeoutId);
      const val = searchInput.value;

      if (clearSearchBtn) {
        clearSearchBtn.style.display = val.length > 0 ? 'block' : 'none';
      }

      timeoutId = setTimeout(() => {
        STATE.filters.search = val;
        renderCatalog();
      }, 200);
    });

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        STATE.filters.search = '';
        clearSearchBtn.style.display = 'none';
        renderCatalog();
        searchInput.focus();
      });
    }
  }

  // 5. Botón restablecer filtros en estado vacío
  document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    STATE.filters.search = '';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';

    if (brandSelect) brandSelect.value = 'all';
    STATE.filters.brand = 'all';

    const allGenderBtn = document.querySelector('.gender-filter-btn[data-gender="all"]');
    if (allGenderBtn) allGenderBtn.click();

    const allBtn = document.querySelector('.filter-btn[data-family="all"]');
    if (allBtn) allBtn.click();
  });

  // 6. Ordenamiento
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      STATE.filters.sort = sortSelect.value;
      renderCatalog();
    });
  }

  // 7. Botones de Apertura y Cierre del Carrito
  document.getElementById('cartBtn')?.addEventListener('click', openCartDrawer);
  document.getElementById('footerCartLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    openCartDrawer();
  });
  document.getElementById('closeCartBtn')?.addEventListener('click', closeCartDrawer);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCartDrawer);
  document.getElementById('continueShoppingBtn')?.addEventListener('click', () => {
    closeCartDrawer();
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  });

  // 8. Controles internos del Carrito (steppers y eliminar)
  const cartItemsList = document.getElementById('cartItemsList');
  if (cartItemsList) {
    cartItemsList.addEventListener('click', (e) => {
      const plusBtn = e.target.closest('[data-action="cart-plus"]');
      const minusBtn = e.target.closest('[data-action="cart-minus"]');
      const removeBtn = e.target.closest('[data-action="cart-remove"]');

      if (plusBtn) {
        const id = plusBtn.dataset.id;
        const current = STATE.cart.find(i => i.id === id);
        if (current) updateCartItemQuantity(id, current.quantity + 1);
      } else if (minusBtn) {
        const id = minusBtn.dataset.id;
        const current = STATE.cart.find(i => i.id === id);
        if (current) updateCartItemQuantity(id, current.quantity - 1);
      } else if (removeBtn) {
        const id = removeBtn.dataset.id;
        removeFromCart(id);
      }
    });
  }

  // 9. Checkout WhatsApp y Simulación
  document.getElementById('checkoutWhatsappBtn')?.addEventListener('click', checkoutViaWhatsApp);
  document.getElementById('checkoutSimulateBtn')?.addEventListener('click', async () => {
    if (STATE.cart.length === 0) return;
    const subtotal = STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const giftCheckbox = document.getElementById('giftPackagingCheckbox')?.checked;

    if (window.location.protocol.startsWith('http')) {
      try {
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: STATE.currentUser ? STATE.currentUser.name : 'Cliente Alabastro',
            customerEmail: STATE.currentUser ? STATE.currentUser.email : 'cliente.web@alabastro.com',
            customerPhone: STATE.currentUser ? (STATE.currentUser.phone || '+57 311 254 9053') : '+57 311 254 9053',
            shippingAddress: 'Carrera 7 # 116-50',
            city: 'Bogotá D.C.',
            paymentMethod: 'Tarjeta de Crédito / PSE',
            giftPackaging: giftCheckbox,
            items: STATE.cart.map(i => ({ id: i.id, quantity: i.quantity }))
          })
        }).catch(() => {});
      } catch {}
    }

    showToast(`Demostración: Orden por ${formatCOP(subtotal)} registrada con éxito`, '✨');
    setTimeout(() => {
      STATE.cart = [];
      saveCartToStorage();
      updateCartUI();
      closeCartDrawer();
    }, 1400);
  });

  // 10. Botones de Favoritos
  document.getElementById('favoritesBtn')?.addEventListener('click', openFavoritesDrawer);
  document.getElementById('footerFavLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    openFavoritesDrawer();
  });
  document.getElementById('closeFavoritesBtn')?.addEventListener('click', closeFavoritesDrawer);
  document.getElementById('favoritesOverlay')?.addEventListener('click', closeFavoritesDrawer);

  const favList = document.getElementById('favoritesList');
  if (favList) {
    favList.addEventListener('click', (e) => {
      const addCart = e.target.closest('[data-action="fav-add-cart"]');
      const removeFav = e.target.closest('[data-action="fav-remove"]');

      if (addCart) {
        addToCart(addCart.dataset.id, 1);
        openCartDrawer();
      } else if (removeFav) {
        toggleFavorite(removeFav.dataset.id);
      }
    });
  }

  // 11. Modal de Detalle
  document.getElementById('closeProductModalBtn')?.addEventListener('click', closeProductModal);
  document.getElementById('productModalBackdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'productModalBackdrop') {
      closeProductModal();
    }
  });

  // Stepper dentro del Modal
  const modalQtyCount = document.getElementById('modalQtyCount');
  document.getElementById('modalQtyMinus')?.addEventListener('click', () => {
    if (STATE.modalQuantity > 1) {
      STATE.modalQuantity--;
      if (modalQtyCount) modalQtyCount.textContent = STATE.modalQuantity;
    }
  });

  document.getElementById('modalQtyPlus')?.addEventListener('click', () => {
    STATE.modalQuantity++;
    if (modalQtyCount) modalQtyCount.textContent = STATE.modalQuantity;
  });

  document.getElementById('modalAddToCartBtn')?.addEventListener('click', () => {
    if (STATE.activeModalProduct) {
      addToCart(STATE.activeModalProduct.id, STATE.modalQuantity);
      closeProductModal();
      openCartDrawer();
    }
  });

  document.getElementById('modalToggleFavBtn')?.addEventListener('click', () => {
    if (STATE.activeModalProduct) {
      toggleFavorite(STATE.activeModalProduct.id);
    }
  });

  // 12. Menú móvil
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');
  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mainNav.classList.toggle('active');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Cerrar menú al hacer click en cualquier link
    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Cerrar menú si el usuario toca fuera de él en móviles
    document.addEventListener('click', (e) => {
      if (mainNav.classList.contains('active')) {
        if (!mainNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
          mainNav.classList.remove('active');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Cerrar menú automáticamente al redimensionar a desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && mainNav.classList.contains('active')) {
        mainNav.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 13. Botón de búsqueda rápida en el header
  document.getElementById('searchToggleBtn')?.addEventListener('click', () => {
    const catalogSection = document.getElementById('catalogo');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        searchInput?.focus();
      }, 400);
    }
  });

  // 13.b Enlaces Inteligentes a la Consola de Administración
  async function navigateToAdminConsole(e) {
    e.preventDefault();
    if ((window.location.protocol === 'http:' || window.location.protocol === 'https:') && window.location.port === '3000') {
      window.location.href = '/consola/';
      return;
    }
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 500);
      const res = await fetch('http://localhost:3000/api/health', { signal: ctrl.signal });
      clearTimeout(timer);
      if (res.ok) {
        window.location.href = 'http://localhost:3000/consola/';
        return;
      }
    } catch {}
    window.location.href = 'consola/index.html';
  }
  document.getElementById('headerAdminConsoleBtn')?.addEventListener('click', navigateToAdminConsole);
  document.getElementById('navAdminConsoleLink')?.addEventListener('click', navigateToAdminConsole);
  document.getElementById('btnGoToConsola')?.addEventListener('click', navigateToAdminConsole);
  document.getElementById('footerAdminConsoleLink')?.addEventListener('click', navigateToAdminConsole);
  document.getElementById('footerAdminConsoleItem')?.addEventListener('click', navigateToAdminConsole);
  document.querySelector('#footerAdminConsoleItem a')?.addEventListener('click', navigateToAdminConsole);

  // 14. Autenticación y Registro de Clientes
  document.getElementById('authBtn')?.addEventListener('click', openAuthModal);
  document.getElementById('closeAuthModalBtn')?.addEventListener('click', closeAuthModal);
  document.getElementById('authModalBackdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'authModalBackdrop') closeAuthModal();
  });

  document.getElementById('tabLoginBtn')?.addEventListener('click', () => switchAuthTab('login'));
  document.getElementById('tabRegisterBtn')?.addEventListener('click', () => switchAuthTab('register'));
  document.getElementById('switchToRegister')?.addEventListener('click', () => switchAuthTab('register'));
  document.getElementById('switchToLogin')?.addEventListener('click', () => switchAuthTab('login'));

  document.getElementById('loginForm')?.addEventListener('submit', handleLoginSubmit);
  document.getElementById('registerForm')?.addEventListener('submit', handleRegisterSubmit);
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

  document.getElementById('profileViewFavsBtn')?.addEventListener('click', () => {
    closeAuthModal();
    openFavoritesDrawer();
  });

  document.getElementById('profileGoShoppingBtn')?.addEventListener('click', () => {
    closeAuthModal();
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('forgotPassLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Para restablecer tu contraseña, contáctanos vía WhatsApp o correo.', '🔑');
  });

  // 15. Cerrar con tecla Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeAuthModal();
      closeCartDrawer();
      closeFavoritesDrawer();
      mainNav?.classList.remove('active');
    }
  });

  // 16. Efecto de cabecera translúcida al hacer scroll
  const siteHeader = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  }, { passive: true });
}

/**
 * Monitor de inactividad de sesión (Auto-logout de seguridad).
 * Cierra automáticamente la sesión tras 25 minutos de inactividad del usuario.
 */
function setupInactivityWatcher() {
  let inactivityTimer;
  const INACTIVITY_LIMIT_MS = 25 * 60 * 1000; // 25 minutos

  function resetTimer() {
    clearTimeout(inactivityTimer);
    if (STATE.currentUser) {
      inactivityTimer = setTimeout(() => {
        if (STATE.currentUser) {
          console.warn('[Seguridad] Sesión cerrada automáticamente por inactividad.');
          handleLogout();
          showToast('Tu sesión ha finalizado por inactividad para proteger tu privacidad.', '🔒');
        }
      }, INACTIVITY_LIMIT_MS);
    }
  }

  ['click', 'mousemove', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
    window.addEventListener(evt, resetTimer, { passive: true });
  });
  resetTimer();
}

/* ==========================================================================
   12. Inicialización de la Aplicación
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar módulo de seguridad y usuarios con hashing
  await initDefaultUsers();

  loadStateFromStorage();
  await loadProductsFromBackend();
  renderCatalog();
  updateCartUI();
  updateFavoritesUI();
  updateAuthUI();
  setupQuiz();
  setupNewsletter();
  setupEventListeners();
  setupInactivityWatcher();

  // Seguridad: Advertencia contra ataques Self-XSS para usuarios que abren la consola
  console.log('%c¡ALTO! / STOP!', 'color: #D32F2F; font-size: 28px; font-weight: bold; background: #FFF; padding: 4px 8px; border-radius: 4px;');
  console.log('%cEsta consola está destinada exclusivamente a desarrolladores. Si alguien te indicó que copiaras o pegaras código aquí para obtener "descuentos" o "créditos", se trata de un fraude (Self-XSS) y podrían tomar control de tu cuenta.', 'font-size: 13px; color: #555; font-weight: 500;');

  // Seguridad: Detectar herramientas de desarrollo abiertas (anti-tampering)
  const devToolsWarningShown = { shown: false };
  const devToolsChecker = setInterval(() => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    if ((widthThreshold || heightThreshold) && !devToolsWarningShown.shown) {
      console.log('%c🔒 ALABASTRO SEGURIDAD', 'color:#E8D5B5;font-size:18px;font-weight:bold;background:#141210;padding:10px 20px;border-radius:6px;');
      console.log('%cLa aplicación está operando en modo protegido. Cualquier intento de alteración de precios o estado será rechazado.', 'color:#C5A059;font-size:13px;');
      devToolsWarningShown.shown = true;
    }
  }, 2500);

  // Seguridad: Protección contra manipulación del objeto window.PRODUCTS
  if (Object.freeze) {
    Object.freeze(PRODUCTS);
    PRODUCTS.forEach(p => Object.freeze(p));
  }

  console.log('✨ ALABASTRO Alta Perfumería iniciada con éxito. [Modo Seguro Activo]');
});

/* ==========================================================================
   13. API Global de ALABASTRO (Testing Suite & Extensibilidad)
   ========================================================================== */
window.Alabastro = {
  PRODUCTS,
  STATE,
  STORAGE_KEYS,
  FREE_SHIPPING_THRESHOLD,
  MAX_CART_ITEM_QTY,
  SecurityModule,
  formatCOP,
  createBottleSvg,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  toggleFavorite,
  filterAndSortProducts,
  renderCatalog,
  updateCartUI,
  updateFavoritesUI,
  updateAuthUI,
  openProductModal,
  closeProductModal,
  openCartDrawer,
  closeCartDrawer,
  openFavoritesDrawer,
  closeFavoritesDrawer,
  openAuthModal,
  closeAuthModal,
  switchAuthTab,
  getRegisteredUsers,
  saveRegisteredUsers,
  handleLoginSubmit,
  handleRegisterSubmit,
  handleLogout,
  loadStateFromStorage,
  saveCartToStorage,
  saveFavoritesToStorage,
  findBestFragranceMatch,
  calculateAndDisplayQuizResult
};
