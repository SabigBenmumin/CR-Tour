"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function completeTournament(tournamentId: string) {
	const tournament = await prisma.tournament.findUnique({
		where: { id: tournamentId },
		include: {
			matches: {
				include: {
					winner: true,
					player1: true,
					player2: true,
				},
			},
			participants: true,
		},
	});

	if (!tournament) throw new Error("Tournament not found");

	// 1. Verify all matches are completed
	const allMatchesCompleted = tournament.matches.every(
		(m) => m.status === "COMPLETED"
	);

	if (!allMatchesCompleted) {
		console.log("Not all matches completed yet.");
		return;
	}

	// 2. Update Tournament Status
	await prisma.tournament.update({
		where: { id: tournamentId },
		data: { status: "COMPLETED" },
	});

	// 3. Calculate Rankings & Points
	// Logic:
	// - Winner: Won the final match (Round 3 for 8 players)
	// - Runner-up: Lost the final match
	// - Semi-finalists: Lost in Round 2
	// - Quarter-finalists: Lost in Round 1

	// Find the final match (highest round)
	const maxRound = Math.max(...tournament.matches.map((m) => m.round));
	const finalMatch = tournament.matches.find((m) => m.round === maxRound);

	if (!finalMatch || !finalMatch.winnerId) return;

	const winnerId = finalMatch.winnerId;
	const runnerUpId =
		finalMatch.player1Id === winnerId
			? finalMatch.player2Id
			: finalMatch.player1Id;

	// Helper to award points
	const awardPoints = async (userId: string, points: number) => {
		await prisma.user.update({
			where: { id: userId },
			data: { totalPoints: { increment: points } },
		});
	};

	// Award Winner (10 pts)
	await awardPoints(winnerId, 10);

	// Award Runner-up (7 pts)
	if (runnerUpId) {
		await awardPoints(runnerUpId, 7);
	}

	// Award Semi-finalists (5 pts)
	// Those who lost in (maxRound - 1)
	const semiFinalMatches = tournament.matches.filter(
		(m) => m.round === maxRound - 1
	);
	for (const match of semiFinalMatches) {
		const loserId =
			match.winnerId === match.player1Id
				? match.player2Id
				: match.player1Id;
		if (loserId) {
			await awardPoints(loserId, 5);
		}
	}

    // Award Quarter-finalists/Others (3 pts or 1 pt?)
    // Requirements say: 4th Place: 3 points.
    // For now, let's just stick to top 4 as per requirements implied structure.
    // If we want to award participation points, we can iterate through all participants.
    
	revalidatePath(`/tournaments/${tournamentId}`);
	revalidatePath("/dashboard"); // Update rankings on dashboard if displayed
}
