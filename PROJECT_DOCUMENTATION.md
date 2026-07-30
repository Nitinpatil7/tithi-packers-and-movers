# Project Documentation

## Architecture

The project has one backend and one frontend application.

Backend:

- Location: `backend/`
- Runtime: Node.js, Express 5, MongoDB/Mongoose
- Entry point: `server.js`
- API prefix: `/api`
- Health route: `/api/v1/health`
- Realtime monitoring: Socket.IO namespace `/monitoring`
- Admin authentication: HTTP-only `admin_session` cookie

Frontend:

- Location: `frontend/`
- Runtime: Next.js 14 App Router
- Website routes: `src/app/(website)`
- Admin routes: `src/app/(admin)`
- Monitoring route: `src/app/(monitoring)`
- API origin: `NEXT_PUBLIC_API_URL`

## Important API Endpoints Used By Frontend

Public website:

- `GET /api/site-setting`
- `GET /api/branch`
- `GET /api/faq`
- `GET /api/testimonial`
- `GET /api/legal/:slug`
- `GET /api/items/catalog`
- `GET /api/addon/available?serviceType=local_shifting`
- `GET /api/booking-pricing-rules`
- `GET /api/booking-pricing-rules/:serviceType`
- `POST /api/bookings/draft`
- `PATCH /api/bookings/:bookingId/draft`
- `GET /api/bookings/:bookingId/quote`
- `POST /api/bookings/:bookingId/confirm`
- `GET /api/bookings/track?mobile=:mobile`
- `GET /api/bookings/track/:bookingId`

Admin:

- `POST /api/admin-auth/login`
- `GET /api/admin-auth/me`
- `POST /api/admin-auth/logout`
- `PATCH /api/admin-auth/change-password`
- `PATCH /api/admin-auth/profile`
- `GET /api/admin-analytics/dashboard`
- `GET /api/admin-analytics/overview`
- `GET /api/bookings/admin/all`
- `GET /api/bookings/admin/:bookingId`
- `PATCH /api/bookings/admin/:bookingId`
- `PATCH /api/bookings/admin/:bookingId/status`
- `PATCH /api/bookings/admin/:bookingId/quote`
- `GET /api/booking-pricing-rules/admin/all`
- `GET /api/items/admin/catalog`
- `GET /api/addon/admin/all`
- `GET /api/in-app-notifications/summary`
- `GET /api/notification`

Monitoring:

- `GET /api/v1/health`
- Socket.IO namespace `/monitoring`
- Synthetic probes include public website APIs and protected admin APIs. Admin 401/403 responses mean the endpoint is reachable and protected.

## Local Development

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Production Build

Backend:

```bash
cd backend
npm start
```

Frontend:

```bash
cd frontend
npm run build
npm start
```

## Environment Variables

Backend required:

- `NODE_ENV`
- `PORT`
- `MONGO_URI`
- `CLIENT_URL`
- `CLIENT_URLS`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`
- `ADMIN_SESSION_DAYS`
- `ADMIN_COOKIE_SAME_SITE`
- `BOOKING_REQUIRE_OTP`
- `SMS_PROVIDER`
- `WHATSAPP_ENABLED`

Frontend required:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GOOGLE_MAPS_KEY`
- `NEXT_PUBLIC_USE_REAL_OTP`
- `NEXT_PUBLIC_USE_DUMMY=false`

## Deployment Notes

The current frontend is one Next.js app. To deploy website, admin, and monitoring as separate domains without restructuring, create separate hosting projects that all build from `frontend/`, then route domains to the required paths or protect admin/monitoring with platform access controls.

Backend CORS must include every browser origin in `CLIENT_URLS`, for example:

```bash
CLIENT_URLS=https://www.example.com,https://admin.example.com,https://monitor.example.com
```

If the admin frontend and backend are on different sites, set `ADMIN_COOKIE_SAME_SITE=none` in production and keep HTTPS enabled so the secure cookie can be sent with `credentials: "include"`.

