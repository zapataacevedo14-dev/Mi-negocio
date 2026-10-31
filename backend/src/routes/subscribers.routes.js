/**
 * Rutas de Suscripciones Newsletter para ALABASTRO
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

/**
 * POST /api/subscribers
 * Suscribirse al boletín privado
 */
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Por favor ingresa un correo válido.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    await query(
      `INSERT INTO subscribers (email)
       VALUES ($1)
       ON CONFLICT (email) DO NOTHING`,
      [cleanEmail]
    );

    res.status(201).json({
      success: true,
      message: '¡Gracias por unirte al Círculo Privado de ALABASTRO!'
    });
  } catch (err) {
    console.error('[Subscribers] Error al registrar suscriptor:', err);
    res.status(500).json({ success: false, message: 'Error al procesar la suscripción.' });
  }
});

/**
 * GET /api/subscribers
 * Listar suscriptores (Solo Admin)
 */
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await query('SELECT * FROM subscribers ORDER BY created_at DESC');
    res.json({
      success: true,
      count: result.rows.length,
      subscribers: result.rows
    });
  } catch (err) {
    console.error('[Subscribers] Error al listar suscriptores:', err);
    res.status(500).json({ success: false, message: 'Error al consultar suscriptores.' });
  }
});

/**
 * DELETE /api/subscribers/:id
 * Eliminar suscriptor (Solo Admin)
 */
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM subscribers WHERE id = $1', [id]);
    res.json({ success: true, message: 'Suscriptor eliminado.' });
  } catch (err) {
    console.error('[Subscribers] Error al eliminar suscriptor:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar suscriptor.' });
  }
});

module.exports = router;
