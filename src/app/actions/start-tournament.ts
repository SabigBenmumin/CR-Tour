"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function startTournament(tournamentId: string) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) throw new Error("Unauthorized")

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { participants: true }
  })

  if (!tournament) throw new Error("Tournament not found")
  
  if (tournament.participants.length < tournament.minPlayers) {
    throw new Error(`Need at least ${tournament.minPlayers} players to start`)
  }

  if (tournament.status !== "OPEN") {
    throw new Error("Tournament is not open")
  }

  // Grouping Logic
  const participants = tournament.participants
  // Shuffle participants
  const shuffled = [...participants].sort(() => Math.random() - 0.5)
  
  // Calculate number of groups (target size ~4)
  const numGroups = Math.max(1, Math.round(shuffled.length / 4))
  const groups: Record<string, string[]> = {} // groupName -> userIds
  
  // Assign to groups
  shuffled.forEach((p, index) => {
    const groupIndex = index % numGroups
    const groupName = String.fromCharCode(65 + groupIndex) // A, B, C...
    if (!groups[groupName]) groups[groupName] = []
    groups[groupName].push(p.userId)
  })

  const matchesToCreate: {
    tournamentId: string
    player1Id: string
    player2Id: string
    status: "PENDING"
    round: number
  }[] = []
  
  // Generate Round Robin matches for each group
  for (const [groupName, userIds] of Object.entries(groups)) {
    for (let i = 0; i < userIds.length; i++) {
      for (let j = i + 1; j < userIds.length; j++) {
        matchesToCreate.push({
          tournamentId: tournament.id,
          player1Id: userIds[i],
          player2Id: userIds[j],
          status: "PENDING",
          round: 1
        })
      }
    }
  }

  await prisma.$transaction(async (tx: any) => {
    // Update tournament status
    await tx.tournament.update({
      where: { id: tournament.id },
      data: { status: "IN_PROGRESS" }
    })

    // Update participants with assigned group
    for (const [groupName, userIds] of Object.entries(groups)) {
      for (const userId of userIds) {
         await tx.tournamentParticipant.update({
           where: { userId_tournamentId: { userId, tournamentId: tournament.id } },
           data: { group: groupName }
         })
      }
    }

    // Create matches
    if (matchesToCreate.length > 0) {
      await tx.match.createMany({
        data: matchesToCreate
      })
    }
  })

  revalidatePath(`/tournaments/${tournamentId}`)
}
