# 💬 Real-Time Chat App | Full-Stack Project

[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)](https://realtime-chat-app-drab-beta.vercel.app/)
[![Render](https://img.shields.io/badge/Backend-Render-blue?style=flat-square&logo=render)](https://realtime-chat-app-34u8.onrender.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**A premium, iMessage-inspired real-time chat application built for my B.Tech CSE portfolio.**

🔗 **[Live Demo — Try it here!](https://realtime-chat-app-drab-beta.vercel.app/)**

---

## 🌟 Project Overview
Hey there! I'm **Akhilesh Kr.**, a B.Tech CSE student. I built this project to dive deep into how real-time communication works in the modern web. I wanted to create something that wasn't just a basic "Hello World" chat, but a production-ready app with image sharing, profile management, and a clean, responsive UI that feels like a native iOS app.

### Why I built this:
- To master **Socket.io** for real-time events.
- To understand how to handle large file uploads and image processing.
- To learn how to deploy a full-stack app across multiple platforms (Vercel + Render).
- To solve real-world problems like **Mobile Safe Areas** and **Cross-Device Layouts**.

---

## 🔥 Features
- 🔐 **Secure Authentication:** JWT-based login/signup with bcrypt password hashing.
- ⚡ **Real-Time Messaging:** Instant message delivery using Socket.io (no page refresh!).
- 🟢 **Online Status:** Live tracking of who's online with a status indicator.
- 📸 **Image Sharing:** Send photos in chat with instant preview.
- 📥 **Direct Downloads:** Download any image sent in the chat directly to your device.
- ➡️ **Message Forwarding:** Easily forward images to other contacts with a single click.
- 🖼️ **Image Viewer:** High-quality, full-screen image viewer with glassmorphism effects.
- 📱 **Fully Responsive:** Optimized for everything from a 4K monitor to a OnePlus 12 curved screen.
- 👤 **User Profiles:** Update your profile picture and name; view detailed info about other users.
- 📧 **Automated Emails:** Welcome emails sent via Nodemailer upon successful registration.
- 🛠️ **Error Handling:** Robust validation and user-friendly toast notifications.

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js |
| **Real-Time** | Socket.io |
| **Database** | MongoDB Atlas (Mongoose) |
| **Storage** | Cloudinary (for profile and chat images) |
| **Email** | Nodemailer |
| **Deployment** | Vercel (Frontend), Render (Backend) |
| **CI/CD** | GitHub Actions (Auto-deployment on Push) |

---

## 📂 Folder Structure

```text
.
├── backend/
│   ├── config/         # DB and Cloudinary configs
│   ├── controllers/    # Request handlers (Logic)
│   ├── middleware/     # Auth and Upload middlewares
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── socket/         # Socket.io logic
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth and Socket contexts
│   │   ├── pages/      # Main application screens
│   │   └── utils/      # API and utility helpers
│   └── index.html
└── DEPLOYMENT_GUIDE.md # (Internal maintenance guide)
```

---

## 🚀 Installation & Setup

Want to run this project on your machine? Follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/akhilesh-kumar-01/realtime-chat-app.git
cd realtime-chat-app
```

### 2. Setup the Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```
Run the server:
```bash
npm run dev
```

### 3. Setup the Frontend
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
Run the development server:
```bash
npm run dev
```

---

## 🔄 CI/CD Workflow
I implemented a **Push-to-Deploy** workflow using GitHub Actions. 
- Every time I push code to the `master` branch, a GitHub Action triggers.
- It automatically notifies **Vercel** and **Render** to pull the latest changes.
- The backend is re-built on Render, and the frontend is deployed as a production bundle on Vercel.
- This ensures that my live site is always up-to-date without me having to manually deploy anything.

---

## 🛠️ Challenges I Faced (and solved!)

- **The "Invalid Date" Mystery:** MongoDB's `createdAt` didn't match the frontend's expected `created_at` field, causing messages to show as "Invalid Date". I fixed this by standardizing the fields in the backend controllers.
- **OnePlus 12 Display Issue:** On devices with curved screens or notches, the chat bubbles were being cut off. I had to implement a custom **Safe Area** padding strategy and use `min-w-0` to fix flexbox overflow.
- **Large Image Rejection:** I found that OnePlus photos are often 10MB+, which exceeded the default server limits. I increased the backend payload limit to **50MB** and added **Frontend Image Compression** using a Canvas-based approach to ensure photos stay under Cloudinary's 10MB limit.
- **CORS & SPA Routing:** Solving "404 on Refresh" on Vercel required a custom `vercel.json` file to redirect all requests to `index.html`.

---

## 💡 What I Learned
- **Scalability:** Moving from local MySQL to MongoDB Atlas for a production-grade experience.
- **Real-Time Reliability:** Handling socket disconnections and re-syncing online status.
- **Image Optimization:** Why resizing on the client side is better for user experience and server load.
- **Production Debugging:** Using Render logs to track down Cloudinary size limit errors.

---

## 🔮 Future Improvements
- [ ] **Typing Indicators:** See when the other person is typing.
- [ ] **Group Chats:** Create rooms for multiple users.
- [ ] **Message Search:** Quickly find old conversations.
- [ ] **End-to-End Encryption:** For ultimate privacy.

---

## 👨‍💻 Author
**Akhilesh Kr.**
*B.Tech CSE Student & Full-Stack Developer*

- GitHub: [@akhilesh-kumar-01](https://github.com/akhilesh-kumar-01)
- LinkedIn: [Your Profile Link Here]

---
*Created with ❤️ by a student dev.*
