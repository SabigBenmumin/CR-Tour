import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TournamentsPage() {
	const tournaments = await prisma.tournament.findMany({
		orderBy: { startDate: "asc" },
		include: {
			_count: {
				select: { participants: true },
			},
		},
	});

	return (
		<div className="container mx-auto p-6 space-y-6">
			<header className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Tournaments</h1>
				<Link href="/tournaments/create">
					<Button>Create Tournament</Button>
				</Link>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{tournaments.length === 0 ? (
					<p className="text-gray-500 col-span-full text-center py-10">
						No tournaments found.
					</p>
				) : (
					tournaments.map((tournament) => (
						<Link
							href={`/tournaments/${tournament.id}`}
							key={tournament.id}
						>
							<Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
								<CardHeader>
									<CardTitle>{tournament.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2 text-sm text-gray-600">
										<p>
											Status:{" "}
											<span className="font-medium">
												{tournament.status}
											</span>
										</p>
										<p>
											Date:{" "}
											{new Date(
												tournament.startDate
											).toLocaleDateString()}
										</p>
										<p>
											Players:{" "}
											{tournament._count.participants} /{" "}
											{tournament.maxPlayers}
										</p>
									</div>
								</CardContent>
							</Card>
						</Link>
					))
				)}
			</div>
		</div>
	);
}
