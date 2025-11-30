"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	submitMatchResult,
	requestWitnesses,
	confirmMatchResult,
} from "@/app/actions/match";
import { useSession } from "next-auth/react";

interface MatchActionCardProps {
	match: any; // Type this properly later
}

export default function MatchActionCard({ match }: MatchActionCardProps) {
	const { data: session } = useSession();
	const [score, setScore] = useState("");
	const [winnerId, setWinnerId] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (!session) return null;

	const isPlayer =
		match.player1Id === session.user.id ||
		match.player2Id === session.user.id;
	const isReferee = match.refereeId === session.user.id;
	const isWitness = match.witnessId === session.user.id;

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			await submitMatchResult(match.id, score, winnerId);
			// Auto request witnesses after submit
			await requestWitnesses(match.id);
		} catch (error) {
			alert("Failed to submit result");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleConfirm = async () => {
		setIsSubmitting(true);
		try {
			await confirmMatchResult(match.id);
		} catch (error) {
			alert("Failed to confirm result");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Status: PENDING -> Show Submit Button (for players/referee)
	if (match.status === "PENDING" && (isPlayer || isReferee)) {
		return (
			<Dialog>
				<DialogTrigger asChild>
					<Button size="sm" variant="outline">
						Record Result
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Record Match Result</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div>
							<label className="text-sm font-medium">Score</label>
							<Input
								placeholder="e.g. 6-4, 6-3"
								value={score}
								onChange={(e) => setScore(e.target.value)}
							/>
						</div>
						<div>
							<label className="text-sm font-medium">
								Winner
							</label>
							<Select onValueChange={setWinnerId}>
								<SelectTrigger>
									<SelectValue placeholder="Select winner" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={match.player1Id}>
										{match.player1?.name || "Player 1"}
									</SelectItem>
									<SelectItem value={match.player2Id}>
										{match.player2?.name || "Player 2"}
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Button
							onClick={handleSubmit}
							disabled={!score || !winnerId || isSubmitting}
							className="w-full"
						>
							{isSubmitting
								? "Submitting..."
								: "Submit & Request Witness"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	// Status: WAITING_FOR_WITNESS
	if (match.verificationStatus === "WAITING_FOR_WITNESS") {
		if (isWitness) {
			return (
				<div className="flex flex-col gap-2">
					<p className="text-xs text-yellow-600 font-medium">
						Waiting for your confirmation
					</p>
					<div className="text-xs border p-2 rounded bg-gray-50">
						<p>Score: {match.score}</p>
						<p>Winner: {match.winner?.name}</p>
					</div>
					<Button
						size="sm"
						onClick={handleConfirm}
						disabled={isSubmitting}
					>
						{isSubmitting ? "Confirming..." : "Confirm Result"}
					</Button>
				</div>
			);
		}
		return (
			<div className="flex flex-col gap-1">
				<span className="text-xs text-yellow-600 font-medium bg-yellow-50 px-2 py-1 rounded">
					Waiting for Witness
				</span>
			</div>
		);
	}

	return null;
}
