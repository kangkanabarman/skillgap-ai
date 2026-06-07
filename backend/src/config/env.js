import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const env = {
  port: parseInt(process.env.PORT || "8000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URL || process.env.MONGODB_URI || "mongodb://localhost:27017/skillgap",
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "30d",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000").split(","),
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://127.0.0.1:8001",
  publicUploadBaseUrl: process.env.PUBLIC_UPLOAD_BASE_URL || "http://localhost:8000/uploads",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  gnewsApiKey: process.env.GNEWS_API_KEY,
};
