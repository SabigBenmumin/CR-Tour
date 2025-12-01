import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import WitnessRequestList from "@/components/witness-request-list";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);

	if (!session || !session.user) {
		redirect("/login");
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		include: {
			tournaments: {
				include: {
					tournament: true,
				},
			},
			witnessRequests: {
				where: { status: "PENDING" },
				include: {
					match: {
						include: {
							player1: true,
							player2: true,
							tournament: true,
						},
					},
				},
			},
			matchesWon: true,
			matchesAsPlayer1: true,
			matchesAsPlayer2: true,
		},
	});

	if (!user) {
		redirect("/login");
	}

	// Calculate Rank
	const rankCount = await prisma.user.count({
		where: {
			totalPoints: {
				gt: user.totalPoints,
			},
		},
	});
	const rank = rankCount + 1;

	// Calculate Win Rate
	const totalMatches =
		user.matchesAsPlayer1.length + user.matchesAsPlayer2.length;
	const wins = user.matchesWon.length;
	const winRate =
		totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0.0";

	return (
		<div className="container mx-auto p-6 space-y-6">
			<header className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
					<p className="text-gray-500">Athlete Dashboard</p>
				</div>
				<div className="flex items-center gap-4">
					<div className="text-right">
						<p className="text-sm font-medium">Stamina</p>
						<p className="text-2xl font-bold text-green-600">
							{user.stamina.toFixed(1)} / 20
						</p>
					</div>
					<Link href="/tournaments/create">
						<Button>Create Tournament</Button>
					</Link>
				</div>
			</header>

			{/* Witness Requests */}
			{user.witnessRequests.length > 0 && (
				<WitnessRequestList requests={user.witnessRequests} />
			)}

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>My Tournaments</CardTitle>
					</CardHeader>
					<CardContent>
						{user.tournaments.length === 0 ? (
							<p className="text-gray-500">
								You haven't joined any tournaments yet.
							</p>
						) : (
							<ul className="space-y-2">
								{user.tournaments.map((tp: any) => (
									<li
										key={tp.tournamentId}
										className="border-b pb-2"
									>
										<Link
											href={`/tournaments/${tp.tournamentId}`}
											className="hover:underline"
										>
											<p className="font-medium">
												{tp.tournament.title}
											</p>
											<p className="text-sm text-gray-500">
												{tp.tournament.status}
											</p>
										</Link>
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Stats</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span>Rank</span>
								<span className="font-bold">
									{user.totalPoints > 0 ? `#${rank}` : "-"}
								</span>
							</div>
							<div className="flex justify-between">
								<span>Points</span>
								<span className="font-bold">
									{user.totalPoints}
								</span>
							</div>
							<div className="flex justify-between">
								<span>Win Rate</span>
								<span className="font-bold">{winRate}%</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
