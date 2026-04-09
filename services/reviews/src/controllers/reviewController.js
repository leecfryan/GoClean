const { validationResult } = require('express-validator');
const Review = require('../models/Review');

// POST / — authenticated user submits a review
const submitReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { company_id, company_name, rating, title, comment, service_type } = req.body;
    const review = await Review.create({
      company_id, company_name, rating, title, comment, service_type,
      user_id: req.userId,
    });
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this company.' });
    }
    console.error('submitReview error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /me — get the authenticated user's reviews
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.findByUser(req.userId);
    res.json({ reviews });
  } catch (err) {
    console.error('getMyReviews error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /company/:companyId — public reviews for a specific company
const getCompanyReviews = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const result = await Review.findByCompany(req.params.companyId, { page, limit });
    res.json(result);
  } catch (err) {
    console.error('getCompanyReviews error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET / — admin: paginated list with filters
const getAllReviews = async (req, res) => {
  try {
    const page       = Math.max(1, parseInt(req.query.page)  || 1);
    const limit      = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { status, company_id, rating } = req.query;

    const validStatuses = ['published', 'flagged', 'removed'];
    const result = await Review.findAll({
      page, limit,
      status:     validStatuses.includes(status) ? status : undefined,
      company_id: company_id || undefined,
      rating:     rating     || undefined,
    });
    res.json(result);
  } catch (err) {
    console.error('getAllReviews error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /stats — admin: platform + per-company performance stats
const getStats = async (req, res) => {
  try {
    const stats = await Review.getCompanyStats();
    res.json(stats);
  } catch (err) {
    console.error('getStats error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /:id — admin: single review
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    res.json(review);
  } catch (err) {
    console.error('getReviewById error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PATCH /:id/status — admin: publish / flag / remove a review
const updateReviewStatus = async (req, res) => {
  try {
    const { status, flag_reason } = req.body;
    if (!['published', 'flagged', 'removed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be: published | flagged | removed' });
    }
    const fields = { status };
    if (status === 'flagged' && flag_reason) fields.flag_reason = flag_reason;
    if (status !== 'flagged') fields.flag_reason = null;

    const review = await Review.update(req.params.id, fields);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    res.json(review);
  } catch (err) {
    console.error('updateReviewStatus error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /:id — admin: permanently delete a review
const deleteReview = async (req, res) => {
  try {
    const result = await Review.remove(req.params.id);
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Review not found.' });
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    console.error('deleteReview error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  submitReview,
  getMyReviews,
  getCompanyReviews,
  getAllReviews,
  getStats,
  getReviewById,
  updateReviewStatus,
  deleteReview,
};
