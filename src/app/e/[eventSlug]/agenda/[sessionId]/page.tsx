import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Header } from "@/components/layout/Header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Clock, MapPin, Users, Tag, Calendar, Star, Trash2 } from "lucide-react"
import Link from "next/link"

interface SessionDetailPageProps {
    params: Promise<{ eventSlug: string; sessionId: string }>
}

async function getSessionOrCustomItem(sessionId: string, userId?: string) {
    // First try to find an EventSession
    const eventSession = await prisma.eventSession.findUnique({
        where: { id: sessionId },
        include: {
            room: true,
            speakers: {
                include: {
                    speaker: true,
                },
                orderBy: { order: 'asc' },
            },
        },
    })

    if (eventSession) {
        return { type: 'session' as const, data: eventSession }
    }

    // If not found, try to find a custom MyAgendaItem
    if (userId) {
        const customItem = await prisma.myAgendaItem.findFirst({
            where: {
                id: sessionId,
                userId,
                isCustom: true,
            },
        })

        if (customItem) {
            return { type: 'custom' as const, data: customItem }
        }
    }

    return null
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
    const { eventSlug, sessionId } = await params
    const session = await getServerSession(authOptions)
    const result = await getSessionOrCustomItem(sessionId, session?.user?.id)

    if (!result) {
        notFound()
    }

    if (result.type === 'custom') {
        // Render custom activity
        const item = result.data
        const duration = item.customStartTime && item.customEndTime
            ? Math.round((new Date(item.customEndTime).getTime() - new Date(item.customStartTime).getTime()) / 60000)
            : 0

        return (
            <div className="flex flex-col min-h-screen">
                <Header eventSlug={eventSlug} title="My Activity" />

                <div className="flex-1 bg-gray-50">
                    <div className="bg-white p-4 border-b">
                        <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full mb-2">
                            <Star className="w-3 h-3 inline mr-1" />
                            Custom Activity
                        </span>
                        <h1 className="text-xl font-bold text-gray-900">{item.customTitle}</h1>

                        <div className="mt-4 space-y-2">
                            {item.customStartTime && (
                                <>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>{format(new Date(item.customStartTime), "EEEE, MMMM d, yyyy")}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>
                                            {format(new Date(item.customStartTime), "h:mm a")}
                                            {item.customEndTime && ` - ${format(new Date(item.customEndTime), "h:mm a")}`}
                                            {duration > 0 && <span className="text-gray-400 ml-1">({duration} min)</span>}
                                        </span>
                                    </div>
                                </>
                            )}

                            {item.customLocation && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span>{item.customLocation}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4">
                        <p className="text-sm text-gray-500 mb-4">
                            This is a personal activity you added to your agenda.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Render regular session
    const eventSession = result.data
    const duration = Math.round(
        (new Date(eventSession.endTime).getTime() - new Date(eventSession.startTime).getTime()) / 60000
    )

    return (
        <div className="flex flex-col min-h-screen">
            <Header eventSlug={eventSlug} title="Session Details" />

            <div className="flex-1 bg-gray-50">
                {/* Session Header */}
                <div className="bg-white p-4 border-b">
                    {eventSession.sessionType && (
                        <span className="inline-block px-2 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded-full mb-2">
                            {eventSession.sessionType}
                        </span>
                    )}
                    <h1 className="text-xl font-bold text-gray-900">{eventSession.title}</h1>

                    <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{format(new Date(eventSession.startTime), "EEEE, MMMM d, yyyy")}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>
                                {format(new Date(eventSession.startTime), "h:mm a")} - {format(new Date(eventSession.endTime), "h:mm a")}
                                <span className="text-gray-400 ml-1">({duration} min)</span>
                            </span>
                        </div>

                        {eventSession.room && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{eventSession.room.name}{eventSession.room.floor ? `, ${eventSession.room.floor}` : ''}</span>
                            </div>
                        )}

                        {eventSession.capacity && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>Capacity: {eventSession.capacity}</span>
                            </div>
                        )}

                        {eventSession.track && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Tag className="w-4 h-4 text-gray-400" />
                                <span>{eventSession.track}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                {eventSession.description && (
                    <div className="bg-white p-4 mt-2">
                        <h2 className="font-semibold text-gray-900 mb-2">About this session</h2>
                        <p className="text-gray-600 whitespace-pre-wrap">{eventSession.description}</p>
                    </div>
                )}

                {/* Speakers */}
                {eventSession.speakers.length > 0 && (
                    <div className="bg-white p-4 mt-2">
                        <h2 className="font-semibold text-gray-900 mb-3">
                            Speaker{eventSession.speakers.length > 1 ? 's' : ''}
                        </h2>
                        <div className="space-y-4">
                            {eventSession.speakers.map(({ speaker }) => (
                                <div key={speaker.id} className="flex items-start gap-3">
                                    <Avatar className="h-12 w-12 flex-shrink-0">
                                        <AvatarImage src={speaker.imageUrl || undefined} />
                                        <AvatarFallback className="bg-sky-100 text-sky-600">
                                            {speaker.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900">{speaker.name}</p>
                                        {(speaker.title || speaker.company) && (
                                            <p className="text-sm text-gray-500">
                                                {speaker.title}{speaker.title && speaker.company ? ' at ' : ''}{speaker.company}
                                            </p>
                                        )}
                                        {speaker.bio && (
                                            <p className="text-sm text-gray-600 mt-2 line-clamp-3">{speaker.bio}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

