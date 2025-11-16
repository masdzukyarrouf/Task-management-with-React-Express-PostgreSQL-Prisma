// jwt-setup-complete.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');

console.log('=== 🔐 COMPLETE JWT SETUP ===\n');

// 1. ENVIRONMENT SETUP
console.log('1. 📋 ENVIRONMENT SETUP:');
let secret;

// Check if .env file exists and has JWT_SECRET
try {
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    const jwtSecretMatch = envContent.match(/JWT_SECRET=(.+)/);
    
    if (jwtSecretMatch && jwtSecretMatch[1]) {
      secret = jwtSecretMatch[1];
      console.log('✅ Using existing JWT_SECRET from .env file');
      console.log('   Secret preview:', secret.substring(0, 20) + '...');
    } else {
      // Generate new secret
      secret = crypto.randomBytes(64).toString('hex');
      console.log('🔑 Generated new JWT_SECRET');
      
      // Append to .env file
      fs.appendFileSync('.env', `\nJWT_SECRET=${secret}\n`);
      console.log('✅ Added JWT_SECRET to .env file');
    }
  } else {
    // Create new .env file with secret
    secret = crypto.randomBytes(64).toString('hex');
    fs.writeFileSync('.env', `JWT_SECRET=${secret}\n`);
    console.log('✅ Created .env file with JWT_SECRET');
  }
} catch (error) {
  console.log('⚠️  Using fallback secret (check .env file manually)');
  secret = 'fallback-secret-change-in-production-' + crypto.randomBytes(32).toString('hex');
}

console.log('   Secret length:', secret.length);
console.log('   Full secret:', secret);

// 2. TOKEN GENERATION
console.log('\n2. 🔑 TOKEN GENERATION:');
const payload = {
  userId: 123,
  username: 'testuser',
  email: 'test@example.com',
  iat: Math.floor(Date.now() / 1000)
};

console.log('   Payload:', payload);

const token = jwt.sign(payload, secret, { expiresIn: '7d' });

console.log('   Token length:', token.length);
console.log('   Token parts:', token.split('.').length);

// 3. VERIFICATION TEST
console.log('\n3. ✅ VERIFICATION TEST:');
try {
  const verified = jwt.verify(token, secret);
  console.log('   ✅ Token verified successfully!');
  console.log('   Decoded payload:', verified);
} catch (error) {
  console.log('   ❌ Verification failed:', error.message);
}

// 4. FINAL OUTPUT - READY TO USE
console.log('\n4. 🚀 READY TO USE:');
console.log('   📁 .env file contains:');
console.log('      JWT_SECRET=' + secret);

console.log('\n   📋 Authorization Header:');
console.log('      Authorization: Bearer ' + token);

console.log('\n   📝 Full cURL command:');
console.log(`      curl -X POST http://localhost:3000/your-route \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{"test": "data"}'`);

console.log('\n   💡 Quick test:');
console.log(`      node -e "
const jwt = require('jsonwebtoken');
const token = '${token}';
const secret = '${secret}';
try {
  const payload = jwt.verify(token, secret);
  console.log('✅ Token is valid! User ID:', payload.userId);
} catch(e) {
  console.log('❌ Token invalid:', e.message);
}"`);

console.log('\n=== 🎯 SETUP COMPLETE ===');
console.log('Your environment is configured and ready!');
console.log('Use the Authorization header above in your API requests.');