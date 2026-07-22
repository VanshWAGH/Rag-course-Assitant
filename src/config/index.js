import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  QDRANT_URL: z.string().url("QDRANT_URL must be a valid URL"),
  QDRANT_API_KEY: z.string().optional(), // In case it's running locally without auth
  QDRANT_COLLECTION_NAME: z.string().default("advanced_rag_course"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const config = Object.freeze(parsedEnv.data);