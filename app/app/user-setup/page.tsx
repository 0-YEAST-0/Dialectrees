
import auth0 from '@/app/auth0';
import { getUser } from '@/db/user';
import UserSetupPage from './page-component';

export default async function Page() {
  console.log("user setup");
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user) {
    // Handle unauthenticated user
    return <div>Please log in</div>;
  }

  const existingUser = await getUser(user.sub);

  return <UserSetupPage user={user} userExists={!!existingUser} />;
}