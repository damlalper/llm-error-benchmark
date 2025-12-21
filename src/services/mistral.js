import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

export async function analyzeWithMistral(prompt) {
  try {
    console.log('🤖 Mistral analyzing...');

    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: 'mistral-small-latest', // or 'mistral-medium-latest'
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
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const text = response.data.choices[0].message.content;
    console.log('✅ Mistral analysis completed');
    return text;
  } catch (error) {
    console.error('❌ Mistral error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return `Error: ${error.message}`;
  }
}
