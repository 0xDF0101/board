# Board — 익명 게시판

<a href="https://github.com/devxb/gitanimals">
  <img src="https://render.gitanimals.org/lines/kse716?pet-id=1" width="2000" height="300"/>
</a>

An Instagram-style anonymous bulletin board built with Node.js, Express, and MongoDB. Users can post, comment, and like content without revealing their identity beyond a chosen username.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | — |
| Framework | Express.js | 5.2.1 |
| Database | MongoDB + Mongoose | 6.16 / 8.15 |
| Templating | EJS | 3.1.10 |
| Auth | express-session + bcrypt | 1.18 / 6.0 |
| Form methods | method-override | 3.0.0 |
| Env vars | dotenv | 16.5.0 |
| Frontend | Vanilla JS + Bootstrap (CDN) | — |
| Deployment | Docker + Render | — |

---

## Features

- **Posts** — Create, edit, and delete posts with optional image upload
- **Feed** — Paginated Instagram-style feed with infinite scroll
- **Search** — Full-text search across post titles and content
- **Likes** — AJAX like/unlike with real-time count update (no page reload)
- **Comments** — Inline comments per post with delete support
- **Authentication** — Session-based register / login / logout
- **Authorization** — Ownership checks on edit and delete; admin role bypass
- **User profiles** — Public profile pages showing posts and stats
- **My page** — Update nickname and profile picture
- **User search** — Find users by ID or nickname
- **Toast notifications** — Instagram-style error/success alerts with auto-dismiss

---

## Project Structure

```
board/
├── index.js                  # Entry point: Express config, DB connect, route mounting
├── models/
│   ├── Post.js               # title, content, likes, author, timestamps
│   ├── Comment.js            # content, post, author, timestamps
│   └── User.js               # userId, userPw (hashed), role, timestamps
├── routes/
│   ├── posts.js              # CRUD, like, pagination API
│   ├── comment.js            # Create / delete comments
│   └── user.js               # Register, login, logout, profile, search
├── middlewares/
│   └── authMiddleware.js     # isLoggedIn, checkPostOwnership, checkCommentOwnership
├── views/
│   ├── partials/             # header.ejs, footer.ejs
│   ├── posts/                # index.ejs, edit.ejs
│   ├── user/                 # login.ejs, register.ejs, mypage.ejs, profile.ejs
│   └── new.ejs
└── public/
    ├── css/style.css
    └── js/
        ├── like.js           # AJAX like button
        ├── validate.js       # Real-time duplicate ID check + password strength
        └── infiniteScroll.js # Infinite scroll via GET /posts/api/posts?page=N
```

---

## Environment Variables

Create a `.env` file in the project root. **Never commit this file.**

```env
MONGO_DEV_URI=mongodb://localhost:27017/board
MONGO_PROD_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/board
SESSION_SECRET=your-secret-key
PORT=3000
NODE_ENV=                     # set to "production" on Render; omit for dev
```

| Variable | Required | Description |
|---|---|---|
| `MONGO_DEV_URI` | Yes | MongoDB connection string for local development |
| `MONGO_PROD_URI` | Yes | MongoDB connection string for production |
| `SESSION_SECRET` | Yes | Secret used to sign session cookies |
| `PORT` | No | HTTP port (defaults to `3000`) |
| `NODE_ENV` | No | Set to `production` to use `MONGO_PROD_URI` |

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/0xDF0101/board.git
cd board

# 2. Install dependencies
npm install

# 3. Create environment file and fill in your values
cp .env.example .env

# 4. Start the server
node index.js
```

The server starts at `http://localhost:3000` and redirects `/` → `/posts`.

---

## Docker

### Build and run manually

```bash
docker build -t board .
docker run -p 3000:3000 --env-file .env board
```

### docker-compose

```yaml
version: "3.9"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    environment:
      NODE_ENV: production
    restart: unless-stopped
```

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f app
```

---

## Deployment (Render)

1. Push the repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com) and connect the repo.
3. Set the following environment variables in the Render dashboard:
   - `MONGO_PROD_URI`
   - `SESSION_SECRET`
   - `NODE_ENV=production`
4. Set the **Start Command** to `node index.js`.
5. Deploy — Render builds and runs the Docker container automatically.
