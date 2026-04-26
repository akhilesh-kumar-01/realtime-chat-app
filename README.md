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

## How to run it locally

**Backend:**
1. Open the `backend` folder and run `npm install`
2. Create a `.env` file for your MySQL, JWT, Email, and Cloudinary secrets.
3. Import the `createTables.sql` into your MySQL database.
4. Run `npm run dev`

**Frontend:**
1. Open the `frontend` folder and run `npm install`
2. Run `npm run dev`
3. Go to `http://localhost:5173` in your browser.

Thanks for checking out my project!
