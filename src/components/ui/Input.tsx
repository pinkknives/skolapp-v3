import React, { forwardRef, useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, generateId } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

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