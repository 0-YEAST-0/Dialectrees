// user.ts
import { db } from './db';
import { nodes } from './schema';
import { eq } from 'drizzle-orm';

export async function getNodes() {
  return await db.select().from(nodes).orderBy(nodes.id);
}
