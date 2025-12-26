import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Header } from "@/components/layout/Header"
import MessagesClient from "@/components/messages/MessagesClient"

interface MessagesPageProps {
  params: Promise<{ eventSlug: string }>
}

async function getMessagesData(slug: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
  })
  
  if (!event) return null

  // Get all threads where user is creator or participant
  const threads = await prisma.messageThread.findMany({
    where: {
      OR: [
        { creatorId: userId },
        { participantId: userId },
      ],
    },
    include: {
      creator: {
        select: { id: true, name: true, image: true },
      },
      participant: {
        select: { id: true, name: true, image: true },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  type ThreadType = typeof threads[number]
  
  // Get unread counts
  const unreadCounts = await prisma.message.groupBy({
    by: ['threadId'],
    where: {
      threadId: { in: threads.map((t: ThreadType) => t.id) },
      senderId: { not: userId },
      isRead: false,
    },
    _count: true,
  })

  const unreadMap = new Map(unreadCounts.map((u: { threadId: string; _count: number }) => [u.threadId, u._count]))

  return {
    event,
    threads: threads.map((t: ThreadType) => {
      const otherUser = t.creatorId === userId ? t.participant : t.creator
      const lastMessage = t.messages[0]
      
      return {
        id: t.id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name || "Anonymous",
          image: otherUser.image,
        },
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt.toISOString(),
          isFromMe: lastMessage.senderId === userId,
        } : undefined,
        unreadCount: unreadMap.get(t.id) || 0,
        isSystem: t.isSystemThread,
        systemType: t.systemType ?? undefined,
      }
    }),
  }
}

export default async function MessagesPage({ params }: MessagesPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const { eventSlug } = await params
  const data = await getMessagesData(eventSlug, session.user.id)
  
  if (!data) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        eventSlug={eventSlug}
        title="Messages"
      />
      <MessagesClient
        eventSlug={eventSlug}
        threads={data.threads}
        currentUserId={session.user.id}
      />
    </div>
  )
}
