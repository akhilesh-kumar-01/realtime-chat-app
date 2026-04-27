# 📘 Project Technical Documentation: Real-Time Chat Application

This document serves as a comprehensive technical breakdown of the Real-Time Chat Application, designed for interview preparation. It covers architecture, implementation details, and engineering decisions from A to Z.

---

## 1. Project Overview
The objective was to build a secure, scalable, real-time messaging platform with a premium UI (inspired by iOS/iMessage). It allows users to authenticate, chat in real-time, share images, and manage their profiles.

### Tech Stack:
- **Frontend:** React.js (Vite) - Chosen for its component-based architecture and fast HMR.
- **Backend:** Node.js & Express.js - Chosen for non-blocking I/O and easy integration with Socket.io.
- **Database:** MySQL - Chosen for structured data storage and ACID compliance.
- **Real-Time:** Socket.io - Enables bi-directional, event-based communication.
- **Cloud Storage:** Cloudinary - Offloads image hosting to a dedicated CDN.
- **Styling:** Tailwind CSS - For rapid UI development with a utility-first approach.

---

## 2. How the Backend was built

### 2.1 Project Setup
The project was initialized using `npm init -y`. We installed the following dependencies:
- `express`: Web framework for routing.
- `mysql2`: Driver to interact with MySQL.
- `cors`: To allow cross-origin requests from the frontend.
- `dotenv`: To manage environment variables (DB keys, API secrets).
- `bcryptjs`: For hashing passwords.
- `jsonwebtoken`: For stateless user authentication.
- `socket.io`: For real-time functionality.
- `cloudinary` & `multer`: For handling and storing image uploads.
- `nodemailer`: For automated email notifications.
- `express-rate-limit`: To protect against brute-force attacks.

### 2.2 Express Server Creation (`server.js`)
The entry point of our backend initializes the Express app and sets up global middleware:
```javascript
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests
```
We create an HTTP server using `http.createServer(app)` and attach Socket.io to it. This allows the server to handle both standard HTTP REST requests and persistent WebSocket connections on the same port.

### 2.3 MySQL Database Connection (`config/db.js`)
We use `mysql.createPool()` to manage connections efficiently. A pool allows multiple simultaneous connections and automatically handles reconnects.
- **Tables:**
  - `users`: `id`, `name`, `username`, `email`, `password`, `profile_pic`, `created_at`.
  - `messages`: `id`, `sender_id`, `receiver_id`, `message`, `image_url`, `created_at`.
  - `user_relationships`: `id`, `user_id`, `target_id`, `is_blocked`, `is_muted`.

### 2.4 Authentication Flow
#### Register:
1. User submits `name`, `email`, `password`.
2. Backend checks if email exists: `SELECT * FROM users WHERE email = ?`.
3. If new, we hash the password using `bcrypt.hash(password, 10)`. (10 is the **salt rounds**, adding complexity to the hash).
4. `INSERT` the user into the database.
5. Trigger `nodemailer` to send a welcome email.

#### Login:
1. User submits `email`, `password`.
2. Backend finds user by email.
3. Compare hashed password: `await bcrypt.compare(password, user.password)`.
4. If valid, generate a JWT: `jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })`.
5. Return the token and user data to the frontend.

#### JWT Middleware (`authMiddleware.js`):
We protect routes by checking the `Authorization` header. We extract the token (splitting "Bearer <token>"), verify it using `jwt.verify()`, and attach the decoded user ID to `req.user` so controllers know who is making the request.

### 2.5 Routes and Controllers
- **Routes:** Define the URL paths.
- **Controllers:** Contain the logic (logic-separation pattern).
- **Key Endpoints:**
  - `POST /api/auth/register` (Public)
  - `POST /api/auth/login` (Public)
  - `GET /api/users` (Protected) - Fetches user list with search.
  - `GET /api/messages/:id` (Protected) - Fetches conversation history.
  - `POST /api/messages/:id` (Protected) - Sends a message (supports Multipart for images).
  - `PUT /api/users/profile` (Protected) - Updates profile picture.

