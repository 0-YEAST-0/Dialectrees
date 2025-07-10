import { getUser, User } from "@/db/user";
import auth0 from "./auth0";
import { redirect } from "next/navigation";


export enum Permissions{
  SET_PINNED = 1,
}

export async function getAuthenticatedUser(){
    const user = (await auth0.getSession())?.user; 
    if (user) {
        const dbUser = await getUser(user!.sub);
        if (!dbUser) 
            redirect("/app/user-setup");
        
        return dbUser;
    }
    return null;
}

export async function getUserRequirePermissions(permission: Permissions) {
    const user: User | null = await getAuthenticatedUser();
    console.log("permission test ", user);
    if (user && user.membership && user.membership.adminRank >= permission) 
        return user;

    return null;

}
