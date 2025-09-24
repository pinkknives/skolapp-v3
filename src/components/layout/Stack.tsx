import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type GapScale = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Align = 'start' | 'center' | 'end' | 'stretch'
type Justify = 'start' | 'center' | 'end' | 'between'

const gapClasses: Record<GapScale, string> = {
  none: 'gap-0',
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

const alignClasses: Record<Align, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

const justifyClasses: Record<Justify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
}

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: GapScale
  align?: Align
  justify?: Justify
  fullWidth?: boolean
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ gap = 'md', align = 'start', justify = 'start', fullWidth = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col',
          gapClasses[gap],
          alignClasses[align],
          justifyClasses[justify],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Stack.displayName = 'Stack'
