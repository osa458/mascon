import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { MessageCircleQuestion, ThumbsUp, Check, User } from "lucide-react"

interface SessionQAPageProps {
  params: Promise<{ eventSlug: string }>
}

async function getQAData(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
  })
  
  if (!event) return null

  // Get questions grouped by session
  const sessions = await prisma.eventSession.findMany({
    where: { 
      eventId: event.id,
      qaQuestions: { some: {} },
    },
    include: {
      qaQuestions: {
        orderBy: [{ votesCount: 'desc' }, { createdAt: 'desc' }],
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      },
    },
    orderBy: { startTime: 'asc' },
  })

  return { event, sessions }
}

export default async function SessionQAPage({ params }: SessionQAPageProps) {
  const { eventSlug } = await params
  const data = await getQAData(eventSlug)
  
  if (!data) {
    notFound()
  }
  
  type SessionType = typeof data.sessions[number]
  type QuestionType = SessionType['qaQuestions'][number]

  return (
    <div className="flex flex-col min-h-screen">
      <Header eventSlug={eventSlug} title="Session Q&A" />
      
      <div className="flex-1 p-4 space-y-6">
        {data.sessions.length > 0 ? (
          data.sessions.map((session: SessionType) => (
            <div key={session.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
                <h3 className="font-semibold text-emerald-800">{session.title}</h3>
                <p className="text-sm text-emerald-600">
                  {session.qaQuestions.length} question{session.qaQuestions.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="divide-y divide-gray-100">
                {session.qaQuestions.map((question: QuestionType) => (
                  <div key={question.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <button className="p-1.5 text-gray-400 hover:text-emerald-500 transition-colors">
                          <ThumbsUp className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-gray-600">
                          {question.votesCount}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-gray-700">{question.content}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          {question.isAnonymous ? (
                            <span className="text-xs text-gray-400">Anonymous</span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {question.user.image ? (
                                <img 
                                  src={question.user.image} 
                                  alt="" 
                                  className="w-4 h-4 rounded-full"
                                />
                              ) : (
                                <User className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-xs text-gray-500">
                                {question.user.name || 'Attendee'}
                              </span>
                            </div>
                          )}
                          
                          {question.isAnswered && (
                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" />
                              Answered
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <MessageCircleQuestion className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No questions yet</p>
            <p className="text-sm mt-2">
              Ask questions during sessions and vote on questions from other attendees.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
