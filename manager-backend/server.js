import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Path to the flags file - local to the backend project
const FLAGS_FILE_PATH = path.join(__dirname, 'data', 'flags.json');

// Ensure the flags directory exists
async function ensureFlagsDirectory() {
  const dir = path.dirname(FLAGS_FILE_PATH);
  try {
    await fs.access(dir);
    console.log(`Flags directory exists: ${dir}`);
  } catch {
    await fs.mkdir(dir, { recursive: true });
    console.log(`Created flags directory: ${dir}`);
  }
}

// Initialize with demo data if file doesn't exist
async function initializeFlagsFile() {
  try {
    await fs.access(FLAGS_FILE_PATH);
    console.log(`Flags file exists: ${FLAGS_FILE_PATH}`);
  } catch {
    const demoData = {
      "$schema": "https://flagd.dev/schema/v0/flags.json",
      "flags": {
        "show-welcome-banner": {
          "state": "ENABLED",
          "defaultVariant": "off",
          "variants": {
            "on": true,
            "off": false
          },
          "description": "Controls whether to show the welcome banner"
        },
        "background-color": {
          "state": "ENABLED",
          "defaultVariant": "red",
          "variants": {
            "red": "#FF0000",
            "blue": "#0000FF",
            "green": "#00FF00",
            "yellow": "#FFFF00"
          },
          "description": "Sets the background color theme"
        },
        "feature-x-enabled": {
          "state": "DISABLED",
          "defaultVariant": "disabled",
          "variants": {
            "enabled": true,
            "disabled": false
          },
          "description": "Enables the new feature X functionality"
        }
      }
    };
    
    await fs.writeFile(FLAGS_FILE_PATH, JSON.stringify(demoData, null, 2));
    console.log(`Initialized flags file with demo data: ${FLAGS_FILE_PATH}`);
  }
}

// Flag structure normalization helper
function normalizeFlagStructure(flagData) {
  const normalized = {
    "$schema": flagData["$schema"] || "https://flagd.dev/schema/v0/flags.json",
    "flags": {}
  };

  for (const [key, flag] of Object.entries(flagData.flags || {})) {
    // Create a new object with properties in the correct order
    const normalizedFlag = {};
    
    // Add properties in the specific order: state, defaultVariant, variants, then others
    if (flag.state !== undefined) {
      normalizedFlag.state = flag.state;
    }
    
    if (flag.defaultVariant !== undefined) {
      normalizedFlag.defaultVariant = flag.defaultVariant;
    }
    
    if (flag.variants !== undefined) {
      normalizedFlag.variants = flag.variants;
    }
    
    // Add any other properties (description, targeting, etc.) in alphabetical order for consistency
    const otherProps = Object.keys(flag)
      .filter(key => !['state', 'defaultVariant', 'variants'].includes(key))
      .sort();
      
    for (const propKey of otherProps) {
      normalizedFlag[propKey] = flag[propKey];
    }
    
    normalized.flags[key] = normalizedFlag;
  }
  
  return normalized;
}

// Validation helper
function validateFlagConfig(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid data structure' };
  }
  
  if (!data.flags || typeof data.flags !== 'object') {
    return { valid: false, error: 'Missing or invalid flags object' };
  }

  // Validate each flag
  for (const [key, flag] of Object.entries(data.flags)) {
    if (!flag || typeof flag !== 'object') {
      return { valid: false, error: `Invalid flag structure for "${key}"` };
    }
    
    if (!flag.state || !['ENABLED', 'DISABLED'].includes(flag.state)) {
      return { valid: false, error: `Invalid state for flag "${key}". Must be ENABLED or DISABLED` };
    }
    
    if (!flag.variants || typeof flag.variants !== 'object') {
      return { valid: false, error: `Missing or invalid variants for flag "${key}"` };
    }
    
    if (!flag.defaultVariant || typeof flag.defaultVariant !== 'string') {
      return { valid: false, error: `Missing or invalid defaultVariant for flag "${key}"` };
    }
    
    if (!(flag.defaultVariant in flag.variants)) {
      return { valid: false, error: `Default variant "${flag.defaultVariant}" not found in variants for flag "${key}"` };
    }
  }
  
  return { valid: true };
}

