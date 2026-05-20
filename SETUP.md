# Photo Journey — Hướng dẫn cài đặt & Deploy

## Yêu cầu

| Công cụ | Phiên bản tối thiểu |
|---------|-------------------|
| Node.js | 22+ |
| npm | 10+ |
| Docker | 24+ |
| Docker Compose | v2 (plugin, không phải `docker-compose` cũ) |

---

## 1. Lấy source code

```bash
git clone <repo-url> photo_journey
cd photo_journey/travel-mockup
```

---

## 2. Chạy local (development)

### 2.1 Cài dependencies

```bash
npm install
```

### 2.2 Tạo file `.env`

```bash
cp .env.example .env
```

Sửa `.env`:

```env
DATABASE_URL="postgresql://journey:changeme@localhost:5432/photo_journey?schema=public"
JWT_ACCESS_SECRET="<tạo bằng: openssl rand -base64 48>"
JWT_REFRESH_SECRET="<tạo bằng: openssl rand -base64 48>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 2.3 Chạy PostgreSQL local bằng Docker

```bash
docker run -d \
  --name pj-db \
  -e POSTGRES_USER=journey \
  -e POSTGRES_PASSWORD=changeme \
  -e POSTGRES_DB=photo_journey \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2.4 Chạy migration & generate Prisma client

```bash
npx prisma generate
npx prisma migrate deploy
```

### 2.5 Khởi động dev server

```bash
npm run dev
```

Truy cập: **http://localhost:3000**

---

## 3. Deploy production (Docker Compose)

Đây là cách deploy trên **server thật** (VPS, EC2, v.v.).

### 3.1 Tạo file `.env.production`

```bash
cp .env.production.example .env.production
```

Điền giá trị thực vào `.env.production`:

```env
# Mật khẩu PostgreSQL — tạo random:
# openssl rand -base64 24
POSTGRES_PASSWORD=abc123XYZ...

# JWT secrets — tạo random (mỗi cái khác nhau):
# openssl rand -base64 48
JWT_ACCESS_SECRET=aaabbbccc...
JWT_REFRESH_SECRET=dddeeefff...

# Port expose ra ngoài (Nginx/reverse proxy trỏ vào đây)
APP_PORT=3000
```

> **Lưu ý bảo mật:** Không commit `.env.production` lên git. File `.gitignore` đã loại nó ra.

### 3.2 Build & chạy

```bash
docker compose --env-file .env.production up -d --build
```

Docker Compose sẽ tự động:
1. Khởi động PostgreSQL và chờ healthy
2. Chạy `prisma migrate deploy` (migrate service)
3. Chạy Next.js app (standalone mode, port 3000)

### 3.3 Kiểm tra trạng thái

```bash
# Xem logs tất cả services
docker compose logs -f

# Xem logs riêng từng service
docker compose logs -f app
docker compose logs -f db
docker compose logs -f migrate
```

### 3.4 Dừng / restart

```bash
# Dừng
docker compose down

# Restart app (không rebuild)
docker compose restart app

# Rebuild và deploy lại sau khi cập nhật code
docker compose --env-file .env.production up -d --build app
```

---

## 4. Cập nhật code lên server

```bash
# Pull code mới
git pull

# Rebuild app image và restart (DB data không bị xóa)
docker compose --env-file .env.production up -d --build app
```

Nếu có migration mới:

```bash
# Build lại cả migrator và app
docker compose --env-file .env.production up -d --build migrate app
```

---

## 5. Cài Nginx làm reverse proxy (khuyến nghị)

Cài Nginx trên server, tạo `/etc/nginx/sites-available/photo_journey`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP → HTTPS (sau khi có SSL)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Upload size cho ảnh
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/photo_journey /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### Cài SSL miễn phí (Let's Encrypt)

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

---

## 6. Backup database

```bash
# Tạo backup
docker compose exec db pg_dump -U journey photo_journey > backup_$(date +%Y%m%d).sql

# Restore từ backup
cat backup_20260520.sql | docker compose exec -T db psql -U journey photo_journey
```

---

## 7. Biến môi trường — bảng tổng hợp

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | ✅ | Secret ký access token (≥ 32 ký tự) |
| `JWT_REFRESH_SECRET` | ✅ | Secret ký refresh token (≥ 32 ký tự) |
| `NEXT_PUBLIC_APP_URL` | dev only | URL của app (dùng trong dev) |
| `POSTGRES_PASSWORD` | production | Mật khẩu PostgreSQL (docker-compose dùng) |
| `APP_PORT` | production | Port expose (mặc định: 3000) |

---

## 8. Troubleshooting

**`migrate` service exit với lỗi "connection refused"**
→ DB chưa healthy kịp. Chạy lại: `docker compose up -d migrate`

**`JWT_ACCESS_SECRET is required` khi build**
→ Thiếu biến trong `.env.production`. Kiểm tra file và thêm đúng tên.

**Upload ảnh không lưu được sau restart**
→ Volume `uploads_data` bị xóa khi `docker compose down -v`. Dùng `down` (không có `-v`) để giữ data.

**Port 3000 đã bị dùng**
→ Đổi `APP_PORT=3001` trong `.env.production`.
