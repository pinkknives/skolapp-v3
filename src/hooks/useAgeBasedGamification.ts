'use client'

import { useCallback } from 'react'
import confetti from 'canvas-confetti'

export type AgeGroup = 'young' | 'middle' | 'old' | 'adult'

export interface AgeBasedSettings {
  ageGroup: AgeGroup
  useConfetti: boolean
  useEmojis: boolean
  useAnimations: boolean
  useSoundEffects: boolean
  communicationStyle: 'playful' | 'neutral' | 'professional'
  celebrationIntensity: 'high' | 'medium' | 'low'
  visualStyle: 'colorful' | 'modern' | 'minimal'
}

export interface GamificationEffects {
  showConfetti: (type?: 'success' | 'celebration' | 'victory') => void
  showEmoji: (emoji: string) => void
  playSound: (type: 'success' | 'error' | 'notification') => void
  getCelebrationMessage: (type: 'correct' | 'incorrect' | 'victory' | 'encouragement') => string
  getButtonStyle: (variant: 'primary' | 'secondary' | 'success' | 'error') => string
  getIconSize: () => 'sm' | 'md' | 'lg'
}

const ageGroupSettings: Record<AgeGroup, AgeBasedSettings> = {
  young: {
    ageGroup: 'young',
    useConfetti: true,
    useEmojis: true,
    useAnimations: true,
    useSoundEffects: true,
    communicationStyle: 'playful',
    celebrationIntensity: 'high',
    visualStyle: 'colorful'
  },
  middle: {
    ageGroup: 'middle',
    useConfetti: true,
    useEmojis: true,
    useAnimations: true,
    useSoundEffects: false,
    communicationStyle: 'neutral',
    celebrationIntensity: 'medium',
    visualStyle: 'modern'
  },
  old: {
    ageGroup: 'old',
    useConfetti: false,
    useEmojis: false,
    useAnimations: true,
    useSoundEffects: false,
    communicationStyle: 'neutral',
    celebrationIntensity: 'low',
    visualStyle: 'modern'
  },
  adult: {
    ageGroup: 'adult',
    useConfetti: false,
    useEmojis: false,
    useAnimations: false,
    useSoundEffects: false,
    communicationStyle: 'professional',
    celebrationIntensity: 'low',
    visualStyle: 'minimal'
  }
}

const celebrationMessages = {
  young: {
    correct: ['Fantastiskt! 🎉', 'Du är så duktig! ⭐', 'Wow! Det var rätt! 🌟', 'Så bra! 🎊'],
    incorrect: ['Nästan rätt! Försök igen! 💪', 'Du kan det här! 🤗', 'Inte denna gång, men nästa! 🌈'],
    victory: ['Du vann! 🏆', 'Grattis! Du är bäst! 🎉', 'Fantastiskt jobb! ⭐'],
    encouragement: ['Du gör så bra! 🌟', 'Fortsätt så! 💪', 'Du är fantastisk! 🎊']
  },
  middle: {
    correct: ['Bra jobbat!', 'Korrekt!', 'Utmärkt!', 'Perfekt!'],
    incorrect: ['Inte helt rätt, men försök igen!', 'Nästan där!', 'Bra försök!'],
    victory: ['Grattis! Du vann!', 'Utmärkt resultat!', 'Bra jobbat!'],
    encouragement: ['Du gör bra framsteg!', 'Fortsätt så!', 'Bra jobbat!']
  },
  old: {
    correct: ['Korrekt', 'Rätt svar', 'Bra', 'Utmärkt'],
    incorrect: ['Fel svar', 'Inte korrekt', 'Försök igen'],
    victory: ['Du vann', 'Grattis', 'Bra resultat'],
    encouragement: ['Bra jobbat', 'Fortsätt så', 'Utmärkt']
  },
  adult: {
    correct: ['Korrekt', 'Rätt svar', 'Utmärkt', 'Perfekt'],
    incorrect: ['Fel svar', 'Inte korrekt', 'Försök igen'],
    victory: ['Du vann', 'Grattis', 'Bra resultat'],
    encouragement: ['Bra jobbat', 'Fortsätt så', 'Utmärkt']
  }
}

