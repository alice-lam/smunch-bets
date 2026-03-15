'use server'

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';

export async function getData() {
    const sql = neon(process.env.DATABASE_URL!);
    const data = await sql`SELECT * FROM posts`; 
    return data;
}

export async function pushData(newBet: {
    title: string; 
    creator: string; 
    stake: string; 
    participants: string[]; 
    notes?: string; 
    status?: string;
}) {
    const sql = neon(process.env.DATABASE_URL!);

    try {
        // We use JSON.stringify() to turn the array into a valid JSON string 
        // that Postgres will cast to jsonb automatically.
        await sql`
            INSERT INTO posts (title, creator, stake, participants, notes, status)
            VALUES (
                ${newBet.title}, 
                ${newBet.creator}, 
                ${newBet.stake}, 
                ${JSON.stringify(newBet.participants)}, 
                ${newBet.notes || null}, 
                ${newBet.status || 'Pending'}
            )
        `;

        revalidatePath('/'); // Refresh the page to show the new bet
        return { success: true };
    } catch (error) {
        console.error("Database insert error:", error);
        return { success: false, error: "Failed to save bet" };
    }
}

export async function updateData(bet: { 
    id: number; 
    title: string; 
    creator: string; 
    stake: string; 
    participants: string[]; 
    notes?: string;
    status: string;
}) {
    const sql = neon(process.env.DATABASE_URL!);

    try {
        await sql`
            UPDATE posts
            SET 
                title = ${bet.title},
                creator = ${bet.creator},
                stake = ${bet.stake},
                participants = ${JSON.stringify(bet.participants)},
                notes = ${bet.notes || null},
                status = ${bet.status}
            WHERE id = ${bet.id}
        `;

        // Refresh the page data
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Database update error:", error);
        return { success: false, error: "Failed to update bet" };
    }
}