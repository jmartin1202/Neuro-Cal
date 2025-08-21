import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

console.log('🔍 Testing OpenAI API connection...');
console.log('API Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 'Not found');
console.log('API Key starts with:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'Not found');

if (!process.env.OPENAI_API_KEY) {
  console.log('❌ OPENAI_API_KEY not found in environment variables');
  process.exit(1);
}

try {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.log('✅ OpenAI client created successfully');
  
  // Test a simple API call
  console.log('🧪 Testing API call...');
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: "Say 'Hello, OpenAI is working!' and nothing else."
      }
    ],
    max_tokens: 10
  });

  console.log('✅ API call successful!');
  console.log('🤖 Response:', completion.choices[0].message.content);
  
} catch (error) {
  console.log('❌ OpenAI API test failed:');
  console.log('Error:', error.message);
  if (error.status) {
    console.log('Status:', error.status);
  }
  process.exit(1);
}
