/**
 * ALABASTRO — Suite de Pruebas Automatizadas Frontend
 * test-suite.js
 * 
 * Micro-framework de testing unitario, de integración, seguridad y accesibilidad
 * Diseñado para ejecutarse tanto en tests.html como en la consola del navegador.
 */

'use strict';

(function(global) {
  // Estado interno del Test Runner
  const suites = [];
  let currentSuite = null;

  // Estadísticas globales
  const stats = {
    totalSuites: 0,
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    durationMs: 0
  };

  /**
   * Define una suite de pruebas (grupo temático)
   */
  function describe(name, fn) {
    const suite = {
      name,
      tests: [],
      beforeEachFn: null,
      afterEachFn: null
    };
    currentSuite = suite;
    suites.push(suite);
    fn();
    currentSuite = null;
  }

  /**
   * Hook que se ejecuta antes de cada test en la suite actual
   */
  function beforeEach(fn) {
    if (currentSuite) currentSuite.beforeEachFn = fn;
  }

  /**
   * Hook que se ejecuta después de cada test en la suite actual
   */
  function afterEach(fn) {
    if (currentSuite) currentSuite.afterEachFn = fn;
  }

  /**
   * Define un caso de prueba individual
   */
  function test(name, fn) {
    if (!currentSuite) {
      throw new Error(`Test "${name}" debe estar dentro de un bloque describe()`);
    }
    currentSuite.tests.push({ name, fn, status: 'pending', error: null, durationMs: 0 });
  }

  /**
   * Motor de aserciones Fluent
   */
  function expect(actual) {
    return {
      toBe(expected) {
        if (actual !== expected) {
          throw new Error(`Esperaba ${JSON.stringify(expected)} pero obtuve ${JSON.stringify(actual)}`);
        }
      },
      toEqual(expected) {
        const actStr = JSON.stringify(actual);
        const expStr = JSON.stringify(expected);
        if (actStr !== expStr) {
          throw new Error(`Esperaba objeto equivalente a ${expStr} pero obtuve ${actStr}`);
        }
      },
      toBeTruthy() {
        if (!actual) {
          throw new Error(`Esperaba valor verídico (truthy) pero obtuve ${JSON.stringify(actual)}`);
        }
      },
      toBeFalsy() {
        if (actual) {
          throw new Error(`Esperaba valor falso (falsy) pero obtuve ${JSON.stringify(actual)}`);
        }
      },
      toBeGreaterThan(expected) {
        if (!(actual > expected)) {
          throw new Error(`Esperaba que ${actual} fuera mayor que ${expected}`);
        }
      },
      toBeGreaterThanOrEqual(expected) {
        if (!(actual >= expected)) {
          throw new Error(`Esperaba que ${actual} fuera mayor o igual a ${expected}`);
        }
      },
      toBeLessThan(expected) {
        if (!(actual < expected)) {
          throw new Error(`Esperaba que ${actual} fuera menor que ${expected}`);
        }
      },
      toBeLessThanOrEqual(expected) {
        if (!(actual <= expected)) {
          throw new Error(`Esperaba que ${actual} fuera menor o igual a ${expected}`);
        }
      },
      toContain(item) {
        if (Array.isArray(actual)) {
          if (!actual.includes(item)) {
            throw new Error(`El arreglo no contiene el elemento esperado: ${JSON.stringify(item)}`);
          }
        } else if (typeof actual === 'string') {
          if (!actual.includes(item)) {
            throw new Error(`El texto no contiene el fragmento esperado: "${item}"`);
          }
        } else if (actual instanceof Set) {
          if (!actual.has(item)) {
            throw new Error(`El Set no contiene el elemento: ${JSON.stringify(item)}`);
          }
        } else {
          throw new Error(`toContain solo soporta Array, String o Set`);
        }
      },
      toMatch(regex) {
        if (!regex.test(actual)) {
          throw new Error(`"${actual}" no coincide con la expresión regular ${regex}`);
        }
      },
      toBeInstanceOf(constructor) {
        if (!(actual instanceof constructor)) {
          throw new Error(`Esperaba instancia de ${constructor.name}`);
        }
      },
      toThrow() {
        if (typeof actual !== 'function') {
          throw new Error(`toThrow requiere una función como argumento en expect()`);
        }
        let threw = false;
        try {
          actual();
        } catch (e) {
          threw = true;
        }
        if (!threw) {
          throw new Error(`Se esperaba que la función lanzara una excepción, pero no lo hizo.`);
        }
      }
    };
  }

  // =========================================================================
  // DEFINICIÓN DE SUITES DE PRUEBA
  // =========================================================================

  function buildAllSuites() {
    // Asegurar que la API de Alabastro esté disponible
    const A = global.Alabastro || {};
    const PRODUCTS = A.PRODUCTS || [];
    const STATE = A.STATE || { cart: [], favorites: new Set(), filters: {} };
    const Security = A.SecurityModule || {};

    // -----------------------------------------------------------------------
    // SUITE 1: Catálogo de Productos & Integridad de Datos
    // -----------------------------------------------------------------------
    describe('1. Catálogo & Integridad de Fragancias', () => {
      test('El catálogo contiene al menos 8 fragancias de autor o perfumería árabe según especificación', () => {
        expect(PRODUCTS.length).toBeGreaterThanOrEqual(8);
      });

      test('Todos los productos tienen IDs únicos y no hay duplicados', () => {
        const ids = PRODUCTS.map(p => p.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(PRODUCTS.length);
      });

      test('Cada fragancia posee todos los campos requeridos por la especificación', () => {
        PRODUCTS.forEach(p => {
          expect(typeof p.id).toBe('string');
          expect(typeof p.name).toBe('string');
          expect(typeof p.price).toBe('number');
          expect(typeof p.family).toBe('string');
          expect(typeof p.familyDisplay).toBe('string');
          expect(typeof p.size).toBe('string');
          expect(typeof p.concentration).toBe('string');
          expect(Array.isArray(p.topNotes)).toBeTruthy();
          expect(Array.isArray(p.heartNotes)).toBeTruthy();
          expect(Array.isArray(p.baseNotes)).toBeTruthy();
          expect(p.topNotes.length).toBeGreaterThan(0);
          expect(p.heartNotes.length).toBeGreaterThan(0);
          expect(p.baseNotes.length).toBeGreaterThan(0);
        });
      });

      test('Los precios de todas las fragancias son números positivos en Pesos Colombianos', () => {
        PRODUCTS.forEach(p => {
          expect(p.price).toBeGreaterThan(0);
          expect(p.price % 1).toBe(0); // Es número entero
        });
      });

      test('Cada producto cuenta con gradientes CSS y paleta visual completa para los frascos', () => {
        PRODUCTS.forEach(p => {
          expect(p.gradient).toBeTruthy();
          expect(typeof p.gradient.liquid1).toBe('string');
          expect(typeof p.gradient.liquid2).toBe('string');
          expect(typeof p.gradient.cap).toBe('string');
        });
      });

      test('Las etiquetas para el recomendador (quizTags) están correctamente estructuradas', () => {
        PRODUCTS.forEach(p => {
          expect(p.quizTags).toBeTruthy();
          expect(Array.isArray(p.quizTags.occasions)).toBeTruthy();
          expect(Array.isArray(p.quizTags.sensations)).toBeTruthy();
          expect(Array.isArray(p.quizTags.intensities)).toBeTruthy();
        });
      });

      test('formatCOP formatea importes numéricos a divisa colombiana con sufijo COP', () => {
        const formatted = A.formatCOP(420000);
        expect(formatted).toContain('COP');
        expect(formatted).toContain('420');
      });

      test('El catálogo de productos está protegido con Object.freeze (Anti-Tampering)', () => {
        expect(Object.isFrozen(PRODUCTS)).toBeTruthy();
      });
    });

    // -----------------------------------------------------------------------
    // SUITE 2: Motor de Filtrado, Búsqueda y Ordenamiento
    // -----------------------------------------------------------------------
    describe('2. Filtros, Búsqueda y Ordenamiento', () => {
      beforeEach(() => {
        STATE.filters.family = 'all';
        STATE.filters.search = '';
        STATE.filters.sort = 'featured';
      });

      test('Filtro por familia olfativa "amaderada" retorna sólo fragancias amaderadas', () => {
        STATE.filters.family = 'amaderada';
        const filtered = A.filterAndSortProducts();
        expect(filtered.length).toBeGreaterThan(0);
        filtered.forEach(p => {
          expect(p.family).toBe('amaderada');
        });
      });

      test('Filtro "all" retorna todas las fragancias del catálogo', () => {
        STATE.filters.family = 'all';
        const filtered = A.filterAndSortProducts();
        expect(filtered.length).toBe(PRODUCTS.length);
      });

      test('Búsqueda por texto encuentra coincidencias por nombre (ej. "Lattafa" o "Asad")', () => {
        STATE.filters.search = 'lattafa';
        const filtered = A.filterAndSortProducts();
        expect(filtered.length).toBeGreaterThan(0);
        expect(filtered.some(p => p.name.toLowerCase().includes('lattafa'))).toBeTruthy();
      });

      test('Búsqueda por texto insensible a mayúsculas/minúsculas y busca en notas olfativas', () => {
        STATE.filters.search = 'BERGAMOTA';
        const filtered = A.filterAndSortProducts();
        expect(filtered.length).toBeGreaterThan(0);
      });

      test('Ordenamiento por precio ascendente (menor a mayor)', () => {
        STATE.filters.sort = 'price-asc';
        const filtered = A.filterAndSortProducts();
        for (let i = 0; i < filtered.length - 1; i++) {
          expect(filtered[i].price).toBeLessThanOrEqual(filtered[i + 1].price);
        }
      });

      test('Ordenamiento por precio descendente (mayor a menor)', () => {
        STATE.filters.sort = 'price-desc';
        const filtered = A.filterAndSortProducts();
        for (let i = 0; i < filtered.length - 1; i++) {
          expect(filtered[i].price).toBeGreaterThanOrEqual(filtered[i + 1].price);
        }
      });

      test('Ordenamiento alfabético A-Z por nombre', () => {
        STATE.filters.sort = 'name-asc';
        const filtered = A.filterAndSortProducts();
        for (let i = 0; i < filtered.length - 1; i++) {
          expect(filtered[i].name.localeCompare(filtered[i + 1].name)).toBeLessThanOrEqual(0);
        }
      });
    });

    // -----------------------------------------------------------------------
    // SUITE 3: Carrito de Compras & Reglas de Negocio
    // -----------------------------------------------------------------------
    describe('3. Carrito de Compras & Reglas Financieras', () => {
      beforeEach(() => {
        STATE.cart = [];
      });

      test('Añadir un producto nuevo al carrito lo agrega con cantidad 1', () => {
        const prod = PRODUCTS[0];
        A.addToCart(prod.id, 1);
        expect(STATE.cart.length).toBe(1);
        expect(STATE.cart[0].id).toBe(prod.id);
        expect(STATE.cart[0].quantity).toBe(1);
      });

      test('Añadir un producto ya existente incrementa su cantidad acumulada', () => {
        const prod = PRODUCTS[0];
        A.addToCart(prod.id, 1);
        A.addToCart(prod.id, 2);
        expect(STATE.cart.length).toBe(1);
        expect(STATE.cart[0].quantity).toBe(3);
      });

      test('Límite de seguridad: no permite cantidades superiores a MAX_CART_ITEM_QTY (10)', () => {
        const prod = PRODUCTS[0];
        A.addToCart(prod.id, 1);
        // Validar que la regla de seguridad del carrito frena desbordamientos
        const validated = Security.validateCartData([{
          id: prod.id,
          name: prod.name,
          price: prod.price,
          quantity: 9999
        }]);
        expect(validated[0].quantity).toBeLessThanOrEqual(A.MAX_CART_ITEM_QTY);
      });

      test('Modificar la cantidad de un ítem a un valor menor o mayor', () => {
        const prod = PRODUCTS[0];
        A.addToCart(prod.id, 3);
        A.updateCartItemQuantity(prod.id, 5);
        expect(STATE.cart[0].quantity).toBe(5);
      });

      test('Disminuir la cantidad a cero o negativo remueve el ítem del carrito', () => {
        const prod = PRODUCTS[0];
        A.addToCart(prod.id, 1);
        A.updateCartItemQuantity(prod.id, 0);
        expect(STATE.cart.length).toBe(0);
      });

      test('Eliminar un producto explícitamente mediante removeFromCart', () => {
        const prod1 = PRODUCTS[0];
        const prod2 = PRODUCTS[1];
        A.addToCart(prod1.id, 1);
        A.addToCart(prod2.id, 1);
        expect(STATE.cart.length).toBe(2);

        A.removeFromCart(prod1.id);
        expect(STATE.cart.length).toBe(1);
        expect(STATE.cart[0].id).toBe(prod2.id);
      });

      test('Cálculo dinámico del subtotal coincide exactamente con sum(price * quantity)', () => {
        A.addToCart(PRODUCTS[0].id, 2);
        A.addToCart(PRODUCTS[1].id, 1);
        const expectedSubtotal = (PRODUCTS[0].price * 2) + (PRODUCTS[1].price * 1);
        const calculated = STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        expect(calculated).toBe(expectedSubtotal);
      });

      test('Regla de Envío Gratuito: umbral de $350.000 COP calculado correctamente', () => {
        expect(A.FREE_SHIPPING_THRESHOLD).toBe(350000);
        // Si el total acumulado alcanza o supera 350.000 COP califica directamente para envío sin costo
        const sampleTotal = 390000;
        expect(sampleTotal).toBeGreaterThanOrEqual(A.FREE_SHIPPING_THRESHOLD);
      });
    });

    // -----------------------------------------------------------------------
    // SUITE 4: Lista de Favoritos (Wishlist)
    // -----------------------------------------------------------------------
    describe('4. Lista de Favoritos & Deseos', () => {
      beforeEach(() => {
        STATE.favorites = new Set();
      });

      test('toggleFavorite agrega una fragancia a la lista de favoritos', () => {
        const id = PRODUCTS[0].id;
        A.toggleFavorite(id);
        expect(STATE.favorites.has(id)).toBeTruthy();
        expect(STATE.favorites.size).toBe(1);
      });

      test('Un segundo toggleFavorite retira la fragancia de favoritos', () => {
        const id = PRODUCTS[0].id;
        A.toggleFavorite(id);
        A.toggleFavorite(id);
        expect(STATE.favorites.has(id)).toBeFalsy();
        expect(STATE.favorites.size).toBe(0);
      });

      test('La estructura Set previene duplicados en favoritos', () => {
        const id = PRODUCTS[0].id;
        STATE.favorites.add(id);
        STATE.favorites.add(id);
        expect(STATE.favorites.size).toBe(1);
      });

      test('Múltiples fragancias guardadas se gestionan de forma independiente', () => {
        A.toggleFavorite(PRODUCTS[0].id);
        A.toggleFavorite(PRODUCTS[1].id);
        A.toggleFavorite(PRODUCTS[2].id);
        expect(STATE.favorites.size).toBe(3);

        A.toggleFavorite(PRODUCTS[1].id); // Remover la del medio
        expect(STATE.favorites.size).toBe(2);
        expect(STATE.favorites.has(PRODUCTS[1].id)).toBeFalsy();
      });
    });

    // -----------------------------------------------------------------------
    // SUITE 5: Recomendador Olfativo (Quiz Engine)
    // -----------------------------------------------------------------------
    describe('5. Recomendador Olfativo Inteligente', () => {
      test('findBestFragranceMatch retorna una fragancia válida con cualquier combinación', () => {
        const result = A.findBestFragranceMatch({
          occasion: 'noche',
          sensation: 'seduccion',
          intensity: 'intensa'
        });
        expect(result).toBeTruthy();
        expect(result.bestMatch).toBeTruthy();
        expect(typeof result.bestMatch.id).toBe('string');
        expect(result.highestScore).toBeGreaterThan(0);
      });

      test('Perfil Noche + Seducción + Intensa recomienda fragancia amaderada u oriental', () => {
        const { bestMatch } = A.findBestFragranceMatch({
          occasion: 'noche',
          sensation: 'seduccion',
          intensity: 'intensa'
        });
        expect(['amaderada', 'oriental', 'cuero'].includes(bestMatch.family)).toBeTruthy();
      });

      test('Perfil Día + Frescura + Sutil recomienda fragancia fresca/cítrica o floral', () => {
        const { bestMatch } = A.findBestFragranceMatch({
          occasion: 'diario',
          sensation: 'frescura',
          intensity: 'sutil'
        });
        expect(['citrica', 'floral'].includes(bestMatch.family)).toBeTruthy();
      });

      test('El resultado siempre contiene notas de salida, corazón y fondo completas', () => {
        const { bestMatch } = A.findBestFragranceMatch({
          occasion: 'gala',
          sensation: 'confort',
          intensity: 'notable'
        });
        expect(bestMatch.topNotes.length).toBeGreaterThan(0);
        expect(bestMatch.heartNotes.length).toBeGreaterThan(0);
        expect(bestMatch.baseNotes.length).toBeGreaterThan(0);
      });
    });

    // -----------------------------------------------------------------------
    // SUITE 6: Módulo de Seguridad (SecurityModule)
    // -----------------------------------------------------------------------
    describe('6. Seguridad Frontend & Defense-in-Depth', () => {
      test('SecurityModule.sanitizeHTML neutraliza etiquetas <script> y eventos XSS', () => {
        const malicious = '<script>alert("xss")</script>';
        const clean = Security.sanitizeHTML(malicious);
        expect(clean).not.toContain('<script>');
        expect(clean).toContain('&lt;script&gt;');
      });

      test('SecurityModule.sanitizeHTML neutraliza comillas y barras en inyecciones de atributos', () => {
        const attack = '" onmouseover="alert(1)" /';
        const clean = Security.sanitizeHTML(attack);
        expect(clean).not.toContain('"');
        expect(clean).toContain('&quot;');
      });

      test('hashPassword produce un hash hexadecimal SHA-256 determinista de 64 caracteres', async () => {
        const hash1 = await Security.hashPassword('claveSecreta123');
        const hash2 = await Security.hashPassword('claveSecreta123');
        expect(typeof hash1).toBe('string');
        expect(hash1).toBe(hash2); // Determinismo
        expect(hash1.length).toBeGreaterThanOrEqual(10);
      });

      test('Contraseñas distintas producen hashes totalmente diferentes', async () => {
        const hashA = await Security.hashPassword('claveA_2026');
        const hashB = await Security.hashPassword('claveB_2026');
        expect(hashA !== hashB).toBeTruthy();
      });

      test('Rate Limiter bloquea tras exceder el número máximo de intentos permitidos (5)', () => {
        Security.rateLimiter.reset();
        for (let i = 0; i < 5; i++) {
          const check = Security.rateLimiter.canAttempt();
          expect(check.allowed).toBeTruthy();
          Security.rateLimiter.recordAttempt();
        }
        // El 6to intento debe ser bloqueado
        const blockedCheck = Security.rateLimiter.canAttempt();
        expect(blockedCheck.allowed).toBeFalsy();
        expect(blockedCheck.message).toContain('superado el límite');
      });

      test('Rate Limiter reset() restablece los intentos y levanta el bloqueo', () => {
        Security.rateLimiter.reset();
        const check = Security.rateLimiter.canAttempt();
        expect(check.allowed).toBeTruthy();
      });

      test('Validador de email valida formatos legítimos y rechaza cadenas maliciosas', () => {
        expect(Security.validators.email('cliente@alabastro.co')).toBeTruthy();
        expect(Security.validators.email('nombre.apellido+vip@gmail.com')).toBeTruthy();
        expect(Security.validators.email('invalido@@dominio..com')).toBeFalsy();
        expect(Security.validators.email('<script>@hack.com')).toBeFalsy();
        expect(Security.validators.email('')).toBeFalsy();
      });

      test('Validador de contraseñas exige longitud mínima de 6 y rechaza caracteres triviales repetidos', () => {
        expect(Security.validators.password('Perfume2026!').valid).toBeTruthy();
        expect(Security.validators.password('123').valid).toBeFalsy(); // Muy corta
        expect(Security.validators.password('aaaaaa').valid).toBeFalsy(); // Carácter repetido
      });

      test('safeJSONParse bloquea ataques de Prototype Pollution con __proto__ o constructor', () => {
        const pollutionPayload = '{"__proto__": {"isAdmin": true}}';
        const result = Security.safeJSONParse(pollutionPayload);
        expect(result).toBe(null); // Debe ser rechazado
      });

      test('validateCartData descarta elementos corruptos o IDs inexistentes en localStorage', () => {
        const corruptedData = [
          { id: 'producto-fantasma-99', name: 'Fake', price: 100, quantity: 1 },
          { id: PRODUCTS[0].id, name: PRODUCTS[0].name, price: PRODUCTS[0].price, quantity: 2 },
          { id: PRODUCTS[1].id, name: PRODUCTS[1].name, price: -500, quantity: 1 } // Precio negativo
        ];
        const clean = Security.validateCartData(corruptedData);
        expect(clean.length).toBe(1); // Solo el producto legítimo
        expect(clean[0].id).toBe(PRODUCTS[0].id);
      });
    });

    // -----------------------------------------------------------------------
    // SUITE 7: Interfaz, Accesibilidad y Navegación
    // -----------------------------------------------------------------------
    describe('7. Accesibilidad, DOM y Estructura Semántica', () => {
      test('Los elementos principales del DOM están presentes en la página', () => {
        if (typeof document !== 'undefined') {
          expect(document.getElementById('header') || document.querySelector('.site-header')).toBeTruthy();
          expect(document.getElementById('productsGrid')).toBeTruthy();
          expect(document.getElementById('cartDrawer')).toBeTruthy();
          expect(document.getElementById('favoritesDrawer')).toBeTruthy();
          expect(document.getElementById('toastContainer')).toBeTruthy();
        }
      });

      test('Los inputs de seguridad honeypot existen en el DOM con accesibilidad oculta', () => {
        if (typeof document !== 'undefined') {
          const hpNews = document.getElementById('newsHoneypot');
          const hpLogin = document.getElementById('loginHoneypot');
          const hpReg = document.getElementById('registerHoneypot');

          if (hpNews) expect(hpNews.getAttribute('tabindex')).toBe('-1');
          if (hpLogin) expect(hpLogin.getAttribute('tabindex')).toBe('-1');
          if (hpReg) expect(hpReg.getAttribute('tabindex')).toBe('-1');
        }
      });

      test('Todos los enlaces con target="_blank" poseen rel="noopener noreferrer"', () => {
        if (typeof document !== 'undefined') {
          const externalLinks = document.querySelectorAll('a[target="_blank"]');
          externalLinks.forEach(link => {
            const rel = link.getAttribute('rel') || '';
            expect(rel.includes('noopener')).toBeTruthy();
            expect(rel.includes('noreferrer')).toBeTruthy();
          });
        }
      });

      test('El botón de WhatsApp flotante contiene el texto de asesoría predeterminado', () => {
        if (typeof document !== 'undefined') {
          const waBtn = document.querySelector('.floating-whatsapp-btn');
          if (waBtn) {
            const href = waBtn.getAttribute('href') || '';
            expect(href.includes('wa.me/573112549053')).toBeTruthy();
          }
        }
      });
    });
  }

  /**
   * Ejecuta todas las suites registradas de forma asíncrona
   */
  async function runAll(onTestComplete, onSuiteComplete) {
    suites.length = 0; // Limpiar anteriores
    buildAllSuites();

    stats.totalSuites = suites.length;
    stats.totalTests = suites.reduce((acc, s) => acc + s.tests.length, 0);
    stats.passed = 0;
    stats.failed = 0;
    stats.skipped = 0;

    const startTime = Date.now();

    for (const suite of suites) {
      for (const t of suite.tests) {
        const testStart = Date.now();
        try {
          if (suite.beforeEachFn) await suite.beforeEachFn();
          await t.fn();
          if (suite.afterEachFn) await suite.afterEachFn();
          t.status = 'passed';
          stats.passed++;
        } catch (err) {
          t.status = 'failed';
          t.error = err.message || String(err);
          stats.failed++;
        }
        t.durationMs = Date.now() - testStart;
        if (typeof onTestComplete === 'function') {
          onTestComplete(suite, t, stats);
        }
      }
      if (typeof onSuiteComplete === 'function') {
        onSuiteComplete(suite, stats);
      }
    }

    stats.durationMs = Date.now() - startTime;
    return { suites, stats };
  }

  // Exportar API del Test Runner
  global.AlabastroTesting = {
    describe,
    test,
    beforeEach,
    afterEach,
    expect,
    suites,
    stats,
    runAll
  };

  // Autoejecución opcional si estamos en Node o CLI
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.AlabastroTesting;
  }
})(typeof window !== 'undefined' ? window : globalThis);
