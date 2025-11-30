"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { respondToWitnessRequest } from "@/app/actions/match";
import { useState } from "react";

import { useRouter } from "next/navigation";

interface WitnessRequestListProps {
	requests: any[]; // Type properly
}

export default function WitnessRequestList({
	requests,
}: WitnessRequestListProps) {
	const [loadingId, setLoadingId] = useState<string | null>(null);
	const router = useRouter();

	const handleRespond = async (
		requestId: string,
		tournamentId: string,
		action: "ACCEPTED" | "REJECTED"
	) => {
		setLoadingId(requestId);
		try {
			await respondToWitnessRequest(requestId, action);
			if (action === "ACCEPTED") {
				router.push(`/tournaments/${tournamentId}`);
			}
		} catch (error) {
			alert("Failed to respond");
		} finally {
			setLoadingId(null);
		}
	};

	if (requests.length === 0) return null;

	return (
		<Card className="border-blue-200 bg-blue-50">
			<CardHeader>
				<CardTitle className="text-blue-800 text-lg">
					Witness Requests ({requests.length})
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{requests.map((req) => (
					<div
						key={req.id}
						className="flex items-center justify-between bg-white p-3 rounded shadow-sm"
					>
						<div>
							<p className="font-medium text-sm">
								Match: {req.match.player1?.name || "P1"} vs{" "}
								{req.match.player2?.name || "P2"}
							</p>
							<p className="text-xs text-gray-500">
								Tournament: {req.match.tournament?.title}
							</p>
						</div>
						<div className="flex gap-2">
							<Button
								size="sm"
								variant="outline"
								onClick={() =>
									handleRespond(
										req.id,
										req.match.tournamentId,
										"REJECTED"
									)
								}
								disabled={loadingId === req.id}
								className="text-red-600 hover:text-red-700 hover:bg-red-50"
							>
								Reject
							</Button>
							<Button
								size="sm"
								onClick={() =>
									handleRespond(
										req.id,
										req.match.tournamentId,
										"ACCEPTED"
									)
								}
								disabled={loadingId === req.id}
								className="bg-blue-600 hover:bg-blue-700"
							>
								Accept Request
							</Button>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
