import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const switchVariants = cva(
  'relative flex items-center cursor-pointer',
  {
    variants: {
      size: {
        sm: 'gap-x-2',
        md: 'gap-x-2',
        lg: 'gap-x-3',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const switchInputVariants = cva(
  'peer sr-only'
)

const switchTrackVariants = cva(
  'relative rounded-full border-2 border-transparent transition-all duration-200 cursor-pointer flex-shrink-0',
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-12',
      },
      variant: {
        default: 'bg-neutral-300 peer-checked:bg-primary-500 peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2',
        error: 'bg-neutral-300 peer-checked:bg-error-500 peer-focus:ring-2 peer-focus:ring-error-500 peer-focus:ring-offset-2',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

const switchThumbVariants = cva(
  'absolute top-0.5 left-0.5 bg-white rounded-full shadow-sm transition-transform duration-200 pointer-events-none',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 switch-thumb-sm',
        md: 'h-5 w-5 switch-thumb-md',
        lg: 'h-6 w-6 switch-thumb-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

const switchLabelVariants = cva(
  'text-neutral-700 select-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof switchVariants> {
  label?: string
  variant?: 'default' | 'error'
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ 
    className,
    size,
    variant = 'default',
    label,
    id,
    ...props 
  }, ref) => {
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <label 
        htmlFor={switchId}
        className={cn(switchVariants({ size }), className)}
      >
        <input
          type="checkbox"
          role="switch"
          id={switchId}
          ref={ref}
          className={cn(switchInputVariants())}
          {...props}
        />
        
        <div className={cn(switchTrackVariants({ size, variant }))}>
          <div className={cn(switchThumbVariants({ size }))} />
        </div>
        
        {label && (
          <span className={cn(switchLabelVariants({ size }))}>
            {label}
          </span>
        )}
      </label>
    )
  }
)

Switch.displayName = 'Switch'

export { Switch, switchVariants }