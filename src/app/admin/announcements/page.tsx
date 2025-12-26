import prisma from "@/lib/db"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Plus, Pencil, Trash2, Pin } from "lucide-react"
import { Button } from "@/components/ui/button"

async function getAnnouncements() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  })
  return announcements
}

export default async function AnnouncementsAdmin() {
  const announcements = await getAnnouncements()
  type AnnouncementType = typeof announcements[number]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-gray-500">{announcements.length} announcements</p>
        </div>
        <Link href="/admin/announcements/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Announcement
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Title</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Created</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {announcements.map((announcement: AnnouncementType) => (
              <tr key={announcement.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    {announcement.isPinned && (
                      <Pin className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-1" />
                    )}
                    <div>
                      <div className="font-medium">{announcement.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-1 max-w-md">
                        {announcement.content}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {announcement.isPinned ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">
                      Pinned
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      Regular
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatDistanceToNow(announcement.createdAt, { addSuffix: true })}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/announcements/${announcement.id}`}>
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
