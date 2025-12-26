import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    // Redirect logged-in users to their events
    redirect("/events");
  }

  // For non-logged-in users, redirect to login
  redirect("/auth/login");
}
