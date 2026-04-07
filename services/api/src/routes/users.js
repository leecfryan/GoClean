const { Router } = require('express');
const { body } = require('express-validator');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');
const { getMe, updateMe, deleteMe, getAllUsers } = require('../controllers/userController');

const router = Router();

router.use(requireAuth);

router.get('/me', getMe);
router.patch('/me', [
  body('age').optional().isInt({ min: 0, max: 120 }),
  body('address').optional().isString().trim().notEmpty(),
], updateMe);
router.delete('/me', deleteMe);

router.get('/', requireAdmin, getAllUsers);

module.exports = router;
