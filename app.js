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
   1. Datos de Catálogo (8 Fragancias Ilustrativas Premium)
   ========================================================================== */
const PRODUCTS = [
  {
    id: 'santal-nectar',
    name: 'Néctar de Sándalo',
    subtitle: 'Extracto de Perfume — 100ml',
    family: 'amaderada',
    familyDisplay: 'Amaderada Especiada',
    price: 420000,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Extracto de Perfume (30% concentración)',
    description: 'Una composición majestuosa y cálida donde el sándalo de Mysore se entrelaza con cardamomo verde y maderas ahumadas, dejando una estela embriagadora y distinguida.',
    topNotes: ['Cardamomo de Ceilán', 'Bergamota dorada', 'Pimienta Rosa'],
    heartNotes: ['Sándalo de Mysore', 'Cedro Atlas', 'Iris de Florencia'],
    baseNotes: ['Vainilla Bourbon', 'Ámbar Cálido', 'Almizcle Blanco'],
    longevity: '+12 Horas garantizadas',
    sillage: 'Intensa & Envolvente',
    bestFor: 'Noches templadas, cenas exclusivas, firmas personales',
    gradient: {
      liquid1: '#523A21',
      liquid2: '#24180D',
      accent: '#D4AF7A',
      cap: '#B28A56'
    },
    quizTags: {
      occasions: ['noche', 'gala', 'diario'],
      sensations: ['seduccion', 'confort'],
      intensities: ['notable', 'intensa']
    }
  },
  {
    id: 'rose-imperiale',
    name: 'Rosa Imperial',
    subtitle: 'Agua de Perfume — 100ml',
    family: 'floral',
    familyDisplay: 'Floral Sofisticada',
    price: 390000,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Agua de Perfume (24% concentración)',
    description: 'El tributo definitivo a la rosa centifolia de Grasse. Una apertura radiante de lichi silvestre da paso a pétalos aterciopelados sobre un fondo limpio y seductor.',
    topNotes: ['Rosa de Damasco', 'Lichi Silvestre', 'Mandarina'],
    heartNotes: ['Rosa Centifolia de Grasse', 'Peonía Rosa', 'Magnolia'],
    baseNotes: ['Almizcle Blanco', 'Madera de Cachemira', 'Ámbar Gris'],
    longevity: '8 a 10 Horas',
    sillage: 'Moderada & Romántica',
    bestFor: 'Primavera, eventos de día, citas románticas',
    gradient: {
      liquid1: '#6E2A36',
      liquid2: '#331017',
      accent: '#E8A7B5',
      cap: '#D4AF7A'
    },
    quizTags: {
      occasions: ['diario', 'noche'],
      sensations: ['romance', 'seduccion'],
      intensities: ['moderada', 'notable']
    }
  },
  {
    id: 'oud-nocturne',
    name: 'Oud Nocturno',
    subtitle: 'Extracto de Perfume — 100ml',
    family: 'oriental',
    familyDisplay: 'Oriental Amaderada',
    price: 480000,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Extracto de Perfume (32% concentración)',
    description: 'La joya más opulenta de ALABASTRO. Resina de Oud puro de Camboya envejecido en roble francés, fundido con cuero negro y acordes de humo sagrado.',
    topNotes: ['Azafrán Español', 'Incienso de Omán', 'Nuez Moscada'],
    heartNotes: ['Oud de Camboya Macerado', 'Cuero Ruso', 'Pachulí Oscuro'],
    baseNotes: ['Ámbar Negro', 'Benjuí de Laos', 'Vetiver Ahumado'],
    longevity: '+16 Horas de fijación',
    sillage: 'Poderosa & Memorable',
    bestFor: 'Galas nocturnas, clima frío, presencia imponente',
    gradient: {
      liquid1: '#3D2214',
      liquid2: '#140A06',
      accent: '#ECC88F',
      cap: '#B28A56'
    },
    quizTags: {
      occasions: ['noche', 'gala'],
      sensations: ['seduccion'],
      intensities: ['intensa']
    }
  },
  {
    id: 'bergamote-sauvage',
    name: 'Bergamota Salvaje',
    subtitle: 'Agua de Perfume — 100ml',
    family: 'citrica',
    familyDisplay: 'Cítrica Aromática',
    price: 350000,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Agua de Perfume (22% concentración)',
    description: 'La frescura deslumbrante del amanecer en Calabria. Cítricos prensados en frío combinados con salvia aromática y un toque mineral ultramoderno.',
    topNotes: ['Bergamota de Calabria', 'Pomelo Rosado', 'Lima Kaffir'],
    heartNotes: ['Salvia Esclarea', 'Pimienta de Sichuan', 'Romero Silvestre'],
    baseNotes: ['Vetiver de Haití', 'Cedro Claro', 'Almizcle Solar'],
    longevity: '7 a 9 Horas',
    sillage: 'Vibrante & Limpia',
    bestFor: 'Uso diario, oficina ejecutiva, mañanas soleadas',
    gradient: {
      liquid1: '#3C4E34',
      liquid2: '#1C2619',
      accent: '#A8C99B',
      cap: '#D4AF7A'
    },
    quizTags: {
      occasions: ['diario', 'calor'],
      sensations: ['frescura'],
      intensities: ['moderada', 'notable']
    }
  },
  {
    id: 'ambre-dore',
    name: 'Ámbar Dorado',
    subtitle: 'Extracto de Perfume — 100ml',
    family: 'oriental',
    familyDisplay: 'Oriental Cálida',
    price: 440000,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Extracto de Perfume (30% concentración)',
    description: 'Un abrazo líquido de ámbar resinoso y especias dulces. Una caricia cálida que evoca salones de terciopelo y veladas inolvidables.',
    topNotes: ['Canela de Ceilán', 'Coriandro Dulce', 'Naranja Amarga'],
    heartNotes: ['Ámbar Gris Natural', 'Haba Tonka Tostada', 'Benjuí de Siam'],
    baseNotes: ['Resina de Ládano', 'Vainilla Ahumada', 'Sándalo'],
    longevity: '+12 Horas',
    sillage: 'Cálida & Aristocrática',
    bestFor: 'Noche, otoño, invierno, momentos íntimos',
    gradient: {
      liquid1: '#5A3515',
      liquid2: '#281507',
      accent: '#ECC88F',
      cap: '#B28A56'
    },
    quizTags: {
      occasions: ['noche', 'gala'],
      sensations: ['seduccion', 'confort'],
      intensities: ['notable', 'intensa']
    }
  },
  {
    id: 'fleur-blanche',
    name: 'Flor Blanca',
    subtitle: 'Agua de Perfume — 100ml',
    family: 'floral',
    familyDisplay: 'Floral Luminosa',
    price: 370000,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Agua de Perfume (22% concentración)',
    description: 'La danza hipnótica de las flores blancas más nobles: nardos de la India y jazmines recolectados a medianoche con un velo solar y sedoso.',
    topNotes: ['Azahar de Túnez', 'Neroli', 'Pera Nashi'],
    heartNotes: ['Tuberosa de la India', 'Jazmín Sambac', 'Gardenia'],
    baseNotes: ['Madera de Sándalo Rubio', 'Almizcle de Seda', 'Vainilla Cristal'],
    longevity: '8 a 10 Horas',
    sillage: 'Luminosa & Radiante',
    bestFor: 'Bodas, celebraciones diurnas, firmas femeninas',
    gradient: {
      liquid1: '#4A4135',
      liquid2: '#241E17',
      accent: '#F3E5D0',
      cap: '#D4AF7A'
    },
    quizTags: {
      occasions: ['diario', 'gala'],
      sensations: ['romance', 'frescura'],
      intensities: ['moderada', 'notable']
    }
  },
  {
    id: 'marina-profonda',
    name: 'Marina Profunda',
    subtitle: 'Agua de Perfume — 100ml',
    family: 'acuatica',
    familyDisplay: 'Acuática Marina Fresca',
    price: 360000,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Agua de Perfume (22% concentración)',
    description: 'Las profundidades indómitas del mar Mediterráneo. Rocío salino sobre acantilados rocosos, algas azules y madera de deriva acariciada por el sol.',
    topNotes: ['Brisa Marina Mineral', 'Limón Amalfi', 'Calone Cristal'],
    heartNotes: ['Salvia Marina', 'Algas Azules', 'Lavanda Costera'],
    baseNotes: ['Madera de Deriva', 'Ámbar Gris', 'Musgo de Roble Marino'],
    longevity: '8 a 10 Horas',
    sillage: 'Fresca & Conquistadora',
    bestFor: 'Verano, clima tropical, descanso de fin de semana',
    gradient: {
      liquid1: '#1F3F4D',
      liquid2: '#0D1B22',
      accent: '#7EB9D4',
      cap: '#D4AF7A'
    },
    quizTags: {
      occasions: ['calor', 'diario'],
      sensations: ['frescura'],
      intensities: ['moderada', 'notable']
    }
  },
  {
    id: 'vanille-celeste',
    name: 'Vainilla Celeste',
    subtitle: 'Extracto de Perfume — 100ml',
    family: 'gourmand',
    familyDisplay: 'Dulce Gourmand Sofisticada',
    price: 410000,
    size: '100 ml / 3.4 FL. OZ.',
    concentration: 'Extracto de Perfume (28% concentración)',
    description: 'Lejos de lo infantil, esta es una vainilla oscura y licorosa. Vainilla de Madagascar macerada en coñac, café tostado y flor de almendro.',
    topNotes: ['Almendra Amarga', 'Grano de Café Tostado', 'Ron Añejo'],
    heartNotes: ['Vaina de Vainilla Bourbon', 'Caramelo Salado', 'Heliotropo'],
    baseNotes: ['Haba Tonka Negra', 'Sándalo Cremoso', 'Ámbar Resinoso'],
    longevity: '+12 Horas de duración',
    sillage: 'Adictiva & Magnética',
    bestFor: 'Noches frías, citas íntimas, amantes de notas dulces sofisticadas',
    gradient: {
      liquid1: '#4F2E1B',
      liquid2: '#231209',
      accent: '#ECC88F',
      cap: '#B28A56'
    },
    quizTags: {
      occasions: ['noche', 'diario'],
      sensations: ['confort', 'seduccion'],
      intensities: ['notable', 'intensa']
    }
  }
];

