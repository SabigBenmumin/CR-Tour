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
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DeleteAccountButton() {
	const [confirmText, setConfirmText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleDelete = async () => {
		if (confirmText !== "DELETE") {
			return;
		}

		setIsDeleting(true);
		try {
			const response = await fetch("/api/user/delete", {
				method: "DELETE",
			});

			if (response.ok) {
				// Sign out and redirect to home
				await signOut({ callbackUrl: "/" });
			} else {
				alert("Failed to delete account");
				setIsDeleting(false);
			}
		} catch (error) {
			alert("Error deleting account");
			setIsDeleting(false);
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" className="w-full">
					<Trash2 className="mr-2 h-4 w-4" />
					Delete Account
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle className="text-red-600">
						⚠️ Delete Account
					</AlertDialogTitle>
					<AlertDialogDescription className="space-y-4">
						<div className="bg-red-50 border-2 border-red-200 p-4 rounded-md">
							<p className="font-bold text-red-800 mb-2">
								This action will permanently delete:
							</p>
							<ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
								<li>Your account and profile</li>
								<li>All tournament participations</li>
								<li>Match history</li>
								<li>Stamina logs</li>
							</ul>
							<p className="mt-2 font-bold text-red-800">
								This cannot be undone!
							</p>
						</div>

						<div className="space-y-2">
							<p className="font-semibold text-gray-900">
								Type{" "}
								<code className="bg-gray-200 px-2 py-1 rounded text-red-600 font-bold">
									DELETE
								</code>{" "}
								to confirm:
							</p>
							<Input
								value={confirmText}
								onChange={(e) => setConfirmText(e.target.value)}
								placeholder="Type DELETE here..."
								className="border-red-300 focus:border-red-500"
							/>
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => setConfirmText("")}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						disabled={confirmText !== "DELETE" || isDeleting}
						className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
					>
						{isDeleting ? "Deleting..." : "Yes, Delete My Account"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
