const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, refresh, logout, verify } = require('../controllers/authController');

const router = Router();

const emailAndPassword = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

router.post('/register', emailAndPassword, register);
router.post('/login', emailAndPassword, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/verify', verify);

module.exports = router;
