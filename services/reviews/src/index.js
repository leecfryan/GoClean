require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { init } = require('./db');
const reviewRoutes = require('./routes/reviews');

const app  = express();
const PORT = process.env.PORT || 5003;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'reviews' }));
app.use('/', reviewRoutes);

init()
  .then(() => app.listen(PORT, () => console.log(`Reviews service running on port ${PORT}`)))
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
