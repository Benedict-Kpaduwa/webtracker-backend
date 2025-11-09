# Web Tracking Backend (Boilerplate)

This project contains a ready-to-run Node.js + Express backend for the Web Tracking System.
It supports:
- Receiving tracking events (`POST /api/track`)
- Visitor aggregation and lookup (`GET /api/visitors/:visitorId`)
- Dashboard stats (`GET /api/stats`)
- Basic admin auth middleware (JWT-based) for protecting admin endpoints
- Optional FingerprintJS Pro server-side enrichment (requires API key)
- Rate limiting, helmet, and basic security best practices

## Quick start (local)
1. Copy `.env.example` to `.env` and fill `MONGO_URI`.
2. Install dependencies:
```bash
npm install
```
3. Start server (dev):
```bash
npm run dev
```
4. API endpoints:
- POST /api/track
- GET /api/visitors/:visitorId
- GET /api/stats
- POST /api/admin/login  (to get JWT for protected admin endpoints)

## Notes
- This is for educational/demo use. Do not store PII without consent.
- If you want FingerprintJS Pro enrichment, set `FINGERPRINT_PRO_API_KEY` and uncomment code in `utils/fpPro.js`.

