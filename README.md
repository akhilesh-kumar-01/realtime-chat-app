# Real-Time Chat App 🚀

Hi! I'm Akhilesh, a B.Tech student. I built this project to learn full-stack web development and figure out how real-time applications actually work under the hood. It was a great learning experience!

![Chat Screenshot](assets/chat-screenshot.png)

## What it does
It's a simple chat app where you can create an account, update your profile picture, and talk to other people in real-time. It looks a bit like iMessage because I really like clean designs.

- Register and login with secure passwords (JWT & bcrypt)
- Real-time chatting (no refreshing needed!)
- See who is online with a little green dot
- Send images in the chat
- Welcome emails when you sign up

## Tech Stack I Used
- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Real-Time:** Socket.io
- **Cloud Storage:** Cloudinary (for images)
- **Emails:** Nodemailer

## What I learned
- Setting up a MySQL database from scratch and connecting it to a Node backend.
- How to keep passwords safe by hashing them with bcrypt.
- **Socket.io was definitely the trickiest part!** It took me a while to figure out how to broadcast messages to specific users and update the online status in real-time, but I finally got it working.
- Handling file uploads with Multer and Cloudinary.
- Deploying apps automatically using GitHub Actions.

## Known Issues / Future Improvements
- I want to add a "typing..." indicator soon.
- Group chats would be a cool feature to add next.
- Sometimes if the database takes too long to wake up locally, you have to restart the backend. (I added a retry loop to help with this though!)
- Message read receipts (like the blue ticks) aren't there yet.

## 🚀 How to Run This Project Locally (Step by Step)

Don't worry if you are a beginner — just follow these steps one by one!

### What you need installed first:
- [Node.js](https://nodejs.org) — download and install it (LTS version)
- [XAMPP](https://www.apachefriends.org) — we use this to run MySQL database locally
- [Git](https://git-scm.com) — to clone this project

---

### Step 1 — Clone the project
Open your terminal and run:
```bash
git clone https://github.com/akhilesh-kumar-01/realtime-chat-app.git
cd realtime-chat-app
```

### Step 2 — Start your MySQL database
1. Open XAMPP Control Panel
2. Click "Start" next to MySQL
3. Wait for it to turn green

### Step 3 — Setup the Backend
1. Open terminal in the backend folder:
```bash
cd backend
npm install
```

2. Create a new file called `.env` in the backend folder and paste this inside it:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=        (leave empty if XAMPP, or put your MySQL password)
DB_NAME=chatapp
JWT_SECRET=any_random_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

3. Open MySQL and run the SQL file to create tables:
   - Open phpMyAdmin at http://localhost/phpmyadmin
   - Click "New" and create a database named `chatapp`
   - Click on `chatapp` database → go to "Import" tab
   - Select the `backend/config/createTables.sql` file and click "Go"

4. Start the backend server:
```bash
node server.js
```
You should see: `Server running on port 5000` and `MySQL Connected`

### Step 4 — Setup the Frontend
Open a new terminal in the frontend folder:
```bash
cd frontend
npm install
npm run dev
```

### Step 5 — Open the app
Go to your browser and open:
`http://localhost:5173`

Register a new account and start chatting! 🎉

---

### ⚠️ Common Problems and Fixes

**Problem:** MySQL not connecting
**Fix:** Make sure XAMPP MySQL is running (green)

**Problem:** Port 5000 already in use
**Fix:** Close other terminal windows or restart PC

**Problem:** Emails not sending
**Fix:** Make sure you used Gmail App Password, not your normal password

**Problem:** Cloudinary not working
**Fix:** Double check your Cloudinary API keys in `.env`

---

Thanks for checking out my project!