/* ==========================================================================
   2. Estado de la Aplicación (State Management)
   ========================================================================== */
const STATE = {
  cart: [],
  favorites: new Set(),
  currentUser: null,
  filters: {
    family: 'all',
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

      <!-- Placa de etiqueta dorada y negra editorial -->
      <rect x="46" y="118" width="68" height="52" rx="2" fill="#181412" stroke="url(#${capId})" stroke-width="0.9" />
      <text x="80" y="135" font-family="'Playfair Display', serif" font-size="9" fill="#E8D5B5" text-anchor="middle" font-weight="bold" letter-spacing="1.2">ALABASTRO</text>
      <line x1="56" y1="140" x2="104" y2="140" stroke="#B28A56" stroke-width="0.5" opacity="0.6"/>
      <text x="80" y="151" font-family="'DM Sans', sans-serif" font-size="6.5" fill="${product.gradient.accent}" text-anchor="middle" font-weight="600" letter-spacing="0.6">${product.name.toUpperCase()}</text>
      <text x="80" y="162" font-family="'DM Sans', sans-serif" font-size="4.8" fill="#A89E92" text-anchor="middle" letter-spacing="0.4">EXTRACTO</text>

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
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-msg">${message}</span>
  `;

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
      STATE.cart = JSON.parse(savedCart);
    }

    const savedFavs = localStorage.getItem(STORAGE_KEYS.favorites);
    if (savedFavs) {
      STATE.favorites = new Set(JSON.parse(savedFavs));
    }

    const savedUser = localStorage.getItem(STORAGE_KEYS.currentUser) || sessionStorage.getItem(STORAGE_KEYS.currentUser);
    if (savedUser) {
      STATE.currentUser = JSON.parse(savedUser);
    }
  } catch (e) {
    console.warn('No se pudo acceder al LocalStorage:', e);
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

  // Filtro por familia olfativa
  if (STATE.filters.family !== 'all') {
    list = list.filter(p => p.family === STATE.filters.family);
  }

  // Búsqueda por texto (nombre, notas, descripción)
  if (STATE.filters.search.trim() !== '') {
    const q = STATE.filters.search.toLowerCase().trim();
    list = list.filter(p => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchFamily = p.familyDisplay.toLowerCase().includes(q);
      const matchNotes = [...p.topNotes, ...p.heartNotes, ...p.baseNotes].some(n => n.toLowerCase().includes(q));
      return matchName || matchDesc || matchFamily || matchNotes;
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

function renderCatalog() {
  const grid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyCatalogState');
  const resultsCount = document.getElementById('resultsCount');

  if (!grid) return;

  const filtered = filterAndSortProducts();

  // Contador de resultados
  resultsCount.textContent = `Mostrando ${filtered.length} ${filtered.length === 1 ? 'fragancia' : 'fragancias'}`;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  grid.innerHTML = filtered.map(product => {
    const isFav = STATE.favorites.has(product.id);
    const bottleSvg = createBottleSvg(product, 130, 210);

    return `
      <article class="product-card" data-id="${product.id}">
        <div class="card-visual-wrap">
          <span class="card-badge-family">${product.familyDisplay.split(' ')[0]}</span>
          <button type="button" class="card-fav-btn ${isFav ? 'is-favorite' : ''}" 
                  data-action="toggle-fav" 
                  data-id="${product.id}" 
                  aria-label="${isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}"
                  title="${isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="${isFav ? 'currentColor' : 'none'}">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          
          <div class="card-bottle-svg">
            ${bottleSvg}
          </div>

          <button type="button" class="card-quick-view-btn" data-action="quick-view" data-id="${product.id}">
            Vista Rápida
          </button>
        </div>

        <div class="card-body">
          <div class="card-meta-line">
            <span>${product.size}</span>
            <span>Extracto de Perfume</span>
          </div>

          <h3 class="card-title">${product.name}</h3>

          <div class="card-notes-chips" aria-label="Notas aromáticas principales">
            ${product.topNotes.slice(0, 2).map(n => `<span class="note-chip">${n}</span>`).join('')}
            <span class="note-chip">+ notas</span>
          </div>

          <div class="card-footer">
            <span class="card-price">${formatCOP(product.price)}</span>
            <button type="button" class="card-add-btn" data-action="add-cart" data-id="${product.id}">
              + Añadir
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
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = STATE.cart.find(item => item.id === productId);
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

  saveCartToStorage();
  updateCartUI();
  showToast(`«${product.name}» añadido a la bolsa`, '🛍️');
}

function updateCartItemQuantity(productId, newQty) {
  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }

  const item = STATE.cart.find(i => i.id === productId);
  if (item) {
    item.quantity = newQty;
    saveCartToStorage();
    updateCartUI();
  }
}

