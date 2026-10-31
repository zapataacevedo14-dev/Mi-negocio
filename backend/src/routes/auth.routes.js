/**
 * Rutas de Autenticación y Gestión de Usuarios para ALABASTRO
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { verifyToken, requireAdmin, JWT_SECRET } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Iniciar sesión (clientes y administradores)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona correo y contraseña.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRes = await query('SELECT * FROM users WHERE email = $1', [cleanEmail]);

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Por favor verifica tus datos.'
      });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Por favor verifica tus datos.'
      });
    }

    // Generar token JWT con vigencia de 7 días
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Registrar log si es administrador
    if (user.role === 'admin') {
      await query(
        `INSERT INTO activity_logs (user_id, user_name, action, details)
         VALUES ($1, $2, $3, $4)`,
        [user.id, user.name, 'LOGIN_ADMIN', 'Ingreso a la Consola de Administración']
      );
    }

    return res.json({
      success: true,
      message: `¡Bienvenido/a de nuevo, ${user.name.split(' ')[0]}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    console.error('[Auth] Error en login:', err);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor durante el inicio de sesión.'
    });
  }
});

/**
 * POST /api/auth/register
 * Registro de nuevo cliente
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, correo y contraseña son obligatorios.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Comprobar si ya existe
    const exists = await query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (exists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cuenta registrada con este correo electrónico.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(password, salt);
    const userId = 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    const insertRes = await query(
      `INSERT INTO users (id, name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, 'customer')
       RETURNING id, name, email, phone, role, created_at`,
      [userId, name.trim(), cleanEmail, phone ? phone.trim() : null, passHash]
    );

    const newUser = insertRes.rows[0];

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: `¡Cuenta creada exitosamente! Bienvenido/a a ALABASTRO, ${newUser.name.split(' ')[0]}.`,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.created_at
      }
    });
  } catch (err) {
    console.error('[Auth] Error en registro:', err);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor durante el registro.'
    });
  }
});

/**
 * GET /api/auth/me
 * Obtener perfil de usuario actual con token
 */
router.get('/me', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * GET /api/auth/users
 * Listado de usuarios (Solo Admin)
 */
router.get('/users', verifyToken, requireAdmin, async (req, res) => {
  try {
    const usersRes = await query(
      `SELECT id, name, email, phone, role, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );
    res.json({
      success: true,
      count: usersRes.rows.length,
      users: usersRes.rows
    });
  } catch (err) {
    console.error('[Auth] Error al listar usuarios:', err);
    res.status(500).json({ success: false, message: 'Error al consultar usuarios.' });
  }
});

/**
 * PATCH /api/auth/users/:id/role
 * Cambiar rol de un usuario (Solo Admin)
 */
router.patch('/users/:id/role', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'customer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'El rol debe ser "admin" o "customer".'
      });
    }

    const updateRes = await query(
      `UPDATE users
       SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, name, email, role`,
      [role, id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    await query(
      `INSERT INTO activity_logs (user_id, user_name, action, details)
       VALUES ($1, $2, $3, $4)`,
      [req.user.id, req.user.name, 'CAMBIO_ROL', `Rol de ${updateRes.rows[0].email} modificado a ${role}`]
    );

    res.json({
      success: true,
      message: `Rol actualizado correctamente a ${role}.`,
      user: updateRes.rows[0]
    });
  } catch (err) {
    console.error('[Auth] Error al cambiar rol:', err);
    res.status(500).json({ success: false, message: 'Error al cambiar rol del usuario.' });
  }
});

module.exports = router;
