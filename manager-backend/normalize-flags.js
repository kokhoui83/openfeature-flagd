#!/usr/bin/env node

// Simple script to normalize the flag structure
import { promises as fs } from 'fs';
import path from 'path';

const flagsFile = './data/flags.json';

// Normalization function
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
    
    // Add any other properties (description, targeting, etc.) in alphabetical order
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

async function normalizeFlags() {
  try {
    console.log('Reading flags from:', flagsFile);
    const data = await fs.readFile(flagsFile, 'utf-8');
    const flags = JSON.parse(data);
    
    console.log('Normalizing flag structure...');
    const normalizedFlags = normalizeFlagStructure(flags);
    
    // Create backup
    await fs.writeFile(`${flagsFile}.backup`, data);
    console.log('Created backup:', `${flagsFile}.backup`);
    
    // Write normalized data
    await fs.writeFile(flagsFile, JSON.stringify(normalizedFlags, null, 2));
    console.log('Successfully normalized flags file!');
    
    // Show sample
    const flagKeys = Object.keys(normalizedFlags.flags);
    console.log('\nSample normalized flag:');
    console.log(JSON.stringify(normalizedFlags.flags[flagKeys[0]], null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

normalizeFlags();