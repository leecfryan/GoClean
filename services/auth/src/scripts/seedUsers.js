require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { Pool } = require('pg');
const bcrypt   = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.POSTGRES_URI });

const USERS = [
  { email: 'james.wilson@email.com',   age: 34, address: '12 Oak Street, Manchester',       tier: 'gold'     },
  { email: 'sarah.johnson@email.com',  age: 28, address: '5 Maple Avenue, London',           tier: 'platinum' },
  { email: 'michael.brown@email.com',  age: 45, address: '89 Pine Road, Birmingham',         tier: 'silver'   },
  { email: 'emily.davis@email.com',    age: 31, address: '7 Rose Lane, Leeds',               tier: 'normal'   },
  { email: 'daniel.taylor@email.com',  age: 52, address: '23 Birch Close, Bristol',          tier: 'gold'     },
  { email: 'jessica.moore@email.com',  age: 26, address: '41 Elm Way, Sheffield',            tier: 'silver'   },
  { email: 'chris.martin@email.com',   age: 39, address: '16 Ash Drive, Liverpool',          tier: 'normal'   },
  { email: 'laura.white@email.com',    age: 33, address: '8 Cedar Court, Edinburgh',         tier: 'platinum' },
  { email: 'robert.harris@email.com',  age: 47, address: '55 Willow Street, Cardiff',        tier: 'silver'   },
  { email: 'amanda.clark@email.com',   age: 29, address: '3 Poplar Grove, Nottingham',       tier: 'normal'   },
  { email: 'steven.lewis@email.com',   age: 41, address: '19 Hawthorn Place, Glasgow',       tier: 'gold'     },
  { email: 'natalie.walker@email.com', age: 36, address: '62 Sycamore Road, Brighton',       tier: 'silver'   },
  { email: 'paul.hall@email.com',      age: 58, address: '11 Chestnut Lane, Oxford',         tier: 'normal'   },
  { email: 'rachel.young@email.com',   age: 24, address: '30 Beech Avenue, Cambridge',       tier: 'normal'   },
  { email: 'mark.allen@email.com',     age: 43, address: '77 Linden Way, Southampton',       tier: 'silver'   },
  { email: 'helen.king@email.com',     age: 37, address: '14 Magnolia Close, Portsmouth',    tier: 'gold'     },
  { email: 'andrew.scott@email.com',   age: 50, address: '26 Acacia Drive, Newcastle',       tier: 'normal'   },
  { email: 'lucy.green@email.com',     age: 22, address: '4 Jasmine Court, Leicester',       tier: 'normal'   },
  { email: 'kevin.adams@email.com',    age: 48, address: '38 Laurel Road, Coventry',         tier: 'silver'   },
  { email: 'claire.baker@email.com',   age: 32, address: '9 Rosewood Street, Exeter',        tier: 'gold'     },
];

const PASSWORD = 'Password123!';

(async () => {
  const hashed = await bcrypt.hash(PASSWORD, 10);
  let inserted = 0;
  let skipped  = 0;

  for (const u of USERS) {
    const res = await pool.query(
      `INSERT INTO users (email, password, age, address, tier)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [u.email, hashed, u.age, u.address, u.tier]
    );
    if (res.rowCount > 0) inserted++;
    else skipped++;
  }

  console.log(`✓ Users seeded — ${inserted} inserted, ${skipped} already existed`);
  console.log(`  All passwords: ${PASSWORD}`);
  await pool.end();
})().catch((err) => { console.error(err.message); process.exit(1); });
