import { prisma } from "@/lib/prisma"

export const STAMINA_CONFIG = {
  INITIAL: 10.0,
  MAX: 20.0,
  TOURNAMENT_FEE: 2.0,
  RESET_QUARTERS: [1, 4, 7, 10], // Months (1-indexed)
}

export async function getStamina(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stamina: true },
  })
  return user?.stamina ?? 0
}

export async function deductStamina(userId: string, amount: number, reason: string) {
  const currentStamina = await getStamina(userId)
  if (currentStamina < amount) {
    throw new Error("Insufficient stamina")
  }

  return await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { stamina: { decrement: amount } },
    }),
    prisma.staminaLog.create({
      data: {
        userId,
        amount: -amount,
        reason,
      },
    }),
  ])
}

export async function addStamina(userId: string, amount: number, reason: string) {
  const currentStamina = await getStamina(userId)
  const newStamina = Math.min(currentStamina + amount, STAMINA_CONFIG.MAX)
  const actualAdded = newStamina - currentStamina

  if (actualAdded <= 0) return

  return await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { stamina: newStamina },
    }),
    prisma.staminaLog.create({
      data: {
        userId,
        amount: actualAdded,
        reason,
      },
    }),
  ])
}

export async function resetAllStamina(adminId: string) {
  // Verify admin logic should be in the caller or middleware
  // This function just performs the reset

  // We might want to batch this if there are many users, but for now updateMany is fine
  await prisma.user.updateMany({
    data: { stamina: STAMINA_CONFIG.INITIAL },
  })

  // Log the reset? Maybe create a system log or just rely on the fact it happened.
  // Since updateMany doesn't return individual records, we can't easily log for each user in StaminaLog without a loop.
  // For now, we assume the reset is a global event.
}