export function useAgeBasedGamification(ageGroup: AgeGroup = 'middle'): GamificationEffects {
  const settings = ageGroupSettings[ageGroup]

  const showConfetti = useCallback((type: 'success' | 'celebration' | 'victory' = 'success') => {
    if (!settings.useConfetti) return

    const configs = {
      success: {
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      },
      celebration: {
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      },
      victory: {
        particleCount: 200,
        spread: 80,
        origin: { y: 0.6 }
      }
    }

    const config = configs[type]
    
    // Multiple bursts for more celebration
    if (type === 'victory') {
      confetti(config)
      setTimeout(() => confetti({ ...config, origin: { x: 0.2, y: 0.6 } }), 200)
      setTimeout(() => confetti({ ...config, origin: { x: 0.8, y: 0.6 } }), 400)
    } else {
      confetti(config)
    }
  }, [settings.useConfetti])

  const showEmoji = useCallback((emoji: string) => {
    if (!settings.useEmojis) return
    
    // Create a temporary emoji element
    const emojiElement = document.createElement('div')
    emojiElement.textContent = emoji
    emojiElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3rem;
      z-index: 9999;
      pointer-events: none;
      animation: bounce 1s ease-out forwards;
    `
    
    // Add bounce animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes bounce {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(emojiElement)
    
    setTimeout(() => {
      document.body.removeChild(emojiElement)
      document.head.removeChild(style)
    }, 1000)
  }, [settings.useEmojis])

  const playSound = useCallback((type: 'success' | 'error' | 'notification') => {
    if (!settings.useSoundEffects) return
    
    // Simple sound effects using Web Audio API
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    const frequencies = {
      success: [523.25, 659.25, 783.99], // C-E-G
      error: [220, 196], // A-G
      notification: [440, 554.37] // A-C#
    }
    
    const freq = frequencies[type]
    const duration = 0.3
    
    oscillator.frequency.setValueAtTime(freq[0], audioContext.currentTime)
    if (freq.length > 1) {
      oscillator.frequency.setValueAtTime(freq[1], audioContext.currentTime + duration * 0.5)
    }
    if (freq.length > 2) {
      oscillator.frequency.setValueAtTime(freq[2], audioContext.currentTime + duration * 0.7)
    }
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  }, [settings.useSoundEffects])

  const getCelebrationMessage = useCallback((type: 'correct' | 'incorrect' | 'victory' | 'encouragement') => {
    const messages = celebrationMessages[ageGroup][type]
    return messages[Math.floor(Math.random() * messages.length)]
  }, [ageGroup])

  const getButtonStyle = useCallback((variant: 'primary' | 'secondary' | 'success' | 'error') => {
    const baseStyles = {
      primary: 'bg-primary-500 hover:bg-primary-600 text-white',
      secondary: 'bg-neutral-200 hover:bg-neutral-300 text-neutral-900',
      success: 'bg-green-500 hover:bg-green-600 text-white',
      error: 'bg-red-500 hover:bg-red-600 text-white'
    }

    const ageStyles = {
      young: {
        primary: 'rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300',
        secondary: 'rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300',
        success: 'rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300',
        error: 'rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300'
      },
      middle: {
        primary: 'rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200',
        secondary: 'rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200',
        success: 'rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200',
        error: 'rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200'
      },
      old: {
        primary: 'rounded-md shadow-sm hover:shadow-md transition-all duration-200',
        secondary: 'rounded-md shadow-sm hover:shadow-md transition-all duration-200',
        success: 'rounded-md shadow-sm hover:shadow-md transition-all duration-200',
        error: 'rounded-md shadow-sm hover:shadow-md transition-all duration-200'
      },
      adult: {
        primary: 'rounded-sm shadow-sm transition-all duration-150',
        secondary: 'rounded-sm shadow-sm transition-all duration-150',
        success: 'rounded-sm shadow-sm transition-all duration-150',
        error: 'rounded-sm shadow-sm transition-all duration-150'
      }
    }

    return `${baseStyles[variant]} ${ageStyles[ageGroup][variant]}`
  }, [ageGroup])

  const getIconSize = useCallback(() => {
    const sizes = {
      young: 'lg' as const,
      middle: 'md' as const,
      old: 'md' as const,
      adult: 'sm' as const
    }
    return sizes[ageGroup]
  }, [ageGroup])

  return {
    showConfetti,
    showEmoji,
    playSound,
    getCelebrationMessage,
    getButtonStyle,
    getIconSize
  }
}

// Helper function to determine age group from grade level
export function getAgeGroupFromGrade(grade: number): AgeGroup {
  if (grade <= 3) return 'young'
  if (grade <= 6) return 'middle'
  if (grade <= 9) return 'old'
  return 'adult'
}

// Helper function to determine age group from age
export function getAgeGroupFromAge(age: number): AgeGroup {
  if (age <= 8) return 'young'
  if (age <= 12) return 'middle'
  if (age <= 16) return 'old'
  return 'adult'
}
