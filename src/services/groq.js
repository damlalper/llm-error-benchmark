import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function analyzeWithGroq(prompt) {
  try {
    console.log('🤖 Groq analyzing...');

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile', // Groq's fast LLaMA model
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
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const text = response.data.choices[0].message.content;
    console.log('✅ Groq analysis completed');
    return text;
  } catch (error) {
    console.error('❌ Groq error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return `Error: ${error.message}`;
  }
}
