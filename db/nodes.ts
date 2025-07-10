// user.ts
import { db } from './db';
import { nodes } from './schema';
import { and, eq, ne } from 'drizzle-orm';

type ElementType<T> = T extends Array<infer U> ? U : T;

export async function getPinnedNodes() {
  return await db.select().from(nodes).where(eq(nodes.pinned, true));
}

export type Node = ElementType<NonNullable<Awaited<ReturnType<typeof getPinnedNodes>>>>;

export async function getNodeWithChildren(id: number, editUUID: string) {
  return (await db.query.nodes.findMany({
    with: {
      children:true
    },
    where: and(eq(nodes.id, id), ne(nodes.editUUID, editUUID))
  }))[0] ?? null;
}

export async function setPinned(nodeId: number, pinned: boolean) {
  return await db.update(nodes).set({pinned}).where(eq(nodes.id, nodeId));
}

export type NodeWithChildren = Awaited<ReturnType<typeof getNodeWithChildren>>;