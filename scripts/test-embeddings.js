import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });
  try {
    const res2 = await model.batchEmbedContents({
      requests: [{ content: { role: 'user', parts: [{ text: 'Hello world' }] } }]
    });
    console.log(`✅ batchEmbedContents success! Dimension: ${res2.embeddings[0].values.length}`);
  } catch (e) {
    console.log(`❌ batchEmbedContents failed: ${e.message}`);
  }
}

test();
