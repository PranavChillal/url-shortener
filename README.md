# Link Shortener

A full-stack URL shortener. Paste a long link, get a short one, and see how many times each short link has been clicked.

**Live demo:** https://url-shortener-sand-eta.vercel.app/
**API:** https://urlshortener-api-ske7.onrender.com/health

> The backend runs on Render's free tier, which goes to sleep after about 15 minutes of inactivity. The first request after a break can take 30-60 seconds to wake up.

## Features

- Shorten any `http` or `https` link into a 7-character short link
- Opening a short link redirects to the original URL
- Click counter for every link, updated on each redirect
- List of your most recent links with their click counts
- Input validation with clear error messages
- One-click copy for the shortened link

## Tech stack

| Layer    | Tools                            |
| -------- | -------------------------------- |
| Frontend | React (Vite), plain CSS          |
| Backend  | Node.js, Express                 |
| Database | MongoDB Atlas with Mongoose      |
| Hosting  | Vercel (client), Render (server) |

## How it works

1. The React app sends the long URL to `POST /api/shorten`.
2. The server checks that it is a valid `http` or `https` URL.
3. It generates a random 7-character code from letters and numbers (about 3.5 trillion combinations) using Node's `crypto` module. If a code already exists, it retries.
4. The link is saved in MongoDB and the short URL is returned.
5. When someone opens `/:code`, the server finds the link, increments its click count, and redirects to the original URL.

### Design decisions

- **302 redirect instead of 301.** Browsers cache permanent (301) redirects, so repeat visits would never reach the server and would not be counted. A temporary (302) redirect makes sure every click is counted.
- **Atomic click counting.** The count is increased with MongoDB's `$inc` in the same operation that finds the link, so simultaneous clicks cannot overwrite each other.
- **Unique index on the short code.** MongoDB itself rejects duplicate codes, and the server retries with a new code when that happens.
- **Configurable addresses.** The server's public address (`BASE_URL`) and the client's API address (`VITE_API_URL`) come from environment variables, so the same code runs locally and in production.

## API

### `POST /api/shorten`

Request body:

```json
{ "originalUrl": "https://example.com/some/very/long/link" }
```

Response `201 Created`:

```json
{
  "originalUrl": "https://example.com/some/very/long/link",
  "shortCode": "aB3xK9q",
  "shortUrl": "https://your-server.onrender.com/aB3xK9q"
}
```

Response `400 Bad Request` for an invalid URL:

```json
{ "error": "Please provide a valid http or https URL." }
```

### `GET /api/links`

Returns the 100 most recent links, newest first, each with `id`, `originalUrl`, `shortCode`, `shortUrl`, `clicks`, and `createdAt`.

### `GET /:code`

Counts the click and redirects (`302`) to the original URL. Returns `404` if the code does not exist.

### `GET /health`

Returns `{ "status": "ok" }`.

## Run it locally

You need Node.js and a MongoDB Atlas database (the free tier works).

```bash
git clone https://github.com/PranavChillal/url-shortener.git
cd url-shortener
```

**Server**

```bash
cd server
npm install
```

Create `server/.env`:

```
PORT=5000
BASE_URL=http://localhost:5000
MONGO_URI=your_mongodb_connection_string
```

Then start it:

```bash
npm run dev
```

**Client** (in a second terminal)

```bash
cd client
npm install
```

Create `client/.env`:

```
VITE_API_URL=http://localhost:5000
```

Then start it:

```bash
npm run dev
```

Open http://localhost:5173.

## Project structure

```
url-shortener/
├── server/
│   ├── index.js            # Express app and server startup
│   ├── db.js               # MongoDB connection
│   ├── models/Url.js       # Mongoose schema
│   ├── routes/
│   │   ├── urlRoutes.js    # POST /api/shorten, GET /api/links
│   │   └── redirectRoutes.js  # GET /:code
│   └── utils/generateCode.js  # Random short code generator
└── client/
    └── src/
        ├── App.jsx         # Main page
        ├── App.css
        └── index.css
```

## Known limitations and ideas for next steps

- There are no user accounts, so the links list is shared by everyone. Adding login would let each person see only their own links.
- No rate limiting yet, so the shorten endpoint could be spammed.
- Possible additions: custom aliases, link expiry, and per-click analytics (time, referrer).
- No automated tests yet.

## Author

Pranav P Chillal
[LinkedIn](https://www.linkedin.com/in/pranav-p-chillal-6a97813bb) · [GitHub](https://github.com/PranavChillal)
