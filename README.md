# StudioSpace — Backend

Express + MongoDB REST API and BetterAuth server for the StudioSpace
peer-to-peer studio marketplace.

**Stack:** Express 5 · MongoDB (Mongoose) · BetterAuth 1.7 (MongoDB adapter, cookie sessions, JWT plugin, Google provider)

## Getting started

```bash
npm install
cp .env.example .env      # fill in MONGODB_URI + secrets
npm run dev               # nodemon on http://localhost:5010
```

Optional: seed 6 sample studios so the frontend's featured section has data:

```bash
npm run seed
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Server port (default `5010`; `5000` collides with macOS AirPlay) |
| `CLIENT_URL` | Comma-separated allowed frontend origins (CORS + BetterAuth trusted origins) |
| `MONGODB_URI` | Atlas or local MongoDB connection string |
| `BETTER_AUTH_URL` | Local backend origin; in production, frontend proxy URL ending in `/api/backend/auth` |
| `BETTER_AUTH_SECRET` | BetterAuth cryptographic secret |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials (only provider) |

For deployment behind the frontend's same-origin API proxy, set
`BETTER_AUTH_URL` to the public frontend auth proxy URL (for example,
`https://example.com/api/backend/auth`), and set `CLIENT_URL` to the exact
public frontend origin (for example, `https://example.com`, with no path). Set
`BETTER_AUTH_SECRET` to the same long-lived secret on every backend instance.
The frontend server proxies browser traffic to the API so session cookies stay
first-party. Add the proxied callback URL to Google OAuth as
`https://example.com/api/backend/auth/callback/google`.

## Auth (BetterAuth)

Mounted at **`/api/backend/auth`** via `toNodeHandler`, matching the frontend
same-origin proxy and production `BETTER_AUTH_URL`. Uses the **MongoDB adapter**
(collections: `user`, `session`, `account`, `verification`) and cookie sessions
sent with `credentials: "include"` from the frontend.

- `POST /api/backend/auth/sign-up/email` · `POST /api/backend/auth/sign-in/email` — email & password
  (email confirmation and forgot-password email delivery are not configured)
- `POST /api/backend/auth/sign-in/social` — Google-only social login
- `GET /api/backend/auth/get-session` — current session/user
- `POST /api/backend/auth/sign-out` — logout
- `GET /api/backend/auth/token` — JWT via the `jwt()` plugin (bearer-token clients)
- Google sign-up is explicitly requested from the registration page; Google sign-in
  does not create new accounts and requires Google's email-verified claim.
- `BetterAuth` handler defined in `src/lib/auth.js`

## REST API

All responses follow `{ success: boolean, data: ... }`. Errors: `{ success: false, message }`.

### Studios (`/api/studios`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/?search=&category=&sort=` | Public | List w/ title+location search, category filter, sort (`newest`, `rating`, `price-asc`, `price-desc`) |
| `GET` | `/featured` | Public | Top-rated, newest tie-break, **limit 6** |
| `GET` | `/mine` | Private | Listings where `ownerEmail` matches the session user |
| `GET` | `/:id` | Public | Full studio incl. amenities & reviews |
| `POST` | `/` | Private | Create — `owner/ownerName/ownerEmail` always set **from the session**, never the client body |
| `PUT` / `PATCH` | `/:id` | Private | Update — 403 unless the listing belongs to you; owner fields read-only |
| `DELETE` | `/:id` | Private | Delete — 403 unless the listing belongs to you |

### Bookings (`/api/bookings` — all private)

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/` | Create reservation: validates date/time + whole hours (1–24), rejects overlapping pending/confirmed reservations, snapshots price server-side, status **`Pending`** |
| `GET` | `/mine` | Booking list with populated studio (`title`, `images`, `location`, rate) |
| `PATCH` | `/:id/cancel` | Only your own bookings, only while `Pending` → sets `Cancelled` |

Statuses: `Pending` → `Confirmed` → `Completed`, or `Cancelled` (owner/host workflow can flip statuses in v2; every status change already validates ownership).

### End-to-end test

```bash
npm test   # scripts/e2e.mjs — register → session → studio CRUD → booking lifecycle
npm run test:unit  # booking date/time and overlap validation
```

## Suggested MongoDB indexes

Created via Mongoose schema config: `studios(category, ownerEmail, createdAt)`,
`bookings(user, studio)`.

## Integrating with the frontend

Frontend `.env.local` (the API URL is configured as the proxy target):

```
BACKEND_ORIGIN=http://localhost:5010
```

Google OAuth console: add redirect `http://localhost:5010/api/auth/callback/google`
and authorized origin `http://localhost:3000`.
> Tip: macOS binds port 5000 to AirPlay, so the API defaults to **5010**.
