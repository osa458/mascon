import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { threadId, content } = body

        if (!threadId || !content) {
            return NextResponse.json(
                { error: "Thread ID and content are required" },
                { status: 400 }
            )
        }

        // Verify the thread exists and user has access
        const thread = await prisma.messageThread.findFirst({
            where: {
                id: threadId,
                OR: [
                    { creatorId: session.user.id },
                    { participantId: session.user.id },
                ],
            },
        })

        if (!thread) {
            return NextResponse.json(
                { error: "Thread not found" },
                { status: 404 }
            )
        }

        // Create the message
        const message = await prisma.message.create({
            data: {
                threadId,
                senderId: session.user.id,
                content,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        })

        // Update thread's lastMessageAt
        await prisma.messageThread.update({
            where: { id: threadId },
            data: { lastMessageAt: new Date() },
        })

        return NextResponse.json({
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            senderName: message.sender.name || "Anonymous",
            senderImage: message.sender.image,
            createdAt: message.createdAt.toISOString(),
            isRead: message.isRead,
        })
    } catch (error) {
        console.error("Error sending message:", error)
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        )
    }
}
