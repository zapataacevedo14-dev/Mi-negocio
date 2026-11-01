/**
 * Middleware de Autenticación y Rutas Protegidas (Supabase Auth + JWT) para ALABASTRO
 * Cumple con las directrices oficiales de seguridad de Supabase:
 *  - Verificación de sesión contra base de datos / Supabase Auth (`getUser`).
 *  - Prohibido usar `user_metadata` para autorización o roles (solo `public.users.role` y `app_metadata`).
 */

'use strict';

const jwt = require('jsonwebtoken');
const { query } = require('../db');
const {
  SUPABASE_JWT_SECRET,
  isSupabaseAuthConfigured,
  getSupabaseUser
} = require('../supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'alabastro_super_secret_jwt_key_2026_luxury_perfumes_signature';

/**
 * Extrae el token Bearer de cabeceras Authorization, cookies `sb-access-token` o query
 */
function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1].trim();
  }
  if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)sb-access-token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}

/**
 * Decodifica y verifica un token JWT usando SUPABASE_JWT_SECRET, JWT_SECRET o Supabase Auth `getUser()`
 */
async function resolveAuthenticatedUser(token) {
  let decoded = null;

  // 1. Intentar verificar con JWT_SECRET local o SUPABASE_JWT_SECRET
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (localErr) {
    if (SUPABASE_JWT_SECRET) {
      try {
        decoded = jwt.verify(token, SUPABASE_JWT_SECRET);
      } catch {
        decoded = null;
      }
    }
  }

  // 2. Si Supabase Cloud Auth está configurado y el token fue emitido por Supabase GoTrue, validar con getUser()
  if (!decoded && isSupabaseAuthConfigured()) {
    const sbUser = await getSupabaseUser(token);
    if (sbUser && sbUser.id) {
      decoded = {
        sub: sbUser.id,
        id: sbUser.id,
        email: sbUser.email,
        app_metadata: sbUser.app_metadata || {},
        user_metadata: sbUser.user_metadata || {}
      };
    }
  }

  if (!decoded) {
    return null;
  }

  const lookupId = decoded.id || decoded.sub;
  const lookupEmail = decoded.email ? decoded.email.trim().toLowerCase() : null;

  // 3. Consultar usuario en public.users por ID / auth_user_id o email
  let userRes = await query('SELECT id, name, email, phone, role FROM users WHERE id = $1', [lookupId]);
  if (userRes.rows.length === 0 && lookupEmail) {
    userRes = await query('SELECT id, name, email, phone, role FROM users WHERE email = $1', [lookupEmail]);
  }

  if (userRes.rows.length === 0) {
    return null;
  }

  const dbUser = userRes.rows[0];

  // SEGURIDAD SUPABASE: El rol autoritativo proviene SIEMPRE de `public.users.role`
  // o `app_metadata.role` (server-side), NUNCA de `user_metadata`.
  const authoritativeRole = dbUser.role === 'admin' ||
    (decoded.app_metadata && decoded.app_metadata.role === 'admin')
    ? 'admin'
    : 'customer';

  return {
    id: dbUser.id,
    sub: decoded.sub || dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    phone: dbUser.phone,
    role: authoritativeRole
  };
}

/**
 * Middleware para rutas protegidas: requiere sesión autenticada válida
 */
async function verifyToken(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_REQUIRED',
        message: 'Acceso no autorizado: Se requiere iniciar sesión.'
      });
    }

    const user = await resolveAuthenticatedUser(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_SESSION',
        message: 'Sesión inválida, expirada o usuario no encontrado.'
      });
    }

    req.user = user;
    req.accessToken = token;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      code: 'TOKEN_ERROR',
      message: 'Token inválido o expirado.',
      error: err.message
    });
  }
}

/**
 * Middleware para rutas protegidas exclusivas de Administración (`role === 'admin'`)
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      code: 'ADMIN_REQUIRED',
      message: 'Acceso denegado: Se requieren privilegios de Administrador para esta ruta protegida.'
    });
  }
  next();
}

/**
 * Middleware opcional: adjunta `req.user` si hay un token válido, o continúa como `anon`
 */
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (token) {
      const user = await resolveAuthenticatedUser(token);
      if (user) {
        req.user = user;
        req.accessToken = token;
      }
    }
  } catch {
    // Continuar como visitante anónimo (anon)
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
  optionalAuth,
  extractToken,
  resolveAuthenticatedUser,
  JWT_SECRET
};
