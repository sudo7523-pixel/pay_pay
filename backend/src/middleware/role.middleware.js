export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      const err = new Error("Not authorized. Please log in.");
      err.statusCode = 401;
      return next(err);
    }

    if (!roles.includes(req.user.role)) {
      const err = new Error(
        `Access denied. Required role(s): ${roles.join(", ")}`
      );
      err.statusCode = 403;
      return next(err);
    }

    next();
  };
};

export const authorizeAdmin = authorize("admin");

export const authorizeMerchant = authorize("merchant", "admin");

export const authorizeUser = authorize("user", "merchant", "admin");