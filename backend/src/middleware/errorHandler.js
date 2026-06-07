import { AppError } from "../utils/helpers.js";

export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const detail = err.message || "Internal server error";
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  res.status(status).json({ detail });
}

export function notFound(_req, _res, next) {
  next(new AppError("Route not found", 404));
}
