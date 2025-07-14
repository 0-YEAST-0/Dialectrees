import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  timestamp,
  boolean,
  pgEnum,
  primaryKey,
  index,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';


// Define the values as const
export const NODE_TYPES = ['post', 'header', 'group'] as const;



// Create a type from the const
export type NodeType = typeof NODE_TYPES[number];

// Your Drizzle enum
export const nodeTypeEnum = pgEnum('node_type', NODE_TYPES);

export const NODE_STANCE = ['community', 'neutral', 'opposing'] as const;

export type NodeStance = typeof NODE_STANCE[number];

export const nodeStanceEnum = pgEnum('node_stance', NODE_STANCE);

export const users = pgTable('Users', {
  id: varchar('id', {length: 64}).primaryKey(),
  email: varchar('email', { length: 64 }).notNull(),
  username: varchar('username', { length: 24 }).notNull(),
});

export const nodes = pgTable('Nodes', {
  id: serial('id').primaryKey(),
  author: varchar('author', {length: 64})
    .references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 128 }).notNull(),
  type: nodeTypeEnum('type').notNull(),
  parent: integer('parent').references((): AnyPgColumn => nodes.id, { onDelete: 'cascade' }),
  content: text('content'),
  pinned: boolean('pinned').default(false),
  stance: nodeStanceEnum('stance').notNull().default('neutral'),
  created: timestamp('created').defaultNow(),
  lastEdited: timestamp('last_edited').defaultNow(),
  editUUID: varchar('editUUID', { length: 36 }).notNull(),
});

export const nodeRelations = relations(nodes, ({ one, many }) => ({
  // A node may have one parent
  parentNode: one(nodes, {
    fields: [nodes.parent],
    references: [nodes.id],
    relationName: 'parentChild',
  }),

  // A node may have many children
  children: many(nodes, {
    relationName: 'parentChild',
    
  }),

  author: one(users, {
    fields: [nodes.author],
    references: [users.id],
  }),
}));

export const likes = pgTable('Likes', {
    userId: varchar('user_id', {length: 64})
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    nodeId: integer('node_id')
      .notNull()
      .references(() => nodes.id, { onDelete: 'cascade' })
  },
  (likes) => ([
    primaryKey({columns: [likes.userId, likes.nodeId]})
  ])
);

export const members = pgTable(
  'Members',
  {
    userId: varchar('user_id', {length: 64})
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .primaryKey(),
    adminRank: integer('admin_rank').notNull().default(0),
  }
);

export const usersRelations = relations(users, ({ one }) => ({
	membership: one(members),
}))

export const membersRelations = relations(members, ({ one }) => ({
	user: one(users, { fields: [members.userId], references: [users.id] }),
}));

export const globals = pgTable('Globals', {
  id: integer('id').primaryKey(),
  treeUUID: varchar('treeUUID', { length: 36 }).notNull(),
});
