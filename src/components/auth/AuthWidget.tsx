'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { Mail, LogOut, User as UserIcon } from 'lucide-react'

export function AuthWidget() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = supabaseBrowser()

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      
      if (event === 'SIGNED_IN') {
        setMessage('Inloggning lyckades!')
      } else if (event === 'SIGNED_OUT') {
        setMessage('Du har loggats ut.')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        }
      })

      if (error) {
        setMessage(`Fel: ${error.message}`)
      } else {
        setMessage('Kolla din e-post för inloggningslänk!')
        setEmail('')
      }
    } catch (error) {
      setMessage(`Ett oväntat fel uppstod: ${error instanceof Error ? error.message : 'Försök igen.'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
  }

  if (user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-2">
            <UserIcon className="w-6 h-6 text-primary-600" />
          </div>
          <CardTitle className="text-lg">Inloggad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Typography variant="body2" className="text-neutral-600">
              {user.email}
            </Typography>
          </div>
          
          {message && (
            <div className="p-3 bg-info-50 border border-info-200 rounded-lg">
              <Typography variant="body2" className="text-info-700">
                {message}
              </Typography>
            </div>
          )}

          <Button
            onClick={handleLogout}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {loading ? 'Loggar ut...' : 'Logga ut'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-2">
          <Mail className="w-6 h-6 text-primary-600" />
        </div>
        <CardTitle className="text-lg">Logga in</CardTitle>
        <Typography variant="body2" className="text-neutral-600">
          Ange din e-postadress för att få en inloggningslänk
        </Typography>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="din.email@exempel.se"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          {message && (
            <div className={`p-3 border rounded-lg ${
              message.includes('Fel') 
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-info-50 border-info-200 text-info-700'
            }`}>
              <Typography variant="body2">
                {message}
              </Typography>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full"
          >
            <Mail className="w-4 h-4 mr-2" />
            {loading ? 'Skickar...' : 'Skicka inloggningslänk'}
          </Button>
        </form>

        <div className="mt-4 pt-4 border-t border-neutral-200">
          <Typography variant="caption" className="text-neutral-500 text-center block">
            Vi skickar en säker länk till din e-post. Inga lösenord behövs.
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}