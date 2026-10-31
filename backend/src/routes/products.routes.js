/**
 * Rutas de Catálogo de Productos para ALABASTRO
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { query } = require('../db');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/products
 * Lista de productos (pública o para administración)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { family, search, sort, all, status } = req.query;

    let sql = 'SELECT * FROM products';
    const conditions = [];
    const params = [];

    // Si no es admin solicitando `all=true`, solo mostrar activos
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin || all !== 'true') {
      conditions.push('is_active = TRUE');
    } else if (status === 'activos') {
      conditions.push('is_active = TRUE');
    } else if (status === 'pausados') {
      conditions.push('is_active = FALSE');
    }

    if (family && family !== 'todos') {
      params.push(family);
      conditions.push(`family = $${params.length}`);
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(name) LIKE $${params.length} OR LOWER(COALESCE(brand, '')) LIKE $${params.length} OR LOWER(COALESCE(full_name, '')) LIKE $${params.length} OR LOWER(description) LIKE $${params.length} OR LOWER(family_display) LIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Ordenamiento
    if (sort === 'price-asc') {
      sql += ' ORDER BY price ASC';
    } else if (sort === 'price-desc') {
      sql += ' ORDER BY price DESC';
    } else if (sort === 'name-asc') {
      sql += ' ORDER BY name ASC';
    } else {
      sql += ' ORDER BY created_at ASC';
    }

    const result = await query(sql, params);

    res.json({
      success: true,
      count: result.rows.length,
      products: result.rows
    });
  } catch (err) {
    console.error('[Products] Error al listar productos:', err);
    res.status(500).json({ success: false, message: 'Error al consultar catálogo de productos.' });
  }
});

/**
 * GET /api/products/:id
 * Detalle de una fragancia específica
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    res.json({
      success: true,
      product: result.rows[0]
    });
  } catch (err) {
    console.error('[Products] Error al obtener producto:', err);
    res.status(500).json({ success: false, message: 'Error al consultar el producto.' });
  }
});

/**
 * POST /api/products
 * Crear una nueva fragancia (Solo Admin)
 */
