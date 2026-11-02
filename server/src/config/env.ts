import 'dotenv/config';
import { z } from 'zod';
const envSchema = z.object({ NODE_ENV:z.enum(['development','test','production']).default('development'), PORT:z.coerce.number().default(5000), CLIENT_ORIGIN:z.string().url().default('http://localhost:5173'), MONGODB_URI:z.string().default('mongodb://127.0.0.1:27017/caseverse'), SESSION_SECRET:z.string().min(16).default('local-development-secret-change-this'), GEMINI_API_KEY:z.string().optional(), GEMINI_MODEL:z.string().default('gemini-3.8-flash') });
export const env = envSchema.parse(process.env);
if(env.NODE_ENV==='production'&&(env.SESSION_SECRET==='local-development-secret-change-this'||!env.GEMINI_API_KEY||!process.env.MONGODB_URI)) throw new Error('Production requires SESSION_SECRET, MONGODB_URI, and GEMINI_API_KEY.');
