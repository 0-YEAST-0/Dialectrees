import { drizzle, PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema  from './schema';
import { ExtractTablesWithRelations } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
const client = postgres(`${process.env.POSTGRES_URL!}`);

export const  db = drizzle({client: client, schema: schema});

export type Driver = PgTransaction<PostgresJsQueryResultHKT, typeof import("@/db/schema"), ExtractTablesWithRelations<typeof import("@/db/schema")>> | typeof db;
