"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { STAMINA_CONFIG } from "@/lib/stamina"
import { revalidatePath } from "next/cache"
import { isStaminaRequired } from "@/lib/system-config"

export async function joinTournament(tournamentId: string) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  const userId = session.user.id

  // Transaction: Check stamina, deduct, and join
  try {
    await prisma.$transaction(async (tx: any) => {
      const requireStamina = await isStaminaRequired()

      const user = await tx.user.findUnique({ where: { id: userId } })
      if (!user || (requireStamina && user.stamina < STAMINA_CONFIG.TOURNAMENT_FEE)) {
        throw new Error("Insufficient stamina")
      }

      const tournament = await tx.tournament.findUnique({ where: { id: tournamentId } })
      if (!tournament || tournament.status !== "OPEN") {
        throw new Error("Tournament not open")
      }

      // Check if already joined
      const existing = await tx.tournamentParticipant.findUnique({
        where: {
          userId_tournamentId: {
            userId,
            tournamentId
          }
        }
      })
      if (existing) {
        throw new Error("Already registered")
      }

      // Deduct stamina if required
      if (requireStamina) {
        await tx.user.update({
          where: { id: userId },
          data: { stamina: { decrement: STAMINA_CONFIG.TOURNAMENT_FEE } }
        })

        await tx.staminaLog.create({
          data: {
            userId,
            amount: -STAMINA_CONFIG.TOURNAMENT_FEE,
            reason: `Join Tournament ${tournament.title}`
          }
        })
      }

      // Join
      await tx.tournamentParticipant.create({
        data: {
          userId,
          tournamentId
        }
      })
    })

    revalidatePath(`/tournaments/${tournamentId}`)
    revalidatePath(`/dashboard`)
  } catch (error) {
    console.error("Failed to join tournament:", error)
    // In a real app, we'd return a result object to handle errors in UI
  }
}

export async function withdrawFromTournament(tournamentId: string) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  const userId = session.user.id

  try {
    await prisma.$transaction(async (tx: any) => {
      const tournament = await tx.tournament.findUnique({ where: { id: tournamentId } })
      if (!tournament) throw new Error("Tournament not found")
      
      if (tournament.status !== "OPEN") {
        throw new Error("Cannot withdraw from a closed or started tournament")
      }

      // Check if registered
      const participant = await tx.tournamentParticipant.findUnique({
        where: {
          userId_tournamentId: {
            userId,
            tournamentId
          }
        }
      })

      if (!participant) {
        throw new Error("Not registered")
      }

      // Remove participant
      await tx.tournamentParticipant.delete({
        where: {
          userId_tournamentId: {
            userId,
            tournamentId
          }
        }
      })

      // Refund stamina
      await tx.user.update({
        where: { id: userId },
        data: { stamina: { increment: STAMINA_CONFIG.TOURNAMENT_FEE } }
      })

      await tx.staminaLog.create({
        data: {
          userId,
          amount: STAMINA_CONFIG.TOURNAMENT_FEE,
          reason: `Withdraw from ${tournament.title}`
        }
      })
    })

    revalidatePath(`/tournaments/${tournamentId}`)
    revalidatePath(`/dashboard`)
  } catch (error) {
    console.error("Failed to withdraw:", error)
    throw error
  }
}

export async function deleteTournament(tournamentId: string) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  try {
    // Delete all related data in a transaction
    await prisma.$transaction(async (tx: any) => {
      // Delete all matches first
      await tx.match.deleteMany({
        where: { tournamentId }
      })

      // Delete all participants
      await tx.tournamentParticipant.deleteMany({
        where: { tournamentId }
      })

      // Finally delete the tournament
      await tx.tournament.delete({
        where: { id: tournamentId }
      })
    })

    revalidatePath("/dashboard")
    revalidatePath("/tournaments")
  } catch (error) {
    console.error("Failed to delete tournament:", error)
    throw error
  }
}
