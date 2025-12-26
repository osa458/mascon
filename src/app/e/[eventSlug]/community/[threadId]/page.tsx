import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Pin, MessageSquare } from "lucide-react"

interface ThreadPageProps {
    params: Promise<{ eventSlug: string; threadId: string }>
}

async function getThreadData(threadId: string) {
    const thread = await prisma.topicThread.findUnique({
        where: { id: threadId },
        include: {
            category: true,
            posts: {
                orderBy: { createdAt: 'asc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            company: true,
                        },
                    },
                    comments: {
                        orderBy: { createdAt: 'asc' },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    return thread
}

export default async function ThreadPage({ params }: ThreadPageProps) {
    const { eventSlug, threadId } = await params
    const thread = await getThreadData(threadId)

    if (!thread) {
        notFound()
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header eventSlug={eventSlug} title={thread.category.name} />

            <div className="flex-1 p-4 space-y-4">
                {/* Thread Header */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                        {thread.isPinned && (
                            <Pin className="w-4 h-4 text-sky-500 flex-shrink-0 mt-1" />
                        )}
                        <h1 className="text-lg font-semibold text-gray-900">{thread.title}</h1>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <MessageSquare className="w-4 h-4" />
                        <span>{thread.postsCount} post{thread.postsCount !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* Posts */}
                <div className="space-y-4">
                    {thread.posts.map((post) => (
                        <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage src={post.user.image || undefined} />
                                    <AvatarFallback className="bg-sky-100 text-sky-600">
                                        {post.user.name?.charAt(0) || "?"}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">
                                            {post.user.name || "Anonymous"}
                                        </span>
                                        {post.user.company && (
                                            <span className="text-sm text-gray-500">{post.user.company}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {format(new Date(post.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 text-gray-700 whitespace-pre-wrap">
                                {post.content}
                            </div>

                            {post.imageUrl && (
                                <img
                                    src={post.imageUrl}
                                    alt="Post attachment"
                                    className="mt-3 rounded-lg max-h-64 object-cover"
                                />
                            )}

                            {/* Comments */}
                            {post.comments.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                    {post.comments.map((comment) => (
                                        <div key={comment.id} className="flex items-start gap-2 pl-4 border-l-2 border-gray-100">
                                            <Avatar className="h-6 w-6 flex-shrink-0">
                                                <AvatarImage src={comment.user.image || undefined} />
                                                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                                    {comment.user.name?.charAt(0) || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <span className="text-sm font-medium">{comment.user.name}</span>
                                                <p className="text-sm text-gray-600">{comment.content}</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {format(new Date(comment.createdAt), "MMM d 'at' h:mm a")}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {thread.posts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No posts yet. Be the first to contribute!
                    </div>
                )}
            </div>
        </div>
    )
}
