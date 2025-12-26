import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Header } from "@/components/layout/Header"
import { formatDistanceToNow } from "date-fns"
import { Bell, MessageSquare, Users, Calendar, Award } from "lucide-react"
import Link from "next/link"

interface NotificationsPageProps {
    params: Promise<{ eventSlug: string }>
}

async function getNotifications(userId: string) {
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
    })
    return notifications
}

function getNotificationIcon(type: string) {
    switch (type) {
        case 'message':
            return <MessageSquare className="w-5 h-5" />
        case 'follow':
        case 'connection':
            return <Users className="w-5 h-5" />
        case 'event':
        case 'session':
            return <Calendar className="w-5 h-5" />
        case 'achievement':
        case 'points':
            return <Award className="w-5 h-5" />
        default:
            return <Bell className="w-5 h-5" />
    }
}

export default async function NotificationsPage({ params }: NotificationsPageProps) {
    const { eventSlug } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        notFound()
    }

    const notifications = await getNotifications(session.user.id)

    // Mark all as read
    await prisma.notification.updateMany({
        where: {
            userId: session.user.id,
            isRead: false,
        },
        data: { isRead: true },
    })

    return (
        <div className="flex flex-col min-h-screen">
            <Header eventSlug={eventSlug} title="Notifications" />

            <div className="flex-1 bg-gray-50">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <Link
                                key={notification.id}
                                href={notification.link || '#'}
                                className={`flex items-start gap-3 p-4 bg-white hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-sky-50' : ''
                                    }`}
                            >
                                <div className={`p-2 rounded-full flex-shrink-0 ${!notification.isRead
                                        ? 'bg-sky-100 text-sky-600'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {getNotificationIcon(notification.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900">{notification.title}</p>
                                    {notification.content && (
                                        <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">
                                            {notification.content}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                    </p>
                                </div>

                                {!notification.isRead && (
                                    <span className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0 mt-2" />
                                )}
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No notifications yet</p>
                        <p className="text-sm mt-2">You&apos;ll be notified about event updates and messages</p>
                    </div>
                )}
            </div>
        </div>
    )
}
