import { prisma } from "@/lib/prisma";
import { CONFIG_KEYS } from "@/lib/config-keys";

export { CONFIG_KEYS };

export async function getSystemConfig(key: string, defaultValue: string = "true") {
	const config = await prisma.systemConfig.findUnique({
		where: { key },
	});
	return config ? config.value : defaultValue;
}

export async function isStaminaRequired() {
	const val = await getSystemConfig(CONFIG_KEYS.REQUIRE_STAMINA_TO_JOIN, "true");
	return val === "true";
}

export async function isVerificationRequired() {
	const val = await getSystemConfig(CONFIG_KEYS.REQUIRE_MATCH_VERIFICATION, "true");
	return val === "true";
}
