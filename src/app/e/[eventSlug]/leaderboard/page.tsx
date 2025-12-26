import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Trophy, Medal, Award } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface LeaderboardPageProps {
  params: Promise<{ eventSlug: string }>
}

async function getLeaderboardData(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
  })
  
  if (!event) return null

  // Get top users by gamification points
  const leaderboard = await prisma.gamificationPoint.groupBy({
    by: ['userId'],
    where: { eventId: event.id },
    _sum: { points: true },
    orderBy: { _sum: { points: 'desc' } },
    take: 50,
  })

  const userIds = leaderboard.map((l: { userId: string }) => l.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true, company: true },
  })

  type UserType = { id: string; name: string | null; image: string | null; company: string | null }
  
  const userMap = new Map<string, UserType>(users.map((u: UserType) => [u.id, u]))

  type LeaderboardEntry = {
    rank: number
    userId: string
    points: number
    user: UserType | undefined
  }

  const leaderboardEntries: LeaderboardEntry[] = leaderboard.map((entry: { userId: string; _sum: { points: number | null } }, index: number): LeaderboardEntry => ({
    rank: index + 1,
    userId: entry.userId,
    points: entry._sum.points || 0,
    user: userMap.get(entry.userId),
  }))

  return {
    event,
    leaderboard: leaderboardEntries,
  }
}

export default async function LeaderboardPage({ params }: LeaderboardPageProps) {
  const { eventSlug } = await params
  const data = await getLeaderboardData(eventSlug)
  
  if (!data) {
    notFound()
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Award className="w-6 h-6 text-orange-400" />
    return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</span>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header eventSlug={eventSlug} title="Leaderboard" />
      
      <div className="flex-1 p-4">
        {data.leaderboard.length > 0 ? (
          <div className="space-y-2">
            {data.leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  entry.rank <= 3 ? 'bg-gradient-to-r from-sky-50 to-white border border-sky-100' : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex-shrink-0">
                  {getRankIcon(entry.rank)}
                </div>
                
                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.user?.image || undefined} />
                  <AvatarFallback className="bg-sky-100 text-sky-600">
                    {entry.user?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {entry.user?.name || "Anonymous"}
                  </p>
                  {entry.user?.company && (
                    <p className="text-sm text-gray-500 truncate">{entry.user.company}</p>
                  )}
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <span className="font-bold text-sky-600">{entry.points}</span>
                  <span className="text-xs text-gray-500 ml-1">pts</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No leaderboard data yet</p>
            <p className="text-sm mt-2">Earn points by participating in sessions and activities!</p>
          </div>
        )}
      </div>
    </div>
  )
}
