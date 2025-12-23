import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log('\n📋 Listing available Gemini models...\n');

    const models = await genAI.listModels();

    console.log('Available models:');
    models.forEach(model => {
      console.log(`\n  ✅ ${model.name}`);
      console.log(`     Display Name: ${model.displayName}`);
      console.log(`     Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
    });

    console.log('\n\n🧪 Testing models with generateContent...\n');

    for (const modelInfo of models) {
      if (modelInfo.supportedGenerationMethods.includes('generateContent')) {
        const modelName = modelInfo.name.replace('models/', '');
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent('Say OK');
          console.log(`✅ ${modelName}: WORKS`);
        } catch (error) {
          console.log(`❌ ${modelName}: ${error.message.substring(0, 100)}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels();
