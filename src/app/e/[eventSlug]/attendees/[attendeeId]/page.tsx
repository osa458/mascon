import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageSquare, Linkedin, Globe, Mail, Phone, Building2, Briefcase } from "lucide-react"

interface AttendeeProfilePageProps {
    params: Promise<{ eventSlug: string; attendeeId: string }>
}

async function getAttendeeData(attendeeId: string) {
    const user = await prisma.user.findUnique({
        where: { id: attendeeId },
        select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            title: true,
            company: true,
            email: true,
            phone: true,
            linkedin: true,
            twitter: true,
            website: true,
            shareEmail: true,
            sharePhone: true,
        },
    })
    return user
}

export default async function AttendeeProfilePage({ params }: AttendeeProfilePageProps) {
    const { eventSlug, attendeeId } = await params
    const attendee = await getAttendeeData(attendeeId)

    if (!attendee) {
        notFound()
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header eventSlug={eventSlug} title="Profile" />

            <div className="flex-1 bg-gray-50">
                {/* Profile Header */}
                <div className="bg-white p-6 text-center border-b">
                    <Avatar className="h-24 w-24 mx-auto">
                        <AvatarImage src={attendee.image || undefined} />
                        <AvatarFallback className="bg-sky-100 text-sky-600 text-2xl">
                            {attendee.name?.charAt(0) || "?"}
                        </AvatarFallback>
                    </Avatar>

                    <h1 className="text-xl font-bold text-gray-900 mt-4">
                        {attendee.name || "Anonymous"}
                    </h1>

                    {(attendee.title || attendee.company) && (
                        <p className="text-gray-500 mt-1">
                            {attendee.title}{attendee.title && attendee.company ? ' at ' : ''}{attendee.company}
                        </p>
                    )}

                    {/* Message Button */}
                    <Button className="mt-4 bg-sky-500 hover:bg-sky-600" asChild>
                        <Link href={`/e/${eventSlug}/messages?to=${attendee.id}`}>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Send Message
                        </Link>
                    </Button>
                </div>

                {/* Bio */}
                {attendee.bio && (
                    <div className="bg-white p-4 mt-2">
                        <h2 className="font-semibold text-gray-900 mb-2">About</h2>
                        <p className="text-gray-600 whitespace-pre-wrap">{attendee.bio}</p>
                    </div>
                )}

                {/* Contact Info */}
                <div className="bg-white p-4 mt-2">
                    <h2 className="font-semibold text-gray-900 mb-3">Contact</h2>
                    <div className="space-y-3">
                        {attendee.company && (
                            <div className="flex items-center gap-3 text-gray-600">
                                <Building2 className="w-5 h-5 text-gray-400" />
                                <span>{attendee.company}</span>
                            </div>
                        )}

                        {attendee.title && (
                            <div className="flex items-center gap-3 text-gray-600">
                                <Briefcase className="w-5 h-5 text-gray-400" />
                                <span>{attendee.title}</span>
                            </div>
                        )}

                        {attendee.shareEmail && attendee.email && (
                            <a
                                href={`mailto:${attendee.email}`}
                                className="flex items-center gap-3 text-sky-600 hover:text-sky-700"
                            >
                                <Mail className="w-5 h-5" />
                                <span>{attendee.email}</span>
                            </a>
                        )}

                        {attendee.sharePhone && attendee.phone && (
                            <a
                                href={`tel:${attendee.phone}`}
                                className="flex items-center gap-3 text-sky-600 hover:text-sky-700"
                            >
                                <Phone className="w-5 h-5" />
                                <span>{attendee.phone}</span>
                            </a>
                        )}

                        {attendee.linkedin && (
                            <a
                                href={attendee.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-sky-600 hover:text-sky-700"
                            >
                                <Linkedin className="w-5 h-5" />
                                <span>LinkedIn Profile</span>
                            </a>
                        )}

                        {attendee.website && (
                            <a
                                href={attendee.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-sky-600 hover:text-sky-700"
                            >
                                <Globe className="w-5 h-5" />
                                <span>Website</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
