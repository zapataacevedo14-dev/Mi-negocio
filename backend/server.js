/**
 * ALABASTRO — Servidor Principal Node.js & Express
 * API RESTful, Integración PostgreSQL Dockerizada y Consola de Administración.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase, pool, query, isPostgresConnected } = require('./src/db');

// Rutas API
const authRoutes = require('./src/routes/auth.routes');
const productsRoutes = require('./src/routes/products.routes');
const ordersRoutes = require('./src/routes/orders.routes');
const subscribersRoutes = require('./src/routes/subscribers.routes');
const reviewsRoutes = require('./src/routes/reviews.routes');
const settingsRoutes = require('./src/routes/settings.routes');
const metricsRoutes = require('./src/routes/metrics.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Middlewares globales
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Healthcheck del servicio y base de datos
app.get('/api/health', async (req, res) => {
  try {
    const dbCheck = await query('SELECT NOW() as current_time, COUNT(*) as products_count FROM products');
    res.json({
      status: 'UP',
      service: 'ALABASTRO API & Admin Console',
      database: isPostgresConnected() ? 'PostgreSQL 16 (Docker)' : 'Alabastro Local Resiliente (JSON Store)',
      serverTime: dbCheck.rows[0].current_time,
      productsCount: parseInt(dbCheck.rows[0].products_count, 10)
    });
  } catch (err) {
    res.status(500).json({
      status: 'DOWN',
      error: err.message
    });
  }
});

// 3. Montaje de Rutas API REST
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/subscribers', subscribersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/metrics', metricsRoutes);

// 4. Servir recursos estáticos de ALABASTRO (Fotografías y multimedia)
const assetsPath = path.resolve(__dirname, '..', 'assets');
app.use('/assets', express.static(assetsPath));
app.use('/consola/assets', express.static(assetsPath));

// 5. Servir la Consola de Administración en la ruta /consola
const consolaStaticPath = path.join(__dirname, 'public', 'consola');
app.get('/consola', (req, res, next) => {
  if (req.originalUrl === '/consola') {
    return res.redirect(301, '/consola/');
  }
  next();
});
app.use('/consola', express.static(consolaStaticPath, { index: 'index.html' }));

// Navegación SPA de la consola (solo para rutas de vistas, nunca para archivos estáticos)
app.get('/consola/*', (req, res, next) => {
  if (req.path.match(/\.(png|jpe?g|svg|webp|gif|css|js|map|ico|woff2?|ttf)$/i)) {
    return next();
  }
  res.sendFile(path.join(consolaStaticPath, 'index.html'));
});

// 6. Servir el Frontend de la Tienda Principal (Raíz del proyecto)
const frontendPath = path.resolve(__dirname, '..');
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 6. Manejador de errores no capturados
app.use((err, req, res, next) => {
  console.error('[Error de Servidor]', err);
  res.status(500).json({
    success: false,
    message: 'Ha ocurrido un error inesperado en el servidor.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 7. Arranque del servidor e inicialización de PostgreSQL
async function startServer() {
  try {
    console.log('[Servidor] Verificando e inicializando base de datos PostgreSQL Dockerizada...');
    await initDatabase();

    app.listen(PORT, () => {
      console.log('====================================================================');
      console.log(` ✨ ALABASTRO — Servidor Backend & Consola Activo en Puerto ${PORT}`);
      console.log(` 🛍️  Tienda Virtual Pública:       http://localhost:${PORT}/`);
      console.log(` 🔒 Consola de Administración:    http://localhost:${PORT}/consola`);
      console.log(` 🐘 Base de Datos:                PostgreSQL Docker (localhost:5432)`);
      console.log(` 👑 Usuario Maestro Consola:      ${process.env.ADMIN_EMAIL || 'admin@alabastro.com'}`);
      console.log('====================================================================');
    });
  } catch (err) {
    console.error('[Servidor Fatal] No fue posible inicializar la base de datos o el servidor:', err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