### 2.6 Rate Limiting
To prevent abuse, we used `express-rate-limit`:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per window
});
app.use("/api/", limiter);
```

### 2.7 Cloudinary Image Upload
We use `multer.memoryStorage()` to keep the file buffer in RAM. This is passed to Cloudinary's `upload_stream`:
```javascript
cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
  const imageUrl = result.secure_url;
  // Save imageUrl to MySQL
}).end(req.file.buffer);
```

---

## 3. How Socket.io Real-Time System was built

### 3.1 Socket Setup
Inside `socket/socketHandler.js`, we initialize the `io` instance. We maintain an `onlineUsers` **Map** (userId -> socketId). We use a `Map` because it offers O(1) lookups and handles key-value pairs more efficiently than a standard object or array for dynamic IDs.

### 3.2 Real-Time Messaging Flow
1. User A sends a message via `POST /api/messages/:userId`.
2. Backend saves the message to MySQL and gets the auto-incremented `id`.
3. Backend checks the `onlineUsers` Map for the receiver's `socketId`.
4. If online, we emit: `io.to(receiverSocketId).emit("newMessage", savedMessage)`.
5. **ID Fix:** We fixed a bug where `receiver_id` was a String in the socket map but a Number in the DB. We used `Number(id)` to ensure type consistency.

### 3.3 Online Status
- Upon connection, the frontend emits "userOnline" with their `userId`.
- The server updates the Map and broadcasts the updated keys to everyone: `io.emit("onlineUsers", Array.from(onlineUsers.keys()))`.
- On `disconnect`, we remove the entry and broadcast again.

---

## 4. How the Frontend was built

### 4.1 Setup
Initialized with `npm create vite@latest`. Configured `tailwind.config.js` with custom colors like `iosBlue: '#007AFF'` and `iosLightGray: '#F2F2F7'`.

### 4.2 Context API
- `AuthContext`: Manages user session, login/logout, and `authUser` state.
- `SocketContext`: Manages the socket connection. It automatically connects when `authUser` is present and disconnects on logout.
- **Why?** It avoids "prop drilling" (passing data through 5 layers of components).

### 4.3 Axios Interceptor (`utils/api.js`)
We use an interceptor to automatically add the JWT token to the `Authorization` header of every outgoing request, ensuring the backend always recognizes the session.

### 4.4 React Router
- `ProtectedRoute`: Checks if `authUser` exists; if not, redirects to `/login`.
- `PublicRoute`: Prevents logged-in users from seeing the Login/Register pages.

### 4.5 Key Components
- **Sidebar:** Real-time search and user list. Implemented a custom **Right-Click Context Menu** using `onContextMenu` and `setContextMenu` state.
- **ChatWindow:** Uses a `useEffect` to fetch history and another to listen for `newMessage` socket events.
- **MessageInput:** Uses `FormData` to send multipart requests (text + image) to the backend.

---

## 5. Bugs and Debugging
- **Socket ID Mismatch:** Fixed by ensuring all IDs were cast to `Number` before comparison.
- **Cloudinary "Raw" Type:** Fixed by setting `resource_type: "auto"` so Cloudinary doesn't treat images as raw metadata files.
- **Profile Persistence:** Discovered `multer` was losing files on restart; fixed by using `memoryStorage` and updating the user state globally in `AuthContext` after upload.

---

## 6. Interview Questions & Technical Answers

**Q: How does JWT authentication work?**
*A: It's a stateless auth mechanism. The server signs a payload (userId) with a secret key. The client stores this token (usually in LocalStorage) and sends it in the Authorization header. The server verifies the signature to authenticate the user without querying the DB for sessions.*

**Q: Why MySQL over MongoDB?**
*A: For a chat app, data is highly relational (Users have Messages, Relationships). MySQL's relational integrity and structured schema are better suited for these complex joins and consistent data states compared to a document-store like MongoDB.*

**Q: How did you handle real-time message delivery?**
*A: I used a hybrid approach. The message is sent via a REST API (POST) to ensure it's saved in the DB first. Once saved, the server retrieves the recipient's socket ID from a server-side Map and emits a WebSocket event to deliver it instantly.*

**Q: What is middleware in Express?**
*A: Middleware are functions that have access to the request and response objects. They can execute code, modify the request (like our Auth middleware adding `req.user`), or end the request-response cycle.*

**Q: What would you improve?**
*A: I would implement "Message Queuing" (like RabbitMQ) for better scalability, add "Read Receipts" (double ticks), and implement "End-to-End Encryption" (E2EE) using the Signal Protocol for privacy.*

---
**Prepared by Akhilesh**
