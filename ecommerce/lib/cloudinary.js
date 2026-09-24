import { v2 as cloudinary } from "cloudinary";

export const connectCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
  });
};

// Uploads a file buffer and resolves with Cloudinary's result (secure_url, public_id, ...)
export const uploadImageBuffer = (buffer, options = {}) => {
  connectCloudinary();

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "image", ...options }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });
};
