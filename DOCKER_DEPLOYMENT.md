# Feature Flag Manager - Docker Deployment Guide

## 🚀 Quick Start

Start the complete feature flag manager system:

```bash
docker compose -f docker-compose.manager.yml up -d
```

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:8081 | Feature flag management UI |
| **API (Direct)** | http://localhost:3001 | Direct backend API access |
| **API (Proxied)** | http://localhost:8081/api | API through frontend proxy |

## 📁 Services

### 🎛️ Manager Frontend
- **Container**: `flag-manager-frontend`
- **Image**: `openfeature-flagd-manager-frontend`
- **Port**: 8081 (mapped from internal 80)
- **Technology**: Vue.js + Nginx
- **Features**:
  - Static file serving
  - API request proxying to backend
  - Gzip compression
  - Security headers

### ⚙️ Manager Backend  
- **Container**: `flag-manager-backend`
- **Image**: `openfeature-flagd-manager-backend`
- **Port**: 3001
- **Technology**: Node.js + Express
- **Features**:
  - RESTful API for flag management
  - Local JSON file storage
  - Health checks with curl
  - Data validation and backup

## 🔧 Management Commands

### Container Management
```bash
# Start services
docker compose -f docker-compose.manager.yml up -d

# Stop services
docker compose -f docker-compose.manager.yml down

# View logs
docker compose -f docker-compose.manager.yml logs -f

# Restart services
docker compose -f docker-compose.manager.yml restart
```

### Individual Service Management
```bash
# Backend only
docker compose -f docker-compose.manager.yml up -d manager-backend

# Frontend only  
docker compose -f docker-compose.manager.yml up -d manager-frontend

# Check status
docker compose -f docker-compose.manager.yml ps
```

## 📊 Monitoring

### Health Checks
```bash
# Backend health (direct)
curl http://localhost:3001/api/health

# Backend health (through proxy)
curl http://localhost:8081/api/health

# Get API info
curl http://localhost:3001/api/info
```

### Container Status
```bash
# View running containers
docker ps

# Check container health
docker inspect flag-manager-backend --format='{{.State.Health.Status}}'
```

## 💾 Data Persistence

### Volume Mounts
- **Backend Data**: `./manager-backend/data:/app/data`
- **Flags File**: `manager-backend/data/flags.json`

### Backup Data
```bash
# Access backend container
docker exec -it flag-manager-backend sh

# Export flags (inside container)
npm run export-flags

# Copy backup out of container
docker cp flag-manager-backend:/app/backups ./local-backups
```

## 🛠️ Development vs Production

### Development Mode (Host)
```bash
# Backend
cd manager-backend && npm run dev

# Frontend
cd manager && npm run dev
```

### Production Mode (Docker)
```bash
# Full stack
docker compose -f docker-compose.manager.yml up -d
```

## 🔍 Troubleshooting

### Backend Issues
```bash
# Check backend logs
docker logs flag-manager-backend

# Check if port is accessible
curl http://localhost:3001/api/health

# Access backend container
docker exec -it flag-manager-backend sh
```

### Frontend Issues
```bash
# Check frontend logs
docker logs flag-manager-frontend

# Check nginx config
docker exec -it flag-manager-frontend cat /etc/nginx/conf.d/default.conf

# Test frontend directly
curl -I http://localhost:8081
```

### Network Issues
```bash
# Check network
docker network ls | grep flag-manager

# Inspect network
docker network inspect openfeature-flagd_flag-manager

# Test inter-container communication
docker exec -it flag-manager-frontend curl http://manager-backend:3001/api/health
```

## ⚡ Performance Tips

1. **Nginx Caching**: Already configured for static assets
2. **Gzip Compression**: Enabled for text-based content
3. **Health Check Intervals**: Optimized for quick detection
4. **Multi-stage Builds**: Minimized image sizes

## 🔒 Security Features

- Non-root user execution
- Security headers (X-Frame-Options, X-XSS-Protection)
- Network isolation
- No exposed secrets
- Input validation on backend

## 🎯 API Endpoints

All endpoints accessible via both:
- Direct: `http://localhost:3001/api/*`
- Proxied: `http://localhost:8081/api/*`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Service health check |
| GET | `/api/info` | API information |
| GET | `/api/flags` | Get all flags |
| POST | `/api/flags` | Save flags |
| GET | `/api/flags/:key` | Get specific flag |

## 📈 Scaling

The current setup supports:
- **Horizontal scaling**: Backend can be replicated
- **Load balancing**: Add load balancer in front of multiple backends
- **High availability**: Add health check restart policies

---

**✅ Status**: Both services running and fully functional!  
**🌐 Frontend**: http://localhost:8081  
**🔧 Backend**: http://localhost:3001  