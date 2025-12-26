import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Header } from "@/components/layout/Header"
import MessageThreadClient from "@/components/messages/MessageThreadClient"

interface MessageThreadPageProps {
    params: Promise<{ eventSlug: string; threadId: string }>
}

async function getThreadData(threadId: string, userId: string) {
    const thread = await prisma.messageThread.findFirst({
        where: {
            id: threadId,
            OR: [
                { creatorId: userId },
                { participantId: userId },
            ],
        },
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    company: true,
                },
            },
            participant: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    company: true,
                },
            },
            messages: {
                orderBy: { createdAt: 'asc' },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            },
        },
    })
    return thread
}

export default async function MessageThreadPage({ params }: MessageThreadPageProps) {
    const { eventSlug, threadId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        notFound()
    }

    const thread = await getThreadData(threadId, session.user.id)

    if (!thread) {
        notFound()
    }

    // Determine the other participant
    const otherUser = thread.creatorId === session.user.id
        ? thread.participant
        : thread.creator

    // Mark messages as read
    await prisma.message.updateMany({
        where: {
            threadId: thread.id,
            senderId: { not: session.user.id },
            isRead: false,
        },
        data: { isRead: true },
    })

    return (
        <div className="flex flex-col min-h-screen">
            <Header eventSlug={eventSlug} title={otherUser.name || "Messages"} />
            <MessageThreadClient
                threadId={thread.id}
                currentUserId={session.user.id}
                otherUser={otherUser}
                initialMessages={thread.messages.map(m => ({
                    id: m.id,
                    content: m.content,
                    senderId: m.senderId,
                    senderName: m.sender.name || "Anonymous",
                    senderImage: m.sender.image,
                    createdAt: m.createdAt.toISOString(),
                    isRead: m.isRead,
                }))}
            />
        </div>
    )
}
