📚 StoryChain

A collaborative storytelling web app built with the MERN-inspired stack (Node, Postgres, React, Redux, Vite, Tailwind).

🚀 Live Demo

Frontend: https://your-frontend.onrender.com

Backend API: https://your-backend.onrender.com/api/health

✨ Overview

StoryChain is an interactive platform where users create stories together, one paragraph at a time.

Register and log in securely

Create new stories or join ongoing ones

Contribute paragraphs only when it’s your turn

Finish or delete stories as the creator

View and enjoy completed stories

This project was my final bootcamp project, showcasing full-stack development from database design to deployment.

🛠️ Tech Stack
Frontend

⚛️ React + Vite — fast modern frontend setup

🎨 Tailwind CSS — sleek, responsive styling

🔄 Redux Toolkit — global state management

🌐 React Router — page navigation

Backend

🟢 Node.js + Express — REST API server

🗄️ PostgreSQL — relational database

🔑 JWT Authentication — secure login & protected routes

🛠️ Knex.js — database migrations & queries

DevOps / Deployment

🖥️ Render.com — backend & frontend hosting

🐘 Render Postgres — managed DB

⚙️ Environment Variables — .env for secrets, configured on Render

📂 Project Structure
StoryChain-App/
│
├── backend/          # Express API
│   ├── migrations/   # Knex migrations
│   ├── src/          # Controllers, routes, middleware
│   ├── knexfile.js   # DB config
│   └── package.json
│
├── frontend/         # React + Vite app
│   ├── src/
│   │   ├── features/ # Redux slices
│   │   ├── pages/    # Login, Register, Stories, Story Detail
│   │   └── components/
│   ├── index.html
│   └── package.json
│
└── README.md

🔑 Features

✅ Authentication

Register / Login with JWT

Protected routes (stories available only after login)

✅ Stories

Create a new story

Join / leave as a participant

Add paragraphs in turn order

Finish or delete story (creator only)

✅ UI/UX

Gradient backgrounds & styled forms

Responsive, centered layouts

Clean navigation (only show story links when logged in)

✅ Database

Migrations for users, stories, participants, paragraphs

Knex-powered queries for portability

Future Releases

 Real-time updates (WebSocket/polling)
 Reactions/Likes per paragraph
 Profiles (bio, contributions list)
 Prompts/Genres on story creation
 Story Gallery

⚡ Getting Started (Local Dev)
1. Clone the repo
git clone https://github.com/danielluvstech/StoryChain-App.git
cd StoryChain-App

2. Backend setup
cd backend
npm install
cp .env.example .env   # fill in DB + JWT_SECRET
npm run migrate
npm run dev

3. Frontend setup
cd frontend
npm install
npm run dev

4. Visit

Frontend: http://localhost:5173

Backend: http://localhost:3000/api/health

🌍 Deployment

Backend: Render Web Service (backend/)

Frontend: Render Static Site (frontend/)

DB: Render Postgres

👨‍💻 Author

Built with ❤️ by Daniel Lewin

📜 License

MIT License — free to use, copy, and modify.
