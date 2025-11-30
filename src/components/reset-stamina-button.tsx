"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

export default function ResetStaminaButton() {
	const [showDialog, setShowDialog] = useState(false);
	const [confirmText, setConfirmText] = useState("");
	const [isResetting, setIsResetting] = useState(false);

	const handleReset = async () => {
		if (confirmText !== "RESET ALL STAMINA") {
			return;
		}

		setIsResetting(true);
		try {
			const response = await fetch("/api/admin/reset-stamina", {
				method: "POST",
			});

			if (response.ok) {
				window.location.reload();
			} else {
				alert("Failed to reset stamina");
			}
		} catch (error) {
			alert("Error resetting stamina");
		} finally {
			setIsResetting(false);
			setShowDialog(false);
			setConfirmText("");
		}
	};

	return (
		<>
			<Button
				onClick={() => setShowDialog(true)}
				variant="destructive"
				className="w-full bg-red-600 hover:bg-red-700"
			>
				<AlertTriangle className="mr-2 h-4 w-4" />
				Reset All Users Stamina
			</Button>

			<AlertDialog open={showDialog} onOpenChange={setShowDialog}>
				<AlertDialogContent className="max-w-md">
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 text-red-600">
							<AlertTriangle className="h-5 w-5" />
							⚠️ DANGER ZONE ⚠️
						</AlertDialogTitle>
						<AlertDialogDescription className="space-y-4">
							<div className="bg-red-50 border-2 border-red-200 p-4 rounded-md">
								<p className="font-bold text-red-800 mb-2">
									This action will:
								</p>
								<ul className="list-disc list-inside text-red-700 space-y-1">
									<li>Reset ALL users' stamina to 10.0</li>
									<li>Affect EVERY user in the system</li>
									<li>Cannot be undone</li>
								</ul>
							</div>

							<div className="space-y-2">
								<p className="font-semibold text-gray-900">
									Type{" "}
									<code className="bg-gray-200 px-2 py-1 rounded text-red-600 font-bold">
										RESET ALL STAMINA
									</code>{" "}
									to confirm:
								</p>
								<Input
									value={confirmText}
									onChange={(e) =>
										setConfirmText(e.target.value)
									}
									placeholder="Type here..."
									className="border-red-300 focus:border-red-500"
								/>
							</div>

							<p className="text-xs text-gray-500">
								This is a destructive action. Please be certain.
							</p>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => {
								setConfirmText("");
								setShowDialog(false);
							}}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleReset}
							disabled={
								confirmText !== "RESET ALL STAMINA" ||
								isResetting
							}
							className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
						>
							{isResetting
								? "Resetting..."
								: "Yes, Reset All Stamina"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
