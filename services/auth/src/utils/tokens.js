const jwt = require('jsonwebtoken');

const signAccessToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

const signRefreshToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET + '_refresh', {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });

const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET + '_refresh');

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
