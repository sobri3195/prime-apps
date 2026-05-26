# PRIME Apps Backend (PHP Native)
Setup XAMPP/Laragon: aktifkan Apache+MySQL, arahkan document root ke `backend/public`.

## Setup
1. Buat DB `prime_apps`.
2. Import `database/schema.sql` lalu `database/seed.sql`.
3. Copy `.env.example` jadi `.env` dan sesuaikan.
4. Jalankan via Apache: `http://localhost/prime-backend/public/api/health`.

## Frontend
`VITE_API_BASE_URL=http://localhost/prime-backend/public/api`

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

## Endpoint utama
- POST `/auth/login`
- GET `/auth/me`
- GET/PUT `/patients/me`
- POST `/ai-eye/screenings`
- POST `/appointments`
- GET `/reports/me`
- GET `/marketplace/products`
- POST `/marketplace/orders`
- GET `/rewards/me`

## Contoh login
POST `/api/auth/login`
```json
{"email":"patient@prime.local","password":"password123"}
```
