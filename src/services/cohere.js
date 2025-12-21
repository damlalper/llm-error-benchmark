import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const COHERE_API_URL = 'https://api.cohere.ai/v1/chat';

export async function analyzeWithCohere(prompt) {
  try {
    console.log('🤖 Cohere analyzing...');

    const response = await axios.post(
      COHERE_API_URL,
      {
        model: 'command-nightly', // Free tier model (working)
        message: prompt,
        temperature: 0.7,
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const text = response.data.text;
    console.log('✅ Cohere analysis completed');
    return text;
  } catch (error) {
    console.error('❌ Cohere error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return `Error: ${error.message}`;
  }
}
