# Real-Time Chat Application — Complete Build Guide
> For Resume Project | B.Tech Student Level | Agent-Ready Prompts

---

## PART 1 — PRODUCT REQUIREMENTS DOCUMENT (PRD)

### What is this project?
A full-stack real-time chat application where users can sign up, log in, and chat with other users in real-time. Messages appear instantly without refreshing the page. Users can also see who is online/offline and send images.

### Tech Stack
- **Frontend:** React.js + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MySQL
- **Real-time:** Socket.io
- **Auth:** JWT (JSON Web Token)
- **Media Storage:** Cloudinary
- **Email:** Nodemailer
- **Deployment:** Git + CI/CD (GitHub Actions or Railway)

---

### Features List

#### 1. Authentication
- User can Register with name, email, password
- User can Login with email and password
- JWT token is saved in localStorage
- Protected routes — if not logged in, redirect to Login page
- Password is hashed using bcrypt before saving to database

#### 2. Real-Time Messaging
- Users can search other users and start a chat
- Messages appear instantly using Socket.io (no page refresh needed)
- Each message shows sender name, message text, and time
- Messages are saved in MySQL database

#### 3. Online/Offline Status
- When a user logs in, they appear as "Online" (green dot)
- When they log out or close browser, they appear as "Offline"
- This works using Socket.io events

#### 4. Image Upload in Chat
- Users can send images in chat
- Images are uploaded to Cloudinary and the URL is saved in the database

#### 5. Email Notifications
- When a user registers, a welcome email is sent using Nodemailer
- (Optional) New message email notification if user is offline

#### 6. Profile Page
- User can update their name and profile picture
- Profile picture is uploaded to Cloudinary

#### 7. API Rate Limiting
- Backend APIs have rate limiting (using express-rate-limit)
- This prevents spam/abuse — max 100 requests per 15 minutes per IP

#### 8. CI/CD Deployment
- Code pushed to GitHub automatically deploys to server
- Using GitHub Actions or Railway for auto-deployment

---

### Database Tables (MySQL)

**users table**
```
id, name, email, password, profile_pic, created_at
```

**messages table**
```
id, sender_id, receiver_id, message, image_url, created_at
```

---

### API Endpoints

| Method | Route | What it does |
|--------|-------|--------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user, return JWT |
| GET | /api/auth/me | Get logged in user info |
| GET | /api/users | Get all users (for sidebar) |
| GET | /api/messages/:userId | Get messages with a user |
| POST | /api/messages/:userId | Send message to a user |
| PUT | /api/users/profile | Update profile |

---

### Folder Structure

**Backend (Node.js)**
```
backend/
  ├── config/
  │   └── db.js          (MySQL connection)
  ├── controllers/
  │   ├── authController.js
  │   ├── messageController.js
  │   └── userController.js
  ├── middleware/
  │   ├── authMiddleware.js   (JWT verify)
  │   └── rateLimiter.js
  ├── routes/
  │   ├── authRoutes.js
  │   ├── messageRoutes.js
  │   └── userRoutes.js
  ├── socket/
  │   └── socketHandler.js
  ├── utils/
  │   ├── cloudinary.js
  │   └── sendEmail.js
  ├── .env
  ├── server.js
  └── package.json
```

**Frontend (React)**
```
frontend/
  ├── src/
  │   ├── components/
  │   │   ├── Sidebar.jsx
  │   │   ├── ChatWindow.jsx
  │   │   ├── MessageInput.jsx
  │   │   └── UserCard.jsx
  │   ├── pages/
  │   │   ├── LoginPage.jsx
  │   │   ├── RegisterPage.jsx
  │   │   ├── ChatPage.jsx
  │   │   └── ProfilePage.jsx
  │   ├── context/
  │   │   ├── AuthContext.jsx
  │   │   └── SocketContext.jsx
  │   ├── hooks/
  │   │   └── useMessages.js
  │   ├── utils/
  │   │   └── api.js
  │   ├── App.jsx
  │   └── main.jsx
  └── package.json
```

