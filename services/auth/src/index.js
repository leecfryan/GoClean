require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { init } = require('./db');

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/health', (_req, res) => res.json({ status: 'ok', service: 'auth' }));
app.use('/', authRoutes);

init()
  .then(() => {
    console.log('Auth service connected to PostgreSQL');
    app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('PostgreSQL connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
