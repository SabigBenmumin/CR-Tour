"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MatchActionCard from "@/components/match-action-card";

// Define a more robust type that matches what we get from Prisma
type Match = {
	id: string;
	player1: { id: string; name: string | null } | null;
	player2: { id: string; name: string | null } | null;
	winner: { name: string | null } | null;
	winnerId: string | null;
	score: string | null;
	status: string;
	verificationStatus: string;
	refereeId: string | null;
	witnessId: string | null;
	tournamentId: string;
};

export default function MatchList({
	matches,
	currentUserId,
}: {
	matches: any[]; // Using any to avoid strict type issues for now, but should be Match[]
	currentUserId: string;
}) {
	return (
		<div className="space-y-4">
			{matches.map((match) => (
				<Card key={match.id}>
					<CardHeader className="pb-2">
						<CardTitle className="text-base flex justify-between items-center">
							<span>
								{match.player1?.name || "TBD"} vs{" "}
								{match.player2?.name || "TBD"}
							</span>
							<span className="text-xs font-normal text-gray-500">
								Round {match.round}
							</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-3">
							<div className="flex justify-between items-start text-sm">
								<div>
									<p>
										<span className="font-medium">
											Status:
										</span>{" "}
										{match.status}
									</p>
									{match.score && (
										<p>
											<span className="font-medium">
												Score:
											</span>{" "}
											{match.score}
										</p>
									)}
									{match.winner && (
										<p>
											<span className="font-medium">
												Winner:
											</span>{" "}
											{match.winner.name}
										</p>
									)}
								</div>

								{/* Action Card for Referee/Witness/Players */}
								<div className="min-w-[150px] flex justify-end">
									<MatchActionCard match={match} />
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
