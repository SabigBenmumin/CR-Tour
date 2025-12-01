import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
	const session = await getServerSession(authOptions);

	if (!session || !session.user) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;

	try {
		// Delete all user data in a transaction
		await prisma.$transaction(async (tx: any) => {
			// Delete stamina logs
			await tx.staminaLog.deleteMany({
				where: { userId }
			});

			// Delete tournament participations
			await tx.tournamentParticipant.deleteMany({
				where: { userId }
			});

			// Delete matches where user is involved
			await tx.match.deleteMany({
				where: {
					OR: [
						{ player1Id: userId },
						{ player2Id: userId },
						{ witnessId: userId },
						{ refereeId: userId },
						{ winnerId: userId }
					]
				}
			});

			// Finally delete the user
			await tx.user.delete({
				where: { id: userId }
			});
		});

		return NextResponse.json({
			message: "Account deleted successfully"
		});
	} catch (error) {
		console.error("Failed to delete account:", error);
		return NextResponse.json(
			{ message: "Failed to delete account" },
			{ status: 500 }
		);
	}
}
