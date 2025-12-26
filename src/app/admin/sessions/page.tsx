import prisma from "@/lib/db"
import Link from "next/link"
import { format } from "date-fns"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

async function getSessions() {
  const sessions = await prisma.eventSession.findMany({
    orderBy: { startTime: 'asc' },
    include: {
      speakers: {
        include: {
          speaker: true,
        },
      },
      room: true,
    },
  })
  return sessions
}

export default async function SessionsAdmin() {
  const sessions = await getSessions()

  type SessionType = typeof sessions[number]
  type SpeakerType = SessionType['speakers'][number]

  // Group by date
  const sessionsByDate: Record<string, typeof sessions> = {}
  for (const session of sessions) {
    const dateKey = format(session.startTime, "yyyy-MM-dd")
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = []
    }
    sessionsByDate[dateKey].push(session)
  }

  const sortedDates = Object.keys(sessionsByDate).sort()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sessions</h1>
          <p className="text-gray-500">{sessions.length} sessions in total</p>
        </div>
        <Link href="/admin/sessions/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Session
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        {sortedDates.map((date) => (
          <div key={date}>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">
              {format(new Date(date), "EEEE, MMMM d, yyyy")}
            </h2>
            
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Time</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Title</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Speaker</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Type</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sessionsByDate[date].map((session: SessionType) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium">{format(session.startTime, "h:mm a")}</div>
                        <div className="text-gray-500 text-xs">{format(session.endTime, "h:mm a")}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{session.title}</div>
                        {session.room && (
                          <div className="text-xs text-gray-500">{session.room.name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {session.speakers.length > 0 
                          ? session.speakers.map((s: SpeakerType) => s.speaker.name).join(", ")
                          : <span className="text-gray-400">—</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          {session.sessionType || "General"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/sessions/${session.id}`}>
                            <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                          </Link>
                          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
