import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-sky-50 to-white">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-sky-500" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            A sign-in link has been sent to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the link in the email to sign in to your account. 
            The link will expire in 24 hours.
          </p>
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <Link href="/auth/login" className="text-sky-500 hover:underline">
              try again
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
