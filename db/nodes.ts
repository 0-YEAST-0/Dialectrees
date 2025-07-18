// user.ts
import { db, Driver } from './db';
import { NODE_TYPES, NodeStance, nodes, NodeType, NODE_STANCE, voteCache, votes } from './schema';
import { and, eq, ne } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { User } from './user';

type ElementType<T> = T extends Array<infer U> ? U : T;

export async function getNode(nodeId: number, driver: Driver = db) {
  
  return (await driver.select()
    .from(nodes)
    .where(eq(nodes.id, nodeId))
    .limit(1))[0] ?? null;
}

export async function getPinnedNodes(user: User | null, driver: Driver = db) {
  return (
    await driver.query.nodes.findMany({
      with: {
        cachedVotes: {
          columns: {
            likes: true,
            dislikes: true,
            community: true,
            opposing: true
          }
        },
        votes: {
          where: and(
            eq(votes.userId, user?.id || "_"),
          )
        }
      },
      where: eq(nodes.pinned, true)
    })
  );
}

export type Node = ElementType<NonNullable<Awaited<ReturnType<typeof getPinnedNodes>>>>;

export async function getNodeWithChildren(id: number, editUUID: string, user: User, driver: Driver = db) {
  return (await driver.query.nodes.findMany({
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
      cachedVotes: {
        columns: {
          likes: true,
          dislikes: true,
          community: true,
          opposing: true
        }
      },
      votes: {
        where: and(
          eq(votes.userId, user.id),
        )
      }
    },
    where: and(eq(nodes.id, id), ne(nodes.editUUID, editUUID))
  }))[0] ?? null;
}

export type NodeWithChildren = Awaited<ReturnType<typeof getNodeWithChildren>>;

export async function setPinned(nodeId: number, pinned: boolean, driver: Driver = db) {
  return (await driver.update(nodes).set({pinned}).where(eq(nodes.id, nodeId)));
}

export async function createNode(
  author: string,
  title: string,
  type: NodeType,
  parent: number,
  content?: string,
  driver: Driver = db
) {
  const newNode = await driver.insert(nodes).values({
    author: author,
    title: title,
    type: type,
    parent: parent || null,
    content: content || null,
    pinned: false,
    editUUID: uuid(),
    created: new Date(),
    lastEdited: new Date(),
  }).returning();

  return newNode[0];
}

export type CreatedNode = Awaited<ReturnType<typeof createNode>>;

export async function deleteNode(id: number, driver: Driver = db) {
  return (await driver.delete(nodes).where(eq(nodes.id, id)));
}

export const isValidNodeType = (type: string): boolean => {
  return NODE_TYPES.includes(type as any)
}

export const isValidNodeStance = (stance: string): boolean => {
  return NODE_STANCE.includes(stance as any)
}

export async function updateNodeUUID(nodeId: number, driver: Driver = db) {
  return driver.update(nodes).set({ editUUID: uuid()}).where(eq(nodes.id, nodeId));
}
