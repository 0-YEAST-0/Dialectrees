import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema  from './schema';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
const client = postgres(`${process.env.POSTGRES_URL!}`);

export const  db = drizzle({client: client, schema: schema});


