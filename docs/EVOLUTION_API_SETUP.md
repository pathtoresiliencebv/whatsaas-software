# Evolution API Setup Guide

**Status**: Required for WhatsApp to work. Without this, the app cannot send/receive WhatsApp messages.

---

## Option 1: Self-Hosted (Recommended for production)

### Requirements
- VPS with Ubuntu 22.04+ (2GB RAM minimum)
- Domain/subdomain pointed to your VPS
- Docker + Docker Compose installed

### Quick Start

```bash
# SSH into your VPS
ssh root@your-server.com

# Install Docker if not present
curl -fsSL https://get.docker.com | sh

# Create Evolution API directory
mkdir -p /opt/evolution-api && cd /opt/evolution-api

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
services:
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution-api
    restart: always
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=https://evolution.yourdomain.com
      - AUTHENTICATION_API_KEY=your-secure-random-key-here
      - WEBHOOK_GLOBAL_ENABLED=true
      - WEBHOOK_GLOBAL_URL=https://your-whatsaas-domain.com/api/webhook/evolution
      - DEL_INSTANCE=false
      - DATABASE_PROVIDER=sqlite
    volumes:
      - evolution_data:/evolution/instances

volumes:
  evolution_data:
EOF

# Start the container
docker-compose up -d
```

### Production: Use PostgreSQL

```yaml
services:
  evolution-api:
    image: atendai/evolution-api:latest
    depends_on:
      - postgres
    environment:
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://user:pass@postgres:5432/evolution
  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=evolution
```

### Nginx Reverse Proxy (SSL)

```nginx
server {
    listen 443 ssl;
    server_name evolution.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/evolution.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/evolution.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Option 2: Hosted Service (Quickest)

- **Evolution API Cloud** — https://evolution-api.com
- **Botify** — https://botify.com

Set in `.env`:
```
EVOLUTION_API_URL=https://api.provider.com
AUTHENTICATION_API_KEY=your-key
```

---

## WhatSaaS Configuration

1. **Admin → Channels → Evolution API**
2. Enable and enter:
   - **API URL**: `https://evolution.yourdomain.com`
   - **API Key**: Your key
   - **Webhook URL**: `https://your-whatsaas-domain.com/api/webhook/evolution`
   - **Webhook Token**: Secret for webhook verification

---

## WhatsApp Connection

1. Create instance in WhatSaaS dashboard
2. Scan QR code with WhatsApp app
3. Wait for "connected" status
4. Start sending messages

---

## Troubleshooting

### Instance stuck on "connecting"
- WhatsApp allows max 1 extra device — log out of WhatsApp Web first

### Messages not sending
```bash
# Check logs
docker logs evolution-api

# Test webhook reachability
curl -X POST https://your-whatsaas-domain.com/api/webhook/evolution -d '{"test":true}'
```
