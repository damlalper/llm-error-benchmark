import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function analyzeWithOpenRouter(prompt) {
  try {
    console.log('🤖 OpenRouter analyzing...');

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'meta-llama/llama-3.2-3b-instruct:free', // Free Llama model (working)
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000', // Optional
          'X-Title': 'LLM Error Analysis Platform' // Optional
        }
      }
    );

    const text = response.data.choices[0].message.content;
    console.log('✅ OpenRouter analysis completed');
    return text;
  } catch (error) {
    console.error('❌ OpenRouter error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return `Error: ${error.message}`;
  }
}
