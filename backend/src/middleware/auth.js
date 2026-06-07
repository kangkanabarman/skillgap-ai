import { AppError } from "../utils/helpers.js";
import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/index.js";

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new AppError("Authentication required", 401);

    const payload = verifyToken(token);
    const user = await User.findOne({ email: payload.email }).lean();
    if (!user) throw new AppError("User not found", 401);

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    next();
  } catch (err) {
    next(err.name === "AppError" ? err : new AppError("Invalid token", 401));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError("Authentication required", 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Access denied for your role", 403));
    }
    next();
  };
}
