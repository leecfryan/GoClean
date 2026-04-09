const { Router } = require('express');
const { body }   = require('express-validator');
const requireAuth  = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');
const ctrl = require('../controllers/companyController');

const router = Router();

const registerRules = [
  body('name').trim().notEmpty().withMessage('Company name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('license_number').trim().notEmpty().withMessage('License number is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('services').optional().isArray().withMessage('Services must be an array'),
];

// ── User routes (any authenticated user) ──────────────────────────────────────
router.post('/register', requireAuth, registerRules, ctrl.registerCompany);
router.get('/me',        requireAuth,                ctrl.getMyCompany);
router.patch('/me',      requireAuth,                ctrl.updateMyCompany);

// ── Admin routes ──────────────────────────────────────────────────────────────
router.get('/',               requireAuth, requireAdmin, ctrl.getAllCompanies);
router.get('/:id',            requireAuth, requireAdmin, ctrl.getCompanyById);
router.patch('/:id/status',   requireAuth, requireAdmin, ctrl.updateCompanyStatus);
router.delete('/:id',         requireAuth, requireAdmin, ctrl.deleteCompany);

module.exports = router;
