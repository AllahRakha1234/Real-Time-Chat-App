import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

export function configureCloudinary() {
  if (isConfigured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  isConfigured = true;
}

export function uploadBufferToCloudinary(buffer, options = {}) {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || process.env.CLOUDINARY_DEFAULT_FOLDER,
        use_filename: options.use_filename ?? true,
        unique_filename: options.unique_filename ?? true,
        resource_type: options.resource_type || "image",
        ...options,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}
