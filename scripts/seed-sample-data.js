import fs from 'fs';
import path from 'path';

const rawDir = path.join(process.cwd(), 'data', 'raw');

if (!fs.existsSync(rawDir)) {
  fs.mkdirSync(rawDir, { recursive: true });
}

const sampleVttContent = `WEBVTT

00:00:01.000 --> 00:00:05.000
Welcome to the Advanced RAG Course. In this lesson, we will cover the basics.

00:00:06.000 --> 00:00:10.000
Retrieval-Augmented Generation, or RAG, combines a retrieval system with an LLM.

00:00:11.000 --> 00:00:15.000
This allows the language model to answer questions using specific context it wouldn't otherwise know.

00:00:16.000 --> 00:00:20.000
The architecture uses Qdrant for vector storage and Gemini for embeddings and generation.
`;

const filePath = path.join(rawDir, '01_Introduction_to_RAG.vtt');
fs.writeFileSync(filePath, sampleVttContent);

console.log('✅ Seeded sample VTT data to data/raw/01_Introduction_to_RAG.vtt');
