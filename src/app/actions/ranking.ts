"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function rerankSystem() {
	const session = await getServerSession(authOptions);
	if (!session || session.user.role !== "ADMIN") {
		throw new Error("Unauthorized");
	}

	try {
		// 1. Reset all users' totalPoints to 0
		await prisma.user.updateMany({
			data: {
				totalPoints: 0,
			},
		});

		// 2. Update lastRerankAt timestamp
		// Upsert: create if not exists, update if exists
		await prisma.systemConfig.upsert({
			where: { key: "lastRerankAt" },
			update: { value: new Date().toISOString() },
			create: {
				key: "lastRerankAt",
				value: new Date().toISOString(),
			},
		});

		revalidatePath("/admin");
		revalidatePath("/dashboard");
		return { success: true };
	} catch (error) {
		console.error("Rerank failed:", error);
		throw new Error("Failed to rerank system");
	}
}
