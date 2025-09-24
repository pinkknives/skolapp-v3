'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  User,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  CheckCircle
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'teacher' as 'teacher' | 'student'
  })

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      const result = await signIn('google', { 
        callbackUrl: '/teacher/dashboard',
        redirect: false 
      })
      
      if (result?.error) {
        toast.error('Registrering misslyckades. Försök igen.')
      } else if (result?.ok) {
        toast.success('Välkommen till Skolapp!')
        router.push('/teacher/dashboard')
      }
    } catch (error) {
      console.error('Google sign up error:', error)
      toast.error('Ett fel uppstod vid registrering.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Lösenorden matchar inte.')
      return
    }
    
    if (formData.password.length < 6) {
      toast.error('Lösenordet måste vara minst 6 tecken.')
      return
    }
    
    setIsLoading(true)
    
    try {
      // In a real app, you would call your API to create the user
      // For now, we'll simulate a successful registration
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Konto skapat! Du kan nu logga in.')
      router.push('/auth/signin')
    } catch (error) {
      console.error('Email sign up error:', error)
      toast.error('Ett fel uppstod vid registrering.')
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

  const features = [
    'AI-genererade quiz på sekunder',
    'Live-sessioner med elever',
    'Automatisk analys och insikter',
    'Säker och GDPR-kompatibel'
  ]

  return (
    <Layout>
      <Section className="min-h-svh centered-flex bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 py-12">
        <Container size="lg">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left Side - Features */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div>
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-primary-600" />
                </div>
                <Heading level={1} className="text-4xl font-bold text-foreground mb-4">
                  Välkommen till <span className="text-brand-gradient">Skolapp</span>!
                </Heading>
                <Typography variant="body1" className="text-lg text-muted-foreground mb-8">
                  Den enklaste plattformen för att skapa engagerande quiz och förbättra elevernas lärande.
                </Typography>
              </div>

              <div className="space-y-4">
                {features.map((feature, _index) => (
                  <motion.div
                    key={feature}
                    variants={itemVariants}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
                    <Typography variant="body1" className="text-foreground">
                      {feature}
                    </Typography>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-success-500" />
                  <span>Säker inloggning</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary-500" />
                  <span>Snabb registrering</span>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Sign Up Form */}
            <motion.div variants={itemVariants} className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto lg:mx-0">
              <Card className="shadow-xl border-0">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Skapa ditt konto
                  </CardTitle>
                  <Typography variant="body2" className="text-muted-foreground">
                    Välj hur du vill registrera dig
                  </Typography>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Google Sign Up */}
                  <Button
                    fullWidth
                    size="lg"
                    variant="outline"
                    onClick={handleGoogleSignUp}
                    disabled={isLoading}
                    className="flex items-center gap-3 h-12 text-base font-medium border-2 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  >
                    <Chrome className="w-5 h-5" />
                    Fortsätt med Google
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

                  {/* Email Sign Up Form */}
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Fullständigt namn
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ditt fullständiga namn"
                          className="pl-10 h-12"
                          required
                        />
                      </div>
                    </div>

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
                          placeholder="Minst 6 tecken"
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

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                        Bekräfta lösenord
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Bekräfta ditt lösenord"
                          className="pl-10 pr-10 h-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                          Skapa konto
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Terms */}
                  <div className="text-center">
                    <Typography variant="caption" className="text-muted-foreground">
                      Genom att skapa ett konto godkänner du våra{' '}
                      <Link href="/terms" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                        användarvillkor
                      </Link>{' '}
                      och{' '}
                      <Link href="/privacy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                        integritetspolicy
                      </Link>
                    </Typography>
                  </div>
                </CardContent>
              </Card>

              {/* Sign In Link */}
              <div className="text-center mt-6">
                <Typography variant="body2" className="text-muted-foreground">
                  Har du redan ett konto?{' '}
                  <Link 
                    href="/auth/signin" 
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold"
                  >
                    Logga in
                  </Link>
                </Typography>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>
    </Layout>
  )
}
