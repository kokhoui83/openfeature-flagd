# Feature Flag using OpenFeature and flagd

This repository contains a complete feature flag management system with OpenFeature and flagd integration.

## 🏗️ Architecture

```plantuml
title Feature Flag Management System

actor User
actor Admin

rectangle "Manager Frontend" {
  [Vue.js App] as Manager
}

rectangle "Manager Backend" {
  [Express API] as ManagerAPI
}

rectangle "Client App" {
  [Vue.js Demo] as Client
}

rectangle "Server Backend" {
  [Node.js API] as Server
}

rectangle "Feature Flag Service" {
  [flagd] as Flagd
}

database "Flag Storage" {
  [JSON Files] as Storage
}

Admin --> Manager: Manage flags
Manager --> ManagerAPI: CRUD operations
ManagerAPI --> Storage: Read/Write flags

User --> Client: Use application
Client --> Server: API requests
Server --> Flagd: Check flags
Flagd --> Storage: Read flag config

```

## 🚀 Components

### 🎛️ **Flag Manager** (`/manager` + `/manager-backend`)
- **Frontend**: Vue.js application for managing feature flags
- **Backend**: Express.js API server for CRUD operations on flag files
- **Purpose**: Admin interface for creating, editing, and managing feature flags

### 🧪 **Demo Client** (`/client`)
- Vue.js demo application that consumes feature flags
- Shows how flags affect application behavior in real-time

### ⚙️ **API Server** (`/server`) 
- Node.js backend that integrates with flagd for flag evaluation
- Demonstrates server-side flag checking

### 🏁 **Flagd Service** (`/flagd`)
- OpenFeature flagd server for flag evaluation
- Reads flag configurations from JSON files

## 🏃‍♂️ Quick Start

### Option 1: Development Mode

1. **Start Manager Backend:**
```bash
cd manager-backend
npm install
npm run dev
```

2. **Start Manager Frontend:**
```bash
cd manager
npm install
npm run dev
```

3. **Start Flagd:**
```bash
cd flagd
docker-compose up -d
```

### Option 2: Docker Compose

**All services:**
```bash
docker compose up -d
```

**Manager only:**
```bash
docker compose -f docker-compose.manager.yml up -d
```

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Flag Manager** | http://localhost:8081 (Docker) / http://localhost:5173 (Dev) | Admin interface for managing flags |
| **Manager API** | http://localhost:3001 | Backend API for flag management |
| **Demo Client** | http://localhost:8080 | Demo app showing flag usage |
| **API Server** | http://localhost:3000 | Server-side flag integration |
| **Flagd** | http://localhost:8013 | Flag evaluation service |

## 📁 Project Structure

```
openfeature-flagd/
├── manager/              # Flag management frontend (Vue.js)
├── manager-backend/      # Flag management API (Express.js)
├── client/              # Demo client application (Vue.js)
├── server/              # Demo server backend (Node.js)
├── flagd/               # Flagd service configuration
│   └── flags/           # Flag definition files (JSON)
├── docker-compose.yml           # All services
├── docker-compose.manager.yml   # Manager services only
└── README.md
```

## 🎯 Usage

### Managing Flags

1. Open the Flag Manager at http://localhost:5173
2. Create, edit, or delete feature flags through the web interface
3. Changes are automatically saved to JSON files
4. Export/import flag configurations as needed

### Using Flags in Applications

**Client-side (Vue.js):**
```javascript
import { OpenFeature } from '@openfeature/web-sdk';
// Initialize and use flags in your app
```

**Server-side (Node.js):**
```javascript
import { OpenFeature } from '@openfeature/server-sdk';
// Evaluate flags on the server
```

## 📚 Documentation

- **Manager Frontend**: [manager/README.md](./manager/README.md)
- **Manager Backend**: [manager-backend/README.md](./manager-backend/README.md)
- **Demo Client**: [client/README.md](./client/README.md) 
- **API Server**: [server/README.md](./server/README.md)
- **Flagd Service**: [flagd/README.md](./flagd/README.md)

## 🔧 Development

Each component can be developed independently:

```bash
# Manager system
cd manager-backend && npm run dev
cd manager && npm run dev

# Demo system  
cd server && npm run dev
cd client && npm run dev

# Flagd
cd flagd && docker-compose up -d
```

## 🐳 Docker Support

All services include Dockerfiles and can be orchestrated with Docker Compose for easy deployment.