---

### Simple Flow (How everything connects)

```
User opens app
  → Hits Login page
  → Enters email + password
  → Backend checks MySQL, returns JWT token
  → Frontend saves token, redirects to Chat page
  → Socket.io connects and marks user as Online
  → User picks someone from sidebar
  → Messages load from MySQL
  → User types message → sends to backend → saved in MySQL → Socket.io sends to receiver instantly
  → Receiver sees message without refreshing
```

---

## PART 2 — ANTIGRAVITY AGENT PROMPT

Copy this full prompt into Antigravity to build the project:

---

```
You are a senior full-stack developer helping a B.Tech student build a Real-Time Chat Application for their resume. The code should be clean, simple, and easy to understand — like a student wrote it themselves. No over-engineering. Comments in code wherever needed to explain what is happening.

## Project: Real-Time Chat Application
Tech Stack: Node.js, Express.js, React.js, MySQL, Socket.io, Tailwind CSS, JWT, Cloudinary, Nodemailer

---

## STEP 1 — BACKEND SETUP

### 1.1 Initialize the project
- Create a folder called `backend`
- Run `npm init -y`
- Install these packages:
  express, mysql2, cors, dotenv, bcryptjs, jsonwebtoken, socket.io, cloudinary, multer, nodemailer, express-rate-limit

### 1.2 Create `.env` file
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=chatapp
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_app_password
```

### 1.3 Create `config/db.js`
- Connect to MySQL using mysql2
- Export the connection pool
- Log "MySQL Connected" on success, log error on failure

### 1.4 Create MySQL Tables
Write a simple SQL file `config/createTables.sql`:
```sql
CREATE DATABASE IF NOT EXISTS chatapp;
USE chatapp;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  profile_pic VARCHAR(500) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message TEXT,
  image_url VARCHAR(500) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);
```

### 1.5 Create `middleware/authMiddleware.js`
- Function: verifyToken
- Get token from Authorization header (Bearer token)
- Verify using JWT_SECRET
- Attach decoded user to req.user
- If no token or invalid token, return 401 error

### 1.6 Create `middleware/rateLimiter.js`
- Use express-rate-limit
- Allow max 100 requests per 15 minutes per IP
- Return a simple message: "Too many requests, please try again later"

### 1.7 Create `utils/cloudinary.js`
- Configure Cloudinary using env variables
- Export a function `uploadImage(filePath)` that uploads image and returns the secure URL

### 1.8 Create `utils/sendEmail.js`
- Use Nodemailer with Gmail
- Create a transporter using EMAIL_USER and EMAIL_PASS
- Export a function `sendWelcomeEmail(toEmail, name)` that sends a welcome email

### 1.9 Create `controllers/authController.js`
Write these functions with simple code:

**register:**
- Get name, email, password from req.body
- Check if email already exists in MySQL
- Hash password using bcrypt (10 rounds)
- Insert new user into users table
- Call sendWelcomeEmail
- Return success message

**login:**
- Get email, password from req.body
- Find user by email in MySQL
- Compare password using bcrypt.compare
- If match, create JWT token with {id, email} payload, expiry 7 days
- Return token and user object (without password)

**getMe:**
- Use req.user.id (from middleware)
- Fetch user from MySQL by id
- Return user object

### 1.10 Create `controllers/userController.js`

**getAllUsers:**
- Get all users from MySQL except the logged-in user (req.user.id)
- Return list of users (only id, name, email, profile_pic)

**updateProfile:**
- Get name from req.body
- If a file is uploaded, upload to Cloudinary, get URL
- Update name and profile_pic in MySQL for that user
- Return updated user

### 1.11 Create `controllers/messageController.js`

**getMessages:**
- Get messages between req.user.id and params.userId from MySQL
- ORDER BY created_at ASC
- Return messages array

**sendMessage:**
- Get message from req.body, get receiver_id from params.userId
- If image is uploaded, upload to Cloudinary
- Insert message into messages table
- Emit socket event "newMessage" to receiver using their socket id
- Return saved message

