/**
 * Verificación End-to-End de Supabase Auth y Rutas Protegidas (RBAC + Checklist de Seguridad)
 */

'use strict';

const BASE = 'http://localhost:3000';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data, headers: res.headers };
}

async function run() {
  console.log('===================================================================');
  console.log(' 🔐 VERIFICACIÓN E2E: SUPABASE AUTH & RUTAS PROTEGIDAS ALABASTRO');
  console.log('===================================================================');

  // 1. Configuración pública segura (Nunca expone service_role)
  const cfg = await req('/api/auth/config');
  if (cfg.status !== 200 || !cfg.data.success || cfg.data.serviceRoleKey || cfg.data.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Fallo en /api/auth/config o exposición indebida de clave privada');
  }
  console.log('✅ 1. /api/auth/config seguro (sin service_role expuesta):', cfg.data.authProvider);

  // 2. Bloqueo 401 en rutas protegidas sin token
  const unauthChecks = [
    await req('/api/auth/me'),
    await req('/api/orders/my-orders'),
    await req('/api/metrics'),
    await req('/api/auth/users'),
    await req('/api/orders'),
    await req('/api/settings', { method: 'PUT', body: JSON.stringify({ storeName: 'Hack' }) })
  ];
  if (unauthChecks.some(c => c.status !== 401)) {
    throw new Error('Ruta protegida permitió acceso sin token: ' + JSON.stringify(unauthChecks.map(c => c.status)));
  }
  console.log('✅ 2. Bloqueo 401 Unauthorized verificado en todas las rutas protegidas para visitantes anónimos');

  // 3. Prevención de escalación de privilegios en Registro (intentar inyectar role: 'admin')
  const testEmail = `cliente.vip.${Date.now()}@alabastro.co`;
  const reg = await req('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Camila Restrepo',
      email: testEmail,
      phone: '+57 300 123 4567',
      password: 'PasswordSeguro2026!',
      role: 'admin',
      user_metadata: { role: 'admin' }
    })
  });
  if (reg.status !== 201 || !reg.data.token || reg.data.user.role !== 'customer' || reg.data.session.user.app_metadata.role !== 'customer') {
    throw new Error('Fallo en protección de rol durante registro: ' + JSON.stringify(reg.data));
  }
  console.log('✅ 3. Prevención de auto-asignación de rol admin en /api/auth/register verificada (forzado a customer)');

  const customerToken = reg.data.token;

  // 4. Acceso de Cliente a sus rutas protegidas (/api/auth/me, /api/auth/session, /api/orders/my-orders, PUT /api/auth/profile)
  const custMe = await req('/api/auth/me', { headers: { Authorization: `Bearer ${customerToken}` } });
  const custOrders = await req('/api/orders/my-orders', { headers: { Authorization: `Bearer ${customerToken}` } });
  const custProfile = await req('/api/auth/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({ name: 'Camila Restrepo VIP', phone: '+57 311 000 1122' })
  });
  if (custMe.status !== 200 || custOrders.status !== 200 || custProfile.status !== 200) {
    throw new Error('Cliente autenticado no pudo acceder a sus propias rutas protegidas');
  }
  console.log('✅ 4. Rutas protegidas de cliente (/api/auth/me, /api/orders/my-orders, /api/auth/profile) responden 200 OK');

  // 5. Bloqueo 403 Forbidden cuando un Cliente intenta acceder a rutas exclusivas de Admin
  const forbiddenChecks = [
    await req('/api/metrics', { headers: { Authorization: `Bearer ${customerToken}` } }),
    await req('/api/auth/users', { headers: { Authorization: `Bearer ${customerToken}` } }),
    await req('/api/orders', { headers: { Authorization: `Bearer ${customerToken}` } }),
    await req('/api/subscribers', { headers: { Authorization: `Bearer ${customerToken}` } }),
    await req('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({ name: 'Intento Cliente', family: 'oriental', price: 200000 })
    })
  ];
  if (forbiddenChecks.some(c => c.status !== 403)) {
    throw new Error('Ruta de Admin permitió acceso a rol customer: ' + JSON.stringify(forbiddenChecks.map(c => c.status)));
  }
  console.log('✅ 5. Bloqueo 403 Forbidden verificado: un usuario "customer" NO puede acceder a endpoints de Administración');

  // 6. Login de Administrador y acceso completo a rutas protegidas de Consola
  const adminLogin = await req('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@alabastro.com', password: 'AdminAlabastro2026!' })
  });
  if (adminLogin.status !== 200 || !adminLogin.data.token || adminLogin.data.user.role !== 'admin' || adminLogin.data.session.user.app_metadata.role !== 'admin') {
    throw new Error('Fallo en login de Administrador: ' + JSON.stringify(adminLogin.data));
  }
  const adminToken = adminLogin.data.token;

  const adminMetrics = await req('/api/metrics', { headers: { Authorization: `Bearer ${adminToken}` } });
  const adminUsers = await req('/api/auth/users', { headers: { Authorization: `Bearer ${adminToken}` } });
  if (adminMetrics.status !== 200 || adminUsers.status !== 200) {
    throw new Error('Administrador no pudo acceder a /api/metrics o /api/auth/users');
  }
  console.log('✅ 6. Acceso de Administrador (app_metadata.role = "admin") verificado en /api/metrics y /api/auth/users (200 OK)');

  // 7. Logout e invalidación de cookie
  const logoutRes = await req('/api/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  if (logoutRes.status !== 200 || !logoutRes.data.success) {
    throw new Error('Fallo en /api/auth/logout');
  }
  console.log('✅ 7. /api/auth/logout ejecutado correctamente');
  console.log('===================================================================');
  console.log(' 🎉 TODAS LAS PRUEBAS DE SUPABASE AUTH Y RUTAS PROTEGIDAS PASARON');
  console.log('===================================================================');
}

run().catch(err => {
  console.error('❌ ERROR EN VERIFICACIÓN:', err.message);
  process.exit(1);
});

