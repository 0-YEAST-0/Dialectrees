'use server';

import auth0 from '@/app/auth0';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { redirect } from "next/navigation";
import { getUser } from '@/db/user';

export async function createUser(formData: FormData) {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    console.log("setup redirect to login");
    redirect('/auth/login?returnTo=/app');
  }

  const name = formData.get('displayName')?.toString().trim();

  if (!name) {
    throw new Error('Display name is required');
  }
  
  const existingUser = await getUser(user!.sub);

  if (existingUser) {
    throw new Error('User already exists');
  }
  
  await db
    .insert(users)
    .values({ id: user!.sub, username: name, email: user!.email! });

  redirect('/app');
}