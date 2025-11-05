// src/app/signup/page.tsx
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const { user, loading: authLoading, signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Redirect to home if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password)

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Optionally redirect after a delay
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to right, #171717 0%, #171717 100%)' }}>
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  // Don't render anything if already authenticated (redirect will happen)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(to right, #171717 0%, #171717 100%)' }}>
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">
            Create an account
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-900/20 border-green-700 text-green-400">
                <AlertDescription>
                  Account created successfully! Check your email to verify your account.
                  Redirecting to login...
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || success}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || success}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-200">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading || success}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || success}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
            <p className="text-sm text-center text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
