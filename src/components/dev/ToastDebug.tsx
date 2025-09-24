'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'

export function ToastDebug() {
  const [visible, setVisible] = useState(false)
  const [override, setOverride] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search)
      if (p.get('toast') === '1') setVisible(true)
      setOverride(localStorage.getItem('sk_toast_position') || '')
    }
  }, [])

  const setPos = (v: string) => {
    setOverride(v)
    if (v) localStorage.setItem('sk_toast_position', v)
    else localStorage.removeItem('sk_toast_position')
    // notify live listeners
    window.dispatchEvent(new StorageEvent('storage', { key: 'sk_toast_position', newValue: v }))
  }

  if (process.env.NODE_ENV === 'production') return null

  if (!visible) {
    return (
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="fixed bottom-4 left-4 z-[1000] rounded-md bg-neutral-900/70 text-white text-xs px-2 py-1 shadow"
      >
        Toast debug
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-[1000] rounded-lg bg-white/90 dark:bg-neutral-900/90 border border-neutral-300 dark:border-neutral-700 p-3 shadow w-[280px]">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">Toast Preview</span>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-neutral-500 hover:text-neutral-700 text-xs"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2 mb-3">
        <Button size="sm" onClick={() => toast.success('Allt klart!')}>Success</Button>
        <Button size="sm" variant="outline" onClick={() => toast.info('Info‑meddelande')}>Info</Button>
        <Button size="sm" variant="destructive" onClick={() => toast.error('Något gick fel')}>Error</Button>
      </div>
      <div className="text-xs text-neutral-600 dark:text-neutral-300 mb-1">Position override</div>
      <div className="grid grid-cols-3 gap-1 text-xs">
        <button className={`px-2 py-1 rounded border ${override===''?'bg-primary-50 border-primary-200':'border-neutral-300 dark:border-neutral-700'}`} onClick={()=>setPos('')}>Auto</button>
        <button className={`px-2 py-1 rounded border ${override==='mobile'?'bg-primary-50 border-primary-200':'border-neutral-300 dark:border-neutral-700'}`} onClick={()=>setPos('mobile')}>Mobile</button>
        <button className={`px-2 py-1 rounded border ${override==='tablet'?'bg-primary-50 border-primary-200':'border-neutral-300 dark:border-neutral-700'}`} onClick={()=>setPos('tablet')}>Tablet</button>
        <button className={`px-2 py-1 rounded border ${override==='desktop'?'bg-primary-50 border-primary-200':'border-neutral-300 dark:border-neutral-700'}`} onClick={()=>setPos('desktop')}>Desktop</button>
        <button className={`px-2 py-1 rounded border ${override==='top-center'?'bg-primary-50 border-primary-200':'border-neutral-300 dark:border-neutral-700'}`} onClick={()=>setPos('top-center')}>Top‑center</button>
        <button className={`px-2 py-1 rounded border ${override==='bottom-center'?'bg-primary-50 border-primary-200':'border-neutral-300 dark:border-neutral-700'}`} onClick={()=>setPos('bottom-center')}>Bottom‑center</button>
      </div>
    </div>
  )
}
