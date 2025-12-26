import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { title, content, categoryId, eventSlug } = body

        if (!title || !content || !categoryId) {
            return NextResponse.json(
                { error: "Title, content, and category are required" },
                { status: 400 }
            )
        }

        // Verify the category exists
        const category = await prisma.topicCategory.findUnique({
            where: { id: categoryId },
            include: { event: true },
        })

        if (!category) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            )
        }

        // Create the thread and first post in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create the thread
            const thread = await tx.topicThread.create({
                data: {
                    categoryId,
                    title,
                    postsCount: 1,
                    lastPostAt: new Date(),
                },
            })

            // Create the first post
            await tx.topicPost.create({
                data: {
                    threadId: thread.id,
                    userId: session.user.id,
                    content,
                },
            })

            return thread
        })

        return NextResponse.json({
            success: true,
            threadId: result.id,
        })
    } catch (error) {
        console.error("Error creating topic:", error)
        return NextResponse.json(
            { error: "Failed to create topic" },
            { status: 500 }
        )
    }
}
