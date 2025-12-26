import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { BarChart3, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PollsPageProps {
  params: Promise<{ eventSlug: string }>
}

async function getPollsData(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      polls: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        include: {
          options: {
            orderBy: { id: 'asc' },
          },
        },
      },
    },
  })
  return event
}

export default async function PollsPage({ params }: PollsPageProps) {
  const { eventSlug } = await params
  const event = await getPollsData(eventSlug)
  
  if (!event) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header eventSlug={eventSlug} title="Polls" />
      
      <div className="flex-1 p-4 space-y-4">
        {event.polls.length > 0 ? (
          event.polls.map((poll: typeof event.polls[number]) => {
            const totalVotes = poll.options.reduce((sum: number, opt: { votesCount: number }) => sum + opt.votesCount, 0)
            
            return (
              <div
                key={poll.id}
                className="p-4 bg-white border border-gray-200 rounded-lg"
              >
                <h3 className="font-semibold mb-4">{poll.question}</h3>
                
                <div className="space-y-2">
                  {poll.options.map((option: typeof poll.options[number]) => {
                    const percentage = totalVotes > 0 
                      ? Math.round((option.votesCount / totalVotes) * 100) 
                      : 0
                    
                    return (
                      <button
                        key={option.id}
                        className="w-full relative p-3 rounded-lg border border-gray-200 hover:border-sky-300 transition-colors text-left"
                      >
                        {/* Progress bar */}
                        <div 
                          className="absolute inset-0 bg-sky-50 rounded-lg"
                          style={{ width: `${percentage}%` }}
                        />
                        
                        <div className="relative flex items-center justify-between">
                          <span>{option.text}</span>
                          <span className="text-sm text-gray-500">
                            {percentage}% ({option.votesCount})
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                <p className="text-xs text-gray-500 mt-3">
                  {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                </p>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No active polls</p>
            <p className="text-sm mt-2">Check back later for new polls!</p>
          </div>
        )}
      </div>
    </div>
  )
}
