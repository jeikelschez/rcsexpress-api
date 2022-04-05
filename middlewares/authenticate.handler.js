const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');
const { config } = require('./../config/config');
const accessToken = config.accessToken;
const refreshToken = config.refreshToken;

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, accessToken, (err, user) => {
      if (err) {
        next(boom.unauthorized(err));
      }

      req.user = user;
      next();
    });
  } else {
    next(boom.unauthorized('Token Vacio'));
  }
}

module.exports = authenticateJWT;
