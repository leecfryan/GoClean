const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

const col = () => getDb().collection('companies');

const toObjectId = (id) => {
  try { return new ObjectId(id); } catch { return null; }
};

const Company = {
  async create(data) {
    const now = new Date();
    const doc = {
      name:            data.name,
      email:           data.email.toLowerCase(),
      phone:           data.phone || null,
      address:         data.address,
      city:            data.city,
      country:         data.country,
      license_number:  data.license_number,
      description:     data.description || null,
      services:        data.services || [],
      tier:            'basic',
      status:          'pending',
      owner_id:        data.owner_id,
      created_at:      now,
      updated_at:      now,
    };
    const result = await col().insertOne(doc);
    return { ...doc, _id: result.insertedId };
  },

  async findByOwnerId(owner_id) {
    return col().findOne({ owner_id });
  },

  async findById(id) {
    const _id = toObjectId(id);
    if (!_id) return null;
    return col().findOne({ _id });
  },

  async findByEmail(email) {
    return col().findOne({ email: email.toLowerCase() });
  },

  async findByLicense(license_number) {
    return col().findOne({ license_number });
  },

  async findAll({ page = 1, limit = 20, status } = {}) {
    const filter = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [companies, total] = await Promise.all([
      col().find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).toArray(),
      col().countDocuments(filter),
    ]);
    return { companies, total, page, pages: Math.ceil(total / limit) };
  },

  async update(id, fields) {
    const _id = toObjectId(id);
    if (!_id) return null;
    return col().findOneAndUpdate(
      { _id },
      { $set: { ...fields, updated_at: new Date() } },
      { returnDocument: 'after' }
    );
  },

  async updateByOwnerId(owner_id, fields) {
    return col().findOneAndUpdate(
      { owner_id },
      { $set: { ...fields, updated_at: new Date() } },
      { returnDocument: 'after' }
    );
  },

  async remove(id) {
    const _id = toObjectId(id);
    if (!_id) return { deletedCount: 0 };
    return col().deleteOne({ _id });
  },
};

module.exports = Company;