### 1.12 Create Routes
- `routes/authRoutes.js` — POST /register, POST /login, GET /me (protected)
- `routes/userRoutes.js` — GET / (all users), PUT /profile — both protected
- `routes/messageRoutes.js` — GET /:userId, POST /:userId — both protected

### 1.13 Create `socket/socketHandler.js`
- Export a function `initSocket(io)` 
- Maintain a Map: `onlineUsers = new Map()` (userId → socketId)
- On "connection": 
  - Listen for "userOnline" event, save userId → socket.id in map
  - Broadcast "onlineUsers" event to all clients with online user IDs
- On "disconnect":
  - Remove socket from map
  - Broadcast updated "onlineUsers" to all clients
- Export a function `getSocketId(userId)` to get socket id for a user

### 1.14 Create `server.js`
- Setup Express app
- Use cors, express.json() middleware
- Apply rateLimiter to all /api routes
- Mount all routes
- Create HTTP server from Express
- Attach Socket.io to HTTP server (with cors origin *)
- Call initSocket(io)
- Start server on PORT from env

---

## STEP 2 — FRONTEND SETUP

### 2.1 Initialize React project
- Create folder `frontend`
- Run `npm create vite@latest . -- --template react`
- Install: axios, socket.io-client, react-router-dom, react-hot-toast

### 2.2 Setup Tailwind CSS
- Install tailwindcss, postcss, autoprefixer
- Run `npx tailwindcss init -p`
- Configure tailwind.config.js for src files
- Add Tailwind directives to index.css

### 2.3 Create `utils/api.js`
- Create an axios instance with baseURL = "http://localhost:5000/api"
- Add request interceptor to attach JWT token from localStorage to every request header
- Export this axios instance as `api`

### 2.4 Create `context/AuthContext.jsx`
- Create AuthContext using createContext
- Store: user, token, isLoading
- Functions: login(email, password), register(name, email, password), logout()
- On app load, check localStorage for token, fetch /auth/me to restore session
- Wrap app in AuthProvider

### 2.5 Create `context/SocketContext.jsx`
- Create SocketContext
- When user is logged in, connect to socket server
- Emit "userOnline" with user id
- Listen for "onlineUsers" event and update state
- On logout, disconnect socket
- Export `useSocket` hook

### 2.6 Create Pages

**LoginPage.jsx:**
- Simple form with email and password inputs
- On submit, call login from AuthContext
- Show toast on error
- Redirect to /chat on success
- Link to Register page

**RegisterPage.jsx:**
- Form with name, email, password
- On submit, call register from AuthContext
- Show toast on error
- Redirect to /chat on success

**ChatPage.jsx:**
- Main layout: Sidebar on left, ChatWindow on right
- Sidebar shows list of users from GET /api/users
- Show green dot if user is online (check onlineUsers from socket context)
- Clicking a user opens chat with them in ChatWindow

**ProfilePage.jsx:**
- Show current user name and profile pic
- Input to update name
- File input to update profile picture
- On save, call PUT /api/users/profile
- Show success toast

### 2.7 Create Components

**Sidebar.jsx:**
- Fetch all users from /api/users
- Show search input to filter users by name
- Each user shows: profile pic (or initials), name, online dot if online
- Highlight selected user

**ChatWindow.jsx:**
- If no user selected, show "Select a user to start chatting"
- Show selected user's name and online status in header
- Fetch messages from GET /api/messages/:userId on user select
- Show messages in scrollable area
  - Sent by me: right side, blue bubble
  - Received: left side, gray bubble
- Show message text and time
- Auto scroll to bottom on new messages
- Listen for "newMessage" socket event and add to message list

**MessageInput.jsx:**
- Text input and send button
- Paperclip icon for image upload (file input hidden, triggered on click)
- On send: POST /api/messages/:userId with message text or image
- Clear input after send

