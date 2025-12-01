"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getSystemConfig } from "@/lib/system-config";

export async function setSystemConfig(key: string, value: string) {
	const session = await getServerSession(authOptions);
	if (!session || !session.user || session.user.role !== "ADMIN") {
		throw new Error("Unauthorized");
	}

	await prisma.systemConfig.upsert({
		where: { key },
		update: { value },
		create: { key, value },
	});

	revalidatePath("/admin");
}

export async function toggleSystemConfig(key: string) {
	const session = await getServerSession(authOptions);
	if (!session || !session.user || session.user.role !== "ADMIN") {
		throw new Error("Unauthorized");
	}

	const currentValue = await getSystemConfig(key, "true"); // Default to true if not set
	const newValue = currentValue === "true" ? "false" : "true";

	await prisma.systemConfig.upsert({
		where: { key },
		update: { value: newValue },
		create: { key, value: newValue },
	});

	revalidatePath("/admin");
	return newValue;
}

