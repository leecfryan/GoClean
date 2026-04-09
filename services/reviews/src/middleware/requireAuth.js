const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth:5001';

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const { data } = await axios.get(`${AUTH_SERVICE_URL}/verify`, {
      headers: { authorization: authHeader },
    });
    req.userId = data.userId;
    req.role   = data.role;
    next();
  } catch (err) {
    const status  = err.response?.status  || 401;
    const message = err.response?.data?.message || 'Unauthorized';
    res.status(status).json({ message });
  }
};

module.exports = requireAuth;