function removeFromCart(productId) {
  const item = STATE.cart.find(i => i.id === productId);
  const name = item ? item.name : 'Producto';
  STATE.cart = STATE.cart.filter(i => i.id !== productId);
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

      return `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-thumb">
            ${thumbSvg}
          </div>
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-meta">${item.size} • ${item.familyDisplay.split(' ')[0]}</span>
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

  window.open(whatsappUrl, '_blank');
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

  if (modalBottleVisual) modalBottleVisual.innerHTML = createBottleSvg(product, 180, 290);
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

function calculateAndDisplayQuizResult() {
  // Puntuación según coincidencia con las respuestas
  const { occasion, sensation, intensity } = STATE.quizAnswers;

  let bestMatch = PRODUCTS[0];
  let highestScore = -1;

  PRODUCTS.forEach(p => {
    let score = 0;
    if (p.quizTags.occasions.includes(occasion)) score += 3;
    if (p.quizTags.sensations.includes(sensation)) score += 4;
    if (p.quizTags.intensities.includes(intensity)) score += 2;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = p;
    }
  });

  // Ocultar preguntas y mostrar resultado
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
  const resultCard = document.getElementById('finderResult');

  if (resultCard) {
    document.getElementById('resultBottleDisplay').innerHTML = createBottleSvg(bestMatch, 140, 220);
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
   10. Formulario de Suscripción VIP (Newsletter)
   ========================================================================== */
function setupNewsletter() {
  const form = document.getElementById('newsletterForm');
  const input = document.getElementById('newsletterEmail');
  const feedback = document.getElementById('newsletterFeedback');

  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();

    // Validación sencilla de email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      feedback.textContent = 'Por favor ingresa un correo electrónico válido.';
      feedback.className = 'newsletter-feedback error';
      feedback.style.display = 'block';
      return;
    }

    // Simulación de suscripción exitosa
    feedback.innerHTML = `
      ✨ <strong>¡Bienvenido al Círculo Privado!</strong> Hemos enviado a <em>${email}</em> tu código de bienvenida: <strong>ALABASTRO10</strong> (10% de cortesía).
    `;
    feedback.className = 'newsletter-feedback success';
    feedback.style.display = 'block';
    input.value = '';

    showToast('¡Suscripción exitosa! Cupón: ALABASTRO10', '💎');
  });
}

/* ==========================================================================
   10.5 Gestión de Autenticación y Registro de Clientes
   ========================================================================== */
function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.users);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error leyendo usuarios:', e);
  }

  // Cuentas de demostración iniciales
  const defaultUsers = [
    {
      id: 'usr-1',
      name: 'Santiago Zapata',
      email: 'santiago@alabastro.co',
      phone: '311 254 9053',
      password: 'password123',
      createdAt: new Date().toISOString()
    }
  ];
  saveRegisteredUsers(defaultUsers);
  return defaultUsers;
}

function saveRegisteredUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  } catch (e) {
    console.warn('Error guardando usuarios:', e);
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

function handleLoginSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const rememberMe = document.getElementById('rememberMe')?.checked;

  const email = emailInput?.value.trim().toLowerCase();
  const pass = passInput?.value;

  const users = getRegisteredUsers();
  const user = users.find(u => u.email.toLowerCase() === email && u.password === pass);

  if (user) {
    STATE.currentUser = user;
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
    } else {
      sessionStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
    }
    updateAuthUI();
    closeAuthModal();
    showToast(`¡Bienvenido/a de nuevo, ${user.name.split(' ')[0]}!`, '✨');
    document.getElementById('loginForm')?.reset();
  } else {
    showToast('Correo o contraseña incorrectos. Por favor verifica tus datos.', '⚠️');
  }
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('regName')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim().toLowerCase();
  const phone = document.getElementById('regPhone')?.value.trim() || '311 254 9053';
  const pass = document.getElementById('regPassword')?.value;
  const passConfirm = document.getElementById('regPasswordConfirm')?.value;

  if (!name || !email || !pass) {
    showToast('Por favor completa todos los campos requeridos.', '⚠️');
    return;
  }

  if (pass.length < 6) {
    showToast('La contraseña debe tener mínimo 6 caracteres.', '⚠️');
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

  const newUser = {
    id: 'usr-' + Date.now(),
    name,
    email,
    phone,
    password: pass,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  // Iniciar sesión automáticamente
  STATE.currentUser = newUser;
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(newUser));

  updateAuthUI();
  closeAuthModal();
  showToast(`¡Cuenta creada con éxito! Bienvenido al Círculo Privado, ${name.split(' ')[0]}`, '👑');
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
  } else {
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
      const cardVisual = target.closest('.card-visual-wrap');
      if (cardVisual && !target.closest('button')) {
        const card = target.closest('.product-card');
        if (card) openProductModal(card.dataset.id);
      }
    });
  }

  // 2. Filtros por Familia Olfativa
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      STATE.filters.family = btn.dataset.family;
      renderCatalog();
    });
  });

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
  document.getElementById('checkoutSimulateBtn')?.addEventListener('click', () => {
    if (STATE.cart.length === 0) return;
    const subtotal = STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
    mobileMenuBtn.addEventListener('click', () => {
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

/* ==========================================================================
   12. Inicialización de la Aplicación
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadStateFromStorage();
  renderCatalog();
  updateCartUI();
  updateFavoritesUI();
  updateAuthUI();
  setupQuiz();
  setupNewsletter();
  setupEventListeners();

  console.log('✨ ALABASTRO Alta Perfumería iniciada con éxito.');
});
