# CLAUDE.md — Anonymous Board Project

## Project Overview

A full-stack anonymous bulletin board (익명 게시판) built with Node.js/Express and MongoDB. Educational project practicing MVC patterns, session auth, and client-side progressive enhancement.

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

## Package Structure

```
board/
├── index.js                  # App entry point: Express config, DB connect, route mounting
├── models/                   # Mongoose schemas (data layer)
│   ├── Post.js               # title, content, likes, author (ref User), timestamps
│   ├── Comment.js            # content, post (ref Post), author (ref User), timestamps
│   └── User.js               # userId, userPw (hashed), role (user|admin), timestamps
├── routes/                   # Route handlers (controller layer)
│   ├── posts.js              # CRUD, like (+1), pagination API (/api/posts)
│   ├── comment.js            # POST /:id/comments — create comment
│   └── user.js               # register, login, logout, check-duplicate
├── middlewares/
│   └── authMiddleware.js     # isLoggedIn(), checkPostOwnership()
├── views/                    # EJS templates (presentation layer)
│   ├── partials/             # header.ejs, footer.ejs — included in every page
│   ├── posts/                # index.ejs, show.ejs, edit.ejs
│   ├── user/                 # login.ejs, register.ejs
│   └── new.ejs               # New post form
└── public/                   # Static assets served directly
    ├── css/style.css
    └── js/
        ├── like.js           # AJAX like button (fetch POST, no page reload)
        ├── validate.js       # Real-time duplicate ID check + password strength
        └── infiniteScroll.js # Infinite scroll via GET /posts/api/posts?page=N
```

---

## Environment Variables

Required in `.env` (never commit this file):

```
MONGO_DEV_URI=...
MONGO_PROD_URI=...
SESSION_SECRET=...
PORT=3000          # optional, defaults to 3000
NODE_ENV=          # set to "production" on Render; anything else uses DEV DB
```

---

## Coding Conventions

### General
- **CommonJS** modules throughout (`require` / `module.exports`). Do not use ES module syntax (`import`/`export`).
- **camelCase** for all variables, functions, and schema field names (e.g., `userId`, `userPw`, `likeCount`).
- **PascalCase** for model names and their imports (e.g., `Post`, `Comment`, `User`).

### Routes
- Each resource has its own router file in `routes/` and is mounted in `index.js` via `app.use('/resource', router)`.
- Route handlers use a mix of `.then()/.catch()` chains and `async/await + try/catch`. Both styles exist — match the style already in the file you're editing.
- Middleware is applied per-route as inline arguments (e.g., `router.delete('/:id', isLoggedIn, checkPostOwnership, handler)`).
- Authentication guard: always add `isLoggedIn` before any route that requires a logged-in user.
- Ownership guard: always add `checkPostOwnership` (after `isLoggedIn`) for edit/delete routes.

### Models
- All schemas use `{ timestamps: true }` — never manually manage `createdAt`/`updatedAt`.
- Cross-document references use `mongoose.Schema.Types.ObjectId` with a `ref` field pointing to the model name string.
- Use `.populate('field', 'selectedFields')` when rendering views that need referenced document data.

### Session
- Session user object stored as `req.session.user = { _id, userId, role }` on login.
- Always check `req.session.user` for identity; compare ObjectIds with `.equals()` not `===`.

### Views (EJS)
- Pass `sessionUser: req.session.user` to every `res.render()` call so templates can conditionally show auth-aware UI.
- Partials are stored in `views/partials/` and included with `<%- include('../partials/header') %>`.
- Use `method-override` query string (`?_method=DELETE`, `?_method=PUT`) in forms for non-GET/POST HTTP methods.

### Client-side JS
- Vanilla JS only — no frontend frameworks.
- AJAX calls use the `fetch` API with `.then()` chains.
- DOM interaction always waits for `DOMContentLoaded` before querying elements.
- Data passed to JS from HTML via `data-*` attributes (e.g., `data-id` on like buttons).

---

## Things to Avoid

- **Do not** add `async/await` to a route that currently uses `.then()/.catch()` chains without converting the whole handler — mixing patterns in a single function causes confusion.
- **Do not** store sensitive data beyond `{ _id, userId, role }` in the session object.
- **Do not** use `$inc` or `findByIdAndUpdate` for business logic that needs validation — fetch first, validate, then save.
- **Do not** expose raw Mongoose error objects to the client; always send a generic message like `'서버 오류'`.
- **Do not** add `console.log` calls that print full session or user objects in production paths — they can leak sensitive data.
- **Do not** skip `isLoggedIn` middleware on routes that mutate data (POST/PUT/DELETE).
- **Do not** commit `.env` or `node_modules/` — both are in `.gitignore`.
- **Do not** use `new User() + save()` and `User.create()` interchangeably without purpose — the codebase uses both; choose `create()` for simplicity unless you need the instance before saving.
- **Do not** render views from absolute `../views/` paths (e.g., `res.render('../views/new.ejs')`) — use the path relative to the `views` root (e.g., `res.render('new')`).

---

## Running the Project

```bash
# Install dependencies
npm install

# Run locally (uses MONGO_DEV_URI)
node index.js

# Run in Docker
docker build -t board .
docker run -p 3000:3000 --env-file .env board
```

Server starts at `http://localhost:3000` and redirects `/` → `/posts`.
