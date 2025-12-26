import prisma from "@/lib/db"
import Link from "next/link"
import { Plus, Pencil, Trash2, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

async function getPolls() {
  const polls = await prisma.poll.findMany({
    include: {
      options: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return polls
}

export default async function PollsAdmin() {
  const polls = await getPolls()
  type PollType = typeof polls[number]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Polls</h1>
          <p className="text-gray-500">{polls.length} polls</p>
        </div>
        <Link href="/admin/polls/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Poll
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {polls.map((poll: PollType) => {
          type OptionType = typeof poll.options[number]
          const totalVotes = poll.options.reduce((sum: number, opt: OptionType) => sum + opt.voteCount, 0)
          
          return (
            <div key={poll.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{poll.question}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      poll.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {poll.isActive ? 'Active' : 'Closed'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {poll.options.length} options • {totalVotes} total votes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/polls/${poll.id}`}>
                    <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </Link>
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {poll.options.map((option: OptionType) => {
                  const percentage = totalVotes > 0 
                    ? Math.round((option.voteCount / totalVotes) * 100) 
                    : 0
                  
                  return (
                    <div key={option.id} className="relative">
                      <div 
                        className="absolute inset-0 bg-emerald-100 rounded-lg transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="relative flex items-center justify-between px-3 py-2">
                        <span className="text-sm font-medium">{option.text}</span>
                        <span className="text-sm text-gray-600">
                          {option.voteCount} ({percentage}%)
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
