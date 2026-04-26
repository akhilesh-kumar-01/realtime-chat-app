# Real-Time Chat Application

A full-stack, real-time chat application modeled after the clean, minimalist iOS iMessage design system. It allows users to create accounts, update their profiles, upload images, and chat instantly in real-time with online/offline presence tracking.

## 📸 Screenshots

![Chat Interface](assets/chat-screenshot.png)

## 🛠 Tech Stack

- **Frontend:** React.js, Tailwind CSS (iOS Design System), React Router, Lucide React
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Real-time Engine:** Socket.io
- **Security:** JWT (JSON Web Tokens), bcryptjs, express-rate-limit
- **Media Storage:** Cloudinary
- **Email Service:** Nodemailer (Gmail)
- **CI/CD:** GitHub Actions

## ✨ Features

1. **Authentication:** Secure user registration and login with bcrypt password hashing and JWT persistence.
2. **Real-Time Messaging:** Instant message delivery and display without page reloads using Socket.io.
3. **Online/Offline Status:** Live tracking of connected users represented by dynamic green status dots.
4. **Image Upload in Chat:** Send picture attachments seamlessly via Cloudinary secure uploads.
5. **Email Notifications:** Automated welcome emails sent instantly upon successful registration via Nodemailer.
6. **Profile Page:** Custom user profiles with profile picture management and settings.
7. **API Rate Limiting:** Brute-force and spam protection using backend express rate limiting.
8. **CI/CD Deployment:** Automated build and deployment pipelines configured with GitHub Actions.

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- MySQL Server (XAMPP or standalone)

### 1. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the environment variables list below.
4. Set up your MySQL database by running the `config/createTables.sql` script.
5. Start the backend server:
   ```bash
   npm run dev
   ```
   *(Or `node server.js`)*

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser to `http://localhost:5173`

## 🔑 Environment Variables

The backend requires a `.env` file in the `backend/` directory with the following keys:

```env
PORT=
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=
EMAIL_PASS=
```

---
**Author:** Akhilesh Kr
