"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RankingsFilter() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentLimit = searchParams.get("limit") || "10"; // Default to 10

	const handleFilterChange = (limit: string) => {
		router.push(`/rankings?limit=${limit}`);
	};

	return (
		<div className="flex justify-center gap-4 mb-6">
			<Button
				variant={currentLimit === "10" ? "default" : "outline"}
				onClick={() => handleFilterChange("10")}
				className="w-32"
			>
				Top 10
			</Button>
			<Button
				variant={currentLimit === "100" ? "default" : "outline"}
				onClick={() => handleFilterChange("100")}
				className="w-32"
			>
				Top 100
			</Button>
		</div>
	);
}
