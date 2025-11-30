"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Participant = {
	group: string | null;
	user: {
		id: string;
		name: string | null;
	};
};

type Match = {
	winnerId: string | null;
	player1Id: string | null;
	player2Id: string | null;
	status: string;
};

type Standing = {
	userId: string;
	name: string;
	group: string;
	points: number;
	matchesPlayed: number;
	wins: number;
	losses: number;
};

export default function Standings({
	participants,
	matches,
}: {
	participants: Participant[];
	matches: Match[];
}) {
	const standingsMap = new Map<string, Standing>();

	// Initialize
	participants.forEach((p) => {
		standingsMap.set(p.user.id, {
			userId: p.user.id,
			name: p.user.name || "Unknown",
			group: p.group || "Unassigned",
			points: 0,
			matchesPlayed: 0,
			wins: 0,
			losses: 0,
		});
	});

	// Calculate
	matches.forEach((match) => {
		if (match.status !== "COMPLETED" || !match.winnerId) return;

		const winnerId = match.winnerId;
		const loserId =
			match.player1Id === winnerId ? match.player2Id : match.player1Id;

		if (winnerId && standingsMap.has(winnerId)) {
			const stats = standingsMap.get(winnerId)!;
			stats.points += 1.0;
			stats.wins += 1;
			stats.matchesPlayed += 1;
		}

		if (loserId && standingsMap.has(loserId)) {
			const stats = standingsMap.get(loserId)!;
			stats.points += 0.5;
			stats.losses += 1;
			stats.matchesPlayed += 1;
		}
	});

	// Group by group name
	const groupedStandings: Record<string, Standing[]> = {};
	Array.from(standingsMap.values()).forEach((s) => {
		if (!groupedStandings[s.group]) groupedStandings[s.group] = [];
		groupedStandings[s.group].push(s);
	});

	// Sort each group
	Object.keys(groupedStandings).forEach((group) => {
		groupedStandings[group].sort((a, b) => {
			if (b.points !== a.points) return b.points - a.points;
			return b.wins - a.wins; // Tiebreaker: Wins
		});
	});

	// Sort group names (A, B, C...)
	const sortedGroups = Object.keys(groupedStandings).sort();

	return (
		<div className="space-y-6">
			{sortedGroups.map((group) => (
				<Card key={group}>
					<CardHeader>
						<CardTitle>Standings - Group {group}</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full text-sm text-left">
								<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
									<tr>
										<th className="px-6 py-3">Rank</th>
										<th className="px-6 py-3">Player</th>
										<th className="px-6 py-3">Points</th>
										<th className="px-6 py-3">P</th>
										<th className="px-6 py-3">W</th>
										<th className="px-6 py-3">L</th>
									</tr>
								</thead>
								<tbody>
									{groupedStandings[group].map((s, index) => (
										<tr
											key={s.userId}
											className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
										>
											<td className="px-6 py-4">
												{index + 1}
											</td>
											<td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
												{s.name}
											</td>
											<td className="px-6 py-4">
												{s.points}
											</td>
											<td className="px-6 py-4">
												{s.matchesPlayed}
											</td>
											<td className="px-6 py-4">
												{s.wins}
											</td>
											<td className="px-6 py-4">
												{s.losses}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
