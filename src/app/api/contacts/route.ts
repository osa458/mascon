import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// Save a contact (from QR scan)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { contactUserId, eventId, note } = body

        if (!contactUserId) {
            return NextResponse.json(
                { error: "Contact user ID is required" },
                { status: 400 }
            )
        }

        // Check if contact already exists
        const existingContact = await prisma.contactExchange.findFirst({
            where: {
                giverId: session.user.id,
                receiverId: contactUserId,
            },
        })

        if (existingContact) {
            return NextResponse.json({
                success: true,
                message: "Contact already saved",
                id: existingContact.id,
            })
        }

        // Create contact exchange record
        const contact = await prisma.contactExchange.create({
            data: {
                giverId: session.user.id,
                receiverId: contactUserId,
                eventId: eventId || "default",
                note: note || null,
            },
        })

        return NextResponse.json({ success: true, id: contact.id })
    } catch (error) {
        console.error("Error saving contact:", error)
        return NextResponse.json({ error: "Failed to save contact" }, { status: 500 })
    }
}

// Get user's saved contacts
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const contacts = await prisma.contactExchange.findMany({
            where: { giverId: session.user.id },
            include: {
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        title: true,
                        company: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json(contacts.map(c => ({
            id: c.id,
            note: c.note,
            createdAt: c.createdAt,
            user: c.receiver,
        })))
    } catch (error) {
        console.error("Error fetching contacts:", error)
        return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
    }
}
