import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  dialect: "postgresql",
  out: "./db/drizzle",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  }
} satisfies Config;