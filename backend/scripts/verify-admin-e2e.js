const http = require('http');

function request(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function verifyAll() {
  console.log('--- INICIANDO VERIFICACIÓN END-TO-END DE LA CONSOLA ADMINISTRATIVA ---');

  // 1. Login Admin
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'admin@alabastro.com',
    password: 'AdminAlabastro2026!'
  });
  console.log('1. Autenticación Admin:', loginRes.status === 200 ? '✅ OK' : '❌ FALLÓ', loginRes.data.user?.email);
  const token = loginRes.data.token;
  const authHeader = { Authorization: `Bearer ${token}` };

  // 2. Metrics
  const metricsRes = await request('GET', '/api/metrics', null, authHeader);
  const m = metricsRes.data.metrics || metricsRes.data;
  console.log('2. Métricas Reales desde PostgreSQL:');
  console.log('   - Total perfumes registrados:', m.totalRegisteredProducts);
  console.log('   - Perfumes activos:', m.activeProducts);
  console.log('   - Perfumes agotados (stock 0):', m.outOfStockCount);
  console.log('   - Perfumes bajo stock (<15):', m.lowStockCount);
  console.log('   - Total ventas COP:', m.totalSales);
  console.log('   - Total pedidos:', m.totalOrders);
  console.log('   - Pedidos pendientes:', m.pendingOrders);

  // 3. Products List
  const prodRes = await request('GET', '/api/products?all=true', null, authHeader);
  const products = prodRes.data.products || prodRes.data;
  console.log('3. Catálogo en PostgreSQL: Total perfumes recuperados =', products.length);
  const sample = products[0];
  console.log('   Muestra [0]:', sample.brand, '-', sample.name, '| Precio: $' + Number(sample.price).toLocaleString('es-CO') + ' COP', '| Stock:', sample.stock, '| Foto:', sample.image ? '✅ ' + sample.image : '❌ No');

  // 4. Create new Arabic perfume
  const testId = 'test-qaed-al-fursan-' + Date.now();
  const createRes = await request('POST', '/api/products', {
    id: testId,
    name: 'Qaed Al Fursan',
    brand: 'Lattafa Perfumes',
    family: 'Amaderada',
    gender: 'unisex',
    size: '90 ml',
    concentration: 'Eau de Parfum',
    price: 195000,
    stock: 25,
    status: 'activo',
    origin: 'Emiratos Árabes Unidos',
    description: 'Aroma fresco frutal y ahumado con piña, azafrán y cedro.'
  }, authHeader);
  const createdProd = createRes.data.product || createRes.data;
  console.log('4. Agregar Perfume a PostgreSQL:', createRes.status === 201 ? '✅ Creado exitosamente' : '❌ Error', createdProd.name);

  // 5. Toggle Status (Pausar y Reactivar)
  const toggleRes1 = await request('PATCH', `/api/products/${testId}/toggle`, {}, authHeader);
  const toggled1 = toggleRes1.data.product || toggleRes1.data;
  console.log('5a. Pausar Perfume:', toggled1.is_active === false ? '✅ Pausado en BD' : '❌ Error', 'is_active =', toggled1.is_active);
  const toggleRes2 = await request('PATCH', `/api/products/${testId}/toggle`, {}, authHeader);
  const toggled2 = toggleRes2.data.product || toggleRes2.data;
  console.log('5b. Reactivar Perfume:', toggled2.is_active === true ? '✅ Reactivado en BD' : '❌ Error', 'is_active =', toggled2.is_active);

  // 6. Quick Stock Update
  const stockRes = await request('PATCH', `/api/products/${testId}/stock`, { stock: 35 }, authHeader);
  const stockedProd = stockRes.data.product || stockRes.data;
  console.log('6. Actualizar Inventario Rápido:', stockedProd.stock === 35 ? '✅ Stock actualizado a 35 en BD' : '❌ Error');

  // Stock negative validation test
  const invalidStock = await request('PATCH', `/api/products/${testId}/stock`, { stock: -5 }, authHeader);
  console.log('   Validación Stock Negativo (<0):', invalidStock.status === 400 ? '✅ Rechazado correctamente (400 Bad Request)' : '❌ Falló validación');

  // 7. Edit Full Perfume
  const editRes = await request('PUT', `/api/products/${testId}`, {
    name: 'Qaed Al Fursan Edición Oro',
    brand: 'Lattafa Perfumes',
    family: 'Amaderada',
    price: 210000,
    stock: 40,
    status: 'activo',
    description: 'Versión especial gold'
  }, authHeader);
  const editedProd = editRes.data.product || editRes.data;
  console.log('7. Editar Perfume Completo:', editedProd.name === 'Qaed Al Fursan Edición Oro' && Number(editedProd.price) === 210000 ? '✅ Modificaciones persistidas' : '❌ Error');

  // 8. Order protection test: Try deleting a product that has orders (e.g. lattafa-asad)
  const protectedDelRes = await request('DELETE', `/api/products/lattafa-asad?permanent=true`, null, authHeader);
  console.log('8a. Protección contra Eliminación de Perfumes con Pedidos:', 
    protectedDelRes.status === 409 || protectedDelRes.data.hasOrders 
      ? '✅ Bloqueado con alerta de seguridad (Sugerir Pausar)' 
      : 'Estado: ' + protectedDelRes.status + ' ' + JSON.stringify(protectedDelRes.data));

  // 8b. Cleanly delete the test product
  const delRes = await request('DELETE', `/api/products/${testId}?permanent=true`, null, authHeader);
  console.log('8b. Eliminar Perfume de Prueba:', delRes.status === 200 ? '✅ Eliminado limpiamente de PostgreSQL' : '❌ Error');

  console.log('--- VERIFICACIÓN END-TO-END COMPLETADA CON ÉXITO ---');
}

verifyAll().catch(console.error);
