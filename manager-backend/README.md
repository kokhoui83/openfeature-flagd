# Manager Backend

Backend API server for the Feature Flag Manager application.

## Overview

This Express.js server provides a RESTful API for managing feature flags stored in JSON files. It handles CRUD operations for feature flags and ensures data persistence in the flagd JSON schema format.

## Features

- 🏁 **Feature Flag CRUD Operations**
- 📁 **File-based persistence** (JSON format)
- ✅ **Data validation** and schema checking
- 🔄 **Automatic backup and rollback**
- 🌐 **CORS enabled** for frontend integration
- 📊 **Health checks** and monitoring endpoints
- 🛡️ **Error handling** and logging

## Installation

```bash
npm install
```

## Usage

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Flag Management CLI

Export current flags to backup:
```bash
npm run export-flags
```

Import flags from a file:
```bash
npm run import-flags path/to/flags.json
```

Reset flags to defaults:
```bash
npm run reset-flags
```

## API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/flags` | Get all feature flags |
| `POST` | `/api/flags` | Save/update all feature flags |
| `GET` | `/api/flags/:key` | Get a specific flag by key |

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check with server status |
| `GET` | `/api/info` | Server information and available endpoints |

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3001)

### File Storage

Flags are stored locally in: `./data/flags.json`

This keeps the manager-backend completely independent from other services.

## API Examples

### Get All Flags
```bash
curl http://localhost:3001/api/flags
```

### Save Flags
```bash
curl -X POST http://localhost:3001/api/flags \
  -H "Content-Type: application/json" \
  -d '{
    "$schema": "https://flagd.dev/schema/v0/flags.json",
    "flags": {
      "my-flag": {
        "state": "ENABLED",
        "variants": { "on": true, "off": false },
        "defaultVariant": "off"
      }
    }
  }'
```

### Get Specific Flag
```bash
curl http://localhost:3001/api/flags/my-flag
```

### Health Check
```bash
curl http://localhost:3001/api/health
```

## Data Format

The server expects and returns data in the flagd JSON schema format:

```json
{
  "$schema": "https://flagd.dev/schema/v0/flags.json",
  "flags": {
    "flag-key": {
      "state": "ENABLED|DISABLED",
      "variants": {
        "variant-name": "value"
      },
      "defaultVariant": "variant-name",
      "description": "Optional description"
    }
  }
}
```

## Error Handling

The server includes comprehensive error handling:

- **400 Bad Request** - Invalid data structure or validation errors
- **404 Not Found** - Flag or endpoint not found
- **500 Internal Server Error** - File system or server errors

## Validation

The server validates:
- Flag structure and required fields
- State values (must be "ENABLED" or "DISABLED")
- Variant references (defaultVariant must exist in variants)
- JSON schema compliance

## Development

### Project Structure
```
manager-backend/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── dockerfile         # Docker configuration
├── .gitignore        # Git ignore rules
├── data/             # Data storage directory
│   └── flags.json   # Feature flags configuration
└── README.md         # This file
```

### Adding New Features

1. Add new routes in `server.js`
2. Update the API documentation
3. Add validation as needed
4. Test with curl or Postman

## Integration

This backend is designed to work with the Feature Flag Manager frontend. The frontend should be configured to proxy API requests to this server.

## License

MIT