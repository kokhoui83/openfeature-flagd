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

This will start the flagd service on port `8013` using the flag definitions in `flags/demo.flagd.json`.

## Directory Structure

```
flagd/
├── docker-compose.yml      # Docker setup for flagd service
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

The flagd service is configured to:
- Watch for changes in `/flags/demo.flagd.json`
- Serve on port `8013`
- Provide both gRPC and HTTP endpoints
- Support real-time flag updates

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