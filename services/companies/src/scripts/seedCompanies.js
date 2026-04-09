require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;

const COMPANIES = [
  {
    name: 'Sparkle Pro Cleaning',
    email: 'hello@sparklepro.co.uk',
    phone: '0161 234 5678',
    address: '45 Industrial Way, Manchester',
    city: 'Manchester',
    country: 'UK',
    license_number: 'LIC-2021-0045',
    description: 'Professional domestic and commercial cleaning services across Greater Manchester.',
    services: ['domestic', 'commercial', 'end-of-tenancy'],
    tier: 'premium',
    status: 'active',
    owner_id: 'seed-owner-001',
  },
  {
    name: 'Crystal Clear Services',
    email: 'info@crystalclear.co.uk',
    phone: '0207 111 2233',
    address: '12 City Road, London',
    city: 'London',
    country: 'UK',
    license_number: 'LIC-2020-0112',
    description: 'London-based cleaning specialists offering office and residential deep cleans.',
    services: ['commercial', 'deep-clean', 'window-cleaning'],
    tier: 'premium',
    status: 'active',
    owner_id: 'seed-owner-002',
  },
  {
    name: 'Fresh Start Cleaners',
    email: 'contact@freshstartcleaners.co.uk',
    phone: '0121 456 7890',
    address: '89 Broad Street, Birmingham',
    city: 'Birmingham',
    country: 'UK',
    license_number: 'LIC-2022-0078',
    description: 'Affordable domestic cleaning with flexible scheduling for busy families.',
    services: ['domestic', 'ironing', 'laundry'],
    tier: 'basic',
    status: 'active',
    owner_id: 'seed-owner-003',
  },
  {
    name: 'Gleam & Shine Ltd',
    email: 'support@gleamandshine.co.uk',
    phone: '0113 321 4567',
    address: '33 Park Row, Leeds',
    city: 'Leeds',
    country: 'UK',
    license_number: 'LIC-2021-0203',
    description: 'Award-winning commercial cleaning contractors serving Yorkshire businesses.',
    services: ['commercial', 'industrial', 'sanitisation'],
    tier: 'premium',
    status: 'active',
    owner_id: 'seed-owner-004',
  },
  {
    name: 'Green Touch Cleaning',
    email: 'hello@greentouchcleaning.co.uk',
    phone: '0117 654 3210',
    address: '7 Harbourside, Bristol',
    city: 'Bristol',
    country: 'UK',
    license_number: 'LIC-2023-0015',
    description: 'Eco-friendly cleaning using only non-toxic, sustainable products.',
    services: ['domestic', 'eco-clean', 'end-of-tenancy'],
    tier: 'basic',
    status: 'pending',
    owner_id: 'seed-owner-005',
  },
  {
    name: 'Swift Maid Services',
    email: 'bookings@swiftmaid.co.uk',
    phone: '0114 789 0123',
    address: '22 Division Street, Sheffield',
    city: 'Sheffield',
    country: 'UK',
    license_number: 'LIC-2022-0156',
    description: 'Same-day domestic cleaning with vetted, trained staff.',
    services: ['domestic', 'same-day', 'deep-clean'],
    tier: 'basic',
    status: 'active',
    owner_id: 'seed-owner-006',
  },
  {
    name: 'Prestige Office Clean',
    email: 'admin@prestigeofficeclean.co.uk',
    phone: '0151 999 8877',
    address: '60 Water Street, Liverpool',
    city: 'Liverpool',
    country: 'UK',
    license_number: 'LIC-2020-0309',
    description: 'Specialist office cleaning for corporate clients across Merseyside.',
    services: ['commercial', 'office', 'sanitisation'],
    tier: 'premium',
    status: 'suspended',
    owner_id: 'seed-owner-007',
  },
  {
    name: 'Highland Domestic Cleaning',
    email: 'info@highlandcleaning.co.uk',
    phone: '0131 555 6677',
    address: '5 Royal Mile, Edinburgh',
    city: 'Edinburgh',
    country: 'UK',
    license_number: 'LIC-2021-0088',
    description: 'Trusted domestic cleaners serving Edinburgh and the Lothians.',
    services: ['domestic', 'end-of-tenancy', 'carpet-cleaning'],
    tier: 'basic',
    status: 'active',
    owner_id: 'seed-owner-008',
  },
  {
    name: 'Valleys Clean Co.',
    email: 'hello@valleysclean.co.uk',
    phone: '0292 100 2233',
    address: '14 St Mary Street, Cardiff',
    city: 'Cardiff',
    country: 'UK',
    license_number: 'LIC-2023-0042',
    description: 'New Cardiff-based cleaning startup offering competitive domestic rates.',
    services: ['domestic', 'window-cleaning'],
    tier: 'basic',
    status: 'pending',
    owner_id: 'seed-owner-009',
  },
  {
    name: 'Midlands Deep Clean',
    email: 'enquiries@midlandsdeepclean.co.uk',
    phone: '0115 876 5432',
    address: '30 Castle Gate, Nottingham',
    city: 'Nottingham',
    country: 'UK',
    license_number: 'LIC-2022-0211',
    description: 'Industrial and commercial deep cleaning specialists in the East Midlands.',
    services: ['industrial', 'deep-clean', 'commercial'],
    tier: 'premium',
    status: 'active',
    owner_id: 'seed-owner-010',
  },
];

(async () => {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db();
  const col = db.collection('companies');

  let inserted = 0;
  let skipped  = 0;
  const now = new Date();

  for (const c of COMPANIES) {
    const doc = { ...c, created_at: now, updated_at: now };
    try {
      await col.insertOne(doc);
      inserted++;
    } catch (err) {
      if (err.code === 11000) skipped++; // duplicate key
      else throw err;
    }
  }

  console.log(`✓ Companies seeded — ${inserted} inserted, ${skipped} already existed`);
  await client.close();
})().catch((err) => { console.error(err.message); process.exit(1); });
