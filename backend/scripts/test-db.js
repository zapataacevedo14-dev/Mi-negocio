/**
 * Script de prueba de conexión a Base de Datos (PostgreSQL o Local Engine)
 */
const { initDatabase, query, isPostgresConnected } = require('../src/db');

async function test() {
  try {
    console.log('[Test DB] Iniciando verificación de conexión...');
    await initDatabase();
    const res = await query('SELECT COUNT(*) FROM products');
    const mode = isPostgresConnected() ? 'PostgreSQL (Docker)' : 'Motor Embebido Resiliente (Local Store)';
    console.log(`[Test DB] Éxito (${mode}): ${res.rows[0].count} productos verificados.`);
    process.exit(0);
  } catch (err) {
    console.error('[Test DB] Error conectando a la base de datos:', err);
    process.exit(1);
  }
}

test();
