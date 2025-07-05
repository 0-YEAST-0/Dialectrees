// user.ts
import { db } from './db';
import { globals } from './schema';
import { eq } from 'drizzle-orm';

export async function getTreeUUID() {
  return (await db.select({treeUUID: globals.treeUUID}).from(globals).where(eq(globals.id, 1)))[0].treeUUID;
}
