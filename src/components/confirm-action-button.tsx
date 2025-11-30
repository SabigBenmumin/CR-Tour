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

interface ConfirmActionButtonProps {
	title: string;
	description: React.ReactNode;
	confirmText: string;
	onConfirm: () => Promise<void>;
	buttonText: string;
	buttonColor?: string; // e.g., "bg-red-600 hover:bg-red-700"
	icon?: React.ReactNode;
}

export default function ConfirmActionButton({
	title,
	description,
	confirmText,
	onConfirm,
	buttonText,
	buttonColor = "bg-blue-600 hover:bg-blue-700",
	icon,
}: ConfirmActionButtonProps) {
	const [showDialog, setShowDialog] = useState(false);
	const [inputText, setInputText] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);

	const handleConfirm = async () => {
		if (inputText !== confirmText) return;

		setIsProcessing(true);
		try {
			await onConfirm();
			setShowDialog(false);
			setInputText("");
		} catch (error) {
			console.error("Action failed:", error);
			alert("Action failed. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<>
			<Button
				onClick={() => setShowDialog(true)}
				className={`w-full ${buttonColor}`}
			>
				{icon && <span className="mr-2">{icon}</span>}
				{buttonText}
			</Button>

			<AlertDialog open={showDialog} onOpenChange={setShowDialog}>
				<AlertDialogContent className="max-w-md">
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							{icon || <AlertTriangle className="h-5 w-5" />}
							{title}
						</AlertDialogTitle>
						<AlertDialogDescription className="space-y-4">
							<div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-md text-left">
								{description}
							</div>

							<div className="space-y-2 text-left">
								<p className="font-semibold text-gray-900">
									Type{" "}
									<code className="bg-gray-200 px-2 py-1 rounded text-red-600 font-bold">
										{confirmText}
									</code>{" "}
									to confirm:
								</p>
								<Input
									value={inputText}
									onChange={(e) =>
										setInputText(e.target.value)
									}
									placeholder="Type here..."
									className="border-gray-300 focus:border-blue-500"
								/>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => {
								setInputText("");
								setShowDialog(false);
							}}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirm}
							disabled={inputText !== confirmText || isProcessing}
							className={`${buttonColor} disabled:opacity-50`}
						>
							{isProcessing ? "Processing..." : "Confirm"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