router.post('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const {
      name, fullName, brand, gender, genderDisplay, subtitle, family, familyDisplay,
      price, stock, size, concentration, origin, image, description,
      topNotes, heartNotes, baseNotes, longevity, sillage, bestFor,
      gradient, quizTags, isActive
    } = req.body;

    if (!name || !family || !price) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, familia y precio son obligatorios.'
      });
    }

    if (price !== undefined && (isNaN(Number(price)) || Number(price) <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'El precio debe ser un número positivo en pesos colombianos.'
      });
    }

    if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'El inventario debe ser un número entero mayor o igual a 0.'
      });
    }

    // Generar o usar slug único
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = req.body.id ? req.body.id.trim() : (baseSlug + '-' + Math.random().toString(36).substring(2, 6));

    const defaultGradient = gradient || {
      liquid1: '#523A21',
      liquid2: '#24180D',
      accent: '#D4AF7A',
      cap: '#B28A56'
    };

    const finalBrand = brand ? brand.trim() : 'Lattafa';
    const finalGender = gender || 'unisex';
    const finalGenderDisplay = genderDisplay || (finalGender === 'hombre' ? 'Hombre' : (finalGender === 'mujer' ? 'Mujer' : 'Unisex'));
    const finalFullName = fullName ? fullName.trim() : `${finalBrand} ${name.trim()}`;
    const finalOrigin = origin ? origin.trim() : 'Dubái, Emiratos Árabes Unidos';
    const finalImage = image ? image.trim() : 'assets/perfumes/lattafa-asad.png';

    const insertRes = await query(
      `INSERT INTO products (
        id, name, full_name, brand, gender, gender_display, subtitle, family, family_display,
        price, stock, size, concentration, origin, image, description,
        top_notes, heart_notes, base_notes, longevity, sillage, best_for,
        gradient, quiz_tags, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22,
        $23, $24, $25
      ) RETURNING *`,
      [
        id,
        name.trim(),
        finalFullName,
        finalBrand,
        finalGender,
        finalGenderDisplay,
        subtitle || 'Eau de Parfum — 100ml',
        family,
        familyDisplay || (family.charAt(0).toUpperCase() + family.slice(1)),
        Number(price),
        Number(stock) !== undefined && !isNaN(Number(stock)) ? Number(stock) : 20,
        size || '100 ml / 3.4 FL. OZ.',
        concentration || 'Eau de Parfum (Alta Concentración)',
        finalOrigin,
        finalImage,
        description || '',
        JSON.stringify(topNotes || []),
        JSON.stringify(heartNotes || []),
        JSON.stringify(baseNotes || []),
        longevity || '+12 Horas',
        sillage || 'Intensa & Envolvente',
        bestFor || 'Ocasiones especiales y eventos de gala',
        JSON.stringify(defaultGradient),
        JSON.stringify(quizTags || { occasions: ['noche', 'gala'], sensations: ['seduccion'], intensities: ['intensa'] }),
        isActive !== undefined ? Boolean(isActive) : true
      ]
    );

    await query(
      `INSERT INTO activity_logs (user_id, user_name, action, details)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, req.user.name, 'CREAR_PRODUCTO', `Nueva fragancia creada: ${name} (${id})`]
    );

    res.status(201).json({
      success: true,
      message: `Fragancia «${name}» agregada exitosamente al catálogo.`,
      product: insertRes.rows[0]
    });
  } catch (err) {
    console.error('[Products] Error al crear producto:', err);
    res.status(500).json({ success: false, message: 'Error al registrar el producto.' });
  }
});

/**
 * PUT /api/products/:id
 * Actualizar una fragancia existente (Solo Admin)
 */
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, fullName, brand, gender, genderDisplay, subtitle, family, familyDisplay,
      price, stock, size, concentration, origin, image, description,
      topNotes, heartNotes, baseNotes, longevity, sillage, bestFor,
      gradient, quizTags, isActive
    } = req.body;

    const check = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    if (price !== undefined && (isNaN(Number(price)) || Number(price) <= 0)) {
      return res.status(400).json({ success: false, message: 'El precio debe ser un número positivo en pesos colombianos.' });
    }
    if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
      return res.status(400).json({ success: false, message: 'El inventario debe ser un número entero mayor o igual a 0.' });
    }

    const current = check.rows[0];

    const updatedRes = await query(
      `UPDATE products SET
        name = COALESCE($1, name),
        full_name = COALESCE($2, full_name),
        brand = COALESCE($3, brand),
        gender = COALESCE($4, gender),
        gender_display = COALESCE($5, gender_display),
        subtitle = COALESCE($6, subtitle),
        family = COALESCE($7, family),
        family_display = COALESCE($8, family_display),
        price = COALESCE($9, price),
        stock = COALESCE($10, stock),
        size = COALESCE($11, size),
        concentration = COALESCE($12, concentration),
        origin = COALESCE($13, origin),
        image = COALESCE($14, image),
        description = COALESCE($15, description),
        top_notes = CASE WHEN $16::text IS NOT NULL THEN $16::jsonb ELSE top_notes END,
        heart_notes = CASE WHEN $17::text IS NOT NULL THEN $17::jsonb ELSE heart_notes END,
        base_notes = CASE WHEN $18::text IS NOT NULL THEN $18::jsonb ELSE base_notes END,
        longevity = COALESCE($19, longevity),
        sillage = COALESCE($20, sillage),
        best_for = COALESCE($21, best_for),
        gradient = CASE WHEN $22::text IS NOT NULL THEN $22::jsonb ELSE gradient END,
        quiz_tags = CASE WHEN $23::text IS NOT NULL THEN $23::jsonb ELSE quiz_tags END,
        is_active = COALESCE($24, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $25
       RETURNING *`,
      [
        name ? name.trim() : null,
        fullName ? fullName.trim() : null,
        brand ? brand.trim() : null,
        gender || null,
        genderDisplay || null,
        subtitle || null,
        family || null,
        familyDisplay || null,
        price !== undefined ? Number(price) : null,
        stock !== undefined ? Number(stock) : null,
        size || null,
        concentration || null,
        origin ? origin.trim() : null,
        image ? image.trim() : null,
        description || null,
        topNotes ? JSON.stringify(topNotes) : null,
        heartNotes ? JSON.stringify(heartNotes) : null,
        baseNotes ? JSON.stringify(baseNotes) : null,
        longevity || null,
        sillage || null,
        bestFor || null,
        gradient ? JSON.stringify(gradient) : null,
        quizTags ? JSON.stringify(quizTags) : null,
        isActive !== undefined ? Boolean(isActive) : null,
        id
      ]
    );

    await query(
      `INSERT INTO activity_logs (user_id, user_name, action, details)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, req.user.name, 'ACTUALIZAR_PRODUCTO', `Fragancia actualizada: ${updatedRes.rows[0].name} (${id})`]
    );

    res.json({
      success: true,
      message: `Fragancia «${updatedRes.rows[0].name}» actualizada exitosamente.`,
      product: updatedRes.rows[0]
    });
  } catch (err) {
    console.error('[Products] Error al actualizar producto:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar el producto.' });
  }
});

