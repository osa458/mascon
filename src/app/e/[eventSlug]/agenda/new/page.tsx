"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"

export default function NewAgendaItemPage() {
    const router = useRouter()
    const params = useParams()
    const eventSlug = params.eventSlug as string

    const [title, setTitle] = useState("")
    const [location, setLocation] = useState("")
    const [startDate, setStartDate] = useState("")
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !startDate || !startTime || !endTime) return

        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch(`/api/agenda/custom`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    location: location.trim() || null,
                    startTime: `${startDate}T${startTime}`,
                    endTime: `${startDate}T${endTime}`,
                    eventSlug,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to create activity")
            }

            router.push(`/e/${eventSlug}/agenda`)
        } catch (err) {
            setError("Failed to create activity. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Default to today's date
    const today = format(new Date(), "yyyy-MM-dd")

    return (
        <div className="flex flex-col min-h-screen">
            <Header eventSlug={eventSlug} title="Add Activity" />

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Activity Title *
                    </label>
                    <Input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Coffee with John"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Location (optional)
                    </label>
                    <Input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Lobby, Room 101"
                    />
                </div>

                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                        Date *
                    </label>
                    <Input
                        id="date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={today}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time *
                        </label>
                        <Input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                            End Time *
                        </label>
                        <Input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="flex-1" />

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
                        disabled={isSubmitting || !title.trim() || !startDate || !startTime || !endTime}
                    >
                        {isSubmitting ? "Creating..." : "Add to My Agenda"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
