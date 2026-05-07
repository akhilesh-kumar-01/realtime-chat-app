const User = require('../models/User');
const Message = require('../models/Message');
const { uploadImage } = require('../utils/cloudinary');
const mongoose = require('mongoose');

// Function to get all users for sidebar
const getAllUsers = async (req, res) => {
  try {
    const loggedInUserId = new mongoose.Types.ObjectId(req.user.id);
    const searchQuery = req.query.search || '';

    // Aggregation pipeline to replicate the SQL query:
    // 1. Find all users except the logged-in one
    // 2. Filter by search query
    // 3. Lookup messages for each user to find the latest interaction
    // 4. Sort by last message time
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: loggedInUserId },
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { username: { $regex: searchQuery, $options: 'i' } }
          ]
        }
      },
      {
        $lookup: {
          from: 'messages',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $and: [{ $eq: ['$sender_id', '$$userId'] }, { $eq: ['$receiver_id', loggedInUserId] }] },
                    { $and: [{ $eq: ['$sender_id', loggedInUserId] }, { $eq: ['$receiver_id', '$$userId'] }] }
                  ]
                }
              }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: 'lastMessage'
        }
      },
      {
        $addFields: {
          last_message_time: { $ifNull: [{ $arrayElemAt: ['$lastMessage.createdAt', 0] }, new Date(0)] },
          id: '$_id'
        }
      },
      {
        $project: {
          password: 0,
          lastMessage: 0
        }
      },
      { $sort: { last_message_time: -1, name: 1 } }
    ]);

    return res.status(200).json(users);
  } catch (error) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({ message: "Server error fetching users" });
  }
};

// Function to update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    let profilePicUrl = null;

    if (req.file) {
      profilePicUrl = await uploadImage(req.file.buffer);
    }

    const updateData = { name };
    if (profilePicUrl) updateData.profile_pic = profilePicUrl;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    const userData = updatedUser.toObject();
    userData.id = userData._id;

    return res.status(200).json(userData);
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

    const update = {};
    if (action === 'block') update.$addToSet = { blockedUsers: targetUserId };
    if (action === 'unblock') update.$pull = { blockedUsers: targetUserId };
    if (action === 'mute') update.$addToSet = { mutedUsers: targetUserId };
    if (action === 'unmute') update.$pull = { mutedUsers: targetUserId };

    await User.findByIdAndUpdate(userId, update);

    return res.status(200).json({ message: `Successfully applied action: ${action}` });
  } catch (error) {
    console.error("Update Relationship Error:", error);
    return res.status(500).json({ message: "Server error updating relationship" });
  }
};

// Function to delete account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete messages
    await Message.deleteMany({
      $or: [{ sender_id: userId }, { receiver_id: userId }]
    });

    // Delete user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete Account Error:", error);
    return res.status(500).json({ message: "Server error deleting account" });
  }
};

module.exports = { getAllUsers, updateProfile, updateRelationship, deleteAccount };
