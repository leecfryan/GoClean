require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { init } = require('./db');
const companyRoutes = require('./routes/companies');

const app  = express();
const PORT = process.env.PORT || 5002;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'companies' }));
app.use('/', companyRoutes);

init()
  .then(() => app.listen(PORT, () => console.log(`Companies service running on port ${PORT}`)))
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
