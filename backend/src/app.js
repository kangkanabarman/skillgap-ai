import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "express-async-errors";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { env } from "./config/env.js";
import { ensureUploadDir, uploadsDir } from "./services/storageService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createApp() {
  await ensureUploadDir();

  const app = express();
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(uploadsDir));
  app.use("/api", apiRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
