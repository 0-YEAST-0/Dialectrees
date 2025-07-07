// scripts/seed.ts
import "dotenv/config";
import { db } from "./db"; // your drizzle db instance
import { globals, nodes, nodeTypeEnum } from "@/db/schema"; // your schema
import { eq, isNull } from "drizzle-orm";
import { v4 as uuid } from 'uuid';

async function seed() {

  const existingGlobals = (await db.select().from(globals))[0];

  if (!existingGlobals) {
    await db.insert(globals).values({
      id: 1,
      treeUUID: uuid()
    });

    console.log("✅ Globals created");
  }

  
  const existingRoot = (await db.select().from(nodes).where(isNull(nodes.parent)))[0];

  if (!existingRoot) {
    await db.insert(nodes).values({
      author: null,
      title: "Dialectrees",
      type: "group",
      created: new Date(),
      lastEdited: new Date(),
      pinned: true,
      content: null,
      parent: null,
      editUUID: uuid(),
    });

    db.update(globals).set({treeUUID: uuid()}).where(eq(globals.id, 1));
    console.log("✅ Root node created");
  }


  

  process.exit();
}

seed().catch((e) => {
  console.error("❌ Seeding error", e);
  process.exit(1);
});