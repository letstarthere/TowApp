#!/usr/bin/env node

// Production cleanup script - removes all test data and development artifacts

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting production cleanup...');

// Files to remove
const filesToRemove = [
  'LOGIN_DETAILS.md',
  'TESTING_GUIDE.md',
  'client/src/lib/mockTypes.ts',
  'scripts/production-cleanup.js' // Remove this script itself
];

// Directories to remove
const dirsToRemove = [
  'client/src/test-data',
  'client/src/__tests__',
  'server/test-data'
];

// Remove test files
filesToRemove.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Removed: ${file}`);
  }
});

// Remove test directories
dirsToRemove.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removed directory: ${dir}`);
  }
});

// Update package.json to remove dev scripts
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Remove development scripts
  delete packageJson.scripts['dev:user'];
  delete packageJson.scripts['dev:driver'];
  
  // Update version for production
  packageJson.version = '1.0.0';
  packageJson.name = 'towapp';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json for production');
}

// Remove development environment file
const devEnvPath = path.join(__dirname, '..', '.env.development');
if (fs.existsSync(devEnvPath)) {
  fs.unlinkSync(devEnvPath);
  console.log('✅ Removed .env.development');
}

// Remove batch file for dual server testing
const batchFilePath = path.join(__dirname, '..', 'start-both-servers.bat');
if (fs.existsSync(batchFilePath)) {
  fs.unlinkSync(batchFilePath);
  console.log('✅ Removed start-both-servers.bat');
}

console.log('🎉 Production cleanup complete!');
console.log('');
console.log('⚠️  IMPORTANT: Before building APK:');
console.log('1. Update .env.production with real secrets');
console.log('2. Restrict Google Maps API key');
console.log('3. Remove test database data');
console.log('4. Configure release signing');
console.log('5. Test on physical devices');