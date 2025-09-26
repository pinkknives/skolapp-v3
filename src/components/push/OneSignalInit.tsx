'use client'

import { useEffect } from 'react'

type OneSignalQueue = Array<() => void>
type OneSignalAPI = { push?: (fn: () => void) => void; init?: (opts: { appId: string }) => void }

declare global {
  interface Window { OneSignal?: OneSignalQueue | OneSignalAPI }
}

export function OneSignalInit() {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
    if (!appId) return
    if (typeof window === 'undefined') return
    if (window.OneSignal) {
      // Already present, try init directly if API is ready
      if (!Array.isArray(window.OneSignal)) {
        window.OneSignal.init?.({ appId })
      }
      return
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js'
    script.async = true
    document.head.appendChild(script)
    // Queue init until SDK replaces the queue with the API
    window.OneSignal = [] as OneSignalQueue
    const q = window.OneSignal as OneSignalQueue
    q.push(function () {
      const api = window.OneSignal as OneSignalAPI
      api.init?.({ appId })
    })
  }, [])
  return null
}


