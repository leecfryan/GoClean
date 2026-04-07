const { pool } = require('../db');
const bcrypt = require('bcryptjs');

const findByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
};

const findById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, email, age, address, role, tier, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

const create = async ({ email, password }) => {
  const hashed = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, age, address, role, tier, created_at',
    [email, hashed]
  );
  return rows[0];
};

const comparePassword = (candidate, hashed) => bcrypt.compare(candidate, hashed);

const addRefreshToken = (userId, token) =>
  pool.query('INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)', [userId, token]);

const removeRefreshToken = (token) =>
  pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);

const hasRefreshToken = async (userId, token) => {
  const { rows } = await pool.query(
    'SELECT 1 FROM refresh_tokens WHERE user_id = $1 AND token = $2',
    [userId, token]
  );
  return rows.length > 0;
};

const revokeAllTokens = (userId) =>
  pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);

module.exports = { findByEmail, findById, create, comparePassword, addRefreshToken, removeRefreshToken, hasRefreshToken, revokeAllTokens };
