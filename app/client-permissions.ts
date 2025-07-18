import { User } from "@/db/user";

export enum Permissions{
    RESPOND = 0,

    VOTE = 1,
    
    SET_PINNED = 2,
    DELETE_RESPONSE = 2,
    PROMOTE_MEMBER = 2,

    PROMOTE_ADMIN = 3
}

export function checkPermission(user: User | null, permission: Permissions) {
    return permission == 0 || (user && user.membership && user.membership.permissionRank >= permission)
}