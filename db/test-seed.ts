// scripts/seed.ts
import "dotenv/config";
import { db } from "./db"; // your drizzle db instance
import { globals, nodes, nodeTypeEnum } from "@/db/schema"; // your schema
import { eq, isNull } from "drizzle-orm";
import { v4 as uuid } from 'uuid';

async function seed() {

  
  const existingRoot = (await db.select().from(nodes).where(isNull(nodes.parent)))[0];

  const node1 = (await db.insert(nodes).values({
    author: null,
    title: "Test Node 1",
    type: "header",
    pinned: true,
    content: null,
    parent: existingRoot.id,
    editUUID: uuid(),
  }).returning())[0];

  const node2 = (await db.insert(nodes).values({
    author: null,
    title: "Test Node 2",
    type: "header",
    pinned: true,
    content: null,
    parent: existingRoot.id,
    editUUID: uuid(),
  }).returning())[0];

  const node3 = (await db.insert(nodes).values({
    author: null,
    title: "Test Node 3",
    type: "header",
    pinned: true,
    content: null,
    parent: node1.id,
    editUUID: uuid(),
  }).returning())[0];

  const node4 = (await db.insert(nodes).values({
    author: null,
    title: "Test Node 4",
    type: "header",
    pinned: true,
    content: null,
    parent: node1.id,
    editUUID: uuid(),
  }).returning())[0];

  db.update(globals).set({treeUUID: uuid()}).where(eq(globals.id, 1));
  console.log("✅ Root nodes created");


  process.exit();
}

seed().catch((e) => {
  console.error("❌ Seeding error", e);
  process.exit(1);
});