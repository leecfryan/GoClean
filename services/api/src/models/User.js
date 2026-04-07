const { pool } = require('../db');

const findById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, email, age, address, tier, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

const findAll = async ({ limit, offset }) => {
  const [{ rows: users }, { rows: [{ count }] }] = await Promise.all([
    pool.query(
      'SELECT id, email, age, address, tier, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    ),
    pool.query('SELECT COUNT(*)::int FROM users'),
  ]);
  return { users, total: count };
};

const update = async (id, fields) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return findById(id);

  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const values = [...Object.values(fields), id];

  const { rows } = await pool.query(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING id, email, age, address, tier, created_at`,
    values
  );
  return rows[0] || null;
};

const remove = async (id) => {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
};

module.exports = { findById, findAll, update, remove };
