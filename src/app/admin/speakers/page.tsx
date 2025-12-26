import prisma from "@/lib/db"
import Link from "next/link"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

async function getSpeakers() {
  const speakers = await prisma.speaker.findMany({
    orderBy: { name: 'asc' },
    include: {
      sessions: {
        include: {
          session: true,
        },
      },
    },
  })
  return speakers
}

export default async function SpeakersAdmin() {
  const speakers = await getSpeakers()
  type SpeakerType = typeof speakers[number]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Speakers</h1>
          <p className="text-gray-500">{speakers.length} speakers</p>
        </div>
        <Link href="/admin/speakers/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Speaker
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Speaker</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Title</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Sessions</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {speakers.map((speaker: SpeakerType) => (
              <tr key={speaker.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {speaker.imageUrl ? (
                      <img 
                        src={speaker.imageUrl} 
                        alt={speaker.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {speaker.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{speaker.name}</div>
                      {speaker.company && (
                        <div className="text-xs text-gray-500">{speaker.company}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {speaker.title || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm">
                    {speaker.sessions.length} session{speaker.sessions.length !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/speakers/${speaker.id}`}>
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
  )
}
