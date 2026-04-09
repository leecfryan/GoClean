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

  const reviews = db.collection('reviews');
  await reviews.createIndex({ company_id: 1 });
  await reviews.createIndex({ user_id: 1 });
  await reviews.createIndex({ status: 1 });
  await reviews.createIndex({ rating: 1 });
  await reviews.createIndex({ created_at: -1 });
  // Prevent a user from reviewing the same company twice
  await reviews.createIndex({ user_id: 1, company_id: 1 }, { unique: true });

  console.log('Reviews service connected to MongoDB');
  return db;
};

module.exports = { getDb, init };
