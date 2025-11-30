import Leaderboard from "@/components/leaderboard";
import RankingsFilter from "@/components/rankings-filter";

interface RankingsPageProps {
	searchParams: Promise<{
		limit?: string;
	}>;
}

export default async function RankingsPage({
	searchParams,
}: RankingsPageProps) {
	const resolvedSearchParams = await searchParams;
	const limit = resolvedSearchParams.limit
		? parseInt(resolvedSearchParams.limit)
		: 10;

	return (
		<div className="container mx-auto py-12 px-4 md:px-6">
			<div className="flex flex-col items-center space-y-4 text-center mb-8">
				<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
					Global Rankings
				</h1>
				<p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
					See who's dominating the court. Compete in tournaments to
					climb the ladder!
				</p>
			</div>

			<RankingsFilter />

			<div className="max-w-3xl mx-auto">
				<Leaderboard limit={limit} />
			</div>
		</div>
	);
}
