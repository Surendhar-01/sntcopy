const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth');
const dbRoutes = require('./routes/db');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const categoriesRoutes = require('./routes/categories');
const settingsRoutes = require('./routes/settings');
const usersRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const { verifyToken } = require('./middlewares/authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ name: 'Sri Nikil ERP API', status: 'ok', docs: '/docs' });
});

app.get('/docs', (req, res) => {
  res.json({
    name: 'Sri Nikil ERP API',
    baseUrl: '/api',
    endpoints: [
      'GET /api/db',
      'POST /api/auth/login',
      'GET /api/dashboard',
      'GET /api/categories',
      'POST /api/bills',
      'DELETE /api/bills/:id',
      'DELETE /api/bills',
      'POST /api/products',
      'PUT /api/products/:id/price',
      'DELETE /api/products/:id',
      'GET /api/users',
      'POST /api/accounts',
      'PUT /api/accounts/:user/password',
      'DELETE /api/accounts/:user',
      'GET /api/settings',
      'PUT /api/settings'
    ]
  });
});

app.use('/api', authRoutes);
app.use('/api', verifyToken, dbRoutes);
app.use('/api', verifyToken, dashboardRoutes);
app.use('/api', verifyToken, categoriesRoutes);
app.use('/api', verifyToken, ordersRoutes);
app.use('/api', verifyToken, productsRoutes);
app.use('/api', verifyToken, usersRoutes);
app.use('/api', verifyToken, settingsRoutes);

app.use(errorHandler);

module.exports = app;
