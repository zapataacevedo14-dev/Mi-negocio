const fs = require('fs');
const path = require('path');
const { initDatabase, query } = require('../src/db');

async function checkImages() {
  await initDatabase();
  const res = await query('SELECT id, name, brand, image FROM products ORDER BY id ASC');
  console.log('Total perfumes en PostgreSQL:', res.rows.length);
  const rootDir = path.resolve(__dirname, '..', '..');

  for (let i = 0; i < res.rows.length; i++) {
    const p = res.rows[i];
    const rawImage = p.image || '';
    const cleanPath = rawImage.replace(/^[\/\\]/, '');
    const fullDiskPath = path.join(rootDir, cleanPath);
    const exists = fs.existsSync(fullDiskPath);
    const size = exists ? fs.statSync(fullDiskPath).size : 0;
    console.log(`[${i + 1}] ID: ${p.id} | ${p.brand} - ${p.name}`);
    console.log(`    DB: "${p.image}" | Existe: ${exists ? '✅' : '❌'} (${size} bytes)`);
  }
}

checkImages().catch(console.error);
