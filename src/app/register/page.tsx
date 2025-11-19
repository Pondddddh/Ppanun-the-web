import { AuthForm } from "@/components/auth-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background via-background to-muted">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-balance mb-2">P'panun</h1>
          <p className="text-muted-foreground">Join the ultimate gaming experience</p>
        </div>
        <AuthForm mode="register" />
      </div>
    </div>
  )
}
