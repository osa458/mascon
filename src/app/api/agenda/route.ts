import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// Add session to my agenda
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { sessionId, eventId } = body

        if (!sessionId || !eventId) {
            return NextResponse.json(
                { error: "Session ID and Event ID are required" },
                { status: 400 }
            )
        }

        // Create the my agenda item
        const item = await prisma.myAgendaItem.create({
            data: {
                userId: session.user.id,
                sessionId,
                eventId,
            },
        })

        return NextResponse.json({ success: true, id: item.id })
    } catch (error: unknown) {
        // Handle unique constraint violation (already in agenda)
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return NextResponse.json({ success: true, message: "Already in agenda" })
        }
        console.error("Error adding to agenda:", error)
        return NextResponse.json({ error: "Failed to add to agenda" }, { status: 500 })
    }
}

// Remove session from my agenda
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get("sessionId")
        const itemId = searchParams.get("itemId")

        if (!sessionId && !itemId) {
            return NextResponse.json(
                { error: "Session ID or Item ID is required" },
                { status: 400 }
            )
        }

        if (itemId) {
            // Delete by MyAgendaItem ID (for custom items or direct item reference)
            await prisma.myAgendaItem.deleteMany({
                where: {
                    id: itemId,
                    userId: session.user.id,
                },
            })
        } else if (sessionId) {
            // Delete by sessionId (for regular session agenda items)
            await prisma.myAgendaItem.deleteMany({
                where: {
                    userId: session.user.id,
                    sessionId,
                },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error removing from agenda:", error)
        return NextResponse.json({ error: "Failed to remove from agenda" }, { status: 500 })
    }
}

