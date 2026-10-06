# Production Deployment & Operations Guide
## Cryo Scientific Systems Pvt. Ltd. — ERP Backend

---

### 1. Recommended Production Infrastructure
- **Operating System**: Ubuntu Server 22.04 LTS / 24.04 LTS
- **Runtime**: Node.js v20.x LTS
- **Process Manager**: PM2 (Cluster Mode)
- **Web Server / Reverse Proxy**: Nginx with HTTP/2 and TLS 1.3
- **Database**: MongoDB v6.0+ (Replica Set with 3 nodes for automated failover)
- **Monitoring**: Winston structured file logs + PM2 logrotate + Prometheus/Grafana metrics

---

### 2. Environment Variables Checklist (`.env`)

| Variable | Recommended Production Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enforces production optimizations & hides stack traces |
| `PORT` | `5000` | Local port bound by Express cluster |
| `MONGO_URI` | `mongodb://user:pass@mongo1:27017,mongo2:27017,mongo3:27017/cryo_erp_db?replicaSet=rs0&authSource=admin` | Replica Set connection string |
| `JWT_SECRET` | `(64-character cryptographically secure random string)` | Secret key for access token signing |
| `JWT_REFRESH_SECRET` | `(64-character cryptographically secure random string)` | Secret key for refresh token signing |
| `JWT_EXPIRES_IN` | `15m` | Short-lived access token validity |
| `JWT_REFRESH_EXPIRES_IN`| `7d` | Refresh token duration |
| `CORS_ORIGIN` | `https://erp.cryoscientific.com` | Strict white-listed frontend domain |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 minutes) | DDoS protection window |
| `RATE_LIMIT_MAX` | `1000` | Max requests per IP in window |
| `LOG_LEVEL` | `info` | Production logging level (`info` / `warn` / `error`) |

---

### 3. Process Management with PM2

#### 3.1 PM2 Installation
```bash
npm install -g pm2
pm2 install pm2-logrotate
```

#### 3.2 Starting Cluster via `ecosystem.config.js`
```bash
# Start all worker instances matching CPU cores
pm2 start ecosystem.config.js --env production

# Check status
pm2 status

# Monitor CPU/RAM consumption
pm2 monit

# Save process list for server reboots
pm2 save
pm2 startup
```

---

### 4. Nginx Reverse Proxy Setup
Copy `nginx.conf.example` to `/etc/nginx/sites-available/cryo-erp.conf`:

```nginx
server {
    listen 80;
    server_name api.cryoscientific.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.cryoscientific.com;

    ssl_certificate /etc/letsencrypt/live/api.cryoscientific.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.cryoscientific.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }
}
```

Enable site and reload:
```bash
sudo ln -s /etc/nginx/sites-available/cryo-erp.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 5. Health Checks & Synthetic Monitoring
The backend exposes dedicated health endpoints:
- `GET /api/v1/health`: Quick liveness check (200 OK, returns server uptime and timestamp).
- `GET /api/v1/health/db`: Deep readiness check (verifies active MongoDB connection state).
- `GET /api/v1/system/version`: Returns API semantic version and commit hash.

Set up automated synthetic monitoring (e.g., Uptime Kuma, AWS Route 53 Health Checks, Datadog) pointing to `https://api.cryoscientific.com/api/v1/health/db` on a 30-second interval.

---

### 6. Automated Database Backup Strategy
Set up a daily cron job for automated MongoDB dumps with rotation:

```bash
#!/bin/bash
# /opt/scripts/backup-cryo-db.sh
DATE=$(date +%Y-%m-%d_%H%M%S)
BACKUP_DIR="/var/backups/cryo-mongodb"
mkdir -p "$BACKUP_DIR"

mongodump --uri="mongodb://localhost:27017/cryo_erp_db" --gzip --archive="$BACKUP_DIR/cryo_erp_$DATE.gz"

# Retain backups for 30 days
find "$BACKUP_DIR" -type f -name "*.gz" -mtime +30 -exec rm {} +
```
Schedule via crontab:
```bash
0 2 * * * /opt/scripts/backup-cryo-db.sh > /var/log/mongodb-backup.log 2>&1
```
