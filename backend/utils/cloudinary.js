const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

// Configure cloudinary with our secret keys from the .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to upload an image to Cloudinary
// It takes the local file path as an argument and returns the online URL
// Function to upload an image buffer to Cloudinary using a stream
const uploadImage = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) return resolve(null);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "chatapp",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error.message);
          return resolve(null);
        }
        resolve(result.secure_url);
      }
    );

    // End the stream and send the buffer
    uploadStream.end(fileBuffer);
  });
};

module.exports = { uploadImage };
