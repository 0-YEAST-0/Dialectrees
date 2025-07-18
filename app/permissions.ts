import { getUser, User } from "@/db/user";
import auth0 from "./auth0";
import { redirect } from "next/navigation";
import { checkPermission } from "./client-permissions";
import { Permissions } from "./client-permissions";


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
    if (checkPermission(user, permission)) 
        return user;

    return null;

}