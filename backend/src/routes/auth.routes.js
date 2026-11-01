/**
 * Rutas de Autenticación, Sesiones Supabase Auth y Gestión de Usuarios para ALABASTRO
 * Soporta autenticación híbrida (Supabase GoTrue + PostgreSQL / Motor Local) y rutas protegidas por rol.
 */

'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const {
  verifyToken,
  requireAdmin,
  optionalAuth,
  JWT_SECRET
} = require('../middleware/auth');
const {
  isSupabaseAuthConfigured,
  getPublicSupabaseConfig,
  supabaseSignInWithPassword,
  supabaseSignUp,
  supabaseSignOut
} = require('../supabase');

/**
 * Construye un JWT y objeto `session` con la estructura estándar de Supabase Auth (`auth.jwt()`)
 * SEGURIDAD: `app_metadata.role` contiene el rol autoritativo; `user_metadata` solo datos de perfil.
 */
function buildSupabaseSession(user) {
  const authoritativeRole = user.role === 'admin' ? 'admin' : 'customer';
  const sub = user.auth_user_id || user.id;
  const expiresIn = 7 * 24 * 60 * 60; // 7 días en segundos
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

  const payload = {
    sub,
    id: user.id,
    aud: 'authenticated',
    role: authoritativeRole === 'admin' ? 'admin' : 'authenticated',
    email: user.email,
    app_metadata: {
      provider: 'email',
      providers: ['email'],
      role: authoritativeRole
    },
    user_metadata: {
      name: user.name,
      full_name: user.name,
      phone: user.phone || ''
    }
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  const safeUser = {
    id: user.id,
    auth_user_id: sub,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: authoritativeRole,
    app_metadata: payload.app_metadata,
    user_metadata: payload.user_metadata,
    createdAt: user.created_at || new Date().toISOString()
  };

  return {
    token,
    session: {
      access_token: token,
      token_type: 'bearer',
      expires_in: expiresIn,
      expires_at: expiresAt,
      user: safeUser
    },
    user: safeUser
  };
}

/**
 * Configura la cookie de sesión compatible con SSR / Middleware (`sb-access-token`)
 */
function setSessionCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    `sb-access-token=${encodeURIComponent(token)}; Path=/; Max-Age=604800; SameSite=Lax; HttpOnly`
  );
}

/**
 * Limpia la cookie de sesión al cerrar sesión
 */
function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    'sb-access-token=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly'
  );
}