/**
 * PATCH /api/products/:id/stock
 * Actualización rápida de existencias (Solo Admin)
 */
router.patch('/:id/stock', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const parsedStock = parseInt(stock, 10);
    if (stock === undefined || isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ success: false, message: 'La cantidad de inventario debe ser un número entero mayor o igual a 0.' });
    }

    const updated = await query(
      `UPDATE products
       SET stock = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, stock`,
      [parsedStock, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    res.json({
      success: true,
      message: `Stock de «${updated.rows[0].name}» ajustado a ${updated.rows[0].stock} unidades.`,
      product: updated.rows[0]
    });
  } catch (err) {
    console.error('[Products] Error al actualizar stock:', err);
    res.status(500).json({ success: false, message: 'Error al ajustar inventario.' });
  }
});

/**
 * POST /api/products/:id/decrement
 * Descontar stock cuando el usuario agrega al carrito en la web
 */
router.post('/:id/decrement', async (req, res) => {
  try {
    const { id } = req.params;
    const qty = Math.max(1, parseInt(req.body.quantity, 10) || 1);
    const updated = await query(
      `UPDATE products
       SET stock = GREATEST(0, stock - $1), updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, stock`,
      [qty, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    res.json({
      success: true,
      message: `Stock descontado para «${updated.rows[0].name}»`,
      product: updated.rows[0]
    });
  } catch (err) {
    console.error('[Products] Error al descontar stock:', err);
    res.status(500).json({ success: false, message: 'Error al descontar inventario.' });
  }
});

/**
 * POST /api/products/:id/increment
 * Reintegrar stock cuando el usuario elimina del carrito en la web
 */
router.post('/:id/increment', async (req, res) => {
  try {
    const { id } = req.params;
    const qty = Math.max(1, parseInt(req.body.quantity, 10) || 1);
    const updated = await query(
      `UPDATE products
       SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, stock`,
      [qty, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    res.json({
      success: true,
      message: `Stock reintegrado para «${updated.rows[0].name}»`,
      product: updated.rows[0]
    });
  } catch (err) {
    console.error('[Products] Error al reintegrar stock:', err);
    res.status(500).json({ success: false, message: 'Error al reintegrar inventario.' });
  }
});

/**
 * PATCH /api/products/:id/toggle
 * Pausar o activar perfume en la tienda pública (Solo Admin)
 */
router.patch('/:id/toggle', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const current = await query('SELECT id, name, is_active FROM products WHERE id = $1', [id]);

    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    const newStatus = !current.rows[0].is_active;
    const updated = await query(
      'UPDATE products SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, is_active',
      [newStatus, id]
    );

    const actionText = newStatus ? 'activada en la tienda pública' : 'pausada del catálogo público';
    await query(
      `INSERT INTO activity_logs (user_id, user_name, action, details)
       VALUES ($1, $2, $3, $4)`,
      [
        req.user.id,
        req.user.name,
        newStatus ? 'ACTIVAR_PRODUCTO' : 'PAUSAR_PRODUCTO',
        `Fragancia «${updated.rows[0].name}» (${id}) ${actionText}.`
      ]
    );

    res.json({
      success: true,
      message: `Fragancia «${updated.rows[0].name}» ${actionText}.`,
      product: updated.rows[0]
    });
  } catch (err) {
    console.error('[Products] Error al alternar estado:', err);
    res.status(500).json({ success: false, message: 'Error al cambiar estado del producto.' });
  }
});

/**
 * POST /api/products/upload-image
 * Subida directa de imagen de perfume a assets/perfumes (Solo Admin)
 */
router.post('/upload-image', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { filename, imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Datos de imagen requeridos.' });
    }

    // Sanitizar nombre de archivo
    const safeName = (filename || 'perfume-' + Date.now() + '.png')
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, '-');

    const uploadsDir = path.resolve(__dirname, '..', '..', '..', 'assets', 'perfumes');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Extraer base64 si incluye metadata data:image/...;base64,
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(imageBase64, 'base64');

    const targetPath = path.join(uploadsDir, safeName);
    fs.writeFileSync(targetPath, buffer);

    const relativeUrl = `assets/perfumes/${safeName}`;

    res.json({
      success: true,
      message: `Fotografía «${safeName}» guardada exitosamente.`,
      imageUrl: relativeUrl
    });
  } catch (err) {
    console.error('[Products] Error al subir imagen:', err);
    res.status(500).json({ success: false, message: 'Error al procesar la imagen.' });
  }
});

