"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { format, isToday, isYesterday } from "date-fns"

interface Message {
    id: string
    content: string
    senderId: string
    senderName: string
    senderImage?: string | null
    createdAt: string
    isRead: boolean
}

interface OtherUser {
    id: string
    name: string | null
    image: string | null
    company?: string | null
}

interface MessageThreadClientProps {
    threadId: string
    currentUserId: string
    otherUser: OtherUser
    initialMessages: Message[]
}

function formatMessageDate(dateStr: string) {
    const date = new Date(dateStr)
    if (isToday(date)) {
        return format(date, "h:mm a")
    } else if (isYesterday(date)) {
        return `Yesterday ${format(date, "h:mm a")}`
    } else {
        return format(date, "MMM d, h:mm a")
    }
}

export default function MessageThreadClient({
    threadId,
    currentUserId,
    otherUser,
    initialMessages,
}: MessageThreadClientProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || isSending) return

        const content = newMessage.trim()
        setNewMessage("")
        setIsSending(true)

        // Optimistic update
        const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            content,
            senderId: currentUserId,
            senderName: "You",
            createdAt: new Date().toISOString(),
            isRead: false,
        }
        setMessages(prev => [...prev, tempMessage])

        try {
            const response = await fetch(`/api/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ threadId, content }),
            })

            if (!response.ok) throw new Error("Failed to send message")

            const data = await response.json()
            setMessages(prev =>
                prev.map(m => m.id === tempMessage.id ? { ...data, senderName: "You" } : m)
            )
        } catch (error) {
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
            setNewMessage(content) // Restore the message
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="flex flex-col flex-1 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4 bg-gray-50">
                {messages.length > 0 ? (
                    messages.map((message) => {
                        const isOwn = message.senderId === currentUserId
                        return (
                            <div
                                key={message.id}
                                className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
                            >
                                {!isOwn && (
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarImage src={otherUser.image || undefined} />
                                        <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                            {otherUser.name?.charAt(0) || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                )}

                                <div
                                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${isOwn
                                            ? "bg-sky-500 text-white rounded-br-md"
                                            : "bg-white border border-gray-200 rounded-bl-md"
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    <p
                                        className={`text-[10px] mt-1 ${isOwn ? "text-sky-100" : "text-gray-400"
                                            }`}
                                    >
                                        {formatMessageDate(message.createdAt)}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <p>No messages yet</p>
                        <p className="text-sm mt-1">Start the conversation!</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSend}
                className="flex items-center gap-2 p-4 bg-white border-t"
            >
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                <Button
                    type="submit"
                    size="icon"
                    className="bg-sky-500 hover:bg-sky-600 rounded-full"
                    disabled={!newMessage.trim() || isSending}
                >
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    )
}