### 2.8 Create `App.jsx`
- Setup React Router
- Routes:
  - /login → LoginPage (public)
  - /register → RegisterPage (public)
  - /chat → ChatPage (protected)
  - /profile → ProfilePage (protected)
  - / → redirect to /chat
- Wrap everything in AuthProvider and SocketProvider
- Add Toaster from react-hot-toast

---

## STEP 3 — FINAL STEPS

### 3.1 Environment & Testing
- Test register → login → chat flow manually
- Make sure socket events work (open two browser tabs)
- Check online status updates

### 3.2 CI/CD Setup
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Chat App
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install backend deps
        run: cd backend && npm install
      - name: Install frontend deps
        run: cd frontend && npm install && npm run build
      - name: Deploy (add your deploy command here)
        run: echo "Add SSH deploy or Railway CLI command"
```

### 3.3 README.md
Create a clean README with:
- Project description
- Tech stack list
- How to run locally (step by step)
- Screenshots section (add screenshots after UI is done)
- Features list

---

## IMPORTANT CODING RULES (follow strictly):
1. Use simple English variable and function names
2. Add comments above every function explaining what it does
3. Don't use fancy/complex patterns — keep code straightforward
4. Handle errors with try/catch blocks everywhere
5. Always return proper HTTP status codes (200, 201, 400, 401, 404, 500)
6. Use async/await everywhere (no .then/.catch chains)
7. Keep each file small and focused — one file = one job
8. Use console.log for debugging during development (remove before final)
```

---

## PART 3 — UI/UX SCREEN GENERATION PROMPTS (for Stitch via MCP)

Use these prompts with Stitch, one batch at a time. Each batch = 5 screens.

---

### BATCH 1 — Auth Screens (5 screens)

```
Generate the following 5 screens for a Real-Time Chat Application with a clean modern UI. 
Color scheme: Dark sidebar (#1a1a2e navy), white main area, blue accent (#4A90D9) for buttons and highlights. 
Font: Clean sans-serif. Style: WhatsApp/Telegram inspired but more modern.

Screen 1 — Login Page
- Centered card on a dark navy background
- App logo/icon at top (speech bubble icon)
- App name "ChatApp" in bold
- Email input field
- Password input field with show/hide toggle
- "Login" button (blue, full width)
- "Don't have an account? Register" link below
- Clean minimal design

Screen 2 — Register Page
- Same centered card layout as login
- App logo at top
- Full Name input field
- Email input field
- Password input field
- Confirm Password input field
- "Create Account" button (blue, full width)
- "Already have an account? Login" link

Screen 3 — Chat Page (Empty State — no chat selected)
- Left sidebar (dark navy #1a1a2e, 30% width):
  - User avatar + name at top
  - Search bar below
  - List of users with avatar, name, last message preview, time
  - Green dot on online users
- Right area (white/light gray, 70% width):
  - Centered illustration of empty chat
  - Text: "Select a conversation to start chatting"
  - Subtle and friendly empty state

Screen 4 — Chat Page (Active Chat)
- Same sidebar as Screen 3 (one user highlighted/selected)
- Right area shows active chat:
  - Header: user avatar, name, "Online" status in green
  - Chat messages area:
    - Received messages: left side, gray bubble
    - Sent messages: right side, blue bubble
    - Each message has text and timestamp below
  - Bottom: text input bar with paperclip icon (attach), send button

Screen 5 — Chat Page with Image Message
- Same layout as Screen 4
- Show one message bubble containing an image (not text)
- Image is displayed inline in the chat bubble
- Show image with rounded corners inside the message bubble
- Below image shows timestamp
```

---

### BATCH 2 — Profile & Search Screens (5 screens)

