# Upload Videos (Express)

A small Express.js application for authenticated users to upload, transcode, serve, and manage video files with image thumbnails and basic rate-limiting. Includes user session storage in MongoDB and server-side video handling via Busboy + Fluent-FFmpeg.

## Key Features

- Upload videos and thumbnail images (server-side streaming via Busboy)
- Automatic transcoding into multiple qualities (via `fluent-ffmpeg`)
- Range requests support for streaming video and images
- Per-user video management (list, delete)
- Session storage in MongoDB and Passport-based auth
- payment method useing paymob
- Simple rate limiting on uploads

## Tech Stack

- Node.js 18.x
- Express 4.x
- MongoDB (Mongoose)
- Busboy, Fluent-FFmpeg
- EJS for server-side views

## Prerequisites

- Node.js (v18 recommended)
- MongoDB server or Atlas cluster
- FFmpeg installed on the host (required by `fluent-ffmpeg`)

## Installation

1. Clone the repository:
```
   git clone <repo-url>
   cd upload\ videos
```
2. Install dependencies:
```
   npm install
```
3. Create a `.env` file at project root. Required environment variables (used by the app):

   DB_URI=<your-mongodb-uri>
   SESSION_SECRET_KEY=<a-secure-session-secret>
   SERVER_HOST=http://localhost:3000

You can also set `PORT` if you want the app to listen on a different port.

## Run

- Start the app:
```
  npm start OR npm run start
```
- For development (using `nodemon` if installed globally or as a dev dep):
```
  npm run dev
```
The app listens on port `3000` by default.

## Important Paths

- Static assets: `public/`, `static/`
- Uploaded files: `uploads/videos/` and `uploads/images/`
- Views: `views/` (EJS templates)

## Routes (mounted under `/videos`)

- `GET /videos/` — upload page (requires auth)
- `GET /videos/watch` — watch page view
- `POST /videos/upload` — upload video + image (rate-limited)
- `GET /videos/video` — list user's videos
- `GET /videos/video/:videoname?q=<quality>` — stream video (supports range)
- `DELETE /videos/video/:videoname` — delete video and derived qualities
- `GET /videos/image/:imagename` — serve image (supports range)

Authentication routes are mounted under `/auth` and payment under `/visa`.

## Payments (Paymob)

This project integrates Paymob for processing premium upgrades. The payment flow is implemented in `controllers/payment.controller.js` and `services/payment.service.js` and is mounted under the `/visa` route prefix.

- The app requests a Paymob auth token, creates an order, and then requests a payment key to build an iframe URL. The iframe base URL uses `PAYMOB_IFRAME_ID` and the final form URL is returned as JSON from the server.
- The amount and currency are currently hardcoded in the service as `1000` (cents) and `EGP`. Adjust `services/payment.service.js` if you need dynamic pricing.

Required environment variables:

- `PAYMOB_API_KEY` — Paymob API key used to get auth tokens
- `PAYMOB_INTEGRATION_ID` — Paymob integration ID used for creating payment keys
- `PAYMOB_IFRAME_ID` — iframe ID used to build the acceptance URL
- `HMAC_KEY` — secret used to verify Paymob webhook payloads

Relevant endpoints (mounted under `/visa`):

- `GET /visa/pricing` — pricing page (view)
- `GET /visa/premium` — initiates payment flow and returns JSON `{ url: <iframe-url> }`
- `POST /visa/webhook/processed` — Paymob server-to-server webhook. The controller validates the payload using a SHA512 HMAC with `HMAC_KEY` and updates the user's `premuim` flag and `limit` on success.
- `GET /visa/webhook/response?success=true|false` — browser redirect handler that renders `success` or `failture` views.

Notes:

- Make sure your webhook URL (e.g., `https://your-domain.com/visa/webhook/processed`) is configured in your Paymob dashboard and accessible from Paymob.
- The controller expects the Paymob webhook HMAC value to be provided as a query parameter named `hmac` and compares it against a SHA512 digest built from the payload fields.

## Configuration & Notes

- Ensure `FFmpeg` binary is available in the system PATH; `fluent-ffmpeg` relies on it for transcoding.
- Sessions are stored in MongoDB via `connect-mongodb-session` (see `app.js` for `DB_URI` usage).
- Upload handling is implemented with `busboy` to stream uploads directly to disk before processing.
- Transcoded files are written into `uploads/videos/` with quality-specific suffixes.

## File Structure (high-level)

- `app.js` — application entrypoint and middleware
- `routes/` — route definitions (video, auth, payment, main)
- `controllers/` — controllers (video handling, auth, payment)
- `services/` — helpers such as `video.service` for transcoding
- `utils/` — helpers (e.g., `passportconfig.js`, `multerconfig.js`)
- `uploads/` — persisted uploaded files (videos/images)

## Contributing

- Create a branch, add tests or relevant changes, and open a PR with a clear description.

## Troubleshooting

- If uploads fail or transcoding errors occur, verify FFmpeg is installed and accessible.
- For session or DB errors, verify `DB_URI` and network access to MongoDB.

## License

This project does not include a license file. Add a license before publishing if required.
