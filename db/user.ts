// user.ts
import { db } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export async function getUser(id: string) {
  return (await db.select().from(users).where(eq(users.id, id)))[0];
}
