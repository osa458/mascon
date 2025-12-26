import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import CommunityClient from "@/components/community/CommunityClient"

interface CommunityPageProps {
  params: Promise<{ eventSlug: string }>
}

async function getCommunityData(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      topicCategories: {
        orderBy: { order: 'asc' },
        include: {
          topics: {
            orderBy: { createdAt: 'desc' },
            include: {
              posts: {
                take: 1,
                orderBy: { createdAt: 'desc' },
                include: {
                  user: {
                    select: {
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  return event
}

export default async function CommunityPage({ params }: CommunityPageProps) {
  const { eventSlug } = await params
  const event = await getCommunityData(eventSlug)
  
  if (!event) {
    notFound()
  }

  type CategoryType = typeof event.topicCategories[number]
  type ThreadType = CategoryType['topics'][number]

  const categories = event.topicCategories.map((cat: CategoryType) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    threadCount: cat.topics.length,
    hasNew: cat.topics.some((t: ThreadType) => {
      const lastPost = t.posts[0]
      if (!lastPost) return false
      const dayAgo = new Date()
      dayAgo.setDate(dayAgo.getDate() - 1)
      return new Date(lastPost.createdAt) > dayAgo
    }),
  }))

  const threads = event.topicCategories.flatMap((cat: CategoryType) =>
    cat.topics.map((t: ThreadType) => ({
      id: t.id,
      categoryId: cat.id,
      title: t.title,
      isPinned: t.isPinned,
      postsCount: t.postsCount,
      lastPostAt: t.lastPostAt?.toISOString() || null,
      lastPostUser: t.posts[0]?.user ? {
        name: t.posts[0].user.name || "Anonymous",
        image: t.posts[0].user.image,
      } : undefined,
      hasNew: false, // TODO: Track per user
    }))
  )

  // TODO: Get followed thread IDs from database
  const followedThreadIds: string[] = []

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        eventSlug={eventSlug}
        title="Community"
      />
      <CommunityClient
        eventSlug={eventSlug}
        categories={categories}
        threads={threads}
        followedThreadIds={followedThreadIds}
      />
    </div>
  )
}
