/**
 * Rutas de Métricas e Inteligencia de Negocio para la Consola ALABASTRO
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/metrics
 * Métricas generales para el Dashboard de la Consola de Administración (Solo Admin)
 */
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    // 1. Total ventas acumuladas (excluyendo cancelados)
    const salesRes = await query(`
      SELECT COALESCE(SUM(total), 0) AS total_sales,
             COUNT(*) AS total_orders
      FROM orders
      WHERE status != 'cancelado'
    `);

    // 2. Conteo por estado de pedidos
    const statusRes = await query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `);

    const statusCounts = {
      pendiente: 0,
      confirmado: 0,
      en_preparacion: 0,
      enviado: 0,
      entregado: 0,
      cancelado: 0
    };
    statusRes.rows.forEach(r => {
      if (statusCounts[r.status] !== undefined) {
        statusCounts[r.status] = parseInt(r.count, 10);
      }
    });

    // 3. Productos: Total registrados, activos, agotados (0) y stock bajo (1 a 15)
    const productStats = await query(`
      SELECT COUNT(*) AS total_registered,
             COUNT(*) FILTER (WHERE is_active = TRUE) AS active_products,
             COUNT(*) FILTER (WHERE is_active = FALSE) AS paused_products,
             COUNT(*) FILTER (WHERE is_active = TRUE AND stock = 0) AS out_of_stock_count,
             COUNT(*) FILTER (WHERE is_active = TRUE AND stock > 0 AND stock <= 15) AS low_stock_count,
             COALESCE(SUM(stock), 0) AS total_stock_units
      FROM products
    `);

    // 4. Conteo de usuarios y suscriptores
    const userStats = await query('SELECT COUNT(*) AS total_users FROM users WHERE role = \'customer\'');
    const subStats = await query('SELECT COUNT(*) AS total_subscribers FROM subscribers');

    // 5. Últimos 5 pedidos
    const recentOrders = await query(`
      SELECT id, customer_name, total, status, created_at, items
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // 6. Últimos registros de actividad
    const recentLogs = await query(`
      SELECT id, user_name, action, details, created_at
      FROM activity_logs
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // 7. Productos con bajo inventario o agotados
    const lowStockProducts = await query(`
      SELECT id, name, brand, family_display, price, stock, image, is_active
      FROM products
      WHERE stock <= 20
      ORDER BY stock ASC
      LIMIT 8
    `);

    res.json({
      success: true,
      metrics: {
        totalSales: Number(salesRes.rows[0].total_sales),
        totalOrders: parseInt(salesRes.rows[0].total_orders, 10),
        statusCounts,
        pendingOrders: statusCounts.pendiente || 0,
        totalRegisteredProducts: parseInt(productStats.rows[0].total_registered, 10),
        activeProducts: parseInt(productStats.rows[0].active_products, 10),
        pausedProducts: parseInt(productStats.rows[0].paused_products, 10),
        outOfStockCount: parseInt(productStats.rows[0].out_of_stock_count, 10),
        lowStockCount: parseInt(productStats.rows[0].low_stock_count, 10),
        totalStockUnits: parseInt(productStats.rows[0].total_stock_units, 10),
        totalUsers: parseInt(userStats.rows[0].total_users, 10),
        totalSubscribers: parseInt(subStats.rows[0].total_subscribers, 10),
        recentOrders: recentOrders.rows,
        recentLogs: recentLogs.rows,
        lowStockProducts: lowStockProducts.rows
      }
    });
  } catch (err) {
    console.error('[Metrics] Error al calcular métricas:', err);
    res.status(500).json({ success: false, message: 'Error al generar métricas del panel.' });
  }
});

module.exports = router;
