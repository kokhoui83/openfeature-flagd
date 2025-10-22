# Flagd Configuration

This directory contains the configuration and setup for the [flagd](https://flagd.dev/) feature flag daemon, which provides a lightweight, cloud-native feature flag evaluation service.

## What is flagd?

Flagd is an OpenFeature-compliant feature flag daemon that allows you to:
- Manage feature flags through JSON configuration files
- Evaluate flags in real-time
- Support multiple data sources and flag formats
- Integrate with OpenFeature SDKs across different programming languages

## Quick Start
### Prepare flag definition
Copy definition from examples folder
```
cp examples/demo.flagd.json flags/demo.flagd.json
```
### Start flagd with Docker Compose

```bash
docker-compose up -d
```

This will start the flagd service using the configuration in `config/flagd.yml`.

### Test the Service

Once running, you can test the flagd services:

```bash
# Health check (when ports are exposed)
curl http://localhost:8014/healthz

# Check if main service is accepting connections
telnet localhost 8013

# OFREP HTTP API (when port is exposed)
curl http://localhost:8016/ofrep/v1/evaluate/flags/new-welcome-message

# View service logs
docker logs openfeature-flagd-flagd-1
```

## Directory Structure

```
flagd/
├── docker-compose.yml      # Docker setup for flagd service
├── config/                 # Configuration files
│   └── flagd.yml          # Main flagd configuration
├── flags/                  # Active flag configurations
│   └── demo.flagd.json    # Main flag definitions used by flagd
└── examples/              # Example flag configurations
    ├── demo.flagd.json    # Sample flag setup
    └── example_flags.flagd.json
```

## Flag Configuration

Flags are defined in JSON format following the [flagd schema](https://flagd.dev/schema/v0/flags.json). Each flag can have:

- **state**: `ENABLED` or `DISABLED`
- **defaultVariant**: The default variant to return
- **variants**: Available values for the flag
- **targeting**: Rules for conditional flag evaluation (optional)

### Example Flag

```json
{
  "$schema": "https://flagd.dev/schema/v0/flags.json",
  "flags": {
    "new-welcome-message": {
      "state": "ENABLED",
      "defaultVariant": "true",
      "variants": {
        "true": true,
        "false": false
      }
    }
  }
}
```

## Integration

This flagd instance is designed to work with:
- **Client Application**: Consumes flags for UI features (port 5173)
- **Flag Manager**: Provides a management interface for flags (port 8081)
- **Manager Backend**: API for flag management operations (port 3000)

## Configuration

The flagd service is configured via `config/flagd.yml` with:

### Service Ports
- **8013**: Main gRPC flag evaluation service
- **8014**: Metrics and health endpoints
- **8016**: OFREP (OpenFeature Remote Evaluation Protocol) HTTP API

### Flag Sources
- **File source**: Watches `/flags/demo.flagd.json` for local flag definitions
- **HTTP source**: Polls `http://manager-backend:3001/api/flags` for remote flags

### Key Features
- Real-time flag updates (5-second sync interval)
- Multiple flag source support
- CORS enabled for web applications
- Structured JSON logging
- Health check endpoints on port 8014

## Useful Commands

```bash
# Start flagd
docker-compose up -d

# View logs
docker-compose logs -f flagd

# Stop flagd
docker-compose down

# Restart after flag changes
docker-compose restart flagd
```

## Resources

- [Flagd Documentation](https://flagd.dev/)
- [OpenFeature Specification](https://openfeature.dev/)
- [Flag Schema Documentation](https://flagd.dev/reference/flag-definitions/)