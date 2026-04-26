# Goal Description
The objective is to fix two critical authentication/real-time bugs and implement four major new features to make the application feel more complete and robust. This includes resolving real-time socket delivery, syncing profile pictures, adding WhatsApp-style conversation sorting, introducing unique usernames, adding an in-chat options menu (mute, block, clear chat), and enhancing the Profile page with an account deletion flow and privacy policy.

## User Review Required

> [!WARNING]
> The database schema will be altered to add the `username` column to the `users` table, and a new `user_relationships` table will be created to manage block/mute statuses between specific users.
> Are you okay with this specific database design for blocking/muting, rather than adding it as a flat array on the users table?

## Open Questions

> [!IMPORTANT]
> 1. **Delete Account:** When a user deletes their account, should all their sent and received messages also be deleted from the database to comply with privacy standards, or should the messages remain with an "Unknown User" label?
> 2. **Clear Chat:** Should "Clear Chat" delete messages globally (for both users), or just for the user who clicked it? (Currently, the plan is to delete them globally to keep the implementation simple based on the existing table structure, as per typical starter projects).

## Proposed Changes

### Database Changes
* Execute SQL script to alter the schema:
  - `ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;`
  - Create `user_relationships` table: `(id, user_id, target_user_id, is_blocked, is_muted)`.

---

### Backend Components

#### [MODIFY] `backend/controllers/messageController.js`
- **Bug 1:** Fix the `getSocketId` call by wrapping `req.params.userId` in `Number()`. Since Map keys for online users are integers and URL params are strings, this type mismatch was causing the lookup to fail silently.
- **Feature 3:** Add an endpoint `DELETE /api/messages/:userId` to clear all messages between two users.

#### [MODIFY] `backend/controllers/userController.js`
- **Feature 1 & 2:** Rewrite the `GET /api/users` SQL query to:
  1. Filter out the logged-in user.
  2. Search by `name` or `username` using `LIKE`.
  3. `LEFT JOIN` the messages table to aggregate the `MAX(created_at)` of their last interaction.
  4. `ORDER BY last_message_time DESC`.
- **Feature 3:** Add an endpoint `POST /api/users/:targetId/relationship` to toggle Block/Mute statuses in the `user_relationships` table.
- **Feature 4:** Add an endpoint `DELETE /api/users/profile` to delete the authenticated user's account and all associated messages.

#### [MODIFY] `backend/routes/userRoutes.js` and `backend/routes/messageRoutes.js`
- Route the new endpoints defined above.

#### [MODIFY] `backend/controllers/authController.js`
- **Feature 2:** Update registration logic to accept and insert the `username` field.

---

### Frontend Components

#### [MODIFY] `frontend/src/context/AuthContext.jsx`
- **Bug 2:** Provide an `updateAuthUser` function so `Profile.jsx` can trigger an immediate re-render across the application when the profile picture changes.

#### [MODIFY] `frontend/src/pages/Register.jsx`
- **Feature 2:** Add an input field for the unique `username` (e.g., `@akhilesh01`).

#### [MODIFY] `frontend/src/components/Sidebar.jsx`
- **Feature 1:** Ensure the component renders the list of users provided by the backend (which will now be automatically sorted by last message time).
- **Feature 2:** Display the new `@username` in gray text under the user's display name. Update the search bar logic to utilize the new query parameter `?search=xyz`.

#### [MODIFY] `frontend/src/components/ChatWindow.jsx`
- **Feature 3:** Introduce a 3-dot dropdown menu in the iOS header layout containing "Mute", "Block", and "Clear Chat" actions. Wire these up to the backend endpoints with proper confirmation modals.

#### [MODIFY] `frontend/src/pages/Profile.jsx`
- **Feature 4:** Add iOS-style grouped settings cards.
- Add "Delete My Account" with a confirmation popup.
- Add "Privacy Policy" button triggering a simple modal popup.
- Add a static "App Version v1.0.0" display row.

## Verification Plan

### Manual Verification
1. **Bug 1:** Open two browser profiles. Log in as two different users. Send a message from User A to User B. The message should instantly appear in User B's open Chat Window without refreshing.
2. **Bug 2:** Update the profile picture in the Profile tab. Verify the Sidebar and Chat Window instantly reflect the new picture without a page reload.
3. **Features:** Register a new user to test the username input. Search by username in the sidebar. Mute/Block a user to test the relationship table. Clear the chat to ensure messages are deleted. Delete the account to verify user removal.
