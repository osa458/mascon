import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import ProfileForm from "./ProfileForm"

async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      title: true,
      company: true,
      bio: true,
      linkedin: true,
      twitter: true,
      website: true,
      shareEmail: true,
      sharePhone: true,
    },
  })
  return user
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }
  
  const user = await getUserProfile(session.user.id)
  
  if (!user) {
    redirect("/auth/login")
  }

  return <ProfileForm user={user} />
}
