import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { STAMINA_CONFIG } from "@/lib/stamina";

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);

	// Only ADMIN can reset stamina
	if (!session || !session.user || session.user.role !== "ADMIN") {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		// Reset all users' stamina to default (10.0)
		await prisma.user.updateMany({
			data: {
				stamina: STAMINA_CONFIG.INITIAL,
			},
		});

		// Log this action
		const users = await prisma.user.findMany({ select: { id: true } });
		
		await prisma.staminaLog.createMany({
			data: users.map((user: { id: string }) => ({
				userId: user.id,
				amount: STAMINA_CONFIG.INITIAL,
				reason: `Admin Reset - All stamina reset to ${STAMINA_CONFIG.INITIAL} by ${session.user.name}`,
			})),
		});

		return NextResponse.json({
			message: "All users stamina reset successfully",
			count: users.length,
		});
	} catch (error) {
		console.error("Failed to reset stamina:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 }
		);
	}
}
