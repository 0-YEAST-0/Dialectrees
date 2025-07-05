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

// Enum for node type
export const nodeTypeEnum = pgEnum('node_type', ['post', 'header', 'group']);

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
  created: timestamp('created').defaultNow(),
  lastEdited: timestamp('last_edited').defaultNow(),
});

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
    adminRank: integer('admin_rank').default(0),
  }
);

export const globals = pgTable('Globals', {
  id: integer('id').primaryKey(),
  treeUUID: varchar('treeUUID', { length: 36 }).notNull(),
});
