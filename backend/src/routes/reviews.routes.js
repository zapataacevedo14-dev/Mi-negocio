/**
 * Rutas de Reseñas y Testimonios para ALABASTRO
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/reviews
 * Obtener reseñas (Aprobadas para público, o todas para Admin)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { productId, status } = req.query;
    const isAdmin = req.user && req.user.role === 'admin';

    let sql = `
      SELECT r.*, p.name AS product_name
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
    `;
    const conditions = [];
    const params = [];

    if (!isAdmin) {
      conditions.push("r.status = 'aprobada'");
    } else if (status && status !== 'todos') {
      params.push(status);
      conditions.push(`r.status = $${params.length}`);
    }

    if (productId) {
      params.push(productId);
      conditions.push(`r.product_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY r.created_at DESC';

    const result = await query(sql, params);
    res.json({
      success: true,
      count: result.rows.length,
      reviews: result.rows
    });
  } catch (err) {
    console.error('[Reviews] Error al obtener reseñas:', err);
    res.status(500).json({ success: false, message: 'Error al consultar reseñas.' });
  }
});

/**
 * POST /api/reviews
 * Enviar una nueva reseña
 */
router.post('/', async (req, res) => {
  try {
    const { productId, authorName, rating, comment } = req.body;

    if (!productId || !authorName || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Producto, nombre, calificación (1 a 5) y comentario son requeridos.'
      });
    }

    const numRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));

    const insertRes = await query(
      `INSERT INTO reviews (product_id, author_name, rating, comment, verified_purchase, status)
       VALUES ($1, $2, $3, $4, TRUE, 'aprobada')
       RETURNING *`,
      [productId, authorName.trim(), numRating, comment.trim()]
    );

    res.status(201).json({
      success: true,
      message: '¡Gracias por compartir tu experiencia con ALABASTRO!',
      review: insertRes.rows[0]
    });
  } catch (err) {
    console.error('[Reviews] Error al crear reseña:', err);
    res.status(500).json({ success: false, message: 'Error al registrar reseña.' });
  }
});

/**
 * PATCH /api/reviews/:id/status
 * Moderar reseña (aprobada / rechazada) (Solo Admin)
 */
router.patch('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['aprobada', 'pendiente', 'rechazada'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Estado no válido.' });
    }

    const updateRes = await query(
      'UPDATE reviews SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Reseña no encontrada.' });
    }

    res.json({
      success: true,
      message: `Reseña marcada como «${status}».`,
      review: updateRes.rows[0]
    });
  } catch (err) {
    console.error('[Reviews] Error al moderar reseña:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar reseña.' });
  }
});

/**
 * DELETE /api/reviews/:id
 * Eliminar reseña (Solo Admin)
 */
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM reviews WHERE id = $1', [id]);
    res.json({ success: true, message: 'Reseña eliminada.' });
  } catch (err) {
    console.error('[Reviews] Error al eliminar reseña:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar reseña.' });
  }
});

module.exports = router;
