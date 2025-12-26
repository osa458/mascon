"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { MessageSquare, Users, Pin, ChevronRight, Plus, Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TopicCategory {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  threadCount: number
  hasNew: boolean
}

interface TopicThread {
  id: string
  categoryId: string
  title: string
  isPinned: boolean
  postsCount: number
  lastPostAt: string | null
  lastPostUser?: {
    name: string
    image?: string | null
  }
  isFollowing?: boolean
  hasNew?: boolean
}

interface CommunityClientProps {
  eventSlug: string
  categories: TopicCategory[]
  threads: TopicThread[]
  followedThreadIds: string[]
}

export default function CommunityClient({
  eventSlug,
  categories,
  threads,
  followedThreadIds: initialFollowed,
}: CommunityClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [following, setFollowing] = useState<Set<string>>(new Set(initialFollowed))

  const handleFollow = (threadId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFollowing(prev => {
      const next = new Set(prev)
      if (next.has(threadId)) {
        next.delete(threadId)
      } else {
        next.add(threadId)
      }
      return next
    })
    // TODO: API call
  }

  const filteredThreads = selectedCategory
    ? threads.filter(t => t.categoryId === selectedCategory)
    : threads

  const currentCategory = categories.find(c => c.id === selectedCategory)

  return (
    <div className="flex flex-col h-full">
      {/* Category View or Thread List */}
      {!selectedCategory ? (
        // Categories List
        <div className="flex-1 overflow-auto">
          <div className="p-4 space-y-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{category.name}</span>
                    {category.hasNew && (
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-500 truncate">{category.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {category.threadCount} topic{category.threadCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        // Thread List
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Category Header */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 border-b">
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sky-500 text-sm"
            >
              ← Back
            </button>
            <span className="font-medium">{currentCategory?.name}</span>
          </div>

          {/* Threads */}
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {filteredThreads.length > 0 ? (
              filteredThreads
                .sort((a, b) => {
                  if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
                  return new Date(b.lastPostAt || 0).getTime() - new Date(a.lastPostAt || 0).getTime()
                })
                .map(thread => (
                  <Link
                    key={thread.id}
                    href={`/e/${eventSlug}/community/${thread.id}`}
                    className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {thread.isPinned && (
                            <Pin className="w-3 h-3 text-sky-500 flex-shrink-0" />
                          )}
                          <span className="font-medium line-clamp-2">{thread.title}</span>
                          {thread.hasNew && (
                            <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {thread.postsCount}
                          </span>
                          {thread.lastPostAt && (
                            <span>
                              {format(new Date(thread.lastPostAt), "MMM d")}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => handleFollow(thread.id, e)}
                        className={cn(
                          "p-2 rounded-full transition-colors",
                          following.has(thread.id)
                            ? "text-sky-500 bg-sky-50"
                            : "text-gray-400 hover:bg-gray-100"
                        )}
                      >
                        {following.has(thread.id) ? (
                          <Bell className="w-4 h-4" />
                        ) : (
                          <BellOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </Link>
                ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                No topics in this category yet
              </div>
            )}
          </div>

          {/* New Post Button */}
          <div className="p-4 border-t bg-white">
            <Button className="w-full bg-sky-500 hover:bg-sky-600" asChild>
              <Link href={`/e/${eventSlug}/community/new?category=${selectedCategory}`}>
                <Plus className="w-4 h-4 mr-2" /> New Topic
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
