const { validationResult } = require('express-validator');
const User = require('../models/User');
const { signAccessToken, signRefreshToken, verifyRefreshToken, verifyAccessToken } = require('../utils/tokens');

const REFRESH_COOKIE = 'refreshToken';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already in use' });

  const user = await User.create({ email, password });
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  user.refreshTokens.push(refreshToken);
  await user.save();

  res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
  res.status(201).json({ accessToken, user });
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  user.refreshTokens.push(refreshToken);
  await user.save();

  res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
  res.json({ accessToken, user });
};

const refresh = async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE];
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.refreshTokens.includes(token)) {
    // Possible token reuse — revoke all tokens for this user
    if (user) { user.refreshTokens = []; await user.save(); }
    return res.status(403).json({ message: 'Refresh token reuse detected' });
  }

  // Rotate the refresh token
  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  const newRefreshToken = signRefreshToken(user._id);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  const accessToken = signAccessToken(user._id);
  res.cookie(REFRESH_COOKIE, newRefreshToken, COOKIE_OPTS);
  res.json({ accessToken });
};

const logout = async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE];
  if (token) {
    const user = await User.findOne({ refreshTokens: token });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
      await user.save();
    }
  }
  res.clearCookie(REFRESH_COOKIE);
  res.json({ message: 'Logged out' });
};

// Called by other services to validate an access token
const verify = (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const payload = verifyAccessToken(token);
    res.json({ valid: true, userId: payload.sub });
  } catch {
    res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
};

module.exports = { register, login, refresh, logout, verify };
