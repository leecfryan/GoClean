require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api' }));
app.use('/users', userRoutes);

pool.connect()
  .then((client) => {
    client.release();
    console.log('API service connected to PostgreSQL');
    app.listen(PORT, () => console.log(`API service running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('PostgreSQL connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
