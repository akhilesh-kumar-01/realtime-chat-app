const db = require('../config/db');
const { uploadImage } = require('../utils/cloudinary');

// Function to get all users to show in the sidebar (except the logged-in user)
const getAllUsers = async (req, res) => {
  try {
    // Get the logged-in user's ID from the middleware
    const loggedInUserId = req.user.id;
    const searchQuery = req.query.search || '';

    // Fetch users excluding the current user.
    // LEFT JOIN with messages to find the timestamp of the latest interaction.
    // Search by name or username using LIKE.
    // ORDER BY the last message time (newest first).
    const [users] = await db.query(
      `SELECT u.id, u.name, u.email, u.profile_pic, u.username,
              MAX(m.created_at) as last_message_time
       FROM users u
       LEFT JOIN messages m 
         ON (m.sender_id = u.id AND m.receiver_id = ?) 
         OR (m.sender_id = ? AND m.receiver_id = u.id)
       WHERE u.id != ? 
         AND (u.name LIKE ? OR u.username LIKE ?)
       GROUP BY u.id
       ORDER BY last_message_time DESC, u.name ASC`,
      [loggedInUserId, loggedInUserId, loggedInUserId, `%${searchQuery}%`, `%${searchQuery}%`]
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

// Function to toggle Block/Mute status
const updateRelationship = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetUserId = req.params.targetId;
    const { action } = req.body; // 'block', 'unblock', 'mute', 'unmute'

    // First check if relationship exists
    const [existing] = await db.query(
      'SELECT * FROM user_relationships WHERE user_id = ? AND target_user_id = ?',
      [userId, targetUserId]
    );

    let isBlocked = existing.length > 0 ? existing[0].is_blocked : 0;
    let isMuted = existing.length > 0 ? existing[0].is_muted : 0;

    if (action === 'block') isBlocked = 1;
    if (action === 'unblock') isBlocked = 0;
    if (action === 'mute') isMuted = 1;
    if (action === 'unmute') isMuted = 0;

    if (existing.length > 0) {
      await db.query(
        'UPDATE user_relationships SET is_blocked = ?, is_muted = ? WHERE user_id = ? AND target_user_id = ?',
        [isBlocked, isMuted, userId, targetUserId]
      );
    } else {
      await db.query(
        'INSERT INTO user_relationships (user_id, target_user_id, is_blocked, is_muted) VALUES (?, ?, ?, ?)',
        [userId, targetUserId, isBlocked, isMuted]
      );
    }

    return res.status(200).json({ message: `Successfully applied action: ${action}` });
  } catch (error) {
    console.error("Update Relationship Error:", error);
    return res.status(500).json({ message: "Server error updating relationship" });
  }
};

// Function to delete user account completely
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all messages associated with the user
    await db.query(
      'DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?',
      [userId, userId]
    );

    // Delete the user (user_relationships will cascade if we set up FOREIGN KEY properly, but let's be safe)
    await db.query('DELETE FROM user_relationships WHERE user_id = ? OR target_user_id = ?', [userId, userId]);
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete Account Error:", error);
    return res.status(500).json({ message: "Server error deleting account" });
  }
};

module.exports = { getAllUsers, updateProfile, updateRelationship, deleteAccount };
