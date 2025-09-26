'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Typography, Heading } from '@/components/ui/Typography'
import { Input } from '@/components/ui/Input'
import { Layout, Container, Section } from '@/components/layout/Layout'
import { 
  Chrome, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles,
  Shield,
  Zap
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/teacher/dashboard'
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signIn('google', { 
        callbackUrl,
        redirect: false 
      })
      
      if (result?.error) {
        toast.error('Inloggning misslyckades. Försök igen.')
      } else if (result?.ok) {
        toast.success('Välkommen tillbaka!')
        router.push(callbackUrl)
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error('Ett fel uppstod vid inloggning.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signIn('azure-ad', { callbackUrl, redirect: false })
      if (result?.error) {
        toast.error('Inloggning misslyckades. Försök igen.')
      } else if (result?.ok) {
        toast.success('Välkommen tillbaka!')
        router.push(callbackUrl)
      }
    } catch (error) {
      console.error('Microsoft sign in error:', error)
      toast.error('Ett fel uppstod vid inloggning.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        callbackUrl,
        redirect: false
      })
      
      if (result?.error) {
        toast.error('Fel e-post eller lösenord.')
      } else if (result?.ok) {
        toast.success('Välkommen tillbaka!')
        router.push(callbackUrl)
      }
    } catch (error) {
      console.error('Email sign in error:', error)
      toast.error('Ett fel uppstod vid inloggning.')
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <Layout>
      <Section className="min-h-svh centered-flex bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
        <Container size="sm">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full max-w-md md:max-w-lg lg:max-w-xl"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary-600" />
              </div>
              <Heading level={1} className="text-3xl font-bold text-foreground mb-2">
                Välkommen tillbaka!
              </Heading>
              <Typography variant="body1" className="text-muted-foreground">
                Logga in för att fortsätta med dina quiz
              </Typography>
            </motion.div>

            {/* Sign In Card */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-xl border-0">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Logga in på ditt konto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Google Sign In */}
                  <Button
                    fullWidth
                    size="lg"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="flex items-center gap-3 h-12 text-base font-medium border-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <Chrome className="w-5 h-5" />
                    Fortsätt med Google
                  </Button>

                  <Button
                    fullWidth
                    size="lg"
                    variant="outline"
                    onClick={handleMicrosoftSignIn}
                    disabled={isLoading}
                    className="flex items-center gap-3 h-12 text-base font-medium border-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    {/* Fallback icon */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="8" height="8" fill="currentColor"/><rect x="13" y="3" width="8" height="8" fill="currentColor"/><rect x="3" y="13" width="8" height="8" fill="currentColor"/><rect x="13" y="13" width="8" height="8" fill="currentColor"/></svg>
                    Fortsätt med Microsoft
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                        eller
                      </span>
                    </div>
                  </div>

                  {/* Email Sign In Form */}
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        E-postadress
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="din@email.se"
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                        Lösenord
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Ditt lösenord"
                          className="pl-10 pr-10 h-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      disabled={isLoading}
                      className="h-12 text-base font-medium"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          Logga in
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Forgot Password */}
                  <div className="text-center">
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                    >
                      Glömt ditt lösenord?
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sign Up Link */}
            <motion.div variants={itemVariants} className="text-center mt-6">
              <Typography variant="body2" className="text-muted-foreground">
                Har du inget konto än?{' '}
                <Link 
                  href="/auth/signup" 
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold"
                >
                  Skapa ett konto
                </Link>
              </Typography>
            </motion.div>

            {/* Features */}
            <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-success-500" />
                <span>Säker inloggning med Google</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-primary-500" />
                <span>Snabb och enkel registrering</span>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </Layout>
  )
}
