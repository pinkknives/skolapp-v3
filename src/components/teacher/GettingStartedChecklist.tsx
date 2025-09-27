'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Typography } from '@/components/ui/Typography'
import { CheckCircle, Circle, Sparkles } from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/Button'
import { track } from '@/lib/telemetry'

export function GettingStartedChecklist() {
  const [hasQuiz, setHasQuiz] = useState(false)
  const [hasClass, setHasClass] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [showTips, setShowTips] = useState(false)

  useEffect(() => {
    try {
      const q = localStorage.getItem('sk_last_quiz_created_at')
      const c = localStorage.getItem('sk_last_class_created_at')
      if (q) setHasQuiz(true)
      if (c) setHasClass(true)
    } catch {}

    // Fetch server counts as truth source
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/teacher/getting-started', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json() as { quizCount?: number; classCount?: number; hasSession?: boolean }
        if (typeof data.quizCount === 'number') setHasQuiz(data.quizCount > 0)
        if (typeof data.classCount === 'number') setHasClass(data.classCount > 0)
        if (typeof data.hasSession === 'boolean') setHasSession(data.hasSession)
      } catch {
        // ignore network errors
      }
    }
    fetchCounts()
  }, [])

  const completed = useMemo(() => [hasQuiz, hasClass, hasSession].filter(Boolean).length, [hasQuiz, hasClass, hasSession])
  const total = 3
  const percent = Math.round((completed / total) * 100)

  useEffect(() => {
    try {
      const alreadyCelebrated = localStorage.getItem('sk_getting_started_celebrated') === '1'
      if (!alreadyCelebrated && completed === total) {
        toast.success('Grymt! Du är igång 🎉', {
          description: 'Du har slutfört alla steg. Testa att köra ett live‑quiz med din klass!',
          duration: 6000,
        })
        try {
          const w = typeof window !== 'undefined' ? window.innerWidth : 1200
          const isMobile = w < 640
          if (isMobile) {
            confetti({
              particleCount: 50,
              spread: 55,
              origin: { y: 0.2 },
              scalar: 0.6,
              ticks: 120,
            })
          } else {
            // Dual bursts from left and right for desktop
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { x: 0.1, y: 0.2 },
              scalar: 0.9,
              ticks: 200,
            })
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { x: 0.9, y: 0.2 },
              scalar: 0.9,
              ticks: 200,
            })
          }
        } catch {}
        localStorage.setItem('sk_getting_started_celebrated', '1')
      }
    } catch {}
  }, [completed])

  const Item = ({ done, children, hint }: { done: boolean; children: React.ReactNode; hint?: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-2">
        {done ? (
          <CheckCircle size={18} className="text-success-600 mt-0.5" />
        ) : (
          <Circle size={18} className="text-neutral-400 mt-0.5" />
        )}
        <div className="text-neutral-700">
          {children}
        </div>
      </div>
      {!done && showTips && hint && (
        <Typography variant="caption" className="text-neutral-500 pl-6">
          {hint}
        </Typography>
      )}
    </div>
  )

  const segments = 20
  const filled = Math.round((percent / 100) * segments)

  return (
    <Card className="border-neutral-200">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={18} /> Kom igång – checklista
            </CardTitle>
            <CardDescription>Tre snabba steg för att komma igång på under 5 minuter.</CardDescription>
          </div>
          <Button
            variant={showTips ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => {
              const next = !showTips
              setShowTips(next)
              try { track('onboarding_tips_toggle', { enabled: next }) } catch {}
              if (next) {
                toast.info('Tips aktiverade', { description: 'Vi visar korta tips under varje steg.' })
              }
            }}
            aria-pressed={showTips}
            title={showTips ? 'Dölj tips' : 'Visa korta tips under varje steg'}
          >
            {showTips ? 'Dölj tips' : 'Visa tips'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <Typography variant="caption" className="text-neutral-600">Förlopp</Typography>
            <Typography variant="caption" className="text-neutral-600">{completed}/{total} klart</Typography>
          </div>
          <div className="w-full flex gap-0.5" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
            {Array.from({ length: segments }).map((_, idx) => (
              <div
                key={idx}
                className={
                  'h-2 flex-1 rounded-sm ' + (idx < filled ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-800')
                }
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Item done={hasQuiz} hint={<>
            Tips: Klicka på <Link href="/teacher/quiz/create" className="underline">Skapa nytt quiz</Link>.
          </>}>
            <Link href="/teacher/quiz/create" className="text-primary-600 hover:underline font-medium">
              Skapa ditt första quiz
            </Link>
          </Item>
          <Item done={hasClass} hint={<>
            Tips: Gå till <Link href="/teacher/classes" className="underline">Mina klasser</Link> och välj Skapa klass.
          </>}>
            <Link href="/teacher/classes" className="text-primary-600 hover:underline font-medium">
              Lägg till din första klass eller elevlista
            </Link>
          </Item>
          <Item done={hasSession} hint={<>
            Tips: Öppna <Link href="/live/join" className="underline">Live</Link> och dela koden med elever.
          </>}>
            <Link href="/live/join" className="text-primary-600 hover:underline font-medium">
              Starta en live‑session och låt elever gå med med PIN
            </Link>
          </Item>
        </div>
        <Typography variant="caption" className="text-neutral-500 mt-4 block">
          Tips: Detta avklaras automatiskt när du slutför stegen.
        </Typography>
      </CardContent>
    </Card>
  )
}
