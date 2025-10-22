#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FLAGS_FILE_PATH = path.join(__dirname, 'data', 'flags.json');

async function exportFlags() {
  try {
    const data = await fs.readFile(FLAGS_FILE_PATH, 'utf-8');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportPath = path.join(__dirname, 'backups', `flags-${timestamp}.json`);
    
    // Ensure backup directory exists
    await fs.mkdir(path.dirname(exportPath), { recursive: true });
    
    await fs.writeFile(exportPath, data);
    console.log(`✅ Flags exported to: ${exportPath}`);
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

async function importFlags(filePath) {
  try {
    if (!filePath) {
      console.error('❌ Please provide a file path: npm run import-flags <path>');
      process.exit(1);
    }
    
    // Create backup before import
    await exportFlags();
    
    const data = await fs.readFile(filePath, 'utf-8');
    const flags = JSON.parse(data);
    
    // Validate structure
    if (!flags.flags || typeof flags.flags !== 'object') {
      throw new Error('Invalid flags file format');
    }
    
    await fs.writeFile(FLAGS_FILE_PATH, JSON.stringify(flags, null, 2));
    console.log(`✅ Flags imported from: ${filePath}`);
    console.log(`📊 Imported ${Object.keys(flags.flags).length} flags`);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

async function resetFlags() {
  try {
    // Create backup before reset
    await exportFlags();
    
    const defaultFlags = {
      "$schema": "https://flagd.dev/schema/v0/flags.json",
      "flags": {
        "welcome-message": {
          "state": "ENABLED",
          "variants": {
            "new": "Welcome to our new feature flag manager!",
            "classic": "Welcome to the application"
          },
          "defaultVariant": "new",
          "description": "Controls the welcome message displayed to users"
        },
        "dark-mode": {
          "state": "ENABLED",
          "variants": {
            "enabled": true,
            "disabled": false
          },
          "defaultVariant": "disabled",
          "description": "Toggles dark mode theme for the application"
        }
      }
    };
    
    await fs.writeFile(FLAGS_FILE_PATH, JSON.stringify(defaultFlags, null, 2));
    console.log('✅ Flags reset to defaults');
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    process.exit(1);
  }
}

const command = process.argv[2];
const filePath = process.argv[3];

switch (command) {
  case 'export':
    exportFlags();
    break;
  case 'import':
    importFlags(filePath);
    break;
  case 'reset':
    resetFlags();
    break;
  default:
    console.log('Usage:');
    console.log('  npm run export-flags     # Export current flags to backup');
    console.log('  npm run import-flags <path>  # Import flags from file');
    console.log('  npm run reset-flags      # Reset to default flags');
}