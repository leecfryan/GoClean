const { Router } = require('express');
const { body }   = require('express-validator');
const requireAuth  = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');
const ctrl = require('../controllers/reviewController');

const router = Router();

const submitRules = [
  body('company_id').notEmpty().withMessage('company_id is required'),
  body('company_name').trim().notEmpty().withMessage('company_name is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
  body('title').optional().trim().isLength({ max: 100 }).withMessage('Title max 100 chars'),
  body('comment').optional().trim().isLength({ max: 2000 }).withMessage('Comment max 2000 chars'),
  body('service_type').optional().trim(),
];

// ── User routes ───────────────────────────────────────────────────────────────
router.post('/',                       requireAuth,               submitRules, ctrl.submitReview);
router.get('/me',                      requireAuth,                            ctrl.getMyReviews);
router.get('/company/:companyId',                                              ctrl.getCompanyReviews);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/stats',                   requireAuth, requireAdmin,              ctrl.getStats);
router.get('/',                        requireAuth, requireAdmin,              ctrl.getAllReviews);
router.get('/:id',                     requireAuth, requireAdmin,              ctrl.getReviewById);
router.patch('/:id/status',            requireAuth, requireAdmin,              ctrl.updateReviewStatus);
router.delete('/:id',                  requireAuth, requireAdmin,              ctrl.deleteReview);

module.exports = router;
