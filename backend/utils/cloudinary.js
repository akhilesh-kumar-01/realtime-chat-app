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
const uploadImage = async (filePath) => {
  try {
    // If no file path is provided, stop and return null
    if (!filePath) return null;

    // Upload the file to cloudinary
    const response = await cloudinary.uploader.upload(filePath, {
      folder: "chatapp", // puts all images in a specific folder on Cloudinary
      resource_type: "auto"
    });

    // After uploading, we don't need the local file anymore, so we delete it
    fs.unlinkSync(filePath);

    // Return the secure online URL so we can save it in our MySQL database
    return response.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);
    // If upload fails, try to clean up the local file anyway
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return null;
  }
};

module.exports = { uploadImage };
