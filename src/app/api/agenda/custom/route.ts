import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// Create custom agenda item
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { title, location, startTime, endTime, eventSlug } = body

        if (!title || !startTime || !endTime || !eventSlug) {
            return NextResponse.json(
                { error: "Title, start time, end time, and event are required" },
                { status: 400 }
            )
        }

        // Get the event ID
        const event = await prisma.event.findUnique({
            where: { slug: eventSlug },
            select: { id: true },
        })

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 })
        }

        // Create custom agenda item
        const item = await prisma.myAgendaItem.create({
            data: {
                userId: session.user.id,
                eventId: event.id,
                isCustom: true,
                customTitle: title,
                customStartTime: new Date(startTime),
                customEndTime: new Date(endTime),
                customLocation: location || null,
            },
        })

        return NextResponse.json({ success: true, id: item.id })
    } catch (error) {
        console.error("Error creating custom agenda item:", error)
        return NextResponse.json({ error: "Failed to create activity" }, { status: 500 })
    }
}
