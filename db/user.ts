// user.ts
import { db } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';

export async function getUser(id: string) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      membership: true
    }
  })
};

export type User = NonNullable<Awaited<ReturnType<typeof getUser>>>;
