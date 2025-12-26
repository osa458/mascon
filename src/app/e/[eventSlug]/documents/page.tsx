import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { FileText, Download, ExternalLink } from "lucide-react"

interface DocumentsPageProps {
  params: Promise<{ eventSlug: string }>
}

async function getDocumentsData(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      documents: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  return event
}

export default async function DocumentsPage({ params }: DocumentsPageProps) {
  const { eventSlug } = await params
  const event = await getDocumentsData(eventSlug)
  
  if (!event) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header eventSlug={eventSlug} title="Documents" />
      
      <div className="flex-1 p-4 space-y-3">
        {event.documents.length > 0 ? (
          event.documents.map((doc: typeof event.documents[number]) => (
            <a
              key={doc.id}
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="w-10 h-10 bg-sky-100 rounded flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-sky-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{doc.title}</h3>
                {doc.description && (
                  <p className="text-sm text-gray-500 truncate">{doc.description}</p>
                )}
                {doc.category && (
                  <span className="text-xs text-gray-400">{doc.category}</span>
                )}
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </a>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No documents available yet
          </div>
        )}
      </div>
    </div>
  )
}
