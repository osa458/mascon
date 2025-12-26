import prisma from "@/lib/db"
import Link from "next/link"
import { 
  Calendar, 
  Users, 
  Building2, 
  Heart, 
  Megaphone, 
  BarChart3,
  Mic2,
  ArrowRight
} from "lucide-react"

async function getDashboardStats() {
  const [
    usersCount,
    sessionsCount,
    speakersCount,
    sponsorsCount,
    exhibitorsCount,
    announcementsCount,
    pollsCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.eventSession.count(),
    prisma.speaker.count(),
    prisma.sponsor.count(),
    prisma.exhibitor.count(),
    prisma.announcement.count(),
    prisma.poll.count(),
  ])

  return {
    users: usersCount,
    sessions: sessionsCount,
    speakers: speakersCount,
    sponsors: sponsorsCount,
    exhibitors: exhibitorsCount,
    announcements: announcementsCount,
    polls: pollsCount,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const cards = [
    { 
      label: "Sessions", 
      count: stats.sessions, 
      icon: Calendar, 
      href: "/admin/sessions",
      color: "bg-blue-500" 
    },
    { 
      label: "Speakers", 
      count: stats.speakers, 
      icon: Mic2, 
      href: "/admin/speakers",
      color: "bg-purple-500" 
    },
    { 
      label: "Sponsors", 
      count: stats.sponsors, 
      icon: Heart, 
      href: "/admin/sponsors",
      color: "bg-pink-500" 
    },
    { 
      label: "Exhibitors", 
      count: stats.exhibitors, 
      icon: Building2, 
      href: "/admin/exhibitors",
      color: "bg-orange-500" 
    },
    { 
      label: "Announcements", 
      count: stats.announcements, 
      icon: Megaphone, 
      href: "/admin/announcements",
      color: "bg-green-500" 
    },
    { 
      label: "Polls", 
      count: stats.polls, 
      icon: BarChart3, 
      href: "/admin/polls",
      color: "bg-cyan-500" 
    },
    { 
      label: "Users", 
      count: stats.users, 
      icon: Users, 
      href: "/admin/users",
      color: "bg-gray-500" 
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">MASCON 2025 Event Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold">{card.count}</p>
              <p className="text-gray-500">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/sessions/new"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Add Session
          </Link>
          <Link
            href="/admin/speakers/new"
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            + Add Speaker
          </Link>
          <Link
            href="/admin/announcements/new"
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            + Add Announcement
          </Link>
          <Link
            href="/admin/polls/new"
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            + Create Poll
          </Link>
        </div>
      </div>
    </div>
  )
}
