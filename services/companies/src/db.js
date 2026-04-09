const { MongoClient } = require('mongodb');

let db;

const getDb = () => {
  if (!db) throw new Error('Database not initialised');
  return db;
};

const init = async () => {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db();

  const companies = db.collection('companies');
  await companies.createIndex({ email: 1 }, { unique: true });
  await companies.createIndex({ license_number: 1 }, { unique: true });
  await companies.createIndex({ owner_id: 1 });
  await companies.createIndex({ status: 1 });

  console.log('Companies service connected to MongoDB');
  return db;
};

module.exports = { getDb, init };
