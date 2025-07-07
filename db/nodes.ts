// user.ts
import { db } from './db';
import { nodes } from './schema';
import { and, eq, ne } from 'drizzle-orm';

export async function getPinnedNodes() {
  return await db.select().from(nodes).where(eq(nodes.pinned, true));
}

export async function getNodeWithChildren(id: number, editUUID: string) {
  return (await db.query.nodes.findMany({
    with: {
      children:true
    },
    where: and(eq(nodes.id, id), ne(nodes.editUUID, editUUID))
  }))[0] ?? null;
}

export type NodeWithChildren = Awaited<ReturnType<typeof getNodeWithChildren>>;