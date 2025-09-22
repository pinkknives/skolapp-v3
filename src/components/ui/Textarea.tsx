import React, { forwardRef, useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, generateId } from '@/lib/utils'

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm transition-all duration-200 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 dark:focus-visible:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 resize-y dark:bg-neutral-900 dark:text-neutral-100',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 hover:border-neutral-400 focus:border-primary-500 dark:border-neutral-700 dark:hover:border-neutral-600',
        error: 'border-error-500 focus:border-error-600 focus-visible:ring-error-500 dark:border-error-600',
        success: 'border-success-500 focus:border-success-600 focus-visible:ring-success-500 dark:border-success-600',
      },
      size: {
        sm: 'min-h-[60px] px-2 text-xs',
        md: 'min-h-[80px] px-3 text-sm',
        lg: 'min-h-[100px] px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string
  helperText?: string
  errorMessage?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className,
    variant,
    size,
    label,
    helperText,
    errorMessage,
    id,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const [textareaId] = useState(() => id || generateId('textarea'))
    const [helperTextId] = useState(() => generateId('helper'))
    const [errorId] = useState(() => generateId('error'))

    const hasError = Boolean(errorMessage)
    const actualVariant = hasError ? 'error' : variant

    const describedBy = [
      ariaDescribedBy,
      helperText && helperTextId,
      hasError && errorId,
    ].filter(Boolean).join(' ')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            textareaVariants({ variant: actualVariant, size }),
            className
          )}
          ref={ref}
          id={textareaId}
          aria-describedby={describedBy || undefined}
          aria-invalid={hasError}
          {...props}
        />
        {helperText && !hasError && (
          <p id={helperTextId} className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
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

Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }