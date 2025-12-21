import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function analyzeWithOpenRouter2(prompt) {
  try {
    console.log('🤖 OpenRouter (Hermes) analyzing...');

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'nousresearch/hermes-3-llama-3.1-405b:free', // Free powerful model
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
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'LLM Error Analysis Platform'
        }
      }
    );

    const text = response.data.choices[0].message.content;
    console.log('✅ OpenRouter (Hermes) analysis completed');
    return text;
  } catch (error) {
    console.error('❌ OpenRouter (Hermes) error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return `Error: ${error.message}`;
  }
}
