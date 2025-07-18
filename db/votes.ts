import { and, eq, sql } from "drizzle-orm";
import { voteCache, votes } from "./schema";
import { db, Driver } from "./db";



export async function getVote(userId: string, nodeId: number, isStance: boolean, driver: Driver = db) {
    return await driver.select()
        .from(votes)
        .where(and(
            eq(votes.userId, userId),
            eq(votes.nodeId, nodeId),
            eq(votes.isStance, isStance)
        ))
        .limit(1);
}

export async function deleteVote(userId: string, nodeId: number, isStance: boolean, driver: Driver = db) {
    return await driver.delete(votes)
        .where(and(
            eq(votes.userId, userId),
            eq(votes.nodeId, nodeId),
            eq(votes.isStance, isStance)
        ));
}

export async function updateVote(userId: string, nodeId: number, isStance: boolean, isPositive: boolean, driver: Driver = db) {
    return await driver.update(votes)
        .set({ isPositive })
        .where(and(
            eq(votes.userId, userId),
            eq(votes.nodeId, nodeId),
            eq(votes.isStance, isStance)
        ));
}

export async function insertVote(userId: string, nodeId: number, isStance: boolean, isPositive: boolean, driver: Driver = db) {
    return await driver.insert(votes).values({
        userId,
        nodeId,
        isStance,
        isPositive
    });
}

export async function initVoteCache(nodeId: number, driver: Driver = db) {
    await driver.insert(voteCache)
        .values({
            nodeId: nodeId,
            likes: 0,
            dislikes: 0,
            community: 0,
            opposing: 0
        })
        .onConflictDoNothing();
}

export async function updateVoteCache(nodeId: number, isStance: boolean, oldValue: number, newValue: number, change: number, driver: Driver = db) {
    const diff = oldValue - newValue;
    const sum = oldValue + newValue;
    
    const positiveChange = sum >= 0 ? -Math.sign(diff)*change : 0;
    const negativeChange = sum <= 0 ? Math.sign(diff)*change : 0;

    console.log("... ", oldValue, ".", newValue);
    console.log("... ", diff, ".", sum, ".", positiveChange, ".", negativeChange);
    
    if (diff == 0) return;
    if (isStance) {
        if (positiveChange != 0 || negativeChange != 0) {
            await driver.update(voteCache)
                .set({ 
                    community: sql`${voteCache.community} + ${positiveChange}`,
                    opposing: sql`${voteCache.opposing} + ${negativeChange}`
                })
                .where(eq(voteCache.nodeId, nodeId));
        }
    } else {
        if (positiveChange != 0 || negativeChange != 0) {
            await driver.update(voteCache)
                .set({ 
                    likes: sql`${voteCache.likes} + ${positiveChange}`,
                    dislikes: sql`${voteCache.dislikes} + ${negativeChange}`
                })
                .where(eq(voteCache.nodeId, nodeId));
        }
    }
}