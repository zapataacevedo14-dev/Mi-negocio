/**
 * ALABASTRO — Integración Oficial con Supabase Auth (GoTrue REST & JWT)
 * Cumple con el Checklist de Seguridad de Supabase:
 *  - Nunca expone `service_role` al navegador.
 *  - Valida tokens con `getUser()` contra el servidor de Auth cuando SUPABASE_URL está activo.
 *  - Nunca confía en `user_metadata` para decisiones de autorización o asignación de rol `admin`.
 */

'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config();

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const SUPABASE_JWT_SECRET = (process.env.SUPABASE_JWT_SECRET || '').trim();

function getApiKey() {
  return SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY || '';
}

/**
 * Indica si el proyecto tiene configuradas las credenciales de Supabase Cloud Auth
 */
function isSupabaseAuthConfigured() {
  return Boolean(
    SUPABASE_URL &&
    (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY) &&
    !SUPABASE_URL.includes('[YOUR-') &&
    !SUPABASE_URL.includes('[PROJECT-REF]')
  );
}

/**
 * Configuración pública segura para el cliente (NUNCA incluye service_role)
 */
function getPublicSupabaseConfig() {
  const isConfigured = isSupabaseAuthConfigured();
  // Solo enviar anonKey si es explícitamente anon / publishable (no secret)
  const isAnonPublishable = SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.startsWith('sb_secret_');
  return {
    enabled: isConfigured,
    supabaseUrl: isConfigured ? SUPABASE_URL : null,
    supabaseAnonKey: isAnonPublishable ? SUPABASE_ANON_KEY : null,
    authProvider: isConfigured ? 'supabase-cloud' : 'alabastro-supabase-jwt'
  };
}

/**
 * Equivalente a `supabase.auth.getUser(jwt)` — Valida el token directamente contra
 * el servidor Supabase Auth (`/auth/v1/user`) para detectar sesiones revocadas.
 */
async function getSupabaseUser(accessToken) {
  if (!isSupabaseAuthConfigured() || !accessToken) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'apikey': getApiKey(),
        'Authorization': `Bearer ${accessToken}`
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Equivalente a `supabase.auth.signInWithPassword({ email, password })`
 */
async function supabaseSignInWithPassword(email, password) {
  if (!isSupabaseAuthConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': getApiKey(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error_description || data.msg || 'Credenciales inválidas en Supabase Auth' };
    }
    return { session: data, user: data.user };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Equivalente a `supabase.auth.signUp({ email, password, options: { data } })`
 * SEGURIDAD: Solo envía `name` y `phone` en `data` (user_metadata), NUNCA `role`.
 */
async function supabaseSignUp({ email, password, name, phone }) {
  if (!isSupabaseAuthConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': getApiKey(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        data: {
          name: name || '',
          full_name: name || '',
          phone: phone || ''
        }
      })
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error_description || data.msg || 'No fue posible registrar el usuario en Supabase Auth' };
    }
    return { session: data.access_token ? data : null, user: data.user || data };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Equivalente a `supabase.auth.refreshSession({ refresh_token })`
 */
async function supabaseRefreshSession(refreshToken) {
  if (!isSupabaseAuthConfigured() || !refreshToken) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'apikey': getApiKey(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    const data = await res.json();
    if (!res.ok) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Equivalente a `supabase.auth.signOut()`
 */
async function supabaseSignOut(accessToken) {
  if (!isSupabaseAuthConfigured() || !accessToken) return true;
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'apikey': getApiKey(),
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_JWT_SECRET,
  isSupabaseAuthConfigured,
  getPublicSupabaseConfig,
  getSupabaseUser,
  supabaseSignInWithPassword,
  supabaseSignUp,
  supabaseRefreshSession,
  supabaseSignOut
};

