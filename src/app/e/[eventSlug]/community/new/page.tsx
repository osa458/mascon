"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useParams } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"

export default function NewTopicPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const eventSlug = params.eventSlug as string
    const categoryId = searchParams.get("category")

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !content.trim()) return

        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch(`/api/community/topics`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    categoryId,
                    eventSlug,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to create topic")
            }

            const data = await response.json()
            router.push(`/e/${eventSlug}/community/${data.threadId}`)
        } catch (err) {
            setError("Failed to create topic. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header eventSlug={eventSlug} title="New Topic" />

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Topic Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter a title for your topic..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        required
                    />
                </div>

                <div className="flex-1">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What would you like to discuss?"
                        className="w-full h-48 px-4 py-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        required
                    />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1 bg-sky-500 hover:bg-sky-600"
                        disabled={isSubmitting || !title.trim() || !content.trim()}
                    >
                        {isSubmitting ? "Posting..." : "Post Topic"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
