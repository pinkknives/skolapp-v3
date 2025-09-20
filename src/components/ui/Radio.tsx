import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const radioVariants = cva(
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

const radioInputVariants = cva(
  'peer sr-only'
)

const radioIndicatorVariants = cva(
  'flex items-center justify-center border border-solid rounded-full transition-all duration-200 flex-shrink-0',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
      variant: {
        default: 'border-neutral-300 bg-white peer-checked:border-primary-500 peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2',
        error: 'border-error-500 bg-white peer-checked:border-error-500 peer-focus:ring-2 peer-focus:ring-error-500 peer-focus:ring-offset-2',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

const radioDotVariants = cva(
  'rounded-full transition-all duration-200',
  {
    variants: {
      size: {
        sm: 'h-2 w-2',
        md: 'h-2.5 w-2.5',
        lg: 'h-3 w-3',
      },
      variant: {
        default: 'bg-primary-500',
        error: 'bg-error-500',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

const radioLabelVariants = cva(
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

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof radioVariants> {
  label?: string
  variant?: 'default' | 'error'
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ 
    className,
    size,
    variant = 'default',
    label,
    id,
    ...props 
  }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <label 
        htmlFor={radioId}
        className={cn(radioVariants({ size }), className)}
      >
        <input
          type="radio"
          id={radioId}
          ref={ref}
          className={cn(radioInputVariants())}
          {...props}
        />
        
        <div className={cn(radioIndicatorVariants({ size, variant }))}>
          <div 
            className={cn(
              radioDotVariants({ size, variant }),
              'opacity-0 scale-0 peer-checked:opacity-100 peer-checked:scale-100'
            )}
          />
        </div>
        
        {label && (
          <span className={cn(radioLabelVariants({ size }))}>
            {label}
          </span>
        )}
      </label>
    )
  }
)

Radio.displayName = 'Radio'

export { Radio, radioVariants }