import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	joinTournament,
	withdrawFromTournament,
	deleteTournament,
} from "@/app/actions/tournament";
import { startTournament } from "@/app/actions/start-tournament";
import MatchList from "@/components/match-list";
import Standings from "@/components/standings";
import MapViewerWrapper from "@/components/map-viewer-wrapper";

export const dynamic = "force-dynamic";

export default async function TournamentDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const session = await getServerSession(authOptions);
	const tournament = await prisma.tournament.findUnique({
		where: { id },
		include: {
			participants: {
				include: {
					user: true,
				},
			},
			matches: {
				include: {
					player1: true,
					player2: true,
					winner: true,
					referee: true,
					witness: true,
				},
				orderBy: { createdAt: "desc" },
			},
		},
	});

	if (!tournament) {
		notFound();
	}

	const isRegistered =
		session?.user?.id &&
		tournament.participants.some((p) => p.userId === session.user.id);
	const canRegister =
		tournament.status === "OPEN" &&
		!isRegistered &&
		tournament.participants.length < tournament.maxPlayers;

	return (
		<div className="container mx-auto p-6 space-y-6">
			<header className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold">{tournament.title}</h1>
					<p className="text-gray-500">{tournament.description}</p>
				</div>
				<div>
					{canRegister && (
						<form
							action={async () => {
								"use server";
								await joinTournament(tournament.id);
							}}
						>
							<Button type="submit">
								Join Tournament (2 Stamina)
							</Button>
						</form>
					)}
					{isRegistered && (
						<div className="flex gap-2">
							<Button disabled variant="secondary">
								Registered
							</Button>
							{tournament.status === "OPEN" && (
								// <form
								// 	action={withdrawFromTournament.bind(
								// 		null,
								// 		tournament.id
								// 	)}
								// >
								// 	<Button type="submit" variant="outline">
								// 		Withdraw
								// 	</Button>
								// </form>
								<div>Withdraw Disabled</div>
							)}
						</div>
					)}

					{/* Start Button */}
					{tournament.status === "OPEN" &&
						tournament.participants.length >=
							tournament.minPlayers && (
							// <form
							// 	action={startTournament.bind(
							// 		null,
							// 		tournament.id
							// 	)}
							// 	className="inline-block ml-2"
							// >
							// 	<Button type="submit" variant="destructive">
							// 		Start Tournament
							// 	</Button>
							// </form>
							<div>Start Disabled</div>
						)}
				</div>
			</header>

			{session?.user?.role === "ADMIN" && (
				<div className="bg-red-50 border border-red-200 p-4 rounded-md flex justify-between items-center">
					<div>
						<h3 className="font-bold text-red-800">Admin Zone</h3>
						<p className="text-sm text-red-600">
							Manage this tournament.
						</p>
					</div>
					<form action={deleteTournament.bind(null, tournament.id)}>
						<Button type="submit" variant="destructive">
							Delete Tournament
						</Button>
					</form>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle>
							Participants ({tournament.participants.length}/
							{tournament.maxPlayers})
						</CardTitle>
					</CardHeader>
					<CardContent>
						{tournament.participants.length === 0 ? (
							<p className="text-gray-500">
								No participants yet. Be the first to join!
							</p>
						) : (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{tournament.participants.map((p) => (
									<div
										key={p.id}
										className="flex items-center gap-3 p-3 border rounded-lg bg-white hover:shadow-sm transition-shadow"
									>
										<Link
											href={`/users/${p.userId}`}
											className="flex-shrink-0"
										>
											<Avatar className="h-10 w-10 border border-gray-100">
												<AvatarImage
													src={p.user.image || ""}
													alt={p.user.name || "User"}
												/>
												<AvatarFallback>
													{p.user.name?.[0]?.toUpperCase() ||
														"U"}
												</AvatarFallback>
											</Avatar>
										</Link>
										<div className="flex flex-col overflow-hidden justify-center">
											<Link
												href={`/users/${p.userId}`}
												className="font-medium text-gray-900 hover:text-blue-600 hover:underline truncate transition-colors"
											>
												{p.user.name || "Anonymous"}
											</Link>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<div>
							<span className="font-bold">Status:</span>{" "}
							{tournament.status}
						</div>
						<div>
							<span className="font-bold">Start Date:</span>{" "}
							{new Date(
								tournament.startDate
							).toLocaleDateString()}
						</div>
						<div>
							<span className="font-bold">Min Players:</span>{" "}
							{tournament.minPlayers}
						</div>
						{tournament.location && (
							<div>
								<span className="font-bold">Location:</span>{" "}
								{tournament.location}
							</div>
						)}
						{tournament.lat && tournament.lng && (
							<div className="mt-4">
								<MapViewerWrapper
									lat={tournament.lat}
									lng={tournament.lng}
									popupText={
										tournament.location || tournament.title
									}
								/>
								<div className="mt-2 text-right">
									<a
										href={`https://www.google.com/maps/search/?api=1&query=${tournament.lat},${tournament.lng}`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-xs text-blue-500 hover:underline"
									>
										Open in Google Maps
									</a>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<div className="mt-8">
				<Standings
					participants={tournament.participants}
					matches={tournament.matches}
				/>
			</div>

			<div className="mt-8">
				<h2 className="text-2xl font-bold mb-4">Matches</h2>
				{tournament.matches.length > 0 ? (
					<MatchList
						matches={tournament.matches}
						currentUserId={session?.user?.id || ""}
					/>
				) : (
					<p className="text-gray-500">
						Matches will be generated when tournament starts.
					</p>
				)}
			</div>
		</div>
	);
}
