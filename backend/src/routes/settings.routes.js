/**
 * Rutas de Configuración y Parámetros de la Tienda ALABASTRO
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/settings
 * Consultar configuración de la tienda
 */
router.get('/', async (req, res) => {
  try {
    const result = await query("SELECT value FROM settings WHERE key = 'store_config'");
    if (result.rows.length === 0) {
      return res.json({
        success: true,
        settings: {
          storeName: 'ALABASTRO — Alta Perfumería',
          contactPhone: '+57 311 254 9053',
          whatsappSales: '573112549053',
          freeShippingThreshold: 350000,
          bannerNotice: 'Envíos Nacionales Asegurados sin costo en compras superiores a $350.000 COP'
        }
      });
    }
    res.json({
      success: true,
      settings: result.rows[0].value
    });
  } catch (err) {
    console.error('[Settings] Error al consultar ajustes:', err);
    res.status(500).json({ success: false, message: 'Error al consultar ajustes de tienda.' });
  }
});

/**
 * PUT /api/settings
 * Actualizar configuración de la tienda (Solo Admin)
 */
router.put('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const newSettings = req.body;

    await query(
      `INSERT INTO settings (key, value, description, updated_at)
       VALUES ('store_config', $1, 'Configuración general de la tienda', CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE
       SET value = $1, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(newSettings)]
    );

    await query(
      `INSERT INTO activity_logs (user_id, user_name, action, details)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, req.user.name, 'ACTUALIZAR_AJUSTES', 'Configuración de tienda actualizada']
    );

    res.json({
      success: true,
      message: 'Configuración de la tienda guardada exitosamente.',
      settings: newSettings
    });
  } catch (err) {
    console.error('[Settings] Error al guardar ajustes:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar configuración.' });
  }
});

module.exports = router;
