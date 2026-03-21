'use server'

import { neon } from '@neondatabase/serverless';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const BetSchema = z.object({
    title: z.string().trim().min(3, "Title too short").max(100, "Title too long"),
    creator: z.string().trim().min(2),
    stake: z.string().trim().min(1),
    participants: z.array(z.string()).min(1, "At least one participant required"),
    notes: z.string().trim().max(500).nullable().optional(),
    status: z.enum(['In Progress', 'Pending Punishment', 'Completed', 'Cancelled']).default('In Progress'),
});

export async function getData() {
    const sql = neon(process.env.DATABASE_URL!);
    const data = await sql`SELECT * FROM posts`; 
    return data;
}

export async function pushData(rawData: any) {
    const sql = neon(process.env.DATABASE_URL!);

    try {
        const validated = BetSchema.parse(rawData);

        await sql`
            INSERT INTO posts (title, creator, stake, participants, notes, status)
            VALUES (
                ${validated.title}, 
                ${validated.creator}, 
                ${validated.stake}, 
                ${JSON.stringify(validated.participants)}, 
                ${validated.notes || null}, 
                ${validated.status}
            )
        `;
        // Refresh the page to show the new bet
        revalidatePath('/');
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