const requireAdmin = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: admins only' });
  }
  next();
};

module.exports = requireAdmin;
