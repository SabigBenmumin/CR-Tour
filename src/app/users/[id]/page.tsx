import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Calendar, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await getServerSession(authOptions);
	const user = await prisma.user.findUnique({
		where: { id },
		include: {
			tournaments: {
				include: { tournament: true },
				orderBy: { joinedAt: "desc" },
			},
			matchesWon: true,
			matchesAsPlayer1: {
				include: {
					player1: true,
					player2: true,
					winner: true,
					tournament: true,
				},
			},
			matchesAsPlayer2: {
				include: {
					player1: true,
					player2: true,
					winner: true,
					tournament: true,
				},
			},
		},
	});

	if (!user) notFound();

	const isOwner = session?.user?.id === user.id;
	const isAdmin = session?.user?.role === "ADMIN";
	const canViewSensitiveInfo = isOwner || isAdmin;

	// Combine and sort matches
	const allMatches = [
		...user.matchesAsPlayer1,
		...user.matchesAsPlayer2,
	].sort(
		(a, b) =>
			new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
	);

	const totalMatches = allMatches.length;
	const wins = user.matchesWon.length;
	const losses = totalMatches - wins;
	const winRate =
		totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0.0";

	return (
		<div className="container mx-auto p-6 space-y-6">
			{/* Profile Header */}
			<Card className="overflow-hidden">
				<div
					className="h-32 bg-cover bg-center"
					style={{
						backgroundImage:
							"url('/city-of-sydney-tennis-3a5511.jpg')",
					}}
				></div>
				<CardContent className="relative pt-0">
					<div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-6 gap-4 px-4">
						<Avatar className="h-24 w-24 border-4 border-white shadow-lg">
							<AvatarImage
								src={user.image || ""}
								alt={user.name || "User"}
							/>
							<AvatarFallback className="text-2xl">
								{user.name?.[0]?.toUpperCase() || "U"}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 text-center sm:text-left space-y-1">
							<h1 className="text-2xl font-bold">{user.name}</h1>
							<div className="flex items-center justify-center sm:justify-start gap-2 text-gray-500">
								{user.role === "ADMIN" && (
									<span className="flex items-center gap-1 text-red-600 font-medium text-sm bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
										<Shield className="h-3 w-3" /> Admin
									</span>
								)}
								<span className="text-sm">
									Joined{" "}
									{new Date(
										user.createdAt
									).toLocaleDateString()}
								</span>
							</div>
						</div>
						<div className="flex flex-col items-center sm:items-end">
							<div className="text-3xl font-bold text-blue-600 font-mono">
								{user.totalPoints.toLocaleString()}
							</div>
							<div className="text-sm text-gray-500 uppercase tracking-wider font-medium">
								Total Points
							</div>
						</div>
					</div>

					{/* Stats Grid */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t pt-6">
						<div className="text-center p-4 rounded-lg bg-gray-50">
							<div className="text-2xl font-bold text-gray-900">
								{totalMatches}
							</div>
							<div className="text-xs text-gray-500 uppercase mt-1">
								Matches
							</div>
						</div>
						<div className="text-center p-4 rounded-lg bg-green-50">
							<div className="text-2xl font-bold text-green-600">
								{wins}
							</div>
							<div className="text-xs text-green-600 uppercase mt-1">
								Wins
							</div>
						</div>
						<div className="text-center p-4 rounded-lg bg-red-50">
							<div className="text-2xl font-bold text-red-600">
								{losses}
							</div>
							<div className="text-xs text-red-600 uppercase mt-1">
								Losses
							</div>
						</div>
						<div className="text-center p-4 rounded-lg bg-blue-50">
							<div className="text-2xl font-bold text-blue-600">
								{winRate}%
							</div>
							<div className="text-xs text-blue-600 uppercase mt-1">
								Win Rate
							</div>
						</div>
					</div>

					{/* Sensitive Info (Owner/Admin Only) */}
					{canViewSensitiveInfo && (
						<div className="mt-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
							<h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
								<Shield className="h-4 w-4" /> Private
								Information
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-gray-600">
										Email:
									</span>{" "}
									<span className="font-medium">
										{user.email}
									</span>
								</div>
								<div>
									<span className="text-gray-600">
										Stamina:
									</span>{" "}
									<span className="font-medium">
										{user.stamina.toFixed(1)}
									</span>
								</div>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Match History */}
				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Trophy className="h-5 w-5" /> Match History
						</CardTitle>
					</CardHeader>
					<CardContent>
						{allMatches.length === 0 ? (
							<div className="text-center py-8 text-gray-500">
								No matches played yet.
							</div>
						) : (
							<div className="space-y-4">
								{allMatches.map((match) => {
									const isPlayer1 =
										match.player1Id === user.id;
									const opponent = isPlayer1
										? match.player2
										: match.player1;
									const isWinner = match.winnerId === user.id;
									const resultColor = isWinner
										? "bg-green-100 border-green-200"
										: "bg-red-50 border-red-100";
									const resultText = isWinner
										? "WON"
										: "LOST";
									const resultTextColor = isWinner
										? "text-green-700"
										: "text-red-700";

									return (
										<div
											key={match.id}
											className={`flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg ${resultColor}`}
										>
											<div className="flex items-center gap-4 mb-2 sm:mb-0 w-full sm:w-auto">
												<div
													className={`font-bold text-sm px-2 py-1 rounded ${resultTextColor} bg-white/50 border border-black/5`}
												>
													{resultText}
												</div>
												<div>
													<div className="font-medium">
														vs{" "}
														{opponent?.name ||
															"Unknown"}
													</div>
													<div className="text-xs text-gray-500">
														{match.tournament.title}
													</div>
												</div>
											</div>

											<div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
												<div className="text-sm font-mono font-bold">
													{match.score || "-"}
												</div>
												<div className="text-xs text-gray-500 flex items-center gap-1">
													<Calendar className="h-3 w-3" />
													{new Date(
														match.updatedAt
													).toLocaleDateString()}
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Tournaments List */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Medal className="h-5 w-5" /> Tournaments
						</CardTitle>
					</CardHeader>
					<CardContent>
						{user.tournaments.length === 0 ? (
							<p className="text-center py-4 text-gray-500">
								No tournaments joined.
							</p>
						) : (
							<ul className="space-y-3">
								{user.tournaments.map((t) => (
									<li
										key={t.tournamentId}
										className="border-b last:border-0 pb-3 last:pb-0"
									>
										<Link
											href={`/tournaments/${t.tournamentId}`}
											className="block group"
										>
											<div className="font-medium group-hover:text-blue-600 transition-colors">
												{t.tournament.title}
											</div>
											<div className="flex justify-between items-center mt-1">
												<span className="text-xs text-gray-500">
													Joined{" "}
													{new Date(
														t.joinedAt
													).toLocaleDateString()}
												</span>
												{t.tournament.status ===
													"COMPLETED" && (
													<span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border">
														COMPLETED
													</span>
												)}
											</div>
										</Link>
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
