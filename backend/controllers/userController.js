const db = require('../config/db');
const { uploadImage } = require('../utils/cloudinary');

// Function to get all users to show in the sidebar (except the logged-in user)
const getAllUsers = async (req, res) => {
  try {
    // Get the logged-in user's ID from the middleware
    const loggedInUserId = req.user.id;

    // Fetch all users from the database, but exclude the current user
    // We only select the fields we need (id, name, email, profile_pic) for security
    const [users] = await db.query(
      'SELECT id, name, email, profile_pic FROM users WHERE id != ?',
      [loggedInUserId]
    );

    // Return the list of users
    return res.status(200).json(users);
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({ message: "Server error fetching users" });
  }
};

// Function to update user profile (name and/or profile picture)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    let profilePicUrl = null;

    // First, check if the user uploaded a new profile picture
    // 'req.file' comes from the multer middleware we will set up in routes
    if (req.file) {
      // Upload the image to Cloudinary and get the secure URL
      profilePicUrl = await uploadImage(req.file.path);
    }

    // Now, update the database
    // If they uploaded a new picture, update both name and picture
    // If no new picture, just update the name
    if (profilePicUrl) {
      await db.query(
        'UPDATE users SET name = ?, profile_pic = ? WHERE id = ?',
        [name, profilePicUrl, userId]
      );
    } else {
      await db.query(
        'UPDATE users SET name = ? WHERE id = ?',
        [name, userId]
      );
    }

    // Fetch the updated user data to return to the frontend
    const [updatedUsers] = await db.query(
      'SELECT id, name, email, profile_pic, created_at FROM users WHERE id = ?',
      [userId]
    );

    // Return the updated user object
    return res.status(200).json(updatedUsers[0]);
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Server error updating profile" });
  }
};

module.exports = { getAllUsers, updateProfile };
