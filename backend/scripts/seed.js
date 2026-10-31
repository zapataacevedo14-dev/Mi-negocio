/**
 * ALABASTRO — Script de Inicialización y Poblado de Datos (Seed)
 */
const { initDatabase, query, isPostgresConnected, DEFAULT_PRODUCTS } = require('../src/db');

async function seed() {
  try {
    console.log('[Seed] Conectando e inicializando base de datos...');
    await initDatabase();

    const dbMode = isPostgresConnected() ? 'PostgreSQL (Docker)' : 'Motor Embebido Resiliente (Local Store)';
    console.log(`[Seed] Modo activo: ${dbMode}`);

    const res = await query('SELECT COUNT(*) FROM products');
    const count = parseInt(res.rows[0].count, 10);
    console.log(`[Seed] Total de fragancias activas en base de datos: ${count}`);
    console.log('[Seed] Operación completada con éxito.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error durante el proceso de inicialización:', err);
    process.exit(1);
  }
}

seed();
