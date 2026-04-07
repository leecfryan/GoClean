require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env;

if (!email || !password) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.POSTGRES_URI });

(async () => {
  const hashed = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (email, password, role)
     VALUES ($1, $2, 'admin')
     ON CONFLICT (email) DO UPDATE SET role = 'admin'`,
    [email, hashed]
  );
  console.log(`Admin user ready: ${email}`);
  await pool.end();
})().catch((err) => { console.error(err.message); process.exit(1); });
