import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "../../uploads");

const useCloudinary = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
  });
}

export async function ensureUploadDir() {
  await fs.mkdir(uploadsDir, { recursive: true });
}

export async function uploadFile(buffer, originalName, folder = "files") {
  const ext = path.extname(originalName || "").toLowerCase();
  const filename = `${folder}_${uuidv4()}${ext}`;

  if (useCloudinary) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "raw", folder, public_id: path.parse(filename).name },
        (err, res) => (err ? reject(err) : resolve(res))
      ).end(buffer);
    });
    return { url: result.secure_url, filename: originalName };
  }

  const folderPath = path.join(uploadsDir, folder);
  await fs.mkdir(folderPath, { recursive: true });
  const filePath = path.join(folderPath, filename);
  await fs.writeFile(filePath, buffer);
  const url = `${env.publicUploadBaseUrl}/${folder}/${filename}`;
  return { url, filename: originalName };
}

export { uploadsDir };
