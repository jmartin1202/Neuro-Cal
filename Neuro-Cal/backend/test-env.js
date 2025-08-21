import dotenv from 'dotenv';

console.log('🔍 Testing environment variable loading...');
console.log('Current directory:', process.cwd());

// Try different paths
const paths = [
  '.env',
  '../.env',
  '/Users/joelmartin/Documents/Neuro-Cal/Neuro-Cal/.env'
];

for (const path of paths) {
  console.log(`\n📁 Trying path: ${path}`);
  const result = dotenv.config({ path });
  console.log('Result:', result);
  
  if (result.parsed) {
    console.log('✅ Environment loaded from:', path);
    console.log('Sample vars:', Object.keys(result.parsed).slice(0, 5));
    break;
  } else {
    console.log('❌ Failed to load from:', path);
  }
}

console.log('\n🔑 Checking specific variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 'Not found');
