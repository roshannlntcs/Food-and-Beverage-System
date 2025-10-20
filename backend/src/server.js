// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// allowlist for dev
const allow = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl/Postman
    if (allow.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for ${origin}`));
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// generic preflight responder
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const { authRequired } = require('./middleware');

// routes
app.use('/auth', require('./routes/auth.routes'));

// Allow GET /products without auth; require auth for POST/PUT/DELETE.
const productsRouter = require('./routes/products.routes');
app.use(
  '/products',
  (req, res, next) => (req.method === 'GET' ? next() : authRequired(req, res, next)),
  productsRouter
);

// keep others protected
app.use('/categories', authRequired, require('./routes/categories.routes'));
app.use('/orders', authRequired, require('./routes/orders.routes'));
app.use('/voids', authRequired, require('./routes/voids.routes'));
app.use('/users', authRequired, require('./routes/users.routes'));

app.use('/analytics', authRequired, require('./routes/analytics.routes'));
app.use('/suppliers', authRequired, require('./routes/suppliers.routes'));
app.use('/admin', authRequired, require('./routes/admin.routes'));
app.use('/inventory/logs', authRequired, require('./routes/inventoryLogs.routes'));


app.get('/health', (_req, res) => res.json({
  ok: true,
  env: {
    PORT: process.env.PORT,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    NODE_ENV: process.env.NODE_ENV
  }
}));

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port} (origins: ${allow.join(', ') || 'any'})`);
});
