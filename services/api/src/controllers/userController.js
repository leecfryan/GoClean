const { validationResult } = require('express-validator');
const User = require('../models/User');

const getMe = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

const updateMe = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const allowed = ['age', 'address'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.update(req.userId, updates);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

const deleteMe = async (req, res) => {
  await User.remove(req.userId);
  res.json({ message: 'Account deleted' });
};

// Admin — list all users
const getAllUsers = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;

  const { users, total } = await User.findAll({ limit, offset });
  res.json({ users, total, page, pages: Math.ceil(total / limit) });
};

module.exports = { getMe, updateMe, deleteMe, getAllUsers };
