/**
 * Rutas de Gestión de Pedidos / Órdenes para ALABASTRO
 */

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/orders
 * Listar todos los pedidos (Solo Admin)
 */
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status, search } = req.query;

    let sql = 'SELECT * FROM orders';
    const conditions = [];
    const params = [];

    if (status && status !== 'todos') {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(customer_name) LIKE $${params.length} OR LOWER(customer_email) LIKE $${params.length} OR LOWER(id) LIKE $${params.length} OR LOWER(city) LIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);

    res.json({
      success: true,
      count: result.rows.length,
      orders: result.rows
    });
  } catch (err) {
    console.error('[Orders] Error al consultar pedidos:', err);
    res.status(500).json({ success: false, message: 'Error al listar los pedidos.' });
  }
});

/**
 * GET /api/orders/my-orders
 * Pedidos del usuario autenticado
 */
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM orders WHERE user_id = $1 OR customer_email = $2 ORDER BY created_at DESC',
      [req.user.id, req.user.email]
    );
    res.json({
      success: true,
      orders: result.rows
    });
  } catch (err) {
    console.error('[Orders] Error al consultar mis pedidos:', err);
    res.status(500).json({ success: false, message: 'Error al consultar pedidos del usuario.' });
  }
});

/**
 * GET /api/orders/:id
 * Detalle de un pedido específico
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM orders WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
    }

    const order = result.rows[0];

    // Si no es admin ni el dueño, restringir
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = req.user && (req.user.id === order.user_id || req.user.email === order.customer_email);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Acceso no autorizado a este pedido.' });
    }

    res.json({
      success: true,
      order
    });
  } catch (err) {
    console.error('[Orders] Error al obtener pedido:', err);
    res.status(500).json({ success: false, message: 'Error al consultar el pedido.' });
  }
});

/**
 * POST /api/orders
 * Crear un nuevo pedido desde el checkout
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      paymentMethod,
      giftPackaging,
      notes,
      items
    } = req.body;

    if (!customerName || !customerEmail || !shippingAddress || !city || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos obligatorios para formalizar el pedido (nombre, correo, dirección, ciudad e ítems).'
      });
    }

    // Calcular subtotal real basándose en los productos de la base de datos
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const prodRes = await query('SELECT id, name, price, stock FROM products WHERE id = $1', [item.id]);
      if (prodRes.rows.length > 0) {
        const prod = prodRes.rows[0];
        const qty = Math.max(1, Math.min(parseInt(item.quantity, 10) || 1, 10));
        const itemPrice = Number(prod.price);
        subtotal += itemPrice * qty;

        verifiedItems.push({
          id: prod.id,
          name: prod.name,
          price: itemPrice,
          quantity: qty
        });

        // Descontar inventario
        await query(
          'UPDATE products SET stock = GREATEST(0, stock - $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [qty, prod.id]
        );
      }
    }

    if (verifiedItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No se encontraron productos válidos en el carrito.' });
    }

    // Regla de envío gratuito ($350.000 COP)
    const FREE_SHIPPING_THRESHOLD = 350000;
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 18000;
    const total = subtotal + shippingCost;

    const orderId = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const userId = req.user ? req.user.id : null;

    const insertRes = await query(
      `INSERT INTO orders (
        id, user_id, customer_name, customer_email, customer_phone, shipping_address,
        city, payment_method, status, subtotal, shipping_cost, total, gift_packaging,
        notes, items
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendiente', $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        orderId,
        userId,
        customerName.trim(),
        customerEmail.trim().toLowerCase(),
        customerPhone ? customerPhone.trim() : '',
        shippingAddress.trim(),
        city.trim(),
        paymentMethod || 'Transferencia',
        subtotal,
        shippingCost,
        total,
        Boolean(giftPackaging),
        notes || '',
        JSON.stringify(verifiedItems)
      ]
    );

    const newOrder = insertRes.rows[0];

    // Registrar log
    await query(
      `INSERT INTO activity_logs (user_id, user_name, action, details)
       VALUES ($1, $2, $3, $4)`,
      [userId || 'anonimo', customerName, 'NUEVO_PEDIDO', `Nuevo pedido ${orderId} creado por total de $${total.toLocaleString('es-CO')} COP`]
    );

    res.status(201).json({
      success: true,
      message: `¡Pedido ${orderId} registrado con éxito! Gracias por tu preferencia.`,
      order: newOrder
    });
  } catch (err) {
    console.error('[Orders] Error al registrar pedido:', err);
    res.status(500).json({ success: false, message: 'Error interno al procesar el pedido.' });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Actualizar estado de un pedido (Solo Admin)
 */
router.patch('/:id/status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Estado no válido. Opciones: ${validStatuses.join(', ')}`
      });
    }

    const prevOrder = await query('SELECT status, items FROM orders WHERE id = $1', [id]);
    if (prevOrder.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado.' });
    }

    const previousStatus = prevOrder.rows[0].status;
    const items = prevOrder.rows[0].items || [];

    // Si se cancela el pedido, restaurar el inventario
    if (previousStatus !== 'cancelado' && status === 'cancelado') {
      for (const it of items) {
        if (it.id && it.quantity) {
          await query(
            'UPDATE products SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [parseInt(it.quantity, 10), it.id]
          );
        }
      }
    } else if (previousStatus === 'cancelado' && status !== 'cancelado') {
      // Si se reactiva un pedido cancelado, volver a descontar el stock
      for (const it of items) {
        if (it.id && it.quantity) {
          await query(
            'UPDATE products SET stock = GREATEST(0, stock - $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [parseInt(it.quantity, 10), it.id]
          );
        }
      }
    }

    const updateRes = await query(
      `UPDATE orders
       SET status = $1,
           notes = COALESCE($2, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, notes || null, id]
    );

    await query(
      `INSERT INTO activity_logs (user_id, user_name, action, details)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, req.user.name, 'CAMBIO_ESTADO_PEDIDO', `Pedido ${id} pasó de «${previousStatus}» a «${status}»`]
    );

    res.json({
      success: true,
      message: `Estado del pedido ${id} actualizado a «${status}».`,
      order: updateRes.rows[0]
    });
  } catch (err) {
    console.error('[Orders] Error al actualizar estado del pedido:', err);
    res.status(500).json({ success: false, message: 'Error al cambiar estado del pedido.' });
  }
});

module.exports = router;
