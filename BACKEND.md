# Backend Setup Guide

## 1. Prerequisites

- PostgreSQL server (riêng, bất kỳ host nào)
- Node.js 18+

## 2. Cấu hình .env

Copy `.env.example` → `.env` và điền thông tin thực:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@YOUR_HOST:5432/photo_journey?schema=public"

# Generate secrets:  openssl rand -base64 48
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
```

## 3. Khởi tạo database

```bash
# Tạo database trên PostgreSQL server (chạy 1 lần)
npx prisma migrate dev --name init

# Hoặc production deploy:
npx prisma migrate deploy
```

## 4. Chạy development

```bash
npm run dev
```

---

## API Reference

### Auth

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/auth/register` | ❌ | Đăng ký tài khoản mới |
| POST | `/api/auth/login` | ❌ | Đăng nhập |
| POST | `/api/auth/refresh` | cookie | Refresh access token |
| POST | `/api/auth/logout` | cookie | Đăng xuất, revoke token |
| GET | `/api/auth/me` | ✅ | Lấy thông tin user hiện tại |
| PATCH | `/api/auth/me` | ✅ | Cập nhật profile |

### Check-ins

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| GET | `/api/checkins` | ✅ | Danh sách check-ins của user |
| POST | `/api/checkins` | ✅ | Tạo check-in mới |
| GET | `/api/checkins/:id` | ✅ | Chi tiết 1 check-in |
| PUT | `/api/checkins/:id` | ✅ | Cập nhật check-in |
| DELETE | `/api/checkins/:id` | ✅ | Xoá check-in |

---

## Request / Response Examples

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "traveler",
  "displayName": "Le Dong",
  "password": "mypassword123"
}
```
Response: sets `access_token` + `refresh_token` cookies.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "mypassword123" }
```

### Authenticated request
```http
GET /api/checkins
Authorization: Bearer <access_token>
# hoặc cookie access_token tự động gửi
```

### Create check-in
```http
POST /api/checkins
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Ha Giang Loop",
  "location": "Ha Giang",
  "country": "Vietnam",
  "lat": 23.0825,
  "lng": 105.0678,
  "date": "2024-03-15T00:00:00Z",
  "mood": "mustgo",
  "type": "mountain",
  "images": ["https://images.unsplash.com/..."],
  "tags": ["motorbike", "mountains"],
  "description": "The most breathtaking roads.",
  "story": "Full travel story here..."
}
```

### Paginated list with filters
```http
GET /api/checkins?page=1&limit=10&mood=amazing&q=vietnam
```

---

## Security Architecture

```
Client request
    │
    ▼
Next.js Middleware (Edge)          ← verifies JWT via jose (Edge-safe)
    │ sets x-user-id header
    ▼
Route Handler (Node.js)            ← requireAuth() reads header
    │
    ▼
Prisma (PostgreSQL adapter)        ← queries DB via pg driver
    │
    ▼
PostgreSQL (your server)
```

**Token strategy:**
- **Access token**: JWT HS256, 15 phút, stored in HTTP-only cookie
- **Refresh token**: random 40 bytes, SHA-256 hashed before DB storage, 7 ngày, path=/api/auth/refresh
- **Rotation**: mỗi refresh → old token bị xoá, new token được tạo
- **Revocation**: logout xoá refresh token khỏi DB ngay lập tức

**Password security:**
- bcrypt với 12 salt rounds
- Timing-safe compare (luôn chạy bcrypt dù user không tồn tại)