/**
 * GET /api/auth/config
 * Devuelve la configuración pública de Supabase Auth (NUNCA expone service_role)
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    ...getPublicSupabaseConfig()
  });
});

/**
 * POST /api/auth/login
 * Iniciar sesión (clientes y administradores) con soporte Supabase Auth
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
    let userRes = await query('SELECT * FROM users WHERE email = $1', [cleanEmail]);

    // Si Supabase Cloud Auth está configurado, intentar login en GoTrue
    if (isSupabaseAuthConfigured()) {
      const sbAuth = await supabaseSignInWithPassword(cleanEmail, password);
      if (sbAuth && sbAuth.user && userRes.rows.length === 0) {
        // Sincronizar usuario de Supabase Auth en public.users (siempre customer por defecto salvo app_metadata.role === 'admin')
        const sbRole = (sbAuth.user.app_metadata && sbAuth.user.app_metadata.role === 'admin') ? 'admin' : 'customer';
        const salt = await bcrypt.genSalt(10);
        const passHash = await bcrypt.hash(password, salt);
        await query(
          `INSERT INTO users (id, name, email, phone, password_hash, role)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            sbAuth.user.id,
            (sbAuth.user.user_metadata && sbAuth.user.user_metadata.name) || cleanEmail.split('@')[0],
            cleanEmail,
            (sbAuth.user.user_metadata && sbAuth.user.user_metadata.phone) || '',
            passHash,
            sbRole
          ]
        );
        userRes = await query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
      }
    }

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

    const { token, session, user: safeUser } = buildSupabaseSession(user);
    setSessionCookie(res, token);

    // Registrar log si es administrador
    if (safeUser.role === 'admin') {
      await query(
        `INSERT INTO activity_logs (user_id, user_name, action, details)
         VALUES ($1, $2, $3, $4)`,
        [safeUser.id, safeUser.name, 'LOGIN_ADMIN', 'Ingreso autenticado a la Consola de Administración']
      );
    }

    return res.json({
      success: true,
      message: `¡Bienvenido/a de nuevo, ${safeUser.name.split(' ')[0]}!`,
      token,
      session,
      user: safeUser
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
 * Registro de nuevo cliente (SEGURIDAD: El rol se fuerza siempre a 'customer')
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

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres.'
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

    // Si Supabase Cloud Auth está activo, registrar también en auth.users
    if (isSupabaseAuthConfigured()) {
      await supabaseSignUp({
        email: cleanEmail,
        password,
        name: name.trim(),
        phone: phone ? phone.trim() : ''
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(password, salt);
    const userId = 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    // SEGURIDAD: El rol es SIEMPRE 'customer' en registro público (nunca se acepta req.body.role)
    const insertRes = await query(
      `INSERT INTO users (id, name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, 'customer')
       RETURNING id, name, email, phone, role, created_at`,
      [userId, name.trim(), cleanEmail, phone ? phone.trim() : null, passHash]
    );

    const newUser = insertRes.rows[0];
    const { token, session, user: safeUser } = buildSupabaseSession(newUser);
    setSessionCookie(res, token);

    return res.status(201).json({
      success: true,
      message: `¡Cuenta creada exitosamente! Bienvenido/a a ALABASTRO, ${safeUser.name.split(' ')[0]}.`,
      token,
      session,
      user: safeUser
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
 * POST /api/auth/logout
 * Cerrar sesión e invalidar cookie / token de Supabase Auth
 */
router.post('/logout', optionalAuth, async (req, res) => {
  try {
    if (req.accessToken && isSupabaseAuthConfigured()) {
      await supabaseSignOut(req.accessToken);
    }
    clearSessionCookie(res);
    return res.json({
      success: true,
      message: 'Sesión cerrada correctamente.'
    });
  } catch (err) {
    clearSessionCookie(res);
    return res.json({
      success: true,
      message: 'Sesión cerrada.'
    });
  }
});

/**
 * GET /api/auth/me
 * Ruta Protegida: Obtener perfil de usuario autenticado
 */
router.get('/me', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * GET /api/auth/session
 * Ruta Protegida: Obtener estado de sesión compatible con Supabase Auth
 */
router.get('/session', verifyToken, (req, res) => {
  res.json({
    success: true,
    session: {
      access_token: req.accessToken,
      token_type: 'bearer',
      user: req.user
    },
    user: req.user
  });
});

/**
 * PUT /api/auth/profile
 * Ruta Protegida: Actualizar nombre y teléfono del propio usuario autenticado
 */
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es obligatorio.'
      });
    }

    const cleanName = String(name).trim();
    const cleanPhone = phone !== undefined ? String(phone).trim() : (req.user.phone || '');

    const updateRes = await query(
      `UPDATE users
       SET name = $1, phone = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, email, phone, role`,
      [cleanName, cleanPhone, req.user.id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    return res.json({
      success: true,
      message: 'Perfil actualizado exitosamente.',
      user: updateRes.rows[0]
    });
  } catch (err) {
    console.error('[Auth] Error al actualizar perfil:', err);
    return res.status(500).json({ success: false, message: 'Error al actualizar el perfil.' });
  }
});

/**
 * GET /api/auth/users
 * Ruta Protegida (Solo Admin): Listado de usuarios registrados
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
 * Ruta Protegida (Solo Admin): Cambiar rol de un usuario
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
