const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const bodyBuffer = Buffer.concat(data);
        resolve({
          status: res.statusCode,
          headers: res.headers,
          length: bodyBuffer.length,
          type: res.headers['content-type']
        });
      });
    }).on('error', reject);
  });
}

async function verifyCatalogImages() {
  console.log('====================================================================');
  console.log('     AUDITORÍA DE FOTOGRAFÍAS REALES DE PERFUMES (ALABASTRO)       ');
  console.log('====================================================================');

  // 1. Obtener lista desde la API backend
  const apiRes = await get('http://localhost:3000/api/products?all=true');
  const bodyText = (await new Promise(r => {
    http.get('http://localhost:3000/api/products?all=true', res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => r(b));
    });
  }));

  const json = JSON.parse(bodyText);
  const products = json.products;
  console.log(`Catálogo recuperado desde PostgreSQL: ${products.length} perfumes auténticos.\n`);

  let allOk = true;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const imagePath = p.image.replace(/^\//, '');

    // Probar entrega directa desde la raíz (Tienda Pública)
    const storeUrl = `http://localhost:3000/${imagePath}`;
    const storeRes = await get(storeUrl);

    // Probar entrega bajo el subpath de la consola (/consola)
    const consolaUrl = `http://localhost:3000/consola/${imagePath}`;
    const consolaRes = await get(consolaUrl);

    const storeOk = storeRes.status === 200 && storeRes.type && storeRes.type.startsWith('image/');
    const consolaOk = consolaRes.status === 200 && consolaRes.type && consolaRes.type.startsWith('image/');

    console.log(`[${i + 1}/${products.length}] ${p.brand} — ${p.name}`);
    console.log(`    Ruta en BD:     "${p.image}"`);
    console.log(`    Tienda Pública: ${storeOk ? '✅ OK' : '❌ ERROR'} [${storeRes.status} ${storeRes.type} (${storeRes.length} bytes)]`);
    console.log(`    Consola Admin:  ${consolaOk ? '✅ OK' : '❌ ERROR'} [${consolaRes.status} ${consolaRes.type} (${consolaRes.length} bytes)]`);

    if (!storeOk || !consolaOk) {
      allOk = false;
    }
  }

  console.log('====================================================================');
  if (allOk) {
    console.log(' 🎉 RESULTADO: 100% DE LAS FOTOGRAFÍAS CARGAN CORRECTAMENTE');
    console.log('    Tanto en la Consola Administrativa como en la Tienda Pública.');
  } else {
    console.log(' ⚠️ RESULTADO: Se encontraron problemas en algunas imágenes.');
  }
  console.log('====================================================================');
}

verifyCatalogImages().catch(console.error);
