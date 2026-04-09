const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

const col = () => getDb().collection('reviews');

const toObjectId = (id) => {
  try { return new ObjectId(id); } catch { return null; }
};

const Review = {
  async create(data) {
    const now = new Date();
    const doc = {
      company_id:   data.company_id,
      company_name: data.company_name,
      user_id:      data.user_id,
      rating:       data.rating,
      title:        data.title || null,
      comment:      data.comment || null,
      service_type: data.service_type || null,
      verified:     false,
      status:       'published',
      flag_reason:  null,
      created_at:   now,
      updated_at:   now,
    };
    const result = await col().insertOne(doc);
    return { ...doc, _id: result.insertedId };
  },

  async findById(id) {
    const _id = toObjectId(id);
    if (!_id) return null;
    return col().findOne({ _id });
  },

  async findAll({ page = 1, limit = 20, status, company_id, rating } = {}) {
    const filter = {};
    if (status)     filter.status     = status;
    if (company_id) filter.company_id = company_id;
    if (rating)     filter.rating     = parseInt(rating);

    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      col().find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).toArray(),
      col().countDocuments(filter),
    ]);
    return { reviews, total, page, pages: Math.ceil(total / limit) || 1 };
  },

  async findByCompany(company_id, { page = 1, limit = 10 } = {}) {
    const filter = { company_id, status: 'published' };
    const skip   = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      col().find(filter).sort({ created_at: -1 }).skip(skip).limit(limit).toArray(),
      col().countDocuments(filter),
    ]);
    return { reviews, total, page, pages: Math.ceil(total / limit) || 1 };
  },

  async findByUser(user_id) {
    return col().find({ user_id }).sort({ created_at: -1 }).toArray();
  },

  // Aggregation: per-company performance stats for the leaderboard
  async getCompanyStats() {
    const [companies, platform] = await Promise.all([
      col().aggregate([
        { $group: {
          _id:          '$company_id',
          company_name: { $first: '$company_name' },
          total:        { $sum: 1 },
          avg_rating:   { $avg: '$rating' },
          published:    { $sum: { $cond: [{ $eq: ['$status', 'published']  }, 1, 0] } },
          flagged:      { $sum: { $cond: [{ $eq: ['$status', 'flagged']    }, 1, 0] } },
          removed:      { $sum: { $cond: [{ $eq: ['$status', 'removed']   }, 1, 0] } },
          one_star:     { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          two_star:     { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          three_star:   { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          four_star:    { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          five_star:    { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        }},
        { $addFields: {
          avg_rating:    { $round: ['$avg_rating', 1] },
          five_star_pct: { $round: [{ $multiply: [{ $divide: ['$five_star', '$total'] }, 100] }, 0] },
        }},
        { $sort: { avg_rating: -1, total: -1 } },
      ]).toArray(),

      col().aggregate([
        { $group: {
          _id:       null,
          total:     { $sum: 1 },
          avg:       { $avg: '$rating' },
          published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
          flagged:   { $sum: { $cond: [{ $eq: ['$status', 'flagged']   }, 1, 0] } },
          removed:   { $sum: { $cond: [{ $eq: ['$status', 'removed']  }, 1, 0] } },
        }},
      ]).toArray(),
    ]);

    const p = platform[0] ?? { total: 0, avg: 0, published: 0, flagged: 0, removed: 0 };

    return {
      platform: {
        total:     p.total,
        avg_rating: p.avg ? Math.round(p.avg * 10) / 10 : 0,
        published: p.published,
        flagged:   p.flagged,
        removed:   p.removed,
      },
      companies: companies.map((c) => ({
        company_id:    c._id,
        company_name:  c.company_name,
        total:         c.total,
        avg_rating:    c.avg_rating,
        five_star_pct: c.five_star_pct,
        flagged:       c.flagged,
        distribution:  { 1: c.one_star, 2: c.two_star, 3: c.three_star, 4: c.four_star, 5: c.five_star },
      })),
    };
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

  async remove(id) {
    const _id = toObjectId(id);
    if (!_id) return { deletedCount: 0 };
    return col().deleteOne({ _id });
  },
};

module.exports = Review;
