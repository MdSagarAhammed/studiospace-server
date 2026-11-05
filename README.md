# StudioSpace — Backend API

**Powering the Creative Workspace Marketplace**

The StudioSpace backend provides RESTful APIs for managing studio listings, user authentication, reservations, and database operations. It uses Express.js and MongoDB to deliver a scalable and secure backend infrastructure.

🌐 **Live API URL:** https://studiospace-server-4baa.onrender.com

## ✨ Key Features

- **Studio Management API:** Create, retrieve, update, and delete studio listings.
- **Booking Management:** Create reservations, retrieve booking records, and manage booking statuses.
- **Secure Authorization:** Protect private API operations using JWT-based authentication and HTTPOnly cookies.
- **Double-Booking Prevention:** Check existing confirmed reservations to prevent overlapping bookings.
- **MongoDB Integration:** Store and manage studio listings, bookings, and related application data.
- **Data Validation:** Validate incoming requests and handle errors with appropriate HTTP status codes.
- **Protected Operations:** Restrict sensitive operations to authenticated and authorized users.

## 🛠️ Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript
- **Database:** MongoDB
- **Authentication:** JWT, HTTPOnly Cookies
- **Environment Management:** dotenv
- **API Architecture:** REST API
- **Deployment:** Render

## 🚀 Local Setup

**1. Clone the repository**

```bash
git clone https://github.com/MdSagarAhammed/studiospace-server.git
cd studiospace-server
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

Create a `.env` file in the project root:

```env
PORT=5000
CLIENT_URL=http://localhost:3000

MONGODB_URI=
BETTER_AUTH_URL=http://localhost:5000/api/backend/auth
BETTER_AUTH_SECRET=get your betterauth secret


GOOGLE_CLIENT_ID=get your google client id
GOOGLE_CLIENT_SECRET=get your google client secret

```


**4. Start the development server**

```bash
npm run dev
```

For production:

```bash
npm start
```

**5. Verify the API**

Visit:

```
http://localhost:5000
```

## 🔗 API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/studios` | Get all studios |
| GET | `/api/studios/:id` | Get studio details |
| POST | `/api/studios` | Create a studio |
| PATCH | `/api/studios/:id` | Update a studio |
| DELETE | `/api/studios/:id` | Delete a studio |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings` | Get bookings |
| PATCH | `/api/bookings/:id` | Update booking status |
 

## 🔒 Security & Validation

- JWT authentication for protected operations.
- HTTPOnly cookies for secure token storage.
- Authorization checks for studio ownership and booking operations.
- Booking collision detection against confirmed reservations.
- Environment variables for sensitive credentials.
- Centralized error handling and request validation.

## 📌 Project Purpose

The StudioSpace backend powers a peer-to-peer creative workspace marketplace by providing reliable APIs, secure data management, and booking functionality for creators and studio owners.