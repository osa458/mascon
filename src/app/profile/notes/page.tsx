import { ArrowLeft, StickyNote, Plus, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { formatDistanceToNow } from "date-fns"

async function getNotes(userId: string) {
  const notes = await prisma.note.findMany({
    where: { userId },
    include: {
      session: {
        select: {
          id: true,
          title: true,
          startTime: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
  
  return notes
}

export default async function NotesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }
  
  const notes = await getNotes(session.user.id)
  type NoteType = typeof notes[number]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Link href="/profile" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">My Notes</h1>
          <button className="p-2 -mr-2">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4">
        {notes.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </p>
            
            {notes.map((note: NoteType) => (
              <div 
                key={note.id} 
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                {note.session && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{note.session.title}</span>
                  </div>
                )}
                
                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                
                <p className="text-xs text-gray-400 mt-3">
                  Updated {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <StickyNote className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No notes yet</p>
            <p className="text-sm mt-2">
              Take notes during sessions to remember key insights
            </p>
            <Button className="mt-4 bg-sky-500 hover:bg-sky-600">
              <Plus className="w-4 h-4 mr-2" /> Create Note
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
