import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

console.log('🔍 Testing AI endpoint functionality...');
console.log('OpenAI API Key loaded:', !!process.env.OPENAI_API_KEY);

if (!process.env.OPENAI_API_KEY) {
  console.log('❌ No OpenAI API key found');
  process.exit(1);
}

try {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  console.log('✅ OpenAI client created successfully');
  
  // Test the same prompt that the AI endpoint would use
  console.log('🧪 Testing AI calendar assistant prompt...');
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an AI calendar assistant. Parse the user's natural language input and extract event details. Return a JSON object with the following structure:
        {
          "title": "Event title",
          "description": "Event description",
          "startTime": "YYYY-MM-DD HH:MM",
          "endTime": "YYYY-MM-DD HH:MM", 
          "duration": "duration in minutes",
          "location": "location if mentioned",
          "attendees": ["email1", "email2"],
          "type": "meeting|focus|break|personal",
          "priority": "high|medium|low",
          "confidence": 0.95
        }`
      },
      {
        role: "user",
        content: "Meeting with team tomorrow at 2pm for 1 hour"
      }
    ],
    temperature: 0.3,
    max_tokens: 500
  });

  console.log('✅ AI calendar assistant test successful!');
  console.log('🤖 Response:', completion.choices[0].message.content);
  
  // Try to parse the response as JSON
  try {
    const eventData = JSON.parse(completion.choices[0].message.content);
    console.log('✅ JSON parsing successful');
    console.log('📅 Event title:', eventData.title);
    console.log('⏰ Start time:', eventData.startTime);
    console.log('🎯 Type:', eventData.type);
  } catch (parseError) {
    console.log('⚠️  JSON parsing failed:', parseError.message);
  }
  
} catch (error) {
  console.log('❌ AI test failed:');
  console.log('Error:', error.message);
  if (error.status) {
    console.log('Status:', error.status);
  }
  process.exit(1);
}
