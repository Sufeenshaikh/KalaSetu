/**
 * MVP System Check Script
 * Verifies backend, Firebase, authentication, and all critical components
 */

import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const issues = [];
const warnings = [];
const success = [];

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function logError(msg) {
  issues.push(msg);
  console.log(`${colors.red}❌ ${msg}${colors.reset}`);
}

function logWarning(msg) {
  warnings.push(msg);
  console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
}

function logSuccess(msg) {
  success.push(msg);
  console.log(`${colors.green}✅ ${msg}${colors.reset}`);
}

function logInfo(msg) {
  console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`);
}

console.log('\n🔍 KalaSetu MVP System Check\n');
console.log('='.repeat(60) + '\n');

// 1. Check Environment Variables
logInfo('1. Checking Environment Variables...\n');

const backendEnvPath = join(__dirname, 'backend', '.env');
const frontendEnvPath = join(__dirname, '.env.local');

let backendEnv = {};
let frontendEnv = {};

if (existsSync(backendEnvPath)) {
  const content = readFileSync(backendEnvPath, 'utf-8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...values] = trimmed.split('=');
      backendEnv[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  logSuccess('Backend .env file exists');
} else {
  logError('Backend .env file not found');
}

if (existsSync(frontendEnvPath)) {
  const content = readFileSync(frontendEnvPath, 'utf-8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...values] = trimmed.split('=');
      frontendEnv[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  logSuccess('Frontend .env.local file exists');
} else {
  logWarning('Frontend .env.local file not found (may be using hardcoded config)');
}

// Check critical backend env vars
const requiredBackendVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY', 'GEMINI_API_KEY'];
requiredBackendVars.forEach(varName => {
  if (backendEnv[varName]) {
    if (varName === 'FIREBASE_PRIVATE_KEY') {
      const isValid = backendEnv[varName].includes('BEGIN PRIVATE KEY') && 
                      backendEnv[varName].includes('END PRIVATE KEY');
      if (isValid) {
        logSuccess(`${varName} is configured`);
      } else {
        logError(`${varName} appears to be invalid`);
      }
    } else if (backendEnv[varName] === 'PLACEHOLDER_API_KEY' || backendEnv[varName].includes('PLACEHOLDER')) {
      logError(`${varName} is still a placeholder`);
    } else {
      logSuccess(`${varName} is configured`);
    }
  } else {
    logError(`${varName} is missing in backend .env`);
  }
});

// Check GEMINI_API_KEY in frontend
if (frontendEnv.GEMINI_API_KEY) {
  if (frontendEnv.GEMINI_API_KEY.includes('PLACEHOLDER')) {
    logError('Frontend GEMINI_API_KEY is still a placeholder');
  } else {
    logSuccess('Frontend GEMINI_API_KEY is configured');
  }
} else {
  logWarning('Frontend GEMINI_API_KEY not in .env.local (may use Vite env)');
}

console.log('');

// 2. Check Backend Server Configuration
logInfo('2. Checking Backend Server Configuration...\n');

const serverPath = join(__dirname, 'backend', 'server.js');
if (existsSync(serverPath)) {
  const serverContent = readFileSync(serverPath, 'utf-8');
  
  if (serverContent.includes('admin.initializeApp')) {
    logSuccess('Firebase Admin SDK initialization code present');
  } else {
    logError('Firebase Admin SDK initialization missing');
  }
  
  if (serverContent.includes('verifyToken')) {
    logSuccess('Token verification middleware exists');
  } else {
    logError('Token verification middleware missing');
  }
  
  // Check if routes are connected
  const routePatterns = [
    /app\.use\(['"]\/api\/auth/,
    /app\.use\(['"]\/api\/artisan/,
    /app\.use\(['"]\/api\/product/,
  ];
  
  const foundRoutes = routePatterns.some(pattern => pattern.test(serverContent));
  if (foundRoutes) {
    logSuccess('API routes are connected to server');
  } else {
    logWarning('API routes may not be connected (check server.js)');
  }
} else {
  logError('Backend server.js not found');
}

console.log('');

// 3. Check Frontend Firebase Configuration
logInfo('3. Checking Frontend Firebase Configuration...\n');

const firebaseConfigPath = join(__dirname, 'services', 'firebase.ts');
if (existsSync(firebaseConfigPath)) {
  const firebaseContent = readFileSync(firebaseConfigPath, 'utf-8');
  
  if (firebaseContent.includes('initializeApp')) {
    logSuccess('Firebase frontend initialization present');
  } else {
    logError('Firebase frontend initialization missing');
  }
  
  if (firebaseContent.includes('getAuth')) {
    logSuccess('Firebase Auth is configured');
  } else {
    logError('Firebase Auth not configured');
  }
  
  if (firebaseContent.includes('getFirestore')) {
    logSuccess('Firestore is configured');
  } else {
    logError('Firestore not configured');
  }
  
  if (firebaseContent.includes('getStorage')) {
    logSuccess('Firebase Storage is configured');
  } else {
    logError('Firebase Storage not configured');
  }
} else {
  logError('Frontend Firebase config not found');
}

console.log('');

// 4. Check Authentication Implementation
logInfo('4. Checking Authentication Implementation...\n');

const authContextPath = join(__dirname, 'context', 'AuthContext.tsx');
if (existsSync(authContextPath)) {
  const authContent = readFileSync(authContextPath, 'utf-8');
  
  if (authContent.includes('Mock authentication') || authContent.includes('mock')) {
    logError('Authentication is using MOCK/PLACEHOLDER - NOT CONNECTED TO FIREBASE!');
    logWarning('AuthContext needs to be updated to use real Firebase Auth');
  } else if (authContent.includes('signInWithEmailAndPassword') || authContent.includes('createUserWithEmailAndPassword')) {
    logSuccess('Authentication uses Firebase Auth methods');
  } else {
    logWarning('Authentication implementation needs verification');
  }
} else {
  logError('AuthContext not found');
}

console.log('');

// 5. Check Data Services
logInfo('5. Checking Data Services...\n');

const firestoreServicePath = join(__dirname, 'services', 'firestoreService.ts');
if (existsSync(firestoreServicePath)) {
  const serviceContent = readFileSync(firestoreServicePath, 'utf-8');
  
  if (serviceContent.includes('getFirestore') || serviceContent.includes('collection')) {
    logSuccess('FirestoreService uses Firebase methods');
  } else if (serviceContent.includes('mock') || serviceContent.includes('dummyData')) {
    logError('FirestoreService is using MOCK data - NOT CONNECTED TO FIREBASE!');
  } else {
    logWarning('FirestoreService implementation needs verification');
  }
} else {
  logError('FirestoreService not found');
}

console.log('');

// 6. Check Backend Routes
logInfo('6. Checking Backend Routes...\n');

const routesDir = join(__dirname, 'backend', 'src', 'routes');
const requiredRoutes = ['auth.js', 'artisan.js', 'product.js'];
requiredRoutes.forEach(route => {
  const routePath = join(routesDir, route);
  if (existsSync(routePath)) {
    logSuccess(`Route ${route} exists`);
  } else {
    logError(`Route ${route} missing`);
  }
});

console.log('');

// 7. Check Backend Controllers
logInfo('7. Checking Backend Controllers...\n');

const controllersDir = join(__dirname, 'backend', 'src', 'controllers');
const requiredControllers = ['auth.controller.js', 'artisan.controller.js', 'product.controller.js'];
requiredControllers.forEach(controller => {
  const controllerPath = join(controllersDir, controller);
  if (existsSync(controllerPath)) {
    logSuccess(`Controller ${controller} exists`);
  } else {
    logError(`Controller ${controller} missing`);
  }
});

console.log('');

// 8. Summary
console.log('='.repeat(60));
console.log('\n📊 SUMMARY\n');

if (success.length > 0) {
  console.log(`${colors.green}✅ Success (${success.length}):${colors.reset}`);
  success.slice(0, 5).forEach(msg => console.log(`   ${msg}`));
  if (success.length > 5) {
    console.log(`   ... and ${success.length - 5} more`);
  }
  console.log('');
}

if (warnings.length > 0) {
  console.log(`${colors.yellow}⚠️  Warnings (${warnings.length}):${colors.reset}`);
  warnings.slice(0, 5).forEach(msg => console.log(`   ${msg}`));
  if (warnings.length > 5) {
    console.log(`   ... and ${warnings.length - 5} more`);
  }
  console.log('');
}

if (issues.length > 0) {
  console.log(`${colors.red}❌ Issues (${issues.length}):${colors.reset}`);
  issues.slice(0, 10).forEach(msg => console.log(`   ${msg}`));
  if (issues.length > 10) {
    console.log(`   ... and ${issues.length - 10} more`);
  }
  console.log('');
}

// Critical issues check
const criticalIssues = issues.filter(issue => 
  issue.includes('MOCK') || 
  issue.includes('NOT CONNECTED') ||
  issue.includes('still a placeholder') ||
  issue.includes('missing') && (issue.includes('FIREBASE') || issue.includes('API_KEY'))
);

if (criticalIssues.length > 0) {
  console.log(`${colors.red}🚨 CRITICAL ISSUES FOUND:${colors.reset}`);
  criticalIssues.forEach(issue => console.log(`   • ${issue}`));
  console.log('');
  console.log('⚠️  MVP is NOT ready for production!');
  console.log('   Please fix the critical issues above.\n');
  process.exit(1);
} else if (issues.length > 0) {
  console.log('⚠️  Some issues found, but MVP may still be functional.\n');
  process.exit(0);
} else {
  console.log(`${colors.green}✅ MVP appears to be properly configured!${colors.reset}\n`);
  process.exit(0);
}

