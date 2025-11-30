import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { revalidatePath } from "next/cache";
import ResetStaminaButton from "@/components/reset-stamina-button";
import ConfirmActionButton from "@/components/confirm-action-button";

async function addStaminaAction(formData: FormData) {
	"use server";
	const userId = formData.get("userId") as string;
	const amount = parseFloat(formData.get("amount") as string);

	if (!userId || isNaN(amount)) return;

	await prisma.$transaction([
		prisma.user.update({
			where: { id: userId },
			data: { stamina: { increment: amount } },
		}),
		prisma.staminaLog.create({
			data: {
				userId,
				amount,
				reason: "Admin Adjustment",
			},
		}),
	]);

	revalidatePath("/admin");
}

export default async function AdminPage() {
	const session = await getServerSession(authOptions);
	if (!session || session.user.role !== "ADMIN") {
		redirect("/");
	}

	const users = await prisma.user.findMany({
		orderBy: { createdAt: "desc" },
	});

	return (
		<div className="container mx-auto p-6 space-y-6">
			<h1 className="text-3xl font-bold">Admin Dashboard</h1>

			<Card>
				<CardHeader>
					<CardTitle>User Management</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full text-sm text-left">
							<thead className="text-xs text-gray-700 uppercase bg-gray-50">
								<tr>
									<th className="px-6 py-3">Name</th>
									<th className="px-6 py-3">Email</th>
									<th className="px-6 py-3">Role</th>
									<th className="px-6 py-3">Stamina</th>
									<th className="px-6 py-3">Actions</th>
								</tr>
							</thead>
							<tbody>
								{users.map((user: any) => (
									<tr
										key={user.id}
										className="bg-white border-b"
									>
										<td className="px-6 py-4">
											{user.name}
										</td>
										<td className="px-6 py-4">
											{user.email}
										</td>
										<td className="px-6 py-4">
											{user.role}
										</td>
										<td className="px-6 py-4">
											{user.stamina.toFixed(1)}
										</td>
										<td className="px-6 py-4">
											<form
												action={addStaminaAction}
												className="flex gap-2"
											>
												<input
													type="hidden"
													name="userId"
													value={user.id}
												/>
												<Input
													type="number"
													name="amount"
													placeholder="Amount"
													className="w-20 h-8"
													step="0.1"
												/>
												<Button
													type="submit"
													size="sm"
													variant="outline"
												>
													Add
												</Button>
											</form>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* MAINTENANCE ZONE */}
			<Card className="border-blue-300 bg-blue-50">
				<CardHeader className="bg-blue-100 border-b border-blue-200">
					<CardTitle className="text-blue-800 flex items-center gap-2">
						<span className="text-2xl">🛠️</span>
						Maintenance
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6">
					<div className="space-y-4">
						<div className="bg-white border-2 border-blue-200 p-4 rounded-md">
							<h3 className="font-bold text-blue-800 mb-2">
								Backfill Ranking Points
							</h3>
							<ConfirmActionButton
								title="Backfill Ranking Points"
								description={
									<div className="text-blue-800">
										<p>
											This will calculate points for
											tournaments that:
										</p>
										<ul className="list-disc list-inside ml-2 mt-1">
											<li>
												Are finished (all matches
												completed)
											</li>
											<li>Have NOT been processed yet</li>
											<li>
												Finished <strong>AFTER</strong>{" "}
												the last Rerank
											</li>
										</ul>
									</div>
								}
								confirmText="RUN BACKFILL"
								buttonText="Run Backfill"
								buttonColor="bg-blue-600 hover:bg-blue-700"
								icon={<span className="text-xl">📊</span>}
								onConfirm={async () => {
									"use server";
									const { backfillTournamentPoints } =
										await import("@/app/actions/admin");
									await backfillTournamentPoints();
								}}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* DANGER ZONE */}
			<Card className="border-red-300 bg-red-50">
				<CardHeader className="bg-red-100 border-b border-red-200">
					<CardTitle className="text-red-800 flex items-center gap-2">
						<span className="text-2xl">⚠️</span>
						Danger Zone
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-6">
					<div className="space-y-4">
						{/* RERANK SYSTEM */}
						<div className="bg-white border-2 border-red-200 p-4 rounded-md">
							<h3 className="font-bold text-red-800 mb-2">
								Rerank System (New Season)
							</h3>
							<ConfirmActionButton
								title="Rerank System"
								description={
									<div className="text-red-800">
										<p>
											<strong>WARNING:</strong> This
											action will:
										</p>
										<ul className="list-disc list-inside ml-2 mt-1">
											<li>
												Reset <strong>ALL</strong>{" "}
												users' ranking points to 0
											</li>
											<li>Start a new ranking season</li>
											<li>
												Set the cut-off date for future
												backfills
											</li>
										</ul>
										<p className="mt-2">
											Match history will remain intact.
										</p>
									</div>
								}
								confirmText="RERANK SYSTEM"
								buttonText="Rerank System"
								buttonColor="bg-red-600 hover:bg-red-700"
								icon={<span className="text-xl">🔄</span>}
								onConfirm={async () => {
									"use server";
									const { rerankSystem } = await import(
										"@/app/actions/ranking"
									);
									await rerankSystem();
								}}
							/>
						</div>

						<div className="bg-white border-2 border-red-200 p-4 rounded-md">
							<h3 className="font-bold text-red-800 mb-2">
								Reset All Users Stamina
							</h3>
							<p className="text-sm text-gray-700 mb-4">
								This will reset stamina for{" "}
								<strong>ALL users</strong> in the system to the
								default value (10.0). This action{" "}
								<strong>cannot be undone</strong>.
							</p>
							<ResetStaminaButton />
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
