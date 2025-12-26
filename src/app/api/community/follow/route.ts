import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// Toggle follow on a thread
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { threadId } = body

        if (!threadId) {
            return NextResponse.json(
                { error: "Thread ID is required" },
                { status: 400 }
            )
        }

        // Check if follow exists
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_threadId: {
                    followerId: session.user.id,
                    threadId,
                },
            },
        })

        if (existingFollow) {
            // Unfollow
            await prisma.follow.delete({
                where: { id: existingFollow.id },
            })
            return NextResponse.json({ success: true, following: false })
        } else {
            // Follow
            await prisma.follow.create({
                data: {
                    followerId: session.user.id,
                    threadId,
                },
            })
            return NextResponse.json({ success: true, following: true })
        }
    } catch (error) {
        console.error("Error toggling follow:", error)
        return NextResponse.json({ error: "Failed to toggle follow" }, { status: 500 })
    }
}
