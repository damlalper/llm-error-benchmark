import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeWithGemini(prompt) {
  try {
    console.log('🤖 Gemini analyzing...');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Gemini analysis completed');
    return text;
  } catch (error) {
    console.error('❌ Gemini error:', error.message);
    return `Error: ${error.message}`;
  }
}
