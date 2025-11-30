import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import Link from "next/link";

interface LeaderboardProps {
	limit?: number;
}

export default async function Leaderboard({ limit }: LeaderboardProps) {
	const users = await prisma.user.findMany({
		orderBy: { totalPoints: "desc" },
		take: limit,
		where: {
			totalPoints: { gt: 0 }, // Only show users with points
		},
	});

	if (users.length === 0) {
		return (
			<div className="text-center py-8 text-gray-500">
				No ranked players yet. Join a tournament to earn points!
			</div>
		);
	}

	return (
		<div className="w-full overflow-hidden rounded-lg border bg-white shadow-sm">
			<table className="w-full text-sm text-left">
				<thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
					<tr>
						<th className="px-6 py-3 w-16 text-center">Rank</th>
						<th className="px-6 py-3">Player</th>
						<th className="px-6 py-3 text-right">Points</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-100">
					{users.map((user, index) => {
						const rank = index + 1;
						let rankIcon = null;
						let rankClass = "text-gray-600 font-medium";

						if (rank === 1) {
							rankIcon = (
								<Trophy className="h-5 w-5 text-yellow-500" />
							);
							rankClass = "text-yellow-600 font-bold";
						} else if (rank === 2) {
							rankIcon = (
								<Trophy className="h-4 w-4 text-gray-400" />
							);
							rankClass = "text-gray-600 font-bold";
						} else if (rank === 3) {
							rankIcon = (
								<Trophy className="h-4 w-4 text-amber-600" />
							);
							rankClass = "text-amber-700 font-bold";
						}

						return (
							<tr
								key={user.id}
								className="bg-white hover:bg-gray-50 transition-colors"
							>
								<td className="px-6 py-4 text-center">
									<div className="flex justify-center items-center gap-1">
										{rankIcon}
										<span className={rankClass}>
											{rank}
										</span>
									</div>
								</td>
								<td className="px-6 py-4">
									<Link
										href={`/users/${user.id}`}
										className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
									>
										<Avatar className="h-8 w-8">
											<AvatarImage
												src={user.image || ""}
												alt={user.name || "User"}
											/>
											<AvatarFallback>
												{user.name?.[0]?.toUpperCase() ||
													"U"}
											</AvatarFallback>
										</Avatar>
										<span className="font-medium text-gray-900 group-hover:underline group-hover:text-blue-600 transition-colors">
											{user.name || "Anonymous"}
										</span>
									</Link>
								</td>
								<td className="px-6 py-4 text-right font-mono font-medium text-blue-600">
									{user.totalPoints.toLocaleString()}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