```
Continue the same Real-Time Chat App UI. Same color scheme: dark navy sidebar, white main area, blue accent buttons.

Screen 6 — Profile Page
- Header: "My Profile" title with back arrow
- Large profile picture in center (circular, with pencil edit icon overlay)
- User's name below profile pic (editable)
- Input field for updating name
- "Change Profile Picture" button (outlined, not filled)
- "Save Changes" button (blue, filled)
- Logout button at bottom (red outlined)

Screen 7 — User Search Results in Sidebar
- Sidebar view: search bar is active with text typed (e.g., "Raj")
- Show filtered user list below search bar
- Matching part of name is highlighted in blue
- Each result: avatar, name, online status dot
- Non-matching users are hidden

Screen 8 — Image Upload Preview in Chat
- Chat page active state
- User has selected an image to send (file picker used)
- Show a preview popup/modal at bottom of chat area above the message input:
  - Small image preview thumbnail
  - "Send Image" blue button
  - "Cancel" text link
  - Optional: text input still visible so user can add caption

Screen 9 — Toast Notification / Alert States
- Show 3 different toast notifications floating at top-right of screen:
  1. Green success toast: "Message sent successfully!"
  2. Red error toast: "Failed to send message. Try again."
  3. Blue info toast: "You are now online"
- Show them stacked, most recent on top
- Each has an X close button

Screen 10 — Mobile Responsive — Chat List View
- Mobile viewport (375px wide)
- Full screen sidebar: user list only, no chat window visible
- Each user row: avatar, name, online dot, last message, time
- Bottom navigation bar with icons: Chat, Search, Profile
- App title + notification bell icon in top bar
```

---

### BATCH 3 — Advanced & Loading Screens (5 screens)

```
Continue Real-Time Chat App UI. Same design system: navy + white + blue accent.

Screen 11 — Mobile — Active Chat View
- Mobile viewport (375px)
- Full screen chat view (sidebar hidden on mobile)
- Top bar: back arrow, user avatar + name, online dot, video call icon
- Chat messages area (majority of screen)
- Bottom: message input bar with attach and send icons
- Keyboard appears to be open (input is focused)

Screen 12 — Loading / Skeleton State
- Chat page loading state
- Sidebar shows skeleton loaders for 5-6 user cards (gray animated placeholders)
- Right area shows skeleton chat bubbles (3-4 placeholder message bubbles, alternating left/right)
- Subtle pulsing animation on all skeleton elements

Screen 13 — Online Users Indicator
- Sidebar focused view
- Show a small horizontal strip at top of user list: "Online now: 3 users"
- Online users shown with bright green dot
- Offline users shown with gray dot
- Slight visual differentiation between online and offline groups in the list

Screen 14 — Rate Limit / Error Page
- Full page view (not chat layout)
- Centered card on white/light gray background
- Warning icon (yellow triangle with !)
- Heading: "Too Many Requests"
- Subtext: "You've sent too many requests. Please wait 15 minutes before trying again."
- A countdown timer showing time remaining (e.g., 14:32)
- "Go Back" button (outlined)

Screen 15 — Successful Registration / Welcome Screen
- Centered card on dark navy background (like login)
- Large animated checkmark or success icon in green
- Heading: "Welcome to ChatApp!"
- Subtext: "Your account has been created. A welcome email has been sent to your inbox."
- "Start Chatting" button (blue, full width)
- User's name shown personalized: "Hey Rahul, you're all set!"
```

---

## PART 4 — QUICK RESUME DESCRIPTION (to put in your CV after building)

```
Real-Time Chat Application | Node.js, React.js, MySQL, Socket.io, Tailwind CSS

• Built a full-stack chat application where users can register, login, and exchange 
  real-time messages with other users using Socket.io WebSockets.
  
• Implemented JWT-based authentication with bcrypt password hashing and protected 
  API routes, with express-rate-limit to improve API security (reduced abuse by 
  limiting to 100 requests/15 min).
  
• Integrated Socket.io for bidirectional communication enabling real-time messaging 
  and live online/offline presence tracking across all connected clients.
  
• Used Cloudinary for cloud-based media storage (profile pictures + chat images), 
  Nodemailer for automated welcome emails, and deployed via Git-based CI/CD pipeline 
  using GitHub Actions.
```

---

*Guide created for: Real-Time Chat App | B.Tech Resume Project*
*Screens total: 15 | Batches: 3 × 5 screens each*