// Error handling middleware
function handleAsyncErrors(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// GET /api/flags - Read flags from file
app.get('/api/flags', handleAsyncErrors(async (req, res) => {
  try {
    const data = await fs.readFile(FLAGS_FILE_PATH, 'utf-8');
    const flags = JSON.parse(data);
    
    // Normalize the structure to ensure proper property ordering
    const normalizedFlags = normalizeFlagStructure(flags);
    
    console.log(`Successfully read ${Object.keys(normalizedFlags.flags || {}).length} flags from file`);
    res.json(normalizedFlags);
  } catch (error) {
    console.error('Error reading flags file:', error);
    
    if (error.code === 'ENOENT') {
      res.status(404).json({ 
        error: 'Flags file not found',
        message: 'The flags file does not exist. Please initialize it first.' 
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to read flags file',
        message: error.message 
      });
    }
  }
}));

// POST /api/flags - Write flags to file
app.post('/api/flags', handleAsyncErrors(async (req, res) => {
  try {
    const flagsData = req.body;
    
    // Validate the data structure
    const validation = validateFlagConfig(flagsData);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: validation.error 
      });
    }
    
    // Normalize the structure to ensure proper property ordering
    const normalizedFlagsData = normalizeFlagStructure(flagsData);
    
    // Create backup of existing file
    let backupData = null;
    try {
      const existingData = await fs.readFile(FLAGS_FILE_PATH, 'utf-8');
      backupData = existingData;
    } catch (error) {
      // File doesn't exist, no backup needed
      console.log('No existing file to backup');
    }
    
    // Write normalized data
    await fs.writeFile(FLAGS_FILE_PATH, JSON.stringify(normalizedFlagsData, null, 2));
    
    const flagCount = Object.keys(normalizedFlagsData.flags || {}).length;
    console.log(`Successfully saved ${flagCount} flags to file with normalized structure`);
    
    res.json({ 
      success: true, 
      message: `Flags saved successfully. ${flagCount} flags written with proper structure.`,
      flagCount 
    });
  } catch (error) {
    console.error('Error writing flags file:', error);
    res.status(500).json({ 
      error: 'Failed to write flags file',
      message: error.message 
    });
  }
}));

// GET /api/flags/:key - Get a specific flag
app.get('/api/flags/:key', handleAsyncErrors(async (req, res) => {
  try {
    const data = await fs.readFile(FLAGS_FILE_PATH, 'utf-8');
    const flags = JSON.parse(data);
    const flagKey = req.params.key;
    
    if (flags.flags && flags.flags[flagKey]) {
      res.json({
        key: flagKey,
        ...flags.flags[flagKey]
      });
    } else {
      res.status(404).json({
        error: 'Flag not found',
        message: `Flag "${flagKey}" does not exist`
      });
    }
  } catch (error) {
    console.error('Error reading flag:', error);
    res.status(500).json({ 
      error: 'Failed to read flag',
      message: error.message 
    });
  }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'manager-backend',
    version: '1.0.0',
    flagsFile: FLAGS_FILE_PATH
  });
});

// GET /api/info - Get server info
app.get('/api/info', (req, res) => {
  res.json({
    service: 'Feature Flag Manager Backend',
    version: '1.0.0',
    description: 'Backend API server for managing feature flags',
    endpoints: {
      'GET /api/health': 'Health check',
      'GET /api/info': 'Server information',
      'GET /api/flags': 'Get all flags',
      'POST /api/flags': 'Save all flags',
      'GET /api/flags/:key': 'Get specific flag'
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} not found`
  });
});

// Start server
async function startServer() {
  try {
    await ensureFlagsDirectory();
    await initializeFlagsFile();
    
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log('🚀 Feature Flag Manager Backend');
      console.log('='.repeat(50));
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🏁 Flags file: ${FLAGS_FILE_PATH}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📋 API info: http://localhost:${PORT}/api/info`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

startServer();