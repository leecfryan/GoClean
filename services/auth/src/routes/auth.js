const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, refresh, logout, verify } = require('../controllers/authController');

const router = Router();

const emailAndPassword = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const registerRules = [
  ...emailAndPassword,
  body('age').isInt({ min: 18, max: 120 }).withMessage('Age must be between 18 and 120'),
  body('address').isString().trim().notEmpty().withMessage('Address is required'),
];

router.post('/register', registerRules, register);
router.post('/login', emailAndPassword, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/verify', verify);

module.exports = router;
