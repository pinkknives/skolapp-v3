import React from 'react'
import { cn } from '@/lib/utils'

// Re-export all Lucide icons for easy access
export * from 'lucide-react'

// Icon wrapper component with consistent styling
interface IconProps {
  name: string
  size?: number | string
  className?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral'
  variant?: 'default' | 'outline' | 'filled'
}

const colorClasses = {
  primary: 'text-primary-600 dark:text-primary-400',
  secondary: 'text-neutral-600 dark:text-neutral-400',
  success: 'text-success-600 dark:text-success-400',
  warning: 'text-warning-600 dark:text-warning-400',
  error: 'text-error-600 dark:text-error-400',
  neutral: 'text-neutral-500 dark:text-neutral-400',
}

const variantClasses = {
  default: '',
  outline: 'stroke-2',
  filled: 'fill-current',
}

export function Icon({ 
  name: _name, 
  size = 20, 
  className, 
  color = 'neutral',
  variant = 'default'
}: IconProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center',
        colorClasses[color],
        variantClasses[variant],
        'w-[var(--icon-size)] h-[var(--icon-size)]',
        className
      )}
      // eslint-disable-next-line no-restricted-syntax
      style={{ '--icon-size': `${size}px` } as React.CSSProperties}
    >
      {/* This would be dynamically rendered based on the name prop */}
      {/* For now, we'll use a placeholder */}
      <div className="w-full h-full bg-current rounded opacity-20" />
    </div>
  )
}

// Predefined icon sets for common use cases
export const EducationIcons = {
  GraduationCap: 'GraduationCap',
  BookOpen: 'BookOpen',
  PenTool: 'PenTool',
  Calculator: 'Calculator',
  Microscope: 'Microscope',
  Globe: 'Globe',
  Palette: 'Palette',
  Music: 'Music',
} as const

export const AssessmentIcons = {
  ClipboardCheck: 'ClipboardCheck',
  Target: 'Target',
  Award: 'Award',
  Star: 'Star',
  ThumbsUp: 'ThumbsUp',
  ThumbsDown: 'ThumbsDown',
  CheckCircle: 'CheckCircle',
  XCircle: 'XCircle',
} as const

export const NavigationIcons = {
  Home: 'Home',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ChevronLeft: 'ChevronLeft',
  ChevronRight: 'ChevronRight',
  ChevronUp: 'ChevronUp',
  ChevronDown: 'ChevronDown',
} as const

export const ActionIcons = {
  Edit: 'Edit',
  Save: 'Save',
  Download: 'Download',
  Upload: 'Upload',
  Copy: 'Copy',
  Share: 'Share2',
  Plus: 'Plus',
  Minus: 'Minus',
  Trash: 'Trash2',
  Refresh: 'RefreshCw',
} as const

export const StatusIcons = {
  Check: 'Check',
  X: 'X',
  Alert: 'AlertCircle',
  AlertTriangle: 'AlertTriangle',
  Info: 'Info',
  Help: 'HelpCircle',
  Bell: 'Bell',
  Message: 'MessageCircle',
} as const

export const MediaIcons = {
  File: 'File',
  FileText: 'FileText',
  Image: 'Image',
  Video: 'Video',
  Folder: 'Folder',
  QrCode: 'QrCode',
} as const

// Usage examples and documentation
export const IconUsage = {
  // Education
  'GraduationCap': 'Lärare, utbildning, akademisk grad',
  'BookOpen': 'Quiz, kurser, lärande',
  'PenTool': 'Skrivning, redigering, kreativitet',
  'Calculator': 'Matematik, beräkningar',
  'Microscope': 'Naturvetenskap, forskning',
  'Globe': 'Geografi, internationellt',
  'Palette': 'Konst, design, kreativitet',
  'Music': 'Musik, ljud, rytm',
  
  // Assessment
  'ClipboardCheck': 'Bedömning, checklista, godkännande',
  'Target': 'Mål, precision, fokus',
  'Award': 'Pris, utmärkelse, framgång',
  'Star': 'Betyg, kvalitet, favorit',
  'ThumbsUp': 'Godkännande, positiv feedback',
  'ThumbsDown': 'Avslag, negativ feedback',
  
  // Navigation
  'Home': 'Hem, startsida',
  'ArrowLeft': 'Tillbaka, föregående',
  'ArrowRight': 'Framåt, nästa',
  'ChevronLeft': 'Kollapsa, dölj',
  'ChevronRight': 'Expandera, visa',
  
  // Actions
  'Edit': 'Redigera, ändra',
  'Save': 'Spara, lagra',
  'Download': 'Ladda ner, exportera',
  'Copy': 'Kopiera, duplicera',
  'Share': 'Dela, publicera',
  'Plus': 'Lägg till, skapa ny',
  'Minus': 'Ta bort, minska',
  'Trash': 'Radera, ta bort',
  
  // Status
  'Check': 'Klar, godkänd',
  'X': 'Avbryt, stäng',
  'Alert': 'Varning, uppmärksamhet',
  'Info': 'Information, tips',
  'Bell': 'Notifiering, påminnelse',
  'Message': 'Kommunikation, chat',
} as const
