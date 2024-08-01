const jwt = require("jsonwebtoken");
const CONFIG = require("./../config/config");
const AppError = require("./../utils/appError");

const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return next(new AppError("No token provided, authorization denied", 401));
  }

  jwt.verify(token, CONFIG.SECRET_KEY, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return next(new AppError("Token expired", 401));
      } else {
        return next(new AppError("Token is not valid", 401));
      }
    }

    if (err) {
      return next(err);
    }
    req.user = decoded.user;
    next();
  });
};

module.exports = verifyJWT;
