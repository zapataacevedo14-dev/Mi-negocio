/**
 * ALABASTRO — Migración y Sincronización del Catálogo Árabe en PostgreSQL
 * Asegura que todas las 12 fragancias árabes originales existan con marca, imagen, stock y precio COP.
 */
const { pool, DEFAULT_PRODUCTS, initDatabase, query } = require('../src/db');

async function migrateCatalog() {
  try {
    console.log('[Migración] Conectando a PostgreSQL...');
    await initDatabase();

    // 1. Columnas seguras en products
    await query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(80);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS gender VARCHAR(30);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS gender_display VARCHAR(50);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS origin VARCHAR(100);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS image VARCHAR(255);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS full_name VARCHAR(150);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS subtitle VARCHAR(150);
    `);

    // 2. Insertar o actualizar las 12 fragancias árabes
    console.log('[Migración] Sincronizando las 12 fragancias árabes en PostgreSQL...');
    for (const prod of DEFAULT_PRODUCTS) {
      await query(`
        INSERT INTO products (
          id, name, full_name, brand, gender, gender_display, origin, image, subtitle,
          family, family_display, price, stock, size, concentration, description,
          top_notes, heart_notes, base_notes, longevity, sillage, best_for, gradient, quiz_tags, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          full_name = EXCLUDED.full_name,
          brand = EXCLUDED.brand,
          gender = EXCLUDED.gender,
          gender_display = EXCLUDED.gender_display,
          origin = EXCLUDED.origin,
          image = EXCLUDED.image,
          subtitle = EXCLUDED.subtitle,
          family = EXCLUDED.family,
          family_display = EXCLUDED.family_display,
          price = EXCLUDED.price,
          stock = EXCLUDED.stock,
          size = EXCLUDED.size,
          concentration = EXCLUDED.concentration,
          description = EXCLUDED.description,
          top_notes = EXCLUDED.top_notes,
          heart_notes = EXCLUDED.heart_notes,
          base_notes = EXCLUDED.base_notes,
          longevity = EXCLUDED.longevity,
          sillage = EXCLUDED.sillage,
          best_for = EXCLUDED.best_for,
          gradient = EXCLUDED.gradient,
          quiz_tags = EXCLUDED.quiz_tags,
          is_active = EXCLUDED.is_active,
          updated_at = CURRENT_TIMESTAMP
      `, [
        prod.id, prod.name, prod.full_name, prod.brand, prod.gender, prod.gender_display,
        prod.origin, prod.image, prod.subtitle, prod.family, prod.family_display,
        prod.price, prod.stock, prod.size, prod.concentration, prod.description,
        JSON.stringify(prod.top_notes), JSON.stringify(prod.heart_notes), JSON.stringify(prod.base_notes),
        prod.longevity, prod.sillage, prod.best_for, JSON.stringify(prod.gradient), JSON.stringify(prod.quiz_tags),
        prod.is_active !== undefined ? prod.is_active : true
      ]);
    }

    // 3. Migrar referencias en reviews si existen con legacy IDs
    const legacyMap = {
      'santal-nectar': 'lattafa-khamrah',
      'rose-imperiale': 'lattafa-yara',
      'oud-nocturne': 'lattafa-asad',
      'bergamote-sauvage': 'armaf-club-de-nuit-intense-man',
      'ambre-dore': 'al-haramain-amber-oud-gold',
      'fleur-blanche': 'armaf-club-de-nuit-woman',
      'marina-profonda': 'rasasi-hawas-for-him',
      'vanille-celeste': 'afnan-9pm'
    };

    for (const [legacyId, newId] of Object.entries(legacyMap)) {
      await query('UPDATE reviews SET product_id = $1 WHERE product_id = $2', [newId, legacyId]);
    }

    // 4. Limpiar los 8 registros antiguos sin marca que eran borradores
    const legacyIds = Object.keys(legacyMap);
    await query('DELETE FROM products WHERE id = ANY($1::varchar[]) AND (brand IS NULL OR image IS NULL)', [legacyIds]);

    // 5. Verificar productos actuales
    const verify = await query('SELECT id, name, brand, family, price, stock, image, is_active FROM products ORDER BY name ASC');
    console.log(`[Migración] Completada con éxito. ${verify.rows.length} fragancias árabes activas en PostgreSQL.`);
    console.table(verify.rows.map(r => ({
      id: r.id,
      nombre: r.name,
      marca: r.brand,
      precio: `$${Number(r.price).toLocaleString('es-CO')}`,
      stock: r.stock,
      foto: r.image,
      activo: r.is_active
    })));

    process.exit(0);
  } catch (err) {
    console.error('[Migración] Error fatal:', err);
    process.exit(1);
  }
}

migrateCatalog();
