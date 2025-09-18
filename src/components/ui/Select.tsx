'use client'

import React, { forwardRef, useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { generateId } from '@/lib/utils'

const selectVariants = cva(
  'flex w-full rounded-md border bg-white px-3 py-2 text-sm transition-all duration-200 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 focus-visible:ring-primary-500',
        error: 'border-error-300 focus-visible:ring-error-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  label?: string
  helperText?: string
  errorMessage?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className,
    variant,
    label,
    helperText,
    errorMessage,
    options,
    placeholder,
    id,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const [selectId] = useState(() => id || generateId('select'))
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
            htmlFor={selectId}
            className="mb-1 block text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}
        <select
          className={cn(selectVariants({ variant: actualVariant }), className)}
          ref={ref}
          id={selectId}
          aria-describedby={describedBy || undefined}
          aria-invalid={hasError}
          {...props}
        >
          {placeholder && (
            <option value="" disabled={props.required}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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

Select.displayName = 'Select'

export { Select, selectVariants }