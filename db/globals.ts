// user.ts
import { db } from './db';
import { globals } from './schema';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';

export async function getTreeUUID() {
  return (await db.select({treeUUID: globals.treeUUID}).from(globals).where(eq(globals.id, 1)))[0].treeUUID;
}

export async function updateTreeUUID() {
  return db.update(globals).set({ treeUUID: uuid()});
}
