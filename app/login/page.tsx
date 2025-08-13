"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Loader2, Shield, Users } from "lucide-react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [selectedRole, setSelectedRole] = useState<"admin" | "department-user">("department-user")
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
      const result = await signup(email, password, name, selectedRole)
      if (result.error) {
        setError(result.error)
      } else {
        setSignupSuccessMessage(result.message)
        setEmail("")
        setPassword("")
        setName("")
        setSelectedRole("department-user")
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign up. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen gradient-bg p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-md stats-card glow-accent">
          <CardHeader className="text-center">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.3 }}>
              <Image
                src="/ctrlfund-logo.png"
                alt="CtrlFund Logo"
                width={80}
                height={80}
                className="mx-auto mb-4"
                priority
              />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-[#00ADB5]">Welcome to CtrlFund</CardTitle>
            <CardDescription className="text-[#EEEEEE]/70">
              Manage your team's expenses and notes efficiently.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5]">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-[#00ADB5] data-[state=active]:text-[#222831]"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-[#00ADB5] data-[state=active]:text-[#222831]"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email" className="text-[#EEEEEE]">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5] focus:ring-[#00ADB5]"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password" className="text-[#EEEEEE]">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5] focus:ring-[#00ADB5]"
                      required
                    />
                  </div>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300 animate-pulse shadow-lg">
                        <AlertTitle className="font-bold text-red-200">Authentication Error</AlertTitle>
                        <AlertDescription>
                          <div className="font-medium mb-2">{error}</div>
                          <div className="mt-2 text-sm">
                            <p className="font-semibold">Troubleshooting:</p>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                              <li>Check if your email address is entered correctly</li>
                              <li>Verify your password (case-sensitive)</li>
                              <li>Make sure your account is active in the system</li>
                              <li>Try the default admin account if you're testing: admin@ctrlfund.com / admin123</li>
                            </ul>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                  <Button type="submit" className="w-full button-gradient" disabled={loading || googleLoading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging In...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#393E46]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#222831] px-2 text-[#EEEEEE]/60">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                    onClick={handleGoogleLogin}
                    disabled={loading || googleLoading}
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in with Google...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
              <TabsContent value="signup" className="mt-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name" className="text-[#EEEEEE]">
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5] focus:ring-[#00ADB5]"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email" className="text-[#EEEEEE]">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5] focus:ring-[#00ADB5]"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="text-[#EEEEEE]">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5] focus:ring-[#00ADB5]"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-role" className="text-[#EEEEEE]">
                      Account Type
                    </Label>
                    <Select
                      value={selectedRole}
                      onValueChange={(value: "admin" | "department-user") => setSelectedRole(value)}
                    >
                      <SelectTrigger className="mt-1 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5]">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#222831] text-[#EEEEEE] border-[#00ADB5]">
                        <SelectItem value="department-user" className="hover:bg-[#393E46] focus:bg-[#393E46]">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-[#00ADB5]" />
                            <div>
                              <div className="font-medium">Department User</div>
                              <div className="text-xs text-[#EEEEEE]/60">Standard access for department members</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin" className="hover:bg-[#393E46] focus:bg-[#393E46]">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-[#00ADB5]" />
                            <div>
                              <div className="font-medium">Admin</div>
                              <div className="text-xs text-[#EEEEEE]/60">Full administrative access</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="bg-red-900/20 border-red-700 text-red-400">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {signupSuccessMessage && (
                    <Alert className="bg-green-900/20 border-green-700 text-green-400">
                      <AlertTitle>Success!</AlertTitle>
                      <AlertDescription>{signupSuccessMessage}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full button-gradient" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing Up...
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
