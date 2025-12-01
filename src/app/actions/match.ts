"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { isVerificationRequired } from "@/lib/system-config";

export async function submitMatchResult(
	matchId: string,
	score: string,
	winnerId: string
) {
	const session = await getServerSession(authOptions);
	if (!session || !session.user) {
		throw new Error("Unauthorized");
	}

	const match = await prisma.match.findUnique({
		where: { id: matchId },
		include: { player1: true, player2: true },
	});

	if (!match) {
		throw new Error("Match not found");
	}

	// Only referee or players (if fallback allowed) can submit
	// For now, let's allow players to submit if no referee is assigned, or if they are the referee
	const isReferee = match.refereeId === session.user.id;
	const isPlayer =
		match.player1Id === session.user.id || match.player2Id === session.user.id;

	if (!isReferee && !isPlayer) {
		throw new Error("Permission denied");
	}

	const requireVerification = await isVerificationRequired();

	if (requireVerification) {
		await prisma.match.update({
			where: { id: matchId },
			data: {
				score,
				winnerId,
				status: "WAITING_FOR_WITNESS",
				verificationStatus: "WAITING_FOR_WITNESS",
				refereeId: isReferee ? session.user.id : undefined,
			},
		});
	} else {
		// Auto-confirm
		await prisma.match.update({
			where: { id: matchId },
			data: {
				score,
				winnerId,
				status: "COMPLETED",
				verificationStatus: "CONFIRMED",
				refereeId: isReferee ? session.user.id : undefined,
			},
		});

		// Trigger tournament completion check
		const { completeTournament } = await import("./tournament-completion");
		await completeTournament(match.tournamentId);
	}

	revalidatePath(`/tournaments/${match.tournamentId}`);
}

export async function requestWitnesses(matchId: string) {
	const session = await getServerSession(authOptions);
	if (!session || !session.user) {
		throw new Error("Unauthorized");
	}

	const match = await prisma.match.findUnique({
		where: { id: matchId },
		include: { tournament: { include: { participants: true } } },
	});

	if (!match) {
		throw new Error("Match not found");
	}

	// Find potential witnesses:
	// 1. In the same tournament
	// 2. Not player 1 or player 2
	// 3. Not the referee (submitter)
	const potentialWitnesses = match.tournament.participants.filter(
		(p) =>
			p.userId !== match.player1Id &&
			p.userId !== match.player2Id &&
			p.userId !== session.user.id // Assuming caller is referee
	);

	// Create requests for up to 5 random potential witnesses
	const selectedWitnesses = potentialWitnesses
		.sort(() => 0.5 - Math.random())
		.slice(0, 5);

	for (const witness of selectedWitnesses) {
		await prisma.witnessRequest.create({
			data: {
				matchId,
				userId: witness.userId,
				expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
			},
		});
	}

	revalidatePath(`/tournaments/${match.tournamentId}`);
}

export async function respondToWitnessRequest(
	requestId: string,
	action: "ACCEPTED" | "REJECTED"
) {
	const session = await getServerSession(authOptions);
	if (!session || !session.user) {
		throw new Error("Unauthorized");
	}

	const request = await prisma.witnessRequest.findUnique({
		where: { id: requestId },
		include: { match: true },
	});

	if (!request) {
		throw new Error("Request not found");
	}

	if (request.userId !== session.user.id) {
		throw new Error("Unauthorized");
	}

	if (request.status !== "PENDING") {
		throw new Error("Request already responded to");
	}

	await prisma.witnessRequest.update({
		where: { id: requestId },
		data: { status: action },
	});

	if (action === "ACCEPTED") {
		console.log(`[Witness] User ${session.user.id} ACCEPTED request ${requestId} for match ${request.matchId}`);
		// Assign as witness
		await prisma.match.update({
			where: { id: request.matchId },
			data: { witnessId: session.user.id },
		});
		console.log(`[Witness] Match ${request.matchId} updated with witness ${session.user.id}`);
	}

	revalidatePath("/dashboard");
	revalidatePath(`/tournaments/${request.match.tournamentId}`);
}

export async function confirmMatchResult(matchId: string) {
	const session = await getServerSession(authOptions);
	if (!session || !session.user) {
		throw new Error("Unauthorized");
	}

	const match = await prisma.match.findUnique({
		where: { id: matchId },
	});

	if (!match) {
		throw new Error("Match not found");
	}

	if (match.witnessId !== session.user.id) {
		throw new Error("Not the assigned witness");
	}

	// Calculate Rewards
	// 1. Get Tournament Data
	const tournament = await prisma.tournament.findUnique({
		where: { id: match.tournamentId },
		include: { participants: true, matches: true },
	});

	if (!tournament) throw new Error("Tournament not found");

	const totalPlayers = tournament.participants.length;
	const tournamentFee = 2.0; // Config value
	const tournamentStaminaPool = totalPlayers * tournamentFee;

	const totalMatches = tournament.matches.length;
	const totalWitnessSlots = totalMatches * 2; // Requirement: matches * 2

	// Avoid division by zero
	const poolBonus =
		totalWitnessSlots > 0
			? tournamentStaminaPool / totalWitnessSlots
			: 0;

	const baseReward = 0.3;
	const totalRewardRaw = baseReward + poolBonus;
	
	// Helper to apply cap
	const applyRewardWithCap = async (userId: string, amount: number) => {
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) return;

		const maxStamina = 20.0;
		const currentStamina = user.stamina;
		const remainingCap = maxStamina - currentStamina;
		
		if (remainingCap <= 0) return; // Already at or over cap

		const finalReward = Math.min(amount, remainingCap);

		await prisma.user.update({
			where: { id: userId },
			data: { stamina: { increment: finalReward } },
		});

		await prisma.staminaLog.create({
			data: {
				userId: userId,
				amount: finalReward,
				reason: `Match ${match.id} reward (Base: ${baseReward}, Bonus: ${poolBonus.toFixed(2)})`,
			},
		});
	};

	// Distribute to Referee
	if (match.refereeId) {
		await applyRewardWithCap(match.refereeId, totalRewardRaw);
	}

	// Distribute to Witness
	await applyRewardWithCap(session.user.id, totalRewardRaw);

	// Update match status
	await prisma.match.update({
		where: { id: matchId },
		data: {
			status: "COMPLETED",
			verificationStatus: "CONFIRMED",
		},
	});

	revalidatePath(`/tournaments/${match.tournamentId}`);

	// Check for tournament completion
	const { completeTournament } = await import("./tournament-completion");
	await completeTournament(match.tournamentId);
}
