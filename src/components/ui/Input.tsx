import React, { forwardRef, useId, useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

const inputVariants = cva(
  'flex w-full rounded-md border bg-white px-3 py-3 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 dark:focus-visible:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 dark:text-neutral-100',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 hover:border-neutral-400 focus:border-primary-500 dark:border-neutral-700 dark:hover:border-neutral-600',
        error: 'border-error-500 focus:border-error-600 focus-visible:ring-error-500 dark:border-error-600',
        success: 'border-success-500 focus:border-success-600 focus-visible:ring-success-500 dark:border-success-600',
      },
      size: {
        sm: 'h-10 px-3 text-xs',
        md: 'h-12 px-4 text-sm',
        lg: 'h-14 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  helperText?: string
  errorMessage?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className,
    variant,
    size,
    type = 'text',
    label,
    helperText,
    errorMessage,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    id,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const generatedId = useId()
    const inputId = id || generatedId
    const isPassword = type === 'password'
    const actualType = isPassword && showPassword ? 'text' : type
    const hasError = Boolean(errorMessage ?? ariaInvalid)
    const actualVariant = hasError ? 'error' : variant
    const helperTextId = helperText ? `${inputId}-helper` : undefined
    const errorId = hasError ? `${inputId}-error` : undefined

    const describedBy = [
      ariaDescribedBy,
      helperTextId,
      errorId,
    ].filter(Boolean).join(' ')

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    const EyeIcon = ({ open }: { open: boolean }) => {
      const IconComponent = open ? Eye : EyeOff
      return (
        <IconComponent
          size={16}
          strokeWidth={2}
          className="text-neutral-500"
          aria-hidden="true"
        />
      )
    }

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
              {leftIcon}
            </div>
          )}
          <input
            type={actualType}
            className={cn(
              inputVariants({ variant: actualVariant, size }),
              leftIcon && 'pl-10',
              (rightIcon || (isPassword && showPasswordToggle)) && 'pr-10',
              className
            )}
            ref={ref}
            id={inputId}
            aria-describedby={describedBy || undefined}
            aria-invalid={hasError ? true : ariaInvalid}
            {...props}
          />
          {(rightIcon || (isPassword && showPasswordToggle)) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isPassword && showPasswordToggle ? (
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-50 dark:focus:ring-offset-neutral-900 rounded-sm"
                  aria-label={showPassword ? 'Dölj lösenord' : 'Visa lösenord'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        {helperText && !hasError && (
          <p
            id={helperTextId}
            className="mt-1 text-xs text-neutral-600 dark:text-neutral-400"
          >
            {helperText}
          </p>
        )}
        {errorMessage && (
          <p
            id={errorId}
            className="mt-1 text-xs text-error-600"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, inputVariants }
