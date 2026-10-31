/**
 * Middleware de Autenticación y Verificación de Roles para ALABASTRO
 */

const jwt = require('jsonwebtoken');
const { query } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'alabastro_super_secret_jwt_key_2026_luxury_perfumes_signature';

/**
 * Verifica si la petición incluye un token JWT válido (en cabecera Authorization o Cookie)
 */
async function verifyToken(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado: Se requiere token de autenticación.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Verificar que el usuario aún exista en la base de datos
    const userRes = await query('SELECT id, name, email, phone, role FROM users WHERE id = $1', [decoded.id]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o sesión invalidada.'
      });
    }

    req.user = userRes.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado.',
      error: err.message
    });
  }
}

/**
 * Middleware para requerir que el usuario tenga rol de administrador
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado: Se requieren privilegios de Administrador para la Consola.'
    });
  }
  next();
}

/**
 * Middleware opcional: carga el usuario si hay token, pero no bloquea si no lo hay
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const userRes = await query('SELECT id, name, email, phone, role FROM users WHERE id = $1', [decoded.id]);
      if (userRes.rows.length > 0) {
        req.user = userRes.rows[0];
      }
    }
  } catch {
    // Continuar como usuario anónimo
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
  optionalAuth,
  JWT_SECRET
};
