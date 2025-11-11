WebTracker Backend - Local Development Guide

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





============================================


🚨 Important Notice
-------------------

This project must be run locally due to technical limitations with Vercel's serverless architecture and MongoDB connections. Deployment to Vercel will result in database connection timeouts and failed tracking events.

📖 Overview
-----------

WebTracker is a comprehensive analytics backend that tracks visitor behavior, sessions, and events. The system provides:

-   Visitor fingerprinting and identification

-   Session management

-   Event tracking (pageviews, custom events)

-   Real-time analytics and statistics

-   Admin dashboard endpoints

🛠 Prerequisites
----------------

Before you begin, ensure you have the following installed:

-   Node.js 16.x or higher

-   npm or yarn package manager

-   MongoDB Atlas account (free tier available)

-   Git for version control

### Verify Installation

bash

node --version    # Should show 16.x or higher
npm --version     # Should show 8.x or higher
git --version     # Should show git version

Quick Start
--------------

### 1\. Clone the Repository

bash

git clone <your-repository-url>
cd webtracker-backend

### 2\. Install Dependencies

bash

npm install

### 3\. Environment Configuration

bash

# Copy the environment template
cp .env.example .env

# Edit the .env file with your credentials
nano .env  # or use your preferred editor

### 4\. Start the Development Server

bash

# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start

### 5\. Verify Installation

bash

# Test the health endpoint
curl http://localhost:4000/health
# Expected response: {"ok":true,"ts":1234567890}

⚙️ Environment Setup
--------------------

### Required Environment Variables

Create a `.env` file in the root directory:

env

# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/webtracker?retryWrites=true&w=majority

# Server Configuration
PORT=4000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MINUTES=1
RATE_LIMIT_MAX=300

# CORS (Optional)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

### MongoDB Atlas Setup

1.  Create a MongoDB Atlas Account:

    -   Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

    -   Create a free account and project

2.  Create a Cluster:

    -   Choose "Shared Cluster" (free)

    -   Select your preferred cloud provider and region

3.  Database Access:

    -   Go to "Database Access" → "Add New Database User"

    -   Create username and password

    -   Set permissions to "Read and write to any database"

4.  Network Access:

    -   Go to "Network Access" → "Add IP Address"

    -   Add `0.0.0.0/0` to allow connections from anywhere

5.  Get Connection String:

    -   Go to "Clusters" → "Connect" → "Connect your application"

    -   Copy the connection string and update your `MONGO_URI`

📡 API Endpoints
----------------

### Health Check

http

GET /health

Response:

json

{
  "ok": true,
  "ts": 1234567890
}

### Track Events

http

POST /track
Content-Type: application/json
 {
  "visitorId": "fp_abc123",
  "sessionId": "session_xyz789",
  "page": "/home",
  "type": "pageview",
  "payload": {"buttonClicked": "cta"},
  "userAgent": "Mozilla/5.0..."
}

### Visitor Management

http

GET /visitors/:visitorId
GET /visitors?page=1&limit=20

### Statistics

http

GET /stats/overview
GET /stats/visitors/daily
GET /stats/pages/popular

### Admin Endpoints

http

GET /admin/events
DELETE /admin/events/:id
GET /admin/health

🗂 Project Structure
--------------------


```
webtracker-backend/
├── api/
│   └── index.js             
├── models/
│   ├── TrackingEvent.js      
│   └── Visitor.js          
├── routes/
│   ├── track.js            
│   ├── visitor.js           
│   ├── stats.js             
│   └── admin.js            
├── index.js                 
├── vercel.json             
├── package.json
└── .env      
```             

🎯 Usage Examples
-----------------

### Frontend Integration

javascript

```
await fetch('http://localhost:4000/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    visitorId: 'user_fingerprint',
    sessionId: 'current_session_id',
    page: window.location.pathname,
    type: 'pageview',
    userAgent: navigator.userAgent
  })
});

await fetch('http://localhost:4000/track', {
  method: 'POST',
  body: JSON.stringify({
    visitorId: 'user_fingerprint',
    sessionId: 'current_session_id',
    page: '/products',
    type: 'button_click',
    payload: { buttonId: 'buy-now', productId: '123' }
  })
});

```

🐛 Troubleshooting
------------------

### Common Issues

1.  MongoDB Connection Failed

    ```

    Error: Could not connect to MongoDB

    Solution:

    -   Verify `MONGO_URI` in `.env` file

    -   Check MongoDB Atlas IP whitelisting

    -   Ensure database user has correct permissions

    ```

2.  Port Already in Use

    ```

    Error: listen EADDRINUSE :::4000

    Solution:

    bash

    # Kill process using port 4000
    npx kill-port 4000
    # Or change PORT in .env file

    ````