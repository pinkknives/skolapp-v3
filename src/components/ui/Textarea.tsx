import React, { forwardRef, useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn, generateId } from '@/lib/utils'

const textareaVariants = cva(
  'field-base min-h-[80px] resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: '',
        error: 'field-error focus-visible:ring-error-500',
        success: 'border-success-500 focus:border-success-600 focus-visible:ring-success-500',
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
          <label
            htmlFor={textareaId}
            className="label-base"
          >
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
          <p
            id={helperTextId}
            className="help-text"
          >
            {helperText}
          </p>
        )}
        {hasError && (
          <p
            id={errorId}
            className="error-text"
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