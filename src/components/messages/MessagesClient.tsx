"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Send, Image, ArrowLeft, MoreVertical } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MessageThread {
  id: string
  otherUser: {
    id: string
    name: string
    image?: string | null
  }
  lastMessage?: {
    content: string
    createdAt: string
    isFromMe: boolean
  }
  unreadCount: number
  isSystem?: boolean
  systemType?: string
}

interface Message {
  id: string
  content: string
  imageUrl?: string | null
  createdAt: string
  isFromMe: boolean
}

interface MessagesClientProps {
  eventSlug: string
  threads: MessageThread[]
  currentUserId: string
}

export default function MessagesClient({ eventSlug, threads }: MessagesClientProps) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)

  const selectedThread = threads.find(t => t.id === selectedThreadId)

  return (
    <div className="flex flex-col h-full">
      {/* Thread List */}
      <div className="flex-1 overflow-auto">
        {threads.length > 0 ? (
          <div className="divide-y">
            {threads
              .sort((a, b) => {
                const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0
                const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0
                return bTime - aTime
              })
              .map(thread => (
                <Link
                  key={thread.id}
                  href={`/e/${eventSlug}/messages/${thread.id}`}
                  className={cn(
                    "flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors",
                    thread.unreadCount > 0 && "bg-sky-50"
                  )}
                >
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={thread.otherUser.image || undefined} />
                    <AvatarFallback className={cn(
                      thread.isSystem ? "bg-gray-200" : "bg-sky-100 text-sky-600"
                    )}>
                      {thread.isSystem ? "📢" : thread.otherUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "font-medium truncate",
                        thread.unreadCount > 0 && "font-semibold"
                      )}>
                        {thread.isSystem ? "System Message" : thread.otherUser.name}
                      </span>
                      {thread.lastMessage && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {format(new Date(thread.lastMessage.createdAt), "MMM d")}
                        </span>
                      )}
                    </div>
                    
                    {thread.lastMessage && (
                      <p className={cn(
                        "text-sm truncate",
                        thread.unreadCount > 0 ? "text-gray-700" : "text-gray-500"
                      )}>
                        {thread.lastMessage.isFromMe && "You: "}
                        {thread.lastMessage.content}
                      </p>
                    )}
                  </div>
                  
                  {thread.unreadCount > 0 && (
                    <Badge className="bg-sky-500 text-white flex-shrink-0">
                      {thread.unreadCount}
                    </Badge>
                  )}
                </Link>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <p className="text-center mb-4">No messages yet</p>
            <Button variant="outline" asChild>
              <Link href={`/e/${eventSlug}/attendees`}>
                Find Attendees to Message
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
