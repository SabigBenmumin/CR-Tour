"use server";

import { prisma } from "@/lib/prisma";
import { completeTournament } from "./tournament-completion";
import { revalidatePath } from "next/cache";

export async function backfillTournamentPoints() {
	// 1. Get last rerank date
	const config = await prisma.systemConfig.findUnique({
		where: { key: "lastRerankAt" },
	});
	const lastRerankAt = config ? new Date(config.value) : new Date(0); // Default to epoch if never reranked

	// 2. Find tournaments:
	// - Not COMPLETED
	// - End date (updatedAt) is AFTER lastRerankAt
	const tournaments = await prisma.tournament.findMany({
		where: {
			status: { not: "COMPLETED" },
			updatedAt: { gt: lastRerankAt },
		},
		include: {
			matches: true,
		},
	});

	let updatedCount = 0;

	for (const tournament of tournaments) {
		// Check if all matches are completed
		const allMatchesCompleted =
			tournament.matches.length > 0 &&
			tournament.matches.every((m) => m.status === "COMPLETED");

		if (allMatchesCompleted) {
			console.log(`Backfilling points for tournament ${tournament.id}`);
			await completeTournament(tournament.id);
			updatedCount++;
		}
	}

	revalidatePath("/admin");
	return { success: true, count: updatedCount };
}
