import dotenv from 'dotenv';
import { envSchema } from '../validators/env.schema';

dotenv.config();

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
