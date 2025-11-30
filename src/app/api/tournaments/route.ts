import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { deductStamina, STAMINA_CONFIG } from "@/lib/stamina"
import { Prisma } from "@prisma/client"

const createTournamentSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  minPlayers: z.number().min(4).max(32).default(8),
  maxPlayers: z.number().min(4).max(32).default(32),
  location: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = createTournamentSchema.parse(body)

    // Check stamina
    const userStamina = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stamina: true }
    })

    if (!userStamina || userStamina.stamina < STAMINA_CONFIG.TOURNAMENT_FEE) {
      return NextResponse.json({ message: "Insufficient stamina" }, { status: 400 })
    }

    // Transaction: Deduct stamina and create tournament
    const tournament = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Deduct stamina
      await tx.user.update({
        where: { id: session.user.id },
        data: { stamina: { decrement: STAMINA_CONFIG.TOURNAMENT_FEE } }
      })

      await tx.staminaLog.create({
        data: {
          userId: session.user.id,
          amount: -STAMINA_CONFIG.TOURNAMENT_FEE,
          reason: "Create Tournament Fee"
        }
      })

      // Create tournament
      const t = await tx.tournament.create({
        data: {
          title: data.title,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          minPlayers: data.minPlayers,
          maxPlayers: data.maxPlayers,
          location: data.location,
          lat: data.lat,
          lng: data.lng,
          status: "OPEN", // Directly open for now
          participants: {
            create: {
              userId: session.user.id // Creator automatically joins
            }
          }
        }
      })
      
      return t
    })

    return NextResponse.json(tournament, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: error.issues }, { status: 400 })
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