/**
 * DELETE /api/products/:id
 * Desactivar o eliminar producto del catálogo con protección de pedidos (Solo Admin)
 */
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    const prodCheck = await query('SELECT id, name FROM products WHERE id = $1', [id]);
    if (prodCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }
    const prodName = prodCheck.rows[0].name;

    // Verificar si existen pedidos que contengan este producto (directo o ID legado)
    const legacyMap = {
      'lattafa-asad': 'santal-nectar',
      'lattafa-yara': 'rose-imperiale',
      'lattafa-khamrah': 'vanille-orientale',
      'lattafa-badee-al-oud': 'oud-majestueux',
      'afnan-9pm': 'bergamote-sauvage',
      'armaf-club-de-nuit-intense-man': 'ambre-souverain',
      'rasasi-hawas-for-him': 'marina-aquatica',
      'swiss-arabian-shaghaf-oud': 'fleur-nocturne'
    };
    const legacyId = legacyMap[id] || null;

    const ordersCheck = await query(
      "SELECT id FROM orders WHERE items::text LIKE '%' || $1 || '%' OR ($2::text IS NOT NULL AND items::text LIKE '%' || $2 || '%')",
      [id, legacyId]
    );

    if (ordersCheck.rows.length > 0 && permanent === 'true') {
      return res.status(409).json({
        success: false,
        hasOrders: true,
        ordersCount: ordersCheck.rows.length,
        message: `No es posible eliminar permanentemente «${prodName}» porque está asociado a ${ordersCheck.rows.length} pedido(s) existente(s). Para proteger el historial comercial, debes pausar el producto en su lugar.`
      });
    }

    if (permanent === 'true') {
      // Eliminar reseñas primero si existen
      await query('DELETE FROM reviews WHERE product_id = $1', [id]);
      await query('DELETE FROM products WHERE id = $1', [id]);

      await query(
        `INSERT INTO activity_logs (user_id, user_name, action, details)
         VALUES ($1, $2, $3, $4)`,
        [req.user.id, req.user.name, 'ELIMINAR_PRODUCTO_PERMANENTE', `Producto eliminado definitivamente: ${prodName} (${id})`]
      );

      return res.json({
        success: true,
        message: `Fragancia «${prodName}» eliminada definitivamente de la base de datos.`
      });
    }

    // Soft delete: cambiar is_active a false
    await query(
      'UPDATE products SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );

    await query(
      `INSERT INTO activity_logs (user_id, user_name, action, details)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, req.user.name, 'PAUSAR_PRODUCTO', `Fragancia pausada de la tienda: ${prodName} (${id})`]
    );

    res.json({
      success: true,
      message: `Fragancia «${prodName}» pausada del catálogo público.`
    });
  } catch (err) {
    console.error('[Products] Error al eliminar producto:', err);
    res.status(500).json({ success: false, message: 'Error al procesar la eliminación del producto.' });
  }
});

module.exports = router;

