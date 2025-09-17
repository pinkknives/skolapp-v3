import React, { forwardRef, useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, generateId } from '@/lib/utils'

const inputVariants = cva(
  'flex w-full rounded-md border bg-white px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 hover:border-neutral-400 focus:border-primary-500',
        error: 'border-error-500 focus:border-error-600 focus-visible:ring-error-500',
        success: 'border-success-500 focus:border-success-600 focus-visible:ring-success-500',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
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
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [inputId] = useState(() => id || generateId('input'))
    const [helperTextId] = useState(() => generateId('helper'))
    const [errorId] = useState(() => generateId('error'))

    const isPassword = type === 'password'
    const actualType = isPassword && showPassword ? 'text' : type
    const hasError = Boolean(errorMessage)
    const actualVariant = hasError ? 'error' : variant

    const describedBy = [
      ariaDescribedBy,
      helperText && helperTextId,
      hasError && errorId,
    ].filter(Boolean).join(' ')

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    const EyeIcon = ({ open }: { open: boolean }) => (
      <svg
        className="h-4 w-4 text-neutral-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {open ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
          />
        )}
      </svg>
    )

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
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
            aria-invalid={hasError}
            {...props}
          />
          {(rightIcon || (isPassword && showPasswordToggle)) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isPassword && showPasswordToggle ? (
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-sm"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
            className="mt-1 text-xs text-neutral-600"
          >
            {helperText}
          </p>
        )}
        {hasError && (
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