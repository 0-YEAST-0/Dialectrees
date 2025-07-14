// user.ts
import { db } from './db';
import { NODE_TYPES, NodeStance, nodes, NodeType, NODE_STANCE } from './schema';
import { and, eq, ne } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';

type ElementType<T> = T extends Array<infer U> ? U : T;

export async function getPinnedNodes() {
  return await db.select().from(nodes).where(eq(nodes.pinned, true));
}

export type Node = ElementType<NonNullable<Awaited<ReturnType<typeof getPinnedNodes>>>>;

export async function getNodeWithChildren(id: number, editUUID: string) {
  return (await db.query.nodes.findMany({
    with: {
      children: {
        with: {
          author: {
            columns: {
              username: true,
            },
          },
        },
      },
      author: {
        columns: {
          username: true,
        },
      },
    },
    where: and(eq(nodes.id, id), ne(nodes.editUUID, editUUID))
  }))[0] ?? null;
}

export type NodeWithChildren = Awaited<ReturnType<typeof getNodeWithChildren>>;

export async function setPinned(nodeId: number, pinned: boolean) {
  return (await db.update(nodes).set({pinned}).where(eq(nodes.id, nodeId)));
}

export async function createNode(
  author: string,
  title: string,
  type: NodeType,
  stance: NodeStance,
  parent: number,
  content?: string
) {
  const newNode = await db.insert(nodes).values({
    author: author,
    title: title,
    type: type,
    parent: parent || null,
    content: content || null,
    pinned: false,
    stance: stance,
    editUUID: uuid(),
    created: new Date(),
    lastEdited: new Date(),
  }).returning();

  return newNode[0];
}

export async function deleteNode(id: number) {
  return (await db.delete(nodes).where(eq(nodes.id, id)));
}

export const isValidNodeType = (type: string): boolean => {
  return NODE_TYPES.includes(type as any)
}

export const isValidNodeStance = (stance: string): boolean => {
  return NODE_STANCE.includes(stance as any)
}