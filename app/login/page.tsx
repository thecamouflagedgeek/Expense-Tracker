"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupSuccessMessage, setSignupSuccessMessage] = useState<string | null>(null)

  const { login, loginWithGoogle, signup } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSignupSuccessMessage(null)
    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      // Set a more descriptive error message
      setError(err.message || "Failed to log in. Please check your email and password and try again.")
      console.error("Login error details:", err)
      // Log the specific error information for debugging
      if (err.code) {
        console.error(`Firebase error code: ${err.code}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError(null)
    setSignupSuccessMessage(null)
    try {
      await loginWithGoogle()
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to log in with Google. Please try again.")
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSignupSuccessMessage(null)
    try {
      const result = await signup(email, password, name)
      if (result.error) {
        setError(result.error)
      } else {
        setSignupSuccessMessage(result.message ?? null)
        setEmail("")
        setPassword("")
        setName("")
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign up. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen grid-bg-pattern px-4 py-8 font-sans text-black antialiased">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
        <Card className="w-full max-w-md md:max-w-lg mx-auto bg-white border border-black/5 rounded-[2.5rem] shadow-2xl p-6 md:p-8 relative overflow-hidden">
          <CardHeader className="text-center p-0 mb-5 md:mb-6">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.3 }}>
              <Image
                src="/expense_tracker_logo.png"
                alt="CtrlFund Logo"
                width={80}
                height={80}
                className="mx-auto mb-4 object-contain"
                priority
              />
            </motion.div>
            <CardTitle className="text-2xl md:text-3xl font-black text-black tracking-tight">Welcome to CtrlFund</CardTitle>
            <CardDescription className="text-xs text-black/60 font-semibold mt-1">
              Manage your team's expenses and notes efficiently.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/[0.03] border border-black/5 rounded-2xl p-1 mb-6">
                <TabsTrigger
                  value="login"
                  className="rounded-xl text-xs font-semibold py-2.5 transition-all text-black/60 data-[state=active]:bg-black data-[state=active]:text-[#ccff00] data-[state=active]:shadow-sm"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-xl text-xs font-semibold py-2.5 transition-all text-black/60 data-[state=active]:bg-black data-[state=active]:text-[#ccff00] data-[state=active]:shadow-sm"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email" className="text-black/75 font-semibold text-xs">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10 placeholder:text-black/30 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password" className="text-black/75 font-semibold text-xs">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1.5 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10 placeholder:text-black/30"
                      required
                    />
                  </div>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700 rounded-[1.5rem] p-4 shadow-sm">
                        <AlertTitle className="font-bold text-red-800">Authentication Error</AlertTitle>
                        <AlertDescription className="text-xs mt-1">
                          <div className="font-semibold text-red-700/90 mb-2">{error}</div>
                          <div className="mt-2 text-xs border-t border-red-200/50 pt-2 text-red-700/80">
                            <p className="font-bold">Troubleshooting:</p>
                            <ul className="list-disc pl-4 mt-1 space-y-1 font-medium">
                              <li>Check email address spelling</li>
                              <li>Verify password (case-sensitive)</li>
                              <li>Make sure account is active</li>
                            </ul>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                  <Button type="submit" className="w-full button-gradient h-11 text-xs font-semibold rounded-xl" disabled={loading || googleLoading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#ccff00]" /> Logging In...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-black/5" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-black/40 font-semibold text-[10px] tracking-wider">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-white text-black border border-black/10 hover:bg-black/[0.03] transition-colors rounded-xl h-11 text-xs font-semibold shadow-sm"
                    onClick={handleGoogleLogin}
                    disabled={loading || googleLoading}
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" /> Signing in with Google...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4 text-black" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Sign in with Google
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name" className="text-black/75 font-semibold text-xs">
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10 placeholder:text-black/30 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email" className="text-black/75 font-semibold text-xs">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10 placeholder:text-black/30 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="text-black/75 font-semibold text-xs">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1.5 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10 placeholder:text-black/30"
                      required
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200 text-red-700 rounded-2xl p-4">
                      <AlertTitle className="font-bold">Error</AlertTitle>
                      <AlertDescription className="text-xs mt-0.5">{error}</AlertDescription>
                    </Alert>
                  )}
                  {signupSuccessMessage && (
                    <Alert className="mb-4 bg-green-50 border-green-200 text-green-700 rounded-2xl p-4">
                      <AlertTitle className="font-bold">Success!</AlertTitle>
                      <AlertDescription className="text-xs mt-0.5">{signupSuccessMessage}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full button-gradient h-11 text-xs font-semibold rounded-xl" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#ccff00]" /> Signing Up...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
