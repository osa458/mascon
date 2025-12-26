"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get("callbackUrl") || "/events"

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      await signIn("email", { email, callbackUrl })
    } catch (error) {
      console.error("Login error:", error)
      setError("Failed to send login link")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError("")
    try {
      const result = await signIn("credentials", { 
        email: "demo@example.com", 
        redirect: false,
      })
      
      if (result?.error) {
        setError("Login failed. Please try again.")
        console.error("Demo login error:", result.error)
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      console.error("Demo login error:", error)
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-sky-50 to-white">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-sky-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">M</span>
          </div>
          <CardTitle className="text-2xl">Welcome to MASCON</CardTitle>
          <CardDescription>
            Sign in to access your event experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-sky-500 hover:bg-sky-600"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Continue with Email"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Demo Login"}
          </Button>

          {/* Fallback link for demo login if JS doesn't work */}
          <a 
            href="/api/auth/demo-login"
            className="block text-center text-sm text-sky-600 hover:underline"
          >
            Click here if Demo Login doesn&apos;t work
          </a>

          <p className="text-center text-sm text-muted-foreground">
            We&apos;ll send you a magic link to sign in instantly.
            No password required.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}