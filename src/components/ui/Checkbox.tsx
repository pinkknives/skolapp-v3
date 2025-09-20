import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const checkboxVariants = cva(
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

const checkboxInputVariants = cva(
  'peer sr-only'
)

const checkboxIndicatorVariants = cva(
  'flex items-center justify-center border border-solid rounded transition-all duration-200 flex-shrink-0 pointer-events-none',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
      variant: {
        default: 'border-neutral-300 bg-white peer-checked:bg-primary-500 peer-checked:border-primary-500 peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2',
        error: 'border-error-500 bg-white peer-checked:bg-error-500 peer-checked:border-error-500 peer-focus:ring-2 peer-focus:ring-error-500 peer-focus:ring-offset-2',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

const checkboxLabelVariants = cva(
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

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  label?: string
  variant?: 'default' | 'error'
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className,
    size,
    variant = 'default',
    label,
    id,
    ...props 
  }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <label 
        htmlFor={checkboxId}
        className={cn(checkboxVariants({ size }), className)}
      >
        <input
          type="checkbox"
          id={checkboxId}
          ref={ref}
          className={cn(checkboxInputVariants())}
          {...props}
        />
        
        <div className={cn(checkboxIndicatorVariants({ size, variant }))}>
          <Check 
            className={cn(
              'text-white transition-opacity duration-200 peer-checked:opacity-100 opacity-0',
              size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'
            )}
          />
        </div>
        
        {label && (
          <span className={cn(checkboxLabelVariants({ size }))}>
            {label}
          </span>
        )}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox, checkboxVariants }